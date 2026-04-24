"use client"

import { useState, useEffect, useCallback } from "react"
import { useGame } from "@/lib/game-context"

interface MiniGameWordMatchProps {
  onClose: () => void
}

interface Card {
  id: number
  text: string
  pairId: number
  isFlipped: boolean
  isMatched: boolean
}

export function MiniGameWordMatch({ onClose }: MiniGameWordMatchProps) {
  const { gameState, addVocabulary } = useGame()
  const [cards, setCards] = useState<Card[]>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [matches, setMatches] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [timer, setTimer] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [isChecking, setIsChecking] = useState(false)

  // Initialize cards from vocabulary
  useEffect(() => {
    if (!gameState || gameState.vocabularyLearned.length < 4) return

    const words = [...gameState.vocabularyLearned]
      .sort(() => Math.random() - 0.5)
      .slice(0, 6)

    const cardPairs: Card[] = []
    words.forEach((word, i) => {
      cardPairs.push(
        { id: i * 2, text: word.word, pairId: i, isFlipped: false, isMatched: false },
        { id: i * 2 + 1, text: word.translation, pairId: i, isFlipped: false, isMatched: false }
      )
    })

    setCards(cardPairs.sort(() => Math.random() - 0.5))
  }, [gameState])

  // Timer
  useEffect(() => {
    if (isComplete) return
    const interval = setInterval(() => setTimer((t) => t + 1), 1000)
    return () => clearInterval(interval)
  }, [isComplete])

  const handleCardClick = useCallback((cardId: number) => {
    if (isChecking || isComplete) return
    const card = cards.find((c) => c.id === cardId)
    if (!card || card.isFlipped || card.isMatched) return

    const newFlipped = [...flippedCards, cardId]
    setCards((prev) => prev.map((c) => c.id === cardId ? { ...c, isFlipped: true } : c))
    setFlippedCards(newFlipped)

    if (newFlipped.length === 2) {
      setIsChecking(true)
      setAttempts((a) => a + 1)

      const [first, second] = newFlipped.map((id) => cards.find((c) => c.id === id)!)

      if (first.pairId === second.pairId) {
        // Match found
        setTimeout(() => {
          setCards((prev) => prev.map((c) =>
            c.pairId === first.pairId ? { ...c, isMatched: true } : c
          ))
          setMatches((m) => {
            const newMatches = m + 1
            if (newMatches === cards.length / 2) {
              setIsComplete(true)
              // Boost mastery for matched words
              if (gameState) {
                const matchedWord = gameState.vocabularyLearned.find((v) => v.word === first.text || v.translation === first.text)
                if (matchedWord) {
                  addVocabulary({ ...matchedWord, mastery: Math.min(100, matchedWord.mastery + 5) })
                }
              }
            }
            return newMatches
          })
          setFlippedCards([])
          setIsChecking(false)
        }, 500)
      } else {
        // No match - flip back
        setTimeout(() => {
          setCards((prev) => prev.map((c) =>
            newFlipped.includes(c.id) ? { ...c, isFlipped: false } : c
          ))
          setFlippedCards([])
          setIsChecking(false)
        }, 800)
      }
    }
  }, [cards, flippedCards, isChecking, isComplete, gameState, addVocabulary])

  if (!gameState || gameState.vocabularyLearned.length < 4) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={onClose}>
        <div className="undertale-box max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
          <div className="bg-black p-4 text-center">
            <div className="text-yellow-400 font-pixel text-[10px]">
              Aprende mas palabras primero!
            </div>
            <div className="text-gray-500 font-pixel text-[8px] mt-1">
              Learn at least 4 words first!
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
      <div className="undertale-box max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="bg-black p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/20">
            <div>
              <h2 className="text-purple-400 font-pixel text-xs">Parejas / WORD MATCH</h2>
              <div className="text-gray-500 font-pixel text-[6px] mt-0.5">
                {timer}s | {matches}/{cards.length / 2} pairs | {attempts} attempts
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-white font-pixel text-[8px] border border-gray-600 hover:border-white px-2 py-1 transition-colors"
            >
              [ESC]
            </button>
          </div>

          {/* Card grid */}
          <div className="grid grid-cols-4 gap-2">
            {cards.map((card) => (
              <button
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                disabled={card.isFlipped || card.isMatched || isChecking}
                className={`h-14 border-2 font-pixel text-[8px] transition-all ${
                  card.isMatched
                    ? "border-green-500 bg-green-500/10 text-green-400"
                    : card.isFlipped
                      ? "border-yellow-400 bg-yellow-400/10 text-white"
                      : "border-white/30 bg-white/5 text-transparent hover:border-white/50"
                }`}
              >
                {card.isFlipped || card.isMatched ? card.text : "?"}
              </button>
            ))}
          </div>

          {/* Completion */}
          {isComplete && (
            <div className="mt-3 p-3 border border-yellow-400 bg-yellow-400/10 text-center">
              <div className="text-yellow-400 font-pixel text-[10px]">
                Completo! / COMPLETE!
              </div>
              <div className="text-gray-400 font-pixel text-[8px] mt-1">
                {timer}s | {attempts} attempts
              </div>
              <button
                onClick={onClose}
                className="mt-2 text-white font-pixel text-[8px] border border-white px-4 py-1 hover:bg-white/10"
              >
                Cerrar / CLOSE
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
