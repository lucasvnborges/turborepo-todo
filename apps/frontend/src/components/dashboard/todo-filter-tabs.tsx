import { BarChart3, CheckCircle, Clock } from 'lucide-react'
import { TabsList, TabsTrigger } from '@/components/ui/tabs'

interface TodoFilterTabsProps {
  stats: {
    total: number
    pending: number
    completed: number
  }
}

export function TodoFilterTabs({ stats }: TodoFilterTabsProps) {
  return (
    <TabsList className="grid w-full grid-cols-3 bg-slate-100 p-1 rounded-lg flex-shrink-0">
      <TabsTrigger
        value="all"
        className="flex items-center space-x-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:border data-[state=active]:border-slate-200"
      >
        <BarChart3 className="h-4 w-4" />
        <span>Todas ({stats.total})</span>
      </TabsTrigger>
      <TabsTrigger
        value="pending"
        className="flex items-center space-x-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:border data-[state=active]:border-slate-200"
      >
        <Clock className="h-4 w-4" />
        <span>Pendentes ({stats.pending})</span>
      </TabsTrigger>
      <TabsTrigger
        value="completed"
        className="flex items-center space-x-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:border data-[state=active]:border-slate-200"
      >
        <CheckCircle className="h-4 w-4" />
        <span>Concluídas ({stats.completed})</span>
      </TabsTrigger>
    </TabsList>
  )
}
