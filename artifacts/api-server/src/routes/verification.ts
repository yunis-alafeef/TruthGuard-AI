import { Router, type IRouter } from "express";
import { VerifyClaimBody } from "@workspace/api-zod";
import { logger } from "../lib/logger";
import { listVerifications, saveVerification } from "../lib/store";

type Evidence = {
  title: string;
  url: string;
  snippet: string;
  stance: "supports" | "contradicts" | "context";
  sourceType: string;
};

type MlSignal = {
  label: string;
  confidence: number;
  model: string;
};

const router: IRouter = Router();
const ML_SERVICE_URL = process.env.ML_SERVICE_URL ?? "http://127.0.0.1:8001";

function decodeHtml(value: string): string {
  return value
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

function extractEvidence(html: string): Evidence[] {
  const results: Evidence[] = [];
  const pattern =
    /<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<a[^>]+class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(html)) && results.length < 5) {
    const rawUrl = decodeURIComponent(match[1]).replace(/^\/l\/\?uddg=/, "");
    const title = decodeHtml(match[2]);
    const snippet = decodeHtml(match[3]);
    if (!rawUrl.startsWith("http")) continue;
    const normalized = `${title} ${snippet}`.toLowerCase();
    const contradicts = /(false|fake|hoax|debunk|incorrect|misleading|not true|myth)/.test(normalized);
    const supports = /(confirmed|evidence|study|official|according|research|true)/.test(normalized);
    results.push({
      title,
      url: rawUrl,
      snippet,
      stance: contradicts ? "contradicts" : supports ? "supports" : "context",
      sourceType: new URL(rawUrl).hostname.replace(/^www\./, ""),
    });
  }
  return results;
}

function extractRssEvidence(xml: string): Evidence[] {
  const results: Evidence[] = [];
  const items = xml.match(/<item>[\s\S]*?<\/item>/g) ?? [];
  for (const item of items.slice(0, 5)) {
    const titleMatch = item.match(/<title>([\s\S]*?)<\/title>/);
    const urlMatch = item.match(/<link>([\s\S]*?)<\/link>/);
    const descriptionMatch = item.match(/<description>([\s\S]*?)<\/description>/);
    if (!titleMatch || !urlMatch) continue;
    const title = decodeHtml(titleMatch[1]);
    const url = decodeHtml(urlMatch[1]);
    const snippet = decodeHtml(descriptionMatch?.[1] ?? "");
    if (!url.startsWith("http")) continue;
    const normalized = `${title} ${snippet}`.toLowerCase();
    const contradicts = /(false|fake|hoax|debunk|incorrect|misleading|not true|myth)/.test(normalized);
    const supports = /(confirmed|evidence|study|official|according|research|true|explained)/.test(normalized);
    results.push({
      title,
      url,
      snippet,
      stance: contradicts ? "contradicts" : supports ? "supports" : "context",
      sourceType: new URL(url).hostname.replace(/^www\./, ""),
    });
  }
  return results;
}

