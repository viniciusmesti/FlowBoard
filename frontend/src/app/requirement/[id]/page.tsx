"use client"
 // statusColumns
import { useState, useEffect } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Plus, Settings, Users, Clock, MoreHorizontal, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AuthGuard } from "@/components/auth-guard"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useScrumBoardContext } from "@/contexts/ScrumBoardContext"
import { useDragAndDrop } from "@/hooks/useDragAndDrop"
import { useNotifications } from "@/contexts/NotificationContext"
import { TaskCard } from "@/components/task-card"
import { TaskDetailModal } from "@/components/task-detail-modal"
import type { Task, Requirement } from "@/types"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { v4 as uuidv4 } from 'uuid'

const statusColumns = [
  { id: "backlog", title: "Backlog", color: "bg-gray-400" },
  { id: "todo", title: "To Do", color: "bg-blue-400" },
  { id: "progress", title: "Em Progresso", color: "bg-orange-400" },
  { id: "review", title: "Em Revisão", color: "bg-purple-400" },
  { id: "done", title: "Concluído", color: "bg-green-400" },
] as const

const TAG_OPTIONS = [
  "Backend", "Frontend", "Banco de dados", "Deploy", "UI/UX", "Docker", "DevOps",
  "API", "Testes", "Documentação", "Infraestrutura", "Mobile", "Integração",
  "Segurança", "Performance", "Bug", "Refatoração", "Pesquisa", "Suporte", "Analytics", "Automação"
];

