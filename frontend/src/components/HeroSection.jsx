import { Link } from 'react-router-dom'
import './HeroSection.css'

const STATS = [
  { icon: '🎯', value: '81.82%', label: 'Fusion Accuracy' },
  { icon: '🧬', value: '3', label: 'Modalities Fused' },
  { icon: '🤖', value: '3', label: 'DL Architectures' },
  { icon: '📊', value: '36', label: 'Fused Features' },
]

export default function HeroSection() {
  return (
    <section className="hero">
      {/* Decorative blobs */}
      <div className="hero-blob hero-blob-1" aria-hidden="true" />
      <div className="hero-blob hero-blob-2" aria-hidden="true" />

      <div className="container hero-inner">
        <div className="hero-content fade-up">
          <span className="badge badge-primary">Deep Learning · Parkinson's Research</span>

          <h1 className="hero-title">
            Multimodal<br />
            <span className="hero-title-gradient">Parkinson's Prediction</span>
          </h1>

          <p className="hero-subtitle">
            A deep learning framework fusing physiological stress signals, gait characteristics,
            and voice biomarkers to predict Parkinson's Disease with{' '}
            <strong>LSTM, GRU, and Hybrid LSTM-GRU</strong> architectures.
          </p>

          <div className="hero-actions">
            <Link to="/predict" className="btn btn-primary btn-lg">
              Try the Predictor →
            </Link>
            <a href="#how-it-works" className="btn btn-ghost btn-lg">
              Learn More
            </a>
          </div>
        </div>

        {/* Stats row */}
        <div className="hero-stats fade-up fade-up-d2">
          {STATS.map(({ icon, value, label }) => (
            <div key={label} className="stat-pill">
              <div className="stat-icon">{icon}</div>
              <div>
                <div className="stat-value">{value}</div>
                <div className="stat-label">{label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
