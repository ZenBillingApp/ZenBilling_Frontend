"use client"

import * as React from "react"

type AnnounceFunction = (message: string, priority?: "polite" | "assertive") => void

const AnnounceContext = React.createContext<AnnounceFunction | null>(null)

export function useAnnounce(): AnnounceFunction {
  const announce = React.useContext(AnnounceContext)
  if (!announce) {
    throw new Error("useAnnounce must be used within <AccessibilityAnnouncer>")
  }
  return announce
}

export function AccessibilityAnnouncer({ children }: { children: React.ReactNode }) {
  const [politeMessage, setPoliteMessage] = React.useState("")
  const [assertiveMessage, setAssertiveMessage] = React.useState("")

  const announce: AnnounceFunction = React.useCallback((message, priority = "polite") => {
    if (priority === "assertive") {
      setAssertiveMessage("")
      requestAnimationFrame(() => setAssertiveMessage(message))
    } else {
      setPoliteMessage("")
      requestAnimationFrame(() => setPoliteMessage(message))
    }
  }, [])

  return (
    <AnnounceContext.Provider value={announce}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        role="status"
        className="sr-only"
      >
        {politeMessage}
      </div>
      <div
        aria-live="assertive"
        aria-atomic="true"
        role="alert"
        className="sr-only"
      >
        {assertiveMessage}
      </div>
    </AnnounceContext.Provider>
  )
}
