"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useGame } from "@/lib/game-context"

interface MiniGameFishingProps {
  onClose: () => void
}

const FISH_TYPES = [
  { id: "dorada", name: { es: "Dorada" }, difficulty: 0.3 },
  { id: "salmon", name: { es: "Salmon" }, difficulty: 0.4 },
  { id: "atun", name: { es: "Atun" }, difficulty: 0.5 },
  { id: "calamar", name: { es: "Calamar" }, difficulty: 0.6 },
  { id: "pez_globo", name: { es: "Pez globo" }, difficulty: 0.8 },
]

export function MiniGameFishing({ onClose }: MiniGameFishingProps) {
  const { addToInventory, addVocabulary, gameState } = useGame()
  const [phase, setPhase] = useState<"waiting" | "reeling" | "caught" | "missed">("waiting")
  const [indicatorPos, setIndicatorPos] = useState(50)
  const [targetPos, setTargetPos] = useState(40)
  const [targetWidth, setTargetWidth] = useState(20)
  const [speed, setSpeed] = useState(2)
  const [direction, setDirection] = useState(1)
  const [caughtFish, setCaughtFish] = useState<typeof FISH_TYPES[0] | null>(null)
  const [fishCaught, setFishCaught] = useState(0)
  const animRef = useRef<number>(0)

  // Animate indicator during reeling
  useEffect(() => {
    if (phase !== "reeling") return

    const animate = () => {
      setIndicatorPos((pos) => {
        let newPos = pos + speed * direction
        if (newPos >= 95 || newPos <= 5) {
          setDirection((d) => -d)
          newPos = Math.max(5, Math.min(95, newPos))
        }
        return newPos
      })
      animRef.current = requestAnimationFrame(animate)
    }

    animRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animRef.current)
  }, [phase, speed, direction])

  // Start fishing (bite after random delay)
  const startFishing = useCallback(() => {
    setPhase("waiting")
    const fish = FISH_TYPES[Math.floor(Math.random() * FISH_TYPES.length)]
    setCaughtFish(fish)
    setTargetWidth(30 - fish.difficulty * 15)
    setSpeed(1.5 + fish.difficulty * 2)
    setTargetPos(20 + Math.random() * 60)

    const biteDelay = 1500 + Math.random() * 3000
    const timer = setTimeout(() => {
      setPhase("reeling")
      setIndicatorPos(5)
      setDirection(1)
    }, biteDelay)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const cleanup = startFishing()
    return cleanup
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Handle space press to catch
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === " " && phase === "reeling") {
        e.preventDefault()
        const inZone = indicatorPos >= targetPos && indicatorPos <= targetPos + targetWidth

        if (inZone && caughtFish) {
          setPhase("caught")
          setFishCaught((f) => f + 1)

          addToInventory({
            id: caughtFish.id,
            name: caughtFish.name,
            category: "food",
            quantity: 1,
          })

          const fishTranslations: { [key: string]: string } = {
            Dorada: "Sea Bream",
            Salmon: "Salmon",
            Atun: "Tuna",
            Calamar: "Squid",
            "Pez globo": "Pufferfish",
          }

          addVocabulary({
            word: caughtFish.name.es,
            reading: "",
            translation: fishTranslations[caughtFish.name.es] || caughtFish.name.es,
            timesUsed: 1,
            mastery: 10,
            category: "food",
          })
        } else {
          setPhase("missed")
        }
      } else if (e.key === " " && (phase === "caught" || phase === "missed")) {
        e.preventDefault()
        startFishing()
      } else if (e.key === "Escape") {
        onClose()
      }
    }

    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [phase, indicatorPos, targetPos, targetWidth, caughtFish, addToInventory, addVocabulary, onClose, startFishing])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={onClose}>
      <div className="undertale-box max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="bg-black p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/20">
            <div>
              <h2 className="text-blue-400 font-pixel text-xs">PESCA / FISHING</h2>
              <div className="text-gray-500 font-pixel text-[6px] mt-0.5">
                {fishCaught} fish caught
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-white font-pixel text-[8px] border border-gray-600 hover:border-white px-2 py-1 transition-colors"
            >
              [ESC]
            </button>
          </div>

          {/* Fishing bar */}
          <div className="relative h-8 border-2 border-white/30 mb-4 overflow-hidden">
            <div className="absolute inset-0 bg-blue-900/30" />

            {phase === "reeling" && (
              <>
                <div
                  className="absolute top-0 bottom-0 bg-green-500/30 border-x border-green-500"
                  style={{ left: `${targetPos}%`, width: `${targetWidth}%` }}
                />
                <div
                  className="absolute top-0 bottom-0 w-1 bg-yellow-400"
                  style={{
                    left: `${indicatorPos}%`,
                    boxShadow: "0 0 4px #FFD700",
                  }}
                />
              </>
            )}

            {phase === "waiting" && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-cyan-400 font-pixel text-[8px] animate-pulse">
                  ... Esperando mordida / Waiting for bite ...
                </span>
              </div>
            )}
          </div>

          {/* Status */}
          <div className="text-center">
            {phase === "waiting" && (
              <div className="text-gray-500 font-pixel text-[8px]">
                Esperando un pez... / Waiting for a fish...
              </div>
            )}

            {phase === "reeling" && (
              <div className="text-yellow-400 font-pixel text-[8px] animate-pulse">
                [SPACE] Atrapar! / Press [SPACE] to catch!
              </div>
            )}

            {phase === "caught" && caughtFish && (
              <div className="p-3 border border-green-500 bg-green-500/10">
                <div className="text-green-400 font-pixel text-[10px]">
                  Lo atrapaste! / Caught it!
                </div>
                <div className="text-yellow-400 font-pixel text-sm mt-1">
                  {caughtFish.name.es}
                </div>
                <div className="text-gray-500 font-pixel text-[6px] mt-2">
                  [SPACE] otra vez / again
                </div>
              </div>
            )}

            {phase === "missed" && (
              <div className="p-3 border border-red-500 bg-red-500/10">
                <div className="text-red-400 font-pixel text-[10px]">
                  Se escapo! / It got away!
                </div>
                <div className="text-gray-500 font-pixel text-[6px] mt-2">
                  [SPACE] otra vez / again
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
