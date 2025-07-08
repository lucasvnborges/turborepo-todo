import { api } from '@/utils/api'
import { ITodo, ICreateTodoData, IUpdateTodoData } from '@/types/todo'

export const todoApi = {
  getTodos: async (): Promise<ITodo[]> => {
    const response = await api.get('/todos')
    return response.data
  },

  createTodo: async (data: ICreateTodoData): Promise<ITodo> => {
    const response = await api.post('/todos', data)
    return response.data
  },

  updateTodo: async (id: string, data: IUpdateTodoData): Promise<ITodo> => {
    const response = await api.patch(`/todos/${id}`, data)
    return response.data
  },

  deleteTodo: async (id: string): Promise<void> => {
    await api.delete(`/todos/${id}`)
  },
}
