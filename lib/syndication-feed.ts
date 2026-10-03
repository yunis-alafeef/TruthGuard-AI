/**
 * TruthGuard AI - RSS 2.0 & Atom Syndication Engine
 * Generates standards-compliant XML feeds for news aggregators and automated subscribers.
 * Developed by Yunis Al-Afeef <shoeabvv@gmail.com>
 */

export interface FeedItem {
  id: string;
  title: string;
  claim: string;
  verdict: string;
  confidenceScore: number;
  summary: string;
  publishDate: string; // ISO
  url: string;
}

export function generateRssFeed(items: FeedItem[], channelTitle = 'TruthGuard AI Fact-Check Feed'): string {
  const itemXml = items.map(item => `
    <item>
      <title><![CDATA[${item.title} [${item.verdict.toUpperCase()}]]]></title>
      <link>${item.url}</link>
      <guid isPermaLink="true">${item.url}</guid>
      <pubDate>${new Date(item.publishDate).toUTCString()}</pubDate>
      <description><![CDATA[${item.summary}]]></description>
      <truthguard:verdict>${item.verdict}</truthguard:verdict>
      <truthguard:confidence>${item.confidenceScore}</truthguard:confidence>
      <truthguard:claim><![CDATA[${item.claim}]]></truthguard:claim>
    </item>`).join('');

  return `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:truthguard="https://truthguard.ai/ns/1.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${channelTitle}</title>
    <link>https://truthguard.ai</link>
    <description>Real-time fact checking, verification verdicts, and misinformation alerts.</description>
    <language>ar</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="https://truthguard.ai/feed.xml" rel="self" type="application/rss+xml" />
    ${itemXml}
  </channel>
</rss>`;
}

export function generateAtomFeed(items: FeedItem[]): string {
  const entries = items.map(item => `
  <entry>
    <title>${item.title}</title>
    <id>${item.url}</id>
    <link href="${item.url}" />
    <updated>${item.publishDate}</updated>
    <summary>${item.summary}</summary>
    <content type="html"><![CDATA[<p><strong>الادعاء:</strong> ${item.claim}</p><p><strong>الحكم:</strong> ${item.verdict} (${item.confidenceScore}%)</p><p>${item.summary}</p>]]></content>
  </entry>`).join('');

  return `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>TruthGuard AI Fact-Check Stream</title>
  <link href="https://truthguard.ai" />
  <updated>${new Date().toISOString()}</updated>
  <id>https://truthguard.ai/feed.atom</id>
  ${entries}
</feed>`;
}
