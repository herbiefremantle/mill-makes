import { box, panel, panelBoards, plant, BOARD_T as T } from '../lib/geometry.js'

const mm = (n) => `${Math.round(n)}mm`
const KICK = 50 // raised base with a recessed kick board
const OVER = 20 // top overhangs the sides by this much

function layout(d) {
  const cols = d.columns, rows = d.rows, cube = d.cube, D = d.depth
  const Cw = cols * cube + (cols + 1) * T // carcass width
  const H = KICK + rows * cube + (rows + 1) * T
  const inner = Cw - 2 * T
  const shelfZ = (i) => KICK + i * (cube + T) // underside of shelf i (0 = base)
  const divXs = Array.from({ length: cols - 1 }, (_, c) => OVER + T + c * (cube + T) + cube)
  return { cols, rows, cube, D, Cw, H, inner, shelfZ, divXs, W: Cw + 2 * OVER }
}

const PROP_COLOURS = { book: [[8, 45, 34], [200, 30, 30], [40, 55, 45], [150, 18, 38], [30, 20, 82], [355, 30, 42], [45, 60, 60]], basket: [34, 38, 58] }

function model(d) {
  const L = layout(d)
  const { cols, rows, cube, D, Cw, H, inner, shelfZ, divXs } = L
  const b = []

  b.push(...panel('sides', 'Side board', [OVER, 0, 0], H - T, D, 'y', { lengthAxis: 'z', reverse: true }))
  b.push(...panel('sides', 'Side board', [OVER + Cw - T, 0, 0], H - T, D, 'y', { lengthAxis: 'z', reverse: true }))
  b.push(...panel('base', 'Shelf board', [OVER + T, 0, KICK], inner, D, 'y', { lengthAxis: 'x', reverse: true }))
  b.push(box('base', 'Kick board', [OVER + T, D - 20 - T, 0], [inner, T, KICK]))

  for (let r = 0; r < rows; r++) {
    const g = `row${r + 1}`
    for (const x of divXs) b.push(...panel(g, 'Divider', [x, 0, shelfZ(r) + T], cube, D, 'y', { lengthAxis: 'z', reverse: true }))
    if (r < rows - 1) b.push(...panel(g, 'Shelf board', [OVER + T, 0, shelfZ(r + 1)], inner, D, 'y', { lengthAxis: 'x', reverse: true }))
  }
  b.push(...panel('top', 'Top board', [0, 0, H - T], Cw + 2 * OVER, D, 'y', { lengthAxis: 'x', reverse: true, bands: true }))
  b.push(box('top', 'Wall strap', [L.W / 2 - 15, -3, H - T - 60], [30, 3, 40], { mat: 'steel' }))

  // Styling: books, baskets and plants dotted through the cubes
  let s = 11
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280)
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x0 = OVER + T + c * (cube + T)
      const z0 = shelfZ(r) + T
      const kind = Math.floor(rnd() * 5)
      const p = { mat: 'prop' }
      if (kind === 0 || kind === 1) {
        let x = x0 + 15
        const stop = x0 + cube * (0.6 + rnd() * 0.35)
        while (x < stop) {
          const w = 22 + rnd() * 22
          b.push(box('props', 'Book', [x, D - 180 - 15, z0], [w, Math.min(D - 30, 170), Math.min(cube - 30, 180 + rnd() * 90)], { ...p, color: PROP_COLOURS.book[Math.floor(rnd() * 7)] }))
          x += w + 1
        }
      } else if (kind === 2) {
        b.push(box('props', 'Basket', [x0 + 20, 20, z0], [cube - 40, D - 30, Math.min(cube - 50, 230)], { ...p, color: PROP_COLOURS.basket }))
      } else if (kind === 3 && cube > 280) {
        b.push(...plant(x0 + cube / 2 - 55, D / 2 - 55, z0, Math.min(110, (cube - 60) / 2)))
      } else if (kind === 4) {
        for (let k = 0; k < 3; k++) b.push(box('props', 'Book', [x0 + 30 + k * 4, D - 205 + k * 3, z0 + k * 32], [cube - 90 - k * 10, 190 - k * 6, 32], { ...p, color: PROP_COLOURS.book[Math.floor(rnd() * 7)] }))
      }
    }
  }
  b.push(...plant(L.W * 0.68, D / 2 - 70, H, 140))
  b.push(box('props', 'Frame', [L.W * 0.15, 20, H], [300, 25, 380], { mat: 'prop', color: [30, 15, 20] }))
  b.push(box('props', 'Picture', [L.W * 0.15 + 25, 45, H + 25], [250, 2, 330], { mat: 'prop', color: [35, 30, 88] }))

  return { boxes: b, L }
}

