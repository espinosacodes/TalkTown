"use client"

import { useState, useEffect, type CSSProperties } from "react"
import type { AnimalType } from "@/lib/game-state"

interface LoginCharacter {
  name: string
  role: string
  catchphrase: string
  animalType: AnimalType
  fur: string
  furDark: string
  body: string
  accent: string
  belly: string
  nose: string
}

const FEATURED_NPCS: LoginCharacter[] = [
  { name: "Rosa", role: "Posadera", catchphrase: "Ay, mi cielo... Bienvenido!", animalType: "cat", fur: "#F5C6AA", furDark: "#D4A088", body: "#DC143C", accent: "#FFD700", belly: "#FFF0E0", nose: "#FF9999" },
  { name: "Pedro", role: "Pescadero", catchphrase: "MIS PESCADOS SON LOS MEJORES!", animalType: "bear", fur: "#8B6914", furDark: "#6B4F0A", body: "#4682B4", accent: "#87CEEB", belly: "#C4A060", nose: "#3D2B1F" },
  { name: "Lola", role: "Frutera", catchphrase: "Ay, que lindo...", animalType: "fox", fur: "#FF8C42", furDark: "#CC6B2E", body: "#FF69B4", accent: "#98FB98", belly: "#FFE4C4", nose: "#2D2D2D" },
  { name: "Don Magnifico", role: "Alcalde", catchphrase: "Don Magnifico ha hablado!", animalType: "lion", fur: "#DAA520", furDark: "#B8860B", body: "#191970", accent: "#FFD700", belly: "#F5DEB3", nose: "#8B6914" },
  { name: "El Filosofo", role: "Panadero", catchphrase: "Como el pan...", animalType: "owl", fur: "#8B7355", furDark: "#6B5335", body: "#F5DEB3", accent: "#8B4513", belly: "#FFEFD5", nose: "#DAA520" },
  { name: "Memo", role: "Tendero", catchphrase: "E-este... bienvenido!", animalType: "rabbit", fur: "#E8DCC8", furDark: "#C4B8A4", body: "#6B8E23", accent: "#FFD700", belly: "#FFFFFF", nose: "#FFB6C1" },
]

