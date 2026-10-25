import { createContext, useContext, useId, useMemo } from 'react'

// Isometric renderer: draws each box with three shaded faces, wood grain that follows the
// direction of the piece, end-grain rings, knots, nail holes, scaffold end bands and a soft
// ground shadow. Viewer looks from the front-right, above.

// The finish shown on the wood: 'natural' (clear oil), 'antique' (dark walnut stain), 'weathered' (grey wash)
export const LookContext = createContext('natural')
export const LOOKS = {
  natural: { label: 'Natural oiled', swatch: ['#e3b886', '#c99560', '#a8723f'], grain: '#5a3415' },
  antique: { label: 'Antique dark', swatch: ['#6b4126', '#4f2e1a', '#3a2214'], grain: '#f2c48c' },
  weathered: { label: 'Weathered grey', swatch: ['#c9c3b8', '#aaa294', '#8a8273'], grain: '#3d3328' },
}

const C = Math.cos(Math.PI / 6)
const S = 0.5
export const proj = (x, y, z) => [(x - y) * C, (x + y) * S - z]

const corners = (b) => {
  const out = []
  for (const x of [b.x, b.x + b.dx]) for (const y of [b.y, b.y + b.dy]) for (const z of [b.z, b.z + b.dz]) out.push(proj(x, y, z))
  return out
}

function screenBox(b) {
  const cs = corners(b)
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity
  for (const [x, y] of cs) {
    x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y)
  }
  return { x0, y0, x1, y1 }
}

// A is behind B (draw first) if it is entirely on the far side along any axis
const behind = (a, b) => a.x + a.dx <= b.x + 0.01 || a.y + a.dy <= b.y + 0.01 || a.z + a.dz <= b.z + 0.01

function depthSort(boxes) {
  const n = boxes.length
  const sb = boxes.map(screenBox)
  const key = boxes.map((b) => b.x + b.dx / 2 + b.y + b.dy / 2 + b.z + b.dz / 2)
  const incoming = Array.from({ length: n }, () => [])
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const A = sb[i], B = sb[j]
      if (A.x1 <= B.x0 || B.x1 <= A.x0 || A.y1 <= B.y0 || B.y1 <= A.y0) continue
      const ij = behind(boxes[i], boxes[j])
      const ji = behind(boxes[j], boxes[i])
      if (ij && !ji) incoming[j].push(i)
      else if (ji && !ij) incoming[i].push(j)
    }
  }
  const done = new Array(n).fill(false)
  const order = []
  for (let k = 0; k < n; k++) {
    let pick = -1
    for (let i = 0; i < n; i++) {
      if (done[i]) continue
      if (incoming[i].every((p) => done[p]) && (pick < 0 || key[i] < key[pick])) pick = i
    }
    if (pick < 0) {
      // cycle: fall back to nearest-centre ordering
      for (let i = 0; i < n; i++) if (!done[i] && (pick < 0 || key[i] < key[pick])) pick = i
    }
    done[pick] = true
    order.push(boxes[pick])
  }
  return order
}

function palette(b, ghost, look) {
  let h, s, l
  const t = b.tone - 0.5
  if ((b.mat === 'board' || b.mat === 'frame') && look === 'antique') { h = 22 + t * 8; s = 40 + b.tone * 12; l = (b.mat === 'frame' ? 26 : 31) + t * 10 }
  else if ((b.mat === 'board' || b.mat === 'frame') && look === 'weathered') { h = 34 + t * 6; s = 8 + b.tone * 6; l = (b.mat === 'frame' ? 56 : 63) + t * 10 }
  else if (b.mat === 'board') { h = 29 + t * 9; s = 40 + b.tone * 10; l = 57 + t * 12 }
  else if (b.mat === 'frame') { h = 26 + t * 4; s = 42; l = 47 + t * 6 }
  else if (b.mat === 'brick') { h = 28; s = 22; l = 86 }
  else if (b.mat === 'floor') { h = 30; s = 7; l = 74 }
  else if (b.mat === 'steel') { h = 215; s = 5; l = 22 }
  else [h, s, l] = b.color || [30, 10, 60]
  if (ghost) { s *= 0.25; l = Math.min(90, l + 22) }
  const f = (dl) => `hsl(${h.toFixed(1)} ${s.toFixed(1)}% ${Math.max(4, Math.min(96, l + dl)).toFixed(1)}%)`
  return { top: f(9), front: f(0), right: f(-12), edge: `hsl(${h} ${s}% ${Math.max(5, l - 32)}%)` }
}

