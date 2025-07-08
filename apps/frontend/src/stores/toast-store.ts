import { create } from 'zustand'

export interface Toast {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  title: string
  message: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface ToastState {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'> & { id?: string }) => void
  removeToast: (id: string) => void
  clearAll: () => void
}

export const useToastStore = create<ToastState>(set => ({
  toasts: [],

  addToast: toast =>
    set(state => ({
      toasts: [
        ...state.toasts,
        {
          ...toast,
          id: toast.id || `toast-${Date.now()}-${Math.random()}`,
        },
      ],
    })),

  removeToast: id =>
    set(state => ({
      toasts: state.toasts.filter(toast => toast.id !== id),
    })),

  clearAll: () => set({ toasts: [] }),
}))
