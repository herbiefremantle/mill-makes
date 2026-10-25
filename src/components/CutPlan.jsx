import { useId } from 'react'
import { BOARD_TRIM, FRAME_TRIM } from '../lib/cutting.js'

const SWATCH = ['#e0b37a', '#c98f5a', '#ead0a4', '#b97c4c', '#d8b48c', '#a8703f', '#f0dcb8', '#c6a078', '#dba26a', '#b98a5e', '#e8c595', '#9f6a3c']
export const partColour = (parts, code) => SWATCH[parts.findIndex((p) => p.code === code) % SWATCH.length]

export function CutTable({ parts, compact = false }) {
  return (
    <div>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-left text-[0.68rem] uppercase tracking-[0.12em] text-muted">
            <th className="py-2 pr-2 font-semibold">Part</th>
            <th className="py-2 px-2 font-semibold text-right">Qty</th>
            <th className="py-2 pl-2 font-semibold text-right">L × W × T</th>
          </tr>
        </thead>
        <tbody>
          {parts.map((p) => (
            <tr key={p.key} className="border-t border-line avoid-break">
              <td className={`pr-2 ${compact ? 'py-1.5' : 'py-2.5'}`}>
                <span className="flex items-center gap-2">
                  <span className="inline-grid place-items-center w-6 h-6 rounded-md text-[0.7rem] font-bold text-ink/80 flex-none" style={{ background: partColour(parts, p.code) }}>
                    {p.code}
                  </span>
                  <span className="min-w-0">
                    <span className="font-medium">{p.name}</span>
                    <span className="block text-xs text-muted">
                      {p.mat === 'frame' ? '47 × 100 framing' : 'Scaffold board'}
                      {p.ripped && <b className="text-rust font-semibold"> · rip to {p.width}</b>}
                    </span>
                  </span>
                </span>
              </td>
              <td className="px-2 text-right tabular-nums font-semibold">{p.qty}</td>
              <td className="pl-2 text-right tabular-nums whitespace-nowrap">
                <b className="font-semibold">{p.length}</b>
                <span className="text-muted"> × {p.width} × {p.thickness}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs text-muted mt-2">All sizes in mm: length (along the grain) × width × thickness.</p>
    </div>
  )
}

function Bar({ bin, parts, kind, index, scale }) {
  const pid = 'h' + useId().replace(/[:«»]/g, '')
  const H = kind === 'board' ? 225 : 100
  const trim = kind === 'board' ? BOARD_TRIM : FRAME_TRIM
  const unitsH = 150
  const sy = unitsH / H
  const len = bin.stock * scale
  const used = bin.items.reduce((s, it) => Math.max(s, it.offset + it.length), 0)
  const offcut = bin.stock - used - trim
  const items = kind === 'board' ? bin.items : bin.items.map((it) => ({ ...it, pieces: [{ code: it.code, width: H, offsetW: 0 }] }))
  return (
    <div className="avoid-break">
      <div className="flex items-baseline justify-between text-xs mb-1">
        <span className="font-semibold">
          {kind === 'board' ? 'Board' : 'Length'} {index + 1} · {(bin.stock / 1000).toFixed(1)}m
        </span>
        <span className="text-muted tabular-nums">{offcut > 0 ? `offcut ${Math.round(offcut)}mm` : 'no offcut'}</span>
      </div>
      <svg viewBox={`0 0 1000 ${unitsH + 2}`} className="w-full" role="img" aria-label={`Cutting plan for ${kind} ${index + 1}`}>
        <defs>
          <pattern id={pid} patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="8" stroke="#a08a70" strokeWidth="2.5" strokeOpacity=".45" />
          </pattern>
        </defs>
        <rect x="1" y="1" width={len - 2} height={unitsH} rx="3" fill="#f3ead9" stroke="#8a7357" strokeWidth="1" />
        <rect x="1" y="1" width={len - 2} height={unitsH} rx="3" fill={`url(#${pid})`} />
        {items.map((it, i) =>
          it.pieces.map((pc, j) => {
            const x = it.offset * scale
            const w = it.length * scale
            const y = 1 + pc.offsetW * sy
            const h = pc.width * sy
            const fs = Math.min(h * 0.5, 34)
            return (
              <g key={`${i}-${j}`}>
                <rect x={x} y={y} width={w} height={h} fill={partColour(parts, pc.code)} stroke="#5a3c22" strokeWidth="0.8" />
                {w > 30 && (
                  <text x={x + w / 2} y={y + h / 2 + fs * 0.35} fontSize={fs} textAnchor="middle" fontWeight="700" fill="#2b2620" fontFamily="Inter Variable, sans-serif">
                    {pc.code}
                    {w > 150 && h > 50 ? ` ${it.length}` : ''}
                  </text>
                )}
              </g>
            )
          }),
        )}
      </svg>
    </div>
  )
}

export function CutPlan({ plan, parts }) {
  const longest = Math.max(3900, ...plan.boards.map((b) => b.stock), ...plan.frames.map((b) => b.stock))
  const scale = 998 / longest
  return (
    <div className="space-y-6">
      {plan.boards.length > 0 && (
        <div className="space-y-3">
          <h3 className="serif text-lg font-semibold">Scaffold boards</h3>
          {plan.boards.map((b, i) => (
            <Bar key={i} bin={b} parts={parts} kind="board" index={i} scale={scale} />
          ))}
        </div>
      )}
      {plan.frames.length > 0 && (
        <div className="space-y-3">
          <h3 className="serif text-lg font-semibold">47 × 100mm framing</h3>
          {plan.frames.map((b, i) => (
            <Bar key={i} bin={b} parts={parts} kind="frame" index={i} scale={scale} />
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-4 h-3 rounded-sm border border-[#8a7357]" style={{ background: 'repeating-linear-gradient(45deg,#f3ead9 0 3px,#d6c6ad 3px 5px)' }} /> Offcut and trimmed ends
        </span>
        <span>Pieces drawn to scale. Two pieces stacked = rip the board along its length.</span>
      </div>
    </div>
  )
}

/** Plain-text version for sharing by message or email. */
export function cutListText(project, dims, computed) {
  const { parts, plan } = computed
  const lines = [`${project.name}: ${Object.entries(dims).map(([k, v]) => `${k} ${v}${k === 'shelves' ? '' : 'mm'}`).join(', ')}`, '', 'CUT LIST (mm): part · qty · length × width × thickness']
  for (const p of parts) lines.push(`${p.code}  ${p.name} · ${p.qty} · ${p.length} × ${p.width} × ${p.thickness}${p.ripped ? ' (rip)' : ''}`)
  lines.push('', 'CUTTING PLAN')
  plan.boards.forEach((b, i) => lines.push(`Board ${i + 1} (${b.stock / 1000}m): ` + b.items.map((it) => it.pieces.map((pc) => `${pc.code} ${it.length}${pc.width < 225 ? `×${pc.width}` : ''}`).join(' + ')).join(' | ')))
  plan.frames.forEach((b, i) => lines.push(`Framing ${i + 1} (${b.stock / 1000}m): ` + b.items.map((it) => `${it.code} ${it.length}`).join(' | ')))
  lines.push('', 'Trim 30mm off each board end first. Made with Mill Makes.')
  return lines.join('\n')
}
