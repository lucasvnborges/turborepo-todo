import { ApiProperty } from '@nestjs/swagger'

export class NotificationDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  userId: number

  @ApiProperty()
  todoId: number

  @ApiProperty()
  type: string

  @ApiProperty()
  title: string

  @ApiProperty()
  message: string

  @ApiProperty()
  createdAt: Date
}

export class CreateNotificationDto {
  @ApiProperty({ example: 1 })
  userId: number

  @ApiProperty({ example: 1 })
  todoId: number

  @ApiProperty({ example: 'TODO_CREATED' })
  type: string

  @ApiProperty({ example: 'Nova tarefa criada' })
  title: string

  @ApiProperty({
    example: 'Sua tarefa "Lavar a louça" foi criada com sucesso!',
  })
  message: string
}
