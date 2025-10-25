// DigaZÉ - Notifications Panel Component
// Component to display and manage notifications

import { useState } from 'react'
import { useNotifications } from '@/hooks/useNotifications'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Bell, 
  BellOff, 
  Check, 
  Trash2, 
  Clock, 
  MessageSquare, 
  TrendingUp, 
  Calendar, 
  Mail 
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function NotificationsPanel() {
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotifications()
  
  const [expanded, setExpanded] = useState(false)

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'feedback_received':
        return <MessageSquare className="h-4 w-4" />
      case 'campaign_sent':
        return <Mail className="h-4 w-4" />
      case 'event_ended':
        return <Calendar className="h-4 w-4" />
      case 'performance_improved':
        return <TrendingUp className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'feedback_received':
        return 'text-blue-500'
      case 'campaign_sent':
        return 'text-green-500'
      case 'event_ended':
        return 'text-purple-500'
      case 'performance_improved':
        return 'text-yellow-500'
      default:
        return 'text-gray-500'
    }
  }

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-80">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Notificações</h3>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </div>
        {notifications.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="mt-2 w-full"
            onClick={markAllAsRead}
          >
            <Check className="h-4 w-4 mr-2" />
            Marcar todas como lidas
          </Button>
        )}
      </div>
      
      <ScrollArea className="h-96">
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <BellOff className="h-8 w-8 mx-auto mb-2" />
            <p>Nenhuma notificação</p>
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`p-4 hover:bg-gray-50 ${!notification.is_read ? 'bg-blue-50' : ''}`}
              >
                <div className="flex items-start">
                  <div className={`mt-1 mr-3 ${getNotificationColor(notification.type)}`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{notification.title}</p>
                    {notification.message && (
                      <p className="text-sm text-gray-500 mt-1">{notification.message}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-2 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDistanceToNow(new Date(notification.created_at), { 
                        addSuffix: true, 
                        locale: ptBR 
                      })}
                    </p>
                  </div>
                  <div className="flex space-x-1">
                    {!notification.is_read && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => markAsRead(notification.id)}
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => deleteNotification(notification.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}