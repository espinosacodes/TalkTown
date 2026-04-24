"use client"

import { useState, useEffect } from "react"
import type { NPCProfile, LearningDirection, AnimalType } from "@/lib/game-state"
import type { NPCActivity } from "@/lib/npc-schedules"

interface NPCSpriteProps {
  npc: NPCProfile
  language: LearningDirection
  tileSize: number
  onClick: () => void
  isHighlighted: boolean
  position?: { x: number; y: number }
  activity?: NPCActivity
  activityLabel?: string
  facingDirection?: "left" | "right"
  interactionSnippet?: string
}

export function NPCSprite({ npc, language, tileSize, onClick, isHighlighted, position, activity, activityLabel, facingDirection = "right", interactionSnippet }: NPCSpriteProps) {
  const [frame, setFrame] = useState(0)
  const colors = npc.spriteColors
  const isWalking = activity === "walking"

  // Use runtime position if provided, otherwise fall back to profile position
  const renderPosition = position || npc.position

  // Idle animation - different animals have different rhythms
  // Walking NPCs animate faster
  useEffect(() => {
    const speeds: Record<AnimalType, number> = {
      cat: 400, bear: 500, fox: 350, owl: 600,
      lion: 450, rabbit: 300, turtle: 800, tanuki: 500,
      deer: 420, wolf: 380, frog: 300, otter: 350,
      crane: 550, dog: 380, monkey: 320, horse: 450,
      pig: 480, penguin: 500, mouse: 300,
    }
    const speed = isWalking ? 150 : (speeds[colors.animalType] || 400)
    const interval = setInterval(() => {
      setFrame((f) => (f + 1) % 4)
    }, speed)
    return () => clearInterval(interval)
  }, [colors.animalType, isWalking])

  const isBlinking = frame === 2
  const bobOffset = isWalking ? (frame % 2 === 0 ? -2 : 0) : (frame % 2 === 0 ? 0 : -1)

  return (
    <div
      className="absolute transition-all duration-300 ease-out cursor-pointer z-10"
      style={{
        left: renderPosition.x * tileSize,
        top: renderPosition.y * tileSize,
        width: tileSize,
        height: tileSize,
      }}
      onClick={onClick}
    >
      {/* Highlight glow when interactable */}
      {isHighlighted && (
        <div
          className="absolute inset-0 rounded-sm animate-pulse"
          style={{
            boxShadow: "0 0 12px rgba(255,255,0,0.4), inset 0 0 8px rgba(255,255,0,0.1)",
            border: "2px solid rgba(255,255,0,0.5)",
          }}
        />
      )}

      {/* Animal character */}
      <div
        className="relative w-full h-full flex items-center justify-center"
        style={{ transform: facingDirection === "left" ? "scaleX(-1)" : undefined }}
      >
        {/* Shadow */}
        <div className="absolute bottom-0.5 w-6 h-1.5 bg-black/40 rounded-full" />

        <div
          className="relative"
          style={{ transform: `translateY(${bobOffset}px)` }}
        >
          {/* Ears */}
          {renderEars(colors.animalType, colors.fur, colors.furDark, colors.belly, frame)}

          {/* Mane for lion */}
          {colors.animalType === "lion" && (
            <div
              className="absolute rounded-full -z-10"
              style={{
                top: -4,
                left: -4,
                width: 35,
                height: 30,
                backgroundColor: colors.furDark,
              }}
            />
          )}

          {/* Head */}
          <div
            className="w-7 h-7 rounded-full relative"
            style={{ backgroundColor: colors.fur, border: "1px solid rgba(255,255,255,0.1)" }}
          >
            {/* Face patch / belly */}
            <div
              className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-3 rounded-full"
              style={{ backgroundColor: colors.belly }}
            />

            {/* Eyes */}
            {colors.animalType === "owl" ? (
              // Owl - large round eyes
              <>
                <div
                  className="absolute rounded-full"
                  style={{
                    top: 5, left: 2, width: 9, height: 9,
                    backgroundColor: "#FFD700",
                    border: `1px solid ${colors.furDark}`,
                  }}
                >
                  {!isBlinking && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-black rounded-full" />
                  )}
                  {isBlinking && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-0.5 bg-black rounded" />
                  )}
                </div>
                <div
                  className="absolute rounded-full"
                  style={{
                    top: 5, right: 2, width: 9, height: 9,
                    backgroundColor: "#FFD700",
                    border: `1px solid ${colors.furDark}`,
                  }}
                >
                  {!isBlinking && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-black rounded-full" />
                  )}
                  {isBlinking && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-0.5 bg-black rounded" />
                  )}
                </div>
              </>
            ) : !isBlinking ? (
              // Normal eyes
              <>
                <div className="absolute top-2 left-1 w-2 h-2 bg-white rounded-full">
                  <div
                    className="absolute w-1 h-1 bg-black rounded-full transition-all"
                    style={{
                      left: frame === 1 ? "0px" : frame === 3 ? "4px" : "2px",
                      top: "2px",
                    }}
                  />
                </div>
                <div className="absolute top-2 right-1 w-2 h-2 bg-white rounded-full">
                  <div
                    className="absolute w-1 h-1 bg-black rounded-full transition-all"
                    style={{
                      right: frame === 1 ? "0px" : frame === 3 ? "4px" : "2px",
                      top: "2px",
                    }}
                  />
                </div>
              </>
            ) : (
              // Blinking
              <>
                <div className="absolute top-3 left-1 w-2 h-0.5 bg-gray-800 rounded" />
                <div className="absolute top-3 right-1 w-2 h-0.5 bg-gray-800 rounded" />
              </>
            )}

            {/* Nose/snout */}
            {colors.animalType === "owl" ? (
              // Owl beak - downward triangle
              <div
                className="absolute left-1/2 -translate-x-1/2"
                style={{
                  bottom: 3,
                  width: 0,
                  height: 0,
                  borderLeft: "3px solid transparent",
                  borderRight: "3px solid transparent",
                  borderTop: `4px solid ${colors.nose}`,
                }}
              />
            ) : (
              // Animal snout
              <div
                className="absolute left-1/2 -translate-x-1/2 rounded-full"
                style={{
                  bottom: 2,
                  width: 5,
                  height: 3,
                  backgroundColor: colors.nose,
                }}
              />
            )}

            {/* Tanuki mask markings */}
            {colors.animalType === "tanuki" && (
              <>
                <div
                  className="absolute rounded-full"
                  style={{ top: 4, left: 0, width: 10, height: 7, backgroundColor: colors.furDark, opacity: 0.5 }}
                />
                <div
                  className="absolute rounded-full"
                  style={{ top: 4, right: 0, width: 10, height: 7, backgroundColor: colors.furDark, opacity: 0.5 }}
                />
                {/* Re-render eyes over mask */}
                {!isBlinking ? (
                  <>
                    <div className="absolute top-2 left-1 w-2 h-2 bg-white rounded-full z-10">
                      <div className="absolute w-1 h-1 bg-black rounded-full" style={{ left: "2px", top: "2px" }} />
                    </div>
                    <div className="absolute top-2 right-1 w-2 h-2 bg-white rounded-full z-10">
                      <div className="absolute w-1 h-1 bg-black rounded-full" style={{ right: "2px", top: "2px" }} />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="absolute top-3 left-1 w-2 h-0.5 bg-gray-800 rounded z-10" />
                    <div className="absolute top-3 right-1 w-2 h-0.5 bg-gray-800 rounded z-10" />
                  </>
                )}
                {/* Leaf on head */}
                <div
                  className="absolute -top-2 left-1/2 -translate-x-1/2 z-20"
                  style={{
                    width: 8,
                    height: 5,
                    backgroundColor: "#228B22",
                    borderRadius: "50% 50% 50% 0",
                    transform: "translateX(-50%) rotate(15deg)",
                  }}
                />
              </>
            )}
          </div>

          {/* Body with clothing */}
          <div
            className="w-6 h-4 mx-auto -mt-0.5 relative rounded-b-sm"
            style={{ backgroundColor: colors.body, border: "1px solid rgba(255,255,255,0.1)" }}
          >
            {/* Accent decoration */}
            <div
              className="w-full h-0.5 mt-1"
              style={{ backgroundColor: colors.accent }}
            />
            {/* Turtle shell */}
            {colors.animalType === "turtle" && (
              <div
                className="absolute -top-1 left-1/2 -translate-x-1/2 rounded-full z-[-1]"
                style={{
                  width: 20,
                  height: 14,
                  backgroundColor: "#5B7B3B",
                  border: "1px solid #4A6B2A",
                }}
              >
                {/* Shell pattern lines */}
                <div className="absolute top-1/2 left-0 right-0 h-px" style={{ backgroundColor: "#4A6B2A" }} />
                <div className="absolute top-0 bottom-0 left-1/3 w-px" style={{ backgroundColor: "#4A6B2A" }} />
                <div className="absolute top-0 bottom-0 right-1/3 w-px" style={{ backgroundColor: "#4A6B2A" }} />
              </div>
            )}
          </div>

          {/* Legs */}
          <div className="flex justify-center gap-0.5 -mt-0.5">
            <div
              className="w-2 h-2 rounded-b-sm"
              style={{
                backgroundColor: colors.furDark,
                transform: frame % 2 === 0 ? "rotate(-3deg)" : "rotate(3deg)",
              }}
            />
            <div
              className="w-2 h-2 rounded-b-sm"
              style={{
                backgroundColor: colors.furDark,
                transform: frame % 2 === 0 ? "rotate(3deg)" : "rotate(-3deg)",
              }}
            />
          </div>

          {/* Tail */}
          {renderTail(colors.animalType, colors.fur, colors.furDark, colors.belly, frame)}
        </div>
      </div>

      {/* Name tag when highlighted */}
      {isHighlighted && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <div className="px-2 py-1 bg-black border border-white text-center">
            <div className="text-white font-pixel text-[8px]">
              * {npc.name.es}
            </div>
            <div className="text-gray-500 font-pixel text-[6px]">
              {npc.role.es}
            </div>
          </div>
          <div className="text-center text-yellow-400 font-pixel text-[8px] mt-0.5 animate-bounce">
            [SPACE]
          </div>
        </div>
      )}

      {/* Speech bubble indicator when nearby */}
      {isHighlighted && (
        <div className="absolute -top-2 -right-1">
          <div className="w-2.5 h-2.5 bg-white rounded-full flex items-center justify-center animate-pulse">
            <div className="w-1 h-1 bg-black rounded-full" />
          </div>
        </div>
      )}

      {/* Activity label (shown when not highlighted and has a label) */}
      {!isHighlighted && activityLabel && (
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none">
          <div className="px-1.5 py-0.5 bg-black/80 border border-white/20 rounded-sm">
            <span className="text-gray-300 font-pixel text-[6px]">{activityLabel}</span>
          </div>
        </div>
      )}

      {/* NPC-NPC interaction speech bubble */}
      {interactionSnippet && !isHighlighted && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none z-20">
          <div className="px-2 py-1 bg-white border border-gray-300 rounded-md relative">
            <span className="text-black font-pixel text-[7px]">{interactionSnippet}</span>
            {/* Pointer triangle */}
            <div
              className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0"
              style={{
                borderLeft: "4px solid transparent",
                borderRight: "4px solid transparent",
                borderTop: "4px solid white",
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function renderEars(animalType: AnimalType, fur: string, furDark: string, belly: string, frame: number) {
  switch (animalType) {
    case "cat":
    case "fox":
      return (
        <div className="absolute -top-2 left-0 flex justify-between w-7">
          <div
            className="w-0 h-0"
            style={{
              borderLeft: "5px solid transparent",
              borderRight: "5px solid transparent",
              borderBottom: `8px solid ${fur}`,
            }}
          />
          <div
            className="w-0 h-0"
            style={{
              borderLeft: "5px solid transparent",
              borderRight: "5px solid transparent",
              borderBottom: `8px solid ${fur}`,
            }}
          />
        </div>
      )
    case "tanuki":
      return (
        <div className="absolute -top-1 left-0 flex justify-between w-7">
          <div className="w-2 h-1.5 rounded-t-full" style={{ backgroundColor: fur }} />
          <div className="w-2 h-1.5 rounded-t-full" style={{ backgroundColor: fur }} />
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
        <div
          className="absolute -top-5 left-0.5 flex justify-between w-6"
          style={{ animation: frame === 1 ? "none" : undefined }}
        >
          <div
            className={`w-1.5 rounded-full ${frame === 1 ? "ear-twitch" : ""}`}
            style={{ height: 12, backgroundColor: fur, border: `1px solid ${furDark}` }}
          >
            <div className="w-0.5 h-2 rounded-full mx-auto mt-0.5" style={{ backgroundColor: belly }} />
          </div>
          <div
            className={`w-1.5 rounded-full ${frame === 1 ? "ear-twitch" : ""}`}
            style={{ height: 12, backgroundColor: fur, border: `1px solid ${furDark}`, animationDelay: "0.1s" }}
          >
            <div className="w-0.5 h-2 rounded-full mx-auto mt-0.5" style={{ backgroundColor: belly }} />
          </div>
        </div>
      )
    case "owl":
      return (
        <div className="absolute -top-2 left-0 flex justify-between w-7">
          <div
            className="w-0 h-0"
            style={{
              borderLeft: "4px solid transparent",
              borderRight: "4px solid transparent",
              borderBottom: `6px solid ${furDark}`,
            }}
          />
          <div
            className="w-0 h-0"
            style={{
              borderLeft: "4px solid transparent",
              borderRight: "4px solid transparent",
              borderBottom: `6px solid ${furDark}`,
            }}
          />
        </div>
      )
    case "deer":
      // Tall pointed ears
      return (
        <div className="absolute -top-3 left-0 flex justify-between w-7">
          <div
            className="w-0 h-0"
            style={{
              borderLeft: "4px solid transparent",
              borderRight: "4px solid transparent",
              borderBottom: `10px solid ${fur}`,
            }}
          />
          <div
            className="w-0 h-0"
            style={{
              borderLeft: "4px solid transparent",
              borderRight: "4px solid transparent",
              borderBottom: `10px solid ${fur}`,
            }}
          />
        </div>
      )
    case "wolf":
      // Medium pointed ears
      return (
        <div className="absolute -top-2 left-0 flex justify-between w-7">
          <div
            className="w-0 h-0"
            style={{
              borderLeft: "4px solid transparent",
              borderRight: "4px solid transparent",
              borderBottom: `7px solid ${fur}`,
            }}
          />
          <div
            className="w-0 h-0"
            style={{
              borderLeft: "4px solid transparent",
              borderRight: "4px solid transparent",
              borderBottom: `7px solid ${fur}`,
            }}
          />
        </div>
      )
    case "dog":
      // Floppy round ears
      return (
        <div className="absolute -top-1 -left-0.5 flex justify-between w-8">
          <div className="w-2.5 h-3 rounded-b-full" style={{ backgroundColor: furDark, transform: "rotate(-10deg)" }} />
          <div className="w-2.5 h-3 rounded-b-full" style={{ backgroundColor: furDark, transform: "rotate(10deg)" }} />
        </div>
      )
    case "monkey":
      // Round ears sticking out
      return (
        <div className="absolute -top-1 -left-1 flex justify-between w-9">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: fur, border: `1px solid ${furDark}` }}>
            <div className="w-1.5 h-1.5 rounded-full mx-auto mt-0.5" style={{ backgroundColor: belly }} />
          </div>
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: fur, border: `1px solid ${furDark}` }}>
            <div className="w-1.5 h-1.5 rounded-full mx-auto mt-0.5" style={{ backgroundColor: belly }} />
          </div>
        </div>
      )
    case "pig":
      // Small floppy ears
      return (
        <div className="absolute -top-1 left-0 flex justify-between w-7">
          <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: furDark, transform: "rotate(-15deg)" }} />
          <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: furDark, transform: "rotate(15deg)" }} />
        </div>
      )
    case "horse":
      // Tall upright ears
      return (
        <div className="absolute -top-2 left-0.5 flex justify-between w-6">
          <div className="w-1.5 h-3 rounded-t-full" style={{ backgroundColor: fur, border: `1px solid ${furDark}` }} />
          <div className="w-1.5 h-3 rounded-t-full" style={{ backgroundColor: fur, border: `1px solid ${furDark}` }} />
        </div>
      )
    case "otter":
      // Small round ears
      return (
        <div className="absolute -top-1 left-0 flex justify-between w-7">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: furDark }} />
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: furDark }} />
        </div>
      )
    case "mouse":
      // Large round ears
      return (
        <div className="absolute -top-2 -left-0.5 flex justify-between w-8">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: fur, border: `1px solid ${furDark}` }}>
            <div className="w-1.5 h-1.5 rounded-full mx-auto mt-0.5" style={{ backgroundColor: belly }} />
          </div>
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: fur, border: `1px solid ${furDark}` }}>
            <div className="w-1.5 h-1.5 rounded-full mx-auto mt-0.5" style={{ backgroundColor: belly }} />
          </div>
        </div>
      )
    case "turtle":
    case "frog":
    case "penguin":
    case "crane":
      return null
    default:
      return null
  }
}

