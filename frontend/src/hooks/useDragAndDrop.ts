"use client"

import type React from "react"

import { useState, useCallback } from "react"
import type { Task } from "@/types"

export function useDragAndDrop() {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)

  const handleDragStart = useCallback((task: Task) => {
    setDraggedTask(task)
  }, [])

  const handleDragEnd = useCallback(() => {
    setDraggedTask(null)
    setDragOverColumn(null)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, columnId: string) => {
    e.preventDefault()
    setDragOverColumn(columnId)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    // Only clear if we're leaving the column entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverColumn(null)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent, targetStatus: Task["status"], onMove: (taskId: string, newStatus: Task["status"]) => void) => {
      e.preventDefault()
      if (draggedTask && draggedTask.status !== targetStatus) {
        onMove(draggedTask.id, targetStatus)
      }
      setDraggedTask(null)
      setDragOverColumn(null)
    },
    [draggedTask],
  )

  return {
    draggedTask,
    dragOverColumn,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  }
}
