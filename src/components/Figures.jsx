import { useMemo, useState } from 'react'
import IsoScene from '../iso/IsoScene.jsx'
import Ortho from '../iso/Ortho.jsx'
import { prepScene, jointScene } from '../iso/scenes.js'
import { box, bounds } from '../lib/geometry.js'

export function Figure({ children, caption, className = '', bg = 'studio' }) {
  return (
    <figure className={`rounded-2xl overflow-hidden border border-line ${bg} ${className}`}>
      {children}
      {caption && <figcaption className="px-4 py-2.5 text-xs text-muted border-t border-line/70 bg-card/70">{caption}</figcaption>}
    </figure>
  )
}

/** A limewashed brick wall and boarded floor behind the piece, like a styled product photo. */
export function roomFor(boxes) {
  const bb = bounds(boxes)
  const m = 4000
  const r = { mat: 'brick', tone: 0.5 }
  return [
    box('room', 'Floor', [bb.x0 - m, bb.y0 - 40, -12], [bb.x1 - bb.x0 + 2 * m, bb.y1 - bb.y0 + m + 40, 12], { mat: 'floor', tone: 0.5 }),
    box('room', 'Wall', [bb.x0 - m, bb.y0 - 60, 0], [bb.x1 - bb.x0 + 2 * m, 60, bb.z1 + m], r),
  ]
}

export function HeroRender({ computed, className = 'w-full h-72 sm:h-96', props = true, title, room = true }) {
  // A project's own 'wall' (used in step pictures) is replaced by the room's brick wall here
  const boxes = useMemo(() => {
    const own = computed.model.boxes.filter((b) => !(room && b.group === 'wall'))
    return room ? [...roomFor(own.filter((b) => b.group !== 'props' || props)), ...own] : own
  }, [computed, room, props])
  return <IsoScene boxes={boxes} hide={props ? [] : ['props']} className={className} title={title} pad={0.07} />
}

export function ExplodedView({ project, computed }) {
  const [amount, setAmount] = useState(1)
  return (
    <Figure caption="Exploded assembly view: drag the slider to pull it apart and put it back together.">
      <IsoScene boxes={computed.model.boxes} hide={['props']} explode={amount} explodeMap={project.explode} className="w-full h-80 sm:h-[26rem]" title="Exploded assembly" pad={0.04} />
      <div className="px-4 pb-4 flex items-center gap-3 no-print">
        <span className="text-xs text-muted w-16">Together</span>
        <input type="range" min="0" max="1" step="0.01" value={amount} onChange={(e) => setAmount(+e.target.value)} className="flex-1" aria-label="Explode amount" />
        <span className="text-xs text-muted w-16 text-right">Apart</span>
      </div>
    </Figure>
  )
}

export function Drawings({ project, dims, computed }) {
  const extra = project.orthoDims ? project.orthoDims(dims) : {}
  const [view, setView] = useState('front')
  const views = [
    ['front', 'Front'],
    ['side', 'Side'],
    ['top', 'Top'],
  ]
  return (
    <Figure bg="paper-grid" caption="Dimensioned drawings. All measurements in millimetres. They update when you change the size.">
      <div className="flex gap-1 p-2 no-print">
        {views.map(([k, l]) => (
          <button key={k} onClick={() => setView(k)} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${view === k ? 'bg-ink text-paper' : 'text-muted hover:bg-sand'}`}>
            {l}
          </button>
        ))}
      </div>
      <Ortho boxes={computed.model.boxes} view={view} extraDims={extra[view] || []} className="w-full h-64 sm:h-80 px-2 pb-2" />
    </Figure>
  )
}

/** All three drawings at once (for print). */
export function DrawingsAll({ project, dims, computed }) {
  const extra = project.orthoDims ? project.orthoDims(dims) : {}
  return (
    <div className="grid grid-cols-3 gap-2">
      {['front', 'side', 'top'].map((v) => (
        <Ortho key={v} boxes={computed.model.boxes} view={v} extraDims={extra[v] || []} className="w-full h-48" />
      ))}
    </div>
  )
}

export function JointFigure({ kind, className = 'w-full h-56' }) {
  const s = useMemo(() => jointScene(kind), [kind])
  return <IsoScene boxes={s.boxes} annotations={s.annotations} className={className} title={`Joint close-up: ${kind}`} shadow={false} pad={0.04} />
}

export function PrepFigure({ kind, className = 'w-full h-56' }) {
  const s = useMemo(() => prepScene(kind), [kind])
  return <IsoScene boxes={s.boxes} annotations={s.annotations} className={className} title={`Preparation: ${kind}`} pad={0.04} />
}

const centroid = (boxes) => {
  let x = 0, y = 0, z = 0
  for (const b of boxes) { x += b.x + b.dx / 2; y += b.y + b.dy / 2; z += b.z + b.dz / 2 }
  const n = boxes.length || 1
  return [x / n, y / n, z / n]
}

export function StepFigure({ computed, step, className = 'w-full h-60 sm:h-72' }) {
  const sc = step.scene
  const boxes = computed.model.boxes
  const built = useMemo(() => {
    if (!sc.adds) return null
    const show = new Set(sc.show)
    const groups = [...new Set(boxes.map((b) => b.group))]
    const hide = groups.filter((g) => !show.has(g))
    const annotations = []
    for (const [g, mv] of Object.entries(sc.move || {})) {
      if (!mv.some((v) => v)) continue
      const c = centroid(boxes.filter((b) => b.group === g))
      annotations.push({ type: 'arrow', from: [c[0] + mv[0] * 0.7, c[1] + mv[1] * 0.7, c[2] + mv[2] * 0.7], to: [c[0] + mv[0] * 0.08, c[1] + mv[1] * 0.08, c[2] + mv[2] * 0.08] })
    }
    return { hide, annotations }
  }, [sc, boxes])

  if (sc.prep) return <PrepFigure kind={sc.prep} className={className} />
  if (sc.joint) return <JointFigure kind={sc.joint} className={className} />
  if (!built) return null
  return <IsoScene boxes={boxes} hide={built.hide} focus={sc.focus} move={sc.move || {}} annotations={built.annotations} className={className} title={step.title} pad={0.05} />
}
