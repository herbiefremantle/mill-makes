// The preparation steps every scaffold-board build starts with, so the easy projects stay short and consistent.

export const mm = (n) => `${Math.round(n)}mm`

/**
 * prepSteps({ pick, cut, rip, sand })
 *  pick: what to choose the best boards for
 *  cut:  array of sentences listing the pieces
 *  rip:  sentence about ripping, or null to skip the ripping step
 *  sand: optional extra sentence for the sanding step
 */
export function prepSteps({ pick, cut, rip, sand }) {
  const steps = [
    {
      title: 'Bring the boards indoors and pick your best',
      body: ['Stack the boards flat indoors with spacers between them for 1 to 2 weeks.', `Then pick the best-looking, flattest boards for ${pick}. Mark them in pencil on the end.`],
      why: 'Wood shrinks as it dries. If it shrinks after you’ve built with it, gaps and cracks open up.',
      check: 'Boards have been indoors at least a week and your best ones are marked.',
      scene: { prep: 'default' },
    },
    {
      title: 'Take out every nail, then scrub and dry',
      body: ['Pull or punch every nail and staple. Then scrub with a wire brush and warm soapy water along the grain.', 'Stand the boards on edge to dry for 2 days.'],
      why: 'Hidden nails ruin blades. Grit clogs sandpaper in seconds.',
      check: 'A magnet finds nothing along your cut lines, and the boards are dry.',
      scene: { prep: 'denail' },
    },
    {
      title: 'Cut everything to length',
      body: ['Trim 30mm off each board end first to remove splits. Then follow the Cutting plan tab.', ...cut],
      why: 'Square, identical cuts are what make it go together without gaps.',
      check: 'Every piece in the cut list is cut, labelled with its letter, and within 1mm.',
      scene: { prep: 'cut' },
    },
  ]
  if (rip)
    steps.push({
      title: 'Rip the narrow pieces',
      body: [rip, 'Cut slowly against the saw’s rip fence or a clamped straight edge.'],
      why: 'A straight ripped edge sits tight against its neighbour.',
      check: 'Ripped edges are straight when two are held together against the light.',
      scene: { prep: 'rip' },
    })
  steps.push({
    title: 'Sand everything at 80, then 120 grit',
    body: ['Sand every face before assembly. It’s far easier on loose pieces.', ...(sand ? [sand] : [])],
    why: 'Corners are hard to reach once it’s built.',
    check: 'No grey weathered wood left on any face you’ll see.',
    scene: { prep: 'sand' },
  })
  return steps
}

export const finishStep = (extra) => ({
  title: 'Final sand and finish',
  body: ['Sand at 180 grit and soften every edge by hand.', extra || 'Apply your chosen finish: two thin coats. See the Finish tab.'],
  why: 'A finished surface resists marks and spills, and brings out the grain.',
  check: 'Dry to the touch, no sticky patches.',
  scene: { prep: 'oil' },
})
