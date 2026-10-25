import sideboard from './sideboard.js'
import bookcase from './bookcase.js'
import kitchen from './kitchen.js'
import cubes from './cubes.js'
import table from './table.js'
import bench from './bench.js'
import shoeRack from './shoerack.js'
import shelves from './shelves.js'
import planter from './planter.js'
import coffee from './coffee.js'
import sideTable from './sidetable.js'
import coatRack from './coatrack.js'
import crates from './crates.js'
import plantStand from './tiered.js'
import logRack from './lograck.js'
import headboard from './headboard.js'
import tvUnit from './tvunit.js'
import desk from './desk.js'
import barTable from './bartable.js'

export const PROJECTS = [
  sideboard, bookcase, cubes, kitchen, table,
  bench, shoeRack, shelves, planter,
  coffee, sideTable, coatRack, crates, plantStand, logRack, headboard,
  tvUnit, desk, barTable,
]
export const byId = Object.fromEntries(PROJECTS.map((p) => [p.id, p]))
