import { useState } from 'react'
import { useAllProjects, useStore } from '../lib/store.jsx'
import { HeroRender } from '../components/Figures.jsx'
import { Icon, Progress } from '../components/ui.jsx'
import { range, money, mergeShopping, sizeOf } from '../lib/project.js'
import { LookContext } from '../iso/IsoScene.jsx'

export default function Home() {
  const all = useAllProjects()
  const { state } = useStore()
  const merged = mergeShopping(all.map((a) => ({ project: a.project.id, items: a.computed.shopping })))
  const lo = merged.reduce((s, i) => s + i.qty * i.lo, 0)
  const hi = merged.reduce((s, i) => s + i.qty * i.hi, 0)
  const [level, setLevel] = useState(0) // 0 = all
  const levels = [[0, 'All'], [1, 'Easy'], [2, 'Moderate'], [3, 'Ambitious']]
  const shown = all.filter((a) => !level || a.project.level === level)

  return (
    <div className="fade-up">
      <header className="pt-8 pb-6">
        <p className="text-[0.7rem] uppercase tracking-[0.2em] text-timber-dark font-semibold">Reclaimed scaffold-board furniture</p>
        <h1 className="text-[2.4rem] leading-[1.05] font-semibold mt-2">
          Furniture for
          <br />
          <em className="font-normal">the mill.</em>
        </h1>
        <p className="text-muted mt-3 max-w-md">Step-by-step guides written for a first-time builder. Plain English, metric sizes, UK suppliers and prices.</p>
      </header>

      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 pb-4" role="group" aria-label="Filter by difficulty">
        {levels.map(([n, label]) => {
          const count = n ? all.filter((a) => a.project.level === n).length : all.length
          return (
            <button key={n} onClick={() => setLevel(n)} aria-pressed={level === n} className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-semibold border transition ${level === n ? 'bg-ink text-paper border-ink' : 'border-line text-muted hover:bg-sand'}`}>
              {label} <span className="opacity-60 tabular-nums">{count}</span>
            </button>
          )
        })}
      </div>

      <div className="space-y-5">
        {shown.map(({ project, dims, look, computed }, i) => {
          const done = Object.keys(state.steps[project.id] || {}).length
          const total = computed.steps.length
          return (
            <a key={project.id} href={`#/p/${project.id}/overview`} className="block group fade-up" style={{ animationDelay: `${i * 70}ms` }}>
              <article className="rounded-3xl overflow-hidden border border-line bg-card shadow-[0_12px_32px_-18px_rgba(60,40,20,0.35)] transition group-hover:-translate-y-0.5 group-hover:shadow-[0_18px_40px_-18px_rgba(60,40,20,0.45)]">
                <div className="studio">
                  <LookContext.Provider value={look}>
                    <HeroRender computed={computed} className="w-full h-56" title={project.name} />
                  </LookContext.Provider>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-2xl font-semibold">{project.name}</h2>
                      <p className="text-sm text-muted mt-0.5">{project.tagline}</p>
                    </div>
                    <span className="flex-none grid place-items-center w-9 h-9 rounded-full bg-sand text-ink transition group-hover:bg-ink group-hover:text-paper">
                      <Icon name="next" />
                    </span>
                  </div>
                  <dl className="grid grid-cols-3 gap-2 mt-4 text-xs">
                    <div>
                      <dt className="text-muted">Size</dt>
                      <dd className="font-semibold tabular-nums">
                        {sizeOf(project, dims).width} × {sizeOf(project, dims).depth} × {sizeOf(project, dims).height}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted">Level</dt>
                      <dd className="font-semibold">{project.difficulty}</dd>
                    </div>
                    <div>
                      <dt className="text-muted">Cost</dt>
                      <dd className="font-semibold">{range(computed.cost.lo, computed.cost.hi)}</dd>
                    </div>
                  </dl>
                  {done > 0 && (
                    <div className="mt-4 flex items-center gap-3">
                      <Progress value={done / total} className="flex-1" />
                      <span className="text-xs text-muted tabular-nums">
                        {done}/{total} steps
                      </span>
                    </div>
                  )}
                </div>
              </article>
            </a>
          )
        })}
      </div>

      <a href="#/shop" className="mt-6 flex items-center gap-4 rounded-2xl bg-ink text-paper p-5 group">
        <span className="grid place-items-center w-11 h-11 rounded-full bg-paper/10">
          <Icon name="cart" />
        </span>
        <span className="flex-1">
          <span className="serif text-lg font-semibold block">Shopping list for everything</span>
          <span className="text-sm opacity-75">
            About {money((lo + hi) / 2)} in total ({range(lo, hi)})
          </span>
        </span>
        <Icon name="next" />
      </a>

      <p className="text-xs text-muted mt-8 leading-relaxed">
        Prices are typical UK ranges for late 2026 and will vary by yard and season. Your ticks and sizes are saved on this device only. Works offline once installed: on iPhone use Share → Add to Home Screen; on Android use the browser menu → Install app.
      </p>
    </div>
  )
}
