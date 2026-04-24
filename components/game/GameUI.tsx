"use client"

import { useState, useCallback } from "react"
import { useGame } from "@/lib/game-context"
import { GameCanvas } from "./GameCanvas"
import { NPCWorld } from "./NPCWorld"
import { DialogueBox } from "./DialogueBox"
import { Vocabulary } from "./Vocabulary"
import { HUD } from "./HUD"
import type { NPCProfile, VocabularyWord } from "@/lib/game-state"
import { SHOP_ITEMS } from "@/lib/game-state"

// Simple player avatar component
function PlayerAvatar({ outfit, hat }: { outfit: string; hat: string }) {
  const outfitItem = SHOP_ITEMS.find(i => i.id === outfit)
  const hatItem = SHOP_ITEMS.find(i => i.id === hat)

  const outfitColor = outfitItem?.color || "#FACC15"
  const hatColor = hatItem?.color || "transparent"

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div
        className="w-5 h-6 rounded-t-sm"
        style={{ backgroundColor: outfitColor }}
      />
      <div
        className="absolute top-0 w-4 h-4 rounded-full bg-amber-200"
      />
      {hatColor !== "transparent" && (
        <div
          className="absolute -top-1 w-5 h-2 rounded-t-sm"
          style={{ backgroundColor: hatColor }}
        />
      )}
    </div>
  )
}

