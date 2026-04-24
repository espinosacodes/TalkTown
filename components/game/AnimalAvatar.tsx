"use client"

import type { AnimalType } from "@/lib/game-state"

interface AnimalAvatarProps {
  animalType: AnimalType
  fur: string
  furDark: string
  belly: string
  nose: string
  accent: string
  body: string
  size?: "sm" | "md"
}

export function AnimalAvatar({ animalType, fur, furDark, belly, nose, accent, body, size = "sm" }: AnimalAvatarProps) {
  const s = size === "md" ? 1.5 : 1

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Ears */}
      {renderEars(animalType, fur, furDark, belly, s)}

      {/* Head */}
      <div
        className="relative rounded-full"
        style={{
          width: `${24 * s}px`,
          height: `${animalType === "owl" ? 22 * s : 20 * s}px`,
          backgroundColor: fur,
        }}
      >
        {/* Belly / face patch */}
        <div
          className="absolute rounded-full"
          style={{
            bottom: `${1 * s}px`,
            left: "50%",
            transform: "translateX(-50%)",
            width: `${16 * s}px`,
            height: `${12 * s}px`,
            backgroundColor: belly,
          }}
        />

        {/* Eyes */}
        {animalType === "owl" ? (
          <>
            <div className="absolute rounded-full" style={{ top: `${5 * s}px`, left: `${3 * s}px`, width: `${7 * s}px`, height: `${7 * s}px`, backgroundColor: "#FFD700", border: `${s}px solid ${furDark}` }}>
              <div className="absolute rounded-full bg-black" style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: `${3 * s}px`, height: `${3 * s}px` }} />
            </div>
            <div className="absolute rounded-full" style={{ top: `${5 * s}px`, right: `${3 * s}px`, width: `${7 * s}px`, height: `${7 * s}px`, backgroundColor: "#FFD700", border: `${s}px solid ${furDark}` }}>
              <div className="absolute rounded-full bg-black" style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: `${3 * s}px`, height: `${3 * s}px` }} />
            </div>
          </>
        ) : (
          <>
            <div className="absolute rounded-full bg-white" style={{ top: `${6 * s}px`, left: `${4 * s}px`, width: `${5 * s}px`, height: `${5 * s}px` }}>
              <div className="absolute rounded-full bg-black" style={{ top: `${1.5 * s}px`, left: `${1.5 * s}px`, width: `${2.5 * s}px`, height: `${2.5 * s}px` }} />
            </div>
            <div className="absolute rounded-full bg-white" style={{ top: `${6 * s}px`, right: `${4 * s}px`, width: `${5 * s}px`, height: `${5 * s}px` }}>
              <div className="absolute rounded-full bg-black" style={{ top: `${1.5 * s}px`, right: `${1.5 * s}px`, width: `${2.5 * s}px`, height: `${2.5 * s}px` }} />
            </div>
          </>
        )}

        {/* Nose/snout */}
        {animalType === "owl" ? (
          <div
            className="absolute"
            style={{
              bottom: `${3 * s}px`,
              left: "50%",
              transform: "translateX(-50%)",
              width: 0,
              height: 0,
              borderLeft: `${3 * s}px solid transparent`,
              borderRight: `${3 * s}px solid transparent`,
              borderTop: `${4 * s}px solid ${nose}`,
            }}
          />
        ) : (
          <div
            className="absolute rounded-full"
            style={{
              bottom: `${3 * s}px`,
              left: "50%",
              transform: "translateX(-50%)",
              width: `${4 * s}px`,
              height: `${3 * s}px`,
              backgroundColor: nose,
            }}
          />
        )}

        {/* Tanuki mask markings */}
        {animalType === "tanuki" && (
          <>
            <div className="absolute rounded-full" style={{ top: `${5 * s}px`, left: `${2 * s}px`, width: `${8 * s}px`, height: `${6 * s}px`, backgroundColor: furDark, opacity: 0.6 }} />
            <div className="absolute rounded-full" style={{ top: `${5 * s}px`, right: `${2 * s}px`, width: `${8 * s}px`, height: `${6 * s}px`, backgroundColor: furDark, opacity: 0.6 }} />
            {/* Re-render eyes on top of mask */}
            <div className="absolute rounded-full bg-white" style={{ top: `${6 * s}px`, left: `${4 * s}px`, width: `${5 * s}px`, height: `${5 * s}px`, zIndex: 1 }}>
              <div className="absolute rounded-full bg-black" style={{ top: `${1.5 * s}px`, left: `${1.5 * s}px`, width: `${2.5 * s}px`, height: `${2.5 * s}px` }} />
            </div>
            <div className="absolute rounded-full bg-white" style={{ top: `${6 * s}px`, right: `${4 * s}px`, width: `${5 * s}px`, height: `${5 * s}px`, zIndex: 1 }}>
              <div className="absolute rounded-full bg-black" style={{ top: `${1.5 * s}px`, right: `${1.5 * s}px`, width: `${2.5 * s}px`, height: `${2.5 * s}px` }} />
            </div>
            {/* Leaf on head */}
            <div
              className="absolute"
              style={{
                top: `${-3 * s}px`,
                left: "50%",
                transform: "translateX(-50%) rotate(15deg)",
                width: `${6 * s}px`,
                height: `${4 * s}px`,
                backgroundColor: "#228B22",
                borderRadius: "50% 50% 50% 0",
                zIndex: 2,
              }}
            />
          </>
        )}

        {/* Penguin white front */}
        {animalType === "penguin" && (
          <div
            className="absolute rounded-full"
            style={{
              bottom: `${0 * s}px`,
              left: "50%",
              transform: "translateX(-50%)",
              width: `${14 * s}px`,
              height: `${14 * s}px`,
              backgroundColor: belly,
            }}
          />
        )}

        {/* Crane long beak */}
        {animalType === "crane" && (
          <div
            className="absolute"
            style={{
              bottom: `${2 * s}px`,
              left: "50%",
              transform: "translateX(-50%)",
              width: `${8 * s}px`,
              height: `${3 * s}px`,
              backgroundColor: nose,
              borderRadius: `0 0 ${2 * s}px ${2 * s}px`,
            }}
          />
        )}

        {/* Frog wide mouth */}
        {animalType === "frog" && (
          <div
            className="absolute"
            style={{
              bottom: `${1 * s}px`,
              left: "50%",
              transform: "translateX(-50%)",
              width: `${14 * s}px`,
              height: `${2 * s}px`,
              backgroundColor: furDark,
              borderRadius: `0 0 ${4 * s}px ${4 * s}px`,
            }}
          />
        )}

        {/* Horse long face */}
        {animalType === "horse" && (
          <div
            className="absolute rounded-b-lg"
            style={{
              bottom: `${-2 * s}px`,
              left: "50%",
              transform: "translateX(-50%)",
              width: `${10 * s}px`,
              height: `${6 * s}px`,
              backgroundColor: fur,
            }}
          >
            <div
              className="absolute rounded-full"
              style={{
                bottom: `${1 * s}px`,
                left: "50%",
                transform: "translateX(-50%)",
                width: `${6 * s}px`,
                height: `${3 * s}px`,
                backgroundColor: nose,
              }}
            />
          </div>
        )}

        {/* Pig snout */}
        {animalType === "pig" && (
          <div
            className="absolute rounded-full"
            style={{
              bottom: `${2 * s}px`,
              left: "50%",
              transform: "translateX(-50%)",
              width: `${8 * s}px`,
              height: `${5 * s}px`,
              backgroundColor: nose,
            }}
          >
            <div className="flex justify-center gap-0.5" style={{ marginTop: `${1.5 * s}px` }}>
              <div className="rounded-full bg-black/40" style={{ width: `${2 * s}px`, height: `${2 * s}px` }} />
              <div className="rounded-full bg-black/40" style={{ width: `${2 * s}px`, height: `${2 * s}px` }} />
            </div>
          </div>
        )}

        {/* Lion mane hint on avatar */}
        {animalType === "lion" && (
          <div
            className="absolute rounded-full -z-10"
            style={{
              top: `${-3 * s}px`,
              left: `${-3 * s}px`,
              width: `${30 * s}px`,
              height: `${26 * s}px`,
              backgroundColor: furDark,
            }}
          />
        )}
      </div>

      {/* Clothing hint at bottom */}
      <div
        className="absolute rounded-b-sm"
        style={{
          bottom: `${1 * s}px`,
          width: `${18 * s}px`,
          height: `${4 * s}px`,
          backgroundColor: body,
        }}
      />
    </div>
  )
}

