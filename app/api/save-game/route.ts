import { start } from "workflow/api"
import { auth0 } from "@/lib/auth0"
import { saveGame } from "@/app/workflows/save-game"

export async function POST(req: Request) {
  const session = await auth0.getSession()
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }
  const sessionId = session.user.sub

  try {
    const { gameState } = await req.json()

    await start(saveGame, [{ sessionId, gameState }])

    return Response.json({ success: true })
  } catch (error) {
    console.error("Save game error:", error)
    return Response.json({ error: "Failed to save game" }, { status: 500 })
  }
}
