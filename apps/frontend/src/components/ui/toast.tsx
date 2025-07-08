'use client'

import { useEffect } from 'react'
import { Button } from './button'
import { useToastStore, Toast } from '@/stores/toast-store'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

const toastIcons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
}

const toastStyles = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
}

const iconStyles = {
  success: 'text-green-500',
  error: 'text-red-500',
  info: 'text-blue-500',
  warning: 'text-yellow-500',
}

interface ToastItemProps {
  toast: Toast
}

function ToastItem({ toast }: ToastItemProps) {
  const { removeToast } = useToastStore()
  const Icon = toastIcons[toast.type]

  useEffect(() => {
    if (toast.duration) {
      const timer = setTimeout(() => {
        removeToast(toast.id)
      }, toast.duration)

      return () => clearTimeout(timer)
    }
  }, [toast.id, toast.duration, removeToast])

  return (
    <div
      className={`
      flex items-start space-x-3 p-4 rounded-lg border shadow-lg
      animate-in slide-in-from-right-full duration-300
      ${toastStyles[toast.type]}
    `}
    >
      <Icon
        className={`w-5 h-5 mt-0.5 flex-shrink-0 ${iconStyles[toast.type]}`}
      />

      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{toast.title}</p>
        <p className="text-sm opacity-90 mt-1">{toast.message}</p>

        {toast.action && (
          <Button
            variant="ghost"
            size="sm"
            onClick={toast.action.onClick}
            className="mt-2 h-8 px-3 text-xs"
          >
            {toast.action.label}
          </Button>
        )}
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => removeToast(toast.id)}
        className="flex-shrink-0 h-6 w-6 p-0 opacity-70 hover:opacity-100"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  )
}

export function ToastContainer() {
  const { toasts } = useToastStore()

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  )
}
