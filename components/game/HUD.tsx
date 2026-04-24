"use client"

import { useGame } from "@/lib/game-context"
import { AREA_MAPS } from "@/lib/tile-map"

interface HUDProps {
  onOpenJournal?: () => void
  onOpenCrafting?: () => void
  onOpenInventory?: () => void
  pendingGifts?: number
}

export function HUD({ onOpenJournal, onOpenCrafting, onOpenInventory, pendingGifts = 0 }: HUDProps) {
  const { gameState } = useGame()

  if (!gameState) return null

  const currentArea = AREA_MAPS[gameState.currentArea]
  const wordsLearned = gameState.vocabularyLearned.length

  return (
    <div className="fixed top-16 left-2 right-2 flex items-start justify-between pointer-events-none z-20">
      {/* Left side - Area name */}
      <div className="pointer-events-auto">
        <div className="bg-black/80 border border-white/20 px-3 py-1.5 rounded-sm">
          <div className="text-white font-pixel text-[8px]">
            {currentArea.name.es}
          </div>
        </div>
      </div>

      {/* Right side - Stats + Action buttons */}
      <div className="pointer-events-auto flex items-center gap-2">
        {/* Quick action buttons */}
        {onOpenJournal && (
          <button
            onClick={onOpenJournal}
            className="bg-black/80 border border-white/20 px-2 py-1 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-sm hover:border-yellow-400 transition-colors"
            title="Journal"
          >
            <span className="text-pink-400 font-pixel text-[8px]">J</span>
          </button>
        )}
        {onOpenCrafting && (
          <button
            onClick={onOpenCrafting}
            className="bg-black/80 border border-white/20 px-2 py-1 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-sm hover:border-yellow-400 transition-colors"
            title="Crafting"
          >
            <span className="text-orange-400 font-pixel text-[8px]">C</span>
          </button>
        )}
        {onOpenInventory && (
          <button
            onClick={onOpenInventory}
            className="bg-black/80 border border-white/20 px-2 py-1 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-sm hover:border-yellow-400 transition-colors"
            title="Inventory"
          >
            <span className="text-green-400 font-pixel text-[8px]">I</span>
          </button>
        )}

        {/* Stats */}
        <div className="bg-black/80 border border-white/20 px-2 py-1 rounded-sm flex items-center gap-1.5">
          <span className="text-cyan-400 font-pixel text-[8px]">W</span>
          <span className="text-cyan-400 font-pixel text-[8px]">{wordsLearned}</span>
        </div>
        <div className="bg-black/80 border border-white/20 px-2 py-1 rounded-sm flex items-center gap-1.5">
          <span className="text-yellow-500 font-pixel text-[8px]">G</span>
          <span className="text-yellow-400 font-pixel text-[8px]">{gameState.gold}</span>
        </div>
        {pendingGifts > 0 && (
          <div className="bg-black/80 border border-violet-400/50 px-2 py-1 rounded-sm flex items-center gap-1.5">
            <span className="text-violet-400 font-pixel text-[8px]">!</span>
            <span className="text-violet-400 font-pixel text-[8px]">{pendingGifts}</span>
          </div>
        )}
      </div>
    </div>
  )
}
