"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useGame } from "@/lib/game-context"
import { PlayerCard } from "./PlayerCard"
import { GiftSender } from "./GiftSender"
import { SHOP_ITEMS } from "@/lib/game-state"

interface PlayerData {
  sessionId: string
  playerName: string
  playerLevel: string
  vocabularyCount: number
  questsCompleted: number
  currentOutfit: string
  currentHat: string
  gold: number
}

interface Gift {
  recipientId: string
  giftId: string
  senderId: string
  senderName: string
  type: "item" | "gold"
  itemId?: string
  itemName?: string
  amount?: number
  createdAt: number
  claimed: boolean
}

interface SocialTabProps {
  currentUserId: string
  unclaimedGifts: Gift[]
  onGiftsChanged: () => void
}

function MiniAvatar({ outfit, hat }: { outfit: string; hat: string }) {
  const outfitItem = SHOP_ITEMS.find(i => i.id === outfit)
  const hatItem = SHOP_ITEMS.find(i => i.id === hat)
  const outfitColor = outfitItem?.color || "#FACC15"
  const hatColor = hatItem?.color || "transparent"

  return (
    <div className="relative w-6 h-8 flex items-center justify-center flex-shrink-0">
      {hatColor !== "transparent" && (
        <div className="absolute top-0 w-4 h-1.5 rounded-t-sm" style={{ backgroundColor: hatColor }} />
      )}
      <div className="absolute top-1.5 w-3 h-3 rounded-full bg-amber-200" />
      <div className="absolute bottom-0 w-4 h-4 rounded-t-sm" style={{ backgroundColor: outfitColor }} />
    </div>
  )
}

const levelBadge: Record<string, { label: string; color: string }> = {
  beginner: { label: "B", color: "bg-green-600" },
  elementary: { label: "E", color: "bg-cyan-600" },
  intermediate: { label: "I", color: "bg-purple-600" },
}

