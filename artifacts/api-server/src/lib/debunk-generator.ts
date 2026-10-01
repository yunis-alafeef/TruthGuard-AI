/**
 * @file debunk-generator.ts
 * @description Generates formatted social media debunk cards and ready-to-share text
 * for instant distribution on WhatsApp, Telegram, X (Twitter), and Facebook.
 */

export interface DebunkCardData {
  claim: string;
  verdict: 'supported' | 'mostly_true' | 'unverified' | 'misleading' | 'false';
  verdictLabelAr: string;
  verdictLabelEn: string;
  confidenceScore: number;
  explanation: string;
  factSummary: string;
  sources: { title: string; url: string }[];
  timestamp: string;
}

export function generateDebunkSocialPost(data: DebunkCardData, lang: 'ar' | 'en' = 'ar'): string {
  if (lang === 'ar') {
    const verdictEmoji =
      data.verdict === 'supported'
        ? '✅ [صحيح / مدعوم بأدلة]'
        : data.verdict === 'mostly_true'
        ? '🟢 [صحيح إلى حد كبير]'
        : data.verdict === 'misleading'
        ? '⚠️ [مضلل / خارج السياق]'
        : data.verdict === 'false'
        ? '❌ [كاذب / لا أساس له من الصحة]'
        : '❓ [غير مثبت بأدلة كافية]';

    return `🛡️ *حارس الحقيقة (TruthGuard AI) - بطاقة تحقق*

📌 *الادعاء المتداول:*
"${data.claim}"

⚖️ *الحكم والنتيجة:* ${verdictEmoji} (درجة المصداقية: ${data.confidenceScore}%)

🔍 *الحقيقة والبيان:*
${data.factSummary || data.explanation}

🔗 *المصادر المعتمدة:*
${data.sources.slice(0, 3).map((s, i) => `${i + 1}. ${s.title} (${s.url})`).join('\n') || '- تم الفحص عبر أدلة الويب الحية وقواعد البيانات الدولية.'}

---
💡 فكّر قبل أن تُشارك | تم التحقق بواسطة TruthGuard AI
📅 ${data.timestamp || new Date().toLocaleDateString('ar-EG')}`;
  }

  const verdictEmojiEn =
    data.verdict === 'supported'
      ? '✅ [VERIFIED TRUE]'
      : data.verdict === 'mostly_true'
      ? '🟢 [MOSTLY TRUE]'
      : data.verdict === 'misleading'
      ? '⚠️ [MISLEADING / OUT OF CONTEXT]'
      : data.verdict === 'false'
      ? '❌ [FALSE / FABRICATED]'
      : '❓ [UNVERIFIED]';

  return `🛡️ *TruthGuard AI - Fact Check Debunk Card*

📌 *Claim:*
"${data.claim}"

⚖️ *Verdict:* ${verdictEmojiEn} (Credibility: ${data.confidenceScore}%)

🔍 *The Facts:*
${data.factSummary || data.explanation}

🔗 *Key Sources:*
${data.sources.slice(0, 3).map((s, i) => `${i + 1}. ${s.title} (${s.url})`).join('\n') || '- Cross-referenced with live web evidence.'}

---
💡 Think before you share | Verified with TruthGuard AI
📅 ${data.timestamp || new Date().toLocaleDateString('en-US')}`;
}
