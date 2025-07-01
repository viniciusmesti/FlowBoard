"use client"

import type React from "react"
import type { Task } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { useNotifications } from "@/contexts/NotificationContext"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  MoreHorizontal,
  Calendar,
  Clock,
  MessageSquare,
  Paperclip,
  CheckSquare,
  AlertTriangle,
  Flag,
  GripVertical,
} from "lucide-react"
import { useState } from "react"

interface TaskCardProps {
  task: Task
  onStatusChange: (newStatus: Task["status"]) => void
  onEdit: () => void
  onDelete: () => void
  onClick: () => void
  isDragging?: boolean
  onDragStart?: (task: Task) => void
  onDragEnd?: () => void
  onUpdateTask?: (updates: Partial<Task>) => void
}

export function TaskCard({
  task,
  onStatusChange,
  onEdit,
  onDelete,
  onClick,
  isDragging = false,
  onDragStart,
  onDragEnd,
  onUpdateTask,
}: TaskCardProps) {
  const { addNotification } = useNotifications()
  const [showHoursModal, setShowHoursModal] = useState(false)
  const [hoursInput, setHoursInput] = useState("")

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

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <AlertTriangle className="w-3 h-3" />
      case "high":
        return <Flag className="w-3 h-3" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "backlog":
        return "bg-gray-100 text-gray-800"
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

  const isOverdue = task.endDate && new Date(task.endDate) < new Date() && task.status !== "done"

  // Safe array access with fallbacks
  const subtasks = task.subtasks || []
  const comments = task.comments || []
  const attachments = task.attachments || []
  const tags = task.tags || []

  const completedSubtasks = subtasks.filter((st) => st.completed).length
  const subtaskProgress = subtasks.length > 0 ? (completedSubtasks / subtasks.length) * 100 : 0

  const handleStatusChange = (newStatus: Task["status"]) => {
    const oldStatus = task.status
    if (newStatus === "done") {
      setShowHoursModal(true)
      return
    }
    onStatusChange(newStatus)
    addNotification({
      type: "success",
      title: "Task Movida",
      message: `"${task.title}" foi movida de ${oldStatus} para ${newStatus}`,
      duration: 3000,
    })
  }

  const handleDragStart = (e: React.DragEvent) => {
    if (onDragStart) {
      onDragStart(task)
    }
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/plain", task.id)
  }

  return (
      <Card
        className={`cursor-pointer hover:shadow-md transition-all duration-200 ${
          isDragging ? "opacity-50 rotate-2 scale-105" : ""
        } ${isOverdue ? "border-l-4 border-l-red-500 bg-red-50" : ""} ${task.status === "done" ? "opacity-75" : ""}`}
        onClick={onClick}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={onDragEnd}
      >
        {/* Faixa de alerta no topo do card */}
        {isOverdue && (
          <div className="flex items-center gap-2 bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-t-md">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Atrasada
          </div>
        )}
        <CardContent className="p-4 pt-3">
          {/* Drag Handle */}
          <div className="flex flex-row items-start justify-between mb-3 gap-2">
            <div className="flex flex-wrap items-center gap-2 min-w-0">
              <GripVertical className="w-4 h-4 text-gray-400 cursor-grab active:cursor-grabbing" />
              <Badge className={getPriorityColor(task.priority)} variant="secondary">
                {getPriorityIcon(task.priority)}
                <span className="ml-1 capitalize">{task.priority}</span>
              </Badge>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit()
                  }}
                >
                  Editar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    handleStatusChange("backlog")
                  }}
                >
                  Mover para Backlog
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    handleStatusChange("todo")
                  }}
                >
                  Mover para To Do
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    handleStatusChange("progress")
                  }}
                >
                  Mover para Em Progresso
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    handleStatusChange("review")
                  }}
                >
                  Mover para Revisão
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    handleStatusChange("done")
                  }}
                >
                  Marcar como Concluído
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete()
                  }}
                  className="text-red-600"
                >
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Title */}
          <h4 className={`font-medium text-sm mb-2 ${task.status === "done" ? "line-through" : ""}`}>{task.title}</h4>

          {/* Description */}
          <p className="text-xs text-gray-600 mb-3 line-clamp-2">{task.description}</p>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Subtasks Progress */}
          {subtasks.length > 0 && (
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                <span className="flex items-center gap-1">
                  <CheckSquare className="w-3 h-3" />
                  Subtasks
                </span>
                <span>
                  {completedSubtasks}/{subtasks.length}
                </span>
              </div>
              <Progress value={subtaskProgress} className="h-1" />
            </div>
          )}

          {/* Time Tracking */}
          {(task.estimatedHours || task.actualHours) && (
            <div className="flex items-center gap-4 text-xs text-gray-600 mb-3">
              {task.estimatedHours && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Est: {task.estimatedHours}h</span>
                </div>
              )}
              {task.actualHours && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Real: {task.actualHours}h</span>
                </div>
              )}
            </div>
          )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Assignee */}
            {task.assignee && (
              <Avatar className="w-6 h-6">
                <AvatarImage src={task.assignee.avatar || "/placeholder.png"} />
                <AvatarFallback className="text-xs">
                  {task.assignee.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
            )}

              {/* Comments & Attachments */}
              <div className="flex items-center gap-2 text-xs text-gray-500">
                {comments.length > 0 && (
                  <div className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    <span>{comments.length}</span>
                  </div>
                )}
                {attachments.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Paperclip className="w-3 h-3" />
                    <span>{attachments.length}</span>
                  </div>
                )}
              </div>
            </div>

          {/* Due Date */}
          {task.endDate && (
            <div className={`flex items-center gap-1 text-xs ${isOverdue ? "text-red-600" : "text-gray-500"}`}>
              <Calendar className="w-3 h-3" />
              <span>{new Date(task.endDate).toLocaleDateString("pt-BR")}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
