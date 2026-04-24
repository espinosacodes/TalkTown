"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import type { AreaId } from "@/lib/game-state"
import { NPC_PROFILES } from "@/lib/npc-profiles"
import { NPC_SCHEDULES, getScheduleForTime, type TimeOfDay, type NPCRuntimeState, type NPCActivity } from "@/lib/npc-schedules"
import { findPath } from "@/lib/npc-pathfinding"
import { RELATIONSHIPS } from "@/lib/npc-relationships"

export interface NPCInteraction {
  npcId1: string
  npcId2: string
  snippet: string
}

// Short Spanish speech snippets by relationship type
const CHAT_SNIPPETS: Record<string, string[]> = {
  friend: [
    "Que tal, amigo?",
    "Jaja, buena esa!",
    "Siempre es bueno verte.",
    "Tienes razon, como siempre.",
    "Me alegra que estes aqui.",
    "Que dia tan bonito!",
  ],
  rival: [
    "Hmph, yo lo hago mejor.",
    "Ja! Eso crees tu?",
    "No me hagas reir...",
    "Ya veremos quien gana.",
    "Pfff, lo dudo mucho.",
    "Sigue sonando!",
  ],
  family: [
    "Te quiero mucho.",
    "Como estas, mi cielo?",
    "Ten cuidado, por favor.",
    "Ya comiste hoy?",
    "Me recuerdas a tu padre.",
    "Siempre estare aqui.",
  ],
  crush: [
    "A-ah, hola...",
    "Te ves... bien hoy.",
    "N-no es que me importe...",
    "Quieres probar algo?",
    "Escribi algo para ti...",
    "Tu sonrisa es bonita...",
  ],
  mentor: [
    "Muy bien, sigue asi!",
    "Practica mas, tu puedes.",
    "Recuerda lo que te ensene.",
    "Tienes mucho potencial.",
    "No te rindas nunca.",
    "Estoy orgulloso de ti.",
  ],
  acquaintance: [
    "Buenos dias.",
    "Que tal todo?",
    "Hasta luego.",
    "Bonito dia, no?",
    "Nos vemos por ahi.",
    "Que te vaya bien.",
  ],
}

function getSnippet(relationship: string, tick: number): string {
  const snippets = CHAT_SNIPPETS[relationship] || CHAT_SNIPPETS.acquaintance
  return snippets[tick % snippets.length]
}

