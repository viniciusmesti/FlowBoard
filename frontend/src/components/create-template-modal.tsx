"use client"

import { useState } from "react"
import type { Requirement } from "@/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { LayoutTemplateIcon as Template, Save, Copy } from "lucide-react"

interface CreateTemplateModalProps {
  requirements: Requirement[]
  isOpen: boolean
  onClose: () => void
  onSaveTemplate: (templateData: any) => void
}

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

export function CreateTemplateModal({ requirements, isOpen, onClose, onSaveTemplate }: CreateTemplateModalProps) {
  const [selectedRequirement, setSelectedRequirement] = useState<string>("")
  const [templateData, setTemplateData] = useState({
    name: "",
    description: "",
    color: "bg-blue-500",
    priority: "medium" as const,
    includeTasks: true,
    includeSubtasks: true,
    includeComments: false,
    category: "",
  })

  const handleSave = () => {
    const requirement = requirements.find((req) => req.id === selectedRequirement)
    if (!requirement || !templateData.name.trim()) return

    const template = {
      name: templateData.name,
      description: templateData.description,
      color: templateData.color,
      priority: templateData.priority,
      category: templateData.category,
      defaultTasks: templateData.includeTasks
        ? requirement.tasks.map((task) => ({
            title: task.title,
            description: task.description,
            priority: task.priority,
            tags: task.tags,
            estimatedHours: task.estimatedHours,
            subtasks: templateData.includeSubtasks ? task.subtasks : [],
            dependencies: task.dependencies,
            status: "todo" as const,
            reporter: { id: "1", name: "Template", email: "template@email.com", role: "admin" as const },
            attachments: [],
            activities: [],
          }))
        : [],
      createdAt: new Date().toISOString(),
    }

    onSaveTemplate(template)
    setTemplateData({
      name: "",
      description: "",
      color: "bg-blue-500",
      priority: "medium",
      includeTasks: true,
      includeSubtasks: true,
      includeComments: false,
      category: "",
    })
    setSelectedRequirement("")
    onClose()
  }

  const selectedReq = requirements.find((req) => req.id === selectedRequirement)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Template className="w-5 h-5" />
            Criar Template a partir de Requisito
          </DialogTitle>
          <DialogDescription>
            Transforme um requisito existente em um template reutilizável para futuros projetos
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Template Configuration */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Selecionar Requisito Base</Label>
              <Select value={selectedRequirement} onValueChange={setSelectedRequirement}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha um requisito..." />
                </SelectTrigger>
                <SelectContent>
                  {requirements.map((req) => (
                    <SelectItem key={req.id} value={req.id}>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${req.color}`}></div>
                        {req.title}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="template-name">Nome do Template</Label>
              <Input
                id="template-name"
                value={templateData.name}
                onChange={(e) => setTemplateData({ ...templateData, name: e.target.value })}
                placeholder="Ex: Sistema de E-commerce Básico"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="template-description">Descrição</Label>
              <Textarea
                id="template-description"
                value={templateData.description}
                onChange={(e) => setTemplateData({ ...templateData, description: e.target.value })}
                placeholder="Descreva quando e como usar este template..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Prioridade Padrão</Label>
                <Select
                  value={templateData.priority}
                  onValueChange={(value: any) => setTemplateData({ ...templateData, priority: value })}
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

              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Input
                  id="category"
                  value={templateData.category}
                  onChange={(e) => setTemplateData({ ...templateData, category: e.target.value })}
                  placeholder="Ex: E-commerce, Auth, Dashboard"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Cor do Template</Label>
              <div className="flex gap-2 flex-wrap">
                {colors.map((color) => (
                  <button
                    key={color}
                    className={`w-8 h-8 rounded-full ${color} ${
                      templateData.color === color ? "ring-2 ring-gray-400" : ""
                    }`}
                    onClick={() => setTemplateData({ ...templateData, color })}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label>O que incluir no template?</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-tasks"
                    checked={templateData.includeTasks}
                    onCheckedChange={(checked) =>
                      setTemplateData({ ...templateData, includeTasks: checked as boolean })
                    }
                  />
                  <Label htmlFor="include-tasks">Incluir todas as tasks</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-subtasks"
                    checked={templateData.includeSubtasks}
                    onCheckedChange={(checked) =>
                      setTemplateData({ ...templateData, includeSubtasks: checked as boolean })
                    }
                    disabled={!templateData.includeTasks}
                  />
                  <Label htmlFor="include-subtasks">Incluir subtasks</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-comments"
                    checked={templateData.includeComments}
                    onCheckedChange={(checked) =>
                      setTemplateData({ ...templateData, includeComments: checked as boolean })
                    }
                  />
                  <Label htmlFor="include-comments">Incluir comentários como exemplos</Label>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Preview */}
          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold">Preview do Template</Label>
              <p className="text-sm text-gray-600">Veja como ficará o template baseado no requisito selecionado</p>
            </div>

            {selectedReq ? (
              <Card>
                <CardHeader className={`${templateData.color} text-white`}>
                  <CardTitle className="text-lg">{templateData.name || `Template: ${selectedReq.title}`}</CardTitle>
                  <CardDescription className="text-white/90">
                    {templateData.description || selectedReq.description}
                  </CardDescription>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="bg-white/20 text-white capitalize">
                      {templateData.priority}
                    </Badge>
                    {templateData.category && (
                      <Badge variant="secondary" className="bg-white/20 text-white">
                        {templateData.category}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Tasks incluídas:</span>
                      <span className="text-gray-600">
                        {templateData.includeTasks ? selectedReq.tasks.length : 0} tasks
                      </span>
                    </div>

                    {templateData.includeTasks && selectedReq.tasks.length > 0 && (
                      <div className="space-y-2">
                        {selectedReq.tasks.slice(0, 3).map((task, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm p-2 bg-gray-50 rounded">
                            <Copy className="w-3 h-3 text-gray-400" />
                            <span>{task.title}</span>
                            {templateData.includeSubtasks && task.subtasks.length > 0 && (
                              <Badge variant="outline" className="text-xs">
                                {task.subtasks.length} subtasks
                              </Badge>
                            )}
                          </div>
                        ))}
                        {selectedReq.tasks.length > 3 && (
                          <div className="text-xs text-gray-500 text-center">
                            +{selectedReq.tasks.length - 3} mais tasks...
                          </div>
                        )}
                      </div>
                    )}

                    <div className="pt-2 border-t text-xs text-gray-500">
                      <p>• Dados pessoais (responsáveis, datas) não serão incluídos</p>
                      <p>• Template pode ser usado quantas vezes quiser</p>
                      <p>• Estrutura será replicada em novos requisitos</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                <Template className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-600">Selecione um requisito para ver o preview</p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!selectedRequirement || !templateData.name.trim()}>
            <Save className="w-4 h-4 mr-2" />
            Salvar Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
