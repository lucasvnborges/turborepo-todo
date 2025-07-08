'use client'

import { api } from '@/utils/api'
import { useState } from 'react'
import { UserPlus } from 'lucide-react'
import { signIn } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { FormField } from '@/components/ui/form-field'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, RegisterFormData } from './schemas'
import { CardContent, CardDescription, CardTitle } from '@/components/ui/card'

export function RegisterForm() {
  const router = useRouter()

  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const onRegister = async (data: RegisterFormData) => {
    setError('')
    setIsLoading(true)

    try {
      await api.post('/auth/register', {
        name: data.name,
        email: data.email,
        password: data.password,
      })

      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        setError('Erro ao fazer login após registro')
      } else {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Erro ao criar conta:', error)
      setError('Erro ao criar conta')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <CardContent className="pt-0">
      <div className="mb-6">
        <CardTitle className="text-xl font-semibold text-slate-900 mb-2">
          Cadastre-se
        </CardTitle>
        <CardDescription className="text-slate-600">
          Crie uma conta para começar a usar o Todo App
        </CardDescription>
      </div>

      <form
        className="space-y-4"
        onSubmit={registerForm.handleSubmit(onRegister)}
      >
        <FormField
          id="name"
          label="Nome"
          placeholder="Ex.: João Pedro"
          register={registerForm.register('name')}
          error={registerForm.formState.errors.name?.message}
        />

        <FormField
          type="email"
          label="Email"
          id="register-email"
          placeholder="seu@email.com"
          register={registerForm.register('email')}
          error={registerForm.formState.errors.email?.message}
        />

        <FormField
          label="Senha"
          type="password"
          id="register-password"
          placeholder="••••••••"
          register={registerForm.register('password')}
          error={registerForm.formState.errors.password?.message}
        />

        <FormField
          type="password"
          id="confirm-password"
          placeholder="••••••••"
          label="Confirmar senha"
          register={registerForm.register('confirmPassword')}
          error={registerForm.formState.errors.confirmPassword?.message}
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
          <UserPlus className="w-4 h-4 mr-2" />
          {isLoading ? 'Criando...' : 'Criar conta'}
        </Button>
      </form>
    </CardContent>
  )
}
