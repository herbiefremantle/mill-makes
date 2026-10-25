import { box, panel, panelBoards, plant, BOARD_T as T } from '../lib/geometry.js'
import { prepSteps, finishStep, mm } from './prep.js'
import { legsAt, frame, prop, LEG_Y, FT, FW } from './parts.js'

const IN = 40
const FOOTZ = 280 // underside of the footrest rails

function layout(d) {
  const W = d.width, D = d.depth, H = d.height
  return { W, D, H, legH: H - T, longL: W - 2 * IN - 2 * FW, shortL: D - 2 * IN - 2 * LEG_Y, zA: H - T - FW }
}

function stool(x, y) {
  const c = [30, 15, 30]
  const s = [prop('Stool seat', [x, y, 720], [340, 340, 40], [28, 35, 45])]
  for (const [dx, dy] of [[20, 20], [290, 20], [20, 290], [290, 290]]) s.push(prop('Stool leg', [x + dx, y + dy, 0], [30, 30, 720], c))
  s.push(prop('Stool ring', [x + 20, y + 20, 280], [300, 300, 12], c))
  return s
}

function model(d) {
  const L = layout(d)
  const { W, D, H, legH, longL, shortL, zA } = L
  const b = [...legsAt('legs', [IN, W - IN - FW], [IN, D - IN - LEG_Y], legH)]
  for (const [z, g, n] of [[zA, 'aprons', 'Apron'], [FOOTZ, 'foot', 'Footrest rail']]) {
    b.push(box(g, `Long ${n.toLowerCase()}`, [IN + FW, D - IN - FT, z], [longL, FT, FW], frame))
    b.push(box(g, `Long ${n.toLowerCase()}`, [IN + FW, IN, z], [longL, FT, FW], frame))
    b.push(box(g, `Short ${n.toLowerCase()}`, [IN, IN + LEG_Y, z], [FT, shortL, FW], frame))
    b.push(box(g, `Short ${n.toLowerCase()}`, [W - IN - FT, IN + LEG_Y, z], [FT, shortL, FW], frame))
  }
  b.push(...panel('top', 'Top board', [0, 0, H - T], W, D, 'y', { lengthAxis: 'x', reverse: true, bands: true }))

  b.push(prop('Laptop', [W * 0.2, D * 0.3, H], [320, 230, 15], [220, 5, 70]))
  b.push(prop('Cup', [W * 0.6, D * 0.45, H], [80, 80, 100], [30, 40, 88]))
  b.push(prop('Cup', [W * 0.66, D * 0.35, H], [80, 80, 100], [160, 20, 70]))
  b.push(...plant(W * 0.82, D * 0.35, H, 100))
  b.push(...stool(W * 0.18, D + 120), ...stool(W * 0.58, D + 120))
  return { boxes: b, L }
}

function steps(d, { L }) {
  const { W, D, legH, longL, shortL } = L
  const nb = panelBoards(D).length
  return [
    ...prepSteps({
      pick: 'the top',
      cut: [`Framing: 8 leg halves at ${mm(legH)}, 4 long rails at ${mm(longL)} and 4 short rails at ${mm(shortL)} (aprons and footrests).`, `Boards: ${nb} top boards at ${mm(W)}.`],
      rip: D % 225 ? 'Rip the back top board to width (see the cut list).' : null,
      sand: 'Round every edge of the footrest rails: shoes and calves rub on them.',
    }),
    {
      title: 'Glue up the legs',
      body: ['Glue two leg halves face to face, clamp and screw from the inside. Make four.'],
      why: 'Tall tables need stiff legs, or they sway when you lean on them.',
      check: 'All four the same length.',
      fix: '16 screws 5.0 × 80mm, glue.',
      joint: 'lamleg',
      scene: { adds: ['legs'] },
    },
    {
      title: 'Fit the aprons',
      body: ['Pocket-screw the four aprons between the legs, flush with the top and the outside faces.'],
      why: 'The aprons are the top frame that holds everything square.',
      check: 'Diagonals match within 2mm.',
      fix: '63mm pocket screws, glue.',
      joint: 'railleg',
      scene: { adds: ['aprons'], move: { aprons: [0, 0, 120] } },
    },
    {
      title: 'Fit the footrest rails',
      body: [`Fit the four footrest rails the same way, undersides ${FOOTZ}mm off the floor, all round.`],
      why: 'A footrest makes high stools comfortable, and the low rails stop the legs splaying.',
      check: 'Stand on a rail with one foot (gently): nothing moves.',
      fix: '63mm pocket screws, glue.',
      joint: 'railleg',
      scene: { adds: ['foot'], move: { foot: [0, 0, -100] } },
    },
    {
      title: 'Glue up and fix the top',
      body: ['Glue the top boards edge to edge and clamp overnight. Fix to the aprons with steel brackets.'],
      why: 'Brackets let the top move without cracking.',
      check: 'Equal overhang all round; top flat.',
      fix: '6 angle brackets, 4.0 × 30mm screws.',
      joint: 'bracket',
      scene: { adds: ['top'], move: { top: [0, 0, 220] } },
    },
    finishStep('Worktop oil on the top: three coats for drinks and spills. Hard-wax oil on the frame.'),
    {
      title: 'Level and check it’s stable',
      body: ['Level the feet so nothing rocks. Lean firmly on one long edge: it must not lift. If it does, make it deeper or fix it to the floor or wall with brackets.'],
      why: 'A tall table is easier to tip than a low one, especially in a busy shared space.',
      check: 'Doesn’t lift or rock when leaned on.',
      scene: { adds: ['props'] },
    },
  ]
}