export function GameUI() {
  const {
    gameState,
    addVocabulary,
    shopItems,
    buyItem,
    equipItem,
    canAfford,
    activeNpcId,
    setActiveNpcId,
  } = useGame()

  if (!gameState) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-yellow-400 font-pixel text-xs">* ロード中... / Loading...</div>
      </div>
    )
  }

  const [activePanel, setActivePanel] = useState<"world" | "map" | "vocab" | "shop">("world")
  const [isTransitioning, setIsTransitioning] = useState(false)

  const handleWordLearned = useCallback((word: { original: string; reading?: string; translation: string }) => {
    const vocabWord: VocabularyWord = {
      word: word.original,
      reading: word.reading || "",
      translation: word.translation,
      timesUsed: 1,
      mastery: 10,
      category: "conversation",
    }
    addVocabulary(vocabWord)
  }, [addVocabulary])

  const handleTalkToNPCFromMap = async (npc: NPCProfile) => {
    setActiveNpcId(npc.id)
    setActivePanel("world")
  }

  return (
    <div className="min-h-screen bg-black">
      {/* HUD Overlay */}
      <HUD />

      {/* Navigation Tabs */}
      <div className="fixed top-0 left-0 right-0 z-30 bg-black/95 border-b-2 border-white/30">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex">
            <button
              onClick={() => setActivePanel("world")}
              className={`flex-1 py-3 font-pixel text-[10px] border-b-2 transition-colors ${
                activePanel === "world"
                  ? "text-yellow-400 border-yellow-400"
                  : "text-gray-500 border-transparent hover:text-white"
              }`}
            >
              冒険 / WORLD
            </button>
            <button
              onClick={() => setActivePanel("map")}
              className={`flex-1 py-3 font-pixel text-[10px] border-b-2 transition-colors ${
                activePanel === "map"
                  ? "text-green-400 border-green-400"
                  : "text-gray-500 border-transparent hover:text-white"
              }`}
            >
              地図 / MAP
            </button>
            <button
              onClick={() => setActivePanel("vocab")}
              className={`flex-1 py-3 font-pixel text-[10px] border-b-2 transition-colors ${
                activePanel === "vocab"
                  ? "text-cyan-400 border-cyan-400"
                  : "text-gray-500 border-transparent hover:text-white"
              }`}
            >
              単語 / WORDS ({gameState.vocabularyLearned.length})
            </button>
            <button
              onClick={() => setActivePanel("shop")}
              className={`flex-1 py-3 font-pixel text-[10px] border-b-2 transition-colors ${
                activePanel === "shop"
                  ? "text-pink-400 border-pink-400"
                  : "text-gray-500 border-transparent hover:text-white"
              }`}
            >
              店 / SHOP
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="pt-14 pb-4 px-4">
        <div className="max-w-4xl mx-auto">
          {activePanel === "world" && (
            <div className="flex flex-col items-center">
              <GameCanvas />
            </div>
          )}

          {activePanel === "map" && (
            <div className="undertale-box">
              <div className="bg-black p-4">
                <NPCWorld
                  onTalkToNPC={handleTalkToNPCFromMap}
                  isDialogueActive={!!activeNpcId}
                />
              </div>
            </div>
          )}

          {activePanel === "vocab" && (
            <Vocabulary
              vocabulary={gameState.vocabularyLearned}
              targetLanguage={gameState.language}
            />
          )}

          {activePanel === "shop" && (
            <div className="undertale-box">
              <div className="bg-black p-4">
                <div className="text-yellow-400 font-pixel text-xs mb-4">
                  * ファッションショップへようこそ！
                </div>
                <div className="text-gray-500 font-pixel text-[8px] mb-1">
                  Welcome to the Fashion Shop!
                </div>
                <div className="text-gray-600 font-pixel text-[8px] mb-4">
                  学んだ単語で服を買おう / Buy outfits with words you learned
                </div>

                <div className="space-y-3">
                  {shopItems.map(item => {
                    const owned = item.unlocked
                    const isOutfit = item.type === "outfit"
                    const equipped = isOutfit
                      ? gameState.currentOutfit === item.id
                      : gameState.currentHat === item.id
                    const canBuy = canAfford(item.price) && !owned

                    return (
                      <div
                        key={item.id}
                        className={`p-3 border-2 ${
                          equipped
                            ? "border-green-500 bg-green-500/10"
                            : owned
                              ? "border-cyan-500/50"
                              : "border-white/20"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className="w-8 h-8 border-2 border-white/30"
                            style={{ backgroundColor: item.color }}
                          />
                          <div className="flex-1">
                            <div className="text-white font-pixel text-xs">
                              {item.name.ja} / {item.name.es}
                              {equipped && <span className="ml-2 text-green-400">[装備中]</span>}
                              {owned && !equipped && <span className="ml-2 text-cyan-400">[所持]</span>}
                            </div>
                            <div className="text-gray-500 font-pixel text-[8px] mt-1">
                              {item.description.ja}
                            </div>

                            {!owned && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                <span className={`font-pixel text-[8px] ${canAfford(item.price) ? "text-yellow-400" : "text-red-400"}`}>
                                  {item.price} 単語必要 / {item.price} words needed
                                </span>
                              </div>
                            )}
                          </div>

                          {owned ? (
                            <button
                              onClick={() => equipItem(item.id, item.type as "outfit" | "hat")}
                              disabled={equipped}
                              className={`font-pixel text-[10px] px-3 py-1 border transition-colors ${
                                equipped
                                  ? "border-gray-600 text-gray-500 cursor-not-allowed"
                                  : "border-cyan-400 text-cyan-400 hover:bg-cyan-400/10"
                              }`}
                            >
                              {equipped ? "装備中" : "装備"}
                            </button>
                          ) : (
                            <button
                              onClick={() => buyItem(item.id)}
                              disabled={!canBuy}
                              className={`font-pixel text-[10px] px-3 py-1 border transition-colors ${
                                canBuy
                                  ? "border-green-400 text-green-400 hover:bg-green-400/10"
                                  : "border-gray-600 text-gray-500 cursor-not-allowed"
                              }`}
                            >
                              購入
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dialogue Box - shows when talking to NPC */}
      {activeNpcId && (
        <DialogueBox
          npcId={activeNpcId}
          onClose={() => setActiveNpcId(null)}
          onWordLearned={handleWordLearned}
        />
      )}
    </div>
  )
}
