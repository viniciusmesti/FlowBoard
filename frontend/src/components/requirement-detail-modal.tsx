"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Requirement, Task, User } from "@/types"
import { getAvatarUrl } from "@/lib/avatars"
import { Calendar, Flag, CheckCircle, Edit, Save, X } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

interface RequirementDetailModalProps {
  requirement: Requirement | null
  users: User[]
  isOpen: boolean
  onClose: () => void
  onUpdate: (updates: Partial<Requirement>) => void
}

export function RequirementDetailModal({ requirement, users, isOpen, onClose, onUpdate }: RequirementDetailModalProps) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ title: "", description: "", priority: "medium" as Requirement["priority"], endDate: "" })

  useEffect(() => {
    if (requirement) {
      setForm({
        title: requirement.title,
        description: requirement.description,
        priority: requirement.priority,
        endDate: requirement.endDate || "",
      })
      setEditing(false)
    }
  }, [requirement])

  const progress = useMemo(() => {
    const total = requirement?.tasks?.length || 0
    const done = requirement?.tasks?.filter(t => t.status === 'done').length || 0
    return total > 0 ? Math.round((done / total) * 100) : 0
  }, [requirement])

  const priorityColor = (p: Requirement["priority"]) => p === 'high' ? 'bg-red-100 text-red-800' : p === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'

  const handleSave = () => {
    onUpdate({
      title: form.title.trim(),
      description: form.description,
      priority: form.priority,
      endDate: form.endDate || undefined,
    })
    setEditing(false)
  }

  if (!requirement) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden">
        <div className="p-5 border-b bg-white">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <DialogTitle className="text-xl truncate">
                  {editing ? (
                    <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                  ) : (
                    requirement.title
                  )}
                </DialogTitle>
                <DialogDescription className="mt-2 flex items-center gap-2">
                  <Badge className={priorityColor(requirement.priority)} variant="secondary">
                    <Flag className="w-3 h-3 mr-1" />
                    {requirement.priority}
                  </Badge>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 capitalize">{requirement.status}</Badge>
                  {requirement.endDate && (
                    <span className="text-xs text-gray-600 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Até {new Date(requirement.endDate).toLocaleDateString('pt-BR')}
                    </span>
                  )}
                </DialogDescription>
              </div>
              <div className="flex items-center gap-2">
                {editing ? (
                  <>
                    <Button size="sm" variant="outline" onClick={() => setEditing(false)}>
                      <X className="w-4 h-4 mr-1" /> Cancelar
                    </Button>
                    <Button size="sm" onClick={handleSave} disabled={!form.title.trim()}>
                      <Save className="w-4 h-4 mr-1" /> Salvar
                    </Button>
                  </>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
                    <Edit className="w-4 h-4 mr-1" /> Editar
                  </Button>
                )}
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="p-5 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Progresso</span>
              <span className="text-sm text-gray-900 font-medium">{progress}%</span>
            </div>
            <Progress value={progress} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-3">
              <Label>Descrição</Label>
              {editing ? (
                <Textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              ) : (
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{requirement.description || 'Sem descrição'}</p>
              )}
            </div>
            <div className="space-y-3">
              <Label>Data de Entrega</Label>
              {editing ? (
                <Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
              ) : (
                <p className="text-sm text-gray-700">{requirement.endDate ? new Date(requirement.endDate).toLocaleDateString('pt-BR') : '—'}</p>
              )}
              <Label className="mt-4">Prioridade</Label>
              {editing ? (
                <div className="flex gap-2">
                  {(['low','medium','high'] as const).map(p => (
                    <button key={p} type="button" onClick={() => setForm({ ...form, priority: p })}
                      className={`px-2 py-1 rounded text-xs border ${form.priority === p ? 'bg-gray-100 border-gray-300' : 'bg-white hover:bg-gray-50'}`}>
                      {p}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex gap-2">
                  <Badge className={priorityColor(requirement.priority)} variant="secondary">{requirement.priority}</Badge>
                </div>
              )}
            </div>
          </div>

          <Tabs defaultValue="tasks">
            <TabsList>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="team">Equipe</TabsTrigger>
              <TabsTrigger value="activity">Atividade</TabsTrigger>
            </TabsList>
            <TabsContent value="tasks" className="space-y-2">
              {(requirement.tasks || []).length === 0 ? (
                <p className="text-sm text-gray-500">Nenhuma task.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {requirement.tasks!.slice(0, 6).map(t => (
                    <div key={t.id} className="p-2 rounded border bg-white text-sm flex items-center gap-2">
                      <CheckCircle className={`w-4 h-4 ${t.status === 'done' ? 'text-green-600' : 'text-gray-300'}`} />
                      <span className="truncate" title={t.title}>{t.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            <TabsContent value="team" className="space-y-2">
                              <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    <Avatar className="w-7 h-7 border">
                      {requirement.owner?.avatar ? (
                        <AvatarImage src={getAvatarUrl(requirement.owner.avatar)} alt={requirement.owner.name} />
                      ) : null}
                      <AvatarFallback>{requirement.owner?.name?.[0]}</AvatarFallback>
                    </Avatar>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Owner</div>
                    <div className="text-sm text-gray-600">{requirement.owner?.name || '—'}</div>
                  </div>
                </div>
            </TabsContent>
            <TabsContent value="activity" className="space-y-2">
              <p className="text-sm text-gray-500">Histórico de atividade do requisito em breve.</p>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
} 