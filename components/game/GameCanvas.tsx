"use client"

import { useEffect, useCallback, useState, useRef } from "react"
import { useGame } from "@/lib/game-context"
import { AREA_MAPS, TILE_COLORS, type TileType } from "@/lib/tile-map"
import { getNPCsInArea } from "@/lib/npc-profiles"
import { PlayerSprite } from "./PlayerSprite"
import { NPCSprite } from "./NPCSprite"

const TILE_SIZE = 36

export function GameCanvas() {
  const { gameState, movePlayer, setActiveNpcId, activeNpcId } = useGame()
  const [areaTransition, setAreaTransition] = useState<string | null>(null)
  const [timeOfDay, setTimeOfDay] = useState<"morning" | "afternoon" | "evening">("morning")
  const prevAreaRef = useRef<string | null>(null)

  // Time of day cycle (cosmetic)
  useEffect(() => {
    const cycle = () => {
      const minute = new Date().getMinutes()
      if (minute < 20) setTimeOfDay("morning")
      else if (minute < 40) setTimeOfDay("afternoon")
      else setTimeOfDay("evening")
    }
    cycle()
    const interval = setInterval(cycle, 30000)
    return () => clearInterval(interval)
  }, [])

  // Area transition animation
  useEffect(() => {
    if (!gameState) return
    if (prevAreaRef.current && prevAreaRef.current !== gameState.currentArea) {
      const areaMap = AREA_MAPS[gameState.currentArea]
      setAreaTransition(areaMap.name.es)
      const timer = setTimeout(() => setAreaTransition(null), 1200)
      return () => clearTimeout(timer)
    }
    prevAreaRef.current = gameState.currentArea
  }, [gameState?.currentArea])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!gameState || activeNpcId) return

    // Space key - talk to nearby NPC
    if (e.key === " ") {
      e.preventDefault()
      const npcsInArea = getNPCsInArea(gameState.currentArea)
      const nearbyNpc = npcsInArea.find((npc) => {
        const dx = Math.abs(gameState.playerPosition.x - npc.position.x)
        const dy = Math.abs(gameState.playerPosition.y - npc.position.y)
        return dx <= 1 && dy <= 1
      })
      if (nearbyNpc) {
        setActiveNpcId(nearbyNpc.id)
      }
      return
    }

    // Escape - close dialogue
    if (e.key === "Escape") {
      e.preventDefault()
      setActiveNpcId(null)
      return
    }

    let dx = 0
    let dy = 0

    switch (e.key) {
      case "ArrowUp":
      case "w":
      case "W":
        dy = -1
        break
      case "ArrowDown":
      case "s":
      case "S":
        dy = 1
        break
      case "ArrowLeft":
      case "a":
      case "A":
        dx = -1
        break
      case "ArrowRight":
      case "d":
      case "D":
        dx = 1
        break
      default:
        return
    }

    e.preventDefault()
    movePlayer(dx, dy)
  }, [gameState, movePlayer, activeNpcId, setActiveNpcId])

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  if (!gameState) return null

  const areaMap = AREA_MAPS[gameState.currentArea]
  const npcsInArea = getNPCsInArea(gameState.currentArea)

  const handleNPCClick = (npcId: string) => {
    const npc = npcsInArea.find((n) => n.id === npcId)
    if (!npc) return
    const dx = Math.abs(gameState.playerPosition.x - npc.position.x)
    const dy = Math.abs(gameState.playerPosition.y - npc.position.y)
    if (dx <= 1 && dy <= 1) {
      setActiveNpcId(npcId)
    }
  }

  const timeOverlay = {
    morning: "rgba(255, 200, 100, 0.03)",
    afternoon: "rgba(255, 255, 255, 0)",
    evening: "rgba(30, 30, 80, 0.15)",
  }[timeOfDay]

  return (
    <div className="relative flex flex-col items-center">
      {/* Area name banner */}
      <div className="mb-3 flex items-center gap-4">
        <div className="undertale-box p-1">
          <div className="bg-black px-6 py-2">
            <h2 className="font-pixel text-white text-xs tracking-wide">
              * {areaMap.name.es}
            </h2>
          </div>
        </div>
        <div className="text-gray-600 font-pixel text-[8px]">
          {timeOfDay === "morning" && "Manana / Morning"}
          {timeOfDay === "afternoon" && "Tarde / Afternoon"}
          {timeOfDay === "evening" && "Noche / Evening"}
        </div>
      </div>

      {/* Game canvas */}
      <div
        className="relative undertale-box p-1"
        style={{ imageRendering: "pixelated" }}
      >
        <div
          className="relative bg-black overflow-hidden"
          style={{
            width: areaMap.width * TILE_SIZE,
            height: areaMap.height * TILE_SIZE,
          }}
        >
          {/* Render tiles */}
          <div
            className="grid"
            style={{
              gridTemplateColumns: `repeat(${areaMap.width}, ${TILE_SIZE}px)`,
              gridTemplateRows: `repeat(${areaMap.height}, ${TILE_SIZE}px)`,
            }}
          >
            {areaMap.tiles.flatMap((row, y) =>
              row.map((tileType, x) => (
                <Tile key={`${x}-${y}`} type={tileType} x={x} y={y} timeOfDay={timeOfDay} />
              ))
            )}
          </div>

          {/* Particle effects */}
          <ParticleOverlay areaId={gameState.currentArea} />

          {/* Render NPCs */}
          {npcsInArea.map((npc) => (
            <NPCSprite
              key={npc.id}
              npc={npc}
              language={gameState.language}
              tileSize={TILE_SIZE}
              onClick={() => handleNPCClick(npc.id)}
              isHighlighted={
                Math.abs(gameState.playerPosition.x - npc.position.x) <= 1 &&
                Math.abs(gameState.playerPosition.y - npc.position.y) <= 1
              }
            />
          ))}

          {/* Render player */}
          <PlayerSprite
            position={gameState.playerPosition}
            tileSize={TILE_SIZE}
          />

          {/* Time of day overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ backgroundColor: timeOverlay }}
          />

          {/* Scanlines */}
          <div className="absolute inset-0 pointer-events-none scanlines" />
        </div>
      </div>

      {/* Area transition overlay */}
      {areaTransition && (
        <div className="absolute inset-0 z-30 flex items-center justify-center area-transition-overlay">
          <div className="text-center">
            <div className="text-white font-pixel text-sm area-transition-text">
              {areaTransition}
            </div>
          </div>
        </div>
      )}

      {/* Movement hint */}
      <div className="mt-3 undertale-box p-1 keyboard-hint">
        <div className="bg-black px-4 py-2">
          <span className="text-gray-500 font-pixel text-[8px]">
            [WASD] Mover/Move | [SPACE] Hablar/Talk | [ESC] Cerrar/Close
          </span>
        </div>
      </div>

      {/* Current quest mini-display */}
      {gameState.currentQuest && (
        <div className="mt-2 undertale-box p-1 w-full max-w-md">
          <div className="bg-black px-4 py-2">
            <div className="text-yellow-400 font-pixel text-[8px]">
              Mision / Quest: {gameState.currentQuest.title}
            </div>
            <div className="text-gray-500 font-pixel text-[8px] mt-1">
              {gameState.currentQuest.objectives.find(o => !o.completed)?.description || "All objectives complete!"}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Tile({ type, x, y, timeOfDay }: { type: TileType; x: number; y: number; timeOfDay: string }) {
  const tileData = TILE_COLORS[type]

  const getPattern = () => {
    switch (type) {
      case "grass":
        return (
          <div className="absolute inset-0">
            {/* Varying grass shades */}
            {((x + y) % 3 === 0) && (
              <div
                className="absolute w-1 h-1.5"
                style={{ left: "30%", top: "40%", backgroundColor: "#1f4a1f" }}
              />
            )}
            {((x + y) % 4 === 1) && (
              <div
                className="absolute w-0.5 h-1"
                style={{ left: "60%", top: "55%", backgroundColor: "#1a3d1a" }}
              />
            )}
            {((x * y + x) % 7 === 0) && (
              <div
                className="absolute w-0.5 h-1"
                style={{ left: "15%", top: "70%", backgroundColor: "#245024" }}
              />
            )}
            {/* Occasional wildflower */}
            {((x * 7 + y * 3) % 17 === 0) && (
              <div className="absolute flex items-center justify-center" style={{ left: "50%", top: "30%", transform: "translate(-50%, -50%)" }}>
                <div className="w-1.5 h-1.5 bg-yellow-500/60 rounded-full" />
              </div>
            )}
            {((x * 11 + y * 5) % 23 === 0) && (
              <div className="absolute flex items-center justify-center" style={{ left: "70%", top: "60%", transform: "translate(-50%, -50%)" }}>
                <div className="w-1 h-1 bg-pink-400/50 rounded-full" />
              </div>
            )}
          </div>
        )
      case "water":
        return (
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="absolute inset-0 water-shimmer"
              style={{
                background: `linear-gradient(${135 + (x * 10)}deg, #1a2d4a 0%, #0d1a2d 40%, #1a3d5a 60%, #1a2d4a 100%)`,
                animationDelay: `${(x + y) * 200}ms`,
              }}
            />
            {/* Water sparkle */}
            {((x + y) % 3 === 0) && (
              <div
                className="absolute w-0.5 h-0.5 bg-cyan-300/30 rounded-full water-sparkle"
                style={{ left: "40%", top: "30%", animationDelay: `${x * 500}ms` }}
              />
            )}
          </div>
        )
      case "fountain":
        return (
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-6 h-6 rounded-full relative"
              style={{
                backgroundColor: "#2d5a7a",
                boxShadow: "0 0 10px #4a8ab0, 0 0 20px rgba(74,138,176,0.3)",
              }}
            >
              <div className="absolute inset-1 rounded-full bg-blue-400/20 water-shimmer" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-2 bg-cyan-300/40 rounded-full water-sparkle" />
            </div>
          </div>
        )
      case "tree":
        return (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {/* Tree shadow */}
            <div className="absolute bottom-0 w-7 h-2 bg-black/30 rounded-full" />
            {/* Tree top - layered for depth */}
            <div className="w-7 h-6 bg-green-900 rounded-full border border-green-800 relative z-10">
              <div className="absolute top-1 left-1 w-3 h-3 bg-green-800/50 rounded-full" />
            </div>
            {/* Trunk */}
            <div className="w-2 h-3 bg-amber-900 -mt-1 relative z-0" />
          </div>
        )
      case "flower":
        return (
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Undertale golden flower with glow */}
            <div className="relative flower-sway" style={{ animationDelay: `${(x + y) * 300}ms` }}>
              {/* Stem */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0.5 h-2 bg-green-700" />
              {/* Petals */}
              <div className="w-3 h-3 bg-yellow-500 rounded-full relative"
                style={{ boxShadow: "0 0 6px rgba(234,179,8,0.4)" }}
              >
                <div className="absolute inset-0.5 bg-yellow-400 rounded-full" />
                <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-yellow-300 rounded-full" />
              </div>
            </div>
          </div>
        )
      case "market_stall":
        return (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {/* Colorful awning */}
            <div className="w-8 h-2.5 rounded-t relative overflow-hidden">
              <div className="absolute inset-0 flex">
                <div className="flex-1 bg-red-800" />
                <div className="flex-1 bg-red-900" />
                <div className="flex-1 bg-red-800" />
                <div className="flex-1 bg-red-900" />
              </div>
            </div>
            {/* Counter with goods */}
            <div className="w-7 h-4 bg-amber-900 relative">
              <div className="absolute top-0.5 left-0.5 flex gap-0.5">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full" />
              </div>
            </div>
          </div>
        )
      case "counter":
        return (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-5 bg-amber-900 border-t-2 border-amber-700">
              <div className="absolute top-0.5 left-1 w-1 h-1 bg-amber-600 rounded-full" />
            </div>
          </div>
        )
      case "shelf":
        return (
          <div className="absolute inset-0">
            <div className="w-full h-full bg-amber-950 border border-amber-800">
              <div className="flex justify-around mt-1">
                <div className="w-2 h-3 bg-red-700 rounded-t-sm" />
                <div className="w-2 h-3 bg-blue-700 rounded-t-sm" />
                <div className="w-2 h-3 bg-green-700 rounded-t-sm" />
              </div>
              <div className="w-full h-px bg-amber-700 mt-0.5" />
              <div className="flex justify-around mt-0.5">
                <div className="w-2 h-2 bg-purple-700 rounded-t-sm" />
                <div className="w-2 h-2 bg-orange-700 rounded-t-sm" />
              </div>
            </div>
          </div>
        )
      case "decoration":
        return (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-4 bg-yellow-600/80 rounded-sm border border-yellow-500/50"
              style={{ boxShadow: "0 0 8px rgba(255,200,0,0.4)" }}
            />
          </div>
        )
      case "door":
        return (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-8 bg-amber-800 border-2 border-amber-600 rounded-t-lg relative door-glow">
              <div className="absolute right-1 top-1/2 w-1.5 h-1.5 bg-yellow-400 rounded-full" />
              {/* Arrow hint */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-yellow-400/50 font-pixel text-[6px] animate-pulse">
                EXIT
              </div>
            </div>
          </div>
        )
      case "carpet":
        return (
          <div className="absolute inset-0">
            <div
              className="w-full h-full"
              style={{
                backgroundColor: tileData.color,
                boxShadow: "inset 0 0 4px rgba(0,0,0,0.5)",
              }}
            />
            <div className="absolute inset-1 border border-red-700/30" />
            {((x + y) % 2 === 0) && (
              <div className="absolute inset-2 border border-red-800/20" />
            )}
          </div>
        )
      case "sand":
        return (
          <div className="absolute inset-0">
            {((x + y) % 3 === 0) && (
              <div className="absolute w-0.5 h-0.5 rounded-full" style={{ left: "30%", top: "40%", backgroundColor: "#9B8D4C" }} />
            )}
            {((x * y + x) % 5 === 0) && (
              <div className="absolute w-0.5 h-0.5 rounded-full" style={{ left: "65%", top: "60%", backgroundColor: "#A09050" }} />
            )}
            {((x * 3 + y * 7) % 11 === 0) && (
              <div className="absolute w-1 h-1 rounded-full" style={{ left: "50%", top: "30%", backgroundColor: "#C0B070", opacity: 0.3 }} />
            )}
          </div>
        )
      case "deep_water":
        return (
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="absolute inset-0 water-shimmer"
              style={{
                background: `linear-gradient(${120 + x * 15}deg, #0d1a2d 0%, #061020 40%, #0d2040 60%, #0d1a2d 100%)`,
                animationDelay: `${(x + y) * 300}ms`,
              }}
            />
            {((x + y) % 4 === 0) && (
              <div className="absolute w-1 h-0.5 bg-blue-400/20 rounded-full water-sparkle"
                style={{ left: "40%", top: "50%", animationDelay: `${x * 400}ms` }}
              />
            )}
          </div>
        )
      case "dark_grass":
        return (
          <div className="absolute inset-0">
            {((x + y) % 2 === 0) && (
              <div className="absolute w-1 h-1.5" style={{ left: "25%", top: "35%", backgroundColor: "#0a250a" }} />
            )}
            {((x * y + x) % 5 === 0) && (
              <div className="absolute w-0.5 h-1" style={{ left: "60%", top: "50%", backgroundColor: "#133313" }} />
            )}
          </div>
        )
      case "mushroom":
        return (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <div className="w-1 h-2 bg-gray-200 mx-auto" />
              <div className="w-4 h-3 rounded-t-full -mt-1" style={{ backgroundColor: "#CC3333" }}>
                <div className="absolute top-0.5 left-1 w-1 h-1 bg-white rounded-full" />
                <div className="absolute top-1 right-1 w-0.5 h-0.5 bg-white rounded-full" />
              </div>
            </div>
          </div>
        )
      case "log":
        return (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-7 h-3 rounded-sm" style={{ backgroundColor: "#5C3D1F", border: "1px solid #4a3018" }}>
              <div className="absolute left-0 top-0 w-3 h-3 rounded-full border border-amber-900/50" style={{ backgroundColor: "#6B4C2E" }} />
            </div>
          </div>
        )
      case "torii":
        return (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-8 h-8">
              {/* Pillars */}
              <div className="absolute bottom-0 left-1 w-1.5 h-7" style={{ backgroundColor: "#CC0000" }} />
              <div className="absolute bottom-0 right-1 w-1.5 h-7" style={{ backgroundColor: "#CC0000" }} />
              {/* Top beam */}
              <div className="absolute top-0 left-0 right-0 h-1.5 rounded-sm" style={{ backgroundColor: "#CC0000" }} />
              {/* Cross beam */}
              <div className="absolute top-2.5 left-0.5 right-0.5 h-1" style={{ backgroundColor: "#AA0000" }} />
            </div>
          </div>
        )
      case "shrine_floor":
        return (
          <div className="absolute inset-0">
            {((x + y) % 2 === 0) && (
              <div className="absolute inset-0" style={{ backgroundColor: "rgba(255,255,255,0.02)" }} />
            )}
          </div>
        )
      case "offering_box":
        return (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-7 h-5 relative" style={{ backgroundColor: "#4a3520", border: "1px solid #5a4530" }}>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-0.5" style={{ backgroundColor: "#FFD700" }} />
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-2 h-0.5 bg-gray-600" />
            </div>
          </div>
        )
      case "desk":
        return (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-7 h-5 rounded-sm" style={{ backgroundColor: "#5C3D1F", border: "1px solid #4a3018" }}>
              <div className="absolute top-0.5 left-1 w-4 h-0.5 bg-gray-400/30" />
            </div>
          </div>
        )
      case "blackboard":
        return (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-full" style={{ backgroundColor: "#1a3d2a", border: "2px solid #8B7355" }}>
              <div className="absolute top-2 left-2 w-3 h-0.5 bg-white/40" />
              <div className="absolute top-3.5 left-1.5 w-5 h-0.5 bg-white/30" />
              <div className="absolute top-5 left-2.5 w-2 h-0.5 bg-white/20" />
            </div>
          </div>
        )
      case "hot_spring_water":
        return (
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="absolute inset-0 water-shimmer"
              style={{
                background: `linear-gradient(${90 + x * 20}deg, #2a4a5a 0%, #3a5a6a 50%, #2a4a5a 100%)`,
                animationDelay: `${(x + y) * 200}ms`,
              }}
            />
            {/* Steam */}
            <div
              className="absolute w-1 h-1 bg-white/15 rounded-full rising-steam"
              style={{ left: `${20 + (x * 30) % 60}%`, bottom: "20%", animationDelay: `${x * 0.5}s` }}
            />
            {((x + y) % 2 === 0) && (
              <div
                className="absolute w-0.5 h-0.5 bg-white/10 rounded-full rising-steam"
                style={{ left: "60%", bottom: "40%", animationDelay: `${y * 0.3}s` }}
              />
            )}
          </div>
        )
      case "bamboo_fence":
        return (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-full flex gap-1 items-center justify-center" style={{ backgroundColor: "#2a4a1a" }}>
              <div className="w-1 h-full" style={{ backgroundColor: "#4a7a2a" }} />
              <div className="w-1 h-full" style={{ backgroundColor: "#3a6a1a" }} />
              <div className="w-1 h-full" style={{ backgroundColor: "#4a7a2a" }} />
              <div className="w-1 h-full" style={{ backgroundColor: "#3a6a1a" }} />
            </div>
          </div>
        )
      case "rocks":
        return (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <div className="w-5 h-4 rounded-full" style={{ backgroundColor: "#4a4a4a" }} />
              <div className="absolute -right-1 top-1 w-3 h-3 rounded-full" style={{ backgroundColor: "#555555" }} />
              <div className="absolute top-0 left-0.5 w-1 h-0.5 bg-white/10 rounded-full" />
            </div>
          </div>
        )
      case "crop_soil":
        return (
          <div className="absolute inset-0">
            {/* Tilled soil rows */}
            <div className="absolute top-1 left-0 right-0 h-0.5" style={{ backgroundColor: "#2d1a0a" }} />
            <div className="absolute top-3 left-0 right-0 h-0.5" style={{ backgroundColor: "#2d1a0a" }} />
            <div className="absolute top-5 left-0 right-0 h-0.5" style={{ backgroundColor: "#2d1a0a" }} />
          </div>
        )
      case "crop_growing":
        return (
          <div className="absolute inset-0">
            <div className="absolute top-1 left-0 right-0 h-0.5" style={{ backgroundColor: "#2d1a0a" }} />
            <div className="absolute top-3 left-0 right-0 h-0.5" style={{ backgroundColor: "#2d1a0a" }} />
            {/* Sprouts */}
            <div className="absolute bottom-1 left-1/4 w-0.5 h-2" style={{ backgroundColor: "#4a8a2a" }} />
            <div className="absolute bottom-1 left-1/2 w-0.5 h-1.5" style={{ backgroundColor: "#3a7a1a" }} />
            <div className="absolute bottom-1 left-3/4 w-0.5 h-2" style={{ backgroundColor: "#4a8a2a" }} />
          </div>
        )
      case "crop_ready":
        return (
          <div className="absolute inset-0">
            <div className="absolute top-1 left-0 right-0 h-0.5" style={{ backgroundColor: "#2d1a0a" }} />
            {/* Full crops */}
            <div className="absolute bottom-0 left-1 w-2 h-4" style={{ backgroundColor: "#5a9a3a" }}>
              <div className="w-2 h-1.5 rounded-t-full" style={{ backgroundColor: "#FF6347" }} />
            </div>
            <div className="absolute bottom-0 right-2 w-2 h-3" style={{ backgroundColor: "#4a8a2a" }}>
              <div className="w-2 h-1.5 rounded-t-full" style={{ backgroundColor: "#FFD700" }} />
            </div>
          </div>
        )
      case "fence":
        return (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-full" style={{ backgroundColor: "#5a4020" }}>
              <div className="absolute top-1 left-1 w-1 h-full" style={{ backgroundColor: "#7a5a30" }} />
              <div className="absolute top-1 right-2 w-1 h-full" style={{ backgroundColor: "#7a5a30" }} />
              <div className="absolute top-2 left-0 right-0 h-1" style={{ backgroundColor: "#6a4a20" }} />
              <div className="absolute bottom-2 left-0 right-0 h-1" style={{ backgroundColor: "#6a4a20" }} />
            </div>
          </div>
        )
      case "bridge":
        return (
          <div className="absolute inset-0">
            <div className="w-full h-full" style={{ backgroundColor: "#5C3D1F" }}>
              {/* Planks */}
              <div className="absolute top-0 left-0 right-0 h-0.5" style={{ backgroundColor: "#4a3018" }} />
              <div className="absolute top-2 left-0 right-0 h-0.5" style={{ backgroundColor: "#4a3018" }} />
              <div className="absolute top-4 left-0 right-0 h-0.5" style={{ backgroundColor: "#4a3018" }} />
              {/* Side rails */}
              <div className="absolute top-0 left-0 w-0.5 h-full" style={{ backgroundColor: "#6B4C2E" }} />
              <div className="absolute top-0 right-0 w-0.5 h-full" style={{ backgroundColor: "#6B4C2E" }} />
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div
      className="relative"
      style={{
        width: TILE_SIZE,
        height: TILE_SIZE,
        backgroundColor: tileData.color,
      }}
    >
      {getPattern()}
    </div>
  )
}

// Particle effects for different areas
function ParticleOverlay({ areaId }: { areaId: string }) {
  const particles = []

  if (areaId === "garden") {
    // Falling leaves
    for (let i = 0; i < 5; i++) {
      particles.push(
        <div
          key={`leaf-${i}`}
          className="absolute w-1.5 h-1.5 bg-green-600/40 rounded-full falling-leaf"
          style={{
            left: `${15 + i * 18}%`,
            animationDelay: `${i * 1.5}s`,
            animationDuration: `${4 + i}s`,
          }}
        />
      )
    }
  } else if (areaId === "bakery") {
    // Steam particles
    for (let i = 0; i < 3; i++) {
      particles.push(
        <div
          key={`steam-${i}`}
          className="absolute w-1 h-1 bg-white/10 rounded-full rising-steam"
          style={{
            left: `${30 + i * 15}%`,
            bottom: "40%",
            animationDelay: `${i * 0.8}s`,
          }}
        />
      )
    }
  } else if (areaId === "fish_market") {
    // Water sparkles
    for (let i = 0; i < 4; i++) {
      particles.push(
        <div
          key={`sparkle-${i}`}
          className="absolute w-0.5 h-0.5 bg-cyan-300/40 rounded-full water-sparkle"
          style={{
            left: `${60 + i * 8}%`,
            top: `${20 + i * 10}%`,
            animationDelay: `${i * 0.5}s`,
          }}
        />
      )
    }
  } else if (areaId === "forest") {
    // Fireflies
    for (let i = 0; i < 8; i++) {
      particles.push(
        <div
          key={`firefly-${i}`}
          className="absolute w-1 h-1 rounded-full firefly-float"
          style={{
            left: `${10 + i * 11}%`,
            top: `${15 + (i * 17) % 60}%`,
            backgroundColor: "#ADFF2F",
            boxShadow: "0 0 4px #ADFF2F, 0 0 8px #ADFF2F",
            animationDelay: `${i * 0.7}s`,
            animationDuration: `${3 + i * 0.5}s`,
          }}
        />
      )
    }
  } else if (areaId === "beach") {
    // Wave sparkles
    for (let i = 0; i < 6; i++) {
      particles.push(
        <div
          key={`wave-${i}`}
          className="absolute w-1.5 h-0.5 bg-cyan-200/30 rounded-full wave-crash"
          style={{
            left: `${5 + i * 16}%`,
            top: "30%",
            animationDelay: `${i * 0.4}s`,
          }}
        />
      )
    }
  } else if (areaId === "shrine") {
    // Cherry blossom petals
    for (let i = 0; i < 7; i++) {
      particles.push(
        <div
          key={`blossom-${i}`}
          className="absolute w-1.5 h-1.5 rounded-full cherry-blossom-fall"
          style={{
            left: `${10 + i * 13}%`,
            backgroundColor: `rgba(255, ${150 + i * 10}, ${180 + i * 5}, 0.5)`,
            animationDelay: `${i * 1.2}s`,
            animationDuration: `${5 + i}s`,
          }}
        />
      )
    }
  } else if (areaId === "hot_spring") {
    // Dense steam
    for (let i = 0; i < 8; i++) {
      particles.push(
        <div
          key={`steam-${i}`}
          className="absolute w-2 h-2 bg-white/8 rounded-full rising-steam"
          style={{
            left: `${20 + i * 8}%`,
            bottom: "30%",
            animationDelay: `${i * 0.5}s`,
            animationDuration: `${2 + i * 0.3}s`,
          }}
        />
      )
    }
  } else if (areaId === "farm") {
    // Butterflies
    for (let i = 0; i < 3; i++) {
      particles.push(
        <div
          key={`butterfly-${i}`}
          className="absolute firefly-float"
          style={{
            left: `${20 + i * 25}%`,
            top: `${30 + i * 15}%`,
            animationDelay: `${i * 2}s`,
            animationDuration: `${4 + i}s`,
          }}
        >
          <div className="w-1.5 h-1 rounded-full" style={{ backgroundColor: i === 0 ? "#FFD700" : i === 1 ? "#FF69B4" : "#87CEEB", opacity: 0.6 }} />
        </div>
      )
    }
  }

  return <div className="absolute inset-0 pointer-events-none overflow-hidden">{particles}</div>
}
