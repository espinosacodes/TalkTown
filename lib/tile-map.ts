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
    name: { es: "La Posada Oscura", ja: "暗い宿" },
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
    name: { es: "Plaza del Silencio", ja: "静寂の広場" },
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
      { x: 0, y: 5, targetArea: "fish_market", targetX: 10, targetY: 5 },
      { x: 13, y: 5, targetArea: "fruit_stand", targetX: 1, targetY: 5 },
      { x: 0, y: 8, targetArea: "bakery", targetX: 10, targetY: 5 },
      { x: 13, y: 8, targetArea: "town_hall", targetX: 1, targetY: 5 },
      { x: 6, y: 11, targetArea: "garden", targetX: 6, targetY: 1 },
      { x: 13, y: 2, targetArea: "shop", targetX: 1, targetY: 5 },
    ],
  },
  
  fish_market: {
    id: "fish_market",
    name: { es: "Mercado de Pedro", ja: "ゴウタの市場" },
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
    name: { es: "El Rincon de Lola", ja: "ミミの角" },
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
    name: { es: "Panaderia del Filosofo", ja: "哲学者のパン屋" },
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
    name: { es: "Palacio de Don Magnifico", ja: "グランド様の宮殿" },
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
    name: { es: "Jardin de la Abuela", ja: "おばあちゃんの庭" },
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
    exits: [{ x: 6, y: 0, targetArea: "town_square", targetX: 6, targetY: 10 }],
  },
  
  shop: {
    id: "shop",
    name: { es: "Tienda de Memo", ja: "メモの店" },
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
