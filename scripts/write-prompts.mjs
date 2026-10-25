// Writes public/images/<project>/PROMPTS.md listing each photo slot, its file name and AI prompt.
// Run with: npm run prompts
import { writeFileSync, mkdirSync } from 'node:fs'
import { PROJECTS } from '../src/data/index.js'

for (const p of PROJECTS) {
  const dir = new URL(`../public/images/${p.id}/`, import.meta.url)
  mkdirSync(dir, { recursive: true })
  const lines = [`# ${p.name}: photo slots`, '', 'Save photos in this folder with exactly these names (JPG, about 1600px wide, 4:3). The app shows them automatically.', '']
  for (const s of p.images) lines.push(`## ${s.file}`, '', `**${s.title}**`, '', '```', s.prompt, '```', '')
  writeFileSync(new URL('PROMPTS.md', dir), lines.join('\n'))
  console.log('wrote', `public/images/${p.id}/PROMPTS.md`)
}