function renderEars(animalType: AnimalType, fur: string, furDark: string, belly: string, s: number) {
  switch (animalType) {
    case "cat":
    case "fox":
      return (
        <div className="absolute flex justify-between" style={{ top: `${-2 * s}px`, width: `${26 * s}px` }}>
          <div style={{ width: 0, height: 0, borderLeft: `${5 * s}px solid transparent`, borderRight: `${5 * s}px solid transparent`, borderBottom: `${8 * s}px solid ${fur}` }} />
          <div style={{ width: 0, height: 0, borderLeft: `${5 * s}px solid transparent`, borderRight: `${5 * s}px solid transparent`, borderBottom: `${8 * s}px solid ${fur}` }} />
        </div>
      )
    case "tanuki":
      return (
        <div className="absolute flex justify-between" style={{ top: `${-1 * s}px`, width: `${24 * s}px` }}>
          <div className="rounded-t-full" style={{ width: `${8 * s}px`, height: `${6 * s}px`, backgroundColor: fur }} />
          <div className="rounded-t-full" style={{ width: `${8 * s}px`, height: `${6 * s}px`, backgroundColor: fur }} />
        </div>
      )
    case "bear":
      return (
        <div className="absolute flex justify-between" style={{ top: `${-2 * s}px`, width: `${28 * s}px` }}>
          <div className="rounded-full" style={{ width: `${8 * s}px`, height: `${8 * s}px`, backgroundColor: furDark }} />
          <div className="rounded-full" style={{ width: `${8 * s}px`, height: `${8 * s}px`, backgroundColor: furDark }} />
        </div>
      )
    case "lion":
      return (
        <div className="absolute flex justify-between" style={{ top: `${-1 * s}px`, width: `${26 * s}px` }}>
          <div className="rounded-full" style={{ width: `${7 * s}px`, height: `${7 * s}px`, backgroundColor: furDark }} />
          <div className="rounded-full" style={{ width: `${7 * s}px`, height: `${7 * s}px`, backgroundColor: furDark }} />
        </div>
      )
    case "rabbit":
      return (
        <div className="absolute flex justify-between" style={{ top: `${-10 * s}px`, width: `${20 * s}px` }}>
          <div className="rounded-full" style={{ width: `${6 * s}px`, height: `${14 * s}px`, backgroundColor: fur, border: `${s}px solid ${furDark}` }}>
            <div className="rounded-full mx-auto mt-1" style={{ width: `${3 * s}px`, height: `${10 * s}px`, backgroundColor: belly }} />
          </div>
          <div className="rounded-full" style={{ width: `${6 * s}px`, height: `${14 * s}px`, backgroundColor: fur, border: `${s}px solid ${furDark}` }}>
            <div className="rounded-full mx-auto mt-1" style={{ width: `${3 * s}px`, height: `${10 * s}px`, backgroundColor: belly }} />
          </div>
        </div>
      )
    case "owl":
      return (
        <div className="absolute flex justify-between" style={{ top: `${-3 * s}px`, width: `${26 * s}px` }}>
          <div style={{ width: 0, height: 0, borderLeft: `${4 * s}px solid transparent`, borderRight: `${4 * s}px solid transparent`, borderBottom: `${6 * s}px solid ${furDark}` }} />
          <div style={{ width: 0, height: 0, borderLeft: `${4 * s}px solid transparent`, borderRight: `${4 * s}px solid transparent`, borderBottom: `${6 * s}px solid ${furDark}` }} />
        </div>
      )
    case "deer":
      // Tall pointed ears
      return (
        <div className="absolute flex justify-between" style={{ top: `${-4 * s}px`, width: `${26 * s}px` }}>
          <div style={{ width: 0, height: 0, borderLeft: `${4 * s}px solid transparent`, borderRight: `${4 * s}px solid transparent`, borderBottom: `${10 * s}px solid ${fur}` }} />
          <div style={{ width: 0, height: 0, borderLeft: `${4 * s}px solid transparent`, borderRight: `${4 * s}px solid transparent`, borderBottom: `${10 * s}px solid ${fur}` }} />
        </div>
      )
    case "wolf":
      // Medium pointed ears
      return (
        <div className="absolute flex justify-between" style={{ top: `${-3 * s}px`, width: `${26 * s}px` }}>
          <div style={{ width: 0, height: 0, borderLeft: `${4 * s}px solid transparent`, borderRight: `${4 * s}px solid transparent`, borderBottom: `${8 * s}px solid ${fur}` }} />
          <div style={{ width: 0, height: 0, borderLeft: `${4 * s}px solid transparent`, borderRight: `${4 * s}px solid transparent`, borderBottom: `${8 * s}px solid ${fur}` }} />
        </div>
      )
    case "dog":
      // Floppy ears
      return (
        <div className="absolute flex justify-between" style={{ top: `${-1 * s}px`, width: `${28 * s}px` }}>
          <div className="rounded-b-full" style={{ width: `${8 * s}px`, height: `${8 * s}px`, backgroundColor: furDark, transform: "rotate(-10deg)" }} />
          <div className="rounded-b-full" style={{ width: `${8 * s}px`, height: `${8 * s}px`, backgroundColor: furDark, transform: "rotate(10deg)" }} />
        </div>
      )
    case "monkey":
      // Round ears
      return (
        <div className="absolute flex justify-between" style={{ top: `${-1 * s}px`, width: `${30 * s}px` }}>
          <div className="rounded-full" style={{ width: `${8 * s}px`, height: `${8 * s}px`, backgroundColor: fur, border: `${s}px solid ${furDark}` }}>
            <div className="rounded-full mx-auto" style={{ width: `${4 * s}px`, height: `${4 * s}px`, backgroundColor: belly, marginTop: `${2 * s}px` }} />
          </div>
          <div className="rounded-full" style={{ width: `${8 * s}px`, height: `${8 * s}px`, backgroundColor: fur, border: `${s}px solid ${furDark}` }}>
            <div className="rounded-full mx-auto" style={{ width: `${4 * s}px`, height: `${4 * s}px`, backgroundColor: belly, marginTop: `${2 * s}px` }} />
          </div>
        </div>
      )
    case "pig":
      // Small floppy ears
      return (
        <div className="absolute flex justify-between" style={{ top: `${-1 * s}px`, width: `${24 * s}px` }}>
          <div className="rounded-sm" style={{ width: `${7 * s}px`, height: `${6 * s}px`, backgroundColor: furDark, transform: "rotate(-15deg)" }} />
          <div className="rounded-sm" style={{ width: `${7 * s}px`, height: `${6 * s}px`, backgroundColor: furDark, transform: "rotate(15deg)" }} />
        </div>
      )
    case "horse":
      // Tall upright ears
      return (
        <div className="absolute flex justify-between" style={{ top: `${-3 * s}px`, width: `${20 * s}px` }}>
          <div className="rounded-t-full" style={{ width: `${5 * s}px`, height: `${8 * s}px`, backgroundColor: fur, border: `${s}px solid ${furDark}` }} />
          <div className="rounded-t-full" style={{ width: `${5 * s}px`, height: `${8 * s}px`, backgroundColor: fur, border: `${s}px solid ${furDark}` }} />
        </div>
      )
    case "otter":
      // Small round ears
      return (
        <div className="absolute flex justify-between" style={{ top: `${-1 * s}px`, width: `${24 * s}px` }}>
          <div className="rounded-full" style={{ width: `${6 * s}px`, height: `${6 * s}px`, backgroundColor: furDark }} />
          <div className="rounded-full" style={{ width: `${6 * s}px`, height: `${6 * s}px`, backgroundColor: furDark }} />
        </div>
      )
    case "mouse":
      // Large round ears
      return (
        <div className="absolute flex justify-between" style={{ top: `${-2 * s}px`, width: `${30 * s}px` }}>
          <div className="rounded-full" style={{ width: `${9 * s}px`, height: `${9 * s}px`, backgroundColor: fur, border: `${s}px solid ${furDark}` }}>
            <div className="rounded-full mx-auto" style={{ width: `${5 * s}px`, height: `${5 * s}px`, backgroundColor: belly, marginTop: `${2 * s}px` }} />
          </div>
          <div className="rounded-full" style={{ width: `${9 * s}px`, height: `${9 * s}px`, backgroundColor: fur, border: `${s}px solid ${furDark}` }}>
            <div className="rounded-full mx-auto" style={{ width: `${5 * s}px`, height: `${5 * s}px`, backgroundColor: belly, marginTop: `${2 * s}px` }} />
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
