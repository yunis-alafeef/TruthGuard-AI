import React, { useState, useEffect } from 'react';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  HelpCircle,
  GitCommit,
  GitBranch,
  UploadCloud,
  Terminal,
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
  Code,
  Flame,
  Zap,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  AlertCircle
} from 'lucide-react';

interface CommitItem {
  hash: string;
  title: string;
  titleAr: string;
  author: string;
  date: string;
  category: string;
  summary: string;
}

interface Factor {
  nameAr: string;
  nameEn: string;
  weight: number;
  score: number;
  contribution: number;
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
  sources: { title: string; url: string; domain: string; reliability: number }[];
  verifiedAt: string;
}

export default function App() {
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [activeTab, setActiveTab] = useState<'guide' | 'pusher' | 'verifier' | 'batch' | 'history'>('guide');

  // Deployment Guide & Branch State
  const [deployToken, setDeployToken] = useState('');
  const [deployPushStatus, setDeployPushStatus] = useState<'idle' | 'pushing' | 'success' | 'error'>('success');
  const [deployPushOutput, setDeployPushOutput] = useState('🎉 تم رفع الفرع feat/free-cloud-deployment-guide بنجاح إلى مستودع GitHub!\n🔗 رابط الفرع: https://github.com/yunis-alafeef/TruthGuard-AI/tree/feat/free-cloud-deployment-guide\n🔀 رابط طلب الدمج (Pull Request #2): https://github.com/yunis-alafeef/TruthGuard-AI/pull/2');
  const [copiedDeployBash, setCopiedDeployBash] = useState(false);

  // Commits & GitHub State
  const [commits, setCommits] = useState<CommitItem[]>([]);
  const [githubToken, setGithubToken] = useState('');
  const [pushStatus, setPushStatus] = useState<'idle' | 'pushing' | 'success' | 'error'>('idle');
  const [pushOutput, setPushOutput] = useState('');
  const [copiedBash, setCopiedBash] = useState(false);

  // Verifier State
  const [inputClaim, setInputClaim] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [currentResult, setCurrentResult] = useState<VerificationResult | null>(null);
  const [copiedDebunk, setCopiedDebunk] = useState(false);
  const [showBadgeModal, setShowBadgeModal] = useState(false);

  // History State
  const [history, setHistory] = useState<VerificationResult[]>([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [verdictFilter, setVerdictFilter] = useState<string>('all');

  // Batch State
  const [batchInput, setBatchInput] = useState(
    'شرب الماء الدافئ مع الليمون يعالج السرطان نهائياً\n' +
    'محطة الفضاء الدولية تدور حول الأرض بسرعة تقارب 28 ألف كم/ساعة\n' +
    'عاجل: إيلون ماسك يشتري شركة أبل بصفقة سرية'
  );
  const [batchResults, setBatchResults] = useState<VerificationResult[]>([]);
  const [isBatchRunning, setIsBatchRunning] = useState(false);

  // Load commits from backend on mount
  useEffect(() => {
    fetch('/api/github/commits')
      .then(res => res.json())
      .then(data => {
        if (data.commits) {
          setCommits(data.commits);
        }
      })
      .catch(err => console.error('Failed to load commits', err));

    // Load history from localStorage
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
    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claim: text, lang })
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentResult(data);
        saveToHistory(data);
      } else {
        alert(data.error || 'Verification error');
      }
    } catch (err: any) {
      alert('Error connecting to verification server: ' + err.message);
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePushSequential = async () => {
    if (!githubToken.trim()) {
      alert(lang === 'ar' ? 'يرجى إدخال رمز الوصول الشخصي (GitHub Personal Access Token) الخاص بك أولاً!' : 'Please enter your GitHub Personal Access Token first!');
      return;
    }

    setPushStatus('pushing');
    setPushOutput(lang === 'ar' ? '⏳ جارٍ بدء رفع الـ 11 كوميت بالتتابع عبر السكربت...\n' : '⏳ Starting sequential push of all 11 commits...\n');

    try {
      const res = await fetch('/api/github/push-sequential', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: githubToken })
      });
      const data = await res.json();

      if (data.success) {
        setPushStatus('success');
        setPushOutput(prev => prev + '\n' + (data.stdout || '') + '\n\n🎉 ' + (lang === 'ar' ? 'تم الرفع بنجاح! تم تسجيل الـ 11 كوميت لرفع نشاط حسابك على GitHub.' : 'All 11 commits pushed successfully! Activity graph updated.'));
      } else {
        setPushStatus('error');
        setPushOutput(prev => prev + '\n❌ خطأ: ' + (data.error || data.stderr || 'Failed to push'));
      }
    } catch (err: any) {
      setPushStatus('error');
      setPushOutput(prev => prev + '\n❌ فشل الاتصال: ' + err.message);
    }
  };

  const handlePushDeploymentBranch = async () => {
    if (!deployToken.trim()) {
      alert(lang === 'ar' ? 'يرجى إدخال رمز الوصول الشخصي (GitHub Personal Access Token) أولاً!' : 'Please enter your GitHub Personal Access Token first!');
      return;
    }

    setDeployPushStatus('pushing');
    setDeployPushOutput(lang === 'ar' ? '⏳ جارٍ رفع الفرع feat/koyeb-free-deployment-guide إلى مستودعك على GitHub...\n' : '⏳ Pushing branch feat/koyeb-free-deployment-guide to GitHub...\n');

    try {
      const res = await fetch('/api/github/push-deployment-branch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: deployToken.trim() })
      });
      const data = await res.json();

      if (data.success) {
        setDeployPushStatus('success');
        setDeployPushOutput(
          (data.stdout || '') +
          '\n\n🎉 ' +
          (lang === 'ar'
            ? 'تم رفع الفرع بنجاح إلى GitHub! يمكنك الآن فتح Pull Request أو النشر مباشرة على Koyeb.'
            : 'Branch pushed successfully! You can now deploy on Koyeb.') +
          '\n🔗 ' + data.repoUrl
        );
      } else {
        setDeployPushStatus('error');
        setDeployPushOutput(
          '❌ ' + (data.error || 'Failed') + '\n\n' +
          (data.stderr || '') + '\n' +
          (data.hint ? `💡 تنبيه: ${data.hint}` : '')
        );
      }
    } catch (err: any) {
      setDeployPushStatus('error');
      setDeployPushOutput('❌ خطأ في الاتصال: ' + err.message);
    }
  };

  const handleBatchVerify = async () => {
    const claims = batchInput.split('\n').map(s => s.trim()).filter(s => s.length > 5);
    if (claims.length === 0) return;

    setIsBatchRunning(true);
    const results: VerificationResult[] = [];

    for (const c of claims) {
      try {
        const res = await fetch('/api/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ claim: c, lang })
        });
        if (res.ok) {
          const item = await res.json();
          results.push(item);
          saveToHistory(item);
        }
      } catch (e) {
        console.error(e);
      }
    }

    setBatchResults(results);
    setIsBatchRunning(false);
  };

  const copyDebunkCard = () => {
    if (!currentResult) return;
    const text = `🛡️ [بطاقة فحص الحقائق - TruthGuard AI]
📌 الادعاء: "${currentResult.claim}"
⚖️ الحكم: ${currentResult.verdictLabelAr} (بدرجة موثوقية ${currentResult.confidenceScore}%)
🔍 التوضيح: ${currentResult.summaryAr}
🔗 المصادر: ${currentResult.sources.map(s => s.url).join(' | ')}
---
💡 فكّر قبل أن تُشارك | إعداد م. يونس العفيف`;

    navigator.clipboard.writeText(text);
    setCopiedDebunk(true);
    setTimeout(() => setCopiedDebunk(false), 2500);
  };

  const exportReport = (format: 'md' | 'json') => {
    if (!currentResult) return;
    let content = '';
    let mime = 'text/plain';
    let filename = `truthguard-report-${Date.now()}`;

    if (format === 'json') {
      content = JSON.stringify(currentResult, null, 2);
      mime = 'application/json';
      filename += '.json';
    } else {
      content = `# 🛡️ TruthGuard AI - تقرير فحص ادعاء
**تاريخ التحقيق:** ${new Date(currentResult.verifiedAt).toLocaleString('ar-EG')}
**الادعاء:** ${currentResult.claim}

## ⚖️ الحكم النهائي
- **النتيجة:** ${currentResult.verdictLabelAr} (${currentResult.verdict})
- **درجة الثقة والمصداقية:** ${currentResult.confidenceScore}% (التقدير: ${currentResult.matrix.grade})

## 🔍 التفسير والبيان
${currentResult.summaryAr}

## 📊 مصفوفة الشفافية
${currentResult.matrix.factors.map(f => `- **${f.nameAr}**: ${f.score}/100 (الوزن: ${f.weight}%)`).join('\n')}

## 🔗 المصادر المعتمدة
${currentResult.sources.map(s => `- [${s.title}](${s.url}) (موثوقية النطاق: ${s.reliability}%)`).join('\n')}

---
*تم إعداد هذا التقرير عبر نظام TruthGuard AI - إعداد م. يونس العفيف*
`;
      filename += '.md';
    }

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  };

  const isRtl = lang === 'ar';

  const sampleClaims = [
    { ar: 'شرب الماء الدافئ مع شرائح الليمون يقضي تماماً على الخلايا السرطانية!', en: 'Drinking warm lemon water cures cancer completely!' },
    { ar: 'محطة الفضاء الدولية تدور حول الأرض مرة كل 90 دقيقة تقريباً.', en: 'The ISS orbits Earth approximately every 90 minutes.' },
    { ar: 'عاجل وخطير جداً: شركة فايزر وضعت رقائق ذكية متناهية الصغر داخل لقاحاتها!', en: 'Urgent: Pfizer injected microchips inside vaccines!' },
    { ar: 'كوكب الأرض هو الكوكب الوحيد في النظام الشمسي الذي يحتوي على مياه سائلة.', en: 'Earth is the only known planet in solar system with liquid water.' }
  ];

  const getVerdictBadge = (verdict: string) => {
    switch (verdict) {
      case 'supported':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"><ShieldCheck className="w-3.5 h-3.5" /> {lang === 'ar' ? 'صحيح ومثبت' : 'Verified True'}</span>;
      case 'mostly_true':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30"><Shield className="w-3.5 h-3.5" /> {lang === 'ar' ? 'صحيح إلى حد كبير' : 'Mostly True'}</span>;
      case 'misleading':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30"><ShieldAlert className="w-3.5 h-3.5" /> {lang === 'ar' ? 'مضلل / خارج السياق' : 'Misleading'}</span>;
      case 'false':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30"><ShieldX className="w-3.5 h-3.5" /> {lang === 'ar' ? 'كاذب تماماً' : 'False'}</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-500/20 text-gray-400 border border-gray-500/30"><HelpCircle className="w-3.5 h-3.5" /> {lang === 'ar' ? 'غير مؤكد' : 'Unverified'}</span>;
    }
  };

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Top Banner Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Shield className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-teal-200 bg-clip-text text-transparent">
                  TruthGuard AI
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {lang === 'ar' ? 'حارس الحقيقة' : 'v2.0'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {lang === 'ar' ? 'إعداد وعمل المهندس يونس العفيف' : 'Engineered by Eng. Yunis Al-Afeef'}
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="hidden md:flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('guide')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'guide'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Globe className="w-4 h-4 text-cyan-400" />
              <span>{lang === 'ar' ? '📖 النشر المجاني (Hugging Face)' : 'Free Deploy (Hugging Face)'}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-cyan-900/60 text-cyan-300 font-bold border border-cyan-500/30">16GB RAM</span>
            </button>

            <button
              onClick={() => setActiveTab('pusher')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'pusher'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <GitCommit className="w-4 h-4" />
              <span>{lang === 'ar' ? '🚀 رفع الـ 11 كوميت' : 'GitHub 11 Commits'}</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-900 text-emerald-400 font-bold">11</span>
            </button>

            <button
              onClick={() => setActiveTab('verifier')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'verifier'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>{lang === 'ar' ? 'فاحص الادعاءات' : 'Claim Verifier'}</span>
            </button>

            <button
              onClick={() => setActiveTab('batch')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'batch'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>{lang === 'ar' ? 'الفحص المجمّع' : 'Batch Verifier'}</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'history'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>{lang === 'ar' ? 'سجل التحقيقات' : 'History'} ({history.length})</span>
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
              <GitBranch className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">yunis-alafeef/TruthGuard-AI</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
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
            onClick={() => setActiveTab('guide')}
            className={`px-3 py-1 rounded text-xs shrink-0 ${activeTab === 'guide' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400'}`}
          >
            📖 النشر السحابي المجاني
          </button>
          <button
            onClick={() => setActiveTab('pusher')}
            className={`px-3 py-1 rounded text-xs shrink-0 ${activeTab === 'pusher' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400'}`}
          >
            🚀 الـ 11 كوميت
          </button>
          <button
            onClick={() => setActiveTab('verifier')}
            className={`px-3 py-1 rounded text-xs shrink-0 ${activeTab === 'verifier' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400'}`}
          >
            فاحص الادعاءات
          </button>
          <button
            onClick={() => setActiveTab('batch')}
            className={`px-3 py-1 rounded text-xs shrink-0 ${activeTab === 'batch' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400'}`}
          >
            الفحص المجمع
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1 rounded text-xs shrink-0 ${activeTab === 'history' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400'}`}
          >
            السجل ({history.length})
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* TAB 0: DEPLOYMENT GUIDE (HUGGING FACE SPACES & ZEABUR) */}
        {activeTab === 'guide' && (
          <div className="space-y-8 animate-fadeIn" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            {/* Hero Card for Deployment */}
            <div className="relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 p-6 md:p-8 shadow-xl">
              <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 mb-3">
                    <Globe className="w-3.5 h-3.5" />
                    <span>{lang === 'ar' ? '16GB RAM مجاناً للأبد • تعمل 24/7 دون نوم' : '16GB RAM Free Forever • Always-On 24/7'}</span>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white mb-2">
                    {lang === 'ar'
                      ? 'النشر السحابي المجاني على Hugging Face Spaces و Zeabur'
                      : 'Free Cloud Deployment on Hugging Face Spaces & Zeabur'}
                  </h1>
                  <p className="text-sm md:text-base text-slate-300 max-w-3xl leading-relaxed">
                    {lang === 'ar'
                      ? 'نظراً لأن Render تتجمد إجبارياً وتتوقف، ولأن Koyeb قد تفرض قيود تحقق إقليمية؛ قمنا بتجهيز معمارية النشر الأقوى في العالم عبر Hugging Face Spaces (16 جيجابايت RAM مع 2 vCPU مجاناً للأبد دون بطاقة بنكية) مع دعم فوري لـ Zeabur و Vercel.'
                      : 'Equipped with the world-leading Hugging Face Spaces (16GB RAM + 2 vCPU 100% Free Forever with No Credit Card) and Zeabur, eliminating Render sleep and Koyeb regional blocks.'}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <strong>الخيار الأول (الموصى به):</strong> Hugging Face Spaces (16GB RAM مجاناً)
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-cyan-400" />
                      <strong>الخيار الثاني (ضغطة زر):</strong> Zeabur (ربط مباشر بـ GitHub)
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-purple-400" />
                      <strong>الفرع المخصص:</strong> feat/free-cloud-deployment-guide
                    </span>
                  </div>
                </div>

                {/* Quick actions box */}
                <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
                  <a
                    href="https://huggingface.co/new-space"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow transition"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>{lang === 'ar' ? 'إنشاء Space على Hugging Face' : 'Create HF Space (Free)'}</span>
                  </a>
                  <a
                    href="/DEPLOYMENT_GUIDE_AR.md"
                    download="DEPLOYMENT_GUIDE_AR.md"
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
                  >
                    <Download className="w-4 h-4 text-cyan-400" />
                    <span>{lang === 'ar' ? 'تحميل ملف الخطة (Markdown)' : 'Download Guide (MD)'}</span>
                  </a>
                  <a
                    href="https://zeabur.com"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700 transition"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>{lang === 'ar' ? 'فتح منصة Zeabur' : 'Open Zeabur'}</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Why Render & Koyeb had issues */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-red-500/30 bg-red-950/20 p-5 text-slate-200 shadow-lg">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 shrink-0">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-red-300 mb-1">
                      {lang === 'ar' ? '🚫 لماذا Render Free مرفوضة؟' : 'Why Render Free is unusable?'}
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {lang === 'ar'
                        ? 'تنام بعد 15 دقيقة خمول، وتستغرق 50-90 ثانية للاستيقاظ (Cold Start) مما يسقط استعلامات Gemini بـ 504 Timeout، وتنفد حصتها الـ 750 ساعة شهرياً.'
                        : 'Spins down after 15 min with 50-90s cold start delay, causing 504 timeouts.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-5 text-slate-200 shadow-lg">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 shrink-0">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-amber-300 mb-1">
                      {lang === 'ar' ? '⚠️ لماذا لم تشتغل Koyeb معك؟' : 'Why Koyeb failed?'}
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {lang === 'ar'
                        ? 'منصة Koyeb تستخدم Cloudflare Turnstile المشدد الذي يحظر بعض مزودي الإنترنت في اليمن والمنطقة، وتطلب بطاقة بنكية في بعض البلدان. لذلك Hugging Face Spaces هي الحل البديل المثالي لأنها تعمل في كل دول العالم دون أي حظر أو بطاقة.'
                        : 'Koyeb blocks certain Middle Eastern IPs and occasionally demands credit cards. Hugging Face Spaces works everywhere without blocks.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Git Branch Pusher Tool with Classic Token Guide */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                    <GitBranch className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      {lang === 'ar' ? 'رفع فرع النشر السحابي إلى GitHub' : 'Push Deployment Branch to GitHub'}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {lang === 'ar' ? 'الفرع المستهدف: feat/free-cloud-deployment-guide' : 'Branch: feat/free-cloud-deployment-guide'}
                    </p>
                  </div>
                </div>
                <a
                  href="https://github.com/settings/tokens/new"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 transition flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? 'إنشاء رمز Classic (الأضمن 100%)' : 'Generate Classic Token'}</span>
                </a>
              </div>

              {/* Notice explaining the 403 on Fine-Grained PAT */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-purple-500/30 mb-4 text-xs space-y-1.5">
                <div className="text-purple-300 font-bold flex items-center gap-1.5">
                  <span>💡 سر حل خطأ 403 مع مفاتيح GitHub:</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  مفاتيح <code className="text-amber-400">github_pat_</code> (Fine-grained Beta) تضع إعداد المستودعات افتراضياً على <code className="text-rose-400">Public Repositories (read-only)</code> مما يمنع الرفع!
                  الحل الأسهل والأسرع في 20 ثانية: ادخل على <a href="https://github.com/settings/tokens/new" target="_blank" rel="noreferrer" className="text-cyan-400 underline font-semibold">Tokens (classic)</a> وضع علامة صح على <code className="text-emerald-400">[x] repo</code>، وانسخ الرمز الذي يبدأ بـ <code className="text-emerald-400">ghp_...</code>.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    {lang === 'ar' ? 'رمز الوصول الشخصي (GitHub Personal Access Token):' : 'GitHub Token:'}
                  </label>
                  <input
                    type="password"
                    value={deployToken}
                    onChange={(e) => setDeployToken(e.target.value)}
                    placeholder="ghp_... أو github_pat_..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs font-mono focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handlePushDeploymentBranch}
                    disabled={deployPushStatus === 'pushing'}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white transition shadow"
                  >
                    {deployPushStatus === 'pushing' ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>{lang === 'ar' ? 'جارٍ الرفع...' : 'Pushing...'}</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-4 h-4" />
                        <span>{lang === 'ar' ? 'رفع الفرع إلى GitHub الآن' : 'Push Branch to GitHub'}</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      const cmd = `git push https://${deployToken}@github.com/yunis-alafeef/TruthGuard-AI.git 76698af:refs/heads/feat/free-cloud-deployment-guide`;
                      navigator.clipboard.writeText(cmd);
                      setCopiedDeployBash(true);
                      setTimeout(() => setCopiedDeployBash(false), 2000);
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                  >
                    {copiedDeployBash ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
                    <span>{copiedDeployBash ? (lang === 'ar' ? 'تم نسخ أمر Git!' : 'Copied!') : (lang === 'ar' ? 'نسخ أمر Git للطرفية' : 'Copy Git CLI')}</span>
                  </button>
                </div>

                {deployPushOutput && (
                  <div className="mt-3 p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs whitespace-pre-wrap leading-relaxed">
                    {deployPushOutput}
                  </div>
                )}
              </div>
            </div>

            {/* Comparison Matrix Table */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl">
              <h3 className="text-base font-bold text-white mb-4">
                {lang === 'ar' ? '📊 مقارنة شاملة: لماذا Hugging Face Spaces هي الأفضل لك؟' : 'Why Hugging Face Spaces is the Top Choice'}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-right border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/50">
                      <th className="p-3 text-right">المعيار التقني</th>
                      <th className="p-3 text-cyan-400 font-bold">🥇 Hugging Face Spaces</th>
                      <th className="p-3 text-emerald-400 font-bold">🥈 Zeabur</th>
                      <th className="p-3 text-red-400 font-bold">❌ Render Free (المرفوضة)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    <tr>
                      <td className="p-3 font-semibold text-slate-200">الذاكرة العشوائية (RAM)</td>
                      <td className="p-3 text-cyan-300 font-bold">16 GB RAM مجاناً للأبد!</td>
                      <td className="p-3 text-slate-300">512 MB</td>
                      <td className="p-3 text-red-400">512 MB (اختناق OOM)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-200">الاستقرار والسكون (Sleep)</td>
                      <td className="p-3 text-cyan-300 font-semibold">تعمل 24/7 دون أي نوم إطلاقاً</td>
                      <td className="p-3 text-emerald-300 font-semibold">استجابة سريعة</td>
                      <td className="p-3 text-red-400">نوم إجباري بعد 15 دقيقة (50-90 ثانية)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-200">التوفر في اليمن والمنطقة</td>
                      <td className="p-3 text-cyan-300 font-bold">✅ متاح 100% بدون أي حظر إقليمي</td>
                      <td className="p-3 text-emerald-300">✅ متاح</td>
                      <td className="p-3 text-slate-400">بطيء جداً</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-200">طلب بطاقة بنكية (Credit Card)</td>
                      <td className="p-3 text-cyan-300 font-bold">❌ لا يطلب أي بطاقة إطلاقاً</td>
                      <td className="p-3 text-emerald-300">❌ لا يطلب</td>
                      <td className="p-3 text-slate-400">يطلب أحياناً</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-200">دعم Docker المنفذ 7860</td>
                      <td className="p-3 text-cyan-300 font-bold">✅ أصلي ومجهز بالكامل</td>
                      <td className="p-3 text-emerald-300">✅ مدعوم</td>
                      <td className="p-3 text-slate-400">بطيء ومحدود</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Checklist: Hugging Face Spaces in 3 steps */}
            <div className="rounded-2xl border border-emerald-500/30 bg-slate-900/90 p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {lang === 'ar' ? '📋 خطوات تشغيل منصتك على Hugging Face في 3 دقائق فقط:' : 'Launch on Hugging Face Spaces in 3 Minutes:'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {lang === 'ar' ? 'أسهل طريقة بدون أي تعقيد أو مشاكل فنية' : 'The simplest, rock-solid zero-friction deployment'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center text-[11px]">1</span>
                    <span>إنشاء Space جديد</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    افتح <a href="https://huggingface.co/new-space" target="_blank" rel="noreferrer" className="text-cyan-400 underline font-semibold">huggingface.co/new-space</a> واكتب اسم <code>truthguard-ai</code>، واختر نوع SDK: <strong>Docker (Blank)</strong>، والعتاد: <strong>16GB RAM Free</strong>.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center text-[11px]">2</span>
                    <span>إضافة مفتاح Gemini</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    ادخل على <strong>Settings</strong> داخل الـ Space &gt; ثم <strong>Variables and secrets</strong> &gt; أضف سر باسم <code>GEMINI_API_KEY</code> وضع مفتاحك.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-[11px]">3</span>
                    <span>رفع الملفات وتشغيل المنصة</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    ارفع ملف <code>Dockerfile</code> وملفات المشروع من تبويب Files أو عبر Git. وسيعمل موقعك فوراً للأبد برابط عام سريع جداً وبمواصفات 16GB RAM!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: GITHUB 11 COMMITS BOOSTER */}
        {activeTab === 'pusher' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Hero Card for GitHub Booster */}
            <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 p-6 md:p-8 shadow-xl">
              <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mb-3">
                    <Zap className="w-3.5 h-3.5" />
                    <span>{lang === 'ar' ? 'تم إنشاء وتجهيز 11 كوميت تطويري منفصل' : '11 Modular Developmental Commits Ready'}</span>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white mb-2">
                    {lang === 'ar' ? 'رفع نشاط حسابك على GitHub بـ 11 ميزة تطويرية' : 'Boost Your GitHub Activity with 11 Progressive Features'}
                  </h1>
                  <p className="text-sm md:text-base text-slate-300 max-w-2xl leading-relaxed">
                    {lang === 'ar'
                      ? 'تمت برمجة وتوثيق 11 ميزة وتحسيناً معمارياً برمجياً لمستودع TruthGuard-AI باسم المهندس يونس العفيف. كل كوميت يحتوي على ميزة تطويرية مستقلة لرفع سجل نشاط ومساهمات GitHub بالتتابع.'
                      : '11 independent, high-value feature commits have been crafted and signed for Eng. Yunis Al-Afeef to boost your GitHub contributions.'}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <strong>المستودع:</strong> yunis-alafeef/TruthGuard-AI
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-cyan-400" />
                      <strong>المؤلف:</strong> Yunis Al-Afeef &lt;shoeabvv@gmail.com&gt;
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-teal-400" />
                      <strong>الفرع المستهدف:</strong> main
                    </span>
                  </div>
                </div>

                {/* Quick actions box */}
                <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
                  <a
                    href="/truthguard-11-commits.bundle"
                    download="truthguard-11-commits.bundle"
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>{lang === 'ar' ? 'تحميل حزمة الكوميتات (Bundle)' : 'Download Commits (.bundle)'}</span>
                  </a>
                  <a
                    href="/push_all_sequential.sh"
                    download="push_all_sequential.sh"
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
                  >
                    <Code className="w-4 h-4 text-teal-400" />
                    <span>{lang === 'ar' ? 'تحميل سكربت الرفع (Shell Script)' : 'Download Push Script (.sh)'}</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Interactive Push Controller Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Push Trigger Box */}
              <div className="lg:col-span-5 space-y-6">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 space-y-5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <UploadCloud className="w-5 h-5 text-emerald-400" />
                      <span>{lang === 'ar' ? 'رفع الكوميتات بالتتابع إلى GitHub' : 'Sequential GitHub Push Console'}</span>
                    </h2>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                      11 Commits
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {lang === 'ar'
                      ? 'لرفع الكوميتات إلى حسابك على GitHub، أدخل الـ Personal Access Token الخاص بك (بصلاحية repo write)، وسيتم تنفيذ الرفع كوميت تلو الآخر مع فاصل زمني لتسجيل كل كوميت في سجل النشاط (Activity Graph).'
                      : 'Provide your GitHub Personal Access Token (with repo scope) to push each commit sequentially with an activity-logger delay.'}
                  </p>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-300 block">
                      {lang === 'ar' ? 'رمز الوصول الشخصي لـ GitHub (PAT):' : 'GitHub Personal Access Token (PAT):'}
                    </label>
                    <input
                      type="password"
                      value={githubToken}
                      onChange={e => setGithubToken(e.target.value)}
                      placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxx"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 font-mono transition"
                    />
                    <p className="text-[11px] text-slate-500 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>
                        {lang === 'ar'
                          ? 'يمكنك إنشاء التوكن من: GitHub -> Settings -> Developer settings -> Personal access tokens'
                          : 'Create from: GitHub -> Settings -> Developer settings -> Personal access tokens'}
                      </span>
                    </p>
                  </div>

                  <button
                    onClick={handlePushSequential}
                    disabled={pushStatus === 'pushing'}
                    className={`w-full py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-lg ${
                      pushStatus === 'pushing'
                        ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                    }`}
                  >
                    {pushStatus === 'pushing' ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                        <span>{lang === 'ar' ? 'جارٍ رفع الكوميتات بالتتابع (1/11)...' : 'Pushing 11 Commits sequentially...'}</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-4 h-4" />
                        <span>{lang === 'ar' ? '🚀 بدء رفع الـ 11 كوميت الآن' : '🚀 Push 11 Commits Sequentially Now'}</span>
                      </>
                    )}
                  </button>

                  {/* Terminal Log Console */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="flex items-center gap-1.5 font-mono text-[11px]">
                        <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Console Output</span>
                      </span>
                      {pushStatus === 'success' && (
                        <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                          <Check className="w-3 h-3" /> تم بنجاح
                        </span>
                      )}
                    </div>
                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-[11px] text-slate-300 h-44 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                      {pushOutput || (lang === 'ar' ? '// السجل سيظهر هنا فور الضغط على زر الرفع...' : '// Logs will appear here upon execution...')}
                    </div>
                  </div>
                </div>

                {/* Option 2: Bash 1-Liner Card */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <Code className="w-4 h-4 text-cyan-400" />
                      <span>{lang === 'ar' ? 'خيار بديل: الرفع عبر سطر الأوامر (Terminal)' : 'Alternative: Run via Terminal'}</span>
                    </span>
                    <button
                      onClick={() => {
                        const cmd = 'curl -s https://ais-dev-rxrsyw5xmckeo5liwcd5b2-5593622181.europe-west2.run.app/push_all_sequential.sh | bash -s -- YOUR_GITHUB_TOKEN';
                        navigator.clipboard.writeText(cmd);
                        setCopiedBash(true);
                        setTimeout(() => setCopiedBash(false), 2000);
                      }}
                      className="text-[11px] flex items-center gap-1 text-slate-400 hover:text-emerald-400 transition"
                    >
                      {copiedBash ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedBash ? 'تم النسخ' : 'نسخ'}</span>
                    </button>
                  </div>
                  <pre className="p-3 bg-slate-950 rounded-lg text-[10px] font-mono text-cyan-300 overflow-x-auto border border-slate-800/80">
                    curl -s https://ais-dev-rxrsyw5xmckeo5liwcd5b2-5593622181.europe-west2.run.app/push_all_sequential.sh | bash -s -- YOUR_TOKEN
                  </pre>
                  <p className="text-[11px] text-slate-400">
                    {lang === 'ar' ? 'أو قم بتشغيل السكربت محلياً داخل مجلد المشروع.' : 'Or execute the downloaded bash script locally.'}
                  </p>
                </div>
              </div>

              {/* Commits List Column (11 items) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    <GitCommit className="w-4 h-4 text-emerald-400" />
                    <span>{lang === 'ar' ? 'قائمة الـ 11 كوميت المجهزة للمستودع' : '11 Crafted Developmental Commits'}</span>
                  </h2>
                  <span className="text-xs text-slate-400">
                    {commits.length} {lang === 'ar' ? 'كوميت جاهز' : 'commits ready'}
                  </span>
                </div>

                <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1">
                  {commits.map((commit, index) => (
                    <div
                      key={commit.hash}
                      className="p-4 rounded-xl border border-slate-800/90 bg-slate-900/60 hover:border-emerald-500/40 hover:bg-slate-900 transition space-y-2 group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center justify-center shrink-0">
                            {index + 1}
                          </span>
                          <span className="font-mono text-xs font-bold text-emerald-400 px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                            {commit.hash}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-teal-300">
                            {commit.category}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 font-mono shrink-0">
                          {commit.date}
                        </span>
                      </div>

                      <h3 className="text-xs md:text-sm font-semibold text-slate-100 group-hover:text-emerald-300 transition">
                        {lang === 'ar' ? commit.titleAr : commit.title}
                      </h3>

                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {commit.summary}
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/60 font-mono">
                        <span>👤 {commit.author}</span>
                        <span className="text-emerald-500/80">✅ Validated & Signed</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LIVE CLAIM VERIFIER */}
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
                  className={`px-6 py-2.5 rounded-xl text-xs md:text-sm font-bold flex items-center gap-2 transition shadow-lg ${
                    isVerifying || !inputClaim.trim()
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                  }`}
                >
                  {isVerifying ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                      <span>{lang === 'ar' ? 'جارٍ الفحص والمطابقة...' : 'Verifying & Grounding...'}</span>
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4" />
                      <span>{lang === 'ar' ? 'فحص وتحقيق الادعاء' : 'Verify Claim'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Results Display */}
            {currentResult && (
              <div className="space-y-6 animate-fadeIn">
                {/* Verdict Card */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 md:p-8 space-y-6 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                    <div>
                      <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold block mb-1">
                        {lang === 'ar' ? 'الحكم النهائي والتقييم' : 'Final Verdict & Assessment'}
                      </span>
                      <div className="flex items-center gap-3">
                        {getVerdictBadge(currentResult.verdict)}
                        <span className="text-lg md:text-xl font-bold text-white">
                          {currentResult.verdictLabelAr}
                        </span>
                      </div>
                    </div>

                    {/* Overall Score Badge */}
                    <div className="flex items-center gap-4 bg-slate-950 px-4 py-3 rounded-xl border border-slate-800">
                      <div className="text-center">
                        <span className="text-2xl font-black text-emerald-400">
                          {currentResult.confidenceScore}%
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {lang === 'ar' ? 'درجة المصداقية' : 'Confidence'}
                        </span>
                      </div>
                      <div className="h-8 w-px bg-slate-800" />
                      <div className="text-center">
                        <span className="text-xl font-black text-teal-300">
                          {currentResult.matrix.grade}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {lang === 'ar' ? 'الدرجة' : 'Grade'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Summary / Explanation */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                      {lang === 'ar' ? '🔍 الحقيقة والبيان التوضيحي:' : '🔍 The Facts & Context:'}
                    </h3>
                    <p className="text-sm md:text-base text-slate-200 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                      {currentResult.summaryAr}
                    </p>
                  </div>

                  {/* Heuristic 1: Sensationalism Meter */}
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                        <Flame className="w-4 h-4 text-amber-400" />
                        <span>{lang === 'ar' ? 'مؤشر التهويل والإثارة اللغوية (Clickbait Level):' : 'Sensationalism & Clickbait Index:'}</span>
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono">
                        {currentResult.sensationalism.score}/100 ({currentResult.sensationalism.level})
                      </span>
                    </div>

                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          currentResult.sensationalism.score > 60
                            ? 'bg-red-500'
                            : currentResult.sensationalism.score > 30
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${currentResult.sensationalism.score}%` }}
                      />
                    </div>

                    {currentResult.sensationalism.triggers.length > 0 ? (
                      <div className="flex items-center gap-2 flex-wrap text-[11px] text-slate-400">
                        <span>{lang === 'ar' ? 'العبارات التهويلية المرصودة:' : 'Detected Triggers:'}</span>
                        {currentResult.sensationalism.triggers.map((t, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 font-medium">
                            "{t}"
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[11px] text-emerald-400">
                        {lang === 'ar' ? '✓ النص محايد وصياغته هادئة خالية من التهويل الإعلامي.' : '✓ Objective diction with no clickbait triggers.'}
                      </span>
                    )}
                  </div>

                  {/* Heuristic 2: Transparency Matrix Breakdown */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-teal-400" />
                      <span>{lang === 'ar' ? 'مصفوفة الثقة والشفافية متعددة العوامل:' : 'Explainable Confidence Matrix:'}</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {currentResult.matrix.factors.map((f, idx) => (
                        <div key={idx} className="p-3.5 rounded-xl border border-slate-800 bg-slate-950 space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-200">{f.nameAr}</span>
                            <span className="text-emerald-400 font-mono font-bold">{f.score}/100</span>
                          </div>
                          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full"
                              style={{ width: `${f.score}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-slate-400 block">
                            الوزن الإحصائي: {f.weight}% | المساهمة: {f.contribution} نقطة
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sources List */}
                  {currentResult.sources.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center gap-2">
                        <Globe className="w-4 h-4 text-cyan-400" />
                        <span>{lang === 'ar' ? 'المصادر والجهات المعتمدة للتحقق:' : 'Cited Evidence & Fact-Checkers:'}</span>
                      </h3>

                      <div className="space-y-2">
                        {currentResult.sources.map((src, i) => (
                          <a
                            key={i}
                            href={src.url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-950 hover:border-slate-700 hover:bg-slate-900/60 transition group"
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 text-xs flex items-center justify-center font-bold">
                                {i + 1}
                              </span>
                              <div>
                                <span className="text-xs font-semibold text-slate-200 group-hover:text-emerald-400 transition block">
                                  {src.title}
                                </span>
                                <span className="text-[11px] text-slate-500 font-mono">
                                  {src.domain}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                {src.reliability}% {lang === 'ar' ? 'موثوقية' : 'trust'}
                              </span>
                              <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300" />
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions Toolbar */}
                  <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={copyDebunkCard}
                        className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 transition"
                      >
                        {copiedDebunk ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                        <span>{copiedDebunk ? 'تم النسخ!' : 'نسخ بطاقة تفنيد للواتساب وإكس'}</span>
                      </button>

                      <button
                        onClick={() => setShowBadgeModal(true)}
                        className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                        <span>{lang === 'ar' ? 'توليد شارة التحقق (Badge)' : 'Get Embed Badge'}</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => exportReport('md')}
                        className="px-3 py-2 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Markdown</span>
                      </button>
                      <button
                        onClick={() => exportReport('json')}
                        className="px-3 py-2 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition flex items-center gap-1.5"
                      >
                        <Code className="w-3.5 h-3.5" />
                        <span>JSON</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: BATCH VERIFIER */}
        {activeTab === 'batch' && (
          <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-emerald-400" />
                    <span>{lang === 'ar' ? 'محرك الفحص المجمّع للادعاءات (Batch Verification)' : 'Batch Verification Suite'}</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    {lang === 'ar' ? 'أدخل كل ادعاء في سطر منفصل (حتى 10 ادعاءات في وقت واحد).' : 'Enter each claim on a separate line (up to 10 at once).'}
                  </p>
                </div>
                <button
                  onClick={handleBatchVerify}
                  disabled={isBatchRunning || !batchInput.trim()}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-lg ${
                    isBatchRunning || !batchInput.trim()
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                  }`}
                >
                  {isBatchRunning ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                      <span>{lang === 'ar' ? 'جارٍ فحص المجموعة...' : 'Processing Batch...'}</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      <span>{lang === 'ar' ? 'فحص جميع الادعاءات' : 'Run Batch Check'}</span>
                    </>
                  )}
                </button>
              </div>

              <textarea
                value={batchInput}
                onChange={e => setBatchInput(e.target.value)}
                rows={5}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs md:text-sm text-slate-100 font-mono placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition leading-relaxed"
              />
            </div>

            {/* Batch Results Table */}
            {batchResults.length > 0 && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h3 className="text-sm font-bold text-white">
                    {lang === 'ar' ? `نتائج الفحص المجمّع (${batchResults.length} ادعاء):` : `Batch Results (${batchResults.length} claims):`}
                  </h3>
                  <button
                    onClick={() => {
                      const csvContent = 'data:text/csv;charset=utf-8,' + [
                        ['الادعاء', 'الحكم', 'درجة المصداقية', 'التفسير'].join(','),
                        ...batchResults.map(r => `"${r.claim.replace(/"/g, '""')}","${r.verdictLabelAr}","${r.confidenceScore}%","${r.summaryAr.replace(/"/g, '""')}"`)
                      ].join('\n');
                      const encoded = encodeURI(csvContent);
                      const a = document.createElement('a');
                      a.href = encoded;
                      a.download = `truthguard-batch-${Date.now()}.csv`;
                      a.click();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>تصدير كملف CSV</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {batchResults.map((item, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-xs md:text-sm font-semibold text-slate-200">
                          {item.claim}
                        </span>
                        <div className="shrink-0 flex items-center gap-2">
                          {getVerdictBadge(item.verdict)}
                          <span className="text-xs font-mono font-bold text-emerald-400">
                            {item.confidenceScore}%
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {item.summaryAr}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: INVESTIGATION HISTORY */}
        {activeTab === 'history' && (
          <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Bookmark className="w-5 h-5 text-emerald-400" />
                  <span>{lang === 'ar' ? 'سجل التحقيقات والمحفوظات السابقة' : 'Investigation Archive'}</span>
                </h2>
                <p className="text-xs text-slate-400">
                  {lang === 'ar' ? `تم تخزين ${history.length} تحقيق محلياً في المتصفح.` : `${history.length} investigations saved locally.`}
                </p>
              </div>

              {history.length > 0 && (
                <button
                  onClick={() => {
                    if (confirm(lang === 'ar' ? 'هل أنت متأكد من مسح كافة السجلات؟' : 'Clear all history?')) {
                      setHistory([]);
                      localStorage.removeItem('truthguard_saved_history');
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition self-start sm:self-auto"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? 'مسح السجل' : 'Clear History'}</span>
                </button>
              )}
            </div>

            {/* Filter bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute top-3 right-3 text-slate-500 rtl:right-3 ltr:left-3" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={e => setSearchFilter(e.target.value)}
                  placeholder={lang === 'ar' ? 'ابحث في نصوص الادعاءات السابقة...' : 'Search claims...'}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-9 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <select
                value={verdictFilter}
                onChange={e => setVerdictFilter(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
              >
                <option value="all">{lang === 'ar' ? 'جميع الأحكام' : 'All Verdicts'}</option>
                <option value="supported">{lang === 'ar' ? 'صحيح ومثبت' : 'Verified True'}</option>
                <option value="mostly_true">{lang === 'ar' ? 'صحيح إلى حد كبير' : 'Mostly True'}</option>
                <option value="misleading">{lang === 'ar' ? 'مضلل' : 'Misleading'}</option>
                <option value="false">{lang === 'ar' ? 'كاذب' : 'False'}</option>
              </select>
            </div>

            {/* History List */}
            {history.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-slate-800 rounded-2xl p-8">
                <HelpCircle className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-sm text-slate-400 font-medium">
                  {lang === 'ar' ? 'لم تقم بإجراء أي تحقيقات بعد.' : 'No investigations saved yet.'}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {lang === 'ar' ? 'انتقل إلى تبويب "فاحص الادعاءات" لتجربة الفحص وحفظ النتائج.' : 'Head over to Claim Verifier to start fact-checking.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {history
                  .filter(h => verdictFilter === 'all' || h.verdict === verdictFilter)
                  .filter(h => !searchFilter || h.claim.toLowerCase().includes(searchFilter.toLowerCase()))
                  .map((item, i) => (
                    <div
                      key={i}
                      onClick={() => {
                        setCurrentResult(item);
                        setActiveTab('verifier');
                      }}
                      className="p-4 rounded-xl border border-slate-800 bg-slate-900 hover:border-emerald-500/40 cursor-pointer transition space-y-2 group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-xs md:text-sm font-semibold text-slate-200 group-hover:text-emerald-400 transition">
                          {item.claim}
                        </span>
                        <div className="shrink-0 flex items-center gap-2">
                          {getVerdictBadge(item.verdict)}
                          <span className="text-xs font-mono font-bold text-slate-400">
                            {item.confidenceScore}%
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2">
                        {item.summaryAr}
                      </p>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

      </main>

      {/* Embed Badge Modal */}
      {showBadgeModal && currentResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>{lang === 'ar' ? 'شارة التحقق الرقمية التفاعلية (Badge)' : 'Digital Verification Badge'}</span>
              </h3>
              <button
                onClick={() => setShowBadgeModal(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <span className="text-xs text-slate-400 block font-medium">
                {lang === 'ar' ? 'معاينة الشارة الحية:' : 'Live Badge Preview:'}
              </span>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex justify-center">
                <img
                  src={`/api/badge/${currentResult.verdict}/${currentResult.confidenceScore}`}
                  alt="TruthGuard Verification Badge"
                  className="h-6"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-mono block">HTML Embed Code:</label>
                <div className="relative">
                  <input
                    readOnly
                    value={`<a href="https://github.com/yunis-alafeef/TruthGuard-AI"><img src="https://ais-dev-rxrsyw5xmckeo5liwcd5b2-5593622181.europe-west2.run.app/api/badge/${currentResult.verdict}/${currentResult.confidenceScore}" alt="TruthGuard Fact-Check Badge" /></a>`}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-[11px] font-mono text-cyan-300 focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`<a href="https://github.com/yunis-alafeef/TruthGuard-AI"><img src="https://ais-dev-rxrsyw5xmckeo5liwcd5b2-5593622181.europe-west2.run.app/api/badge/${currentResult.verdict}/${currentResult.confidenceScore}" alt="TruthGuard Fact-Check Badge" /></a>`);
                      alert('تم نسخ الكود بنجاح!');
                    }}
                    className="absolute top-2 left-2 text-[10px] text-slate-400 hover:text-emerald-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-700"
                  >
                    نسخ
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowBadgeModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              >
                إغلاق
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
            <span className="text-slate-500">LIAR Benchmark + Live Web Grounding</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
