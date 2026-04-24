"use client"

import { useState, useEffect } from "react"
import { useGame } from "@/lib/game-context"
import { SHOP_ITEMS } from "@/lib/game-state"

interface PlayerSpriteProps {
  position: { x: number; y: number }
  tileSize: number
}

export function PlayerSprite({ position, tileSize }: PlayerSpriteProps) {
  const { gameState } = useGame()
  const [frame, setFrame] = useState(0)
  const [facingRight, setFacingRight] = useState(true)
  const [prevX, setPrevX] = useState(position.x)

  // Get current outfit and hat
  const currentOutfit = SHOP_ITEMS.find(i => i.id === gameState?.currentOutfit)
  const currentHat = SHOP_ITEMS.find(i => i.id === gameState?.currentHat)

  const outfitColor = currentOutfit?.color || "#22c55e"
  const hatColor = currentHat?.color || "transparent"

  // Track facing direction
  useEffect(() => {
    if (position.x > prevX) setFacingRight(true)
    else if (position.x < prevX) setFacingRight(false)
    setPrevX(position.x)
  }, [position.x])

  // Idle animation - 4 frames
  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((f) => (f + 1) % 4)
    }, 250)
    return () => clearInterval(interval)
  }, [])

  const bobOffset = [0, -1, -2, -1][frame]
  const legRotation = ["-5deg", "3deg", "5deg", "-3deg"][frame]
  const legRotation2 = ["5deg", "-3deg", "-5deg", "3deg"][frame]
  const isBlinking = frame === 2

  return (
    <div
      className="absolute transition-all duration-100 ease-out pointer-events-none z-20"
      style={{
        left: position.x * tileSize,
        top: position.y * tileSize,
        width: tileSize,
        height: tileSize,
        transform: facingRight ? "scaleX(1)" : "scaleX(-1)",
      }}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Shadow */}
        <div
          className="absolute bottom-0.5 w-6 h-1.5 rounded-full"
          style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
        />

        {/* Body container with bob */}
        <div
          className="relative"
          style={{ transform: `translateY(${bobOffset}px)` }}
        >
          {/* Hat */}
          {currentHat && currentHat.id !== "hat_none" && (
            <HatSprite hatId={currentHat.id} color={hatColor} />
          )}

          {/* Head */}
          <div
            className="w-7 h-7 rounded-sm relative"
            style={{ backgroundColor: "#FFE4C4", border: "1px solid rgba(255,255,255,0.2)" }}
          >
            {/* Hair */}
            {(!currentHat || currentHat.id === "hat_none") && (
              <div
                className="absolute -top-1.5 left-0 right-0 h-3 rounded-t-sm"
                style={{ backgroundColor: "#5D4037" }}
              >
                {/* Hair strands */}
                <div className="absolute bottom-0 left-0.5 w-1 h-1 bg-[#4E342E] rounded-b" />
                <div className="absolute bottom-0 right-0.5 w-1 h-1 bg-[#4E342E] rounded-b" />
              </div>
            )}

            {/* Eyes */}
            {!isBlinking ? (
              <>
                <div className="absolute top-2.5 left-1 w-2 h-2 bg-white rounded-full">
                  <div
                    className="absolute w-1 h-1 bg-black rounded-full"
                    style={{ left: 1, top: 1 }}
                  />
                </div>
                <div className="absolute top-2.5 right-1 w-2 h-2 bg-white rounded-full">
                  <div
                    className="absolute w-1 h-1 bg-black rounded-full"
                    style={{ right: 1, top: 1 }}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="absolute top-3 left-1 w-2 h-0.5 bg-gray-800 rounded" />
                <div className="absolute top-3 right-1 w-2 h-0.5 bg-gray-800 rounded" />
              </>
            )}

            {/* Blush */}
            <div className="absolute top-3.5 left-0.5 w-1.5 h-0.5 bg-pink-300/40 rounded-full" />
            <div className="absolute top-3.5 right-0.5 w-1.5 h-0.5 bg-pink-300/40 rounded-full" />

            {/* Mouth - tiny smile */}
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-0.5 border-b border-gray-700 rounded-b-full" />
          </div>

          {/* Body */}
          <div
            className="w-6 h-5 mx-auto -mt-0.5 relative"
            style={{
              backgroundColor: outfitColor,
              border: "1px solid rgba(255,255,255,0.15)",
            }}
          >
            {/* Arms */}
            <div
              className="absolute -left-1 top-0.5 w-1.5 h-3 rounded-b"
              style={{
                backgroundColor: outfitColor,
                filter: "brightness(0.85)",
                transform: `rotate(${legRotation})`,
                transformOrigin: "top center",
              }}
            />
            <div
              className="absolute -right-1 top-0.5 w-1.5 h-3 rounded-b"
              style={{
                backgroundColor: outfitColor,
                filter: "brightness(0.85)",
                transform: `rotate(${legRotation2})`,
                transformOrigin: "top center",
              }}
            />

            {/* Outfit detail */}
            {currentOutfit?.id === "outfit_knight" && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 bg-white/30 rounded-sm" />
              </div>
            )}
            {currentOutfit?.id === "outfit_royal" && (
              <div className="w-3 h-0.5 bg-yellow-400 mx-auto mt-1.5" />
            )}
            {currentOutfit?.id === "outfit_wizard" && (
              <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-yellow-300 rounded-full"
                style={{ boxShadow: "0 0 4px rgba(253,224,71,0.6)" }}
              />
            )}

            {/* Belt/accent line */}
            <div
              className="absolute bottom-0.5 left-0 right-0 h-0.5"
              style={{ backgroundColor: "rgba(0,0,0,0.2)" }}
            />
          </div>

          {/* Legs */}
          <div className="flex justify-center gap-0.5 -mt-0.5">
            <div
              className="w-2 h-2.5 bg-gray-800 rounded-b-sm"
              style={{ transform: `rotate(${legRotation})`, transformOrigin: "top center" }}
            />
            <div
              className="w-2 h-2.5 bg-gray-800 rounded-b-sm"
              style={{ transform: `rotate(${legRotation2})`, transformOrigin: "top center" }}
            />
          </div>
        </div>
      </div>

      {/* SOUL heart indicator */}
      <div className="absolute -top-5 left-1/2 -translate-x-1/2" style={{ transform: facingRight ? "" : "scaleX(-1)" }}>
        <div className="w-3 h-3 soul-heart">
          <svg viewBox="0 0 12 12" className="w-full h-full">
            <path
              d="M6 10 L2 6 Q0 4 2 2 Q4 0 6 3 Q8 0 10 2 Q12 4 10 6 Z"
              fill="#ff0000"
            />
          </svg>
        </div>
      </div>
    </div>
  )
}

