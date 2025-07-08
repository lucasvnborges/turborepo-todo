import { CheckSquare, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CardDescription, CardTitle } from '@/components/ui/card'

interface TodoListHeaderProps {
  pendingCount: number
  onMarkAllCompleted: () => void
  onCreateTodo: () => void
}

export function TodoListHeader({
  pendingCount,
  onMarkAllCompleted,
  onCreateTodo,
}: TodoListHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <CardTitle className="text-lg font-semibold text-slate-900">
          Lista de tarefas
        </CardTitle>
        <CardDescription className="text-slate-600">
          Gerencie suas tarefas e acompanhe seu progresso
        </CardDescription>
      </div>
      <div className="flex items-center gap-3">
        {pendingCount > 0 && (
          <Button
            onClick={onMarkAllCompleted}
            variant="outline"
            className="border-green-200 text-green-700 hover:bg-green-50"
          >
            <CheckSquare className="w-4 h-4 mr-2" />
            Marcar Todas como Concluídas
          </Button>
        )}
        <Button
          onClick={onCreateTodo}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Tarefa
        </Button>
      </div>
    </div>
  )
}
