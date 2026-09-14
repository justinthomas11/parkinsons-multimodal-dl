import './ModelSelector.css'

const MODELS = [
  {
    id: 'lstm',
    name: 'LSTM',
    full: 'Long Short-Term Memory',
    icon: '🔁',
    desc: '64-unit LSTM captures long-range temporal dependencies in sequential data.',
  },
  {
    id: 'gru',
    name: 'GRU',
    full: 'Gated Recurrent Unit',
    icon: '⚡',
    desc: 'Lightweight GRU with fewer parameters, faster training and competitive accuracy.',
  },
  {
    id: 'hybrid',
    name: 'Hybrid',
    full: 'LSTM + GRU',
    icon: '🔀',
    desc: 'LSTM followed by GRU — combines long-range memory with efficient gating.',
  },
]

export default function ModelSelector({ selected, onChange }) {
  return (
    <div className="model-selector">
      {MODELS.map(m => (
        <button
          key={m.id}
          type="button"
          className={`model-option ${selected === m.id ? 'selected' : ''}`}
          onClick={() => onChange(m.id)}
          aria-pressed={selected === m.id}
          id={`model-btn-${m.id}`}
        >
          <span className="model-option-icon">{m.icon}</span>
          <span className="model-option-name">{m.name}</span>
          <span className="model-option-full">{m.full}</span>
          <span className="model-option-desc">{m.desc}</span>
          {selected === m.id && (
            <span className="model-option-check" aria-hidden="true">✓</span>
          )}
        </button>
      ))}
    </div>
  )
}
