import { box, panel, panelBoards, plant, BOARD_T as T } from '../lib/geometry.js'
import { prepSteps, finishStep, mm } from './prep.js'
import { frame, prop, books, FT, FW } from './parts.js'

function layout(d) {
  const W = d.width, D = d.depth, H = d.height
  const z0 = FW // plinth
  const zb = z0 + T
  const inner = H - T - zb
  const bayW = (W - 4 * T) / 3
  const divXs = [T + bayW, T + 2 * bayW + T]
  const shelfZ = Math.round(zb + inner / 2 - T / 2)
  return { W, D, H, z0, zb, inner, bayW, divXs, shelfZ }
}

function model(d) {
  const L = layout(d)
  const { W, D, H, z0, zb, inner, bayW, divXs, shelfZ } = L
  const b = []
  const cl = D - 40 - 2 * FT
  b.push(box('plinth', 'Plinth rail, long', [0, 0, 0], [W, FT, FW], frame))
  b.push(box('plinth', 'Plinth rail, long', [0, D - 40 - FT, 0], [W, FT, FW], frame))
  for (const x of [0, W / 2 - FT / 2, W - FT]) b.push(box('plinth', 'Plinth rail, short', [x, FT, 0], [FT, cl, FW], frame))
  b.push(...panel('base', 'Base board', [T, 0, z0], W - 2 * T, D, 'y', { lengthAxis: 'x', reverse: true }))
  b.push(...panel('sides', 'Side board', [0, 0, z0], H - T - z0, D, 'y', { lengthAxis: 'z', reverse: true }))
  b.push(...panel('sides', 'Side board', [W - T, 0, z0], H - T - z0, D, 'y', { lengthAxis: 'z', reverse: true }))
  for (const x of divXs) b.push(...panel('dividers', 'Divider', [x, T, zb], inner, D - T, 'y', { lengthAxis: 'z', reverse: true }))
  b.push(...panel('shelf', 'Shelf board', [divXs[0] + T, T, shelfZ], bayW, D - T, 'y', { lengthAxis: 'x', reverse: true }))
  b.push(box('back', 'Back rail', [T, 0, H - T - 100], [W - 2 * T, T, 100]))
  b.push(box('back', 'Cable grommet', [W / 2 - 30, -2, H - T - 80], [60, 2, 60], { mat: 'steel' }))
  b.push(...panel('top', 'Top board', [0, 0, H - T], W, D, 'y', { lengthAxis: 'x', reverse: true, bands: true }))

  // TV and styling
  const tvW = Math.min(1250, W * 0.75)
  b.push(prop('TV stand', [W / 2 - 150, D / 2 - 100, H], [300, 200, 15], [220, 6, 15]))
  b.push(prop('TV stand', [W / 2 - 20, D / 2 - 20, H + 15], [40, 25, 60], [220, 6, 15]))
  b.push(prop('TV', [W / 2 - tvW / 2, D / 2 - 15, H + 75], [tvW, 30, tvW * 0.57], [220, 8, 10]))
  b.push(prop('Console', [divXs[0] + T + 30, 40, zb], [Math.min(300, bayW - 60), 260, 70], [220, 5, 92]))
  b.push(...books(T + 20, T + bayW * 0.6, D - 200, zb, inner - 40, 9))
  b.push(prop('Basket', [divXs[1] + T + 20, 30, zb], [bayW - 40, D - 60, Math.min(inner - 40, 220)], [34, 38, 58]))
  b.push(...plant(W - 220, D / 2 - 50, H, 110))
  return { boxes: b, L }
}

