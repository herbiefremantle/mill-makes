import { useState } from 'react'
import { useProject } from '../lib/store.jsx'
import { CutTable, CutPlan, cutListText } from '../components/CutPlan.jsx'
import { HeroRender, DrawingsAll } from '../components/Figures.jsx'
import { Button, Icon, shareOrCopy } from '../components/ui.jsx'
import { range, money, sizeOf } from '../lib/project.js'

// A one-document build sheet: print it, save it as a PDF, or share the text version.
export default function PrintView({ id }) {
  const { project, dims, computed } = useProject(id)
  const [msg, setMsg] = useState('')
  if (!project) return null
  const share = async () => {
    const r = await shareOrCopy({ title: `${project.name} cut list`, text: cutListText(project, dims, computed) })
    setMsg(r === 'copied' ? 'Copied to clipboard' : r === 'shared' ? 'Shared' : '')
  }
  return (
    <div className="bg-white -mx-4 px-4 sm:px-8 py-6 min-h-screen">
      <div className="no-print flex flex-wrap gap-2 mb-6">
        <Button href={`#/p/${id}/cut`} variant="ghost"><Icon name="back" className="w-4 h-4" /> Back</Button>
        <Button onClick={() => window.print()}><Icon name="print" className="w-4 h-4" /> Print or save as PDF</Button>
        <Button onClick={share} variant="ghost"><Icon name="share" className="w-4 h-4" /> Share as text</Button>
        {msg && <span className="self-center text-xs text-moss font-semibold">{msg}</span>}
      </div>

      <header className="flex items-start justify-between gap-4 border-b-2 border-ink pb-3">
        <div>
          <p className="text-[0.65rem] uppercase tracking-[0.2em] text-muted font-semibold">Mill Makes · build sheet</p>
          <h1 className="text-3xl font-semibold">{project.name}</h1>
          <p className="text-sm">
            {sizeOf(project, dims).width} W × {sizeOf(project, dims).depth} D × {sizeOf(project, dims).height} H mm{dims.columns ? ` · ${dims.columns} × ${dims.rows} cubes` : ''}{dims.shelves ? ` · ${dims.shelves} shelves` : ''} · {project.difficulty} · {project.time} · {range(computed.cost.lo, computed.cost.hi)}
          </p>
        </div>
        <HeroRender computed={computed} props={false} room={false} className="w-28 h-24 flex-none" />
      </header>

      <section className="mt-5 avoid-break">
        <h2 className="text-xl font-semibold mb-2">Drawings</h2>
        <DrawingsAll project={project} dims={dims} computed={computed} />
      </section>

      <section className="mt-5">
        <h2 className="text-xl font-semibold mb-2">Cut list</h2>
        <CutTable parts={computed.parts} compact />
      </section>

      <section className="mt-5 print-break">
        <h2 className="text-xl font-semibold mb-2">Cutting plan</h2>
        <p className="text-xs text-muted mb-3">Trim 30mm off each end of every board first. Measure from the trimmed end. 3mm allowed per saw cut.</p>
        <CutPlan plan={computed.plan} parts={computed.parts} />
      </section>

      <section className="mt-5 avoid-break">
        <h2 className="text-xl font-semibold mb-2">Shopping list</h2>
        <table className="w-full text-sm">
          <tbody>
            {computed.shopping.map((i) => (
              <tr key={i.key} className="border-t border-line">
                <td className="py-1.5 pr-2 w-6">☐</td>
                <td className="py-1.5 pr-2 tabular-nums font-semibold">{i.qty} ×</td>
                <td className="py-1.5 pr-2">{i.name} <span className="text-muted text-xs">· {i.spec}</span></td>
                <td className="py-1.5 text-right tabular-nums whitespace-nowrap">{money(i.qty * i.lo)}–{money(i.qty * i.hi)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mt-5 print-break">
        <h2 className="text-xl font-semibold mb-2">Steps</h2>
        <ol className="space-y-2 text-sm">
          {computed.steps.map((s) => (
            <li key={s.n} className="avoid-break">
              <b>☐ {s.n}. {s.title}.</b> {s.body.filter(Boolean).join(' ')} <i className="text-muted">Check: {s.check}</i>
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}
