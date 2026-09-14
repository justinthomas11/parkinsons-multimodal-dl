"""
main.py — FastAPI backend for the Parkinson's Disease Prediction app.

Start with:
    uvicorn main:app --reload --port 8000

Endpoints:
    GET  /api/health          — health check
    POST /api/predict         — CSV/XLS upload + model selection → predictions
"""

import io
import os
import json
import pickle
import traceback
from typing import Literal

import numpy as np
import pandas as pd
from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# tensorflow / keras — lazy import inside predict to keep startup fast
import tensorflow as tf

from pipeline import detect_dataset_type, process_gait, process_voice, load_scaler

# ── App setup ────────────────────────────────────────────────────────────────────
app = FastAPI(title="PD Prediction API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODELS_DIR = os.getenv("MODELS_DIR", "models")

# ── Model / scaler cache ──────────────────────────────────────────────────────────
_model_cache: dict[str, tf.keras.Model] = {}
_scaler_cache: dict[str, object] = {}


def _get_model(key: str) -> tf.keras.Model:
    if key not in _model_cache:
        path = os.path.join(MODELS_DIR, f"{key}.keras")
        if not os.path.exists(path):
            raise HTTPException(
                status_code=503,
                detail=f"Model file '{path}' not found. Run train_and_save.py first.",
            )
        _model_cache[key] = tf.keras.models.load_model(path)
    return _model_cache[key]


def _get_scaler(key: str):
    if key not in _scaler_cache:
        path = os.path.join(MODELS_DIR, f"{key}_scaler.pkl")
        if not os.path.exists(path):
            raise HTTPException(
                status_code=503,
                detail=f"Scaler file '{path}' not found. Run train_and_save.py first.",
            )
        _scaler_cache[key] = load_scaler(path)
    return _scaler_cache[key]


# ── Endpoints ────────────────────────────────────────────────────────────────────
@app.get("/api/health")
def health():
    return {"status": "ok", "models_dir": MODELS_DIR}


@app.post("/api/predict")
async def predict(
    file: UploadFile = File(...),
    model: str = Form("lstm"),          # lstm | gru | hybrid
):
    """
    Accept a gait or voice CSV/XLS file, run the real preprocessing pipeline,
    run model inference, and return per-row predictions with confidence scores.
    """
    # ── Read uploaded file ────────────────────────────────────────────────────
    content = await file.read()
    filename = file.filename or ""

    try:
        if filename.endswith(".csv"):
            df = pd.read_csv(io.BytesIO(content))
        elif filename.endswith((".xls", ".xlsx")):
            df = pd.read_excel(io.BytesIO(content))
        else:
            raise HTTPException(status_code=400, detail="File must be .csv, .xls, or .xlsx")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not parse file: {e}")

    # ── Detect dataset type ───────────────────────────────────────────────────
    try:
        dataset_type = detect_dataset_type(df)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # ── Validate model name ───────────────────────────────────────────────────
    model = model.lower()
    if model not in ("lstm", "gru", "hybrid"):
        raise HTTPException(status_code=400, detail="model must be one of: lstm, gru, hybrid")

    model_key = f"{dataset_type}_{model}"

    # ── Preprocess ────────────────────────────────────────────────────────────
    try:
        scaler = _get_scaler(dataset_type)
        if dataset_type == "gait":
            X_seq, y_seq, _ = process_gait(df, scaler=scaler)
            seq_len = 10
        else:
            X_seq, y_seq, _ = process_voice(df, scaler=scaler)
            seq_len = 20
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Preprocessing error: {e}\n{traceback.format_exc()}")

    if len(X_seq) == 0:
        raise HTTPException(status_code=400, detail="No sequences could be built — dataset too small.")

    # ── Inference ─────────────────────────────────────────────────────────────
    try:
        keras_model = _get_model(model_key)
        raw_probs = keras_model.predict(X_seq, verbose=0).flatten()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {e}")

    # ── Build response ────────────────────────────────────────────────────────
    predictions = (raw_probs >= 0.5).astype(int).tolist()
    confidence  = (raw_probs * 100).round(2).tolist()
    true_labels = y_seq.tolist() if y_seq is not None else []

    pd_count      = int(sum(predictions))
    control_count = int(len(predictions) - pd_count)

    # Accuracy vs ground truth labels (if available)
    accuracy = None
    if len(true_labels) == len(predictions):
        correct = sum(p == t for p, t in zip(predictions, true_labels))
        accuracy = round(correct / len(predictions) * 100, 2)

    return {
        "dataset_type": dataset_type,
        "model": model,
        "total_sequences": len(predictions),
        "pd_count": pd_count,
        "control_count": control_count,
        "accuracy": accuracy,
        "predictions": predictions,
        "confidence": confidence,
        "true_labels": true_labels,
    }
