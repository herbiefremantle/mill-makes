import { box, plant, BOARD_T as T, BOARD_W as BW } from '../lib/geometry.js'
import { prepSteps, finishStep, mm } from './prep.js'
import { frame, FT, FW } from './parts.js'

const EI = 40 // end frames set in from the board ends

function layout(d) {
  const W = d.width, n = d.tiers, rise = d.rise
  const D = n * BW
  const xe = [EI, W - EI - FT]
  // tier 0 is the lowest, at the front
  const tiers = Array.from({ length: n }, (_, k) => ({ y: (n - 1 - k) * BW, z: (k + 1) * rise - T, postH: (k + 1) * rise - T - FW }))
  return { W, n, rise, D, xe, tiers, stretchL: W - 2 * EI - 2 * FT }
}

function model(d) {
  const L = layout(d)
  const { W, D, xe, tiers, stretchL } = L
  const b = []
  for (const x of xe) {
    b.push(box('ends', 'Floor rail', [x, 0, 0], [FT, D, FW], frame))
    for (const t of tiers) b.push(box('ends', 'Post', [x, t.y + (BW - FW) / 2, FW], [FT, FW, t.postH], frame))
  }
  b.push(box('stretchers', 'Floor stretcher', [EI + FT, 0, 0], [stretchL, FT, FW], frame))
  b.push(box('stretchers', 'Floor stretcher', [EI + FT, D - FT, 0], [stretchL, FT, FW], frame))
  for (const t of tiers) b.push(box('tiers', 'Tier board', [0, t.y, t.z], [W, BW, T], { bands: true }))
  b.push(box('tiers', 'Wall strap', [W / 2 - 15, -3, tiers.at(-1).z - 60], [30, 3, 40], { mat: 'steel' }))
  tiers.forEach((t, k) => {
    const count = Math.max(1, Math.floor(W / 320))
    for (let i = 0; i < count; i++) b.push(...plant(((i + 0.5) * W) / count - 55 + (k % 2) * 40, t.y + 55, t.z + T, 95 + ((i + k) % 3) * 15))
  })
  return { boxes: b, L }
}

function steps(d, { L }) {
  const { W, n, tiers, stretchL, D } = L
  return [
    ...prepSteps({
      pick: 'the front tier',
      cut: [`Boards: ${n} tier boards at ${mm(W)}. Framing: 2 floor rails at ${mm(D)}, 2 floor stretchers at ${mm(stretchL)}, and posts for each end at ${tiers.map((t) => mm(t.postH)).join(', ')}.`],
      rip: null,
    }),
    {
      title: 'Build the two end frames',
      body: ['Lay a floor rail flat on edge. Stand a post on it under the middle of each tier position, tallest at the back. Glue and screw up through the rail into each post.'],
      why: 'Each post holds up one tier, so the heights must be exact.',
      check: 'Posts upright on a square, tops at the right heights.',
      fix: '5.0 × 80mm screws, glue.',
      joint: 'butt',
      scene: { adds: ['ends'] },
    },
    {
      title: 'Join them with floor stretchers',
      body: ['Stand the ends up and screw a stretcher between the floor rails at the front and back.'],
      why: 'Stretchers stop the stand racking when you lean over to water plants.',
      check: 'Both ends upright and parallel.',
      fix: '5.0 × 80mm screws.',
      scene: { adds: ['stretchers'] },
    },
    {
      title: 'Fix the tiers',
      body: ['Lay each tier board across its posts, banded ends out, and screw down into each post with two black screws.'],
      why: 'Screwed tiers lock the whole frame square.',
      check: 'Every tier level, overhang equal at both ends.',
      fix: '5.0 × 80mm black screws.',
      joint: 'topdown',
      scene: { adds: ['tiers'], move: { tiers: [0, 0, 160] } },
    },
    finishStep('Worktop oil on the tiers: three coats resist watering splashes. Hard-wax oil on the frame.'),
    {
      title: 'Place it, strap it, plant it',
      body: ['Stand it by a window, out of escape routes. Fix the wall strap from the top tier into the wall. Use pots with saucers.'],
      why: 'A tall stand full of wet pots is heavy at the top. The strap keeps it upright.',
      check: 'Strap tight, every pot on a saucer.',
      fix: 'Anti-tip strap.',
      joint: 'antitip',
      scene: { adds: ['props'] },
    },
  ]
}

export default {
  id: 'plant-stand',
  name: 'The Tiered Plant Stand',
  short: 'Plant stand',
  tagline: 'Stepped shelves for plants by a big mill window.',
  intro: 'A stepped stand that shows off plants by a window: each tier sits higher and further back, so everything gets light. Square cuts only, on simple post-and-rail end frames. It replaces a leaning ladder shelf, which needs angled cuts.',
  seed: 67,
  difficulty: 'Easy',
  level: 1,
  time: '1 weekend',
  defaults: { width: 900, tiers: 3, rise: 250 },
  limits: { width: [500, 1500], tiers: [2, 4], rise: [180, 350] },
  dimMeta: { width: { label: 'Width', unit: 'mm' }, tiers: { label: 'Tiers', unit: '' }, rise: { label: 'Step height', unit: 'mm' } },
  size: (d) => ({ width: d.width, depth: d.tiers * BW, height: d.tiers * d.rise }),
  features: ['Every plant gets the light', 'Square cuts only', 'Banded tier ends', 'Worktop oil resists watering'],
  model,
  explode: { ends: [0, 0, 0], stretchers: [0, 0, -100], tiers: [0, 0, 300], props: [0, 0, 900] },
  steps,
  orthoDims: () => ({ front: [], side: [], top: [] }),
  fixings: (d) => ({ screw80: d.tiers * 2 * 2 * 2 + 8, glue: 150, antitip: 1, felt: 4 }),
  topArea: (d) => (d.width * BW * d.tiers + 2 * d.width * T * d.tiers) / 1e6,
  tools: { must: ['tape', 'square', 'pencil', 'circsaw', 'drill', 'bits', 'clamps', 'sander', 'denail', 'brush', 'level', 'ppe'], nice: ['mitre', 'detector'] },
  joints: [
    { kind: 'butt', title: 'Post on rail', text: 'Glue plus screws up through the floor rail.' },
    { kind: 'topdown', title: 'Tier on post', text: 'Black screws down into each post.' },
    { kind: 'antitip', title: 'Wall strap', text: 'From the top tier into the wall.' },
  ],
  finish: ['Worktop oil on the tiers for water resistance. Always use saucers under pots.'],
  safety: [
    { title: 'Water', text: 'Standing water rots timber and marks floors. Saucers under every pot.' },
    { title: 'Anti-tip', text: 'Strap it to the wall: heavy wet pots on the top tier make it top-heavy.' },
  ],
  images: [
    { file: 'hero.jpg', title: 'Plant stand by a mill window', prompt: 'Photorealistic photo of a tiered stepped plant stand made from reclaimed scaffold boards on simple timber end frames, three tiers full of potted plants and trailing ivy, in front of a tall arched steel window in a converted English mill, brick walls, bright daylight, 35mm lens' },
    { file: 'detail-tier.jpg', joint: 'topdown', title: 'Tier close-up', prompt: 'Close-up photo of terracotta plant pots on an oiled reclaimed scaffold board tier with a galvanised end band, water droplets, warm light, shallow depth of field' },
  ],
}
