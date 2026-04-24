"use client"

import { useCallback, useRef, useState } from "react"
import { useGame } from "@/lib/game-context"

interface TouchControlsProps {
  disabled?: boolean
  onAction: () => void
  actionLabel: string
}

const BASE_SIZE = 140
const KNOB_SIZE = 56
const DEAD_ZONE = 15 // px – ignore tiny drags
const MOVE_THRESHOLD = 0.38 // normalised radius to fire a move (0-1)

export function TouchControls({ disabled, onAction, actionLabel }: TouchControlsProps) {
  const { movePlayer } = useGame()

  // Joystick visual state
  const [knobOffset, setKnobOffset] = useState({ x: 0, y: 0 })
  const [active, setActive] = useState(false)

  // Refs for repeat-move logic
  const baseRef = useRef<HTMLDivElement>(null)
  const centerRef = useRef({ x: 0, y: 0 })
  const lastDirRef = useRef<{ dx: number; dy: number } | null>(null)
  const repeatTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const intervalTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  const clearTimers = useCallback(() => {
    if (repeatTimer.current) { clearTimeout(repeatTimer.current); repeatTimer.current = null }
    if (intervalTimer.current) { clearInterval(intervalTimer.current); intervalTimer.current = null }
  }, [])

  const startRepeat = useCallback(
    (dx: number, dy: number) => {
      if (disabled) return
      // Only fire if direction actually changed
      if (lastDirRef.current?.dx === dx && lastDirRef.current?.dy === dy) return
      lastDirRef.current = { dx, dy }
      clearTimers()
      movePlayer(dx, dy)
      repeatTimer.current = setTimeout(() => {
        intervalTimer.current = setInterval(() => {
          movePlayer(dx, dy)
        }, 150)
      }, 200)
    },
    [disabled, movePlayer, clearTimers],
  )

  const stopRepeat = useCallback(() => {
    lastDirRef.current = null
    clearTimers()
  }, [clearTimers])

  /** Map a touch position to a 4-direction {dx,dy} or null when inside dead zone */
  const resolveDirection = useCallback(
    (touchX: number, touchY: number) => {
      const cx = centerRef.current.x
      const cy = centerRef.current.y
      const rawX = touchX - cx
      const rawY = touchY - cy
      const dist = Math.sqrt(rawX * rawX + rawY * rawY)
      const maxR = BASE_SIZE / 2

      // Clamp knob visual to base radius
      const clampedDist = Math.min(dist, maxR - KNOB_SIZE / 2)
      const angle = Math.atan2(rawY, rawX)
      setKnobOffset({
        x: Math.cos(angle) * clampedDist,
        y: Math.sin(angle) * clampedDist,
      })

      if (dist < DEAD_ZONE) return null

      // Convert angle to 4-direction: right=0, down=π/2, left=±π, up=-π/2
      const deg = ((angle * 180) / Math.PI + 360) % 360
      if (deg >= 315 || deg < 45) return { dx: 1, dy: 0 }
      if (deg >= 45 && deg < 135) return { dx: 0, dy: 1 }
      if (deg >= 135 && deg < 225) return { dx: -1, dy: 0 }
      return { dx: 0, dy: -1 }
    },
    [],
  )

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault()
      if (!baseRef.current) return
      const rect = baseRef.current.getBoundingClientRect()
      centerRef.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
      setActive(true)

      const t = e.touches[0]
      const dir = resolveDirection(t.clientX, t.clientY)
      if (dir) startRepeat(dir.dx, dir.dy)
    },
    [resolveDirection, startRepeat],
  )

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault()
      const t = e.touches[0]
      const dir = resolveDirection(t.clientX, t.clientY)
      if (dir) {
        startRepeat(dir.dx, dir.dy)
      } else {
        stopRepeat()
      }
    },
    [resolveDirection, startRepeat, stopRepeat],
  )

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault()
      setKnobOffset({ x: 0, y: 0 })
      setActive(false)
      stopRepeat()
    },
    [stopRepeat],
  )

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none"
      style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
    >
      <div className="flex items-end justify-between px-4 pb-2">
        {/* Joystick */}
        <div
          ref={baseRef}
          className="pointer-events-auto relative select-none rounded-full"
          style={{
            width: BASE_SIZE,
            height: BASE_SIZE,
            background: active
              ? "radial-gradient(circle, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)"
              : "radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)",
            border: "2px solid rgba(255,255,255,0.15)",
          }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onTouchCancel={onTouchEnd}
          aria-label="Joystick"
        >
          {/* Direction indicators */}
          <DirectionIndicators />

          {/* Knob */}
          <div
            className="absolute rounded-full"
            style={{
              width: KNOB_SIZE,
              height: KNOB_SIZE,
              top: "50%",
              left: "50%",
              transform: `translate(calc(-50% + ${knobOffset.x}px), calc(-50% + ${knobOffset.y}px))`,
              background: active
                ? "radial-gradient(circle, rgba(250,204,21,0.5) 0%, rgba(250,204,21,0.2) 100%)"
                : "radial-gradient(circle, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.1) 100%)",
              border: active ? "2px solid rgba(250,204,21,0.6)" : "2px solid rgba(255,255,255,0.25)",
              transition: active ? "none" : "transform 0.15s ease-out, background 0.15s, border 0.15s",
            }}
          />
        </div>

        {/* Action button */}
        <button
          className="pointer-events-auto w-16 h-16 rounded-full bg-yellow-400/20 active:bg-yellow-400/40 border-2 border-yellow-400/50 flex items-center justify-center select-none"
          onTouchStart={(e) => {
            e.preventDefault()
            onAction()
          }}
          aria-label={actionLabel}
        >
          <span className="font-pixel text-yellow-400 text-[8px]">{actionLabel}</span>
        </button>
      </div>
    </div>
  )
}

/** Subtle arrow hints on the joystick base */
function DirectionIndicators() {
  const arrows = [
    { d: "M70 18l-5-6-5 6", label: "up" },    // top
    { d: "M70 122l-5 6-5-6", label: "down" },  // bottom
    { d: "M18 70l-6-5 6-5", label: "left" },   // left
    { d: "M122 70l6-5-6-5", label: "right" },  // right
  ]

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      width={BASE_SIZE}
      height={BASE_SIZE}
      viewBox={`0 0 ${BASE_SIZE} ${BASE_SIZE}`}
      fill="none"
    >
      {arrows.map(({ d, label }) => (
        <path
          key={label}
          d={d}
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  )
}
