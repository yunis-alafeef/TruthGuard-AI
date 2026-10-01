/**
 * @file debunk-card.ts
 * @description Frontend helper to render and copy debunk cards for messaging apps.
 */

export interface DebunkCardPayload {
  claim: string;
  verdict: string;
  score: number;
  explanation: string;
  sources: { title: string; url: string }[];
}

export async function copyDebunkCardToClipboard(data: DebunkCardPayload): Promise<boolean> {
  const text = `🛡️ [TruthGuard AI - بطاقة تفنيد حارس الحقيقة]
📌 الادعاء: ${data.claim}
⚖️ النتيجة: ${data.verdict} (${data.score}%)
🔍 التوضيح: ${data.explanation}
🔗 المصادر: ${data.sources.map(s => s.url).slice(0, 2).join(', ')}`;

  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (err) {
    console.error('Clipboard copy failed', err);
  }
  return false;
}