function longAxis(b) {
  if (b.dx >= b.dy && b.dx >= b.dz) return 'x'
  if (b.dy >= b.dx && b.dy >= b.dz) return 'y'
  return 'z'
}

function Face({ m, w, h, fill, grain, ua, va, la, b, id, k, focus, ghost, edge, kind }) {
  const isWood = b.mat === 'board' || b.mat === 'frame'
  const pat = !isWood || ghost ? null : ua === la ? 'gu' : va === la ? 'gv' : 'ge'
  const off = Math.round(b.tone * 900)
  // deterministic knots and nail holes on long faces
  const extras = []
  if (isWood && !ghost && pat === 'gu' && kind !== 'right') {
    if (b.tone > 0.62 && w > 600) extras.push(<ellipse key="k" cx={w * (0.2 + b.tone * 0.5)} cy={h * 0.5} rx={Math.min(26, h * 0.18) * 1.6} ry={Math.min(12, h * 0.12)} fill={edge} opacity="0.35" />)
    if (b.mat === 'board' && kind === 'top') {
      const n = 2 + Math.floor(b.tone * 3)
      for (let i = 0; i < n; i++) {
        const u = ((i + 1) / (n + 1)) * w + Math.sin(i * 7 + b.tone * 20) * 40
        const v = h * (0.25 + 0.5 * ((i * 0.37 + b.tone) % 1))
        extras.push(<circle key={'n' + i} cx={u} cy={v} r={3.2 * k} fill="#2a1a0c" opacity="0.55" />)
      }
    }
  }
  if (isWood && !ghost && pat === 'gv' && kind !== 'right' && b.tone > 0.7 && h > 600)
    extras.push(<ellipse key="k" cx={w * 0.5} cy={h * (0.3 + b.tone * 0.4)} rx={Math.min(12, w * 0.12)} ry={Math.min(26, w * 0.2) * 1.6} fill={edge} opacity="0.35" />)
  // galvanised scaffold end bands
  if (b.bands && !ghost && pat === 'gu' && (kind === 'top' || kind === 'front')) {
    for (const u of [40, w - 70]) extras.push(<rect key={'b' + u} x={u} y={0} width={30} height={h} fill={kind === 'top' ? '#b9bec2' : '#8f959a'} opacity="0.95" />)
  }
  const room = b.mat === 'brick' || b.mat === 'floor'
  return (
    <g transform={`matrix(${m.join(' ')})`}>
      <rect width={w} height={h} fill={fill} />
      {b.mat === 'brick' && kind === 'front' && <rect width={w} height={h} fill={`url(#${id}-brick)`} />}
      {b.mat === 'brick' && kind === 'front' && <rect width={w} height={h} fill={`url(#${id}-wallfade)`} />}
      {b.mat === 'floor' && kind === 'top' && <rect width={w} height={h} fill={`url(#${id}-boards)`} />}
      {pat && (
        <g transform={pat === 'gv' ? `translate(0 ${-off})` : `translate(${-off} 0)`}>
          <rect x={pat === 'gv' ? 0 : off} y={pat === 'gv' ? off : 0} width={w} height={h} fill={`url(#${id}-${pat})`} />
        </g>
      )}
      {extras}
      {kind === 'front' && !ghost && <rect width={w} height={h} fill={`url(#${id}-shade)`} />}
      {!room && <rect width={w} height={h} fill="none" stroke={focus ? '#b4532a' : edge} strokeOpacity={focus ? 1 : ghost ? 0.25 : 0.55} strokeWidth={focus ? 1.6 : 0.6} vectorEffect="non-scaling-stroke" />}
    </g>
  )
}

