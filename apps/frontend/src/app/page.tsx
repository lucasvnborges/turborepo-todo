'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

export default function Home() {
  const router = useRouter()

  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === 'loading') return

    if (session) {
      router.push('/dashboard')
    } else {
      router.push('/auth')
    }
  }, [session, status, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900">Carregando...</h1>
      </div>
    </div>
  )
}
