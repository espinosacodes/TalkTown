"use client"

import { useState } from "react"
import type { VocabularyWord, LearningDirection } from "@/lib/game-state"

interface VocabularyProps {
  vocabulary: VocabularyWord[]
  targetLanguage: LearningDirection
}

export function Vocabulary({ vocabulary, targetLanguage }: VocabularyProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<"recent" | "alpha">("recent")

  const filteredWords = vocabulary.filter(word =>
    word.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
    word.translation.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const sortedWords = [...filteredWords].sort((a, b) => {
    if (sortBy === "alpha") {
      return a.word.localeCompare(b.word)
    }
    // Recent = reverse order (newest first)
    return 0
  })

  if (sortBy === "recent") {
    sortedWords.reverse()
  }

  return (
    <div className="undertale-box">
      <div className="bg-black p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/20">
          <div>
            <h2 className="text-cyan-400 font-pixel text-xs">
              Vocabulario / VOCABULARY
            </h2>
            <p className="text-gray-500 font-pixel text-[8px] mt-1">
              * Palabras aprendidas: {vocabulary.length} / Words learned: {vocabulary.length}
            </p>
          </div>
          <div className="text-gray-600 font-pixel text-[8px]">
            Espanol + EN
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 border-2 border-white/30 p-2 mb-4 focus-within:border-yellow-400">
          <span className="text-yellow-400 font-pixel text-xs">{">"}</span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search words..."
            className="flex-1 bg-transparent text-white font-pixel text-[10px] focus:outline-none placeholder:text-gray-600"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="text-gray-500 hover:text-white font-pixel text-[8px]"
            >
              [ CLEAR ]
            </button>
          )}
        </div>

        {/* Sort Options */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setSortBy("recent")}
            className={`font-pixel text-[8px] px-2 py-1 border transition-colors ${
              sortBy === "recent"
                ? "border-yellow-400 text-yellow-400"
                : "border-gray-600 text-gray-500 hover:text-white"
            }`}
          >
            RECENT
          </button>
          <button
            onClick={() => setSortBy("alpha")}
            className={`font-pixel text-[8px] px-2 py-1 border transition-colors ${
              sortBy === "alpha"
                ? "border-yellow-400 text-yellow-400"
                : "border-gray-600 text-gray-500 hover:text-white"
            }`}
          >
            A-Z
          </button>
        </div>

        {/* Word List */}
        <div className="max-h-80 overflow-y-auto game-scrollbar">
          {vocabulary.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500 font-pixel text-xs mb-2">
                * No has aprendido palabras aun
              </div>
              <div className="text-gray-600 font-pixel text-[8px]">
                Habla con los NPCs para aprender palabras! / Talk to NPCs to learn words!
              </div>
            </div>
          ) : sortedWords.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500 font-pixel text-xs">
                * No words match your search
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {sortedWords.map((word, index) => (
                <div
                  key={index}
                  className="p-3 border border-white/10 hover:border-yellow-400/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-yellow-400 font-pixel text-xs">
                        {word.word}
                      </span>
                      {word.reading && word.reading !== word.word && (
                        <span className="ml-1 text-gray-500 font-pixel text-[8px]">
                          ({word.reading})
                        </span>
                      )}
                      {word.mastery >= 50 && (
                        <span className="ml-2 text-green-400 font-pixel text-[8px]">*</span>
                      )}
                    </div>
                    <div className="text-gray-400 font-pixel text-[8px]">
                      = {word.translation}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats Footer */}
        {vocabulary.length > 0 && (
          <div className="mt-4 pt-3 border-t border-white/10 flex justify-between text-gray-500 font-pixel text-[8px]">
            <span>Showing: {sortedWords.length}/{vocabulary.length}</span>
            <span>Level: {Math.floor(vocabulary.length / 10) + 1}</span>
          </div>
        )}
      </div>
    </div>
  )
}
