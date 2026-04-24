import type { AreaId, Language } from "./game-state"

// Undertale-inspired dark color palette
export type TileType =
  | "void"
  | "grass"
  | "path"
  | "water"
  | "wood_floor"
  | "stone_floor"
  | "wall"
  | "door"
  | "counter"
  | "decoration"
  | "tree"
  | "flower"
  | "market_stall"
  | "fountain"
  | "carpet"
  | "shelf"
  | "sand"
  | "deep_water"
  | "dark_grass"
  | "mushroom"
  | "log"
  | "torii"
  | "shrine_floor"
  | "offering_box"
  | "desk"
  | "blackboard"
  | "hot_spring_water"
  | "bamboo_fence"
  | "rocks"
  | "crop_soil"
  | "crop_growing"
  | "crop_ready"
  | "fence"
  | "bridge"

export interface SimpleTile {
  type: TileType
  walkable: boolean
  color: string
}

// Dark Undertale-inspired colors
export const TILE_COLORS: Record<TileType, SimpleTile> = {
  void: { type: "void", walkable: false, color: "#0a0a0a" },
  grass: { type: "grass", walkable: true, color: "#1a3d1a" },
  path: { type: "path", walkable: true, color: "#3d3425" },
  water: { type: "water", walkable: false, color: "#1a2d4a" },
  wood_floor: { type: "wood_floor", walkable: true, color: "#2d1f14" },
  stone_floor: { type: "stone_floor", walkable: true, color: "#2a2a2a" },
  wall: { type: "wall", walkable: false, color: "#1a1a2e" },
  door: { type: "door", walkable: true, color: "#4a3520" },
  counter: { type: "counter", walkable: false, color: "#3d2814" },
  decoration: { type: "decoration", walkable: false, color: "#4a3f35" },
  tree: { type: "tree", walkable: false, color: "#0d2d0d" },
  flower: { type: "flower", walkable: true, color: "#1a3d1a" },
  market_stall: { type: "market_stall", walkable: false, color: "#3d2020" },
  fountain: { type: "fountain", walkable: false, color: "#1a3d4a" },
  carpet: { type: "carpet", walkable: true, color: "#4a1a1a" },
  shelf: { type: "shelf", walkable: false, color: "#2d2014" },
  sand: { type: "sand", walkable: true, color: "#8B7D3C" },
  deep_water: { type: "deep_water", walkable: false, color: "#0d1a2d" },
  dark_grass: { type: "dark_grass", walkable: true, color: "#0f2d0f" },
  mushroom: { type: "mushroom", walkable: false, color: "#1a2d1a" },
  log: { type: "log", walkable: false, color: "#3d2814" },
  torii: { type: "torii", walkable: false, color: "#8B0000" },
  shrine_floor: { type: "shrine_floor", walkable: true, color: "#2a2520" },
  offering_box: { type: "offering_box", walkable: false, color: "#4a3520" },
  desk: { type: "desk", walkable: false, color: "#3d2814" },
  blackboard: { type: "blackboard", walkable: false, color: "#1a3d2a" },
  hot_spring_water: { type: "hot_spring_water", walkable: false, color: "#2a4a5a" },
  bamboo_fence: { type: "bamboo_fence", walkable: false, color: "#3d5a1a" },
  rocks: { type: "rocks", walkable: false, color: "#3a3a3a" },
  crop_soil: { type: "crop_soil", walkable: true, color: "#3d2510" },
  crop_growing: { type: "crop_growing", walkable: false, color: "#2d3d10" },
  crop_ready: { type: "crop_ready", walkable: false, color: "#3d5a10" },
  fence: { type: "fence", walkable: false, color: "#5a4020" },
  bridge: { type: "bridge", walkable: true, color: "#4a3520" },
}

export interface AreaMap {
  id: AreaId
  name: Record<Language, string>
  width: number
  height: number
  tiles: TileType[][]
  playerStart: { x: number; y: number }
  exits: { x: number; y: number; targetArea: AreaId; targetX: number; targetY: number }[]
}

const createEmptyMap = (width: number, height: number, fill: TileType): TileType[][] => {
  return Array.from({ length: height }, () => Array.from({ length: width }, () => fill))
}

