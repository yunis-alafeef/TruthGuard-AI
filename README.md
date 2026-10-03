# TruthGuard AI (حارس الحقيقة) 🛡️

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![Fact Check Engine](https://img.shields.io/badge/TruthGuard-v3.0_Enterprise-emerald.svg)](https://github.com/yunis-alafeef/TruthGuard-AI)
[![OpenAPI 3.1](https://img.shields.io/badge/OpenAPI-3.1-black.svg)](lib/openapi-spec.ts)
[![Manifest V3](https://img.shields.io/badge/Chrome_Extension-Manifest_V3-orange.svg)](extension/manifest.json)

**TruthGuard AI** is a comprehensive, production-grade misinformation detection, fact-checking, and digital verification suite designed and maintained by **Yunis Al-Afeef** (`shoeabvv@gmail.com`). 

It integrates real-time web grounding, cognitive linguistics, multi-factor confidence algorithms, Google Fact Check (Schema.org `ClaimReview`) standards, and network forensic heuristics into an enterprise-ready platform.

---

## 🌟 Architectural Overview (30+ Specialized Engines)

TruthGuard AI unites over 30 modular engines spanning 4 operational layers:

### 1. 🔍 Detection & Deep Forensics Layer
- **Bot & CIB Swarm Analyzer (`lib/bot-network-detector.ts`)**: Unmasks astroturfing, copypastas, and synchronized artificial amplification.
- **Audio Voice Note Fact-Checking (`lib/audio-factcheck.ts`)**: Time-coded claim extraction from WhatsApp audio notes with AI voice cadence audit.
- **Image Forensics & EXIF Analyzer (`lib/image-forensics.ts`)**: Flags generative AI signatures (Midjourney, DALL-E) and recycled crisis imagery.
- **Logical Fallacy Classifier (`lib/fallacy-detector.ts`)**: Categorizes Ad Hominem, False Dilemma, Appeal to False Authority, and Slippery Slope.
- **Sensationalism & Clickbait Meter (`lib/sensationalism.ts`)**: Scores rhetorical inflation and emotional urgency (0–100).
- **Affective Manipulation & Outrage Radar (`lib/sentiment-polarization.ts`)**: Isolates fear-mongering and outgroup polarization.

### 2. 🧠 Knowledge, Semantics & Graph Layer
- **Misinformation Knowledge Graph (`lib/knowledge-graph.ts`)**: Directed graph topology mapping claims, entities, contradictory evidence, and actors.
- **Semantic Claim Clustering (`lib/claim-clustering.ts`)**: Groups paraphrased rumors into unified threads using Jaccard n-gram similarity.
- **Multi-Claim Atomic Decomposer (`lib/claim-extractor.ts`)**: Breaks complex paragraphs into independent factual propositions.
- **Geospatial Claim Validator (`lib/geospatial-validator.ts`)**: Validates location-bounded claims against regional authorities across MENA coordinates.

### 3. ⚖️ Verdicts, Consensus & Risk Modeling
- **Multi-Factor Confidence Matrix (`lib/confidence-matrix.ts`)**: Weighted transparent audit: Evidence (40%), ML (25%), Domain Trust (20%), Neutrality (15%).
- **Societal Harm & Risk Profiler (`lib/risk-profiler.ts`)**: Evaluates threat vectors across public health, democratic elections, and financial security.
- **Multi-Registry Fact-Check Aggregator (`lib/factcheck-aggregator.ts`)**: Ingests and normalizes ratings across IFCN signatories (PolitiFact, Snopes, Misbar, Fatabyyano).
- **Temporal Lifecycle Tracker (`lib/temporal-tracker.ts`)**: Computes rumor virality velocity, debunk latency, and recurrent zombie waves.

### 4. 🚀 Distribution, Syndication & Integrations
- **Google Fact Check ClaimReview (`lib/claim-review-schema.ts`)**: Schema.org JSON-LD generation for Google Search rich carousels.
- **Browser Extension Manifest V3 (`extension/`)**: In-page highlight-to-verify tooltip for Chrome, Firefox, and Edge.
- **Media Literacy Simulation Quiz (`lib/media-literacy-quiz.ts`)**: Interactive critical thinking simulations for citizen education.
- **Multi-Format Dossier Exporter (`lib/dossier-exporter.ts`)**: Instant exports in GitHub Flavored Markdown, JSON, and print-styled HTML.
- **Event-Driven Webhook Dispatcher (`lib/webhook-dispatcher.ts`)**: HMAC-SHA256 signed alerts for newsroom CMS and messaging bots.
- **RSS 2.0 & Atom Syndication Engine (`lib/syndication-feed.ts`)**: Standardized feed distribution with custom truthguard XML namespaces.
- **Dynamic SVG & HTML Badges (`lib/badge-generator.ts`)**: Embeddable status shields for publications and GitHub repositories.
- **OpenAPI 3.1 Specification (`lib/openapi-spec.ts`)**: REST API contract and interactive schema definitions.
- **Automated Accuracy Benchmark Suite (`lib/benchmark-evaluator.ts`)**: Evaluates Precision, Recall, F1, and MAE calibration.

---

## 💻 Quick Start & CLI Usage

```bash
# Clone the repository
git clone https://github.com/yunis-alafeef/TruthGuard-AI.git
cd TruthGuard-AI

# Install dependencies
pnpm install

# Run the CLI verification tool
npx tsx scripts/src/verify-cli.ts "الماء يغلي عند 100 درجة مئوية تحت الضغط القياسي"
```

---

## 👨‍💻 Author & Maintainer

**Yunis Al-Afeef**  
- Email: `shoeabvv@gmail.com`  
- GitHub: [@yunis-alafeef](https://github.com/yunis-alafeef)

Licensed under the [MIT License](LICENSE).
