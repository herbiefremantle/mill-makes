import { useEffect, useState } from 'react'
import { useStore } from '../lib/store.jsx'
import { STOCK_OPTIONS } from '../lib/cutting.js'
import { Icon, Note } from './ui.jsx'
import { range } from '../lib/project.js'

const LABELS = { width: 'Width', depth: 'Depth', height: 'Height', shelves: 'Shelves' }

function DimInput({ k, value, min, max, onChange, meta }) {
  const unit = meta?.unit ?? (k === 'shelves' ? '' : 'mm')
  const step = unit ? 10 : 1
  const [text, setText] = useState(String(value))
  useEffect(() => {
    setText(String(value))
  }, [value])
  const commit = (v) => {
    const n = Math.round(Number(v) / step) * step
    if (!Number.isFinite(n)) return setText(String(value))
    const c = Math.min(max, Math.max(min, n))
    setText(String(c))
    onChange(c)
  }
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={`dim-${k}`} className="text-sm font-semibold">{meta?.label || LABELS[k]}</label>
        <div className="flex items-center gap-1">
          <input
            id={`dim-${k}`}
            inputMode="numeric"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={(e) => commit(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && commit(e.currentTarget.value)}
            className="w-20 text-right tabular-nums rounded-lg border border-line bg-paper px-2 py-1.5 text-sm font-semibold"
          />
          <span className="text-xs text-muted w-6">{unit}</span>
        </div>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(+e.target.value)} className="w-full mt-2" aria-label={`${meta?.label || LABELS[k]} slider`} />
      <div className="flex justify-between text-[0.68rem] text-muted tabular-nums -mt-0.5">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  )
}

export default function DimsEditor({ project, dims, stock, computed }) {
  const { setDims, setStock } = useStore()
  const changed = Object.keys(project.defaults).some((k) => dims[k] !== project.defaults[k])
  const c = computed.plan.counts
  const depthNote = dims.depth % 225 !== 0
  return (
    <div className="space-y-5">
      {Object.keys(project.defaults).map((k) => (
        <DimInput key={k} k={k} meta={project.dimMeta?.[k]} value={dims[k]} min={project.limits[k][0]} max={project.limits[k][1]} onChange={(v) => setDims(project.id, { ...dims, [k]: v })} />
      ))}
      <div>
        <p className="text-sm font-semibold mb-2">Board lengths you can get</p>
        <div className="grid grid-cols-3 gap-1 bg-sand rounded-xl p-1">
          {Object.entries(STOCK_OPTIONS).map(([k, o]) => (
            <button key={k} onClick={() => setStock(project.id, k)} className={`rounded-lg py-2 text-xs font-semibold transition ${stock === k ? 'bg-card shadow text-ink' : 'text-muted'}`}>
              {o.label}
            </button>
          ))}
        </div>
      </div>
      <div className="rounded-xl bg-ink text-paper px-4 py-3 text-sm flex flex-wrap gap-x-5 gap-y-1">
        <span>
          <b className="serif text-base">{c.board3900 + c.board2400}</b> boards
          <span className="opacity-70"> ({c.board3900} × 3.9m, {c.board2400} × 2.4m)</span>
        </span>
        <span>
          <b className="serif text-base">{c.frame2400 + c.frame3600 + c.frame4800}</b> framing lengths
        </span>
        <span>
          <b className="serif text-base">{range(computed.cost.lo, computed.cost.hi)}</b> total
        </span>
      </div>
      {depthNote && (
        <Note>
          Boards are 225mm wide, so a depth of {dims.depth}mm means ripping some boards narrower. Set the depth to a multiple of 225 (225, 450, 675) for less cutting and less waste.
        </Note>
      )}
      {computed.plan.warnings.map((w) => (
        <Note key={w} tone="warn">{w}</Note>
      ))}
      {changed && (
        <button onClick={() => setDims(project.id, project.defaults)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-rust">
          <Icon name="reset" className="w-4 h-4" /> Reset to the original size
        </button>
      )}
    </div>
  )
}
