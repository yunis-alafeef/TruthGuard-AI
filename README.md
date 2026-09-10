# TruthGuard AI

TruthGuard AI is a small, source-aware fact-checking chatbot. Paste a news claim, headline, message, or piece of information and it extracts the main factual claim, searches the public web for relevant context, combines that evidence with a trained text-classification signal, and returns a readable verdict:

- Supported
- Likely True
- Unverified
- Misleading
- False

The interface uses a restrained white-and-gold identity to make verification feel calm, trustworthy, and easy to understand.

## The problem

False or misleading information moves faster than careful verification. Most people need a quick starting point, but a single model score is not enough to establish truth. TruthGuard AI is designed to make the reasoning visible: users see the extracted claim, the sources returned by the search step, the evidence stance, and the model signal separately.

## How the AI agent works

1. **Understand** — normalizes the submitted message and extracts its central factual claim.
2. **Investigate** — optionally queries DuckDuckGo's public HTML results for current web evidence.
3. **Classify** — calls the Python FastAPI service at `/predict`.
4. **Combine** — compares supporting and contradicting search signals with the ML signal.
5. **Explain** — returns a verdict, confidence, explanation, source links, and the model signal.
6. **Remember** — stores the check in a local SQLite database so it appears in History.

Web evidence takes priority. The ML model is an **additional signal**, not an absolute truth source. Current verification should rely on available evidence and sources, and important claims still need human review.

## Dataset and model

The training service uses the public [LIAR dataset](https://www.cs.ucsb.edu/~william/data/liar_dataset.zip), a benchmark for fake-news and fact-checking classification originally introduced by William Yang Wang in *Liar, Liar Pants on Fire: A New Benchmark Dataset for Fake News Detection*.

`services/ml_service/train.py`:

- downloads the public LIAR train, validation, and test files when available;
- keeps the supplied validation split separate;
- uses an 80/20 stratified train/test split on the combined public rows when the dataset is available;
- trains a TF-IDF vectorizer with unigrams and bigrams;
- trains a balanced Logistic Regression classifier;
- writes `model.joblib` and `metrics.json`;
- calculates Accuracy, macro Precision, macro Recall, and macro F1.

The repository includes the generated model artifacts after the first training run. If the public download is unavailable, the script uses a tiny transparent fallback corpus so the service remains runnable; the README UI makes this distinction visible through the metrics endpoint.

## Architecture

```text
React + TypeScript + Vite
        |
        | /api/verify, /api/history, /api/model/metrics
        v
Node.js API server
  - claim normalization
  - web evidence search
  - verdict explanation
  - SQLite history
        |
        | POST /predict
        v
Python FastAPI ML service
  - TF-IDF
  - Logistic Regression
  - saved joblib model
```

The Node API starts the local FastAPI service automatically for the development workflow. The Python service can also be started independently when needed.

## Run locally

Requirements: Node.js 24, pnpm, and Python 3.13.

```bash
pnpm install
pnpm --filter @workspace/api-spec run codegen
python3 -m services.ml_service.train
```

Start the application services:

```bash
pnpm --filter @workspace/api-server run dev
pnpm --filter @workspace/truthguard-ai run dev
```

The API is mounted at `/api`. The frontend is served at the root app path in the Replit preview. In a normal local shell, the API can be checked with:

```bash
curl http://localhost:5000/api/healthz
curl http://localhost:5000/api/model/metrics
```

Run checks:

```bash
pnpm run typecheck
pnpm --filter @workspace/truthguard-ai run build
python3 -m py_compile services/ml_service/app.py services/ml_service/train.py
```

## Technologies

- React, TypeScript, Vite, Tailwind CSS, Wouter, TanStack Query
- Node.js API server with Express 5, typed OpenAPI contract, and generated client hooks
- Python, FastAPI, scikit-learn, joblib
- SQLite via Node's built-in `node:sqlite`
- DuckDuckGo public HTML search for optional current evidence

The workspace preview uses the existing React/Vite artifact and modular Node API service so the MVP can run without a separate deployment platform or user-provided API keys.

## Limitations

- Search snippets are not the same as source articles; users should open the links and read the underlying material.
- Search availability, indexing, rate limits, and page changes can affect a result.
- The source stance heuristic is intentionally small and should not be treated as a perfect fact-checker.
- The LIAR dataset contains short political claims and does not represent every topic, language, or writing style.
- A low or high model confidence does not prove or disprove a claim.
- No authentication is included; the SQLite history is local to the running service.
- Arabic text can be entered and displayed, but the included ML model was trained primarily on the English LIAR corpus.

## Branding

The product displays:

**TruthGuard AI**  
**لا تصدق فقط… تحقق.**  
**إعداد وعمل المهندس يونس العفيف**
