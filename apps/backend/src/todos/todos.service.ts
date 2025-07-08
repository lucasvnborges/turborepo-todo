import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Todo } from '../entities/todo.entity'
import { CreateTodoDto, UpdateTodoDto } from '../dto/todo.dto'

@Injectable()
export class TodosService {
  constructor(
    @InjectRepository(Todo)
    private todoRepository: Repository<Todo>,
  ) {}

  async create(createTodoDto: CreateTodoDto, userId: number): Promise<Todo> {
    const todo = this.todoRepository.create({
      ...createTodoDto,
      userId,
    })

    return await this.todoRepository.save(todo)
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

    Object.assign(todo, updateTodoDto)

    return await this.todoRepository.save(todo)
  }

  async remove(id: number, userId: number): Promise<void> {
    const todo = await this.findOne(id, userId)

    await this.todoRepository.remove(todo)
  }
}
