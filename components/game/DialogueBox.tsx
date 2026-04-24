"use client"

import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { useGame } from "@/lib/game-context"
import { getNPCProfile } from "@/lib/npc-profiles"
import type { VocabularyWord, ConversationSummary } from "@/lib/game-state"
import type { UIMessage } from "ai"
import { AnimalAvatar } from "./AnimalAvatar"

interface DialogueBoxProps {
  npcId: string
  onClose: () => void
}

function getMessageText(msg: UIMessage): string {
  return msg.parts
    .filter((p): p is Extract<typeof p, { type: "text" }> => p.type === "text")
    .map((p) => (p as { type: "text"; text: string }).text)
    .join("")
}

export function DialogueBox({ npcId, onClose }: DialogueBoxProps) {
  const { gameState, addVocabulary, updateQuest, incrementStats, updateFriendship, removeFromInventory } = useGame()
  const [showGiftPicker, setShowGiftPicker] = useState(false)
  const npc = getNPCProfile(npcId)
  const [inputValue, setInputValue] = useState("")
  const [suggestedPhrases, setSuggestedPhrases] = useState<{ phrase: string; reading: string; meaning: string }[]>([])
  const [corrections, setCorrections] = useState<{ playerSaid: string; correctedForm: string; explanation: string }[]>([])
  const [quizzes, setQuizzes] = useState<{ word: string; hint: string }[]>([])
  const [hasSentInitial, setHasSentInitial] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [memories, setMemories] = useState<ConversationSummary[]>([])
  const [gossip, setGossip] = useState<{ npcName: string; relationship: string; summary: string }[]>([])
  const [ttsEnabled, setTtsEnabled] = useState(true)
  const lastSpokenIdRef = useRef<string | null>(null)
  const sessionWordsLearnedRef = useRef<string[]>([])
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Load memories on mount
  useEffect(() => {
    fetch("/api/load-memories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ npcId }),
    })
      .then((r) => r.json())
      .then((data) => {
        setMemories(data.memories || [])
        setGossip(data.gossip || [])
      })
      .catch(console.error)
  }, [npcId])

  const transport = useMemo(() => new DefaultChatTransport({
    api: "/api/chat",
    body: {
      npcId,
      gameState,
      memories,
      gossip,
    },
  }), [npcId, memories, gossip]) // eslint-disable-line react-hooks/exhaustive-deps

  const { messages, sendMessage, status } = useChat({
    transport,
    onToolCall: ({ toolCall }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tc = toolCall as any
      const args = tc.args || tc.input || {}
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
        sessionWordsLearnedRef.current = [...sessionWordsLearnedRef.current, args.word]
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
        text: `*${gameState?.playerName || "Traveler"} approaches ${npc.name.es}*`,
      })
    }
  }, [hasSentInitial, npc]) // eslint-disable-line react-hooks/exhaustive-deps

  // Focus input when not loading
  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus()
    }
  }, [isLoading])

  // Save conversation summary and close
  const handleClose = useCallback(() => {
    if (messages.length > 2) {
      fetch("/api/summarize-conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          npcId,
          messages: messages
            .map((m) => ({ role: m.role, content: getMessageText(m) }))
            .filter((m) => m.content),
          wordsLearned: sessionWordsLearnedRef.current,
        }),
      }).catch(console.error)
    }
    onClose()
  }, [messages, npcId, onClose])

  // Handle escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose()
      }
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [handleClose])

  // Speech recognition setup
  const hasSpeechSupport = typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return

    const recognition = new SpeechRecognition()
    recognition.lang = gameState?.language === "en-to-es" ? "es" : "en"
    recognition.interimResults = true
    recognition.continuous = false

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join("")
      setInputValue(transcript)
    }

    recognition.onend = () => {
      setIsListening(false)
      inputRef.current?.focus()
    }

    recognition.onerror = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition
    recognition.start()
    setIsListening(true)
  }

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
                <AnimalAvatar
                  animalType={colors.animalType}
                  fur={colors.fur}
                  furDark={colors.furDark}
                  belly={colors.belly}
                  nose={colors.nose}
                  accent={colors.accent}
                  body={colors.body}
                />
              </div>
              <div className="flex-1">
                <div className="text-yellow-400 font-pixel text-xs">
                  {npc.name.es}
                </div>
                <div className="text-gray-500 font-pixel text-[8px]">
                  {npc.role.es}
                </div>
              </div>
              <button
                onClick={handleClose}
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
                  * {npc.name.es} is thinking...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Corrections display */}
            {corrections.length > 0 && (
              <div className="mb-2 p-2 border border-orange-500/30 bg-orange-500/5">
                {corrections.map((c, i) => (
                  <div key={i} className="font-pixel text-[8px]">
                    <span className="text-orange-400">Correccion / Correction:</span>{" "}
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
                    <span className="text-purple-400">Prueba / Quiz:</span>{" "}
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
                  Intenta decir / Try saying:
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

            {/* Gift picker */}
            {showGiftPicker && (gameState.inventory?.length ?? 0) > 0 && (
              <div className="mb-2 p-2 border border-pink-500/30 bg-pink-500/5">
                <span className="text-pink-400 font-pixel text-[8px] block mb-1">
                  Regalo / Gift:
                </span>
                <div className="flex flex-wrap gap-1">
                  {(gameState.inventory ?? []).filter((i) => i.category === "food" || i.category === "gift" || i.category === "decoration").map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        // Give gift
                        removeFromInventory(item.id)
                        updateFriendship(npcId, 3)
                        setShowGiftPicker(false)
                        // Send gift message to chat
                        sendMessage({ text: `*gives ${item.name.es} to ${npc.name.es}*` })
                      }}
                      className="px-2 py-1 border border-pink-400/40 hover:border-pink-400 text-white font-pixel text-[8px] transition-colors hover:bg-pink-400/10"
                    >
                      {item.name.es} x{item.quantity}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input area */}
            <div className="flex gap-2">
              {/* Gift button */}
              {(gameState.inventory?.length ?? 0) > 0 && (
                <button
                  onClick={() => setShowGiftPicker(!showGiftPicker)}
                  className={`font-pixel text-[10px] border-2 px-2 py-1.5 transition-colors ${
                    showGiftPicker
                      ? "text-pink-400 border-pink-400"
                      : "text-pink-400/50 border-pink-400/30 hover:border-pink-400 hover:text-pink-400"
                  }`}
                  title="Gift"
                >
                  GIFT
                </button>
              )}
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
                  placeholder={isListening
                    ? (gameState?.language === "en-to-es" ? "Escuchando..." : "Listening...")
                    : (gameState?.language === "en-to-es" ? "Di algo... / Say something..." : "Say something... / Di algo...")}
                  className="flex-1 bg-transparent text-white font-pixel text-[10px] focus:outline-none placeholder:text-gray-600"
                  disabled={isLoading}
                  autoComplete="off"
                />
              </div>
              {hasSpeechSupport && (
                <button
                  onClick={toggleListening}
                  disabled={isLoading}
                  className={`font-pixel text-[10px] border-2 px-2 py-1.5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                    isListening
                      ? "text-red-400 border-red-400 animate-pulse hover:text-red-300 hover:border-red-300"
                      : "text-cyan-400 border-cyan-400 hover:text-white hover:border-white"
                  }`}
                  title={isListening ? "Stop listening" : "Speak"}
                >
                  {isListening ? "REC" : "MIC"}
                </button>
              )}
              <button
                onClick={handleSend}
                disabled={isLoading || !inputValue.trim()}
                className="text-yellow-400 hover:text-white font-pixel text-[10px] border-2 border-yellow-400 hover:border-white px-3 py-1.5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ENVIAR
              </button>
            </div>

            {/* Help text */}
            <div className="text-gray-600 font-pixel text-[6px] mt-1.5 text-center">
              Puedes hablar en espanol o ingles / You can speak in Spanish or English
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
