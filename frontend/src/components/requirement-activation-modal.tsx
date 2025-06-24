"use client"

import { useState } from "react"
import type { Requirement, User } from "@/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, AlertTriangle, Calendar, DollarSign, Clock, Users } from "lucide-react"

interface RequirementActivationModalProps {
  requirement: Requirement | null
  users: User[]
  isOpen: boolean
  onClose: () => void
  onActivate: (requirementId: string, data: any) => void
  onRequestApproval: (requirementId: string, data: any) => void
}

export function RequirementActivationModal({
  requirement,
  users,
  isOpen,
  onClose,
  onActivate,
  onRequestApproval,
}: RequirementActivationModalProps) {
  const [activationData, setActivationData] = useState({
    startDate: "",
    endDate: "",
    estimatedHours: "",
    budget: "",
    approvers: [] as string[],
    reason: "",
    skipValidation: false,
  })

  if (!requirement) return null

  const validationIssues = []

  // Validações
  if (!requirement.description || requirement.description.length < 20) {
    validationIssues.push("Descrição deve ter pelo menos 20 caracteres")
  }

  if (requirement.tasks.length === 0) {
    validationIssues.push("Deve ter pelo menos 1 task criada")
  }

  if (!requirement.owner) {
    validationIssues.push("Deve ter um responsável definido")
  }

  const hasBlockingDependencies = requirement.dependencies.length > 0 // Simplificado para o exemplo

  const canActivateDirectly = validationIssues.length === 0 && !hasBlockingDependencies && !requirement.approvalRequired

  const handleActivate = () => {
    const data = {
      status: "active",
      startDate: activationData.startDate || new Date().toISOString().split("T")[0],
      endDate: activationData.endDate,
      estimatedHours: activationData.estimatedHours ? Number(activationData.estimatedHours) : undefined,
      budget: activationData.budget ? Number(activationData.budget) : undefined,
    }

    onActivate(requirement.id, data)
    onClose()
  }

  const handleRequestApproval = () => {
    const data = {
      status: "pending-approval",
      startDate: activationData.startDate || new Date().toISOString().split("T")[0],
      endDate: activationData.endDate,
      estimatedHours: activationData.estimatedHours ? Number(activationData.estimatedHours) : undefined,
      budget: activationData.budget ? Number(activationData.budget) : undefined,
      approvers: activationData.approvers,
      reason: activationData.reason,
    }

    onRequestApproval(requirement.id, data)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Ativar Requisito: {requirement.title}
          </DialogTitle>
          <DialogDescription>
            Configure os detalhes para ativar este requisito e começar o desenvolvimento
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Validation Issues */}
          {validationIssues.length > 0 && !activationData.skipValidation && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium mb-2">Problemas encontrados:</div>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {validationIssues.map((issue, index) => (
                    <li key={index}>{issue}</li>
                  ))}
                </ul>
                <div className="flex items-center space-x-2 mt-3">
                  <Checkbox
                    id="skip-validation"
                    checked={activationData.skipValidation}
                    onCheckedChange={(checked) =>
                      setActivationData({ ...activationData, skipValidation: checked as boolean })
                    }
                  />
                  <Label htmlFor="skip-validation" className="text-sm">
                    Pular validações e ativar mesmo assim
                  </Label>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Dependencies Warning */}
          {hasBlockingDependencies && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium">Dependências Pendentes</div>
                <p className="text-sm mt-1">
                  Este requisito depende de outros que ainda não foram concluídos. Ativar agora pode causar bloqueios no
                  desenvolvimento.
                </p>
              </AlertDescription>
            </Alert>
          )}

          {/* Activation Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Data de Início
              </Label>
              <Input
                id="start-date"
                type="date"
                value={activationData.startDate}
                onChange={(e) => setActivationData({ ...activationData, startDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-date" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Data de Entrega (Estimada)
              </Label>
              <Input
                id="end-date"
                type="date"
                value={activationData.endDate}
                onChange={(e) => setActivationData({ ...activationData, endDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimated-hours" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Horas Estimadas
              </Label>
              <Input
                id="estimated-hours"
                type="number"
                placeholder="Ex: 120"
                value={activationData.estimatedHours}
                onChange={(e) => setActivationData({ ...activationData, estimatedHours: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Orçamento (R$)
              </Label>
              <Input
                id="budget"
                type="number"
                placeholder="Ex: 15000"
                value={activationData.budget}
                onChange={(e) => setActivationData({ ...activationData, budget: e.target.value })}
              />
            </div>
          </div>

          {/* Approval Section */}
          {requirement.approvalRequired && (
            <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-800">Aprovação Necessária</span>
              </div>

              <div className="space-y-2">
                <Label>Selecionar Aprovadores</Label>
                <Select
                  value=""
                  onValueChange={(value) => {
                    if (!activationData.approvers.includes(value)) {
                      setActivationData({
                        ...activationData,
                        approvers: [...activationData.approvers, value],
                      })
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Adicionar aprovador" />
                  </SelectTrigger>
                  <SelectContent>
                    {users
                      .filter((user) => !activationData.approvers.includes(user.id))
                      .map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name} ({user.role})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {activationData.approvers.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {activationData.approvers.map((approverId) => {
                    const user = users.find((u) => u.id === approverId)
                    return (
                      <Badge key={approverId} variant="secondary" className="flex items-center gap-1">
                        {user?.name}
                        <button
                          onClick={() =>
                            setActivationData({
                              ...activationData,
                              approvers: activationData.approvers.filter((id) => id !== approverId),
                            })
                          }
                          className="ml-1 hover:bg-gray-300 rounded-full w-4 h-4 flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                      </Badge>
                    )
                  })}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="reason">Justificativa para Aprovação</Label>
                <Textarea
                  id="reason"
                  placeholder="Explique por que este requisito deve ser aprovado..."
                  value={activationData.reason}
                  onChange={(e) => setActivationData({ ...activationData, reason: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Resumo do Requisito</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Tasks:</span>
                <span className="ml-2 font-medium">{requirement.tasks.length}</span>
              </div>
              <div>
                <span className="text-gray-600">Prioridade:</span>
                <Badge variant="outline" className="ml-2 capitalize">
                  {requirement.priority}
                </Badge>
              </div>
              <div>
                <span className="text-gray-600">Responsável:</span>
                <span className="ml-2 font-medium">{requirement.owner?.name ?? "Sem responsável"}</span>
              </div>
              <div>
                <span className="text-gray-600">Dependências:</span>
                <span className="ml-2 font-medium">{requirement.dependencies.length}</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>

          {requirement.approvalRequired ? (
            <Button
              onClick={handleRequestApproval}
              disabled={activationData.approvers.length === 0 || !activationData.reason.trim()}
            >
              Solicitar Aprovação
            </Button>
          ) : (
            <Button onClick={handleActivate} disabled={validationIssues.length > 0 && !activationData.skipValidation}>
              Ativar Requisito
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
