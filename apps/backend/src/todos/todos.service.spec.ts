import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { NotFoundException } from '@nestjs/common'
import { TodosService } from './todos.service'
import { Todo, TodoStatus } from '../entities/todo.entity'
import { CreateTodoDto, UpdateTodoDto } from '../dto/todo.dto'
import { NotificationsService } from '../notifications/notifications.service'
import { RedisService } from '../cache/redis.service'

describe('TodosService', () => {
  let todosService: TodosService
  let todoRepository: Repository<Todo>
  let notificationsService: NotificationsService
  let redisService: RedisService

  const mockTodoRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  }

  const mockNotificationsService = {
    sendTodoCreatedNotification: jest.fn(),
    sendTodoCompletedNotification: jest.fn(),
  }

  const mockRedisService = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodosService,
        {
          provide: getRepositoryToken(Todo),
          useValue: mockTodoRepository,
        },
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
      ],
    }).compile()

    todosService = module.get<TodosService>(TodosService)
    todoRepository = module.get<Repository<Todo>>(getRepositoryToken(Todo))
    notificationsService = module.get<NotificationsService>(NotificationsService)
    redisService = module.get<RedisService>(RedisService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('create', () => {
    it('deve criar uma nova tarefa com sucesso', async () => {
      const createTodoDto: CreateTodoDto = {
        title: 'Tarefa de Teste',
        description: 'Descrição de Teste',
      }
      const userId = 1

      const mockTodo = {
        id: 1,
        title: 'Tarefa de Teste',
        description: 'Descrição de Teste',
        status: TodoStatus.PENDING,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockTodoRepository.create.mockReturnValue(mockTodo)
      mockTodoRepository.save.mockResolvedValue(mockTodo)
      mockRedisService.del.mockResolvedValue(true)
      mockNotificationsService.sendTodoCreatedNotification.mockResolvedValue(undefined)

      const result = await todosService.create(createTodoDto, userId)

      expect(mockTodoRepository.create).toHaveBeenCalledWith({
        ...createTodoDto,
        userId,
      })
      expect(mockTodoRepository.save).toHaveBeenCalledWith(mockTodo)
      expect(mockRedisService.del).toHaveBeenCalledWith(`todos:user:${userId}`)
      expect(mockNotificationsService.sendTodoCreatedNotification).toHaveBeenCalledWith(
        mockTodo,
        userId,
      )
      expect(result).toEqual(mockTodo)
    })
  })

  describe('findAll', () => {
    it('deve retornar tarefas do cache se disponíveis', async () => {
      const userId = 1
      const cachedTodos = [
        {
          id: 1,
          title: 'Tarefa do Cache',
          description: 'Do cache',
          status: TodoStatus.PENDING,
          userId,
        },
      ]

      mockRedisService.get.mockResolvedValue(JSON.stringify(cachedTodos))

      const result = await todosService.findAll(userId)

      expect(mockRedisService.get).toHaveBeenCalledWith(`todos:user:${userId}`)
      expect(result).toEqual(cachedTodos)
      expect(mockTodoRepository.find).not.toHaveBeenCalled()
    })

    it('deve buscar do banco de dados e cachear se não estiver no cache', async () => {
      const userId = 1
      const dbTodos = [
        {
          id: 1,
          title: 'Tarefa do BD',
          description: 'Do banco de dados',
          status: TodoStatus.PENDING,
          userId,
        },
      ]

      mockRedisService.get.mockResolvedValue(null)
      mockTodoRepository.find.mockResolvedValue(dbTodos)
      mockRedisService.set.mockResolvedValue(true)

      const result = await todosService.findAll(userId)

      expect(mockRedisService.get).toHaveBeenCalledWith(`todos:user:${userId}`)
      expect(mockTodoRepository.find).toHaveBeenCalledWith({
        where: { userId },
        order: { createdAt: 'DESC' },
      })
      expect(mockRedisService.set).toHaveBeenCalledWith(
        `todos:user:${userId}`,
        JSON.stringify(dbTodos),
        300,
      )
      expect(result).toEqual(dbTodos)
    })
  })

  describe('update', () => {
    it('deve atualizar tarefa e enviar notificação quando concluída', async () => {
      const todoId = 1
      const userId = 1
      const updateTodoDto: UpdateTodoDto = {
        status: TodoStatus.COMPLETED,
      }

      const existingTodo = {
        id: todoId,
        title: 'Tarefa de Teste',
        description: 'Descrição de Teste',
        status: TodoStatus.PENDING,
        userId,
      }

      const updatedTodo = {
        ...existingTodo,
        status: TodoStatus.COMPLETED,
      }

      mockTodoRepository.findOne.mockResolvedValue(existingTodo)
      mockTodoRepository.save.mockResolvedValue(updatedTodo)
      mockRedisService.del.mockResolvedValue(true)
      mockNotificationsService.sendTodoCompletedNotification.mockResolvedValue(undefined)

      const result = await todosService.update(todoId, updateTodoDto, userId)

      expect(mockTodoRepository.findOne).toHaveBeenCalledWith({
        where: { id: todoId, userId },
      })
      expect(mockTodoRepository.save).toHaveBeenCalledWith(updatedTodo)
      expect(mockRedisService.del).toHaveBeenCalledWith(`todos:user:${userId}`)
      expect(mockNotificationsService.sendTodoCompletedNotification).toHaveBeenCalledWith(
        updatedTodo,
        userId,
      )
      expect(result).toEqual(updatedTodo)
    })
  })

  describe('findOne', () => {
    it('deve retornar tarefa se encontrada', async () => {
      const todoId = 1
      const userId = 1
      const mockTodo = {
        id: todoId,
        title: 'Tarefa de Teste',
        userId,
      }

      mockTodoRepository.findOne.mockResolvedValue(mockTodo)

      const result = await todosService.findOne(todoId, userId)

      expect(mockTodoRepository.findOne).toHaveBeenCalledWith({
        where: { id: todoId, userId },
      })
      expect(result).toEqual(mockTodo)
    })

    it('deve lançar NotFoundException se tarefa não for encontrada', async () => {
      const todoId = 999
      const userId = 1

      mockTodoRepository.findOne.mockResolvedValue(null)

      await expect(todosService.findOne(todoId, userId)).rejects.toThrow(
        NotFoundException,
      )
    })
  })
}) 