import { box, panel, plant, BOARD_T as T, BOARD_W as BW, FRAME_T as FT, FRAME_W as FW } from '../lib/geometry.js'
import { prepSteps, finishStep, mm } from './prep.js'

const FOOT = T // feet are offcut blocks, one board thick
const CAP = 75 // cap strip width

function layout(d) {
  const W = d.width, D = d.depth, rows = d.rows
  const Hs = rows * BW
  const innerW = W - 2 * T - 2 * FT
  const troughs = Math.max(1, Math.floor(innerW / 420))
  return { W, D, rows, Hs, innerW, troughs, H: FOOT + Hs + T }
}

function model(d) {
  const L = layout(d)
  const { W, D, Hs, innerW, troughs } = L
  const b = []
  const z0 = FOOT
  // Front and back run the full length; ends fit between them
  b.push(...panel('long', 'Long side board', [0, 0, z0], W, Hs, 'z', { lengthAxis: 'x' }))
  b.push(...panel('long', 'Long side board', [0, D - T, z0], W, Hs, 'z', { lengthAxis: 'x' }))
  b.push(...panel('ends', 'End board', [0, T, z0], D - 2 * T, Hs, 'z', { lengthAxis: 'y' }))
  b.push(...panel('ends', 'End board', [W - T, T, z0], D - 2 * T, Hs, 'z', { lengthAxis: 'y' }))
  // Corner posts inside hold it all together
  for (const x of [T, W - T - FT]) for (const y of [T, D - T - FW]) b.push(box('posts', 'Corner post', [x, y, z0], [FT, FW, Hs], { mat: 'frame' }))
  // Cleats and a slatted base, set high enough that the troughs' rims sit just below the cap
  const zc = z0 + Hs
  const cz = Math.max(z0, zc - 190 - T - 75)
  const baseTop = cz + 75 + T
  for (const y of [T, D - 2 * T]) b.push(box('base', 'Base cleat', [T + FT, y, cz], [innerW, T, 75]))
  b.push(...panel('base', 'Base board', [T + FT, T, cz + 75], D - 2 * T, innerW, 'x', { lengthAxis: 'y' }))
  // Feet
  for (const x of [0, W - 75]) for (const y of [0, D - 75]) b.push(box('feet', 'Foot block', [x, y, 0], [75, 75, FOOT]))
  // Cap strips around the top edge
  b.push(box('cap', 'Cap, long', [0, 0, zc], [W, CAP, T]))
  b.push(box('cap', 'Cap, long', [0, D - CAP, zc], [W, CAP, T]))
  b.push(box('cap', 'Cap, short', [0, CAP, zc], [CAP, D - 2 * CAP, T]))
  b.push(box('cap', 'Cap, short', [W - CAP, CAP, zc], [CAP, D - 2 * CAP, T]))

  // Troughs and plants
  const tw = innerW / troughs
  for (let i = 0; i < troughs; i++) {
    const x = T + FT + i * tw + 10
    b.push(box('props', 'Trough', [x, D / 2 - 100, baseTop], [tw - 20, 200, 170], { mat: 'prop', color: [18, 45, 45], tone: 0.5 }))
    // a few loose clusters of foliage along each trough
    const n = Math.max(2, Math.round(tw / 170))
    for (let k = 0; k < n; k++) {
      const px = x + 20 + (k * (tw - 140)) / Math.max(1, n - 1)
      b.push(...plant(px, D / 2 - 60 + (k % 2) * 30, baseTop + 170 - 130 - (k % 2) * 30, 110 + (k % 3) * 15).filter((p) => p.name === 'Leaves'))
    }
  }
  return { boxes: b, L }
}