function MiniSprite({ char, frame }: { char: LoginCharacter; frame: number }) {
  const isBlinking = frame === 2
  const bobOffset = frame % 2 === 0 ? 0 : -2
  const scale = 2.2

  return (
    <div style={{ transform: `scale(${scale})`, transformOrigin: "center bottom" }}>
      <div className="relative" style={{ transform: `translateY(${bobOffset}px)` }}>
        {/* Ears */}
        <MiniEars animalType={char.animalType} fur={char.fur} furDark={char.furDark} belly={char.belly} />

        {/* Mane for lion */}
        {char.animalType === "lion" && (
          <div className="absolute rounded-full" style={{ top: -4, left: -4, width: 35, height: 30, backgroundColor: char.furDark, zIndex: -1 }} />
        )}

        {/* Head */}
        <div className="w-7 h-7 rounded-full relative" style={{ backgroundColor: char.fur, border: "1px solid rgba(255,255,255,0.1)" }}>
          {/* Face patch */}
          <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-3 rounded-full" style={{ backgroundColor: char.belly }} />

          {/* Eyes */}
          {char.animalType === "owl" ? (
            <>
              <div className="absolute rounded-full" style={{ top: 5, left: 2, width: 9, height: 9, backgroundColor: "#FFD700", border: `1px solid ${char.furDark}` }}>
                {!isBlinking ? <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-black rounded-full" /> : <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-0.5 bg-black rounded" />}
              </div>
              <div className="absolute rounded-full" style={{ top: 5, right: 2, width: 9, height: 9, backgroundColor: "#FFD700", border: `1px solid ${char.furDark}` }}>
                {!isBlinking ? <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-black rounded-full" /> : <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-0.5 bg-black rounded" />}
              </div>
            </>
          ) : !isBlinking ? (
            <>
              <div className="absolute top-2 left-1 w-2 h-2 bg-white rounded-full">
                <div className="absolute w-1 h-1 bg-black rounded-full" style={{ left: "2px", top: "2px" }} />
              </div>
              <div className="absolute top-2 right-1 w-2 h-2 bg-white rounded-full">
                <div className="absolute w-1 h-1 bg-black rounded-full" style={{ right: "2px", top: "2px" }} />
              </div>
            </>
          ) : (
            <>
              <div className="absolute top-3 left-1 w-2 h-0.5 bg-gray-800 rounded" />
              <div className="absolute top-3 right-1 w-2 h-0.5 bg-gray-800 rounded" />
            </>
          )}

          {/* Nose */}
          {char.animalType === "owl" ? (
            <div className="absolute left-1/2 -translate-x-1/2" style={{ bottom: 3, width: 0, height: 0, borderLeft: "3px solid transparent", borderRight: "3px solid transparent", borderTop: `4px solid ${char.nose}` }} />
          ) : (
            <div className="absolute left-1/2 -translate-x-1/2 rounded-full" style={{ bottom: 2, width: 5, height: 3, backgroundColor: char.nose }} />
          )}
        </div>

        {/* Body */}
        <div className="w-6 h-4 mx-auto -mt-0.5 relative rounded-b-sm" style={{ backgroundColor: char.body, border: "1px solid rgba(255,255,255,0.1)" }}>
          <div className="w-full h-0.5 mt-1" style={{ backgroundColor: char.accent }} />
        </div>

        {/* Legs */}
        <div className="flex justify-center gap-0.5 -mt-0.5">
          <div className="w-2 h-2 rounded-b-sm" style={{ backgroundColor: char.furDark, transform: frame % 2 === 0 ? "rotate(-3deg)" : "rotate(3deg)" }} />
          <div className="w-2 h-2 rounded-b-sm" style={{ backgroundColor: char.furDark, transform: frame % 2 === 0 ? "rotate(3deg)" : "rotate(-3deg)" }} />
        </div>

        {/* Tail */}
        <MiniTail animalType={char.animalType} fur={char.fur} furDark={char.furDark} belly={char.belly} frame={frame} />
      </div>
    </div>
  )
}

function MiniEars({ animalType, fur, furDark, belly }: { animalType: AnimalType; fur: string; furDark: string; belly: string }) {
  switch (animalType) {
    case "cat":
    case "fox":
      return (
        <div className="absolute -top-2 left-0 flex justify-between w-7">
          <div style={{ width: 0, height: 0, borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderBottom: `8px solid ${fur}` }} />
          <div style={{ width: 0, height: 0, borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderBottom: `8px solid ${fur}` }} />
        </div>
      )
    case "bear":
    case "lion":
      return (
        <div className="absolute -top-2 -left-0.5 flex justify-between w-8">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: furDark }} />
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: furDark }} />
        </div>
      )
    case "rabbit":
      return (
        <div className="absolute -top-5 left-0.5 flex justify-between w-6">
          <div className="w-1.5 rounded-full" style={{ height: 12, backgroundColor: fur, border: `1px solid ${furDark}` }}>
            <div className="w-0.5 h-2 rounded-full mx-auto mt-0.5" style={{ backgroundColor: belly }} />
          </div>
          <div className="w-1.5 rounded-full" style={{ height: 12, backgroundColor: fur, border: `1px solid ${furDark}` }}>
            <div className="w-0.5 h-2 rounded-full mx-auto mt-0.5" style={{ backgroundColor: belly }} />
          </div>
        </div>
      )
    case "owl":
      return (
        <div className="absolute -top-2 left-0 flex justify-between w-7">
          <div style={{ width: 0, height: 0, borderLeft: "4px solid transparent", borderRight: "4px solid transparent", borderBottom: `6px solid ${furDark}` }} />
          <div style={{ width: 0, height: 0, borderLeft: "4px solid transparent", borderRight: "4px solid transparent", borderBottom: `6px solid ${furDark}` }} />
        </div>
      )
    default:
      return null
  }
}

