"use client"

import { useGame } from "@/lib/game-context"
import type { NPCProfile } from "@/lib/game-state"

interface FriendshipDisplayProps {
  npc: NPCProfile
}

export function FriendshipDisplay({ npc }: FriendshipDisplayProps) {
  const { gameState } = useGame()
  if (!gameState) return null

  const friendship = gameState.friendships.find((f) => f.npcId === npc.id)
  const level = friendship?.level ?? 0
  const maxLevel = 5

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: maxLevel }).map((_, i) => (
        <span
          key={i}
          className="font-pixel text-[8px]"
          style={{ color: i < level ? "#FF6B6B" : "#3a3a3a" }}
        >
          {i < level ? "\u2665" : "\u2661"}
        </span>
      ))}
    </div>
  )
}

export function FriendshipHearts({ npcId }: { npcId: string }) {
  const { gameState } = useGame()
  if (!gameState) return null

  const friendship = gameState.friendships.find((f) => f.npcId === npcId)
  const level = friendship?.level ?? 0

  if (level === 0) return null

  return (
    <div className="flex items-center gap-px mt-0.5">
      {Array.from({ length: level }).map((_, i) => (
        <span key={i} className="text-[6px]" style={{ color: "#FF6B6B" }}>
          {"\u2665"}
        </span>
      ))}
    </div>
  )
}
