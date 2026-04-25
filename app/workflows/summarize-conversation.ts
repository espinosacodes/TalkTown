import { generateTextWithFallback } from "@/lib/ai-provider"
import { dynamodb, TABLES } from "@/lib/dynamodb"
import { PutCommand } from "@aws-sdk/lib-dynamodb"
import { getNPCProfile } from "@/lib/npc-profiles"

interface SummarizeInput {
  userId: string
  npcId: string
  messages: { role: string; content: string }[]
  wordsLearned: string[]
}

async function generateSummary(npcName: string, conversationText: string): Promise<string> {
  "use step"
  const { text } = await generateTextWithFallback({
    prompt: `Summarize this conversation between a player and "${npcName}" in 1-3 sentences.
Focus on: topics discussed, personal details shared, gifts given, key events.
Keep under 80 words. Write in third person.

Conversation:
${conversationText}`,
  })
  return text.trim()
}

async function saveSummaryToDynamo(input: {
  userId: string
  npcId: string
  summary: string
  topicsDiscussed: string[]
  wordsLearned: string[]
}) {
  "use step"
  await dynamodb.send(new PutCommand({
    TableName: TABLES.conversations,
    Item: {
      sessionNpcId: `${input.userId}#${input.npcId}`,
      timestamp: Date.now(),
      summary: input.summary,
      topicsDiscussed: input.topicsDiscussed,
      wordsLearned: input.wordsLearned,
    },
  }))
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

export async function summarizeConversation(input: SummarizeInput) {
  "use workflow"

  const { userId, npcId, messages, wordsLearned } = input

  const npc = getNPCProfile(npcId)
  const npcName = npc?.name.es || npcId

  const conversationText = messages
    .map((m) => `${m.role === "user" ? "Player" : npcName}: ${m.content}`)
    .join("\n")

  const summary = await generateSummary(npcName, conversationText)

  const topicsDiscussed = extractTopics(summary)

  await saveSummaryToDynamo({
    userId,
    npcId,
    summary,
    topicsDiscussed,
    wordsLearned: wordsLearned || [],
  })

  return { success: true, summary }
}
