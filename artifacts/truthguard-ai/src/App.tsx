import { useState, type CSSProperties, type FormEvent, type ReactNode } from "react";
import {
  getListVerificationHistoryQueryKey,
  useGetModelMetrics,
  useListVerificationHistory,
  useVerifyClaim,
} from "@workspace/api-client-react";
import type {
  Evidence,
  ModelMetrics,
  VerificationResult,
  VerificationSummary,
} from "@workspace/api-client-react";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import {
  ArrowUpRight,
  BarChart3,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Clock3,
  Copy,
  Download,
  ExternalLink,
  FileSearch,
  FileText,
  History,
  Info,
  Loader2,
  Menu,
  Network,
  Quote,
  Search,
  Share2,
  ShieldCheck,
  Sparkles,
  X,
  XCircle,
} from "lucide-react";
import { Link, Route, Switch, useLocation } from "wouter";
import { exportVerificationAsJson, exportVerificationAsMarkdown } from "./lib/export-report";

const exampleClaims = [
  "تم اختراع شبكة الإنترنت العالمية بواسطة تيم بيرنرز لي.",
  "شرب المحلول المنظّف يعالج الالتهابات الفيروسية.",
  "النظام الغذائي الصحي وحده يضمن ألا يمرض الإنسان أبدًا.",
];

const verdictCopy: Record<string, { label: string; className: string; icon: typeof CheckCircle2 }> = {
  Supported: { label: "مدعوم", className: "is-supported", icon: CheckCircle2 },
  "Likely True": { label: "محتمل الصدق", className: "is-likely", icon: Check },
  Unverified: { label: "غير مُتحقَّق", className: "is-unverified", icon: CircleAlert },
  Misleading: { label: "مضلل", className: "is-misleading", icon: CircleAlert },
  False: { label: "خاطئ", className: "is-false", icon: XCircle },
};

function Logo() {
  return (
    <Link href="/" className="brand-mark" aria-label="TruthGuard AI home">
      <span className="brand-emblem">
        <ShieldCheck size={24} strokeWidth={1.8} />
      </span>
      <span>
        <strong>TruthGuard</strong>
        <small>تحقق ذكي</small>
      </span>
    </Link>
  );
}

function Header() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const links = [
    { href: "/", label: "التحقق" },
    { href: "/history", label: "السجل" },
    { href: "/about", label: "حول" },
  ];
  return (
    <header className="site-header">
      <div className="page-shell header-inner">
        <Logo />
        <button className="mobile-menu" aria-label="فتح القائمة" onClick={() => setOpen((value) => !value)}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
        <nav className={open ? "site-nav is-open" : "site-nav"}>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={location === link.href ? "nav-link is-active" : "nav-link"}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <span className="nav-status"><span className="status-dot" /> النظام جاهز</span>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="page-shell footer-inner">
        <div>
          <Logo />
          <p className="footer-tagline">لا تصدق فقط… تحقق.</p>
        </div>
        <div className="footer-note">
          <span>التحقق بالأدلة أولاً</span>
          <span className="footer-credit">إعداد وعمل المهندس يونس العفيف</span>
        </div>
      </div>
    </footer>
  );
}