function HatSprite({ hatId, color }: { hatId: string; color: string }) {
  switch (hatId) {
    case "hat_bandana":
      return (
        <div
          className="absolute -top-1 left-0 right-0 h-2.5 rounded-t"
          style={{ backgroundColor: color }}
        >
          <div
            className="absolute -right-2 top-1 w-3 h-1.5 rounded"
            style={{ backgroundColor: color, filter: "brightness(0.9)" }}
          />
        </div>
      )
    case "hat_wizard":
      return (
        <div className="absolute -top-5 left-1/2 -translate-x-1/2">
          <div
            className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[10px]"
            style={{
              borderLeftColor: "transparent",
              borderRightColor: "transparent",
              borderBottomColor: color,
            }}
          />
          <div
            className="w-8 h-1.5 -mt-0.5 rounded"
            style={{ backgroundColor: color }}
          />
          <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-yellow-400 rounded-full"
            style={{ boxShadow: "0 0 4px rgba(253,224,71,0.6)" }}
          />
        </div>
      )
    case "hat_crown":
      return (
        <div className="absolute -top-4 left-0 right-0 flex justify-center">
          <div className="relative">
            <div className="w-7 h-2.5" style={{ backgroundColor: color }} />
            <div className="absolute -top-2 left-0 w-2 h-2" style={{ backgroundColor: color }} />
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-2 h-3" style={{ backgroundColor: color }} />
            <div className="absolute -top-2 right-0 w-2 h-2" style={{ backgroundColor: color }} />
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-red-500 rounded-full" />
          </div>
        </div>
      )
    case "hat_cat_ears":
      return (
        <div className="absolute -top-3 left-0 right-0 flex justify-between px-0.5">
          <div
            className="w-0 h-0 border-l-[4px] border-r-[4px] border-b-[8px]"
            style={{
              borderLeftColor: "transparent",
              borderRightColor: "transparent",
              borderBottomColor: color,
            }}
          />
          <div
            className="w-0 h-0 border-l-[4px] border-r-[4px] border-b-[8px]"
            style={{
              borderLeftColor: "transparent",
              borderRightColor: "transparent",
              borderBottomColor: color,
            }}
          />
        </div>
      )
    case "hat_flower":
      return (
        <div className="absolute -top-3 left-0">
          <div className="relative">
            <div className="w-2.5 h-2.5 rounded-full bg-pink-400" />
            <div className="absolute top-0 left-2 w-2.5 h-2.5 rounded-full bg-pink-300" />
            <div className="absolute top-1 left-1 w-2 h-2 rounded-full bg-yellow-400" />
          </div>
        </div>
      )
    default:
      return null
  }
}
