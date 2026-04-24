"use client"

import { useState } from "react"
import { useGame } from "@/lib/game-context"
import type { Language, CraftRecipe } from "@/lib/game-state"

const CRAFT_RECIPES: CraftRecipe[] = [
  {
    id: "grilled_fish",
    name: { es: "Pescado a la parrilla" },
    requiredWords: ["pescado", "fuego"],
    resultItemId: "grilled_fish",
  },
  {
    id: "flower_vase",
    name: { es: "Florero" },
    requiredWords: ["flor", "vaso"],
    resultItemId: "flower_vase",
  },
  {
    id: "letter",
    name: { es: "Carta" },
    requiredWords: ["carta", "papel"],
    resultItemId: "letter",
  },
  {
    id: "rice_ball",
    name: { es: "Pan dulce" },
    requiredWords: ["arroz", "sal"],
    resultItemId: "rice_ball",
  },
  {
    id: "lantern",
    name: { es: "Linterna" },
    requiredWords: ["luz", "papel"],
    resultItemId: "lantern",
  },
]

const RESULT_ITEMS: Record<string, { name: Record<Language, string>; category: "food" | "gift" | "decoration" | "tool" }> = {
  grilled_fish: { name: { es: "Pescado a la parrilla" }, category: "food" },
  flower_vase: { name: { es: "Florero" }, category: "decoration" },
  letter: { name: { es: "Carta" }, category: "gift" },
  rice_ball: { name: { es: "Pan dulce" }, category: "food" },
  lantern: { name: { es: "Linterna" }, category: "decoration" },
}

interface CraftingScreenProps {
  onClose: () => void
}

export function CraftingScreen({ onClose }: CraftingScreenProps) {
  const { gameState, addToInventory } = useGame()
  const [craftedMessage, setCraftedMessage] = useState<string | null>(null)

  if (!gameState) return null

  const knownWords = gameState.vocabularyLearned.map((v) => v.word)

  const canCraft = (recipe: CraftRecipe) => {
    return recipe.requiredWords.every((w) => knownWords.includes(w))
  }

  const handleCraft = (recipe: CraftRecipe) => {
    if (!canCraft(recipe)) return
    const item = RESULT_ITEMS[recipe.resultItemId]
    if (!item) return

    addToInventory({
      id: recipe.resultItemId,
      name: item.name,
      category: item.category,
      quantity: 1,
    })

    setCraftedMessage(`${recipe.name.es} creado!`)
    setTimeout(() => setCraftedMessage(null), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={onClose}>
      <div className="undertale-box max-w-lg w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="bg-black p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/20">
            <div>
              <h2 className="text-yellow-400 font-pixel text-xs">Artesania / CRAFTING</h2>
              <p className="text-gray-500 font-pixel text-[6px] mt-0.5">
                Crea objetos con palabras aprendidas / Craft items with learned words
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-white font-pixel text-[8px] border border-gray-600 hover:border-white px-2 py-1 transition-colors"
            >
              [ESC]
            </button>
          </div>

          {/* Crafted message */}
          {craftedMessage && (
            <div className="mb-3 p-2 border border-green-500/50 bg-green-500/10 text-center">
              <span className="text-green-400 font-pixel text-[10px]">{craftedMessage}</span>
            </div>
          )}

          {/* Recipe grid */}
          <div className="space-y-3 max-h-64 overflow-y-auto game-scrollbar">
            {CRAFT_RECIPES.map((recipe) => {
              const craftable = canCraft(recipe)
              return (
                <div
                  key={recipe.id}
                  className={`p-3 border-2 transition-all ${
                    craftable ? "border-yellow-400/50 hover:border-yellow-400" : "border-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-pixel text-[10px]">
                        {recipe.name.es}
                      </div>
                      <div className="flex gap-2 mt-1.5">
                        {recipe.requiredWords.map((word) => {
                          const known = knownWords.includes(word)
                          return (
                            <span
                              key={word}
                              className={`font-pixel text-[8px] px-1.5 py-0.5 border ${
                                known
                                  ? "border-green-500/50 text-green-400 bg-green-500/10"
                                  : "border-gray-600 text-gray-500"
                              }`}
                            >
                              {word}
                            </span>
                          )
                        })}
                      </div>
                    </div>
                    <button
                      onClick={() => handleCraft(recipe)}
                      disabled={!craftable}
                      className={`font-pixel text-[8px] px-3 py-1.5 border transition-colors ${
                        craftable
                          ? "border-yellow-400 text-yellow-400 hover:bg-yellow-400/10"
                          : "border-gray-700 text-gray-600 cursor-not-allowed"
                      }`}
                    >
                      {craftable ? "CREAR / CRAFT" : "---"}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
