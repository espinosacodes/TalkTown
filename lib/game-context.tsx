"use client"

import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from "react"
import type { GameState, LearningDirection, AreaId, Quest, VocabularyWord, Message, ShopItem, InventoryItem, JournalEntry, MiniGameType } from "./game-state"
import { createInitialGameState, QUESTS, SHOP_ITEMS } from "./game-state"
import { checkForExit, isTileWalkable } from "./tile-map"

interface GameContextType {
  gameState: GameState | null
  isGameStarted: boolean
  startGame: (language: LearningDirection, playerName: string) => void
  loadSavedGame: () => Promise<boolean>
  hasSavedGame: boolean
  setUserId: (id: string) => void
  movePlayer: (dx: number, dy: number) => boolean
  changeArea: (areaId: AreaId, x: number, y: number) => void
  addVocabulary: (word: VocabularyWord) => void
  updateQuest: (questId: string, objectiveId: string) => void
  completeQuest: () => void
  addMessage: (npcId: string, message: Message) => void
  incrementStats: (type: "words" | "correct" | "mistakes") => void
  updatePlayerLevel: (level: "beginner" | "elementary" | "intermediate") => void
  activeNpcId: string | null
  setActiveNpcId: (id: string | null) => void
  // Shop
  shopItems: ShopItem[]
  buyItem: (itemId: string) => boolean
  equipItem: (itemId: string, type: "outfit" | "hat") => void
  canAfford: (price: number) => boolean
  isShopOpen: boolean
  setIsShopOpen: (open: boolean) => void
  // Friendship
  updateFriendship: (npcId: string, points: number) => void
  // Inventory
  addToInventory: (item: InventoryItem) => void
  removeFromInventory: (itemId: string) => void
  // Journal
  addJournalEntry: (entry: JournalEntry) => void
  // Social / Gifts
  sendGift: (recipientId: string, type: "item" | "gold", itemId?: string, amount?: number) => Promise<boolean>
  claimGift: (giftId: string) => Promise<boolean>
}

