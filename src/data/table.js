import { box, panel, panelBoards, plant, BOARD_T as T, FRAME_T as FT, FRAME_W as FW } from '../lib/geometry.js'

const mm = (n) => `${Math.round(n)}mm`
const LEG = 2 * FT // legs are two 47 × 100 glued together: 94 × 100mm
const IN = 60 // legs set in from the long edges of the top
const CAP = 100 // breadboard end width
const FOOT = 120 // height of the underside of the foot rails

function layout(d) {
  const W = d.width, D = d.depth, H = d.height
  const OV = Math.round(Math.min(350, Math.max(200, W * 0.125))) // top overhang beyond the end frames
  const legH = H - T
  const railL = D - 2 * IN - 2 * FW // rails sit between front and back legs
  const xs = [OV, W - OV - LEG] // x of each end frame
  const strL = W - 2 * OV - 2 * LEG // stretcher between the frames
  return { W, D, H, OV, legH, railL, xs, strL, zBearer: H - T - FW, topL: W - 2 * CAP }
}

function model(d) {
  const L = layout(d)
  const { W, D, H, OV, legH, railL, xs, strL, zBearer, topL } = L
  const b = []
  const frame = { mat: 'frame' }

  for (const x of xs) {
    for (const y of [IN, D - IN - FW]) {
      b.push(box('legs', 'Leg half', [x, y, 0], [FT, FW, legH], frame))
      b.push(box('legs', 'Leg half', [x + FT, y, 0], [FT, FW, legH], frame))
    }
    // top bearer and foot rail, each doubled to match the leg thickness
    for (const [z, name] of [[zBearer, 'Top bearer'], [FOOT, 'Foot rail']]) {
      b.push(box('frames', name, [x, IN + FW, z], [FT, railL, FW], frame))
      b.push(box('frames', name, [x + FT, IN + FW, z], [FT, railL, FW], frame))
    }
  }
  // Stretcher: doubled 47 × 100 on edge, low down between the foot rails
  const sy = D / 2 - FT
  b.push(box('stretcher', 'Stretcher', [xs[0] + LEG, sy, FOOT], [strL, FT, FW], frame))
  b.push(box('stretcher', 'Stretcher', [xs[0] + LEG, sy + FT, FOOT], [strL, FT, FW], frame))
  // Faux through-tenons and keys: glued-on blocks that hide the screw heads
  for (const [x, dir] of [[xs[0], -1], [xs[1] + LEG, 1]]) {
    const tx = dir < 0 ? x - 60 : x
    // drawn as two halves either side of the key so the drawing layers correctly
    const inner = dir < 0 ? tx + 38 : tx
    const outer = dir < 0 ? tx : tx + 38
    b.push(box('stretcher', 'Tenon block', [inner, D / 2 - 40, FOOT + 15], [22, 80, 70], frame))
    b.push(box('stretcher', 'Tenon block', [outer, D / 2 - 40, FOOT + 15], [22, 80, 70], frame))
    b.push(box('stretcher', 'Key', [tx + 22, D / 2 - 12, FOOT - 5], [16, 24, 110], frame))
  }
  b.push(box('spine', 'Top spine', [xs[0] + LEG, D / 2 - FT / 2, zBearer], [strL, FT, FW], frame))

  b.push(...panel('top', 'Top board', [CAP, 0, H - T], topL, D, 'y', { lengthAxis: 'x', reverse: true }))
  b.push(box('ends', 'Breadboard end', [0, 0, H - T], [CAP, D, T]))
  b.push(box('ends', 'Breadboard end', [W - CAP, 0, H - T], [CAP, D, T]))

  // Styling
  const p = { mat: 'prop', tone: 0.5 }
  b.push(box('props', 'Runner', [W * 0.3, D / 2 - 160, H], [W * 0.4, 320, 3], { ...p, color: [36, 28, 82] }))
  b.push(box('props', 'Bowl', [W * 0.45, D / 2 - 140, H + 3], [280, 280, 90], { ...p, color: [30, 15, 30] }))
  b.push(box('props', 'Fruit', [W * 0.45 + 60, D / 2 - 80, H + 93], [160, 160, 40], { ...p, color: [28, 70, 55] }))
  b.push(...plant(W * 0.65, D / 2 - 50, H + 3, 110))
  for (const x of [W * 0.33, W * 0.38]) b.push(box('props', 'Candle', [x, D / 2 - 20, H + 3], [40, 40, 220], { ...p, color: [40, 30, 92] }))
  return { boxes: b, L }
}