function MiniTail({ animalType, fur, furDark, belly, frame }: { animalType: AnimalType; fur: string; furDark: string; belly: string; frame: number }) {
  const swish = frame % 2 === 0 ? -15 : 15
  switch (animalType) {
    case "cat":
      return <div className="absolute -right-2 top-5 w-4 h-1 rounded-full" style={{ backgroundColor: fur, transform: `rotate(${swish}deg)`, transformOrigin: "left center" }} />
    case "fox":
      return (
        <div className="absolute -right-3 top-4 w-5 h-2.5 rounded-full" style={{ backgroundColor: fur, transform: `rotate(${swish}deg)`, transformOrigin: "left center" }}>
          <div className="absolute right-0 top-0.5 w-2 h-1.5 rounded-full" style={{ backgroundColor: belly }} />
        </div>
      )
    case "lion":
      return (
        <div className="absolute -right-2 top-5 w-4 h-0.5 rounded-full" style={{ backgroundColor: furDark, transform: `rotate(${swish}deg)`, transformOrigin: "left center" }}>
          <div className="absolute -right-1 -top-0.5 w-2 h-1.5 rounded-full" style={{ backgroundColor: furDark }} />
        </div>
      )
    case "rabbit":
      return <div className="absolute -right-0.5 top-5 w-2 h-2 rounded-full" style={{ backgroundColor: belly }} />
    default:
      return null
  }
}

// Character positions around the form
const POSITIONS: { x: number; y: number; side: "left" | "right" }[] = [
  { x: 8, y: 25, side: "left" },
  { x: 85, y: 20, side: "right" },
  { x: 5, y: 55, side: "left" },
  { x: 88, y: 55, side: "right" },
  { x: 10, y: 80, side: "left" },
  { x: 82, y: 82, side: "right" },
]

