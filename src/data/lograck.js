import { box, panel, panelBoards, BOARD_T as T } from '../lib/geometry.js'
import { prepSteps, finishStep, mm } from './prep.js'
import { feet, prop } from './parts.js'

function layout(d) {
  const W = d.width, D = d.depth, H = d.height
  const z0 = T // feet
  const zb = z0 + T // top of base
  const inner = H - T - zb // height between base and top
  const divX = Math.round(W * 0.62)
  return { W, D, H, z0, zb, inner, divX }
}

function model(d) {
  const L = layout(d)
  const { W, D, H, z0, zb, inner, divX } = L
  const b = [...feet(W, D, T)]
  b.push(...panel('base', 'Base board', [0, 0, z0], W, D, 'y', { lengthAxis: 'x', reverse: true }))
  b.push(...panel('ends', 'End board', [0, 0, zb], inner, D, 'y', { lengthAxis: 'z', reverse: true }))
  b.push(...panel('ends', 'End board', [W - T, 0, zb], inner, D, 'y', { lengthAxis: 'z', reverse: true }))
  b.push(...panel('divider', 'Divider', [divX, T, zb], inner, D - T, 'y', { lengthAxis: 'z', reverse: true }))
  b.push(box('back', 'Back rail', [T, 0, H - T - 100], [W - 2 * T, T, 100]))
  b.push(...panel('top', 'Top board', [0, 0, H - T], W, D, 'y', { lengthAxis: 'x', reverse: true, bands: true }))

  // Logs stacked in the big bay, magazines in the small one
  const log = [24, 35, 38]
  const lw = Math.min(D - 40, 260)
  for (let row = 0; row < 3; row++) {
    const n = Math.floor((divX - T - 20) / 100)
    for (let i = 0; i < n - (row % 2); i++) {
      const z = zb + row * 85
      if (z + 85 > H - T - 100) continue
      b.push(prop('Log', [T + 10 + i * 100 + (row % 2) * 50, (D - lw) / 2, z], [90, lw, 85], [log[0], log[1], log[2] + ((i + row) % 3) * 6]))
    }
  }
  for (let k = 0; k < 6; k++) b.push(prop('Magazine', [divX + T + 15 + k * 14, D / 2 - 110, zb], [12, 220, Math.min(inner - 40, 290)], [[200, 30, 45], [10, 50, 50], [45, 20, 88]][k % 3]))
  b.push(prop('Candle', [W * 0.25, D / 2 - 40, H], [80, 80, 140], [40, 30, 92]))
  return { boxes: b, L }
}

function steps(d, { L }) {
  const { W, D, inner } = L
  const nb = panelBoards(D).length
  return [
    ...prepSteps({
      pick: 'the top',
      cut: [`Base and top at ${mm(W)}, two ends and a divider at ${mm(inner)} (${nb} boards each), and a back rail at ${mm(W - 2 * T)}.`],
      rip: 'Rip the back rail to 100mm. Cut four 75mm-square foot blocks from offcuts.',
    }),
    {
      title: 'Base and feet',
      body: ['Glue the base boards edge to edge. Screw a foot block under each corner.'],
      why: 'Feet lift it off the floor so bark and ash don’t sit against the wood.',
      check: 'Base sits flat without rocking.',
      fix: '5.0 × 80mm screws, glue.',
      scene: { adds: ['feet', 'base'] },
    },
    {
      title: 'Stand up the ends',
      body: ['Stand the end boards on the base at each end. Screw up through the base into them, and add a screw through each end into the base edge.'],
      why: 'Screwing from two directions makes a strong corner without brackets.',
      check: 'Ends upright on a level.',
      fix: '5.0 × 80mm screws, glue.',
      joint: 'butt',
      scene: { adds: ['ends'] },
    },
    {
      title: 'Divider and back rail',
      body: ['Stand the divider about two-thirds along: logs on the big side, magazines or kindling on the small side. Screw up through the base.', 'Fit the back rail between the ends at the top.'],
      why: 'The divider and back rail stop the open box racking sideways.',
      check: 'Divider upright, back rail flush with the top.',
      fix: '5.0 × 80mm screws.',
      scene: { adds: ['divider', 'back'] },
    },
    {
      title: 'Fix the top',
      body: ['Lay the top on, banded ends out, and screw down into the ends, divider and back rail.'],
      why: 'The top is a handy shelf for candles or matches.',
      check: 'Flush all round.',
      fix: '5.0 × 80mm black screws.',
      joint: 'topdown',
      scene: { adds: ['top'], move: { top: [0, 0, 180] } },
    },
    finishStep('Two coats of hard-wax oil. Logs scuff it: re-oil the base once a year.'),
    {
      title: 'Position it safely',
      body: ['Follow your stove’s manual for how far away combustible things must be (often 1 metre or more). Never put it directly in front of the stove or under a flue.'],
      why: 'Timber and dry logs too close to a stove can catch fire.',
      check: 'Clear of the stove by its manufacturer’s distance, and clear of escape routes.',
      scene: { adds: ['props'] },
    },
  ]
}

export default {
  id: 'log-rack',
  name: 'The Log & Magazine Rack',
  short: 'Log rack',
  tagline: 'Logs on one side, magazines on the other.',
  intro: 'An open-ended rack to keep logs tidy by a stove, with a smaller bay for kindling or magazines and a banded top for candles. If there’s no stove, it’s a lovely low magazine and book rack.',
  seed: 57,
  difficulty: 'Easy',
  level: 1,
  time: '1 day',
  defaults: { width: 800, depth: 300, height: 500 },
  limits: { width: [500, 1200], depth: [225, 450], height: [350, 700] },
  features: ['Two bays: logs and magazines', 'Feet keep it off the hearth', 'Banded top for candles', 'One day’s build'],
  model,
  explode: { feet: [0, 0, -120], base: [0, 0, -60], ends: [0, 0, 0], divider: [0, 220, 0], back: [0, -220, 0], top: [0, 0, 260], props: [0, 0, 800] },
  steps,
  orthoDims: () => ({ front: [], side: [], top: [] }),
  fixings: (d) => ({ screw80: 24 + panelBoards(d.depth).length * 6, glue: 150, felt: 4 }),
  tools: { must: ['tape', 'square', 'pencil', 'circsaw', 'drill', 'bits', 'clamps', 'sander', 'denail', 'brush', 'ppe'], nice: ['mitre', 'trestles'] },
  joints: [{ kind: 'butt', title: 'End to base', text: 'Screwed from below and from the side.' }],
  finish: ['Hard-wax oil. Antique dark hides bark marks and soot best.'],
  safety: [
    { title: 'Stove clearance', text: 'Keep the rack at least the distance your stove manufacturer specifies from the stove and flue. Store only a day or two’s logs indoors.' },
    { title: 'Common areas', text: 'Shared buildings often ban stoves and stored fuel in common parts. Check with the managing agent; use it as a magazine rack if so.' },
  ],
  images: [
    { file: 'hero.jpg', title: 'Log rack by the stove', prompt: 'Photorealistic photo of a rustic log and magazine rack made from reclaimed scaffold boards, logs stacked in the larger bay and magazines in the smaller bay, candles on the banded top, beside a cast-iron wood stove at a safe distance in a converted English mill, brick walls, warm evening light, 35mm lens' },
    { file: 'detail-logs.jpg', joint: 'butt', title: 'Logs and grain close-up', prompt: 'Close-up photo of split birch logs stacked in a rustic oiled reclaimed timber rack, warm firelight, shallow depth of field' },
  ],
}