const explode = {
  legs: [0, 0, 0],
  frames: [0, 0, 60],
  stretcher: [0, 360, -40],
  spine: [0, 0, 200],
  top: [0, 0, 480],
  ends: [0, 0, 640],
  props: [0, 0, 1600],
}

function steps(d, { L }) {
  const { W, D, H, OV, legH, railL, strL, topL } = L
  const nb = panelBoards(D).length
  return [
    {
      title: 'Bring the boards indoors and pick your best',
      body: [`Stack everything flat indoors with spacers for 1 to 2 weeks.`, `Choose the ${nb} flattest, best-looking boards for the top, and the straightest framing for the legs.`],
      why: 'A dining table is all about the top. Flat, dry boards stay flat.',
      check: 'Top boards chosen and marked on the end.',
      scene: { prep: 'default' },
    },
    {
      title: 'Take out every nail and staple',
      body: ['Pull or punch every nail. Take extra care on the top boards: punch any stubs well below the surface so you can fill over them.'],
      why: 'Nails on a dining top snag cloths and sleeves.',
      check: 'Nothing catches when you run a gloved hand over each board.',
      scene: { prep: 'denail' },
    },
    {
      title: 'Scrub and dry',
      body: ['Wire brush and warm soapy water along the grain. Dry on edge for 2 days.'],
      why: 'A clean top is a hygienic top.',
      check: 'Fully dry.',
      scene: { prep: 'clean' },
    },
    {
      title: 'Cut everything to length',
      body: [
        `Framing: 8 leg halves at ${mm(legH)}, 8 rail pieces at ${mm(railL)}, 3 stretcher and spine pieces at ${mm(strL)}, plus 4 small tenon blocks and 2 keys from offcuts.`,
        `Boards: ${nb} top boards at ${mm(topL)} and 2 breadboard ends at ${mm(D)}. Follow the Cutting plan tab.`,
      ],
      why: 'Identical leg and rail lengths mean a table that stands square and doesn’t rock.',
      check: 'All eight leg halves line up when stood together.',
      scene: { prep: 'cut' },
    },
    {
      title: 'Rip the breadboard ends',
      body: [`Rip two boards to ${CAP}mm wide for the breadboard ends.`, 'These run across the ends of the top and give it that framed, finished look.'],
      why: 'Breadboard ends hide the end grain and help keep the top flat.',
      check: 'Ripped edges are straight and square.',
      scene: { prep: 'rip' },
    },
    {
      title: 'Rough-sand everything at 80 grit',
      body: ['Sand every face at 80 grit. On the legs, round all four long edges with a few passes so they feel soft in the hand.'],
      why: 'Soft, rounded edges are what make chunky timber look expensive.',
      check: 'No grey left on any show face.',
      scene: { prep: 'sand' },
    },
    {
      title: 'Glue up the legs, rails and stretcher',
      body: [
        'Spread glue over one face of each pair and press the second piece on, ends flush. Clamp, then screw every 200mm from the face that will be hidden.',
        'Do the same for the bearers, foot rails and stretcher: every chunky part is two pieces glued together.',
      ],
      why: 'Two pieces glued are stiffer than one solid piece, and give the chunky 94mm look of the oak original.',
      check: 'Glue squeezes out along the whole joint. Wipe it off with a damp cloth.',
      fix: '5.0 × 80mm screws, glue.',
      joint: 'lamleg',
      scene: { adds: ['legs'] },
    },
    {
      title: 'Build the two end frames',
      body: [
        'Drill two pocket holes in each end of the top bearers and foot rails, on the inside face.',
        `Lay two legs flat, ${mm(D - 2 * IN)} apart outside to outside. Glue and pocket-screw the bearer flush with the top of the legs and the foot rail with its underside ${FOOT}mm from the floor.`,
      ],
      why: 'Pocket screws on the inside keep the outside faces clean, like a solid oak table.',
      check: 'Diagonals of each frame match within 2mm. Frames lie flat without rocking.',
      fix: '63mm pocket screws, glue.',
      joint: 'railleg',
      scene: { adds: ['frames'], move: { frames: [0, 0, 120] } },
    },
    {
      title: 'Fit the stretcher with its tenon and key',
      body: [
        `Stand the frames up, ${mm(strL)} apart inside. Centre the stretcher between the foot rails.`,
        'Drive two 6.0 × 150mm timber screws through each foot rail into the stretcher ends. Then glue the tenon block over the screw heads and glue the key into its slot.',
      ],
      why: 'The stretcher stops the table racking. The tenon and key are the classic trestle detail, and here they hide the screws.',
      check: 'Frames are upright on a level and the stretcher is level end to end.',
      fix: '4 × 6.0 × 150mm timber screws, glue.',
      joint: 'key',
      scene: { adds: ['stretcher'], move: { stretcher: [0, 320, 0] } },
    },
    {
      title: 'Fit the top spine',
      body: ['Pocket-screw the spine between the two top bearers, centred, flush with their tops.', 'Fit levelling feet into the bottom of each leg.'],
      why: 'The spine stops the long top sagging in the middle.',
      check: 'A straight edge laid across bearers and spine touches all three.',
      fix: '63mm pocket screws, 4 levelling feet.',
      scene: { adds: ['spine'], move: { spine: [0, 0, 200] } },
    },
    {
      title: 'Glue up the top',
      body: [
        `Lay the ${nb} top boards face down on a flat floor. Glue the edges and pull them tight with long clamps, top and bottom alternately so the top stays flat.`,
        'Leave overnight. Then plane or belt-sand any step between boards.',
      ],
      why: 'Alternating clamps above and below stop the top bowing as the clamps tighten.',
      check: 'A straight edge across the joints shows no steps.',
      fix: 'Glue, 4 long clamps.',
      scene: { adds: ['top'], move: { top: [0, 0, 300] } },
    },
    {
      title: 'Fit the breadboard ends',
      body: [
        'Drill pocket holes in the underside of each top board at both ends. Clamp a breadboard end on, flush on top.',
        'Glue only the middle 300mm, then drive the pocket screws.',
      ],
      why: 'Gluing only the middle lets the top shrink and swell across its width without cracking the ends.',
      check: 'Ends flush with the top surface. Sand flush if needed.',
      fix: '63mm pocket screws, glue in the middle only.',
      joint: 'breadboard',
      scene: { adds: ['ends'], move: { ends: [0, 0, 300] } },
    },
    {
      title: 'Fix the top to the base',
      body: [`Turn the top face down on a blanket. Stand the base on it upside down, centred, with ${mm(OV)} overhang at each end.`, 'Fix with steel angle brackets on the inside of the bearers and spine. No glue.'],
      why: 'Brackets let the top move with the seasons. Glue would crack it.',
      check: 'Overhang the same at both ends and both sides.',
      fix: '8 angle brackets, 4.0 × 30mm screws.',
      scene: { joint: 'bracket' },
    },
    {
      title: 'Final sand and finish',
      body: [
        'Sand at 120 then 180 grit. Soften every edge and corner by hand.',
        'Top: three thin coats of worktop oil for heat and spill resistance. Base: two coats of hard-wax oil. See the Finish tab.',
      ],
      why: 'A dining top takes spills, hot plates and elbows. Worktop oil is made for that.',
      check: 'Water beads up on the top after the third coat has cured.',
      scene: { prep: 'oil' },
    },
    {
      title: 'Carry it in, level it, enjoy it',
      body: ['Move the top and base separately if you can, then fix them together in the room.', 'Adjust the feet until a level reads level both ways and nothing rocks.'],
      why: 'Mill floors are rarely flat. Levelled feet stop the wobble that drives everyone mad.',
      check: 'Level both ways, no rock, clear of walkways and fire routes.',
      scene: { adds: ['props'] },
    },
  ]
}

