# TruthGuard AI (حارس الحقيقة) 🛡️

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![Fact Check Engine](https://img.shields.io/badge/TruthGuard-v2.1-emerald.svg)](https://github.com/yunis-alafeef/TruthGuard-AI)
[![OpenAPI 3.1](https://img.shields.io/badge/OpenAPI-3.1-black.svg)](lib/openapi-spec.ts)

**TruthGuard AI** is an advanced, production-grade misinformation detection and fact-checking engine developed by **Yunis Al-Afeef** (`shoeabvv@gmail.com`). It unites multi-factor heuristic analysis, Google Fact Check / Schema.org standards, real-time web grounding, and multilingual NLP (Arabic & English) into an audit-ready verification platform.

---

## 🌟 Key Architecture & Modular Engines (21 Core Features)

TruthGuard AI provides 21 dedicated engineering modules organized across analysis, infrastructure, and reporting:

### 🔬 Core Heuristics & Verification
1. **Sensationalism & Clickbait Index (`lib/sensationalism.ts`)**: Measures emotional buzzwords, punctuation hyperbole, and text excitement (0–100 scale).
2. **Domain Trust & Source Registry (`lib/sources-registry.ts`)**: Curated reputation database covering accredited fact-checkers, satire domains, and state outlets.
3. **Multi-Claim Atomic Decomposer (`lib/claim-extractor.ts`)**: Dissects multi-sentence compound posts into discrete testable propositions.
4. **Multi-Factor Confidence Matrix (`lib/confidence-matrix.ts`)**: Weighted transparency scoring: Web Evidence (40%), ML Model (25%), Domain Trust (20%), Linguistic Neutrality (15%).
5. **Semantic Claim Clustering (`lib/claim-clustering.ts`)**: Groups viral variants and paraphrased rumors via n-gram tokenization and Jaccard similarity.
6. **Temporal Lifecycle & Velocity Tracker (`lib/temporal-tracker.ts`)**: Maps rumor acceleration, peak saturation, debunk latency, and recurrent zombie waves.
7. **Image Forensics & Metadata Auditor (`lib/image-forensics.ts`)**: Detects AI generative markers (Midjourney, DALL-E) and recycled crisis photos.
8. **Affective Manipulation & Polarization Radar (`lib/sentiment-polarization.ts`)**: Identifies fear-mongering, artificial urgency (FOMO), and outgroup hostility.
9. **Societal Harm & Risk Profiler (`lib/risk-profiler.ts`)**: Evaluates threat levels across public health, civic elections, and financial security.
10. **Multi-Registry Fact-Check Aggregator (`lib/factcheck-aggregator.ts`)**: Normalizes disparate ratings across IFCN signatories and calculates consensus agreement.

### 🌐 Interoperability, Distribution & Formats
11. **Google Fact Check ClaimReview (`lib/claim-review-schema.ts`)**: Schema.org JSON-LD generation for Google Search rich snippets.
12. **Social Debunk Card Generator (`lib/debunk-card.ts`)**: Instant WhatsApp, Telegram, and X formatted debunk templates.
13. **Dynamic SVG & HTML Badges (`lib/badge-generator.ts`)**: Embeddable status shields for newsrooms, blogs, and GitHub repositories.
14. **Multi-Format Dossier Exporter (`lib/dossier-exporter.ts`)**: Auditable reports in Markdown, JSON, and print-styled HTML for PDF archiving.
15. **Event-Driven Webhook Dispatcher (`lib/webhook-dispatcher.ts`)**: HMAC-SHA256 signed alerts for enterprise and newsroom CMS automation.
16. **OpenAPI 3.1 Specification (`lib/openapi-spec.ts`)**: Machine-readable REST API contract.

### ⚡ Infrastructure & Developer Experience
17. **Bilingual i18n & RTL Engine (`lib/i18n.ts`)**: Comprehensive English/Arabic terminology with bi-directional layout support.
18. **Local Investigation Bookmarks (`lib/bookmarks.ts`)**: Client-side encrypted bookmarks, tagging (#health, #politics), and query recall.
19. **Sliding-Window Rate Limiter (`lib/rate-limiter.ts`)**: Token-bucket middleware protecting inference routes with HTTP `X-RateLimit-*` headers.
20. **Interactive CLI Suite (`scripts/src/verify-cli.ts`)**: Terminal tool for batch inspections and continuous integration pipelines.
21. **Batch Queue Engine (`lib/batch-verifier.ts`)**: Parallel evaluation of up to 15 claims with RFC-4180 CSV export.

---

## 💻 Quick Start & CLI Usage

```bash
# Clone the repository
git clone https://github.com/yunis-alafeef/TruthGuard-AI.git
cd TruthGuard-AI

# Install dependencies
pnpm install

# Run the CLI tool
npx tsx scripts/src/verify-cli.ts "الماء يغلي عند 100 درجة مئوية"
```

---

## 👨‍💻 Author & Maintainer

**Yunis Al-Afeef**  
- Email: `shoeabvv@gmail.com`  
- GitHub: [@yunis-alafeef](https://github.com/yunis-alafeef)

Licensed under the [MIT License](LICENSE).
