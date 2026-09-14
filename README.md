# Multimodal Parkinson's Disease Prediction Using Deep Learning

## Overview

A multimodal deep learning framework that fuses physiological stress signals, gait characteristics, and voice-related features to explore Parkinson's Disease (PD) classification. Implements and compares LSTM, GRU, and a hybrid LSTM-GRU architecture on both individual modalities and a fused representation.

> **Note:** This is exploratory research work on a small fused dataset (83 samples). Results should be read as a proof-of-concept for multimodal fusion methodology, not a validated diagnostic benchmark.

## Objectives

- Analyze physiological stress signals from the WESAD dataset
- Analyze gait-related patient characteristics for PD classification
- Analyze voice-related features associated with PD
- Preprocess and normalize features across modalities
- Apply sequence-based deep learning (LSTM, GRU) to each modality
- Construct a multimodal fusion dataset combining all three
- Develop and evaluate a hybrid LSTM-GRU model on the fused representation

## Multimodal Data

### 1. Physiological Stress Signals

The WESAD dataset is used to obtain chest physiological signals.

The implementation:
- Extracts chest signals from the WESAD S16 subject data
- Standardizes the physiological features using `StandardScaler`
- Converts the stress labels into a binary representation
- Downsamples the signals to reduce memory requirements
- Constructs temporal sequences for deep learning

### 2. Gait Data

Gait-related patient information is processed from an Excel dataset.

The implementation:
- Identifies Parkinson's Disease and control groups
- Removes non-feature columns
- Handles missing numerical values using mean imputation
- Applies `MinMaxScaler` for normalization
- Constructs sequential representations for model training

### 3. Voice Data

Voice measurements are processed from a Parkinson's voice dataset.

The implementation:
- Uses `total_UPDRS` to derive a binary target based on its median
- Removes subject identifiers, time information, and UPDRS target variables from the input features
- Standardizes the remaining features
- Downsamples the data to reduce computational requirements
- Constructs temporal sequences for LSTM and GRU models

## Multimodal Fusion

The processed representations from the physiological, gait, and voice modalities are combined into a single multimodal feature representation.

The implemented fusion process:
1. Downsamples the individual modality representations
2. Aligns the datasets using the minimum available sample length
3. Horizontally combines the three feature sets
4. Uses the gait-based PD/control labels for the fused classification task
5. Constructs temporal sequences from the fused representation

The resulting fusion dataset contains:

- 83 samples
- 36 combined features
- Sequence length: 30

## Deep Learning Models

### LSTM

- LSTM: 64 units
- Dense: 32 units with ReLU activation
- Dropout: 0.3
- Dense output: 1 unit with sigmoid activation

### GRU

- GRU: 64 units
- Dense: 32 units with ReLU activation
- Dropout: 0.3
- Dense output: 1 unit with sigmoid activation

### Hybrid LSTM-GRU

- LSTM: 64 units
- GRU: 64 units
- Dense: 32 units with ReLU activation
- Dropout: 0.3
- Dense output: 1 unit with sigmoid activation

The hybrid model is trained on the multimodal fusion representation.

## Experimental Results

For the multimodal fusion dataset, the implemented models achieved:

| Model | Accuracy |
|---|---:|
| LSTM | 81.82% |
| GRU | 81.82% |
| Hybrid LSTM-GRU | 81.82% |

Reported on the validation/test split used in the notebook. Given the small sample size (83 fused samples → ~17 test samples) and identical scores across architectures, these numbers should be treated as preliminary — a stratified k-fold cross-validation is a natural next step to confirm the results generalize rather than reflecting the specific split.

## Model Training

The models use:

- Optimizer: Adam
- Loss function: Binary Cross-Entropy
- Training epochs: 3
- Train-test split: 80:20
- Random state: 42

Downsampling is applied to computationally intensive modalities to make sequence generation and model training more memory-efficient.

## Technologies Used

- Python
- NumPy
- Pandas
- Scikit-learn
- TensorFlow
- Keras
- Jupyter Notebook
- Google Colab

## Repository Structure

```text
parkinsons-multimodal-dl/
│
├── multimodal_pd_fusion_pipeline.ipynb
├── requirements.txt
└── README.md
```

## Setup

```bash
git clone git@github.com:justinthomas11/parkinsons-multimodal-dl.git
cd parkinsons-multimodal-dl
pip install -r requirements.txt
jupyter notebook multimodal_pd_fusion_pipeline.ipynb
```

## Future Work

- Cross-validation to replace the single train/test split
- Larger, more diverse gait and voice cohorts
- Attention or interpretability layer (e.g., SHAP) to identify which modality drives predictions
- Ablation study isolating each modality's individual contribution to fused performance
