import { Injectable, NotFoundException, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Todo, TodoStatus } from '../entities/todo.entity'
import { CreateTodoDto, UpdateTodoDto } from '../dto/todo.dto'
import { NotificationsService } from '../notifications/notifications.service'
import { RedisService } from '../cache/redis.service'

@Injectable()
export class TodosService {
  private readonly logger = new Logger(TodosService.name)
  private readonly CACHE_TTL = 300 // 5 minutes
  private readonly CACHE_KEY_PREFIX = 'todos:user:'

  constructor(
    @InjectRepository(Todo)
    private todoRepository: Repository<Todo>,
    private notificationsService: NotificationsService,
    private redisService: RedisService,
  ) {}

  private getCacheKey(userId: number): string {
    return `${this.CACHE_KEY_PREFIX}${userId}`
  }

  async create(createTodoDto: CreateTodoDto, userId: number): Promise<Todo> {
    const todo = this.todoRepository.create({
      ...createTodoDto,
      userId,
    })

    const savedTodo = await this.todoRepository.save(todo)

    // Invalidar cache do usuário
    const cacheKey = this.getCacheKey(userId)
    await this.redisService.del(cacheKey)
    this.logger.log(`Cache invalidado para usuário ${userId} após criação de tarefa`)

    // Enviar notificação de tarefa criada
    await this.notificationsService.sendTodoCreatedNotification(savedTodo, userId)

    return savedTodo
  }

  async findAll(userId: number): Promise<Todo[]> {
    const cacheKey = this.getCacheKey(userId)
    
    // Tentar buscar do cache primeiro
    const startTime = Date.now()
    const cachedTodos = await this.redisService.get(cacheKey)
    
    if (cachedTodos) {
      const endTime = Date.now()
      this.logger.log(`Cache HIT para usuário ${userId} - Tempo: ${endTime - startTime}ms`)
      return JSON.parse(cachedTodos)
    }

    // Se não estiver no cache, buscar do banco
    this.logger.log(`Cache MISS para usuário ${userId} - Buscando no banco`)
    const dbStartTime = Date.now()
    const todos = await this.todoRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    })
    const dbEndTime = Date.now()

    // Armazenar no cache
    await this.redisService.set(cacheKey, JSON.stringify(todos), this.CACHE_TTL)
    this.logger.log(`Dados armazenados no cache para usuário ${userId} - Tempo DB: ${dbEndTime - dbStartTime}ms`)

    return todos
  }

  async findOne(id: number, userId: number): Promise<Todo> {
    const todo = await this.todoRepository.findOne({
      where: { id, userId },
    })

    if (!todo) {
      throw new NotFoundException('Tarefa não encontrada')
    }

    return todo
  }

  async update(
    id: number,
    updateTodoDto: UpdateTodoDto,
    userId: number,
  ): Promise<Todo> {
    const todo = await this.findOne(id, userId)
    const previousStatus = todo.status

    Object.assign(todo, updateTodoDto)

    const updatedTodo = await this.todoRepository.save(todo)

    // Invalidar cache do usuário
    const cacheKey = this.getCacheKey(userId)
    await this.redisService.del(cacheKey)
    this.logger.log(`Cache invalidado para usuário ${userId} após atualização de tarefa`)

    // Enviar notificação se a tarefa foi marcada como concluída
    if (previousStatus !== TodoStatus.COMPLETED && updatedTodo.status === TodoStatus.COMPLETED) {
      await this.notificationsService.sendTodoCompletedNotification(updatedTodo, userId)
    }

    return updatedTodo
  }

  async remove(id: number, userId: number): Promise<void> {
    const todo = await this.findOne(id, userId)

    await this.todoRepository.remove(todo)

    // Invalidar cache do usuário
    const cacheKey = this.getCacheKey(userId)
    await this.redisService.del(cacheKey)
    this.logger.log(`Cache invalidado para usuário ${userId} após remoção de tarefa`)
  }
}
