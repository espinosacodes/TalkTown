"use client"

import { useState } from "react"
import { useGame } from "@/lib/game-context"
import { Vocabulary } from "./Vocabulary"

interface JournalScreenProps {
  onClose: () => void
  onStartMiniGame?: (type: "word_matching" | "flashcard_review") => void
}

export function JournalScreen({ onClose, onStartMiniGame }: JournalScreenProps) {
  const { gameState } = useGame()
  const [activeTab, setActiveTab] = useState<"vocab" | "diary">("vocab")

  if (!gameState) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={onClose}>
      <div className="undertale-box max-w-lg w-full mx-4 max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="bg-black p-4 flex flex-col min-h-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/20">
            <h2 className="text-yellow-400 font-pixel text-xs">DIARIO / JOURNAL</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-white font-pixel text-[8px] border border-gray-600 hover:border-white px-2 py-1 transition-colors"
            >
              [ESC]
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setActiveTab("vocab")}
              className={`font-pixel text-[8px] px-3 py-1 border transition-colors ${
                activeTab === "vocab"
                  ? "border-cyan-400 text-cyan-400 bg-cyan-400/10"
                  : "border-white/20 text-gray-400 hover:text-white"
              }`}
            >
              PALABRAS / WORDS
            </button>
            <button
              onClick={() => setActiveTab("diary")}
              className={`font-pixel text-[8px] px-3 py-1 border transition-colors ${
                activeTab === "diary"
                  ? "border-pink-400 text-pink-400 bg-pink-400/10"
                  : "border-white/20 text-gray-400 hover:text-white"
              }`}
            >
              DIARIO / DIARY
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 min-h-0 overflow-y-auto game-scrollbar">
            {activeTab === "vocab" && (
              <div>
                <Vocabulary
                  vocabulary={gameState.vocabularyLearned}
                  targetLanguage={gameState.language}
                />
                {onStartMiniGame && gameState.vocabularyLearned.length >= 4 && (
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => onStartMiniGame("word_matching")}
                      className="flex-1 font-pixel text-[8px] px-3 py-2 border border-purple-400 text-purple-400 hover:bg-purple-400/10 transition-colors"
                    >
                      EMPAREJAR / MATCH
                    </button>
                    <button
                      onClick={() => onStartMiniGame("flashcard_review")}
                      className="flex-1 font-pixel text-[8px] px-3 py-2 border border-green-400 text-green-400 hover:bg-green-400/10 transition-colors"
                    >
                      TARJETAS / FLASH
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === "diary" && (
              <div className="space-y-3">
                {gameState.journalEntries.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-500 font-pixel text-[10px]">* No hay entradas aun</div>
                    <div className="text-gray-600 font-pixel text-[8px] mt-1">No diary entries yet</div>
                  </div>
                ) : (
                  gameState.journalEntries.slice().reverse().map((entry) => (
                    <div key={entry.id} className="p-2 border border-white/10">
                      <div className="text-gray-400 font-pixel text-[6px]">
                        {new Date(entry.date).toLocaleDateString()}
                      </div>
                      {entry.wordsLearned.length > 0 && (
                        <div className="text-cyan-400 font-pixel text-[8px] mt-1">
                          New words: {entry.wordsLearned.join(", ")}
                        </div>
                      )}
                      {entry.npcsVisited.length > 0 && (
                        <div className="text-yellow-400 font-pixel text-[8px] mt-0.5">
                          NPCs visited: {entry.npcsVisited.join(", ")}
                        </div>
                      )}
                    </div>
                  ))
                )}

                {/* Stats summary */}
                <div className="p-3 border border-white/20 mt-2">
                  <div className="text-white font-pixel text-[8px]">Stats</div>
                  <div className="text-gray-400 font-pixel text-[6px] mt-1 space-y-0.5">
                    <div>Words: {gameState.vocabularyLearned.length}</div>
                    <div>Conversations: {gameState.totalWordsSpoken}</div>
                    <div>Quests: {gameState.questsCompleted.length}</div>
                    <div>Gold: {gameState.gold}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
