import { box, panel, panelBoards, plant, BOARD_T as T, FRAME_T as FT, FRAME_W as FW } from '../lib/geometry.js'

const mm = (n) => `${Math.round(n)}mm`
const BOOK_COLOURS = [[8, 45, 34], [200, 30, 30], [40, 55, 45], [150, 18, 38], [30, 20, 82], [355, 30, 42], [210, 12, 55], [45, 60, 60], [120, 15, 30]]

function layout(d) {
  const W = d.width, D = d.depth, H = d.height, N = d.shelves
  const zs0 = 150 // underside of bottom shelf
  const zsN = H - T // underside of top shelf
  const gap = (zsN - zs0) / (N - 1)
  const levels = Array.from({ length: N }, (_, i) => Math.round(zs0 + i * gap))
  return { W, D, H, N, levels, gap, shelfL: W - 2 * FT, innerL: W - 4 * FT }
}

function model(d) {
  const L = layout(d)
  const { W, D, H, N, levels, shelfL, innerL } = L
  const b = []
  const frame = { mat: 'frame' }

  for (const [g, x, rx] of [['ladderL', 0, FT], ['ladderR', W - FT, W - 2 * FT]]) {
    b.push(box(g, 'Upright', [x, 0, 0], [FT, FW, H], frame))
    b.push(box(g, 'Upright', [x, D - FW, 0], [FT, FW, H], frame))
    for (const z of levels) b.push(box(g, 'Shelf rail', [rx, 0, z - FW], [FT, D, FW], frame))
  }
  levels.forEach((z, i) => {
    const g = i === 0 ? 'shelfBottom' : i === N - 1 ? 'shelfTop' : 'shelfMid'
    b.push(...panel(g, 'Shelf board', [FT, 0, z], shelfL, D, 'y', { lengthAxis: 'x', reverse: true, bands: i === N - 1 }))
  })
  b.push(box('kick', 'Kick board', [2 * FT, D - T, 0], [innerL, T, levels[0]]))
  b.push(box('kick', 'Kick board', [2 * FT, 0, 0], [innerL, T, levels[0]]))
  b.push(box('apron', 'Back apron', [2 * FT, 0, H - T - FW], [innerL, T, FW]))
  b.push(box('apron', 'Wall strap', [W / 2 - 15, -3, H - T - 60], [30, 3, 40], { mat: 'steel' }))

  // Books on the middle shelves, deterministic so they don't jump around
  let r = 3
  const rnd = () => ((r = (r * 9301 + 49297) % 233280) / 233280)
  for (let i = 0; i < N - 1; i++) {
    const zTop = levels[i] + T
    const clear = levels[i + 1] - FW - zTop
    let x = FT + 20 + rnd() * 60
    const stop = FT + shelfL * (0.55 + rnd() * 0.35)
    while (x < stop) {
      const w = 22 + rnd() * 26
      const h = Math.min(clear - 25, 170 + rnd() * 90)
      const dd = Math.min(D - 40, 140 + rnd() * 60)
      if (h < 80) break
      b.push(box('props', 'Book', [x, D - dd - 20, zTop], [w, dd, h], { mat: 'prop', color: BOOK_COLOURS[Math.floor(rnd() * BOOK_COLOURS.length)] }))
      x += w + 1
    }
    if (i % 2 === 1) b.push(box('props', 'Pot', [W - FT - 200, D / 2 - 70, zTop], [140, 140, 130], { mat: 'prop', color: [30, 18, 82] }))
  }
  b.push(...plant(W * 0.6, D / 2 - 75, H, 150))

  return { boxes: b, L }
}

const explode = {
  ladderL: [-420, 0, 0],
  ladderR: [420, 0, 0],
  shelfTop: [0, 0, 380],
  shelfMid: [0, 360, 0],
  shelfBottom: [0, 360, -40],
  kick: [0, 0, -220],
  apron: [0, -360, 0],
  props: [0, 0, 1200],
}

