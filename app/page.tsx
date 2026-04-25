"use client"

import { useState, useEffect } from "react"
import { HomeContent } from "@/components/game/HomeContent"

export default function Home() {
  const [userId, setUserId] = useState<string | null>(null)
  const [nameInput, setNameInput] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem("userId")
    if (stored) setUserId(stored)
    setIsLoading(false)
  }, [])

  if (isLoading) return null

  if (!userId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-2xl font-bold text-amber-100">Language Quest</h1>
        <p className="text-amber-200">AI-Powered Language Learning RPG</p>
        <form
          className="flex flex-col gap-3 mt-4 items-center"
          onSubmit={async (e) => {
            e.preventDefault()
            const name = nameInput.trim()
            if (!name) return
            localStorage.setItem("userId", name)
            setUserId(name)
            fetch("/api/register", {
              method: "POST",
              headers: { "Content-Type": "application/json", "x-user-id": name },
              body: JSON.stringify({ playerName: name }),
            }).catch(console.error)
          }}
        >
          <input
            type="text"
            placeholder="Enter your name"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            className="px-4 py-2 rounded bg-amber-900/50 text-amber-100 border border-amber-700 placeholder-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            autoFocus
          />
          <button
            type="submit"
            className="px-6 py-2 bg-amber-600 text-white rounded hover:bg-amber-500 transition"
          >
            Start Playing
          </button>
        </form>
      </div>
    )
  }

  return <HomeContent userId={userId} />
}