export default {
  id: 'bar-table',
  name: 'The Bar-Height Table',
  short: 'Bar table',
  tagline: 'A tall standing table with a footrest, for the communal space.',
  intro: 'A tall table for chatting over coffee or working standing up in a shared space: doubled legs, a full footrest rail all round, and a worktop-oiled scaffold-board top. Pair it with bar stools.',
  seed: 79,
  difficulty: 'Moderate',
  level: 2,
  time: '2 weekends',
  defaults: { width: 1200, depth: 600, height: 1050 },
  limits: { width: [800, 1800], depth: [450, 800], height: [950, 1100] },
  features: ['Standing or bar-stool height', 'Footrest rail all round', 'Worktop oil top', 'Good for laptops and coffee'],
  model,
  explode: { legs: [0, 0, 0], aprons: [0, 0, 120], foot: [0, 0, -40], top: [0, 0, 360], props: [0, 0, 1400] },
  steps,
  topArea: (d) => (d.width * d.depth + 2 * (d.width + d.depth) * T) / 1e6,
  orthoDims: () => ({ front: [{ axis: 'v', from: 0, to: FOOTZ, level: 1 }], side: [], top: [] }),
  fixings: (d) => ({ screw80: 16 + panelBoards(d.depth).length * 4, pocket: 32, screw30: 24, bracket: 6, glue: 350, levellers: 4 }),
  tools: { must: ['tape', 'square', 'pencil', 'circsaw', 'drill', 'bits', 'pocket', 'clamps', 'sander', 'denail', 'brush', 'level', 'trestles', 'ppe'], nice: ['mitre', 'barclamps', 'impact'] },
  joints: [
    { kind: 'lamleg', title: 'Doubled leg', text: 'Two 47 × 100mm glued face to face.' },
    { kind: 'railleg', title: 'Rails into legs', text: 'Aprons and footrests pocket-screwed from inside.' },
    { kind: 'bracket', title: 'Top to apron', text: 'Brackets, no glue.' },
  ],
  finish: ['Worktop oil on the top. The footrest gets scuffed: re-oil it once a year.'],
  safety: [
    { title: 'Stability', text: 'Tall tables can tip if leaned on hard. Keep the depth at 600mm or more, or fix it to the floor or wall.' },
    { title: 'Common areas', text: 'Keep it and its stools well clear of escape routes and doors.' },
  ],
  images: [
    { file: 'hero.jpg', title: 'Bar table in the communal space', prompt: 'Photorealistic photo of a tall bar-height table made from reclaimed scaffold boards on doubled timber legs with a footrest rail all round, two black metal bar stools, coffee cups and a laptop on top, in the communal lounge of a converted English mill with brick walls and cast-iron columns, soft daylight, 35mm lens' },
    { file: 'detail-footrest.jpg', joint: 'railleg', title: 'Footrest close-up', prompt: 'Close-up photo of a timber footrest rail meeting a chunky leg on a rustic bar table, oiled grain, warm light, shallow depth of field' },
  ],
}
