// Shared content: prices, suppliers, tools, finishing and safety advice used by every project.
// Prices are typical UK ranges for autumn 2026, including VAT. Always check before you buy.

export const PRICES = {
  board3900: { name: 'Reclaimed scaffold board, 3.9m', spec: '3900 × 225 × 38mm', lo: 14, hi: 22, where: 'Reclamation or scaffold yard; Gardiners Reclaims (delivered)', cat: 'Timber' },
  board2400: { name: 'Reclaimed scaffold board, 2.4m', spec: '2400 × 225 × 38mm', lo: 9, hi: 14, where: 'Reclamation or scaffold yard; Gardiners Reclaims (delivered)', cat: 'Timber' },
  frame4800: { name: 'Framing timber C24, 4.8m', spec: '47 × 100mm', lo: 15, hi: 21, where: 'Travis Perkins, Jewson, Wickes, local timber merchant', cat: 'Timber' },
  frame3600: { name: 'Framing timber C24, 3.6m', spec: '47 × 100mm', lo: 11, hi: 16, where: 'Travis Perkins, Jewson, Wickes, local timber merchant', cat: 'Timber' },
  frame2400: { name: 'Framing timber C24, 2.4m', spec: '47 × 100mm', lo: 7, hi: 11, where: 'Travis Perkins, Jewson, Wickes, B&Q', cat: 'Timber' },
  screw80: { name: 'Wood screws 5.0 × 80mm', spec: 'Box of 100, countersunk, black or yellow zinc', pack: 100, lo: 7, hi: 11, where: 'Screwfix, Toolstation', cat: 'Fixings' },
  screw60: { name: 'Wood screws 4.0 × 60mm', spec: 'Box of 200, countersunk', pack: 200, lo: 6, hi: 9, where: 'Screwfix, Toolstation', cat: 'Fixings' },
  pocket: { name: 'Pocket-hole screws 63mm, coarse thread', spec: 'Box of 100, for 38mm softwood', pack: 100, lo: 8, hi: 14, where: 'Screwfix, Toolstation, Amazon UK', cat: 'Fixings' },
  stainAntique: { name: 'Tinted oil, dark walnut', spec: '750ml, e.g. Osmo Wood Wax Finish (walnut) or a dark oak spirit stain', pack: 1, lo: 22, hi: 38, where: 'B&Q, Wickes, decorating merchants', cat: 'Finishing' },
  stainWeathered: { name: 'Tinted oil, grey', spec: '750ml, e.g. Osmo Polyx-Oil Tints 3074 Graphite', pack: 1, lo: 38, hi: 48, where: 'B&Q, decorating merchants', cat: 'Finishing' },
  screw150: { name: 'Timber screws 6.0 × 150mm', spec: 'Box of 20, structural, Torx head', pack: 20, lo: 8, hi: 14, where: 'Screwfix, Toolstation', cat: 'Fixings' },
  felt: { name: 'Felt furniture pads', spec: 'Pack of 16, self-adhesive', pack: 16, lo: 3, hi: 6, where: 'Screwfix, B&Q, Wilko', cat: 'Hardware' },
  shelfBracket: { name: 'Black steel scaffold-board shelf brackets', spec: 'Pair, sized for 225mm boards', pack: 2, lo: 10, hi: 20, where: 'Amazon UK, Etsy, ironmongers', cat: 'Hardware' },
  wallFix: { name: 'Wall plugs and 5.0 × 70mm screws', spec: 'Pack, brown plugs for brick or block', lo: 4, hi: 7, where: 'Screwfix, Toolstation', cat: 'Fixings' },
  trough: { name: 'Plastic plant trough insert', spec: 'About 400 × 200 × 180mm, with saucer', pack: 1, lo: 6, hi: 12, where: 'Garden centres, B&Q, Dunelm', cat: 'Hardware' },
  screw30: { name: 'Black pan-head screws 4.0 × 30mm', spec: 'Box of 100 (for hinges and handles)', pack: 100, lo: 4, hi: 7, where: 'Screwfix, Toolstation', cat: 'Fixings' },
  glue: { name: 'D3 PVA wood glue', spec: '500ml bottle (water-resistant)', pack: 500, lo: 6, hi: 10, where: 'Screwfix, B&Q, Wickes', cat: 'Fixings' },
  discs: { name: 'Sanding discs, 125mm hook-and-loop', spec: 'Mixed pack of 50: 80, 120, 180 grit', pack: 50, lo: 10, hi: 16, where: 'Screwfix, Toolstation, B&Q', cat: 'Finishing' },
  polyx: { name: 'Hard-wax oil, clear satin', spec: '750ml tin, e.g. Osmo Polyx-Oil 3032', pack: 1, lo: 38, hi: 48, where: 'B&Q, Screwfix, Wickes, decorating merchants', cat: 'Finishing' },
  topoil: { name: 'Worktop oil, heat- and spill-resistant', spec: '500ml tin, e.g. Osmo Top Oil 3058 (food-safe)', pack: 1, lo: 28, hi: 36, where: 'B&Q, Wickes, decorating merchants', cat: 'Finishing' },
  filler: { name: 'Two-part wood filler or black epoxy', spec: 'For cracks and nail holes', lo: 8, hi: 14, where: 'Screwfix, Toolstation', cat: 'Finishing' },
  cloths: { name: 'Lint-free cloths and nylon finishing pads', spec: 'Pack', lo: 5, hi: 9, where: 'Screwfix, B&Q', cat: 'Finishing' },
  levellers: { name: 'Adjustable furniture feet (levellers)', spec: 'Pack of 4, M8 with T-nuts', pack: 4, lo: 6, hi: 12, where: 'Screwfix, Amazon UK', cat: 'Hardware' },
  antitip: { name: 'Furniture anti-tip wall strap kit', spec: 'Pair, steel cable or strap, with wall plugs', lo: 6, hi: 12, where: 'B&Q, Screwfix, Amazon UK', cat: 'Hardware' },
  thinge: { name: 'Black T-hinges, 300mm', spec: 'Pair, heavy duty', lo: 8, hi: 14, where: 'Screwfix, Toolstation, Wickes', cat: 'Hardware' },
  catch: { name: 'Magnetic cupboard catch', spec: 'Heavy duty, brown or black', lo: 2, hi: 4, where: 'Screwfix, Toolstation', cat: 'Hardware' },
  handle: { name: 'Black steel pull handle, 160mm', spec: 'Flat bar or D-handle, with bolts', lo: 5, hi: 10, where: 'Screwfix, Toolstation, Amazon UK', cat: 'Hardware' },
  bracket: { name: 'Steel angle brackets, 50mm', spec: 'Pack of 10, black or zinc', pack: 10, lo: 5, hi: 9, where: 'Screwfix, Toolstation', cat: 'Hardware' },
  grommet: { name: 'Cable grommet, 60mm', spec: 'Black, for kettle and microwave plugs', lo: 3, hi: 6, where: 'Screwfix, Amazon UK', cat: 'Hardware' },
  hooks: { name: 'Black mug hooks (cup hooks)', spec: 'Pack of 10, 30mm', pack: 10, lo: 4, hi: 7, where: 'B&Q, Wickes, Amazon UK', cat: 'Hardware' },
  slate: { name: 'Slate or ceramic heat mat', spec: 'About 300 × 300mm, for under the kettle', lo: 8, hi: 18, where: 'Dunelm, John Lewis, homeware shops', cat: 'Hardware' },
}

