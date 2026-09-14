import { useEffect, useRef } from 'react'
import './AccuracyChart.css'

const MODELS = [
  { name: 'LSTM',            acc: 81.82, color: '#4F46E5' },
  { name: 'GRU',             acc: 81.82, color: '#7C3AED' },
  { name: 'Hybrid LSTM-GRU', acc: 81.82, color: '#06B6D4' },
]

export default function AccuracyChart() {
  const barsRef = useRef([])

  useEffect(() => {
    // Animate bars after mount
    const timer = setTimeout(() => {
      barsRef.current.forEach((bar, i) => {
        if (bar) bar.style.width = `${MODELS[i].acc}%`
      })
    }, 200)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="accuracy-chart card">
      <h3 className="chart-title">Fusion Model Accuracy</h3>
      <p className="chart-subtitle text-muted text-small">
        Results on the multimodal fusion dataset (83 samples, 36 features, sequence length 30)
      </p>

      <div className="chart-rows">
        {MODELS.map(({ name, acc, color }, i) => (
          <div key={name} className="chart-row">
            <div className="chart-label">{name}</div>
            <div className="chart-bar-wrap">
              <div
                className="chart-bar-track progress-track"
                style={{ flex: 1 }}
              >
                <div
                  ref={el => barsRef.current[i] = el}
                  className="chart-bar-fill progress-fill"
                  style={{ width: '0%', background: color, transition: `width 1s ${i * 0.2 + 0.2}s cubic-bezier(.4,0,.2,1)` }}
                />
              </div>
              <span className="chart-value" style={{ color }}>
                {acc.toFixed(2)}%
              </span>
            </div>
          </div>
        ))}
      </div>

      <p className="chart-note text-muted text-small">
        * Trained on fused physiological + gait + voice features with 80/20 train-test split
      </p>
    </div>
  )
}
