# Multimodal Parkinson's Disease Prediction Using Deep Learning

## Overview

This project presents a multimodal deep learning framework for Parkinson's Disease (PD) analysis by combining information from physiological stress signals, gait characteristics, and voice-related features.

The project explores Long Short-Term Memory (LSTM), Gated Recurrent Unit (GRU), and a hybrid LSTM-GRU architecture for learning temporal patterns from individual modalities and their fused representation.

## Objectives

- Analyze physiological signals associated with stress using the WESAD dataset.
- Analyze gait-related patient characteristics for Parkinson's Disease classification.
- Analyze voice-related features associated with Parkinson's Disease.
- Preprocess and normalize features from different modalities.
- Apply sequence-based deep learning models using LSTM and GRU.
- Construct a multimodal fusion dataset by combining features from the three modalities.
- Develop a hybrid LSTM-GRU model for multimodal prediction.

## Multimodal Data

The framework incorporates three modalities:

### 1. Physiological Stress Signals

The WESAD dataset is used to obtain chest physiological signals.

The implementation:
- Extracts chest signals from the WESAD S16 subject data.
- Standardizes the physiological features using `StandardScaler`.
- Converts the stress labels into a binary representation.
- Downsamples the signals to reduce memory requirements.
- Constructs temporal sequences for deep learning.

### 2. Gait Data

Gait-related patient information is processed from an Excel dataset.

The implementation:
- Identifies Parkinson's Disease and control groups.
- Removes non-feature columns.
- Handles missing numerical values using mean imputation.
- Applies `MinMaxScaler` for normalization.
- Constructs sequential representations for model training.

### 3. Voice Data

Voice measurements are processed from a Parkinson's voice dataset.

The implementation:
- Uses `total_UPDRS` to derive a binary target based on its median.
- Removes subject identifiers, time information, and UPDRS target variables from the input features.
- Standardizes the remaining features.
- Downsamples the data to reduce computational requirements.
- Constructs temporal sequences for LSTM and GRU models.

## Multimodal Fusion

The processed representations from the physiological, gait, and voice modalities are combined into a single multimodal feature representation.

The implemented fusion process:
1. Downsamples the individual modality representations.
2. Aligns the datasets using the minimum available sample length.
3. Horizontally combines the three feature sets.
4. Uses the gait-based PD/control labels for the fused classification task.
5. Constructs temporal sequences from the fused representation.

The resulting fusion dataset contains:

- 83 samples
- 36 combined features
- Sequence length: 30

## Deep Learning Models

### LSTM

An LSTM network is used to learn temporal dependencies within the multimodal feature sequences.

Architecture:

- LSTM: 64 units
- Dense: 32 units with ReLU activation
- Dropout: 0.3
- Dense output: 1 unit with sigmoid activation

### GRU

A GRU network is implemented using a similar architecture:

- GRU: 64 units
- Dense: 32 units with ReLU activation
- Dropout: 0.3
- Dense output: 1 unit with sigmoid activation

### Hybrid LSTM-GRU

A hybrid architecture combines LSTM and GRU layers sequentially:

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

The reported results are based on the validation/test split used in the notebook.

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
parkinsons-multimodal-prediction/
│
├── PD_COPYRIGHT_COMPLETED_ACC.ipynb
├── requirements.txt
└── README.md
