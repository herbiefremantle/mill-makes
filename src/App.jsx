import { useEffect } from 'react'
import { useRoute } from './lib/store.jsx'
import { Logo, Icon } from './components/ui.jsx'
import Home from './pages/Home.jsx'
import Project from './pages/Project.jsx'
import Shopping from './pages/Shopping.jsx'
import Workshop from './pages/Workshop.jsx'
import PrintView from './pages/PrintView.jsx'

export default function App() {
  const [page, a, b] = useRoute()
  useEffect(() => {
    if (page !== 'p') window.scrollTo({ top: 0 })
  }, [page, a])

  if (page === 'workshop') return <Workshop id={a} index={b} />

  return (
    <div className="min-h-screen">
      {page !== 'print' && (
        <header className="sticky top-0 z-30 bg-paper/90 backdrop-blur border-b border-line no-print" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
          <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
            <a href="#/" aria-label="Mill Makes home"><Logo /></a>
            <nav className="flex items-center gap-1">
              <a href="#/" className={`p-2 rounded-full ${!page ? 'bg-sand' : 'hover:bg-sand'}`} aria-label="Projects"><Icon name="home" /></a>
              <a href="#/shop" className={`p-2 rounded-full ${page === 'shop' ? 'bg-sand' : 'hover:bg-sand'}`} aria-label="Shopping list"><Icon name="cart" /></a>
            </nav>
          </div>
        </header>
      )}
      <main className="max-w-3xl mx-auto px-4 pb-16">
        {page === 'p' ? <Project id={a} tab={b} /> : page === 'shop' ? <Shopping /> : page === 'print' ? <PrintView id={a} /> : <Home />}
      </main>
    </div>
  )
}
