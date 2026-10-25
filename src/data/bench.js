import { box, panel, panelBoards, BOARD_T as T, FRAME_T as FT, FRAME_W as FW } from '../lib/geometry.js'
import { prepSteps, finishStep, mm } from './prep.js'

const IN = 15 // legs set in from the long edges of the seat
const LD = 2 * FT // leg depth: two 47 × 100 glued face to face
const FOOT = 90 // underside of the foot rails

function layout(d) {
  const W = d.width, D = d.depth, H = d.height
  const OV = Math.round(Math.min(200, Math.max(120, W * 0.1)))
  const xs = [OV, W - OV - FW]
  const railL = D - 2 * IN - 2 * LD
  const railX = (x) => x + (FW - FT) / 2 // rails centred on the leg
  return { W, D, H, OV, xs, railL, railX, legH: H - T, strL: xs[1] - xs[0] - FT }
}

function model(d) {
  const L = layout(d)
  const { W, D, H, xs, railL, railX, legH } = L
  const b = []
  const frame = { mat: 'frame' }
  for (const x of xs) {
    for (const y of [IN, D - IN - LD]) {
      b.push(box('legs', 'Leg half', [x, y, 0], [FW, FT, legH], frame))
      b.push(box('legs', 'Leg half', [x, y + FT, 0], [FW, FT, legH], frame))
    }
    b.push(box('frames', 'Seat bearer', [railX(x), IN + LD, H - T - FW], [FT, railL, FW], frame))
    b.push(box('frames', 'Foot rail', [railX(x), IN + LD, FOOT], [FT, railL, FW], frame))
  }
  b.push(box('stretcher', 'Stretcher', [railX(xs[0]) + FT, D / 2 - FT / 2, FOOT], [railX(xs[1]) - railX(xs[0]) - FT, FT, FW], frame))
  b.push(...panel('seat', 'Seat board', [0, 0, H - T], W, D, 'y', { lengthAxis: 'x', reverse: true, bands: true }))

  const p = { mat: 'prop', tone: 0.5 }
  b.push(box('props', 'Cushion', [W * 0.12, 30, H], [W * 0.3, D - 60, 50], { ...p, color: [36, 30, 78] }))
  b.push(box('props', 'Boot', [W * 0.35, D / 2 - 60, 0], [110, 260, 220], { ...p, color: [20, 30, 25] }))
  b.push(box('props', 'Boot', [W * 0.35 + 130, D / 2 - 50, 0], [110, 260, 220], { ...p, color: [20, 30, 25] }))
  b.push(box('props', 'Basket', [W * 0.55, D / 2 - 120, FOOT + FW], [300, 240, 160], { ...p, color: [34, 38, 58] }))
  return { boxes: b, L }
}

function steps(d, { L }) {
  const { W, D, legH, railL, strL, OV } = L
  const nb = panelBoards(D).length
  return [
    ...prepSteps({
      pick: 'the seat',
      cut: [`Framing: 8 leg halves at ${mm(legH)}, 4 rails at ${mm(railL)} and a stretcher at ${mm(strL)}.`, `Boards: ${nb} seat boards at ${mm(W)}.`],
      rip: D % 225 ? `Rip the back seat board to ${panelBoards(D).at(-1)}mm wide so the seat is ${mm(D)} deep.` : null,
      sand: 'Round over every long edge of the legs. Soft edges look expensive.',
    }),
    {
      title: 'Glue up the legs',
      body: ['Glue two leg halves face to face, ends flush. Clamp, then drive three 5.0 × 80mm screws from the inside face. Make four legs.'],
      why: 'Doubled legs are chunky and stiff, and match the trestle table.',
      check: 'Glue squeezes out along the whole joint. Wipe it off.',
      fix: '12 screws 5.0 × 80mm, glue.',
      joint: 'lamleg',
      scene: { adds: ['legs'] },
    },
    {
      title: 'Build the two end frames',
      body: [
        'Drill two pocket holes in each end of the seat bearers and foot rails.',
        `Lay two legs flat and fit a bearer flush with their tops and a foot rail ${FOOT}mm off the floor. Glue and pocket-screw from the inside.`,
      ],
      why: 'Pocket screws on the inside face leave the outside clean.',
      check: 'Corner to corner measurements match within 2mm.',
      fix: '63mm pocket screws, glue.',
      joint: 'railleg',
      scene: { adds: ['frames'], move: { frames: [0, 0, 100] } },
    },
    {
      title: 'Join the frames with the stretcher',
      body: ['Stand the frames up and fit the stretcher between the foot rails, centred.', 'Pocket-screw it from underneath, two screws each end.'],
      why: 'The stretcher stops the bench racking when someone sits down hard at one end.',
      check: 'Both frames upright on a spirit level.',
      fix: '63mm pocket screws, glue.',
      scene: { adds: ['stretcher'], move: { stretcher: [0, 220, 0] } },
    },
    {
      title: 'Fix the seat',
      body: [
        `Lay the seat boards on, overhanging ${mm(OV)} past the frames at each end and flush front and back. Glue the edges.`,
        'Draw a line over each bearer and screw down along it: two black 5.0 × 80mm screws per board.',
      ],
      why: 'Neat lines of black screws are part of the industrial look.',
      check: 'Seat doesn’t rock. No screw tips poking through.',
      fix: '5.0 × 80mm black screws, glue.',
      joint: 'topdown',
      scene: { adds: ['seat'], move: { seat: [0, 0, 200] } },
    },
    finishStep('Two coats of hard-wax oil. Give the seat a third: it takes jeans, bags and wet coats.'),
    {
      title: 'Felt pads and into place',
      body: ['Stick felt pads under each leg so it slides without scratching the floor.', 'Place it in the hallway or at the table, away from fire exits.'],
      why: 'Felt pads protect old floorboards and stop the bench walking when people sit.',
      check: 'Doesn’t rock. Corridor still clear.',
      scene: { adds: ['props'] },
    },
  ]
}