export function useNPCSimulation(currentArea: AreaId, timeOfDay: TimeOfDay) {
  const [npcStates, setNpcStates] = useState<Record<string, NPCRuntimeState>>({})
  const [interactions, setInteractions] = useState<NPCInteraction[]>([])
  const snippetTickRef = useRef(0)
  const initializedRef = useRef(false)
  const prevTimeRef = useRef<TimeOfDay>(timeOfDay)

  // Initialize all NPC states based on current time
  const initializeStates = useCallback((time: TimeOfDay) => {
    const states: Record<string, NPCRuntimeState> = {}
    for (const npc of NPC_PROFILES) {
      const schedule = getScheduleForTime(npc.id, time)
      if (schedule) {
        states[npc.id] = {
          currentArea: schedule.area,
          position: { ...schedule.position },
          activity: schedule.activity,
          activityLabel: schedule.activityLabel,
          path: [],
          facingDirection: "right",
        }
      } else {
        // No schedule — use static profile position
        states[npc.id] = {
          currentArea: npc.location,
          position: { ...npc.position },
          activity: "idle",
          activityLabel: "",
          path: [],
          facingDirection: "right",
        }
      }
    }
    return states
  }, [])

  // Initialize on mount
  useEffect(() => {
    if (!initializedRef.current) {
      setNpcStates(initializeStates(timeOfDay))
      initializedRef.current = true
    }
  }, [timeOfDay, initializeStates])

  // Handle time-of-day transitions
  useEffect(() => {
    if (!initializedRef.current) return
    if (prevTimeRef.current === timeOfDay) return
    prevTimeRef.current = timeOfDay

    setNpcStates((prev) => {
      const next = { ...prev }
      for (const npc of NPC_PROFILES) {
        const schedule = getScheduleForTime(npc.id, timeOfDay)
        if (!schedule) continue

        const prevState = prev[npc.id]
        if (!prevState) continue

        if (prevState.currentArea !== schedule.area) {
          // Different area → instant teleport
          next[npc.id] = {
            currentArea: schedule.area,
            position: { ...schedule.position },
            activity: schedule.activity,
            activityLabel: schedule.activityLabel,
            path: [],
            facingDirection: prevState.facingDirection,
          }
        } else if (
          prevState.position.x !== schedule.position.x ||
          prevState.position.y !== schedule.position.y
        ) {
          // Same area, different position → compute BFS path
          const path = findPath(schedule.area, prevState.position, schedule.position)
          if (path.length > 0) {
            next[npc.id] = {
              ...prevState,
              activity: "walking",
              activityLabel: "Caminando",
              path,
              facingDirection: path[0].x < prevState.position.x ? "left" : "right",
            }
          } else {
            // No path — teleport
            next[npc.id] = {
              ...prevState,
              position: { ...schedule.position },
              activity: schedule.activity,
              activityLabel: schedule.activityLabel,
              path: [],
            }
          }
        } else {
          // Same position, just update activity
          next[npc.id] = {
            ...prevState,
            activity: schedule.activity,
            activityLabel: schedule.activityLabel,
            path: [],
          }
        }
      }
      return next
    })
  }, [timeOfDay])

  // Movement tick — advance walking NPCs one tile every 400ms
  useEffect(() => {
    const interval = setInterval(() => {
      setNpcStates((prev) => {
        let changed = false
        const next = { ...prev }

        for (const npc of NPC_PROFILES) {
          const state = prev[npc.id]
          if (!state || state.activity !== "walking" || state.path.length === 0) continue

          changed = true
          const nextTile = state.path[0]
          const remainingPath = state.path.slice(1)

          // Determine facing direction from movement
          let facingDirection = state.facingDirection
          if (nextTile.x < state.position.x) facingDirection = "left"
          else if (nextTile.x > state.position.x) facingDirection = "right"

          if (remainingPath.length === 0) {
            // Path exhausted — switch to scheduled activity
            const schedule = getScheduleForTime(npc.id, prevTimeRef.current)
            next[npc.id] = {
              ...state,
              position: nextTile,
              activity: schedule?.activity || "idle",
              activityLabel: schedule?.activityLabel || "",
              path: [],
              facingDirection,
            }
          } else {
            next[npc.id] = {
              ...state,
              position: nextTile,
              path: remainingPath,
              facingDirection,
            }
          }
        }

        return changed ? next : prev
      })
    }, 400)

    return () => clearInterval(interval)
  }, [])

  // NPC-NPC interactions — detect pairs near each other every ~4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      snippetTickRef.current++

      setNpcStates((prevStates) => {
        // Compute interactions based on current states (read-only)
        const newInteractions: NPCInteraction[] = []

        // Get NPCs in the current area that are not walking
        const npcsHere = NPC_PROFILES.filter((npc) => {
          const state = prevStates[npc.id]
          return state && state.currentArea === currentArea && state.activity !== "walking"
        })

        for (let i = 0; i < npcsHere.length; i++) {
          for (let j = i + 1; j < npcsHere.length; j++) {
            const a = npcsHere[i]
            const b = npcsHere[j]
            const sa = prevStates[a.id]
            const sb = prevStates[b.id]

            const dx = Math.abs(sa.position.x - sb.position.x)
            const dy = Math.abs(sa.position.y - sb.position.y)

            if (dx <= 2 && dy <= 2) {
              // Check if they share a relationship
              const rel = RELATIONSHIPS.find(
                (r) =>
                  (r.npcId === a.id && r.targetNpcId === b.id) ||
                  (r.npcId === b.id && r.targetNpcId === a.id)
              )
              if (rel) {
                newInteractions.push({
                  npcId1: a.id,
                  npcId2: b.id,
                  snippet: getSnippet(rel.relationship, snippetTickRef.current),
                })
              }
            }
          }
        }

        setInteractions(newInteractions)
        return prevStates // No state change
      })
    }, 4000)

    return () => clearInterval(interval)
  }, [currentArea])

  // Get NPCs currently in the player's area with their runtime positions
  const getNPCsInCurrentArea = useCallback(() => {
    return NPC_PROFILES.filter((npc) => {
      const state = npcStates[npc.id]
      return state ? state.currentArea === currentArea : npc.location === currentArea
    }).map((npc) => {
      const state = npcStates[npc.id]
      return {
        ...npc,
        runtimePosition: state?.position || npc.position,
        activity: state?.activity || ("idle" as NPCActivity),
        activityLabel: state?.activityLabel || "",
        facingDirection: state?.facingDirection || ("right" as const),
      }
    })
  }, [npcStates, currentArea])

  // Get the interaction snippet for a specific NPC (if any)
  const getInteractionSnippet = useCallback(
    (npcId: string): string | undefined => {
      const interaction = interactions.find(
        (i) => i.npcId1 === npcId || i.npcId2 === npcId
      )
      return interaction?.snippet
    },
    [interactions]
  )

  return {
    npcStates,
    interactions,
    getNPCsInCurrentArea,
    getInteractionSnippet,
  }
}
