import { DynamoDBClient, CreateTableCommand, DescribeTableCommand } from "@aws-sdk/client-dynamodb"

const client = new DynamoDBClient({
  region: process.env.AWS_DEFAULT_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const tables = [
  {
    TableName: "language-quest-sessions",
    KeySchema: [{ AttributeName: "sessionId", KeyType: "HASH" as const }],
    AttributeDefinitions: [{ AttributeName: "sessionId", AttributeType: "S" as const }],
    BillingMode: "PAY_PER_REQUEST" as const,
  },
  {
    TableName: "language-quest-vocabulary",
    KeySchema: [
      { AttributeName: "sessionId", KeyType: "HASH" as const },
      { AttributeName: "word", KeyType: "RANGE" as const },
    ],
    AttributeDefinitions: [
      { AttributeName: "sessionId", AttributeType: "S" as const },
      { AttributeName: "word", AttributeType: "S" as const },
    ],
    BillingMode: "PAY_PER_REQUEST" as const,
  },
  {
    TableName: "language-quest-conversations",
    KeySchema: [
      { AttributeName: "sessionNpcId", KeyType: "HASH" as const },
      { AttributeName: "timestamp", KeyType: "RANGE" as const },
    ],
    AttributeDefinitions: [
      { AttributeName: "sessionNpcId", AttributeType: "S" as const },
      { AttributeName: "timestamp", AttributeType: "N" as const },
    ],
    BillingMode: "PAY_PER_REQUEST" as const,
  },
  {
    TableName: "language-quest-gifts",
    KeySchema: [
      { AttributeName: "recipientId", KeyType: "HASH" as const },
      { AttributeName: "giftId", KeyType: "RANGE" as const },
    ],
    AttributeDefinitions: [
      { AttributeName: "recipientId", AttributeType: "S" as const },
      { AttributeName: "giftId", AttributeType: "S" as const },
    ],
    BillingMode: "PAY_PER_REQUEST" as const,
  },
]

export async function POST() {
  const results: { table: string; status: string }[] = []

  for (const table of tables) {
    try {
      await client.send(new DescribeTableCommand({ TableName: table.TableName }))
      results.push({ table: table.TableName, status: "already exists" })
    } catch {
      try {
        await client.send(new CreateTableCommand(table))
        results.push({ table: table.TableName, status: "created" })
      } catch (err) {
        results.push({ table: table.TableName, status: `error: ${err}` })
      }
    }
  }

  return Response.json({ results })
}