function steps(d, { L }) {
  const { W, D, rows, Hs, troughs } = L
  return [
    ...prepSteps({
      pick: 'the front and ends',
      cut: [`Boards: ${rows * 2} long sides at ${mm(W)}, ${rows * 2} ends at ${mm(D - 2 * T)}, base boards and 2 cleats. Framing: 4 corner posts at ${mm(Hs)}.`],
      rip: `Rip the cap strips to ${CAP}mm and the base cleats to 75mm. Cut 4 foot blocks 75mm square from offcuts.`,
    }),
    {
      title: 'Screw the long sides to the corner posts',
      body: [`Lay the long side boards face down. Glue and screw a corner post at each end, set in ${T}mm so the end boards can butt against it.`, 'Two 4.0 × 60mm screws per board into each post, from the inside.'],
      why: 'Screwing from the inside keeps the outside clean. The posts take all the strain.',
      check: 'Posts are square to the boards and flush at the top.',
      fix: '4.0 × 60mm screws, glue.',
      joint: 'corner',
      scene: { adds: ['long', 'posts'] },
    },
    {
      title: 'Fit the ends to make a box',
      body: ['Stand the two long sides up and fit the end boards between them, screwing into the corner posts from inside.'],
      why: 'Now it’s a rigid box. Check it’s square before the glue grabs.',
      check: 'Diagonals across the top match within 3mm.',
      fix: '4.0 × 60mm screws, glue.',
      scene: { adds: ['ends'] },
    },
    {
      title: 'Add the cleats and base',
      body: [`Screw a cleat along the inside of each long side, between the posts, with its top ${mm(Math.max(0, Hs - 190 - T))} up from the bottom. Lay the base boards across on top of them.`],
      why: 'The base carries the troughs and keeps them up near the top.',
      check: 'Base boards sit flat and don’t rock.',
      fix: '4.0 × 60mm screws.',
      joint: 'cleat',
      scene: { adds: ['base'], move: { base: [0, 0, 240] } },
    },
    {
      title: 'Fix the feet',
      body: ['Turn the box over. Glue and screw a foot block under each corner.'],
      why: 'Feet lift it off the floor so air can get underneath and any spills can dry.',
      check: 'Stands without rocking.',
      fix: '5.0 × 80mm screws.',
      scene: { adds: ['feet'] },
    },
    {
      title: 'Fit the cap',
      body: ['Lay the cap strips on the top edge, long ones first, flush outside. Glue and screw down into the sides and posts.'],
      why: 'A cap hides the end grain and makes a simple box look finished.',
      check: 'Corners meet neatly. Sand any steps flush.',
      fix: '5.0 × 80mm screws, glue.',
      joint: 'topdown',
      scene: { adds: ['cap'], move: { cap: [0, 0, 200] } },
    },
    finishStep('Hard-wax oil on the outside and cap. Give the inside one coat too, so splashes from watering don’t stain it.'),
    {
      title: 'Drop in the troughs and plant up',
      body: [`Set ${troughs} plastic ${troughs > 1 ? 'troughs' : 'trough'} with saucers inside on the base. Plant them up, or stand pots straight in.`, 'Never fill the wooden box with soil directly indoors: it will rot and leak.'],
      why: 'Troughs keep the water off the wood and let you swap plants with the seasons.',
      check: 'Troughs sit level and their rims are just below the cap.',
      scene: { adds: ['props'] },
    },
  ]
}

export default {
  id: 'planter',
  name: 'The Planter Box',
  short: 'Planter',
  tagline: 'Bring some green into the brick and timber.',
  intro:
    'A long planter box to soften corridors, landings and the entrance. Board sides on hidden corner posts, a neat cap around the top and little feet underneath. Plastic troughs sit inside on a slatted base, so no soil ever touches the wood.',
  seed: 43,
  difficulty: 'Easy',
  level: 1,
  time: '1 weekend',
  defaults: { width: 1000, depth: 400, rows: 2 },
  limits: { width: [600, 1600], depth: [300, 600], rows: [1, 3] },
  dimMeta: { width: { label: 'Width', unit: 'mm' }, depth: { label: 'Depth', unit: 'mm' }, rows: { label: 'Board rows (height)', unit: '' } },
  size: (d) => ({ width: d.width, depth: d.depth, height: layout(d).H }),
  features: ['Plastic troughs inside: no leaks', 'Hidden corner posts', 'Cap and feet for a finished look', 'Great first project'],
  model,
  explode: { long: [0, 0, 0], posts: [0, 0, 0], ends: [0, 0, 0], base: [0, 0, 320], feet: [0, 0, -160], cap: [0, 0, 520], props: [0, 0, 900] },
  steps,
  orthoDims: () => ({ front: [], side: [], top: [] }),
  fixings: (d, { L }) => ({ screw60: 16 * L.rows + 20, screw80: 24, glue: 200, trough: L.troughs, felt: 4 }),
  tools: {
    must: ['tape', 'square', 'pencil', 'circsaw', 'drill', 'bits', 'clamps', 'sander', 'denail', 'brush', 'trestles', 'ppe'],
    nice: ['mitre', 'impact'],
  },
  joints: [
    { kind: 'corner', title: 'Corner post', text: 'Side boards screwed into a hidden 47 × 100mm post from the inside.' },
    { kind: 'cleat', title: 'Base on cleat', text: 'Cleats along the inside carry the base boards.' },
  ],
  finish: ['Hard-wax oil outside and in. Wipe up watering splashes so they don’t mark the finish.'],
  safety: [
    { title: 'Water', text: 'Use troughs with saucers and don’t overwater. Standing water rots timber and marks floors.' },
    { title: 'Common areas', text: 'Keep planters out of escape routes and away from doors. Choose non-toxic plants if children or pets pass by.' },
  ],
  images: [
    { file: 'hero.jpg', title: 'Planter in a corridor', prompt: 'Photorealistic photo of a long rustic planter box made from reclaimed scaffold boards with a neat top cap and small feet, filled with lush green plants, standing against an exposed brick wall in the corridor of a converted English mill, cast-iron column, soft daylight, 35mm lens' },
    { file: 'detail-cap.jpg', joint: 'corner', title: 'Cap and corner close-up', prompt: 'Close-up photo of the top corner of a reclaimed scaffold board planter box with a cap strip, oiled grain and nail holes, plants spilling over, warm light, shallow depth of field' },
  ],
}
