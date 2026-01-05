"use client"

import { useState, useEffect, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
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
  ArrowLeft,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useScrumBoardContext } from "@/contexts/ScrumBoardContext"
import { useSystem } from "@/contexts/SystemContext"
import { DashboardStats } from "@/components/dashboard-stats"
import type { Requirement } from "@/types"
import { getAvatarUrl } from "@/lib/avatars"
import Link from "next/link"
import { RequirementActivationModal } from "@/components/requirement-activation-modal"
import { RequirementDetailModal } from "@/components/requirement-detail-modal"
import { RequirementTemplatesModal } from "@/components/requirement-templates-modal"
import { CreateTemplateModal } from "@/components/create-template-modal"
import { WeeklyReportModal } from "@/components/weekly-report-modal"
import { GlobalSearchModal } from "@/components/global-search-modal"
import { NotificationCenter } from "@/components/notification-center"
import { useAuth } from "@/contexts/AuthContext"
import { v4 as uuidv4 } from "uuid"
import { normalColors } from "@/lib/colors"

const allColors = normalColors

export default function SystemDashboard() {
  const params = useParams()
  const router = useRouter()
  const systemId = params.systemId as string
  
  const {
    requirements: allRequirements,
    users,
    filters,
    setFilters,
    addRequirement,
    updateRequirement,
    deleteRequirement,
  } = useScrumBoardContext()
  
  const { currentSystem, setCurrentSystem, systems } = useSystem()
  const { user: loggedUser } = useAuth()

  // Filtrar requisitos por sistema
  const requirements = useMemo(() => {
    return allRequirements.filter((req) => req.systemId === systemId)
  }, [allRequirements, systemId])

  // Aplicar filtros aos requisitos do sistema
  const filteredRequirements = useMemo(() => {
    return requirements.filter((req) => {
      if (filters.search && !req.title.toLowerCase().includes(filters.search.toLowerCase())) {
        return false
      }
      if (filters.status !== "all" && req.status !== filters.status) {
        return false
      }
      if (filters.priority !== "all" && req.priority !== filters.priority) {
        return false
      }
      if (filters.assignee !== "all" && req.owner && req.owner.id !== filters.assignee) {
        return false
      }
      if (filters.tags.length > 0 && !filters.tags.some((tag) => (req.tags || []).includes(tag))) {
        return false
      }
      return true
    })
  }, [requirements, filters])

  // Calcular stats apenas para requisitos do sistema
  const projectStats = useMemo(() => {
    const allTasks = requirements.flatMap((req) => req.tasks || [])
    const completedTasks = allTasks.filter((task) => task.status === "done")
    const overdueTasks = allTasks.filter(
      (task) => task.endDate && new Date(task.endDate) < new Date() && task.status !== "done",
    )
    const tasksInProgress = allTasks.filter((task) => task.status === "progress")

    return {
      totalRequirements: requirements.length,
      totalTasks: allTasks.length,
      completedTasks: completedTasks.length,
      overdueTasks: overdueTasks.length,
      tasksInProgress: tasksInProgress.length,
      averageCompletionTime: 0,
    }
  }, [requirements])

  // Carregar sistema atual
  useEffect(() => {
    if (systemId && systems.length > 0) {
      const system = systems.find((s) => s.id === systemId)
      if (system) {
        setCurrentSystem(system)
      } else {
        // Sistema não encontrado, redirecionar
        router.push("/systems")
      }
    }
  }, [systemId, systems, setCurrentSystem, router])

  const [isRequirementDialogOpen, setIsRequirementDialogOpen] = useState(false)
  const [newRequirement, setNewRequirement] = useState({
    title: "",
    description: "",
    color: "bg-blue-500",
    priority: "medium" as const,
    requirementType: "",
  })

  // Atualizar cor padrão quando o sistema mudar
  useEffect(() => {
    if (currentSystem) {
      setNewRequirement(prev => ({
        ...prev,
        color: currentSystem.color || "bg-blue-500"
      }))
    }
  }, [currentSystem])

  const [selectedRequirementForActivation, setSelectedRequirementForActivation] = useState<Requirement | null>(null)
  const [isActivationModalOpen, setIsActivationModalOpen] = useState(false)
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false)
  const [isCreateTemplateModalOpen, setIsCreateTemplateModalOpen] = useState(false)
  const [isWeeklyReportModalOpen, setIsWeeklyReportModalOpen] = useState(false)
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false)
  const [requirementToDelete, setRequirementToDelete] = useState<Requirement | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [detailRequirement, setDetailRequirement] = useState<Requirement | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  // Usar filteredRequirements para as tabs e contadores
  const activeRequirements = filteredRequirements.filter((req) => req.status === "active")
  const completedRequirements = filteredRequirements.filter((req) => req.status === "completed")

  const handleAddRequirement = async () => {
    if (!newRequirement.title.trim()) {
      alert("Por favor, insira um título para o requisito")
      return
    }

    if (!loggedUser) {
      alert("Usuário não está logado")
      return
    }

    if (!systemId) {
      alert("Sistema não encontrado")
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
        systemId: systemId,
        requirementType: newRequirement.requirementType || undefined,
      }

      await addRequirement(requirementData)

      setNewRequirement({
        title: "",
        description: "",
        color: currentSystem?.color || "bg-blue-500",
        priority: "medium" as const,
        requirementType: "",
      })

      setIsRequirementDialogOpen(false)
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
      <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group relative">
        <Link href={`/requirement/${requirement.id}`}>
          <CardHeader className={`${requirement.color} text-white relative overflow-hidden`}>
            <div className="absolute inset-0 bg-gradient-to-r from-black/0 to-black/10"></div>
            <div className="relative">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-1 group-hover:underline">{requirement.title}</CardTitle>
                  <div className="flex items-center gap-2 flex-wrap">
                    {requirement.requirementType && (
                      <Badge variant="secondary" className="bg-white/30 text-white text-xs">
                        {requirement.requirementType}
                      </Badge>
                    )}
                    <Badge variant="secondary" className="bg-white/20 text-white capitalize text-xs">
                      {requirement.status === "pending-approval" ? "Aguardando Aprovação" : requirement.status}
                    </Badge>
                    <Badge variant="secondary" className="bg-white/20 text-white capitalize text-xs">
                      {requirement.priority}
                    </Badge>
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

          {isPendingApproval && (
            <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded text-center">
              <span className="text-sm text-yellow-800 font-medium">Aguardando aprovação</span>
            </div>
          )}

          {requirement.status === "active" && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-medium">Progresso Geral</span>
                <span className="text-gray-600">{progress.toFixed(0)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

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

            {requirement.owner && (
              <div className="flex items-center gap-1">
                <Avatar className="w-5 h-5">
                  {requirement.owner.avatar ? (
                    <AvatarImage src={getAvatarUrl(requirement.owner.avatar)} alt={requirement.owner.name} />
                  ) : null}
                  <AvatarFallback className="text-xs">
                    {requirement.owner.name.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <span>{requirement.owner.name.split(" ")[0]}</span>
              </div>
            )}
          </div>

          <div className="absolute top-2 right-2 z-10">
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 opacity-70 hover:opacity-100 hover:bg-white/20 transition-all"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {canActivate && (
                  <>
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setSelectedRequirementForActivation(requirement)
                        setIsActivationModalOpen(true)
                      }}
                      className="text-green-700 focus:text-green-700 focus:bg-green-50 cursor-pointer"
                    >
                      <Play className="mr-2 h-4 w-4" />
                      <span className="font-medium">Ativar Requisito</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                
                <DropdownMenuLabel className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase">
                  Mudar Status
                </DropdownMenuLabel>
                
                {requirement.status !== "planning" && (
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      updateRequirement(requirement.id, { status: "planning" })
                    }}
                    className="cursor-pointer"
                  >
                    <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                    <span>Planejamento</span>
                  </DropdownMenuItem>
                )}
                {requirement.status !== "active" && (
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      updateRequirement(requirement.id, { status: "active" })
                    }}
                    className="cursor-pointer"
                  >
                    <Play className="mr-2 h-4 w-4 text-blue-500" />
                    <span>Ativo</span>
                  </DropdownMenuItem>
                )}
                {requirement.status !== "on-hold" && (
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      updateRequirement(requirement.id, { status: "on-hold" })
                    }}
                    className="cursor-pointer"
                  >
                    <Settings className="mr-2 h-4 w-4 text-yellow-500" />
                    <span>Em Espera</span>
                  </DropdownMenuItem>
                )}
                {requirement.status !== "completed" && (
                  <DropdownMenuItem 
                    onClick={async (e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      try {
                        console.log("Arquivando requisito:", requirement.id)
                        const result = await updateRequirement(requirement.id, { status: "completed" })
                        console.log("Requisito arquivado com sucesso:", result)
                      } catch (error) {
                        console.error("Erro ao arquivar requisito:", error)
                        alert("Erro ao arquivar requisito. Verifique o console para mais detalhes.")
                      }
                    }}
                    className="cursor-pointer text-green-700 focus:text-green-700 focus:bg-green-50"
                  >
                    <Archive className="mr-2 h-4 w-4" />
                    <span className="font-medium">Arquivar</span>
                  </DropdownMenuItem>
                )}
                {requirement.status !== "cancelled" && (
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      updateRequirement(requirement.id, { status: "cancelled" })
                    }}
                    className="cursor-pointer text-orange-600 focus:text-orange-600 focus:bg-orange-50"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Cancelar</span>
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuSeparator />
                
                <DropdownMenuLabel className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase">
                  Ações
                </DropdownMenuLabel>
                
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setDetailRequirement(requirement)
                    setIsDetailOpen(true)
                  }}
                  className="cursor-pointer"
                >
                  <Edit className="mr-2 h-4 w-4 text-gray-500" />
                  <span>Editar Detalhes</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleDeleteRequirement(requirement)
                  }}
                  className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span className="font-medium">Excluir Requisito</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!currentSystem || !systemId) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">Carregando sistema...</p>
          </div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/systems")}
                  className="hover:bg-gray-100"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Sistemas
                </Button>
                <div className="h-6 w-px bg-gray-300" />
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded ${currentSystem.color} shadow-sm`} />
                  <h1 className="text-2xl font-bold text-gray-900">{currentSystem.name}</h1>
                </div>
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
                      <DialogDescription>
                        Adicione um novo requisito ao sistema {currentSystem.name}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="title">Título *</Label>
                        <Input
                          id="title"
                          value={newRequirement.title}
                          onChange={(e) => setNewRequirement({ ...newRequirement, title: e.target.value })}
                          placeholder="Ex: Implementar CURIA"
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
                      {currentSystem.requirementTypes && currentSystem.requirementTypes.length > 0 && (
                        <div className="grid gap-2">
                          <Label htmlFor="requirementType">Tipo de Requisito</Label>
                          <Select
                            value={newRequirement.requirementType}
                            onValueChange={(value) => setNewRequirement({ ...newRequirement, requirementType: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                            <SelectContent>
                              {currentSystem.requirementTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
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
                          <div className="flex gap-1 flex-wrap max-h-32 overflow-y-auto">
                            {allColors.map((color) => (
                              <button
                                key={color}
                                type="button"
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
                <SelectItem value="cancelled">Cancelado</SelectItem>
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

          <Tabs defaultValue="active" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="active">
                Requisitos Ativos ({filteredRequirements.filter((r) => r.status === "active").length})
              </TabsTrigger>
              <TabsTrigger value="planning">
                Em Planejamento ({filteredRequirements.filter((r) => r.status === "planning").length})
              </TabsTrigger>
              <TabsTrigger value="on-hold">
                Em Espera ({filteredRequirements.filter((r) => r.status === "on-hold").length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active">
              {filteredRequirements.filter((req) => req.status === "active").length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredRequirements
                    .filter((req) => req.status === "active")
                    .map((requirement) => (
                      <RequirementCard key={requirement.id} requirement={requirement} />
                    ))}
                </div>
              ) : (
                <div className="text-center py-12">
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
              {filteredRequirements.filter((r) => r.status === "planning").length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredRequirements
                    .filter((req) => req.status === "planning")
                    .map((requirement) => (
                      <RequirementCard key={requirement.id} requirement={requirement} />
                    ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum requisito em planejamento</h3>
                  <p className="text-gray-600">Todos os requisitos já estão em desenvolvimento</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="on-hold">
              {filteredRequirements.filter((r) => r.status === "on-hold").length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredRequirements
                    .filter((req) => req.status === "on-hold")
                    .map((requirement) => (
                      <RequirementCard key={requirement.id} requirement={requirement} />
                    ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum requisito em espera</h3>
                  <p className="text-gray-600">Não há requisitos pausados no momento</p>
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

        <RequirementDetailModal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          requirement={detailRequirement}
          users={users}
          onUpdate={(updates) => {
            if (detailRequirement) {
              updateRequirement(detailRequirement.id, updates as any)
            }
          }}
        />

        <GlobalSearchModal
          isOpen={isGlobalSearchOpen}
          onClose={() => setIsGlobalSearchOpen(false)}
          requirements={requirements}
          users={users}
        />

        <RequirementTemplatesModal
          isOpen={isTemplatesModalOpen}
          onClose={() => setIsTemplatesModalOpen(false)}
          onCreateFromTemplate={(template: any) => {
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
              tasks: template.defaultTasks?.map((task: any) => ({
                ...task,
                id: uuidv4(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              })) || [],
              milestones: [],
              comments: [],
              dependencies: [],
              tags: [],
              approvalRequired: false,
              systemId: systemId,
            }
            addRequirement(requirement)
          }}
          onSaveAsTemplate={(templateData: any) => {
            console.log("Template salvo:", templateData)
          }}
        />

        <CreateTemplateModal
          requirements={requirements}
          isOpen={isCreateTemplateModalOpen}
          onClose={() => setIsCreateTemplateModalOpen(false)}
          onSaveTemplate={(templateData: any) => {
            console.log("Template salvo:", templateData)
          }}
        />

        <WeeklyReportModal
          isOpen={isWeeklyReportModalOpen}
          onClose={() => setIsWeeklyReportModalOpen(false)}
          requirements={requirements}
          projectStats={projectStats}
        />

        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Exclusão</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja excluir o requisito "{requirementToDelete?.title}"? 
                Esta ação não pode ser desfeita.
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

