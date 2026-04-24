"use client"

import { useState, useEffect } from "react"
import { useGame } from "@/lib/game-context"
import type { LearningDirection } from "@/lib/game-state"

export function LanguageSelect() {
  const { startGame, isGameStarted, hasSavedGame, loadSavedGame } = useGame()
  const [playerName, setPlayerName] = useState("")
  const [direction, setDirection] = useState<LearningDirection>("en-to-es")
  const [step, setStep] = useState<"intro" | "direction" | "name" | "confirm">("intro")
  const [typedText, setTypedText] = useState("")
  const [showContinue, setShowContinue] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const introText = "* Un poder extrano resuena dentro de ti...\n  A strange power resonates within you..."

  // Typewriter effect for intro
  useEffect(() => {
    if (step === "intro") {
      let index = 0
      setTypedText("")
      setShowContinue(false)

      const interval = setInterval(() => {
        if (index <= introText.length) {
          setTypedText(introText.slice(0, index))
          index++
        } else {
          clearInterval(interval)
          setTimeout(() => setShowContinue(true), 500)
        }
      }, 50)
      return () => clearInterval(interval)
    }
  }, [step])

  if (isGameStarted) return null

  const handleContinueGame = async () => {
    setIsLoading(true)
    const success = await loadSavedGame()
    if (!success) {
      setIsLoading(false)
      // If load fails, let them start new
      setStep("name")
    }
  }

  const handleStartGame = () => {
    if (playerName.trim()) {
      startGame(direction, playerName.trim())
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-yellow-400 font-pixel text-lg mb-2 tracking-wider">
            LANGUAGE QUEST
          </h1>
          <div className="text-white font-pixel text-[10px]">
            * La Aventura de las Palabras - An AI-Powered Bilingual RPG *
          </div>
          <div className="text-gray-500 font-pixel text-[8px] mt-1">
            Espanol + English
          </div>
        </div>

        {/* Intro */}
        {step === "intro" && (
          <div className="undertale-box p-1">
            <div className="bg-black p-6 text-center space-y-6">
              <div className="text-white font-pixel text-xs leading-relaxed min-h-[80px] whitespace-pre-line">
                <p>{typedText}<span className="animate-pulse">_</span></p>
                {showContinue && (
                  <p className="mt-4 text-yellow-400">* El poder de las PALABRAS. The power of WORDS.</p>
                )}
              </div>

              {showContinue && (
                <div className="space-y-3">
                  <button
                    onClick={() => setStep("direction")}
                    className="text-yellow-400 hover:text-white font-pixel text-xs border-2 border-yellow-400 hover:border-white px-6 py-3 transition-colors w-full"
                  >
                    [ EMPEZAR / NEW GAME ]
                  </button>

                  {hasSavedGame && (
                    <button
                      onClick={handleContinueGame}
                      disabled={isLoading}
                      className="text-cyan-400 hover:text-white font-pixel text-xs border-2 border-cyan-400 hover:border-white px-6 py-3 transition-colors w-full disabled:opacity-50"
                    >
                      {isLoading ? "* Cargando... / Loading..." : "[ CONTINUAR / CONTINUE ]"}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Direction Picker */}
        {step === "direction" && (
          <div className="undertale-box p-1">
            <div className="bg-black p-6">
              <div className="text-yellow-400 font-pixel text-xs mb-2 text-center">
                * Que quieres aprender? / What do you want to learn?
              </div>
              <div className="text-gray-500 font-pixel text-[8px] mb-6 text-center">
                Elige tu direccion / Choose your direction
              </div>

              <div className="space-y-3 mb-6">
                <button
                  onClick={() => { setDirection("en-to-es"); setStep("name") }}
                  className={`w-full text-left font-pixel text-xs border-2 px-4 py-3 transition-colors ${
                    direction === "en-to-es"
                      ? "text-yellow-400 border-yellow-400"
                      : "text-white border-white/40 hover:border-white"
                  }`}
                >
                  <div>I speak English, teach me Spanish</div>
                  <div className="text-gray-500 text-[8px] mt-1">NPCs speak Spanish with English translations</div>
                </button>
                <button
                  onClick={() => { setDirection("es-to-en"); setStep("name") }}
                  className={`w-full text-left font-pixel text-xs border-2 px-4 py-3 transition-colors ${
                    direction === "es-to-en"
                      ? "text-yellow-400 border-yellow-400"
                      : "text-white border-white/40 hover:border-white"
                  }`}
                >
                  <div>Hablo espanol, ensenname ingles</div>
                  <div className="text-gray-500 text-[8px] mt-1">NPCs hablan ingles con traducciones en espanol</div>
                </button>
              </div>

              <button
                onClick={() => setStep("intro")}
                className="w-full text-gray-400 hover:text-white font-pixel text-xs border border-gray-600 hover:border-white px-4 py-2 transition-colors"
              >
                [ VOLVER / BACK ]
              </button>
            </div>
          </div>
        )}

        {/* Name Entry */}
        {step === "name" && (
          <div className="undertale-box p-1">
            <div className="bg-black p-6">
              <div className="text-yellow-400 font-pixel text-xs mb-2 text-center">
                * Como te llamas? / What is your name?
              </div>
              <div className="text-gray-500 font-pixel text-[8px] mb-6 text-center">
                Tu aventura comienza / Your adventure begins
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-2 border-2 border-white p-3">
                  <span className="text-yellow-400 font-pixel text-xs">{">"}</span>
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Nombre... / Name..."
                    className="flex-1 bg-transparent text-white font-pixel text-xs focus:outline-none placeholder:text-gray-600"
                    maxLength={12}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && playerName.trim()) {
                        setStep("confirm")
                      }
                    }}
                  />
                </div>
                <div className="text-gray-600 font-pixel text-[8px] mt-1 text-right">
                  {playerName.length}/12
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep("direction")}
                  className="flex-1 text-gray-400 hover:text-white font-pixel text-xs border border-gray-600 hover:border-white px-4 py-2 transition-colors"
                >
                  [ VOLVER / BACK ]
                </button>
                <button
                  onClick={() => playerName.trim() && setStep("confirm")}
                  disabled={!playerName.trim()}
                  className="flex-1 text-yellow-400 hover:text-white font-pixel text-xs border-2 border-yellow-400 hover:border-white px-4 py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  [ SIGUIENTE / NEXT ]
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation */}
        {step === "confirm" && (
          <div className="undertale-box p-1">
            <div className="bg-black p-6 text-center">
              <div className="text-yellow-400 font-pixel text-xs mb-4">
                * Confirmacion / Confirmation
              </div>

              <div className="border border-white/30 p-4 mb-6">
                <div className="text-white font-pixel text-sm mb-4">
                  {playerName}
                </div>
                <div className="text-gray-500 font-pixel text-[10px]">
                  {direction === "en-to-es"
                    ? "Aprendiendo: Espanol"
                    : "Learning: English"}
                </div>
                <div className="text-gray-600 font-pixel text-[8px] mt-1">
                  {direction === "en-to-es"
                    ? "English speaker learning Spanish"
                    : "Hispanohablante aprendiendo ingles"}
                </div>
              </div>

              <div className="text-white font-pixel text-xs mb-2">
                * Es correcto?
              </div>
              <div className="text-gray-500 font-pixel text-[8px] mb-6">
                [Is this correct?]
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep("name")}
                  className="flex-1 text-gray-400 hover:text-white font-pixel text-xs border border-gray-600 hover:border-white px-4 py-2 transition-colors"
                >
                  [ NO / NO ]
                </button>
                <button
                  onClick={handleStartGame}
                  className="flex-1 text-yellow-400 hover:text-white font-pixel text-xs border-2 border-yellow-400 hover:border-white px-4 py-2 transition-colors"
                >
                  [ SI / YES ]
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer with Soul heart */}
        <div className="mt-8 text-center">
          <div className="flex justify-center gap-2 mb-2">
            <svg viewBox="0 0 12 12" className="w-4 h-4 soul-heart">
              <path
                d="M6 10 L2 6 Q0 4 2 2 Q4 0 6 3 Q8 0 10 2 Q12 4 10 6 Z"
                fill="#ff0000"
              />
            </svg>
          </div>
          <div className="text-gray-600 font-pixel text-[8px]">
            * Impulsado por IA / Powered by AI *
          </div>
        </div>
      </div>
    </div>
  )
}
