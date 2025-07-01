"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import type { Requirement, Task, User, RequirementTemplate, ProjectStats } from "@/types"
import { useLocalStorage } from "./useLocalStorage"

// Mock users data
const mockUsers: User[] = [
  {
    id: "1",
    name: "João Silva",
    email: "joao@empresa.com",
    role: "admin",
    avatar: "/placeholder.png?height=32&width=32",
  },
  {
    id: "2",
    name: "Maria Santos",
    email: "maria@empresa.com",
    role: "developer",
    avatar: "/placeholder.png?height=32&width=32",
  },
  {
    id: "3",
    name: "Pedro Costa",
    email: "pedro@empresa.com",
    role: "developer",
    avatar: "/placeholder.png?height=32&width=32",
  },
  {
    id: "4",
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
      try {
        const res = await fetch(`${API_URL}/requirements`)
        if (!res.ok) throw new Error("Erro ao buscar requisitos do backend")
        const data = await res.json()
        setRawRequirements(data)
      } catch (err: any) {
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
      try {
        const res = await fetch(`${API_URL}/requirements`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requirement),
        })
        if (!res.ok) throw new Error("Erro ao criar requisito no backend")
        const newRequirement = await res.json()
        setRawRequirements((prev) => [...prev, newRequirement])
        return newRequirement
      } catch (err) {
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
        setRawRequirements((prev) => [...prev, newRequirement])
        return newRequirement
      }
    },
    [setRawRequirements],
  )

  const updateRequirement = useCallback(
    async (id: string, updates: Partial<Requirement>) => {
      try {
        const res = await fetch(`${API_URL}/requirements/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        })
        if (!res.ok) throw new Error("Erro ao atualizar requisito no backend")
        const updated = await res.json()
        setRawRequirements((prev) => prev.map((req) => req.id === id ? updated : req))
      } catch (err) {
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
      try {
        const res = await fetch(`${API_URL}/tasks`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...task, requirementId }),
        })
        if (!res.ok) throw new Error("Erro ao criar task no backend")
        const newTask = await res.json()
        setRawRequirements((prev) =>
          prev.map((req) =>
            req.id === requirementId
              ? { ...req, tasks: [...(req.tasks || []), newTask], updatedAt: new Date().toISOString() }
              : req,
          ),
        )
        return newTask
      } catch (err) {
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
        // Notificação de sucesso pode ser disparada no componente que chama updateTask
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
                          ...updates,
                          updatedAt: new Date().toISOString(),
                          comments: updates.comments ?? task.comments ?? [],
                          attachments: updates.attachments ?? task.attachments ?? [],
                          activities: updates.activities ?? task.activities ?? [],
                          subtasks: updates.subtasks ?? task.subtasks ?? [],
                          dependencies: updates.dependencies ?? task.dependencies ?? [],
                          tags: updates.tags ?? task.tags ?? [],
                        }
                      : task,
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : req,
          ),
        );
        // Notificação de erro pode ser disparada no componente que chama updateTask
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
    addTemplate,
    deleteTemplate,
    createRequirementFromTemplate,
    projectStats,
    loading,
    apiError,
  }
}
