import { Controller, Logger } from '@nestjs/common'
import { MessagePattern, Payload } from '@nestjs/microservices'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CreateNotificationDto } from '../dto/notification.dto'
import { Notification } from '../entities/notification.entity'
import { NotificationsGateway } from './notifications.gateway'

@Controller()
export class NotificationsController {
  private readonly logger = new Logger(NotificationsController.name)

  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    private notificationsGateway: NotificationsGateway,
  ) {}

  @MessagePattern('process-notification')
  async handleNotification(@Payload() notification: CreateNotificationDto) {
    this.logger.log(`Processando notificação: ${JSON.stringify(notification)}`)

    try {
      // 1. Salvar notificação no banco de dados
      await this.saveNotificationToDatabase(notification)

      // 2. Enviar notificação em tempo real via WebSocket
      await this.sendRealTimeNotification(notification)

      this.logger.log(
        `Notificação processada com sucesso para o usuário ${notification.userId}`,
      )

      return { success: true, message: 'Notificação processada com sucesso' }
    } catch (error) {
      this.logger.error(`Erro ao processar notificação: ${error.message}`)
      throw error
    }
  }

  private async saveNotificationToDatabase(
    notification: CreateNotificationDto,
  ): Promise<Notification> {
    const newNotification = this.notificationRepository.create({
      userId: notification.userId,
      todoId: notification.todoId,
      type: notification.type as any,
      title: notification.title,
      message: notification.message,
      read: false,
    })

    return await this.notificationRepository.save(newNotification)
  }

  private async sendRealTimeNotification(notification: CreateNotificationDto) {
    const success = this.notificationsGateway.emitNotificationToUser(
      notification.userId,
      {
        todoId: notification.todoId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        timestamp: new Date().toISOString(),
      },
    )

    if (!success) {
      this.logger.warn(
        'Não foi possível enviar notificação via WebSocket. Apenas salva no banco.',
      )
    }
  }
}
