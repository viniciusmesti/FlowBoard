"use client"

import type { ProjectStats } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Clock, AlertTriangle, BarChart3 } from "lucide-react"
import { useEffect, useState } from "react"

interface DashboardStatsProps {
  stats: ProjectStats
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  // Use useState e useEffect para evitar erros de hidratação
  const [mounted, setMounted] = useState(false)
  const [completionRate, setCompletionRate] = useState(0)

  useEffect(() => {
    setMounted(true)
    setCompletionRate(stats.totalTasks > 0 ? (stats.completedTasks / stats.totalTasks) * 100 : 0)
  }, [stats.completedTasks, stats.totalTasks])

  // Renderização do lado do servidor - valores iniciais
  if (!mounted) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Tasks</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">0 requisitos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">0</div>
            <div className="flex items-center gap-2 mt-1">
              <Progress value={0} className="flex-1 h-2" />
              <span className="text-xs text-muted-foreground">0%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Progresso</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">0</div>
            <p className="text-xs text-muted-foreground">Sendo desenvolvidas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atrasadas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">0</div>
            <p className="text-xs text-muted-foreground">Precisam atenção</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Renderização do lado do cliente - valores reais
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Tasks</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalTasks}</div>
          <p className="text-xs text-muted-foreground">{stats.totalRequirements} requisitos</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.completedTasks}</div>
          <div className="flex items-center gap-2 mt-1">
            <Progress value={completionRate} className="flex-1 h-2" />
            <span className="text-xs text-muted-foreground">{completionRate.toFixed(0)}%</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Em Progresso</CardTitle>
          <Clock className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{stats.tasksInProgress}</div>
          <p className="text-xs text-muted-foreground">Sendo desenvolvidas</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Atrasadas</CardTitle>
          <AlertTriangle className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{stats.overdueTasks}</div>
          <p className="text-xs text-muted-foreground">Precisam atenção</p>
        </CardContent>
      </Card>
    </div>
  )
}
