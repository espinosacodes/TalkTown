"use client"

import { useState, useEffect } from "react"
import type { NPCProfile, Language } from "@/lib/game-state"

interface NPCSpriteProps {
  npc: NPCProfile
  language: Language
  tileSize: number
  onClick: () => void
  isHighlighted: boolean
}

export function NPCSprite({ npc, language, tileSize, onClick, isHighlighted }: NPCSpriteProps) {
  const [frame, setFrame] = useState(0)
  const [wanderOffset, setWanderOffset] = useState({ x: 0, y: 0 })
  const colors = npc.spriteColors

  // Idle animation - different NPCs have different rhythms
  useEffect(() => {
    const speed = npc.id === "mysterious_cat" ? 800 : npc.id === "gardener" ? 600 : 400
    const interval = setInterval(() => {
      setFrame((f) => (f + 1) % 4)
    }, speed)
    return () => clearInterval(interval)
  }, [npc.id])

  // Subtle NPC wandering (2-3 pixel radius)
  useEffect(() => {
    const wander = setInterval(() => {
      setWanderOffset({
        x: (Math.random() - 0.5) * 3,
        y: (Math.random() - 0.5) * 2,
      })
    }, 3000 + Math.random() * 2000)
    return () => clearInterval(wander)
  }, [])

  const isBlinking = frame === 2
  const bobOffset = frame % 2 === 0 ? 0 : -1

  // Special rendering for the cat
  if (npc.id === "mysterious_cat") {
    return (
      <div
        className="absolute transition-all duration-300 ease-out cursor-pointer z-10"
        style={{
          left: npc.position.x * tileSize + wanderOffset.x,
          top: npc.position.y * tileSize + wanderOffset.y,
          width: tileSize,
          height: tileSize,
        }}
        onClick={onClick}
      >
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="absolute bottom-2 w-5 h-1.5 bg-black/40 rounded-full" />

          <div
            className="relative"
            style={{ transform: `translateY(${bobOffset}px)` }}
          >
            {/* Ears */}
            <div className="absolute -top-2 left-0 flex justify-between w-6">
              <div className="w-0 h-0"
                style={{ borderLeft: "4px solid transparent", borderRight: "4px solid transparent", borderBottom: `6px solid ${colors.body}` }}
              />
              <div className="w-0 h-0"
                style={{ borderLeft: "4px solid transparent", borderRight: "4px solid transparent", borderBottom: `6px solid ${colors.body}` }}
              />
            </div>

            {/* Head */}
            <div className="w-6 h-5 rounded-full" style={{ backgroundColor: colors.body }}>
              {/* Glowing eyes */}
              <div
                className="absolute top-1.5 left-1 w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: colors.accent, boxShadow: `0 0 6px ${colors.accent}` }}
              />
              <div
                className="absolute top-1.5 right-1 w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: colors.accent, boxShadow: `0 0 6px ${colors.accent}` }}
              />
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-1 h-0.5 bg-pink-400" />
            </div>

            {/* Body */}
            <div className="w-5 h-3 mx-auto -mt-1 rounded-b-lg" style={{ backgroundColor: colors.body }} />

            {/* Tail */}
            <div
              className="absolute -right-2 top-4 w-4 h-1 rounded-full transition-transform"
              style={{
                backgroundColor: colors.body,
                transform: frame % 2 === 0 ? "rotate(-15deg)" : "rotate(15deg)",
                transformOrigin: "left center",
              }}
            />
          </div>
        </div>

        {/* Mystery indicator */}
        {isHighlighted && (
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <div className="text-yellow-400 font-pixel text-[8px] animate-pulse">
              ???
            </div>
            <div className="text-yellow-400/60 font-pixel text-[6px] text-center mt-0.5">
              [SPACE]
            </div>
          </div>
        )}

        {/* Speech bubble when nearby */}
        {isHighlighted && (
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-pulse" />
        )}
      </div>
    )
  }

  // Get NPC accessory based on role
  const renderAccessory = () => {
    switch (npc.id) {
      case "innkeeper": // Rosa - apron
        return (
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-white/30 border-t border-white/20" />
        )
      case "fishmonger": // Pedro - fish hat / headband
        return (
          <div className="absolute -top-2 left-0 right-0 flex justify-center">
            <div className="w-6 h-1.5 bg-blue-400 rounded" />
          </div>
        )
      case "fruit_seller": // Lola - flower in hair
        return (
          <div className="absolute -top-1 -right-1">
            <div className="w-2 h-2 bg-pink-400 rounded-full" />
            <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-yellow-300 rounded-full" />
          </div>
        )
      case "baker": // El Filosofo - chef hat
        return (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <div className="w-5 h-3 bg-white rounded-t-lg border border-white/80" />
            <div className="w-6 h-1 bg-white -mt-px" />
          </div>
        )
      case "mayor": // Don Magnifico - cape hint
        return (
          <>
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-1 bg-yellow-400 rounded-t" />
            <div className="absolute -left-1.5 top-2 w-2 h-4 rounded-b" style={{ backgroundColor: colors.accent, opacity: 0.6 }} />
          </>
        )
      case "shopkeeper": // Memo - glasses
        return (
          <>
            <div className="absolute top-2 left-0.5 w-2 h-1.5 border border-gray-400 rounded-sm bg-transparent" />
            <div className="absolute top-2 right-0.5 w-2 h-1.5 border border-gray-400 rounded-sm bg-transparent" />
            <div className="absolute top-2.5 left-[10px] w-1 h-px bg-gray-400" />
          </>
        )
      case "gardener": // Abuela - shawl
        return (
          <div className="absolute top-0 -left-0.5 -right-0.5 h-2 bg-green-800/60 rounded-t" />
        )
      default:
        return null
    }
  }

  return (
    <div
      className="absolute transition-all duration-300 ease-out cursor-pointer z-10"
      style={{
        left: npc.position.x * tileSize + wanderOffset.x,
        top: npc.position.y * tileSize + wanderOffset.y,
        width: tileSize,
        height: tileSize,
      }}
      onClick={onClick}
    >
      {/* Highlight glow when interactable */}
      {isHighlighted && (
        <div
          className="absolute inset-0 rounded-sm animate-pulse"
          style={{
            boxShadow: `0 0 12px rgba(255,255,0,0.4), inset 0 0 8px rgba(255,255,0,0.1)`,
            border: "2px solid rgba(255,255,0,0.5)",
          }}
        />
      )}

      {/* NPC character */}
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Shadow */}
        <div className="absolute bottom-0.5 w-6 h-1.5 bg-black/40 rounded-full" />

        {/* Body */}
        <div
          className="relative"
          style={{ transform: `translateY(${bobOffset}px)` }}
        >
          {/* Head */}
          <div
            className="w-7 h-7 rounded-sm relative"
            style={{ backgroundColor: colors.skin, border: "1px solid rgba(255,255,255,0.15)" }}
          >
            {/* Hair */}
            <div
              className="absolute -top-1.5 left-0 right-0 h-3 rounded-t-sm"
              style={{ backgroundColor: colors.hair }}
            />

            {/* Accessory on head */}
            {renderAccessory()}

            {/* Eyes */}
            {!isBlinking ? (
              <>
                <div className="absolute top-2.5 left-1 w-2 h-2 bg-white rounded-full">
                  <div
                    className="absolute w-1 h-1 bg-black rounded-full transition-all"
                    style={{
                      left: frame === 1 ? "0px" : frame === 3 ? "4px" : "2px",
                      top: "2px",
                    }}
                  />
                </div>
                <div className="absolute top-2.5 right-1 w-2 h-2 bg-white rounded-full">
                  <div
                    className="absolute w-1 h-1 bg-black rounded-full transition-all"
                    style={{
                      right: frame === 1 ? "0px" : frame === 3 ? "4px" : "2px",
                      top: "2px",
                    }}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="absolute top-3 left-1 w-2 h-0.5 bg-gray-800 rounded" />
                <div className="absolute top-3 right-1 w-2 h-0.5 bg-gray-800 rounded" />
              </>
            )}

            {/* Expression based on personality */}
            {npc.id === "fishmonger" && (
              <>
                <div className="absolute top-1.5 left-1 w-2 h-0.5 bg-gray-800 -rotate-12" />
                <div className="absolute top-1.5 right-1 w-2 h-0.5 bg-gray-800 rotate-12" />
              </>
            )}
            {npc.id === "fruit_seller" && frame === 0 && (
              <div className="absolute top-3 right-1 w-2 h-0.5 bg-gray-800" />
            )}
            {npc.id === "mayor" && (
              <div className="absolute top-1 left-1 w-2 h-0.5 bg-gray-800" />
            )}
          </div>

          {/* Body */}
          <div
            className="w-6 h-4 mx-auto -mt-0.5 relative"
            style={{ backgroundColor: colors.body, border: "1px solid rgba(255,255,255,0.1)" }}
          >
            {/* Accent decoration */}
            <div
              className="w-full h-0.5 mt-1"
              style={{ backgroundColor: colors.accent }}
            />
          </div>

          {/* Legs */}
          <div className="flex justify-center gap-0.5 -mt-0.5">
            <div
              className="w-2 h-2 bg-gray-800 rounded-b-sm"
              style={{ transform: frame % 2 === 0 ? "rotate(-3deg)" : "rotate(3deg)" }}
            />
            <div
              className="w-2 h-2 bg-gray-800 rounded-b-sm"
              style={{ transform: frame % 2 === 0 ? "rotate(3deg)" : "rotate(-3deg)" }}
            />
          </div>
        </div>
      </div>

      {/* Name tag + speech bubble when highlighted */}
      {isHighlighted && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <div className="px-2 py-1 bg-black border border-white text-center">
            <div className="text-white font-pixel text-[8px]">
              * {npc.name.ja} / {npc.name.es}
            </div>
            <div className="text-gray-500 font-pixel text-[6px]">
              {npc.role.ja} / {npc.role.es}
            </div>
          </div>
          <div className="text-center text-yellow-400 font-pixel text-[8px] mt-0.5 animate-bounce">
            [SPACE]
          </div>
        </div>
      )}

      {/* Speech bubble indicator when nearby */}
      {isHighlighted && (
        <div className="absolute -top-2 -right-1">
          <div className="w-2.5 h-2.5 bg-white rounded-full flex items-center justify-center animate-pulse">
            <div className="w-1 h-1 bg-black rounded-full" />
          </div>
        </div>
      )}
    </div>
  )
}
