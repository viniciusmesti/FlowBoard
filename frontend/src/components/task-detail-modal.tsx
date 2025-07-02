"use client" 

import { useState, useEffect } from "react"
import type { Task, User, Comment, SubTask } from "@/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Calendar,
  Clock,
  UserIcon,
  Tag,
  MessageSquare,
  Paperclip,
  Plus,
  CheckSquare,
  Activity,
  Edit3,
  Save,
  X,
  AlertCircle,
} from "lucide-react"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { v4 as uuidv4 } from 'uuid'
import { useAuth } from "@/contexts/AuthContext"

interface TaskDetailModalProps {
  task: Task | null
  users: User[]
  isOpen: boolean
  onClose: () => void
  onUpdate: (updates: Partial<Task>) => void
  onAddComment: (content: string) => void
}

export function TaskDetailModal({ task, users, isOpen, onClose, onUpdate, onAddComment }: TaskDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedTask, setEditedTask] = useState<Partial<Task>>({})
  const [newComment, setNewComment] = useState("")
  const [newSubtask, setNewSubtask] = useState("")
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const { user: loggedUser } = useAuth()

  if (!task) return null

  const handleSave = () => {
    const activities = [...(task.activities || [])]
    const user = users[0] // Ajuste para o usuário atual se necessário
    const now = new Date().toISOString()

    // Log alteração de data de entrega
    if (
      editedTask.endDate &&
      editedTask.endDate !== task.endDate
    ) {
      activities.push({
        id: uuidv4(),
        type: 'updated',
        description: `Data de entrega alterada de ${task.endDate ? new Date(task.endDate).toLocaleDateString('pt-BR') : 'não definida'} para ${new Date(editedTask.endDate).toLocaleDateString('pt-BR')}`,
        user,
        timestamp: now,
        metadata: { field: 'endDate', from: task.endDate, to: editedTask.endDate },
      })
    }

    // Log alteração de tempo estimado
    if (
      typeof editedTask.estimatedHours === 'number' &&
      editedTask.estimatedHours !== task.estimatedHours
    ) {
      activities.push({
        id: uuidv4(),
        type: 'updated',
        description: `Tempo estimado alterado de ${task.estimatedHours ?? 0}h para ${editedTask.estimatedHours}h`,
        user,
        timestamp: now,
        metadata: { field: 'estimatedHours', from: task.estimatedHours, to: editedTask.estimatedHours },
      })
    }

    onUpdate({ ...editedTask, activities })
    setIsEditing(false)
    setEditedTask({})
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditedTask({})
  }

  const addComment = async () => {
    if (newComment.trim() && loggedUser) {
      await onAddComment(newComment)
      setNewComment("")
    }
  }

  const addSubtask = () => {
    if (newSubtask.trim()) {
      const subtask: SubTask = {
        id: uuidv4(),
        title: newSubtask,
        completed: false,
      }
      const updated = [...(task.subtasks || []), subtask]
      onUpdate({ subtasks: updated })
      setNewSubtask("")
    }
  }

  const toggleSubtask = (subtaskId: string) => {
    const updatedSubtasks = (task.subtasks || []).map((st) =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    )
    onUpdate({ subtasks: updatedSubtasks })
  }

  const completedSubtasks = (task.subtasks || []).filter((st) => st.completed).length
  const subtaskProgress = (task.subtasks?.length ?? 0) > 0 ? (completedSubtasks / task.subtasks.length) * 100 : 0

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(e.target.files)
    setUploadError(null)
  }

  const handleUploadFiles = async () => {
    if (!selectedFiles || selectedFiles.length === 0) return
    
    setUploading(true)
    setUploadError(null)
    
    try {
      const formData = new FormData()
      Array.from(selectedFiles).forEach(file => {
        formData.append("files", file)
      })

      // Use a variável de ambiente para a URL da API ou fallback para localhost
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      
      const res = await fetch(`${apiBase}/tasks/${task.id}/attachments`, {
        method: "POST",
        body: formData,
        headers: {
          // Don't set Content-Type for FormData, let the browser set it
        }
      })

      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(`Erro no servidor: ${res.status} ${res.statusText}. ${errorText}`)
      }

      const newAttachments = await res.json()
      onUpdate({ attachments: [...(task.attachments || []), ...newAttachments] })
      setSelectedFiles(null)
      
      // Reset the file input
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      if (fileInput) {
        fileInput.value = ''
      }
    } catch (error) {
      console.error('Erro ao fazer upload dos arquivos:', error)
      setUploadError(error instanceof Error ? error.message : 'Erro desconhecido ao fazer upload')
    } finally {
      setUploading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-muted/50 border border-border rounded-2xl shadow-2xl p-8">
        <DialogHeader>
          <div className="flex items-center justify-between mb-6">
            <DialogTitle className="text-2xl font-bold text-gray-900">
              {isEditing ? (
                <Input
                  value={editedTask.title ?? task.title}
                  onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                  className="text-2xl font-bold"
                />
              ) : (
                task.title
              )}
            </DialogTitle>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Button size="sm" onClick={handleSave}>
                    <Save className="w-4 h-4 mr-1" />
                    Salvar
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCancel}>
                    <X className="w-4 h-4 mr-1" />
                    Cancelar
                  </Button>
                </>
              ) : (
                <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                  <Edit3 className="w-4 h-4 mr-1" />
                  Editar
                </Button>
              )}
            </div>
          </div>
          <DialogDescription>
            Veja, edite ou acompanhe os detalhes, subtasks, comentários e anexos desta task.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white rounded-lg shadow p-6 border">
              <h3 className="font-bold text-lg text-gray-800 mb-2 border-b pb-2">Descrição</h3>
              {isEditing ? (
                <Textarea
                  value={editedTask.description ?? task.description}
                  onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                  rows={4}
                />
              ) : (
                <p className="text-gray-700">{task.description}</p>
              )}
            </div>

            {/* Subtasks */}
            <div className="bg-white rounded-lg shadow p-6 border">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-lg flex items-center gap-2 text-gray-800">
                  <CheckSquare className="w-4 h-4" />
                  Subtasks ({completedSubtasks}/{task.subtasks?.length || 0})
                </h3>
                <Progress value={subtaskProgress} className="w-24 h-2" />
              </div>

              <div className="space-y-2">
                {(task.subtasks || []).map((subtask) => (
                  <div key={subtask.id} className="flex items-center gap-2 p-2 rounded border bg-gray-50">
                    <Checkbox checked={subtask.completed} onCheckedChange={() => toggleSubtask(subtask.id)} />
                    <span className={subtask.completed ? "line-through text-gray-500" : ""}>{subtask.title}</span>
                    {subtask.assignee && (
                      <Avatar className="w-5 h-5 ml-auto">
                        {subtask.assignee.avatar ? (
                          <AvatarImage src={subtask.assignee.avatar} alt={subtask.assignee.name} />
                        ) : null}
                        <AvatarFallback className="text-xs">
                          {subtask.assignee.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}

                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Nova subtask..."
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addSubtask()}
                  />
                  <Button size="sm" onClick={addSubtask}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Tabs for Comments and Activity */}
            <div className="bg-white rounded-lg shadow p-6 border">
              <Tabs defaultValue="comments" className="w-full">
                <TabsList>
                  <TabsTrigger value="comments" className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Comentários ({task.comments?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="activity" className="flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Atividade ({task.activities?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="attachments" className="flex items-center gap-2">
                    <Paperclip className="w-4 h-4" />
                    Anexos ({task.attachments?.length || 0})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="comments" className="space-y-4 mt-4">
                  <div className="space-y-3">
                    {(task.comments || []).map((comment) => (
                      <div key={comment.id} className="flex gap-3 p-3 bg-gray-50 rounded border">
                        <Avatar className="w-8 h-8">
                          {comment.author?.avatar ? (
                            <AvatarImage src={comment.author.avatar} alt={comment.author?.name} />
                          ) : null}
                          <AvatarFallback>
                          {comment.author?.name
                              ? comment.author.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                              : ""}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{comment.author?.name ?? ""}</span>
                            <span className="text-xs text-gray-500">
                              {new Date(comment.createdAt).toLocaleString("pt-BR")}
                            </span>
                          </div>
                          <p className="text-sm">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 mt-2">
                    <Textarea
                      placeholder="Adicionar comentário..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={2}
                    />
                    <Button onClick={addComment}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="activity" className="mt-4">
                  <div className="space-y-3">
                    {(task.activities || []).map((activity) => (
                      <div key={activity.id} className="flex gap-3 p-3 border-l-2 border-blue-200 bg-gray-50 rounded">
                        <Avatar className="w-6 h-6">
                          {activity.user?.avatar ? (
                            <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
                          ) : null}
                          <AvatarFallback className="text-xs">
                            {activity.user?.name
                              ? activity.user.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                              : "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm">{activity.description}</p>
                          <span className="text-xs text-gray-500">
                            {new Date(activity.timestamp).toLocaleString("pt-BR")}
                          </span>
                        </div>
                      </div>
                    ))}
                    {(!task.activities || task.activities.length === 0) && (
                      <p className="text-sm text-gray-500">Nenhuma atividade registrada.</p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="attachments" className="mt-4">
                  <div className="space-y-3">
                    {/* Upload de Anexos */}
                    <div className="space-y-2">
                      <div className="flex gap-2 items-center">
                        <Input
                          type="file"
                          multiple
                          onChange={handleFileChange}
                          className="w-auto"
                          accept="*/*"
                        />
                        <Button 
                          size="sm" 
                          onClick={handleUploadFiles} 
                          disabled={uploading || !selectedFiles}
                        >
                          <Paperclip className="w-4 h-4 mr-1" />
                          {uploading ? "Enviando..." : "Anexar"}
                        </Button>
                      </div>
                      
                      {uploadError && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            {uploadError}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>

                    {(task.attachments || []).map((attachment) => (
                      <div key={attachment.id} className="flex items-center gap-3 p-3 border rounded bg-gray-50">
                        <Paperclip className="w-4 h-4" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{attachment.name}</p>
                          {attachment.size && (
                            <p className="text-xs text-gray-500">{(attachment.size / 1024).toFixed(1)} KB</p>
                          )}
                        </div>
                        <Button size="sm" variant="outline" asChild>
                          <a href={attachment.url} download>
                            Download
                          </a>
                        </Button>
                      </div>
                    ))}
                    
                    {(!task.attachments || task.attachments.length === 0) && (
                      <p className="text-sm text-gray-500">Nenhum anexo encontrado.</p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6 border space-y-6">
              {/* Status */}
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                {isEditing ? (
                  <Select
                    value={editedTask.status ?? task.status}
                    onValueChange={(value: Task["status"]) => setEditedTask({ ...editedTask, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="backlog">Backlog</SelectItem>
                      <SelectItem value="todo">To Do</SelectItem>
                      <SelectItem value="progress">Em Progresso</SelectItem>
                      <SelectItem value="review">Em Revisão</SelectItem>
                      <SelectItem value="done">Concluído</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge className="capitalize">{task.status}</Badge>
                )}
              </div>

              {/* Priority */}
              <div>
                <label className="text-sm font-medium mb-2 block">Prioridade</label>
                {isEditing ? (
                  <Select
                    value={editedTask.priority ?? task.priority}
                    onValueChange={(value: Task["priority"]) => setEditedTask({ ...editedTask, priority: value })}
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
                ) : (
                  <Badge variant="outline" className="capitalize">
                    {task.priority}
                  </Badge>
                )}
              </div>

              {/* Assignee */}
              <div>
                <label className="text-sm font-medium mb-2 flex items-center gap-2">
                  <UserIcon className="w-4 h-4" />
                  Responsável
                </label>
                {isEditing ? (
                  <Select
                    value={editedTask.assignee?.id ?? task.assignee?.id ?? ""}
                    onValueChange={(value) => {
                      const user = users.find((u) => u.id === value)
                      setEditedTask({ ...editedTask, assignee: user })
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar usuário" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : task.assignee ? (
                  <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6">
                      {task.assignee.avatar ? (
                        <AvatarImage src={task.assignee.avatar} alt={task.assignee.name} />
                      ) : null}
                      <AvatarFallback className="text-xs">
                        {task.assignee.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{task.assignee.name}</span>
                  </div>
                ) : (
                  <span className="text-sm text-gray-500">Não atribuído</span>
                )}
              </div>

              {/* Due Date */}
              <div>
                <Label htmlFor="end-date" className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Data de Entrega
                </Label>
                {isEditing ? (
                  <Input
                    type="date"
                    value={editedTask.endDate ?? task.endDate ?? ""}
                    onChange={(e) => setEditedTask({ ...editedTask, endDate: e.target.value })}
                  />
                ) : task.endDate ? (
                  <span className="text-sm">{new Date(task.endDate).toLocaleDateString("pt-BR")}</span>
                ) : (
                  <span className="text-sm text-gray-500">Não definida</span>
                )}
              </div>

              {/* Time Tracking */}
              <div>
                <label className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Tempo
                </label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Estimado:</span>
                    {isEditing ? (
                      <Input
                        type="number"
                        className="w-20 h-8"
                        value={editedTask.estimatedHours ?? task.estimatedHours ?? ""}
                        onChange={(e) => setEditedTask({ ...editedTask, estimatedHours: Number(e.target.value) })}
                      />
                    ) : (
                      <span>{task.estimatedHours || 0}h</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Gasto:</span>
                    {isEditing ? (
                      <Input
                        type="number"
                        className="w-20 h-8"
                        value={editedTask.actualHours ?? task.actualHours ?? ""}
                        onChange={(e) => setEditedTask({ ...editedTask, actualHours: Number(e.target.value) })}
                      />
                    ) : (
                      <span>{task.actualHours || 0}h</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Tags
                </label>
                <div className="flex flex-wrap gap-1">
                  {(task.tags || []).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {(!task.tags || task.tags.length === 0) && (
                    <span className="text-sm text-gray-500">Nenhuma tag</span>
                  )}
                </div>
              </div>

              <Separator />

              {/* Metadata */}
              <div className="text-xs text-gray-500 space-y-1">
                <p>Criado: {new Date(task.createdAt).toLocaleString("pt-BR")}</p>
                <p>Atualizado: {new Date(task.updatedAt).toLocaleString("pt-BR")}</p>
                <p>Reporter: {task.reporter?.name || "N/A"}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}