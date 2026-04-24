import { getWritable } from "workflow"
import { DurableAgent } from "@workflow/ai/agent"
import { convertToModelMessages, tool, type UIMessageChunk, type UIMessage } from "ai"
import * as z from "zod"
import { getNPCProfile, buildNPCSystemPrompt } from "@/lib/npc-profiles"
import type { GameState, ConversationSummary } from "@/lib/game-state"

interface NPCChatInput {
  messages: UIMessage[]
  npcId: string
  gameState: GameState
  memories?: ConversationSummary[]
  gossip?: { npcName: string; relationship: string; summary: string }[]
}

async function teachVocabularyStep({ word, reading, translation, category }: {
  word: string; reading: string; translation: string; category: string
}) {
  "use step"
  return { learned: true, word, reading, translation, category }
}

async function correctMistakeStep({ playerSaid, correctedForm, explanation }: {
  playerSaid: string; correctedForm: string; explanation: string
}) {
  "use step"
  return { corrected: true, playerSaid, correctedForm, explanation }
}

async function advanceQuestStep({ objectiveId, reason }: {
  objectiveId: string; reason: string
}) {
  "use step"
  return { completed: true, objectiveId, reason }
}

async function suggestPhraseStep({ phrase, reading, meaning, context }: {
  phrase: string; reading: string; meaning: string; context: string
}) {
  "use step"
  return { suggested: true, phrase, reading, meaning, context }
}

async function quizWordStep({ word, hint }: { word: string; hint: string }) {
  "use step"
  return { quizzed: true, word, hint }
}

async function reactToGiftStep({ giftName, reaction, message }: {
  giftName: string; reaction: "loved" | "liked" | "neutral" | "disliked"; message: string
}) {
  "use step"
  return { gifted: true, giftName, reaction, message }
}

async function startMiniGameStep({ gameType, reason }: {
  gameType: "word_matching" | "flashcard_review" | "fishing"; reason: string
}) {
  "use step"
  return { suggested: true, gameType, reason }
}

export async function npcChat(input: NPCChatInput) {
  "use workflow"

  const { messages, npcId, gameState, memories, gossip } = input

  const npc = getNPCProfile(npcId)
  if (!npc) throw new Error(`NPC not found: ${npcId}`)

  const systemPrompt = buildNPCSystemPrompt(npc, gameState, memories, gossip)

  const isLearningSpanish = gameState.language === "en-to-es"
  const targetLang = isLearningSpanish ? "Spanish" : "English"
  const nativeLang = isLearningSpanish ? "English" : "Spanish"

  const agent = new DurableAgent({
    model: "groq/llama-3.3-70b-versatile",
    instructions: systemPrompt,
    tools: {
      teachVocabulary: tool({
        description: `Introduce a new word to the player naturally in dialogue. Use this when you introduce a new ${targetLang} word the player hasn't learned yet.`,
        inputSchema: z.object({
          word: z.string().describe(`The word in ${targetLang}`),
          reading: z.string().describe("Pronunciation hint (if needed)"),
          translation: z.string().describe(`${nativeLang} translation`),
          category: z.string().describe("Category like 'greeting', 'food', 'number', etc."),
        }),
        execute: async ({ word, reading, translation, category }) => {
          return teachVocabularyStep({ word, reading, translation, category })
        },
      }),

      correctMistake: tool({
        description: "Gently correct a language mistake the player made. Use this when you notice a grammar or vocabulary error.",
        inputSchema: z.object({
          playerSaid: z.string().describe("What the player said incorrectly"),
          correctedForm: z.string().describe(`The correct form in ${targetLang}`),
          explanation: z.string().describe(`Brief, friendly explanation in ${nativeLang}`),
        }),
        execute: async ({ playerSaid, correctedForm, explanation }) => {
          return correctMistakeStep({ playerSaid, correctedForm, explanation })
        },
      }),

      advanceQuest: tool({
        description: "Mark a quest objective as completed when the player achieves it through conversation.",
        inputSchema: z.object({
          objectiveId: z.string().describe("The ID of the completed objective"),
          reason: z.string().describe("Why this objective was completed"),
        }),
        execute: async ({ objectiveId, reason }) => {
          return advanceQuestStep({ objectiveId, reason })
        },
      }),

      suggestPhrase: tool({
        description: `Suggest a ${targetLang} phrase for the player to try saying. Use when the player seems stuck or when you want to encourage participation.`,
        inputSchema: z.object({
          phrase: z.string().describe(`The ${targetLang} phrase to suggest`),
          reading: z.string().describe("Pronunciation hint (if needed)"),
          meaning: z.string().describe(`${nativeLang} meaning`),
          context: z.string().describe("When/how to use this phrase"),
        }),
        execute: async ({ phrase, reading, meaning, context }) => {
          return suggestPhraseStep({ phrase, reading, meaning, context })
        },
      }),

      quizWord: tool({
        description: "Test a previously learned word. Use this occasionally to reinforce learning.",
        inputSchema: z.object({
          word: z.string().describe(`The ${targetLang} word to quiz`),
          hint: z.string().describe(`A contextual hint in ${nativeLang}`),
        }),
        execute: async ({ word, hint }) => {
          return quizWordStep({ word, hint })
        },
      }),

      reactToGift: tool({
        description: "React when the player gives you a gift. Express how you feel about it in character.",
        inputSchema: z.object({
          giftName: z.string().describe("Name of the gift received"),
          reaction: z.enum(["loved", "liked", "neutral", "disliked"]).describe("How much you liked the gift"),
          message: z.string().describe("Your in-character reaction in Spanish"),
        }),
        execute: async ({ giftName, reaction, message }) => {
          return reactToGiftStep({ giftName, reaction, message })
        },
      }),

      startMiniGame: tool({
        description: "Suggest a mini-game to the player when contextually appropriate (e.g., fishing at the beach, flashcards at school).",
        inputSchema: z.object({
          gameType: z.enum(["word_matching", "flashcard_review", "fishing"]).describe("Type of mini-game to suggest"),
          reason: z.string().describe("Why you're suggesting this game"),
        }),
        execute: async ({ gameType, reason }) => {
          return startMiniGameStep({ gameType, reason })
        },
      }),
    },
  })

  const writable = getWritable<UIMessageChunk>()
  const modelMessages = await convertToModelMessages(messages)

  const result = await agent.stream({
    messages: modelMessages,
    writable,
  })

  return result
}
