import { box, panel, BOARD_T as T, BOARD_W as BW } from '../lib/geometry.js'
import { prepSteps, finishStep, mm } from './prep.js'
import { wall, prop, frame, FT, FW } from './parts.js'

const Z0 = 300 // bottom of the panel: just behind the mattress

function layout(d) {
  const W = d.width, rows = d.rows
  const Hp = rows * BW
  return { W, rows, Hp, bx: [Math.round(W * 0.18), Math.round(W * 0.82 - FW)] }
}

function model(d) {
  const L = layout(d)
  const { W, Hp, bx } = L
  const b = [wall(-400, W + 400, 0, Z0 + Hp + 600)]
  for (const x of bx) b.push(box('battens', 'Batten', [x, 0, Z0], [FW, FT, Hp], frame))
  b.push(...panel('boards', 'Headboard board', [0, FT, Z0], W, Hp, 'z', { lengthAxis: 'x' }))
  b.push(box('cap', 'Cap', [-15, 0, Z0 + Hp], [W + 30, FT + T + 15, T]))

  // The bed in front
  const bw = W - 100
  // just the head end of the bed, so the headboard stays the star
  b.push(prop('Bed base', [50, FT + T + 10, 0], [bw, 800, 250], [25, 15, 30]))
  b.push(prop('Mattress', [60, FT + T + 10, 250], [bw - 20, 800, 200], [40, 25, 94]))
  b.push(prop('Duvet', [55, FT + T + 420, 450], [bw - 10, 390, 50], [200, 18, 78]))
  b.push(prop('Pillow', [110, FT + T + 40, 450], [bw / 2 - 90, 330, 110], [40, 20, 97]))
  b.push(prop('Pillow', [bw / 2 + 60, FT + T + 40, 450], [bw / 2 - 90, 330, 110], [40, 20, 97]))
  return { boxes: b, L }
}

function steps(d, { L }) {
  const { W, rows, Hp } = L
  return [
    ...prepSteps({
      pick: 'the front rows (the top row is the one people see most)',
      cut: [`${rows} boards at ${mm(W)}, a cap at ${mm(W + 30)}, and 2 battens of 47 × 100mm at ${mm(Hp)}.`],
      rip: `Rip the cap to ${FT + T + 15}mm wide so it covers the battens and boards.`,
    }),
    finishStep('Two coats of hard-wax oil before it goes up. Matt or satin looks best in a bedroom.'),
    {
      title: 'Check the wall and mark out',
      body: [`Centre the bed on the wall and mark its centre line. Scan for cables and pipes where the battens will go, about ${mm(W * 0.18)} in from each side.`],
      why: 'Bedside lamps and sockets mean there are often cables behind beds.',
      check: 'Batten positions clear of cables and pipes.',
      joint: 'wallbracket',
      scene: { adds: ['wall'] },
    },
    {
      title: 'Fix the battens',
      body: [`Fix the two battens upright, bottoms ${mm(Z0)} off the floor, with three plugs and 6.0 × 100mm screws each. Check both are plumb and level with each other.`],
      why: 'The battens carry the whole headboard. Plumb battens mean straight boards.',
      check: 'A level across the two battens reads level at top and bottom.',
      fix: 'Wall plugs and 6.0 × 100mm screws.',
      scene: { adds: ['battens'] },
    },
    {
      title: 'Screw the boards on',
      body: ['Start with the bottom board, level, centred on the bed. Screw into each batten with two black 4.0 × 60mm screws. Stack the next boards on top, tight together.'],
      why: 'Black screws in neat columns over the battens look deliberate and industrial.',
      check: 'Boards level and tight, screws in straight columns.',
      fix: '4.0 × 60mm black screws.',
      scene: { adds: ['boards'], move: { boards: [0, 220, 0] } },
    },
    {
      title: 'Fit the cap',
      body: ['Lay the cap on top, overhanging 15mm at each end and at the front. Glue and screw down into the battens.'],
      why: 'The cap hides the end grain and makes a handy ledge for a book or glasses.',
      check: 'Cap is level and overhangs evenly.',
      fix: '5.0 × 80mm screws, glue.',
      joint: 'topdown',
      scene: { adds: ['cap'], move: { cap: [0, 0, 150] } },
    },
    {
      title: 'Push the bed back',
      body: ['Push the bed back against it, and add lamps either side.'],
      why: 'A headboard changes a room in a weekend.',
      check: 'Bed doesn’t bang into it. Sand any rough edges near pillows.',
      scene: { adds: ['props'] },
    },
  ]
}

export default {
  id: 'headboard',
  name: 'The Headboard',
  short: 'Headboard',
  tagline: 'Rows of boards that turn a bed into a feature.',
  intro: 'A wall-fixed headboard of horizontal scaffold boards on hidden battens, finished with a cap ledge. It costs little, uses few boards and instantly makes a bedroom in the mill feel warmer. Sized for a double as standard.',
  seed: 61,
  difficulty: 'Easy',
  level: 1,
  time: '1 day',
  defaults: { width: 1450, rows: 4 },
  limits: { width: [1000, 2000], rows: [3, 5] },
  dimMeta: { width: { label: 'Width', unit: 'mm' }, rows: { label: 'Board rows (height)', unit: '' } },
  size: (d) => ({ width: d.width + 30, depth: FT + T + 15, height: d.rows * BW + T }),
  features: ['Fits a double (1450mm)', 'Hidden battens on the wall', 'Cap ledge for a book', 'Black screws in neat columns'],
  model,
  explode: { wall: [0, 0, 0], battens: [0, 60, 0], boards: [0, 260, 0], cap: [0, 260, 200], props: [0, 1200, 0] },
  steps,
  orthoDims: () => ({ front: [], side: [], top: [] }),
  fixings: (d) => ({ wallFixLong: 1, screw60: d.rows * 4, screw80: 4, glue: 100 }),
  tools: { must: ['tape', 'pencil', 'circsaw', 'drill', 'bits', 'sander', 'denail', 'brush', 'level', 'detector', 'ppe'], nice: ['mitre', 'impact', 'square'] },
  joints: [
    { kind: 'wallbracket', title: 'Wall fixing', text: 'Battens plugged and screwed to the wall carry the boards.' },
    { kind: 'topdown', title: 'Cap', text: 'Glued and screwed down into the battens.' },
  ],
  finish: ['Hard-wax oil, matt or satin. Sand the cap edges extra smooth: hands and hair touch it.'],
  safety: [{ title: 'Fixings', text: 'Scan for cables before drilling, especially near bedside sockets. Don’t hang the headboard from the bed frame.' }],
  images: [
    { file: 'hero.jpg', title: 'Headboard in a mill bedroom', prompt: 'Photorealistic photo of a headboard made from horizontal reclaimed scaffold boards with a cap ledge, fixed to the wall behind a double bed with white linen, in a bedroom of a converted English mill with exposed brick and a tall window, bedside lamps, soft morning light, 35mm lens' },
    { file: 'detail-cap.jpg', joint: 'topdown', title: 'Cap ledge close-up', prompt: 'Close-up photo of the top ledge of a reclaimed scaffold board headboard with a book and glasses resting on it, oiled grain, warm light, shallow depth of field' },
  ],
}
