import { dynamodb, TABLES } from "@/lib/dynamodb"
import { PutCommand } from "@aws-sdk/lib-dynamodb"
import { auth0 } from "@/lib/auth0"
import { groq } from "@ai-sdk/groq"
import { generateText } from "ai"
import { getNPCProfile } from "@/lib/npc-profiles"

export async function POST(req: Request) {
  const session = await auth0.getSession()
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }
  const userId = session.user.sub

  try {
    const { npcId, messages, wordsLearned } = await req.json() as {
      npcId: string
      messages: { role: string; content: string }[]
      wordsLearned: string[]
    }

    if (!messages || messages.length < 2) {
      return Response.json({ success: true, skipped: true })
    }

    const npc = getNPCProfile(npcId)
    const npcName = npc?.name.es || npcId

    const conversationText = messages
      .map((m) => `${m.role === "user" ? "Player" : npcName}: ${m.content}`)
      .join("\n")

    const { text: summary } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      prompt: `Summarize this conversation between a player and "${npcName}" in 1-3 sentences.
Focus on: topics discussed, personal details shared, gifts given, key events.
Keep under 80 words. Write in third person.

Conversation:
${conversationText}`,
    })

    // Extract topics from the summary
    const topicsDiscussed = extractTopics(summary)

    await dynamodb.send(new PutCommand({
      TableName: TABLES.conversations,
      Item: {
        sessionNpcId: `${userId}#${npcId}`,
        timestamp: Date.now(),
        summary: summary.trim(),
        topicsDiscussed,
        wordsLearned: wordsLearned || [],
      },
    }))

    return Response.json({ success: true })
  } catch (error) {
    console.error("Summarize conversation error:", error)
    return Response.json({ error: "Failed to summarize" }, { status: 500 })
  }
}

function extractTopics(summary: string): string[] {
  const topicKeywords = [
    "greetings", "food", "fishing", "family", "weather", "animals",
    "philosophy", "nature", "music", "poetry", "school", "work",
    "travel", "gifts", "secrets", "riddles", "stories", "cooking",
    "shopping", "directions", "health", "sports", "farm", "sea",
  ]
  return topicKeywords.filter((t) => summary.toLowerCase().includes(t))
}
