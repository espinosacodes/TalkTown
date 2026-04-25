import { dynamodb, TABLES } from "@/lib/dynamodb"
import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb"

export async function POST(req: Request) {
  const sessionId = req.headers.get("x-user-id")
  if (!sessionId) {
    return Response.json({ error: "Missing user ID" }, { status: 400 })
  }

  try {
    const { playerName } = await req.json()

    const existing = await dynamodb.send(new GetCommand({
      TableName: TABLES.sessions,
      Key: { sessionId },
    }))

    if (existing.Item) {
      return Response.json({ success: true })
    }

    const now = new Date().toISOString()
    await dynamodb.send(new PutCommand({
      TableName: TABLES.sessions,
      Item: {
        sessionId,
        playerName,
        playerLevel: "beginner",
        createdAt: now,
        updatedAt: now,
      },
    }))

    return Response.json({ success: true })
  } catch (error) {
    console.error("Register error:", error)
    return Response.json({ error: "Failed to register" }, { status: 500 })
  }
}