function steps(d, { L }) {
  const { W, D, H, N, levels, gap, shelfL } = L
  const marks = levels.map((z) => z - FW).map((z) => mm(z)).join(', ')
  const nb = panelBoards(D).length
  return [
    {
      title: 'Bring the boards indoors and pick your best',
      body: ['Stack boards and framing flat indoors with spacers for 1 to 2 weeks.', 'Pick the straightest four lengths of framing for the uprights. Twisted uprights make a wobbly bookcase.'],
      why: 'Dry timber stays put. Damp timber twists after you build.',
      check: 'Uprights chosen and checked by sighting along each edge.',
      scene: { prep: 'default' },
    },
    {
      title: 'Take out every nail and staple',
      body: ['Pull or punch every nail in the scaffold boards.', 'The framing timber is new, so it just needs a check for staples and labels.'],
      why: 'Hidden nails wreck blades and can throw the saw back at you.',
      check: 'A magnet or detector pen finds nothing along the cut lines.',
      scene: { prep: 'denail' },
    },
    {
      title: 'Scrub and dry',
      body: ['Scrub the boards with a wire brush and warm soapy water. Leave them on edge for 2 days.'],
      why: 'Clean boards sand faster and don’t clog sandpaper.',
      check: 'Boards are fully dry.',
      scene: { prep: 'clean' },
    },
    {
      title: 'Cut everything to length',
      body: [
        `Cut four uprights at ${mm(H)} and ${N * 2} shelf rails at ${mm(D)} from the framing timber.`,
        `Trim 30mm off each board end, then cut ${N * nb} shelf boards at ${mm(shelfL)}. Follow the Cutting plan tab.`,
      ],
      why: 'All four uprights must be exactly the same length, or the bookcase will rock.',
      check: 'Stand the four uprights side by side on the floor. Their tops line up.',
      fix: 'Clamp the uprights together and cut them as one if your saw allows.',
      scene: { prep: 'cut' },
    },
    {
      title: 'Rip the narrow pieces',
      body: [
        nb > 1 && D % 225 ? `Your ${mm(D)} depth needs each shelf made of ${nb} ripped boards. Rip them to width against a guide.` : 'Shelves use full-width boards, so only the kick boards and apron need ripping.',
        `Rip the two kick boards to ${mm(levels[0])} wide and the back apron to 100mm.`,
      ],
      why: 'Shelf boards that match in width look tidy and sit flat.',
      check: 'Ripped edges are straight and square.',
      scene: { prep: 'rip' },
    },
    {
      title: 'Rough-sand everything at 80 grit',
      body: ['Sand all faces at 80 grit before assembly. Round over the edges of the uprights slightly.'],
      why: 'It’s far easier now than between shelves later.',
      check: 'No grey weathering left on show faces.',
      scene: { prep: 'sand' },
    },
    {
      title: 'Build the left ladder',
      body: [
        'Clamp all four uprights side by side and mark the rail heights across all of them in one go. Measure from the bottom.',
        `Bottom of each rail: ${marks}.`,
        'Lay two uprights flat, glue each rail, line its bottom edge up with the mark, and drive two 5.0 × 80mm screws into each upright.',
      ],
      why: 'Marking all four uprights together guarantees the shelves come out level.',
      check: 'Measure diagonals across the ladder. They match within 2mm.',
      fix: `${N * 4} screws 5.0 × 80mm per ladder, glue.`,
      joint: 'shelfrail',
      scene: { adds: ['ladderL'], move: { ladderL: [-240, 0, 0] } },
    },
    {
      title: 'Build the right ladder',
      body: ['Repeat with the other two uprights. Build it as a mirror image: rails on the inside face.', 'Fit levelling feet into the bottom of all four uprights.'],
      why: 'Mirror image means both sets of rails face into the bookcase.',
      check: 'Lay one ladder on the other. Rails line up exactly.',
      fix: `${N * 4} screws 5.0 × 80mm, glue, 4 levelling feet.`,
      scene: { adds: ['ladderR'], move: { ladderR: [240, 0, 0] } },
    },
    {
      title: 'Join them with the bottom shelf and kick boards',
      body: [
        'With a helper, stand both ladders up. Lay the bottom shelf boards on the bottom rails.',
        'Slide the kick boards in under the front and back of the shelf. Screw down through the shelf into the rails and kick boards.',
      ],
      why: 'The kick boards stop the bottom racking (leaning sideways) and hide dust underneath.',
      check: 'Ladders stand upright on a spirit level.',
      fix: '5.0 × 80mm screws; 2 angle brackets per kick board.',
      scene: { adds: ['shelfBottom', 'kick'], move: { shelfBottom: [0, 0, 160], kick: [0, 0, -0] } },
    },
    {
      title: 'Fit the top shelf and back apron',
      body: [
        'Lay the top shelf on the top rails (banded ends make a nice detail). Screw the back apron between the rails under it.',
        'Measure the front diagonals. Push the top sideways until they match, then screw down the top shelf.',
      ],
      why: 'The apron and top shelf lock the frame square and give the wall strap something solid to hold.',
      check: 'Front diagonals match within 3mm. The frame no longer sways.',
      fix: '5.0 × 80mm screws, 2 angle brackets.',
      scene: { adds: ['shelfTop', 'apron'], move: { shelfTop: [0, 0, 220] } },
    },
    {
      title: 'Drop in the middle shelves',
      body: [`Lay the remaining shelves on their rails. Spacing is about ${mm(gap - T)} clear between shelves.`, 'Fix each shelf board with one 5.0 × 80mm screw down into each rail.'],
      why: 'Screwed shelves add stiffness: every shelf is a brace.',
      check: 'A level on each shelf reads level.',
      fix: '5.0 × 80mm screws.',
      scene: { adds: ['shelfMid'], move: { shelfMid: [0, 260, 0] } },
    },
    {
      title: 'Final sand and oil',
      body: ['Sand at 120, then 180 grit. Soften every edge by hand.', 'Apply two thin coats of hard-wax oil. See the Finish tab.'],
      why: 'Finished shelves resist marks from books and plants.',
      check: 'Dry to the touch, no sticky patches.',
      scene: { prep: 'oil' },
    },
    {
      title: 'Stand it up and fix it to the wall',
      body: [
        'Use a cable and pipe detector on the wall first. Choose a spot away from fire escape routes.',
        'Level it with the feet, then fix the anti-tip strap from the back apron into the wall with the right plug for the wall (brick, block or stud).',
      ],
      why: `At ${mm(H)} tall and fully loaded, a bookcase can topple forward if pulled. The strap stops that.`,
      check: 'Pull gently on the top: it doesn’t move. Strap is tight.',
      fix: 'Anti-tip strap kit, wall plugs to suit.',
      joint: 'antitip',
      scene: { adds: ['props'] },
    },
  ]
}

