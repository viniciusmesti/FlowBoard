"use client"

import { useState, useEffect } from "react"
import type { NotificationItemDto } from "../api/dto/notification-item.dto"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bell, Clock, AlertTriangle, CheckCircle, ArrowRight, BellRing } from "lucide-react"
import Link from "next/link"
import { fetchNotifications } from "@/api/api"
import { useAuth } from "@/contexts/AuthContext"

export function NotificationCenter() {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItemDto[]>([])
  const [readIds, setReadIds] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!user?.id) return;
    const loadNotifications = async () => {
      setIsLoading(true)
      try {
        console.log('Fetching notifications for user:', user.id)
        const data = await fetchNotifications(user.id)
        if (data) {
          console.log('Notifications loaded:', data.length, 'items')
          setNotifications(data)
        }
      } catch (error) {
        console.error('Error loading notifications:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadNotifications()
  }, [user])

  const unreadCount = notifications.filter(n => !readIds.has(n.id)).length

  const markAsRead = (id: string) => {
    setReadIds(prev => new Set(prev).add(id))
  }

  const markAllAsRead = () => {
    setReadIds(new Set(notifications.map(n => n.id)))
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'overdue': return <AlertTriangle className="w-4 h-4 text-red-600" />
      case 'due-soon': return <Clock className="w-4 h-4 text-yellow-600" />
      case 'approval': return <BellRing className="w-4 h-4 text-blue-600" />
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'urgent': return <AlertTriangle className="w-4 h-4 text-red-700" />
      default: return <Bell className="w-4 h-4 text-gray-600" />
    }
  }

  const getColor = (type: string, read: boolean) => {
    const base = read ? 'opacity-60 ' : ''
    switch (type) {
      case 'overdue': return base + 'border-l-red-500 bg-red-50 hover:bg-red-100'
      case 'due-soon': return base + 'border-l-yellow-500 bg-yellow-50 hover:bg-yellow-100'
      case 'approval': return base + 'border-l-blue-500 bg-blue-50 hover:bg-blue-100'
      case 'completed': return base + 'border-l-green-500 bg-green-50 hover:bg-green-100'
      case 'urgent': return base + 'border-l-red-600 bg-red-50 hover:bg-red-100'
      default: return base + 'border-l-gray-500 bg-gray-50 hover:bg-gray-100'
    }
  }

  const overdue = notifications.filter(n => n.type === 'overdue')
  const dueSoon = notifications.filter(n => n.type === 'due-soon')
  const approval = notifications.filter(n => n.type === 'approval')
  const completed = notifications.filter(n => n.type === 'completed')
  const urgent = notifications.filter(n => n.type === 'urgent')
  const urgentCount = overdue.length + approval.length + urgent.length

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative p-2 h-9 w-9">
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 flex items-center justify-center">
              <span className="text-xs font-medium text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            </div>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-96 p-0" align="end" sideOffset={8}>
        <div className="p-4 border-b bg-white flex justify-between items-center">
          <h3 className="font-semibold">Notificações</h3>
          <div className="flex items-center gap-2">
            {!user && (
              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                Demo
              </Badge>
            )}
            {user && (
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                {user.name}
              </Badge>
            )}
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs bg-red-100 text-red-800">
                {unreadCount} não lidas
              </Badge>
            )}
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs h-6 px-2">
                Marcar todas como lidas
              </Button>
            )}
          </div>
        </div>
        
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3"></div>
            <p className="text-sm">Carregando notificações...</p>
          </div>
        ) : notifications.length > 0 ? (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid grid-cols-4 border-b bg-gray-50">
              <TabsTrigger value="all">Todas {unreadCount > 0 && <Badge variant="secondary" className="ml-1 text-xs bg-gray-200">{unreadCount}</Badge>}</TabsTrigger>
              <TabsTrigger value="urgent">Urgente {urgentCount > 0 && <Badge variant="secondary" className="ml-1 text-xs bg-red-200 text-red-800">{urgentCount}</Badge>}</TabsTrigger>
              <TabsTrigger value="upcoming">Próximas {dueSoon.length > 0 && <Badge variant="secondary" className="ml-1 text-xs bg-yellow-200 text-yellow-800">{dueSoon.length}</Badge>}</TabsTrigger>
              <TabsTrigger value="completed">Concluídas {completed.length > 0 && <Badge variant="secondary" className="ml-1 text-xs bg-green-200 text-green-800">{completed.length}</Badge>}</TabsTrigger>
            </TabsList>

            <ScrollArea className="h-80">
              {['all', 'urgent', 'upcoming', 'completed'].map(tab => (
                <TabsContent key={tab} value={tab} className="m-0">
                  <div className="space-y-1">
                    {(tab === 'all' ? notifications : tab === 'urgent' ? [...urgent, ...overdue, ...approval] : tab === 'upcoming' ? dueSoon : completed)
                      .map(n => (
                        <Link
                          key={n.id}
                          href={`/requirement/${n.requirementId}`}
                          onClick={() => { markAsRead(n.id); setIsOpen(false) }}
                        >
                          <div className={`p-3 border-l-4 cursor-pointer transition ${getColor(n.type, readIds.has(n.id))}`}>
                            <div className="flex items-start gap-3">
                              {getIcon(n.type)}
                              <div className="flex-1">
                                <div className="flex justify-between">
                                  <span className={`font-medium text-sm ${readIds.has(n.id) ? 'text-gray-600' : 'text-gray-900'}`}>{n.title}</span>
                                  {!readIds.has(n.id) && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                                </div>
                                <p className={`text-sm mt-1 ${readIds.has(n.id) ? 'text-gray-500' : 'text-gray-700'}`}>{n.description}</p>
                                <span className="text-xs text-gray-500 mt-1 block">{new Date(n.timestamp).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                              <ArrowRight className="w-3 h-3 text-gray-400" />
                            </div>
                          </div>
                        </Link>
                      ))}
                  </div>
                </TabsContent>
              ))}
            </ScrollArea>
          </Tabs>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <h4 className="font-medium text-gray-900 mb-1">Nenhuma notificação</h4>
            <p className="text-sm">Você está em dia com tudo!</p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
