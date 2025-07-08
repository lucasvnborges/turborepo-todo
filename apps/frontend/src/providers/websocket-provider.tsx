'use client'

import { memo } from 'react'
import { ToastContainer } from '@/components/ui/toast'
import { useWebSocketNotifications } from '@/hooks/use-websocket-notifications'

const WebSocketProvider = memo(function WebSocketProvider({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  useWebSocketNotifications()

  return (
    <>
      {children}
      <ToastContainer />
    </>
  )
})

export { WebSocketProvider }
