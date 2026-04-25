import { dynamodb, TABLES } from "@/lib/dynamodb"
import { GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb"

export async function POST(req: Request) {
  const userId = req.headers.get("x-user-id")
  if (!userId) {
    return Response.json({ error: "Missing user ID" }, { status: 400 })
  }

  try {
    const { giftId } = await req.json()
    if (!giftId) {
      return Response.json({ error: "Missing giftId" }, { status: 400 })
    }

    // Get the gift
    const giftResult = await dynamodb.send(new GetCommand({
      TableName: TABLES.gifts,
      Key: { recipientId: userId, giftId },
    }))

    if (!giftResult.Item) {
      return Response.json({ error: "Gift not found" }, { status: 404 })
    }

    const gift = giftResult.Item
    if (gift.claimed) {
      return Response.json({ error: "Gift already claimed" }, { status: 400 })
    }

    // Mark gift as claimed
    await dynamodb.send(new UpdateCommand({
      TableName: TABLES.gifts,
      Key: { recipientId: userId, giftId },
      UpdateExpression: "SET claimed = :true",
      ExpressionAttributeValues: { ":true": true },
    }))

    // Add item/gold to recipient's session
    if (gift.type === "gold") {
      await dynamodb.send(new UpdateCommand({
        TableName: TABLES.sessions,
        Key: { sessionId: userId },
        UpdateExpression: "SET gold = gold + :amount",
        ExpressionAttributeValues: { ":amount": gift.amount },
      }))
    } else {
      // type === "item" — add to inventory
      const recipientResult = await dynamodb.send(new GetCommand({
        TableName: TABLES.sessions,
        Key: { sessionId: userId },
      }))

      if (recipientResult.Item) {
        const inventory = recipientResult.Item.inventory || []
        const existingIndex = inventory.findIndex((i: { id: string }) => i.id === gift.itemId)

        let updatedInventory
        if (existingIndex >= 0) {
          updatedInventory = [...inventory]
          updatedInventory[existingIndex] = {
            ...updatedInventory[existingIndex],
            quantity: updatedInventory[existingIndex].quantity + 1,
          }
        } else {
          updatedInventory = [
            ...inventory,
            {
              id: gift.itemId,
              name: { es: gift.itemName || gift.itemId },
              category: "gift",
              quantity: 1,
            },
          ]
        }

        await dynamodb.send(new UpdateCommand({
          TableName: TABLES.sessions,
          Key: { sessionId: userId },
          UpdateExpression: "SET inventory = :inv",
          ExpressionAttributeValues: { ":inv": updatedInventory },
        }))
      }
    }

    return Response.json({
      success: true,
      gift: { ...gift, claimed: true },
    })
  } catch (error) {
    console.error("Claim gift error:", error)
    return Response.json({ error: "Failed to claim gift" }, { status: 500 })
  }
}
