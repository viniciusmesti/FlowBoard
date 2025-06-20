"use client"

import { useState, useMemo } from "react"
import type { Requirement, ProjectStats } from "@/types"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Clock,
  Users,
  Target,
  Download,
  Mail,
  AlertTriangle,
  CheckCircle,
} from "lucide-react"

interface WeeklyReportModalProps {
  requirements: Requirement[]
  projectStats: ProjectStats
  isOpen: boolean
  onClose: () => void
}

export function WeeklyReportModal({ requirements, projectStats, isOpen, onClose }: WeeklyReportModalProps) {
  const [reportPeriod, setReportPeriod] = useState("this-week")
  const [reportType, setReportType] = useState("summary")

  const reportData = useMemo(() => {
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const activeRequirements = requirements.filter((req) => req.status === "active")
    const completedThisWeek = requirements.filter(
      (req) => req.status === "completed" && new Date(req.updatedAt) >= weekAgo,
    )

    const allTasks = requirements.flatMap((req) => req.tasks)
    const completedTasksThisWeek = allTasks.filter(
      (task) => task.status === "done" && new Date(task.updatedAt) >= weekAgo,
    )

    const overdueTasks = allTasks.filter(
      (task) => task.endDate && new Date(task.endDate) < now && task.status !== "done",
    )

    const totalEstimatedHours = allTasks.reduce((acc, task) => acc + (task.estimatedHours || 0), 0)
    const totalActualHours = allTasks.reduce((acc, task) => acc + (task.actualHours || 0), 0)

    const productivityRate = totalEstimatedHours > 0 ? (totalActualHours / totalEstimatedHours) * 100 : 0

    const requirementsByStatus = {
      planning: requirements.filter((req) => req.status === "planning").length,
      active: requirements.filter((req) => req.status === "active").length,
      completed: requirements.filter((req) => req.status === "completed").length,
      onHold: requirements.filter((req) => req.status === "on-hold").length,
    }

    const tasksByPriority = {
      urgent: allTasks.filter((task) => task.priority === "urgent").length,
      high: allTasks.filter((task) => task.priority === "high").length,
      medium: allTasks.filter((task) => task.priority === "medium").length,
      low: allTasks.filter((task) => task.priority === "low").length,
    }

    return {
      activeRequirements,
      completedThisWeek,
      completedTasksThisWeek,
      overdueTasks,
      totalEstimatedHours,
      totalActualHours,
      productivityRate,
      requirementsByStatus,
      tasksByPriority,
    }
  }, [requirements, reportPeriod])

  const handleExportPDF = () => {
    // Implementar exportação para PDF
    console.log("Exportando relatório para PDF...")
  }

  const handleSendEmail = () => {
    // Implementar envio por email
    console.log("Enviando relatório por email...")
  }

  const MetricCard = ({ title, value, subtitle, icon: Icon, trend, trendValue }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
        {trend && (
          <div className={`flex items-center gap-1 text-xs mt-1 ${trend === "up" ? "text-green-600" : "text-red-600"}`}>
            {trend === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trendValue}
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Relatório Semanal do Projeto
              </DialogTitle>
              <DialogDescription>Análise detalhada do progresso e performance da equipe</DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={reportPeriod} onValueChange={setReportPeriod}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="this-week">Esta Semana</SelectItem>
                  <SelectItem value="last-week">Semana Passada</SelectItem>
                  <SelectItem value="this-month">Este Mês</SelectItem>
                  <SelectItem value="last-month">Mês Passado</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={handleExportPDF}>
                <Download className="w-4 h-4 mr-2" />
                PDF
              </Button>
              <Button variant="outline" size="sm" onClick={handleSendEmail}>
                <Mail className="w-4 h-4 mr-2" />
                Email
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={reportType} onValueChange={setReportType} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="summary">Resumo</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="team">Equipe</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Requisitos Ativos"
                value={reportData.activeRequirements.length}
                subtitle="Em desenvolvimento"
                icon={Target}
                trend="up"
                trendValue="+2 esta semana"
              />
              <MetricCard
                title="Tasks Concluídas"
                value={reportData.completedTasksThisWeek.length}
                subtitle="Esta semana"
                icon={CheckCircle}
                trend="up"
                trendValue="+15% vs semana anterior"
              />
              <MetricCard
                title="Horas Trabalhadas"
                value={`${reportData.totalActualHours}h`}
                subtitle={`${reportData.totalEstimatedHours}h estimadas`}
                icon={Clock}
                trend={reportData.productivityRate > 100 ? "down" : "up"}
                trendValue={`${reportData.productivityRate.toFixed(0)}% eficiência`}
              />
              <MetricCard
                title="Tasks Atrasadas"
                value={reportData.overdueTasks.length}
                subtitle="Precisam atenção"
                icon={AlertTriangle}
                trend="down"
                trendValue="-3 vs semana anterior"
              />
            </div>

            {/* Progress Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Status dos Requisitos</CardTitle>
                  <CardDescription>Distribuição atual dos requisitos por status</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Planejamento</span>
                      <span className="text-sm font-medium">{reportData.requirementsByStatus.planning}</span>
                    </div>
                    <Progress value={(reportData.requirementsByStatus.planning / requirements.length) * 100} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Ativo</span>
                      <span className="text-sm font-medium">{reportData.requirementsByStatus.active}</span>
                    </div>
                    <Progress value={(reportData.requirementsByStatus.active / requirements.length) * 100} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Concluído</span>
                      <span className="text-sm font-medium">{reportData.requirementsByStatus.completed}</span>
                    </div>
                    <Progress value={(reportData.requirementsByStatus.completed / requirements.length) * 100} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Prioridade das Tasks</CardTitle>
                  <CardDescription>Distribuição das tasks por nível de prioridade</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">{reportData.tasksByPriority.urgent}</div>
                      <div className="text-sm text-red-700">Urgente</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{reportData.tasksByPriority.high}</div>
                      <div className="text-sm text-orange-700">Alta</div>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">{reportData.tasksByPriority.medium}</div>
                      <div className="text-sm text-yellow-700">Média</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{reportData.tasksByPriority.low}</div>
                      <div className="text-sm text-green-700">Baixa</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Completions */}
            <Card>
              <CardHeader>
                <CardTitle>Requisitos Concluídos Esta Semana</CardTitle>
                <CardDescription>Parabéns pelos marcos alcançados!</CardDescription>
              </CardHeader>
              <CardContent>
                {reportData.completedThisWeek.length > 0 ? (
                  <div className="space-y-3">
                    {reportData.completedThisWeek.map((req) => (
                      <div key={req.id} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <div className="flex-1">
                          <div className="font-medium">{req.title}</div>
                          <div className="text-sm text-gray-600">
                            {req.tasks.length} tasks • Concluído em{" "}
                            {new Date(req.updatedAt).toLocaleDateString("pt-BR")}
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Concluído</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <CheckCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>Nenhum requisito foi concluído esta semana</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Eficiência da Equipe</CardTitle>
                  <CardDescription>Comparação entre tempo estimado vs tempo real</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Horas Estimadas</span>
                      <span className="font-medium">{reportData.totalEstimatedHours}h</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Horas Reais</span>
                      <span className="font-medium">{reportData.totalActualHours}h</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Taxa de Eficiência</span>
                      <Badge
                        variant={reportData.productivityRate <= 100 ? "default" : "destructive"}
                        className="font-medium"
                      >
                        {reportData.productivityRate.toFixed(1)}%
                      </Badge>
                    </div>
                    <Progress value={Math.min(reportData.productivityRate, 100)} className="h-3" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Velocity da Equipe</CardTitle>
                  <CardDescription>Tasks concluídas por semana</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">{reportData.completedTasksThisWeek.length}</div>
                      <div className="text-sm text-gray-600">Tasks esta semana</div>
                    </div>
                    <div className="text-center text-sm text-gray-500">
                      Média de {Math.round(reportData.completedTasksThisWeek.length / 7)} tasks por dia
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="team" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Individual</CardTitle>
                <CardDescription>Contribuição de cada membro da equipe</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>Relatório de equipe em desenvolvimento</p>
                  <p className="text-sm">Em breve: métricas individuais e comparativas</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recomendações</CardTitle>
                  <CardDescription>Sugestões para melhorar a performance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {reportData.overdueTasks.length > 0 && (
                    <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                      <div>
                        <div className="font-medium text-red-800">Tasks Atrasadas</div>
                        <div className="text-sm text-red-700">
                          {reportData.overdueTasks.length} tasks estão atrasadas. Considere redistribuir ou ajustar
                          prazos.
                        </div>
                      </div>
                    </div>
                  )}

                  {reportData.productivityRate > 120 && (
                    <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                      <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <div className="font-medium text-yellow-800">Estimativas Baixas</div>
                        <div className="text-sm text-yellow-700">
                          As estimativas estão consistentemente baixas. Considere revisar o processo de estimativa.
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-green-800">Bom Progresso</div>
                      <div className="text-sm text-green-700">
                        A equipe está mantendo um bom ritmo de entrega. Continue assim!
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Próximos Marcos</CardTitle>
                  <CardDescription>O que esperar nas próximas semanas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {reportData.activeRequirements.slice(0, 3).map((req) => {
                      const progress =
                        req.tasks.length > 0
                          ? (req.tasks.filter((t) => t.status === "done").length / req.tasks.length) * 100
                          : 0
                      return (
                        <div key={req.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{req.title}</span>
                            <span className="text-sm text-gray-600">{progress.toFixed(0)}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
