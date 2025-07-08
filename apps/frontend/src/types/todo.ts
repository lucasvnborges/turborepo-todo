export interface ITodo {
  id: number
  title: string
  description: string
  status: 'pending' | 'completed'
  userId: number
  createdAt: string
  updatedAt: string
}

export interface ICreateTodoData {
  title: string
  description?: string
}

export interface IUpdateTodoData {
  title?: string
  description?: string
  status?: 'pending' | 'completed'
}
