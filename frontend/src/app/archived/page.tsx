"use client"

import { ArrowLeft, Calendar, CheckCircle, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AuthGuard } from "@/components/auth-guard"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useScrumBoardContext } from "@/contexts/ScrumBoardContext"
import { getAvatarUrl } from "@/lib/avatars"
import Link from "next/link"

export default function ArchivedPage() {
  const { requirements, updateRequirement } = useScrumBoardContext()

  const completedRequirements = requirements.filter((req) => req.status === "completed")

  const handleRestore = (requirementId: string) => {
    updateRequirement(requirementId, { status: "active" })
  }

  const calculateProgress = (requirement: any) => {
    if (requirement.tasks.length === 0) return 0
    const completedTasks = requirement.tasks.filter((task: any) => task.status === "done").length
    return (completedTasks / requirement.tasks.length) * 100
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div className="text-sm text-gray-500">Dashboard / Requisitos Arquivados</div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-600" />
                Requisitos Concluídos
              </h1>
              <p className="text-gray-600 mt-1">{completedRequirements.length} requisito(s) concluído(s) com sucesso</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {completedRequirements.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedRequirements.map((requirement) => {
              const progress = calculateProgress(requirement)
              const totalTasks = requirement.tasks.length
              const completedTasks = requirement.tasks.filter((task) => task.status === "done").length

              return (
                <Card key={requirement.id} className="opacity-90 hover:opacity-100 transition-opacity">
                  <CardHeader className={`${requirement.color} text-white relative`}>
                    <div className="absolute top-2 right-2">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-lg pr-8">{requirement.title}</CardTitle>
                    <CardDescription className="text-white/90 text-sm line-clamp-2">
                      {requirement.description}
                    </CardDescription>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="bg-white/20 text-white text-xs">
                        Concluído
                      </Badge>
                      <Badge variant="secondary" className="bg-white/20 text-white capitalize text-xs">
                        {requirement.priority}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="p-4">
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center p-2 bg-green-50 rounded">
                        <div className="text-lg font-bold text-green-600">{totalTasks}</div>
                        <div className="text-xs text-gray-600">Total Tasks</div>
                      </div>
                      <div className="text-center p-2 bg-green-50 rounded">
                        <div className="text-lg font-bold text-green-600">{completedTasks}</div>
                        <div className="text-xs text-gray-600">Concluídas</div>
                      </div>
                    </div>

                    {/* Completion Info */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Progresso:</span>
                        <span className="font-medium text-green-600">100%</span>
                      </div>

                      {/* Owner */}
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          {requirement.owner.avatar ? (
                            <AvatarImage src={getAvatarUrl(requirement.owner.avatar)} alt={requirement.owner.name} />
                          ) : null}
                          <AvatarFallback className="text-xs">
                            {requirement.owner?.name
                              ? requirement.owner.name.split(" ").map((n: string) => n[0]).join("")
                              : "?"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-gray-600">{requirement.owner?.name ?? "Sem nome"}</span>
                      </div>

                      {/* Completion Date */}
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>Concluído em {new Date(requirement.updatedAt).toLocaleDateString("pt-BR")}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-4 pt-4 border-t">
                      <Link href={`/requirement/${requirement.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          Visualizar
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRestore(requirement.id)}
                        className="flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Reativar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <CheckCircle className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum requisito concluído</h3>
            <p className="text-gray-600 mb-4">Quando você concluir requisitos, eles aparecerão aqui</p>
            <Link href="/">
              <Button>Voltar ao Dashboard</Button>
            </Link>
          </div>
        )}

        {/* Summary Stats */}
        {completedRequirements.length > 0 && (
          <div className="mt-8 bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Resumo dos Concluídos</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{completedRequirements.length}</div>
                <div className="text-sm text-gray-600">Requisitos Concluídos</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {completedRequirements.reduce((acc, req) => acc + req.tasks.length, 0)}
                </div>
                <div className="text-sm text-gray-600">Total de Tasks</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {completedRequirements.reduce(
                    (acc, req) => acc + req.tasks.reduce((taskAcc, task) => taskAcc + (task.actualHours || 0), 0),
                    0,
                  )}
                  h
                </div>
                <div className="text-sm text-gray-600">Horas Trabalhadas</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {completedRequirements.length > 0
                    ? Math.round(
                        completedRequirements.reduce((acc, req) => {
                          const startDate = req.startDate ? new Date(req.startDate) : new Date(req.createdAt)
                          const endDate = new Date(req.updatedAt)
                          return acc + (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
                        }, 0) / completedRequirements.length,
                      )
                    : 0}
                  d
                </div>
                <div className="text-sm text-gray-600">Tempo Médio</div>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
      </AuthGuard>
  )
}