export default function RequirementPage() {
  const params = useParams()
  const router = useRouter()
  const requirementId = params.id as string
  const searchParams = useSearchParams() 
  const taskIdFromQuery = searchParams.get('taskId')

  const { requirements, users, addTask, updateTask, deleteTask, moveTask, updateRequirement, deleteRequirement, addComment, addSubtask, updateSubtask, deleteSubtask } = useScrumBoardContext()
  const { addNotification } = useNotifications()
  const { draggedTask, dragOverColumn, handleDragStart, handleDragEnd, handleDragOver, handleDragLeave, handleDrop } =
    useDragAndDrop()
  const { user: loggedUser } = useAuth()

  const [requirement, setRequirement] = useState<Requirement | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium" as const,
    assignee: "",
    endDate: "",
    estimatedHours: "",
    tags: [] as string[],
  })

  const usersWithLogged = users.some(u => u.id === loggedUser?.id)
    ? users
    : [...users, ...(loggedUser ? [loggedUser] : [])]

  useEffect(() => {
    const foundRequirement = requirements.find((req) => req.id === requirementId)
    if (foundRequirement) {
      setRequirement(foundRequirement)
    } else {
      setRequirement(null)
    }
  }, [requirementId, requirements])

  useEffect(() => {
    console.log('DEBUG: requirement', requirement);
    console.log('DEBUG: taskIdFromQuery', taskIdFromQuery);
    if (
      requirement &&
      taskIdFromQuery
      ) {
      const task = requirement.tasks.find(t => t.id === taskIdFromQuery);
      console.log('DEBUG: task encontrada', task);
      if (task) {
        setSelectedTask(task);
        setIsTaskDetailOpen(true);
      }
    }
  }, [requirement, taskIdFromQuery]);

  useEffect(() => {
    console.log('DEBUG: requirement carregado', requirement);
  }, [requirement]);

  useEffect(() => {
    console.log('DEBUG: requirements do contexto', requirements);
  }, [requirements]);

  if (!requirement) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Requisito não encontrado</h2>
          <p className="text-gray-600 mb-4">O requisito que você está procurando não existe.</p>
          <Link href="/">
            <Button>Voltar ao Dashboard</Button>
          </Link>       
         </div>
      </div>
    )
  }

  const handleAddTask = () => {
    if (!newTask.title.trim()) {
      alert("Por favor, insira um título para a task")
      return
    }

    if (!loggedUser) {
      alert("Usuário não está logado")
      return
    }

    const assignee = usersWithLogged.find((u) => u.id === newTask.assignee) || loggedUser
    const assigneeId = assignee && assignee.id ? assignee.id : undefined;

    const taskData = {
      title: newTask.title,
      description: newTask.description,
      priority: newTask.priority,
      ownerId: loggedUser.id,
      ...(assigneeId ? { assigneeId } : {}),
      endDate: newTask.endDate || undefined,
      estimatedHours: newTask.estimatedHours ? Number(newTask.estimatedHours) : undefined,
      tags: Array.isArray(newTask.tags) ? newTask.tags : [],
      status: "backlog" as const,
      reporter: loggedUser,
      comments: [],
      attachments: [],
      activities: [],
      subtasks: [],
      dependencies: [],
    }

    addTask(requirement.id, taskData)

    // Reset form
    setNewTask({
      title: "",
      description: "",
      priority: "medium",
      assignee: "",
      endDate: "",
      estimatedHours: "",
      tags: [],
    })

    // Close dialog
    setIsTaskDialogOpen(false)
  }

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task)
    setIsTaskDetailOpen(true)
  }

  const handleTaskUpdate = async (updates: Partial<Task>) => {
    if (selectedTask) {
      let description = "";
      if (updates.status && updates.status !== selectedTask.status) {
        description += `Status alterado de \"${selectedTask.status}\" para \"${updates.status}\". `;
      }
      if (updates.priority && updates.priority !== selectedTask.priority) {
        description += `Prioridade alterada de \"${selectedTask.priority}\" para \"${updates.priority}\". `;
      }
      if (updates.assignee && updates.assignee.id !== selectedTask.assignee?.id) {
        description += `Responsável alterado para \"${updates.assignee.name}\". `;
      }
      if (updates.title && updates.title !== selectedTask.title) {
        description += `Título alterado. `;
      }
      if (updates.description && updates.description !== selectedTask.description) {
        description += `Descrição alterada. `;
      }
      if (typeof updates.estimatedHours === "number" && updates.estimatedHours !== selectedTask.estimatedHours) {
        description += `Tempo estimado alterado de ${selectedTask.estimatedHours ?? 0}h para ${updates.estimatedHours}h. `;
      }
      if (typeof updates.actualHours === "number" && updates.actualHours !== selectedTask.actualHours) {
        description += `Tempo gasto alterado de ${selectedTask.actualHours ?? 0}h para ${updates.actualHours}h. `;
      }
      let activities = updates.activities ?? selectedTask.activities ?? [];
      if (description && loggedUser) {
        activities = [
          ...activities,
          {
            type: "updated" as const,
            user: loggedUser,
            description: description.trim(),
            timestamp: new Date().toISOString(),
          },
        ];
      }
      const updatedTask = await updateTask(requirement.id, selectedTask.id, { ...updates, activities });
      if (updatedTask) {
        setSelectedTask(updatedTask);
      }
      addNotification({
        type: "info",
        title: "Task Atualizada",
        message: `\"${selectedTask.title}\" foi atualizada`,
        duration: 3000,
      });
    }
  };

  const handleAddComment = async (content: string) => {
    if (selectedTask && loggedUser) {
      const comment = await addComment(requirement.id, selectedTask.id, content, loggedUser.id)
      setSelectedTask(prev => prev ? { ...prev, comments: [...(prev.comments || []), comment] } : prev)
    }
  };

  const handleMoveTask = (taskId: string, newStatus: Task["status"]) => {
    moveTask(requirement.id, taskId, newStatus)
  }

  const calculateProgress = () => {
    if (requirement.tasks.length === 0) return 0
    const completedTasks = requirement.tasks.filter((task) => task.status === "done").length
    return (completedTasks / requirement.tasks.length) * 100
  }

  const getTaskStats = () => {
    const total = requirement.tasks.length
    const completed = requirement.tasks.filter((task) => task.status === "done").length
    const inProgress = requirement.tasks.filter((task) => task.status === "progress").length
    const overdue = requirement.tasks.filter(
      (task) => task.endDate && new Date(task.endDate) < new Date() && task.status !== "done",
    ).length

    return { total, completed, inProgress, overdue }
  }

  const progress = calculateProgress()
  const stats = getTaskStats()

  const handleMarkAsCompleted = () => {
    updateRequirement(requirement.id, { status: "completed" })
    addNotification({
      type: "success",
      title: "Requisito Concluído",
      message: `"${requirement.title}" foi marcado como concluído!`,
      duration: 5000,
    })
    router.push("/")
  }

  const handleDeleteRequirement = () => {
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteRequirement = () => {
    if (requirement) {
      deleteRequirement(requirement.id)
      addNotification({
        type: "info",
        title: "Requisito Excluído",
        message: `"${requirement.title}" foi excluído com sucesso`,
        duration: 3000,
      })
      router.push("/")
    }
  }

  const handleCloseTaskModal = () => {
    setIsTaskDetailOpen(false);
    setSelectedTask(null);
    // Remove o taskId da URL
    const params = new URLSearchParams(window.location.search);
    params.delete('taskId');
    router.replace(`/requirement/${requirementId}${params.toString() ? `?${params.toString()}` : ''}`);
  };

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
            <div className="text-sm text-gray-500">Dashboard / Requisitos / {requirement.title}</div>
          </div>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-4 h-4 rounded-full ${requirement.color}`}></div>
                <h1 className="text-2xl font-bold text-gray-900">{requirement.title}</h1>
                <Badge className="capitalize">{requirement.status}</Badge>
                <Badge variant="outline" className="capitalize">
                  {requirement.priority}
                </Badge>
              </div>
              <p className="text-gray-600 mb-4">{requirement.description}</p>

              {/* Progress and Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Progresso Geral</div>
                  <div className="flex items-center gap-2">
                    <Progress value={progress} className="flex-1 h-2" />
                    <span className="text-sm font-medium">{progress.toFixed(0)}%</span>
                  </div>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="text-sm text-blue-600 mb-1">Total Tasks</div>
                  <div className="text-xl font-bold text-blue-700">{stats.total}</div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-sm text-green-600 mb-1">Concluídas</div>
                  <div className="text-xl font-bold text-green-700">{stats.completed}</div>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg">
                  <div className="text-sm text-orange-600 mb-1">Em Progresso</div>
                  <div className="text-xl font-bold text-orange-700">{stats.inProgress}</div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {progress === 100 && requirement.status !== "completed" && (
                <Button onClick={handleMarkAsCompleted} className="bg-green-600 hover:bg-green-700">
                  Marcar como Concluído
                </Button>
              )}

              <Dialog open={isTaskDialogOpen} onOpenChange={(open) => {
                setIsTaskDialogOpen(open)
                if (open && loggedUser) {
                  setNewTask((prev) => ({
                    ...prev,
                    assignee: loggedUser.id
                  }))
                }
              }}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Task
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Nova Task</DialogTitle>
                    <DialogDescription>Adicionar nova task ao requisito: {requirement.title}</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="task-title">Título</Label>
                      <Input
                        id="task-title"
                        value={newTask.title}
                        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                        placeholder="Ex: Criar tela de login"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="task-description">Descrição</Label>
                      <Textarea
                        id="task-description"
                        value={newTask.description}
                        onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                        placeholder="Descreva a task em detalhes..."
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>Prioridade</Label>
                        <Select
                          value={newTask.priority}
                          onValueChange={(value: any) => setNewTask({ ...newTask, priority: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Baixa</SelectItem>
                            <SelectItem value="medium">Média</SelectItem>
                            <SelectItem value="high">Alta</SelectItem>
                            <SelectItem value="urgent">Urgente</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label>Responsável</Label>
                        <Select
                          value={newTask.assignee}
                          onValueChange={(value) => setNewTask({ ...newTask, assignee: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecionar" />
                          </SelectTrigger>
                          <SelectContent>
                            {usersWithLogged.map((user) => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="end-date">Data de Entrega</Label>
                        <Input
                          id="end-date"
                          type="date"
                          value={newTask.endDate}
                          onChange={(e) => setNewTask({ ...newTask, endDate: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="estimated-hours">Horas Estimadas</Label>
                        <Input
                          id="estimated-hours"
                          type="number"
                          value={newTask.estimatedHours}
                          onChange={(e) => setNewTask({ ...newTask, estimatedHours: e.target.value })}
                          placeholder="Ex: 8"
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="tags">Tags</Label>
                      <div className="flex flex-wrap gap-2">
                        {TAG_OPTIONS.map((tag) => (
                          <label key={tag} className="flex items-center gap-1 text-xs cursor-pointer">
                            <input
                              type="checkbox"
                              checked={Array.isArray(newTask.tags) && newTask.tags.includes(tag)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setNewTask({ ...newTask, tags: [...(Array.isArray(newTask.tags) ? newTask.tags : []), tag] })
                                } else {
                                  setNewTask({ ...newTask, tags: (Array.isArray(newTask.tags) ? newTask.tags : []).filter(t => t !== tag) })
                                }
                              }}
                            />
                            {tag}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAddTask}>Criar Task</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleDeleteRequirement} className="text-red-600">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir Requisito
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {stats.overdue > 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <Clock className="w-4 h-4" />
              <span className="font-medium">Atenção: {stats.overdue} task(s) atrasada(s)</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {statusColumns.map((column) => {
            const columnTasks = requirement.tasks.filter((task) => task.status === column.id)
            const isDragOver = dragOverColumn === column.id

            return (
              <div
                key={column.id}
                className={`bg-white rounded-lg p-4 shadow-sm transition-all duration-200 ${
                  isDragOver ? "ring-2 ring-blue-400 bg-blue-50" : ""
                }`}
                onDragOver={(e) => handleDragOver(e, column.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, column.id as Task["status"], handleMoveTask)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${column.color}`}></div>
                    <h3 className="font-semibold text-gray-700">{column.title}</h3>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {columnTasks.length}
                  </Badge>
                </div>

                <div className="space-y-3 min-h-[400px]">
                  {columnTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onStatusChange={(newStatus) => handleMoveTask(task.id, newStatus)}
                      onEdit={() => {
                        setSelectedTask(task)
                        setIsTaskDetailOpen(true)
                      }}
                      onDelete={() => {
                        deleteTask(requirement.id, task.id)
                        addNotification({
                          type: "info",
                          title: "Task Removida",
                          message: `"${task.title}" foi removida`,
                          duration: 3000,
                        })
                      }}
                      onClick={() => handleTaskClick(task)}
                      isDragging={draggedTask?.id === task.id}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                      onUpdateTask={(updates) => {
                        if (updates.status === "done" && loggedUser) {
                          const newActivity = {
                            type: 'moved' as const,
                            user: loggedUser,
                            description: `Task concluída por ${loggedUser.name}`,
                            timestamp: new Date().toISOString(),
                          }
                          const newActivities = [...(task.activities || []), newActivity]
                          console.log('DEBUG: Salvando activities ao concluir', newActivities)
                          updateTask(requirement.id, task.id, {
                            ...updates,
                            activities: newActivities,
                          })
                        } else {
                          updateTask(requirement.id, task.id, updates)
                        }
                      }}
                    />
                  ))}

                  {columnTasks.length === 0 && (
                    <div
                      className={`text-center py-8 border-2 border-dashed rounded-lg transition-colors ${
                        isDragOver ? "border-blue-400 bg-blue-100" : "border-gray-200"
                      }`}
                    >
                      <p className="text-sm text-gray-400">{isDragOver ? "Solte aqui" : "Nenhuma task"}</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Team Section */}
        <div className="mt-8 bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Equipe do Requisito
          </h3>
          <div className="flex items-center gap-4">
            {/* Owner */}
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarFallback>
                  {requirement.owner.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium text-sm">{requirement.owner.name}</div>
                <div className="text-xs text-gray-600">Owner</div>
              </div>
            </div>

            {/* Assignees */}
            {Array.from(
              new Map(
                requirement.tasks
                  .map((task) => task.assignee)
                  .filter((user): user is import("@/types").User => Boolean(user))
                  .map((user) => [user.id, user])
              ).values()
            ).map((user) => (
              <div key={`assignee-${user!.id}`} className="flex items-center gap-2">
                <Avatar className="w-8 h-8">
                  {user.avatar ? (
                    <AvatarImage src={user.avatar} alt={user.name} />
                  ) : null}
                  <AvatarFallback className="text-xs">
                    {user!.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium text-sm">{user!.name}</div>
                  <div className="text-xs text-gray-600">
                    {requirement.tasks.filter((task) => task.assignee?.id === user.id).length} tasks
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Task Detail Modal */}
        <TaskDetailModal
          task={selectedTask}
          users={usersWithLogged}
          isOpen={isTaskDetailOpen}
          onClose={handleCloseTaskModal}
          onUpdate={handleTaskUpdate}
          onAddComment={handleAddComment}
          addSubtask={async (subtask) => {
            if (requirement && selectedTask) {
              const updatedTask = await addSubtask(requirement.id, selectedTask.id, subtask)
              setSelectedTask(updatedTask || null)
            }
          }}
          updateSubtask={async (subtaskId, updates) => {
            if (requirement && selectedTask) {
              const updatedTask = await updateSubtask(requirement.id, selectedTask.id, subtaskId, updates)
              setSelectedTask(updatedTask || null)
            }
          }}
          deleteSubtask={async (subtaskId) => {
            if (requirement && selectedTask) {
              const updatedTask = await deleteSubtask(requirement.id, selectedTask.id, subtaskId)
              setSelectedTask(updatedTask || null)
            }
          }}
        />

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Exclusão</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja excluir o requisito "{requirement?.title}"? 
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
      </div>
      </AuthGuard>
  )
}