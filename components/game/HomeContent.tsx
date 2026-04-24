"use client"

import { useEffect } from "react"
import { useGame } from "@/lib/game-context"
import { LanguageSelect } from "@/components/game/LanguageSelect"
import { GameUI } from "@/components/game/GameUI"

export function HomeContent({ userId }: { userId: string }) {
  const { isGameStarted, setUserId } = useGame()

  useEffect(() => {
    setUserId(userId)
  }, [userId, setUserId])

  if (!isGameStarted) {
    return <LanguageSelect />
  }

  return <GameUI />
}
