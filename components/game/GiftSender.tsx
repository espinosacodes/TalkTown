"use client"

import { useState } from "react"
import { useGame } from "@/lib/game-context"

interface GiftSenderProps {
  recipientId: string
  recipientName: string
  onClose: () => void
  onSent: () => void
}

export function GiftSender({ recipientId, recipientName, onClose, onSent }: GiftSenderProps) {
  const { gameState } = useGame()
  const [mode, setMode] = useState<"choose" | "item" | "gold">("choose")
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [goldAmount, setGoldAmount] = useState("")
  const [sending, setSending] = useState(false)
  const [error, setError] = useState("")
  const [confirm, setConfirm] = useState(false)

  if (!gameState) return null

  const inventory = gameState.inventory.filter(i => i.quantity > 0)

  const handleSend = async () => {
    if (!confirm) {
      setConfirm(true)
      return
    }

    setSending(true)
    setError("")

    try {
      const body: Record<string, unknown> = { recipientId, type: mode === "gold" ? "gold" : "item" }
      if (mode === "gold") {
        body.amount = Number(goldAmount)
      } else {
        body.itemId = selectedItemId
      }

      const res = await fetch("/api/gifts/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Failed to send gift")
        setConfirm(false)
        setSending(false)
        return
      }

      onSent()
    } catch {
      setError("Network error")
      setConfirm(false)
      setSending(false)
    }
  }

  const canSendGold = Number(goldAmount) > 0 && Number(goldAmount) <= gameState.gold
  const canSendItem = selectedItemId !== null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={onClose}>
      <div className="undertale-box max-w-sm w-full mx-4" onClick={e => e.stopPropagation()}>
        <div className="bg-black p-4">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/20">
            <h2 className="text-violet-400 font-pixel text-xs">
              Regalo para {recipientName}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-white font-pixel text-[8px] border border-gray-600 hover:border-white px-2 py-1 transition-colors"
            >
              [ESC]
            </button>
          </div>

          {mode === "choose" && (
            <div className="space-y-2">
              <button
                onClick={() => setMode("item")}
                disabled={inventory.length === 0}
                className={`w-full p-3 border-2 text-left font-pixel text-[10px] transition-colors ${
                  inventory.length === 0
                    ? "border-gray-700 text-gray-600 cursor-not-allowed"
                    : "border-white/20 text-white hover:border-violet-400"
                }`}
              >
                Enviar Objeto / Send Item
                <div className="text-gray-500 text-[8px] mt-1">
                  {inventory.length === 0 ? "No items in inventory" : `${inventory.length} items available`}
                </div>
              </button>
              <button
                onClick={() => setMode("gold")}
                disabled={gameState.gold <= 0}
                className={`w-full p-3 border-2 text-left font-pixel text-[10px] transition-colors ${
                  gameState.gold <= 0
                    ? "border-gray-700 text-gray-600 cursor-not-allowed"
                    : "border-white/20 text-white hover:border-yellow-400"
                }`}
              >
                Enviar Oro / Send Gold
                <div className="text-yellow-400 text-[8px] mt-1">
                  You have {gameState.gold} gold
                </div>
              </button>
            </div>
          )}

          {mode === "item" && (
            <div>
              <button
                onClick={() => { setMode("choose"); setConfirm(false) }}
                className="text-gray-500 hover:text-white font-pixel text-[8px] mb-3"
              >
                &lt; Back
              </button>
              <div className="space-y-1 max-h-40 overflow-y-auto game-scrollbar">
                {inventory.map(item => (
                  <button
                    key={item.id}
                    onClick={() => { setSelectedItemId(item.id); setConfirm(false) }}
                    className={`w-full p-2 border text-left font-pixel text-[10px] transition-colors ${
                      selectedItemId === item.id
                        ? "border-violet-400 text-violet-400 bg-violet-400/10"
                        : "border-white/10 text-white hover:border-white/30"
                    }`}
                  >
                    {item.name.es} <span className="text-gray-500">x{item.quantity}</span>
                  </button>
                ))}
              </div>
              {canSendItem && (
                <button
                  onClick={handleSend}
                  disabled={sending}
                  className="w-full mt-3 py-2 border-2 border-violet-500 text-violet-400 hover:bg-violet-500/10 font-pixel text-[10px] transition-colors disabled:opacity-50"
                >
                  {sending ? "Enviando..." : confirm ? "Confirmar / Confirm?" : "Enviar / Send"}
                </button>
              )}
            </div>
          )}

          {mode === "gold" && (
            <div>
              <button
                onClick={() => { setMode("choose"); setConfirm(false) }}
                className="text-gray-500 hover:text-white font-pixel text-[8px] mb-3"
              >
                &lt; Back
              </button>
              <div className="flex items-center gap-2 mb-3">
                <input
                  type="number"
                  min="1"
                  max={gameState.gold}
                  value={goldAmount}
                  onChange={e => { setGoldAmount(e.target.value); setConfirm(false) }}
                  placeholder="Amount"
                  className="flex-1 bg-black border-2 border-white/20 text-yellow-400 font-pixel text-[10px] px-3 py-2 focus:border-yellow-400 outline-none"
                />
                <span className="text-yellow-400 font-pixel text-[8px]">/ {gameState.gold}</span>
              </div>
              {canSendGold && (
                <button
                  onClick={handleSend}
                  disabled={sending}
                  className="w-full py-2 border-2 border-yellow-500 text-yellow-400 hover:bg-yellow-500/10 font-pixel text-[10px] transition-colors disabled:opacity-50"
                >
                  {sending ? "Enviando..." : confirm ? "Confirmar / Confirm?" : `Enviar ${goldAmount} oro / Send ${goldAmount} gold`}
                </button>
              )}
            </div>
          )}

          {error && (
            <div className="mt-2 text-red-400 font-pixel text-[8px]">* {error}</div>
          )}
        </div>
      </div>
    </div>
  )
}
