import { box, panel, panelBoards, plant, BOARD_T as T, FRAME_T as FT, FRAME_W as FW } from '../lib/geometry.js'

const STEEL = { mat: 'steel' }
const mm = (n) => `${Math.round(n)}mm`

function layout(d) {
  const W = d.width, D = d.depth, H = d.height
  const z0 = FW // plinth height
  const Ds = D - T // side depth (back boards sit behind)
  const zb = z0 + T // top of base
  const zt = H - T // underside of top
  const Hi = zt - zb
  const bayW = (W - 3 * T) / 2
  const sd = D - 2 * T - FT - 10 // shelf depth, clear of the door ledges
  const shelfZ = zb + Math.round(Hi / 2) - T / 2
  const doorW = bayW - 6
  const doorH = Hi - 6
  return { W, D, H, z0, Ds, zb, zt, Hi, bayW, sd, shelfZ, doorW, doorH }
}

function model(d) {
  const L = layout(d)
  const { W, D, H, z0, Ds, zb, zt, Hi, bayW, sd, shelfZ, doorW, doorH } = L
  const b = []
  const frame = { mat: 'frame' }

  // Plinth: a ladder frame of 47 × 100 on edge, set back 50mm at the front for a shadow gap
  const cl = D - 50 - 2 * FT
  b.push(box('plinth', 'Plinth rail, long', [0, 0, 0], [W, FT, FW], frame))
  b.push(box('plinth', 'Plinth rail, long', [0, D - 50 - FT, 0], [W, FT, FW], frame))
  for (const x of [0, W / 2 - FT / 2, W - FT]) b.push(box('plinth', 'Plinth rail, short', [x, FT, 0], [FT, cl, FW], frame))

  b.push(...panel('back', 'Back board', [0, 0, z0], W, H - T - z0, 'z', { lengthAxis: 'x' }))
  b.push(...panel('base', 'Base board', [T, T, z0], W - 2 * T, Ds, 'y', { lengthAxis: 'x', reverse: true }))
  b.push(...panel('sideL', 'Side board', [0, T, z0], H - T - z0, Ds, 'y', { lengthAxis: 'z', reverse: true }))
  b.push(...panel('sideR', 'Side board', [W - T, T, z0], H - T - z0, Ds, 'y', { lengthAxis: 'z', reverse: true }))
  b.push(...panel('divider', 'Divider board', [W / 2 - T / 2, T, zb], Hi, Ds, 'y', { lengthAxis: 'z', reverse: true }))
  b.push(...panel('top', 'Top board', [0, 0, H - T], W, D, 'y', { lengthAxis: 'x', reverse: true, bands: true }))

  // Divider brackets (hidden inside)
  for (const x of [W / 2 - T / 2 - 50, W / 2 + T / 2]) b.push(box('divider', 'Bracket', [x, T + Ds / 2, zb], [50, 20, 50], STEEL))

  // Shelf cleats and shelves
  const cleatXs = [T, W / 2 - T / 2 - T, W / 2 + T / 2, W - 2 * T]
  for (const x of cleatXs) b.push(box('cleats', 'Shelf cleat', [x, T + 10, shelfZ - 75], [T, sd - 30, 75]))
  b.push(...panel('shelves', 'Shelf board', [T, T, shelfZ], bayW, sd, 'y', { lengthAxis: 'x' }))
  b.push(...panel('shelves', 'Shelf board', [W / 2 + T / 2, T, shelfZ], bayW, sd, 'y', { lengthAxis: 'x' }))

  // Doors: vertical boards held by two ledges behind, hung on T-hinges
  const doors = [
    { g: 'doorL', x0: T + 3, hingeLeft: true },
    { g: 'doorR', x0: W / 2 + T / 2 + 3, hingeLeft: false },
  ]
  const zd = zb + 3
  const ledgeZ = [zd + 60, zd + doorH - 60 - FW]
  for (const dr of doors) {
    b.push(...panel(dr.g, 'Door board', [dr.x0, D - T, zd], doorH, doorW, 'x', { lengthAxis: 'z' }))
    for (const z of ledgeZ) b.push(box(dr.g, 'Door ledge', [dr.x0 + 30, D - T - FT, z], [doorW - 60, FT, FW], frame))
    for (const z of ledgeZ) {
      const hz = z + FW / 2 - 11
      const strapX = dr.hingeLeft ? dr.x0 : dr.x0 + doorW - 260
      b.push(box('hardware', 'T-hinge', [strapX, D, hz], [260, 3, 22], STEEL))
      b.push(box('hardware', 'T-hinge', [dr.hingeLeft ? 5 : W - 33, D, hz - 39], [28, 3, 100], STEEL))
    }
    const hx = dr.hingeLeft ? dr.x0 + doorW - 55 : dr.x0 + 35
    b.push(box('hardware', 'Handle', [hx, D, zd + doorH / 2 - 80], [20, 26, 160], STEEL))
  }
  b.push(box('stops', 'Door stop block', [W / 2 - T / 2 - 60, D - 2 * T, zt - T], [60, T, T]))
  b.push(box('stops', 'Door stop block', [W / 2 + T / 2, D - 2 * T, zt - T], [60, T, T]))

  // Styling props for the hero render
  const p = { mat: 'prop' }
  b.push(...plant(W * 0.1, D * 0.3, H, 170))
  b.push(box('props', 'Book', [W * 0.62, D * 0.3, H], [300, 210, 34], { ...p, color: [196, 22, 32] }))
  b.push(box('props', 'Book', [W * 0.62 + 15, D * 0.3 + 8, H + 34], [270, 190, 28], { ...p, color: [36, 42, 70] }))
  b.push(box('props', 'Lamp base', [W * 0.82, D * 0.4, H], [110, 110, 30], { ...p, color: [210, 5, 20] }))
  b.push(box('props', 'Lamp', [W * 0.82 + 45, D * 0.4 + 45, H + 30], [20, 20, 330], { ...p, color: [210, 5, 20] }))
  b.push(box('props', 'Lamp shade', [W * 0.82 - 40, D * 0.4 - 40, H + 330], [190, 190, 150], { ...p, color: [38, 40, 86] }))

  return { boxes: b, L }
}