export default {
  id: 'table',
  name: 'The Trestle Table',
  short: 'Trestle table',
  tagline: 'A chunky Scandi-style dining table with a keyed stretcher.',
  intro:
    'A long, chunky dining or meeting table inspired by solid oak trestle tables: 94mm laminated legs, deep end frames, a low centre stretcher with a classic tenon-and-key detail, and a scaffold-board top framed by breadboard ends. It seats eight at the standard size.',
  seed: 21,
  difficulty: 'Ambitious',
  level: 3,
  time: '3–4 weekends',
  defaults: { width: 2000, depth: 900, height: 760 },
  limits: { width: [1400, 2800], depth: [675, 1125], height: [720, 780] },
  features: ['Chunky 94 × 100mm laminated legs', 'Keyed stretcher: the classic trestle detail', 'Breadboard ends frame the top', 'Seats 8 at 2000 × 900mm'],
  model,
  explode,
  steps,
  topArea: (d) => (d.width * d.depth + 2 * (d.width + d.depth) * T) / 1e6,
  orthoDims: (d) => {
    const L = layout(d)
    return { front: [{ axis: 'u', from: 0, to: L.OV, level: 1 }, { axis: 'v', from: 0, to: FOOT, level: 1 }], side: [], top: [] }
  },
  fixings: (d, { L }) => {
    const nb = panelBoards(d.depth).length
    return { screw80: 40, screw150: 4, pocket: 16 + 4 + nb * 4, screw30: 32, glue: 600, bracket: 8, levellers: 4 }
  },
  tools: {
    must: ['tape', 'square', 'pencil', 'circsaw', 'drill', 'bits', 'pocket', 'clamps', 'barclamps', 'sander', 'denail', 'brush', 'level', 'trestles', 'ppe'],
    nice: ['mitre', 'impact', 'plane', 'nailfinder'],
  },
  joints: [
    { kind: 'lamleg', title: 'Laminated leg', text: 'Two 47 × 100mm glued and screwed into one 94 × 100mm leg.' },
    { kind: 'railleg', title: 'Rail into leg', text: 'Bearers and foot rails pocket-screwed into the legs from the inside.' },
    { kind: 'key', title: 'Tenon and key', text: 'Screws pull the stretcher tight; a glued block and key hide them and give the trestle look.' },
    { kind: 'breadboard', title: 'Breadboard end', text: 'Pocket screws from below, glue only in the middle so the top can move.' },
    { kind: 'bracket', title: 'Top to base', text: 'Steel brackets inside the bearers. No glue.' },
  ],
  finish: [
    'Top: worktop oil (for example Osmo Top Oil), three thin coats on the top, edges and underside. It resists water, wine, coffee and warm plates.',
    'For the pale Scandi look of the oak original, choose Natural and add a white-tinted oil (for example Osmo Polyx-Oil Raw) instead of clear: it stops the boards yellowing.',
    'Always use mats under hot dishes. No oil finish is heat-proof against a pan straight from the oven.',
  ],
  safety: [
    { title: 'Load', text: 'Holds a full dinner for eight easily. Don’t sit or stand on the overhanging ends: they can tip the table.' },
    { title: 'Weight', text: 'About 80–100kg assembled. Move the top and base separately with two people.' },
    { title: 'Common areas', text: 'A big table needs clearance: leave at least 900mm behind chairs for people to pass, and more on any escape route.' },
  ],
  images: [
    { file: 'hero.jpg', title: 'Finished trestle table in the mill', prompt: 'Photorealistic interior photo of a chunky Scandi-style trestle dining table made from reclaimed scaffold boards, pale natural oiled finish, top framed by breadboard ends, thick 94mm square legs, deep end frames joined by a low centre stretcher with a through-tenon and wooden key, in a converted English mill with whitewashed brick walls, timber beams and large steel windows, soft daylight, styled with a linen runner and ceramic bowl, 35mm lens' },
    { file: 'detail-key.jpg', joint: 'key', title: 'Tenon and key close-up', prompt: 'Close-up photo of a wooden through-tenon with a wedged key on a rustic trestle table stretcher, pale oiled reclaimed timber, visible grain, warm side light, shallow depth of field' },
    { file: 'in-situ.jpg', title: 'Table in a shared space', prompt: 'Wide photo of a long rustic trestle table with mismatched chairs in the shared dining area of a converted mill, clear walkways, brick walls, natural light' },
  ],
}
