"use client"

import { useState, useEffect, useRef } from "react"
import { SHOP_ITEMS } from "@/lib/game-state"
import type { OtherPlayer, ChatMessage } from "@/hooks/use-multiplayer"

interface OtherPlayerSpriteProps {
  player: OtherPlayer
  tileSize: number
  chatMessages: ChatMessage[]
}

export function OtherPlayerSprite({ player, tileSize, chatMessages }: OtherPlayerSpriteProps) {
  const [frame, setFrame] = useState(0)
  const [displayX, setDisplayX] = useState(player.x)
  const [displayY, setDisplayY] = useState(player.y)
  const [chatBubble, setChatBubble] = useState<string | null>(null)
  const bubbleTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Smooth interpolation toward target position
  useEffect(() => {
    let raf: number
    const lerp = () => {
      setDisplayX((prev) => {
        const diff = player.x - prev
        return Math.abs(diff) < 0.05 ? player.x : prev + diff * 0.25
      })
      setDisplayY((prev) => {
        const diff = player.y - prev
        return Math.abs(diff) < 0.05 ? player.y : prev + diff * 0.25
      })
      raf = requestAnimationFrame(lerp)
    }
    raf = requestAnimationFrame(lerp)
    return () => cancelAnimationFrame(raf)
  }, [player.x, player.y])

  // Idle animation
  useEffect(() => {
    const interval = setInterval(() => setFrame((f) => (f + 1) % 4), 300)
    return () => clearInterval(interval)
  }, [])

  // Show latest chat message as bubble
  useEffect(() => {
    const latest = chatMessages.filter((m) => m.senderId === player.id).pop()
    if (!latest || Date.now() - latest.timestamp > 5000) return
    setChatBubble(latest.message)
    if (bubbleTimeoutRef.current) clearTimeout(bubbleTimeoutRef.current)
    bubbleTimeoutRef.current = setTimeout(() => setChatBubble(null), 5000)
    return () => {
      if (bubbleTimeoutRef.current) clearTimeout(bubbleTimeoutRef.current)
    }
  }, [chatMessages, player.id])

  const outfitItem = SHOP_ITEMS.find((i) => i.id === player.outfit)
  const hatItem = SHOP_ITEMS.find((i) => i.id === player.hat)
  const outfitColor = outfitItem?.color || "#22c55e"
  const hatColor = hatItem?.color || "transparent"

  const bobOffset = [0, -1, -2, -1][frame]
  const facingRight = player.facing === "right"

  return (
    <div
      className="absolute pointer-events-none z-[15] transition-none"
      style={{
        left: displayX * tileSize,
        top: displayY * tileSize,
        width: tileSize,
        height: tileSize,
        transform: facingRight ? "scaleX(1)" : "scaleX(-1)",
      }}
    >
      {/* Chat bubble */}
      {chatBubble && (
        <div
          className="absolute -top-10 left-1/2 z-30 pointer-events-none"
          style={{
            transform: facingRight ? "translateX(-50%)" : "translateX(-50%) scaleX(-1)",
            maxWidth: 120,
          }}
        >
          <div className="bg-white text-black font-pixel text-[6px] px-1.5 py-0.5 rounded border border-gray-300 whitespace-nowrap overflow-hidden text-ellipsis">
            {chatBubble.slice(0, 40)}
          </div>
        </div>
      )}

      {/* Name tag */}
      <div
        className="absolute -top-4 left-1/2 z-20 pointer-events-none"
        style={{
          transform: facingRight ? "translateX(-50%)" : "translateX(-50%) scaleX(-1)",
        }}
      >
        <div className="bg-black/70 text-cyan-300 font-pixel text-[5px] px-1 py-0.5 rounded whitespace-nowrap">
          {player.name}
        </div>
      </div>

      <div className="relative w-full h-full flex items-center justify-center">
        {/* Shadow */}
        <div
          className="absolute bottom-0.5 w-6 h-1.5 rounded-full"
          style={{ backgroundColor: "rgba(0,0,0,0.3)" }}
        />

        {/* Body container with bob */}
        <div className="relative" style={{ transform: `translateY(${bobOffset}px)` }}>
          {/* Hat */}
          {hatItem && hatItem.id !== "hat_none" && hatColor !== "transparent" && (
            <div
              className="absolute -top-1 left-0 right-0 h-2 rounded-t"
              style={{ backgroundColor: hatColor }}
            />
          )}

          {/* Head */}
          <div
            className="w-6 h-6 rounded-sm relative"
            style={{ backgroundColor: "#FFE4C4", border: "1px solid rgba(255,255,255,0.15)" }}
          >
            {/* Hair (when no hat) */}
            {(!hatItem || hatItem.id === "hat_none") && (
              <div
                className="absolute -top-1 left-0 right-0 h-2.5 rounded-t-sm"
                style={{ backgroundColor: "#5D4037" }}
              />
            )}
            {/* Eyes */}
            <div className="absolute top-2 left-0.5 w-1.5 h-1.5 bg-white rounded-full">
              <div className="absolute w-0.5 h-0.5 bg-black rounded-full" style={{ left: 1, top: 1 }} />
            </div>
            <div className="absolute top-2 right-0.5 w-1.5 h-1.5 bg-white rounded-full">
              <div className="absolute w-0.5 h-0.5 bg-black rounded-full" style={{ right: 1, top: 1 }} />
            </div>
          </div>

          {/* Body */}
          <div
            className="w-5 h-4 mx-auto -mt-0.5"
            style={{
              backgroundColor: outfitColor,
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          />

          {/* Legs */}
          <div className="flex justify-center gap-0.5 -mt-0.5">
            <div className="w-1.5 h-2 bg-gray-800 rounded-b-sm" />
            <div className="w-1.5 h-2 bg-gray-800 rounded-b-sm" />
          </div>
        </div>
      </div>
    </div>
  )
}
