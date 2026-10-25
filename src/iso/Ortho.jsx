import { useMemo, useId } from 'react'

// Dimensioned technical drawings (front, side, top) projected from the same boxes as the 3D views.
const VIEWS = {
  front: { title: 'Front', u: (b) => [b.x, b.x + b.dx], v: (b) => [-(b.z + b.dz), -b.z], depth: (b) => b.y + b.dy },
  side: { title: 'Side', u: (b) => [b.y, b.y + b.dy], v: (b) => [-(b.z + b.dz), -b.z], depth: (b) => b.x + b.dx },
  top: { title: 'Top', u: (b) => [b.x, b.x + b.dx], v: (b) => [b.y, b.y + b.dy], depth: (b) => b.z + b.dz },
}

const FILL = { board: '#ead8bd', frame: '#d9bf9b', steel: '#3a3b3d' }

export default function Ortho({ boxes, view = 'front', extraDims = [], className = '' }) {
  const id = 'o' + useId().replace(/[:«»]/g, '')
  const V = VIEWS[view]
  const data = useMemo(() => {
    const list = boxes.filter((b) => b.mat !== 'prop').map((b) => ({ b, u: V.u(b), v: V.v(b), d: V.depth(b) }))
    list.sort((a, c) => a.d - c.d)
    let u0 = Infinity, u1 = -Infinity, v0 = Infinity, v1 = -Infinity
    for (const r of list) {
      if (r.b.mat === 'steel') continue // hinges and straps don't count towards overall size
      u0 = Math.min(u0, r.u[0]); u1 = Math.max(u1, r.u[1]); v0 = Math.min(v0, r.v[0]); v1 = Math.max(v1, r.v[1])
    }
    return { list, u0, u1, v0, v1 }
  }, [boxes, V])
  const { list, u0, u1, v0, v1 } = data
  const W = u1 - u0, H = v1 - v0
  const fs = Math.max(W, H) / 16
  const gap = fs * 1.6
  const extraLevelsU = extraDims.filter((d) => d.axis === 'u').reduce((m, d) => Math.max(m, d.level || 1), 0)
  const extraLevelsV = extraDims.filter((d) => d.axis === 'v').reduce((m, d) => Math.max(m, d.level || 1), 0)
  const left = gap * (1.6 + extraLevelsV * 1.4)
  const bottom = gap * (1.8 + extraLevelsU * 1.4)
  const vb = [u0 - left, v0 - fs * 2.4, W + left + fs * 1.2, H + bottom + fs * 2.6]

  const dimU = (a, b, level, label) => {
    const y = v1 + gap * (0.9 + level * 1.4)
    return (
      <g key={`u${a}-${b}-${level}`}>
        <line x1={a} y1={v1 + gap * 0.25} x2={a} y2={y + gap * 0.3} className="ext" />
        <line x1={b} y1={v1 + gap * 0.25} x2={b} y2={y + gap * 0.3} className="ext" />
        <line x1={a} y1={y} x2={b} y2={y} className="dim" markerStart={`url(#${id}-a)`} markerEnd={`url(#${id}-a)`} />
        <rect x={(a + b) / 2 - fs * 1.7} y={y - fs * 0.62} width={fs * 3.4} height={fs * 1.1} fill="var(--paper, #fbf7f0)" />
        <text x={(a + b) / 2} y={y + fs * 0.3} fontSize={fs * 0.82} textAnchor="middle">{label ?? Math.round(b - a)}</text>
      </g>
    )
  }
  const dimV = (a, b, level, label) => {
    const x = u0 - gap * (0.9 + level * 1.4)
    const mid = (a + b) / 2
    return (
      <g key={`v${a}-${b}-${level}`}>
        <line x1={u0 - gap * 0.25} y1={a} x2={x - gap * 0.3} y2={a} className="ext" />
        <line x1={u0 - gap * 0.25} y1={b} x2={x - gap * 0.3} y2={b} className="ext" />
        <line x1={x} y1={a} x2={x} y2={b} className="dim" markerStart={`url(#${id}-a)`} markerEnd={`url(#${id}-a)`} />
        <g transform={`translate(${x} ${mid}) rotate(-90)`}>
          <rect x={-fs * 1.7} y={-fs * 0.62} width={fs * 3.4} height={fs * 1.1} fill="var(--paper, #fbf7f0)" />
          <text y={fs * 0.3} fontSize={fs * 0.82} textAnchor="middle">{label ?? Math.round(b - a)}</text>
        </g>
      </g>
    )
  }

  return (
    <svg viewBox={vb.join(' ')} className={className} role="img" aria-label={`${V.title} view with dimensions`}>
      <defs>
        <marker id={`${id}-a`} viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 1 L9 5 L0 9 z" fill="#3a332c" />
        </marker>
        <pattern id={`${id}-h`} patternUnits="userSpaceOnUse" width="24" height="24" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="24" stroke="#8a6a48" strokeOpacity=".18" strokeWidth="4" />
        </pattern>
      </defs>
      <style>{`.ext{stroke:#3a332c;stroke-opacity:.45;vector-effect:non-scaling-stroke;stroke-width:.8}.dim{stroke:#3a332c;vector-effect:non-scaling-stroke;stroke-width:1}text{font-family:Geist Variable,sans-serif;font-weight:600;fill:#2b2620}`}</style>
      <text x={u0} y={v0 - fs * 1.1} fontSize={fs * 0.95} style={{ fontFamily: 'Fraunces Variable, serif', fontWeight: 600 }}>{V.title}</text>
      {list.map(({ b, u, v }, i) => (
        <g key={i}>
          <rect x={u[0]} y={v[0]} width={u[1] - u[0]} height={v[1] - v[0]} fill={FILL[b.mat] || '#ddd'} stroke="#3a2a1a" strokeWidth="0.9" vectorEffect="non-scaling-stroke" />
          {b.mat !== 'steel' && <rect x={u[0]} y={v[0]} width={u[1] - u[0]} height={v[1] - v[0]} fill={`url(#${id}-h)`} />}
        </g>
      ))}
      {dimU(u0, u1, 0)}
      {dimV(v0, v1, 0)}
      {extraDims.map((d) => {
        const a = view === 'top' || d.axis === 'u' ? d.from : -d.to
        const b = view === 'top' || d.axis === 'u' ? d.to : -d.from
        return d.axis === 'u' ? dimU(a, b, d.level || 1, d.label) : dimV(a, b, d.level || 1, d.label)
      })}
    </svg>
  )
}