export default {
  id: 'bench',
  name: 'The Hall Bench',
  short: 'Hall bench',
  tagline: 'A chunky trestle bench for the hallway or the table.',
  intro:
    'A sturdy bench in the same style as the trestle table: doubled legs, end frames and a low stretcher, with a two-board scaffold seat. Use it in the entrance to sit and pull boots on, or as seating along the dining table. Pocket screws keep it simple and tidy.',
  seed: 31,
  difficulty: 'Easy',
  level: 1,
  time: '1 weekend',
  defaults: { width: 1400, depth: 350, height: 450 },
  limits: { width: [800, 2200], depth: [300, 450], height: [420, 480] },
  features: ['Matches the trestle table', 'Seats 3 at 1400mm', 'Room for boots and a basket underneath', 'Pocket screws: no visible joints'],
  model,
  explode: { legs: [0, 0, 0], frames: [0, 0, 60], stretcher: [0, 260, -20], seat: [0, 0, 320], props: [0, 0, 1200] },
  steps,
  orthoDims: () => ({ front: [], side: [], top: [] }),
  fixings: (d) => ({ screw80: 12 + panelBoards(d.depth).length * 4, pocket: 12, glue: 200, felt: 4 }),
  tools: {
    must: ['tape', 'square', 'pencil', 'circsaw', 'drill', 'bits', 'pocket', 'clamps', 'sander', 'denail', 'brush', 'level', 'trestles', 'ppe'],
    nice: ['mitre', 'impact'],
  },
  joints: [
    { kind: 'lamleg', title: 'Doubled leg', text: 'Two 47 × 100mm glued face to face.' },
    { kind: 'railleg', title: 'Rail into leg', text: 'Pocket-screwed from the inside.' },
    { kind: 'topdown', title: 'Seat to bearer', text: 'Black screws in neat rows.' },
  ],
  finish: ['Hard-wax oil, three coats on the seat.', 'Choose the same look as the trestle table so they match.'],
  safety: [
    { title: 'Load', text: 'Comfortably seats three adults. Don’t stand on the overhanging ends: it can tip.' },
    { title: 'Corridors', text: 'In a hallway, keep the full width of any escape route clear. A bench in a corridor may need the managing agent’s OK.' },
  ],
  images: [
    { file: 'hero.jpg', title: 'Hall bench in the entrance', prompt: 'Photorealistic photo of a chunky rustic trestle bench made from reclaimed scaffold boards on doubled timber legs with a low stretcher, galvanised bands on the seat ends, a linen cushion and wellington boots underneath, in the entrance hall of a converted English mill with exposed brick and coat hooks, soft daylight, 35mm lens' },
    { file: 'detail-seat.jpg', joint: 'topdown', title: 'Seat and screws close-up', prompt: 'Close-up photo of black screw heads in a neat row on an oiled reclaimed scaffold board bench seat, galvanised steel end band, warm side light, shallow depth of field' },
  ],
}
