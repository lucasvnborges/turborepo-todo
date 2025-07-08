import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'

// Componente de teste simples que simula o TodoModal
const TodoForm = ({ onSubmit, initialTitle = '', initialDescription = '' }: {
  onSubmit: (data: { title: string; description: string }) => void
  initialTitle?: string
  initialDescription?: string
}) => {
  const [title, setTitle] = React.useState(initialTitle)
  const [description, setDescription] = React.useState(initialDescription)
  const [error, setError] = React.useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('Título é obrigatório')
      return
    }
    setError('')
    onSubmit({ title, description })
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="title">Título</label>
        <input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Digite o título"
        />
        {error && <span role="alert">{error}</span>}
      </div>
      <div>
        <label htmlFor="description">Descrição (opcional)</label>
        <input
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Digite a descrição"
        />
      </div>
      <button type="submit">Salvar</button>
    </form>
  )
}

describe('TodoForm', () => {
  it('deve submeter formulário com dados válidos', () => {
    const mockOnSubmit = jest.fn()
    render(<TodoForm onSubmit={mockOnSubmit} />)

    const titleInput = screen.getByLabelText('Título')
    const descriptionInput = screen.getByLabelText('Descrição (opcional)')
    const submitButton = screen.getByRole('button', { name: 'Salvar' })

    fireEvent.change(titleInput, { target: { value: 'Nova Tarefa' } })
    fireEvent.change(descriptionInput, { target: { value: 'Nova Descrição' } })
    fireEvent.click(submitButton)

    expect(mockOnSubmit).toHaveBeenCalledWith({
      title: 'Nova Tarefa',
      description: 'Nova Descrição'
    })
  })

  it('deve mostrar erro quando título está vazio', () => {
    const mockOnSubmit = jest.fn()
    render(<TodoForm onSubmit={mockOnSubmit} />)

    const submitButton = screen.getByRole('button', { name: 'Salvar' })
    fireEvent.click(submitButton)

    expect(screen.getByRole('alert')).toHaveTextContent('Título é obrigatório')
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('deve preencher campos com valores iniciais', () => {
    const mockOnSubmit = jest.fn()
    render(
      <TodoForm 
        onSubmit={mockOnSubmit} 
        initialTitle="Tarefa Existente"
        initialDescription="Descrição Existente"
      />
    )

    expect(screen.getByDisplayValue('Tarefa Existente')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Descrição Existente')).toBeInTheDocument()
  })
})
