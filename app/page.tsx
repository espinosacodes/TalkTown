"use client"

import { useGame } from "@/lib/game-context"
import { LanguageSelect } from "@/components/game/LanguageSelect"
import { GameUI } from "@/components/game/GameUI"

export default function Home() {
  const { isGameStarted } = useGame()
  
  if (!isGameStarted) {
    return <LanguageSelect />
  }
  
  return <GameUI />
}
