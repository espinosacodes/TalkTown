import { start } from "workflow/api"
import { auth0 } from "@/lib/auth0"
import { summarizeConversation } from "@/app/workflows/summarize-conversation"

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

    await start(summarizeConversation, [{ userId, npcId, messages, wordsLearned }])

    return Response.json({ success: true })
  } catch (error) {
    console.error("Summarize conversation error:", error)
    return Response.json({ error: "Failed to summarize" }, { status: 500 })
  }
}
