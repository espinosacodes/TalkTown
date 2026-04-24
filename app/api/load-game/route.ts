import { dynamodb, TABLES } from "@/lib/dynamodb"
import { GetCommand, QueryCommand } from "@aws-sdk/lib-dynamodb"
import { auth0 } from "@/lib/auth0"

export async function POST() {
  const session = await auth0.getSession()
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }
  const sessionId = session.user.sub

  try {
    // Load session
    const sessionResult = await dynamodb.send(new GetCommand({
      TableName: TABLES.sessions,
      Key: { sessionId },
    }))

    if (!sessionResult.Item) {
      return Response.json({ error: "Session not found" }, { status: 404 })
    }

    const saved = sessionResult.Item

    // Load vocabulary
    const vocabResult = await dynamodb.send(new QueryCommand({
      TableName: TABLES.vocabulary,
      KeyConditionExpression: "sessionId = :sid",
      ExpressionAttributeValues: { ":sid": sessionId },
    }))

    const vocabularyLearned = (vocabResult.Items || []).map((v) => ({
      word: v.word,
      reading: v.reading || "",
      translation: v.translation,
      timesUsed: v.timesUsed,
      mastery: v.mastery,
      category: v.category,
    }))

    const gameState = {
      sessionId: saved.sessionId,
      language: saved.language,
      playerLevel: saved.playerLevel,
      playerName: saved.playerName,
      currentArea: saved.currentArea,
      playerPosition: saved.playerPosition,
      questsCompleted: saved.questsCompleted || [],
      currentQuest: saved.currentQuest || null,
      vocabularyLearned,
      grammarPatternsUsed: saved.grammarPatternsUsed || [],
      conversationHistory: {},
      totalWordsSpoken: saved.totalWordsSpoken || 0,
      correctUsages: saved.correctUsages || 0,
      mistakesCorrected: saved.mistakesCorrected || 0,
      ownedItems: saved.ownedItems || ["hat_none"],
      currentOutfit: saved.currentOutfit || "default",
      currentHat: saved.currentHat || "hat_none",
      gold: saved.gold || 0,
      friendships: saved.friendships || [],
      inventory: saved.inventory || [],
      craftedItems: saved.craftedItems || [],
      miniGameHighScores: saved.miniGameHighScores || { word_matching: 0, flashcard_review: 0, fishing: 0 },
      journalEntries: saved.journalEntries || [],
    }

    return Response.json({ gameState })
  } catch (error) {
    console.error("Load game error:", error)
    return Response.json({ error: "Failed to load game" }, { status: 500 })
  }
}
