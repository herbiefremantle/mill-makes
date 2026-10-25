import { cutList, surfaceArea, weight, resetTones } from './geometry.js'
import { planCuts } from './cutting.js'
import { PRICES } from '../data/common.js'

// How far one tin goes, in m² of wood per coat (rough reclaimed boards drink more than the label says)
const COVERAGE = { polyx: 14, topoil: 9 }
const COATS = { polyx: 2, topoil: 3 }

function item(key, extra = {}) {
  const p = PRICES[key]
  return { key, ...p, ...extra }
}

/** Builds everything a guide needs from a project definition and the chosen dimensions. */
export function computeProject(project, dims, stockKey = 'mixed', look = 'natural') {
  resetTones(project.seed || 7)
  const model = project.model(dims)
  const parts = cutList(model.boxes)
  const plan = planCuts(parts, stockKey)
  const area = surfaceArea(model.boxes)
  const shopping = buildShopping(project, dims, model, plan, area, look)
  const lo = shopping.reduce((s, i) => s + i.qty * i.lo, 0)
  const hi = shopping.reduce((s, i) => s + i.qty * i.hi, 0)
  return {
    model,
    parts,
    plan,
    area,
    weight: weight(model.boxes),
    shopping,
    cost: { lo, hi },
    steps: sequenceSteps(project.steps(dims, model)),
  }
}

/** Each build step shows everything added so far, with the new parts highlighted. */
function sequenceSteps(steps) {
  const shown = []
  return steps.map((st, i) => {
    const scene = { ...st.scene }
    if (scene.adds) {
      scene.show = [...shown, ...scene.adds]
      scene.focus = scene.adds.includes('props') ? null : scene.adds
      shown.push(...scene.adds)
    }
    return { ...st, n: i + 1, scene }
  })
}

function buildShopping(project, dims, model, plan, area, look) {
  const out = []
  const c = plan.counts
  const timber = [
    ['board3900', c.board3900],
    ['board2400', c.board2400],
    ['frame4800', c.frame4800],
    ['frame3600', c.frame3600],
    ['frame2400', c.frame2400],
  ]
  for (const [key, qty] of timber) if (qty) out.push(item(key, { qty, units: qty, pack: 1 }))

  const fx = project.fixings(dims, model)
  for (const [key, units] of Object.entries(fx)) {
    if (!units) continue
    const p = PRICES[key]
    if (p.pack) out.push(item(key, { units, qty: Math.ceil(units / p.pack) }))
    else out.push(item(key, { units, pack: 1, qty: units }))
  }

  // Finishing: worked out from surface area
  const topArea = project.topArea ? project.topArea(dims) : 0
  const polyxArea = Math.max(0, area - topArea)
  // Coloured looks: one coat of tinted oil first, clear hard-wax oil on top
  const stainKey = look === 'antique' ? 'stainAntique' : look === 'weathered' ? 'stainWeathered' : null
  if (stainKey) out.push(item(stainKey, { units: area, pack: COVERAGE.polyx, qty: Math.max(1, Math.ceil(area / COVERAGE.polyx)) }))
  out.push(item('discs', { units: Math.ceil(area * 3), qty: Math.ceil((area * 3) / PRICES.discs.pack) }))
  out.push(item('polyx', { units: polyxArea * COATS.polyx, pack: COVERAGE.polyx, qty: Math.max(1, Math.ceil((polyxArea * COATS.polyx) / COVERAGE.polyx)) }))
  if (topArea) out.push(item('topoil', { units: topArea * COATS.topoil, pack: COVERAGE.topoil, qty: Math.max(1, Math.ceil((topArea * COATS.topoil) / COVERAGE.topoil)) }))
  out.push(item('filler', { qty: 1, once: true }))
  out.push(item('cloths', { qty: 1, once: true }))
  return out
}

/** Combines several projects' shopping lists, sharing packs of screws, glue and oil between them. */
export function mergeShopping(lists) {
  const map = new Map()
  for (const { project, items } of lists) {
    for (const it of items) {
      if (!map.has(it.key)) map.set(it.key, { ...it, units: 0, qty: 0, from: [] })
      const m = map.get(it.key)
      m.from.push({ project, qty: it.qty })
      if (it.once) m.qty = Math.max(m.qty, it.qty)
      else if (it.units != null && it.pack) m.units += it.units
      else m.qty += it.qty
    }
  }
  for (const m of map.values()) {
    if (!m.once && m.pack && m.units) m.qty = Math.max(1, Math.ceil(m.units / m.pack - 1e-9))
  }
  const order = ['Timber', 'Fixings', 'Hardware', 'Finishing']
  return [...map.values()].sort((a, b) => order.indexOf(a.cat) - order.indexOf(b.cat))
}

/** Overall finished size for display (the cube shelf is sized by cubes, not millimetres). */
export const sizeOf = (project, dims) => (project.size ? project.size(dims) : dims)

export const money = (n) => '£' + Math.round(n).toLocaleString('en-GB')
export const range = (lo, hi) => `${money(lo)}–${money(hi)}`
