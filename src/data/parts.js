// Building blocks shared by several projects.
import { box, BOARD_W as BW, FRAME_T as FT, FRAME_W as FW } from '../lib/geometry.js'

export const frame = { mat: 'frame' }
export const LEG_X = FW // doubled legs: 100mm across the front...
export const LEG_Y = 2 * FT // ...and 94mm deep (two 47 × 100 glued face to face)

/** Doubled legs at every combination of xs and ys. */
export function legsAt(group, xs, ys, h) {
  const out = []
  for (const x of xs)
    for (const y of ys) {
      out.push(box(group, 'Leg half', [x, y, 0], [FW, FT, h], frame))
      out.push(box(group, 'Leg half', [x, y + FT, 0], [FW, FT, h], frame))
    }
  return out
}

/** Plain plaster wall for step pictures of wall-mounted pieces (the hero picture swaps in the brick room). */
export const wall = (x0, x1, z0, z1) => box('wall', 'Wall', [x0, -40, z0], [x1 - x0, 40, z1 - z0], { mat: 'prop', color: [36, 24, 86], tone: 0.5 })

/** Four foot blocks cut from offcuts, one board thick. */
export function feet(W, D, t) {
  const out = []
  for (const x of [0, W - 75]) for (const y of [0, D - 75]) out.push(box('feet', 'Foot block', [x, y, 0], [75, 75, t]))
  return out
}

const BOOK = [[8, 45, 34], [200, 30, 30], [40, 55, 45], [150, 18, 38], [30, 20, 82], [355, 30, 42]]
/** A row of books standing on a surface. */
export function books(x0, x1, y, z, maxH, seed = 1) {
  let s = seed * 7919
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280)
  const out = []
  let x = x0
  while (x < x1) {
    const w = 22 + rnd() * 22
    out.push(box('props', 'Book', [x, y, z], [w, Math.min(BW - 40, 170), Math.min(maxH, 170 + rnd() * 80)], { mat: 'prop', color: BOOK[Math.floor(rnd() * BOOK.length)], tone: 0.5 }))
    x += w + 1
  }
  return out
}

export const prop = (name, pos, size, color) => box('props', name, pos, size, { mat: 'prop', color, tone: 0.5 })
export { FT, FW, BW }