const explode = {
  plinth: [0, 0, -260],
  base: [0, 0, -110],
  sideL: [-380, 0, 0],
  sideR: [380, 0, 0],
  divider: [0, 0, 60],
  cleats: [0, 0, 60],
  shelves: [0, 0, 160],
  back: [0, -420, 0],
  top: [0, 0, 420],
  doorL: [0, 640, 0],
  doorR: [0, 640, 0],
  hardware: [0, 700, 0],
  stops: [0, 0, 260],
  props: [0, 0, 900],
}

function steps(d, { L }) {
  const { W, D, H, Ds, bayW, sd, doorW, doorH, Hi } = L
  const sideBoards = panelBoards(Ds).length
  return [
    {
      title: 'Bring the boards indoors and pick your best',
      body: [
        'Stack the boards flat indoors with small offcuts between them so air can flow. Leave them for 1 to 2 weeks.',
        'Then lay them all out. Choose the straightest, best-looking boards for the top and doors. Mark them in pencil on the end.',
      ],
      why: 'Wood shrinks as it dries. If it shrinks after you join it, gaps and cracks open up.',
      check: 'Boards have been indoors at least a week and you’ve marked your top and door boards.',
      scene: { prep: 'default' },
    },
    {
      title: 'Take out every nail and staple',
      body: ['Go over every face and edge. Pull nails with pincers or a claw hammer.', 'If a nail snaps, punch the stub at least 5mm below the surface with a nail punch.'],
      why: 'One hidden nail will ruin a saw blade or sander pad, and can kick the saw back at you.',
      check: 'Run a gloved hand and a magnet (or detector pen) along each board. Nothing catches.',
      scene: { prep: 'denail' },
    },
    {
      title: 'Scrub and dry',
      body: ['Scrub each board with a stiff wire brush and warm soapy water, working along the grain.', 'Stand them on edge to dry for at least 2 days.'],
      why: 'Cement and grit blunt sandpaper in seconds. Cleaning first makes sanding quicker and cheaper.',
      check: 'Boards are dry to the touch and no longer feel cold or damp.',
      scene: { prep: 'clean' },
    },
    {
      title: 'Cut every piece to length',
      body: [
        'Follow the Cutting plan tab. First trim 30mm off each end of every board to remove splits.',
        'Measure from the trimmed end. Mark with a square, then cut with the saw against a clamped straight edge.',
        'Label each piece with its letter from the cut list in pencil.',
      ],
      why: 'Square, accurate cuts are what make the box go together without gaps.',
      check: 'Every piece in the cut list is cut, labelled, and within 1mm of the size.',
      fix: 'Circular saw or mitre saw, 40-tooth blade.',
      scene: { prep: 'cut' },
    },
    {
      title: 'Rip the narrow pieces',
      body: [
        'Some pieces are narrower than a full board (the cut list says “rip to”). Cutting along a board is called ripping.',
        'Set the saw’s rip fence, or clamp a straight edge as a guide, and cut slowly. Use leftover strips for the shelf cleats (75mm wide).',
      ],
      why: 'A steady rip gives a straight edge that sits tight against the next board.',
      check: 'Ripped edges are straight when you hold two together against the light.',
      scene: { prep: 'rip' },
    },
    {
      title: 'Rough-sand everything at 80 grit',
      body: ['Sand every face at 80 grit now, before assembly. It’s much easier on loose pieces.', 'Don’t go finer yet. You’ll do the 120 and 180 passes when it’s built.'],
      why: 'Inside corners are hard to reach once the box is built.',
      check: 'No grey weathered wood left on visible faces.',
      scene: { prep: 'sand' },
    },
    {
      title: 'Build the plinth',
      body: [
        `Lay out the two long rails (${mm(W)}) and three short rails on edge on a flat floor.`,
        'Glue the ends of the short rails. Clamp and drive two 5.0 × 80mm screws through the long rail into each end.',
        'Fit adjustable feet into the underside at each corner.',
      ],
      why: 'The plinth lifts the boards off a cold, possibly damp mill floor and gives a neat shadow line at the front.',
      check: 'Measure corner to corner both ways. The two numbers match within 2mm (it’s square). It doesn’t rock.',
      fix: '6 × 2 screws 5.0 × 80mm, glue, 4 adjustable feet.',
      joint: 'plinth',
      scene: { adds: ['plinth'], move: { plinth: [0, 0, 0] } },
    },
    {
      title: 'Lay the base on the plinth',
      body: [
        'Run glue along the edges where the base boards meet. Lay them on the plinth, clamped tight together.',
        `The base is ${mm(W - 2 * T)} long, so leave a ${T}mm gap at each end for the sides.`,
        'Screw down into each plinth rail: two 5.0 × 80mm screws per board per rail.',
      ],
      why: 'The base ties the boards together and is the floor of the cupboard.',
      check: 'The gap at each end is 38mm. Boards are flush where they meet.',
      fix: '5.0 × 80mm screws, glue on edges.',
      scene: { adds: ['base'], move: { base: [0, 0, 120] } },
    },
    {
      title: 'Fit the left side',
      body: [
        `Glue the side’s ${sideBoards} boards edge to edge and clamp. Stand them on the plinth at the left end, against the base.`,
        'Pre-drill and countersink. Drive two 5.0 × 80mm screws through the side into the end of each base board. The side’s bottom edge rests on the plinth.',
      ],
      why: 'Pre-drilling (a 3mm hole first) stops the old, dry boards splitting at the ends.',
      check: 'Side is upright: hold a spirit level against it. Bubble is in the middle.',
      fix: '5.0 × 80mm screws, glue.',
      joint: 'butt',
      scene: { adds: ['sideL'], move: { sideL: [-220, 0, 0] } },
    },
    {
      title: 'Fit the right side',
      body: ['Repeat at the other end.', 'If the side won’t sit upright, check the base end is cut square.'],
      why: 'Both sides upright means the doors will hang straight later.',
      check: 'Measure the width at the top and bottom of the box. Same number both times.',
      fix: '5.0 × 80mm screws, glue.',
      scene: { adds: ['sideR'], move: { sideR: [220, 0, 0] } },
    },
    {
      title: 'Fit the divider',
      body: [
        `Mark the centre of the base at ${mm(W / 2)} from the left end. Stand the divider boards there.`,
        'Fix the bottom with two small steel angle brackets each side (4.0 × 30mm screws). The top gets screwed through the top board later.',
      ],
      why: 'The divider stops the long top sagging in the middle and gives the doors something to close against.',
      check: `Both bays measure ${mm(bayW)} wide at top and bottom.`,
      fix: '4 angle brackets, 4.0 × 30mm screws.',
      scene: { adds: ['divider'], move: { divider: [0, 0, 160] } },
    },
    {
      title: 'Screw in the shelf cleats',
      body: [
        `Mark a level line ${mm(L.shelfZ - L.zb)} up from the base on both sides of each bay.`,
        'Screw a cleat (a 75mm strip) below each line with three 4.0 × 60mm screws.',
      ],
      why: 'Cleats carry the shelf. Using a level line means the shelf won’t slope.',
      check: 'Lay a spirit level across from cleat to cleat. It reads level.',
      fix: '4 cleats, 12 × 4.0 × 60mm screws.',
      joint: 'cleat',
      scene: { adds: ['cleats'] },
    },
    {
      title: 'Fix the back boards',
      body: [
        'Measure the box corner to corner both ways. Push the corners until the two numbers match. Now it’s square.',
        'Screw the back boards on, flush with the outside of the sides: two 5.0 × 80mm screws into each side and the base per board.',
      ],
      why: 'The back locks the box square. If you fix it out of square, it will stay that way.',
      check: 'Diagonals match within 2mm before the last screws go in.',
      fix: '5.0 × 80mm screws.',
      scene: { adds: ['back'], move: { back: [0, -260, 0] } },
    },
    {
      title: 'Fix the top',
      body: [
        'Pick your best boards (the banded ends look great here). Glue the edges and lay them on, flush at the back and ends.',
        'Draw pencil lines over the sides and divider. Screw down along each line, two screws per board, in neat rows.',
      ],
      why: 'Neat rows of black screws read as an industrial detail rather than a mistake.',
      check: 'Top overhangs nowhere. No screw has missed (look inside for poking tips).',
      fix: '5.0 × 80mm black screws, glue.',
      joint: 'topdown',
      scene: { adds: ['top'], move: { top: [0, 0, 260] } },
    },
    {
      title: 'Drop in the shelves',
      body: [`Lay the shelf boards (${mm(bayW)} long, ${mm(sd)} deep in total) onto the cleats. Push them to the back.`, 'Fix each board with one 4.0 × 60mm screw down into each cleat.'],
      why: 'Screwing them down stops them rocking and stiffens the box.',
      check: 'Shelves sit flat and clear the front by about 95mm (room for the door ledges).',
      fix: '4.0 × 60mm screws.',
      scene: { adds: ['shelves'], move: { shelves: [0, 220, 0] } },
    },
    {
      title: 'Build the doors',
      body: [
        `Lay the door boards face down, edges glued and clamped. Each door is ${mm(doorW)} × ${mm(doorH)}.`,
        'Glue and screw two ledges (47 × 100mm) across the back, 60mm in from the top and bottom, with 4.0 × 60mm screws from the ledge side.',
      ],
      why: 'Ledges hold the boards together and give the hinge screws something solid to bite into.',
      check: 'Each door fits its opening with a 3mm gap all round. Plane or sand to fit if needed.',
      fix: '8 × 4.0 × 60mm screws per door, glue.',
      joint: 'ledge',
      scene: { adds: ['doorL', 'doorR'], move: { doorL: [0, 420, 0], doorR: [0, 420, 0] } },
    },
    {
      title: 'Final sand and oil (before hardware)',
      body: ['Sand everything at 120 then 180 grit. Soften all edges by hand.', 'Apply two thin coats of hard-wax oil. See the Finish tab for the full method.'],
      why: 'Finishing before fitting hinges and handles gives a clean, even coat with no drips round the metal.',
      check: 'Second coat is dry to the touch (at least 24 hours).',
      scene: { prep: 'oil' },
    },
    {
      title: 'Hang the doors',
      body: [
        'Put 3mm packers (coins work) under each door to hold the gap. Line each T-hinge strap up with a ledge.',
        'Pre-drill 2mm holes and fix with 4.0 × 30mm black screws. The strap goes on the door, the T-plate on the side’s front edge.',
      ],
      why: 'Lining the hinge up with the ledge means the screws go into thick wood and won’t pull out.',
      check: 'Doors swing freely and the gaps look even. Adjust by loosening one screw at a time.',
      fix: '4 T-hinges, 4.0 × 30mm screws.',
      scene: { adds: ['hardware'] },
    },
    {
      title: 'Fit catches, stops and handles',
      body: ['Screw a stop block under the top in each bay, near the divider, so the doors close flush.', 'Fit a magnetic catch to each stop block. Bolt on the handles 50mm from the closing edge.'],
      why: 'Stops stop the doors swinging in too far and straining the hinges.',
      check: 'Doors close flush with the front and stay shut.',
      fix: '2 magnetic catches, 2 handles.',
      scene: { adds: ['stops'] },
    },
    {
      title: 'Position, level and fix to the wall',
      body: [
        'Move it into place with a helper. Keep it out of any fire escape route.',
        'Adjust the feet until a spirit level reads level both ways. Fix one anti-tip strap from the back to the wall.',
      ],
      why: 'Mill floors are rarely flat. A level sideboard means doors that stay where you leave them.',
      check: 'Level both ways, doesn’t rock, strap fixed, route clear.',
      fix: 'Anti-tip strap with suitable wall plugs.',
      joint: 'antitip',
      scene: { adds: ['props'] },
    },
  ]
}