// Rows lift apart progressively; covers the maximum of 6 rows
const explode = { sides: [0, 0, 0], base: [0, 0, -120], top: [0, 0, 1000], props: [0, 0, 3000] }
for (let r = 1; r <= 6; r++) explode[`row${r}`] = [0, 0, r * 140]

function steps(d, { L }) {
  const { cols, rows, cube, D, Cw, H, inner } = L
  const nd = panelBoards(D).length
  const out = [
    {
      title: 'Bring the boards indoors and pick your best',
      body: ['Stack the boards flat indoors with spacers between them for 1 to 2 weeks.', 'Pick the flattest boards for the long shelves and the best-looking one for the top. Twisted boards make the grid wonky.'],
      why: 'A grid shows every error. Flat, dry boards give square cubes.',
      check: 'Boards have been indoors a week and the shelf boards are marked.',
      scene: { prep: 'default' },
    },
    {
      title: 'Take out every nail and staple',
      body: ['Pull or punch every nail. Check the board ends especially: that’s where the dividers come from.'],
      why: 'A nail in a short divider will wreck your blade.',
      check: 'A magnet finds nothing along any cut line.',
      scene: { prep: 'denail' },
    },
    {
      title: 'Scrub and dry',
      body: ['Wire brush and warm soapy water along the grain. Dry on edge for 2 days.'],
      why: 'Clean boards sand faster.',
      check: 'Fully dry.',
      scene: { prep: 'clean' },
    },
    {
      title: 'Cut everything to length',
      body: [
        `Two sides at ${mm(H - T)}. ${rows} long shelves (including the base) at ${mm(inner)}. One top at ${mm(Cw + 2 * OVER)}.`,
        `${rows * (cols - 1) * nd} dividers at exactly ${mm(cube)}. Cut these with a stop block clamped to your saw bench so every one is identical.`,
      ],
      why: 'The dividers set the size of every cube. If they’re all identical, the grid comes out square.',
      check: 'Stand all the dividers in a row on a flat surface. Their tops line up perfectly.',
      fix: 'A mitre saw makes this much easier.',
      scene: { prep: 'cut' },
    },
    {
      title: 'Rip the kick board',
      body: [`Rip one board to ${KICK}mm wide for the kick board under the base.`, D % 225 ? `Your ${mm(D)} depth also means ripping the shelf, side and divider boards. Rip them all at one fence setting.` : 'Everything else uses full-width boards: no more ripping.'],
      why: 'A recessed kick board makes the unit look like it floats, and hides uneven floors.',
      check: 'Ripped edge is straight.',
      scene: { prep: 'rip' },
    },
    {
      title: 'Rough-sand everything at 80 grit',
      body: ['Sand every face at 80 grit now. Inside a finished cube there’s no room for a sander.', 'Do the 120 grit pass now too on faces that will end up inside the cubes.'],
      why: 'Sixteen cubes have sixty-four inside faces. Sanding them flat on the bench is far quicker.',
      check: 'No grey left on any face.',
      scene: { prep: 'sand' },
    },
    {
      title: 'Drill pocket holes in the dividers',
      body: ['Set your pocket-hole jig for 38mm stock. Drill two pocket holes in the bottom end of each divider, on the face that will be hidden (inside a cube, facing the side you’ll see least).'],
      why: 'Pocket holes let you screw the divider down to the shelf below at an angle, where a straight screw can’t reach.',
      check: 'Every divider has two pocket holes at the same end.',
      fix: 'Pocket-hole jig, 63mm coarse pocket screws.',
      scene: { joint: 'pocket' },
    },
    {
      title: 'Build the base and kick board',
      body: [`Glue and screw the kick board under the front edge of the base, set back 20mm. Lay the base on a flat floor.`],
      why: 'Everything stacks up from here, so it must be flat.',
      check: 'Base doesn’t rock on the floor.',
      fix: '4.0 × 60mm screws, glue.',
      scene: { adds: ['base'] },
    },
    {
      title: 'Fit the sides',
      body: [`Stand the two side boards against the ends of the base, flush at the bottom. Glue the ends and drive two 5.0 × 80mm screws through each side into the base.`, 'Get a helper to hold the sides upright.'],
      why: 'The sides are the frame that keeps the stack of rows straight.',
      check: 'Sides are upright on a spirit level.',
      fix: '5.0 × 80mm screws, glue.',
      joint: 'butt',
      scene: { adds: ['sides'], move: { sides: [0, 0, 0] } },
    },
  ]
  for (let r = 0; r < rows; r++) {
    const last = r === rows - 1
    out.push({
      title: `Row ${r + 1}: dividers${last ? '' : ' and shelf'}`,
      body: [
        `Cut a spacer block exactly ${mm(cube)} long from an offcut. Use it to place each divider: spacer against the side, divider against the spacer, and so on across.`,
        'Glue the bottom of each divider and drive its pocket screws into the shelf below.',
        last ? 'This is the top row: the top board goes on next.' : `Lay the next shelf (${mm(inner)}) on top. Screw down through it into each divider, and through the sides into its ends.`,
      ],
      why: 'The spacer does the measuring for you, so every cube comes out the same size.',
      check: `Every opening in this row measures ${mm(cube)} wide at the front and back.`,
      fix: '63mm pocket screws, 5.0 × 80mm screws, glue.',
      joint: r === 0 ? 'spacer' : undefined,
      scene: { adds: [`row${r + 1}`], move: { [`row${r + 1}`]: [0, 0, 160] } },
    })
  }
  out.push(
    {
      title: 'Fit the top',
      body: [`Lay the top board on, overhanging ${OVER}mm each side and flush at the back. Screw down into the sides and every divider below, in a neat line.`],
      why: 'A slightly overhanging top looks chunkier and more finished than one cut flush.',
      check: 'Overhang equal both sides. Diagonals of the front face match within 3mm.',
      fix: '5.0 × 80mm black screws.',
      joint: 'topdown',
      scene: { adds: ['top'], move: { top: [0, 0, 220] } },
    },
    {
      title: 'Final sand and finish',
      body: ['Sand outside faces and edges at 120 then 180. Soften every front edge by hand: these are what you see.', 'Apply your chosen finish. See the Finish tab.'],
      why: 'Rounded front edges catch the light and make the grid look crafted, not knocked up.',
      check: 'Finish dry, no sticky patches inside the cubes.',
      scene: { prep: 'oil' },
    },
    {
      title: 'Stand it up and fix it to the wall',
      body: ['Walk it upright with a helper. Place it against a wall away from fire escape routes.', 'Fix the anti-tip straps from the back of the top into the wall. Fill it bottom-up, heaviest things lowest.'],
      why: `A ${mm(H)} grid full of books is top-heavy if pulled. The straps stop that.`,
      check: 'Straps tight, unit doesn’t move when you tug the top.',
      fix: 'Anti-tip strap kit.',
      joint: 'antitip',
      scene: { adds: ['props'] },
    },
  )
  return out
}

