// 3D model helpers. Every project is described as a list of boxes (one per real piece of wood),
// so the illustrations, cut list, board count and price all come from the same source.
//
// Axes: x = width (left to right), y = depth (back = 0, front = D), z = height (floor = 0). Units: mm.

export const BOARD_T = 38 // scaffold board thickness
export const BOARD_W = 225 // scaffold board width
export const FRAME_T = 47 // framing timber 47 x 100
export const FRAME_W = 100

let seed = 1
function rand() {
  // small deterministic PRNG so each board keeps the same colour between renders
  seed = (seed * 16807) % 2147483647
  return (seed - 1) / 2147483646
}
export function resetTones(s = 7) {
  seed = s
}

/**
 * box(group, name, [x, y, z], [dx, dy, dz], opts)
 * opts.mat: 'board' | 'frame' | 'steel' | 'prop'
 */
export function box(group, name, pos, size, opts = {}) {
  return {
    group,
    name,
    x: pos[0],
    y: pos[1],
    z: pos[2],
    dx: size[0],
    dy: size[1],
    dz: size[2],
    mat: opts.mat || 'board',
    tone: opts.tone ?? rand(),
    color: opts.color,
    bands: opts.bands || false,
    cut: opts.cut !== false && (opts.mat || 'board') !== 'prop' && opts.mat !== 'steel',
    note: opts.note,
  }
}

/**
 * Split a panel width into board widths. 450 -> [225, 225]; 412 -> [225, 187].
 * A thin leftover strip looks odd, so if the remainder is under 100mm the last two boards
 * are ripped to equal widths instead (300 -> [150, 150]).
 */
export function panelBoards(total) {
  const n = Math.ceil(total / BOARD_W - 1e-9)
  if (n <= 1) return [Math.round(total)]
  const rem = Math.round(total - (n - 1) * BOARD_W)
  const widths = Array(n).fill(BOARD_W)
  if (rem === BOARD_W) return widths
  if (rem < 100) {
    // both the same width (losing up to 1mm) so they're one part in the cut list
    const half = Math.floor((BOARD_W + rem) / 2)
    widths[n - 2] = half
    widths[n - 1] = half
  } else widths[n - 1] = rem
  return widths
}

/** Lay boards side by side. axis = which axis the widths run along. Returns boxes. */
export function panel(group, name, origin, length, total, axis, opts = {}) {
  const widths = panelBoards(total)
  const out = []
  let off = 0
  // `order: 'reverse'` lays the full boards from the far end (e.g. front edge first)
  const list = opts.reverse ? [...widths] : widths
  for (const w of list) {
    let pos, size
    const start = opts.reverse ? total - off - w : off
    if (opts.lengthAxis === 'x' && axis === 'y') {
      pos = [origin[0], origin[1] + start, origin[2]]
      size = [length, w, BOARD_T]
    } else if (opts.lengthAxis === 'z' && axis === 'y') {
      pos = [origin[0], origin[1] + start, origin[2]]
      size = [BOARD_T, w, length]
    } else if (opts.lengthAxis === 'z' && axis === 'x') {
      pos = [origin[0] + start, origin[1], origin[2]]
      size = [w, BOARD_T, length]
    } else if (opts.lengthAxis === 'x' && axis === 'z') {
      pos = [origin[0], origin[1], origin[2] + start]
      size = [length, BOARD_T, w]
    } else if (opts.lengthAxis === 'y' && axis === 'z') {
      pos = [origin[0], origin[1], origin[2] + start]
      size = [BOARD_T, length, w]
    } else if (opts.lengthAxis === 'y' && axis === 'x') {
      pos = [origin[0] + start, origin[1], origin[2]]
      size = [w, length, BOARD_T]
    } else throw new Error('unsupported panel orientation')
    out.push(box(group, name, pos, size, opts))
    off += w
  }
  return out
}

/** Turn boxes into a cut list: identical pieces grouped, lettered A, B, C... */
export function cutList(boxes) {
  const map = new Map()
  for (const b of boxes) {
    if (!b.cut) continue
    const [length, width, thickness] = [b.dx, b.dy, b.dz].map((v) => Math.round(v)).sort((a, z) => z - a)
    const key = `${b.mat}|${b.name}|${length}|${width}|${thickness}`
    if (!map.has(key)) map.set(key, { key, name: b.name, mat: b.mat, length, width, thickness, qty: 0, groups: new Set() })
    const p = map.get(key)
    p.qty++
    p.groups.add(b.group)
  }
  const parts = [...map.values()]
  // boards first, then framing; longest first inside each
  parts.sort((a, b) => (a.mat === b.mat ? b.length - a.length : a.mat === 'board' ? -1 : 1))
  parts.forEach((p, i) => {
    p.code = String.fromCharCode(65 + (i % 26)) + (i >= 26 ? Math.floor(i / 26) : '')
    p.ripped = p.mat === 'board' && p.width < BOARD_W
  })
  return parts
}

/** Surface area of all cut pieces in m² (used to work out how much oil and sandpaper). */
export function surfaceArea(boxes) {
  let a = 0
  for (const b of boxes) {
    if (!b.cut) continue
    a += 2 * (b.dx * b.dy + b.dx * b.dz + b.dy * b.dz)
  }
  return a / 1e6
}

/** Approximate weight in kg (reclaimed softwood ≈ 500 kg/m³). */
export function weight(boxes) {
  let v = 0
  for (const b of boxes) if (b.cut) v += b.dx * b.dy * b.dz
  return Math.round((v / 1e9) * 500)
}

export function bounds(boxes) {
  const bb = { x0: Infinity, y0: Infinity, z0: Infinity, x1: -Infinity, y1: -Infinity, z1: -Infinity }
  for (const b of boxes) {
    bb.x0 = Math.min(bb.x0, b.x)
    bb.y0 = Math.min(bb.y0, b.y)
    bb.z0 = Math.min(bb.z0, b.z)
    bb.x1 = Math.max(bb.x1, b.x + b.dx)
    bb.y1 = Math.max(bb.y1, b.y + b.dy)
    bb.z1 = Math.max(bb.z1, b.z + b.dz)
  }
  return bb
}

/** A potted plant for styling renders: a stepped pot and a loose cluster of foliage. */
export function plant(x, y, z, s = 150) {
  const p = (n, pos, size, color) => box('props', n, pos, size, { mat: 'prop', color, tone: 0.5 })
  const c = s / 2
  return [
    p('Pot', [x, y, z], [s, s, s * 0.8], [18, 48, 52]),
    p('Pot rim', [x - s * 0.06, y - s * 0.06, z + s * 0.8], [s * 1.12, s * 1.12, s * 0.12], [18, 44, 58]),
    p('Leaves', [x - s * 0.2, y + c * 0.3, z + s * 0.92], [s * 0.7, s * 0.7, s * 0.55], [104, 30, 30]),
    p('Leaves', [x + c * 0.6, y - s * 0.15, z + s * 0.92], [s * 0.7, s * 0.65, s * 0.75], [96, 28, 38]),
    p('Leaves', [x + c * 0.3, y + c * 0.5, z + s * 1.2], [s * 0.55, s * 0.55, s * 0.6], [88, 32, 44]),
    p('Leaves', [x + c * 0.1, y + c * 0.1, z + s * 1.5], [s * 0.45, s * 0.45, s * 0.5], [92, 30, 50]),
  ]
}
