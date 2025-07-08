import { useRef } from 'react'
import { ITodo } from '@/types/todo'
import { todoApi } from '@/services/todo'
import { useSession } from 'next-auth/react'
import { useTodoStore } from '@/stores/todo-store'
import { TodoFormData } from '@/components/forms/todo-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useOptimisticTodos() {
  const queryClient = useQueryClient()
  const pendingUpdates = useRef<Set<number>>(new Set())
  
  const { data: session } = useSession()
  const {
    optimisticCreate,
    optimisticUpdate,
    optimisticDelete,
    syncCreate,
    syncUpdate,
    rollbackCreate,
    rollbackUpdate,
    rollbackDelete
  } = useTodoStore()

  const createTodo = useMutation({
    mutationFn: (data: TodoFormData) => todoApi.createTodo(data),
    onMutate: async (data) => {
      // Cancelar refetches em andamento
      await queryClient.cancelQueries({ queryKey: ['todos'] })
      
      const tempId = Date.now()
      const optimisticTodo: ITodo = {
        id: tempId,
        title: data.title,
        description: data.description || '',
        status: 'pending',
        userId: typeof session?.user?.id === 'string' 
          ? parseInt(session.user.id) 
          : session?.user?.id || 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      
      optimisticCreate(optimisticTodo)
      return { tempId }
    },
    onSuccess: (newTodo, _, context) => {
      if (context?.tempId) {
        syncCreate(context.tempId, newTodo)
      }
      // Usar setQueryData ao invés de invalidateQueries para evitar refetch
      queryClient.setQueryData(['todos'], (old: ITodo[] | undefined) => {
        if (!old) return [newTodo]
        return old.map(todo => 
          todo.id === context?.tempId ? newTodo : todo
        )
      })
    },
    onError: (_, __, context) => {
      if (context?.tempId) {
        rollbackCreate(context.tempId)
      }
    },
  })

  const updateTodo = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ITodo> }) =>
      todoApi.updateTodo(id, data),
    onMutate: async ({ id, data }) => {
      const todoId = parseInt(id)
      
      // Evitar múltiplas atualizações simultâneas do mesmo todo
      if (pendingUpdates.current.has(todoId)) {
        throw new Error('Update already in progress')
      }
      
      pendingUpdates.current.add(todoId)
      
      // Cancelar refetches em andamento
      await queryClient.cancelQueries({ queryKey: ['todos'] })
      
      const originalTodo = useTodoStore.getState().todos.find(t => t.id === todoId)
      
      if (originalTodo) {
        optimisticUpdate(todoId, data)
        
        // Atualizar também o cache do React Query
        queryClient.setQueryData(['todos'], (old: ITodo[] | undefined) => {
          if (!old) return []
          return old.map(todo => 
            todo.id === todoId ? { ...todo, ...data } : todo
          )
        })
      }
      
      return { originalTodo }
    },
    onSuccess: (updatedTodo) => {
      const todoId = updatedTodo.id
      pendingUpdates.current.delete(todoId)
      
      syncUpdate(todoId, updatedTodo)
      
      // Atualizar o cache com os dados reais do servidor
      queryClient.setQueryData(['todos'], (old: ITodo[] | undefined) => {
        if (!old) return [updatedTodo]
        return old.map(todo => 
          todo.id === todoId ? updatedTodo : todo
        )
      })
    },
    onError: (_, variables, context) => {
      const todoId = parseInt(variables.id)
      pendingUpdates.current.delete(todoId)
      
      if (context?.originalTodo) {
        rollbackUpdate(context.originalTodo.id, context.originalTodo)
        
        // Reverter também o cache do React Query
        queryClient.setQueryData(['todos'], (old: ITodo[] | undefined) => {
          if (!old) return []
          return old.map(todo => 
            todo.id === context.originalTodo!.id ? context.originalTodo! : todo
          )
        })
      }
    },
  })

  const deleteTodo = useMutation({
    mutationFn: (id: string) => todoApi.deleteTodo(id),
    onMutate: async (id) => {
      // Cancelar refetches em andamento
      await queryClient.cancelQueries({ queryKey: ['todos'] })
      
      const todoId = parseInt(id)
      const todoToDelete = useTodoStore.getState().todos.find(t => t.id === todoId)
      
      if (todoToDelete) {
        optimisticDelete(todoId)
        
        // Atualizar também o cache do React Query
        queryClient.setQueryData(['todos'], (old: ITodo[] | undefined) => {
          if (!old) return []
          return old.filter(todo => todo.id !== todoId)
        })
      }
      
      return { todoToDelete }
    },
    onSuccess: (_, variables) => {
      const todoId = parseInt(variables)
      
      // Confirmar remoção no cache
      queryClient.setQueryData(['todos'], (old: ITodo[] | undefined) => {
        if (!old) return []
        return old.filter(todo => todo.id !== todoId)
      })
    },
    onError: (_, __, context) => {
      if (context?.todoToDelete) {
        rollbackDelete(context.todoToDelete)
        
        // Reverter também o cache do React Query
        queryClient.setQueryData(['todos'], (old: ITodo[] | undefined) => {
          if (!old) return [context.todoToDelete!]
          return [...old, context.todoToDelete!].sort((a, b) => a.id - b.id)
        })
      }
    },
  })

  return {
    createTodo,
    updateTodo,
    deleteTodo
  }
} 