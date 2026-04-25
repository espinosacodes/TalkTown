"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { getPusherClient, disconnectPusher } from "@/lib/pusher-client"
import type { AreaId } from "@/lib/game-state"
import type { Channel, PresenceChannel } from "pusher-js"

export interface OtherPlayer {
  id: string
  name: string
  outfit: string
  hat: string
  level: string
  x: number
  y: number
  facing: "left" | "right"
  lastSeen: number
}

export interface ChatMessage {
  id: string
  senderId: string
  senderName: string
  message: string
  timestamp: number
}

interface UseMultiplayerOptions {
  userId: string
  playerName: string
  currentArea: AreaId
  playerX: number
  playerY: number
  playerFacing: "left" | "right"
  outfit: string
  hat: string
  level: string
  enabled: boolean
}

export function useMultiplayer({
  userId,
  playerName,
  currentArea,
  playerX,
  playerY,
  playerFacing,
  outfit,
  hat,
  level,
  enabled,
}: UseMultiplayerOptions) {
  const [otherPlayers, setOtherPlayers] = useState<Map<string, OtherPlayer>>(new Map())
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [onlineCount, setOnlineCount] = useState(0)

  const channelRef = useRef<PresenceChannel | null>(null)
  const lastBroadcast = useRef(0)
  const staleTimerRef = useRef<NodeJS.Timeout | null>(null)
  const prevAreaRef = useRef<AreaId | null>(null)

  // Clean up stale players (not seen in 10s)
  const cleanStale = useCallback(() => {
    const now = Date.now()
    setOtherPlayers((prev) => {
      const next = new Map(prev)
      let changed = false
      for (const [id, player] of next) {
        if (now - player.lastSeen > 10_000) {
          next.delete(id)
          changed = true
        }
      }
      return changed ? next : prev
    })
  }, [])

  // Subscribe to area channel
  useEffect(() => {
    if (!enabled || !userId) return

    const pusher = getPusherClient(userId)
    const channelName = `presence-area-${currentArea}`

    // Unsubscribe from previous area
    if (prevAreaRef.current && prevAreaRef.current !== currentArea && channelRef.current) {
      pusher.unsubscribe(`presence-area-${prevAreaRef.current}`)
      channelRef.current = null
      setOtherPlayers(new Map())
      setChatMessages([])
    }
    prevAreaRef.current = currentArea

    const channel = pusher.subscribe(channelName) as PresenceChannel
    channelRef.current = channel

    // Presence events
    channel.bind("pusher:subscription_succeeded", (members: { count: number; each: (cb: (member: { id: string; info: Record<string, string> }) => void) => void }) => {
      setOnlineCount(members.count)
      // Add existing members
      members.each((member: { id: string; info: Record<string, string> }) => {
        if (member.id === userId) return
        setOtherPlayers((prev) => {
          const next = new Map(prev)
          next.set(member.id, {
            id: member.id,
            name: member.info.name || member.id,
            outfit: member.info.outfit || "default",
            hat: member.info.hat || "hat_none",
            level: member.info.level || "beginner",
            x: 5,
            y: 5,
            facing: "right",
            lastSeen: Date.now(),
          })
          return next
        })
      })
    })

    channel.bind("pusher:member_added", (member: { id: string; info: Record<string, string> }) => {
      setOnlineCount((c) => c + 1)
      if (member.id === userId) return
      setOtherPlayers((prev) => {
        const next = new Map(prev)
        next.set(member.id, {
          id: member.id,
          name: member.info.name || member.id,
          outfit: member.info.outfit || "default",
          hat: member.info.hat || "hat_none",
          level: member.info.level || "beginner",
          x: 5,
          y: 5,
          facing: "right",
          lastSeen: Date.now(),
        })
        return next
      })
    })

    channel.bind("pusher:member_removed", (member: { id: string }) => {
      setOnlineCount((c) => Math.max(0, c - 1))
      setOtherPlayers((prev) => {
        const next = new Map(prev)
        next.delete(member.id)
        return next
      })
    })

    // Client events — position updates
    channel.bind("client-position", (data: { id: string; x: number; y: number; facing: "left" | "right"; outfit: string; hat: string }) => {
      if (data.id === userId) return
      setOtherPlayers((prev) => {
        const next = new Map(prev)
        const existing = next.get(data.id)
        if (existing) {
          next.set(data.id, {
            ...existing,
            x: data.x,
            y: data.y,
            facing: data.facing,
            outfit: data.outfit,
            hat: data.hat,
            lastSeen: Date.now(),
          })
        }
        return next
      })
    })

    // Client events — chat messages
    channel.bind("client-chat", (data: { id: string; name: string; message: string }) => {
      if (data.id === userId) return
      const msg: ChatMessage = {
        id: `${data.id}-${Date.now()}`,
        senderId: data.id,
        senderName: data.name,
        message: data.message,
        timestamp: Date.now(),
      }
      setChatMessages((prev) => [...prev.slice(-49), msg])

      // Show as chat bubble on the player
      setOtherPlayers((prev) => {
        const next = new Map(prev)
        const existing = next.get(data.id)
        if (existing) {
          next.set(data.id, { ...existing, lastSeen: Date.now() })
        }
        return next
      })
    })

    // Stale cleanup timer
    staleTimerRef.current = setInterval(cleanStale, 5000)

    return () => {
      channel.unbind_all()
      pusher.unsubscribe(channelName)
      channelRef.current = null
      if (staleTimerRef.current) clearInterval(staleTimerRef.current)
    }
  }, [enabled, userId, currentArea, cleanStale])

  // Broadcast position (throttled 250ms)
  useEffect(() => {
    if (!enabled || !channelRef.current) return

    const now = Date.now()
    if (now - lastBroadcast.current < 250) return
    lastBroadcast.current = now

    const channel = channelRef.current
    try {
      channel.trigger("client-position", {
        id: userId,
        x: playerX,
        y: playerY,
        facing: playerFacing,
        outfit,
        hat,
      })
    } catch {
      // Channel may not be subscribed yet
    }
  }, [enabled, userId, playerX, playerY, playerFacing, outfit, hat])

  // Send chat message
  const sendChat = useCallback((message: string) => {
    if (!channelRef.current || !message.trim()) return
    try {
      channelRef.current.trigger("client-chat", {
        id: userId,
        name: playerName,
        message: message.trim(),
      })
      // Add own message to local list
      setChatMessages((prev) => [...prev.slice(-49), {
        id: `${userId}-${Date.now()}`,
        senderId: userId,
        senderName: playerName,
        message: message.trim(),
        timestamp: Date.now(),
      }])
    } catch {
      // ignore
    }
  }, [userId, playerName])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnectPusher()
    }
  }, [])

  return {
    otherPlayers: Array.from(otherPlayers.values()),
    chatMessages,
    onlineCount,
    sendChat,
  }
}
