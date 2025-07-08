import { ITodo } from '@/types/todo'
import { useState, useMemo, useCallback } from 'react'
import { TodoFormData } from '@/components/forms/todo-form'
import { useOptimisticTodos } from './use-optimistic-todos'

export function useDashboardLogic(todos: ITodo[]) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTodo, setEditingTodo] = useState<ITodo | undefined>()
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all')

  const { createTodo, updateTodo, deleteTodo } = useOptimisticTodos()

  const filteredTodos = useMemo(() => {
    const filtered = todos.filter(todo => {
      if (filter === 'pending') return todo.status === 'pending'
      if (filter === 'completed') return todo.status === 'completed'
      return true
    })

    if (filter === 'all') {
      // Na aba "Todas", mostrar pendentes primeiro, depois concluídas
      // Dentro de cada grupo, ordenar por data de criação (mais recente primeiro)
      const pending = filtered
        .filter(todo => todo.status === 'pending')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      
      const completed = filtered
        .filter(todo => todo.status === 'completed')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      
      return [...pending, ...completed]
    }

    // Para abas específicas (pending/completed), ordenar por data de criação
    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [todos, filter])

  const stats = useMemo(
    () => ({
      total: todos.length,
      pending: todos.filter(t => t.status === 'pending').length,
      completed: todos.filter(t => t.status === 'completed').length,
    }),
    [todos],
  )

  const handleCreateTodo = useCallback((data: TodoFormData) => {
    createTodo.mutate(data)
    setModalOpen(false)
  }, [createTodo])

  const handleUpdateTodo = useCallback((data: TodoFormData) => {
    if (editingTodo) {
      updateTodo.mutate({
        id: editingTodo.id.toString(),
        data: { title: data.title, description: data.description },
      })
      setModalOpen(false)
      setEditingTodo(undefined)
    }
  }, [editingTodo, updateTodo])

  const handleToggleTodo = useCallback((todo: ITodo) => {
    updateTodo.mutate({
      id: todo.id.toString(),
      data: { status: todo.status === 'completed' ? 'pending' : 'completed' },
    })
  }, [updateTodo])

  const handleDeleteTodo = useCallback((id: number) => {
    deleteTodo.mutate(id.toString())
  }, [deleteTodo])

  const handleMarkAllCompleted = useCallback(() => {
    const pendingTodos = todos.filter(todo => todo.status === 'pending')
    pendingTodos.forEach(todo => {
      updateTodo.mutate({
        id: todo.id.toString(),
        data: { status: 'completed' },
      })
    })
  }, [todos, updateTodo])

  const openCreateModal = useCallback(() => {
    setEditingTodo(undefined)
    setModalOpen(true)
  }, [])

  const openEditModal = useCallback((todo: ITodo) => {
    setEditingTodo(todo)
    setModalOpen(true)
  }, [])

  return {
    filter,
    setFilter,
    modalOpen,
    setModalOpen,
    editingTodo,
    filteredTodos,
    stats,
    handleCreateTodo,
    handleUpdateTodo,
    handleToggleTodo,
    handleDeleteTodo,
    handleMarkAllCompleted,
    openCreateModal,
    openEditModal,
    mutations: { createTodo, updateTodo, deleteTodo },
  }
}
