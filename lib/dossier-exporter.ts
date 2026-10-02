/**
 * TruthGuard AI - Investigative Dossier & Multi-Format Exporter
 * Generates audit-ready dossiers in Markdown, JSON, and print-styled HTML.
 * Developed by Yunis Al-Afeef <shoeabvv@gmail.com>
 */

export interface DossierRecord {
  id: string;
  claim: string;
  claimant?: string;
  dateInvestigated: string;
  verdict: string;
  verdictLabelAr: string;
  verdictLabelEn: string;
  confidenceScore: number;
  executiveSummaryAr: string;
  executiveSummaryEn: string;
  sources: {
    title: string;
    url: string;
    reliability: number;
  }[];
  matrixFactors?: {
    name: string;
    score: number;
    weight: number;
  }[];
  sensationalismScore?: number;
}

export function generateMarkdownDossier(record: DossierRecord): string {
  const sourcesMd = record.sources
    .map((s, idx) => `${idx + 1}. [${s.title}](${s.url}) — **الموثوقية: ${s.reliability}%**`)
    .join('\n');

  const matrixMd = record.matrixFactors
    ? record.matrixFactors
        .map(f => `| ${f.name} | ${f.weight}% | ${f.score}/100 |`)
        .join('\n')
    : '| فحص الويب ومطابقة المصادر | 100% | ' + record.confidenceScore + '/100 |';

  return `# ملف التحقيق والتدقيق الرقمي: ${record.id}
**منظومة TruthGuard AI لتقصي الحقائق ومكافحة التضليل**  
*المحقق المسؤول:* Yunis Al-Afeef  
*تاريخ الفحص:* ${record.dateInvestigated}

---

### 1. نص الادعاء المفحوص
> "${record.claim}"
${record.claimant ? `*الجهة / الشخص المنسوب إليه:* **${record.claimant}**` : ''}

### 2. النتيجة النهائية ودرجة الثقة
- **الحكم العربي:** ${record.verdictLabelAr}
- **Verdict (EN):** ${record.verdictLabelEn}
- **مؤشر الثقة:** **${record.confidenceScore}%**
${record.sensationalismScore !== undefined ? `- **مؤشر التهويل اللغوي:** ${record.sensationalismScore}/100` : ''}

### 3. الملخص التنفيذي
${record.executiveSummaryAr}

*Executive Summary:*  
${record.executiveSummaryEn}

### 4. مصفوفة أوزان الأدلة
| معيار التحقق | الوزن النسبي | الدرجة المستحقة |
| :--- | :---: | :---: |
${matrixMd}

### 5. المصادر والمراجع المعتمدة
${sourcesMd || 'تم الفحص استناداً إلى السجلات المعرفية المتاحة.'}

---
*تم إنشاء هذا التقرير تلقائياً عبر TruthGuard-AI Engine (v2.0).*
`;
}

export function generateHtmlPrintReport(record: DossierRecord): string {
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>تقرير فحص ادعاء - ${record.id}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #1e293b; padding: 40px; max-width: 800px; margin: auto; }
    .header { border-bottom: 2px solid #0284c7; padding-bottom: 15px; margin-bottom: 25px; }
    .badge { display: inline-block; padding: 6px 14px; border-radius: 9999px; font-weight: bold; background: #e0f2fe; color: #0369a1; }
    .quote-box { background: #f8fafc; border-right: 4px solid #0284c7; padding: 15px 20px; font-style: italic; margin: 20px 0; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #e2e8f0; padding: 10px; text-align: right; }
    th { background: #f1f5f9; }
    .footer { margin-top: 40px; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 15px; }
  </style>
</head>
<body>
  <div class="header">
    <h2>TruthGuard AI — تقرير تدقيق الحقائق</h2>
    <p>معرّف التقرير: <code>${record.id}</code> | التاريخ: ${record.dateInvestigated}</p>
  </div>
  <div class="quote-box">
    <strong>الادعاء المفحوص:</strong><br>
    ${record.claim}
  </div>
  <div>
    <span class="badge">الحكم: ${record.verdictLabelAr} (${record.confidenceScore}%)</span>
  </div>
  <h3>الملخص التنفيذي</h3>
  <p>${record.executiveSummaryAr}</p>
  <h3>المصادر المعتمدة</h3>
  <ul>
    ${record.sources.map(s => `<li><a href="${s.url}">${s.title}</a> (الموثوقية: ${s.reliability}%)</li>`).join('')}
  </ul>
  <div class="footer">
    TruthGuard Fact Checking Verification Dossier &bull; Verified by Yunis Al-Afeef
  </div>
</body>
</html>`;
}
