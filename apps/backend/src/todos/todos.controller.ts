import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ValidationPipe,
  ParseIntPipe,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger'
import { TodosService } from './todos.service'
import { CreateTodoDto, UpdateTodoDto, TodoResponseDto } from '../dto/todo.dto'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { User } from '../entities/user.entity'

@ApiTags('todos')
@Controller('todos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Post()
  @ApiOperation({ summary: 'Criar uma nova tarefa' })
  @ApiResponse({
    status: 201,
    description: 'Tarefa criada com sucesso',
    type: TodoResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async create(
    @Body(ValidationPipe) createTodoDto: CreateTodoDto,
    @Request() req: { user: User },
  ) {
    return this.todosService.create(createTodoDto, req.user.id)
  }

  @Get()
  @ApiOperation({ 
    summary: 'Listar todas as tarefas do usuário',
    description: 'Retorna todas as tarefas do usuário logado. Utiliza cache Redis para melhor performance.'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de tarefas do usuário',
    type: [TodoResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async findAll(@Request() req: { user: User }) {
    return this.todosService.findAll(req.user.id)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar uma tarefa específica' })
  @ApiResponse({
    status: 200,
    description: 'Tarefa encontrada',
    type: TodoResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Tarefa não encontrada' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: User },
  ) {
    return this.todosService.findOne(id, req.user.id)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar uma tarefa' })
  @ApiResponse({
    status: 200,
    description: 'Tarefa atualizada com sucesso',
    type: TodoResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Tarefa não encontrada' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateTodoDto: UpdateTodoDto,
    @Request() req: { user: User },
  ) {
    return this.todosService.update(id, updateTodoDto, req.user.id)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir uma tarefa' })
  @ApiResponse({
    status: 200,
    description: 'Tarefa excluída com sucesso',
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Tarefa não encontrada' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: User },
  ) {
    await this.todosService.remove(id, req.user.id)
    return { message: 'Tarefa excluída com sucesso' }
  }
}
