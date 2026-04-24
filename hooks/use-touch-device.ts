"use client"

import { useState, useEffect } from "react"

const TOUCH_QUERY = "(hover: none) and (pointer: coarse)"

export function useIsTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia(TOUCH_QUERY)
    setIsTouch(mql.matches)

    const handler = (e: MediaQueryListEvent) => setIsTouch(e.matches)
    mql.addEventListener("change", handler)
    return () => mql.removeEventListener("change", handler)
  }, [])

  return isTouch
}
