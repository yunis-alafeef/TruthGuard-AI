/**
 * TruthGuard AI - Automated Accuracy Benchmarking & Evaluation Suite
 * Evaluates veracity predictions against golden truth datasets (FEVER, LIAR, AraFact).
 * Developed by Yunis Al-Afeef <shoeabvv@gmail.com>
 */

export interface BenchmarkSample {
  id: string;
  claim: string;
  groundTruthVerdict: 'true' | 'false' | 'mixture';
  predictedVerdict: 'true' | 'false' | 'mixture';
  predictedConfidence: number;
}

export interface BenchmarkMetrics {
  totalEvaluated: number;
  accuracy: number; // 0.0 - 1.0
  precision: number;
  recall: number;
  f1Score: number;
  meanConfidenceError: number;
  confusionMatrix: {
    truePositive: number;
    falsePositive: number;
    trueNegative: number;
    falseNegative: number;
  };
}

export function evaluateTruthGuardBenchmark(samples: BenchmarkSample[]): BenchmarkMetrics {
  if (samples.length === 0) {
    return {
      totalEvaluated: 0,
      accuracy: 0,
      precision: 0,
      recall: 0,
      f1Score: 0,
      meanConfidenceError: 0,
      confusionMatrix: { truePositive: 0, falsePositive: 0, trueNegative: 0, falseNegative: 0 }
    };
  }

  let tp = 0;
  let fp = 0;
  let tn = 0;
  let fn = 0;
  let correct = 0;
  let totalError = 0;

  samples.forEach(s => {
    const isActuallyFalse = s.groundTruthVerdict === 'false';
    const isPredictedFalse = s.predictedVerdict === 'false';

    if (s.groundTruthVerdict === s.predictedVerdict) correct++;

    if (isPredictedFalse && isActuallyFalse) tp++;
    else if (isPredictedFalse && !isActuallyFalse) fp++;
    else if (!isPredictedFalse && !isActuallyFalse) tn++;
    else if (!isPredictedFalse && isActuallyFalse) fn++;

    // Calibration error
    const expectedConf = s.groundTruthVerdict === 'true' ? 95 : s.groundTruthVerdict === 'false' ? 10 : 50;
    totalError += Math.abs(s.predictedConfidence - expectedConf);
  });

  const accuracy = Number((correct / samples.length).toFixed(3));
  const precision = tp + fp > 0 ? Number((tp / (tp + fp)).toFixed(3)) : 0;
  const recall = tp + fn > 0 ? Number((tp / (tp + fn)).toFixed(3)) : 0;
  const f1Score = precision + recall > 0 ? Number(((2 * precision * recall) / (precision + recall)).toFixed(3)) : 0;
  const meanConfidenceError = Number((totalError / samples.length).toFixed(2));

  return {
    totalEvaluated: samples.length,
    accuracy,
    precision,
    recall,
    f1Score,
    meanConfidenceError,
    confusionMatrix: {
      truePositive: tp,
      falsePositive: fp,
      trueNegative: tn,
      falseNegative: fn
    }
  };
}
