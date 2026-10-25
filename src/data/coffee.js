import { box, panel, panelBoards, plant, BOARD_T as T } from '../lib/geometry.js'
import { prepSteps, finishStep, mm } from './prep.js'
import { legsAt, frame, prop, books, LEG_Y, FT, FW } from './parts.js'

const IN = 30 // legs set in from the edge of the top
const RAIL = 90 // underside of the shelf rails

function layout(d) {
  const W = d.width, D = d.depth, H = d.height
  return { W, D, H, legH: H - T, longL: W - 2 * IN - 2 * FW, shortL: D - 2 * IN - 2 * LEG_Y, zA: H - T - FW, shelfZ: RAIL + FW }
}

function model(d) {
  const L = layout(d)
  const { W, D, H, legH, longL, shortL, zA, shelfZ } = L
  const b = [...legsAt('legs', [IN, W - IN - FW], [IN, D - IN - LEG_Y], legH)]
  b.push(box('aprons', 'Long apron', [IN + FW, D - IN - FT, zA], [longL, FT, FW], frame))
  b.push(box('aprons', 'Long apron', [IN + FW, IN, zA], [longL, FT, FW], frame))
  b.push(box('aprons', 'Short apron', [IN, IN + LEG_Y, zA], [FT, shortL, FW], frame))
  b.push(box('aprons', 'Short apron', [W - IN - FT, IN + LEG_Y, zA], [FT, shortL, FW], frame))
  b.push(box('rails', 'Shelf rail', [IN + FW, IN, RAIL], [FT, D - 2 * IN, FW], frame))
  b.push(box('rails', 'Shelf rail', [W - IN - FW - FT, IN, RAIL], [FT, D - 2 * IN, FW], frame))
  b.push(...panel('shelf', 'Shelf board', [IN + FW, IN, shelfZ], longL, D - 2 * IN, 'y', { lengthAxis: 'x', reverse: true }))
  b.push(...panel('top', 'Top board', [0, 0, H - T], W, D, 'y', { lengthAxis: 'x', reverse: true, bands: true }))

  b.push(prop('Tray', [W * 0.2, D * 0.3, H], [380, 260, 25], [25, 20, 25]))
  b.push(prop('Candle', [W * 0.2 + 60, D * 0.3 + 80, H + 25], [80, 80, 120], [40, 30, 92]))
  b.push(...plant(W * 0.7, D * 0.35, H, 120))
  b.push(prop('Magazines', [W * 0.25, D * 0.3, shelfZ + T], [300, 230, 40], [200, 15, 70]))
  b.push(prop('Basket', [W * 0.55, D * 0.25, shelfZ + T], [300, 260, 150], [34, 38, 58]))
  return { boxes: b, L }
}

function steps(d, { L }) {
  const { W, D, legH, longL, shortL } = L
  const nb = panelBoards(D).length
  return [
    ...prepSteps({
      pick: 'the top',
      cut: [`Framing: 8 leg halves at ${mm(legH)}, 2 long aprons at ${mm(longL)}, 2 short aprons at ${mm(shortL)}, 2 shelf rails at ${mm(D - 2 * IN)}.`, `Boards: ${nb} top boards at ${mm(W)} and the shelf boards at ${mm(longL)}.`],
      rip: D % 225 ? `Rip the back top board and the back shelf board to width (see the cut list).` : null,
      sand: 'Round the long edges of the legs.',
    }),
    {
      title: 'Glue up the legs',
      body: ['Glue two leg halves face to face, ends flush. Clamp and drive three 5.0 × 80mm screws from the inside face. Make four.'],
      why: 'Doubled legs look chunky and won’t twist.',
      check: 'Glue squeezes out the whole length. Wipe it off.',
      fix: '12 screws 5.0 × 80mm, glue.',
      joint: 'lamleg',
      scene: { adds: ['legs'] },
    },
    {
      title: 'Fit the aprons',
      body: ['Drill two pocket holes in each end of every apron. Glue and pocket-screw them between the legs, flush with the top and the outside faces.'],
      why: 'The aprons make a rigid frame for the top to sit on.',
      check: 'Corner to corner across the top matches within 2mm. It doesn’t rock.',
      fix: '63mm pocket screws, glue.',
      joint: 'railleg',
      scene: { adds: ['aprons'], move: { aprons: [0, 0, 120] } },
    },
    {
      title: 'Fit the shelf rails',
      body: [`Screw the two shelf rails across the inside of the legs at each end, underside ${RAIL}mm from the floor.`],
      why: 'Rails on the inside of the legs carry the shelf without any notching.',
      check: 'A level across the two rails reads level.',
      fix: '5.0 × 80mm screws, glue.',
      scene: { adds: ['rails'] },
    },
    {
      title: 'Lay the lower shelf',
      body: ['Lay the shelf boards on the rails, full-width board at the front, and screw down into the rails.'],
      why: 'A lower shelf keeps the top clear: magazines and remotes go underneath.',
      check: 'Shelf sits flat, no rocking boards.',
      fix: '5.0 × 80mm screws.',
      scene: { adds: ['shelf'], move: { shelf: [0, 200, 0] } },
    },
    {
      title: 'Glue up and fix the top',
      body: ['Glue the top boards edge to edge and clamp overnight. Sand any steps flush.', 'Fix it with steel angle brackets inside the aprons. No glue to the frame.'],
      why: 'Brackets let the top move with the seasons without cracking.',
      check: 'Equal overhang all round. Top is flat.',
      fix: '6 angle brackets, 4.0 × 30mm screws.',
      joint: 'bracket',
      scene: { adds: ['top'], move: { top: [0, 0, 220] } },
    },
    finishStep('Top: three thin coats of worktop oil to resist mugs and spills. Base: two coats of hard-wax oil.'),
    {
      title: 'Felt pads and into place',
      body: ['Stick felt pads under the legs and put it in front of the sofa, about 450mm away so legs fit between.'],
      why: 'Felt protects old floorboards and lets you slide it when you hoover.',
      check: 'Level, no rock.',
      scene: { adds: ['props'] },
    },
  ]
}