export const WHERE_TO_BUY = [
  {
    name: 'Local scaffold firms',
    detail:
      'Scaffolding companies regularly retire ("condemn") boards that are split or worn. They often sell them cheaply or give them away. Phone firms around Stratford-upon-Avon and Warwick and ask for "condemned or reclaimed boards". Bring a van or roof bars.',
  },
  {
    name: 'Reclamation yards',
    detail:
      'Yards in Warwickshire and the Cotswolds stock reclaimed scaffold boards, often already de-nailed. Ask if they can cut 3.9m boards in half so they fit in a car. Search "reclamation yard Warwickshire" for current ones.',
  },
  {
    name: 'Gardiners Reclaims (delivered)',
    detail: 'Sells reclaimed scaffold boards by the board and delivers. Handy if you have no van. Delivery costs extra, so order everything in one go.',
  },
  {
    name: 'Online marketplaces',
    detail: 'Facebook Marketplace, Gumtree and Freecycle often have scaffold boards from finished building jobs. Check them in person before paying.',
  },
  {
    name: 'Timber merchants and DIY sheds',
    detail:
      'For the 47 × 100mm framing timber, screws and finishes: Travis Perkins, Jewson, Wickes, B&Q, Screwfix and Toolstation all have branches or click-and-collect in Warwickshire. Merchants will often cut timber to length for free.',
  },
]

