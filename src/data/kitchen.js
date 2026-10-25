import { box, panel, panelBoards, BOARD_T as T, FRAME_T as FT, FRAME_W as FW } from '../lib/geometry.js'

const mm = (n) => `${Math.round(n)}mm`
const IN = 25 // frame set in from the edge of the top

function layout(d) {
  const W = d.width, D = d.depth, H = d.height
  const legH = H - T
  const longL = W - 2 * IN - 4 * FT // long rails sit between the legs
  const shortL = D - 2 * IN - 2 * FW // side rails sit between front and back legs
  const zApron = H - T - FW
  const zMid = zApron - 250 - T // mid shelf (underside): 250mm clear for mugs and jars
  const zLow = 140
  return { W, D, H, legH, longL, shortL, zApron, zMid, zLow, shelfD: D - 2 * IN }
}

function model(d) {
  const L = layout(d)
  const { W, D, H, legH, longL, shortL, zApron, zMid, zLow, shelfD } = L
  const b = []
  const frame = { mat: 'frame' }
  const steel = { mat: 'steel' }
  const xs = [IN, W - IN - 2 * FT]
  const ys = [IN, D - IN - FW]

  // Legs: two 47 × 100 glued face to face = 94 × 100mm
  for (const x of xs) for (const y of ys) {
    b.push(box('legs', 'Leg half', [x, y, 0], [FT, FW, legH], frame))
    b.push(box('legs', 'Leg half', [x + FT, y, 0], [FT, FW, legH], frame))
  }
  // Side rails at three levels (top apron, mid, low)
  // Top apron sits between the legs, flush outside. Lower rails go across the inside face of the legs
  // so the shelves can rest on them.
  b.push(box('sideRails', 'Side apron', [IN, IN + FW, zApron], [FT, shortL, FW], frame))
  b.push(box('sideRails', 'Side apron', [W - IN - FT, IN + FW, zApron], [FT, shortL, FW], frame))
  for (const z of [zMid - FW, zLow - FW]) {
    b.push(box('sideRails', 'Side rail', [IN + 2 * FT, IN, z], [FT, D - 2 * IN, FW], frame))
    b.push(box('sideRails', 'Side rail', [W - IN - 3 * FT, IN, z], [FT, D - 2 * IN, FW], frame))
  }
  // Long rails: front + back apron at the top; back rails only lower down so the shelves are open at the front
  const x0 = IN + 2 * FT
  b.push(box('longRails', 'Front/back apron', [x0, D - IN - FT, zApron], [longL, FT, FW], frame))
  b.push(box('longRails', 'Front/back apron', [x0, IN, zApron], [longL, FT, FW], frame))
  b.push(box('longRails', 'Back rail', [x0 + FT, IN + 0, zMid - FW], [longL - 2 * FT, FT, FW], frame))
  b.push(box('longRails', 'Back rail', [x0 + FT, IN + 0, zLow - FW], [longL - 2 * FT, FT, FW], frame))
  b.push(box('longRails', 'Top bearer', [W / 2 - FT / 2, IN + FT, zApron], [FT, D - 2 * IN - 2 * FT, FW], frame))

  // Shelves, each with a cleat underneath at mid-width
  for (const [g, z] of [['shelfLow', zLow], ['shelfMid', zMid]]) {
    b.push(...panel(g, 'Shelf board', [x0, IN, z], longL, shelfD, 'y', { lengthAxis: 'x', reverse: true }))
    b.push(box(g, 'Shelf cleat', [W / 2 - T / 2, IN + FT + 5, z - 75], [T, shelfD - FT - 15, 75]))
  }

  b.push(...panel('top', 'Top board', [0, 0, H - T], W, D, 'y', { lengthAxis: 'x', reverse: true, bands: true }))
  for (const x of [W * 0.2, W * 0.5 - 120, W * 0.8 - 20]) {
    b.push(box('top', 'Bracket', [x, D - IN - FT - 3, zApron + FW - 50], [20, 3, 50], steel))
    b.push(box('top', 'Bracket', [x, IN + FT, zApron + FW - 50], [20, 3, 50], steel))
  }
  b.push(box('hardware', 'Cable grommet', [W - 170, 50, H], [70, 70, 3], steel))

  // Mug hooks along the front apron
  const hooks = Math.max(3, Math.floor(longL / 170))
  for (let i = 0; i < hooks; i++) {
    const hx = x0 + ((i + 0.5) * longL) / hooks
    b.push(box('hooks', 'Mug hook', [hx - 3, D - IN - FT / 2 - 3, zApron - 30], [6, 6, 30], steel))
  }

  // Props: microwave, kettle on a slate mat, mugs
  const p = { mat: 'prop' }
  b.push(box('props', 'Microwave', [70, D - 60 - 360, H], [480, 360, 280], { ...p, color: [220, 6, 20] }))
  b.push(box('props', 'Microwave window', [100, D - 60, H + 40], [310, 3, 200], { ...p, color: [210, 12, 9] }))
  b.push(box('props', 'Slate mat', [W - 400, D / 2 - 150, H], [300, 300, 10], { ...p, color: [215, 8, 26] }))
  b.push(box('props', 'Kettle', [W - 335, D / 2 - 80, H + 10], [170, 160, 230], { ...p, color: [30, 8, 88] }))
  const mugCols = [[160, 20, 70], [30, 40, 85], [8, 40, 50], [200, 15, 75]]
  for (let i = 0; i < hooks; i++) {
    const hx = x0 + ((i + 0.5) * longL) / hooks
    b.push(box('props', 'Mug', [hx - 42, D - IN - FT / 2 - 42, zApron - 30 - 95], [84, 84, 95], { ...p, color: mugCols[i % 4] }))
  }
  for (let i = 0; i < 3; i++) b.push(box('props', 'Jar', [x0 + 60 + i * 150, D / 2 - 60, zMid + T], [110, 110, 170], { ...p, color: [38, 30, 78] }))
  for (let i = 0; i < 2; i++) b.push(box('props', 'Tray', [x0 + 80 + i * 400, IN + 60, zLow + T], [320, 360, 90], { ...p, color: [28, 25, 60] }))

  return { boxes: b, L }
}