export default {
  id: 'sideboard',
  name: 'The Sideboard',
  short: 'Sideboard',
  tagline: 'Two ledged doors, a long banded top, black iron hinges.',
  intro:
    'A long, low sideboard for the hallway or lounge: a chunky scaffold-board box on a set-back plinth, with two ledged barn-style doors on black T-hinges and an inner shelf in each bay. The galvanised bands are kept on the top boards for that unmistakable scaffold look.',
  seed: 5,
  difficulty: 'Moderate',
  level: 2,
  time: '3–4 weekends',
  defaults: { width: 1600, depth: 450, height: 800 },
  limits: { width: [900, 2400], depth: [350, 600], height: [650, 1000] },
  features: ['Banded scaffold-board top', 'Two ledged doors on black T-hinges', 'Shelf in each bay', 'Set-back plinth with levelling feet'],
  model,
  explode,
  steps,
  orthoDims: (d) => ({ front: [{ axis: 'v', from: 0, to: FW, level: 1 }], side: [], top: [] }),
  fixings: (d, { L }) => {
    const nb = panelBoards(L.Ds).length
    const nt = panelBoards(d.depth).length
    const nk = panelBoards(L.H - T - L.z0).length
    return {
      screw80: 12 + nb * 6 + nb * 8 + nt * 6 + nk * 6,
      screw60: 12 + 16 + 8 + 4,
      screw30: 24 + 16 + 8,
      glue: 450,
      thinge: 2,
      catch: 2,
      handle: 2,
      bracket: 4,
      levellers: 4,
      antitip: 1,
    }
  },
  tools: {
    must: ['tape', 'square', 'pencil', 'circsaw', 'drill', 'bits', 'clamps', 'sander', 'denail', 'brush', 'level', 'trestles', 'ppe'],
    nice: ['mitre', 'barclamps', 'impact', 'pocket', 'nailfinder', 'plane'],
  },
  joints: [
    { kind: 'plinth', title: 'Plinth corner', text: 'Rails on edge, glued and screwed with two 5.0 × 80mm screws per joint.' },
    { kind: 'butt', title: 'Side to base', text: 'A butt joint: the base end sits against the side. Glue plus two screws per board, pre-drilled.' },
    { kind: 'topdown', title: 'Top to side', text: 'Screwed straight down in neat rows. Black screws make a feature of it.' },
    { kind: 'cleat', title: 'Shelf on cleat', text: 'A 75mm strip from an offcut, screwed to the side, carries the shelf.' },
    { kind: 'ledge', title: 'Ledged door and T-hinge', text: 'Ledges behind hold the boards together. Hinge screws go into the ledge.' },
  ],
  finish: [
    'Use clear satin hard-wax oil on everything. The sideboard top will see keys, cups and plants, so give it a third coat.',
    'Darken the plinth with a tinted oil (for example a dark grey or black) so it disappears into shadow.',
    'Wipe the steel bands with a little oil too, to stop rust spots.',
  ],
  safety: [
    { title: 'Load', text: 'The 38mm shelves comfortably hold about 30kg each spread evenly. The top will take a TV or heavy lamp. Don’t stand on it.' },
    { title: 'Weight', text: 'The finished sideboard is heavy. Move it in two parts if needed: doors off, then the carcass.' },
    { title: 'Anti-tip', text: 'Low pieces rarely tip, but in a shared space children climb. Fit one strap to the wall.' },
  ],
  images: [
    { file: 'hero.jpg', title: 'Finished sideboard in the mill', prompt: 'Photorealistic interior photo of a rustic industrial sideboard made from reclaimed scaffold boards, 1600mm wide, two ledged doors with black iron T-hinges, galvanised steel bands on the board ends of the top, set-back dark plinth, standing against an exposed brick wall in a converted Victorian cotton mill in England, cast-iron columns, large arched window, soft morning light, warm natural tones, styled with a plant and books, 35mm lens, shallow depth of field' },
    { file: 'detail-hinge.jpg', joint: 'ledge', title: 'Hinge and grain close-up', prompt: 'Close-up macro photo of a black iron T-hinge screwed to an oiled reclaimed scaffold board door, visible nail holes and wood grain, satin hard-wax oil finish, warm side light, shallow depth of field' },
    { file: 'boards-raw.jpg', title: 'Raw boards before cleaning', prompt: 'Photo of a stack of weathered reclaimed scaffold boards with galvanised steel end bands in a British reclamation yard, grey weathered surface, some cement splashes, overcast daylight' },
  ],
}
