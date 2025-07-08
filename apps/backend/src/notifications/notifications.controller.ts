import { Controller, Logger } from '@nestjs/common'
import { MessagePattern, Payload } from '@nestjs/microservices'
import { Server } from 'socket.io'
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CreateNotificationDto } from '../dto/notification.dto'
import { Notification } from '../entities/notification.entity'
import { Socket } from 'socket.io'

@Controller()
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationsController
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(NotificationsController.name)

  @WebSocketServer()
  server: Server

  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  handleConnection(client: Socket) {
    this.logger.log(`Cliente conectado: ${client.id}`)
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Cliente desconectado: ${client.id}`)
  }

  @SubscribeMessage('join-user-room')
  handleJoinUserRoom(client: Socket, userId: number) {
    client.join(`user-${userId}`)
    this.logger.log(`Cliente ${client.id} entrou na sala do usuário ${userId}`)
  }

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
    // Enviar via WebSocket para o usuário específico
    this.server.to(`user-${notification.userId}`).emit('notification', {
      todoId: notification.todoId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      timestamp: new Date().toISOString(),
    })
  }
}
