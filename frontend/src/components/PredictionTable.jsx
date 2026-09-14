import { useState } from 'react'
import './PredictionTable.css'

const PAGE_SIZE = 15

export default function PredictionTable({ predictions, confidence, trueLabels }) {
  const [page, setPage] = useState(0)
  const total = predictions.length
  const pages = Math.ceil(total / PAGE_SIZE)
  const slice = predictions.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  function downloadCSV() {
    const header = ['Sequence', 'Prediction', 'Confidence (%)', trueLabels.length ? 'True Label' : ''].filter(Boolean)
    const rows = predictions.map((pred, i) => {
      const row = [i + 1, pred === 1 ? 'PD' : 'Control', confidence[i].toFixed(2)]
      if (trueLabels.length) row.push(trueLabels[i] === 1 ? 'PD' : 'Control')
      return row
    })
    const csv = [header, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'pd_predictions.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="pred-table-wrapper">
      <div className="pred-table-header">
        <div>
          <h3 className="pred-table-title">Sequence Predictions</h3>
          <p className="text-muted text-small">{total} sequences analysed</p>
        </div>
        <button type="button" className="btn btn-ghost btn-sm" onClick={downloadCSV}>
          ⬇ Download CSV
        </button>
      </div>

      <div className="pred-table-scroll">
        <table className="pred-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Prediction</th>
              <th>Confidence</th>
              {trueLabels.length > 0 && <th>True Label</th>}
              {trueLabels.length > 0 && <th>Correct?</th>}
            </tr>
          </thead>
          <tbody>
            {slice.map((pred, localIdx) => {
              const globalIdx = page * PAGE_SIZE + localIdx
              const conf = confidence[globalIdx]
              const truth = trueLabels[globalIdx]
              const correct = trueLabels.length ? pred === truth : null

              return (
                <tr key={globalIdx} className={pred === 1 ? 'row-pd' : 'row-ctrl'}>
                  <td className="row-num">{globalIdx + 1}</td>
                  <td>
                    <span className={`badge ${pred === 1 ? 'badge-danger' : 'badge-success'}`}>
                      {pred === 1 ? '🔴 PD' : '🟢 Control'}
                    </span>
                  </td>
                  <td>
                    <div className="conf-cell">
                      <div className="progress-track conf-track">
                        <div
                          className="progress-fill conf-fill"
                          style={{
                            width: `${conf}%`,
                            background: pred === 1 ? '#EF4444' : '#10B981',
                          }}
                        />
                      </div>
                      <span className="conf-value">{conf.toFixed(1)}%</span>
                    </div>
                  </td>
                  {trueLabels.length > 0 && (
                    <td>
                      <span className={`badge ${truth === 1 ? 'badge-danger' : 'badge-success'}`}>
                        {truth === 1 ? 'PD' : 'Control'}
                      </span>
                    </td>
                  )}
                  {trueLabels.length > 0 && (
                    <td>
                      <span style={{ fontSize: '1.1rem' }}>
                        {correct ? '✅' : '❌'}
                      </span>
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="pred-table-pagination">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            disabled={page === 0}
            onClick={() => setPage(p => p - 1)}
          >
            ← Prev
          </button>
          <span className="text-muted text-small">
            Page {page + 1} of {pages}
          </span>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            disabled={page === pages - 1}
            onClick={() => setPage(p => p + 1)}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}
