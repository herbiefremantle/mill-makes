import { BOARD_W } from './geometry.js'

export const KERF = 3 // saw blade width
export const BOARD_TRIM = 30 // cut off split, nail-holed or banded ends of each scaffold board
export const FRAME_TRIM = 10

export const STOCK_OPTIONS = {
  mixed: { label: '3.9m and 2.4m', board: [3900, 2400], frame: [3600, 2400] },
  long: { label: '3.9m only', board: [3900], frame: [3600] },
  short: { label: '2.4m only', board: [2400], frame: [2400] },
}

/** Pieces narrower than a board that share a length are ripped side by side from one strip. */
function makeStrips(parts) {
  const byLength = new Map()
  for (const p of parts) {
    for (let i = 0; i < p.qty; i++) {
      if (!byLength.has(p.length)) byLength.set(p.length, [])
      byLength.get(p.length).push({ code: p.code, width: p.width })
    }
  }
  const strips = []
  for (const [length, pieces] of byLength) {
    pieces.sort((a, b) => b.width - a.width)
    const open = []
    for (const pc of pieces) {
      let s = open.find((st) => st.used + KERF + pc.width <= BOARD_W)
      if (!s || pc.width >= BOARD_W) {
        s = { length, pieces: [], used: -KERF }
        open.push(s)
      }
      pc.offsetW = s.used + KERF
      s.pieces.push(pc)
      s.used += KERF + pc.width
    }
    strips.push(...open)
  }
  return strips
}

/** First-fit decreasing: put each piece on the first board with room, longest pieces first. */
function pack(items, stockLengths, trim) {
  const longest = Math.max(...stockLengths)
  const shortest = Math.min(...stockLengths)
  const bins = []
  const warnings = []
  const sorted = [...items].sort((a, b) => b.length - a.length)
  for (const it of sorted) {
    let cap = longest - 2 * trim
    if (it.length > cap) {
      warnings.push(`A ${it.length}mm piece is longer than the longest stock (${longest}mm). Reduce the size.`)
      continue
    }
    let bin = bins.find((b) => b.used + (b.items.length ? KERF : 0) + it.length <= b.cap)
    if (!bin) {
      bin = { stock: longest, cap, used: 0, items: [] }
      bins.push(bin)
    }
    it.offset = trim + bin.used + (bin.items.length ? KERF : 0)
    bin.used += (bin.items.length ? KERF : 0) + it.length
    bin.items.push(it)
  }
  // Swap to a shorter (cheaper) length where everything still fits
  if (stockLengths.length > 1) {
    for (const b of bins) {
      const fits = stockLengths.filter((s) => s - 2 * trim >= b.used).sort((a, z) => a - z)
      if (fits.length && fits[0] < b.stock) {
        b.stock = fits[0]
        b.cap = b.stock - 2 * trim
      }
    }
  }
  // Order: long boards first, fullest first
  bins.sort((a, b) => b.stock - a.stock || b.used - a.used)
  return { bins, warnings, shortest }
}

export function planCuts(parts, stockKey = 'mixed') {
  const opt = STOCK_OPTIONS[stockKey] || STOCK_OPTIONS.mixed
  const boardParts = parts.filter((p) => p.mat === 'board')
  const frameParts = parts.filter((p) => p.mat === 'frame')

  const strips = makeStrips(boardParts)
  // If only 2.4m boards were chosen, pieces longer than that still need a 3.9m board
  let boardStock = opt.board
  const tooLong = Math.max(0, ...strips.map((s) => s.length)) > Math.max(...boardStock) - 2 * BOARD_TRIM
  const boards = pack(strips, tooLong ? [3900, ...boardStock] : boardStock, BOARD_TRIM)

  const frameItems = []
  for (const p of frameParts) for (let i = 0; i < p.qty; i++) frameItems.push({ length: p.length, code: p.code })
  let frameStock = opt.frame
  const frameTooLong = Math.max(0, ...frameItems.map((s) => s.length)) > Math.max(...frameStock) - 2 * FRAME_TRIM
  const frames = pack(frameItems, frameTooLong ? [4800, ...frameStock] : frameStock, FRAME_TRIM)

  const count = (bins, len) => bins.filter((b) => b.stock === len).length
  const usedArea = boards.bins.reduce((s, b) => s + b.items.reduce((t, st) => t + st.length * st.pieces.reduce((u, p) => u + p.width, 0), 0), 0)
  const stockArea = boards.bins.reduce((s, b) => s + b.stock * BOARD_W, 0)

  const warnings = [...boards.warnings, ...frames.warnings]
  if (tooLong) warnings.push('Some pieces are longer than 2.4m, so the plan uses 3.9m boards for those.')
  if (frameTooLong) warnings.push('Some framing pieces are longer than your chosen stock, so a longer length is used.')

  return {
    boards: boards.bins,
    frames: frames.bins,
    counts: {
      board3900: count(boards.bins, 3900),
      board2400: count(boards.bins, 2400),
      frame4800: count(frames.bins, 4800),
      frame3600: count(frames.bins, 3600),
      frame2400: count(frames.bins, 2400),
    },
    boardUse: stockArea ? usedArea / stockArea : 0,
    warnings,
  }
}
