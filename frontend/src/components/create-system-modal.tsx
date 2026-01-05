"use client"

import { useState, useEffect } from "react"
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
import { X, Plus } from "lucide-react"
import { useSystem } from "@/contexts/SystemContext"
import { useAuth } from "@/contexts/AuthContext"
import { normalColors } from "@/lib/colors"

interface CreateSystemModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateSystemModal({ isOpen, onClose }: CreateSystemModalProps) {
  const { createNewSystem } = useSystem()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState({
    name: "",
    description: "",
    color: normalColors[0],
    requirementTypes: [] as string[],
    newType: "",
  })

  useEffect(() => {
    if (!isOpen) {
      setForm({
        name: "",
        description: "",
        color: normalColors[0],
        requirementTypes: [],
        newType: "",
      })
    }
  }, [isOpen])

  const handleAddType = () => {
    if (form.newType.trim() && !form.requirementTypes.includes(form.newType.trim())) {
      setForm({
        ...form,
        requirementTypes: [...form.requirementTypes, form.newType.trim()],
        newType: "",
      })
    }
  }

  const handleRemoveType = (type: string) => {
    setForm({
      ...form,
      requirementTypes: form.requirementTypes.filter((t) => t !== type),
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.name.trim()) {
      alert("Por favor, insira um nome para o sistema")
      return
    }

    if (!user) {
      alert("Usuário não está logado")
      return
    }

    try {
      setIsSubmitting(true)
      await createNewSystem({
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        color: form.color,
        requirementTypes: form.requirementTypes,
      })
      onClose()
    } catch (error) {
      console.error("Error creating system:", error)
      alert("Erro ao criar sistema. Verifique o console para mais detalhes.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Novo Sistema</DialogTitle>
          <DialogDescription>
            Defina as informações do sistema e os tipos de requisitos que ele terá.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome do Sistema *</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ex: Contábil, Fiscal, etc."
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Descreva o propósito do sistema..."
              rows={3}
            />
          </div>

          <div>
            <Label>Cor do Sistema</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {normalColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setForm({ ...form, color })}
                  className={`w-10 h-10 rounded-lg ${color} border-2 ${
                    form.color === color ? "border-gray-900 ring-2 ring-gray-300" : "border-transparent"
                  } hover:border-gray-400 transition-colors`}
                  title={color}
                />
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="requirementTypes">Tipos de Requisitos</Label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  id="requirementTypes"
                  value={form.newType}
                  onChange={(e) => setForm({ ...form, newType: e.target.value })}
                  placeholder="Ex: CURIA, MITRA, NP, MAPA..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddType()
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={handleAddType}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {form.requirementTypes.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {form.requirementTypes.map((type) => (
                    <Badge
                      key={type}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {type}
                      <button
                        type="button"
                        onClick={() => handleRemoveType(type)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Criando..." : "Criar Sistema"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

