import { dynamodb, TABLES } from "@/lib/dynamodb"
import { PutCommand, BatchWriteCommand } from "@aws-sdk/lib-dynamodb"
import { auth0 } from "@/lib/auth0"

export async function POST(req: Request) {
  const session = await auth0.getSession()
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }
  const sessionId = session.user.sub

  try {
    const { gameState } = await req.json()

    // Save session data
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

    // Save vocabulary in batches of 25
    if (gameState.vocabularyLearned?.length > 0) {
      const vocabItems = gameState.vocabularyLearned.map((v: { word: string; reading?: string; translation: string; timesUsed: number; mastery: number; category: string }) => ({
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
