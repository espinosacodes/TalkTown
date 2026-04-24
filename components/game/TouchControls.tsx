"use client"

import { useCallback, useRef } from "react"
import { useGame } from "@/lib/game-context"

interface TouchControlsProps {
  disabled?: boolean
  onAction: () => void
  actionLabel: string
}

export function TouchControls({ disabled, onAction, actionLabel }: TouchControlsProps) {
  const { movePlayer } = useGame()
  const repeatTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const intervalTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  const clearTimers = useCallback(() => {
    if (repeatTimer.current) {
      clearTimeout(repeatTimer.current)
      repeatTimer.current = null
    }
    if (intervalTimer.current) {
      clearInterval(intervalTimer.current)
      intervalTimer.current = null
    }
  }, [])

  const handleDirStart = useCallback(
    (dx: number, dy: number) => {
      if (disabled) return
      movePlayer(dx, dy)
      clearTimers()
      repeatTimer.current = setTimeout(() => {
        intervalTimer.current = setInterval(() => {
          movePlayer(dx, dy)
        }, 150)
      }, 200)
    },
    [disabled, movePlayer, clearTimers],
  )

  const handleDirEnd = useCallback(() => {
    clearTimers()
  }, [clearTimers])

  const preventAndMove = useCallback(
    (dx: number, dy: number) => (e: React.TouchEvent) => {
      e.preventDefault()
      handleDirStart(dx, dy)
    },
    [handleDirStart],
  )

  const preventTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault()
      handleDirEnd()
    },
    [handleDirEnd],
  )

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none"
      style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
    >
      <div className="flex items-end justify-between px-4 pb-2">
        {/* D-Pad */}
        <div className="pointer-events-auto grid grid-cols-3 grid-rows-3 gap-0 select-none" style={{ width: 168, height: 168 }}>
          {/* Row 1 */}
          <div />
          <button
            className="flex items-center justify-center bg-white/10 active:bg-white/25 border border-white/20 rounded-t-lg"
            style={{ width: 56, height: 56 }}
            onTouchStart={preventAndMove(0, -1)}
            onTouchEnd={preventTouchEnd}
            onTouchCancel={preventTouchEnd}
            aria-label="Move up"
          >
            <Arrow direction="up" />
          </button>
          <div />

          {/* Row 2 */}
          <button
            className="flex items-center justify-center bg-white/10 active:bg-white/25 border border-white/20 rounded-l-lg"
            style={{ width: 56, height: 56 }}
            onTouchStart={preventAndMove(-1, 0)}
            onTouchEnd={preventTouchEnd}
            onTouchCancel={preventTouchEnd}
            aria-label="Move left"
          >
            <Arrow direction="left" />
          </button>
          <div className="bg-white/5 border border-white/10" style={{ width: 56, height: 56 }} />
          <button
            className="flex items-center justify-center bg-white/10 active:bg-white/25 border border-white/20 rounded-r-lg"
            style={{ width: 56, height: 56 }}
            onTouchStart={preventAndMove(1, 0)}
            onTouchEnd={preventTouchEnd}
            onTouchCancel={preventTouchEnd}
            aria-label="Move right"
          >
            <Arrow direction="right" />
          </button>

          {/* Row 3 */}
          <div />
          <button
            className="flex items-center justify-center bg-white/10 active:bg-white/25 border border-white/20 rounded-b-lg"
            style={{ width: 56, height: 56 }}
            onTouchStart={preventAndMove(0, 1)}
            onTouchEnd={preventTouchEnd}
            onTouchCancel={preventTouchEnd}
            aria-label="Move down"
          >
            <Arrow direction="down" />
          </button>
          <div />
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

function Arrow({ direction }: { direction: "up" | "down" | "left" | "right" }) {
  const rotation = {
    up: "rotate(-90deg)",
    down: "rotate(90deg)",
    left: "rotate(180deg)",
    right: "rotate(0deg)",
  }[direction]

  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      style={{ transform: rotation }}
    >
      <path d="M7 4l6 6-6 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
