import { useState } from 'react'
import { useStore } from '../lib/store.jsx'
import { range, money, sizeOf } from '../lib/project.js'
import { LOOKS } from '../iso/IsoScene.jsx'
import { STOCK_OPTIONS } from '../lib/cutting.js'
import { BOARD_TIPS, WHERE_TO_BUY, TOOLS, HIRE_NOTE, SANDING, PRO_TIPS, FINISH_STEPS, FINISH_OPTIONS, SAFETY_BASE, COMMON_AREA_RULES } from '../data/common.js'
import { Section, Card, Stat, Button, Tick, Progress, Note, Icon, Lazy, shareOrCopy } from '../components/ui.jsx'
import { HeroRender, ExplodedView, Drawings, JointFigure, StepFigure, Figure } from '../components/Figures.jsx'
import { CutTable, CutPlan, cutListText } from '../components/CutPlan.jsx'
import DimsEditor from '../components/DimsEditor.jsx'
import ImageSlot from '../components/ImageSlot.jsx'

const Dots = ({ n }) => (
  <span className="inline-flex gap-1 align-middle ml-1.5">
    {[1, 2, 3].map((i) => (
      <span key={i} className={`w-1.5 h-1.5 rounded-full ${i <= n ? 'bg-rust' : 'bg-line'}`} />
    ))}
  </span>
)

