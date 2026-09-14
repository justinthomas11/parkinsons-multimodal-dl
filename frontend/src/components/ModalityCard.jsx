import './ModalityCard.css'

export default function ModalityCard({ icon, title, dataset, features, description, accent }) {
  return (
    <div className="modality-card card" style={{ '--accent': accent }}>
      <div className="modality-icon">{icon}</div>
      <h3 className="modality-title">{title}</h3>
      <p className="modality-desc">{description}</p>
      <div className="modality-meta">
        <span className="modality-chip">📁 {dataset}</span>
        <span className="modality-chip">🔢 {features} features</span>
      </div>
    </div>
  )
}
