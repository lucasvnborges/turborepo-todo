import { BarChart3, CheckCircle, Clock } from 'lucide-react'
import { ITodo } from '@/types/todo'
import { TodoItem } from './todo-item'

interface TodoListContentProps {
  isLoading: boolean
  filteredTodos: ITodo[]
  filter: 'all' | 'pending' | 'completed'
  onToggleTodo: (todo: ITodo) => void
  onEditTodo: (todo: ITodo) => void
  onDeleteTodo: (id: number) => void
}

export function TodoListContent({
  isLoading,
  filteredTodos,
  filter,
  onToggleTodo,
  onEditTodo,
  onDeleteTodo,
}: TodoListContentProps) {
  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-slate-600">Carregando tarefas...</p>
      </div>
    )
  }

  if (filteredTodos.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          {filter === 'all' && <BarChart3 className="h-8 w-8 text-slate-400" />}
          {filter === 'pending' && <Clock className="h-8 w-8 text-slate-400" />}
          {filter === 'completed' && (
            <CheckCircle className="h-8 w-8 text-slate-400" />
          )}
        </div>
        <p className="text-slate-600 text-lg font-medium mb-2">
          {filter === 'all' && 'Nenhuma tarefa encontrada'}
          {filter === 'pending' && 'Nenhuma tarefa pendente'}
          {filter === 'completed' && 'Nenhuma tarefa concluída'}
        </p>
        <p className="text-sm text-slate-500">
          {filter === 'all' && 'Comece adicionando sua primeira tarefa!'}
          {filter === 'pending' && 'Todas as tarefas foram concluídas!'}
          {filter === 'completed' &&
            'Complete algumas tarefas para vê-las aqui.'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3 h-full overflow-y-auto">
      {filteredTodos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggleTodo}
          onEdit={onEditTodo}
          onDelete={onDeleteTodo}
        />
      ))}
    </div>
  )
}
