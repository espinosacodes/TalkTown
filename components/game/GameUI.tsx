"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useGame } from "@/lib/game-context"
import { GameCanvas } from "./GameCanvas"
import { NPCWorld } from "./NPCWorld"
import { DialogueBox } from "./DialogueBox"
import { Vocabulary } from "./Vocabulary"
import { HUD } from "./HUD"
import { CraftingScreen } from "./CraftingScreen"
import { JournalScreen } from "./JournalScreen"
import { SocialTab } from "./SocialTab"
import { PlayerChat } from "./PlayerChat"
import { TouchControls } from "./TouchControls"
import { useMultiplayer } from "@/hooks/use-multiplayer"
import { MiniGameWordMatch } from "./MiniGameWordMatch"
import { MiniGameFlashcard } from "./MiniGameFlashcard"
import { MiniGameFishing } from "./MiniGameFishing"
import { useIsTouchDevice } from "@/hooks/use-touch-device"
import { AREA_MAPS } from "@/lib/tile-map"
import { getNPCsInArea } from "@/lib/npc-profiles"
import type { NPCProfile, MiniGameType } from "@/lib/game-state"
import type { NPCActivity } from "@/lib/npc-schedules"
import { SHOP_ITEMS } from "@/lib/game-state"

const TILE_SIZE = 36

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
    shopItems,
    buyItem,
    equipItem,
    canAfford,
    activeNpcId,
    setActiveNpcId,
    playerFacing,
  } = useGame()

  const [activePanel, setActivePanel] = useState<"world" | "map" | "vocab" | "shop" | "social">("world")
  const [chatFocused, setChatFocused] = useState(false)
  const [showCrafting, setShowCrafting] = useState(false)
  const [showJournal, setShowJournal] = useState(false)
  const [showInventory, setShowInventory] = useState(false)
  const [activeMiniGame, setActiveMiniGame] = useState<MiniGameType | null>(null)
  const [unclaimedGifts, setUnclaimedGifts] = useState<Array<{ recipientId: string; giftId: string; senderId: string; senderName: string; type: "item" | "gold"; itemId?: string; itemName?: string; amount?: number; createdAt: number; claimed: boolean }>>([])

  const isTouchDevice = useIsTouchDevice()
  const canvasWrapperRef = useRef<HTMLDivElement>(null)
  const [canvasScale, setCanvasScale] = useState(1)
  const getNPCPositionRef = useRef<((npcId: string) => { x: number; y: number } | undefined) | undefined>(undefined)

  const handleNPCSimulation = useCallback((getter: (npcId: string) => { x: number; y: number } | undefined) => {
    getNPCPositionRef.current = getter
  }, [])

  // Multiplayer
  const { otherPlayers, chatMessages, onlineCount, sendChat } = useMultiplayer({
    userId: gameState?.sessionId || "",
    playerName: gameState?.playerName || "",
    currentArea: gameState?.currentArea || "town_square",
    playerX: gameState?.playerPosition.x || 0,
    playerY: gameState?.playerPosition.y || 0,
    playerFacing,
    outfit: gameState?.currentOutfit || "default",
    hat: gameState?.currentHat || "hat_none",
    level: gameState?.playerLevel || "beginner",
    enabled: !!gameState,
  })

  // Compute responsive canvas scale
  useEffect(() => {
    if (!gameState) return
    const areaMap = AREA_MAPS[gameState.currentArea]
    const canvasW = areaMap.width * TILE_SIZE
    const canvasH = areaMap.height * TILE_SIZE

    const recalc = () => {
      const availW = window.innerWidth - 32 // px-4 on each side
      const availH = window.innerHeight - 120 // top nav + some padding
      setCanvasScale(Math.min(1, availW / canvasW, availH / canvasH))
    }

    recalc()
    window.addEventListener("resize", recalc)
    return () => window.removeEventListener("resize", recalc)
  }, [gameState?.currentArea, gameState])

  // Toggle body scroll lock on touch devices when on world panel
  useEffect(() => {
    if (isTouchDevice && activePanel === "world") {
      document.body.classList.add("touch-game-active")
    } else {
      document.body.classList.remove("touch-game-active")
    }
    return () => document.body.classList.remove("touch-game-active")
  }, [isTouchDevice, activePanel])

  // Touch action handler (TALK / ESC)
  const handleTouchAction = useCallback(() => {
    if (activeNpcId) {
      setActiveNpcId(null)
    } else if (gameState) {
      // Try to talk to nearby NPC — use runtime positions when available
      const npcsInArea = getNPCsInArea(gameState.currentArea)
      const nearbyNpc = npcsInArea.find((npc: NPCProfile) => {
        const runtimePos = getNPCPositionRef.current?.(npc.id)
        const pos = runtimePos || npc.position
        const dx = Math.abs(gameState.playerPosition.x - pos.x)
        const dy = Math.abs(gameState.playerPosition.y - pos.y)
        return dx <= 1 && dy <= 1
      })
      if (nearbyNpc) {
        setActiveNpcId(nearbyNpc.id)
      }
    }
  }, [activeNpcId, setActiveNpcId, gameState])

  const fetchGifts = useCallback(async () => {
    try {
      const res = await fetch("/api/gifts", {
        headers: { "x-user-id": gameState?.sessionId || "" },
      })
      if (res.ok) {
        const data = await res.json()
        setUnclaimedGifts(data.gifts || [])
      }
    } catch {
      // ignore
    }
  }, [])

  // Poll gifts every 30s
  useEffect(() => {
    fetchGifts()
    const interval = setInterval(fetchGifts, 30000)
    return () => clearInterval(interval)
  }, [fetchGifts])

  if (!gameState) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-yellow-400 font-pixel text-xs">* Cargando... / Loading...</div>
      </div>
    )
  }

  const handleTalkToNPCFromMap = async (npc: NPCProfile) => {
    setActiveNpcId(npc.id)
    setActivePanel("world")
  }

  const handleStartMiniGame = (type: MiniGameType) => {
    setShowJournal(false)
    setActiveMiniGame(type)
  }

  return (
    <div className="min-h-screen bg-black">
      {/* HUD Overlay */}
      <HUD
        onOpenJournal={() => setShowJournal(true)}
        onOpenCrafting={() => setShowCrafting(true)}
        onOpenInventory={() => setShowInventory(true)}
        pendingGifts={unclaimedGifts.length}
      />

      {/* Navigation Tabs */}
      <div className="fixed top-0 left-0 right-0 z-30 bg-black/95 border-b-2 border-white/30">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex">
            <button
              onClick={() => setActivePanel("world")}
              className={`flex-1 py-4 sm:py-3 font-pixel text-[10px] border-b-2 transition-colors ${
                activePanel === "world"
                  ? "text-yellow-400 border-yellow-400"
                  : "text-gray-500 border-transparent hover:text-white"
              }`}
            >
              <span className="sm:hidden">MUNDO</span>
              <span className="hidden sm:inline">MUNDO / WORLD</span>
            </button>
            <button
              onClick={() => setActivePanel("map")}
              className={`flex-1 py-4 sm:py-3 font-pixel text-[10px] border-b-2 transition-colors ${
                activePanel === "map"
                  ? "text-green-400 border-green-400"
                  : "text-gray-500 border-transparent hover:text-white"
              }`}
            >
              <span className="sm:hidden">MAPA</span>
              <span className="hidden sm:inline">MAPA / MAP</span>
            </button>
            <button
              onClick={() => setActivePanel("vocab")}
              className={`flex-1 py-4 sm:py-3 font-pixel text-[10px] border-b-2 transition-colors ${
                activePanel === "vocab"
                  ? "text-cyan-400 border-cyan-400"
                  : "text-gray-500 border-transparent hover:text-white"
              }`}
            >
              <span className="sm:hidden">WORDS</span>
              <span className="hidden sm:inline">PALABRAS / WORDS ({gameState.vocabularyLearned.length})</span>
            </button>
            <button
              onClick={() => setActivePanel("shop")}
              className={`flex-1 py-4 sm:py-3 font-pixel text-[10px] border-b-2 transition-colors ${
                activePanel === "shop"
                  ? "text-pink-400 border-pink-400"
                  : "text-gray-500 border-transparent hover:text-white"
              }`}
            >
              <span className="sm:hidden">TIENDA</span>
              <span className="hidden sm:inline">TIENDA / SHOP</span>
            </button>
            <button
              onClick={() => setActivePanel("social")}
              className={`flex-1 py-4 sm:py-3 font-pixel text-[10px] border-b-2 transition-colors relative ${
                activePanel === "social"
                  ? "text-violet-400 border-violet-400"
                  : "text-gray-500 border-transparent hover:text-white"
              }`}
            >
              AMIGOS
              {unclaimedGifts.length > 0 && (
                <span className="absolute top-1 ml-0.5 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center text-white font-pixel text-[5px]">
                  {unclaimedGifts.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="pt-14 pb-4 px-4">
        <div className="max-w-4xl mx-auto">
          {activePanel === "world" && (
            <div className="flex flex-col items-center">
              <div
                ref={canvasWrapperRef}
                style={{
                  transform: canvasScale < 1 ? `scale(${canvasScale})` : undefined,
                  transformOrigin: "top center",
                  width: canvasScale < 1 ? "max-content" : undefined,
                }}
              >
                <GameCanvas
                  onNPCSimulation={handleNPCSimulation}
                  otherPlayers={otherPlayers}
                  chatMessages={chatMessages}
                  onlineCount={onlineCount}
                />
              </div>
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
                  * Bienvenido a la tienda de moda!
                </div>
                <div className="text-gray-600 font-pixel text-[8px] mb-4">
                  Compra ropa con las palabras aprendidas / Buy outfits with words learned
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
                              {item.name.es}
                              {equipped && <span className="ml-2 text-green-400">[Equipado]</span>}
                              {owned && !equipped && <span className="ml-2 text-cyan-400">[Owned]</span>}
                            </div>
                            <div className="text-gray-500 font-pixel text-[8px] mt-1">
                              {item.description.es}
                            </div>
                            {!owned && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                <span className={`font-pixel text-[8px] ${canAfford(item.price) ? "text-yellow-400" : "text-red-400"}`}>
                                  {item.price} palabras / {item.price} words needed
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
                              {equipped ? "---" : "Equipar"}
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
                              Comprar
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

          {activePanel === "social" && (
            <SocialTab
              currentUserId={gameState.sessionId}
              unclaimedGifts={unclaimedGifts}
              onGiftsChanged={fetchGifts}
            />
          )}
        </div>
      </div>

      {/* Dialogue Box */}
      {activeNpcId && (
        <DialogueBox
          npcId={activeNpcId}
          onClose={() => setActiveNpcId(null)}
        />
      )}

      {/* Player Chat */}
      {activePanel === "world" && gameState && (
        <PlayerChat
          messages={chatMessages}
          onlineCount={onlineCount}
          onSend={sendChat}
          currentUserId={gameState.sessionId}
          onFocusChange={setChatFocused}
        />
      )}

      {/* Touch Controls */}
      {isTouchDevice && activePanel === "world" && (
        <TouchControls
          disabled={!!activeNpcId}
          onAction={handleTouchAction}
          actionLabel={activeNpcId ? "ESC" : "TALK"}
        />
      )}

      {/* Modal Overlays */}
      {showCrafting && <CraftingScreen onClose={() => setShowCrafting(false)} />}
      {showJournal && (
        <JournalScreen
          onClose={() => setShowJournal(false)}
          onStartMiniGame={handleStartMiniGame}
        />
      )}
      {showInventory && (
        <InventoryScreen
          onClose={() => setShowInventory(false)}
        />
      )}

      {/* Mini-games */}
      {activeMiniGame === "word_matching" && (
        <MiniGameWordMatch onClose={() => setActiveMiniGame(null)} />
      )}
      {activeMiniGame === "flashcard_review" && (
        <MiniGameFlashcard onClose={() => setActiveMiniGame(null)} />
      )}
      {activeMiniGame === "fishing" && (
        <MiniGameFishing onClose={() => setActiveMiniGame(null)} />
      )}
    </div>
  )
}

// Simple inventory screen
function InventoryScreen({ onClose }: { onClose: () => void }) {
  const { gameState } = useGame()
  if (!gameState) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={onClose}>
      <div className="undertale-box max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="bg-black p-4">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/20">
            <h2 className="text-green-400 font-pixel text-xs">Inventario / INVENTORY</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-white font-pixel text-[8px] border border-gray-600 hover:border-white px-2 py-1 transition-colors"
            >
              [ESC]
            </button>
          </div>

          {gameState.inventory.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500 font-pixel text-[10px]">* No tienes objetos</div>
              <div className="text-gray-600 font-pixel text-[8px] mt-1">No items yet</div>
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto game-scrollbar">
              {gameState.inventory.map((item) => (
                <div key={item.id} className="p-2 border border-white/10 flex items-center justify-between">
                  <div>
                    <div className="text-white font-pixel text-[10px]">{item.name.es}</div>
                    <div className="text-gray-500 font-pixel text-[6px]">{item.category}</div>
                  </div>
                  <div className="text-yellow-400 font-pixel text-[10px]">x{item.quantity}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
