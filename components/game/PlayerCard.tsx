"use client"

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

interface PlayerCardProps {
  player: PlayerData
  currentUserId: string
  onSendGift: (player: PlayerData) => void
  onClose: () => void
}

function PlayerAvatarPreview({ outfit, hat }: { outfit: string; hat: string }) {
  const outfitItem = SHOP_ITEMS.find(i => i.id === outfit)
  const hatItem = SHOP_ITEMS.find(i => i.id === hat)
  const outfitColor = outfitItem?.color || "#FACC15"
  const hatColor = hatItem?.color || "transparent"

  return (
    <div className="relative w-12 h-16 flex items-center justify-center">
      {hatColor !== "transparent" && (
        <div
          className="absolute top-0 w-8 h-3 rounded-t-sm"
          style={{ backgroundColor: hatColor }}
        />
      )}
      <div className="absolute top-3 w-6 h-6 rounded-full bg-amber-200" />
      <div
        className="absolute bottom-0 w-8 h-8 rounded-t-sm"
        style={{ backgroundColor: outfitColor }}
      />
    </div>
  )
}

const levelLabels: Record<string, { text: string; color: string }> = {
  beginner: { text: "Principiante", color: "text-green-400" },
  elementary: { text: "Elemental", color: "text-cyan-400" },
  intermediate: { text: "Intermedio", color: "text-purple-400" },
}

export function PlayerCard({ player, currentUserId, onSendGift, onClose }: PlayerCardProps) {
  const level = levelLabels[player.playerLevel] || levelLabels.beginner
  const isMe = player.sessionId === currentUserId

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={onClose}>
      <div className="undertale-box max-w-sm w-full mx-4" onClick={e => e.stopPropagation()}>
        <div className="bg-black p-4">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/20">
            <h2 className="text-violet-400 font-pixel text-xs">Perfil / PROFILE</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-white font-pixel text-[8px] border border-gray-600 hover:border-white px-2 py-1 transition-colors"
            >
              [ESC]
            </button>
          </div>

          <div className="flex items-start gap-4 mb-4">
            <div className="border-2 border-white/20 p-2">
              <PlayerAvatarPreview outfit={player.currentOutfit} hat={player.currentHat} />
            </div>
            <div className="flex-1">
              <div className="text-white font-pixel text-sm">
                {player.playerName}
                {isMe && <span className="text-violet-400 ml-2">(Tu)</span>}
              </div>
              <div className={`${level.color} font-pixel text-[8px] mt-1`}>
                Nivel: {level.text}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="border border-white/10 p-2">
              <div className="text-gray-500 font-pixel text-[6px]">Palabras / Words</div>
              <div className="text-cyan-400 font-pixel text-xs">{player.vocabularyCount}</div>
            </div>
            <div className="border border-white/10 p-2">
              <div className="text-gray-500 font-pixel text-[6px]">Misiones / Quests</div>
              <div className="text-green-400 font-pixel text-xs">{player.questsCompleted}</div>
            </div>
            <div className="border border-white/10 p-2">
              <div className="text-gray-500 font-pixel text-[6px]">Oro / Gold</div>
              <div className="text-yellow-400 font-pixel text-xs">{player.gold}</div>
            </div>
            <div className="border border-white/10 p-2">
              <div className="text-gray-500 font-pixel text-[6px]">Outfit</div>
              <div className="text-pink-400 font-pixel text-xs">
                {SHOP_ITEMS.find(i => i.id === player.currentOutfit)?.name.es || "Default"}
              </div>
            </div>
          </div>

          {!isMe && (
            <button
              onClick={() => onSendGift(player)}
              className="w-full py-2 border-2 border-violet-500 text-violet-400 hover:bg-violet-500/10 font-pixel text-[10px] transition-colors"
            >
              Enviar Regalo / Send Gift
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