export default {
  id: 'cubes',
  name: 'The Cube Shelf',
  short: 'Cube shelf',
  tagline: 'A chunky 4 × 4 grid of scaffold-board cubes.',
  intro:
    'A statement storage wall: sixteen square cubes made entirely from scaffold boards, with an overhanging top and a floating kick-board base. Perfect for books, baskets and plants, or as a room divider. Every board is a full 225mm wide, so there’s almost no ripping.',
  seed: 17,
  difficulty: 'Moderate',
  level: 2,
  time: '2–3 weekends',
  defaults: { columns: 4, rows: 4, cube: 330, depth: 225 },
  limits: { columns: [2, 6], rows: [2, 6], cube: [250, 400], depth: [225, 450] },
  dimMeta: { columns: { label: 'Columns', unit: '' }, rows: { label: 'Rows', unit: '' }, cube: { label: 'Cube opening', unit: 'mm' }, depth: { label: 'Depth', unit: 'mm' } },
  size: (d) => {
    const L = layout(d)
    return { width: L.W, depth: d.depth, height: L.H }
  },
  features: ['A square grid of cubes, 4 × 4 as standard', 'All timber, full-width boards', 'Overhanging banded top', 'Recessed kick board so it seems to float'],
  model,
  explode,
  steps,
  orthoDims: (d) => {
    const L = layout(d)
    return { front: [{ axis: 'u', from: OVER + T, to: OVER + T + d.cube, level: 1, label: `${d.cube}` }], side: [], top: [] }
  },
  fixings: (d, { L }) => {
    const levels = L.rows + 1
    return {
      screw80: 2 * 2 * levels + (L.cols - 1) * L.rows * 2 + 8,
      screw60: 6,
      pocket: L.rows * (L.cols - 1) * 2 * panelBoards(d.depth).length,
      glue: 250 + L.rows * L.cols * 15,
      antitip: 1,
    }
  },
  tools: {
    must: ['tape', 'square', 'pencil', 'circsaw', 'drill', 'bits', 'pocket', 'clamps', 'sander', 'denail', 'brush', 'level', 'trestles', 'ppe', 'detector'],
    nice: ['mitre', 'impact', 'nailfinder', 'barclamps'],
  },
  joints: [
    { kind: 'pocket', title: 'Divider pocket screws', text: 'Two angled pocket screws hold the bottom of each divider to the shelf below. Hidden inside the cube.' },
    { kind: 'spacer', title: 'Spacer block', text: 'An offcut cut to exactly the cube size places each divider. No measuring, no drift.' },
    { kind: 'topdown', title: 'Shelf over divider', text: 'Straight screws down through the shelf into the divider below.' },
    { kind: 'antitip', title: 'Anti-tip strap', text: 'Straps from the top into solid wall.' },
  ],
  finish: [
    'The dark “antique” look in the reference photos is a tinted oil or stain, then a clear hard-wax oil. Pick a look on the Overview tab and the shopping list adds the right tin.',
    'Stain before assembly if you can: it’s very hard to get an even colour inside the corners of a cube.',
    'Rub the front edges lightly with 240 grit after staining. The worn, lighter edges give that aged, handled look.',
  ],
  safety: [
    { title: 'Load', text: 'Each cube holds about 15kg (a full row of paperbacks). The grid shares load well, but keep heavy things in the bottom row.' },
    { title: 'Anti-tip is essential', text: 'This is a tall, heavy unit. Always strap it to the wall. Never let children climb it.' },
    { title: 'As a room divider', text: 'If it stands away from a wall, fix it to the floor with angle brackets, or keep it no taller than 2 rows.' },
  ],
  images: [
    { file: 'hero.jpg', title: 'Finished cube shelf in the mill', prompt: 'Photorealistic interior photo of a 4 by 4 cube shelving unit made entirely from reclaimed scaffold boards, 38mm thick boards forming a square grid of 16 cubes, overhanging top with galvanised steel end bands, rich dark antique walnut stain with lighter worn edges, filled with books, wicker baskets and trailing plants, standing against a limewashed brick wall in a converted English mill, timber beams, soft daylight, 35mm lens' },
    { file: 'detail-grid.jpg', joint: 'pocket', title: 'Grid joint close-up', prompt: 'Close-up photo of the corner where reclaimed scaffold board shelves and dividers meet in a cube bookcase, dark stained wood with lighter worn edges, visible saw marks and nail holes, warm side light, shallow depth of field' },
    { file: 'in-situ.jpg', title: 'Cube shelf as a room divider', prompt: 'Wide interior photo of a converted mill common area with a rustic scaffold-board cube shelving unit against a wall, books and plants in the cubes, clear walkway, cast-iron columns, natural light' },
  ],
}