function PageFrame({ children }: { children: ReactNode }) {
  return (
    <div className="app-frame">
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
}

function SectionEyebrow({ children }: { children: ReactNode }) {
  return <div className="section-eyebrow"><span className="eyebrow-line" />{children}</div>;
}

function VerdictBadge({ verdict }: { verdict: string }) {
  const config = verdictCopy[verdict] ?? verdictCopy.Unverified;
  const Icon = config.icon;
  return <span className={`verdict-badge ${config.className}`}><Icon size={15} />{config.label}</span>;
}

function EvidenceCard({ item }: { item: Evidence }) {
  const stanceLabel = item.stance === "supports" ? "يدعم الادعاء" : item.stance === "contradicts" ? "يتناقض مع الادعاء" : "سياق";
  return (
    <a className="evidence-card" href={item.url} target="_blank" rel="noreferrer">
      <div className="evidence-topline">
        <span className={`stance-dot stance-${item.stance}`} />
        <span>{stanceLabel}</span>
        <ExternalLink size={14} className="evidence-external" />
      </div>
      <h3>{item.title}</h3>
      <p>{item.snippet}</p>
      <span className="evidence-source">{item.sourceType}</span>
    </a>
  );
}

function ResultPanel({ result }: { result: VerificationResult }) {
  const [showDetails, setShowDetails] = useState(true);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [copied, setCopied] = useState(false);
  const [stanceFilter, setStanceFilter] = useState<"all" | "supports" | "contradicts" | "context">("all");
  const percent = Math.round(result.confidence * 100);
  const modelPercent = Math.round(result.mlSignal.confidence * 100);

  const supportCount = result.evidence.filter((e) => e.stance === "supports").length;
  const contradictCount = result.evidence.filter((e) => e.stance === "contradicts").length;
  const contextCount = result.evidence.filter((e) => e.stance === "context").length;

  const filteredEvidence = result.evidence.filter((item) => {
    if (stanceFilter === "all") return true;
    return item.stance === stanceFilter;
  });

  const handleCopySummary = async () => {
    const summaryText = `🛡️ تقرير TruthGuard للتحقق:
الادعاء: "${result.extractedClaim}"
الحكم: ${verdictCopy[result.verdict]?.label ?? result.verdict} (${percent}% نسبة الثقة)
التوضيح: ${result.explanation}
عدد المصادر: ${result.evidence.length}
تم التحقق عبر TruthGuard AI`;

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(summaryText);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = summaryText;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // fallback
    }
  };

  const handleShare = async () => {
    const summaryText = `🛡️ نتيجة التحقق من TruthGuard: "${result.extractedClaim}" - الحكم: ${verdictCopy[result.verdict]?.label ?? result.verdict} (${percent}%)`;
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({
          title: "TruthGuard AI - تقرير التحقق",
          text: summaryText,
          url: window.location.href,
        });
      } catch {
        // user cancelled
      }
    } else {
      await handleCopySummary();
    }
  };

  return (
    <section className="result-panel reveal-up">
      <div className="result-heading">
        <div>
          <SectionEyebrow>نتيجة التحقق</SectionEyebrow>
          <h2>إليك ما يقوله الدليل.</h2>
        </div>
        <div className="result-actions">
          <VerdictBadge verdict={result.verdict} />
          <button
            type="button"
            className={`action-pill-button ${copied ? "is-copied" : ""}`}
            onClick={handleCopySummary}
            title="نسخ ملخص التقرير إلى الحافظة"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? "تم النسخ!" : "نسخ النتيجة"}</span>
          </button>
          {typeof navigator !== "undefined" && "share" in navigator && (
            <button
              type="button"
              className="action-pill-button"
              onClick={handleShare}
              title="مشاركة النتيجة"
            >
              <Share2 size={14} />
              <span>مشاركة</span>
            </button>
          )}
          <button
            type="button"
            className="action-pill-button"
            onClick={() => exportVerificationAsMarkdown(result, verdictCopy[result.verdict]?.label ?? result.verdict)}
            title="تنزيل التقرير بصيغة Markdown (.md)"
          >
            <FileText size={14} />
            <span>تنزيل MD</span>
          </button>
          <button
            type="button"
            className="action-pill-button"
            onClick={() => exportVerificationAsJson(result)}
            title="تصدير البيانات بصيغة JSON"
          >
            <Download size={14} />
            <span>JSON</span>
          </button>
        </div>
      </div>
      <div className="result-confidence">
        <div className="confidence-ring" style={{ "--confidence": `${percent * 3.6}deg` } as CSSProperties}>
          <div><strong>{percent}%</strong><span>ثقة</span></div>
        </div>
        <div className="confidence-copy">
          <span className="label-caps">الادعاء الرئيسي</span>
          <p className="extracted-claim">“{result.extractedClaim}”</p>
          <p className="result-explanation">{result.explanation}</p>
        </div>
      </div>
      <div className="result-meta-grid">
        <div className="meta-stat"><span>حالة البحث</span><strong><span className="status-dot" />{result.searchStatus}</strong></div>
        <div className="meta-stat"><span>إشارة النموذج</span><strong>{result.mlSignal.label} <em>{modelPercent}%</em></strong></div>
        <div className="meta-stat"><span>تمت المراجعة</span><strong>{new Date(result.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</strong></div>
      </div>

      <div className="transparency-toggle-row">
        <button
          type="button"
          className="text-button"
          onClick={() => setShowBreakdown((v) => !v)}
        >
          <Info size={14} />
          <span>{showBreakdown ? "إخفاء تفاصيل احتساب الثقة والمنهجية" : "كيف تم احتساب هذه النتيجة ونسبة الثقة؟"}</span>
          <ChevronRight size={14} className={showBreakdown ? "rotate-90" : ""} />
        </button>
      </div>

      {showBreakdown && (
        <div className="calculation-breakdown-card reveal-up">
          <h4>تفصيل أوزان القرار والشفافية</h4>
          <p className="breakdown-intro">
            يعتمد TruthGuard على منهجية مركّبة تفصل بين الأدلة الحية ونموذج معالجة اللغة الطبيعية:
          </p>
          <div className="breakdown-grid">
            <div className="breakdown-item">
              <div className="breakdown-item-header">
                <strong>1. أدلة الويب الحية (الوزن الأساسي)</strong>
                <span className="breakdown-tag">{result.evidence.length} مصادر</span>
              </div>
              <p>
                {supportCount > 0 && `رُصد ${supportCount} مصادر تدعم الادعاء. `}
                {contradictCount > 0 && `رُصد ${contradictCount} مصادر تنفي أو تُكذّب الادعاء. `}
                {contextCount > 0 && `رُصد ${contextCount} مصادر توفر سياقاً توضيحياً. `}
                {result.evidence.length === 0 && "لم ترجع محركات البحث مصادر حاسمة كافية، مما خفض مؤشر اليقين تلقائياً."}
              </p>
            </div>
            <div className="breakdown-item">
              <div className="breakdown-item-header">
                <strong>2. إشارة نموذج التعلم الآلي (LIAR Classifier)</strong>
                <span className="breakdown-tag">{result.mlSignal.label} ({modelPercent}%)</span>
              </div>
              <p>
                يحلل النموذج البنية النصية والصيغة التعبيرية بناءً على آلاف الادعاءات السابقة في معيار LIAR. الإشارة استرشادية ولا تحكم بمفردها.
              </p>
            </div>
          </div>
          <div className="formula-summary">
            <strong>قاعدة الحكم المطبقة: </strong>
            <span>
              {result.verdict === "Supported"
                ? "دعم متطابق من عدة مصادر موثوقة مع غياب مصادر التناقض."
                : result.verdict === "False"
                ? "تناقض صريح وتكذيب متكرر عبر أكثر من مصدر موثق."
                : result.verdict === "Misleading"
                ? "الأدلة المتناقضة تتجاوز الأدلة المؤيدة أو وجود اجتزاء للسياق."
                : result.verdict === "Likely True"
                ? "مؤشرات ترجح صحة الادعاء مع الحاجة لمزيد من التثبت المباشر."
                : "عدم كفاية المصادر المتاحة للفصل القطعي."}
            </span>
          </div>
        </div>
      )}

      <div className="result-section-head">
        <div><span className="label-caps">الأدلة المستخدمة</span><span className="evidence-count">{result.evidence.length} مصدر</span></div>
        <button className="text-button" onClick={() => setShowDetails((value) => !value)}>{showDetails ? "إخفاء" : "إظهار"} التفاصيل <ChevronRight size={15} className={showDetails ? "rotate-90" : ""} /></button>
      </div>
      {showDetails && result.evidence.length > 0 && (
        <div className="stance-filter-bar">
          <button
            type="button"
            className={`stance-tab ${stanceFilter === "all" ? "is-active" : ""}`}
            onClick={() => setStanceFilter("all")}
          >
            الكل ({result.evidence.length})
          </button>
          <button
            type="button"
            className={`stance-tab stance-tab-supports ${stanceFilter === "supports" ? "is-active" : ""}`}
            onClick={() => setStanceFilter("supports")}
          >
            <span className="stance-dot stance-supports" />
            يدعم ({supportCount})
          </button>
          <button
            type="button"
            className={`stance-tab stance-tab-contradicts ${stanceFilter === "contradicts" ? "is-active" : ""}`}
            onClick={() => setStanceFilter("contradicts")}
          >
            <span className="stance-dot stance-contradicts" />
            يتناقض ({contradictCount})
          </button>
          <button
            type="button"
            className={`stance-tab stance-tab-context ${stanceFilter === "context" ? "is-active" : ""}`}
            onClick={() => setStanceFilter("context")}
          >
            <span className="stance-dot stance-context" />
            سياق ({contextCount})
          </button>
        </div>
      )}
      {showDetails && (
        result.evidence.length ? (
          filteredEvidence.length ? (
            <div className="evidence-list">{filteredEvidence.map((item, index) => <EvidenceCard item={item} key={`${item.url}-${index}`} />)}</div>
          ) : (
            <div className="empty-evidence"><FileSearch size={20} /><div><strong>لا توجد مصادر بهذا التصنيف</strong><p>اختر تبويب "الكل" لعرض كافة الأدلة المتاحة.</p></div></div>
          )
        ) : (
          <div className="empty-evidence"><FileSearch size={20} /><div><strong>لم يتم إرجاع مصادر ويب</strong><p>حاول إدخال ادعاء أكثر دقة أو تحقق لاحقاً. تظهر إشارة النموذج بشكل منفصل ولا تُعد بديلاً عن الأدلة.</p></div></div>
        )
      )}
      <div className="result-disclaimer"><Info size={15} /><span>نموذج التعلم الآلي هو إشارة إضافية. ويجب أن توجه المصادر والأدلة الحالية الحكم النهائي.</span></div>
    </section>
  );
}

