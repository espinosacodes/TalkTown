import { dynamodb, TABLES } from "@/lib/dynamodb"
import { GetCommand } from "@aws-sdk/lib-dynamodb"
import { auth0 } from "@/lib/auth0"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth0.getSession()
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  try {
    const result = await dynamodb.send(new GetCommand({
      TableName: TABLES.sessions,
      Key: { sessionId: id },
    }))

    if (!result.Item) {
      return Response.json({ error: "Player not found" }, { status: 404 })
    }

    const item = result.Item
    const player = {
      sessionId: item.sessionId,
      playerName: item.playerName || "Adventurer",
      playerLevel: item.playerLevel || "beginner",
      vocabularyCount: item.vocabularyCount || 0,
      questsCompleted: item.questsCompleted?.length || 0,
      currentOutfit: item.currentOutfit || "default",
      currentHat: item.currentHat || "hat_none",
      gold: item.gold || 0,
      updatedAt: item.updatedAt || 0,
    }

    return Response.json({ player })
  } catch (error) {
    console.error("Fetch player error:", error)
    return Response.json({ error: "Failed to fetch player" }, { status: 500 })
  }
}
