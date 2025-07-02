"use client"

import { useState } from "react"
import {
  Plus,
  Search,
  Filter,
  Archive,
  MoreHorizontal,
  ArrowRight,
  Calendar,
  Play,
  LayoutTemplateIcon as Template,
  GitBranch,
  Settings,
  Trash2,
  Edit,
} from "lucide-react"
import { AuthGuard } from "@/components/auth-guard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useScrumBoardContext } from "@/contexts/ScrumBoardContext"
import { DashboardStats } from "@/components/dashboard-stats"
import type { Requirement, RequirementTemplate } from "@/types"
import Link from "next/link"
import { RequirementActivationModal } from "@/components/requirement-activation-modal"
import { RequirementTemplatesModal } from "@/components/requirement-templates-modal"
import { CreateTemplateModal } from "@/components/create-template-modal"
import { WeeklyReportModal } from "@/components/weekly-report-modal"
import { GlobalSearchModal } from "@/components/global-search-modal"
import { NotificationCenter } from "@/components/notification-center"
import { useAuth } from "@/contexts/AuthContext"
import { v4 as uuidv4 } from "uuid"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const colors = [
  "bg-blue-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-red-500",
  "bg-yellow-500",
  "bg-pink-500",
  "bg-indigo-500",
  "bg-orange-500",
]