export default {
  id: 'bookcase',
  name: 'The Bookcase',
  short: 'Bookcase',
  tagline: 'Open ladder frame, chunky shelves, nothing fussy.',
  intro:
    'A tall, open bookcase in the classic scaffold-board style: two ladder frames of 47 × 100mm timber with chunky board shelves resting on the rails. No doors, no tricky joints, just square cuts and screws. It’s the easiest of the three and a great first build.',
  seed: 9,
  difficulty: 'Easy',
  level: 1,
  time: '2 weekends',
  defaults: { width: 800, depth: 300, height: 1800, shelves: 5 },
  limits: { width: [500, 1200], depth: [225, 400], height: [1000, 2200], shelves: [3, 7] },
  features: ['Two ladder frames in 47 × 100mm', 'Chunky 38mm shelves', 'Kick boards and back apron for stiffness', 'Anti-tip wall strap'],
  model,
  explode,
  steps,
  orthoDims: (d) => {
    const L = layout(d)
    return { front: L.levels.slice(1, -1).map((z) => ({ axis: 'v', from: 0, to: z + T, level: 1, label: mm(z + T) })).slice(0, 1), side: [], top: [] }
  },
  fixings: (d, { L }) => {
    const nb = panelBoards(d.depth).length
    return { screw80: 8 * L.N + 2 * L.N * nb + 12, screw30: 24, glue: 250, bracket: 6, levellers: 4, antitip: 1 }
  },
  tools: {
    must: ['tape', 'square', 'pencil', 'circsaw', 'drill', 'bits', 'clamps', 'sander', 'denail', 'brush', 'level', 'trestles', 'ppe', 'detector'],
    nice: ['mitre', 'impact', 'nailfinder', 'plane'],
  },
  joints: [
    { kind: 'shelfrail', title: 'Rail and shelf', text: 'Rails screwed to the inside of the uprights. Shelves sit on top and are screwed down.' },
    { kind: 'antitip', title: 'Anti-tip strap', text: 'A strap from the back apron to a solid fixing in the wall.' },
  ],
  finish: [
    'Clear satin hard-wax oil throughout. Two coats is plenty for shelves.',
    'For contrast, give the frames a tinted oil (dark grey or black) and keep the shelves natural.',
    'Let the oil cure for a full week before loading books: fresh oil can stick to covers.',
  ],
  safety: [
    { title: 'Load', text: 'Each shelf holds roughly 35–40kg spread evenly (a full row of hardbacks). Put the heaviest books at the bottom.' },
    { title: 'Anti-tip is essential', text: 'A tall bookcase in a shared space must be fixed to the wall. Never let children climb it.' },
    { title: 'Check the wall', text: 'Use a detector before drilling. Old mill walls are often solid brick: use brown plugs and 5mm screws. For stud walls, find a stud.' },
  ],
  images: [
    { file: 'hero.jpg', title: 'Finished bookcase in the mill', prompt: 'Photorealistic interior photo of a tall open bookcase made from reclaimed scaffold board shelves on dark-oiled 47x100mm timber ladder frames, 1800mm tall, 5 shelves, filled with books and plants, in a converted English mill with exposed brick, cast-iron columns and timber beams, soft daylight from a tall window, warm tones, 35mm lens' },
    { file: 'detail-shelf.jpg', title: 'Shelf and rail close-up', prompt: 'Close-up photo of a reclaimed scaffold board shelf resting on a timber rail, black screw heads, visible nail holes, oiled wood grain, warm side light, shallow depth of field' },
    { file: 'in-situ.jpg', title: 'Bookcase in a common area', prompt: 'Wide photo of a converted mill common area with a rustic scaffold-board bookcase against a brick wall, clear walkway, fire exit sign visible in the distance, natural light' },
  ],
}
