# NeuroPredict — Running the App

## Prerequisites
- Python 3.10+
- Node.js 18+ (install from https://nodejs.org)

---

## 1. Backend Setup

```bash
cd backend

# Install dependencies
pip install -r backend_deps.txt

# Place your dataset files in backend/data/
#   demographics (1).xls   ← gait dataset
#   pd 234 voice.xlsx       ← voice dataset

# Train and save all models (one-time)
python train_and_save.py

# Start the API server
uvicorn main:app --reload --port 8000
```

The API will be live at: http://localhost:8000
Swagger docs at: http://localhost:8000/docs

---

## 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

The app will be live at: http://localhost:5173

---

## Usage

1. Open http://localhost:5173
2. Click **Try Predictor**
3. Upload your gait (`demographics.xls`) or voice (`pd 234 voice.xlsx`) dataset
4. Select LSTM, GRU, or Hybrid
5. Click **Run Prediction** — results appear with per-sequence confidence scores

---

## File Structure

```
parkinsons-multimodal-prediction-main/
├── backend/
│   ├── main.py              # FastAPI app
│   ├── pipeline.py          # Preprocessing pipeline
│   ├── train_and_save.py    # One-time training script
│   ├── backend_deps.txt
│   ├── data/                # ← place datasets here
│   └── models/              # ← trained .keras models saved here
└── frontend/
    ├── src/
    │   ├── pages/           # Landing.jsx, Predict.jsx
    │   └── components/      # All UI components
    ├── package.json
    └── vite.config.js       # Proxies /api → localhost:8000
```
