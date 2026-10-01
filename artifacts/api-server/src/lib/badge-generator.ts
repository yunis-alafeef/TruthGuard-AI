/**
 * @file badge-generator.ts
 * @description Generates dynamic SVG shields and embeddable HTML badges for journalists,
 * blogs, and newsrooms to display claim verification status.
 */

export interface BadgeOptions {
  label?: string;
  verdict: 'supported' | 'mostly_true' | 'unverified' | 'misleading' | 'false';
  score: number;
}

export function generateSvgBadge(options: BadgeOptions): string {
  const label = options.label || 'TruthGuard';
  let statusText = 'VERIFIED';
  let color = '#10b981'; // Green

  switch (options.verdict) {
    case 'supported':
      statusText = `TRUE ${options.score}%`;
      color = '#10b981';
      break;
    case 'mostly_true':
      statusText = `MOSTLY TRUE ${options.score}%`;
      color = '#3b82f6';
      break;
    case 'misleading':
      statusText = `MISLEADING ${options.score}%`;
      color = '#f59e0b';
      break;
    case 'false':
      statusText = `FALSE ${options.score}%`;
      color = '#ef4444';
      break;
    case 'unverified':
    default:
      statusText = `UNVERIFIED ${options.score}%`;
      color = '#6b7280';
      break;
  }

  const leftWidth = 75;
  const rightWidth = Math.max(90, statusText.length * 9);
  const totalWidth = leftWidth + rightWidth;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="24" role="img" aria-label="${label}: ${statusText}">
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="r">
    <rect width="${totalWidth}" height="24" rx="4" fill="#fff"/>
  </clipPath>
  <g clip-path="url(#r)">
    <rect width="${leftWidth}" height="24" fill="#1e293b"/>
    <rect x="${leftWidth}" width="${rightWidth}" height="24" fill="${color}"/>
    <rect width="${totalWidth}" height="24" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" text-rendering="geometricPrecision" font-size="11">
    <text x="${leftWidth / 2}" y="16" fill="#fff">${label}</text>
    <text x="${leftWidth + rightWidth / 2}" y="16" font-weight="bold">${statusText}</text>
  </g>
</svg>`;
}
