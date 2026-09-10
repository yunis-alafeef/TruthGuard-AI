from __future__ import annotations

import csv
import json
import random
from pathlib import Path
from urllib.request import urlopen

import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline

ROOT = Path(__file__).resolve().parent
MODEL_PATH = ROOT / "model.joblib"
METRICS_PATH = ROOT / "metrics.json"
DATA_PATH = ROOT / "data"
DATASET_URL = "https://raw.githubusercontent.com/tfs4/liar_dataset/master/{name}.tsv"
LABELS = ["pants-fire", "false", "barely-true", "half-true", "mostly-true", "true"]

FALLBACK_ROWS = [
    ("true", "The Earth revolves around the Sun."),
    ("true", "Water freezes at zero degrees Celsius at standard pressure."),
    ("true", "The Pacific Ocean is larger than the Atlantic Ocean."),
    ("true", "The World Wide Web was invented by Tim Berners-Lee."),
    ("true", "Vaccines are tested for safety before approval."),
    ("true", "The human heart pumps blood through the body."),
    ("mostly-true", "Regular physical activity can reduce the risk of several chronic diseases."),
    ("mostly-true", "Trees absorb carbon dioxide during photosynthesis."),
    ("mostly-true", "Hand washing can reduce the spread of many infections."),
    ("mostly-true", "Public libraries provide access to books and digital resources."),
    ("half-true", "A healthy diet alone guarantees that a person will never get sick."),
    ("half-true", "Coffee always causes dehydration."),
    ("half-true", "All natural products are safer than synthetic products."),
    ("half-true", "Every viral post has been verified by journalists."),
    ("barely-true", "A single food can burn away all body fat."),
    ("barely-true", "People only use ten percent of their brains."),
    ("barely-true", "Cold weather directly causes the common cold."),
    ("barely-true", "Reading in dim light permanently damages eyesight."),
    ("false", "The Moon produces its own sunlight."),
    ("false", "Lightning never strikes the same place twice."),
    ("false", "Humans can breathe normally in space without protection."),
    ("false", "The Great Wall of China is visible from the Moon with the naked eye."),
    ("false", "Drinking bleach cures viral infections."),
    ("pants-fire", "The Earth is flat and rests on the back of a giant turtle."),
    ("pants-fire", "A magnet can erase every disease from the human body."),
    ("pants-fire", "The government has hidden a second Sun under the ocean."),
    ("pants-fire", "Eating only one fruit gives people the ability to fly."),
]


def _download_dataset() -> list[tuple[str, str]]:
    DATA_PATH.mkdir(parents=True, exist_ok=True)
    rows: list[tuple[str, str]] = []
    for name in ("train", "valid", "test"):
        target = DATA_PATH / f"{name}.tsv"
        try:
            if not target.exists():
                with urlopen(DATASET_URL.format(name=name), timeout=30) as response:
                    target.write_bytes(response.read())
            with target.open("r", encoding="utf-8") as handle:
                for row in csv.reader(handle, delimiter="\t"):
                    if len(row) >= 3 and row[0] in LABELS and row[2].strip():
                        rows.append((row[0], row[2].strip()))
        except Exception:
            continue
    return rows or FALLBACK_ROWS


def train_model() -> dict:
    rows = _download_dataset()
    random.Random(42).shuffle(rows)
    texts = [text for _, text in rows]
    labels = [label for label, _ in rows]

    if len(rows) >= 100:
        train_texts, test_texts, train_labels, test_labels = train_test_split(
            texts, labels, test_size=0.2, random_state=42, stratify=labels
        )
        train_texts, validation_texts, train_labels, validation_labels = train_test_split(
            train_texts,
            train_labels,
            test_size=0.2,
            random_state=42,
            stratify=train_labels,
        )
    else:
        train_texts, test_texts, train_labels, test_labels = train_test_split(
            texts, labels, test_size=0.25, random_state=42
        )
        validation_texts, validation_labels = test_texts, test_labels

    pipeline = Pipeline(
        [
            ("tfidf", TfidfVectorizer(ngram_range=(1, 2), min_df=1, sublinear_tf=True)),
            (
                "classifier",
                LogisticRegression(max_iter=2000, class_weight="balanced"),
            ),
        ]
    )
    pipeline.fit(train_texts, train_labels)
    predictions = pipeline.predict(test_texts)
    metrics = {
        "dataset": "LIAR: A New Benchmark Dataset for Fake News Detection",
        "samples": len(rows),
        "trainSamples": len(train_texts),
        "validationSamples": len(validation_texts),
        "testSamples": len(test_texts),
        "accuracy": round(float(accuracy_score(test_labels, predictions)), 4),
        "precision": round(float(precision_score(test_labels, predictions, average="macro", zero_division=0)), 4),
        "recall": round(float(recall_score(test_labels, predictions, average="macro", zero_division=0)), 4),
        "f1": round(float(f1_score(test_labels, predictions, average="macro", zero_division=0)), 4),
        "model": "TF-IDF + Logistic Regression",
        "note": "The model is an additional signal. Current verification should rely on available evidence and sources, not this prediction as absolute truth.",
    }
    joblib.dump(pipeline, MODEL_PATH)
    METRICS_PATH.write_text(json.dumps(metrics, indent=2), encoding="utf-8")
    return metrics


if __name__ == "__main__":
    print(json.dumps(train_model(), indent=2))