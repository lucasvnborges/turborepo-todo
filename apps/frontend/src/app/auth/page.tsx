'use client'

import { Card, CardHeader } from '@/components/ui/card'
import { ListTodo, LogIn, UserPlus } from 'lucide-react'
import { LoginForm } from '@/components/forms/auth/login-form'
import { RegisterForm } from '@/components/forms/auth/register-form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <ListTodo className="h-7 w-7 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Todo App</h2>
          <p className="text-slate-600">
            Gerencie suas tarefas de forma eficiente
          </p>
        </div>

        <Card className="bg-white border border-slate-100">
          <Tabs defaultValue="login" className="w-full">
            <CardHeader className="pb-4">
              <TabsList className="grid w-full grid-cols-2 bg-slate-100 p-1 rounded-lg">
                <TabsTrigger
                  value="login"
                  className="flex items-center space-x-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Login</span>
                </TabsTrigger>
                <TabsTrigger
                  value="register"
                  className="flex items-center space-x-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Registro</span>
                </TabsTrigger>
              </TabsList>
            </CardHeader>

            <TabsContent value="login" className="mt-0">
              <LoginForm />
            </TabsContent>

            <TabsContent value="register" className="mt-0">
              <RegisterForm />
            </TabsContent>
          </Tabs>
        </Card>

        <div className="text-center">
          <p className="text-xs text-slate-500">
            Desenvolvido como resolução de desafio técnico
          </p>
        </div>
      </div>
    </div>
  )
}
