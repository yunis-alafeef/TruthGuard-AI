import type { VerificationResult } from "@workspace/api-client-react";

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export function exportVerificationAsJson(result: VerificationResult) {
  const jsonContent = JSON.stringify(result, null, 2);
  const filename = `truthguard-report-${result.id || "claim"}-${Date.now()}.json`;
  downloadFile(jsonContent, filename, "application/json;charset=utf-8;");
}

export function exportVerificationAsMarkdown(
  result: VerificationResult,
  verdictLabel: string,
) {
  const percent = Math.round(result.confidence * 100);
  const formattedDate = new Date(result.createdAt).toLocaleString("ar-SA");

  let md = `# تقرير التحقق من الحقائق - TruthGuard AI\n\n`;
  md += `- **تاريخ الفحص:** ${formattedDate}\n`;
  md += `- **الحكم النهائي:** ${verdictLabel} (${result.verdict})\n`;
  md += `- **درجة الثقة:** ${percent}%\n`;
  md += `- **حالة البحث:** ${result.searchStatus}\n\n`;

  md += `## الادعاء المفحوص\n\n`;
  md += `> "${result.extractedClaim}"\n\n`;

  md += `## البيان والتفسير\n\n`;
  md += `${result.explanation}\n\n`;

  md += `## إشارة نموذج التعلم الآلي\n\n`;
  md += `- **النموذج:** ${result.mlSignal.model}\n`;
  md += `- **التصنيف:** ${result.mlSignal.label}\n`;
  md += `- **الثقة اللغوية:** ${Math.round(result.mlSignal.confidence * 100)}%\n\n`;

  md += `## الأدلة والمصادر المفحوصة (${result.evidence.length})\n\n`;
  if (result.evidence.length === 0) {
    md += `*لم يتم العثور على مصادر ويب مفهرسة لهذا الادعاء.*\n\n`;
  } else {
    result.evidence.forEach((ev, idx) => {
      const stance =
        ev.stance === "supports"
          ? "✅ يدعم"
          : ev.stance === "contradicts"
            ? "❌ يتناقض"
            : "ℹ️ سياق";
      md += `### ${idx + 1}. [${ev.title}](${ev.url})\n`;
      md += `- **الموقف:** ${stance}\n`;
      md += `- **المصدر:** ${ev.sourceType}\n`;
      md += `- **المقتطف:** "${ev.snippet}"\n\n`;
    });
  }

  md += `---\n`;
  md += `*تم إنشاء هذا التقرير آلياً بواسطة TruthGuard AI - إعداد وعمل المهندس يونس العفيف.*\n`;

  const filename = `truthguard-report-${result.id || "claim"}-${Date.now()}.md`;
  downloadFile(md, filename, "text/markdown;charset=utf-8;");
}
