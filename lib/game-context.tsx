"use client"

import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from "react"
import type { GameState, Language, AreaId, Quest, VocabularyWord, Message, ShopItem } from "./game-state"
import { createInitialGameState, QUESTS, SHOP_ITEMS } from "./game-state"
import { checkForExit, isTileWalkable } from "./tile-map"

interface GameContextType {
  gameState: GameState | null
  isGameStarted: boolean
  startGame: (language: Language, playerName: string) => void
  loadSavedGame: (sessionId: string) => Promise<boolean>
  hasSavedGame: boolean
  savedSessionId: string | null
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
}

const GameContext = createContext<GameContextType | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [activeNpcId, setActiveNpcId] = useState<string | null>(null)
  const [isShopOpen, setIsShopOpen] = useState(false)
  const [hasSavedGame, setHasSavedGame] = useState(false)
  const [savedSessionId, setSavedSessionId] = useState<string | null>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Check for saved session on mount
  useEffect(() => {
    const sid = localStorage.getItem("language-quest-session-id")
    if (sid) {
      setHasSavedGame(true)
      setSavedSessionId(sid)
    }
  }, [])

  // Debounced auto-save
  const saveGame = useCallback(async (state: GameState) => {
    try {
      await fetch("/api/save-game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameState: state }),
      })
    } catch (err) {
      console.error("Auto-save failed:", err)
    }
  }, [])

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

  const startGame = useCallback((language: Language, playerName: string) => {
    const state = createInitialGameState(language, playerName)
    setGameState(state)
    localStorage.setItem("language-quest-session-id", state.sessionId)
    setHasSavedGame(true)
    setSavedSessionId(state.sessionId)
  }, [])

  const loadSavedGame = useCallback(async (sessionId: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/load-game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
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
        savedSessionId,
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
