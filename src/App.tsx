import React, { useState, useEffect } from 'react';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  HelpCircle,
  Copy,
  Check,
  Share2,
  Download,
  Search,
  Bookmark,
  Trash2,
  Globe,
  Sparkles,
  Layers,
  BarChart3,
  Flame,
  Zap,
  RefreshCw,
  ExternalLink,
  AlertCircle,
  Settings,
  X,
  Clock,
  Radio,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { THEMES, ThemeConfig } from './theme';

interface Factor {
  nameAr: string;
  nameEn: string;
  weight: number;
  score: number;
  contribution: number;
}

interface EvidenceSource {
  title: string;
  url: string;
  domain: string;
  publisher?: string;
  reliability: number;
  isFactChecker?: boolean;
  stance?: 'supports' | 'contradicts' | 'context';
  snippet?: string;
  publishedDate?: string;
  relativeTime?: string;
  isToday?: boolean;
  region?: 'yemen' | 'gulf' | 'iraq' | 'factchecker' | 'major_channel' | 'pan_arab';
  regionLabelAr?: string;
}

interface VerificationResult {
  claim: string;
  verdict: 'supported' | 'mostly_true' | 'unverified' | 'misleading' | 'false';
  verdictLabelAr: string;
  verdictLabelEn: string;
  confidenceScore: number;
  summaryAr: string;
  summaryEn: string;
  sensationalism: {
    score: number;
    level: string;
    triggers: string[];
    hasExclamation: boolean;
  };
  matrix: {
    overallScore: number;
    grade: string;
    factors: Factor[];
  };
  subClaims: { claim: string; verdict: string; status: string }[];
  sources: EvidenceSource[];
  sourcesCount?: number;
  factCheckMatches?: number;
  newsArticlesCount?: number;
  todayArticlesCount?: number;
  modelUsed?: string;
  architecture?: string;
  verifiedAt: string;
}

