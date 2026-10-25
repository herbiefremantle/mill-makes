import { box, panel, panelBoards, plant, BOARD_T as T } from '../lib/geometry.js'
import { prepSteps, finishStep, mm } from './prep.js'

const OVER = 25 // top overhangs each side
const BASE = 60 // bottom shelf lifted off the floor, with a kick board in front

function layout(d) {
  const W = d.width, D = d.depth, H = d.height, n = d.shelves
  const Cw = W - 2 * OVER
  const inner = Cw - 2 * T
  const gap = (H - T - BASE) / n
  const levels = Array.from({ length: n }, (_, i) => Math.round(BASE + i * gap))
  return { W, D, H, n, Cw, inner, gap, levels }
}

const SHOE = [[200, 60, 50], [10, 70, 50], [45, 15, 90], [220, 30, 35], [140, 30, 40], [0, 0, 92], [30, 50, 35]]

function model(d) {
  const L = layout(d)
  const { W, D, H, Cw, inner, levels, gap } = L
  const b = []
  b.push(...panel('sides', 'Side board', [OVER, 0, 0], H - T, D, 'y', { lengthAxis: 'z', reverse: true }))
  b.push(...panel('sides', 'Side board', [OVER + Cw - T, 0, 0], H - T, D, 'y', { lengthAxis: 'z', reverse: true }))
  levels.forEach((z, i) => b.push(...panel(i === 0 ? 'bottom' : 'shelves', 'Shelf board', [OVER + T, 0, z], inner, D, 'y', { lengthAxis: 'x', reverse: true })))
  b.push(box('bottom', 'Kick board', [OVER + T, D - T - 10, 0], [inner, T, BASE]))
  b.push(box('back', 'Back rail', [OVER + T, 0, H - T - 100], [inner, T, 100]))
  b.push(...panel('top', 'Top board', [0, 0, H - T], W, D, 'y', { lengthAxis: 'x', reverse: true }))

  // Shoes on every shelf
  let s = 5
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280)
  const p = { mat: 'prop', tone: 0.5 }
  levels.forEach((z) => {
    let x = OVER + T + 20
    const h = Math.min(gap - T - 20, 110)
    while (x < OVER + T + inner - 230) {
      const c = SHOE[Math.floor(rnd() * SHOE.length)]
      for (const dx of [0, 100]) b.push(box('props', 'Shoe', [x + dx, D - 270 - 10, z + T], [90, Math.min(260, D - 30), h], { ...p, color: c }))
      x += 225 + rnd() * 30
    }
  })
  b.push(...plant(W * 0.72, D / 2 - 60, H, 120))
  b.push(box('props', 'Tray', [W * 0.15, D / 2 - 90, H], [300, 180, 25], { ...p, color: [25, 20, 25] }))
  b.push(box('props', 'Keys bowl', [W * 0.15 + 60, D / 2 - 50, H + 25], [110, 110, 50], { ...p, color: [190, 15, 70] }))
  return { boxes: b, L }
}

function steps(d, { L }) {
  const { W, D, H, n, inner, gap, levels } = L
  const nb = panelBoards(D).length
  return [
    ...prepSteps({
      pick: 'the top',
      cut: [`Two sides at ${mm(H - T)} (${nb} boards each), ${n} shelves at ${mm(inner)} (${nb} boards each), a top at ${mm(W)}, a kick board and a back rail at ${mm(inner)}.`],
      rip: `Rip the kick board to ${BASE}mm and the back rail to 100mm.${D % 225 ? ` Your ${mm(D)} depth also needs the side, shelf and top boards ripped to ${panelBoards(D).join(' + ')}mm.` : ''}`,
    }),
    {
      title: 'Fix the bottom shelf and kick board',
      body: [`Screw the kick board under the front of the bottom shelf, set back 10mm. Stand it up on edge.`, `Glue and screw one side on: two 5.0 × 80mm screws into each shelf board end, ${BASE}mm off the floor.`],
      why: 'The kick board stiffens the bottom and hides the dusty gap under the shoes.',
      check: 'Side is square to the shelf: check with a combination square.',
      fix: '5.0 × 80mm screws, glue.',
      joint: 'butt',
      scene: { adds: ['bottom'] },
    },
    {
      title: 'Fit both sides',
      body: ['Fit the other side the same way. You now have a U shape.', 'Lay it on its back on a flat floor for the next steps.'],
      why: 'Working with it on its back makes the shelves easy to place.',
      check: 'Width at the top equals width at the bottom.',
      fix: '5.0 × 80mm screws, glue.',
      scene: { adds: ['sides'] },
    },
    {
      title: 'Add the shelves with spacer blocks',
      body: [
        `Cut two spacer blocks ${mm(gap - T)} long from offcuts. Stand them on the shelf below, rest the next shelf on them, and screw through the sides into its ends.`,
        'Move the spacers up and repeat for each shelf.',
      ],
      why: 'Spacers make every gap identical without measuring each one.',
      check: `Every shelf is ${mm(gap - T)} above the one below, at both ends.`,
      fix: '5.0 × 80mm screws, glue.',
      joint: 'spacer',
      scene: { adds: ['shelves'], move: { shelves: [0, 200, 0] } },
    },
    {
      title: 'Fit the back rail',
      body: ['Screw the back rail between the sides, flush with the top and the back edge.'],
      why: 'It stops the open back racking and gives the wall strap something solid to hold.',
      check: 'Front diagonals match within 3mm.',
      fix: '5.0 × 80mm screws.',
      scene: { adds: ['back'] },
    },
    {
      title: 'Fix the top',
      body: [`Lay the top on, overhanging ${OVER}mm each side and flush at the back. Screw down into the sides and back rail.`],
      why: 'A slight overhang makes it look like proper furniture rather than a box.',
      check: 'Equal overhang both sides.',
      fix: '5.0 × 80mm black screws.',
      joint: 'topdown',
      scene: { adds: ['top'], move: { top: [0, 0, 200] } },
    },
    finishStep('The dark look in the reference photo: one coat of dark walnut tinted oil, rub the edges with 240 grit for wear, then two coats of clear hard-wax oil.'),
    {
      title: 'Into the hallway and strap it',
      body: ['Felt pads underneath, then place it against the wall. Fix one anti-tip strap from the back rail into the wall.'],
      why: 'Children pull on shoe racks. A strap means it can’t tip.',
      check: 'Doesn’t rock, strap tight, corridor still clear.',
      fix: 'Anti-tip strap, felt pads.',
      joint: 'antitip',
      scene: { adds: ['props'] },
    },
  ]
}

