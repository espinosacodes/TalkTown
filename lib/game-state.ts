export type Language = "es"
export type LearningDirection = "en-to-es" | "es-to-en"
export type PlayerLevel = "beginner" | "elementary" | "intermediate"
export type AreaId = "inn" | "fish_market" | "fruit_stand" | "bakery" | "town_hall" | "garden" | "town_square" | "shop" | "forest" | "beach" | "shrine" | "school" | "hot_spring" | "farm"
export type AnimalType = "cat" | "bear" | "fox" | "owl" | "lion" | "rabbit" | "turtle" | "tanuki"
  | "deer" | "wolf" | "frog" | "otter" | "crane" | "dog" | "monkey" | "horse" | "pig" | "penguin" | "mouse"
export type MiniGameType = "word_matching" | "flashcard_review" | "fishing"

export interface FriendshipLevel {
  npcId: string
  points: number
  level: number
  giftsGiven: number
}

export interface InventoryItem {
  id: string
  name: Record<Language, string>
  category: "food" | "gift" | "decoration" | "tool"
  quantity: number
}

export interface CraftRecipe {
  id: string
  name: Record<Language, string>
  requiredWords: string[]
  resultItemId: string
}

export interface JournalEntry {
  id: string
  date: number
  wordsLearned: string[]
  npcsVisited: string[]
}

export interface ConversationSummary {
  sessionNpcId: string   // "{userId}#{npcId}"
  timestamp: number
  summary: string        // 1-3 sentence AI summary
  topicsDiscussed: string[]
  wordsLearned: string[]
}

export interface Position {
  x: number
  y: number
}

export interface VocabularyWord {
  word: string
  reading: string
  translation: string
  timesUsed: number
  mastery: number
  category: string
}

export interface QuestObjective {
  id: string
  description: string
  completed: boolean
}

export interface Quest {
  id: string
  title: string
  description: string
  objectives: QuestObjective[]
  npcId: string
  completed: boolean
}

export interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: number
}

// Shop Items
export interface ShopItem {
  id: string
  type: "outfit" | "hat" | "accessory"
  name: Record<Language, string>
  description: Record<Language, string>
  price: number // Price in "words learned"
  color: string
  unlocked: boolean
}

export const SHOP_ITEMS: ShopItem[] = [
  // Outfits
  {
    id: "outfit_warrior",
    type: "outfit",
    name: { es: "Traje de Guerrero" },
    description: { es: "Un traje rojo de batalla" },
    price: 5,
    color: "#DC2626",
    unlocked: false,
  },
  {
    id: "outfit_wizard",
    type: "outfit",
    name: { es: "Tunica de Mago" },
    description: { es: "Una tunica azul mistica" },
    price: 10,
    color: "#2563EB",
    unlocked: false,
  },
  {
    id: "outfit_knight",
    type: "outfit",
    name: { es: "Armadura de Caballero" },
    description: { es: "Armadura plateada brillante" },
    price: 15,
    color: "#9CA3AF",
    unlocked: false,
  },
  {
    id: "outfit_royal",
    type: "outfit",
    name: { es: "Vestido Real" },
    description: { es: "Elegante vestido purpura" },
    price: 20,
    color: "#7C3AED",
    unlocked: false,
  },
  // Hats
  {
    id: "hat_none",
    type: "hat",
    name: { es: "Sin Sombrero" },
    description: { es: "Tu cabello natural" },
    price: 0,
    color: "transparent",
    unlocked: true,
  },
  {
    id: "hat_bandana",
    type: "hat",
    name: { es: "Bandana" },
    description: { es: "Una bandana roja clasica" },
    price: 3,
    color: "#EF4444",
    unlocked: false,
  },
  {
    id: "hat_wizard",
    type: "hat",
    name: { es: "Sombrero de Mago" },
    description: { es: "Un sombrero puntiagudo" },
    price: 8,
    color: "#1E40AF",
    unlocked: false,
  },
  {
    id: "hat_crown",
    type: "hat",
    name: { es: "Corona Dorada" },
    description: { es: "Para la realeza" },
    price: 25,
    color: "#F59E0B",
    unlocked: false,
  },
  {
    id: "hat_cat_ears",
    type: "hat",
    name: { es: "Orejas de Gato" },
    description: { es: "Que lindo!" },
    price: 12,
    color: "#FCD34D",
    unlocked: false,
  },
  {
    id: "hat_flower",
    type: "hat",
    name: { es: "Corona de Flores" },
    description: { es: "Flores frescas del jardin" },
    price: 6,
    color: "#F472B6",
    unlocked: false,
  },
]