async function searchWeb(claim: string): Promise<{ evidence: Evidence[]; status: string }> {
  try {
    const searchTerms = claim
      .replace(/\b(the|a|an|is|was|were|that|this|and|or|of|to|in|on|for|by)\b/gi, " ")
      .replace(/[“”"'.!?]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const url = `https://www.bing.com/search?format=rss&q=${encodeURIComponent(searchTerms || claim)}`;
    const response = await fetch(url, {
      headers: { "user-agent": "TruthGuardAI/1.0 (+fact-checking prototype)" },
      signal: AbortSignal.timeout(7000),
    });
    if (!response.ok) return { evidence: [], status: "Search unavailable" };
    const responseText = await response.text();
    let evidence = extractRssEvidence(responseText);
    if (!evidence.length) {
      const duckDuckGoUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(searchTerms || claim)}`;
      const duckDuckGoResponse = await fetch(duckDuckGoUrl, {
        headers: { "user-agent": "TruthGuardAI/1.0 (+fact-checking prototype)" },
        signal: AbortSignal.timeout(5000),
      });
      if (duckDuckGoResponse.ok) evidence = extractEvidence(await duckDuckGoResponse.text());
    }
    return { evidence, status: evidence.length ? "Live web evidence" : "No indexed evidence found" };
  } catch (error) {
    logger.warn({ err: error }, "Web evidence search failed");
    return { evidence: [], status: "Search unavailable" };
  }
}

async function getMlSignal(text: string): Promise<MlSignal> {
  try {
    const response = await fetch(`${ML_SERVICE_URL}/predict`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text }),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`ML service returned ${response.status}`);
    return (await response.json()) as MlSignal;
  } catch (error) {
    logger.warn({ err: error }, "ML service unavailable");
    return { label: "unavailable", confidence: 0, model: "TF-IDF + Logistic Regression (offline)" };
  }
}

function extractClaim(text: string): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  return normalized.length > 260 ? `${normalized.slice(0, 257)}...` : normalized;
}

function mapMlLabel(label: string): "supports" | "contradicts" | "context" {
  if (["true", "mostly-true"].includes(label)) return "supports";
  if (["false", "pants-fire", "barely-true"].includes(label)) return "contradicts";
  return "context";
}

function buildVerdict(evidence: Evidence[], mlSignal: MlSignal): {
  verdict: "Supported" | "Likely True" | "Unverified" | "Misleading" | "False";
  confidence: number;
  explanation: string;
} {
  const support = evidence.filter((item) => item.stance === "supports").length;
  const contradiction = evidence.filter((item) => item.stance === "contradicts").length;
  const mlStance = mapMlLabel(mlSignal.label);
  if (support >= 2 && contradiction === 0) {
    return {
      verdict: "Supported",
      confidence: Math.min(0.96, 0.7 + support * 0.07),
      explanation: "Multiple indexed sources provide context that supports the main claim. Review the linked sources before treating it as final.",
    };
  }
  if (contradiction >= 2 && support === 0) {
    return {
      verdict: "False",
      confidence: Math.min(0.94, 0.69 + contradiction * 0.07),
      explanation: "The available sources contain repeated signals that conflict with the claim. The model signal points in the same direction, but sources remain the deciding evidence.",
    };
  }
  if (contradiction > support) {
    return {
      verdict: "Misleading",
      confidence: Math.min(0.88, 0.62 + (contradiction - support) * 0.08),
      explanation: "The claim appears to omit context or conflicts with more of the available evidence than it matches.",
    };
  }
  if (support > 0 || mlStance === "supports") {
    return {
      verdict: "Likely True",
      confidence: Math.min(0.86, 0.56 + support * 0.08 + mlSignal.confidence * 0.12),
      explanation: "Some evidence and/or the model signal lean toward the claim, but the available material is not strong enough for a fully supported label.",
    };
  }
  return {
    verdict: "Unverified",
    confidence: 0.42,
    explanation: "There is not enough reliable, relevant evidence in the current search results to make a confident judgment.",
  };
}

router.post("/verify", async (req, res) => {
  const parsed = VerifyClaimBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Enter a claim with at least 8 characters." });
    return;
  }
  const input = parsed.data;
  const extractedClaim = extractClaim(input.text);
  const [search, mlSignal] = await Promise.all([
    input.includeWebSearch === false
      ? Promise.resolve({ evidence: [] as Evidence[], status: "Web search skipped" })
      : searchWeb(extractedClaim),
    getMlSignal(extractedClaim),
  ]);
  const decision = buildVerdict(search.evidence, mlSignal);
  const createdAt = new Date().toISOString();
  const id = saveVerification({
    originalText: input.text,
    extractedClaim,
    verdict: decision.verdict,
    confidence: Number(decision.confidence.toFixed(2)),
    explanation: decision.explanation,
    evidence: search.evidence,
    mlSignal,
    searchStatus: search.status,
    createdAt,
  });
  res.json({
    id,
    originalText: input.text,
    extractedClaim,
    verdict: decision.verdict,
    confidence: Number(decision.confidence.toFixed(2)),
    explanation: decision.explanation,
    evidence: search.evidence,
    mlSignal,
    searchStatus: search.status,
    createdAt,
  });
});

router.get("/history", (_req, res) => {
  res.json(
    listVerifications().map((item) => ({
      id: item.id,
      originalText: item.originalText,
      verdict: item.verdict,
      confidence: item.confidence,
      createdAt: item.createdAt,
    })),
  );
});

router.get("/model/metrics", async (_req, res) => {
  try {
    const response = await fetch(`${ML_SERVICE_URL}/metrics`, {
      signal: AbortSignal.timeout(3000),
    });
    if (!response.ok) throw new Error(`ML service returned ${response.status}`);
    res.json(await response.json());
  } catch {
    res.json({
      dataset: "LIAR: A New Benchmark Dataset for Fake News Detection",
      samples: 0,
      accuracy: 0,
      precision: 0,
      recall: 0,
      f1: 0,
      model: "TF-IDF + Logistic Regression",
      note: "Metrics become available when the Python ML service is running.",
    });
  }
});

export default router;