function VerifyPage() {
  const [claim, setClaim] = useState("");
  const [includeWebSearch, setIncludeWebSearch] = useState(true);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const queryClient = useQueryClient();
  const mutation = useVerifyClaim({
    mutation: {
      onSuccess: (data) => {
        setResult(data);
        queryClient.invalidateQueries({ queryKey: getListVerificationHistoryQueryKey() });
      },
    },
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (claim.trim().length < 8 || mutation.isPending) return;
    mutation.mutate({ data: { text: claim.trim(), includeWebSearch } });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      event.preventDefault();
      if (claim.trim().length >= 8 && !mutation.isPending) {
        mutation.mutate({ data: { text: claim.trim(), includeWebSearch } });
      }
    }
  };

  const isMinLength = claim.trim().length >= 8;
  const charsRemaining = 8 - claim.trim().length;

  return (
    <PageFrame>
      <div className="page-shell">
        <section className="hero-section">
          <div className="hero-copy">
            <SectionEyebrow>التحقق المدعوم بالذكاء الاصطناعي</SectionEyebrow>
            <h1>توقف. تحقق.<br /><span>اعرف الحقيقة.</span></h1>
            <p className="hero-lede">حوّل الادعاء أو العنوان أو الرسالة إلى إجابة واضحة مبنية على الأدلة قبل أن تثق بها أو تشاركها.</p>
            <div className="hero-trust"><span><Check size={14} /> مدرك للأدلة</span><span><Check size={14} /> شفاف</span><span><Check size={14} /> بدون حساب</span></div>
          </div>
          <div className="hero-seal" aria-hidden="true">
            <div className="seal-orbit orbit-one" /><div className="seal-orbit orbit-two" />
            <div className="seal-core"><ShieldCheck size={42} strokeWidth={1.25} /><span>TRUTH<br />GUARD</span></div>
          </div>
        </section>

        <section className="verify-layout">
          <div className="claim-card">
            <div className="card-heading">
              <div className="heading-icon"><Quote size={19} /></div>
              <div><h2>ماذا تريد التحقق منه؟</h2><p>ألصق ادعاء أو عنواناً أو رسالة. سنفككها لك.</p></div>
              {claim.length > 0 && (
                <button
                  type="button"
                  className="quick-clear-btn"
                  onClick={() => setClaim("")}
                  title="مسح حقل الإدخال"
                >
                  <X size={13} />
                  <span>مسح</span>
                </button>
              )}
            </div>
            <form onSubmit={submit}>
              <textarea
                value={claim}
                onChange={(event) => setClaim(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="مثال: “تدور الأرض حول الشمس.”"
                maxLength={2000}
                aria-label="ادعاء للتدقيق"
              />
              <div className="form-footer">
                <div className="input-hint-row">
                  <span className="char-count">{claim.length}/2000</span>
                  {claim.length > 0 && !isMinLength && (
                    <span className="min-char-warning">متبقي {charsRemaining} أحرف على الأقل</span>
                  )}
                  {isMinLength && (
                    <span className="ready-indicator"><span className="status-dot" /> جاهز للتحقق</span>
                  )}
                </div>
                <label className="toggle-row">
                  <input
                    type="checkbox"
                    checked={includeWebSearch}
                    onChange={(event) => setIncludeWebSearch(event.target.checked)}
                  />
                  <span className="toggle-track" />
                  <span>البحث عن مصادر حالية</span>
                </label>
                <button
                  className="primary-button"
                  type="submit"
                  disabled={!isMinLength || mutation.isPending}
                  title="اضغط للتحقق أو استخدم الاختصار Ctrl + Enter"
                >
                  {mutation.isPending ? (
                    <><Loader2 size={17} className="spin" /> جاري التحقق…</>
                  ) : (
                    <>تحقق من الادعاء <small className="kbd-hint">Ctrl+↵</small> <ArrowUpRight size={17} /></>
                  )}
                </button>
              </div>
            </form>
            {mutation.isError && <div className="inline-error"><CircleAlert size={16} /> لم نتمكن من إكمال الفحص. حاول مرة أخرى.</div>}
            <div className="examples-row"><span>جرّب مثالاً</span>{exampleClaims.map((item) => <button key={item} onClick={() => setClaim(item)}>{item.length > 42 ? `${item.slice(0, 42)}…` : item}</button>)}</div>
          </div>
          <div className="method-card">
            <SectionEyebrow>كيف يعمل</SectionEyebrow>
            <h3>ادعاء واحد.<br />ثلاث إشارات.</h3>
            <div className="method-step"><span>01</span><div><strong>الفهم</strong><p>نستخرج الفرضية الأساسية من رسالتك.</p></div></div>
            <div className="method-step"><span>02</span><div><strong>التحقيق</strong><p>نبحث عن مصادر عامة تدعم الادعاء أو تناقشه.</p></div></div>
            <div className="method-step"><span>03</span><div><strong>التقييم</strong><p>يضيف نموذج مدرب سياقاً لا يمثل الحقيقة النهائية.</p></div></div>
          </div>
        </section>
        {result ? <ResultPanel result={result} /> : <div className="empty-result"><Sparkles size={18} /><span>سيظهر هنا التحقق مع المنطق والأدلة التي استندت إليها النتيجة.</span></div>}
      </div>
    </PageFrame>
  );
}

function HistoryPage() {
  const { data, isLoading, isError } = useListVerificationHistory();
  const history = data ?? [];
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVerdict, setSelectedVerdict] = useState<string>("all");

  const verdictCategories = [
    { key: "all", label: "الكل" },
    { key: "Supported", label: "مدعوم" },
    { key: "Likely True", label: "محتمل الصدق" },
    { key: "Unverified", label: "غير مُتحقَّق" },
    { key: "Misleading", label: "مضلل" },
    { key: "False", label: "خاطئ" },
  ];

  const filteredHistory = history.filter((item) => {
    const matchesSearch = item.originalText.toLowerCase().includes(searchQuery.toLowerCase().trim());
    const matchesVerdict = selectedVerdict === "all" || item.verdict === selectedVerdict;
    return matchesSearch && matchesVerdict;
  });

  return (
    <PageFrame>
      <div className="page-shell interior-page">
        <SectionEyebrow>سجل التحقق</SectionEyebrow>
        <div className="interior-heading">
          <div>
            <h1>التحقيقات الأخيرة.</h1>
            <p>سجل محلي خاص بالادعاءات التي راجعتها في هذه الجلسة.</p>
          </div>
          <Link href="/" className="secondary-button">تحقق جديد <ArrowUpRight size={16} /></Link>
        </div>

        {isLoading ? (
          <LoadingState label="جارٍ تحميل السجل…" />
        ) : isError ? (
          <ErrorState />
        ) : history.length ? (
          <div className="history-wrapper">
            <div className="history-toolbar">
              <div className="history-search-bar">
                <Search size={15} />
                <input
                  type="text"
                  placeholder="ابحث في نصوص الادعاءات السابقة…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="بحث في السجل"
                />
                {searchQuery && (
                  <button type="button" onClick={() => setSearchQuery("")} title="مسح البحث">
                    <X size={14} />
                  </button>
                )}
              </div>
              <div className="history-filter-tabs">
                {verdictCategories.map((cat) => {
                  const count = cat.key === "all"
                    ? history.length
                    : history.filter((h) => h.verdict === cat.key).length;
                  if (count === 0 && cat.key !== "all") return null;
                  return (
                    <button
                      key={cat.key}
                      type="button"
                      className={`filter-tab ${selectedVerdict === cat.key ? "is-active" : ""}`}
                      onClick={() => setSelectedVerdict(cat.key)}
                    >
                      <span>{cat.label}</span>
                      <small>({count})</small>
                    </button>
                  );
                })}
              </div>
            </div>

            {filteredHistory.length ? (
              <div className="history-list">
                {filteredHistory.map((item) => (
                  <HistoryRow item={item} key={item.id} />
                ))}
              </div>
            ) : (
              <div className="empty-search-state">
                <FileSearch size={24} />
                <p>لا توجد نتائج مطابقة لبحثك.</p>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedVerdict("all");
                  }}
                >
                  إعادة ضبط المرشحات
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="large-empty">
            <History size={30} />
            <h2>لا توجد تحقُّقات بعد</h2>
            <p>عند تحققك لأول ادعاء سيظهر هنا.</p>
            <Link href="/" className="primary-button">تحقق من ادعاء <ArrowUpRight size={16} /></Link>
          </div>
        )}
      </div>
    </PageFrame>
  );
}

function HistoryRow({ item }: { item: VerificationSummary }) {
  return (
    <div className="history-row">
      <div className="history-icon"><FileSearch size={17} /></div>
      <div className="history-content"><p>{item.originalText}</p><span><Clock3 size={13} /> {new Date(item.createdAt).toLocaleString()}</span></div>
      <div className="history-result"><VerdictBadge verdict={item.verdict} /><span>{Math.round(item.confidence * 100)}% ثقة</span></div>
    </div>
  );
}

function LoadingState({ label }: { label: string }) {
  return <div className="loading-state"><Loader2 size={20} className="spin" /><span>{label}</span></div>;
}

function ErrorState() {
  return <div className="large-empty"><CircleAlert size={30} /><h2>السجل غير متاح</h2><p>جرّب تحديث الصفحة أو قم بإنشاء تحقق جديد.</p></div>;
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return <div className="metric-card"><span>{label}</span><strong>{Math.round(value * 100)}<small>%</small></strong><div className="metric-bar"><span style={{ width: `${Math.round(value * 100)}%` }} /></div></div>;
}

function AboutPage() {
  const { data: metrics, isLoading } = useGetModelMetrics();
  const safeMetrics = metrics as ModelMetrics | undefined;
  return (
    <PageFrame>
      <div className="page-shell interior-page about-page">
        <SectionEyebrow>داخل TruthGuard</SectionEyebrow>
        <div className="interior-heading"><div><h1>شكّك بذكاء،<br /><span>لكن بالتدقيق.</span></h1><p>TruthGuard هو وكيل صغير وشفاف للتحقق من المعلومات. يساعدك على التوقف قليلاً دون أن تضطر إلى أن تصبح باحثاً.</p></div><div className="about-mark"><Network size={28} /><span>الأدلة<br />أولاً</span></div></div>
        <div className="about-grid">
          <article className="about-card"><div className="about-card-icon"><FileSearch size={20} /></div><h2>ما الذي يقوم به الوكيل؟</h2><p>يستخرج الادعاء الأساسي، ويبحث في الويب عن السياق المناسب، ويقارن الإشارات الداعمة والمتعارضة، ويشرح كيف وصل إلى التقييم النهائي.</p></article>
          <article className="about-card"><div className="about-card-icon"><BarChart3 size={20} /></div><h2>ما الذي يضيفه النموذج؟</h2><p>نموذج TF-IDF وLogistic Regression مدرب على معيار LIAR العام يضيف إشارة لغوية خفيفة، لكنه لا يمثل مصدر الحقيقة.</p></article>
          <article className="about-card"><div className="about-card-icon"><ShieldCheck size={20} /></div><h2>ما الذي لا يستطيع فعله؟</h2><p>لا يضمن أي فحص آلي الحقيقة بالكامل. قد تكون نتائج البحث غير مكتملة، وقد تتغير الصفحات، وقد تتطلب الادعاءات المعقدة مراجعة خبراء ومصادر أولية.</p></article>
        </div>
        <section className="metrics-panel">
          <div className="metrics-heading"><div><SectionEyebrow>شفافية النموذج</SectionEyebrow><h2>تقييم، لا وعداً.</h2></div><span className="metrics-model">{safeMetrics?.model ?? "TF-IDF + Logistic Regression"}</span></div>
          {isLoading ? <LoadingState label="جارٍ تحميل مقاييس النموذج…" /> : safeMetrics && safeMetrics.samples > 0 ? <><div className="metrics-grid"><MetricCard label="الدقة" value={safeMetrics.accuracy} /><MetricCard label="الدقة المعيارية" value={safeMetrics.precision} /><MetricCard label="الاستدعاء" value={safeMetrics.recall} /><MetricCard label="F1 score" value={safeMetrics.f1} /></div><p className="metrics-note">{safeMetrics.dataset} · {safeMetrics.samples.toLocaleString()} ادعاءً مُعلَّمًا عبر تقسيمات التدريب والتحقق والاختبار. {safeMetrics.note}</p></> : <p className="metrics-note">ستظهر مقاييس النموذج بمجرد اكتمال أول تدريب لخدمة Python.</p>}
        </section>
      </div>
    </PageFrame>
  );
}

function AppRouter() {
  return <Switch><Route path="/" component={VerifyPage} /><Route path="/history" component={HistoryPage} /><Route path="/about" component={AboutPage} /><Route><VerifyPage /></Route></Switch>;
}

const queryClient = new QueryClient();

export default function App() {
  return <QueryClientProvider client={queryClient}><AppRouter /></QueryClientProvider>;
}
