import { box, resetTones, BOARD_T as T, BOARD_W as BW, FRAME_T as FT, FRAME_W as FW } from '../lib/geometry.js'

// Small stand-alone scenes for preparation steps and joint close-ups.
const TRESTLE = [210, 14, 42]
const STEEL = { mat: 'steel' }
const WALL = [36, 18, 84]

function trestles(len) {
  const out = []
  for (const x of [len * 0.15, len * 0.75]) {
    out.push(box('trestle', 'Sawhorse', [x, -60, 0], [60, 345, 60], { mat: 'prop', color: TRESTLE }))
    out.push(box('trestle', 'Sawhorse', [x, -60, 60], [60, 60, 560], { mat: 'prop', color: TRESTLE }))
    out.push(box('trestle', 'Sawhorse', [x, 225, 60], [60, 60, 560], { mat: 'prop', color: TRESTLE }))
    out.push(box('trestle', 'Sawhorse', [x - 20, -60, 620], [100, 345, 50], { mat: 'prop', color: TRESTLE }))
  }
  return out
}

export function prepScene(kind) {
  resetTones(11)
  const L = 1500
  const z = 670
  const board = (opts = {}) => box('board', 'Board', [0, 0, z], [L, BW, T], { bands: true, tone: 0.7, ...opts })
  switch (kind) {
    case 'denail':
      return {
        boxes: [...trestles(L), board()],
        annotations: [
          { type: 'label', at: [260, 70, z + T], text: 'Old nail: pull it', dx: -1, dy: -1.3 },
          { type: 'label', at: [900, 150, z + T], text: 'Snapped nail: punch it deep', dx: 0.6, dy: -1.5 },
          { type: 'label', at: [L - 55, 110, z + T], text: 'Steel band: keep or remove', dx: 0.3, dy: 1.4 },
        ],
      }
    case 'clean':
      return {
        boxes: [...trestles(L), board(), box('tool', 'Brush', [600, 60, z + T], [260, 70, 40], { mat: 'prop', color: [20, 55, 40] })],
        annotations: [{ type: 'arrow', from: [500, 95, z + T + 60], to: [1000, 95, z + T + 60], label: 'Scrub along the grain' }],
      }
    case 'cut':
      return {
        boxes: [...trestles(L), board()],
        annotations: [
          { type: 'cut', from: [30, 0, z + T], to: [30, BW, z + T], label: 'Trim 30mm', dx: -1, dy: -1.3 },
          { type: 'cut', from: [1100, 0, z + T], to: [1100, BW, z + T], label: 'Cut to length', dx: 0.5, dy: -1.6 },
          { type: 'dim', from: [30, 0, z + T], to: [1100, 0, z + T], offset: [0, -90, 0], label: 'Measure from the trimmed end' },
        ],
      }
    case 'rip':
      return {
        boxes: [...trestles(L), board()],
        annotations: [
          { type: 'cut', from: [0, 150, z + T], to: [L, 150, z + T], label: 'Rip line', dx: 0.6, dy: -1.5 },
          { type: 'arrow', from: [L * 0.2, 260, z + T], to: [L * 0.6, 260, z + T], label: 'Saw against a guide', dx: 0.4, dy: 1.4 },
        ],
      }
    case 'glue': {
      const bs = [0, 1, 2].map((i) => box('board', 'Board', [0, i * BW, 0], [1100, BW, T], { tone: 0.3 + i * 0.25 }))
      const clamps = [200, 880].map((x) => box('clamp', 'Clamp', [x, -40, -20], [30, 3 * BW + 80, 20], STEEL))
      return {
        boxes: [...bs, ...clamps],
        annotations: [
          { type: 'label', at: [550, BW, T], text: 'Thin line of glue on each edge', dx: 0.8, dy: -1.5 },
          { type: 'arrow', from: [550, -200, T], to: [550, -20, T], label: 'Clamp', dx: -1, dy: -0.8 },
        ],
      }
    }
    case 'sand':
      return {
        boxes: [...trestles(L), board({ bands: false }), box('tool', 'Sander', [700, 50, z + T], [150, 125, 110], { mat: 'prop', color: [24, 70, 45] })],
        annotations: [{ type: 'arrow', from: [500, 110, z + T + 140], to: [1200, 110, z + T + 140], label: '80 → 120 → 180 grit' }],
      }
    case 'oil':
      return {
        boxes: [...trestles(L), box('board', 'Board', [0, 0, z], [L, BW, T], { tone: 0.95 })],
        annotations: [{ type: 'label', at: [700, 110, z + T], text: 'Thin coat, wipe off excess', dx: 0.5, dy: -1.5 }],
      }
    default:
      return { boxes: [...trestles(L), board()], annotations: [] }
  }
}

