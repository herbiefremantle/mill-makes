import { box, plant, BOARD_T as T, BOARD_W as BW } from '../lib/geometry.js'
import { prepSteps, finishStep, mm } from './prep.js'

const Z0 = 1000 // top of the lowest shelf above the floor
const DROP = 200 // bracket height below the shelf

function layout(d) {
  const W = d.width, n = d.shelves, gap = d.gap
  const levels = Array.from({ length: n }, (_, i) => Z0 - T + i * (gap + T)) // underside of each shelf
  const perShelf = W > 1200 ? 3 : 2
  const bx = perShelf === 3 ? [150, W / 2, W - 150] : [Math.min(150, W * 0.18), W - Math.min(150, W * 0.18)]
  return { W, n, gap, levels, bx, perShelf }
}

function model(d) {
  const L = layout(d)
  const { W, levels, bx } = L
  const b = []
  const top = levels.at(-1) + T
  b.push(box('wall', 'Wall', [-300, -40, Z0 - DROP - 300], [W + 600, 40, top - Z0 + DROP + 600], { mat: 'prop', color: [36, 24, 86], tone: 0.5 }))
  levels.forEach((z, i) => {
    for (const x of bx) {
      b.push(box('brackets', 'Bracket', [x - 15, 0, z - DROP], [30, 6, DROP], { mat: 'steel' }))
      b.push(box('brackets', 'Bracket', [x - 15, 6, z - 6], [30, 190, 6], { mat: 'steel' }))
      b.push(box('brackets', 'Bracket', [x - 4, 6, z - DROP + 20], [8, 150, 8], { mat: 'steel' }))
    }
    b.push(box('shelf', 'Shelf board', [0, 0, z], [W, BW, T], { bands: true }))
  })
  // Styling
  let s = 3
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280)
  const p = { mat: 'prop', tone: 0.5 }
  const BOOK = [[8, 45, 34], [200, 30, 30], [40, 55, 45], [150, 18, 38], [30, 20, 82]]
  levels.forEach((z, i) => {
    const zt = z + T
    if (i % 3 === 0) {
      let x = 40
      while (x < W * 0.45) {
        const w = 24 + rnd() * 20
        b.push(box('props', 'Book', [x, 30, zt], [w, 170, Math.min(L.gap - 30, 190 + rnd() * 70)], { ...p, color: BOOK[Math.floor(rnd() * 5)] }))
        x += w + 1
      }
      b.push(...plant(W * 0.7, 50, zt, 110))
    } else if (i % 3 === 1) {
      for (let k = 0; k < 3; k++) b.push(box('props', 'Jar', [W * 0.15 + k * 150, 60, zt], [100, 100, 150 + k * 20], { ...p, color: [38, 30, 80] }))
      b.push(box('props', 'Frame', [W * 0.65, 20, zt], [260, 25, 320], { ...p, color: [30, 15, 20] }))
      b.push(box('props', 'Picture', [W * 0.65 + 25, 45, zt + 25], [210, 2, 270], { ...p, color: [200, 20, 80] }))
    } else {
      b.push(...plant(W * 0.2, 50, zt, 120))
      b.push(box('props', 'Bowl', [W * 0.55, 40, zt], [220, 150, 70], { ...p, color: [25, 30, 70] }))
    }
  })
  return { boxes: b, L }
}

