# Todo App - Aplicação de Gerenciamento de Tarefas

Uma aplicação moderna de gerenciamento de tarefas construída com arquitetura de monorepo usando Turborepo, Next.js e NestJS.

## 🛠️ Tecnologias Utilizadas

### Frontend

- **Next.js 15.3.5** - Framework React com SSR e App Router
- **React 19** - Biblioteca JavaScript para construção de interfaces
- **TypeScript 5.8.3** - Superset do JavaScript com tipagem estática
- **Tailwind CSS 4** - Framework CSS utilitário
- **Radix UI** - Biblioteca de componentes acessíveis
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de esquemas
- **TanStack Query** - Gerenciamento de estado servidor
- **NextAuth.js** - Autenticação para Next.js
- **Zustand** - Gerenciamento de estado global
- **Socket.io Client** - Comunicação em tempo real
- **Axios** - Cliente HTTP

### Backend

- **NestJS 11** - Framework Node.js progressivo
- **TypeORM 0.3.25** - ORM para TypeScript/JavaScript
- **PostgreSQL** - Banco de dados relacional
- **Redis 4.7.1** - Cache e armazenamento de sessões
- **RabbitMQ** - Sistema de mensageria para notificações
- **JWT** - Autenticação por tokens
- **Passport.js** - Middleware de autenticação
- **Socket.io** - WebSockets para tempo real
- **Swagger** - Documentação da API
- **bcryptjs** - Hash de senhas

### Infraestrutura

- **Docker & Docker Compose** - Containerização
- **Turborepo** - Monorepo e build system
- **Jest** - Framework de testes
- **ESLint** - Linting de código
- **Prettier** - Formatação de código

## 🚀 Como Clonar e Executar o Projeto

### Pré-requisitos

- Node.js >= 18
- Docker e Docker Compose
- npm >= 11.4.2

### 1. Clonar o Repositório

```bash
git clone https://github.com/lucasvnborges/turborepo-todo.git
cd turborepo-todo
```

### 2. Instalar Dependências

```bash
npm install
```

### 3. Configurar Variáveis de Ambiente

```bash
# Copiar arquivos de exemplo
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env.local
```

#### Backend (`apps/backend/.env`)

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/todo_db
JWT_SECRET=seu-jwt-secret-aqui
REDIS_URL=redis://localhost:6379
RABBITMQ_URL=amqp://admin:admin@localhost:5672
```

#### Frontend (`apps/frontend/.env.local`)

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=seu-nextauth-secret-aqui
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 4. Iniciar Serviços de Infraestrutura

```bash
docker-compose up -d
```

Este comando iniciará:

- PostgreSQL na porta 5433
- Redis na porta 6379
- RabbitMQ na porta 5672 (Management UI: 15672)

### 5. Executar em Modo de Desenvolvimento

```bash
npm run dev
```

Isso iniciará:

- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- Documentação da API (Swagger): http://localhost:3001/api
- RabbitMQ Dashboard: http://localhost:15672 (user: admin pass: admin)

### 6. Build para Produção

```bash
npm run build
```

## 📋 Recursos da Aplicação

### Autenticação e Autorização

- ✅ Registro de usuários com validação
- ✅ Login/logout com JWT
- ✅ Proteção de rotas autenticadas
- ✅ Middleware de autenticação

### Gerenciamento de Tarefas

- ✅ Criar novas tarefas com título e descrição
- ✅ Listar todas as tarefas do usuário
- ✅ Editar tarefas existentes
- ✅ Marcar tarefas como concluídas/pendentes
- ✅ Excluir tarefas
- ✅ Filtrar tarefas por status (todas, pendentes, concluídas)
- ✅ Estatísticas de tarefas (total, pendentes, concluídas)
- ✅ Ação em lote: "Concluir todas as tarefas"

### Interface do Usuário

- ✅ Design responsivo com Tailwind CSS
- ✅ Componentes acessíveis com Radix UI
- ✅ Animações e transições suaves
- ✅ Estados de loading e feedback visual
- ✅ Modais para criação/edição de tarefas
- ✅ Ordenação inteligente (pendentes primeiro)

### Performance e Experiência

- ✅ **Atualizações otimistas** - Interface atualiza instantaneamente
- ✅ **Cache Redis** - Respostas rápidas da API
- ✅ **WebSockets** - Notificações em tempo real
- ✅ **React Query** - Cache inteligente no frontend
- ✅ **Lazy loading** - Carregamento otimizado

### Notificações em Tempo Real

- ✅ Notificações quando tarefas são criadas
- ✅ Notificações quando tarefas são concluídas
- ✅ Sistema de WebSockets para múltiplos usuários

### API RESTful

- ✅ Endpoints CRUD completos
- ✅ Documentação Swagger automática
- ✅ Validação de dados com class-validator
- ✅ Tratamento de erros padronizado
- ✅ Paginação e filtros

## 🧪 Testes

### Configuração de Testes

#### Frontend

- **Jest** com configuração para Next.js
- **Testing Library** para testes de componentes
- **jsdom** como ambiente de testes
- **User Event** para simulação de interações

#### Backend

- **Jest** com suporte a TypeScript
- **Supertest** para testes de integração
- **Mocks** para dependências externas
- **Coverage** para relatórios de cobertura

### Executar Testes

```bash
# Executar todos os testes
npm run test

