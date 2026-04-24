import { dynamodb, TABLES } from "@/lib/dynamodb"
import { QueryCommand } from "@aws-sdk/lib-dynamodb"
import { auth0 } from "@/lib/auth0"

export async function GET() {
  const session = await auth0.getSession()
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }
  const userId = session.user.sub

  try {
    const result = await dynamodb.send(new QueryCommand({
      TableName: TABLES.gifts,
      KeyConditionExpression: "recipientId = :rid",
      FilterExpression: "claimed = :false",
      ExpressionAttributeValues: {
        ":rid": userId,
        ":false": false,
      },
    }))

    return Response.json({ gifts: result.Items || [] })
  } catch (error) {
    console.error("Fetch gifts error:", error)
    return Response.json({ error: "Failed to fetch gifts" }, { status: 500 })
  }
}
