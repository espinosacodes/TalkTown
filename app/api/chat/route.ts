import { streamText, convertToModelMessages, tool, UIMessage } from "ai"
import * as z from "zod"
import { getNPCProfile, buildNPCSystemPrompt } from "@/lib/npc-profiles"
import type { GameState } from "@/lib/game-state"

export const maxDuration = 30

export async function POST(req: Request) {
  const { messages, npcId, gameState } = await req.json() as {
    messages: UIMessage[]
    npcId: string
    gameState: GameState
  }

  const npc = getNPCProfile(npcId)
  if (!npc) {
    return new Response("NPC not found", { status: 404 })
  }

  const systemPrompt = buildNPCSystemPrompt(npc, gameState)

  const result = streamText({
    model: "anthropic/claude-sonnet-4-6",
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    tools: {
      teachVocabulary: tool({
        description: "Introduce a new word to the player naturally in dialogue. Use this when you introduce a new Japanese word the player hasn't learned yet.",
        inputSchema: z.object({
          word: z.string().describe("The word in Japanese (kanji or kana)"),
          reading: z.string().describe("Hiragana reading of the word"),
          translation: z.string().describe("English translation"),
          category: z.string().describe("Category like 'greeting', 'food', 'number', etc."),
        }),
        execute: async ({ word, reading, translation, category }) => {
          return { learned: true, word, reading, translation, category }
        },
      }),

      correctMistake: tool({
        description: "Gently correct a language mistake the player made. Use this when you notice a grammar or vocabulary error.",
        inputSchema: z.object({
          playerSaid: z.string().describe("What the player said incorrectly"),
          correctedForm: z.string().describe("The correct form in Japanese"),
          explanation: z.string().describe("Brief, friendly explanation in English"),
        }),
        execute: async ({ playerSaid, correctedForm, explanation }) => {
          return { corrected: true, playerSaid, correctedForm, explanation }
        },
      }),

      advanceQuest: tool({
        description: "Mark a quest objective as completed when the player achieves it through conversation.",
        inputSchema: z.object({
          objectiveId: z.string().describe("The ID of the completed objective"),
          reason: z.string().describe("Why this objective was completed"),
        }),
        execute: async ({ objectiveId, reason }) => {
          return { completed: true, objectiveId, reason }
        },
      }),

      suggestPhrase: tool({
        description: "Suggest a Japanese phrase for the player to try saying. Use when the player seems stuck or when you want to encourage participation.",
        inputSchema: z.object({
          phrase: z.string().describe("The Japanese phrase to suggest"),
          reading: z.string().describe("Hiragana reading"),
          meaning: z.string().describe("English meaning"),
          context: z.string().describe("When/how to use this phrase"),
        }),
        execute: async ({ phrase, reading, meaning, context }) => {
          return { suggested: true, phrase, reading, meaning, context }
        },
      }),

      quizWord: tool({
        description: "Test a previously learned word. Use this occasionally to reinforce learning.",
        inputSchema: z.object({
          word: z.string().describe("The Japanese word to quiz"),
          hint: z.string().describe("A contextual hint in English"),
        }),
        execute: async ({ word, hint }) => {
          return { quizzed: true, word, hint }
        },
      }),
    },
  })

  return result.toUIMessageStreamResponse()
}
