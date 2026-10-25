import { useState } from 'react'
import { Icon } from './ui.jsx'
import { HeroRender, JointFigure, PrepFigure } from './Figures.jsx'

/**
 * Shows a photo from public/images/<project>/<file> if you've added one.
 * Until then: the illustrated placeholder, the file name to use, and a ready-made AI image prompt.
 */
export default function ImageSlot({ project, computed, slot }) {
  const [status, setStatus] = useState('loading')
  const [copied, setCopied] = useState(false)
  const src = `images/${project.id}/${slot.file}`

  const placeholder = slot.file.startsWith('boards') ? (
    <PrepFigure kind="denail" className="w-full h-56" />
  ) : slot.file.startsWith('detail') ? (
    <JointFigure kind={slot.joint || project.joints[0].kind} className="w-full h-56" />
  ) : (
    <HeroRender computed={computed} className="w-full h-56" />
  )

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(slot.prompt)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      /* clipboard blocked: the prompt is visible to select by hand */
    }
  }

  return (
    <figure className="rounded-2xl overflow-hidden border border-line bg-card">
      <div className="relative studio">
        <img
          src={src}
          alt={slot.title}
          onLoad={() => setStatus('ok')}
          onError={() => setStatus('missing')}
          className={status === 'ok' ? 'w-full aspect-[4/3] object-cover' : 'hidden'}
        />
        {status !== 'ok' && (
          <>
            {placeholder}
            <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-ink/85 text-paper text-[0.68rem] font-semibold px-2.5 py-1">
              <Icon name="camera" className="w-3.5 h-3.5" /> Photo slot
            </span>
          </>
        )}
      </div>
      <figcaption className="px-4 py-3 text-sm">
        <p className="font-semibold">{slot.title}</p>
        {status !== 'ok' && (
          <>
            <p className="text-xs text-muted mt-1">
              Drop a photo at <code className="bg-sand px-1.5 py-0.5 rounded text-[0.7rem] break-all">public/images/{project.id}/{slot.file}</code>
            </p>
            <details className="mt-2 group">
              <summary className="text-xs font-semibold text-rust cursor-pointer select-none">AI image prompt</summary>
              <p className="text-xs text-muted mt-2 leading-relaxed">{slot.prompt}</p>
              <button onClick={copy} className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-ink bg-sand rounded-full px-3 py-1.5">
                <Icon name={copied ? 'check' : 'copy'} className="w-3.5 h-3.5" /> {copied ? 'Copied' : 'Copy prompt'}
              </button>
            </details>
          </>
        )}
      </figcaption>
    </figure>
  )
}
