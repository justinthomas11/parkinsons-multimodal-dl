"""
pipeline.py — Preprocessing pipeline extracted from the notebook.
Handles gait and voice modality data, building sequences ready for model inference.
"""

import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler, MinMaxScaler
import pickle
import os

# ── Column signatures to auto-detect dataset type ──────────────────────────────
GAIT_REQUIRED_COLS = {"Age", "Duration"}          # cols always in the gait sheet
VOICE_REQUIRED_COLS = {"Jitter(%)", "Shimmer"}    # cols always in the voice sheet

# Voice columns to drop before scaling (match notebook)
VOICE_DROP_COLS = ["subject#", "test_time", "motor_UPDRS", "total_UPDRS"]
# Gait columns to drop before scaling (match notebook)
GAIT_DROP_COLS = ["ID", "Study", "Group", "Gender"]


def detect_dataset_type(df: pd.DataFrame) -> str:
    """Return 'gait', 'voice', or raise ValueError."""
    cols = set(df.columns)
    if GAIT_REQUIRED_COLS.issubset(cols) or "Group" in cols:
        return "gait"
    if VOICE_REQUIRED_COLS.issubset(cols) or "Jitter(%)" in cols or "NHR" in cols:
        return "voice"
    raise ValueError(
        "Could not detect dataset type. Ensure your file has gait or voice columns."
    )


# ── Gait pipeline ───────────────────────────────────────────────────────────────
def process_gait(df: pd.DataFrame, scaler=None, seq_len: int = 10):
    """
    Replicate notebook gait preprocessing:
      - Drop ID/Study/Group/Gender columns
      - Mean-impute missing values
      - MinMaxScaler
      - Build sliding sequences of length seq_len
    Returns (X_seq, y, scaler)
    """
    # Extract labels before dropping Group
    if "Group" in df.columns:
        y = (df["Group"].str.strip().str.upper() == "PD").astype(int).values
    else:
        y = np.zeros(len(df), dtype=int)

    # Drop non-feature columns (ignore missing)
    drop = [c for c in GAIT_DROP_COLS if c in df.columns]
    X = df.drop(columns=drop)

    # Fill missing with column mean
    X = X.fillna(X.mean(numeric_only=True))
    X = X.select_dtypes(include=[np.number])

    # Scale
    if scaler is None:
        scaler = MinMaxScaler()
        X_scaled = scaler.fit_transform(X)
    else:
        X_scaled = scaler.transform(X)

    # Build sequences
    X_seq, y_seq = _build_sequences(X_scaled, y, seq_len)
    return X_seq, y_seq, scaler


# ── Voice pipeline ───────────────────────────────────────────────────────────────
def process_voice(df: pd.DataFrame, scaler=None, seq_len: int = 20):
    """
    Replicate notebook voice preprocessing:
      - Drop subject#/test_time/motor_UPDRS/total_UPDRS
      - StandardScaler
      - Downsample ÷2
      - Build sliding sequences of length seq_len
    Returns (X_seq, y, scaler)
    """
    # Labels: above median total_UPDRS → 1
    if "total_UPDRS" in df.columns:
        threshold = df["total_UPDRS"].median()
        y = (df["total_UPDRS"] > threshold).astype(int).values
    else:
        y = np.zeros(len(df), dtype=int)

    # Drop metadata columns (ignore missing)
    drop = [c for c in VOICE_DROP_COLS if c in df.columns]
    X = df.drop(columns=drop)
    X = X.select_dtypes(include=[np.number])

    # Scale
    if scaler is None:
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)
    else:
        X_scaled = scaler.transform(X)

    # Downsample ÷2 to match notebook
    X_scaled = X_scaled[::2]
    y = y[::2]

    # Build sequences
    X_seq, y_seq = _build_sequences(X_scaled, y, seq_len)
    return X_seq, y_seq, scaler


# ── Shared helpers ───────────────────────────────────────────────────────────────
def _build_sequences(X: np.ndarray, y: np.ndarray, seq_len: int):
    """Sliding window sequence builder."""
    if len(X) <= seq_len:
        raise ValueError(
            f"Dataset too small to build sequences of length {seq_len}. "
            f"Need at least {seq_len + 1} rows, got {len(X)}."
        )
    X_seq, y_seq = [], []
    for i in range(len(X) - seq_len):
        X_seq.append(X[i : i + seq_len])
        y_seq.append(y[i + seq_len])
    return np.array(X_seq), np.array(y_seq)


def save_scaler(scaler, path: str):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "wb") as f:
        pickle.dump(scaler, f)


def load_scaler(path: str):
    with open(path, "rb") as f:
        return pickle.load(f)
