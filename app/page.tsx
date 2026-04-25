"use client"

import { useState, useEffect } from "react"
import { HomeContent } from "@/components/game/HomeContent"
import { LoginScreen } from "@/components/game/LoginScreen"

export default function Home() {
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem("userId")
    if (stored) setUserId(stored)
    setIsLoading(false)
  }, [])

  if (isLoading) return null

  if (!userId) {
    return (
      <LoginScreen
        onLogin={(name) => {
          localStorage.setItem("userId", name)
          setUserId(name)
          fetch("/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-user-id": name },
            body: JSON.stringify({ playerName: name }),
          }).catch(console.error)
        }}
      />
    )
  }

  return <HomeContent userId={userId} />
}
