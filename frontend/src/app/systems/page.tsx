"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AuthGuard } from "@/components/auth-guard"
import { Button } from "@/components/ui/button"
import { SystemCard } from "@/components/system-card"
import { CreateSystemModal } from "@/components/create-system-modal"
import { useSystem } from "@/contexts/SystemContext"
import { Plus, Loader2 } from "lucide-react"

export default function SystemsPage() {
  const { systems, isLoading, loadSystems } = useSystem()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    loadSystems()
  }, [])

  if (isLoading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Carregando sistemas...</p>
          </div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Sistemas</h1>
              <p className="text-gray-600 mt-1">
                Gerencie seus sistemas e seus requisitos
              </p>
            </div>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Sistema
            </Button>
          </div>

          {systems.length === 0 ? (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-12 h-12 text-gray-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Nenhum sistema criado ainda
                </h2>
                <p className="text-gray-600 mb-6">
                  Comece criando seu primeiro sistema para organizar seus
                  requisitos.
                </p>
                <Button onClick={() => setIsCreateModalOpen(true)} size="lg">
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeiro Sistema
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {systems.map((system) => (
                <SystemCard key={system.id} system={system} />
              ))}
            </div>
          )}

          <CreateSystemModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
          />
        </div>
      </div>
    </AuthGuard>
  )
}

