"use client"

import { useGame } from "@/lib/game-context"
import { AREA_MAPS } from "@/lib/tile-map"

export function HUD() {
  const { gameState } = useGame()

  if (!gameState) return null

  const currentArea = AREA_MAPS[gameState.currentArea]
  const wordsLearned = gameState.vocabularyLearned.length

  return (
    <div className="fixed top-12 left-2 right-2 flex items-start justify-between pointer-events-none z-20">
      {/* Left side - Area name */}
      <div className="pointer-events-auto">
        <div className="bg-black/80 border border-white/20 px-3 py-1.5 rounded-sm">
          <div className="text-white font-pixel text-[8px]">
            {currentArea.name.ja}
          </div>
        </div>
      </div>

      {/* Right side - Stats */}
      <div className="pointer-events-auto flex items-center gap-2">
        <div className="bg-black/80 border border-white/20 px-2 py-1 rounded-sm flex items-center gap-1.5">
          <span className="text-cyan-400 font-pixel text-[8px]">W</span>
          <span className="text-cyan-400 font-pixel text-[8px]">{wordsLearned}</span>
        </div>
        <div className="bg-black/80 border border-white/20 px-2 py-1 rounded-sm flex items-center gap-1.5">
          <span className="text-yellow-500 font-pixel text-[8px]">G</span>
          <span className="text-yellow-400 font-pixel text-[8px]">{gameState.gold}</span>
        </div>
      </div>
    </div>
  )
}
