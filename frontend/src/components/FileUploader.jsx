import { useRef, useState } from 'react'
import './FileUploader.css'

const ACCEPTED = '.csv,.xls,.xlsx,.data,.txt'

export default function FileUploader({ onFile }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [file, setFile] = useState(null)
  const [detectedType, setDetectedType] = useState(null)
  const [error, setError] = useState(null)

  function handleFile(f) {
    if (!f) return
    const ext = f.name.split('.').pop().toLowerCase()
    if (!['csv', 'xls', 'xlsx', 'data', 'txt'].includes(ext)) {
      setError('Please upload a .csv, .xls, .xlsx, or .data file.')
      return
    }
    setError(null)
    setFile(f)

    // Quick column-based detection via reading file name hints
    // (server will do real detection; this is just UI feedback)
    const lower = f.name.toLowerCase()
    if (lower.includes('gait') || lower.includes('demo') || lower.includes('walk')) {
      setDetectedType('gait')
    } else if (lower.includes('voice') || lower.includes('vocal') || lower.includes('updrs') || lower.includes('pd')) {
      setDetectedType('voice')
    } else {
      setDetectedType('auto')
    }

    onFile(f)
  }

  function onDrop(e) {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  function onClear(e) {
    e.stopPropagation()
    setFile(null)
    setDetectedType(null)
    setError(null)
    onFile(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  const typeLabel = { gait: '🦶 Gait Dataset', voice: '🎙️ Voice Dataset', auto: '🔍 Auto-detecting...' }

  return (
    <div className="uploader-wrapper">
      <div
        className={`uploader-zone ${dragging ? 'dragging' : ''} ${file ? 'has-file' : ''}`}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => !file && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && !file && inputRef.current?.click()}
        aria-label="File upload area"
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED}
          className="uploader-input"
          onChange={e => handleFile(e.target.files[0])}
          aria-hidden="true"
        />

        {!file ? (
          <>
            <div className="uploader-icon">📂</div>
            <p className="uploader-main">Drag & drop your dataset here</p>
            <p className="uploader-sub text-muted text-small">
              Supports <strong>.csv</strong>, <strong>.xls</strong>, <strong>.xlsx</strong>
              &nbsp;· Gait or Voice datasets
            </p>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={e => { e.stopPropagation(); inputRef.current?.click() }}
            >
              Browse files
            </button>
          </>
        ) : (
          <div className="uploader-file-info">
            <div className="uploader-file-icon">📄</div>
            <div className="uploader-file-details">
              <p className="uploader-file-name">{file.name}</p>
              <p className="text-muted text-small">
                {(file.size / 1024).toFixed(1)} KB
              </p>
              {detectedType && (
                <span className="badge badge-primary" style={{ marginTop: '6px' }}>
                  {typeLabel[detectedType]}
                </span>
              )}
            </div>
            <button type="button" className="uploader-clear" onClick={onClear} aria-label="Remove file">
              ✕
            </button>
          </div>
        )}
      </div>

      {error && <p className="uploader-error">{error}</p>}
    </div>
  )
}
