"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import type { Requirement, Task, User, RequirementTemplate, ProjectStats, Comment, SubTask } from "@/types"
import { useLocalStorage } from "./useLocalStorage"

// Mock users data
const mockUsers: User[] = [
  {
    id: "f437b450-5307-4f7a-a73b-27d80dc8526f",
    name: "João Silva",
    email: "joao@empresa.com",
    role: "admin",
    avatar: "/placeholder.png?height=32&width=32",
  },
  {
    id: "b0857d42-5545-4648-9a1c-6d1ae6375156",
    name: "Maria Santos",
    email: "maria@empresa.com",
    role: "developer",
    avatar: "/placeholder.png?height=32&width=32",
  },
  {
    id: "2b4236c7-a7f0-4072-9f78-75eeee833697",
    name: "Pedro Costa",
    email: "pedro@empresa.com",
    role: "developer",
    avatar: "/placeholder.png?height=32&width=32",
  },
  {
    id: "dbb35866-bd7a-4a04-a05c-ca26fcead785",
    name: "Ana Oliveira",
    email: "ana@empresa.com",
    role: "designer",
    avatar: "/placeholder.png?height=32&width=32",
  },
]

// Helper function to ensure arrays are properly initialized
const ensureArraysInitialized = (requirements: Requirement[]): Requirement[] => {
  return requirements.map((req) => ({
    ...req,
    progress: req.progress || 0,
    tasks: (req.tasks || []).map((task) => ({
      ...task,
      comments: task.comments || [],
      attachments: task.attachments || [],
      activities: task.activities || [],
      subtasks: task.subtasks || [],
      dependencies: task.dependencies || [],
      tags: task.tags || [],
    })),
    milestones: req.milestones || [],
    comments: req.comments || [],
    dependencies: req.dependencies || [],
    tags: req.tags || [],
  }))
}

