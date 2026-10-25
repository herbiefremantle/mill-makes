import { box, panel, panelBoards, BOARD_T as T } from '../lib/geometry.js'
import { prepSteps, finishStep, mm } from './prep.js'
import { prop, books } from './parts.js'

const LOW = 60 // lower shelf height off the floor

function layout(d) {
  const W = d.width, D = d.depth, H = d.height
  const mid = Math.round(LOW + (H - T - LOW) / 2)
  return { W, D, H, inner: W - 2 * T, mid }
}

function model(d) {
  const L = layout(d)
  const { W, D, H, inner, mid } = L
  const b = []
  b.push(...panel('sides', 'Side board', [0, 0, 0], H - T, D, 'y', { lengthAxis: 'z', reverse: true }))
  b.push(...panel('sides', 'Side board', [W - T, 0, 0], H - T, D, 'y', { lengthAxis: 'z', reverse: true }))
  b.push(...panel('bottom', 'Shelf board', [T, 0, LOW], inner, D, 'y', { lengthAxis: 'x', reverse: true }))
  b.push(...panel('shelf', 'Shelf board', [T, 0, mid], inner, D, 'y', { lengthAxis: 'x', reverse: true }))
  b.push(box('back', 'Back rail', [T, 0, H - T - 100], [inner, T, 100]))
  b.push(...panel('top', 'Top board', [0, 0, H - T], W, D, 'y', { lengthAxis: 'x', reverse: true }))

  b.push(prop('Lamp base', [W * 0.3, D * 0.4, H], [110, 110, 40], [30, 15, 25]))
  b.push(prop('Lamp', [W * 0.3 + 45, D * 0.4 + 45, H + 40], [20, 20, 260], [30, 15, 25]))
  b.push(prop('Shade', [W * 0.3 - 35, D * 0.4 - 35, H + 280], [180, 180, 140], [38, 40, 86]))
  b.push(...books(T + 20, T + inner * 0.6, D - 190, mid + T, H - T - 100 - mid - T - 20, 4))
  b.push(prop('Basket', [T + 20, 30, LOW + T], [inner - 40, D - 60, Math.min(160, mid - LOW - T - 20)], [34, 38, 58]))
  return { boxes: b, L }
}

function steps(d, { L }) {
  const { W, D, H, inner, mid } = L
  const nb = panelBoards(D).length
  return [
    ...prepSteps({
      pick: 'the top',
      cut: [`Two sides at ${mm(H - T)}, two shelves at ${mm(inner)}, one top at ${mm(W)} (${nb} boards each), and a back rail at ${mm(inner)}.`],
      rip: `Rip the back rail to 100mm.${D % 225 ? ` Your ${mm(D)} depth also needs boards ripped to ${panelBoards(D).join(' + ')}mm.` : ''}`,
    }),
    {
      title: 'Fix the bottom shelf between the sides',
      body: [`Stand a side on edge. Glue and screw the bottom shelf to it, ${LOW}mm off the floor, two 5.0 × 80mm screws per board. Then add the other side.`],
      why: 'Lifting the shelf off the floor keeps it clear of mops and spills.',
      check: 'Sides square to the shelf.',
      fix: '5.0 × 80mm screws, glue.',
      joint: 'butt',
      scene: { adds: ['sides', 'bottom'] },
    },
    {
      title: 'Fit the middle shelf',
      body: [`Cut two spacers ${mm(mid - LOW - T)} long. Stand them on the bottom shelf, rest the middle shelf on them and screw through the sides.`],
      why: 'Spacers get it level without measuring.',
      check: 'Same height at both ends.',
      fix: '5.0 × 80mm screws, glue.',
      joint: 'spacer',
      scene: { adds: ['shelf'], move: { shelf: [0, 160, 0] } },
    },
    {
      title: 'Back rail and top',
      body: ['Screw the back rail between the sides, flush at the top and back.', 'Lay the top on, flush all round, and screw down into the sides and back rail.'],
      why: 'The back rail stops it racking; the top ties everything together.',
      check: 'Diagonals across the front match.',
      fix: '5.0 × 80mm black screws.',
      joint: 'topdown',
      scene: { adds: ['back', 'top'], move: { top: [0, 0, 180] } },
    },
    finishStep(),
    {
      title: 'Felt pads and style it',
      body: ['Felt pads underneath, then a lamp on top and books and a basket below.'],
      why: 'Felt pads stop it scratching floors and make it easy to move.',
      check: 'Doesn’t rock.',
      scene: { adds: ['props'] },
    },
  ]
}

export default {
  id: 'side-table',
  name: 'The Side Table',
  short: 'Side table',
  tagline: 'A little box table for beside the sofa or bed.',
  intro: 'The smallest build: a compact box of boards with two shelves and a solid top. Use it as a bedside table, a lamp table by a sofa, or make a pair. A great way to use up offcuts from the bigger projects.',
  seed: 53,
  difficulty: 'Easy',
  level: 1,
  time: '1 day',
  defaults: { width: 450, depth: 450, height: 550 },
  limits: { width: [350, 700], depth: [300, 600], height: [450, 700] },
  features: ['Two shelves', 'Uses offcuts well', 'Straight cuts and screws only', 'Make a matching pair'],
  model,
  explode: { sides: [0, 0, 0], bottom: [0, 0, -80], shelf: [0, 200, 0], back: [0, -200, 0], top: [0, 0, 220], props: [0, 0, 800] },
  steps,
  orthoDims: () => ({ front: [], side: [], top: [] }),
  fixings: (d) => ({ screw80: 2 * 2 * 2 * panelBoards(d.depth).length + 8, glue: 150, felt: 4 }),
  tools: { must: ['tape', 'square', 'pencil', 'circsaw', 'drill', 'bits', 'clamps', 'sander', 'denail', 'brush', 'ppe'], nice: ['mitre', 'trestles'] },
  joints: [
    { kind: 'butt', title: 'Side to shelf', text: 'Glue plus two screws per board.' },
    { kind: 'spacer', title: 'Spacer blocks', text: 'Set the middle shelf height.' },
  ],
  finish: ['Hard-wax oil. A bedside table gets water glasses: give the top an extra coat.'],
  safety: [{ title: 'Load', text: 'Holds a lamp, books and a drink easily. Don’t stand on it.' }],
  images: [
    { file: 'hero.jpg', title: 'Side table beside a sofa', prompt: 'Photorealistic photo of a small rustic side table made from reclaimed scaffold boards, two open shelves with books and a basket, brass lamp on top, beside a linen sofa in a converted English mill with brick walls, soft daylight, 35mm lens' },
    { file: 'detail-corner.jpg', joint: 'butt', title: 'Corner close-up', prompt: 'Close-up photo of the corner of a reclaimed scaffold board side table, oiled grain, black screw heads, warm light, shallow depth of field' },
  ],
}
