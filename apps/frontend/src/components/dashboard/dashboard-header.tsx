'use client'

import { useSession, signOut } from 'next-auth/react'
import { LogOut, User, BookCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function DashboardHeader() {
  const { data: session } = useSession()

  return (
    <header className="bg-gradient-to-r from-white/95 to-slate-50/95 backdrop-blur-md border-b border-slate-200/50 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-lg">
                <BookCheck className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-slate-900">
                Dashboard
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center shadow-sm">
                <User className="h-4 w-4 text-slate-600" />
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-slate-900">
                  {session?.user?.name}
                </p>
                <p className="text-xs text-slate-500">{session?.user?.email}</p>
              </div>
            </div>

            <Button
              onClick={() => signOut({ callbackUrl: '/auth' })}
              variant="ghost"
              size="sm"
              className="text-slate-600 hover:text-slate-900 hover:bg-slate-100/50 transition-all duration-200"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