function BoxShape({ b, id, k, focus, ghost, look }) {
  const c = palette(b, ghost, look)
  const la = longAxis(b)
  const x1 = b.x + b.dx, y1 = b.y + b.dy, z1 = b.z + b.dz
  const top = [C, S, -C, S, (b.x - b.y) * C, (b.x + b.y) * S - z1]
  const front = [C, S, 0, 1, (b.x - y1) * C, (b.x + y1) * S - z1]
  const right = [-C, S, 0, 1, (x1 - b.y) * C, (x1 + b.y) * S - z1]
  const common = { b, id, k, focus, ghost, la, edge: c.edge }
  return (
    <g opacity={ghost ? 0.6 : 1}>
      <Face {...common} kind="right" m={right} w={b.dy} h={b.dz} fill={c.right} ua="y" va="z" />
      <Face {...common} kind="front" m={front} w={b.dx} h={b.dz} fill={c.front} ua="x" va="z" />
      <Face {...common} kind="top" m={top} w={b.dx} h={b.dy} fill={c.top} ua="x" va="y" />
    </g>
  )
}

const add = (a, b, s = 1) => [a[0] + b[0] * s, a[1] + b[1] * s, a[2] + b[2] * s]

function Annotations({ items, id, fs }) {
  return items.map((a, i) => {
    if (a.type === 'arrow') {
      const [x0, y0] = proj(...a.from)
      const [x1, y1] = proj(...a.to)
      return (
        <g key={i}>
          <line x1={x0} y1={y0} x2={x1} y2={y1} stroke="#b4532a" strokeWidth="2" strokeDasharray="6 4" vectorEffect="non-scaling-stroke" markerEnd={`url(#${id}-arrow)`} />
          {a.label && <Label x={x1} y={y1} text={a.label} fs={fs} dx={a.dx} dy={a.dy} />}
        </g>
      )
    }
    if (a.type === 'screw') {
      const len = a.len || 80
      const d = a.dir
      const inside = add(a.at, d, len)
      const out0 = add(a.at, d, -len * 0.9)
      const out1 = add(a.at, d, -len * 0.15)
      const [ix, iy] = proj(...a.at), [jx, jy] = proj(...inside)
      const [ox, oy] = proj(...out0), [px, py] = proj(...out1)
      return (
        <g key={i}>
          <line x1={ix} y1={iy} x2={jx} y2={jy} stroke="#b4532a" strokeWidth="1.5" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />
          <line x1={ox} y1={oy} x2={px} y2={py} stroke="#2f3133" strokeWidth="3.5" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          <circle cx={ox} cy={oy} r={fs * 0.32} fill="#2f3133" />
          {a.label && <Label x={ox} y={oy} text={a.label} fs={fs} dx={a.dx ?? -1} dy={a.dy ?? -1} />}
        </g>
      )
    }
    if (a.type === 'label') {
      const [x, y] = proj(...a.at)
      return (
        <g key={i}>
          <circle cx={x} cy={y} r={fs * 0.18} fill="#b4532a" />
          <Label x={x} y={y} text={a.text} fs={fs} dx={a.dx} dy={a.dy} />
        </g>
      )
    }
    if (a.type === 'cut') {
      const [x0, y0] = proj(...a.from)
      const [x1, y1] = proj(...a.to)
      return (
        <g key={i}>
          <line x1={x0} y1={y0} x2={x1} y2={y1} stroke="#c0392b" strokeWidth="2.2" strokeDasharray="8 5" vectorEffect="non-scaling-stroke" />
          {a.label && <Label x={(x0 + x1) / 2} y={(y0 + y1) / 2} text={a.label} fs={fs} dx={a.dx} dy={a.dy ?? -1.6} />}
        </g>
      )
    }
    if (a.type === 'dim') {
      const p0 = add(a.from, a.offset || [0, 0, 0])
      const p1 = add(a.to, a.offset || [0, 0, 0])
      const [x0, y0] = proj(...p0), [x1, y1] = proj(...p1)
      return (
        <g key={i} stroke="#3a332c" fill="#3a332c">
          <line x1={x0} y1={y0} x2={x1} y2={y1} strokeWidth="1" vectorEffect="non-scaling-stroke" markerStart={`url(#${id}-tick)`} markerEnd={`url(#${id}-tick)`} />
          <text x={(x0 + x1) / 2} y={(y0 + y1) / 2 - fs * 0.4} fontSize={fs * 0.9} textAnchor="middle" stroke="none" fontFamily="Inter Variable, sans-serif" fontWeight="600">{a.label}</text>
        </g>
      )
    }
    return null
  })
}

