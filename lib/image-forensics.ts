/**
 * TruthGuard AI - Visual Manipulation & Image Forensics Analyzer
 * Evaluates image metadata, AI generation markers, and reverse verification vectors.
 * Developed by Yunis Al-Afeef <shoeabvv@gmail.com>
 */

export interface ExifProfile {
  make?: string;
  model?: string;
  dateTimeOriginal?: string;
  software?: string;
  latitude?: number;
  longitude?: number;
  hasC2PAProvenance?: boolean;
}

export interface ForensicsAuditResult {
  hasMetadataTampering: boolean;
  isLikelySyntheticAI: boolean;
  syntheticConfidence: number; // 0 - 100
  temporalDiscrepancyDays?: number;
  auditFindingsAr: string[];
  auditFindingsEn: string[];
  reverseSearchLinks: {
    service: 'Google Lens' | 'TinEye' | 'Yandex' | 'Bing';
    searchUrl: string;
  }[];
  integrityRating: 'verified_original' | 'suspicious' | 'manipulated_or_ai' | 'inconclusive';
}

const AI_GENERATION_SIGNATURES = [
  'midjourney',
  'stable diffusion',
  'dall-e',
  'firefly',
  'comfyui',
  'novelai',
  'adobe photoshop generative',
  'bing image creator'
];

/**
 * Evaluates image metadata for authenticity vs fabrication
 */
export function analyzeImageForensics(
  imageUrl: string,
  exif: ExifProfile,
  claimPublishDate?: string
): ForensicsAuditResult {
  const findingsAr: string[] = [];
  const findingsEn: string[] = [];
  let syntheticScore = 0;

  // Check software signatures
  const softwareLower = (exif.software || '').toLowerCase();
  const matchedSig = AI_GENERATION_SIGNATURES.find(sig => softwareLower.includes(sig));

  if (matchedSig) {
    syntheticScore = 95;
    findingsAr.push(`تم رصد توقيع برمجي لأداة توليد بالذكاء الاصطناعي: (${matchedSig}).`);
    findingsEn.push(`Detected AI generation signature in metadata: (${matchedSig}).`);
  } else if (!exif.make && !exif.model && !exif.dateTimeOriginal) {
    findingsAr.push('البيانات الوصفية (EXIF) مجردة بالكامل، وهو أمر شائع في شبكات التواصل.');
    findingsEn.push('EXIF metadata is completely stripped, typical for social platforms.');
    syntheticScore += 20;
  }

  // Check C2PA Content Credentials
  if (exif.hasC2PAProvenance) {
    findingsAr.push('الصورة تحتوي على شهادة أصالة ومحتوى رقمي معتمد (C2PA Provenance).');
    findingsEn.push('Image contains valid C2PA Content Authenticity credentials.');
    syntheticScore = Math.max(0, syntheticScore - 40);
  }

  // Check temporal discrepancy (e.g. recycled old photo used for recent crisis)
  let discrepancyDays: number | undefined;
  if (exif.dateTimeOriginal && claimPublishDate) {
    const origTime = new Date(exif.dateTimeOriginal).getTime();
    const claimTime = new Date(claimPublishDate).getTime();
    if (!isNaN(origTime) && !isNaN(claimTime)) {
      discrepancyDays = Math.round(Math.abs(claimTime - origTime) / (1000 * 60 * 60 * 24));
      if (discrepancyDays > 30) {
        findingsAr.push(`صورة قديمة معاد تدويرها: الفارق الزمني بين تاريخ التقاط الصورة وتاريخ الادعاء هو ${discrepancyDays} يوماً.`);
        findingsEn.push(`Recycled image: Captured ${discrepancyDays} days before the circulating claim.`);
      }
    }
  }

  let rating: ForensicsAuditResult['integrityRating'] = 'inconclusive';
  if (syntheticScore >= 70) {
    rating = 'manipulated_or_ai';
  } else if (discrepancyDays && discrepancyDays > 30) {
    rating = 'suspicious';
  } else if (exif.hasC2PAProvenance && syntheticScore < 20) {
    rating = 'verified_original';
  }

  const encodedUrl = encodeURIComponent(imageUrl);

  return {
    hasMetadataTampering: !!discrepancyDays && discrepancyDays > 30,
    isLikelySyntheticAI: syntheticScore >= 60,
    syntheticConfidence: syntheticScore,
    temporalDiscrepancyDays: discrepancyDays,
    auditFindingsAr: findingsAr,
    auditFindingsEn: findingsEn,
    integrityRating: rating,
    reverseSearchLinks: [
      {
        service: 'Google Lens',
        searchUrl: `https://lens.google.com/uploadbyurl?url=${encodedUrl}`
      },
      {
        service: 'TinEye',
        searchUrl: `https://tineye.com/search?url=${encodedUrl}`
      },
      {
        service: 'Yandex',
        searchUrl: `https://yandex.com/images/search?rpt=imageview&url=${encodedUrl}`
      }
    ]
  };
}