function steps(d, { L }) {
  const { W, n, gap, perShelf } = L
  return [
    ...prepSteps({
      pick: 'the shelves (keep the banded ends: they look great on show)',
      cut: [`${n} shelf ${n > 1 ? 'boards' : 'board'} at ${mm(W)}. Cut both ends square: they’re on show.`],
      rip: null,
      sand: 'Round over the front edge and both ends more than usual: these are what you see and touch.',
    }),
    finishStep('Two coats of hard-wax oil on every face, including the underside: unfinished undersides can make boards cup.'),
    {
      title: 'Check the wall and choose fixings',
      body: [
        'Scan the wall with a cable and pipe detector where the brackets will go. Never drill directly above or below a socket or switch.',
        'Old mill walls are usually solid brick: use brown plugs and 5.0 × 70mm screws. For a stud wall, the brackets must go into studs.',
      ],
      why: 'The fixings carry everything on the shelf. The right plug for the wall is what makes it safe.',
      check: 'Bracket positions are clear of cables and pipes.',
      joint: 'wallbracket',
      scene: { adds: ['wall'] },
    },
    {
      title: 'Mark level lines and fix the brackets',
      body: [
        `Mark the lowest shelf at about ${mm(Z0)} from the floor. Draw a level line, then a line every ${mm(gap + T)} above it for the other shelves.`,
        `Hold each bracket to its line, mark, drill and plug. ${perShelf} brackets per shelf. Check level again before tightening the last screw.`,
      ],
      why: 'A shelf that’s 2mm off level looks wonky from across the room, and things roll.',
      check: 'A level across each pair of brackets reads level.',
      fix: 'Wall plugs and 5.0 × 70mm screws.',
      scene: { adds: ['brackets'] },
    },
    {
      title: 'Fit the shelves',
      body: ['Lay each board on its brackets, pushed tight to the wall and centred. Screw up through the bracket holes into the board with 4.0 × 30mm screws.'],
      why: 'Screwing the board to the bracket stops it sliding off if knocked.',
      check: 'Each shelf is level, tight to the wall, and doesn’t lift when you push up on the front.',
      fix: '4.0 × 30mm screws.',
      scene: { adds: ['shelf'], move: { shelf: [0, 200, 0] } },
    },
    {
      title: 'Style them',
      body: ['Mix tall and short things, and leave about a third of each shelf empty. Heavy items go over the brackets, not in the middle.'],
      why: 'Space is what makes shelves look styled rather than cluttered.',
      check: 'Nothing heavy in the middle of a span.',
      scene: { adds: ['props'] },
    },
  ]
}

export default {
  id: 'shelves',
  name: 'The Wall Shelves',
  short: 'Wall shelves',
  tagline: 'Banded scaffold boards on black iron brackets.',
  intro:
    'The quickest build here and a great first project: single scaffold boards with their galvanised bands on show, sitting on black steel brackets. Perfect for a kitchen, landing or above the sideboard. One afternoon once the boards are clean.',
  seed: 41,
  difficulty: 'Easy',
  level: 1,
  time: '1 day',
  defaults: { width: 900, shelves: 3, gap: 350 },
  limits: { width: [500, 1800], shelves: [1, 5], gap: [250, 450] },
  dimMeta: { width: { label: 'Width', unit: 'mm' }, shelves: { label: 'Shelves', unit: '' }, gap: { label: 'Gap between shelves', unit: 'mm' } },
  size: (d) => ({ width: d.width, depth: BW, height: (d.shelves - 1) * (d.gap + T) + T + DROP }),
  features: ['Galvanised end bands on show', 'Black steel brackets', 'An afternoon’s build', 'Works in any room'],
  model,
  explode: { wall: [0, 0, 0], brackets: [0, 60, 0], shelf: [0, 0, 160], props: [0, 0, 600] },
  steps,
  orthoDims: () => ({ front: [], side: [], top: [] }),
  fixings: (d, { L }) => ({ shelfBracket: L.n * L.perShelf, screw30: L.n * L.perShelf * 3, wallFix: 1 }),
  tools: {
    must: ['tape', 'pencil', 'circsaw', 'drill', 'bits', 'sander', 'denail', 'brush', 'level', 'detector', 'ppe'],
    nice: ['mitre', 'square'],
  },
  joints: [{ kind: 'wallbracket', title: 'Board on bracket', text: 'Bracket plugged and screwed to the wall; shelf screwed down onto it from below.' }],
  finish: ['Oil both faces and the ends. Unfinished undersides take on moisture differently and the board can cup.'],
  safety: [
    { title: 'Load', text: 'With brackets in solid brick, each shelf holds around 20kg spread out. Put heavy things over the brackets.' },
    { title: 'Drilling', text: 'Always scan for cables and pipes first. Wear safety glasses when drilling masonry.' },
    { title: 'Common areas', text: 'Mount high enough that nobody walks into the corners: above 1000mm, or above furniture.' },
  ],
  images: [
    { file: 'hero.jpg', title: 'Wall shelves in the mill', prompt: 'Photorealistic photo of three rustic floating shelves made from single reclaimed scaffold boards with galvanised steel end bands, on black iron shelf brackets, against a limewashed brick wall in a converted English mill, styled with books, jars and trailing plants, soft daylight, 35mm lens' },
    { file: 'detail-bracket.jpg', joint: 'wallbracket', title: 'Bracket close-up', prompt: 'Close-up photo of a black iron shelf bracket under an oiled reclaimed scaffold board with a galvanised band, against a brick wall, warm side light, shallow depth of field' },
  ],
}
