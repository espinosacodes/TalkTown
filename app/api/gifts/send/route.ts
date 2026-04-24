import { dynamodb, TABLES } from "@/lib/dynamodb"
import { GetCommand, PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb"
import { auth0 } from "@/lib/auth0"

export async function POST(req: Request) {
  const session = await auth0.getSession()
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }
  const senderId = session.user.sub

  try {
    const { recipientId, type, itemId, amount } = await req.json()

    if (!recipientId || !type) {
      return Response.json({ error: "Missing recipientId or type" }, { status: 400 })
    }
    if (recipientId === senderId) {
      return Response.json({ error: "Cannot send gifts to yourself" }, { status: 400 })
    }
    if (type !== "item" && type !== "gold") {
      return Response.json({ error: "Invalid gift type" }, { status: 400 })
    }

    // Get sender's session to validate they have the item/gold
    const senderResult = await dynamodb.send(new GetCommand({
      TableName: TABLES.sessions,
      Key: { sessionId: senderId },
    }))

    if (!senderResult.Item) {
      return Response.json({ error: "Sender session not found" }, { status: 404 })
    }

    const senderData = senderResult.Item
    let itemName = ""

    if (type === "gold") {
      const goldAmount = Number(amount) || 0
      if (goldAmount <= 0) {
        return Response.json({ error: "Invalid gold amount" }, { status: 400 })
      }
      if ((senderData.gold || 0) < goldAmount) {
        return Response.json({ error: "Not enough gold" }, { status: 400 })
      }

      // Deduct gold from sender
      await dynamodb.send(new UpdateCommand({
        TableName: TABLES.sessions,
        Key: { sessionId: senderId },
        UpdateExpression: "SET gold = gold - :amount",
        ExpressionAttributeValues: { ":amount": goldAmount },
      }))
      itemName = `${goldAmount} gold`
    } else {
      // type === "item"
      if (!itemId) {
        return Response.json({ error: "Missing itemId for item gift" }, { status: 400 })
      }
      const inventory = senderData.inventory || []
      const itemIndex = inventory.findIndex((i: { id: string }) => i.id === itemId)
      if (itemIndex === -1) {
        return Response.json({ error: "Item not in inventory" }, { status: 400 })
      }

      const item = inventory[itemIndex]
      itemName = item.name?.es || item.id

      // Remove one from inventory
      const updatedInventory = [...inventory]
      if (item.quantity <= 1) {
        updatedInventory.splice(itemIndex, 1)
      } else {
        updatedInventory[itemIndex] = { ...item, quantity: item.quantity - 1 }
      }

      await dynamodb.send(new UpdateCommand({
        TableName: TABLES.sessions,
        Key: { sessionId: senderId },
        UpdateExpression: "SET inventory = :inv",
        ExpressionAttributeValues: { ":inv": updatedInventory },
      }))
    }

    // Write gift record
    const giftId = `${Date.now()}_${senderId.slice(-6)}`
    await dynamodb.send(new PutCommand({
      TableName: TABLES.gifts,
      Item: {
        recipientId,
        giftId,
        senderId,
        senderName: senderData.playerName || "Adventurer",
        type,
        itemId: type === "item" ? itemId : undefined,
        itemName,
        amount: type === "gold" ? Number(amount) : undefined,
        createdAt: Date.now(),
        claimed: false,
      },
    }))

    return Response.json({ success: true, giftId })
  } catch (error) {
    console.error("Send gift error:", error)
    return Response.json({ error: "Failed to send gift" }, { status: 500 })
  }
}
