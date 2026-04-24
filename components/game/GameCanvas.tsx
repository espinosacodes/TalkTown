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
      setAreaTransition(areaMap.name.ja)
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
              * {areaMap.name.ja} / {areaMap.name.es}
            </h2>
          </div>
        </div>
        <div className="text-gray-600 font-pixel text-[8px]">
          {timeOfDay === "morning" && "朝 / Morning"}
          {timeOfDay === "afternoon" && "昼 / Afternoon"}
          {timeOfDay === "evening" && "夕方 / Evening"}
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
      <div className="mt-3 undertale-box p-1">
        <div className="bg-black px-4 py-2">
          <span className="text-gray-500 font-pixel text-[8px]">
            [WASD] 移動/Move | [SPACE] 話す/Talk | [ESC] 閉じる/Close
          </span>
        </div>
      </div>

      {/* Current quest mini-display */}
      {gameState.currentQuest && (
        <div className="mt-2 undertale-box p-1 w-full max-w-md">
          <div className="bg-black px-4 py-2">
            <div className="text-yellow-400 font-pixel text-[8px]">
              クエスト / Quest: {gameState.currentQuest.title}
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
            {/* Carpet pattern */}
            {((x + y) % 2 === 0) && (
              <div className="absolute inset-2 border border-red-800/20" />
            )}
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
  }

  return <div className="absolute inset-0 pointer-events-none overflow-hidden">{particles}</div>
}
