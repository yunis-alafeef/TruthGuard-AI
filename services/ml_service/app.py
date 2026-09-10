from __future__ import annotations

import json
from pathlib import Path

import joblib
from fastapi import FastAPI
from pydantic import BaseModel, Field

from .train import METRICS_PATH, MODEL_PATH, train_model

app = FastAPI(title="TruthGuard AI ML Service", version="1.0.0")


class PredictRequest(BaseModel):
    text: str = Field(min_length=8, max_length=2000)


class PredictResponse(BaseModel):
    label: str
    confidence: float
    model: str


def _load_model():
    if not MODEL_PATH.exists() or not METRICS_PATH.exists():
        train_model()
    return joblib.load(MODEL_PATH)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "model": "TF-IDF + Logistic Regression"}


@app.get("/metrics")
def metrics() -> dict:
    if not METRICS_PATH.exists():
        train_model()
    return json.loads(METRICS_PATH.read_text(encoding="utf-8"))


@app.post("/predict", response_model=PredictResponse)
def predict(request: PredictRequest) -> PredictResponse:
    model = _load_model()
    probabilities = model.predict_proba([request.text])[0]
    index = int(probabilities.argmax())
    return PredictResponse(
        label=str(model.classes_[index]),
        confidence=round(float(probabilities[index]), 4),
        model="TF-IDF + Logistic Regression",
    )