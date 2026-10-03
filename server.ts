import { aggregateEvidence } from "./lib/search-aggregator.ts";
import { reasonOverEvidence } from "./lib/evidence-reasoner.ts";
import { globalClaimsCache } from "./lib/claims-cache.ts";
import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT || 3000);

const COMMITS_METADATA = [
  {
    hash: 'fd1da56',
    title: 'feat(heuristics): add sensationalism & clickbait intensity scoring analyzer',
    titleAr: 'إضافة محلل مؤشرات التهويل والإثارة والاصطياد العاطفي',
    author: 'Yunis Al-Afeef <shoeabvv@gmail.com>',
    date: '2026-10-01 01:42',
    category: 'Heuristics & NLP',
    summary: 'Analyzes text for exaggeration buzzwords, punctuation abuse, and caps ratio in Arabic & English.'
  },
  {
    hash: '483ad0a',
    title: 'feat(sources): introduce domain credibility & bias rating registry',
    titleAr: 'سجل سمعة وتصنيف موثوقية النطاقات والمصادر الصحفية',
    author: 'Yunis Al-Afeef <shoeabvv@gmail.com>',
    date: '2026-10-01 01:42',
    category: 'Knowledge Base',
    summary: 'Curated knowledge base of verified fact-checkers (Misbar, Fatabyyano, Reuters), satire, and media bias.'
  },
  {
    hash: '8bf2c8e',
    title: 'feat(claim-extractor): add multi-claim decomposition for complex texts',
    titleAr: 'محرك تفكيك النصوص المركبة إلى ادعاءات ذرية قابلة للفحص',
    author: 'Yunis Al-Afeef <shoeabvv@gmail.com>',
    date: '2026-10-01 01:42',
    category: 'NLP Extraction',
    summary: 'Extracts discrete atomic propositions from lengthy articles and social posts, prioritizing testable facts.'
  },
  {
    hash: 'f742284',
    title: 'feat(debunk): generate shareable visual debunk cards and templates',
    titleAr: 'توليد بطاقات تفنيد الشائعات الجاهزة للمشاركة في شبكات التواصل',
    author: 'Yunis Al-Afeef <shoeabvv@gmail.com>',
    date: '2026-10-01 01:42',
    category: 'Social Debunking',
    summary: 'Creates bite-sized formatted cards for WhatsApp, Telegram, and X with one-click copy.'
  },
  {
    hash: 'a2a811c',
    title: 'feat(confidence): implement multi-factor confidence breakdown matrix',
    titleAr: 'مصفوفة الشفافية وتوزيع أوزان الثقة متعددة العوامل',
    author: 'Yunis Al-Afeef <shoeabvv@gmail.com>',
    date: '2026-10-01 01:42',
    category: 'Audit & Transparency',
    summary: 'Auditable scoring rubric: Web Grounding (40%), ML Model (25%), Domain Trust (20%), Neutrality (15%).'
  },
  {
    hash: '9fecbcd',
    title: 'feat(batch): introduce batch verification queue engine with CSV export',
    titleAr: 'محرك الفحص المجمّع للادعاءات وتصدير تقارير CSV',
    author: 'Yunis Al-Afeef <shoeabvv@gmail.com>',
    date: '2026-10-01 01:42',
    category: 'Batch Processing',
    summary: 'Processes batches of up to 15 claims simultaneously with aggregate statistics and CSV export.'
  },
  {
    hash: 'b3212e3',
    title: 'feat(i18n): full bilingual localization engine (Arabic/English) with RTL support',
    titleAr: 'محرك التعريب والتدويل الشامل مع دعم اتجاه اليمين لليسار (RTL)',
    author: 'Yunis Al-Afeef <shoeabvv@gmail.com>',
    date: '2026-10-01 01:43',
    category: 'Localization',
    summary: 'Comprehensive Arabic and English dictionaries with dynamic UI label resolution.'
  },
  {
    hash: 'd2db7c9',
    title: 'feat(bookmarks): add client-side investigation bookmarking and tagging',
    titleAr: 'نظام حفظ التحقيقات والوسوم المخصصة في الذاكرة المحلية',
    author: 'Yunis Al-Afeef <shoeabvv@gmail.com>',
    date: '2026-10-01 01:43',
    category: 'User Experience',
    summary: 'Allows saving investigations, applying thematic tags (#health, #politics), and exporting saved queries.'
  },
  {
    hash: '781ae3e',
    title: 'feat(rate-limit): implement token-bucket API rate limiter and health metrics',
    titleAr: 'وسيط تحديد معدل الاستعلام ومقاييس صحة الخادم',
    author: 'Yunis Al-Afeef <shoeabvv@gmail.com>',
    date: '2026-10-01 01:43',
    category: 'Security & Infrastructure',
    summary: 'Sliding-window IP rate limiter with standard X-RateLimit headers to prevent API abuse.'
  },
  {
    hash: 'c5378ed',
    title: 'feat(badges): generate dynamic embeddable HTML and SVG verification badges',
    titleAr: 'مولد شارات التحقق الرقمية التفاعلية بصيغة SVG للمواقع والمدونات',
    author: 'Yunis Al-Afeef <shoeabvv@gmail.com>',
    date: '2026-10-01 01:43',
    category: 'Widgets & Embeds',
    summary: 'Dynamic shields and HTML embeds indicating verified veracity score for journalists and bloggers.'
  },
  {
    hash: '5f78a54',
    title: 'feat(cli): add TruthGuard interactive CLI and comprehensive project documentation',
    titleAr: 'أداة سطر الأوامر التفاعلية (CLI) والتوثيق البرمجي الشامل للمشروع',
    author: 'Yunis Al-Afeef <shoeabvv@gmail.com>',
    date: '2026-10-01 01:43',
    category: 'Developer Tooling & Docs',
    summary: 'Standalone CLI runner in scripts/src/verify-cli.ts and fully revamped README with architectural guide.'
  }
];

