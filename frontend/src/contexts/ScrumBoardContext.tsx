"use client"

import type React from "react"
import { createContext, useContext } from "react"
import { useScrumBoard } from "@/hooks/useScrumBoard"

const ScrumBoardContext = createContext<ReturnType<typeof useScrumBoard> | undefined>(undefined)

export function ScrumBoardProvider({ children }: { children: React.ReactNode }) {
  const value = useScrumBoard()
  return <ScrumBoardContext.Provider value={value}>{children}</ScrumBoardContext.Provider>
}

export function useScrumBoardContext() {
  const context = useContext(ScrumBoardContext)
  if (context === undefined) {
    throw new Error("useScrumBoardContext must be used within a ScrumBoardProvider")
  }
  return context
}