export interface GameState {
  sessionId: string
  language: LearningDirection
  playerLevel: PlayerLevel
  playerName: string

  // Position
  currentArea: AreaId
  playerPosition: Position

  // Progress
  questsCompleted: string[]
  currentQuest: Quest | null

  // Language learning
  vocabularyLearned: VocabularyWord[]
  grammarPatternsUsed: string[]
  conversationHistory: Record<string, Message[]>

  // Stats
  totalWordsSpoken: number
  correctUsages: number
  mistakesCorrected: number

  // Customization
  ownedItems: string[]
  currentOutfit: string
  currentHat: string
  gold: number // Currency earned through conversations

  // Animal Crossing features
  friendships: FriendshipLevel[]
  inventory: InventoryItem[]
  craftedItems: string[]
  miniGameHighScores: Record<MiniGameType, number>
  journalEntries: JournalEntry[]
}

export interface NPCProfile {
  id: string
  name: Record<Language, string>
  role: Record<Language, string>
  personality: string
  personalityTraits: string[]
  catchphrase: Record<Language, string>
  teachingFocus: string[]
  backstory: Record<Language, string>
  greeting: Record<Language, string>
  location: AreaId
  position: Position
  questId: string | null
  spriteColors: {
    animalType: AnimalType
    fur: string
    furDark: string
    body: string
    accent: string
    belly: string
    nose: string
  }
  giftPreferences?: {
    loved: string[]
    liked: string[]
    disliked: string[]
  }
}

export interface TileData {
  type: "grass" | "path" | "water" | "building" | "decoration" | "door"
  walkable: boolean
  interactable?: boolean
  targetArea?: AreaId
}

export interface AreaData {
  id: AreaId
  name: Record<Language, string>
  tiles: TileData[][]
  width: number
  height: number
  npcs: string[]
  connections: { position: Position; targetArea: AreaId; targetPosition: Position }[]
}

export const QUESTS: Quest[] = [
  {
    id: "arrival",
    title: "Arrival",
    description: "Learn the basics from the Innkeeper",
    objectives: [
      { id: "greet", description: "Greet the Innkeeper", completed: false },
      { id: "introduce", description: "Introduce yourself", completed: false },
      { id: "ask_room", description: "Ask for a room", completed: false },
    ],
    npcId: "innkeeper",
    completed: false,
  },
  {
    id: "shopping",
    title: "Market Shopping",
    description: "Buy ingredients for the town feast",
    objectives: [
      { id: "buy_fish", description: "Buy fish from the Fishmonger", completed: false },
      { id: "buy_fruit", description: "Buy fruit from the Fruit Seller", completed: false },
    ],
    npcId: "innkeeper",
    completed: false,
  },
  {
    id: "delivery",
    title: "The Delivery",
    description: "Help the Baker deliver bread",
    objectives: [
      { id: "talk_baker", description: "Talk to the Baker", completed: false },
      { id: "deliver_bread", description: "Deliver bread to Town Hall", completed: false },
    ],
    npcId: "baker",
    completed: false,
  },
  {
    id: "negotiation",
    title: "The Negotiation",
    description: "Bargain for a fair price",
    objectives: [
      { id: "negotiate", description: "Negotiate with the Fruit Seller", completed: false },
    ],
    npcId: "fruit_seller",
    completed: false,
  },
  {
    id: "speech",
    title: "The Speech",
    description: "Address the town using everything you learned",
    objectives: [
      { id: "meet_mayor", description: "Meet the Mayor", completed: false },
      { id: "give_speech", description: "Give your speech", completed: false },
    ],
    npcId: "mayor",
    completed: false,
  },
]

export function createInitialGameState(language: LearningDirection, playerName: string, userId: string): GameState {
  return {
    sessionId: userId,
    language,
    playerLevel: "beginner",
    playerName,
    currentArea: "town_square",
    playerPosition: { x: 6, y: 6 },
    questsCompleted: [],
    currentQuest: { ...QUESTS[0] },
    vocabularyLearned: [],
    grammarPatternsUsed: [],
    conversationHistory: {},
    totalWordsSpoken: 0,
    correctUsages: 0,
    mistakesCorrected: 0,
    ownedItems: ["hat_none"],
    currentOutfit: "default",
    currentHat: "hat_none",
    gold: 0,
    friendships: [],
    inventory: [],
    craftedItems: [],
    miniGameHighScores: { word_matching: 0, flashcard_review: 0, fishing: 0 },
    journalEntries: [],
  }
}
