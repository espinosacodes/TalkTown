import { dynamodb, TABLES } from "@/lib/dynamodb"
import { ScanCommand } from "@aws-sdk/lib-dynamodb"
import { auth0 } from "@/lib/auth0"

export async function GET() {
  const session = await auth0.getSession()
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const result = await dynamodb.send(new ScanCommand({
      TableName: TABLES.sessions,
      ProjectionExpression: "sessionId, playerName, playerLevel, vocabularyCount, questsCompleted, currentOutfit, currentHat, gold, updatedAt",
    }))

    const players = (result.Items || [])
      .map(item => ({
        sessionId: item.sessionId,
        playerName: item.playerName || "Adventurer",
        playerLevel: item.playerLevel || "beginner",
        vocabularyCount: item.vocabularyCount || 0,
        questsCompleted: item.questsCompleted?.length || 0,
        currentOutfit: item.currentOutfit || "default",
        currentHat: item.currentHat || "hat_none",
        gold: item.gold || 0,
        updatedAt: item.updatedAt || 0,
      }))
      .sort((a, b) => b.vocabularyCount - a.vocabularyCount)

    return Response.json({ players })
  } catch (error) {
    console.error("Fetch players error:", error)
    return Response.json({ error: "Failed to fetch players" }, { status: 500 })
  }
}