function LookPicker({ project, look }) {
  const { setLook } = useStore()
  return (
    <div className="mt-4">
      <p className="text-[0.68rem] uppercase tracking-[0.14em] text-muted font-semibold mb-2">Choose a finish</p>
      <div className="grid grid-cols-3 gap-2">
        {Object.entries(LOOKS).map(([k, l]) => (
          <button key={k} onClick={() => setLook(project.id, k)} aria-pressed={look === k} className={`rounded-xl border p-2 text-left transition ${look === k ? 'border-ink bg-card shadow-sm' : 'border-line hover:bg-sand'}`}>
            <span className="flex h-6 rounded-md overflow-hidden">
              {l.swatch.map((c) => <span key={c} className="flex-1" style={{ background: c }} />)}
            </span>
            <span className="block text-xs font-semibold mt-1.5">{l.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

/* 1 · Overview ------------------------------------------------------------ */
export function Overview({ project, dims, stock, look, computed }) {
  const c = computed.plan.counts
  const size = sizeOf(project, dims)
  return (
    <>
      <Figure className="mt-5" caption="Illustration drawn to your chosen size. Add your own photos further down.">
        <HeroRender computed={computed} className="w-full h-72 sm:h-[26rem]" title={`${project.name}, finished`} />
      </Figure>
      <LookPicker project={project} look={look} />
      <p className="serif text-xl leading-snug mt-6">{project.tagline}</p>
      <p className="text-muted mt-2 leading-relaxed">{project.intro}</p>

      <div className="grid grid-cols-2 gap-2 mt-6">
        <Stat label="Finished size" value={`${size.width} × ${size.depth} × ${size.height}`} sub="width × depth × height, mm" />
        <Stat label="Difficulty" value={<>{project.difficulty}<Dots n={project.level} /></>} sub="Confident beginner" />
        <Stat label="Time" value={project.time} sub="Including drying and oiling" />
        <Stat label="Total cost" value={range(computed.cost.lo, computed.cost.hi)} sub="Timber, fixings and finish" />
        <Stat label="Boards" value={`${c.board3900 + c.board2400} scaffold boards`} sub={`${c.frame2400 + c.frame3600 + c.frame4800} lengths of 47 × 100`} />
        <Stat label="Weight" value={`About ${computed.weight}kg`} sub="Two people to move it" />
      </div>

      <ul className="mt-6 grid gap-2">
        {project.features.map((f) => (
          <li key={f} className="flex items-center gap-3 text-sm">
            <span className="grid place-items-center w-6 h-6 rounded-full bg-moss/15 text-moss"><Icon name="check" className="w-3.5 h-3.5" strokeWidth={2.5} /></span>
            {f}
          </li>
        ))}
      </ul>

      <Section kicker="Customise" title="Make it your size">
        <Card className="p-5">
          <p className="text-sm text-muted mb-5">Change any size and the cut list, cutting plan, board count, price and every drawing update to match.</p>
          <DimsEditor project={project} dims={dims} stock={stock} computed={computed} />
        </Card>
      </Section>

      <Section kicker="Assembly" title="How it goes together">
        <ExplodedView project={project} computed={computed} />
      </Section>

      <Section kicker="Drawings" title="Measured drawings">
        <Drawings project={project} dims={dims} computed={computed} />
      </Section>

      <Section kicker="Photos" title="Your photos">
        <p className="text-sm text-muted mb-4">These slots show illustrations until you add real or AI-generated photos. Each has the file name to use and a prompt to generate it.</p>
        <div className="grid sm:grid-cols-2 gap-4">
          {project.images.map((s) => (
            <ImageSlot key={s.file} project={project} computed={computed} slot={s} />
          ))}
        </div>
      </Section>
    </>
  )
}

/* 2 · What to find -------------------------------------------------------- */
export function ShoppingRow({ item, checked, onToggle, from }) {
  return (
    <li className={`flex gap-3 py-3 border-t border-line first:border-t-0 transition ${checked ? 'opacity-55' : ''}`}>
      <Tick checked={checked} onChange={onToggle} label={`Bought ${item.name}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <p className={`font-semibold text-sm ${checked ? 'line-through' : ''}`}>
            <span className="tabular-nums">{item.qty} ×</span> {item.name}
          </p>
          <p className="text-sm font-semibold tabular-nums whitespace-nowrap">{item.qty * item.lo === item.qty * item.hi ? money(item.qty * item.lo) : range(item.qty * item.lo, item.qty * item.hi)}</p>
        </div>
        <p className="text-xs text-muted mt-0.5">{item.spec} · {range(item.lo, item.hi)} each</p>
        <p className="text-xs text-timber-dark mt-0.5">{item.where}</p>
        {from && <p className="text-[0.7rem] text-muted mt-1">{from}</p>}
      </div>
    </li>
  )
}

export function ShoppingList({ items, fromLabel }) {
  const { state, toggleShop } = useStore()
  const cats = [...new Set(items.map((i) => i.cat))]
  return (
    <div className="space-y-4">
      {cats.map((cat) => (
        <Card key={cat} className="px-4 py-1">
          <h3 className="serif text-base font-semibold pt-3 pb-1">{cat}</h3>
          <ul>
            {items.filter((i) => i.cat === cat).map((it) => (
              <ShoppingRow key={it.key} item={it} checked={state.shop[it.key]} onToggle={() => toggleShop(it.key)} from={fromLabel?.(it)} />
            ))}
          </ul>
        </Card>
      ))}
    </div>
  )
}

export function Totals({ items }) {
  const { state } = useStore()
  const mid = (i) => (i.qty * (i.lo + i.hi)) / 2
  const total = items.reduce((s, i) => s + mid(i), 0)
  const bought = items.filter((i) => state.shop[i.key]).reduce((s, i) => s + mid(i), 0)
  return (
    <div className="rounded-2xl bg-ink text-paper p-5">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[0.68rem] uppercase tracking-[0.16em] opacity-70 font-semibold">Estimated total</p>
          <p className="serif text-3xl font-semibold">{money(total)}</p>
          <p className="text-xs opacity-70">Range {range(items.reduce((s, i) => s + i.qty * i.lo, 0), items.reduce((s, i) => s + i.qty * i.hi, 0))}</p>
        </div>
        <div className="text-right">
          <p className="text-[0.68rem] uppercase tracking-[0.16em] opacity-70 font-semibold">Still to buy</p>
          <p className="serif text-xl font-semibold">{money(total - bought)}</p>
          <p className="text-xs opacity-70">{money(bought)} ticked off</p>
        </div>
      </div>
      <Progress value={total ? bought / total : 0} className="mt-4 bg-paper/15" />
    </div>
  )
}

export function WhatToFind({ project, computed }) {
  return (
    <>
      <Section kicker="Shopping list" title="What to find">
        <p className="text-sm text-muted mb-4">Quantities come from the cutting plan for your size, with boards trimmed and ripped efficiently. Tick things off as you buy them. Ticks are shared with the combined shopping list.</p>
        <Totals items={computed.shopping} />
        <div className="mt-4">
          <ShoppingList items={computed.shopping} />
        </div>
        <div className="mt-4">
          <Note>
            <b>Getting 3.9m boards home:</b> they won’t fit in most cars. Ask the yard to cut them in half (check the Cut list tab first so the cuts don’t waste a long piece), use roof bars with a red flag on the overhang, or pay for delivery.
          </Note>
        </div>
      </Section>

      <Section kicker="At the yard" title="How to pick good boards">
        <div className="grid sm:grid-cols-2 gap-3">
          {BOARD_TIPS.map((t, i) => (
            <Card key={t.title} className="p-4">
              <p className="text-xs font-semibold text-rust tabular-nums">{String(i + 1).padStart(2, '0')}</p>
              <h3 className="serif font-semibold text-lg leading-snug">{t.title}</h3>
              <p className="text-sm text-muted mt-1 leading-relaxed">{t.text}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section kicker="Around Stratford and Warwick" title="Where to find them">
        <div className="space-y-3">
          {WHERE_TO_BUY.map((w) => (
            <div key={w.name} className="border-l-2 border-timber pl-4">
              <h3 className="font-semibold">{w.name}</h3>
              <p className="text-sm text-muted leading-relaxed">{w.detail}</p>
            </div>
          ))}
        </div>
      </Section>
    </>
  )
}

/* 3 · Tools --------------------------------------------------------------- */
function ToolList({ keys }) {
  return (
    <Card className="px-4 py-1">
      <ul>
        {keys.map((k) => (
          <li key={k} className="py-3 border-t border-line first:border-t-0">
            <p className="font-semibold text-sm">{TOOLS[k].name}</p>
            <p className="text-sm text-muted">{TOOLS[k].why}</p>
          </li>
        ))}
      </ul>
    </Card>
  )
}

export function Tools({ project }) {
  return (
    <>
      <Section kicker="Must-have" title="You’ll need these">
        <ToolList keys={project.tools.must} />
      </Section>
      <Section kicker="Nice to have" title="These make it easier">
        <ToolList keys={project.tools.nice} />
      </Section>
      <div className="mt-6">
        <Note>{HIRE_NOTE}</Note>
      </div>
    </>
  )
}

/* 4 · Cut list ------------------------------------------------------------ */
export function CutListTab({ project, dims, stock, computed }) {
  const { setStock } = useStore()
  const [msg, setMsg] = useState('')
  const c = computed.plan.counts
  const share = async () => {
    const r = await shareOrCopy({ title: `${project.name} cut list`, text: cutListText(project, dims, computed) })
    setMsg(r === 'copied' ? 'Copied to clipboard' : r === 'shared' ? 'Shared' : r === 'failed' ? 'Couldn’t share on this device' : '')
    setTimeout(() => setMsg(''), 2500)
  }
  return (
    <>
      <Section kicker="Cut list" title="Every piece you need">
        <p className="text-sm text-muted mb-1">
          For {sizeOf(project, dims).width} × {sizeOf(project, dims).depth} × {sizeOf(project, dims).height}mm{dims.shelves ? `, ${dims.shelves} shelves` : ''}{dims.columns ? `, ${dims.columns} × ${dims.rows} cubes` : ''}.{' '}
          <a href={`#/p/${project.id}/overview`} className="text-rust font-semibold">Change size</a>
        </p>
        <div className="flex flex-wrap gap-2 my-4 no-print">
          <Button href={`#/print/${project.id}`} variant="primary"><Icon name="print" className="w-4 h-4" /> Printable version</Button>
          <Button onClick={share} variant="ghost"><Icon name="share" className="w-4 h-4" /> Share</Button>
          {msg && <span className="self-center text-xs text-moss font-semibold">{msg}</span>}
        </div>
        <Card className="p-4">
          <CutTable parts={computed.parts} />
        </Card>
      </Section>

      <Section kicker="Cutting plan" title="How to cut each board">
        <div className="grid grid-cols-3 gap-1 bg-sand rounded-xl p-1 mb-4 no-print">
          {Object.entries(STOCK_OPTIONS).map(([k, o]) => (
            <button key={k} onClick={() => setStock(project.id, k)} className={`rounded-lg py-2 text-xs font-semibold transition ${stock === k ? 'bg-card shadow text-ink' : 'text-muted'}`}>
              {o.label}
            </button>
          ))}
        </div>
        <p className="text-sm text-muted mb-4">
          {c.board3900 + c.board2400} boards ({c.board3900} × 3.9m, {c.board2400} × 2.4m), using {Math.round(computed.plan.boardUse * 100)}% of the wood. Each board loses 30mm at both ends to trim off splits, plus 3mm per saw cut.
        </p>
        <Card className="p-4">
          <CutPlan plan={computed.plan} parts={computed.parts} />
        </Card>
        {computed.plan.warnings.map((w) => (
          <div key={w} className="mt-3"><Note tone="warn">{w}</Note></div>
        ))}
        <div className="mt-4 space-y-2 text-sm text-muted">
          <p><b className="text-ink">Cut the longest pieces first.</b> If you make a mistake, the piece can usually become a shorter part.</p>
          <p><b className="text-ink">Keep your offcuts.</b> They make shelf cleats, stop blocks and test pieces for trying out your oil.</p>
        </div>
      </Section>
    </>
  )
}

/* 5 · Build steps --------------------------------------------------------- */
export function StepCard({ project, computed, step, i }) {
  const { state, toggle } = useStore()
  const done = !!(state.steps[project.id] || {})[i]
  const joint = step.joint && project.joints.find((j) => j.kind === step.joint)
  return (
    <Card className={`overflow-hidden transition ${done ? 'ring-2 ring-moss/40' : ''}`}>
      <div className="studio border-b border-line">
        <Lazy height={240}>
          <StepFigure computed={computed} step={step} />
        </Lazy>
      </div>
      <div className="p-5">
        <div className="flex items-baseline gap-3">
          <span className="serif text-3xl font-semibold text-timber tabular-nums leading-none">{step.n}</span>
          <h3 className="serif text-xl font-semibold leading-snug">{step.title}</h3>
        </div>
        <div className="mt-3 space-y-2 text-[0.95rem] leading-relaxed">
          {step.body.filter(Boolean).map((p, k) => <p key={k}>{p}</p>)}
        </div>
        {step.fix && (
          <p className="mt-3 text-xs inline-flex items-center gap-1.5 bg-sand rounded-full px-3 py-1.5 font-semibold">
            <Icon name="hammer" className="w-3.5 h-3.5" /> {step.fix}
          </p>
        )}
        <div className="mt-4 rounded-xl bg-paper border border-line p-3.5">
          <p className="text-[0.68rem] uppercase tracking-[0.14em] font-semibold text-timber-dark">Why this matters</p>
          <p className="text-sm mt-1">{step.why}</p>
        </div>
        {joint && (
          <details className="mt-3 rounded-xl border border-line overflow-hidden">
            <summary className="px-3.5 py-2.5 text-sm font-semibold cursor-pointer select-none">Joint close-up: {joint.title}</summary>
            <div className="studio"><JointFigure kind={joint.kind} /></div>
            <p className="px-3.5 py-2.5 text-sm text-muted">{joint.text}</p>
          </details>
        )}
        <label className="mt-4 flex gap-3 items-start cursor-pointer rounded-xl bg-moss/8 border border-moss/25 p-3.5">
          <Tick checked={done} onChange={() => toggle('steps', project.id, i)} label={`Step ${step.n} checked`} />
          <span className="text-sm">
            <span className="block text-[0.68rem] uppercase tracking-[0.14em] font-semibold text-moss">Check before moving on</span>
            {step.check}
          </span>
        </label>
      </div>
    </Card>
  )
}

export function Build({ project, computed }) {
  const { state } = useStore()
  const doneMap = state.steps[project.id] || {}
  const done = Object.keys(doneMap).length
  const total = computed.steps.length
  const next = computed.steps.findIndex((_, i) => !doneMap[i])
  return (
    <>
      <Section kicker="Build steps" title={`${total} steps, one job each`}>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Progress value={done / total} className="flex-1" />
            <span className="text-sm font-semibold tabular-nums">{done}/{total}</span>
          </div>
          <Button href={`#/workshop/${project.id}/${Math.max(0, next)}`} variant="rust" className="w-full mt-4">
            <Icon name="sun" className="w-4 h-4" /> Workshop mode: big text, swipe through
          </Button>
        </Card>
      </Section>

      <Section kicker="Key joints" title="The joints you’ll use">
        <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 pb-2 snap-x">
          {project.joints.map((j) => (
            <Card key={j.kind} className="flex-none w-64 snap-start overflow-hidden">
              <div className="studio"><Lazy height={180}><JointFigure kind={j.kind} className="w-full h-44" /></Lazy></div>
              <div className="p-3.5">
                <p className="font-semibold text-sm">{j.title}</p>
                <p className="text-xs text-muted mt-1">{j.text}</p>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      <div className="mt-8 space-y-6">
        {computed.steps.map((s, i) => (
          <StepCard key={i} project={project} computed={computed} step={s} i={i} />
        ))}
      </div>
    </>
  )
}

/* 6 · Finish -------------------------------------------------------------- */
const LOOK_FINISH = {
  natural: 'Clear hard-wax oil only. The wood darkens a little to a warm honey colour.',
  antique: 'One coat of dark walnut tinted oil (or a dark oak stain), wiped on and off evenly. Let it dry fully, rub the edges lightly with 240 grit for a worn look, then two coats of clear hard-wax oil on top. Test on an offcut first: reclaimed boards soak up stain unevenly, which is part of the charm.',
  weathered: 'One thin coat of grey tinted oil, wiped off quickly for a driftwood look, then one coat of clear hard-wax oil. Great with black metal hardware.',
}

export function Finish({ project, computed, look = 'natural' }) {
  const isKitchen = !!project.topArea
  const detail = project.images.find((s) => s.file.startsWith('detail'))
  return (
    <>
      <Section kicker="Finish" title="From grey boards to warm wood">
        <ol className="space-y-4">
          {FINISH_STEPS.map((s, i) => (
            <li key={s.title} className="flex gap-4">
              <span className="flex-none grid place-items-center w-8 h-8 rounded-full bg-ink text-paper text-sm font-semibold">{i + 1}</span>
              <div>
                <p className="font-semibold">{s.title}</p>
                <p className="text-sm text-muted leading-relaxed">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <div className="mt-6">
        <Note>
          <b>Your chosen look: {LOOKS[look].label}.</b> {LOOK_FINISH[look]} <a href={`#/p/${project.id}/overview`} className="text-rust font-semibold">Change look</a>
        </Note>
      </div>

      <Section kicker="Sanding" title="Grit order">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {SANDING.map((s, i) => (
            <Card key={s.grit} className="p-3.5">
              <p className="serif text-2xl font-semibold" style={{ color: ['#7d5a3c', '#9b6e45', '#b98a5c', '#d0a777'][i] }}>{s.grit}</p>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">{s.label}</p>
              <p className="text-xs mt-1.5 leading-relaxed">{s.text}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section kicker="Choosing a finish" title={isKitchen ? 'A worktop that shrugs off spills' : 'Which finish?'}>
        <div className="space-y-2">
          {FINISH_OPTIONS.map((o) => {
            const rec = isKitchen ? o.name.startsWith('Worktop') || o.name.startsWith('Hard-wax') : o.name.startsWith('Hard-wax')
            return (
              <div key={o.name} className={`rounded-xl border p-4 ${rec ? 'border-moss/40 bg-moss/5' : 'border-line'}`}>
                <p className="font-semibold text-sm">
                  {o.name}
                  {rec && <span className="ml-2 text-[0.65rem] uppercase tracking-[0.12em] bg-moss text-white rounded-full px-2 py-0.5 align-middle">{isKitchen && o.name.startsWith('Worktop') ? 'Use on the worktop' : 'Use this'}</span>}
                </p>
                <p className="text-sm text-muted mt-1">{o.text}</p>
              </div>
            )
          })}
        </div>
        <h3 className="serif text-lg font-semibold mt-6 mb-2">For this {project.short.toLowerCase()}</h3>
        <ul className="space-y-2 text-sm">
          {project.finish.map((f) => (
            <li key={f} className="flex gap-2"><span className="text-rust mt-0.5">●</span><span>{f}</span></li>
          ))}
        </ul>
      </Section>

      <Section kicker="Professional look" title="Little things that make it look pro">
        <div className="grid sm:grid-cols-2 gap-3">
          {PRO_TIPS.map((t, i) => (
            <Card key={i} className="p-4 text-sm leading-relaxed">{t}</Card>
          ))}
        </div>
      </Section>

      {detail && (
        <Section kicker="Photo" title="The finished detail">
          <ImageSlot project={project} computed={computed} slot={detail} />
        </Section>
      )}
    </>
  )
}

/* 7 · Safety -------------------------------------------------------------- */
export function Safety({ project }) {
  const { state, toggle } = useStore()
  const checks = state.checks[project.id] || {}
  const final = [
    'Every joint is glued and screwed; nothing wobbles when pushed.',
    'No screw tips poking through anywhere.',
    'All edges are softened. No splinters when you run a hand along them.',
    'Level both ways, feet adjusted, nothing rocks.',
    'Anti-tip strap fixed into solid wall or a stud.',
    'Clear of fire escape routes, fire doors and exits.',
    'Oily rags dried flat outside or soaked and sealed.',
  ]
  return (
    <>
      <Section kicker="While you work" title="Protect yourself">
        <div className="grid sm:grid-cols-2 gap-3">
          {SAFETY_BASE.map((s) => (
            <Card key={s.title} className="p-4">
              <p className="font-semibold">{s.title}</p>
              <p className="text-sm text-muted mt-1 leading-relaxed">{s.text}</p>
            </Card>
          ))}
        </div>
      </Section>
      <Section kicker="This piece" title="Loads and fixing">
        <div className="space-y-3">
          {project.safety.map((s) => (
            <div key={s.title} className="border-l-2 border-rust pl-4">
              <p className="font-semibold">{s.title}</p>
              <p className="text-sm text-muted leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted mt-4">Load figures are sensible guides for sound, 38mm softwood boards, not engineering ratings. If a board looks cracked or soft, don’t use it for a shelf.</p>
      </Section>
      <Section kicker="Common areas" title="Shared spaces and fire safety">
        <Note tone="warn">
          <ul className="space-y-2">
            {COMMON_AREA_RULES.map((r) => <li key={r}>{r}</li>)}
          </ul>
        </Note>
      </Section>
      <Section kicker="Sign-off" title="Final checks">
        <Card className="px-4 py-1">
          {final.map((f, i) => (
            <label key={i} className="flex gap-3 py-3 border-t border-line first:border-t-0 cursor-pointer text-sm">
              <Tick checked={checks[i]} onChange={() => toggle('checks', project.id, i)} label={f} />
              <span className={checks[i] ? 'line-through text-muted' : ''}>{f}</span>
            </label>
          ))}
        </Card>
      </Section>
    </>
  )
}