# Executar testes em modo watch
npm run test:watch

# Executar testes com cobertura
npm run test:coverage

# Executar testes específicos do frontend
cd apps/frontend && npm run test

# Executar testes específicos do backend
cd apps/backend && npm run test
```

### Tipos de Testes Implementados

#### Frontend

- **Testes de Componentes**: Verificam renderização e interações
- **Testes de Formulários**: Validação e submissão
- **Testes de Hooks**: Lógica de estado e efeitos
- **Testes de Integração**: Fluxos completos de usuário

#### Backend

- **Testes Unitários**: Serviços e controladores
- **Testes de Integração**: Endpoints da API
- **Testes de Repositório**: Operações de banco de dados
- **Testes de Autenticação**: JWT e guards

### Exemplos de Testes

#### Teste de Componente (Frontend)

```typescript
describe('TodoForm', () => {
  it('deve submeter formulário com dados válidos', () => {
    const mockOnSubmit = jest.fn()
    render(<TodoForm onSubmit={mockOnSubmit} />)

    fireEvent.change(screen.getByLabelText('Título'), {
      target: { value: 'Nova Tarefa' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }))

    expect(mockOnSubmit).toHaveBeenCalledWith({
      title: 'Nova Tarefa',
      description: ''
    })
  })
})
```

#### Teste de Serviço (Backend)

```typescript
describe('TodosService', () => {
  it('deve criar uma nova tarefa com sucesso', async () => {
    const createTodoDto = {
      title: 'Tarefa de Teste',
      description: 'Descrição de Teste',
    }

    const result = await todosService.create(createTodoDto, userId)

    expect(mockTodoRepository.create).toHaveBeenCalledWith({
      ...createTodoDto,
      userId,
    })
    expect(result).toEqual(mockTodo)
  })
})
```

### Cobertura de Testes

Os testes cobrem:

- ✅ Componentes React e suas interações
- ✅ Lógica de negócios nos serviços
- ✅ Endpoints da API
- ✅ Validação de dados
- ✅ Tratamento de erros
- ✅ Autenticação e autorização

### Scripts de Teste Disponíveis

- `npm run test` - Executa todos os testes
- `npm run test:watch` - Executa testes em modo watch
- `npm run test:coverage` - Gera relatório de cobertura
- `npm run test:e2e` - Testes end-to-end (backend)

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia todos os serviços em modo dev
npm run build        # Build de produção
npm run lint         # Verificação de linting
npm run format       # Formatação de código
npm run check-types  # Verificação de tipos TypeScript

# Testes
npm run test         # Executa todos os testes
npm run test:watch   # Testes em modo watch
npm run test:coverage # Testes com cobertura
```

## 📁 Estrutura do Projeto

```
turborepo-todo/
├── apps/
│   ├── frontend/          # Aplicação Next.js
│   │   ├── src/
│   │   │   ├── app/       # App Router do Next.js
│   │   │   ├── components/ # Componentes React
│   │   │   ├── hooks/     # Hooks customizados
│   │   │   ├── services/  # Serviços de API
│   │   │   ├── stores/    # Estados globais (Zustand)
│   │   │   └── types/     # Tipos TypeScript
│   │   └── package.json
│   └── backend/           # API NestJS
│       ├── src/
│       │   ├── auth/      # Módulo de autenticação
│       │   ├── todos/     # Módulo de tarefas
│       │   ├── cache/     # Módulo de cache (Redis)
│       │   ├── notifications/ # WebSockets
│       │   ├── entities/  # Entidades do banco
│       │   └── dto/       # Data Transfer Objects
│       └── package.json
├── docker-compose.yml     # Serviços de infraestrutura
├── turbo.json            # Configuração do Turborepo
└── package.json          # Dependências do workspace
```

## 🌟 Funcionalidades Avançadas

- **Otimistic Updates**: Interface responsiva com atualizações instantâneas
- **Real-time Notifications**: WebSockets para notificações em tempo real
- **Caching Inteligente**: Redis no backend + React Query no frontend
- **Responsive Design**: Interface adaptável para todos os dispositivos
- **Acessibilidade**: Componentes seguem padrões WCAG
- **Performance**: Lazy loading e otimizações de bundle
- **Monorepo**: Código compartilhado e builds otimizados

## 📄 Licença

Este projeto está sob a licença MIT.
