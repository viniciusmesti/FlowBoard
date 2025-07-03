"use client"

import { useState, useMemo } from "react"
import type { Requirement, Task, User } from "@/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, FileText, CheckSquare, MessageSquare, Calendar, UserIcon, Tag, Filter, ArrowRight } from "lucide-react"

interface GlobalSearchModalProps {
  requirements: Requirement[]
  users: User[]
  isOpen: boolean
  onClose: () => void
}

interface SearchResult {
  type: "requirement" | "task" | "comment"
  id: string
  title: string
  description: string
  requirement?: Requirement
  task?: Task
  priority?: string
  status?: string
  assignee?: User
  tags?: string[]
  dueDate?: string
  matchedText?: string
}

export function GlobalSearchModal({ requirements, users, isOpen, onClose }: GlobalSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTab, setSelectedTab] = useState("all")
  const [filters, setFilters] = useState({
    priority: "all",
    status: "all",
    assignee: "all",
    hasDeadline: false,
  })

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []

    const results: SearchResult[] = []
    const query = searchQuery.toLowerCase()

    // Search in requirements
    requirements.forEach((req) => {
      const titleMatch = req.title.toLowerCase().includes(query)
      const descMatch = req.description.toLowerCase().includes(query)
      const tagMatch = req.tags?.some((tag) => tag.toLowerCase().includes(query))

      if (titleMatch || descMatch || tagMatch) {
        results.push({
          type: "requirement",
          id: req.id,
          title: req.title,
          description: req.description,
          requirement: req,
          priority: req.priority,
          status: req.status,
          tags: req.tags,
          matchedText: titleMatch ? req.title : descMatch ? req.description : req.tags?.join(", "),
        })
      }

      // Search in tasks
      req.tasks.forEach((task) => {
        const taskTitleMatch = task.title.toLowerCase().includes(query)
        const taskDescMatch = task.description.toLowerCase().includes(query)
        const taskTagMatch = task.tags.some((tag) => tag.toLowerCase().includes(query))

        if (taskTitleMatch || taskDescMatch || taskTagMatch) {
          results.push({
            type: "task",
            id: task.id,
            title: task.title,
            description: task.description,
            requirement: req,
            task,
            priority: task.priority,
            status: task.status,
            assignee: task.assignee,
            tags: task.tags,
            dueDate: task.endDate,
            matchedText: taskTitleMatch ? task.title : taskDescMatch ? task.description : task.tags.join(", "),
          })
        }

        // Search in comments
        task.comments.forEach((comment) => {
          if (comment.content.toLowerCase().includes(query)) {
            results.push({
              type: "comment",
              id: comment.id,
              title: `Comentário em: ${task.title}`,
              description: comment.content,
              requirement: req,
              task,
              assignee: comment.author,
              matchedText: comment.content,
            })
          }
        })
      })
    })

    // Apply filters
    return results.filter((result) => {
      if (filters.priority !== "all" && result.priority !== filters.priority) return false
      if (filters.status !== "all" && result.status !== filters.status) return false
      if (filters.assignee !== "all" && result.assignee?.id !== filters.assignee) return false
      if (filters.hasDeadline && !result.dueDate) return false
      return true
    })
  }, [searchQuery, requirements, filters])

  const filteredResults = useMemo(() => {
    if (selectedTab === "all") return searchResults
    return searchResults.filter((result) => result.type === selectedTab)
  }, [searchResults, selectedTab])

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text
    const regex = new RegExp(`(${query})`, "gi")
    const parts = text.split(regex)
    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      ),
    )
  }

  const getResultIcon = (type: string) => {
    switch (type) {
      case "requirement":
        return <FileText className="w-4 h-4" />
      case "task":
        return <CheckSquare className="w-4 h-4" />
      case "comment":
        return <MessageSquare className="w-4 h-4" />
      default:
        return <Search className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "planning":
        return "bg-gray-100 text-gray-800"
      case "active":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "todo":
        return "bg-blue-100 text-blue-800"
      case "progress":
        return "bg-orange-100 text-orange-800"
      case "review":
        return "bg-purple-100 text-purple-800"
      case "done":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500 text-white"
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Busca Global
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar em requisitos, tasks, comentários..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
            <Filter className="w-4 h-4 text-gray-600" />
            <Select value={filters.priority} onValueChange={(value) => setFilters({ ...filters, priority: value })}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="urgent">Urgente</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="low">Baixa</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="planning">Planejamento</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="progress">Em Progresso</SelectItem>
                <SelectItem value="review">Revisão</SelectItem>
                <SelectItem value="done">Concluído</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.assignee} onValueChange={(value) => setFilters({ ...filters, assignee: value })}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Responsável" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant={filters.hasDeadline ? "default" : "outline"}
              size="sm"
              onClick={() => setFilters({ ...filters, hasDeadline: !filters.hasDeadline })}
            >
              <Calendar className="w-4 h-4 mr-1" />
              Com Prazo
            </Button>
          </div>

          {/* Results */}
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList>
              <TabsTrigger value="all">Todos ({searchResults.length})</TabsTrigger>
              <TabsTrigger value="requirement">
                Requisitos ({searchResults.filter((r) => r.type === "requirement").length})
              </TabsTrigger>
              <TabsTrigger value="task">Tasks ({searchResults.filter((r) => r.type === "task").length})</TabsTrigger>
              <TabsTrigger value="comment">
                Comentários ({searchResults.filter((r) => r.type === "comment").length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={selectedTab} className="max-h-96 overflow-y-auto">
              {filteredResults.length > 0 ? (
                <div className="space-y-2">
                  {filteredResults.map((result) => (
                    <div
                      key={`${result.type}-${result.id}`}
                      className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer group"
                      onClick={() => {
                        if (result.requirement) {
                          window.open(`/requirement/${result.requirement.id}`, "_blank")
                        }
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1">{getResultIcon(result.type)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{highlightText(result.title, searchQuery)}</span>
                            <Badge variant="outline" className="text-xs capitalize">
                              {result.type}
                            </Badge>
                            {result.priority && (
                              <Badge className={`text-xs ${getPriorityColor(result.priority)}`}>
                                {result.priority}
                              </Badge>
                            )}
                            {result.status && (
                              <Badge className={`text-xs ${getStatusColor(result.status)}`}>{result.status}</Badge>
                            )}
                          </div>

                          <p className="text-sm text-gray-600 line-clamp-2">
                            {highlightText(result.description, searchQuery)}
                          </p>

                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            {result.requirement && (
                              <span className="flex items-center gap-1">
                                <div className={`w-2 h-2 rounded-full ${result.requirement.color}`}></div>
                                {result.requirement.title}
                              </span>
                            )}
                            {result.assignee && (
                              <span className="flex items-center gap-1">
                                <UserIcon className="w-3 h-3" />
                                {result.assignee.name}
                              </span>
                            )}
                            {result.dueDate && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(result.dueDate).toLocaleDateString("pt-BR")}
                              </span>
                            )}
                            {result.tags && result.tags.length > 0 && (
                              <span className="flex items-center gap-1">
                                <Tag className="w-3 h-3" />
                                {result.tags.slice(0, 2).join(", ")}
                                {result.tags.length > 2 && "..."}
                              </span>
                            )}
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : searchQuery.trim() ? (
                <div className="text-center py-8 text-gray-500">
                  <Search className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>Nenhum resultado encontrado para "{searchQuery}"</p>
                  <p className="text-sm">Tente usar termos diferentes ou ajustar os filtros</p>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Search className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>Digite algo para começar a buscar</p>
                  <p className="text-sm">Busque por requisitos, tasks, comentários, tags...</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
