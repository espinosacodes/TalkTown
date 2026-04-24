import { dynamodb, TABLES } from "@/lib/dynamodb"
import { QueryCommand } from "@aws-sdk/lib-dynamodb"
import { auth0 } from "@/lib/auth0"
import { getRelationshipsFor } from "@/lib/npc-relationships"
import { getNPCProfile } from "@/lib/npc-profiles"
import type { ConversationSummary } from "@/lib/game-state"

export async function POST(req: Request) {
  const session = await auth0.getSession()
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }
  const userId = session.user.sub

  try {
    const { npcId } = await req.json() as { npcId: string }

    // Load this NPC's memories of the player (most recent 5)
    const memoriesResult = await dynamodb.send(new QueryCommand({
      TableName: TABLES.conversations,
      KeyConditionExpression: "sessionNpcId = :sid",
      ExpressionAttributeValues: { ":sid": `${userId}#${npcId}` },
      ScanIndexForward: false,
      Limit: 5,
    }))

    const memories: ConversationSummary[] = (memoriesResult.Items || []).map((item) => ({
      sessionNpcId: item.sessionNpcId,
      timestamp: item.timestamp,
      summary: item.summary,
      topicsDiscussed: item.topicsDiscussed || [],
      wordsLearned: item.wordsLearned || [],
    }))

    // Load gossip from related NPCs
    const relationships = getRelationshipsFor(npcId)
    const gossip: { npcName: string; relationship: string; summary: string }[] = []

    // Fetch last summary for each related NPC (in parallel)
    const gossipPromises = relationships.map(async (rel) => {
      try {
        const result = await dynamodb.send(new QueryCommand({
          TableName: TABLES.conversations,
          KeyConditionExpression: "sessionNpcId = :sid",
          ExpressionAttributeValues: { ":sid": `${userId}#${rel.targetNpcId}` },
          ScanIndexForward: false,
          Limit: 1,
        }))

        if (result.Items && result.Items.length > 0) {
          const targetNpc = getNPCProfile(rel.targetNpcId)
          gossip.push({
            npcName: targetNpc?.name.es || rel.targetNpcId,
            relationship: rel.relationship,
            summary: result.Items[0].summary,
          })
        }
      } catch {
        // Skip failed gossip lookups silently
      }
    })

    await Promise.all(gossipPromises)

    return Response.json({ memories, gossip })
  } catch (error) {
    console.error("Load memories error:", error)
    return Response.json({ error: "Failed to load memories" }, { status: 500 })
  }
}
