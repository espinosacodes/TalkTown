import { dynamodb, TABLES } from "@/lib/dynamodb"
import { PutCommand, BatchWriteCommand } from "@aws-sdk/lib-dynamodb"

interface VocabItem {
  word: string
  reading?: string
  translation: string
  timesUsed: number
  mastery: number
  category: string
}

interface SaveGameInput {
  sessionId: string
  gameState: {
    playerName: string
    playerLevel: string
    language: string
    currentArea: string
    playerPosition: { x: number; y: number }
    questsCompleted: string[]
    currentQuest: unknown
    ownedItems: string[]
    currentOutfit: string
    currentHat: string
    gold: number
    totalWordsSpoken: number
    correctUsages: number
    mistakesCorrected: number
    grammarPatternsUsed: string[]
    friendships: unknown[]
    inventory: unknown[]
    craftedItems: unknown[]
    miniGameHighScores: { word_matching: number; flashcard_review: number; fishing: number }
    journalEntries: unknown[]
    vocabularyLearned: VocabItem[]
  }
}

async function saveSessionData(sessionId: string, gameState: SaveGameInput["gameState"]) {
  "use step"
  await dynamodb.send(new PutCommand({
    TableName: TABLES.sessions,
    Item: {
      sessionId,
      playerName: gameState.playerName,
      playerLevel: gameState.playerLevel,
      language: gameState.language,
      currentArea: gameState.currentArea,
      playerPosition: gameState.playerPosition,
      questsCompleted: gameState.questsCompleted,
      currentQuest: gameState.currentQuest,
      ownedItems: gameState.ownedItems,
      currentOutfit: gameState.currentOutfit,
      currentHat: gameState.currentHat,
      gold: gameState.gold,
      totalWordsSpoken: gameState.totalWordsSpoken,
      correctUsages: gameState.correctUsages,
      mistakesCorrected: gameState.mistakesCorrected,
      grammarPatternsUsed: gameState.grammarPatternsUsed,
      friendships: gameState.friendships || [],
      inventory: gameState.inventory || [],
      craftedItems: gameState.craftedItems || [],
      miniGameHighScores: gameState.miniGameHighScores || { word_matching: 0, flashcard_review: 0, fishing: 0 },
      journalEntries: gameState.journalEntries || [],
      vocabularyCount: gameState.vocabularyLearned?.length || 0,
      updatedAt: Date.now(),
    },
  }))
}

async function saveVocabularyBatch(sessionId: string, batch: VocabItem[]) {
  "use step"
  const items = batch.map((v) => ({
    PutRequest: {
      Item: {
        sessionId,
        word: v.word,
        reading: v.reading || "",
        translation: v.translation,
        timesUsed: v.timesUsed,
        mastery: v.mastery,
        category: v.category,
      },
    },
  }))

  await dynamodb.send(new BatchWriteCommand({
    RequestItems: { [TABLES.vocabulary]: items },
  }))
}

export async function saveGame(input: SaveGameInput) {
  "use workflow"

  const { sessionId, gameState } = input

  await saveSessionData(sessionId, gameState)

  if (gameState.vocabularyLearned?.length > 0) {
    for (let i = 0; i < gameState.vocabularyLearned.length; i += 25) {
      const batch = gameState.vocabularyLearned.slice(i, i + 25)
      await saveVocabularyBatch(sessionId, batch)
    }
  }

  return { success: true }
}
