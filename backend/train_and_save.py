"""
train_and_save.py — One-time training script.

Run this once with your dataset files to train all models and save them.
Set the paths below or use environment variables.

Usage:
    python train_and_save.py

Outputs to backend/models/:
    gait_lstm.keras    gait_gru.keras    gait_hybrid.keras
    voice_lstm.keras   voice_gru.keras   voice_hybrid.keras
    gait_scaler.pkl    voice_scaler.pkl
"""

import os
import sys
import io

# Ensure UTF-8 output on Windows consoles
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, GRU, Dense, Dropout, Input

from pipeline import process_gait, process_voice, save_scaler

def _find_file(candidates):
    for path in candidates:
        if path and os.path.exists(path):
            return os.path.abspath(path)
    return None

GAIT_CANDIDATES = [
    os.getenv("GAIT_PATH", ""),
    "data/demographics.xls",
    "data/demographics (1).xls",
    "backend/data/demographics.xls",
    "backend/data/demographics (1).xls",
]
VOICE_CANDIDATES = [
    os.getenv("VOICE_PATH", ""),
    "data/parkinsons_updrs.data",
    "data/pd 234 voice.xlsx",
    "data/parkinsons_updrs.csv",
    "backend/data/parkinsons_updrs.data",
    "backend/data/pd 234 voice.xlsx",
    "backend/data/parkinsons_updrs.csv",
]

GAIT_PATH = _find_file(GAIT_CANDIDATES)
VOICE_PATH = _find_file(VOICE_CANDIDATES)
MODELS_DIR = os.getenv("MODELS_DIR", os.path.join(os.path.dirname(os.path.abspath(__file__)), "models"))

os.makedirs(MODELS_DIR, exist_ok=True)

EPOCHS     = 10   # Increased from notebook's 3 for better convergence
BATCH_SIZE = 16
TEST_SIZE  = 0.2
RANDOM     = 42


# ── Model builders ───────────────────────────────────────────────────────────────
def build_lstm(seq_len, n_features):
    model = Sequential([
        Input(shape=(seq_len, n_features)),
        LSTM(64),
        Dense(32, activation="relu"),
        Dropout(0.3),
        Dense(1, activation="sigmoid"),
    ], name="lstm")
    model.compile(optimizer="adam", loss="binary_crossentropy", metrics=["accuracy"])
    return model


def build_gru(seq_len, n_features):
    model = Sequential([
        Input(shape=(seq_len, n_features)),
        GRU(64),
        Dense(32, activation="relu"),
        Dropout(0.3),
        Dense(1, activation="sigmoid"),
    ], name="gru")
    model.compile(optimizer="adam", loss="binary_crossentropy", metrics=["accuracy"])
    return model


def build_hybrid(seq_len, n_features):
    model = Sequential([
        Input(shape=(seq_len, n_features)),
        LSTM(64, return_sequences=True),
        GRU(64),
        Dense(32, activation="relu"),
        Dropout(0.3),
        Dense(1, activation="sigmoid"),
    ], name="hybrid_lstm_gru")
    model.compile(optimizer="adam", loss="binary_crossentropy", metrics=["accuracy"])
    return model


def train_and_save_all(X_seq, y_seq, prefix: str, seq_len: int):
    """Train LSTM, GRU, Hybrid on the given sequences and save."""
    n_features = X_seq.shape[2]
    X_train, X_test, y_train, y_test = train_test_split(
        X_seq, y_seq, test_size=TEST_SIZE, random_state=RANDOM
    )

    results = {}
    for name, builder in [("lstm", build_lstm), ("gru", build_gru), ("hybrid", build_hybrid)]:
        print(f"\n[TRAIN] Training {prefix.upper()} -- {name.upper()}...")
        model = builder(seq_len, n_features)
        model.fit(
            X_train, y_train,
            validation_data=(X_test, y_test),
            epochs=EPOCHS,
            batch_size=BATCH_SIZE,
            verbose=1,
        )
        _, acc = model.evaluate(X_test, y_test, verbose=0)
        out_path = os.path.join(MODELS_DIR, f"{prefix}_{name}.keras")
        model.save(out_path)
        print(f"[SAVED] {out_path}  |  Test accuracy: {acc:.4f}")
        results[name] = acc

    return results


# ── Main ─────────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    all_results = {}

    # ── Gait ──────────────────────────────────────────────────────────────────
    if GAIT_PATH and os.path.exists(GAIT_PATH):
        print(f"\n[DATA] Loading gait data from: {GAIT_PATH}")
        df_gait = pd.read_excel(GAIT_PATH) if GAIT_PATH.endswith((".xls", ".xlsx")) else pd.read_csv(GAIT_PATH)
        X_gait, y_gait, gait_scaler = process_gait(df_gait)
        save_scaler(gait_scaler, os.path.join(MODELS_DIR, "gait_scaler.pkl"))
        print(f"   Sequences: {X_gait.shape}, Labels: {y_gait.shape}")
        all_results["gait"] = train_and_save_all(X_gait, y_gait, "gait", seq_len=10)
    else:
        print(f"[WARN] Gait dataset not found -- checked candidates. Skipping.")

    # ── Voice ──────────────────────────────────────────────────────────────────
    if VOICE_PATH and os.path.exists(VOICE_PATH):
        print(f"\n[DATA] Loading voice data from: {VOICE_PATH}")
        df_voice = pd.read_excel(VOICE_PATH) if VOICE_PATH.endswith((".xls", ".xlsx")) else pd.read_csv(VOICE_PATH)
        X_voice, y_voice, voice_scaler = process_voice(df_voice)
        save_scaler(voice_scaler, os.path.join(MODELS_DIR, "voice_scaler.pkl"))
        print(f"   Sequences: {X_voice.shape}, Labels: {y_voice.shape}")
        all_results["voice"] = train_and_save_all(X_voice, y_voice, "voice", seq_len=20)
    else:
        print(f"[WARN] Voice dataset not found -- checked candidates. Skipping.")

    # ── Summary ────────────────────────────────────────────────────────────────
    print("\n" + "=" * 45)
    print("[RESULTS] FINAL ACCURACIES")
    print("=" * 45)
    for modality, scores in all_results.items():
        for model_name, acc in scores.items():
            print(f"  {modality.upper():6s} | {model_name.upper():8s} | {acc*100:.2f}%")
    print("=" * 45)
    print("\n[DONE] All models saved to:", MODELS_DIR)
