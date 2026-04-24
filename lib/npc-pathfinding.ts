import type { AreaId } from "./game-state"
import { isTileWalkable, AREA_MAPS } from "./tile-map"

interface Point {
  x: number
  y: number
}

/**
 * BFS pathfinding on the tile grid.
 * Returns the path from `from` to `to`, excluding the start position.
 * Destination tile is always treated as reachable (NPCs stand behind counters, etc.).
 * Returns empty array if no path found or start === end.
 */
export function findPath(areaId: AreaId, from: Point, to: Point): Point[] {
  if (from.x === to.x && from.y === to.y) return []

  const area = AREA_MAPS[areaId]
  if (!area) return []

  const w = area.width
  const h = area.height

  // BFS
  const visited = new Set<string>()
  const parent = new Map<string, string>()
  const queue: Point[] = [from]
  const key = (p: Point) => `${p.x},${p.y}`

  visited.add(key(from))

  const dirs = [
    { x: 0, y: -1 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
    { x: 1, y: 0 },
  ]

  while (queue.length > 0) {
    const current = queue.shift()!
    const ck = key(current)

    if (current.x === to.x && current.y === to.y) {
      // Reconstruct path
      const path: Point[] = []
      let step = key(to)
      while (step !== key(from)) {
        const [sx, sy] = step.split(",").map(Number)
        path.unshift({ x: sx, y: sy })
        step = parent.get(step)!
      }
      return path
    }

    for (const dir of dirs) {
      const nx = current.x + dir.x
      const ny = current.y + dir.y
      const nk = key({ x: nx, y: ny })

      if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue
      if (visited.has(nk)) continue

      // Destination is always reachable; other tiles must be walkable
      const isDestination = nx === to.x && ny === to.y
      if (!isDestination && !isTileWalkable(areaId, nx, ny)) continue

      visited.add(nk)
      parent.set(nk, ck)
      queue.push({ x: nx, y: ny })
    }
  }

  // No path found — teleport fallback will handle this
  return []
}
