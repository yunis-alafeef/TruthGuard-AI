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
  "The World Wide Web was invented by Tim Berners-Lee.",
  "Drinking bleach cures viral infections.",
  "A healthy diet alone guarantees that a person will never get sick.",
];

const verdictCopy: Record<string, { label: string; className: string; icon: typeof CheckCircle2 }> = {
  Supported: { label: "Supported", className: "is-supported", icon: CheckCircle2 },
  "Likely True": { label: "Likely true", className: "is-likely", icon: Check },
  Unverified: { label: "Unverified", className: "is-unverified", icon: CircleAlert },
  Misleading: { label: "Misleading", className: "is-misleading", icon: CircleAlert },
  False: { label: "False", className: "is-false", icon: XCircle },
};

function Logo() {
  return (
    <Link href="/" className="brand-mark" aria-label="TruthGuard AI home">
      <span className="brand-emblem">
        <ShieldCheck size={24} strokeWidth={1.8} />
      </span>
      <span>
        <strong>TruthGuard</strong>
        <small>AI fact-checking</small>
      </span>
    </Link>
  );
}

function Header() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const links = [
    { href: "/", label: "Verify" },
    { href: "/history", label: "History" },
    { href: "/about", label: "About" },
  ];
  return (
    <header className="site-header">
      <div className="page-shell header-inner">
        <Logo />
        <button className="mobile-menu" aria-label="Toggle navigation" onClick={() => setOpen((value) => !value)}>
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
          <span className="nav-status"><span className="status-dot" /> System ready</span>
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
          <span>Evidence-first verification</span>
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
  const stanceLabel = item.stance === "supports" ? "Supports claim" : item.stance === "contradicts" ? "Contradicts claim" : "Context";
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
          <SectionEyebrow>Verification result</SectionEyebrow>
          <h2>Here&apos;s what the evidence says.</h2>
        </div>
        <VerdictBadge verdict={result.verdict} />
      </div>
      <div className="result-confidence">
        <div className="confidence-ring" style={{ "--confidence": `${percent * 3.6}deg` } as CSSProperties}>
          <div><strong>{percent}%</strong><span>confidence</span></div>
        </div>
        <div className="confidence-copy">
          <span className="label-caps">Main claim</span>
          <p className="extracted-claim">“{result.extractedClaim}”</p>
          <p className="result-explanation">{result.explanation}</p>
        </div>
      </div>
      <div className="result-meta-grid">
        <div className="meta-stat"><span>Search status</span><strong><span className="status-dot" />{result.searchStatus}</strong></div>
        <div className="meta-stat"><span>ML signal</span><strong>{result.mlSignal.label} <em>{modelPercent}%</em></strong></div>
        <div className="meta-stat"><span>Checked</span><strong>{new Date(result.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</strong></div>
      </div>
      <div className="result-section-head">
        <div><span className="label-caps">Evidence used</span><span className="evidence-count">{result.evidence.length} sources</span></div>
        <button className="text-button" onClick={() => setShowDetails((value) => !value)}>{showDetails ? "Hide" : "Show"} details <ChevronRight size={15} className={showDetails ? "rotate-90" : ""} /></button>
      </div>
      {showDetails && (
        result.evidence.length ? (
          <div className="evidence-list">{result.evidence.map((item, index) => <EvidenceCard item={item} key={`${item.url}-${index}`} />)}</div>
        ) : (
          <div className="empty-evidence"><FileSearch size={20} /><div><strong>No web sources returned</strong><p>Try a more specific claim or check again later. The model signal is shown separately and is not a substitute for evidence.</p></div></div>
        )
      )}
      <div className="result-disclaimer"><Info size={15} /><span>The ML model is an additional signal. Sources and current evidence should guide the final judgment.</span></div>
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
            <SectionEyebrow>AI-powered fact checking</SectionEyebrow>
            <h1>Pause. Check.<br /><span>Know better.</span></h1>
            <p className="hero-lede">Turn a claim, headline, or message into a clear, evidence-backed answer before you trust it or share it.</p>
            <div className="hero-trust"><span><Check size={14} /> Source-aware</span><span><Check size={14} /> Transparent</span><span><Check size={14} /> No account needed</span></div>
          </div>
          <div className="hero-seal" aria-hidden="true">
            <div className="seal-orbit orbit-one" /><div className="seal-orbit orbit-two" />
            <div className="seal-core"><ShieldCheck size={42} strokeWidth={1.25} /><span>TRUST<br />GUARD</span></div>
          </div>
        </section>

        <section className="verify-layout">
          <div className="claim-card">
            <div className="card-heading">
              <div className="heading-icon"><Quote size={19} /></div>
              <div><h2>What would you like to verify?</h2><p>Paste a claim, headline, or message. We&apos;ll break it down.</p></div>
            </div>
            <form onSubmit={submit}>
              <textarea value={claim} onChange={(event) => setClaim(event.target.value)} placeholder="For example: “The Earth revolves around the Sun.”" maxLength={2000} aria-label="Claim to verify" />
              <div className="form-footer">
                <span className="char-count">{claim.length}/2000</span>
                <label className="toggle-row"><input type="checkbox" checked={includeWebSearch} onChange={(event) => setIncludeWebSearch(event.target.checked)} /><span className="toggle-track" /><span>Search current sources</span></label>
                <button className="primary-button" type="submit" disabled={claim.trim().length < 8 || mutation.isPending}>
                  {mutation.isPending ? <><Loader2 size={17} className="spin" /> Checking…</> : <>Verify claim <ArrowUpRight size={17} /></>}
                </button>
              </div>
            </form>
            {mutation.isError && <div className="inline-error"><CircleAlert size={16} /> We couldn&apos;t complete that check. Please try again.</div>}
            <div className="examples-row"><span>Try an example</span>{exampleClaims.map((item) => <button key={item} onClick={() => setClaim(item)}>{item.length > 42 ? `${item.slice(0, 42)}…` : item}</button>)}</div>
          </div>
          <div className="method-card">
            <SectionEyebrow>How it works</SectionEyebrow>
            <h3>One claim.<br />Three signals.</h3>
            <div className="method-step"><span>01</span><div><strong>Understand</strong><p>We isolate the main factual claim from your message.</p></div></div>
            <div className="method-step"><span>02</span><div><strong>Investigate</strong><p>We search for public sources that support or challenge it.</p></div></div>
            <div className="method-step"><span>03</span><div><strong>Assess</strong><p>A trained model adds context, never a final truth.</p></div></div>
          </div>
        </section>
        {result ? <ResultPanel result={result} /> : <div className="empty-result"><Sparkles size={18} /><span>Your verification will appear here with the reasoning and sources behind it.</span></div>}
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
        <SectionEyebrow>Verification history</SectionEyebrow>
        <div className="interior-heading"><div><h1>Your recent checks.</h1><p>A private local record of the claims you&apos;ve checked in this session.</p></div><Link href="/" className="secondary-button">New verification <ArrowUpRight size={16} /></Link></div>
        {isLoading ? <LoadingState label="Loading recent checks…" /> : isError ? <ErrorState /> : history.length ? <div className="history-list">{history.map((item) => <HistoryRow item={item} key={item.id} />)}</div> : <div className="large-empty"><History size={30} /><h2>No checks yet</h2><p>When you verify your first claim, it will appear here.</p><Link href="/" className="primary-button">Verify a claim <ArrowUpRight size={16} /></Link></div>}
      </div>
    </PageFrame>
  );
}

function HistoryRow({ item }: { item: VerificationSummary }) {
  return (
    <div className="history-row">
      <div className="history-icon"><FileSearch size={17} /></div>
      <div className="history-content"><p>{item.originalText}</p><span><Clock3 size={13} /> {new Date(item.createdAt).toLocaleString()}</span></div>
      <div className="history-result"><VerdictBadge verdict={item.verdict} /><span>{Math.round(item.confidence * 100)}% confidence</span></div>
    </div>
  );
}

function LoadingState({ label }: { label: string }) {
  return <div className="loading-state"><Loader2 size={20} className="spin" /><span>{label}</span></div>;
}

function ErrorState() {
  return <div className="large-empty"><CircleAlert size={30} /><h2>History is unavailable</h2><p>Try refreshing the page or make a new verification.</p></div>;
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
        <SectionEyebrow>Inside TruthGuard</SectionEyebrow>
        <div className="interior-heading"><div><h1>Useful skepticism,<br /><span>made simple.</span></h1><p>TruthGuard is a small, transparent fact-checking agent. It helps you slow down without asking you to become a researcher.</p></div><div className="about-mark"><Network size={28} /><span>Evidence<br />over certainty</span></div></div>
        <div className="about-grid">
          <article className="about-card"><div className="about-card-icon"><FileSearch size={20} /></div><h2>What the agent does</h2><p>It extracts the central factual claim, searches the open web for relevant context, compares supporting and contradicting signals, and explains how it reached its label.</p></article>
          <article className="about-card"><div className="about-card-icon"><BarChart3 size={20} /></div><h2>What the model adds</h2><p>A TF-IDF and Logistic Regression model trained on the public LIAR fact-checking benchmark adds a lightweight language signal. It is useful context, not a source of truth.</p></article>
          <article className="about-card"><div className="about-card-icon"><ShieldCheck size={20} /></div><h2>What it cannot do</h2><p>No automated check can guarantee truth. Search results can be incomplete, pages can change, and nuanced claims may need expert review and primary sources.</p></article>
        </div>
        <section className="metrics-panel">
          <div className="metrics-heading"><div><SectionEyebrow>Model transparency</SectionEyebrow><h2>Evaluation, not a promise.</h2></div><span className="metrics-model">{safeMetrics?.model ?? "TF-IDF + Logistic Regression"}</span></div>
          {isLoading ? <LoadingState label="Loading model metrics…" /> : safeMetrics && safeMetrics.samples > 0 ? <><div className="metrics-grid"><MetricCard label="Accuracy" value={safeMetrics.accuracy} /><MetricCard label="Precision" value={safeMetrics.precision} /><MetricCard label="Recall" value={safeMetrics.recall} /><MetricCard label="F1 score" value={safeMetrics.f1} /></div><p className="metrics-note">{safeMetrics.dataset} · {safeMetrics.samples.toLocaleString()} labeled claims across training, validation, and test splits. {safeMetrics.note}</p></> : <p className="metrics-note">Model metrics will appear once the Python service has completed its first training run.</p>}
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