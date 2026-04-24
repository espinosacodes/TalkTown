import { dynamodb, TABLES } from "@/lib/dynamodb"
import { GetCommand, QueryCommand } from "@aws-sdk/lib-dynamodb"

export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json()

    // Load session
    const sessionResult = await dynamodb.send(new GetCommand({
      TableName: TABLES.sessions,
      Key: { sessionId },
    }))

    if (!sessionResult.Item) {
      return Response.json({ error: "Session not found" }, { status: 404 })
    }

    const session = sessionResult.Item

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
      sessionId: session.sessionId,
      language: session.language,
      playerLevel: session.playerLevel,
      playerName: session.playerName,
      currentArea: session.currentArea,
      playerPosition: session.playerPosition,
      questsCompleted: session.questsCompleted || [],
      currentQuest: session.currentQuest || null,
      vocabularyLearned,
      grammarPatternsUsed: session.grammarPatternsUsed || [],
      conversationHistory: {},
      totalWordsSpoken: session.totalWordsSpoken || 0,
      correctUsages: session.correctUsages || 0,
      mistakesCorrected: session.mistakesCorrected || 0,
      ownedItems: session.ownedItems || ["hat_none"],
      currentOutfit: session.currentOutfit || "default",
      currentHat: session.currentHat || "hat_none",
      gold: session.gold || 0,
    }

    return Response.json({ gameState })
  } catch (error) {
    console.error("Load game error:", error)
    return Response.json({ error: "Failed to load game" }, { status: 500 })
  }
}
