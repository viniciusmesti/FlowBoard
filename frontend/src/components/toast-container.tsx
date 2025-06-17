"use client"

import { useNotifications } from "@/contexts/NotificationContext"
import { CheckCircle, AlertTriangle, AlertCircle, Info, X } from "lucide-react"

export function ToastContainer() {
  const { notifications, removeNotification } = useNotifications()

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-600" />
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />
      case "info":
        return <Info className="w-5 h-5 text-blue-600" />
      default:
        return <Info className="w-5 h-5 text-gray-600" />
    }
  }

  const getColorClasses = (type: string) => {
    switch (type) {
      case "success":
        return "border-green-200 bg-green-50"
      case "error":
        return "border-red-200 bg-red-50"
      case "warning":
        return "border-yellow-200 bg-yellow-50"
      case "info":
        return "border-blue-200 bg-blue-50"
      default:
        return "border-gray-200 bg-gray-50"
    }
  }

  if (notifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`p-4 rounded-lg border shadow-lg animate-in slide-in-from-right-full ${getColorClasses(
            notification.type,
          )}`}
        >
          <div className="flex items-start gap-3">
            {getIcon(notification.type)}
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm">{notification.title}</div>
              {notification.message && <div className="text-sm text-gray-600 mt-1">{notification.message}</div>}
              {notification.action && (
                <button
                  onClick={notification.action.onClick}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800 mt-2"
                >
                  {notification.action.label}
                </button>
              )}
            </div>
            <button onClick={() => removeNotification(notification.id)} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
