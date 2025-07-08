'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { todoApi } from '@/services/todo'
import { useSession } from 'next-auth/react'
import { useQuery } from '@tanstack/react-query'
import { useTodoStore } from '@/stores/todo-store'
import { useDashboardLogic } from '@/hooks/use-dashboard-logic'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { TodoModal } from '@/components/forms/todo-form'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { TodoListHeader } from '@/components/dashboard/todo-list-header'
import { TodoFilterTabs } from '@/components/dashboard/todo-filter-tabs'
import { TodoListContent } from '@/components/dashboard/todo-list-content'

export default function DashboardPage() {
  const router = useRouter()

  const { data: session, status } = useSession()
  const { todos, setTodos } = useTodoStore()

  const {
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
    mutations,
  } = useDashboardLogic(todos)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth')
    }
  }, [status, router])

  const { isLoading } = useQuery({
    queryKey: ['todos'],
    queryFn: async () => {
      const data = await todoApi.getTodos()
      setTodos(data)
      return data
    },
    enabled: !!session,
  })

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <h1 className="text-2xl font-semibold text-slate-700">
            Carregando...
          </h1>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-4 h-screen flex flex-col overflow-hidden">
        <StatsCards stats={stats} />

        <Card className="bg-white border border-slate-200 flex flex-col flex-1 min-h-0">
          <CardHeader className="pb-4 flex-shrink-0">
            <TodoListHeader
              pendingCount={stats.pending}
              onCreateTodo={openCreateModal}
              onMarkAllCompleted={handleMarkAllCompleted}
            />
          </CardHeader>
          <CardContent className="pt-0 flex-1 overflow-hidden">
            <Tabs
              value={filter}
              onValueChange={value =>
                setFilter(value as 'all' | 'pending' | 'completed')
              }
              className="w-full h-full flex flex-col"
            >
              <TodoFilterTabs stats={stats} />

              <TabsContent
                value={filter}
                className="mt-6 flex-1 overflow-hidden"
              >
                <TodoListContent
                  filter={filter}
                  isLoading={isLoading}
                  filteredTodos={filteredTodos}
                  onEditTodo={openEditModal}
                  onToggleTodo={handleToggleTodo}
                  onDeleteTodo={handleDeleteTodo}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>

      <TodoModal
        open={modalOpen}
        todo={editingTodo}
        onOpenChange={setModalOpen}
        onSubmit={editingTodo ? handleUpdateTodo : handleCreateTodo}
        isLoading={
          mutations.createTodo.isPending || mutations.updateTodo.isPending
        }
      />
    </div>
  )
}
