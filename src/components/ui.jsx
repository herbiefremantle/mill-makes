import { useEffect, useRef, useState } from 'react'

const PATHS = {
  back: 'M15 18l-6-6 6-6',
  next: 'M9 18l6-6-6-6',
  cart: 'M3 4h2l2.4 11.2a2 2 0 002 1.6h7.7a2 2 0 002-1.5L21 8H6.2M10 21h.01M17 21h.01',
  home: 'M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z',
  print: 'M6 9V3h12v6M6 18H4a1 1 0 01-1-1v-6a2 2 0 012-2h14a2 2 0 012 2v6a1 1 0 01-1 1h-2M7 14h10v7H7z',
  share: 'M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7M16 6l-4-4-4 4M12 2v14',
  hammer: 'M14 6l4 4M3 21l9-9M12 4l6 6-2 2-6-6zM15.5 3.5l5 5',
  check: 'M5 13l4 4L19 7',
  x: 'M6 6l12 12M18 6L6 18',
  copy: 'M9 9h10v12H9zM5 15H4V3h12v1',
  ruler: 'M3 17L17 3l4 4L7 21zM7 13l2 2M10 10l2 2M13 7l2 2',
  sun: 'M12 3v2M12 19v2M5 12H3M21 12h-2M6.3 6.3l1.4 1.4M16.3 16.3l1.4 1.4M6.3 17.7l1.4-1.4M16.3 7.7l1.4-1.4M12 8a4 4 0 100 8 4 4 0 000-8z',
  camera: 'M4 7h3l2-3h6l2 3h3a1 1 0 011 1v11a1 1 0 01-1 1H4a1 1 0 01-1-1V8a1 1 0 011-1zM12 10a3.5 3.5 0 100 7 3.5 3.5 0 000-7z',
  reset: 'M4 4v6h6M20 20v-6h-6M5.5 15a7 7 0 0012 2.5M18.5 9A7 7 0 006.5 6.5',
  warn: 'M12 3l10 18H2zM12 10v4M12 17.5v.01',
}

export function Icon({ name, className = 'w-5 h-5', strokeWidth = 1.8 }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d={PATHS[name]} />
    </svg>
  )
}

export function Logo({ className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg viewBox="0 0 32 32" className="w-7 h-7" aria-hidden="true">
        <rect width="32" height="32" rx="8" fill="#2b2620" />
        <rect x="6" y="8" width="20" height="4.5" rx="1" fill="#d9a86c" />
        <rect x="6" y="14" width="20" height="4.5" rx="1" fill="#c48a52" />
        <rect x="6" y="20" width="20" height="4.5" rx="1" fill="#e2bd88" />
        <rect x="8" y="8" width="1.6" height="16.5" fill="#9aa1a6" />
        <rect x="22.4" y="8" width="1.6" height="16.5" fill="#9aa1a6" />
      </svg>
      <span className="serif text-[1.35rem] font-semibold tracking-tight">Mill Makes</span>
    </span>
  )
}

export function Section({ title, kicker, children, className = '', id }) {
  return (
    <section id={id} className={`mt-10 first:mt-6 fade-up ${className}`}>
      {kicker && <p className="text-[0.7rem] uppercase tracking-[0.18em] text-timber-dark font-semibold mb-1">{kicker}</p>}
      {title && <h2 className="text-2xl font-semibold mb-4">{title}</h2>}
      {children}
    </section>
  )
}

export function Card({ children, className = '' }) {
  return <div className={`bg-card rounded-2xl border border-line shadow-[0_1px_0_rgba(0,0,0,0.02),0_8px_24px_-12px_rgba(60,40,20,0.18)] ${className}`}>{children}</div>
}

export function Stat({ label, value, sub }) {
  return (
    <div className="bg-card rounded-xl border border-line px-3.5 py-3">
      <p className="text-[0.68rem] uppercase tracking-[0.14em] text-muted font-semibold">{label}</p>
      <p className="serif text-lg font-semibold leading-tight mt-0.5">{value}</p>
      {sub && <p className="text-xs text-muted mt-0.5">{sub}</p>}
    </div>
  )
}

export function Button({ children, onClick, variant = 'primary', className = '', href, ...rest }) {
  const styles = {
    primary: 'bg-ink text-paper hover:bg-iron',
    rust: 'bg-rust text-white hover:brightness-110',
    ghost: 'bg-transparent text-ink border border-line hover:bg-sand',
    soft: 'bg-sand text-ink hover:bg-line',
  }
  const cls = `inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition active:scale-[0.98] ${styles[variant]} ${className}`
  if (href) return <a href={href} className={cls} {...rest}>{children}</a>
  return <button type="button" onClick={onClick} className={cls} {...rest}>{children}</button>
}

export function Tick({ checked, onChange, label }) {
  return <input type="checkbox" className="tick" checked={!!checked} onChange={onChange} aria-label={label} />
}

export function Progress({ value, className = '' }) {
  return (
    <div className={`h-1.5 rounded-full bg-line overflow-hidden ${className}`}>
      <div className="h-full bg-moss rounded-full transition-all duration-500" style={{ width: `${Math.round(value * 100)}%` }} />
    </div>
  )
}

export function Note({ children, tone = 'info' }) {
  const t = tone === 'warn' ? 'bg-[#fbeee4] border-[#eccab3] text-[#7a3516]' : 'bg-sand border-line text-ink'
  return (
    <div className={`rounded-xl border px-4 py-3 text-sm flex gap-3 ${t}`}>
      {tone === 'warn' && <Icon name="warn" className="w-5 h-5 flex-none mt-0.5" />}
      <div>{children}</div>
    </div>
  )
}

/** Renders children only once scrolled near the viewport: keeps long step lists fast on phones. */
export function Lazy({ children, height = 220, className = '' }) {
  const ref = useRef(null)
  const [show, setShow] = useState(typeof IntersectionObserver === 'undefined')
  useEffect(() => {
    if (show) return
    const io = new IntersectionObserver((es) => es.some((e) => e.isIntersecting) && setShow(true), { rootMargin: '400px' })
    io.observe(ref.current)
    return () => io.disconnect()
  }, [show])
  return (
    <div ref={ref} className={className} style={show ? undefined : { minHeight: height }}>
      {show ? children : null}
    </div>
  )
}

export async function shareOrCopy({ title, text }) {
  if (navigator.share) {
    try {
      await navigator.share({ title, text })
      return 'shared'
    } catch (e) {
      if (e?.name === 'AbortError') return 'cancelled'
    }
  }
  try {
    await navigator.clipboard.writeText(text)
    return 'copied'
  } catch {
    return 'failed'
  }
}
