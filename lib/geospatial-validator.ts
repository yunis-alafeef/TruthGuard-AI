/**
 * TruthGuard AI - Geospatial Claim Validator & Regional Relevance Mapper
 * Matches place mentions against regional meteorological and municipal databases.
 * Developed by Yunis Al-Afeef <shoeabvv@gmail.com>
 */

export interface GeoLocation {
  nameAr: string;
  nameEn: string;
  country: string;
  lat: number;
  lng: number;
  region: 'middle_east' | 'north_africa' | 'europe' | 'global';
}

export interface GeoValidationResult {
  hasLocationMention: boolean;
  detectedLocations: GeoLocation[];
  geographicScope: 'hyper_local' | 'national' | 'regional' | 'global';
  authoritativeBodiesAr: string[];
  authoritativeBodiesEn: string[];
  geospatialAdviceAr: string;
  geospatialAdviceEn: string;
}

const KNOWN_REGIONS: Record<string, GeoLocation> = {
  'الرياض': { nameAr: 'الرياض', nameEn: 'Riyadh', country: 'SA', lat: 24.7136, lng: 46.6753, region: 'middle_east' },
  'جدة': { nameAr: 'جدة', nameEn: 'Jeddah', country: 'SA', lat: 21.5433, lng: 39.1728, region: 'middle_east' },
  'دبي': { nameAr: 'دبي', nameEn: 'Dubai', country: 'AE', lat: 25.2048, lng: 55.2708, region: 'middle_east' },
  'القاهرة': { nameAr: 'القاهرة', nameEn: 'Cairo', country: 'EG', lat: 30.0444, lng: 31.2357, region: 'north_africa' },
  'عمان': { nameAr: 'عمان', nameEn: 'Amman', country: 'JO', lat: 31.9454, lng: 35.9284, region: 'middle_east' },
  'بغداد': { nameAr: 'بغداد', nameEn: 'Baghdad', country: 'IQ', lat: 33.3152, lng: 44.3661, region: 'middle_east' },
  'بيروت': { nameAr: 'بيروت', nameEn: 'Beirut', country: 'LB', lat: 33.8938, lng: 35.5018, region: 'middle_east' }
};

export function validateGeospatialClaim(claimText: string): GeoValidationResult {
  const detected: GeoLocation[] = [];

  for (const [key, loc] of Object.entries(KNOWN_REGIONS)) {
    if (claimText.includes(key) || claimText.toLowerCase().includes(loc.nameEn.toLowerCase())) {
      detected.push(loc);
    }
  }

  const hasLocation = detected.length > 0;
  const scope = detected.length > 1 ? 'regional' : hasLocation ? 'national' : 'global';

  const bodiesAr: string[] = [];
  const bodiesEn: string[] = [];

  if (hasLocation) {
    bodiesAr.push('المركز الوطني للأرصاد وهيئات الدفاع المدني المعنية');
    bodiesAr.push('المتحدثون الرسميون للوزارات والمحافظات المعنية');
    bodiesEn.push('National Meteorological Services and Civil Defense authorities');
    bodiesEn.push('Official ministerial and municipal regional spokespersons');
  }

  return {
    hasLocationMention: hasLocation,
    detectedLocations: detected,
    geographicScope: scope,
    authoritativeBodiesAr: bodiesAr,
    authoritativeBodiesEn: bodiesEn,
    geospatialAdviceAr: hasLocation
      ? `الادعاء يرتبط بمنطقة جغرافية محددة (${detected.map(d => d.nameAr).join('، ')}). يوصى بالرجوع للبيانات الصادرة عن الجهات المحلية المعنية.`
      : 'لا يرتبط الادعاء بنطاق جغرافي ضيق، يتم التحقق منه عالمياً ومؤسسياً.',
    geospatialAdviceEn: hasLocation
      ? `Claim specifies geographic locale (${detected.map(d => d.nameEn).join(', ')}). Cross-reference with regional authorities.`
      : 'Claim lacks localized boundaries; evaluate against global evidence repositories.'
  };
}