const explode = {
  legs: [0, 0, 0],
  sideRails: [0, 0, 0],
  longRails: [0, 0, 120],
  shelfLow: [0, 420, 0],
  shelfMid: [0, 420, 60],
  top: [0, 0, 420],
  hardware: [0, 0, 480],
  hooks: [0, 300, -60],
  props: [0, 0, 1100],
}

function steps(d, { L }) {
  const { W, D, H, legH, longL, shortL, zMid, zLow } = L
  return [
    {
      title: 'Bring the boards indoors and pick your best',
      body: ['Stack everything flat indoors with spacers for 1 to 2 weeks.', 'Choose the three best, flattest boards for the worktop. It is the part everyone touches.'],
      why: 'A worktop made from damp boards will open gaps where spills can get in.',
      check: 'Top boards chosen and marked.',
      scene: { prep: 'default' },
    },
    {
      title: 'Take out every nail and staple',
      body: ['Pull or punch every nail in the boards. Pay extra attention to the worktop boards.'],
      why: 'Nail holes on a worktop collect crumbs. Fill them later.',
      check: 'Nothing catches when you run a gloved hand along each board.',
      scene: { prep: 'denail' },
    },
    {
      title: 'Scrub and dry',
      body: ['Scrub with a wire brush and warm soapy water. Dry on edge for 2 days.'],
      why: 'A clean worktop is a hygienic worktop.',
      check: 'Fully dry.',
      scene: { prep: 'clean' },
    },
    {
      title: 'Cut everything to length',
      body: [
        `Framing: 8 leg halves at ${mm(legH)}, 2 side aprons at ${mm(shortL)}, 4 side rails at ${mm(D - 2 * IN)}, the long rails and a top bearer.`,
        `Boards: 3 worktop boards at ${mm(W)}, shelf boards at ${mm(longL)}. Follow the Cutting plan tab.`,
      ],
      why: 'All eight leg halves must match exactly, or the unit will rock.',
      check: 'Leg halves stood together line up at the top.',
      scene: { prep: 'cut' },
    },
    {
      title: 'Rip the narrow pieces',
      body: ['Rip the narrow back board of the worktop and the shelves to the widths in the cut list.', 'Put the ripped board at the back of the worktop, the sawn edge against its neighbour.'],
      why: 'The factory-rounded edge of a full board looks best at the front.',
      check: 'Ripped edges are straight.',
      scene: { prep: 'rip' },
    },
    {
      title: 'Rough-sand everything at 80 grit',
      body: ['Sand every face at 80 grit before assembly.'],
      why: 'Much easier now than between the rails.',
      check: 'No grey weathering left on show faces.',
      scene: { prep: 'sand' },
    },
    {
      title: 'Glue up the legs',
      body: [
        'Spread glue over the whole face of one leg half. Press the second on top with the ends flush.',
        'Clamp, then drive 5.0 × 80mm screws every 200mm from the inside face (it won’t be seen). Make four legs.',
      ],
      why: 'A 94 × 100mm leg is chunky, stiff, and looks like a proper industrial post.',
      check: 'Glue squeezes out along the whole joint. Wipe it off with a damp cloth.',
      fix: '5 screws 5.0 × 80mm per leg, glue.',
      joint: 'lamleg',
      scene: { adds: ['legs'] },
    },
    {
      title: 'Build the two end frames',
      body: [
        `Lay two legs flat, ${mm(D - 2 * IN)} apart outside to outside. Fit the top apron (${mm(shortL)}) between them, flush with the outside face and the top.`,
        `Screw the two longer side rails (${mm(D - 2 * IN)}) across the inside face of the legs, tops at ${mm(zMid)} and ${mm(zLow)} from the floor. The shelves will rest on these.`,
        'Glue every joint. Drive two screws through each rail end into the leg (angled, or with a pocket-hole jig for the apron).',
      ],
      why: 'Building each end flat on the floor is easier and keeps it square.',
      check: 'Diagonals of each end frame match within 2mm.',
      fix: '5.0 × 80mm screws, glue.',
      joint: 'railleg',
      scene: { adds: ['sideRails'] },
    },
    {
      title: 'Join the end frames with the long rails',
      body: [
        'Stand the ends up. Fit the front and back aprons at the top, then the two back rails lower down. Front stays open below the top.',
        'Fit the top bearer across the middle between the aprons. Fit levelling feet into the legs.',
      ],
      why: 'Leaving the front open makes the shelves easy to reach.',
      check: 'Top diagonals match. Level reads level across the top rails.',
      fix: '5.0 × 80mm screws, glue, 4 levelling feet.',
      scene: { adds: ['longRails'], move: { longRails: [0, 0, 120] } },
    },
    {
      title: 'Fit the bottom shelf',
      body: ['Screw a cleat across the middle underneath. Lay the boards on the rails, the full-width board at the front.', 'Screw down into the side rails and back rail.'],
      why: 'The cleat stops the open front edge from sagging.',
      check: 'Shelf sits flat and doesn’t rock.',
      fix: '4.0 × 60mm into the cleat, 5.0 × 80mm into rails.',
      scene: { adds: ['shelfLow'], move: { shelfLow: [0, 260, 0] } },
    },
    {
      title: 'Fit the middle shelf',
      body: ['Same again on the middle rails. This shelf is for mugs, tea and coffee.'],
      why: '250mm clear above it fits tall jars and stacked mugs.',
      check: 'Level, and a mug stood on the back of the shelf clears the apron.',
      fix: '4.0 × 60mm and 5.0 × 80mm screws.',
      scene: { adds: ['shelfMid'], move: { shelfMid: [0, 260, 0] } },
    },
    {
      title: 'Make and fix the worktop',
      body: [
        'Glue the worktop boards edge to edge and clamp until dry (leave overnight). Plane or sand any step between boards flat.',
        'Fix it with steel angle brackets inside the aprons. Don’t glue the top to the frame.',
      ],
      why: 'Wood moves with the seasons. Brackets let the top move a little without cracking.',
      check: `Overhangs ${IN}mm all round. The top is flat when you lay a straight edge across.`,
      fix: '6 angle brackets, 4.0 × 30mm screws.',
      joint: 'bracket',
      scene: { adds: ['top'], move: { top: [0, 0, 260] } },
    },
    {
      title: 'Cut the cable hole',
      body: ['Drill a 60mm hole in the back corner of the worktop with a hole saw. Drill halfway from each side so it doesn’t split. Fit the grommet.'],
      why: 'Cables go down through the hole to the socket, not over the back edge where they get pinched.',
      check: 'Kettle and microwave plugs pass through easily.',
      scene: { adds: ['hardware'] },
    },
    {
      title: 'Final sand and worktop finish',
      body: [
        'Sand at 120 then 180 grit. Soften every edge. Vacuum and wipe.',
        'Worktop: three thin coats of worktop oil, 12 hours apart. Everything else: two coats of hard-wax oil. See the Finish tab.',
      ],
      why: 'Three coats on the worktop seal it against spills, coffee and warm mugs.',
      check: 'Water drops bead up on the worktop after the third coat has cured.',
      scene: { prep: 'oil' },
    },
    {
      title: 'Fit the mug hooks',
      body: ['Mark hook positions evenly along the bottom edge of the front apron. Drill 2mm pilot holes and screw the hooks in by hand.'],
      why: 'Pilot holes stop the apron splitting and keep the hooks straight.',
      check: 'Mugs hang without touching each other.',
      scene: { adds: ['hooks'] },
    },
    {
      title: 'Position, level, fix and plug in',
      body: [
        'Place it next to a wall socket, away from fire escape routes and not under a smoke detector (kettle steam sets them off).',
        'Level with the feet, fix an anti-tip strap to the wall, put the slate mat under the kettle, and plug each appliance straight into the wall.',
      ],
      why: 'A 3kW kettle should never run off an extension lead, and a steady unit stops spills.',
      check: 'Level, strap fixed, each appliance has its own socket, cables clear of hot parts.',
      fix: 'Anti-tip strap, slate mat.',
      joint: 'antitip',
      scene: { adds: ['props'] },
    },
  ]
}

