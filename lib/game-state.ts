export type Language = "es" | "ja"
export type PlayerLevel = "beginner" | "elementary" | "intermediate"
export type AreaId = "inn" | "fish_market" | "fruit_stand" | "bakery" | "town_hall" | "garden" | "town_square" | "shop"

export interface Position {
  x: number
  y: number
}

export interface VocabularyWord {
  word: string
  reading: string // hiragana reading for kanji
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
    name: { es: "Traje de Guerrero", ja: "戦士の服" },
    description: { es: "Un traje rojo de batalla", ja: "赤い戦闘服" },
    price: 5,
    color: "#DC2626",
    unlocked: false,
  },
  {
    id: "outfit_wizard",
    type: "outfit",
    name: { es: "Tunica de Mago", ja: "魔法使いのローブ" },
    description: { es: "Una tunica azul mistica", ja: "神秘的な青いローブ" },
    price: 10,
    color: "#2563EB",
    unlocked: false,
  },
  {
    id: "outfit_knight",
    type: "outfit",
    name: { es: "Armadura de Caballero", ja: "騎士の鎧" },
    description: { es: "Armadura plateada brillante", ja: "輝く銀の鎧" },
    price: 15,
    color: "#9CA3AF",
    unlocked: false,
  },
  {
    id: "outfit_royal",
    type: "outfit",
    name: { es: "Vestido Real", ja: "王族の衣装" },
    description: { es: "Elegante vestido purpura", ja: "エレガントな紫の衣装" },
    price: 20,
    color: "#7C3AED",
    unlocked: false,
  },
  // Hats
  {
    id: "hat_none",
    type: "hat",
    name: { es: "Sin Sombrero", ja: "帽子なし" },
    description: { es: "Tu cabello natural", ja: "自然な髪" },
    price: 0,
    color: "transparent",
    unlocked: true,
  },
  {
    id: "hat_bandana",
    type: "hat",
    name: { es: "Bandana", ja: "バンダナ" },
    description: { es: "Una bandana roja clasica", ja: "クラシックな赤いバンダナ" },
    price: 3,
    color: "#EF4444",
    unlocked: false,
  },
  {
    id: "hat_wizard",
    type: "hat",
    name: { es: "Sombrero de Mago", ja: "魔法使いの帽子" },
    description: { es: "Un sombrero puntiagudo", ja: "とがった帽子" },
    price: 8,
    color: "#1E40AF",
    unlocked: false,
  },
  {
    id: "hat_crown",
    type: "hat",
    name: { es: "Corona Dorada", ja: "黄金の王冠" },
    description: { es: "Para la realeza", ja: "王族のための" },
    price: 25,
    color: "#F59E0B",
    unlocked: false,
  },
  {
    id: "hat_cat_ears",
    type: "hat",
    name: { es: "Orejas de Gato", ja: "猫耳" },
    description: { es: "Kawaii!", ja: "かわいい!" },
    price: 12,
    color: "#FCD34D",
    unlocked: false,
  },
  {
    id: "hat_flower",
    type: "hat",
    name: { es: "Corona de Flores", ja: "花の冠" },
    description: { es: "Flores frescas del jardin", ja: "庭からの新鮮な花" },
    price: 6,
    color: "#F472B6",
    unlocked: false,
  },
]

export interface GameState {
  sessionId: string
  language: Language
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
    hair: string
    body: string
    accent: string
    skin: string
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

export function createInitialGameState(language: Language, playerName: string): GameState {
  return {
    sessionId: crypto.randomUUID(),
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
  }
}
