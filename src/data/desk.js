import { box, panel, panelBoards, plant, BOARD_T as T, BOARD_W as BW } from '../lib/geometry.js'
import { prepSteps, finishStep, mm } from './prep.js'
import { legsAt, frame, prop, LEG_Y, FT, FW } from './parts.js'

const IN = 40 // legs set in from the long edges
const FOOT = 100 // underside of the foot rails
const RISE = 120 // monitor shelf height above the desk

function layout(d) {
  const W = d.width, D = d.depth, H = d.height
  const OV = Math.round(Math.min(150, W * 0.07))
  const xs = [OV, W - OV - FW]
  const railX = (x) => x + (FW - FT) / 2
  const railL = D - 2 * IN - 2 * LEG_Y
  return { W, D, H, OV, xs, railX, railL, legH: H - T, strL: railX(xs[1]) - railX(xs[0]) - FT }
}

function model(d) {
  const L = layout(d)
  const { W, D, H, xs, railX, railL, legH, strL } = L
  const b = [...legsAt('legs', xs, [IN, D - IN - LEG_Y], legH)]
  for (const x of xs) {
    b.push(box('frames', 'Top bearer', [railX(x), IN + LEG_Y, H - T - FW], [FT, railL, FW], frame))
    b.push(box('frames', 'Foot rail', [railX(x), IN + LEG_Y, FOOT], [FT, railL, FW], frame))
  }
  // stretcher at the back, low, so your legs have room
  b.push(box('stretcher', 'Stretcher', [railX(xs[0]) + FT, IN + LEG_Y + 20, FOOT], [strL, FT, FW], frame))
  b.push(...panel('top', 'Top board', [0, 0, H - T], W, D, 'y', { lengthAxis: 'x', reverse: true, bands: true }))
  // monitor shelf: a board on two short uprights at the back
  const sw = W - 300
  b.push(box('riser', 'Riser upright', [150, 0, H], [T, BW, RISE - T]))
  b.push(box('riser', 'Riser upright', [150 + sw - T, 0, H], [T, BW, RISE - T]))
  b.push(box('riser', 'Monitor shelf', [150, 0, H + RISE - T], [sw, BW, T]))

  b.push(prop('Monitor stand', [W / 2 - 110, 40, H + RISE], [220, 160, 15], [220, 6, 15]))
  b.push(prop('Monitor stand', [W / 2 - 20, 70, H + RISE + 15], [40, 25, 120], [220, 6, 15]))
  b.push(prop('Monitor', [W / 2 - 310, 60, H + RISE + 110], [620, 30, 360], [220, 8, 10]))
  b.push(prop('Keyboard', [W / 2 - 220, BW + 70, H], [440, 140, 20], [220, 5, 85]))
  b.push(prop('Mug', [W / 2 + 300, BW + 90, H], [85, 85, 95], [160, 20, 70]))
  b.push(...plant(200, BW + 40, H, 100))
  return { boxes: b, L }
}

