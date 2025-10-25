// DigaZÉ - Notifications Hook
// Custom hook for managing notifications

import { useState, useEffect } from 'react'
import { notificationService } from '@/lib/supabase-enhanced-services'
import type { Notification } from '@/types/enhanced-database'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  // Fetch notifications
  useEffect(() => {
    if (!user) return

    const fetchNotifications = async () => {
      try {
        setLoading(true)
        const data = await notificationService.getAll()
        setNotifications(data)
        
        // Get unread count
        const count = await notificationService.getUnreadCount()
        setUnreadCount(count)
      } catch (error) {
        console.error('Error fetching notifications:', error)
        toast.error('Failed to load notifications')
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [user])

  // Mark a notification as read
  const markAsRead = async (id: string) => {
    try {
      const success = await notificationService.markAsRead(id)
      if (success) {
        setNotifications(notifications.map(notification => 
          notification.id === id 
            ? { ...notification, is_read: true, read_at: new Date().toISOString() } 
            : notification
        ))
        setUnreadCount(prev => Math.max(0, prev - 1))
      } else {
        toast.error('Failed to mark notification as read')
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
      toast.error('Failed to mark notification as read')
    }
  }

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const success = await notificationService.markAllAsRead()
      if (success) {
        setNotifications(notifications.map(notification => ({
          ...notification,
          is_read: true,
          read_at: new Date().toISOString()
        })))
        setUnreadCount(0)
        toast.success('All notifications marked as read')
      } else {
        toast.error('Failed to mark all notifications as read')
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      toast.error('Failed to mark all notifications as read')
    }
  }

  // Delete a notification
  const deleteNotification = async (id: string) => {
    try {
      const success = await notificationService.delete(id)
      if (success) {
        setNotifications(notifications.filter(notification => notification.id !== id))
        toast.success('Notification deleted')
      } else {
        toast.error('Failed to delete notification')
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
      toast.error('Failed to delete notification')
    }
  }

  // Add a new notification
  const addNotification = async (notification: Omit<Notification, 'id' | 'created_at' | 'is_read' | 'read_at'>) => {
    try {
      const newNotification = await notificationService.create({
        ...notification,
        is_read: false
      })
      
      if (newNotification) {
        setNotifications([newNotification, ...notifications])
        if (!newNotification.is_read) {
          setUnreadCount(prev => prev + 1)
        }
        return newNotification
      }
    } catch (error) {
      console.error('Error adding notification:', error)
      toast.error('Failed to add notification')
    }
  }

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification
  }
}