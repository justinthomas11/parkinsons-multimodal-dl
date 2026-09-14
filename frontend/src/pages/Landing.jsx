import HeroSection from '../components/HeroSection'
import ModalityCard from '../components/ModalityCard'
import AccuracyChart from '../components/AccuracyChart'
import { Link } from 'react-router-dom'
import './Landing.css'

const MODALITIES = [
  {
    icon: '📈',
    title: 'Physiological Signals',
    dataset: 'WESAD (S16)',
    features: '8',
    description:
      'Chest-worn sensor signals including ECG, EDA, EMG, respiration, and temperature from the WESAD stress dataset, standardized and sequenced for LSTM/GRU training.',
    accent: '#4F46E5',
  },
  {
    icon: '🦶',
    title: 'Gait Analysis',
    dataset: 'demographics.xls',
    features: '10',
    description:
      "Patient demographic and gait characteristics distinguishing Parkinson's Disease from control groups. Features are mean-imputed and MinMax-scaled into sequences of length 10.",
    accent: '#7C3AED',
  },
  {
    icon: '🎙️',
    title: 'Voice Biomarkers',
    dataset: 'pd 234 voice.xlsx',
    features: '18',
    description:
      'Voice measurements including MDVP jitter, shimmer, NHR, HNR, RPDE, and DFA extracted from sustained phonations. StandardScaler-normalized with sequences of length 20.',
    accent: '#06B6D4',
  },
]

const HOW_STEPS = [
  { icon: '📂', step: '01', title: 'Upload Dataset', desc: 'Drop your gait or voice CSV/XLS file. The backend auto-detects the modality from column headers.' },
  { icon: '⚙️', step: '02', title: 'Preprocess', desc: "Data is scaled using the fitted scaler and sliced into temporal sequences matching the model's expected input shape." },
  { icon: '🧠', step: '03', title: 'Model Inference', desc: 'Your chosen LSTM, GRU, or Hybrid model runs a forward pass on each sequence and outputs a PD probability.' },
  { icon: '📊', step: '04', title: 'Results', desc: 'Per-sequence predictions, confidence scores, and an accuracy summary are returned with downloadable CSV export.' },
]

const ARCH_LAYERS = [
  { label: 'Input',   sub: 'shape (30, 36)',   color: '#EEF2FF', border: '#C7D2FE' },
  { label: 'LSTM',    sub: '64 units',          color: '#EDE9FE', border: '#A5B4FC' },
  { label: 'GRU',     sub: '64 units',          color: '#F5F3FF', border: '#DDD6FE' },
  { label: 'Dense',   sub: '32 units · ReLU',   color: '#EFF6FF', border: '#BFDBFE' },
  { label: 'Dropout', sub: 'p = 0.3',           color: '#F0FDF4', border: '#BBF7D0' },
  { label: 'Output',  sub: '1 unit · Sigmoid',  color: '#FEF3C7', border: '#FDE68A' },
]

const TECH = [
  { icon: '🐍', name: 'Python' },
  { icon: '🔶', name: 'TensorFlow' },
  { icon: '🧬', name: 'Keras' },
  { icon: '📐', name: 'scikit-learn' },
  { icon: '🐼', name: 'Pandas' },
  { icon: '🔢', name: 'NumPy' },
  { icon: '⚡', name: 'FastAPI' },
  { icon: '⚛️', name: 'React' },
]

