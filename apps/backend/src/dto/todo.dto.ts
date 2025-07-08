import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsEnum, IsOptional, IsNotEmpty } from 'class-validator'
import { TodoStatus } from '../entities/todo.entity'

export class CreateTodoDto {
  @ApiProperty({ example: 'Lavar a louça' })
  @IsString()
  @IsNotEmpty()
  title: string

  @ApiProperty({ example: 'Lavar todos os pratos e copos que estão na pia', required: false })
  @IsString()
  @IsOptional()
  description?: string
}

export class UpdateTodoDto {
  @ApiProperty({ example: 'Aspirar a sala', required: false })
  @IsString()
  @IsOptional()
  title?: string

  @ApiProperty({
    example: 'Aspirar o tapete e limpar embaixo dos móveis',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string

  @ApiProperty({ example: 'completed', enum: TodoStatus, required: false })
  @IsEnum(TodoStatus)
  @IsOptional()
  status?: TodoStatus
}

export class TodoResponseDto {
  @ApiProperty()
  id: number

  @ApiProperty()
  title: string

  @ApiProperty()
  description: string

  @ApiProperty({ enum: TodoStatus })
  status: TodoStatus

  @ApiProperty()
  userId: number

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date
}
