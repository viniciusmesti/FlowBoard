"use client"

import { useState, useCallback, useMemo } from "react"
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

  const addRequirement = useCallback(
    (requirement: Omit<Requirement, "id" | "createdAt" | "updatedAt">) => {
      console.log("Adding requirement:", requirement) // Debug log

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

      console.log("New requirement created:", newRequirement) // Debug log

      setRawRequirements((prev) => {
        const updated = [...prev, newRequirement]
        console.log("Updated requirements:", updated) // Debug log
        return updated
      })

      return newRequirement
    },
    [setRawRequirements],
  )

  const updateRequirement = useCallback(
    (id: string, updates: Partial<Requirement>) => {
      console.log("Updating requirement:", id, updates) // Debug log

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
    },
    [setRawRequirements],
  )

  const deleteRequirement = useCallback(
    (id: string) => {
      setRawRequirements((prev) => prev.filter((req) => req.id !== id))
    },
    [setRawRequirements],
  )

  const addTask = useCallback(
    (requirementId: string, task: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
      console.log("Adding task to requirement:", requirementId, task) // Debug log

      const newTask: Task = {
        ...task,
        assignee: task.assignee ?? undefined,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // Ensure all array properties are initialized
        comments: task.comments || [],
        attachments: task.attachments || [],
        activities: task.activities || [],
        subtasks: task.subtasks || [],
        dependencies: task.dependencies || [],
        tags: task.tags || [],
      }

      console.log("New task created:", newTask) // Debug log

      setRawRequirements((prev) => {
        const updated = prev.map((req) =>
          req.id === requirementId
            ? {
                ...req,
                tasks: [...(req.tasks || []), newTask],
                updatedAt: new Date().toISOString(),
              }
            : req,
        )
        console.log("Updated requirements after adding task:", updated) // Debug log
        return updated
      })

      return newTask
    },
    [setRawRequirements],
  )

  const updateTask = useCallback(
    (requirementId: string, taskId: string, updates: Partial<Task>) => {
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
                        // Ensure arrays remain arrays after updates
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
      )
    },
    [setRawRequirements],
  )

  const deleteTask = useCallback(
    (requirementId: string, taskId: string) => {
      setRawRequirements((prev) =>
        prev.map((req) =>
          req.id === requirementId
            ? {
                ...req,
                tasks: (req.tasks || []).filter((task) => task.id !== taskId),
                updatedAt: new Date().toISOString(),
              }
            : req,
        ),
      )
    },
    [setRawRequirements],
  )

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
    (templateId: string, customData: Partial<Requirement>) => {
      const template = templates.find((t) => t.id === templateId)
      if (!template) return null

      const newRequirement = addRequirement({
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
      if (template.defaultTasks) {
        template.defaultTasks.forEach((taskTemplate) => {
          addTask(newRequirement.id, {
            ...taskTemplate,
            assignee: taskTemplate.assignee ? users.find((u) => u.id === taskTemplate.assignee?.id) : undefined,
            reporter: users[0],
            comments: [],
            attachments: [],
            activities: [],
            subtasks: [],
            dependencies: [],
          })
        })
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
  }
}