export default {
  id: 'shoe-rack',
  name: 'The Shoe Rack Console',
  short: 'Shoe rack',
  tagline: 'Hallway console with shelves for shoes and a top for keys.',
  intro:
    'An all-timber hallway console in dark antique stain, like the reference photo: solid board sides, open shelves for shoes and boots, a kick board at the bottom and a top that overhangs just enough to look like furniture. Square cuts and straight screws only.',
  seed: 37,
  difficulty: 'Easy',
  level: 1,
  time: '1 weekend',
  defaultLook: 'antique',
  defaults: { width: 1000, depth: 300, height: 900, shelves: 3 },
  limits: { width: [600, 1600], depth: [225, 400], height: [700, 1100], shelves: [2, 4] },
  features: ['Holds 12–15 pairs of shoes', 'Dark antique finish as standard', 'Top for keys, post and a plant', 'Straight cuts and screws only'],
  model,
  explode: { sides: [0, 0, 0], bottom: [0, 0, -100], shelves: [0, 260, 0], back: [0, -260, 0], top: [0, 0, 300], props: [0, 0, 1400] },
  steps,
  orthoDims: () => ({ front: [], side: [], top: [] }),
  fixings: (d, { L }) => ({ screw80: (L.n + 2) * 2 * 2 * panelBoards(d.depth).length + 8, screw60: 6, glue: 250, antitip: 1, felt: 4 }),
  tools: {
    must: ['tape', 'square', 'pencil', 'circsaw', 'drill', 'bits', 'clamps', 'sander', 'denail', 'brush', 'level', 'trestles', 'ppe'],
    nice: ['mitre', 'impact', 'detector'],
  },
  joints: [
    { kind: 'butt', title: 'Side to shelf', text: 'Glue plus two screws through the side into each shelf board.' },
    { kind: 'spacer', title: 'Spacer blocks', text: 'Offcuts cut to the gap set every shelf height.' },
    { kind: 'antitip', title: 'Anti-tip strap', text: 'From the back rail into the wall.' },
  ],
  finish: ['Dark walnut tinted oil then clear hard-wax oil gives the reference look. Shoes bring in grit and water, so do three coats on the shelves.'],
  safety: [
    { title: 'Load', text: 'Each shelf holds a full row of boots easily (around 20kg).' },
    { title: 'Anti-tip', text: 'Strap it to the wall, especially if children use the hallway.' },
  ],
  images: [
    { file: 'hero.jpg', title: 'Shoe rack in the hallway', prompt: 'Photorealistic photo of an industrial chic rustic shoe rack console made from reclaimed scaffold boards, dark antique walnut stain with lighter worn edges, three open shelves filled with trainers and boots, overhanging top with a plant and a key bowl, in the stone-flagged entrance hall of a converted English mill, soft daylight, 35mm lens' },
    { file: 'detail-edge.jpg', joint: 'butt', title: 'Worn edge close-up', prompt: 'Close-up photo of the corner of a dark stained reclaimed scaffold board shelf unit, lighter worn edges, visible grain and saw marks, warm side light, shallow depth of field' },
  ],
}