function Label({ x, y, text, fs, dx = 1, dy = -1 }) {
  const lx = x + dx * fs * 2.2
  const ly = y + dy * fs * 2.2
  const w = text.length * fs * 0.56 + fs * 0.9
  const anchorLeft = dx >= 0
  return (
    <g>
      <line x1={x} y1={y} x2={lx} y2={ly} stroke="#3a332c" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      <rect x={anchorLeft ? lx : lx - w} y={ly - fs * 0.8} width={w} height={fs * 1.6} rx={fs * 0.5} fill="#fffaf2" stroke="#3a332c" strokeOpacity="0.35" vectorEffect="non-scaling-stroke" />
      <text x={anchorLeft ? lx + fs * 0.45 : lx - fs * 0.45} y={ly + fs * 0.32} fontSize={fs * 0.9} textAnchor={anchorLeft ? 'start' : 'end'} fill="#2b2620" fontFamily="Inter Variable, sans-serif" fontWeight="600">{text}</text>
    </g>
  )
}

/**
 * Props:
 *  boxes        all boxes (parts + props)
 *  focus        array of groups to highlight (others ghosted) — or null
 *  hide         array of groups not to draw
 *  explode      0..1, pushes groups apart using explodeMap
 *  move         { group: [dx,dy,dz] } extra offset for focused parts (shows "slide it in")
 *  annotations  arrows, screws, labels, cut lines, dims
 */
