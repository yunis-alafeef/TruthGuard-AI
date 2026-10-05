/**
 * TruthGuard AI - Unified Multi-Theme Visual Design System
 * 6 High-Contrast, Ergonomic, Professional Themes
 * Lead Architect: Yunis Al-Afeef <shoeabvv@gmail.com>
 */

export interface ThemeConfig {
  id: 'emerald' | 'sapphire' | 'amethyst' | 'amber' | 'crimson' | 'light';
  nameAr: string;
  nameEn: string;
  descAr: string;
  descEn: string;
  previewColor: string;
  previewRing: string;
  pageBg: string;
  headerBg: string;
  cardBg: string;
  cardBorder: string;
  inputBg: string;
  inputBorder: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accentBtn: string;
  accentBtnHover: string;
  accentBadge: string;
  accentText: string;
  accentBorder: string;
  accentGlow: string;
  matrixBar: string;
  logoGradient: string;
  navActiveBg: string;
  navActiveText: string;
}

export const THEMES: Record<string, ThemeConfig> = {
  emerald: {
    id: 'emerald',
    nameAr: 'حارس الزمرد (الافتراضي)',
    nameEn: 'Cyber Emerald (Default)',
    descAr: 'المظهر السيبراني الداكن مع تدرجات الزمرد والنيون التيل.',
    descEn: 'Dark cyber theme with neon emerald and teal accents.',
    previewColor: '#10b981',
    previewRing: 'ring-emerald-500',
    pageBg: 'bg-slate-950 text-slate-100',
    headerBg: 'bg-slate-950/90 border-slate-800',
    cardBg: 'bg-slate-900/90',
    cardBorder: 'border-slate-800',
    inputBg: 'bg-slate-950',
    inputBorder: 'border-slate-800 focus:border-emerald-500',
    textPrimary: 'text-white',
    textSecondary: 'text-slate-300',
    textMuted: 'text-slate-500',
    accentBtn: 'bg-emerald-500 text-slate-950 hover:bg-emerald-400',
    accentBtnHover: 'hover:bg-emerald-400',
    accentBadge: 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300',
    accentText: 'text-emerald-400',
    accentBorder: 'border-emerald-500/30',
    accentGlow: 'shadow-emerald-500/20',
    matrixBar: 'bg-emerald-500',
    logoGradient: 'from-emerald-500 via-teal-500 to-cyan-400',
    navActiveBg: 'bg-emerald-500',
    navActiveText: 'text-slate-950 font-bold'
  },
  sapphire: {
    id: 'sapphire',
    nameAr: 'أزرق الليل الفضائي',
    nameEn: 'Midnight Sapphire',
    descAr: 'كحلي ليلي عميق وتوهج أزرق ياقوتي مريح للعين.',
    descEn: 'Deep cosmic navy with electric blue and sapphire neon.',
    previewColor: '#3b82f6',
    previewRing: 'ring-blue-500',
    pageBg: 'bg-[#090e1a] text-slate-100',
    headerBg: 'bg-[#090e1a]/90 border-blue-950/80',
    cardBg: 'bg-[#0f172a]/90',
    cardBorder: 'border-blue-900/40',
    inputBg: 'bg-[#070b14]',
    inputBorder: 'border-blue-900/50 focus:border-blue-500',
    textPrimary: 'text-white',
    textSecondary: 'text-blue-100/90',
    textMuted: 'text-slate-400',
    accentBtn: 'bg-blue-500 text-white hover:bg-blue-400',
    accentBtnHover: 'hover:bg-blue-400',
    accentBadge: 'bg-blue-950/70 border-blue-500/40 text-blue-300',
    accentText: 'text-blue-400',
    accentBorder: 'border-blue-500/30',
    accentGlow: 'shadow-blue-500/20',
    matrixBar: 'bg-blue-500',
    logoGradient: 'from-blue-500 via-cyan-500 to-indigo-400',
    navActiveBg: 'bg-blue-500',
    navActiveText: 'text-white font-bold'
  },
  amethyst: {
    id: 'amethyst',
    nameAr: 'الأرجواني الملكي',
    nameEn: 'Royal Amethyst',
    descAr: 'خلفية سوداء أوبسيديان وألوان أرجوانية ملكية فخمة.',
    descEn: 'Deep obsidian purple with neon amethyst accents.',
    previewColor: '#a855f7',
    previewRing: 'ring-purple-500',
    pageBg: 'bg-[#0d0714] text-slate-100',
    headerBg: 'bg-[#0d0714]/90 border-purple-950/80',
    cardBg: 'bg-[#150c22]/90',
    cardBorder: 'border-purple-900/40',
    inputBg: 'bg-[#09040e]',
    inputBorder: 'border-purple-900/50 focus:border-purple-500',
    textPrimary: 'text-white',
    textSecondary: 'text-purple-100/90',
    textMuted: 'text-purple-300/60',
    accentBtn: 'bg-purple-600 text-white hover:bg-purple-500',
    accentBtnHover: 'hover:bg-purple-500',
    accentBadge: 'bg-purple-950/70 border-purple-500/40 text-purple-300',
    accentText: 'text-purple-400',
    accentBorder: 'border-purple-500/30',
    accentGlow: 'shadow-purple-500/20',
    matrixBar: 'bg-purple-500',
    logoGradient: 'from-purple-500 via-fuchsia-500 to-pink-400',
    navActiveBg: 'bg-purple-600',
    navActiveText: 'text-white font-bold'
  },
  amber: {
    id: 'amber',
    nameAr: 'العنبر الذهبي الفاخر',
    nameEn: 'Noir Amber',
    descAr: 'فخامة الأسود الدافئ مع لمسات العنبر والذهب المركز.',
    descEn: 'Warm noir charcoal with golden amber and bronze accents.',
    previewColor: '#f59e0b',
    previewRing: 'ring-amber-500',
    pageBg: 'bg-[#0e0c08] text-amber-50',
    headerBg: 'bg-[#0e0c08]/90 border-amber-950/80',
    cardBg: 'bg-[#18140c]/90',
    cardBorder: 'border-amber-900/40',
    inputBg: 'bg-[#090805]',
    inputBorder: 'border-amber-900/50 focus:border-amber-500',
    textPrimary: 'text-white',
    textSecondary: 'text-amber-100/90',
    textMuted: 'text-amber-300/60',
    accentBtn: 'bg-amber-500 text-slate-950 hover:bg-amber-400',
    accentBtnHover: 'hover:bg-amber-400',
    accentBadge: 'bg-amber-950/70 border-amber-500/40 text-amber-300',
    accentText: 'text-amber-400',
    accentBorder: 'border-amber-500/30',
    accentGlow: 'shadow-amber-500/20',
    matrixBar: 'bg-amber-500',
    logoGradient: 'from-amber-500 via-orange-500 to-yellow-400',
    navActiveBg: 'bg-amber-500',
    navActiveText: 'text-slate-950 font-bold'
  },
  crimson: {
    id: 'crimson',
    nameAr: 'الياقوت القرمزي',
    nameEn: 'Crimson Cyber',
    descAr: 'تصميم جرافيتي حاد وتوهج قرمزي ناري ذو حضور قوي.',
    descEn: 'Dark graphite with neon crimson ruby and coral glow.',
    previewColor: '#f43f5e',
    previewRing: 'ring-rose-500',
    pageBg: 'bg-[#0f0709] text-rose-50',
    headerBg: 'bg-[#0f0709]/90 border-rose-950/80',
    cardBg: 'bg-[#1a0c10]/90',
    cardBorder: 'border-rose-900/40',
    inputBg: 'bg-[#0a0406]',
    inputBorder: 'border-rose-900/50 focus:border-rose-500',
    textPrimary: 'text-white',
    textSecondary: 'text-rose-100/90',
    textMuted: 'text-rose-300/60',
    accentBtn: 'bg-rose-600 text-white hover:bg-rose-500',
    accentBtnHover: 'hover:bg-rose-500',
    accentBadge: 'bg-rose-950/70 border-rose-500/40 text-rose-300',
    accentText: 'text-rose-400',
    accentBorder: 'border-rose-500/30',
    accentGlow: 'shadow-rose-500/20',
    matrixBar: 'bg-rose-500',
    logoGradient: 'from-rose-500 via-red-500 to-orange-400',
    navActiveBg: 'bg-rose-600',
    navActiveText: 'text-white font-bold'
  },
  light: {
    id: 'light',
    nameAr: 'الوضع الساطع النقي',
    nameEn: 'Executive Light',
    descAr: 'مظهر نهاري نظيف عالي الوضوح والتباين للأعمال.',
    descEn: 'Crisp, high-contrast executive daylight mode.',
    previewColor: '#0ea5e9',
    previewRing: 'ring-slate-400',
    pageBg: 'bg-slate-50 text-slate-900',
    headerBg: 'bg-white/90 border-slate-200 shadow-sm',
    cardBg: 'bg-white',
    cardBorder: 'border-slate-200 shadow-sm',
    inputBg: 'bg-slate-100/70',
    inputBorder: 'border-slate-300 focus:border-emerald-600',
    textPrimary: 'text-slate-900',
    textSecondary: 'text-slate-700',
    textMuted: 'text-slate-500',
    accentBtn: 'bg-slate-900 text-white hover:bg-slate-800',
    accentBtnHover: 'hover:bg-slate-800',
    accentBadge: 'bg-emerald-50 border-emerald-300 text-emerald-800',
    accentText: 'text-emerald-700',
    accentBorder: 'border-slate-300',
    accentGlow: 'shadow-slate-300/50',
    matrixBar: 'bg-emerald-600',
    logoGradient: 'from-slate-900 via-emerald-700 to-teal-600',
    navActiveBg: 'bg-slate-900',
    navActiveText: 'text-white font-bold'
  }
};
