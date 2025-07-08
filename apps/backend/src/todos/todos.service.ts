import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Todo, TodoStatus } from '../entities/todo.entity'
import { CreateTodoDto, UpdateTodoDto } from '../dto/todo.dto'
import { NotificationsService } from '../notifications/notifications.service'

@Injectable()
export class TodosService {
  constructor(
    @InjectRepository(Todo)
    private todoRepository: Repository<Todo>,
    private notificationsService: NotificationsService,
  ) {}

  async create(createTodoDto: CreateTodoDto, userId: number): Promise<Todo> {
    const todo = this.todoRepository.create({
      ...createTodoDto,
      userId,
    })

    const savedTodo = await this.todoRepository.save(todo)

    // Enviar notificação de tarefa criada
    await this.notificationsService.sendTodoCreatedNotification(savedTodo, userId)

    return savedTodo
  }

  async findAll(userId: number): Promise<Todo[]> {
    return await this.todoRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    })
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

    // Enviar notificação se a tarefa foi marcada como concluída
    if (previousStatus !== TodoStatus.COMPLETED && updatedTodo.status === TodoStatus.COMPLETED) {
      await this.notificationsService.sendTodoCompletedNotification(updatedTodo, userId)
    }

    return updatedTodo
  }

  async remove(id: number, userId: number): Promise<void> {
    const todo = await this.findOne(id, userId)

    await this.todoRepository.remove(todo)
  }
}
