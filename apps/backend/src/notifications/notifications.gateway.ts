import { Logger } from '@nestjs/common'
import { Server } from 'socket.io'
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
} from '@nestjs/websockets'
import { Socket } from 'socket.io'

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  private readonly logger = new Logger(NotificationsGateway.name)

  @WebSocketServer()
  server: Server

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway inicializado')
  }

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

  // Método público para enviar notificações
  emitNotificationToUser(userId: number, data: any) {
    if (!this.server) {
      this.logger.warn('Servidor WebSocket não está disponível')
      return false
    }

    this.server.to(`user-${userId}`).emit('notification', data)
    return true
  }
} 