export default function Dashboard() {
  const {
    requirements,
    users,
    filters,
    setFilters,
    projectStats,
    addRequirement,
    updateRequirement,
    deleteRequirement,
  } = useScrumBoardContext()
  const { user: loggedUser } = useAuth()

  const [isRequirementDialogOpen, setIsRequirementDialogOpen] = useState(false)
  const [newRequirement, setNewRequirement] = useState({
    title: "",
    description: "",
    color: "bg-blue-500",
    priority: "medium" as const,
  })

  const [selectedRequirementForActivation, setSelectedRequirementForActivation] = useState<Requirement | null>(null)
  const [isActivationModalOpen, setIsActivationModalOpen] = useState(false)
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false)
  const [isCreateTemplateModalOpen, setIsCreateTemplateModalOpen] = useState(false)
  const [isWeeklyReportModalOpen, setIsWeeklyReportModalOpen] = useState(false)
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false)
  const [requirementToDelete, setRequirementToDelete] = useState<Requirement | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const activeRequirements = requirements.filter((req) => req.status === "active")
  const completedRequirements = requirements.filter((req) => req.status === "completed")

  const handleAddRequirement = async () => {
    console.log("handleAddRequirement called with:", newRequirement) // Debug log

    if (!newRequirement.title.trim()) {
      console.log("Title is empty, not creating requirement") // Debug log
      alert("Por favor, insira um título para o requisito")
      return
    }

    if (!loggedUser) {
      console.log("No logged user, not creating requirement") // Debug log
      alert("Usuário não está logado")
      return
    }

    try {
      const requirementData = {
        title: newRequirement.title,
        description: newRequirement.description,
        color: newRequirement.color,
        status: "planning" as const,
        priority: newRequirement.priority,
        owner: loggedUser!,
        progress: 0,
        tasks: [],
        milestones: [],
        comments: [],
        dependencies: [],
        tags: [],
        approvalRequired: false,
      }

      console.log("Creating requirement with data:", requirementData) // Debug log

      const createdRequirement = await addRequirement(requirementData)
      console.log("Requirement created:", createdRequirement) // Debug log

      // Reset form
      setNewRequirement({
        title: "",
        description: "",
        color: "bg-blue-500",
        priority: "medium",
      })

      // Close dialog
      setIsRequirementDialogOpen(false)

      console.log("Form reset and dialog closed") // Debug log
    } catch (error) {
      console.error("Error creating requirement:", error)
      alert("Erro ao criar requisito. Verifique o console para mais detalhes.")
    }
  }

  const calculateRequirementProgress = (requirement: Requirement) => {
    if (!requirement.tasks || requirement.tasks.length === 0) return 0
    const completedTasks = requirement.tasks.filter((task) => task.status === "done").length
    return (completedTasks / requirement.tasks.length) * 100
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "planning":
        return "bg-gray-100 text-gray-800"
      case "active":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "on-hold":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleActivateRequirement = async (requirementId: string, data: any) => {
    await updateRequirement(requirementId, { ...data, status: "active" })
    setSelectedRequirementForActivation(null)
  }

  const handleRequestApproval = (requirementId: string, data: any) => {
    updateRequirement(requirementId, { ...data, status: "pending-approval" })
    setSelectedRequirementForActivation(null)
  }

  const handleDeleteRequirement = (requirement: Requirement) => {
    setRequirementToDelete(requirement)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteRequirement = () => {
    if (requirementToDelete) {
      deleteRequirement(requirementToDelete.id)
      setRequirementToDelete(null)
      setIsDeleteDialogOpen(false)
    }
  }

  const handleCreateFromTemplate = (template: any) => {
    if (!loggedUser) {
      alert("Usuário não está logado")
      return
    }

    const requirement = {
      title: `${template.name} - ${new Date().toLocaleDateString()}`,
      description: template.description,
      color: template.color,
      status: "planning" as const,
      priority: template.priority,
      owner: loggedUser!,
      progress: 0,
      tasks: template.defaultTasks.map((task: any) => ({
        ...task,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })),
      milestones: [],
      comments: [],
      dependencies: [],
      tags: [],
      approvalRequired: false,
    }
    addRequirement(requirement)
  }

  const handleSaveTemplate = (templateData: any) => {
    // Implementar salvamento de template
    console.log("Template salvo:", templateData)
  }

  const RequirementCard = ({ requirement }: { requirement: Requirement }) => {
    const progress = calculateRequirementProgress(requirement)
    const totalTasks = requirement.tasks?.length || 0
    const completedTasks = requirement.tasks?.filter((task) => task.status === "done").length || 0
    const inProgressTasks = requirement.tasks?.filter((task) => task.status === "progress").length || 0
    const overdueTasks =
      requirement.tasks?.filter((task) => task.endDate && new Date(task.endDate) < new Date() && task.status !== "done")
        .length || 0

    const canActivate = requirement.status === "planning"
    const isPendingApproval = requirement.status === "pending-approval"

    return (
      <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
        <Link href={`/requirement/${requirement.id}`}>
          <CardHeader className={`${requirement.color} text-white relative overflow-hidden`}>
            <div className="absolute inset-0 bg-gradient-to-r from-black/0 to-black/10"></div>
            <div className="relative">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-1 group-hover:underline">{requirement.title}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-white/20 text-white capitalize text-xs">
                      {requirement.status === "pending-approval" ? "Aguardando Aprovação" : requirement.status}
                    </Badge>
                    <Badge variant="secondary" className="bg-white/20 text-white capitalize text-xs">
                      {requirement.priority}
                    </Badge>
                    {(requirement.dependencies?.length || 0) > 0 && (
                      <Badge variant="secondary" className="bg-white/20 text-white text-xs">
                        <GitBranch className="w-3 h-3 mr-1" />
                        {requirement.dependencies?.length || 0}
                      </Badge>
                    )}
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <CardDescription className="text-white/90 text-sm line-clamp-2">
                {requirement.description}
              </CardDescription>
            </div>
          </CardHeader>
        </Link>
        <CardContent className="p-4">
          {/* Activation Button for Planning Status */}
          {canActivate && (
            <div className="mb-4">
              <Button
                size="sm"
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={(e) => {
                  e.preventDefault()
                  setSelectedRequirementForActivation(requirement)
                  setIsActivationModalOpen(true)
                }}
              >
                <Play className="w-4 h-4 mr-2" />
                Ativar Requisito
              </Button>
            </div>
          )}

          {/* Pending Approval Status */}
          {isPendingApproval && (
            <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded text-center">
              <span className="text-sm text-yellow-800 font-medium">Aguardando aprovação</span>
            </div>
          )}

          {/* Progress - only show for active requirements */}
          {requirement.status === "active" && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-medium">Progresso Geral</span>
                <span className="text-gray-600">{progress.toFixed(0)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="text-lg font-bold text-blue-600">{totalTasks}</div>
              <div className="text-xs text-gray-600">Total Tasks</div>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="text-lg font-bold text-green-600">{completedTasks}</div>
              <div className="text-xs text-gray-600">Concluídas</div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center justify-between text-xs text-gray-600">
            <div className="flex items-center gap-4">
              {inProgressTasks > 0 && (
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                  {inProgressTasks} em progresso
                </span>
              )}
              {overdueTasks > 0 && (
                <span className="flex items-center gap-1 text-red-600">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  {overdueTasks} atrasadas
                </span>
              )}
            </div>

            {/* Owner */}
            {requirement.owner && (
              <div className="flex items-center gap-1">
                <Avatar className="w-5 h-5">
                  {requirement.owner.avatar ? (
                    <AvatarImage src={requirement.owner.avatar} alt={requirement.owner.name} />
                  ) : null}
                  <AvatarFallback className="text-xs">
                    {requirement.owner.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <span>{requirement.owner.name.split(" ")[0]}</span>
              </div>
            )}
          </div>

          {/* Dates */}
          {(requirement.startDate || requirement.endDate) && (
            <div className="flex items-center gap-4 mt-3 pt-3 border-t text-xs text-gray-600">
              {requirement.startDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Início: {new Date(requirement.startDate).toLocaleDateString("pt-BR")}
                </div>
              )}
              {requirement.endDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Fim: {new Date(requirement.endDate).toLocaleDateString("pt-BR")}
                </div>
              )}
            </div>
          )}

          {/* Dropdown Menu */}
          <div className="absolute top-2 right-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {canActivate && (
                  <DropdownMenuItem onClick={(e) => {
                    e.preventDefault()
                    setSelectedRequirementForActivation(requirement)
                    setIsActivationModalOpen(true)
                  }}>
                    <Play className="mr-2 h-4 w-4" />
                    Ativar
                  </DropdownMenuItem>
                )}
                {requirement.status === "planning" && (
                  <DropdownMenuItem onClick={(e) => {
                    e.preventDefault()
                    setSelectedRequirementForActivation(requirement)
                    setIsActivationModalOpen(true)
                  }}>
                    <Edit className="mr-2 h-4 w-4" />
                    Solicitar Aprovação
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.preventDefault()
                    handleDeleteRequirement(requirement)
                  }}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard do Projeto</h1>
                <p className="text-gray-600 mt-1">Visão geral dos seus requisitos e progresso</p>
              </div>

              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={() => setIsGlobalSearchOpen(true)}>
                  <Search className="w-4 h-4 mr-2" />
                  Buscar
                </Button>

                <NotificationCenter />

                <Button variant="outline" size="sm" onClick={() => setIsTemplatesModalOpen(true)}>
                  <Template className="w-4 h-4 mr-2" />
                  Templates
                </Button>

                <Link href="/archived">
                  <Button variant="outline" size="sm">
                    <Archive className="w-4 h-4 mr-2" />
                    Arquivados ({completedRequirements.length})
                  </Button>
                </Link>

                <Dialog open={isRequirementDialogOpen} onOpenChange={setIsRequirementDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Novo Requisito
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Criar Novo Requisito</DialogTitle>
                      <DialogDescription>Adicione um novo requisito principal ao seu projeto</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="title">Título *</Label>
                        <Input
                          id="title"
                          value={newRequirement.title}
                          onChange={(e) => {
                            console.log("Title changed:", e.target.value) // Debug log
                            setNewRequirement({ ...newRequirement, title: e.target.value })
                          }}
                          placeholder="Ex: Sistema de Autenticação"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="description">Descrição</Label>
                        <Textarea
                          id="description"
                          value={newRequirement.description}
                          onChange={(e) => setNewRequirement({ ...newRequirement, description: e.target.value })}
                          placeholder="Descreva o requisito em detalhes..."
                          rows={3}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label>Prioridade</Label>
                          <Select
                            value={newRequirement.priority}
                            onValueChange={(value: any) => setNewRequirement({ ...newRequirement, priority: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Baixa</SelectItem>
                              <SelectItem value="medium">Média</SelectItem>
                              <SelectItem value="high">Alta</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label>Cor</Label>
                          <div className="flex gap-1 flex-wrap">
                            {colors.map((color) => (
                              <button
                                key={color}
                                className={`w-6 h-6 rounded-full ${color} ${
                                  newRequirement.color === color ? "ring-2 ring-gray-400" : ""
                                }`}
                                onClick={() => setNewRequirement({ ...newRequirement, color })}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsRequirementDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleAddRequirement}>Criar Requisito</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* Dashboard Stats */}
          <DashboardStats stats={projectStats} />

          {/* Filters */}
          <div className="flex items-center gap-4 mb-6 p-4 bg-white rounded-lg shadow-sm">
            <div className="flex items-center gap-2 flex-1">
              <Search className="w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar requisitos..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="border-0 shadow-none"
              />
            </div>

            <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="planning">Planejamento</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="on-hold">Em Espera</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.priority} onValueChange={(value) => setFilters({ ...filters, priority: value })}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="low">Baixa</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Mais Filtros
            </Button>
          </div>

          {/* Requirements Grid */}
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="active" className="flex items-center gap-2">
                Requisitos Ativos ({activeRequirements.length})
              </TabsTrigger>
              <TabsTrigger value="planning" className="flex items-center gap-2">
                Em Planejamento ({requirements.filter((r) => r.status === "planning").length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active">
              {activeRequirements.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeRequirements
                    .filter((req) => req.status !== "planning")
                    .map((requirement) => (
                      <RequirementCard key={requirement.id} requirement={requirement} />
                    ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <MoreHorizontal className="w-16 h-16 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum requisito ativo</h3>
                  <p className="text-gray-600 mb-4">Comece criando seu primeiro requisito</p>
                  <Button onClick={() => setIsRequirementDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Primeiro Requisito
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="planning">
              {requirements.filter((r) => r.status === "planning").length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {requirements
                    .filter((req) => req.status === "planning")
                    .map((requirement) => (
                      <RequirementCard key={requirement.id} requirement={requirement} />
                    ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <Calendar className="w-16 h-16 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum requisito em planejamento</h3>
                  <p className="text-gray-600">Todos os requisitos já estão em desenvolvimento</p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Quick Actions */}
          <div className="mt-8 p-6 bg-white rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Ações Rápidas</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="justify-start h-auto p-4"
                onClick={() => setIsCreateTemplateModalOpen(true)}
              >
                <div className="text-left">
                  <div className="font-medium">Criar Template</div>
                  <div className="text-sm text-gray-600">Salvar estrutura para reutilizar</div>
                </div>
              </Button>
              <Button
                variant="outline"
                className="justify-start h-auto p-4"
                onClick={() => setIsWeeklyReportModalOpen(true)}
              >
                <div className="text-left">
                  <div className="font-medium">Relatório Semanal</div>
                  <div className="text-sm text-gray-600">Gerar relatório de progresso</div>
                </div>
              </Button>
              <Link href="/settings">
                <Button variant="outline" className="justify-start h-auto p-4 w-full">
                  <div className="text-left">
                    <div className="font-medium">Configurações</div>
                    <div className="text-sm text-gray-600">Personalizar workspace</div>
                  </div>
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Modals */}
        <RequirementActivationModal
          requirement={selectedRequirementForActivation}
          users={users}
          isOpen={isActivationModalOpen}
          onClose={() => {
            setIsActivationModalOpen(false)
            setSelectedRequirementForActivation(null)
          }}
          onActivate={handleActivateRequirement}
          onRequestApproval={handleRequestApproval}
        />

        <RequirementTemplatesModal
          isOpen={isTemplatesModalOpen}
          onClose={() => setIsTemplatesModalOpen(false)}
          onCreateFromTemplate={handleCreateFromTemplate}
          onSaveAsTemplate={handleSaveTemplate}
        />

        <CreateTemplateModal
          requirements={requirements}
          isOpen={isCreateTemplateModalOpen}
          onClose={() => setIsCreateTemplateModalOpen(false)}
          onSaveTemplate={handleSaveTemplate}
        />

        <WeeklyReportModal
          isOpen={isWeeklyReportModalOpen}
          onClose={() => setIsWeeklyReportModalOpen(false)}
          requirements={requirements}
          projectStats={projectStats}
        />

        <GlobalSearchModal
          isOpen={isGlobalSearchOpen}
          onClose={() => setIsGlobalSearchOpen(false)}
          requirements={requirements}
          users={users}
        />

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Exclusão</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja excluir o requisito "{requirementToDelete?.title}"? 
                Esta ação não pode ser desfeita e todas as tasks associadas serão removidas.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={confirmDeleteRequirement}>
                Excluir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AuthGuard>
  )
}