export function SocialTab({ currentUserId, unclaimedGifts, onGiftsChanged }: SocialTabProps) {
  const { gameState } = useGame()
  const [players, setPlayers] = useState<PlayerData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerData | null>(null)
  const [giftTarget, setGiftTarget] = useState<PlayerData | null>(null)
  const [claimingGift, setClaimingGift] = useState<string | null>(null)
  const [section, setSection] = useState<"leaderboard" | "gifts">("leaderboard")
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [changedIds, setChangedIds] = useState<Set<string>>(new Set())
  const prevRanksRef = useRef<Map<string, number>>(new Map())

  const fetchPlayers = useCallback(async () => {
    try {
      const res = await fetch("/api/players")
      if (res.ok) {
        const data = await res.json()
        const newPlayers: PlayerData[] = data.players

        // Detect rank changes
        if (prevRanksRef.current.size > 0) {
          const changed = new Set<string>()
          newPlayers.forEach((p, i) => {
            const prevRank = prevRanksRef.current.get(p.sessionId)
            if (prevRank !== undefined && prevRank !== i) {
              changed.add(p.sessionId)
            }
          })
          if (changed.size > 0) {
            setChangedIds(changed)
            setTimeout(() => setChangedIds(new Set()), 2000)
          }
        }

        // Store current ranks for next comparison
        const rankMap = new Map<string, number>()
        newPlayers.forEach((p, i) => rankMap.set(p.sessionId, i))
        prevRanksRef.current = rankMap

        setPlayers(newPlayers)
        setLastUpdated(new Date())
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial fetch + poll every 15s while leaderboard is visible
  useEffect(() => {
    fetchPlayers()

    if (section !== "leaderboard") return

    const interval = setInterval(fetchPlayers, 15_000)
    return () => clearInterval(interval)
  }, [fetchPlayers, section])

  const handleClaimGift = async (giftId: string) => {
    setClaimingGift(giftId)
    try {
      const res = await fetch("/api/gifts/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": currentUserId },
        body: JSON.stringify({ giftId }),
      })
      if (res.ok) {
        onGiftsChanged()
      }
    } catch {
      // ignore
    } finally {
      setClaimingGift(null)
    }
  }

  const handleGiftSent = () => {
    setGiftTarget(null)
    fetchPlayers()
    onGiftsChanged()
  }

  if (!gameState) return null

  return (
    <div className="undertale-box">
      <div className="bg-black p-4">
        {/* Section toggle */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setSection("leaderboard")}
            className={`flex-1 py-2 border-2 font-pixel text-[10px] transition-colors ${
              section === "leaderboard"
                ? "border-violet-400 text-violet-400 bg-violet-400/10"
                : "border-white/20 text-gray-500 hover:text-white"
            }`}
          >
            Tabla / Leaderboard
          </button>
          <button
            onClick={() => setSection("gifts")}
            className={`flex-1 py-2 border-2 font-pixel text-[10px] transition-colors relative ${
              section === "gifts"
                ? "border-yellow-400 text-yellow-400 bg-yellow-400/10"
                : "border-white/20 text-gray-500 hover:text-white"
            }`}
          >
            Regalos / Gifts
            {unclaimedGifts.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white font-pixel text-[6px]">
                {unclaimedGifts.length}
              </span>
            )}
          </button>
        </div>

        {/* Leaderboard */}
        {section === "leaderboard" && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="text-violet-400 font-pixel text-xs">
                * Ranking de Aventureros
              </div>
              {lastUpdated && (
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-gray-600 font-pixel text-[6px]">LIVE</span>
                </div>
              )}
            </div>
            {loading ? (
              <div className="text-gray-500 font-pixel text-[10px] text-center py-8">
                Cargando...
              </div>
            ) : players.length === 0 ? (
              <div className="text-gray-500 font-pixel text-[10px] text-center py-8">
                No players yet
              </div>
            ) : (
              <div className="space-y-1 max-h-64 overflow-y-auto game-scrollbar">
                {players.map((player, index) => {
                  const isMe = player.sessionId === currentUserId
                  const rankChanged = changedIds.has(player.sessionId)
                  return (
                    <button
                      key={player.sessionId}
                      onClick={() => setSelectedPlayer(player)}
                      className={`w-full p-2 border text-left flex items-center gap-2 transition-all duration-700 ${
                        rankChanged
                          ? "border-yellow-400/60 bg-yellow-400/10"
                          : isMe
                            ? "border-violet-400/50 bg-violet-400/5 hover:bg-violet-400/10"
                            : "border-white/10 hover:border-white/30 hover:bg-white/5"
                      }`}
                    >
                      {/* Rank */}
                      <span className={`font-pixel text-[10px] w-5 text-center ${
                        index === 0 ? "text-yellow-400" : index === 1 ? "text-gray-300" : index === 2 ? "text-amber-600" : "text-gray-500"
                      }`}>
                        #{index + 1}
                      </span>

                      {/* Avatar */}
                      <MiniAvatar outfit={player.currentOutfit} hat={player.currentHat} />

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <span className={`font-pixel text-[10px] truncate ${isMe ? "text-violet-400" : "text-white"}`}>
                            {player.playerName}
                          </span>
                          {isMe && <span className="text-violet-400 font-pixel text-[6px]">(Tu)</span>}
                          <span className={`${levelBadge[player.playerLevel]?.color || "bg-green-600"} text-white font-pixel text-[6px] px-1 rounded-sm`}>
                            {levelBadge[player.playerLevel]?.label || "B"}
                          </span>
                        </div>
                      </div>

                      {/* Words count */}
                      <div className="text-right flex-shrink-0">
                        <div className="text-cyan-400 font-pixel text-[10px]">{player.vocabularyCount}</div>
                        <div className="text-gray-600 font-pixel text-[6px]">words</div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Gifts inbox */}
        {section === "gifts" && (
          <div>
            <div className="text-yellow-400 font-pixel text-xs mb-3">
              * Regalos sin reclamar
            </div>
            {unclaimedGifts.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-500 font-pixel text-[10px]">* No tienes regalos</div>
                <div className="text-gray-600 font-pixel text-[8px] mt-1">No gifts yet</div>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto game-scrollbar">
                {unclaimedGifts.map(gift => (
                  <div
                    key={gift.giftId}
                    className="p-3 border-2 border-yellow-500/30 bg-yellow-500/5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="text-white font-pixel text-[10px]">
                          De: {gift.senderName}
                        </div>
                        <div className="text-yellow-400 font-pixel text-[8px] mt-1">
                          {gift.type === "gold"
                            ? `${gift.amount} oro / gold`
                            : gift.itemName || gift.itemId}
                        </div>
                        <div className="text-gray-600 font-pixel text-[6px] mt-1">
                          {new Date(gift.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <button
                        onClick={() => handleClaimGift(gift.giftId)}
                        disabled={claimingGift === gift.giftId}
                        className="font-pixel text-[10px] px-3 py-1 border-2 border-green-400 text-green-400 hover:bg-green-400/10 transition-colors disabled:opacity-50 flex-shrink-0"
                      >
                        {claimingGift === gift.giftId ? "..." : "Reclamar"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Player card modal */}
      {selectedPlayer && (
        <PlayerCard
          player={selectedPlayer}
          currentUserId={currentUserId}
          onSendGift={(p) => { setSelectedPlayer(null); setGiftTarget(p) }}
          onClose={() => setSelectedPlayer(null)}
        />
      )}

      {/* Gift sender modal */}
      {giftTarget && (
        <GiftSender
          recipientId={giftTarget.sessionId}
          recipientName={giftTarget.playerName}
          onClose={() => setGiftTarget(null)}
          onSent={handleGiftSent}
        />
      )}
    </div>
  )
}