export default function App() {
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [activeTab, setActiveTab] = useState<'verifier' | 'batch' | 'history'>('verifier');

  // Theme State
  const [themeId, setThemeId] = useState<string>('emerald');
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);

  // Verifier State
  const [inputClaim, setInputClaim] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [currentResult, setCurrentResult] = useState<VerificationResult | null>(null);
  const [copiedDebunk, setCopiedDebunk] = useState(false);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [copiedBadgeCode, setCopiedBadgeCode] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // History State
  const [history, setHistory] = useState<VerificationResult[]>([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [verdictFilter, setVerdictFilter] = useState<string>('all');

  // Batch State
  const [batchInput, setBatchInput] = useState(
    'عاجل: الحوثيون في اليمن يستولون على محافظة عدن\n' +
    'محطة الفضاء الدولية تدور حول الأرض مرة كل 90 دقيقة\n' +
    'شرب الماء الدافئ مع الليمون يعالج السرطان نهائياً'
  );
  const [batchResults, setBatchResults] = useState<VerificationResult[]>([]);
  const [isBatchRunning, setIsBatchRunning] = useState(false);

  // Load theme & history on mount
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('truthguard_theme');
      if (savedTheme && THEMES[savedTheme]) {
        setThemeId(savedTheme);
      }
      const saved = localStorage.getItem('truthguard_saved_history');
      if (saved) setHistory(JSON.parse(saved));
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleSelectTheme = (newThemeId: string) => {
    setThemeId(newThemeId);
    try {
      localStorage.setItem('truthguard_theme', newThemeId);
    } catch (e) {
      console.error(e);
    }
  };

  const currentTheme: ThemeConfig = THEMES[themeId] || THEMES.emerald;

  const saveToHistory = (item: VerificationResult) => {
    const updated = [item, ...history.filter(h => h.claim !== item.claim)];
    setHistory(updated);
    try {
      localStorage.setItem('truthguard_saved_history', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleVerify = async (textToVerify?: string) => {
    const text = (textToVerify || inputClaim).trim();
    if (!text) return;
    setIsVerifying(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claim: text, lang })
      });

      const responseText = await res.text();
      let data: any;
      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error(
          lang === 'ar'
            ? 'تعذر قراءة رد الخادم بصيغة JSON. يرجى إعادة المحاولة.'
            : 'Invalid server response. Please retry.'
        );
      }

      if (res.ok) {
        setCurrentResult(data);
        saveToHistory(data);
      } else {
        setErrorMessage(data.error || data.message || (lang === 'ar' ? 'فشلت عملية التحقق.' : 'Verification failed.'));
      }
    } catch (err: any) {
      setErrorMessage(err.message || (lang === 'ar' ? 'تعذر الاتصال بخادم التدقيق السحابي.' : 'Could not connect to verification server.'));
    } finally {
      setIsVerifying(false);
    }
  };

  const handleBatchVerify = async () => {
    const claims = batchInput.split('\n').map(s => s.trim()).filter(s => s.length > 5);
    if (claims.length === 0) return;
    setIsBatchRunning(true);
    setErrorMessage(null);
    const results: VerificationResult[] = [];

    for (const c of claims) {
      try {
        const res = await fetch('/api/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ claim: c, lang })
        });
        const responseText = await res.text();
        const data = JSON.parse(responseText);
        if (res.ok) {
          results.push(data);
          saveToHistory(data);
        }
      } catch (err) {
        console.error('Batch item failed:', err);
      }
    }

    setBatchResults(results);
    setIsBatchRunning(false);
  };

  const sampleClaims = [
    { ar: 'عاجل: الحوثيون في اليمن يستولون على محافظة عدن', en: 'Breaking: Houthis in Yemen seize control of Aden' },
    { ar: 'محطة الفضاء الدولية تدور حول الأرض مرة كل 90 دقيقة', en: 'The ISS orbits Earth once every 90 minutes' },
    { ar: 'عاجل: إغلاق تام لمطار بغداد الدولي إثر هجوم صاروخي', en: 'Breaking: Total closure of Baghdad Airport after strike' },
    { ar: 'شرب الماء الدافئ مع الليمون يعالج السرطان نهائياً', en: 'Drinking warm lemon water cures cancer completely' }
  ];

  const getVerdictBadge = (verdict: string) => {
    switch (verdict?.toLowerCase()) {
      case 'supported':
      case 'true':
        return {
          icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
          bg: 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300',
          labelAr: 'صحيح ومؤكد',
          labelEn: 'Supported & True'
        };
      case 'mostly_true':
      case 'likely_true':
        return {
          icon: <ShieldCheck className="w-5 h-5 text-teal-400" />,
          bg: 'bg-teal-950/70 border-teal-500/40 text-teal-300',
          labelAr: 'صحيح غالباً',
          labelEn: 'Mostly True'
        };
      case 'misleading':
        return {
          icon: <ShieldAlert className="w-5 h-5 text-amber-400" />,
          bg: 'bg-amber-950/70 border-amber-500/40 text-amber-300',
          labelAr: 'مضلل / ينقصه السياق',
          labelEn: 'Misleading Context'
        };
      case 'false':
        return {
          icon: <ShieldX className="w-5 h-5 text-rose-400" />,
          bg: 'bg-rose-950/70 border-rose-500/40 text-rose-300',
          labelAr: 'زائف تماماً',
          labelEn: 'False & Fabricated'
        };
      default:
        return {
          icon: <HelpCircle className="w-5 h-5 text-slate-400" />,
          bg: 'bg-slate-900 border-slate-700 text-slate-300',
          labelAr: 'غير مؤكد / قيد التطور',
          labelEn: 'Unverified / Developing'
        };
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 flex flex-col font-sans ${currentTheme.pageBg}`}
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* MINIMALIST & SLEEK EXECUTIVE HEADER */}
      <header className={`sticky top-0 z-40 backdrop-blur-md border-b transition-colors duration-300 ${currentTheme.headerBg}`}>
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${currentTheme.logoGradient} p-0.5 shadow-md ${currentTheme.accentGlow}`}>
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Shield className={`w-5 h-5 ${currentTheme.accentText}`} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-lg sm:text-xl font-extrabold tracking-tight ${currentTheme.textPrimary}`}>
                TruthGuard
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${currentTheme.accentBadge}`}>
                v3.2
              </span>
            </div>
          </div>

          {/* Desktop Navigation Tabs (Pills) */}
          <nav className={`hidden md:flex items-center gap-1 p-1 rounded-xl border ${currentTheme.cardBorder} ${currentTheme.cardBg}`}>
            <button
              onClick={() => setActiveTab('verifier')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'verifier'
                  ? `${currentTheme.navActiveBg} ${currentTheme.navActiveText} shadow-sm`
                  : `${currentTheme.textSecondary} hover:${currentTheme.textPrimary} hover:bg-slate-800/40`
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'فاحص الادعاءات' : 'Claim Verifier'}</span>
            </button>

            <button
              onClick={() => setActiveTab('batch')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'batch'
                  ? `${currentTheme.navActiveBg} ${currentTheme.navActiveText} shadow-sm`
                  : `${currentTheme.textSecondary} hover:${currentTheme.textPrimary} hover:bg-slate-800/40`
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'الفحص المجمّع' : 'Batch Verifier'}</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'history'
                  ? `${currentTheme.navActiveBg} ${currentTheme.navActiveText} shadow-sm`
                  : `${currentTheme.textSecondary} hover:${currentTheme.textPrimary} hover:bg-slate-800/40`
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'السجل' : 'History'}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/30 font-bold">
                {history.length}
              </span>
            </button>
          </nav>

          {/* Right Action Buttons: Settings & Language */}
          <div className="flex items-center gap-2">
            {/* Settings Button */}
            <button
              onClick={() => setShowSettingsModal(true)}
              className={`p-2 rounded-xl text-xs font-medium border transition flex items-center gap-1.5 ${currentTheme.cardBorder} hover:border-slate-600 ${currentTheme.textSecondary} hover:${currentTheme.textPrimary}`}
              title={lang === 'ar' ? 'لوحة الإعدادات والثيمات' : 'Settings & Themes'}
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">{lang === 'ar' ? 'الإعدادات' : 'Settings'}</span>
            </button>

            {/* Language Switcher */}
            <button
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              className={`px-2.5 py-2 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 ${currentTheme.cardBorder} hover:border-slate-600 ${currentTheme.textSecondary} hover:${currentTheme.textPrimary}`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'English' : 'عربي'}</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Tabs Bar */}
        <div className={`flex md:hidden border-t px-3 py-2 overflow-x-auto gap-2 scrollbar-none ${currentTheme.cardBorder}`}>
          <button
            onClick={() => setActiveTab('verifier')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs shrink-0 font-bold transition ${
              activeTab === 'verifier'
                ? `${currentTheme.navActiveBg} ${currentTheme.navActiveText}`
                : `${currentTheme.textSecondary}`
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'فاحص الادعاءات' : 'Claim Verifier'}</span>
          </button>
          
          <button
            onClick={() => setActiveTab('batch')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs shrink-0 font-bold transition ${
              activeTab === 'batch'
                ? `${currentTheme.navActiveBg} ${currentTheme.navActiveText}`
                : `${currentTheme.textSecondary}`
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'الفحص المجمّع' : 'Batch Verifier'}</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs shrink-0 font-bold transition ${
              activeTab === 'history'
                ? `${currentTheme.navActiveBg} ${currentTheme.navActiveText}`
                : `${currentTheme.textSecondary}`
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'السجل' : 'History'} ({history.length})</span>
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 sm:py-8">
        
        {/* Error Notice Banner */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-sm flex items-start justify-between gap-3 shadow-lg animate-fadeIn">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">{lang === 'ar' ? 'تنبيه التدقيق' : 'Verification Alert'}</p>
                <p className="text-rose-300 text-xs mt-1 leading-relaxed">{errorMessage}</p>
              </div>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-400 hover:text-white text-xs px-2.5 py-1 rounded-lg bg-rose-900/40 hover:bg-rose-900 transition"
            >
              ✕
            </button>
          </div>
        )}

        {/* TAB 1: CLAIM VERIFIER */}
        {activeTab === 'verifier' && (
          <div className="space-y-6 sm:space-y-8 animate-fadeIn">
            
            {/* Search and Input Card */}
            <div className={`rounded-2xl border p-4 sm:p-6 shadow-xl space-y-4 ${currentTheme.cardBg} ${currentTheme.cardBorder}`}>
              <div className="flex items-center justify-between">
                <label className={`text-sm font-bold flex items-center gap-2 ${currentTheme.textPrimary}`}>
                  <Sparkles className={`w-4 h-4 ${currentTheme.accentText}`} />
                  <span>{lang === 'ar' ? 'أدخل الادعاء أو الخبر للفحص الفوري ومطابقة القنوات:' : 'Enter Claim or Breaking Headline:'}</span>
                </label>
                {inputClaim && (
                  <button
                    onClick={() => setInputClaim('')}
                    className="text-xs text-rose-400 hover:underline transition"
                  >
                    {lang === 'ar' ? 'مسح' : 'Clear'}
                  </button>
                )}
              </div>

              <textarea
                value={inputClaim}
                onChange={e => setInputClaim(e.target.value)}
                rows={3}
                placeholder={lang === 'ar' ? 'اكتب أو الصق نص الخبر، التصريح، أو المنشور هنا للتحقق منه عبر القنوات والوكالات...' : 'Paste claim or breaking headline to verify...'}
                className={`w-full rounded-xl p-4 text-sm sm:text-base placeholder:text-slate-500 focus:outline-none transition leading-relaxed border ${currentTheme.inputBg} ${currentTheme.inputBorder} ${currentTheme.textPrimary}`}
              />

              {/* Sample Queries */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                  <Radio className={`w-3.5 h-3.5 ${currentTheme.accentText}`} />
                  <span>{lang === 'ar' ? '💡 نماذج سريعة للاختبار (أحداث حية وإقليمية):' : '💡 Sample queries:'}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sampleClaims.map((sample, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        const txt = lang === 'ar' ? sample.ar : sample.en;
                        setInputClaim(txt);
                        handleVerify(txt);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs transition border text-start ${currentTheme.cardBorder} bg-black/20 hover:bg-black/40 ${currentTheme.textSecondary} hover:${currentTheme.accentText}`}
                    >
                      {lang === 'ar' ? sample.ar : sample.en}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Action */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => handleVerify()}
                  disabled={isVerifying || !inputClaim.trim()}
                  className={`w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3 rounded-xl text-sm font-bold transition shadow-lg ${
                    isVerifying || !inputClaim.trim()
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : `${currentTheme.accentBtn} ${currentTheme.accentGlow}`
                  }`}
                >
                  {isVerifying ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{lang === 'ar' ? 'جارٍ فحص القنوات ومطابقة الأدلة الحية...' : 'Cross-Referencing Arab Channels...'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>{lang === 'ar' ? 'تحقق الآن من صحة الخبر' : 'Verify Claim Now'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* VERIFICATION REPORT RESULT */}
            {currentResult && (
              <div className="space-y-6 animate-fadeIn">
                
                {/* Result Card Hero */}
                <div className={`rounded-2xl border p-5 sm:p-7 shadow-xl space-y-5 ${currentTheme.cardBg} ${currentTheme.cardBorder}`}>
                  
                  {/* Verdict Row */}
                  <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b ${currentTheme.cardBorder}`}>
                    <div className="space-y-1">
                      <span className="text-xs uppercase tracking-wider block font-bold text-slate-400">
                        {lang === 'ar' ? 'نتيجة التدقيق النهائي' : 'Official Verification Verdict'}
                      </span>
                      <h2 className={`text-lg sm:text-xl font-bold leading-snug ${currentTheme.textPrimary}`}>
                        "{currentResult.claim}"
                      </h2>
                    </div>

                    <div className="shrink-0">
                      {(() => {
                        const badge = getVerdictBadge(currentResult.verdict);
                        return (
                          <div className={`px-4 py-2.5 rounded-xl border flex items-center gap-2.5 shadow-sm ${badge.bg}`}>
                            {badge.icon}
                            <div>
                              <span className="block text-xs font-bold leading-tight">
                                {lang === 'ar' ? currentResult.verdictLabelAr || badge.labelAr : currentResult.verdictLabelEn || badge.labelEn}
                              </span>
                              <span className="text-[10px] opacity-80 mt-0.5 block">
                                {lang === 'ar' ? `دقة الثقة: ${currentResult.confidenceScore}%` : `Confidence: ${currentResult.confidenceScore}%`}
                              </span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Summary Box */}
                  <div className="space-y-2">
                    <h3 className={`text-sm font-bold flex items-center gap-2 ${currentTheme.textPrimary}`}>
                      <Zap className={`w-4 h-4 ${currentTheme.accentText}`} />
                      <span>{lang === 'ar' ? 'الخلاصة التحليلية والحقائق المثبتة:' : 'Analytical Synthesis & Verified Facts:'}</span>
                    </h3>
                    <p className={`text-sm leading-relaxed p-4 rounded-xl border ${currentTheme.inputBg} ${currentTheme.cardBorder} ${currentTheme.textSecondary}`}>
                      {lang === 'ar' ? currentResult.summaryAr : currentResult.summaryEn}
                    </p>
                  </div>

                  {/* Real-time Channels & Share Bar */}
                  <div className={`flex flex-wrap items-center justify-between gap-3 pt-4 border-t ${currentTheme.cardBorder} text-xs text-slate-400`}>
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${currentTheme.matrixBar} animate-pulse`}></span>
                      <span>
                        {lang === 'ar'
                          ? `مطابقة الأخبار: ${currentResult.sourcesCount || 0} مصدر (منها ${currentResult.todayArticlesCount || 0} خبر اليوم)`
                          : `Sources: ${currentResult.sourcesCount || 0} (${currentResult.todayArticlesCount || 0} today)`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const debunkText = `🔍 تقرير TruthGuard AI:\nالادعاء: "${currentResult.claim}"\nالنتيجة: ${currentResult.verdictLabelAr}\nنسبة الثقة: ${currentResult.confidenceScore}%\nالملخص: ${currentResult.summaryAr}\nالمصادر: ${currentResult.sources?.map(s => s.publisher || s.domain).slice(0, 3).join(', ')}`;
                          navigator.clipboard.writeText(debunkText);
                          setCopiedDebunk(true);
                          setTimeout(() => setCopiedDebunk(false), 2500);
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition ${currentTheme.cardBorder} hover:bg-black/30 ${currentTheme.textSecondary}`}
                      >
                        {copiedDebunk ? <Check className={`w-3.5 h-3.5 ${currentTheme.accentText}`} /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedDebunk ? (lang === 'ar' ? 'تم النسخ!' : 'Copied!') : (lang === 'ar' ? 'نسخ بطاقة التفنيد' : 'Copy Debunk')}</span>
                      </button>

                      <button
                        onClick={() => setShowBadgeModal(true)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${currentTheme.accentBadge}`}
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>{lang === 'ar' ? 'تضمين الشارة' : 'Embed Badge'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Grid: Sensationalism Meter & Confidence Matrix */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                  
                  {/* Sensationalism Meter */}
                  <div className={`rounded-2xl border p-5 sm:p-6 space-y-4 ${currentTheme.cardBg} ${currentTheme.cardBorder}`}>
                    <div className="flex items-center justify-between">
                      <h3 className={`text-sm font-bold flex items-center gap-2 ${currentTheme.textPrimary}`}>
                        <Flame className={`w-4 h-4 ${currentResult.sensationalism.score > 40 ? 'text-rose-400' : currentTheme.accentText}`} />
                        <span>{lang === 'ar' ? 'مؤشر الإثارة والاصطياد العاطفي' : 'Sensationalism Index'}</span>
                      </h3>
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        currentResult.sensationalism.score > 55
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : currentResult.sensationalism.score > 25
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}>
                        {currentResult.sensationalism.score}%
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="w-full bg-black/40 h-3 rounded-full overflow-hidden border border-slate-800 p-0.5">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ${
                            currentResult.sensationalism.score > 55
                              ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                              : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                          }`}
                          style={{ width: `${Math.max(6, currentResult.sensationalism.score)}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-400">
                        {currentResult.sensationalism.score > 50
                          ? (lang === 'ar' ? '⚠️ يحتوي النص على كلمات تهويل أو استدراج عاطفي واصطياد للنقرات.' : '⚠️ Text exhibits sensational clickbait patterns.')
                          : (lang === 'ar' ? '✅ الصياغة هادئة ومحايدة تخلو من التهويل المصطنع.' : '✅ Tone is objective and neutral.')}
                      </p>
                    </div>

                    {currentResult.sensationalism.triggers?.length > 0 && (
                      <div className={`pt-2 border-t ${currentTheme.cardBorder}`}>
                        <span className="text-[11px] text-slate-400 block mb-1">
                          {lang === 'ar' ? 'الكلمات المرصودة:' : 'Detected Triggers:'}
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {currentResult.sensationalism.triggers.map((t, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded text-[11px] bg-rose-950/40 text-rose-300 border border-rose-800/50">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Multi-Factor Confidence Matrix */}
                  <div className={`rounded-2xl border p-5 sm:p-6 space-y-4 ${currentTheme.cardBg} ${currentTheme.cardBorder}`}>
                    <div className="flex items-center justify-between">
                      <h3 className={`text-sm font-bold flex items-center gap-2 ${currentTheme.textPrimary}`}>
                        <BarChart3 className={`w-4 h-4 ${currentTheme.accentText}`} />
                        <span>{lang === 'ar' ? 'مصفوفة الثقة متعددة العوامل' : 'Confidence Factor Breakdown'}</span>
                      </h3>
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${currentTheme.accentBadge}`}>
                        {currentResult.matrix.grade} ({currentResult.matrix.overallScore}%)
                      </span>
                    </div>

                    <div className="space-y-3">
                      {currentResult.matrix.factors.map((factor, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className={`font-medium ${currentTheme.textSecondary}`}>
                              {lang === 'ar' ? factor.nameAr : factor.nameEn}
                            </span>
                            <span className="text-slate-400 font-mono">
                              {factor.score}% ({factor.weight}% {lang === 'ar' ? 'وزن' : 'wt'})
                            </span>
                          </div>
                          <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden border border-slate-800/80">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${currentTheme.matrixBar}`}
                              style={{ width: `${factor.score}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Evidence Sources Section with Today Badges & Channels */}
                <div className={`rounded-2xl border p-5 sm:p-6 space-y-4 ${currentTheme.cardBg} ${currentTheme.cardBorder}`}>
                  <div className="flex items-center justify-between">
                    <h3 className={`text-sm font-bold flex items-center gap-2 ${currentTheme.textPrimary}`}>
                      <Radio className={`w-4 h-4 ${currentTheme.accentText}`} />
                      <span>{lang === 'ar' ? 'المصادر والتغطيات الإخبارية المسترجعة للفحص:' : 'Cross-Referenced Live News & Channels:'}</span>
                    </h3>
                    <span className="text-xs text-slate-400">
                      {currentResult.sources?.length || 0} {lang === 'ar' ? 'مصادر موثقة' : 'sources'}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {currentResult.sources && currentResult.sources.length > 0 ? (
                      currentResult.sources.map((src, idx) => (
                        <div
                          key={idx}
                          className={`p-4 rounded-xl border transition space-y-2 ${currentTheme.inputBg} ${currentTheme.cardBorder} hover:border-slate-600`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={`text-xs font-bold ${currentTheme.textPrimary}`}>
                                {src.publisher || src.domain}
                              </span>

                              {src.isToday && (
                                <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                                  <Clock className="w-3 h-3" />
                                  <span>{src.relativeTime || (lang === 'ar' ? 'خبر اليوم' : 'Today')}</span>
                                </span>
                              )}

                              {src.regionLabelAr && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-cyan-300 border border-slate-700">
                                  {src.regionLabelAr}
                                </span>
                              )}

                              {src.isFactChecker && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-950 text-teal-300 border border-teal-800">
                                  {lang === 'ar' ? 'هيئة تحقق معتمدة' : 'Fact-Checker'}
                                </span>
                              )}

                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                src.stance === 'contradicts'
                                  ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                  : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              }`}>
                                {src.stance === 'contradicts'
                                  ? (lang === 'ar' ? 'ينفي الادعاء' : 'Contradicts')
                                  : (lang === 'ar' ? 'يؤكد / يدعم' : 'Supports')}
                              </span>
                            </div>

                            <a
                              href={src.url}
                              target="_blank"
                              rel="noreferrer"
                              className={`text-xs flex items-center gap-1 shrink-0 ${currentTheme.accentText} hover:underline`}
                            >
                              <span>{lang === 'ar' ? 'زيارة المصدر' : 'Open Link'}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>

                          <p className={`text-xs font-medium leading-snug ${currentTheme.textPrimary}`}>
                            {src.title}
                          </p>

                          {src.snippet && (
                            <p className="text-xs text-slate-400 leading-relaxed bg-black/20 p-2.5 rounded-lg border border-slate-800/40">
                              "{src.snippet}"
                            </p>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500 text-center py-4">
                        {lang === 'ar' ? 'لم يتم العثور على مصادر مطابقة كافية.' : 'No matched evidence sources found.'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: BATCH VERIFICATION */}
        {activeTab === 'batch' && (
          <div className="space-y-6 animate-fadeIn">
            <div className={`rounded-2xl border p-5 sm:p-6 shadow-xl space-y-4 ${currentTheme.cardBg} ${currentTheme.cardBorder}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className={`text-base font-bold flex items-center gap-2 ${currentTheme.textPrimary}`}>
                    <Layers className={`w-4 h-4 ${currentTheme.accentText}`} />
                    <span>{lang === 'ar' ? 'أداة الفحص الإخباري المجمّع' : 'Batch News & Claim Verification'}</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    {lang === 'ar'
                      ? 'ضع كل ادعاء في سطر منفصل للتحقق منها جميعاً دفعة واحدة عبر القنوات الإخبارية.'
                      : 'Enter each claim on a new line to verify simultaneously.'}
                  </p>
                </div>

                <button
                  onClick={() => handleBatchVerify()}
                  disabled={isBatchRunning || !batchInput.trim()}
                  className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition shadow-lg ${
                    isBatchRunning || !batchInput.trim()
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : `${currentTheme.accentBtn} ${currentTheme.accentGlow}`
                  }`}
                >
                  {isBatchRunning ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>{lang === 'ar' ? 'جارٍ الفحص...' : 'Processing...'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{lang === 'ar' ? 'بدء الفحص المجمّع' : 'Run Batch Check'}</span>
                    </>
                  )}
                </button>
              </div>

              <textarea
                rows={5}
                value={batchInput}
                onChange={e => setBatchInput(e.target.value)}
                className={`w-full rounded-xl p-4 text-xs font-mono placeholder:text-slate-500 focus:outline-none transition leading-relaxed border ${currentTheme.inputBg} ${currentTheme.inputBorder} ${currentTheme.textPrimary}`}
              />
            </div>

            {/* Batch Results Output */}
            {batchResults.length > 0 && (
              <div className={`rounded-2xl border p-5 sm:p-6 space-y-4 shadow-xl ${currentTheme.cardBg} ${currentTheme.cardBorder}`}>
                <div className="flex items-center justify-between">
                  <h3 className={`text-sm font-bold ${currentTheme.textPrimary}`}>
                    {lang === 'ar' ? `نتائج الفحص المجمّع (${batchResults.length} ادعاء):` : `Batch Results (${batchResults.length} claims):`}
                  </h3>
                  <button
                    onClick={() => {
                      const csvHeader = 'Claim,Verdict,Confidence,Summary\n';
                      const csvRows = batchResults.map(r => `"${r.claim.replace(/"/g, '""')}","${r.verdictLabelAr}","${r.confidenceScore}%","${r.summaryAr.replace(/"/g, '""')}"`).join('\n');
                      const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `truthguard-batch-${Date.now()}.csv`;
                      a.click();
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition ${currentTheme.cardBorder} hover:bg-black/30 ${currentTheme.textSecondary}`}
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{lang === 'ar' ? 'تصدير كملف CSV' : 'Export CSV'}</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {batchResults.map((item, idx) => {
                    const badge = getVerdictBadge(item.verdict);
                    return (
                      <div key={idx} className={`p-4 rounded-xl border space-y-2 ${currentTheme.inputBg} ${currentTheme.cardBorder}`}>
                        <div className="flex items-center justify-between gap-3">
                          <p className={`text-xs font-bold ${currentTheme.textPrimary}`}>"{item.claim}"</p>
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border shrink-0 ${badge.bg}`}>
                            {lang === 'ar' ? item.verdictLabelAr : item.verdictLabelEn}
                          </span>
                        </div>
                        <p className={`text-xs leading-relaxed ${currentTheme.textSecondary}`}>
                          {lang === 'ar' ? item.summaryAr : item.summaryEn}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: AUDIT HISTORY */}
        {activeTab === 'history' && (
          <div className="space-y-6 animate-fadeIn">
            <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl border shadow-xl ${currentTheme.cardBg} ${currentTheme.cardBorder}`}>
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute top-3 right-3" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={e => setSearchFilter(e.target.value)}
                  placeholder={lang === 'ar' ? 'بحث في السجل...' : 'Search history...'}
                  className={`w-full rounded-xl pr-10 pl-4 py-2 text-xs placeholder:text-slate-500 focus:outline-none border ${currentTheme.inputBg} ${currentTheme.inputBorder} ${currentTheme.textPrimary}`}
                />
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <select
                  value={verdictFilter}
                  onChange={e => setVerdictFilter(e.target.value)}
                  className={`rounded-xl px-3 py-2 text-xs border focus:outline-none ${currentTheme.inputBg} ${currentTheme.inputBorder} ${currentTheme.textSecondary}`}
                >
                  <option value="all">{lang === 'ar' ? 'جميع التصنيفات' : 'All Verdicts'}</option>
                  <option value="supported">{lang === 'ar' ? 'صحيح' : 'Supported'}</option>
                  <option value="mostly_true">{lang === 'ar' ? 'صحيح غالباً' : 'Mostly True'}</option>
                  <option value="misleading">{lang === 'ar' ? 'مضلل' : 'Misleading'}</option>
                  <option value="false">{lang === 'ar' ? 'زائف' : 'False'}</option>
                </select>

                {history.length > 0 && (
                  <button
                    onClick={() => {
                      if (confirm(lang === 'ar' ? 'هل أنت متأكد من مسح سجل التحقيقات؟' : 'Are you sure you want to clear audit history?')) {
                        setHistory([]);
                        localStorage.removeItem('truthguard_saved_history');
                      }
                    }}
                    className="p-2 rounded-xl text-rose-400 hover:bg-rose-950/30 transition border border-rose-900/30"
                    title="Clear history"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* History Cards */}
            <div className="space-y-3">
              {history.length === 0 ? (
                <div className={`text-center py-16 rounded-2xl border space-y-3 ${currentTheme.cardBg} ${currentTheme.cardBorder}`}>
                  <Bookmark className="w-8 h-8 text-slate-500 mx-auto" />
                  <p className="text-sm text-slate-400">
                    {lang === 'ar' ? 'لا توجد فحوصات محفوظة حتى الآن.' : 'No audit records in history yet.'}
                  </p>
                </div>
              ) : (
                history
                  .filter(h => {
                    const matchesSearch = h.claim.toLowerCase().includes(searchFilter.toLowerCase()) || h.summaryAr?.toLowerCase().includes(searchFilter.toLowerCase());
                    const matchesVerdict = verdictFilter === 'all' || h.verdict === verdictFilter;
                    return matchesSearch && matchesVerdict;
                  })
                  .map((item, idx) => {
                    const badge = getVerdictBadge(item.verdict);
                    return (
                      <div
                        key={idx}
                        className={`p-5 rounded-2xl border hover:border-slate-600 transition shadow-sm space-y-3 cursor-pointer ${currentTheme.cardBg} ${currentTheme.cardBorder}`}
                        onClick={() => {
                          setCurrentResult(item);
                          setInputClaim(item.claim);
                          setActiveTab('verifier');
                        }}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <h4 className={`text-sm font-bold transition hover:${currentTheme.accentText} ${currentTheme.textPrimary}`}>
                            "{item.claim}"
                          </h4>
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border shrink-0 ${badge.bg}`}>
                            {lang === 'ar' ? item.verdictLabelAr : item.verdictLabelEn}
                          </span>
                        </div>
                        <p className={`text-xs line-clamp-2 ${currentTheme.textSecondary}`}>
                          {lang === 'ar' ? item.summaryAr : item.summaryEn}
                        </p>
                        <div className={`flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t ${currentTheme.cardBorder}`}>
                          <span>{new Date(item.verifiedAt).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US')}</span>
                          <span className={`font-semibold ${currentTheme.accentText}`}>{lang === 'ar' ? 'عرض التفاصيل ←' : 'Review details →'}</span>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        )}
      </main>

      {/* SETTINGS DRAWER / MODAL */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className={`border rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto ${currentTheme.cardBg} ${currentTheme.cardBorder}`}>
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className={`text-base font-bold flex items-center gap-2 ${currentTheme.textPrimary}`}>
                <Sliders className={`w-4 h-4 ${currentTheme.accentText}`} />
                <span>{lang === 'ar' ? 'لوحة إعدادات النظام والمظهر' : 'Settings & Themes'}</span>
              </h3>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Theme Picker Grid */}
            <div className="space-y-3">
              <label className={`text-xs font-bold block ${currentTheme.textPrimary}`}>
                {lang === 'ar' ? '🎨 اختر ثيم المظهر وألوان الموقع:' : '🎨 Select Visual Theme & Palette:'}
              </label>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {Object.values(THEMES).map(t => {
                  const isSelected = t.id === themeId;
                  return (
                    <button
                      key={t.id}
                      onClick={() => handleSelectTheme(t.id)}
                      className={`p-3 rounded-xl border text-start transition flex flex-col justify-between gap-2 ${
                        isSelected
                          ? `border-emerald-500 bg-emerald-500/10 shadow-sm ${t.previewRing}`
                          : 'border-slate-800 bg-black/20 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className="w-5 h-5 rounded-full border border-white/20 shadow-sm"
                          style={{ backgroundColor: t.previewColor }}
                        />
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                      </div>
                      <div>
                        <span className={`text-xs font-bold block ${currentTheme.textPrimary}`}>
                          {lang === 'ar' ? t.nameAr.split(' ')[0] + ' ' + (t.nameAr.split(' ')[1] || '') : t.nameEn.split(' ')[0]}
                        </span>
                        <span className="text-[10px] text-slate-400 block line-clamp-1">
                          {lang === 'ar' ? t.descAr : t.descEn}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Live News Preferences */}
            <div className={`p-4 rounded-xl border space-y-2 ${currentTheme.inputBg} ${currentTheme.cardBorder}`}>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <Radio className={`w-3.5 h-3.5 ${currentTheme.accentText}`} />
                <span>{lang === 'ar' ? 'تغطية القنوات الإخبارية الحية المفعلة:' : 'Active Live Channels Coverage:'}</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {lang === 'ar'
                  ? 'يتم فحص أخبار اليوم الحية عبر: قناة الجزيرة، قناة الحدث، قناة العربية، شبكة المسيرة، سكاي نيوز عربية، RT عربي، والصحافة اليمنية (الأيام، عدن الغد، سبأ) والعراقية (واع، السومرية).'
                  : 'Live channels monitored: Al Jazeera, Al Hadath, Al Arabiya, Al Masirah, Sky News, RT, and local Yemeni & Iraqi presses.'}
              </p>
            </div>

            {/* Language & Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${currentTheme.cardBorder} ${currentTheme.textSecondary}`}
              >
                {lang === 'ar' ? 'تبديل إلى English' : 'Switch to عربي'}
              </button>

              <button
                onClick={() => setShowSettingsModal(false)}
                className={`px-5 py-2 rounded-xl text-xs font-bold shadow ${currentTheme.accentBtn}`}
              >
                {lang === 'ar' ? 'حفظ وإغلاق' : 'Save & Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EMBED BADGE MODAL */}
      {showBadgeModal && currentResult && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className={`border rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 ${currentTheme.cardBg} ${currentTheme.cardBorder}`}>
            <h3 className={`text-base font-bold flex items-center gap-2 ${currentTheme.textPrimary}`}>
              <Share2 className={`w-4 h-4 ${currentTheme.accentText}`} />
              <span>{lang === 'ar' ? 'شارة التحقق التفاعلية' : 'Interactive Fact-Check Badge'}</span>
            </h3>
            <p className="text-xs text-slate-400">
              {lang === 'ar'
                ? 'انسخ كود الشارة التالي والصقه في موقعك أو مدونتك لعرض التقييم المباشر:'
                : 'Copy the code below to embed this real-time fact-check verification badge on your site:'}
            </p>

            <div className={`p-3 rounded-xl border space-y-2 ${currentTheme.inputBg} ${currentTheme.cardBorder}`}>
              <div className="relative">
                <input
                  readOnly
                  value={`<a href="https://github.com/yunis-alafeef/TruthGuard-AI"><img src="https://truth-guard-ai-opal.vercel.app/api/badge/${currentResult.verdict}/${currentResult.confidenceScore}" alt="TruthGuard Fact-Check Badge" /></a>`}
                  className={`w-full rounded-lg p-2.5 text-[11px] font-mono focus:outline-none border ${currentTheme.inputBg} ${currentTheme.cardBorder} text-cyan-300`}
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`<a href="https://github.com/yunis-alafeef/TruthGuard-AI"><img src="https://truth-guard-ai-opal.vercel.app/api/badge/${currentResult.verdict}/${currentResult.confidenceScore}" alt="TruthGuard Fact-Check Badge" /></a>`);
                    setCopiedBadgeCode(true);
                    setTimeout(() => setCopiedBadgeCode(false), 2000);
                  }}
                  className={`absolute top-2 left-2 text-[10px] px-2.5 py-1 rounded border flex items-center gap-1 ${currentTheme.accentBtn}`}
                >
                  {copiedBadgeCode ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedBadgeCode ? (lang === 'ar' ? 'تم النسخ!' : 'Copied!') : (lang === 'ar' ? 'نسخ' : 'Copy')}</span>
                </button>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowBadgeModal(false)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border ${currentTheme.cardBorder} ${currentTheme.textSecondary}`}
              >
                {lang === 'ar' ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MINIMALIST & INFORMATIVE FOOTER (Houses all meta, repo, and developer credits) */}
      <footer className={`border-t py-8 mt-12 text-xs transition-colors duration-300 ${currentTheme.headerBg}`}>
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-start space-y-1">
            <p className={`font-semibold ${currentTheme.textPrimary}`}>
              TruthGuard AI | {lang === 'ar' ? 'إعداد وهندسة: المهندس يونس العفيف' : 'Engineered by Eng. Yunis Al-Afeef'}
            </p>
            <p className="text-[11px] text-slate-500">
              {lang === 'ar'
                ? 'فحص الأخبار ومطابقة التغطيات اليومية (الجزيرة، المسيرة، الحدث، سكاي نيوز) + التدقيق الإقليمي (اليمن، الخليج، العراق)'
                : 'Real-time multi-wire fact-checking across Al Jazeera, Al Masirah, Al Hadath, Sky News & Regional Press'}
            </p>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <a
              href="https://github.com/yunis-alafeef/TruthGuard-AI"
              target="_blank"
              rel="noreferrer"
              className={`flex items-center gap-1 transition hover:${currentTheme.accentText}`}
            >
              <span>GitHub Repository</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span>•</span>
            <span className="text-slate-500">LIAR Benchmark + Live Temporal Grounding</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
