import { useEffect, useRef } from 'react'
import { useProject, useStore, go } from '../lib/store.jsx'
import { StepFigure } from '../components/Figures.jsx'
import { Icon } from '../components/ui.jsx'
import { LookContext } from '../iso/IsoScene.jsx'

// Full-screen, big-text step view for the workshop: swipe or use arrow keys, keeps the screen awake.
export default function Workshop({ id, index }) {
  const { project, computed, look } = useProject(id)
  const { state, toggle } = useStore()
  const steps = computed?.steps || []
  const i = Math.min(Math.max(0, Number(index) || 0), steps.length - 1)
  const step = steps[i]
  const done = !!(state.steps[id] || {})[i]
  const touch = useRef(null)

  const to = (n) => n >= 0 && n < steps.length && go(`/workshop/${id}/${n}`)

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') to(i + 1)
      if (e.key === 'ArrowLeft') to(i - 1)
      if (e.key === 'Escape') go(`/p/${id}/build`)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  // Keep the screen on while you work (where supported)
  useEffect(() => {
    let lock
    const req = async () => {
      try {
        lock = await navigator.wakeLock?.request('screen')
      } catch {
        /* not supported or refused: fine */
      }
    }
    req()
    const vis = () => document.visibilityState === 'visible' && req()
    document.addEventListener('visibilitychange', vis)
    return () => {
      document.removeEventListener('visibilitychange', vis)
      lock?.release?.()
    }
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [i])

  if (!project || !step) return null

  const onStart = (e) => (touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY })
  const onEnd = (e) => {
    if (!touch.current) return
    const dx = e.changedTouches[0].clientX - touch.current.x
    const dy = e.changedTouches[0].clientY - touch.current.y
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) to(dx < 0 ? i + 1 : i - 1)
    touch.current = null
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#1c1916] text-[#f6efe4] overflow-y-auto" onTouchStart={onStart} onTouchEnd={onEnd}>
      <div className="max-w-2xl mx-auto px-4 pb-36" style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}>
        <div className="flex items-center justify-between">
          <a href={`#/p/${id}/build`} className="inline-flex items-center gap-1 text-sm font-semibold opacity-80 py-2" aria-label="Leave workshop mode">
            <Icon name="x" /> Exit
          </a>
          <span className="text-sm opacity-70">{project.short}</span>
          <span className="text-sm font-semibold tabular-nums">{i + 1} / {steps.length}</span>
        </div>
        <div className="flex gap-1 mt-2" aria-hidden="true">
          {steps.map((_, k) => (
            <span key={k} className={`h-1 flex-1 rounded-full ${k === i ? 'bg-[#e0a46a]' : (state.steps[id] || {})[k] ? 'bg-[#7f9468]' : 'bg-white/15'}`} />
          ))}
        </div>

        <div key={i} className="fade-up">
          <div className="mt-5 rounded-2xl overflow-hidden studio">
            <LookContext.Provider value={look}>
              <StepFigure computed={computed} step={step} className="w-full h-64 sm:h-80" />
            </LookContext.Provider>
          </div>
          <h1 className="serif text-[2rem] leading-tight font-semibold mt-6">{step.title}</h1>
          <div className="mt-4 space-y-4 text-[1.3rem] leading-relaxed">
            {step.body.filter(Boolean).map((p, k) => <p key={k}>{p}</p>)}
          </div>
          {step.fix && <p className="mt-5 text-lg text-[#e0a46a] font-semibold">🔩 {step.fix}</p>}
          <div className="mt-6 rounded-2xl bg-white/6 border border-white/10 p-4">
            <p className="text-xs uppercase tracking-[0.16em] font-semibold text-[#e0a46a]">Why this matters</p>
            <p className="text-lg mt-1">{step.why}</p>
          </div>
          <div className="mt-4 rounded-2xl bg-white/6 border border-white/10 p-4">
            <p className="text-xs uppercase tracking-[0.16em] font-semibold text-[#9fb488]">Check before moving on</p>
            <p className="text-lg mt-1">{step.check}</p>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 inset-x-0 bg-[#1c1916]/95 backdrop-blur border-t border-white/10" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
        <div className="max-w-2xl mx-auto px-4 pt-3 flex gap-3">
          <button onClick={() => to(i - 1)} disabled={i === 0} className="grid place-items-center w-16 rounded-2xl bg-white/10 disabled:opacity-30" aria-label="Previous step">
            <Icon name="back" className="w-7 h-7" />
          </button>
          <button
            onClick={() => {
              toggle('steps', id, i)
              if (!done && i < steps.length - 1) setTimeout(() => to(i + 1), 350)
            }}
            className={`flex-1 rounded-2xl py-4 text-lg font-semibold transition ${done ? 'bg-[#7f9468] text-white' : 'bg-[#e0a46a] text-[#1c1916]'}`}
          >
            {done ? '✓ Checked' : 'Checked, next step'}
          </button>
          <button onClick={() => to(i + 1)} disabled={i === steps.length - 1} className="grid place-items-center w-16 rounded-2xl bg-white/10 disabled:opacity-30" aria-label="Next step">
            <Icon name="next" className="w-7 h-7" />
          </button>
        </div>
      </div>
    </div>
  )
}
