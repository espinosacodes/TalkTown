import { groq } from "@ai-sdk/groq"
import { google } from "@ai-sdk/google"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { generateText as aiGenerateText } from "ai"
import type { LanguageModel } from "ai"

interface AIProvider {
  name: string
  envKey: string
  getModel: () => LanguageModel
  workflowModelId: string
}

const providers: AIProvider[] = [
  {
    name: "groq",
    envKey: "GROQ_API_KEY",
    getModel: () => groq("llama-3.3-70b-versatile"),
    workflowModelId: "groq/llama-3.3-70b-versatile",
  },
  {
    name: "google",
    envKey: "GOOGLE_GENERATIVE_AI_API_KEY",
    getModel: () => google("gemini-2.0-flash"),
    workflowModelId: "google/gemini-2.0-flash",
  },
  {
    name: "openrouter",
    envKey: "OPENROUTER_API_KEY",
    getModel: () => {
      const openrouter = createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY })
      return openrouter("meta-llama/llama-3.3-70b-instruct:free")
    },
    workflowModelId: "openrouter/meta-llama/llama-3.3-70b-instruct:free",
  },
]

function getAvailableProviders(): AIProvider[] {
  return providers.filter((p) => !!process.env[p.envKey])
}

/** Returns the first available model (checks env keys) */
export function getModel(): LanguageModel {
  const available = getAvailableProviders()
  if (available.length === 0) {
    throw new Error(
      "No AI provider configured. Add GROQ_API_KEY, GOOGLE_GENERATIVE_AI_API_KEY, or OPENROUTER_API_KEY to .env"
    )
  }
  return available[0].getModel()
}

/** Returns the workflow model string for DurableAgent */
export function getWorkflowModelId(): string {
  const available = getAvailableProviders()
  if (available.length === 0) {
    throw new Error(
      "No AI provider configured. Add GROQ_API_KEY, GOOGLE_GENERATIVE_AI_API_KEY, or OPENROUTER_API_KEY to .env"
    )
  }
  return available[0].workflowModelId
}

/** generateText with automatic fallback across all configured providers */
export async function generateTextWithFallback(
  options: Omit<Parameters<typeof aiGenerateText>[0], "model">
) {
  const available = getAvailableProviders()
  if (available.length === 0) {
    throw new Error(
      "No AI provider configured. Add GROQ_API_KEY, GOOGLE_GENERATIVE_AI_API_KEY, or OPENROUTER_API_KEY to .env"
    )
  }

  let lastError: unknown
  for (const provider of available) {
    try {
      return await aiGenerateText({
        ...options,
        model: provider.getModel(),
      } as Parameters<typeof aiGenerateText>[0])
    } catch (error) {
      console.warn(`[AI] ${provider.name} failed, trying next provider...`, error)
      lastError = error
    }
  }
  throw lastError
}