// Initial requirements with proper array initialization
const createInitialRequirements = (): Requirement[] => {
  const initialRequirement: Requirement = {
    id: "1750160763095",
    title: "Sistema de Autenticação",
    description: "Implementar sistema completo de login e registro de usuários",
    status: "active",
    priority: "high",
    color: "bg-blue-500",
    owner: mockUsers[0],
    progress: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tasks: [],
    milestones: [
      {
        id: "m1",
        title: "MVP Autenticação",
        description: "Versão básica do sistema de login",
        dueDate: "2024-02-15",
        status: "pending",
        tasks: [],
      },
    ],
    comments: [],
    dependencies: [],
    tags: ["authentication", "security", "backend"],
    approvalRequired: true,
  }

  return ensureArraysInitialized([initialRequirement])
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

export function useScrumBoard() {
  // Initialize filters with default values
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    priority: "all",
    assignee: "all",
    tags: [] as string[],
  })

  // Use a custom initializer function to ensure proper initialization
  const [rawRequirements, setRawRequirements] = useLocalStorage<Requirement[]>(
    "scrum-requirements",
    createInitialRequirements(),
  )

  const [templates, setTemplates] = useLocalStorage<RequirementTemplate[]>("requirement-templates", [])
  const [users] = useState<User[]>(mockUsers)

  // Ensure requirements are properly initialized (memoized to prevent re-computation)
  const requirements = useMemo(() => {
    return ensureArraysInitialized(rawRequirements)
  }, [rawRequirements])

  // Novo estado para saber se está carregando da API
  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState<string | null>(null)

  // Buscar requisitos do backend ao carregar
  useEffect(() => {
    async function fetchRequirements() {
      setLoading(true)
      setApiError(null)
      console.log('🔍 [DEBUG] Buscando requisitos do backend:', API_URL)
      try {
        const res = await fetch(`${API_URL}/requirements`)
        console.log('📡 [DEBUG] Resposta do backend:', res.status, res.statusText)
        if (!res.ok) throw new Error("Erro ao buscar requisitos do backend")
        const data = await res.json()
        console.log('📊 [DEBUG] Dados recebidos:', data)
        setRawRequirements(data)
      } catch (err: any) {
        console.error('❌ [DEBUG] Erro ao buscar requisitos:', err)
        setApiError("Erro ao buscar requisitos do backend. Usando dados locais.")
      } finally {
        setLoading(false)
      }
    }
    fetchRequirements()
  }, [])

  // Funções para sincronizar com o backend
  const addRequirement = useCallback(
    async (requirement: Omit<Requirement, "id" | "createdAt" | "updatedAt">) => {
      console.log('➕ [DEBUG] Criando requisito:', requirement)
      try {
        // Transformar dados do frontend para o formato do backend
        const backendData = {
          title: requirement.title,
          description: requirement.description || '',
          color: requirement.color,
          status: requirement.status || 'planning',
          priority: requirement.priority || 'medium',
          ownerId: requirement.owner?.id, // Backend espera ownerId, não o objeto owner
          startDate: requirement.startDate,
          endDate: requirement.endDate,
          estimatedHours: requirement.estimatedHours,
          budget: requirement.budget,
          dependencies: requirement.dependencies || [],
          category: requirement.category,
          tags: requirement.tags || [],
          approvalRequired: requirement.approvalRequired || false,
        }
        console.log('📤 [DEBUG] Enviando para backend:', backendData)
        
        const res = await fetch(`${API_URL}/requirements`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(backendData),
        })
        console.log('📡 [DEBUG] Resposta POST /requirements:', res.status, res.statusText)
        if (!res.ok) {
          const errorText = await res.text()
          console.error('❌ [DEBUG] Erro na resposta:', errorText)
          throw new Error("Erro ao criar requisito no backend")
        }
        const newRequirement = await res.json()
        console.log('✅ [DEBUG] Requisito criado no backend:', newRequirement)
        setRawRequirements((prev) => [...prev, newRequirement])
        return newRequirement
      } catch (err) {
        console.error('❌ [DEBUG] Falha ao criar requisito, usando fallback local:', err)
        // Fallback local
        const newRequirement: Requirement = {
          ...requirement,
          id: Date.now().toString(),
          progress: requirement.progress || 0,
          tasks: requirement.tasks || [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          milestones: requirement.milestones || [],
          comments: requirement.comments || [],
          dependencies: requirement.dependencies || [],
          tags: requirement.tags || [],
        }
        console.log('💾 [DEBUG] Requisito criado localmente:', newRequirement)
        setRawRequirements((prev) => [...prev, newRequirement])
        return newRequirement
      }
    },
    [setRawRequirements],
  )

  const updateRequirement = useCallback(
    async (id: string, updates: Partial<Requirement>) => {
      console.log('🔄 [DEBUG] Atualizando requisito:', id, updates)
      try {
        // Transformar dados do frontend para o formato do backend
        const backendData: any = {}
        if (updates.title !== undefined) backendData.title = updates.title
        if (updates.description !== undefined) backendData.description = updates.description
        if (updates.color !== undefined) backendData.color = updates.color
        if (updates.status !== undefined) backendData.status = updates.status
        if (updates.priority !== undefined) backendData.priority = updates.priority
        if (updates.owner !== undefined) backendData.ownerId = updates.owner?.id
        if (updates.startDate !== undefined) backendData.startDate = updates.startDate
        if (updates.endDate !== undefined) backendData.endDate = updates.endDate
        if (updates.estimatedHours !== undefined) backendData.estimatedHours = updates.estimatedHours
        if (updates.budget !== undefined) backendData.budget = updates.budget
        if (updates.dependencies !== undefined) backendData.dependencies = updates.dependencies
        if (updates.category !== undefined) backendData.category = updates.category
        if (updates.tags !== undefined) backendData.tags = updates.tags
        if (updates.approvalRequired !== undefined) backendData.approvalRequired = updates.approvalRequired
        
        console.log('📤 [DEBUG] Enviando PATCH para backend:', backendData)
        
        const res = await fetch(`${API_URL}/requirements/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(backendData),
        })
        console.log('📡 [DEBUG] Resposta PATCH /requirements:', res.status, res.statusText)
        if (!res.ok) {
          const errorText = await res.text()
          console.error('❌ [DEBUG] Erro na resposta:', errorText)
          throw new Error("Erro ao atualizar requisito no backend")
        }
        const updated = await res.json()
        console.log('✅ [DEBUG] Requisito atualizado no backend:', updated)
        setRawRequirements((prev) => prev.map((req) => req.id === id ? updated : req))
      } catch (err) {
        console.error('❌ [DEBUG] Falha ao atualizar requisito, usando fallback local:', err)
        // Fallback local
        setRawRequirements((prev) =>
          prev.map((req) =>
            req.id === id
              ? {
                  ...req,
                  ...updates,
                  updatedAt: new Date().toISOString(),
                }
              : req,
          ),
        )
      }
    },
    [setRawRequirements],
  )

  const deleteRequirement = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`${API_URL}/requirements/${id}`, { method: "DELETE" })
        if (!res.ok) throw new Error("Erro ao deletar requisito no backend")
        setRawRequirements((prev) => prev.filter((req) => req.id !== id))
      } catch (err) {
        // Fallback local
        setRawRequirements((prev) => prev.filter((req) => req.id !== id))
      }
    },
    [setRawRequirements],
  )

  // Para tasks, idealmente o backend teria endpoints /tasks ou /requirements/:id/tasks
  // Aqui, fallback local se não houver endpoint
  const addTask = useCallback(
    async (requirementId: string, task: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
      console.log('➕ [DEBUG] Criando task:', task, 'para requisito:', requirementId)
      try {
        const res = await fetch(`${API_URL}/tasks`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...task, requirementId }),
        })
        console.log('📡 [DEBUG] Resposta POST /tasks:', res.status, res.statusText)
        if (!res.ok) {
          const errorText = await res.text()
          console.error('❌ [DEBUG] Erro na resposta:', errorText)
          throw new Error("Erro ao criar task no backend")
        }
        const newTask = await res.json()
        console.log('✅ [DEBUG] Task criada no backend:', newTask)
        setRawRequirements((prev) =>
          prev.map((req) =>
            req.id === requirementId
              ? { ...req, tasks: [...(req.tasks || []), newTask], updatedAt: new Date().toISOString() }
              : req,
          ),
        )
        return newTask
      } catch (err) {
        console.error('❌ [DEBUG] Falha ao criar task, usando fallback local:', err)
        // Fallback local
        const newTask: Task = {
          ...task,
          assignee: task.assignee ?? undefined,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          comments: task.comments || [],
          attachments: task.attachments || [],
          activities: task.activities || [],
          subtasks: task.subtasks || [],
          dependencies: task.dependencies || [],
          tags: task.tags || [],
        }
        setRawRequirements((prev) =>
          prev.map((req) =>
            req.id === requirementId
              ? { ...req, tasks: [...(req.tasks || []), newTask], updatedAt: new Date().toISOString() }
              : req,
          ),
        )
        return newTask
      }
    },
    [setRawRequirements],
  )

  const updateTask = useCallback(
    async (requirementId: string, taskId: string, updates: Partial<Task>) => {
      try {
        // Endpoint correto para atualizar task
        const res = await fetch(`${API_URL}/tasks/${taskId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });
        if (!res.ok) throw new Error("Erro ao atualizar task no backend");
        const updatedTask = await res.json();
        setRawRequirements((prev) =>
          prev.map((req) =>
            req.id === requirementId
              ? {
                  ...req,
                  tasks: (req.tasks || []).map((task) => (task.id === taskId ? updatedTask : task)),
                  updatedAt: new Date().toISOString(),
                }
              : req,
          ),
        );
        return updatedTask;
      } catch (err) {
        // Fallback local
        let updatedTask: Task | undefined = undefined;
        setRawRequirements((prev) =>
          prev.map((req) =>
            req.id === requirementId
              ? {
                  ...req,
                  tasks: (req.tasks || []).map((task) => {
                    if (task.id === taskId) {
                      updatedTask = {
                        ...task,
                        ...updates,
                        updatedAt: new Date().toISOString(),
                        comments: updates.comments ?? task.comments ?? [],
                        attachments: updates.attachments ?? task.attachments ?? [],
                        activities: updates.activities ?? task.activities ?? [],
                        subtasks: updates.subtasks ?? task.subtasks ?? [],
                        dependencies: updates.dependencies ?? task.dependencies ?? [],
                        tags: updates.tags ?? task.tags ?? [],
                      };
                      return updatedTask;
                    }
                    return task;
                  }),
                  updatedAt: new Date().toISOString(),
                }
              : req,
          ),
        );
        return updatedTask;
      }
    },
    [setRawRequirements],
  );

  const deleteTask = useCallback(
    async (requirementId: string, taskId: string) => {
      try {
        const res = await fetch(`${API_URL}/tasks/${taskId}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Erro ao deletar task no backend");
        setRawRequirements((prev) =>
          prev.map((req) =>
            req.id === requirementId
              ? { ...req, tasks: (req.tasks || []).filter((task) => task.id !== taskId), updatedAt: new Date().toISOString() }
              : req,
          ),
        );
      } catch (err) {
        // Fallback local
        setRawRequirements((prev) =>
          prev.map((req) =>
            req.id === requirementId
              ? { ...req, tasks: (req.tasks || []).filter((task) => task.id !== taskId), updatedAt: new Date().toISOString() }
              : req,
          ),
        );
      }
    },
    [setRawRequirements],
  );

  const moveTask = useCallback(
    (requirementId: string, taskId: string, newStatus: Task["status"]) => {
      updateTask(requirementId, taskId, { status: newStatus })
    },
    [updateTask],
  )

  const addComment = useCallback(
    async (requirementId: string, taskId: string, content: string, authorId: string) => {
      try {
        const res = await fetch(`${API_URL}/tasks/${taskId}/comments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content, authorId }),
        })
        if (!res.ok) throw new Error("Erro ao adicionar comentário no backend")
        const newComment: Comment = await res.json()
        setRawRequirements(prev =>
          prev.map(req =>
            req.id === requirementId
              ? {
                  ...req,
                  tasks: (req.tasks || []).map(task =>
                    task.id === taskId
                      ? { ...task, comments: [...(task.comments || []), newComment] }
                      : task,
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : req,
          ),
        )
        return newComment
      } catch (err) {
        const fallback: Comment = {
          id: Date.now().toString(),
          content,
          author: users.find(u => u.id === authorId)!,
          createdAt: new Date().toISOString(),
        }
        setRawRequirements(prev =>
          prev.map(req =>
            req.id === requirementId
              ? {
                  ...req,
                  tasks: (req.tasks || []).map(task =>
                    task.id === taskId
                      ? { ...task, comments: [...(task.comments || []), fallback] }
                      : task,
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : req,
          ),
        )
        return fallback
      }
    },
    [setRawRequirements, users],
  )


  const addTemplate = useCallback(
    (template: Omit<RequirementTemplate, "id" | "createdAt">) => {
      const newTemplate: RequirementTemplate = {
        ...template,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      }
      setTemplates((prev) => [...prev, newTemplate])
      return newTemplate
    },
    [setTemplates],
  )

  const deleteTemplate = useCallback(
    (id: string) => {
      setTemplates((prev) => prev.filter((template) => template.id !== id))
    },
    [setTemplates],
  )

  const createRequirementFromTemplate = useCallback(
    async (templateId: string, customData: Partial<Requirement>) => {
      const template = templates.find((t) => t.id === templateId)
      if (!template) return null

      const newRequirement = await addRequirement({
        title: customData.title || template.name,
        description: customData.description || template.description,
        status: "planning",
        priority: customData.priority || "medium",
        color: customData.color || "bg-blue-500",
        owner: customData.owner || users[0],
        progress: 0,
        tasks: [],
        milestones: [],
        comments: [],
        dependencies: [],
        tags: customData.tags || [],
        approvalRequired: customData.approvalRequired || false,
      })

      // Add template tasks to the new requirement
      if (template.defaultTasks && newRequirement && newRequirement.id) {
        for (const taskTemplate of template.defaultTasks) {
          await addTask(newRequirement.id, {
            ...taskTemplate,
            assignee: taskTemplate.assignee ? users.find((u) => u.id === taskTemplate.assignee?.id) : undefined,
            reporter: users[0],
            comments: [],
            attachments: [],
            activities: [],
            subtasks: [],
            dependencies: [],
          })
        }
      }

      return newRequirement
    },
    [templates, users, addRequirement, addTask],
  )

  // Filter requirements based on current filters
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

  const projectStats = useMemo((): ProjectStats => {
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

  // --- SUBTASKS ---
  const addSubtask = useCallback(
    async (requirementId: string, taskId: string, subtask: Omit<SubTask, "id">) => {
      try {
        const res = await fetch(`${API_URL}/tasks/${taskId}/subtasks`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(subtask),
        })
        if (!res.ok) throw new Error("Erro ao adicionar subtask no backend")
        const updatedTask: Task = await res.json()
        setRawRequirements((prev) =>
          prev.map((req) =>
            req.id === requirementId
              ? {
                  ...req,
                  tasks: (req.tasks || []).map((task) => (task.id === taskId ? updatedTask : task)),
                  updatedAt: new Date().toISOString(),
                }
              : req,
          ),
        )
        return updatedTask
      } catch (err) {
        // Fallback local
        setRawRequirements((prev) =>
          prev.map((req) =>
            req.id === requirementId
              ? {
                  ...req,
                  tasks: (req.tasks || []).map((task) =>
                    task.id === taskId
                      ? {
                          ...task,
                          subtasks: [...(task.subtasks || []), { ...subtask, id: Date.now().toString() }],
                        }
                      : task,
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : req,
          ),
        )
      }
    },
    [setRawRequirements],
  )

  const updateSubtask = useCallback(
    async (requirementId: string, taskId: string, subtaskId: string, updates: Partial<SubTask>) => {
      try {
        const res = await fetch(`${API_URL}/tasks/${taskId}/subtasks/${subtaskId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        })
        if (!res.ok) throw new Error("Erro ao atualizar subtask no backend")
        const updatedTask: Task = await res.json()
        setRawRequirements((prev) =>
          prev.map((req) =>
            req.id === requirementId
              ? {
                  ...req,
                  tasks: (req.tasks || []).map((task) => (task.id === taskId ? updatedTask : task)),
                  updatedAt: new Date().toISOString(),
                }
              : req,
          ),
        )
        return updatedTask
      } catch (err) {
        // Fallback local
        setRawRequirements((prev) =>
          prev.map((req) =>
            req.id === requirementId
              ? {
                  ...req,
                  tasks: (req.tasks || []).map((task) =>
                    task.id === taskId
                      ? {
                          ...task,
                          subtasks: (task.subtasks || []).map((st) =>
                            st.id === subtaskId ? { ...st, ...updates } : st
                          ),
                        }
                      : task,
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : req,
          ),
        )
      }
    },
    [setRawRequirements],
  )

  const deleteSubtask = useCallback(
    async (requirementId: string, taskId: string, subtaskId: string) => {
      try {
        const res = await fetch(`${API_URL}/tasks/${taskId}/subtasks/${subtaskId}`, {
          method: "DELETE",
        })
        if (!res.ok) throw new Error("Erro ao remover subtask no backend")
        const updatedTask: Task = await res.json()
        setRawRequirements((prev) =>
          prev.map((req) =>
            req.id === requirementId
              ? {
                  ...req,
                  tasks: (req.tasks || []).map((task) => (task.id === taskId ? updatedTask : task)),
                  updatedAt: new Date().toISOString(),
                }
              : req,
          ),
        )
        return updatedTask
      } catch (err) {
        // Fallback local
        setRawRequirements((prev) =>
          prev.map((req) =>
            req.id === requirementId
              ? {
                  ...req,
                  tasks: (req.tasks || []).map((task) =>
                    task.id === taskId
                      ? {
                          ...task,
                          subtasks: (task.subtasks || []).filter((st) => st.id !== subtaskId),
                        }
                      : task,
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : req,
          ),
        )
      }
    },
    [setRawRequirements],
  )

  return {
    requirements: filteredRequirements,
    templates,
    users,
    filters,
    setFilters,
    addRequirement,
    updateRequirement,
    deleteRequirement,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    addComment,
    addTemplate,
    deleteTemplate,
    createRequirementFromTemplate,
    projectStats,
    loading,
    apiError,
    addSubtask,
    updateSubtask,
    deleteSubtask,
  }
}