function steps(d, { L }) {
  const { W, D, H, inner, bayW, z0 } = L
  const nb = panelBoards(D).length
  return [
    ...prepSteps({
      pick: 'the top',
      cut: [`Boards: top at ${mm(W)}, base at ${mm(W - 2 * T)}, 2 sides at ${mm(H - T - z0)}, 2 dividers at ${mm(inner)}, a shelf at ${mm(bayW)}, back rail at ${mm(W - 2 * T)}. Framing for the plinth.`],
      rip: `Rip the back rail to 100mm.${D % 225 ? ` Your ${mm(D)} depth needs boards ripped to ${panelBoards(D).join(' + ')}mm.` : ''}`,
    }),
    {
      title: 'Build the plinth',
      body: ['Glue and screw the plinth rails into a ladder frame, set back 40mm at the front. Fit levelling feet underneath.'],
      why: 'A recessed plinth makes the unit look like it floats, and levels it on old floors.',
      check: 'Diagonals match, and it doesn’t rock.',
      fix: '5.0 × 80mm screws, glue, 4 levelling feet.',
      joint: 'plinth',
      scene: { adds: ['plinth'] },
    },
    {
      title: 'Base and sides',
      body: ['Lay the base boards on the plinth and screw down. Stand the sides at each end and screw through them into the base.'],
      why: 'This is the box everything else hangs on.',
      check: 'Sides upright on a level.',
      fix: '5.0 × 80mm screws, glue.',
      joint: 'butt',
      scene: { adds: ['base', 'sides'], move: { sides: [0, 0, 120] } },
    },
    {
      title: 'Fit the dividers',
      body: [`Use a spacer ${mm(bayW)} long to place each divider so all three bays match. Fix the bottoms with pocket screws.`],
      why: 'Equal bays look calm and planned.',
      check: `Every bay ${mm(bayW)} wide at front and back.`,
      fix: '63mm pocket screws, glue.',
      joint: 'pocket',
      scene: { adds: ['dividers'] },
    },
    {
      title: 'Middle shelf and back rail',
      body: ['Screw the shelf into the middle bay through the dividers, using spacers to set it level.', 'Drill a 60mm hole in the middle of the back rail, fit a grommet, then screw the rail between the sides at the top.'],
      why: 'The grommet takes TV, console and router cables neatly to the wall.',
      check: 'Shelf level; plugs pass through the grommet.',
      fix: '5.0 × 80mm screws, grommet.',
      joint: 'spacer',
      scene: { adds: ['shelf', 'back'] },
    },
    {
      title: 'Fix the top',
      body: ['Lay the top on, banded ends out, and screw down into the sides, dividers and back rail in neat lines.'],
      why: 'The top carries the TV: screwed into every upright, it can’t sag.',
      check: 'Flat and flush all round.',
      fix: '5.0 × 80mm black screws.',
      joint: 'topdown',
      scene: { adds: ['top'], move: { top: [0, 0, 220] } },
    },
    finishStep(),
    {
      title: 'Level, strap and set up',
      body: ['Level it with the feet. Fix an anti-tip strap from the back rail to the wall, and strap the TV to the wall or unit too.', 'Leave space behind for ventilation around the TV and console.'],
      why: 'TVs on units are a known tipping risk for children. Both should be strapped.',
      check: 'Unit and TV both strapped, cables through the grommet.',
      fix: 'Anti-tip straps.',
      joint: 'antitip',
      scene: { adds: ['props'] },
    },
  ]
}

export default {
  id: 'tv-unit',
  name: 'The TV & Media Unit',
  short: 'TV unit',
  tagline: 'Long, low and calm: three bays and a cable grommet.',
  intro: 'A long, low media unit on a floating plinth: three equal open bays for books, a games console and baskets, a cable grommet in the back rail, and a banded top strong enough for a big TV.',
  seed: 71,
  difficulty: 'Moderate',
  level: 2,
  time: '2 weekends',
  defaults: { width: 1600, depth: 400, height: 500 },
  limits: { width: [1000, 2200], depth: [300, 500], height: [400, 650] },
  features: ['Three equal open bays', 'Cable grommet in the back', 'Floating plinth with levelling feet', 'Takes a 55" TV'],
  model,
  explode: { plinth: [0, 0, -200], base: [0, 0, -80], sides: [0, 0, 0], dividers: [0, 260, 0], shelf: [0, 380, 0], back: [0, -260, 0], top: [0, 0, 280], props: [0, 0, 1400] },
  steps,
  orthoDims: () => ({ front: [{ axis: 'v', from: 0, to: FW, level: 1 }], side: [], top: [] }),
  fixings: (d) => ({ screw80: 30 + panelBoards(d.depth).length * 8, pocket: 8, glue: 300, levellers: 4, antitip: 1, grommet: 1 }),
  tools: { must: ['tape', 'square', 'pencil', 'circsaw', 'drill', 'bits', 'pocket', 'holesaw', 'clamps', 'sander', 'denail', 'brush', 'level', 'trestles', 'ppe'], nice: ['mitre', 'impact', 'detector'] },
  joints: [
    { kind: 'plinth', title: 'Plinth corner', text: 'Rails on edge, glued and screwed.' },
    { kind: 'pocket', title: 'Divider pocket screws', text: 'Hidden screws hold each divider down.' },
    { kind: 'antitip', title: 'Anti-tip strap', text: 'Strap the unit and the TV.' },
  ],
  finish: ['Hard-wax oil. Antique dark looks smart around a black TV screen.'],
  safety: [
    { title: 'TV tipping', text: 'Always strap both the unit and the TV to the wall. Falling TVs injure children every year.' },
    { title: 'Ventilation', text: 'Leave a gap behind consoles and routers. Don’t box them in.' },
  ],
  images: [
    { file: 'hero.jpg', title: 'TV unit in the lounge', prompt: 'Photorealistic photo of a long low TV media unit made from reclaimed scaffold boards on a recessed dark plinth, three open bays with books, a games console and baskets, a flat-screen TV on top, in the lounge of a converted English mill with brick walls, soft evening light, 35mm lens' },
    { file: 'detail-bay.jpg', joint: 'pocket', title: 'Bay close-up', prompt: 'Close-up photo of an open bay in a reclaimed scaffold board media unit with neatly stacked books, oiled grain, warm light, shallow depth of field' },
  ],
}
