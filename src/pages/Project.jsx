import { useEffect, useRef } from 'react'
import { useProject } from '../lib/store.jsx'
import { Icon } from '../components/ui.jsx'
import { LookContext } from '../iso/IsoScene.jsx'
import { Overview, WhatToFind, Tools, CutListTab, Build, Finish, Safety } from './tabs.jsx'

export const TABS = [
  ['overview', 'Overview', Overview],
  ['find', 'What to find', WhatToFind],
  ['tools', 'Tools', Tools],
  ['cut', 'Cut list', CutListTab],
  ['build', 'Build steps', Build],
  ['finish', 'Finish', Finish],
  ['safety', 'Safety', Safety],
]

export default function Project({ id, tab = 'overview' }) {
  const data = useProject(id)
  const bar = useRef(null)
  const current = TABS.find((t) => t[0] === tab) || TABS[0]
  useEffect(() => {
    window.scrollTo({ top: 0 })
    bar.current?.querySelector('[aria-current="page"]')?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
  }, [tab, id])
  if (!data.project) return <p className="py-10">Project not found. <a href="#/" className="underline">Go home</a></p>
  const Comp = current[2]
  return (
    <LookContext.Provider value={data.look}>
    <div>
      <div className="pt-5 flex items-center gap-2">
        <a href="#/" className="-ml-2 p-2 rounded-full hover:bg-sand" aria-label="Back to all projects">
          <Icon name="back" />
        </a>
        <h1 className="text-[1.7rem] font-semibold leading-tight">{data.project.name}</h1>
      </div>
      <nav ref={bar} className="sticky top-[56px] z-20 -mx-4 px-4 bg-paper/90 backdrop-blur border-b border-line no-print" aria-label="Guide sections">
        <div className="flex gap-1 overflow-x-auto no-scrollbar py-2">
          {TABS.map(([k, label], i) => (
            <a
              key={k}
              href={`#/p/${id}/${k}`}
              aria-current={k === current[0] ? 'page' : undefined}
              className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${k === current[0] ? 'bg-ink text-paper' : 'text-muted hover:bg-sand'}`}
            >
              <span className="opacity-50 mr-1 tabular-nums">{i + 1}</span>
              {label}
            </a>
          ))}
        </div>
      </nav>
      <div key={current[0]} className="fade-up">
        <Comp {...data} />
      </div>
      <div className="mt-12 flex justify-between gap-3 no-print">
        {TABS.findIndex((t) => t === current) > 0 ? (
          <a href={`#/p/${id}/${TABS[TABS.indexOf(current) - 1][0]}`} className="inline-flex items-center gap-1 text-sm font-semibold text-muted">
            <Icon name="back" className="w-4 h-4" /> {TABS[TABS.indexOf(current) - 1][1]}
          </a>
        ) : <span />}
        {TABS.indexOf(current) < TABS.length - 1 && (
          <a href={`#/p/${id}/${TABS[TABS.indexOf(current) + 1][0]}`} className="inline-flex items-center gap-1 text-sm font-semibold">
            {TABS[TABS.indexOf(current) + 1][1]} <Icon name="next" className="w-4 h-4" />
          </a>
        )}
      </div>
    </div>
    </LookContext.Provider>
  )
}
