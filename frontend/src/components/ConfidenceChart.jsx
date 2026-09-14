import { useEffect, useRef } from 'react'
import './ConfidenceChart.css'

export default function ConfidenceChart({ confidence, predictions }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !confidence.length) return

    const ctx = canvas.getContext('2d')
    const W = canvas.width
    const H = canvas.height
    const BINS = 10
    const BIN_W = 100 / BINS

    // Build histogram
    const bins = Array(BINS).fill(0)
    confidence.forEach(c => {
      const bi = Math.min(Math.floor(c / BIN_W), BINS - 1)
      bins[bi]++
    })
    const maxCount = Math.max(...bins, 1)

    // Layout
    const PAD_L = 40, PAD_B = 36, PAD_T = 16, PAD_R = 16
    const plotW = W - PAD_L - PAD_R
    const plotH = H - PAD_B - PAD_T
    const barW  = plotW / BINS

    ctx.clearRect(0, 0, W, H)

    // Grid lines
    ctx.strokeStyle = '#E2E0F0'
    ctx.lineWidth = 1
    for (let i = 0; i <= 4; i++) {
      const y = PAD_T + plotH - (plotH * i / 4)
      ctx.beginPath(); ctx.moveTo(PAD_L, y); ctx.lineTo(W - PAD_R, y); ctx.stroke()
    }

    // Bars
    bins.forEach((count, bi) => {
      const x = PAD_L + bi * barW
      const barH = (count / maxCount) * plotH
      const y = PAD_T + plotH - barH

      // Colour: < 50% → green gradient, >= 50% → red gradient
      const pct = (bi + 0.5) * BIN_W
      const grad = ctx.createLinearGradient(0, y, 0, PAD_T + plotH)
      if (pct >= 50) {
        grad.addColorStop(0, '#EF4444')
        grad.addColorStop(1, '#FCA5A5')
      } else {
        grad.addColorStop(0, '#10B981')
        grad.addColorStop(1, '#6EE7B7')
      }
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.roundRect(x + 2, y, barW - 4, barH, [4, 4, 0, 0])
      ctx.fill()

      // Count label above bar
      if (count > 0) {
        ctx.fillStyle = '#4B5563'
        ctx.font = '600 11px Inter, sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(count, x + barW / 2, y - 4)
      }
    })

    // X-axis labels
    ctx.fillStyle = '#9CA3AF'
    ctx.font = '11px Inter, sans-serif'
    ctx.textAlign = 'center'
    for (let i = 0; i <= BINS; i++) {
      const x = PAD_L + i * barW
      ctx.fillText(`${i * 10}%`, x, H - 8)
    }

    // Y-axis label
    ctx.save()
    ctx.translate(12, PAD_T + plotH / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillStyle = '#9CA3AF'
    ctx.font = '11px Inter, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('Count', 0, 0)
    ctx.restore()
  }, [confidence, predictions])

  return (
    <div className="conf-chart-wrapper card">
      <div className="conf-chart-header">
        <h3 className="conf-chart-title">Confidence Distribution</h3>
        <div className="conf-chart-legend">
          <span className="conf-legend-dot" style={{ background: '#10B981' }} />
          <span className="text-small text-muted">Control</span>
          <span className="conf-legend-dot" style={{ background: '#EF4444', marginLeft: 'var(--sp-4)' }} />
          <span className="text-small text-muted">PD</span>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        width={600}
        height={240}
        className="conf-canvas"
        aria-label="Confidence score histogram"
      />
    </div>
  )
}
