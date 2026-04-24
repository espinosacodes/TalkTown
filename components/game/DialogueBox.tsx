"use client"

import { useState, useEffect, useRef } from "react"
import { useChat } from "@ai-sdk/react"
import { useGame } from "@/lib/game-context"
import { getNPCProfile } from "@/lib/npc-profiles"
import type { VocabularyWord } from "@/lib/game-state"
import type { UIMessage } from "ai"

interface DialogueBoxProps {
  npcId: string
  onClose: () => void
  onWordLearned?: (word: { original: string; reading?: string; translation: string }) => void
}

function getMessageText(msg: UIMessage): string {
  return msg.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("")
}

export function DialogueBox({ npcId, onClose, onWordLearned }: DialogueBoxProps) {
  const { gameState, addVocabulary, updateQuest, incrementStats } = useGame()
  const npc = getNPCProfile(npcId)
  const [inputValue, setInputValue] = useState("")
  const [suggestedPhrases, setSuggestedPhrases] = useState<{ phrase: string; reading: string; meaning: string }[]>([])
  const [corrections, setCorrections] = useState<{ playerSaid: string; correctedForm: string; explanation: string }[]>([])
  const [quizzes, setQuizzes] = useState<{ word: string; hint: string }[]>([])
  const [hasSentInitial, setHasSentInitial] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { messages, sendMessage, status } = useChat({
    body: {
      npcId,
      gameState,
    },
    onToolCall: ({ toolCall }) => {
      const args = toolCall.args as Record<string, string>
      if (toolCall.toolName === "teachVocabulary") {
        const vocabWord: VocabularyWord = {
          word: args.word,
          reading: args.reading || "",
          translation: args.translation,
          timesUsed: 1,
          mastery: 10,
          category: args.category || "conversation",
        }
        addVocabulary(vocabWord)
        onWordLearned?.({ original: args.word, reading: args.reading, translation: args.translation })
      } else if (toolCall.toolName === "correctMistake") {
        setCorrections(prev => [...prev, {
          playerSaid: args.playerSaid,
          correctedForm: args.correctedForm,
          explanation: args.explanation,
        }])
        incrementStats("mistakes")
      } else if (toolCall.toolName === "advanceQuest") {
        if (gameState?.currentQuest) {
          updateQuest(gameState.currentQuest.id, args.objectiveId)
        }
      } else if (toolCall.toolName === "suggestPhrase") {
        setSuggestedPhrases(prev => [...prev.slice(-2), {
          phrase: args.phrase,
          reading: args.reading,
          meaning: args.meaning,
        }])
      } else if (toolCall.toolName === "quizWord") {
        setQuizzes(prev => [...prev, { word: args.word, hint: args.hint }])
      }
    },
  })

  const isLoading = status === "streaming" || status === "submitted"

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Send initial greeting
  useEffect(() => {
    if (!hasSentInitial && npc) {
      setHasSentInitial(true)
      sendMessage({
        text: `*${gameState?.playerName || "Traveler"} approaches ${npc.name.ja}*`,
      })
    }
  }, [hasSentInitial, npc])

  // Focus input when not loading
  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus()
    }
  }, [isLoading])

  // Handle escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [onClose])

  if (!npc || !gameState) return null

  const handleSend = () => {
    const text = inputValue.trim()
    if (!text || isLoading) return

    incrementStats("words")
    sendMessage({ text })
    setInputValue("")
    setSuggestedPhrases([])
    setCorrections([])
    setQuizzes([])
  }

  const handleSuggestedPhrase = (phrase: string) => {
    setInputValue(phrase)
    inputRef.current?.focus()
  }

  const colors = npc.spriteColors

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4 dialogue-enter">
      <div className="max-w-2xl mx-auto">
        <div className="undertale-box">
          <div className="bg-black p-4">
            {/* NPC Header */}
            <div className="flex items-center gap-3 mb-3 pb-2 border-b border-white/20">
              <div
                className="w-10 h-10 flex items-center justify-center bg-white/5 pixel-art border-2 rounded-sm"
                style={{ borderColor: colors.accent }}
              >
                <NPCAvatar colors={colors} />
              </div>
              <div className="flex-1">
                <div className="text-yellow-400 font-pixel text-xs">
                  {npc.name.ja} / {npc.name.es}
                </div>
                <div className="text-gray-500 font-pixel text-[8px]">
                  {npc.role.ja} / {npc.role.es}
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-white font-pixel text-[8px] border border-gray-600 hover:border-white px-2 py-1 transition-colors"
              >
                [ESC]
              </button>
            </div>

            {/* Messages area */}
            <div className="max-h-48 overflow-y-auto game-scrollbar mb-3 space-y-2">
              {messages.map((msg) => {
                const text = getMessageText(msg)
                if (!text) return null
                return (
                  <div key={msg.id}>
                    {msg.role === "user" ? (
                      <div className="text-right">
                        <span className="text-green-400 font-pixel text-[10px]">
                          {text}
                        </span>
                      </div>
                    ) : (
                      <div>
                        <span className="text-yellow-400 font-pixel text-[10px] mr-1">*</span>
                        <span className="text-white font-pixel text-[10px] leading-relaxed whitespace-pre-wrap">
                          {text}
                        </span>
                      </div>
                    )}
                  </div>
                )
              })}

              {isLoading && (
                <div className="text-yellow-400/50 font-pixel text-[10px] animate-pulse">
                  * {npc.name.ja} is thinking...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Corrections display */}
            {corrections.length > 0 && (
              <div className="mb-2 p-2 border border-orange-500/30 bg-orange-500/5">
                {corrections.map((c, i) => (
                  <div key={i} className="font-pixel text-[8px]">
                    <span className="text-orange-400">訂正 / Correction:</span>{" "}
                    <span className="text-red-400 line-through">{c.playerSaid}</span>{" "}
                    <span className="text-green-400">{c.correctedForm}</span>
                    <div className="text-gray-500 mt-0.5">{c.explanation}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Quiz display */}
            {quizzes.length > 0 && (
              <div className="mb-2 p-2 border border-purple-500/30 bg-purple-500/5">
                {quizzes.map((q, i) => (
                  <div key={i} className="font-pixel text-[8px]">
                    <span className="text-purple-400">クイズ / Quiz:</span>{" "}
                    <span className="text-white">{q.word}</span>{" "}
                    <span className="text-gray-500">- {q.hint}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Suggested phrases */}
            {suggestedPhrases.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-1">
                <span className="text-cyan-400 font-pixel text-[8px] w-full mb-1">
                  提案 / Try saying:
                </span>
                {suggestedPhrases.map((sp, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestedPhrase(sp.phrase)}
                    className="px-2 py-1 border border-cyan-400/40 hover:border-cyan-400 text-white font-pixel text-[8px] transition-colors hover:bg-cyan-400/10"
                  >
                    {sp.phrase} ({sp.meaning})
                  </button>
                ))}
              </div>
            )}

            {/* Input area */}
            <div className="flex gap-2">
              <div className="flex-1 flex items-center gap-1 border-2 border-white/40 px-2 py-1.5 focus-within:border-yellow-400 transition-colors">
                <span className="text-yellow-400 font-pixel text-[10px]">{">"}</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleSend()
                    }
                    e.stopPropagation()
                  }}
                  placeholder="話してみよう... / Say something..."
                  className="flex-1 bg-transparent text-white font-pixel text-[10px] focus:outline-none placeholder:text-gray-600"
                  disabled={isLoading}
                  autoComplete="off"
                />
              </div>
              <button
                onClick={handleSend}
                disabled={isLoading || !inputValue.trim()}
                className="text-yellow-400 hover:text-white font-pixel text-[10px] border-2 border-yellow-400 hover:border-white px-3 py-1.5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                送信
              </button>
            </div>

            {/* Help text */}
            <div className="text-gray-600 font-pixel text-[6px] mt-1.5 text-center">
              日本語でも英語でも話せます / You can speak in Japanese or English
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function NPCAvatar({ colors }: { colors: { hair: string; body: string; accent: string; skin: string } }) {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="w-6 h-8 rounded-t-sm" style={{ backgroundColor: colors.body }} />
      <div className="absolute top-1 w-5 h-5 rounded-full" style={{ backgroundColor: colors.skin }} />
      <div className="absolute top-0 w-5 h-2 rounded-t-sm" style={{ backgroundColor: colors.hair }} />
    </div>
  )
}