export default function IsoScene({ boxes, focus = null, hide = [], explode = 0, explodeMap = {}, move = {}, annotations = [], shadow = true, className = '', title, pad = 0.08, ghostOthers = true }) {
  const look = useContext(LookContext)
  const rid = useId().replace(/[:«»]/g, '')
  const id = 'iso' + rid
  const prepared = useMemo(() => {
    const focusSet = focus ? new Set(focus) : null
    const hidden = new Set(hide)
    const list = []
    for (const b of boxes) {
      if (hidden.has(b.group)) continue
      const e = explodeMap[b.group] || [0, 0, 0]
      const mv = move[b.group] || [0, 0, 0]
      list.push({
        ...b,
        x: b.x + e[0] * explode + mv[0],
        y: b.y + e[1] * explode + mv[1],
        z: b.z + e[2] * explode + mv[2],
        _focus: focusSet ? focusSet.has(b.group) : false,
        _ghost: focusSet ? ghostOthers && !focusSet.has(b.group) && b.mat !== 'prop' : false,
      })
    }
    // Room backdrop (wall, floor) is drawn first and doesn't count towards framing the picture
    const roomBoxes = list.filter((b) => b.group === 'room')
    const items = list.filter((b) => b.group !== 'room')
    const sorted = depthSort(items)
    const roomSorted = depthSort(roomBoxes)
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity
    const grow = ([x, y]) => { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y) }
    for (const b of items) corners(b).forEach(grow)
    for (const a of annotations) {
      for (const k of ['from', 'to', 'at']) if (a[k]) grow(proj(...a[k]))
      if (a.type === 'screw') grow(proj(...add(a.at, a.dir, -(a.len || 80))))
    }
    const fs = Math.max(x1 - x0, (y1 - y0) * 1.3) / 24
    // make room for every label box so none is clipped at the edges
    for (const a of annotations) {
      const text = a.label || a.text
      if (!text || a.type === 'dim') continue
      let at, dx = a.dx ?? 1, dy = a.dy ?? -1
      if (a.type === 'arrow') at = proj(...a.to)
      else if (a.type === 'screw') { at = proj(...add(a.at, a.dir, -(a.len || 80) * 0.9)); dx = a.dx ?? -1 }
      else if (a.type === 'cut') { const p0 = proj(...a.from), p1 = proj(...a.to); at = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2]; dy = a.dy ?? -1.6 }
      else at = proj(...a.at)
      const lx = at[0] + dx * fs * 2.2, ly = at[1] + dy * fs * 2.2
      const lw = text.length * fs * 0.56 + fs * 0.9
      grow([dx >= 0 ? lx + lw : lx - lw, ly - fs]); grow([lx, ly + fs])
    }
    const w = x1 - x0, h = y1 - y0
    const size = Math.max(w, h)
    const p = size * pad
    const lp = 0
    // ground shadow from parts touching the floor
    const ground = items.filter((b) => b.z <= 1)
    let shadowPts = null
    if (ground.length) {
      let gx0 = Infinity, gy0 = Infinity, gx1 = -Infinity, gy1 = -Infinity
      for (const b of ground) { gx0 = Math.min(gx0, b.x); gy0 = Math.min(gy0, b.y); gx1 = Math.max(gx1, b.x + b.dx); gy1 = Math.max(gy1, b.y + b.dy) }
      const m = size * 0.02
      shadowPts = { outer: [[gx0 - m, gy0 - m], [gx1 + m * 4, gy0 - m], [gx1 + m * 4, gy1 + m * 2], [gx0 - m, gy1 + m * 2]], inner: ground.map((b) => [[b.x, b.y], [b.x + b.dx, b.y], [b.x + b.dx, b.y + b.dy], [b.x, b.y + b.dy]]) }
    }
    return { sorted, roomSorted, vb: [x0 - p - lp, y0 - p - lp, w + 2 * (p + lp), h + 2 * (p + lp)], size, fs, shadowPts, k: size / 1400 }
  }, [boxes, focus, hide, explode, explodeMap, move, annotations, pad, ghostOthers]) // eslint-disable-line

  const { sorted, roomSorted, vb, size, fs, shadowPts, k } = prepared
  const grain = LOOKS[look]?.grain || LOOKS.natural.grain
  const g = Math.max(0.35, k) // grain pattern scale
  const pts = (arr) => arr.map(([x, y]) => proj(x, y, 0).join(',')).join(' ')

  return (
    <svg viewBox={vb.join(' ')} className={className} role="img" aria-label={title} preserveAspectRatio="xMidYMid meet">
      {title && <title>{title}</title>}
      <defs>
        <pattern id={`${id}-gu`} patternUnits="userSpaceOnUse" width="1200" height="64" patternTransform={`scale(${g})`}>
          <path d="M0 6 C220 2 380 12 620 7 S1000 3 1200 6" stroke={grain} strokeOpacity=".16" strokeWidth="2.2" fill="none" />
          <path d="M0 19 C180 24 420 14 640 20 S980 25 1200 19" stroke={grain} strokeOpacity=".11" strokeWidth="3.5" fill="none" />
          <path d="M0 31 C260 27 460 37 700 31 S1020 27 1200 31" stroke={grain} strokeOpacity=".15" strokeWidth="1.6" fill="none" />
          <path d="M0 44 C200 49 440 39 660 45 S960 50 1200 44" stroke={grain} strokeOpacity=".09" strokeWidth="5" fill="none" />
          <path d="M0 55 C240 51 400 60 640 55 S1040 51 1200 55" stroke={grain} strokeOpacity=".14" strokeWidth="1.8" fill="none" />
          <path d="M300 38 C420 33 520 33 640 38" stroke="#fff6e6" strokeOpacity=".12" strokeWidth="4" fill="none" />
        </pattern>
        <pattern id={`${id}-gv`} patternUnits="userSpaceOnUse" width="64" height="1200" patternTransform={`scale(${g})`}>
          <path d="M6 0 C2 220 12 380 7 620 S3 1000 6 1200" stroke={grain} strokeOpacity=".16" strokeWidth="2.2" fill="none" />
          <path d="M19 0 C24 180 14 420 20 640 S25 980 19 1200" stroke={grain} strokeOpacity=".11" strokeWidth="3.5" fill="none" />
          <path d="M31 0 C27 260 37 460 31 700 S27 1020 31 1200" stroke={grain} strokeOpacity=".15" strokeWidth="1.6" fill="none" />
          <path d="M44 0 C49 200 39 440 45 660 S50 960 44 1200" stroke={grain} strokeOpacity=".09" strokeWidth="5" fill="none" />
          <path d="M55 0 C51 240 60 400 55 640 S51 1040 55 1200" stroke={grain} strokeOpacity=".14" strokeWidth="1.8" fill="none" />
        </pattern>
        <pattern id={`${id}-ge`} patternUnits="userSpaceOnUse" width="240" height="120" patternTransform={`scale(${g})`}>
          {[14, 30, 46, 62, 80, 98].map((r) => (
            <circle key={r} cx="120" cy="130" r={r} fill="none" stroke={grain} strokeOpacity=".22" strokeWidth="2" />
          ))}
        </pattern>
        <pattern id={`${id}-brick`} patternUnits="userSpaceOnUse" width="450" height="150">
          <rect x="5" y="5" width="215" height="65" rx="4" fill="#efe5d8" />
          <rect x="230" y="5" width="215" height="65" rx="4" fill="#e7dccd" />
          <rect x="-107" y="80" width="215" height="65" rx="4" fill="#e9dfd2" />
          <rect x="118" y="80" width="215" height="65" rx="4" fill="#f1e8dc" />
          <rect x="343" y="80" width="215" height="65" rx="4" fill="#e4d8c8" />
        </pattern>
        <linearGradient id={`${id}-wallfade`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff8ee" stopOpacity=".55" />
          <stop offset=".7" stopColor="#fff8ee" stopOpacity="0" />
          <stop offset="1" stopColor="#3b2a18" stopOpacity=".12" />
        </linearGradient>
        <pattern id={`${id}-boards`} patternUnits="userSpaceOnUse" width="2400" height="180">
          <rect width="2400" height="180" fill="#d9cbb7" />
          <line x1="0" y1="1" x2="2400" y2="1" stroke="#a8977f" strokeWidth="3" />
          <line x1="1500" y1="0" x2="1500" y2="180" stroke="#a8977f" strokeWidth="3" />
          <path d="M0 60 C600 50 1200 72 2400 58 M0 120 C700 130 1400 110 2400 124" stroke="#b5a48c" strokeWidth="4" fill="none" opacity=".5" />
        </pattern>
        <linearGradient id={`${id}-shade`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".06" />
          <stop offset="1" stopColor="#000" stopOpacity=".14" />
        </linearGradient>
        <filter id={`${id}-blur`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation={size * 0.018} />
        </filter>
        <filter id={`${id}-blur2`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation={size * 0.005} />
        </filter>
        <marker id={`${id}-arrow`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" fill="#b4532a" />
        </marker>
        <marker id={`${id}-tick`} viewBox="0 0 10 10" refX="5" refY="5" markerWidth="8" markerHeight="8" orient="auto">
          <path d="M5 0 L5 10" stroke="#3a332c" strokeWidth="1.5" />
        </marker>
      </defs>
      {roomSorted.map((b, i) => (
        <BoxShape key={'r' + i} b={b} id={id} k={k} look={look} />
      ))}
      {shadow && shadowPts && (
        <g>
          <polygon points={pts(shadowPts.outer)} fill="#3b2a18" opacity="0.22" filter={`url(#${id}-blur)`} />
          {shadowPts.inner.map((p, i) => (
            <polygon key={i} points={pts(p)} fill="#2a1d10" opacity="0.35" filter={`url(#${id}-blur2)`} />
          ))}
        </g>
      )}
      {sorted.map((b, i) => (
        <BoxShape key={i} b={b} id={id} k={k} focus={b._focus} ghost={b._ghost} look={look} />
      ))}
      <Annotations items={annotations} id={id} fs={fs} />
    </svg>
  )
}
