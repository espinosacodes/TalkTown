import { start } from "workflow/api"
import { createUIMessageStreamResponse, type UIMessage, type UIMessageChunk } from "ai"
import { npcChat } from "@/app/workflows/npc-chat"
import type { GameState, ConversationSummary } from "@/lib/game-state"

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { messages, npcId, gameState, memories, gossip } = await req.json() as {
      messages: UIMessage[]
      npcId: string
      gameState: GameState
      memories?: ConversationSummary[]
      gossip?: { npcName: string; relationship: string; summary: string }[]
    }

    const run = await start(npcChat, [{ messages, npcId, gameState, memories, gossip }])

    return createUIMessageStreamResponse({
      stream: run.getReadable<UIMessageChunk>(),
    })
  } catch (error) {
    console.error("Chat API error:", error)
    return new Response(
      JSON.stringify({ error: "Failed to generate response" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
