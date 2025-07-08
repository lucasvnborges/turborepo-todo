import { CheckCircle, ListTodo, LucideLayoutList } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface StatsCardsProps {
  stats: {
    total: number
    pending: number
    completed: number
  }
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-6 mb-4 flex-shrink-0">
      <Card className="bg-white border border-slate-200 hover:border-slate-300 transition-colors duration-200">
        <CardContent className="p-3 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-slate-600 mb-1">
                Total de tarefas
              </p>
              <p className="text-xl sm:text-3xl font-bold text-blue-700">
                {stats.total}
              </p>
              <p className="text-xs text-slate-500 mt-1 hidden sm:block">
                {stats.total === 1
                  ? 'tarefa registrada'
                  : 'tarefas registradas'}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg items-center justify-center hidden sm:flex">
              <ListTodo className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border border-slate-200 hover:border-slate-300 transition-colors duration-200">
        <CardContent className="p-3 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-slate-600 mb-1">
                Pendentes
              </p>
              <p className="text-xl sm:text-3xl font-bold text-orange-600">
                {stats.pending}
              </p>
              <p className="text-xs text-slate-500 mt-1 hidden sm:block">
                {stats.pending === 1
                  ? 'tarefa pendente'
                  : 'tarefas pendentes'}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg items-center justify-center hidden sm:flex">
              <LucideLayoutList className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border border-slate-200 hover:border-slate-300 transition-colors duration-200">
        <CardContent className="p-3 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-slate-600 mb-1">
                Concluídas
              </p>
              <p className="text-xl sm:text-3xl font-bold text-green-600">
                {stats.completed}
              </p>
              <p className="text-xs text-slate-500 mt-1 hidden sm:block">
                {stats.completed === 1
                  ? 'tarefa concluída'
                  : 'tarefas concluídas'}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg items-center justify-center hidden sm:flex">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