export default {
  id: 'coffee-table',
  name: 'The Coffee Table',
  short: 'Coffee table',
  tagline: 'Chunky legs, banded top, a shelf for magazines.',
  intro: 'A low, solid coffee table with doubled legs, a scaffold-board top with its galvanised bands on show, and a lower shelf for magazines and baskets. Same family as the trestle table and bench.',
  seed: 51,
  difficulty: 'Easy',
  level: 1,
  time: '1 weekend',
  defaults: { width: 1100, depth: 600, height: 450 },
  limits: { width: [800, 1500], depth: [450, 800], height: [380, 500] },
  features: ['Banded scaffold-board top', 'Lower shelf for storage', 'Pocket screws: clean outside faces', 'Matches the table and bench'],
  model,
  explode: { legs: [0, 0, 0], aprons: [0, 0, 80], rails: [0, 0, -60], shelf: [0, 280, 0], top: [0, 0, 360], props: [0, 0, 900] },
  steps,
  topArea: (d) => (d.width * d.depth + 2 * (d.width + d.depth) * T) / 1e6,
  orthoDims: () => ({ front: [], side: [], top: [] }),
  fixings: (d) => ({ screw80: 20 + panelBoards(d.depth).length * 4, pocket: 16, screw30: 24, bracket: 6, glue: 300, felt: 4 }),
  tools: { must: ['tape', 'square', 'pencil', 'circsaw', 'drill', 'bits', 'pocket', 'clamps', 'sander', 'denail', 'brush', 'level', 'trestles', 'ppe'], nice: ['mitre', 'barclamps', 'plane'] },
  joints: [
    { kind: 'lamleg', title: 'Doubled leg', text: 'Two 47 × 100mm glued face to face.' },
    { kind: 'railleg', title: 'Apron into leg', text: 'Pocket-screwed from the inside.' },
    { kind: 'bracket', title: 'Top to apron', text: 'Brackets, no glue, so the top can move.' },
  ],
  finish: ['Worktop oil on the top: it takes mugs, glasses and feet. Hard-wax oil on the base.'],
  safety: [{ title: 'Load', text: 'Strong enough to sit on, but it’s not designed as a seat. Keep hot drinks on coasters.' }],
  images: [
    { file: 'hero.jpg', title: 'Coffee table in the lounge', prompt: 'Photorealistic photo of a chunky rustic coffee table made from reclaimed scaffold boards on doubled timber legs, galvanised bands on the board ends, lower shelf with magazines and a wicker basket, in the lounge of a converted English mill with a leather sofa, rug and brick walls, soft daylight, 35mm lens' },
    { file: 'detail-top.jpg', joint: 'bracket', title: 'Top close-up', prompt: 'Close-up photo of the oiled reclaimed scaffold board top of a coffee table with a galvanised steel end band and nail holes, coffee mug on a coaster, warm light, shallow depth of field' },
  ],
}
