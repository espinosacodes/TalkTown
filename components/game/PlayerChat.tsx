"use client"

import { useState, useRef, useEffect } from "react"
import type { ChatMessage } from "@/hooks/use-multiplayer"

interface PlayerChatProps {
  messages: ChatMessage[]
  onlineCount: number
  onSend: (message: string) => void
  currentUserId: string
  onFocusChange?: (focused: boolean) => void
}

export function PlayerChat({ messages, onlineCount, onSend, currentUserId, onFocusChange }: PlayerChatProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    onSend(input)
    setInput("")
  }

  const handleFocus = () => onFocusChange?.(true)
  const handleBlur = () => onFocusChange?.(false)

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-40 undertale-box p-0.5 hover:opacity-90 transition-opacity"
      >
        <div className="bg-black px-3 py-2 flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-cyan-300 font-pixel text-[8px]">
            CHAT ({onlineCount} online)
          </span>
          {messages.length > 0 && (
            <span className="w-3 h-3 bg-red-500 rounded-full flex items-center justify-center text-white font-pixel text-[5px]">
              !
            </span>
          )}
        </div>
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 w-72 undertale-box p-0.5">
      <div className="bg-black">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-white/20">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-cyan-300 font-pixel text-[8px]">
              CHAT - {onlineCount} jugadores / players
            </span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-500 hover:text-white font-pixel text-[8px]"
          >
            [X]
          </button>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="h-32 overflow-y-auto px-3 py-2 space-y-1 game-scrollbar"
        >
          {messages.length === 0 && (
            <div className="text-gray-600 font-pixel text-[7px] text-center py-4">
              No hay mensajes aun / No messages yet
            </div>
          )}
          {messages.map((msg) => (
            <div key={msg.id} className="text-[7px] font-pixel">
              <span className={msg.senderId === currentUserId ? "text-yellow-400" : "text-cyan-300"}>
                {msg.senderName}:
              </span>{" "}
              <span className="text-white">{msg.message}</span>
            </div>
          ))}
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="border-t border-white/20 px-2 py-1.5 flex gap-1">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder="Escribe... / Type..."
            maxLength={100}
            className="flex-1 bg-transparent text-white font-pixel text-[8px] outline-none placeholder:text-gray-600"
          />
          <button
            type="submit"
            className="text-yellow-400 font-pixel text-[8px] hover:text-yellow-300 px-1"
          >
            &gt;
          </button>
        </form>
      </div>
    </div>
  )
}
