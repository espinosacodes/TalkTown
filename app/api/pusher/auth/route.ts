import { pusherServer } from "@/lib/pusher-server"
import { dynamodb, TABLES } from "@/lib/dynamodb"
import { GetCommand } from "@aws-sdk/lib-dynamodb"

export async function POST(req: Request) {
  const userId = req.headers.get("x-user-id")
  if (!userId) {
    return Response.json({ error: "Missing user ID" }, { status: 403 })
  }

  const body = await req.text()
  const params = new URLSearchParams(body)
  const socketId = params.get("socket_id")
  const channelName = params.get("channel_name")

  if (!socketId || !channelName) {
    return Response.json({ error: "Missing params" }, { status: 400 })
  }

  // Load player data for presence info
  let presenceData: Record<string, string | number> = { name: userId }
  try {
    const result = await dynamodb.send(new GetCommand({
      TableName: TABLES.sessions,
      Key: { sessionId: userId },
    }))
    if (result.Item) {
      presenceData = {
        name: result.Item.playerName || userId,
        outfit: result.Item.currentOutfit || "default",
        hat: result.Item.currentHat || "hat_none",
        level: result.Item.playerLevel || "beginner",
      }
    }
  } catch {
    // Use defaults if DB fails
  }

  const authResponse = pusherServer.authorizeChannel(socketId, channelName, {
    user_id: userId,
    user_info: presenceData,
  })

  return Response.json(authResponse)
}