export const BOARD_TIPS = [
  { title: 'Smell and poke for rot', text: 'Press a screwdriver into the ends and any dark patches. Sound wood resists. Soft, spongy or musty-smelling wood is rot: leave it.' },
  { title: 'Sight along the edge', text: 'Hold one end at eye level and look down the board. A gentle curve is fine. A twist (one corner lifted) or a bad bow will fight you all the way, so skip it.' },
  { title: 'Count the nails and screws', text: 'Look over every face and edge. Old nails and screws must come out before cutting, or they will wreck your saw blade. A few is fine. Dozens means a long afternoon.' },
  { title: 'Check the ends', text: 'Scaffold boards often split at the ends. That is fine: you will trim 30mm off each end anyway. Long cracks running more than 300mm in are not fine.' },
  { title: 'Avoid concrete, tar and paint', text: 'Some boards are caked in cement or paint. Light spots sand off. Thick crusts take ages and can hide damage. Old paint may contain lead, so avoid painted boards for indoor furniture.' },
  { title: 'Keep the steel end bands (optional)', text: 'The galvanised bands on board ends are the classic scaffold look. Keep a few banded ends for the top. Wear gloves: band edges are sharp.' },
  { title: 'Buy one or two spare', text: 'Reclaimed timber hides surprises. One spare board per project saves a second trip.' },
  { title: 'Let them acclimatise', text: 'Boards stored outside are damp. Stack them flat indoors with spacers between for 1 to 2 weeks before building. Wood shrinks as it dries, and you want that to happen before you join it.' },
]

export const TOOLS = {
  tape: { name: 'Tape measure (5m)', why: 'Measuring everything. Get one that locks.' },
  square: { name: 'Combination square', why: 'Draws lines at exactly 90° so your cuts are square.' },
  pencil: { name: 'Carpenter’s pencil', why: 'Marks show up on rough wood and don’t snap.' },
  circsaw: { name: 'Circular saw (with a rip fence or guide)', why: 'Cuts boards to length and along their width (ripping). The key power tool here.' },
  drill: { name: 'Cordless drill-driver', why: 'Drills pilot holes and drives screws. 18V is ideal.' },
  bits: { name: 'Drill bits: 3mm, 4mm, 6mm, 10mm + countersink', why: '3mm pilots stop boards splitting; the countersink sinks screw heads flush.' },
  clamps: { name: '4 × quick-grip clamps (300mm+)', why: 'Hold parts tight while glue sets and while you screw. Your extra pair of hands.' },
  sander: { name: 'Random orbital sander (125mm)', why: 'Turns grey, rough boards into smooth, honey-coloured wood. Swirl-free.' },
  denail: { name: 'Claw hammer, pincers and nail punch', why: 'Pulls out old nails, or punches stubborn ones deep below the surface.' },
  brush: { name: 'Stiff wire brush', why: 'Scrubs off dirt, cement and loose fibres before sanding.' },
  level: { name: 'Spirit level (600mm)', why: 'Checks things are flat and upright. Old mill floors rarely are.' },
  trestles: { name: '2 sawhorses or a workbench', why: 'Holds boards at a safe working height for cutting.' },
  ppe: { name: 'FFP3 dust mask, safety glasses, ear defenders, gloves', why: 'Non-negotiable. See the Safety tab.' },
  mitre: { name: 'Sliding mitre saw (255mm+)', why: 'Perfectly square crosscuts in one pass. A 225mm board needs a sliding model.' },
  pocket: { name: 'Pocket-hole jig (e.g. Kreg)', why: 'Drills angled holes so screws are hidden on the underside.' },
  impact: { name: 'Impact driver', why: 'Drives long screws into hard old timber without stripping heads.' },
  barclamps: { name: '2 × long sash or bar clamps (1m+)', why: 'Pulls glued boards tight across a whole panel.' },
  nailfinder: { name: 'Metal detector pen', why: 'Finds hidden nail stubs before your saw does.' },
  plane: { name: 'Electric planer or No. 4 hand plane', why: 'Flattens cupped boards and evens up joints on tops.' },
  detector: { name: 'Cable and pipe detector', why: 'Checks the wall is safe to drill before fixing anti-tip straps.' },
  holesaw: { name: '60mm hole saw', why: 'Cuts the round hole for the cable grommet.' },
  jigsaw: { name: 'Jigsaw', why: 'Curved or awkward cuts, and finishing rip cuts the circular saw can’t reach.' },
}

export const HIRE_NOTE =
  'You don’t need to buy the big tools. HSS Hire and Brandon Hire rent sanders and saws by the day, and many reclamation yards and merchants will cut boards to length for you.'

export const SANDING = [
  { grit: '40–60', label: 'Only if needed', text: 'For boards with heavy grey weathering, saw marks or cement. Skip this if the wood is fairly clean.' },
  { grit: '80', label: 'Shape', text: 'Removes the weathered grey layer and levels the surface. This is where most of the work happens.' },
  { grit: '120', label: 'Smooth', text: 'Removes the scratches left by 80. Go over every surface once.' },
  { grit: '180', label: 'Finish', text: 'Final pass for tops and anything you touch. Feels silky. Don’t go finer: oil soaks in better at 180.' },
]

