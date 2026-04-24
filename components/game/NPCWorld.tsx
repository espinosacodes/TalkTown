"use client"

import { useState } from "react"
import type { NPCProfile, AreaId } from "@/lib/game-state"
import { useGame } from "@/lib/game-context"
import { NPC_PROFILES } from "@/lib/npc-profiles"
import { AREA_MAPS } from "@/lib/tile-map"
import { AnimalAvatar } from "./AnimalAvatar"

interface NPCWorldProps {
  onTalkToNPC: (npc: NPCProfile) => void
  isDialogueActive: boolean
}

// Group NPCs by area
const AREA_ORDER: AreaId[] = ["town_square", "inn", "fish_market", "fruit_stand", "bakery", "town_hall", "garden", "shop", "forest", "beach", "shrine", "school", "hot_spring", "farm"]

export function NPCWorld({ onTalkToNPC, isDialogueActive }: NPCWorldProps) {
  const { gameState } = useGame()
  const [currentArea, setCurrentArea] = useState<AreaId>("town_square")
  const [hoveredNPC, setHoveredNPC] = useState<string | null>(null)

  const npcsInArea = NPC_PROFILES.filter(npc => npc.location === currentArea)
  const areaMap = AREA_MAPS[currentArea]

  return (
    <div className="space-y-4">
      {/* Area Header */}
      <div className="text-center pb-4 border-b border-white/20">
        <h2 className="text-yellow-400 font-pixel text-sm">
          {areaMap.name.es}
        </h2>
        <p className="text-gray-500 font-pixel text-[8px] mt-1">
          * Haz clic en un NPC para hablar / Click an NPC to talk
        </p>
      </div>

      {/* Area Navigation */}
      <div className="flex flex-wrap justify-center gap-2">
        {AREA_ORDER.map((areaId) => {
          const area = AREA_MAPS[areaId]
          const npcCount = NPC_PROFILES.filter(n => n.location === areaId).length
          if (npcCount === 0 && areaId !== "town_square") return null
          return (
            <button
              key={areaId}
              onClick={() => setCurrentArea(areaId)}
              disabled={isDialogueActive}
              className={`px-3 py-2 font-pixel text-[8px] border-2 transition-all ${
                currentArea === areaId
                  ? "border-yellow-400 text-yellow-400 bg-yellow-400/10"
                  : "border-white/20 text-gray-400 hover:border-white hover:text-white"
              } ${isDialogueActive ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {area.name.es} {npcCount > 0 && `(${npcCount})`}
            </button>
          )
        })}
      </div>

      {/* NPCs Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-4">
        {npcsInArea.map((npc) => (
          <button
            key={npc.id}
            onClick={() => !isDialogueActive && onTalkToNPC(npc)}
            onMouseEnter={() => setHoveredNPC(npc.id)}
            onMouseLeave={() => setHoveredNPC(null)}
            disabled={isDialogueActive}
            className={`
              p-4 border-2 transition-all text-center
              ${hoveredNPC === npc.id && !isDialogueActive
                ? "border-yellow-400 bg-yellow-400/5 scale-105"
                : "border-white/20 hover:border-white/50"
              }
              ${isDialogueActive ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
            `}
          >
            {/* NPC Sprite */}
            <div className="w-12 h-12 mx-auto mb-3 pixel-art animate-bounce-slow">
              <AnimalAvatar
                animalType={npc.spriteColors.animalType}
                fur={npc.spriteColors.fur}
                furDark={npc.spriteColors.furDark}
                belly={npc.spriteColors.belly}
                nose={npc.spriteColors.nose}
                accent={npc.spriteColors.accent}
                body={npc.spriteColors.body}
                size="md"
              />
            </div>

            {/* NPC Info - bilingual */}
            <div className="text-white font-pixel text-[10px]">
              {npc.name.es}
            </div>
            <div className="text-gray-500 font-pixel text-[8px] mt-1">
              {npc.role.es}
            </div>

            {/* Talk Prompt */}
            {hoveredNPC === npc.id && !isDialogueActive && (
              <div className="mt-2 text-yellow-400 font-pixel text-[8px] animate-pulse">
                [ HABLAR / TALK ]
              </div>
            )}
          </button>
        ))}

        {npcsInArea.length === 0 && (
          <div className="col-span-full text-center py-8">
            <div className="text-gray-500 font-pixel text-[10px]">
              * No hay NPCs en esta area
            </div>
            <div className="text-gray-600 font-pixel text-[8px] mt-1">
              No NPCs in this area
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
