'use client'

import { useEffect, useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useToastStore } from '../stores/toast-store'
import { Socket } from 'socket.io-client'

export interface NotificationData {
  todoId: number
  type: string
  title: string
  message: string
  timestamp: string
}

export function useWebSocketNotifications() {
  const socketRef = useRef<Socket | null>(null)

  const { addToast } = useToastStore()
  const { data: session, status } = useSession()

  const handleNotification = useCallback(
    (data: NotificationData) => {
      const toastType = (() => {
        switch (data.type) {
          case 'TODO_COMPLETED':
            return 'success'
          case 'TODO_DELETED':
            return 'warning'
          case 'TODO_CREATED':
          case 'TODO_UPDATED':
          default:
            return 'info'
        }
      })()

      addToast({
        id: `${data.type}-${data.todoId}-${Date.now()}`,
        type: toastType,
        title: data.title,
        message: data.message,
        duration: 5000,
      })
    },
    [addToast],
  )

  useEffect(() => {
    if (status === 'loading') {
      return
    }

    if (status === 'unauthenticated' || !session?.user?.id) {
      return
    }

    // Evitar múltiplas conexões
    if (socketRef.current?.connected) {
      return
    }

    const initializeWebSocket = async () => {
      try {
        const { io } = await import('socket.io-client')

        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

        const socket = io(apiUrl, {
          transports: ['websocket', 'polling'],
          auth: {
            token: session.accessToken,
          },
          timeout: 10000,
          forceNew: false, // Reutilizar conexão existente
        })

        socketRef.current = socket

        socket.on('connect', () => {
          const userId = parseInt(session.user.id)
          socket.emit('join-user-room', userId)
        })

        socket.on('notification', handleNotification)

        socket.on('disconnect', reason => {
          console.log('❌ WebSocket desconectado:', reason)
        })

        socket.on('connect_error', (error: Error) => {
          console.error('❌ Erro de conexão WebSocket:', error)
        })
      } catch (error) {
        console.error('❌ Erro ao importar socket.io-client:', error)
      }
    }

    initializeWebSocket()

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
    }
  }, [session?.user?.id, session?.accessToken, status, handleNotification])

  return {
    isConnected: socketRef.current?.connected || false,
  }
}
