import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'

type TodoType = {
  id: number
  title: string
  description?: string
  status: 'pending' | 'completed'
}

// Componente de teste simples que simula o TodoItem
const TodoItem = ({
  todo,
  onToggle,
  onEdit,
  onDelete,
}: {
  todo: TodoType
  onToggle: (todo: TodoType) => void
  onEdit: (todo: TodoType) => void
  onDelete: (id: number) => void
}) => {
  return (
    <div>
      <input
        type="checkbox"
        checked={todo.status === 'completed'}
        onChange={() => onToggle(todo)}
        aria-label={`Marcar ${todo.title} como ${todo.status === 'completed' ? 'pendente' : 'concluída'}`}
      />
      <div>
        <h3 className={todo.status === 'completed' ? 'completed' : ''}>
          {todo.title}
        </h3>
        {todo.description && (
          <p className={todo.status === 'completed' ? 'completed' : ''}>
            {todo.description}
          </p>
        )}
      </div>
      <button onClick={() => onEdit(todo)} aria-label="Editar tarefa">
        Editar
      </button>
      <button onClick={() => onDelete(todo.id)} aria-label="Deletar tarefa">
        Deletar
      </button>
    </div>
  )
}

describe('TodoItem', () => {
  const mockTodo = {
    id: 1,
    title: 'Tarefa de Teste',
    description: 'Descrição de Teste',
    status: 'pending' as const,
  }

  const mockOnToggle = jest.fn()
  const mockOnEdit = jest.fn()
  const mockOnDelete = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('deve renderizar tarefa com título e descrição', () => {
    render(
      <TodoItem
        todo={mockTodo}
        onToggle={mockOnToggle}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    )

    expect(screen.getByText('Tarefa de Teste')).toBeInTheDocument()
    expect(screen.getByText('Descrição de Teste')).toBeInTheDocument()
  })

  it('deve renderizar tarefa sem descrição', () => {
    const todoSemDescricao = { ...mockTodo, description: undefined }

    render(
      <TodoItem
        todo={todoSemDescricao}
        onToggle={mockOnToggle}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    )

    expect(screen.getByText('Tarefa de Teste')).toBeInTheDocument()
    expect(screen.queryByText('Descrição de Teste')).not.toBeInTheDocument()
  })

  it('deve mostrar checkbox marcado para tarefa concluída', () => {
    const tarefaConcluida = { ...mockTodo, status: 'completed' as const }

    render(
      <TodoItem
        todo={tarefaConcluida}
        onToggle={mockOnToggle}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    )

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeChecked()
  })

  it('deve chamar onToggle quando checkbox é clicado', () => {
    render(
      <TodoItem
        todo={mockTodo}
        onToggle={mockOnToggle}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    )

    const checkbox = screen.getByRole('checkbox')
    fireEvent.click(checkbox)

    expect(mockOnToggle).toHaveBeenCalledWith(mockTodo)
  })

  it('deve chamar onEdit quando botão editar é clicado', () => {
    render(
      <TodoItem
        todo={mockTodo}
        onToggle={mockOnToggle}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    )

    const editButton = screen.getByLabelText('Editar tarefa')
    fireEvent.click(editButton)

    expect(mockOnEdit).toHaveBeenCalledWith(mockTodo)
  })

  it('deve chamar onDelete quando botão deletar é clicado', () => {
    render(
      <TodoItem
        todo={mockTodo}
        onToggle={mockOnToggle}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    )

    const deleteButton = screen.getByLabelText('Deletar tarefa')
    fireEvent.click(deleteButton)

    expect(mockOnDelete).toHaveBeenCalledWith(mockTodo.id)
  })
})
