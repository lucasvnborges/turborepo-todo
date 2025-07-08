import { Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { ITodo } from '@/types/todo'
import { memo, useCallback } from 'react'

interface TodoItemProps {
  todo: ITodo
  onToggle: (todo: ITodo) => void
  onEdit: (todo: ITodo) => void
  onDelete: (id: number) => void
}

export const TodoItem = memo(function TodoItem({ 
  todo, 
  onToggle, 
  onEdit, 
  onDelete 
}: TodoItemProps) {
  const handleToggle = useCallback(() => {
    onToggle(todo)
  }, [todo, onToggle])

  const handleEdit = useCallback(() => {
    onEdit(todo)
  }, [todo, onEdit])

  const handleDelete = useCallback(() => {
    onDelete(todo.id)
  }, [todo.id, onDelete])

  return (
    <div
      className={`group flex items-center space-x-4 p-4 rounded-lg border transition-all duration-200 hover:border-slate-400 ${
        todo.status === 'completed'
          ? 'bg-slate-50 border-slate-200'
          : 'bg-white border-slate-200'
      }`}
    >
      <Checkbox
        checked={todo.status === 'completed'}
        onCheckedChange={handleToggle}
        className="border-slate-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
      />

      <div className="flex-1 min-w-0 space-y-1">
        <p
          className={`font-medium transition-all duration-200 ${
            todo.status === 'completed'
              ? 'line-through text-slate-500'
              : 'text-slate-900'
          }`}
        >
          {todo.title}
        </p>
        {todo.description && (
          <p
            className={`text-sm transition-all duration-200 ${
              todo.status === 'completed'
                ? 'line-through text-slate-400'
                : 'text-slate-600'
            }`}
          >
            {todo.description}
          </p>
        )}
      </div>

      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleEdit}
          className="text-blue-500 hover:text-blue-600 hover:bg-blue-50"
        >
          <Edit className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          className="text-red-500 hover:text-red-600 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
})
