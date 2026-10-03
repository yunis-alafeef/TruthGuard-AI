# TruthGuard AI — Changelog & Engineering Milestones

All notable changes to the TruthGuard AI project are documented in this file.
Lead Architect: **Yunis Al-Afeef** (`shoeabvv@gmail.com`).

---

## [3.0.0] — 2026-10-03 (Release Day 3: Enterprise & Ecosystem Suite)

### Added
- **Coordinated Inauthentic Behavior (CIB) & Bot Swarm Detector (`lib/bot-network-detector.ts`)**: Astroturfing and copypasta identification.
- **Audio Voice Note Fact-Checking Pipeline (`lib/audio-factcheck.ts`)**: Transcription chunking and AI voice-clone cadence anomaly detection.
- **Misinformation Knowledge Graph (`lib/knowledge-graph.ts`)**: Directed graph builder linking claims, contradictory evidence, and entities.
- **Browser Extension Manifest V3 (`extension/`)**: In-page text selection and verification overlay for Chrome, Edge, and Firefox.
- **Media Literacy Simulation Quiz (`lib/media-literacy-quiz.ts`)**: Interactive discernment training on domain spoofing and deepfakes.
- **Logical Fallacy Classifier (`lib/fallacy-detector.ts`)**: Identifies Ad Hominem, False Dilemma, and Straw Man reasoning flaws.
- **Geospatial Claim Validator (`lib/geospatial-validator.ts`)**: MENA regional geolocation and municipal emergency validation.
- **RSS 2.0 & Atom Syndication Engine (`lib/syndication-feed.ts`)**: XML feed publishing with custom truthguard namespaces.
- **Automated Accuracy Benchmark Harness (`lib/benchmark-evaluator.ts`)**: Confusion matrix, Precision/Recall/F1, and MAE calibration.

---

## [2.1.0] — 2026-10-02 (Release Day 2: Intelligence & Interoperability Suite)

### Added
- **Semantic Claim Clustering (`lib/claim-clustering.ts`)**: Jaccard n-gram similarity engine for multi-variant rumor deduplication.
- **Temporal Lifecycle Tracker (`lib/temporal-tracker.ts`)**: Velocity scoring, debunk latency, and recurrent zombie rumor detection.
- **Schema.org ClaimReview Generator (`lib/claim-review-schema.ts`)**: Official Google Fact Check JSON-LD metadata generator.
- **Image Forensics & EXIF Auditor (`lib/image-forensics.ts`)**: AI synthesis marker detection and reverse image routing.
- **Webhook Alert Dispatcher (`lib/webhook-dispatcher.ts`)**: HMAC-SHA256 signed event publishing for newsrooms.
- **Multi-Registry Fact-Check Aggregator (`lib/factcheck-aggregator.ts`)**: Normalizes IFCN ratings with consensus scoring.
- **Societal Harm & Risk Profiler (`lib/risk-profiler.ts`)**: Misinformation Severity Index (MSI) across health, civic, and financial vectors.
- **Emotional Manipulation Radar (`lib/sentiment-polarization.ts`)**: Fear-mongering, artificial urgency, and outrage detection.
- **Multi-Format Dossier Exporter (`lib/dossier-exporter.ts`)**: Markdown, JSON, and print-styled HTML reports.
- **OpenAPI 3.1 Specification (`lib/openapi-spec.ts`)**: Full machine-readable REST API contract.

---

## [1.0.0] — 2026-10-01 (Release Day 1: Core Heuristics & Foundation)

### Added
- Core web grounding verification engine with Google Search integration.
- Sensationalism & Clickbait Index (`lib/sensationalism.ts`).
- Domain Trust & Source Bias Registry (`lib/sources-registry.ts`).
- Multi-Claim Atomic Decomposer (`lib/claim-extractor.ts`).
- Multi-Factor Confidence Breakdown Matrix (`lib/confidence-matrix.ts`).
- Dynamic SVG & HTML Verification Badges (`lib/badge-generator.ts`).
- Token-Bucket API Rate Limiter (`lib/rate-limiter.ts`).
- Bilingual Arabic/English i18n Engine with RTL layout support (`lib/i18n.ts`).
- Local Investigation Bookmarking Suite (`lib/bookmarks.ts`).
- Batch Claim Processing Queue with CSV Export (`lib/batch-verifier.ts`).
- Command-line interactive fact-checking CLI (`scripts/src/verify-cli.ts`).
