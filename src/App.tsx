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
  BookmarkCheck,
  Trash2,
  Globe,
  Sparkles,
  Layers,
  BarChart3,
  ListFilter,
  Flame,
  Zap,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  AlertCircle
} from 'lucide-react';

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
  modelUsed?: string;
  architecture?: string;
  verifiedAt: string;
}

export default function App() {
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [activeTab, setActiveTab] = useState<'verifier' | 'batch' | 'history'>('verifier');

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
    'شرب الماء الدافئ مع الليمون يعالج السرطان نهائياً\n' +
    'محطة الفضاء الدولية تدور حول الأرض مرة كل 90 دقيقة\n' +
    'عاجل: إيلون ماسك يشتري شركة أبل بصفقة سرية'
  );
  const [batchResults, setBatchResults] = useState<VerificationResult[]>([]);
  const [isBatchRunning, setIsBatchRunning] = useState(false);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('truthguard_saved_history');
      if (saved) setHistory(JSON.parse(saved));
    } catch (e) {
      console.error(e);
    }
  }, []);

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
            ? 'تعذر قراءة رد الخادم بصيغة JSON. تأكد من إعداد متغيرات البيئة في Vercel.'
            : 'Invalid server response. Please verify Vercel environment variables.'
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
    { ar: 'محطة الفضاء الدولية تدور حول الأرض مرة كل 90 دقيقة', en: 'The ISS orbits Earth once every 90 minutes' },
    { ar: 'عاجل: ناسا تؤكد اصطدام كويكب مدمر بالأرض الشهر القادم', en: 'Breaking: NASA confirms asteroid collision with Earth next month' },
    { ar: 'شرب الماء الدافئ مع الليمون يعالج السرطان نهائياً', en: 'Drinking warm lemon water cures cancer completely' },
    { ar: 'سور الصين العظيم هو المعلم الوحيد المرئي بالعين المجردة من الفضاء', en: 'Great Wall of China is the only human structure visible from space' }
  ];

  const getVerdictBadge = (verdict: string) => {
    switch (verdict?.toLowerCase()) {
      case 'supported':
      case 'true':
        return {
          icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
          bg: 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300',
          dot: 'bg-emerald-400',
          labelAr: 'صحيح ومؤكد',
          labelEn: 'Supported & True'
        };
      case 'mostly_true':
      case 'likely_true':
        return {
          icon: <ShieldCheck className="w-5 h-5 text-teal-400" />,
          bg: 'bg-teal-950/60 border-teal-500/40 text-teal-300',
          dot: 'bg-teal-400',
          labelAr: 'صحيح غالباً',
          labelEn: 'Mostly True'
        };
      case 'misleading':
        return {
          icon: <ShieldAlert className="w-5 h-5 text-amber-400" />,
          bg: 'bg-amber-950/60 border-amber-500/40 text-amber-300',
          dot: 'bg-amber-400',
          labelAr: 'مضلل / ينقصه السياق',
          labelEn: 'Misleading Context'
        };
      case 'false':
        return {
          icon: <ShieldX className="w-5 h-5 text-rose-400" />,
          bg: 'bg-rose-950/60 border-rose-500/40 text-rose-300',
          dot: 'bg-rose-400',
          labelAr: 'زائف تماماً',
          labelEn: 'False & Fabricated'
        };
      default:
        return {
          icon: <HelpCircle className="w-5 h-5 text-slate-400" />,
          bg: 'bg-slate-900 border-slate-700 text-slate-300',
          dot: 'bg-slate-400',
          labelAr: 'غير مؤكد لقلة الأدلة',
          labelEn: 'Unverified / Disputed'
        };
    }
  };

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col ${lang === 'ar' ? 'font-sans' : 'font-sans'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-slate-950/80 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Logo & Platform Info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-400 p-0.5 shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Shield className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-teal-200 bg-clip-text text-transparent">
                  TruthGuard AI
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {lang === 'ar' ? 'حارس الحقيقة' : 'v3.0'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {lang === 'ar' ? 'إعداد وعمل المهندس يونس العفيف' : 'Engineered by Eng. Yunis Al-Afeef'}
              </p>
            </div>
          </div>

          {/* Clean Focused Navigation Tabs */}
          <div className="hidden md:flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('verifier')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'verifier'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>{lang === 'ar' ? 'فاحص الادعاءات الفوري' : 'Instant Claim Verifier'}</span>
            </button>

            <button
              onClick={() => setActiveTab('batch')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'batch'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>{lang === 'ar' ? 'الفحص المجمّع' : 'Batch Verifier'}</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'history'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>{lang === 'ar' ? 'سجل التحقيقات' : 'History'}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-900 text-emerald-400 font-bold border border-slate-800">
                {history.length}
              </span>
            </button>
          </div>

          {/* Right Action: Language Switcher & GitHub repo link */}
          <div className="flex items-center gap-2">
            <a
              href="https://github.com/yunis-alafeef/TruthGuard-AI"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="Open GitHub Repo"
            >
              <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">GitHub</span>
            </a>

            <button
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition flex items-center gap-1.5 border border-slate-700"
            >
              <Globe className="w-3.5 h-3.5 text-teal-400" />
              <span>{lang === 'ar' ? 'English' : 'عربي'}</span>
            </button>
          </div>
        </div>

        {/* Mobile Submenu */}
        <div className="flex md:hidden border-t border-slate-800 px-4 py-2 overflow-x-auto gap-2 bg-slate-950">
          <button
            onClick={() => setActiveTab('verifier')}
            className={`px-3 py-1 rounded text-xs shrink-0 font-medium ${activeTab === 'verifier' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400'}`}
          >
            فاحص الادعاءات
          </button>
          <button
            onClick={() => setActiveTab('batch')}
            className={`px-3 py-1 rounded text-xs shrink-0 font-medium ${activeTab === 'batch' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400'}`}
          >
            الفحص المجمع
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1 rounded text-xs shrink-0 font-medium ${activeTab === 'history' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400'}`}
          >
            السجل ({history.length})
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {/* Error Notice Banner */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-sm flex items-start justify-between gap-3 shadow-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{lang === 'ar' ? 'تنبيه التدقيق' : 'Verification Alert'}</p>
                <p className="text-rose-300 text-xs mt-1 leading-relaxed">{errorMessage}</p>
              </div>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-400 hover:text-white text-xs px-2 py-1 rounded bg-rose-900/40 hover:bg-rose-900/70 transition"
            >
              {lang === 'ar' ? 'إغلاق' : 'Dismiss'}
            </button>
          </div>
        )}

        {/* TAB 1: INSTANT CLAIM VERIFIER */}
        {activeTab === 'verifier' && (
          <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
            {/* Search and Claim Input Section */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>{lang === 'ar' ? 'أدخل الادعاء أو الخبر المشبوه للفحص الفوري:' : 'Enter Claim or Headline to Fact-Check:'}</span>
                </label>
                {inputClaim && (
                  <button
                    onClick={() => setInputClaim('')}
                    className="text-xs text-slate-400 hover:text-rose-400 transition"
                  >
                    {lang === 'ar' ? 'مسح' : 'Clear'}
                  </button>
                )}
              </div>

              <textarea
                value={inputClaim}
                onChange={e => setInputClaim(e.target.value)}
                rows={3}
                placeholder={lang === 'ar' ? 'اكتب أو الصق نص الخبر، التغريدة، أو المنشور المراد التحقق من صدقه هنا...' : 'Paste claim, news post, or headline here...'}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition leading-relaxed"
              />

              {/* Sample Queries */}
              <div className="space-y-1.5">
                <span className="text-xs text-slate-400 block font-medium">
                  {lang === 'ar' ? '💡 نماذج شائعة للاختبار السريع:' : '💡 Sample trending claims:'}
                </span>
                <div className="flex flex-wrap gap-2">
                  {sampleClaims.map((sample, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        const txt = lang === 'ar' ? sample.ar : sample.en;
                        setInputClaim(txt);
                        handleVerify(txt);
                      }}
                      className="px-2.5 py-1.5 rounded-lg text-xs bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-emerald-400 border border-slate-700/60 transition text-start"
                    >
                      {lang === 'ar' ? sample.ar : sample.en}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => handleVerify()}
                  disabled={isVerifying || !inputClaim.trim()}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg ${
                    isVerifying || !inputClaim.trim()
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/20'
                  }`}
                >
                  {isVerifying ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                      <span>{lang === 'ar' ? 'جارٍ الفحص والمطابقة الحية...' : 'Cross-Referencing Evidence...'}</span>
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
                {/* Result Hero Header */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl relative overflow-hidden">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                    <div>
                      <span className="text-xs text-slate-400 uppercase tracking-wider block font-semibold mb-1">
                        {lang === 'ar' ? 'نتيجة التحقق النهائي من الادعاء' : 'Official Verification Verdict'}
                      </span>
                      <h2 className="text-xl md:text-2xl font-bold text-white leading-snug">
                        "{currentResult.claim}"
                      </h2>
                    </div>

                    {/* Verdict Pill Badge */}
                    <div className="shrink-0 flex items-center gap-3">
                      {(() => {
                        const badge = getVerdictBadge(currentResult.verdict);
                        return (
                          <div className={`px-4 py-2 rounded-xl border flex items-center gap-2.5 shadow-sm ${badge.bg}`}>
                            {badge.icon}
                            <div className="text-start">
                              <span className="block text-xs font-bold leading-none">
                                {lang === 'ar' ? currentResult.verdictLabelAr || badge.labelAr : currentResult.verdictLabelEn || badge.labelEn}
                              </span>
                              <span className="text-[10px] opacity-80 mt-0.5 block">
                                {lang === 'ar' ? `ثقة: ${currentResult.confidenceScore}%` : `Confidence: ${currentResult.confidenceScore}%`}
                              </span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Verdict Analytical Summary */}
                  <div className="py-5 space-y-3">
                    <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-emerald-400" />
                      <span>{lang === 'ar' ? 'الخلاصة التحليلية والحقائق المثبتة:' : 'Analytical Synthesis & Verified Facts:'}</span>
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                      {lang === 'ar' ? currentResult.summaryAr : currentResult.summaryEn}
                    </p>
                  </div>

                  {/* Architecture & Grounding Badge */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/60 text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>
                        {lang === 'ar'
                          ? `المحرك: ${currentResult.modelUsed || 'Google Gemini RAG'} عبر مصادر إخبارية حية`
                          : `Engine: ${currentResult.modelUsed || 'Google Gemini RAG'} via live news sources`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const debunkText = `🔍 تقرير التحقق من TruthGuard AI:\nالادعاء: "${currentResult.claim}"\nالنتيجة: ${currentResult.verdictLabelAr}\nنسبة الثقة: ${currentResult.confidenceScore}%\nالملخص: ${currentResult.summaryAr}\nالمصادر: ${currentResult.sources?.map(s => s.domain).slice(0, 3).join(', ')}`;
                          navigator.clipboard.writeText(debunkText);
                          setCopiedDebunk(true);
                          setTimeout(() => setCopiedDebunk(false), 2500);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
                      >
                        {copiedDebunk ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedDebunk ? (lang === 'ar' ? 'تم النسخ!' : 'Copied!') : (lang === 'ar' ? 'نسخ بطاقة التفنيد' : 'Copy Debunk')}</span>
                      </button>

                      <button
                        onClick={() => setShowBadgeModal(true)}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-950/80 border border-emerald-500/30 hover:bg-emerald-900 text-emerald-300 text-xs transition"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>{lang === 'ar' ? 'تضمين الشارة' : 'Embed Badge'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Grid: Sensationalism Meter & Confidence Matrix */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Sensationalism Meter */}
                  <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                        <Flame className={`w-4 h-4 ${currentResult.sensationalism.score > 40 ? 'text-rose-400' : 'text-emerald-400'}`} />
                        <span>{lang === 'ar' ? 'مؤشر الإثارة والاصطياد العاطفي' : 'Sensationalism & Clickbait Index'}</span>
                      </h3>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        currentResult.sensationalism.score > 60
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : currentResult.sensationalism.score > 25
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}>
                        {currentResult.sensationalism.score}%
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800 p-0.5">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ${
                            currentResult.sensationalism.score > 60
                              ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                              : currentResult.sensationalism.score > 25
                              ? 'bg-gradient-to-r from-teal-500 to-amber-500'
                              : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                          }`}
                          style={{ width: `${Math.max(6, currentResult.sensationalism.score)}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-400">
                        {currentResult.sensationalism.score > 50
                          ? (lang === 'ar' ? '⚠️ يحتوي النص على كلمات تهويل أو استدراج عاطفي واصطياد للنقرات.' : '⚠️ Text exhibits heavy clickbait or emotional trigger patterns.')
                          : (lang === 'ar' ? '✅ الصياغة هادئة ومحايدة تخلو من مؤشرات الإثارة المصطنعة.' : '✅ Tone is neutral, factual, and free of manufactured hype.')}
                      </p>
                    </div>

                    {currentResult.sensationalism.triggers?.length > 0 && (
                      <div className="pt-2 border-t border-slate-800/80">
                        <span className="text-[11px] text-slate-500 block mb-1">
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
                  <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-cyan-400" />
                        <span>{lang === 'ar' ? 'مصفوفة الثقة متعددة العوامل' : 'Confidence Factor Breakdown'}</span>
                      </h3>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                        {currentResult.matrix.grade} ({currentResult.matrix.overallScore}%)
                      </span>
                    </div>

                    <div className="space-y-3">
                      {currentResult.matrix.factors.map((factor, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-300 font-medium">
                              {lang === 'ar' ? factor.nameAr : factor.nameEn}
                            </span>
                            <span className="text-slate-400 font-mono">
                              {factor.score}% ({factor.weight}% {lang === 'ar' ? 'وزن' : 'wt'})
                            </span>
                          </div>
                          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800/80">
                            <div
                              className="h-full bg-cyan-500 rounded-full transition-all duration-700"
                              style={{ width: `${factor.score}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Evidence Sources Section */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-emerald-400" />
                      <span>{lang === 'ar' ? 'المصادر والأدلة الإخبارية المسترجعة للفحص:' : 'Cross-Referenced News & Fact-Check Evidence:'}</span>
                    </h3>
                    <span className="text-xs text-slate-400">
                      {currentResult.sources?.length || 0} {lang === 'ar' ? 'مصادر موثوقة' : 'sources'}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {currentResult.sources && currentResult.sources.length > 0 ? (
                      currentResult.sources.map((src, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition space-y-2"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white">
                                {src.publisher || src.domain}
                              </span>
                              {src.isFactChecker && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-950 text-teal-300 border border-teal-800">
                                  {lang === 'ar' ? 'هيئة تحقق معتمدة' : 'Verified Fact-Checker'}
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
                              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 shrink-0"
                            >
                              <span>{lang === 'ar' ? 'زيارة المصدر' : 'Open Link'}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>

                          <p className="text-xs text-slate-300 font-medium">
                            {src.title}
                          </p>

                          {src.snippet && (
                            <p className="text-xs text-slate-400 leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/50">
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
          <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    <span>{lang === 'ar' ? 'أداة الفحص الإخباري المجمّع' : 'Batch News & Claim Verification'}</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    {lang === 'ar'
                      ? 'أدخل عدة ادعاءات (كل ادعاء في سطر منفصل) للتحقق منها جميعاً بنقرة واحدة.'
                      : 'Enter multiple claims (one per line) to verify in batch with live sources.'}
                  </p>
                </div>
                <button
                  onClick={() => handleBatchVerify()}
                  disabled={isBatchRunning || !batchInput.trim()}
                  className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition shadow-lg ${
                    isBatchRunning || !batchInput.trim()
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
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
                rows={6}
                value={batchInput}
                onChange={e => setBatchInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition leading-relaxed"
                placeholder={lang === 'ar' ? 'ضع كل ادعاء في سطر منفصل هنا...' : 'Enter each claim on a separate line...'}
              />
            </div>

            {/* Batch Results Output */}
            {batchResults.length > 0 && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-200">
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
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{lang === 'ar' ? 'تصدير كملف CSV' : 'Export CSV'}</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {batchResults.map((item, idx) => {
                    const badge = getVerdictBadge(item.verdict);
                    return (
                      <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-xs font-bold text-white">"{item.claim}"</p>
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border shrink-0 ${badge.bg}`}>
                            {lang === 'ar' ? item.verdictLabelAr : item.verdictLabelEn}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
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
          <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-xl">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute top-3 right-3" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={e => setSearchFilter(e.target.value)}
                  placeholder={lang === 'ar' ? 'بحث في السجل...' : 'Search history...'}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-10 pl-4 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <select
                  value={verdictFilter}
                  onChange={e => setVerdictFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
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
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
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
                <div className="text-center py-16 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-3">
                  <Bookmark className="w-8 h-8 text-slate-600 mx-auto" />
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
                        className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition shadow-sm space-y-3 cursor-pointer"
                        onClick={() => {
                          setCurrentResult(item);
                          setInputClaim(item.claim);
                          setActiveTab('verifier');
                        }}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <h4 className="text-sm font-bold text-white hover:text-emerald-400 transition">
                            "{item.claim}"
                          </h4>
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border shrink-0 ${badge.bg}`}>
                            {lang === 'ar' ? item.verdictLabelAr : item.verdictLabelEn}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 line-clamp-2">
                          {lang === 'ar' ? item.summaryAr : item.summaryEn}
                        </p>
                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800/80">
                          <span>{new Date(item.verifiedAt).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US')}</span>
                          <span className="text-emerald-400 font-semibold">{lang === 'ar' ? 'إعادة الفحص والعرض ←' : 'Review details →'}</span>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        )}
      </main>

      {/* EMBED BADGE MODAL */}
      {showBadgeModal && currentResult && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Share2 className="w-4 h-4 text-emerald-400" />
              <span>{lang === 'ar' ? 'شارة التحقق التفاعلية' : 'Interactive Fact-Check Badge'}</span>
            </h3>
            <p className="text-xs text-slate-400">
              {lang === 'ar'
                ? 'انسخ كود الشارة التالي والصقه في موقعك أو مدونتك لعرض التقييم المباشر:'
                : 'Copy the code below to embed this real-time fact-check verification badge on your site:'}
            </p>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="relative">
                <input
                  readOnly
                  value={`<a href="https://github.com/yunis-alafeef/TruthGuard-AI"><img src="https://truth-guard-ai-opal.vercel.app/api/badge/${currentResult.verdict}/${currentResult.confidenceScore}" alt="TruthGuard Fact-Check Badge" /></a>`}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-[11px] font-mono text-cyan-300 focus:outline-none"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`<a href="https://github.com/yunis-alafeef/TruthGuard-AI"><img src="https://truth-guard-ai-opal.vercel.app/api/badge/${currentResult.verdict}/${currentResult.confidenceScore}" alt="TruthGuard Fact-Check Badge" /></a>`);
                    setCopiedBadgeCode(true);
                    setTimeout(() => setCopiedBadgeCode(false), 2000);
                  }}
                  className="absolute top-2 left-2 text-[10px] text-slate-300 hover:text-emerald-400 bg-slate-800 px-2 py-1 rounded border border-slate-700 flex items-center gap-1"
                >
                  {copiedBadgeCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedBadgeCode ? (lang === 'ar' ? 'تم النسخ!' : 'Copied!') : (lang === 'ar' ? 'نسخ' : 'Copy')}</span>
                </button>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowBadgeModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              >
                {lang === 'ar' ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/60 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>
            © {new Date().getFullYear()} TruthGuard AI | {lang === 'ar' ? 'إعداد وهندسة: المهندس يونس العفيف' : 'Engineered by Eng. Yunis Al-Afeef'}
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/yunis-alafeef/TruthGuard-AI"
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-emerald-400 transition"
            >
              GitHub Repository
            </a>
            <span>•</span>
            <span className="text-slate-500">Live Multi-Source Search + Gemini AI Reasoning</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