export default {
  id: 'kitchen-unit',
  name: 'The Kitchen Unit',
  short: 'Kitchen unit',
  tagline: 'A sturdy tea station with a heat- and spill-proof top.',
  intro:
    'A freestanding tea station for a shared kitchen or landing: chunky laminated legs, a three-board worktop with room for a microwave and kettle, a shelf for mugs and jars, a low shelf for trays, and a row of mug hooks along the front.',
  seed: 13,
  difficulty: 'Moderate',
  level: 2,
  time: '2–3 weekends',
  defaults: { width: 1200, depth: 600, height: 900 },
  limits: { width: [800, 1800], depth: [450, 700], height: [850, 1000] },
  features: ['Worktop fits a microwave and kettle', 'Heat- and spill-resistant worktop oil', 'Mug hooks and two open shelves', 'Cable grommet for tidy plugs'],
  model,
  explode,
  steps,
  topArea: (d) => (d.width * d.depth + 2 * (d.width + d.depth) * T) / 1e6,
  orthoDims: (d) => {
    const L = layout(d)
    return { front: [{ axis: 'v', from: 0, to: L.zMid + T, level: 1 }], side: [], top: [] }
  },
  fixings: (d, { L }) => {
    const nt = panelBoards(d.depth).length
    return { screw80: 20 + 44 + 4 * nt, screw60: 10, screw30: 30, glue: 400, bracket: 6, levellers: 4, antitip: 1, grommet: 1, hooks: Math.max(3, Math.floor(L.longL / 170)), slate: 1 }
  },
  tools: {
    must: ['tape', 'square', 'pencil', 'circsaw', 'drill', 'bits', 'clamps', 'sander', 'denail', 'brush', 'level', 'trestles', 'ppe', 'holesaw'],
    nice: ['pocket', 'mitre', 'barclamps', 'impact', 'plane', 'detector'],
  },
  joints: [
    { kind: 'lamleg', title: 'Laminated leg', text: 'Two lengths of 47 × 100mm glued and screwed into one chunky 94 × 100mm leg.' },
    { kind: 'railleg', title: 'Rail into leg', text: 'Rails flush with the outside of the leg, glued and screwed (pocket holes hide the screws).' },
    { kind: 'bracket', title: 'Worktop bracket', text: 'Steel brackets hold the top but let it move with the seasons. No glue.' },
  ],
  finish: [
    'Worktop must be heat- and spill-resistant: use a dedicated worktop oil such as Osmo Top Oil (food-safe once cured). Three thin coats, 12 hours apart, on the top, edges and underside of the worktop.',
    'No oil is heat-proof against a hot pan. Always stand the kettle on the slate or ceramic mat, and wipe spills straight away.',
    'Fill nail holes and cracks in the worktop with epoxy so crumbs and liquid can’t sit in them.',
    'Re-oil the worktop once or twice a year. Wipe on a thin coat, leave 15 minutes, buff off.',
  ],
  safety: [
    { title: 'Load', text: 'The worktop takes a microwave and kettle easily (around 20kg). Shelves: about 25kg each. Keep heavy things low.' },
    { title: 'Electrics', text: 'Plug the kettle and microwave straight into separate wall sockets, never into an extension lead. Check sockets in common areas are RCD-protected and appliances are PAT-tested if the building requires it.' },
    { title: 'Microwave clearance', text: 'Check the microwave’s manual for the space it needs around and above it, and don’t block its vents.' },
    { title: 'Steam and heat', text: 'Keep the kettle away from smoke detectors and from under shelves or cupboards where steam collects.' },
  ],
  images: [
    { file: 'hero.jpg', title: 'Finished kitchen unit in the mill', prompt: 'Photorealistic interior photo of a freestanding rustic industrial kitchen unit made from reclaimed scaffold boards on chunky dark-oiled timber legs, 1200mm wide, worktop with a microwave and a kettle on a slate mat, open shelves with mugs and jars, black mug hooks along the front, galvanised bands on the worktop board ends, in a converted English mill with brick walls and steel windows, soft daylight, 35mm lens' },
    { file: 'detail-top.jpg', joint: 'bracket', title: 'Worktop finish close-up', prompt: 'Close-up photo of an oiled reclaimed scaffold board worktop with water droplets beading on the surface, galvanised steel band at the board end, warm light, shallow depth of field' },
    { file: 'in-situ.jpg', title: 'Tea station in a shared space', prompt: 'Wide photo of a tea station made of reclaimed scaffold boards in the shared kitchen of a converted mill apartment building, kettle and microwave plugged into wall sockets, mugs hanging on hooks, clear corridor, natural light' },
  ],
}
