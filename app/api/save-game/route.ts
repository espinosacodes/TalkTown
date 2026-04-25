import { start } from "workflow/api"
import { saveGame } from "@/app/workflows/save-game"

export async function POST(req: Request) {
  const sessionId = req.headers.get("x-user-id")
  if (!sessionId) {
    return Response.json({ error: "Missing user ID" }, { status: 400 })
  }

  try {
    const { gameState } = await req.json()

    await start(saveGame, [{ sessionId, gameState }])

    return Response.json({ success: true })
  } catch (error) {
    console.error("Save game error:", error)
    return Response.json({ error: "Failed to save game" }, { status: 500 })
  }
}
