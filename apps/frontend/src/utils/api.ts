import axios from 'axios'
import { getSession } from 'next-auth/react'

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor para adicionar token de autenticação via NextAuth
api.interceptors.request.use(
  async (config) => {
    if (typeof window !== 'undefined') {
      const session = await getSession()
      if (session?.accessToken) {
        config.headers.Authorization = `Bearer ${session.accessToken}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor para tratar erros
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const { signOut } = await import('next-auth/react')
      await signOut({ callbackUrl: '/auth' })
    }
    return Promise.reject(error)
  },
)
