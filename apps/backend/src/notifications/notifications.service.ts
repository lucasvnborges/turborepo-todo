import { Injectable, Logger } from '@nestjs/common'
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices'
import { firstValueFrom } from 'rxjs'
import { CreateNotificationDto } from '../dto/notification.dto'
import { Todo } from '../entities/todo.entity'

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name)
  private client: ClientProxy

  constructor() {
    this.client = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://admin:admin@localhost:5672'],
        queue: 'notifications_queue',
        queueOptions: {
          durable: true,
        },
      },
    })
  }

  async sendTodoCreatedNotification(todo: Todo, userId: number): Promise<void> {
    const notification: CreateNotificationDto = {
      userId,
      todoId: todo.id,
      type: 'TODO_CREATED',
      title: 'Nova tarefa criada',
      message: `Sua tarefa "${todo.title}" foi criada com sucesso!`,
    }

    try {
      await firstValueFrom(this.client.emit('process-notification', notification))
      this.logger.log(
        `Notificação enviada para RabbitMQ: ${notification.title}`,
      )
    } catch (error) {
      this.logger.error(
        `Erro ao enviar notificação para RabbitMQ: ${error.message}`,
      )
    }
  }

  async sendTodoCompletedNotification(
    todo: Todo,
    userId: number,
  ): Promise<void> {
    const notification: CreateNotificationDto = {
      userId,
      todoId: todo.id,
      type: 'TODO_COMPLETED',
      title: 'Tarefa concluída',
      message: `Parabéns! Você concluiu a tarefa "${todo.title}"!`,
    }

    try {
      await firstValueFrom(this.client.emit('process-notification', notification))
      this.logger.log(
        `Notificação de conclusão enviada para RabbitMQ: ${notification.title}`,
      )
    } catch (error) {
      this.logger.error(
        `Erro ao enviar notificação de conclusão para RabbitMQ: ${error.message}`,
      )
    }
  }

  onModuleDestroy() {
    this.client.close()
  }
}
