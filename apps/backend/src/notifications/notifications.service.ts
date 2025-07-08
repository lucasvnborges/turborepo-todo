import { Injectable, Logger } from '@nestjs/common'
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices'
import { firstValueFrom } from 'rxjs'
import { Todo } from '../entities/todo.entity'
import { NotificationsGateway } from './notifications.gateway'
import { CreateNotificationDto } from '../dto/notification.dto'

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name)
  private client: ClientProxy

  constructor(private notificationsGateway: NotificationsGateway) {
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
      title: '✅ Nova tarefa criada',
      message: `Sua tarefa "${todo.title}" foi criada com sucesso!`,
    }

    await this.processNotification(notification)
  }

  async sendTodoCompletedNotification(todo: Todo, userId: number): Promise<void> {
    const notification: CreateNotificationDto = {
      userId,
      todoId: todo.id,
      type: 'TODO_COMPLETED',
      title: '🎉 Tarefa concluída',
      message: `Parabéns! Você concluiu a tarefa "${todo.title}"!`,
    }

    await this.processNotification(notification)
  }

  async sendTodoUpdatedNotification(todo: Todo, userId: number): Promise<void> {
    const notification: CreateNotificationDto = {
      userId,
      todoId: todo.id,
      type: 'TODO_UPDATED',
      title: '📝 Tarefa atualizada',
      message: `A tarefa "${todo.title}" foi atualizada.`,
    }

    await this.processNotification(notification)
  }

  async sendTodoDeletedNotification(todoTitle: string, userId: number): Promise<void> {
    const notification: CreateNotificationDto = {
      userId,
      todoId: 0,
      type: 'TODO_DELETED',
      title: '🗑️ Tarefa removida',
      message: `A tarefa "${todoTitle}" foi removida.`,
    }

    await this.processNotification(notification)
  }

  private async processNotification(notification: CreateNotificationDto): Promise<void> {
    try {
      // Enviar via WebSocket em tempo real
      const sent = this.notificationsGateway.emitNotificationToUser(
        notification.userId,
        {
          ...notification,
          timestamp: new Date().toISOString(),
        }
      )

      if (sent) {
        this.logger.log(`✅ Notificação enviada via WebSocket: ${notification.title}`)
      } else {
        this.logger.warn(`⚠️ Usuário ${notification.userId} não está online`)
      }

      // Enviar para RabbitMQ apenas para persistência (sem reenviar via WebSocket)
      await firstValueFrom(this.client.emit('process-notification', notification))
      this.logger.log(`💾 Notificação enviada para RabbitMQ: ${notification.title}`)
    } catch (error) {
      this.logger.error(`❌ Erro ao processar notificação: ${error.message}`)
    }
  }

  onModuleDestroy() {
    this.client.close()
  }
}
