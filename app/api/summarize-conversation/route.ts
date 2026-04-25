import { start } from "workflow/api"
import { summarizeConversation } from "@/app/workflows/summarize-conversation"

export async function POST(req: Request) {
  const userId = req.headers.get("x-user-id")
  if (!userId) {
    return Response.json({ error: "Missing user ID" }, { status: 400 })
  }

  try {
    const { npcId, messages, wordsLearned } = await req.json() as {
      npcId: string
      messages: { role: string; content: string }[]
      wordsLearned: string[]
    }

    if (!messages || messages.length < 2) {
      return Response.json({ success: true, skipped: true })
    }

    await start(summarizeConversation, [{ userId, npcId, messages, wordsLearned }])

    return Response.json({ success: true })
  } catch (error) {
    console.error("Summarize conversation error:", error)
    return Response.json({ error: "Failed to summarize" }, { status: 500 })
  }
}
