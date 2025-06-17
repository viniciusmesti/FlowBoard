"use client"

import { useState } from "react"
import type { RequirementTemplate } from "@/types"
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
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LayoutTemplateIcon as Template, Plus, Copy, Trash2 } from "lucide-react"

interface RequirementTemplatesModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateFromTemplate: (template: RequirementTemplate) => void
  onSaveAsTemplate: (data: any) => void
}

const mockTemplates: RequirementTemplate[] = [
  {
    id: "1",
    name: "Sistema de Autenticação",
    description: "Template padrão para implementação de sistemas de login e registro",
    color: "bg-blue-500",
    priority: "high",
    defaultTasks: [
      {
        title: "Criar tela de login",
        description: "Desenvolver interface de login responsiva",
        status: "todo",
        priority: "high",
        reporter: { id: "1", name: "Admin", email: "admin@email.com", role: "admin" },
        tags: ["frontend", "ui/ux"],
        dependencies: [],
        subtasks: []
      },
      {
        title: "Implementar validação backend",
        description: "Criar validações de segurança no servidor",
        status: "todo",
        priority: "high",
        reporter: { id: "1", name: "Admin", email: "admin@email.com", role: "admin" },
        tags: ["backend", "security"],
        dependencies: [],
        subtasks: []
      },
    ],
    createdBy: { id: "1", name: "Admin", email: "admin@email.com", role: "admin" },
    createdAt: "2024-01-01T10:00:00Z",
  },
  {
    id: "2",
    name: "Dashboard Analytics",
    description: "Template para criação de dashboards com métricas e relatórios",
    color: "bg-green-500",
    priority: "medium",
    defaultTasks: [
      {
        title: "Criar gráficos de performance",
        description: "Implementar gráficos interativos",
        status: "todo",
        priority: "medium",
        reporter: { id: "1", name: "Admin", email: "admin@email.com", role: "admin" },
        tags: ["frontend", "charts"],
        dependencies: [],
        subtasks: []
      },
    ],
    createdBy: { id: "1", name: "Admin", email: "admin@email.com", role: "admin" },
    createdAt: "2024-01-01T10:00:00Z",
  },
]

export function RequirementTemplatesModal({
  isOpen,
  onClose,
  onCreateFromTemplate,
  onSaveAsTemplate,
}: RequirementTemplatesModalProps) {
  const [templates] = useState<RequirementTemplate[]>(mockTemplates)
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    description: "",
    color: "bg-blue-500",
    priority: "medium" as const,
  })

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

  const handleCreateFromTemplate = (template: RequirementTemplate) => {
    onCreateFromTemplate(template)
    onClose()
  }

  const handleSaveTemplate = () => {
    if (newTemplate.name.trim()) {
      onSaveAsTemplate(newTemplate)
      setNewTemplate({ name: "", description: "", color: "bg-blue-500", priority: "medium" })
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Template className="w-5 h-5" />
            Templates de Requisitos
          </DialogTitle>
          <DialogDescription>
            Use templates para criar requisitos rapidamente ou salve estruturas para reutilizar
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="use" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="use">Usar Template</TabsTrigger>
            <TabsTrigger value="create">Criar Template</TabsTrigger>
          </TabsList>

          <TabsContent value="use" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((template) => (
                <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className={`${template.color} text-white`}>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription className="text-white/90">{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="capitalize">
                          {template.priority}
                        </Badge>
                        <span className="text-sm text-gray-600">{template.defaultTasks.length} tasks padrão</span>
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm font-medium">Tasks incluídas:</div>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {template.defaultTasks.slice(0, 3).map((task, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                              {task.title}
                            </li>
                          ))}
                          {template.defaultTasks.length > 3 && (
                            <li className="text-xs text-gray-500">+{template.defaultTasks.length - 3} mais tasks...</li>
                          )}
                        </ul>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button size="sm" onClick={() => handleCreateFromTemplate(template)} className="flex-1">
                          <Copy className="w-3 h-3 mr-1" />
                          Usar Template
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {templates.length === 0 && (
              <div className="text-center py-8">
                <Template className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum template disponível</h3>
                <p className="text-gray-600">Crie seu primeiro template na aba "Criar Template"</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="create" className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="template-name">Nome do Template</Label>
                <Input
                  id="template-name"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  placeholder="Ex: Sistema de E-commerce"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="template-description">Descrição</Label>
                <Textarea
                  id="template-description"
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                  placeholder="Descreva quando usar este template..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Prioridade Padrão</Label>
                  <select
                    value={newTemplate.priority}
                    onChange={(e) => setNewTemplate({ ...newTemplate, priority: e.target.value as any })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                  </select>
                </div>

                <div className="grid gap-2">
                  <Label>Cor</Label>
                  <div className="flex gap-1 flex-wrap">
                    {colors.map((color) => (
                      <button
                        key={color}
                        className={`w-6 h-6 rounded-full ${color} ${
                          newTemplate.color === color ? "ring-2 ring-gray-400" : ""
                        }`}
                        onClick={() => setNewTemplate({ ...newTemplate, color })}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-800 mb-2">Como funciona?</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• O template será criado com base no requisito atual</li>
                  <li>• Todas as tasks serão incluídas como tasks padrão</li>
                  <li>• Dados pessoais (responsáveis, datas) não são salvos</li>
                  <li>• Você pode reutilizar este template quantas vezes quiser</li>
                </ul>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button onClick={handleSaveTemplate} disabled={!newTemplate.name.trim()}>
                <Plus className="w-4 h-4 mr-2" />
                Salvar Template
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
