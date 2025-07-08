'use client'

import { z } from 'zod'
import { X } from 'lucide-react'
import { useEffect } from 'react'
import { ITodo } from '@/types/todo'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormField } from '@/components/ui/form-field'

const todoSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
})

export type TodoFormData = z.infer<typeof todoSchema>

interface TodoModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  todo?: ITodo
  onSubmit: (data: TodoFormData) => void
  isLoading?: boolean
}

export function TodoModal({
  open,
  onOpenChange,
  todo,
  onSubmit,
  isLoading,
}: TodoModalProps) {
  const form = useForm<TodoFormData>({
    resolver: zodResolver(todoSchema),
    defaultValues: {
      title: todo?.title || '',
      description: todo?.description || '',
    },
  })

  useEffect(() => {
    if (todo) {
      form.reset({
        title: todo.title,
        description: todo.description || '',
      })
    } else {
      form.reset({
        title: '',
        description: '',
      })
    }
  }, [todo, form])

  const handleSubmit = (data: TodoFormData) => {
    onSubmit(data)
    onOpenChange(false)
    if (!todo) {
      form.reset()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-900">
            {todo ? 'Editar Tarefa' : 'Nova Tarefa'}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            id="title"
            label="Título"
            placeholder="Ex: Revisar apresentação"
            register={form.register('title')}
            error={form.formState.errors.title?.message}
          />

          <FormField
            id="description"
            label="Descrição (opcional)"
            placeholder="Ex: Preparar slides para reunião"
            register={form.register('description')}
            error={form.formState.errors.description?.message}
          />

          <div className="flex gap-3 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? 'Salvando...' : todo ? 'Salvar' : 'Criar'}
            </Button>
          </div>
        </form>
      </div>
    </Dialog>
  )
}