interface LoginScreenProps {
  onLogin: (name: string) => void
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [nameInput, setNameInput] = useState("")
  const [frame, setFrame] = useState(0)
  const [activeBubble, setActiveBubble] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const animInterval = setInterval(() => setFrame((f) => (f + 1) % 4), 450)
    const bubbleInterval = setInterval(() => setActiveBubble((b) => (b + 1) % FEATURED_NPCS.length), 3000)
    return () => {
      clearInterval(animInterval)
      clearInterval(bubbleInterval)
    }
  }, [])

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: "linear-gradient(180deg, #1a0e05 0%, #2d1810 40%, #1a1a2e 100%)" }}>
      {/* Stars */}
      {mounted && Array.from({ length: 30 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: Math.random() > 0.7 ? 3 : 2,
            height: Math.random() > 0.7 ? 3 : 2,
            backgroundColor: "#FFF",
            opacity: 0.3 + Math.random() * 0.5,
            left: `${5 + (i * 31.7) % 90}%`,
            top: `${3 + (i * 17.3) % 35}%`,
            animation: `twinkle ${2 + (i % 3)}s ease-in-out infinite`,
            animationDelay: `${(i * 0.3) % 2}s`,
          }}
        />
      ))}

      {/* Ground */}
      <div className="absolute bottom-0 left-0 right-0 h-24" style={{ background: "linear-gradient(180deg, #2d5016 0%, #1a3a0a 100%)", borderTop: "3px solid #4a7c2e" }} />
      {/* Grass tufts */}
      <div className="absolute bottom-20 left-0 right-0 flex justify-around">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="w-3 h-4 rounded-t-full" style={{ backgroundColor: "#3d6b1e", opacity: 0.6, transform: `translateY(${i % 2 === 0 ? 0 : 4}px)` }} />
        ))}
      </div>

      {/* NPC Characters */}
      {FEATURED_NPCS.map((char, i) => {
        const pos = POSITIONS[i]
        const isActive = activeBubble === i
        return (
          <div
            key={char.name}
            className="absolute transition-all duration-700"
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              transform: `translate(-50%, -50%) ${pos.side === "left" ? "" : "scaleX(-1)"}`,
              zIndex: isActive ? 20 : 10,
            }}
          >
            {/* Speech bubble */}
            <div
              className="absolute -top-16 whitespace-nowrap transition-all duration-500"
              style={{
                left: "50%",
                transform: `translateX(-50%) ${pos.side === "left" ? "" : "scaleX(-1)"}`,
                opacity: isActive ? 1 : 0,
                pointerEvents: "none",
              }}
            >
              <div className="px-3 py-1.5 bg-white rounded-lg border-2 border-gray-300 relative" style={{ maxWidth: 200, whiteSpace: "normal" }}>
                <p className="text-black text-xs font-bold">{char.catchphrase}</p>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2" style={{ width: 0, height: 0, borderLeft: "6px solid transparent", borderRight: "6px solid transparent", borderTop: "8px solid white" }} />
              </div>
            </div>

            {/* Name tag */}
            <div
              className="absolute -top-5 left-1/2 whitespace-nowrap"
              style={{ transform: `translateX(-50%) ${pos.side === "left" ? "" : "scaleX(-1)"}` }}
            >
              <span className="text-amber-300 text-[10px] font-bold drop-shadow-md">{char.name}</span>
            </div>

            <MiniSprite char={char} frame={frame} />
          </div>
        )
      })}

      {/* Center content */}
      <div className="relative z-30 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Title */}
        <div className="text-center mb-8">
          <h1
            className="text-5xl md:text-6xl font-bold mb-2 tracking-wider"
            style={{
              color: "#FFD700",
              textShadow: "0 0 20px rgba(255,215,0,0.4), 0 2px 4px rgba(0,0,0,0.8)",
            }}
          >
            TalkTown
          </h1>
          <p className="text-amber-200/80 text-sm md:text-base tracking-wide">
            AI-Powered Language Learning RPG
          </p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <div className="h-px w-12 bg-amber-700/50" />
            <div className="w-2 h-2 rotate-45 border border-amber-600/50" />
            <div className="h-px w-12 bg-amber-700/50" />
          </div>
        </div>

        {/* Login card */}
        <div
          className="p-6 rounded-xl border backdrop-blur-sm w-full max-w-sm"
          style={{
            backgroundColor: "rgba(30, 15, 5, 0.85)",
            borderColor: "rgba(218, 165, 32, 0.3)",
            boxShadow: "0 0 40px rgba(218, 165, 32, 0.1), inset 0 1px 0 rgba(255,255,255,0.05)",
          }}
        >
          <p className="text-amber-100/70 text-center text-sm mb-4">
            Enter the town and practice languages with AI villagers
          </p>
          <form
            className="flex flex-col gap-3 items-center"
            onSubmit={(e) => {
              e.preventDefault()
              const name = nameInput.trim()
              if (!name) return
              onLogin(name)
            }}
          >
            <input
              type="text"
              placeholder="Enter your name"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-amber-950/60 text-amber-100 border border-amber-700/50 placeholder-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
              autoFocus
            />
            <button
              type="submit"
              className="w-full px-6 py-2.5 rounded-lg font-bold text-sm tracking-wide transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: "linear-gradient(180deg, #DAA520 0%, #B8860B 100%)",
                color: "#1a0e05",
                boxShadow: "0 2px 8px rgba(218, 165, 32, 0.3)",
              }}
            >
              Start Playing
            </button>
          </form>
        </div>

        <p className="text-amber-900/60 text-xs mt-6">
          Built at Zero to Agent: Cali
        </p>
      </div>

      {/* CSS animations */}
      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </div>
  )
}
