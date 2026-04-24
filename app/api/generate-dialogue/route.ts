import { generateText, Output } from "ai"
import { z } from "zod"
import type { NPCProfile } from "@/lib/game-state"

const DialogueLineSchema = z.object({
  targetText: z.string().describe("The dialogue in Japanese"),
  englishText: z.string().describe("English translation of the dialogue"),
  vocabulary: z.array(z.object({
    original: z.string().describe("Word in Japanese"),
    reading: z.string().describe("Hiragana reading of the word"),
    translation: z.string().describe("English translation"),
  })).describe("2-4 vocabulary words from this line to teach"),
})

const DialogueResponseSchema = z.object({
  lines: z.array(DialogueLineSchema).describe("Array of 2-4 dialogue lines"),
})

export async function POST(req: Request) {
  try {
    const { npc, targetLanguage, playerLevel, previousWords } = await req.json() as {
      npc: NPCProfile
      targetLanguage: "es" | "ja"
      playerLevel: string
      previousWords: string[]
    }

    const levelDescriptions: Record<string, string> = {
      beginner: "complete beginner - use only basic greetings and simple words",
      elementary: "elementary - use slightly more complex sentences",
      intermediate: "intermediate - use more natural conversational patterns",
    }
    const levelDesc = levelDescriptions[playerLevel] || levelDescriptions.beginner

    const npcName = npc.name?.ja || npc.name?.es || "NPC"
    const npcRole = npc.role?.ja || npc.role?.es || "Villager"

    const result = await generateText({
      model: "anthropic/claude-sonnet-4-6",
      output: Output.object({ schema: DialogueResponseSchema }),
      prompt: `You are creating dialogue for an NPC in a bilingual (Japanese + English) language learning RPG game (Undertale-style).

NPC Details:
- Name: ${npcName}
- Role: ${npcRole}
- Personality: ${npc.personality}
- Teaching focus: ${npc.teachingFocus?.join(", ")}

Player Level: ${playerLevel} (${levelDesc})
Target Language: Japanese (always bilingual: Japanese first, then English)
Words the player already knows: ${previousWords.slice(-20).join(", ") || "none yet"}

Generate 2-4 lines of dialogue where the NPC:
1. Stays in character with their personality
2. Speaks in Japanese at the appropriate difficulty level
3. Teaches relevant vocabulary related to their teaching focus
4. Is engaging and memorable (like Undertale NPCs)

Each line should:
- Have the Japanese text (targetText)
- Have the English translation (englishText)
- Include 2-4 new vocabulary words with translations and hiragana readings (avoid words the player already knows)

Keep dialogue short and punchy - this is a game, not a textbook. Be creative and fun!
DO NOT use any emojis. Keep text simple and clean.`,
    })

    if (result.output) {
      return Response.json(result.output)
    }

    return Response.json({
      lines: [{
        targetText: "こんにちは、ようこそ。",
        englishText: "Hello, welcome.",
        vocabulary: [
          { original: "こんにちは", reading: "こんにちは", translation: "hello" },
          { original: "ようこそ", reading: "ようこそ", translation: "welcome" },
        ],
      }],
    })
  } catch (error) {
    console.error("[v0] Error generating dialogue:", error)

    return Response.json({
      lines: [{
        targetText: "...",
        englishText: "(The NPC seems distracted...)",
        vocabulary: [],
      }],
    })
  }
}
