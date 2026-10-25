import { box, plant, BOARD_T as T, BOARD_W as BW } from '../lib/geometry.js'
import { prepSteps, finishStep, mm } from './prep.js'
import { wall, prop } from './parts.js'

const Z = 1600 // bottom of the backboard above the floor
const steel = { mat: 'steel' }

function layout(d) {
  const W = d.width, n = d.hooks
  const hx = Array.from({ length: n }, (_, i) => Math.round(((i + 0.5) * W) / n))
  return { W, n, hx, bx: [Math.min(120, W * 0.15), W - Math.min(120, W * 0.15)] }
}

function model(d) {
  const L = layout(d)
  const { W, hx, bx } = L
  const b = [wall(-300, W + 300, Z - 1100, Z + BW + 500)]
  b.push(box('back', 'Backboard', [0, 0, Z], [W, T, BW]))
  for (const x of bx) {
    b.push(box('shelf', 'Bracket', [x - 15, T, Z + BW - 150], [30, 6, 150], steel))
    b.push(box('shelf', 'Bracket', [x - 15, T + 6, Z + BW - 6], [30, 170, 6], steel))
  }
  b.push(box('shelf', 'Shelf board', [0, 0, Z + BW], [W, BW, T], { bands: true }))
  for (const x of hx) {
    b.push(box('hooks', 'Hook', [x - 15, T, Z + 50], [30, 6, 70], steel))
    b.push(box('hooks', 'Hook', [x - 6, T + 6, Z + 70], [12, 70, 12], steel))
    b.push(box('hooks', 'Hook', [x - 6, T + 64, Z + 82], [12, 12, 30], steel))
  }
  // one coat and a tote bag, so the hooks stay visible
  b.push(prop('Coat', [hx[0] - 110, T + 40, Z + 70 - 520], [220, 70, 520], [24, 35, 35]))
  b.push(prop('Bag', [hx.at(-1) - 90, T + 40, Z + 70 - 300], [180, 50, 300], [40, 30, 60]))
  b.push(prop('Hat', [W * 0.2, 40, Z + BW + T], [220, 160, 90], [30, 20, 30]))
  b.push(...plant(W * 0.7, 50, Z + BW + T, 110))
  return { boxes: b, L }
}

function steps(d, { L }) {
  const { W, n } = L
  return [
    ...prepSteps({
      pick: 'the shelf (banded ends look great here)',
      cut: [`One backboard and one shelf board, both ${mm(W)}. Cut both ends square: they’re on show.`],
      rip: null,
      sand: 'Round over the front edge of the shelf and the bottom edge of the backboard.',
    }),
    finishStep('Two coats of hard-wax oil on both boards, before fitting anything.'),
    {
      title: 'Check the wall',
      body: [`Pick a spot by the door away from any fire escape route. Scan the wall with a cable and pipe detector along a line ${mm(Z)} to ${mm(Z + BW)} up.`],
      why: 'Wet coats are heavy. The right fixing in the right spot keeps it on the wall.',
      check: 'No cables or pipes behind the backboard.',
      joint: 'wallbracket',
      scene: { adds: ['wall'] },
    },
    {
      title: 'Fix the backboard',
      body: [`Hold it level ${mm(Z)} up. Drill four countersunk holes through it, mark the wall, drill and plug, and screw it on with 5.0 × 70mm screws.`],
      why: 'Countersinking sinks the screw heads flush so coats don’t snag.',
      check: 'Level end to end, and tight to the wall.',
      fix: 'Wall plugs and 5.0 × 70mm screws.',
      scene: { adds: ['back'] },
    },
    {
      title: 'Brackets and shelf',
      body: ['Screw the two brackets to the backboard, tops flush with its top edge. Lay the shelf on and screw up through the brackets.'],
      why: 'The shelf holds hats, gloves and keys out of the way.',
      check: 'Shelf is level and doesn’t lift when you push up on the front.',
      fix: '2 brackets, 4.0 × 30mm screws.',
      scene: { adds: ['shelf'], move: { shelf: [0, 200, 0] } },
    },
    {
      title: 'Fit the hooks',
      body: [`Mark ${n} hook positions evenly along the backboard. Drill small pilot holes and screw the hooks on.`],
      why: 'Even spacing looks deliberate and stops coats bunching.',
      check: 'Every hook is firm and at the same height.',
      fix: `${n} coat hooks, their screws.`,
      scene: { adds: ['hooks'] },
    },
    {
      title: 'Hang the coats',
      body: ['Hang everything up and put the hats and gloves on the shelf.'],
      why: 'Done in a day.',
      check: 'Nothing heavy pulling on the shelf front edge.',
      scene: { adds: ['props'] },
    },
  ]
}

export default {
  id: 'coat-rack',
  name: 'The Coat Rack',
  short: 'Coat rack',
  tagline: 'Black iron hooks and a hat shelf for the entrance.',
  intro: 'A wall-mounted coat rack for the hallway: a scaffold-board backboard with black cast-iron hooks, topped with a banded shelf for hats, gloves and keys. Pairs perfectly with the hall bench and shoe rack.',
  seed: 59,
  difficulty: 'Easy',
  level: 1,
  time: '1 day',
  defaults: { width: 1000, hooks: 5 },
  limits: { width: [500, 1800], hooks: [3, 9] },
  dimMeta: { width: { label: 'Width', unit: 'mm' }, hooks: { label: 'Hooks', unit: '' } },
  size: (d) => ({ width: d.width, depth: BW, height: BW + T }),
  features: ['Black cast-iron hooks', 'Hat and glove shelf', 'Matches the bench and shoe rack', 'Just two boards'],
  model,
  explode: { wall: [0, 0, 0], back: [0, 60, 0], shelf: [0, 120, 160], hooks: [0, 200, 0], props: [0, 300, 0] },
  steps,
  orthoDims: () => ({ front: [], side: [], top: [] }),
  fixings: (d) => ({ wallFix: 1, coatHook: d.hooks, shelfBracket: 2, screw30: 8 }),
  tools: { must: ['tape', 'pencil', 'circsaw', 'drill', 'bits', 'sander', 'denail', 'brush', 'level', 'detector', 'ppe'], nice: ['mitre', 'square'] },
  joints: [{ kind: 'wallbracket', title: 'Shelf on bracket', text: 'Bracket screwed to the backboard, shelf screwed down onto it.' }],
  finish: ['Hard-wax oil. Damp coats touch it, so two good coats on the backboard.'],
  safety: [
    { title: 'Fixings', text: 'Use the right plug for the wall and scan for cables first. Each hook takes a heavy winter coat.' },
    { title: 'Corridors', text: 'Hanging coats stick out about 300mm. Keep them out of narrow escape routes.' },
  ],
  images: [
    { file: 'hero.jpg', title: 'Coat rack in the entrance', prompt: 'Photorealistic photo of a wall-mounted coat rack made from a reclaimed scaffold board with black cast-iron hooks and a banded shelf above holding a hat and plant, coats hanging, against exposed brick in the entrance of a converted English mill, soft daylight, 35mm lens' },
    { file: 'detail-hook.jpg', joint: 'wallbracket', title: 'Hook close-up', prompt: 'Close-up photo of a black cast-iron coat hook screwed to an oiled reclaimed scaffold board, warm side light, shallow depth of field' },
  ],
}
