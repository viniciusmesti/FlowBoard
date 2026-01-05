"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useAuth } from "./AuthContext"
import { fetchSystems, createSystem, updateSystem, deleteSystem } from "@/api/api"
import type { System } from "@/types"
import { useRouter } from "next/navigation"

interface SystemContextType {
  systems: System[]
  currentSystem: System | null
  isLoading: boolean
  error: string | null
  setCurrentSystem: (system: System | null) => void
  loadSystems: () => Promise<void>
  createNewSystem: (data: {
    name: string
    description?: string
    color: string
    requirementTypes: string[]
  }) => Promise<System>
  updateExistingSystem: (id: string, data: Partial<System>) => Promise<System>
  deleteExistingSystem: (id: string) => Promise<void>
}

const SystemContext = createContext<SystemContextType | undefined>(undefined)

export function SystemProvider({ children }: { children: ReactNode }) {
  const [systems, setSystems] = useState<System[]>([])
  const [currentSystem, setCurrentSystem] = useState<System | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const router = useRouter()

  const loadSystems = async () => {
    if (!user) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      const data = await fetchSystems()
      setSystems(data)
    } catch (err) {
      console.error("Error loading systems:", err)
      setError(err instanceof Error ? err.message : "Erro ao carregar sistemas")
    } finally {
      setIsLoading(false)
    }
  }

  const createNewSystem = async (data: {
    name: string
    description?: string
    color: string
    requirementTypes: string[]
  }): Promise<System> => {
    if (!user) {
      throw new Error("Usuário não autenticado")
    }

    try {
      const newSystem = await createSystem({
        ...data,
        ownerId: user.id,
      })
      setSystems((prev) => [newSystem, ...prev])
      setCurrentSystem(newSystem)
      router.push(`/dashboard/${newSystem.id}`)
      return newSystem
    } catch (err) {
      console.error("Error creating system:", err)
      throw err
    }
  }

  const updateExistingSystem = async (
    id: string,
    data: Partial<System>
  ): Promise<System> => {
    try {
      const updated = await updateSystem(id, data)
      setSystems((prev) =>
        prev.map((s) => (s.id === id ? updated : s))
      )
      if (currentSystem?.id === id) {
        setCurrentSystem(updated)
      }
      return updated
    } catch (err) {
      console.error("Error updating system:", err)
      throw err
    }
  }

  const deleteExistingSystem = async (id: string): Promise<void> => {
    try {
      await deleteSystem(id)
      setSystems((prev) => prev.filter((s) => s.id !== id))
      if (currentSystem?.id === id) {
        setCurrentSystem(null)
        router.push("/systems")
      }
    } catch (err) {
      console.error("Error deleting system:", err)
      throw err
    }
  }

  useEffect(() => {
    if (user) {
      loadSystems()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  return (
    <SystemContext.Provider
      value={{
        systems,
        currentSystem,
        isLoading,
        error,
        setCurrentSystem,
        loadSystems,
        createNewSystem,
        updateExistingSystem,
        deleteExistingSystem,
      }}
    >
      {children}
    </SystemContext.Provider>
  )
}

export function useSystem() {
  const context = useContext(SystemContext)
  if (context === undefined) {
    throw new Error("useSystem must be used within a SystemProvider")
  }
  return context
}

