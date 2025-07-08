import { Controller, Logger } from '@nestjs/common'
import { MessagePattern, Payload } from '@nestjs/microservices'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CreateNotificationDto } from '../dto/notification.dto'
import { Notification } from '../entities/notification.entity'

@Controller()
export class NotificationsController {
  private readonly logger = new Logger(NotificationsController.name)

  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  @MessagePattern('process-notification')
  async handleNotification(@Payload() notification: CreateNotificationDto) {
    this.logger.log(`💾 Salvando notificação no banco: ${notification.title}`)

    try {
      await this.saveNotificationToDatabase(notification)

      this.logger.log(
        `✅ Notificação salva no banco para usuário ${notification.userId}`,
      )

      return { success: true, message: 'Notificação salva com sucesso' }
    } catch (error) {
      this.logger.error(`❌ Erro ao salvar notificação: ${error.message}`)
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
}