export function jointScene(kind) {
  resetTones(23)
  switch (kind) {
    case 'butt':
      // side board standing, base board butting into it, screws through the side
      return {
        boxes: [
          box('side', 'Side', [0, 0, 0], [T, BW, 420]),
          box('base', 'Base', [T, 0, 0], [380, BW, T]),
        ],
        annotations: [
          { type: 'screw', at: [0, 60, T / 2], dir: [1, 0, 0], len: 80, label: '5.0 × 80mm screw', dx: -1, dy: 0.6 },
          { type: 'screw', at: [0, 165, T / 2], dir: [1, 0, 0], len: 80 },
          { type: 'label', at: [T, BW, T], text: 'Glue on the end', dx: 1, dy: -1.2 },
        ],
      }
    case 'topdown':
      return {
        boxes: [
          box('side', 'Side', [0, 0, 0], [T, BW, 360]),
          box('top', 'Top', [0, 0, 360], [420, BW, T], { bands: true }),
        ],
        annotations: [
          { type: 'screw', at: [T / 2, 60, 360 + T], dir: [0, 0, -1], len: 80, label: 'Pre-drill 3mm, countersink', dx: 1, dy: -1.2 },
          { type: 'screw', at: [T / 2, 165, 360 + T], dir: [0, 0, -1], len: 80 },
        ],
      }
    case 'cleat':
      return {
        boxes: [
          box('side', 'Side', [0, 0, 0], [T, BW, 420]),
          box('cleat', 'Cleat', [T, 20, 160], [T, BW - 40, 75]),
          box('shelf', 'Shelf', [T, 0, 235], [360, BW, T]),
        ],
        annotations: [
          { type: 'screw', at: [T * 2, 70, 197], dir: [-1, 0, 0], len: 60, label: '4.0 × 60mm into the side', dx: 1, dy: 0.9 },
          { type: 'label', at: [200, BW, 235 + T], text: 'Shelf sits on the cleat', dx: 0.7, dy: -1.3 },
        ],
      }
    case 'ledge':
      return {
        boxes: [
          box('side', 'Carcass side', [-42, 40 - 200, 0], [T, 200 + T, 560]),
          ...[0, 1, 2].map((i) => box('door', 'Door board', [i * BW, 40, 0], [BW, T, 520], { tone: 0.2 + i * 0.3 })),
          box('ledge', 'Ledge', [40, 40 - FT, 60], [3 * BW - 80, FT, FW], { mat: 'frame' }),
          box('hinge', 'T-hinge', [-30, 40 + T, 90], [300, 3, 22], STEEL),
          box('hinge', 'T-hinge', [-34, 40 + T, 60], [30, 3, 90], STEEL),
        ],
        annotations: [
          { type: 'screw', at: [120, 40 + T, 100], dir: [0, -1, 0], len: 60, label: 'Hinge screws into the ledge', dx: 1, dy: 1 },
          { type: 'label', at: [3 * BW - 60, 40 - FT, 160], text: 'Ledge glued + screwed behind', dx: 0.6, dy: -1.3 },
        ],
      }
    case 'lamleg':
      return {
        boxes: [box('leg', 'Leg', [0, 0, 0], [FT, FW, 500], { mat: 'frame' }), box('leg', 'Leg', [FT + 140, 0, 0], [FT, FW, 500], { mat: 'frame' })],
        annotations: [
          { type: 'arrow', from: [FT + 140, 50, 300], to: [FT + 10, 50, 300], label: 'Glue whole face', dx: 0.8, dy: -1.2 },
          { type: 'screw', at: [FT + 140 + FT, 50, 100], dir: [-1, 0, 0], len: 80, label: '5.0 × 80mm every 200mm', dx: 1, dy: 0.8 },
        ],
      }
    case 'railleg':
      return {
        boxes: [
          box('leg', 'Leg', [0, 0, 0], [FT, FW, 520], { mat: 'frame' }),
          box('leg', 'Leg', [FT, 0, 0], [FT, FW, 520], { mat: 'frame' }),
          box('rail', 'Rail', [2 * FT, FW - FT, 420], [380, FT, FW], { mat: 'frame' }),
          box('rail', 'Side rail', [0, FW, 420], [FT, 300, FW], { mat: 'frame' }),
        ],
        annotations: [
          { type: 'screw', at: [2 * FT + 30, FW, 445], dir: [-1, 0, 0], len: 80, label: 'Pocket screw or angled screw', dx: 1, dy: -1.2 },
          { type: 'screw', at: [FT / 2, FW + 300, 470], dir: [0, -1, 0], len: 80, label: 'Into the leg', dx: -1, dy: 1 },
        ],
      }
    case 'shelfrail':
      return {
        boxes: [
          box('up', 'Upright', [0, 0, 0], [FT, FW, 520], { mat: 'frame' }),
          box('up', 'Upright', [0, 300 - FW, 0], [FT, FW, 520], { mat: 'frame' }),
          box('rail', 'Rail', [FT, 0, 250], [FT, 300, FW], { mat: 'frame' }),
          box('shelf', 'Shelf', [FT, 0, 350], [420, 300, T]),
        ],
        annotations: [
          { type: 'screw', at: [FT * 2, 60, 300], dir: [-1, 0, 0], len: 80, label: '2 screws into each upright', dx: 1, dy: 1.1 },
          { type: 'screw', at: [FT * 1.5, 150, 350 + T], dir: [0, 0, -1], len: 80, label: 'Screw down into rail', dx: 1, dy: -1.3 },
        ],
      }
    case 'antitip':
      return {
        boxes: [
          box('wall', 'Wall', [-40, -60, 0], [520, 60, 520], { mat: 'prop', color: WALL }),
          box('up', 'Upright', [0, 25, 0], [FT, FW, 460], { mat: 'frame' }),
          box('apron', 'Back apron', [FT, 25, 360], [380, T, FW]),
          box('strap', 'Strap', [200, -2, 420], [30, 66, 3], STEEL),
        ],
        annotations: [
          { type: 'label', at: [215, 0, 423], text: 'Strap into a stud or solid wall', dx: 0.7, dy: -1.3 },
          { type: 'label', at: [60, 25, 300], text: '25mm gap for skirting', dx: -1, dy: 0.8 },
        ],
      }
    case 'bracket':
      return {
        boxes: [
          box('apron', 'Apron', [0, 0, 0], [420, FT, FW], { mat: 'frame' }),
          box('top', 'Top', [-40, -60, FW], [500, BW, T], { bands: true }),
          box('br', 'Bracket', [180, FT, FW - 50], [20, 3, 50], STEEL),
          box('br', 'Bracket', [180, FT, FW - 3], [20, 50, 3], STEEL),
        ],
        annotations: [{ type: 'label', at: [190, FT + 40, FW - 3], text: 'Bracket: 4.0 × 30mm screws, no glue', dx: 1, dy: 1 }],
      }
    case 'pocket':
      return {
        boxes: [
          box('shelf', 'Shelf', [0, 0, 0], [460, BW, T]),
          box('div', 'Divider', [180, 0, T], [T, BW, 330]),
        ],
        annotations: [
          { type: 'screw', at: [180, 70, T + 40], dir: [0.55, 0, -0.84], len: 63, label: 'Pocket screw at an angle', dx: -1, dy: -1 },
          { type: 'screw', at: [180, 160, T + 40], dir: [0.55, 0, -0.84], len: 63 },
          { type: 'label', at: [180 + T, BW, T + 330], text: 'Shelf above screws straight down', dx: 0.8, dy: -1 },
        ],
      }
    case 'spacer':
      return {
        boxes: [
          box('shelf', 'Shelf', [0, 0, 0], [760, BW, T]),
          box('side', 'Side', [-T, 0, 0], [T, BW, 380]),
          box('div', 'Divider', [330, 0, T], [T, BW, 330]),
          box('spacer', 'Spacer', [0, 60, T], [330, 70, 38], { mat: 'prop', color: [205, 30, 55] }),
        ],
        annotations: [
          { type: 'label', at: [165, 130, T + 38], text: 'Spacer = exact cube size', dx: 0.6, dy: -1.6 },
          { type: 'arrow', from: [520, 110, T + 150], to: [380, 110, T + 150], label: 'Divider butts against it', dx: 0.4, dy: -1.2 },
        ],
      }
    case 'key': {
      // seen from the outside end so the tenon and key face the viewer
      const r = 380
      return {
        boxes: [
          box('str', 'Stretcher', [0, 103, 0], [r, 2 * FT, FW], { mat: 'frame' }),
          box('rail', 'Foot rail', [r, 0, 0], [2 * FT, 300, FW], { mat: 'frame' }),
          box('ten', 'Tenon', [r + 2 * FT, 110, 15], [22, 80, 70], { mat: 'frame', tone: 0.8 }),
          box('key', 'Key', [r + 2 * FT + 22, 138, -5], [16, 24, 110], { mat: 'frame', tone: 0.2 }),
          box('ten', 'Tenon', [r + 2 * FT + 38, 110, 15], [22, 80, 70], { mat: 'frame', tone: 0.8 }),
        ],
        annotations: [
          { type: 'screw', at: [r + 2 * FT, 250, 50], dir: [-1, 0, 0], len: 150, label: '2 × 6.0 × 150mm screws', dx: 1, dy: 1.3 },
          { type: 'label', at: [r + 2 * FT + 30, 150, 105], text: 'Glued key', dx: 1, dy: -1.3 },
          { type: 'label', at: [r + 2 * FT + 60, 160, 50], text: 'Tenon block hides the screws', dx: 1, dy: 0.2 },
        ],
      }
    }
    case 'breadboard':
      return {
        boxes: [
          box('top', 'Top board', [0, 0, 0], [420, BW, T]),
          box('top', 'Top board', [0, BW, 0], [420, BW, T]),
          box('cap', 'Breadboard end', [-100, 0, 0], [100, 2 * BW, T], { tone: 0.85 }),
        ],
        annotations: [
          { type: 'screw', at: [60, 110, 0], dir: [-0.84, 0, 0.55], len: 63, label: 'Pocket screws from below', dx: 1, dy: 1.2 },
          { type: 'label', at: [-50, BW, T], text: 'Glue middle 300mm only', dx: -0.4, dy: -1.6 },
        ],
      }
    case 'wallbracket':
      return {
        boxes: [
          box('wall', 'Wall', [-60, -40, -260], [520, 40, 420], { mat: 'prop', color: [20, 25, 78] }),
          box('br', 'Bracket', [85, 0, -200], [30, 6, 200], { mat: 'steel' }),
          box('br', 'Bracket', [85, 6, -6], [30, 190, 6], { mat: 'steel' }),
          box('br', 'Bracket', [96, 6, -180], [8, 150, 8], { mat: 'steel' }),
          box('shelf', 'Shelf', [0, 0, 0], [400, BW, T], { bands: true }),
        ],
        annotations: [
          { type: 'screw', at: [100, 6, -60], dir: [0, -1, 0], len: 70, label: 'Brown plug + 5.0 × 70mm', dx: 1, dy: 1.2 },
          { type: 'screw', at: [100, 120, -6], dir: [0, 0, 1], len: 30, label: '4.0 × 30mm up into shelf', dx: 1, dy: 0.4 },
        ],
      }
    case 'corner':
      return {
        boxes: [
          box('post', 'Corner post', [T, T, 0], [FT, FW, 450], { mat: 'frame' }),
          box('side', 'Long side', [0, 0, 0], [420, T, 225]),
          box('side', 'Long side', [0, 0, 225], [420, T, 225], { tone: 0.3 }),
          box('end', 'End board', [0, T, 0], [T, 300, 225], { tone: 0.6 }),
          box('end', 'End board', [0, T, 225], [T, 300, 225], { tone: 0.1 }),
        ],
        annotations: [
          { type: 'label', at: [T + FT / 2, T + FW / 2, 450], text: 'Hidden 47 × 100 post', dx: 1, dy: -1.2 },
          { type: 'screw', at: [T, 200, 110], dir: [-1, 0, 0], len: 60, label: 'Screw from inside into each board', dx: 1, dy: 1 },
        ],
      }
    case 'plinth':
      return {
        boxes: [
          box('pl', 'Plinth cross rail', [0, 0, 0], [FT, 300, FW], { mat: 'frame' }),
          box('pl', 'Plinth rail', [0, 300, 0], [420, FT, FW], { mat: 'frame' }),
        ],
        annotations: [
          { type: 'screw', at: [FT / 2, 300 + FT, 30], dir: [0, -1, 0], len: 80, label: '2 × 5.0 × 80mm + glue', dx: -1, dy: 0.8 },
          { type: 'screw', at: [FT / 2, 300 + FT, 70], dir: [0, -1, 0], len: 80 },
        ],
      }
    default:
      return { boxes: [], annotations: [] }
  }
}