export const PRO_TIPS = [
  'Sand in order and never skip a grit: 80 → 120 → 180. Skipping leaves swirl marks that oil makes more obvious.',
  'Soften every edge with a few passes of 120 grit held in your hand. Crisp-but-soft edges look professional and don’t splinter.',
  'Wipe down with a damp cloth after 120 grit, let it dry, then sand at 180. The water raises loose fibres so you can knock them off.',
  'Line up screw heads in neat rows using a pencil line. Visible black screws in tidy rows read as an industrial detail, not a mistake.',
  'Keep the character (nail holes, saw marks, bands) but fill or sand anything sharp or loose.',
  'Thin coats of oil, wiped off after 15–20 minutes. Thick coats stay sticky and look plasticky.',
  'Pick the best-looking boards for the top and front. Hide the ugly ones at the back and bottom.',
  'Ease the ends of boards with a slight chamfer (a 2mm angled edge) to show off the end grain.',
]

export const FINISH_STEPS = [
  { title: 'De-nail and clean', text: 'Pull or punch every nail and staple. Scrub with a stiff wire brush and warm soapy water. Let the boards dry for at least 2 days.' },
  { title: 'Fill cracks (optional)', text: 'Fill loose knots and cracks with two-part filler or black epoxy (black looks deliberate and industrial). Overfill slightly and sand flush when hard.' },
  { title: 'Sand', text: 'Follow the grit order below. Vacuum between grits so loose grit doesn’t scratch the next stage.' },
  { title: 'Dust off', text: 'Vacuum, then wipe with a barely damp lint-free cloth. Dust trapped under oil feels rough.' },
  { title: 'First coat', text: 'Apply a thin coat of hard-wax oil with a nylon pad or brush, along the grain. Wipe off any excess after 15–20 minutes. Leave 8–12 hours.' },
  { title: 'Second coat', text: 'Lightly rub with a fine nylon pad, wipe clean, then apply a second thin coat. Leave 24 hours before light use, and about 2 weeks to fully harden.' },
]

export const FINISH_OPTIONS = [
  { name: 'Hard-wax oil (recommended)', text: 'Soaks in and hardens. Looks natural, not plasticky. Easy to repair scratches by sanding locally and re-oiling. Example: Osmo Polyx-Oil, Fiddes Hard Wax Oil.' },
  { name: 'Worktop oil', text: 'Thinner, food-safe oil built for kitchen worktops. Resists water, wine, coffee and warm mugs. Example: Osmo Top Oil.' },
  { name: 'Wax only', text: 'Lovely soft look but marks easily with water rings. Fine for a bookcase, not for the sideboard or kitchen unit.' },
  { name: 'Water-based varnish', text: 'The toughest option, but it sits on top of the wood and can look plastic on rustic boards. Use a matt one if you need extra protection.' },
]

export const SAFETY_BASE = [
  { title: 'Dust mask (FFP3)', text: 'Sanding reclaimed timber makes fine dust that may carry old site dirt. Wear an FFP3 mask for all sanding and cutting. Work outside or with a window open and a vacuum running.' },
  { title: 'Eyes and ears', text: 'Safety glasses whenever you cut, drill or de-nail (nails fly). Ear defenders with the circular saw and sander.' },
  { title: 'Gloves, but not near blades', text: 'Wear gloves to handle rough boards and steel bands. Take them off to use the saw so they can’t be caught.' },
  { title: 'Saw safety', text: 'Clamp the board down. Keep both hands on the saw. Let the blade stop before lifting it. Unplug or remove the battery when changing blades.' },
  { title: 'Nails before cutting', text: 'Check every cut line for hidden nails with your eyes or a metal detector pen. Hitting one can kick the saw back at you.' },
  { title: 'Oily rags can catch fire', text: 'Rags soaked in hard-wax oil can heat up and self-ignite as they dry. Lay them flat outside to dry, or soak them in water in a sealed tin before binning.' },
  { title: 'Lifting', text: 'Finished pieces are heavy (see the weight on the Overview tab). Lift with two people, bend your knees, and carry them empty.' },
]

export const COMMON_AREA_RULES = [
  'Keep corridors, stairs and landings that are fire escape routes completely clear. Don’t place furniture in protected stairways or in front of fire doors, fire exits, call points, extinguishers or signs.',
  'In a shared building, the managing agent or freeholder is the "Responsible Person" under the Regulatory Reform (Fire Safety) Order 2005. Ask them before putting furniture in common areas. It may be covered by the building’s fire risk assessment.',
  'Leave at least the full width of the corridor or route clear. If a door swings, nothing should sit in its path.',
  'Untreated timber burns. Keep it away from heaters and never store anything flammable (paint, oily rags) in these pieces.',
]
