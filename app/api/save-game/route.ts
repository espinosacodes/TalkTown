import { dynamodb, TABLES } from "@/lib/dynamodb"
import { PutCommand, BatchWriteCommand } from "@aws-sdk/lib-dynamodb"

export async function POST(req: Request) {
  try {
    const { gameState } = await req.json()

    // Save session data
    await dynamodb.send(new PutCommand({
      TableName: TABLES.sessions,
      Item: {
        sessionId: gameState.sessionId,
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
        updatedAt: Date.now(),
      },
    }))

    // Save vocabulary in batches of 25
    if (gameState.vocabularyLearned?.length > 0) {
      const vocabItems = gameState.vocabularyLearned.map((v: { word: string; reading?: string; translation: string; timesUsed: number; mastery: number; category: string }) => ({
        PutRequest: {
          Item: {
            sessionId: gameState.sessionId,
            word: v.word,
            reading: v.reading || "",
            translation: v.translation,
            timesUsed: v.timesUsed,
            mastery: v.mastery,
            category: v.category,
          },
        },
      }))

      for (let i = 0; i < vocabItems.length; i += 25) {
        const batch = vocabItems.slice(i, i + 25)
        await dynamodb.send(new BatchWriteCommand({
          RequestItems: { [TABLES.vocabulary]: batch },
        }))
      }
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error("Save game error:", error)
    return Response.json({ error: "Failed to save game" }, { status: 500 })
  }
}
