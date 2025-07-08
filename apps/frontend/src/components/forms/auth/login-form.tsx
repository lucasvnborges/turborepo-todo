'use client'

import { useState } from 'react'
import { LogIn } from 'lucide-react'
import { signIn } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { FormField } from '@/components/ui/form-field'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, LoginFormData } from './schemas'
import { CardContent, CardDescription, CardTitle } from '@/components/ui/card'

export function LoginForm() {
  const router = useRouter()

  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onLogin = async (data: LoginFormData) => {
    setError('')
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        setError('Credenciais inválidas')
      } else {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error)
      setError('Erro ao fazer login')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <CardContent className="pt-0">
      <div className="mb-6">
        <CardTitle className="text-xl font-semibold text-slate-900 mb-2">
          Bem-vindo de volta!
        </CardTitle>
        <CardDescription className="text-slate-600">
          Entre com suas credenciais para acessar sua conta
        </CardDescription>
      </div>

      <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
        <FormField
          id="email"
          label="Email"
          type="email"
          placeholder="seu@email.com"
          register={loginForm.register('email')}
          error={loginForm.formState.errors.email?.message}
        />

        <FormField
          id="password"
          label="Senha"
          type="password"
          placeholder="••••••••"
          register={loginForm.register('password')}
          error={loginForm.formState.errors.password?.message}
        />

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 mt-6"
        >
          <LogIn className="w-4 h-4 mr-2" />
          {isLoading ? 'Entrando...' : 'Entrar'}
        </Button>
      </form>
    </CardContent>
  )
}