export const AREA_MAPS: Record<AreaId, AreaMap> = {
  inn: {
    id: "inn",
    name: { es: "La Posada Oscura" },
    width: 12,
    height: 10,
    tiles: (() => {
      const map = createEmptyMap(12, 10, "wood_floor")
      for (let x = 0; x < 12; x++) {
        map[0][x] = "wall"
        map[9][x] = "wall"
      }
      for (let y = 0; y < 10; y++) {
        map[y][0] = "wall"
        map[y][11] = "wall"
      }
      // Carpet
      for (let x = 4; x < 8; x++) {
        for (let y = 3; y < 7; y++) {
          map[y][x] = "carpet"
        }
      }
      map[2][6] = "counter"
      map[2][7] = "counter"
      map[2][8] = "counter"
      map[9][5] = "door"
      map[9][6] = "door"
      map[1][1] = "decoration"
      map[1][10] = "decoration"
      return map
    })(),
    playerStart: { x: 5, y: 7 },
    exits: [{ x: 5, y: 9, targetArea: "town_square", targetX: 6, targetY: 1 }],
  },

  town_square: {
    id: "town_square",
    name: { es: "Plaza del Silencio" },
    width: 14,
    height: 12,
    tiles: (() => {
      const map = createEmptyMap(14, 12, "grass")
      // Central path
      for (let x = 3; x < 11; x++) {
        map[5][x] = "path"
        map[6][x] = "path"
      }
      for (let y = 0; y < 12; y++) {
        map[y][6] = "path"
        map[y][7] = "path"
      }
      // Fountain in center
      map[5][6] = "fountain"
      map[5][7] = "fountain"
      map[6][6] = "fountain"
      map[6][7] = "fountain"
      // Trees around edges
      map[1][1] = "tree"
      map[1][12] = "tree"
      map[10][1] = "tree"
      map[10][12] = "tree"
      map[3][1] = "tree"
      map[8][12] = "tree"
      // Flowers
      map[2][2] = "flower"
      map[2][11] = "flower"
      map[9][2] = "flower"
      map[9][11] = "flower"
      return map
    })(),
    playerStart: { x: 6, y: 6 },
    exits: [
      { x: 6, y: 0, targetArea: "inn", targetX: 5, targetY: 8 },
      { x: 7, y: 0, targetArea: "forest", targetX: 6, targetY: 10 },
      { x: 0, y: 5, targetArea: "fish_market", targetX: 10, targetY: 5 },
      { x: 13, y: 5, targetArea: "fruit_stand", targetX: 1, targetY: 5 },
      { x: 0, y: 8, targetArea: "bakery", targetX: 10, targetY: 5 },
      { x: 13, y: 8, targetArea: "town_hall", targetX: 1, targetY: 5 },
      { x: 6, y: 11, targetArea: "garden", targetX: 6, targetY: 1 },
      { x: 7, y: 11, targetArea: "farm", targetX: 6, targetY: 1 },
      { x: 13, y: 2, targetArea: "shop", targetX: 1, targetY: 5 },
      { x: 0, y: 2, targetArea: "school", targetX: 5, targetY: 8 },
      { x: 13, y: 10, targetArea: "beach", targetX: 1, targetY: 6 },
    ],
  },

  fish_market: {
    id: "fish_market",
    name: { es: "Mercado de Pedro" },
    width: 12,
    height: 10,
    tiles: (() => {
      const map = createEmptyMap(12, 10, "stone_floor")
      for (let x = 0; x < 12; x++) {
        map[0][x] = "wall"
      }
      for (let y = 0; y < 10; y++) {
        map[y][0] = "wall"
      }
      map[3][3] = "market_stall"
      map[3][4] = "market_stall"
      map[3][5] = "market_stall"
      map[2][8] = "water"
      map[3][8] = "water"
      map[5][11] = "path"
      return map
    })(),
    playerStart: { x: 6, y: 6 },
    exits: [{ x: 11, y: 5, targetArea: "town_square", targetX: 1, targetY: 5 }],
  },

  fruit_stand: {
    id: "fruit_stand",
    name: { es: "El Rincon de Lola" },
    width: 12,
    height: 10,
    tiles: (() => {
      const map = createEmptyMap(12, 10, "grass")
      for (let x = 0; x < 12; x++) {
        map[5][x] = "path"
      }
      map[2][5] = "market_stall"
      map[2][6] = "market_stall"
      map[2][7] = "market_stall"
      map[7][4] = "flower"
      map[7][8] = "flower"
      map[1][1] = "tree"
      map[1][10] = "tree"
      return map
    })(),
    playerStart: { x: 6, y: 6 },
    exits: [{ x: 0, y: 5, targetArea: "town_square", targetX: 12, targetY: 5 }],
  },

  bakery: {
    id: "bakery",
    name: { es: "Panaderia del Filosofo" },
    width: 12,
    height: 10,
    tiles: (() => {
      const map = createEmptyMap(12, 10, "wood_floor")
      for (let x = 0; x < 12; x++) {
        map[0][x] = "wall"
        map[9][x] = "wall"
      }
      for (let y = 0; y < 10; y++) {
        map[y][0] = "wall"
      }
      map[3][4] = "counter"
      map[3][5] = "counter"
      map[3][6] = "counter"
      map[1][8] = "decoration"
      map[2][8] = "decoration"
      map[5][11] = "door"
      return map
    })(),
    playerStart: { x: 6, y: 6 },
    exits: [{ x: 11, y: 5, targetArea: "town_square", targetX: 1, targetY: 8 }],
  },

  town_hall: {
    id: "town_hall",
    name: { es: "Palacio de Don Magnifico" },
    width: 12,
    height: 10,
    tiles: (() => {
      const map = createEmptyMap(12, 10, "stone_floor")
      for (let x = 0; x < 12; x++) {
        map[0][x] = "wall"
        map[9][x] = "wall"
      }
      for (let y = 0; y < 10; y++) {
        map[y][11] = "wall"
      }
      // Red carpet
      for (let y = 2; y < 8; y++) {
        map[y][5] = "carpet"
        map[y][6] = "carpet"
      }
      map[2][6] = "counter"
      map[2][7] = "counter"
      map[1][3] = "decoration"
      map[1][9] = "decoration"
      map[5][0] = "door"
      return map
    })(),
    playerStart: { x: 6, y: 6 },
    exits: [{ x: 0, y: 5, targetArea: "town_square", targetX: 12, targetY: 8 }],
  },

  garden: {
    id: "garden",
    name: { es: "Jardin de la Abuela" },
    width: 14,
    height: 10,
    tiles: (() => {
      const map = createEmptyMap(14, 10, "grass")
      for (let x = 3; x < 11; x++) {
        map[5][x] = "path"
      }
      map[3][3] = "path"
      map[4][3] = "path"
      map[6][10] = "path"
      map[7][10] = "path"
      // Lots of flowers
      map[2][2] = "flower"
      map[2][5] = "flower"
      map[2][8] = "flower"
      map[2][11] = "flower"
      map[7][2] = "flower"
      map[7][5] = "flower"
      map[7][8] = "flower"
      map[7][11] = "flower"
      map[4][4] = "flower"
      map[4][9] = "flower"
      // Trees
      map[1][6] = "tree"
      map[1][7] = "tree"
      map[8][6] = "tree"
      map[8][7] = "tree"
      // Fountain
      map[4][7] = "fountain"
      map[5][7] = "fountain"
      return map
    })(),
    playerStart: { x: 6, y: 3 },
    exits: [
      { x: 6, y: 0, targetArea: "town_square", targetX: 6, targetY: 10 },
      { x: 13, y: 7, targetArea: "hot_spring", targetX: 5, targetY: 8 },
    ],
  },

  shop: {
    id: "shop",
    name: { es: "Tienda de Memo" },
    width: 12,
    height: 10,
    tiles: (() => {
      const map = createEmptyMap(12, 10, "wood_floor")
      for (let x = 0; x < 12; x++) {
        map[0][x] = "wall"
        map[9][x] = "wall"
      }
      for (let y = 0; y < 10; y++) {
        map[y][11] = "wall"
      }
      // Shelves
      map[1][3] = "shelf"
      map[1][4] = "shelf"
      map[1][5] = "shelf"
      map[1][7] = "shelf"
      map[1][8] = "shelf"
      map[1][9] = "shelf"
      // Counter
      map[3][4] = "counter"
      map[3][5] = "counter"
      map[3][6] = "counter"
      // Display carpet
      for (let x = 3; x < 9; x++) {
        map[6][x] = "carpet"
        map[7][x] = "carpet"
      }
      map[5][0] = "door"
      return map
    })(),
    playerStart: { x: 6, y: 6 },
    exits: [{ x: 0, y: 5, targetArea: "town_square", targetX: 12, targetY: 2 }],
  },

  forest: {
    id: "forest",
    name: { es: "Bosque Oscuro" },
    width: 14,
    height: 12,
    tiles: (() => {
      const map = createEmptyMap(14, 12, "dark_grass")
      // Path through forest
      for (let x = 5; x < 9; x++) { map[11][x] = "path" }
      for (let y = 3; y < 12; y++) { map[y][6] = "path"; map[y][7] = "path" }
      for (let x = 6; x < 12; x++) { map[3][x] = "path" }
      // Trees everywhere
      for (const [y, x] of [[0,0],[0,3],[0,5],[0,8],[0,10],[0,13],[1,1],[1,4],[1,11],[2,0],[2,2],[2,5],[2,9],[2,12],[2,13],[4,0],[4,1],[4,3],[4,10],[4,12],[4,13],[5,0],[5,4],[5,9],[5,13],[6,1],[6,4],[6,9],[6,12],[7,0],[7,3],[7,10],[7,13],[8,1],[8,4],[8,9],[8,12],[9,0],[9,3],[9,10],[9,13],[10,1],[10,4],[10,9],[10,12]]) {
        map[y][x] = "tree"
      }
      // Mushrooms
      map[3][2] = "mushroom"; map[5][5] = "mushroom"; map[8][8] = "mushroom"
      // Logs
      map[6][3] = "log"; map[9][9] = "log"
      // Exit to shrine at top
      map[0][6] = "path"; map[0][7] = "path"
      return map
    })(),
    playerStart: { x: 6, y: 10 },
    exits: [
      { x: 6, y: 11, targetArea: "town_square", targetX: 6, targetY: 1 },
      { x: 7, y: 11, targetArea: "town_square", targetX: 7, targetY: 1 },
      { x: 6, y: 0, targetArea: "shrine", targetX: 5, targetY: 8 },
      { x: 7, y: 0, targetArea: "shrine", targetX: 6, targetY: 8 },
    ],
  },

  beach: {
    id: "beach",
    name: { es: "Playa Tranquila" },
    width: 16,
    height: 10,
    tiles: (() => {
      const map = createEmptyMap(16, 10, "sand")
      // Ocean (deep water at top)
      for (let x = 0; x < 16; x++) {
        map[0][x] = "deep_water"; map[1][x] = "deep_water"; map[2][x] = "deep_water"
      }
      // Water edge
      for (let x = 0; x < 16; x++) { map[3][x] = "water" }
      // Pier / bridge
      map[2][7] = "bridge"; map[3][7] = "bridge"; map[1][7] = "bridge"
      // Rocks
      map[5][2] = "rocks"; map[4][12] = "rocks"; map[6][14] = "rocks"
      // Path to exit
      for (let y = 5; y < 10; y++) { map[y][0] = "path" }
      map[9][0] = "path"
      return map
    })(),
    playerStart: { x: 8, y: 6 },
    exits: [
      { x: 0, y: 9, targetArea: "town_square", targetX: 12, targetY: 5 },
    ],
  },

  shrine: {
    id: "shrine",
    name: { es: "Santuario Sagrado" },
    width: 12,
    height: 10,
    tiles: (() => {
      const map = createEmptyMap(12, 10, "shrine_floor")
      // Trees around edges
      for (let y = 0; y < 10; y++) { map[y][0] = "tree"; map[y][11] = "tree" }
      for (let x = 0; x < 12; x++) { map[0][x] = "tree" }
      // Torii gate
      map[3][5] = "torii"; map[3][6] = "torii"
      // Path to offering
      for (let y = 4; y < 9; y++) { map[y][5] = "path"; map[y][6] = "path" }
      // Offering box
      map[2][5] = "offering_box"; map[2][6] = "offering_box"
      // Flowers around
      map[4][3] = "flower"; map[4][8] = "flower"
      map[6][3] = "flower"; map[6][8] = "flower"
      // Exit at bottom
      map[9][5] = "path"; map[9][6] = "path"
      return map
    })(),
    playerStart: { x: 5, y: 7 },
    exits: [
      { x: 5, y: 9, targetArea: "forest", targetX: 6, targetY: 1 },
      { x: 6, y: 9, targetArea: "forest", targetX: 7, targetY: 1 },
    ],
  },

  school: {
    id: "school",
    name: { es: "Escuela del Pueblo" },
    width: 12,
    height: 10,
    tiles: (() => {
      const map = createEmptyMap(12, 10, "wood_floor")
      // Walls
      for (let x = 0; x < 12; x++) { map[0][x] = "wall"; map[9][x] = "wall" }
      for (let y = 0; y < 10; y++) { map[y][0] = "wall"; map[y][11] = "wall" }
      // Blackboard
      map[1][3] = "blackboard"; map[1][4] = "blackboard"; map[1][5] = "blackboard"
      map[1][6] = "blackboard"; map[1][7] = "blackboard"; map[1][8] = "blackboard"
      // Desks (3 rows)
      map[4][3] = "desk"; map[4][5] = "desk"; map[4][7] = "desk"; map[4][9] = "desk"
      map[6][3] = "desk"; map[6][5] = "desk"; map[6][7] = "desk"; map[6][9] = "desk"
      // Door
      map[9][5] = "door"; map[9][6] = "door"
      return map
    })(),
    playerStart: { x: 5, y: 7 },
    exits: [
      { x: 5, y: 9, targetArea: "town_square", targetX: 1, targetY: 2 },
      { x: 6, y: 9, targetArea: "town_square", targetX: 1, targetY: 2 },
    ],
  },

  hot_spring: {
    id: "hot_spring",
    name: { es: "Aguas Termales" },
    width: 12,
    height: 10,
    tiles: (() => {
      const map = createEmptyMap(12, 10, "stone_floor")
      // Bamboo fence borders
      for (let x = 0; x < 12; x++) { map[0][x] = "bamboo_fence"; map[9][x] = "bamboo_fence" }
      for (let y = 0; y < 10; y++) { map[y][0] = "bamboo_fence"; map[y][11] = "bamboo_fence" }
      // Hot spring pool
      for (let x = 3; x < 9; x++) {
        for (let y = 3; y < 7; y++) {
          map[y][x] = "hot_spring_water"
        }
      }
      // Rocks around pool
      map[2][3] = "rocks"; map[2][8] = "rocks"
      map[7][3] = "rocks"; map[7][8] = "rocks"
      map[4][2] = "rocks"; map[5][9] = "rocks"
      // Path and door
      map[9][5] = "path"; map[9][6] = "path"
      return map
    })(),
    playerStart: { x: 5, y: 8 },
    exits: [
      { x: 5, y: 9, targetArea: "garden", targetX: 10, targetY: 7 },
      { x: 6, y: 9, targetArea: "garden", targetX: 10, targetY: 7 },
    ],
  },

  farm: {
    id: "farm",
    name: { es: "La Granja" },
    width: 14,
    height: 10,
    tiles: (() => {
      const map = createEmptyMap(14, 10, "grass")
      // Fence around edges
      for (let x = 0; x < 14; x++) { map[0][x] = "fence"; map[9][x] = "fence" }
      for (let y = 0; y < 10; y++) { map[y][0] = "fence"; map[y][13] = "fence" }
      // Path through middle
      for (let x = 1; x < 13; x++) { map[5][x] = "path" }
      for (let y = 1; y < 9; y++) { map[y][6] = "path"; map[y][7] = "path" }
      // Crop rows (top half)
      for (let x = 2; x < 5; x++) { map[2][x] = "crop_soil"; map[3][x] = "crop_growing" }
      for (let x = 9; x < 12; x++) { map[2][x] = "crop_growing"; map[3][x] = "crop_ready" }
      // Crop rows (bottom half)
      for (let x = 2; x < 5; x++) { map[7][x] = "crop_ready"; map[8][x] = "crop_soil" }
      for (let x = 9; x < 12; x++) { map[7][x] = "crop_soil"; map[8][x] = "crop_growing" }
      // Gate at top
      map[0][6] = "path"; map[0][7] = "path"
      return map
    })(),
    playerStart: { x: 6, y: 4 },
    exits: [
      { x: 6, y: 0, targetArea: "town_square", targetX: 6, targetY: 10 },
      { x: 7, y: 0, targetArea: "town_square", targetX: 7, targetY: 10 },
    ],
  },
}

export function getAreaMap(areaId: AreaId): AreaMap {
  return AREA_MAPS[areaId]
}

export function isTileWalkable(areaId: AreaId, x: number, y: number): boolean {
  const area = AREA_MAPS[areaId]
  if (x < 0 || x >= area.width || y < 0 || y >= area.height) {
    return false
  }
  const tileType = area.tiles[y]?.[x]
  if (!tileType) return false
  return TILE_COLORS[tileType].walkable
}

export function checkForExit(areaId: AreaId, x: number, y: number): { targetArea: AreaId; targetX: number; targetY: number } | null {
  const area = AREA_MAPS[areaId]
  const exit = area.exits.find((e) => e.x === x && e.y === y)
  return exit ? { targetArea: exit.targetArea, targetX: exit.targetX, targetY: exit.targetY } : null
}
