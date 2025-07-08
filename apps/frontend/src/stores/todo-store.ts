import { create } from 'zustand'
import { ITodo } from '@/types/todo'
import { subscribeWithSelector } from 'zustand/middleware'

interface TodoState {
  todos: ITodo[]
  isLoading: boolean

  // Ações
  setTodos: (todos: ITodo[]) => void
  setLoading: (loading: boolean) => void

  // Operações otimistas de CRUD
  optimisticCreate: (todo: ITodo) => void
  optimisticUpdate: (id: number, data: Partial<ITodo>) => void
  optimisticDelete: (id: number) => void

  // Operações de sincronização (chamadas após sucesso da API)
  syncCreate: (tempId: number, realTodo: ITodo) => void
  syncUpdate: (id: number, updatedTodo: ITodo) => void

  // Operações de rollback (chamadas em erro da API)
  rollbackCreate: (tempId: number) => void
  rollbackUpdate: (id: number, originalTodo: ITodo) => void
  rollbackDelete: (deletedTodo: ITodo) => void
}

export const useTodoStore = create<TodoState>()(
  subscribeWithSelector((set, get) => ({
    todos: [],
    isLoading: false,

    setTodos: todos => {
      // Evitar sobrescrever dados otimistas se não há mudanças reais
      const currentTodos = get().todos
      const hasRealChanges = todos.some(serverTodo => {
        const localTodo = currentTodos.find(t => t.id === serverTodo.id)
        return (
          !localTodo ||
          localTodo.status !== serverTodo.status ||
          localTodo.title !== serverTodo.title ||
          localTodo.description !== serverTodo.description
        )
      })

      if (hasRealChanges || currentTodos.length !== todos.length) {
        set({ todos })
      }
    },

    setLoading: isLoading => set({ isLoading }),

    // Operações otimistas
    optimisticCreate: todo =>
      set(state => ({
        todos: [todo, ...state.todos],
      })),

    optimisticUpdate: (id, data) =>
      set(state => ({
        todos: state.todos.map(todo =>
          todo.id === id
            ? { ...todo, ...data, updatedAt: new Date().toISOString() }
            : todo,
        ),
      })),

    optimisticDelete: id =>
      set(state => ({
        todos: state.todos.filter(todo => todo.id !== id),
      })),

    // Operações de sincronização
    syncCreate: (tempId, realTodo) =>
      set(state => ({
        todos: state.todos.map(todo => (todo.id === tempId ? realTodo : todo)),
      })),

    syncUpdate: (id, updatedTodo) =>
      set(state => ({
        todos: state.todos.map(todo => (todo.id === id ? updatedTodo : todo)),
      })),

    // Operações de rollback
    rollbackCreate: tempId =>
      set(state => ({
        todos: state.todos.filter(todo => todo.id !== tempId),
      })),

    rollbackUpdate: (id, originalTodo) =>
      set(state => ({
        todos: state.todos.map(todo => (todo.id === id ? originalTodo : todo)),
      })),

    rollbackDelete: deletedTodo =>
      set(state => ({
        todos: [...state.todos, deletedTodo].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
      })),
  })),
)
