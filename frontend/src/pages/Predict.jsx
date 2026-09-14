import { useState } from 'react'
import FileUploader from '../components/FileUploader'
import ModelSelector from '../components/ModelSelector'
import PredictionTable from '../components/PredictionTable'
import ConfidenceChart from '../components/ConfidenceChart'
import LoadingSpinner from '../components/LoadingSpinner'
import './Predict.css'

const STEPS = ['Upload', 'Select Model', 'Results']

function SummaryCard({ icon, label, value, color }) {
  return (
    <div className="summary-card" style={{ '--card-accent': color }}>
      <div className="summary-card-icon">{icon}</div>
      <div className="summary-card-value" style={{ color }}>{value}</div>
      <div className="summary-card-label">{label}</div>
    </div>
  )
}

export default function Predict() {
  const [step, setStep]         = useState(0)  // 0=upload, 1=model, 2=results
  const [file, setFile]         = useState(null)
  const [model, setModel]       = useState('lstm')
  const [loading, setLoading]   = useState(false)
  const [results, setResults]   = useState(null)
  const [error, setError]       = useState(null)

  async function runPrediction() {
    if (!file) return
    setLoading(true)
    setError(null)
    setResults(null)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('model', model)

    try {
      const apiUrl = import.meta.env.VITE_API_URL
        ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api/predict`
        : '/api/predict'
      const res = await fetch(apiUrl, { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) {
        setError(data.detail || 'Server error. Please check the backend is running.')
      } else {
        setResults(data)
        setStep(2)
      }
    } catch (e) {
      setError('Could not connect to the backend. Make sure the FastAPI server is running on port 8000.')
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setStep(0)
    setFile(null)
    setModel('lstm')
    setResults(null)
    setError(null)
  }

  const canAdvance = step === 0 ? !!file : step === 1 ? true : false

  return (
    <main className="predict-page">
      <div className="container-sm">

        {/* ── Page header ─────────────────────────────────────── */}
        <div className="predict-header">
          <h1 className="predict-title">PD Prediction</h1>
          <p className="predict-subtitle text-muted">
            Upload a gait or voice dataset and run real model inference.
          </p>
        </div>

        {/* ── Step indicator ──────────────────────────────────── */}
        <div className="step-indicator" aria-label="Progress steps">
          {STEPS.map((label, i) => (
            <div key={label} className="step-item">
              <div className={`step-circle ${i < step ? 'done' : i === step ? 'active' : ''}`}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className={`step-label ${i === step ? 'active' : ''}`}>{label}</span>
              {i < STEPS.length - 1 && (
                <div className={`step-connector ${i < step ? 'done' : ''}`} aria-hidden="true" />
              )}
            </div>
          ))}
        </div>

        {/* ── Step 0: Upload ──────────────────────────────────── */}
        {step === 0 && (
          <div className="step-panel fade-up">
            <div className="step-panel-head">
              <h2 className="step-panel-title">Upload your dataset</h2>
              <p className="text-muted text-small">
                Supports gait (demographics) or voice (UPDRS) Excel/CSV files.
                The server will auto-detect the modality.
              </p>
            </div>

            <FileUploader onFile={setFile} />

            <div className="step-info-box">
              <p className="text-small text-muted">
                <strong>Gait dataset</strong> — should include columns like <code>Group</code>,
                <code>Age</code>, <code>Duration</code> and numeric gait features.
              </p>
              <p className="text-small text-muted" style={{ marginTop: 'var(--sp-2)' }}>
                <strong>Voice dataset</strong> — should include <code>total_UPDRS</code>,
                <code>Jitter(%)</code>, <code>Shimmer</code>, <code>NHR</code>, <code>HNR</code>, etc.
              </p>
            </div>

            <div className="step-actions">
              <button
                type="button"
                className="btn btn-primary"
                disabled={!canAdvance}
                onClick={() => setStep(1)}
              >
                Next: Select Model →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 1: Model selection ──────────────────────────── */}
        {step === 1 && (
          <div className="step-panel fade-up">
            <div className="step-panel-head">
              <h2 className="step-panel-title">Choose a model</h2>
              <p className="text-muted text-small">
                All three architectures use 64 recurrent units → Dense 32 → Dropout 0.3 → Sigmoid output.
              </p>
            </div>

            <ModelSelector selected={model} onChange={setModel} />

            {error && (
              <div className="error-banner">
                <span>⚠️</span>
                <p>{error}</p>
              </div>
            )}

            <div className="step-actions">
              <button type="button" className="btn btn-ghost" onClick={() => { setStep(0); setError(null) }}>
                ← Back
              </button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={loading}
                onClick={runPrediction}
              >
                {loading ? 'Running…' : 'Run Prediction →'}
              </button>
            </div>

            {loading && <LoadingSpinner message="Preprocessing data and running inference…" />}
          </div>
        )}

        {/* ── Step 2: Results ──────────────────────────────────── */}
        {step === 2 && results && (
          <div className="step-panel fade-up">
            <div className="results-header">
              <div>
                <h2 className="step-panel-title">Results</h2>
                <p className="text-muted text-small">
                  Dataset: <strong>{results.dataset_type}</strong> ·
                  Model: <strong>{results.model.toUpperCase()}</strong> ·
                  {results.accuracy != null && (
                    <> Accuracy: <strong>{results.accuracy}%</strong></>
                  )}
                </p>
              </div>
              <button type="button" className="btn btn-ghost btn-sm" onClick={reset}>
                ↩ Run Again
              </button>
            </div>

            {/* Summary cards */}
            <div className="summary-cards">
              <SummaryCard
                icon="🔬"
                label="Total Sequences"
                value={results.total_sequences}
                color="var(--clr-primary)"
              />
              <SummaryCard
                icon="🔴"
                label="PD Detected"
                value={results.pd_count}
                color="var(--clr-danger)"
              />
              <SummaryCard
                icon="🟢"
                label="Control"
                value={results.control_count}
                color="var(--clr-success)"
              />
              {results.accuracy != null && (
                <SummaryCard
                  icon="🎯"
                  label="Accuracy"
                  value={`${results.accuracy}%`}
                  color="var(--clr-warning)"
                />
              )}
            </div>

            {/* Confidence histogram */}
            <ConfidenceChart
              confidence={results.confidence}
              predictions={results.predictions}
            />

            {/* Per-row table */}
            <PredictionTable
              predictions={results.predictions}
              confidence={results.confidence}
              trueLabels={results.true_labels || []}
            />

            {/* Disclaimer */}
            <div className="disclaimer">
              ⚠️ <strong>Research tool only.</strong> These predictions are from a model trained on limited
              data and are not validated for clinical use. Do not use for medical diagnosis.
            </div>
          </div>
        )}

      </div>
    </main>
  )
}
