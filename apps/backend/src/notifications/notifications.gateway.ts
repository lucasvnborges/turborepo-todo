import { Logger, UseGuards } from '@nestjs/common'
import { Server } from 'socket.io'
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets'
import { Socket } from 'socket.io'
import { JwtService } from '@nestjs/jwt'

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  private readonly logger = new Logger(NotificationsGateway.name)
  private userSockets = new Map<number, string>()

  constructor(private jwtService: JwtService) {}

  @WebSocketServer()
  server: Server

  afterInit(server: Server) {
    this.logger.log('🚀 WebSocket Gateway inicializado')
  }

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token
      if (!token) {
        this.logger.warn('Cliente tentou conectar sem token')
        client.disconnect()
        return
      }

      const payload = this.jwtService.verify(token)
      const userId = payload.sub

      client.data.userId = userId
      this.userSockets.set(userId, client.id)
      
      this.logger.log(`✅ Cliente ${client.id} conectado para usuário ${userId}`)
    } catch (error) {
      this.logger.error('❌ Erro na autenticação WebSocket:', error.message)
      client.disconnect()
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId
    if (userId) {
      this.userSockets.delete(userId)
      this.logger.log(`❌ Cliente ${client.id} desconectado (usuário ${userId})`)
    }
  }

  @SubscribeMessage('join-user-room')
  handleJoinUserRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() userId: number
  ) {
    if (client.data.userId !== userId) {
      this.logger.warn(`Cliente ${client.id} tentou entrar em sala de outro usuário`)
      client.disconnect()
      return
    }

    client.join(`user-${userId}`)
    this.logger.log(`👤 Cliente ${client.id} entrou na sala do usuário ${userId}`)
  }

  // Método público para enviar notificações
  emitNotificationToUser(userId: number, data: any) {
    if (!this.server) {
      this.logger.warn('Servidor WebSocket não está disponível')
      return false
    }

    const roomName = `user-${userId}`
    const clientsInRoom = this.server.sockets.adapter.rooms.get(roomName)
    
    if (!clientsInRoom || clientsInRoom.size === 0) {
      this.logger.warn(`Usuário ${userId} não está conectado via WebSocket`)
      return false
    }

    this.server.to(roomName).emit('notification', data)
    this.logger.log(`🔔 Notificação enviada para usuário ${userId}: ${data.title}`)
    return true
  }

  // Método para verificar se usuário está online
  isUserOnline(userId: number): boolean {
    return this.userSockets.has(userId)
  }

  // Método para obter estatísticas
  getStats() {
    return {
      connectedUsers: this.userSockets.size,
      totalRooms: this.server.sockets.adapter.rooms.size,
    }
  }
}