async function startServer() {
  const app = express();
  app.use(express.json());

  // Static files for bundle and script
  app.use(express.static(path.resolve(__dirname, 'public')));

  // Initialize Gemini client if available
  const apiKey = process.env.GEMINI_API_KEY || '';
  const ai = apiKey ? new GoogleGenAI() : null;

  // Health check endpoint for cloud monitoring (Koyeb, Docker, Fly.io, etc.)
  app.get(['/api/health', '/api/healthz'], (req, res) => {
    res.json({
      status: 'ok',
      service: 'TruthGuard AI (حارس الحقيقة)',
      version: '3.0.0',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      aiConfigured: Boolean(process.env.GEMINI_API_KEY)
    });
  });

  // 1. Commits Endpoint
  app.get('/api/github/commits', (req, res) => {
    res.json({
      repo: 'https://github.com/yunis-alafeef/TruthGuard-AI.git',
      branch: 'main',
      author: 'Yunis Al-Afeef <shoeabvv@gmail.com>',
      totalCommits: COMMITS_METADATA.length,
      commits: COMMITS_METADATA,
      bundleUrl: '/truthguard-11-commits.bundle',
      pushScriptUrl: '/push_all_sequential.sh'
    });
  });

  // 2. Sequential Push to GitHub Endpoint
  app.post('/api/github/push-sequential', async (req, res) => {
    const { token } = req.body;
    if (!token || typeof token !== 'string' || !token.trim()) {
      return res.status(400).json({
        success: false,
        error: 'يرجى إدخال رمز الوصول الشخصي (GitHub Personal Access Token) الخاص بك.'
      });
    }

    const cleanToken = token.trim();
    const scriptPath = '/tmp/truthguard/push_all_sequential.sh';

    if (!fs.existsSync(scriptPath)) {
      return res.status(500).json({
        success: false,
        error: 'Push script not found on system.'
      });
    }

    // Execute sequential push
    exec(`bash ${scriptPath} "${cleanToken}"`, { cwd: '/tmp/truthguard', timeout: 90000 }, (error, stdout, stderr) => {
      if (error) {
        return res.status(500).json({
          success: false,
          error: error.message,
          stdout: stdout || '',
          stderr: stderr || ''
        });
      }

      res.json({
        success: true,
        message: 'تم رفع كافة الـ 11 كوميت بنجاح بالتتابع إلى مستودع GitHub!',
        stdout: stdout,
        commitsPushed: 11
      });
    });
  });

  // 2b. Push Deployment Guide Branch Endpoint
  app.post('/api/github/push-deployment-branch', async (req, res) => {
    const { token } = req.body;
    if (!token || typeof token !== 'string' || !token.trim()) {
      return res.status(400).json({
        success: false,
        error: 'يرجى إدخال رمز الوصول الشخصي (GitHub Personal Access Token) الخاص بك.'
      });
    }

    const cleanToken = token.trim();
    const scriptPath = path.resolve(__dirname, 'public/push_koyeb_deployment.sh');

    exec(`bash "${scriptPath}" "${cleanToken}"`, { cwd: '/tmp/truthguard-repo', timeout: 30000 }, (error, stdout, stderr) => {
      if (error) {
        return res.status(500).json({
          success: false,
          error: error.message,
          stdout: stdout || '',
          stderr: stderr || '',
          hint: 'تأكد من أن الـ Token الخاص بك يملك صلاحية Contents: Read and write لمستودع TruthGuard-AI'
        });
      }

      res.json({
        success: true,
        message: 'تم رفع فرع النشر السحابي (feat/free-cloud-deployment-guide) بنجاح إلى GitHub!',
        branch: 'feat/free-cloud-deployment-guide',
        repoUrl: 'https://github.com/yunis-alafeef/TruthGuard-AI/tree/feat/free-cloud-deployment-guide',
        stdout: stdout
      });
    });
  });

  // 3. Sensationalism & Emotion Heuristic Function
  function checkSensationalism(text: string) {
    const triggersAr = ['عاجل', 'خطير جدا', 'كارثة', 'صدمة كبرى', 'لن تصدق', 'شاهد قبل الحذف', 'مؤامرة', 'سر أخفته الحكومات', 'فضيحة', 'معجزة طبية', 'أخطر'];
    const triggersEn = ['shocking', 'unbelievable', 'miracle cure', 'hidden secret', 'they don\'t want you to know', 'disaster'];
    const detected: string[] = [];

    const lower = text.toLowerCase();
    for (const t of triggersAr) {
      if (text.includes(t)) detected.push(t);
    }
    for (const t of triggersEn) {
      if (lower.includes(t)) detected.push(t);
    }

    const hasExclamation = /!{2,}|\?{2,}/.test(text);
    let score = detected.length * 25 + (hasExclamation ? 25 : 0);
    score = Math.min(100, Math.max(0, score));

    return {
      score,
      level: score > 70 ? 'extreme' : score > 40 ? 'high' : score > 15 ? 'moderate' : 'low',
      triggers: detected,
      hasExclamation
    };
  }

  // 4. Verification Endpoint
  app.post('/api/verify', async (req, res) => {
    try {
      const { claim, lang = 'ar' } = req.body;
      if (!claim || typeof claim !== 'string' || !claim.trim()) {
        return res.status(400).json({ error: 'Claim text is required.' });
      }

      const cacheKey = `claim:${claim.trim().slice(0, 150)}`;
      const cached = globalClaimsCache.get(cacheKey);
      if (cached) {
        return res.json(cached);
      }

      const sensationalism = checkSensationalism(claim);

      // 1. Gather live evidence across Google Fact Check Tools API + News Search + Wire Feeds
      const searchResult = await aggregateEvidence(claim);

      // 2. Reason over retrieved evidence with Gemini RAG pipeline (strict, no hallucination)
      const synthesis = await reasonOverEvidence(claim, searchResult.sources, process.env.GEMINI_API_KEY);

      // 3. Compute transparent multi-factor confidence matrix
      const evidenceScore = Math.min(100, Math.max(30, searchResult.sources.length * 20));
      const modelScore = synthesis.confidenceScore;
      const sourceScore = searchResult.factCheckMatches > 0 ? 95 : (searchResult.sources[0]?.isFactChecker ? 92 : 82);
      const neutralityScore = Math.max(10, 100 - sensationalism.score);

      const computedOverall = Math.round(
        evidenceScore * 0.4 +
        modelScore * 0.25 +
        sourceScore * 0.2 +
        neutralityScore * 0.15
      );

      const matrix = {
        overallScore: computedOverall,
        grade: computedOverall >= 85 ? 'A+' : computedOverall >= 75 ? 'A' : computedOverall >= 60 ? 'B' : computedOverall >= 40 ? 'C' : 'F',
        factors: [
          {
            nameAr: 'أدلة الويب الحية ومطابقة المصادر الإخبارية',
            nameEn: 'Live Web & News Grounding',
            weight: 40,
            score: evidenceScore,
            contribution: Math.round(evidenceScore * 0.4)
          },
          {
            nameAr: 'تحليل المنطق البرهاني (AI Evidence Reasoning)',
            nameEn: 'AI Evidence Reasoning & Stance Analysis',
            weight: 25,
            score: modelScore,
            contribution: Math.round(modelScore * 0.25)
          },
          {
            nameAr: 'موثوقية وتصنيف النطاقات المستشهد بها',
            nameEn: 'Source Domain Trust & Accreditation',
            weight: 20,
            score: sourceScore,
            contribution: Math.round(sourceScore * 0.2)
          },
          {
            nameAr: 'الحياد اللغوي وخلو الصياغة من التهويل',
            nameEn: 'Linguistic Neutrality',
            weight: 15,
            score: neutralityScore,
            contribution: Math.round(neutralityScore * 0.15)
          }
        ]
      };

      const sourcesFormatted = searchResult.sources.map(s => ({
        title: s.title,
        url: s.url,
        domain: s.publisher,
        publisher: s.publisher,
        reliability: s.isFactChecker ? 96 : 85,
        isFactChecker: s.isFactChecker,
        stance: s.stance || (synthesis.verdict === 'False' ? 'contradicts' : 'supports'),
        snippet: s.snippet,
        publishedDate: s.publishedDate
      }));

      const responsePayload = {
        claim,
        verdict: synthesis.verdict.toLowerCase().replace(" ", "_"),
        verdictLabelAr: synthesis.verdictAr,
        verdictLabelEn: synthesis.verdict,
        confidenceScore: computedOverall,
        summaryAr: synthesis.summaryAr,
        summaryEn: synthesis.summaryEn,
        sensationalism,
        matrix,
        subClaims: synthesis.keyDiscrepanciesAr.map(d => ({ claim: d, verdict: synthesis.verdict, status: "verified" })),
        sources: sourcesFormatted,
        sourcesCount: searchResult.totalFound,
        factCheckMatches: searchResult.factCheckMatches,
        newsArticlesCount: searchResult.newsArticlesCount,
        searchEngineUsed: searchResult.engineUsed,
        modelUsed: synthesis.modelUsed,
        architecture: "TypeScript + Multi-Source Search + Gemini Evidence Reasoner (Vercel Serverless)",
        verifiedAt: new Date().toISOString()
      };

      globalClaimsCache.set(cacheKey, responsePayload);
      res.json(responsePayload);
    } catch (err: any) {
      console.error('Verify error:', err);
      res.status(500).json({ error: err.message || 'Verification failed.' });
    }
  });

  app.get('/api/badge/:verdict/:score', (req, res) => {
    const { verdict, score } = req.params;
    const numScore = Number(score) || 80;

    let color = '#10b981';
    let text = `TRUE ${numScore}%`;

    if (verdict === 'mostly_true') {
      color = '#3b82f6';
      text = `MOSTLY TRUE ${numScore}%`;
    } else if (verdict === 'misleading') {
      color = '#f59e0b';
      text = `MISLEADING ${numScore}%`;
    } else if (verdict === 'false') {
      color = '#ef4444';
      text = `FALSE ${numScore}%`;
    } else if (verdict === 'unverified') {
      color = '#6b7280';
      text = `UNVERIFIED ${numScore}%`;
    }

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="24" role="img" aria-label="TruthGuard: ${text}">
  <clipPath id="r"><rect width="180" height="24" rx="4" fill="#fff"/></clipPath>
  <g clip-path="url(#r)">
    <rect width="80" height="24" fill="#1e293b"/>
    <rect x="80" width="100" height="24" fill="${color}"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="DejaVu Sans,Verdana,sans-serif" font-size="11">
    <text x="40" y="16">TruthGuard</text>
    <text x="130" y="16" font-weight="bold">${text}</text>
  </g>
</svg>`;

    res.setHeader('Content-Type', 'image/svg+xml');
    res.send(svg);
  });

  // Mount Vite or serve static assets
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🛡️ TruthGuard AI server running at http://localhost:${PORT}`);
  });
}

startServer();