export default function Landing() {
  return (
    <main>
      <HeroSection />

      {/* ── How It Works ─────────────────────────────────────── */}
      <section className="section" id="how-it-works">
        <div className="container text-center">
          <p className="section-label">Pipeline</p>
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">
            From raw patient data to a Parkinson's Disease prediction in four steps.
          </p>

          <div className="how-steps">
            {HOW_STEPS.map(({ icon, step, title, desc }, i) => (
              <div key={step} className="how-step fade-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="how-step-num">{step}</div>
                <div className="how-step-icon">{icon}</div>
                <h3 className="how-step-title">{title}</h3>
                <p className="how-step-desc text-muted">{desc}</p>
                {i < HOW_STEPS.length - 1 && (
                  <div className="how-step-arrow" aria-hidden="true">→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Modalities ────────────────────────────────────────── */}
      <section className="section" style={{ background: 'var(--clr-surface-2)' }}>
        <div className="container">
          <div className="text-center" style={{ marginBottom: 'var(--sp-12)' }}>
            <p className="section-label">Data Sources</p>
            <h2 className="section-title">Three Modalities, One Prediction</h2>
            <p className="section-subtitle">
              Features from three independent biomedical data sources are fused into a single
              36-feature representation for multimodal deep learning.
            </p>
          </div>

          <div className="grid-3">
            {MODALITIES.map(m => <ModalityCard key={m.title} {...m} />)}
          </div>

          {/* Fusion row */}
          <div className="fusion-banner">
            <span className="fusion-eq">Physiological (8)</span>
            <span className="fusion-op">⊕</span>
            <span className="fusion-eq">Gait (10)</span>
            <span className="fusion-op">⊕</span>
            <span className="fusion-eq">Voice (18)</span>
            <span className="fusion-arrow">→</span>
            <span className="badge badge-primary fusion-result">Fused: 36 features</span>
          </div>
        </div>
      </section>

      {/* ── Results + Architecture ────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="results-grid">
            <div>
              <p className="section-label">Performance</p>
              <h2 className="section-title" style={{ fontSize: 'var(--text-3xl)' }}>
                Model Results
              </h2>
              <p className="text-muted" style={{ marginBottom: 'var(--sp-8)' }}>
                All three architectures achieve consistent accuracy on the fused multimodal dataset,
                with the Hybrid model showing the most stable training dynamics.
              </p>
              <AccuracyChart />
            </div>

            <div>
              <p className="section-label">Architecture</p>
              <h2 className="section-title" style={{ fontSize: 'var(--text-3xl)' }}>
                Hybrid LSTM-GRU
              </h2>
              <p className="text-muted" style={{ marginBottom: 'var(--sp-8)' }}>
                The hybrid architecture stacks an LSTM layer (for capturing long-term dependencies)
                with a GRU layer (for efficient gating), followed by dense classification layers.
              </p>
              <div className="arch-diagram">
                {ARCH_LAYERS.map(({ label, sub, color, border }) => (
                  <div
                    key={label}
                    className="arch-layer"
                    style={{ background: color, borderColor: border }}
                  >
                    <span className="arch-layer-name">{label}</span>
                    <span className="arch-layer-sub text-muted text-small">{sub}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Tech Stack ────────────────────────────────────────── */}
      <section className="section" style={{ background: 'var(--clr-surface-2)' }}>
        <div className="container text-center">
          <p className="section-label">Built With</p>
          <h2 className="section-title">Technology Stack</h2>
          <div className="tech-grid">
            {TECH.map(({ icon, name }) => (
              <div key={name} className="tech-chip">
                <span>{icon}</span>
                <span>{name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section className="section">
        <div className="container text-center">
          <div className="cta-box">
            <h2 className="cta-title">Ready to Run a Prediction?</h2>
            <p className="section-subtitle" style={{ marginBottom: 'var(--sp-8)' }}>
              Upload your gait or voice dataset and get per-sequence Parkinson's Disease predictions
              from a real trained deep learning model.
            </p>
            <Link to="/predict" className="btn btn-primary btn-lg">
              Open Predictor →
            </Link>
            <p style={{ marginTop: 'var(--sp-5)', fontSize: 'var(--text-sm)', color: 'var(--clr-text-3)' }}>
              ⚠️ Research tool only. Not for clinical diagnosis.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container">
          <span>🧠 NeuroPredict · Multimodal Parkinson's Disease Prediction</span>
          <span>Research project · Not a medical device</span>
        </div>
      </footer>
    </main>
  )
}
