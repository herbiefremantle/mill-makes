import { box, plant, BOARD_T as T, BOARD_W as BW } from '../lib/geometry.js'
import { prepSteps, finishStep, mm } from './prep.js'
import { prop, books } from './parts.js'

const GAP = 0 // crates stack tight, side by side

function layout(d) {
  const n = d.crates, W = d.width, H = d.height
  const cols = n > 1 ? 2 : 1
  const rows = Math.ceil(n / cols)
  const pos = Array.from({ length: n }, (_, i) => ({ x: (i % cols) * (W + GAP), z: Math.floor(i / cols) * H, col: i % cols, row: Math.floor(i / cols) }))
  return { n, W, H, cols, rows, pos }
}

function model(d) {
  const L = layout(d)
  const { W, H, pos } = L
  const b = []
  pos.forEach(({ x, z }, i) => {
    const g = `crate${i + 1}`
    b.push(box(g, 'Top / bottom', [x, 0, z], [W, BW, T]))
    b.push(box(g, 'Side', [x, 0, z + T], [T, BW, H - 2 * T]))
    b.push(box(g, 'Side', [x + W - T, 0, z + T], [T, BW, H - 2 * T]))
    b.push(box(g, 'Back strip', [x + T, 0, z + H - T - 75], [W - 2 * T, T, 75]))
    b.push(box(g, 'Top / bottom', [x, 0, z + H - T], [W, BW, T]))
    // a different thing in each crate
    const inner = { x0: x + T, x1: x + W - T, z: z + T, h: H - 2 * T }
    if (i % 3 === 0) b.push(...books(inner.x0 + 15, inner.x0 + (inner.x1 - inner.x0) * 0.7, 20, inner.z, inner.h - 20, i + 2))
    else if (i % 3 === 1) b.push(prop('Basket', [inner.x0 + 15, 15, inner.z], [inner.x1 - inner.x0 - 30, BW - 30, Math.min(inner.h - 20, 180)], [34, 38, 58]))
    else b.push(...plant((inner.x0 + inner.x1) / 2 - 50, BW / 2 - 50, inner.z, Math.min(100, inner.h / 2.2)))
  })
  return { boxes: b, L }
}

const explode = { props: [0, 0, 2000] }
for (let i = 0; i < 8; i++) explode[`crate${i + 1}`] = [(i % 2 ? 1 : -1) * 120, 0, Math.floor(i / 2) * 140]

function steps(d, { L }) {
  const { n, W, H } = L
  const rest = Array.from({ length: n - 1 }, (_, i) => `crate${i + 2}`)
  return [
    ...prepSteps({
      pick: 'the crate tops and bottoms (they’re what you see from the front)',
      cut: [`For each crate: a top and bottom at ${mm(W)}, two sides at ${mm(H - 2 * T)}, and a back strip at ${mm(W - 2 * T)}. That’s ${n * 2} long and ${n * 2} short pieces in total.`, 'Cut all the sides in one go with a stop block so they match perfectly.'],
      rip: `Rip the back strips to 75mm wide (${n} of them).`,
    }),
    {
      title: 'Build the first crate',
      body: ['Stand the two sides on the bottom board, flush at the ends. Glue and screw up through the bottom into each side. Lay the top on and screw down.', 'Screw the back strip between the sides at the top back.'],
      why: 'The back strip stops the open box going diamond-shaped.',
      check: 'Front diagonals match within 2mm.',
      fix: '8 × 5.0 × 80mm screws, glue.',
      joint: 'butt',
      scene: { adds: ['crate1'] },
    },
    ...(n > 1
      ? [{
          title: `Build the other ${n - 1}`,
          body: ['Repeat exactly the same way. Use the first crate as a template to check each one.'],
          why: 'Identical crates stack neatly in any arrangement.',
          check: 'Each crate matches the first when held against it.',
          fix: '5.0 × 80mm screws, glue.',
          scene: { adds: rest },
        }]
      : []),
    finishStep(),
    {
      title: 'Stack and fix together',
      body: ['Arrange them how you like. Screw neighbouring crates together through their sides with two 4.0 × 60mm screws, and stacked crates through top and bottom.', n > 4 ? 'With more than two rows, strap the top crates to the wall.' : 'Felt pads under the bottom row.'],
      why: 'Joined crates can’t slide or topple.',
      check: 'The stack doesn’t move when you push the top.',
      fix: '4.0 × 60mm screws.',
      joint: 'antitip',
      scene: { adds: ['props'] },
    },
  ]
}

export default {
  id: 'crates',
  name: 'The Storage Crates',
  short: 'Crates',
  tagline: 'Open crates you can stack into shelving, any way you like.',
  intro: 'Simple open crates from scaffold boards: stack them into a bookcase, line them up as a TV bench, or hang them on the wall. A brilliant way to use up offcuts, and you can add more later.',
  seed: 63,
  difficulty: 'Easy',
  level: 1,
  time: '1 weekend',
  defaults: { crates: 4, width: 500, height: 300 },
  limits: { crates: [1, 8], width: [350, 800], height: [250, 450] },
  dimMeta: { crates: { label: 'Crates', unit: '' }, width: { label: 'Crate width', unit: 'mm' }, height: { label: 'Crate height', unit: 'mm' } },
  size: (d) => {
    const L = layout(d)
    return { width: L.cols * d.width, depth: BW, height: L.rows * d.height }
  },
  features: ['Stack in any arrangement', 'Uses offcuts', 'Add more crates later', 'One board deep: no ripping'],
  model,
  explode,
  steps,
  orthoDims: () => ({ front: [], side: [], top: [] }),
  fixings: (d) => ({ screw80: 8 * d.crates, screw60: 4 * d.crates, glue: 40 * d.crates, antitip: d.crates > 4 ? 1 : 0, felt: 4 }),
  tools: { must: ['tape', 'square', 'pencil', 'circsaw', 'drill', 'bits', 'clamps', 'sander', 'denail', 'brush', 'ppe'], nice: ['mitre', 'trestles'] },
  joints: [
    { kind: 'butt', title: 'Side to bottom', text: 'Glue plus screws up through the bottom.' },
    { kind: 'antitip', title: 'Wall strap', text: 'For stacks more than two high.' },
  ],
  finish: ['Hard-wax oil. Try antique dark on some crates and natural on others for a mixed look.'],
  safety: [{ title: 'Stacking', text: 'Screw stacked crates together. Stacks taller than two crates must be strapped to the wall.' }],
  images: [
    { file: 'hero.jpg', title: 'Stacked crates as shelving', prompt: 'Photorealistic photo of open storage crates made from reclaimed scaffold boards stacked two wide and two high as shelving, filled with books, wicker baskets and plants, against a brick wall in a converted English mill, soft daylight, 35mm lens' },
    { file: 'detail-crate.jpg', joint: 'butt', title: 'Crate corner close-up', prompt: 'Close-up photo of the corner of a reclaimed scaffold board crate, oiled grain, black screw heads, warm light, shallow depth of field' },
  ],
}
