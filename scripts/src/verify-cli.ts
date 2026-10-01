/**
 * @file verify-cli.ts
 * @description Standalone command-line verification tool for TruthGuard AI.
 * Usage: tsx scripts/src/verify-cli.ts "Your claim here"
 */

import { analyzeSensationalism } from '../../artifacts/api-server/src/lib/sensationalism';
import { lookupSourceReputation } from '../../artifacts/api-server/src/lib/source-reputation';
import { extractAtomicClaims } from '../../artifacts/api-server/src/lib/claim-extractor';
import { computeConfidenceMatrix } from '../../artifacts/api-server/src/lib/confidence-matrix';

const claim = process.argv.slice(2).join(' ') || 'اللقاحات تحتوي على شرائح إلكترونية للتحكم بالبشر!';

console.log('🛡️ =========================================================');
console.log('🛡️ TruthGuard AI CLI (حارس الحقيقة) - Verification Pipeline');
console.log('🛡️ Developed by Eng. Yunis Al-Afeef <shoeabvv@gmail.com>');
console.log('🛡️ =========================================================\n');

console.log(`📌 Investigating Claim: "${claim}"\n`);

// 1. Sensationalism Check
const sensationalism = analyzeSensationalism(claim);
console.log('📊 [1] Sensationalism & Emotion Analysis:');
console.log(`   - Score: ${sensationalism.score}/100 (${sensationalism.level.toUpperCase()})`);
console.log(`   - Triggers: ${sensationalism.detectedTriggers.join(', ') || 'None'}`);
console.log(`   - Arabic Note: ${sensationalism.analysis.ar}\n`);

// 2. Claim Decomposition
const decomposition = extractAtomicClaims(claim);
console.log('🧩 [2] Atomic Claims Decomposition:');
console.log(`   - Total Sub-claims: ${decomposition.totalExtracted}`);
decomposition.verifiableClaims.forEach((c, idx) => {
  console.log(`   [#${idx + 1}] Priority: ${c.priority} | Query: "${c.searchQuery}"`);
});
console.log('');

// 3. Confidence Matrix Simulation
const confidence = computeConfidenceMatrix({
  evidenceCount: 3,
  topSourceReputation: 95,
  modelProbability: 0.15,
  sensationalismScore: sensationalism.score
});

console.log('⚖️ [3] Transparency & Confidence Matrix:');
console.log(`   - Calculated Score: ${confidence.overallScore}/100 (Grade: ${confidence.grade})`);
console.log(`   - Status: ${confidence.reliabilityStatus}`);
confidence.factors.forEach(f => {
  console.log(`   • ${f.factorNameAr}: ${f.score}/100 (Weight: ${f.weightPercent}%)`);
});

console.log('\n✅ Verification pipeline simulation completed successfully.');