function steps(d, { L }) {
  const { W, D, legH, railL, strL } = L
  const nb = panelBoards(D).length
  return [
    ...prepSteps({
      pick: 'the desk top',
      cut: [`Framing: 8 leg halves at ${mm(legH)}, 4 rails at ${mm(railL)}, a stretcher at ${mm(strL)}.`, `Boards: ${nb} top boards at ${mm(W)}, a monitor shelf at ${mm(W - 300)} and 2 short uprights at ${mm(RISE - T)}.`],
      rip: D % 225 ? 'Rip the back top board to width (see the cut list).' : null,
      sand: 'Round the front edge of the desk top generously: your wrists rest on it.',
    }),
    {
      title: 'Glue up the legs',
      body: ['Glue two leg halves face to face, clamp and screw from the inside. Make four.'],
      why: 'Doubled legs stop the desk wobbling when you type.',
      check: 'Glue squeezes out along the whole joint.',
      fix: '12 screws 5.0 × 80mm, glue.',
      joint: 'lamleg',
      scene: { adds: ['legs'] },
    },
    {
      title: 'Build the end frames',
      body: [`Pocket-screw a bearer flush with the top of each pair of legs, and a foot rail ${FOOT}mm off the floor.`],
      why: 'End frames give the trestle look and loads of legroom in the middle.',
      check: 'Each frame square.',
      fix: '63mm pocket screws, glue.',
      joint: 'railleg',
      scene: { adds: ['frames'], move: { frames: [0, 0, 100] } },
    },
    {
      title: 'Fit the back stretcher',
      body: ['Pocket-screw the stretcher between the foot rails, towards the back.'],
      why: 'Placed at the back, it stiffens the desk without catching your feet.',
      check: 'Frames upright and parallel.',
      fix: '63mm pocket screws, glue.',
      scene: { adds: ['stretcher'], move: { stretcher: [0, 220, 0] } },
    },
    {
      title: 'Glue up and fix the top',
      body: ['Glue the top boards edge to edge and clamp overnight. Sand the joints flush so a mouse runs smoothly.', 'Fix to the bearers with steel brackets. No glue.'],
      why: 'A flat, smooth top matters more on a desk than anywhere else.',
      check: 'No steps between boards; overhang equal at both ends.',
      fix: '4 angle brackets, 4.0 × 30mm screws.',
      joint: 'bracket',
      scene: { adds: ['top'], move: { top: [0, 0, 220] } },
    },
    {
      title: 'Add the monitor shelf',
      body: [`Screw the two short uprights to the underside of the monitor shelf, then screw the shelf down onto the back of the desk from below.`],
      why: `Lifting the screen ${mm(RISE)} brings it nearer eye level and keeps the desk clear underneath.`,
      check: 'Shelf level and firm.',
      fix: '5.0 × 80mm screws.',
      joint: 'topdown',
      scene: { adds: ['riser'], move: { riser: [0, 0, 160] } },
    },
    finishStep('Worktop oil on the top: three coats resist coffee and sweaty palms. Hard-wax oil on the frame.'),
    {
      title: 'Set up your workspace',
      body: ['Level the feet. Run cables down the back leg with clips. Set the top of the screen at or slightly below eye level.'],
      why: 'A good setup saves your neck and back.',
      check: 'No wobble when typing; screen at the right height.',
      scene: { adds: ['props'] },
    },
  ]
}

export default {
  id: 'desk',
  name: 'The Desk',
  short: 'Desk',
  tagline: 'A trestle desk with a monitor shelf.',
  intro: 'A sturdy trestle-style desk to match the table and bench, with a raised monitor shelf along the back and a stretcher tucked out of the way of your feet. Ideal for a home office or a shared workspace in the mill.',
  seed: 73,
  difficulty: 'Moderate',
  level: 2,
  time: '2 weekends',
  defaults: { width: 1400, depth: 675, height: 740 },
  limits: { width: [1000, 1800], depth: [600, 800], height: [720, 760] },
  features: ['Raised monitor shelf', 'Lots of legroom', 'Matches the trestle table', 'Worktop oil top'],
  model,
  explode: { legs: [0, 0, 0], frames: [0, 0, 60], stretcher: [0, -200, 0], top: [0, 0, 300], riser: [0, 0, 480], props: [0, 0, 1200] },
  steps,
  topArea: (d) => (d.width * d.depth + 2 * (d.width + d.depth) * T) / 1e6,
  orthoDims: () => ({ front: [], side: [], top: [] }),
  fixings: (d) => ({ screw80: 20, pocket: 12, screw30: 16, bracket: 4, glue: 350, levellers: 4 }),
  tools: { must: ['tape', 'square', 'pencil', 'circsaw', 'drill', 'bits', 'pocket', 'clamps', 'barclamps', 'sander', 'denail', 'brush', 'level', 'trestles', 'ppe'], nice: ['mitre', 'plane', 'impact'] },
  joints: [
    { kind: 'lamleg', title: 'Doubled leg', text: 'Two 47 × 100mm glued face to face.' },
    { kind: 'railleg', title: 'Rail into leg', text: 'Pocket-screwed from the inside.' },
    { kind: 'bracket', title: 'Top to bearer', text: 'Brackets let the top move.' },
  ],
  finish: ['Worktop oil on the top, hard-wax oil on the base. Sand the top to 240 grit before oiling for a silky feel.'],
  safety: [{ title: 'Load', text: 'Takes a monitor, laptop and printer easily. Don’t sit on the overhanging ends.' }],
  images: [
    { file: 'hero.jpg', title: 'Desk in a mill workspace', prompt: 'Photorealistic photo of a rustic trestle desk made from reclaimed scaffold boards on doubled timber legs, raised monitor shelf along the back with a monitor, keyboard and plant, in a home office in a converted English mill with brick walls and a tall steel window, soft daylight, 35mm lens' },
    { file: 'detail-shelf.jpg', joint: 'topdown', title: 'Monitor shelf close-up', prompt: 'Close-up photo of a raised reclaimed scaffold board monitor shelf on a desk, oiled grain and galvanised band, warm light, shallow depth of field' },
  ],
}