function renderTail(animalType: AnimalType, fur: string, furDark: string, belly: string, frame: number) {
  const swish = frame % 2 === 0 ? -15 : 15

  switch (animalType) {
    case "cat":
      return (
        <div
          className="absolute -right-2 top-5 w-4 h-1 rounded-full transition-transform tail-swish"
          style={{
            backgroundColor: fur,
            transform: `rotate(${swish}deg)`,
            transformOrigin: "left center",
          }}
        />
      )
    case "fox":
      return (
        <div
          className="absolute -right-3 top-4 w-5 h-2.5 rounded-full transition-transform tail-swish"
          style={{
            backgroundColor: fur,
            transform: `rotate(${swish}deg)`,
            transformOrigin: "left center",
          }}
        >
          <div
            className="absolute right-0 top-0.5 w-2 h-1.5 rounded-full"
            style={{ backgroundColor: belly }}
          />
        </div>
      )
    case "lion":
      return (
        <div
          className="absolute -right-2 top-5 w-4 h-0.5 rounded-full transition-transform tail-swish"
          style={{
            backgroundColor: furDark,
            transform: `rotate(${swish}deg)`,
            transformOrigin: "left center",
          }}
        >
          <div
            className="absolute -right-1 -top-0.5 w-2 h-1.5 rounded-full"
            style={{ backgroundColor: furDark }}
          />
        </div>
      )
    case "tanuki":
      return (
        <div
          className="absolute -right-2 top-4 w-4 h-2 rounded-full transition-transform tail-swish"
          style={{
            backgroundColor: fur,
            transform: `rotate(${swish}deg)`,
            transformOrigin: "left center",
          }}
        >
          {/* Ring markings */}
          <div className="absolute top-0.5 left-1 w-0.5 h-1 rounded-full" style={{ backgroundColor: furDark }} />
          <div className="absolute top-0.5 left-2.5 w-0.5 h-1 rounded-full" style={{ backgroundColor: furDark }} />
        </div>
      )
    case "rabbit":
      return (
        <div
          className="absolute -right-0.5 top-5 w-2 h-2 rounded-full"
          style={{ backgroundColor: belly }}
        />
      )
    case "wolf":
      // Bushy tail
      return (
        <div
          className="absolute -right-3 top-4 w-5 h-2.5 rounded-full transition-transform tail-swish"
          style={{
            backgroundColor: fur,
            transform: `rotate(${swish}deg)`,
            transformOrigin: "left center",
          }}
        >
          <div
            className="absolute right-0 top-0 w-2 h-2.5 rounded-full"
            style={{ backgroundColor: furDark }}
          />
        </div>
      )
    case "dog":
      // Curved up tail
      return (
        <div
          className="absolute -right-2 top-4 w-3 h-1.5 rounded-full transition-transform tail-swish"
          style={{
            backgroundColor: fur,
            transform: `rotate(${swish - 20}deg)`,
            transformOrigin: "left center",
          }}
        />
      )
    case "horse":
      // Long tail
      return (
        <div
          className="absolute -right-2 top-5 w-1 h-4 rounded-b-full transition-transform tail-swish"
          style={{
            backgroundColor: furDark,
            transform: `rotate(${swish}deg)`,
            transformOrigin: "top center",
          }}
        />
      )
    case "monkey":
      // Curled tail
      return (
        <div
          className="absolute -right-3 top-4 w-4 h-1 rounded-full transition-transform tail-swish"
          style={{
            backgroundColor: furDark,
            transform: `rotate(${swish + 30}deg)`,
            transformOrigin: "left center",
            borderRadius: "50%",
          }}
        />
      )
    case "pig":
      // Curly small tail
      return (
        <div
          className="absolute -right-1 top-5 w-2 h-2 rounded-full"
          style={{
            border: `1.5px solid ${furDark}`,
            borderRight: "none",
            borderBottom: "none",
          }}
        />
      )
    case "deer":
      // Short tail
      return (
        <div
          className="absolute -right-1 top-5 w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: belly }}
        />
      )
    case "mouse":
      // Thin long tail
      return (
        <div
          className="absolute -right-3 top-6 w-4 h-0.5 rounded-full transition-transform tail-swish"
          style={{
            backgroundColor: furDark,
            transform: `rotate(${swish}deg)`,
            transformOrigin: "left center",
          }}
        />
      )
    case "bear":
    case "owl":
    case "turtle":
    case "frog":
    case "crane":
    case "penguin":
    case "otter":
      return null
    default:
      return null
  }
}
