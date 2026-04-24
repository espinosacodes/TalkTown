"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useGame } from "@/lib/game-context"

interface MiniGameFlashcardProps {
  onClose: () => void
}

export function MiniGameFlashcard({ onClose }: MiniGameFlashcardProps) {
  const { gameState, addVocabulary } = useGame()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answer, setAnswer] = useState("")
  const [result, setResult] = useState<"correct" | "wrong" | null>(null)
  const [score, setScore] = useState(0)
  const [total, setTotal] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Sort by lowest mastery first (spaced repetition)
  const words = gameState?.vocabularyLearned
    .slice()
    .sort((a, b) => a.mastery - b.mastery) ?? []

  const currentWord = words[currentIndex % words.length]

  useEffect(() => {
    inputRef.current?.focus()
  }, [currentIndex])

  const handleSubmit = useCallback(() => {
    if (!currentWord || showAnswer) return

    const correct = answer.trim().toLowerCase() === currentWord.translation.toLowerCase()
    setResult(correct ? "correct" : "wrong")
    setTotal((t) => t + 1)
    setShowAnswer(true)

    if (correct) {
      setScore((s) => s + 1)
      addVocabulary({ ...currentWord, mastery: Math.min(100, currentWord.mastery + 5) })
    }
  }, [answer, currentWord, showAnswer, addVocabulary])

  const handleNext = () => {
    setCurrentIndex((i) => i + 1)
    setAnswer("")
    setResult(null)
    setShowAnswer(false)
  }

  if (!gameState || words.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={onClose}>
        <div className="undertale-box max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
          <div className="bg-black p-4 text-center">
            <div className="text-yellow-400 font-pixel text-[10px]">
              No hay palabras aun!
            </div>
            <div className="text-gray-500 font-pixel text-[8px] mt-1">
              Learn some words first!
            </div>
            <button onClick={onClose} className="mt-3 text-white font-pixel text-[8px] border border-white px-3 py-1 hover:bg-white/10">
              OK
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={onClose}>
      <div className="undertale-box max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="bg-black p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/20">
            <div>
              <h2 className="text-green-400 font-pixel text-xs">Tarjeta / FLASHCARD</h2>
              <div className="text-gray-500 font-pixel text-[6px] mt-0.5">
                {score}/{total} correct
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-white font-pixel text-[8px] border border-gray-600 hover:border-white px-2 py-1 transition-colors"
            >
              [ESC]
            </button>
          </div>

          {/* Card */}
          <div className="text-center py-6 border-2 border-white/20 mb-4">
            <div className="text-yellow-400 font-pixel text-lg mb-1">
              {currentWord.word}
            </div>
            {currentWord.reading && currentWord.reading !== currentWord.word && (
              <div className="text-gray-500 font-pixel text-[8px]">
                ({currentWord.reading})
              </div>
            )}
            <div className="text-gray-600 font-pixel text-[6px] mt-1">
              mastery: {currentWord.mastery}%
            </div>
          </div>

          {/* Answer area */}
          {!showAnswer ? (
            <div className="flex gap-2">
              <div className="flex-1 flex items-center border-2 border-white/40 px-2 py-1.5 focus-within:border-green-400 transition-colors">
                <span className="text-green-400 font-pixel text-[10px] mr-1">{">"}</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleSubmit()
                    }
                    e.stopPropagation()
                  }}
                  placeholder="English meaning..."
                  className="flex-1 bg-transparent text-white font-pixel text-[10px] focus:outline-none placeholder:text-gray-600"
                  autoComplete="off"
                />
              </div>
              <button
                onClick={handleSubmit}
                disabled={!answer.trim()}
                className="text-green-400 font-pixel text-[10px] border-2 border-green-400 px-3 py-1.5 hover:bg-green-400/10 transition-colors disabled:opacity-30"
              >
                Respuesta
              </button>
            </div>
          ) : (
            <div className="text-center">
              <div
                className={`p-2 border mb-3 ${
                  result === "correct"
                    ? "border-green-500 bg-green-500/10"
                    : "border-red-500 bg-red-500/10"
                }`}
              >
                <div className={`font-pixel text-[10px] ${result === "correct" ? "text-green-400" : "text-red-400"}`}>
                  {result === "correct" ? "Correcto! / Correct!" : "Incorrecto / Wrong"}
                </div>
                <div className="text-white font-pixel text-[10px] mt-1">
                  {currentWord.word} = {currentWord.translation}
                </div>
              </div>
              <button
                onClick={handleNext}
                className="text-yellow-400 font-pixel text-[8px] border border-yellow-400 px-4 py-1 hover:bg-yellow-400/10"
              >
                Siguiente / NEXT
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