const GameContext = createContext<GameContextType | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [activeNpcId, setActiveNpcId] = useState<string | null>(null)
  const [isShopOpen, setIsShopOpen] = useState(false)
  const [hasSavedGame, setHasSavedGame] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Check DynamoDB for existing save when userId is set
  useEffect(() => {
    if (!userId) return
    let cancelled = false
    async function checkSave() {
      try {
        const res = await fetch("/api/load-game", {
          method: "POST",
          headers: { "x-user-id": userId },
        })
        if (!res.ok) return
        const { gameState: loaded } = await res.json()
        if (!cancelled && loaded) {
          setHasSavedGame(true)
        }
      } catch {
        // ignore
      }
    }
    checkSave()
    return () => { cancelled = true }
  }, [userId])

  // Debounced auto-save
  const saveGame = useCallback(async (state: GameState) => {
    if (!userId) return
    try {
      await fetch("/api/save-game", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": userId },
        body: JSON.stringify({ gameState: state }),
      })
    } catch (err) {
      console.error("Auto-save failed:", err)
    }
  }, [userId])

  // Auto-save on state changes (debounced 2s)
  useEffect(() => {
    if (!gameState) return
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    saveTimeoutRef.current = setTimeout(() => {
      saveGame(gameState)
    }, 2000)
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    }
  }, [gameState, saveGame])

  const startGame = useCallback((language: LearningDirection, playerName: string) => {
    if (!userId) return
    const state = createInitialGameState(language, playerName, userId)
    setGameState(state)
    setHasSavedGame(true)
  }, [userId])

  const loadSavedGame = useCallback(async (): Promise<boolean> => {
    if (!userId) return false
    try {
      const res = await fetch("/api/load-game", {
        method: "POST",
        headers: { "x-user-id": userId },
      })
      if (!res.ok) return false
      const { gameState: loaded } = await res.json()
      if (loaded) {
        setGameState(loaded)
        return true
      }
      return false
    } catch {
      return false
    }
  }, [])

  const movePlayer = useCallback((dx: number, dy: number): boolean => {
    if (!gameState) return false

    const newX = gameState.playerPosition.x + dx
    const newY = gameState.playerPosition.y + dy

    if (!isTileWalkable(gameState.currentArea, newX, newY)) {
      const exit = checkForExit(gameState.currentArea, newX, newY)
      if (exit) {
        setGameState((prev) => prev ? {
          ...prev,
          currentArea: exit.targetArea,
          playerPosition: { x: exit.targetX, y: exit.targetY },
        } : null)
        return true
      }
      return false
    }

    const exit = checkForExit(gameState.currentArea, newX, newY)
    if (exit) {
      setGameState((prev) => prev ? {
        ...prev,
        currentArea: exit.targetArea,
        playerPosition: { x: exit.targetX, y: exit.targetY },
      } : null)
      return true
    }

    setGameState((prev) => prev ? {
      ...prev,
      playerPosition: { x: newX, y: newY },
    } : null)
    return true
  }, [gameState])

  const changeArea = useCallback((areaId: AreaId, x: number, y: number) => {
    setGameState((prev) => prev ? {
      ...prev,
      currentArea: areaId,
      playerPosition: { x, y },
    } : null)
  }, [])

  const addVocabulary = useCallback((word: VocabularyWord) => {
    setGameState((prev) => {
      if (!prev) return null
      const existing = prev.vocabularyLearned.find((v) => v.word === word.word)
      if (existing) {
        return {
          ...prev,
          vocabularyLearned: prev.vocabularyLearned.map((v) =>
            v.word === word.word
              ? { ...v, timesUsed: v.timesUsed + 1, mastery: Math.min(100, v.mastery + 10) }
              : v
          ),
        }
      }
      return {
        ...prev,
        vocabularyLearned: [...prev.vocabularyLearned, word],
        gold: prev.gold + 1,
      }
    })
  }, [])

  const updateQuest = useCallback((questId: string, objectiveId: string) => {
    setGameState((prev) => {
      if (!prev || !prev.currentQuest || prev.currentQuest.id !== questId) return prev
      return {
        ...prev,
        currentQuest: {
          ...prev.currentQuest,
          objectives: prev.currentQuest.objectives.map((obj) =>
            obj.id === objectiveId ? { ...obj, completed: true } : obj
          ),
        },
      }
    })
  }, [])

  const completeQuest = useCallback(() => {
    setGameState((prev) => {
      if (!prev || !prev.currentQuest) return prev
      const completedQuestId = prev.currentQuest.id
      const currentIndex = QUESTS.findIndex((q) => q.id === completedQuestId)
      const nextQuest = QUESTS[currentIndex + 1] || null

      return {
        ...prev,
        questsCompleted: [...prev.questsCompleted, completedQuestId],
        currentQuest: nextQuest ? { ...nextQuest } : null,
        gold: prev.gold + 5,
      }
    })
  }, [])

  const addMessage = useCallback((npcId: string, message: Message) => {
    setGameState((prev) => {
      if (!prev) return null
      const history = prev.conversationHistory[npcId] || []
      return {
        ...prev,
        conversationHistory: {
          ...prev.conversationHistory,
          [npcId]: [...history, message],
        },
      }
    })
  }, [])

  const incrementStats = useCallback((type: "words" | "correct" | "mistakes") => {
    setGameState((prev) => {
      if (!prev) return null
      switch (type) {
        case "words":
          return { ...prev, totalWordsSpoken: prev.totalWordsSpoken + 1 }
        case "correct":
          return { ...prev, correctUsages: prev.correctUsages + 1 }
        case "mistakes":
          return { ...prev, mistakesCorrected: prev.mistakesCorrected + 1 }
        default:
          return prev
      }
    })
  }, [])

  const updatePlayerLevel = useCallback((level: "beginner" | "elementary" | "intermediate") => {
    setGameState((prev) => prev ? { ...prev, playerLevel: level } : null)
  }, [])

  // Shop functions
  const canAfford = useCallback((price: number): boolean => {
    if (!gameState) return false
    return gameState.vocabularyLearned.length >= price
  }, [gameState])

  const buyItem = useCallback((itemId: string): boolean => {
    if (!gameState) return false

    const item = SHOP_ITEMS.find((i) => i.id === itemId)
    if (!item) return false

    if (gameState.ownedItems.includes(itemId)) return false
    if (!canAfford(item.price)) return false

    setGameState((prev) => {
      if (!prev) return null
      return {
        ...prev,
        ownedItems: [...prev.ownedItems, itemId],
      }
    })
    return true
  }, [gameState, canAfford])

  const equipItem = useCallback((itemId: string, type: "outfit" | "hat") => {
    setGameState((prev) => {
      if (!prev) return null
      if (type === "outfit") {
        return { ...prev, currentOutfit: itemId }
      } else {
        return { ...prev, currentHat: itemId }
      }
    })
  }, [])

  const updateFriendship = useCallback((npcId: string, points: number) => {
    setGameState((prev) => {
      if (!prev) return null
      const existing = prev.friendships.find((f) => f.npcId === npcId)
      if (existing) {
        const newPoints = existing.points + points
        const newLevel = Math.min(5, Math.floor(newPoints / 10))
        return {
          ...prev,
          friendships: prev.friendships.map((f) =>
            f.npcId === npcId
              ? { ...f, points: newPoints, level: newLevel }
              : f
          ),
        }
      }
      return {
        ...prev,
        friendships: [
          ...prev.friendships,
          { npcId, points: Math.max(0, points), level: Math.min(5, Math.floor(Math.max(0, points) / 10)), giftsGiven: 0 },
        ],
      }
    })
  }, [])

  const addToInventory = useCallback((item: InventoryItem) => {
    setGameState((prev) => {
      if (!prev) return null
      const existing = prev.inventory.find((i) => i.id === item.id)
      if (existing) {
        return {
          ...prev,
          inventory: prev.inventory.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
          ),
        }
      }
      return { ...prev, inventory: [...prev.inventory, item] }
    })
  }, [])

  const removeFromInventory = useCallback((itemId: string) => {
    setGameState((prev) => {
      if (!prev) return null
      const existing = prev.inventory.find((i) => i.id === itemId)
      if (!existing) return prev
      if (existing.quantity <= 1) {
        return { ...prev, inventory: prev.inventory.filter((i) => i.id !== itemId) }
      }
      return {
        ...prev,
        inventory: prev.inventory.map((i) =>
          i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i
        ),
      }
    })
  }, [])

  const addJournalEntry = useCallback((entry: JournalEntry) => {
    setGameState((prev) => {
      if (!prev) return null
      return { ...prev, journalEntries: [...prev.journalEntries, entry] }
    })
  }, [])

  const sendGift = useCallback(async (recipientId: string, type: "item" | "gold", itemId?: string, amount?: number): Promise<boolean> => {
    try {
      if (!userId) return false
      const res = await fetch("/api/gifts/send", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": userId },
        body: JSON.stringify({ recipientId, type, itemId, amount }),
      })
      if (!res.ok) return false

      // Update local state to reflect the deduction
      setGameState((prev) => {
        if (!prev) return null
        if (type === "gold" && amount) {
          return { ...prev, gold: prev.gold - amount }
        }
        if (type === "item" && itemId) {
          const existing = prev.inventory.find(i => i.id === itemId)
          if (!existing) return prev
          if (existing.quantity <= 1) {
            return { ...prev, inventory: prev.inventory.filter(i => i.id !== itemId) }
          }
          return {
            ...prev,
            inventory: prev.inventory.map(i =>
              i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i
            ),
          }
        }
        return prev
      })
      return true
    } catch {
      return false
    }
  }, [])

  const claimGift = useCallback(async (giftId: string): Promise<boolean> => {
    try {
      if (!userId) return false
      const res = await fetch("/api/gifts/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": userId },
        body: JSON.stringify({ giftId }),
      })
      if (!res.ok) return false

      const { gift } = await res.json()

      // Update local state to reflect the addition
      setGameState((prev) => {
        if (!prev) return null
        if (gift.type === "gold" && gift.amount) {
          return { ...prev, gold: prev.gold + gift.amount }
        }
        if (gift.type === "item" && gift.itemId) {
          const existing = prev.inventory.find(i => i.id === gift.itemId)
          if (existing) {
            return {
              ...prev,
              inventory: prev.inventory.map(i =>
                i.id === gift.itemId ? { ...i, quantity: i.quantity + 1 } : i
              ),
            }
          }
          return {
            ...prev,
            inventory: [
              ...prev.inventory,
              { id: gift.itemId, name: { es: gift.itemName || gift.itemId }, category: "gift" as const, quantity: 1 },
            ],
          }
        }
        return prev
      })
      return true
    } catch {
      return false
    }
  }, [])

  const shopItems = SHOP_ITEMS.map((item) => ({
    ...item,
    unlocked: gameState?.ownedItems.includes(item.id) || item.price === 0,
  }))

  return (
    <GameContext.Provider
      value={{
        gameState,
        isGameStarted: gameState !== null,
        startGame,
        loadSavedGame,
        hasSavedGame,
        setUserId,
        movePlayer,
        changeArea,
        addVocabulary,
        updateQuest,
        completeQuest,
        addMessage,
        incrementStats,
        updatePlayerLevel,
        activeNpcId,
        setActiveNpcId,
        shopItems,
        buyItem,
        equipItem,
        canAfford,
        isShopOpen,
        setIsShopOpen,
        updateFriendship,
        addToInventory,
        removeFromInventory,
        addJournalEntry,
        sendGift,
        claimGift,
      }}
    >
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error("useGame must be used within a GameProvider")
  }
  return context
}
