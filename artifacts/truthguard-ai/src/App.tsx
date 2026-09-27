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
  ExternalLink,
  FileSearch,
  History,
  Info,
  Loader2,
  Menu,
  Network,
  Quote,
  ShieldCheck,
  Sparkles,
  X,
  XCircle,
} from "lucide-react";
import { Link, Route, Switch, useLocation } from "wouter";

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
  const percent = Math.round(result.confidence * 100);
  const modelPercent = Math.round(result.mlSignal.confidence * 100);
  return (
    <section className="result-panel reveal-up">
      <div className="result-heading">
        <div>
          <SectionEyebrow>نتيجة التحقق</SectionEyebrow>
          <h2>إليك ما يقوله الدليل.</h2>
        </div>
        <VerdictBadge verdict={result.verdict} />
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
      <div className="result-section-head">
        <div><span className="label-caps">الأدلة المستخدمة</span><span className="evidence-count">{result.evidence.length} مصدر</span></div>
        <button className="text-button" onClick={() => setShowDetails((value) => !value)}>{showDetails ? "إخفاء" : "إظهار"} التفاصيل <ChevronRight size={15} className={showDetails ? "rotate-90" : ""} /></button>
      </div>
      {showDetails && (
        result.evidence.length ? (
          <div className="evidence-list">{result.evidence.map((item, index) => <EvidenceCard item={item} key={`${item.url}-${index}`} />)}</div>
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
            </div>
            <form onSubmit={submit}>
              <textarea value={claim} onChange={(event) => setClaim(event.target.value)} placeholder="مثال: “تدور الأرض حول الشمس.”" maxLength={2000} aria-label="ادعاء للتدقيق" />
              <div className="form-footer">
                <span className="char-count">{claim.length}/2000</span>
                <label className="toggle-row"><input type="checkbox" checked={includeWebSearch} onChange={(event) => setIncludeWebSearch(event.target.checked)} /><span className="toggle-track" /><span>البحث عن مصادر حالية</span></label>
                <button className="primary-button" type="submit" disabled={claim.trim().length < 8 || mutation.isPending}>
                  {mutation.isPending ? <><Loader2 size={17} className="spin" /> جاري التحقق…</> : <>تحقق من الادعاء <ArrowUpRight size={17} /></>}
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
  return (
    <PageFrame>
      <div className="page-shell interior-page">
        <SectionEyebrow>سجل التحقق</SectionEyebrow>
        <div className="interior-heading"><div><h1>التحقيقات الأخيرة.</h1><p>سجل محلي خاص بالادعاءات التي راجعتها في هذه الجلسة.</p></div><Link href="/" className="secondary-button">تحقق جديد <ArrowUpRight size={16} /></Link></div>
        {isLoading ? <LoadingState label="جارٍ تحميل السجل…" /> : isError ? <ErrorState /> : history.length ? <div className="history-list">{history.map((item) => <HistoryRow item={item} key={item.id} />)}</div> : <div className="large-empty"><History size={30} /><h2>لا توجد تحقُّقات بعد</h2><p>عند تحققك لأول ادعاء سيظهر هنا.</p><Link href="/" className="primary-button">تحقق من ادعاء <ArrowUpRight size={16} /></Link></div>}
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
