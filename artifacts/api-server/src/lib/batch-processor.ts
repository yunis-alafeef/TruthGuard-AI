/**
 * @file batch-processor.ts
 * @description Batch processing engine for checking multiple claims concurrently or sequentially
 * with aggregation metrics and CSV export functionality.
 */

export interface BatchItem {
  id: string;
  claim: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  verdict?: 'supported' | 'mostly_true' | 'unverified' | 'misleading' | 'false';
  confidenceScore?: number;
  summary?: string;
  durationMs?: number;
  error?: string;
}

export interface BatchSummary {
  total: number;
  completed: number;
  failed: number;
  verdictCounts: {
    supported: number;
    mostly_true: number;
    unverified: number;
    misleading: number;
    false: number;
  };
  averageConfidence: number;
  items: BatchItem[];
}

export function generateBatchCsv(items: BatchItem[]): string {
  const header = ['ID', 'Claim', 'Verdict', 'Confidence Score', 'Summary', 'Status'].join(',');
  const rows = items.map(item => {
    const cleanClaim = `"${(item.claim || '').replace(/"/g, '""')}"`;
    const cleanSummary = `"${(item.summary || '').replace(/"/g, '""')}"`;
    return [
      item.id,
      cleanClaim,
      item.verdict || 'N/A',
      item.confidenceScore !== undefined ? `${item.confidenceScore}%` : 'N/A',
      cleanSummary,
      item.status
    ].join(',');
  });

  return [header, ...rows].join('\n');
}

export function computeBatchSummary(items: BatchItem[]): BatchSummary {
  const completedItems = items.filter(i => i.status === 'completed');
  const failedItems = items.filter(i => i.status === 'failed');

  const counts = {
    supported: 0,
    mostly_true: 0,
    unverified: 0,
    misleading: 0,
    false: 0
  };

  let totalConfidence = 0;
  completedItems.forEach(item => {
    if (item.verdict && counts[item.verdict] !== undefined) {
      counts[item.verdict]++;
    }
    if (item.confidenceScore !== undefined) {
      totalConfidence += item.confidenceScore;
    }
  });

  const avgConfidence = completedItems.length > 0
    ? Math.round(totalConfidence / completedItems.length)
    : 0;

  return {
    total: items.length,
    completed: completedItems.length,
    failed: failedItems.length,
    verdictCounts: counts,
    averageConfidence: avgConfidence,
    items
  };
}
