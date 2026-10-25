import sideboard from './sideboard.js'
import bookcase from './bookcase.js'
import kitchen from './kitchen.js'
import cubes from './cubes.js'
import table from './table.js'
import bench from './bench.js'
import shoeRack from './shoerack.js'
import shelves from './shelves.js'
import planter from './planter.js'

export const PROJECTS = [sideboard, bookcase, cubes, kitchen, table, bench, shoeRack, shelves, planter]
export const byId = Object.fromEntries(PROJECTS.map((p) => [p.id, p]))
