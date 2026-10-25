import { useState } from 'react'
import { useAllProjects, useStore } from '../lib/store.jsx'
import { mergeShopping, money } from '../lib/project.js'
import { byId } from '../data/index.js'
import { ShoppingList, Totals } from './tabs.jsx'
import { Button, Icon, shareOrCopy } from '../components/ui.jsx'

export default function Shopping() {
  const all = useAllProjects()
  const { state, setShopProjects, toggleShop } = useStore()
  const [msg, setMsg] = useState('')
  const chosen = state.shopProjects
  const lists = all.filter((a) => chosen.includes(a.project.id)).map((a) => ({ project: a.project.id, items: a.computed.shopping }))
  const items = mergeShopping(lists)

  const flip = (id) => setShopProjects(chosen.includes(id) ? chosen.filter((x) => x !== id) : [...chosen, id])
  const fromLabel = (it) => {
    const names = it.from.map((f) => byId[f.project].short.toLowerCase()).join(', ')
    const shared = it.from.length > 1 && (it.cat === 'Fixings' || it.cat === 'Finishing')
    return `For ${names}${shared ? ' (one lot shared)' : ''}`
  }

  const text = () =>
    ['Mill Makes shopping list', ''].concat(items.map((i) => `${state.shop[i.key] ? '[x]' : '[ ]'} ${i.qty} × ${i.name} (${i.spec}) ~${money((i.qty * (i.lo + i.hi)) / 2)}`)).join('\n')

  const share = async () => {
    const r = await shareOrCopy({ title: 'Mill Makes shopping list', text: text() })
    setMsg(r === 'copied' ? 'Copied' : r === 'shared' ? 'Shared' : '')
    setTimeout(() => setMsg(''), 2500)
  }
  const clearTicks = () => items.forEach((i) => state.shop[i.key] && toggleShop(i.key))

  return (
    <div className="fade-up">
      <div className="pt-5 flex items-center gap-2">
        <a href="#/" className="-ml-2 p-2 rounded-full hover:bg-sand" aria-label="Back home"><Icon name="back" /></a>
        <h1 className="text-[1.7rem] font-semibold">Shopping list</h1>
      </div>
      <p className="text-sm text-muted mt-1">Everything for the projects you pick, combined. Screws, glue, sandpaper and oil are shared between projects, so you buy fewer packs.</p>

      <div className="flex flex-wrap gap-2 mt-4">
        {all.map(({ project }) => {
          const on = chosen.includes(project.id)
          return (
            <button key={project.id} onClick={() => flip(project.id)} aria-pressed={on} className={`rounded-full px-3.5 py-1.5 text-sm font-semibold border transition ${on ? 'bg-ink text-paper border-ink' : 'border-line text-muted'}`}>
              {on && '✓ '}{project.short}
            </button>
          )
        })}
      </div>

      {items.length ? (
        <>
          <div className="mt-5"><Totals items={items} /></div>
          <div className="flex gap-2 mt-4">
            <Button variant="ghost" onClick={share}><Icon name="share" className="w-4 h-4" /> Share list</Button>
            <Button variant="ghost" onClick={clearTicks}>Clear ticks</Button>
            {msg && <span className="self-center text-xs text-moss font-semibold">{msg}</span>}
          </div>
          <div className="mt-5"><ShoppingList items={items} fromLabel={fromLabel} /></div>
        </>
      ) : (
        <p className="mt-8 text-muted">Pick at least one project above.</p>
      )}
    </div>
  )
}
