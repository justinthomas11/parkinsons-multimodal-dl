import './LoadingSpinner.css'

export default function LoadingSpinner({ message = 'Running inference…' }) {
  return (
    <div className="spinner-wrapper">
      <div className="spinner-ring" aria-hidden="true">
        <div />
        <div />
        <div />
        <div />
      </div>
      <p className="spinner-message">{message}</p>
    </div>
  )
}
