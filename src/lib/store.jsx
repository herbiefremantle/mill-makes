import { createContext, useContext, useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import { byId, PROJECTS } from '../data/index.js'
import { computeProject } from './project.js'

// Everything the user changes (ticks, dimensions, board choice) lives in localStorage, on this device only.
const KEY = 'millmakes:v1'
const empty = { dims: {}, stock: {}, look: {}, steps: {}, checks: {}, shop: {}, shopProjects: PROJECTS.map((p) => p.id) }

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? { ...empty, ...JSON.parse(raw) } : empty
  } catch {
    return empty
  }
}

const Ctx = createContext(null)

export function StoreProvider({ children }) {
  const [state, setState] = useState(load)
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
    } catch {
      /* storage full or blocked: progress just won't persist */
    }
  }, [state])
  const api = useMemo(
    () => ({
      state,
      setDims: (id, dims) => setState((s) => ({ ...s, dims: { ...s.dims, [id]: dims } })),
      setStock: (id, v) => setState((s) => ({ ...s, stock: { ...s.stock, [id]: v } })),
      setLook: (id, v) => setState((s) => ({ ...s, look: { ...(s.look || {}), [id]: v } })),
      toggle: (bucket, id, key) =>
        setState((s) => {
          const cur = { ...(s[bucket][id] || {}) }
          if (cur[key]) delete cur[key]
          else cur[key] = true
          return { ...s, [bucket]: { ...s[bucket], [id]: cur } }
        }),
      setFlag: (bucket, id, key, val) =>
        setState((s) => {
          const cur = { ...(s[bucket][id] || {}) }
          if (val) cur[key] = true
          else delete cur[key]
          return { ...s, [bucket]: { ...s[bucket], [id]: cur } }
        }),
      toggleShop: (key) => setState((s) => ({ ...s, shop: { ...s.shop, [key]: !s.shop[key] } })),
      setShopProjects: (ids) => setState((s) => ({ ...s, shopProjects: ids })),
      resetAll: () => setState(empty),
    }),
    [state],
  )
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>
}

export const useStore = () => useContext(Ctx)

/** The computed guide (model, cut list, plan, shopping, steps) for a project with the user's dimensions. */
export function useProject(id) {
  const { state } = useStore()
  const project = byId[id]
  const dims = { ...project?.defaults, ...(state.dims[id] || {}) }
  const stock = state.stock[id] || 'mixed'
  const look = (state.look || {})[id] || project?.defaultLook || 'natural'
  const key = JSON.stringify([id, dims, stock, look])
  const computed = useMemo(() => (project ? computeProject(project, dims, stock, look) : null), [key]) // eslint-disable-line
  return { project, dims, stock, look, computed }
}

export function useAllProjects() {
  const { state } = useStore()
  const key = JSON.stringify([state.dims, state.stock, state.look])
  return useMemo(
    () =>
      PROJECTS.map((p) => {
        const dims = { ...p.defaults, ...(state.dims[p.id] || {}) }
        const look = (state.look || {})[p.id] || p.defaultLook || 'natural'
        return { project: p, dims, look, computed: computeProject(p, dims, state.stock[p.id] || 'mixed', look) }
      }),
    [key], // eslint-disable-line
  )
}

// Tiny hash router: #/p/sideboard/cut  ->  ['p', 'sideboard', 'cut']
function subscribe(cb) {
  window.addEventListener('hashchange', cb)
  return () => window.removeEventListener('hashchange', cb)
}
export function useRoute() {
  const hash = useSyncExternalStore(subscribe, () => window.location.hash)
  return hash.replace(/^#\/?/, '').split('/').filter(Boolean)
}
export const go = (path) => {
  window.location.hash = path
}
