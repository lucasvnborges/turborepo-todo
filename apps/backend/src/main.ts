import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { ValidationPipe } from '@nestjs/common'
import { Transport, MicroserviceOptions } from '@nestjs/microservices'
import { AppModule } from './app.module'
import { IoAdapter } from '@nestjs/platform-socket.io'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // Configurar CORS
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  })

  // Configurar Socket.IO adapter
  app.useWebSocketAdapter(new IoAdapter(app))

  // Pipe de validação global
  app.useGlobalPipes(new ValidationPipe())

  // Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle('Todo API')
    .setDescription('API para gerenciar tarefas')
    .setVersion('1.0')
    .addTag('auth')
    .addTag('user')
    .addTag('todos')
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document)

  // Configurar microserviço RabbitMQ (opcional - só se RabbitMQ estiver rodando)
  try {
    app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://admin:admin@localhost:5672'],
        queue: 'notifications_queue',
        queueOptions: {
          durable: true,
        },
      },
    })

    // Iniciar microserviços
    await app.startAllMicroservices()
    console.log('RabbitMQ conectado com sucesso')
  } catch (error) {
    console.warn('RabbitMQ não está disponível, continuando sem notificações:', error.message)
  }

  await app.listen(process.env.PORT ?? 3001)
  console.log(`Aplicação rodando em: http://localhost:${process.env.PORT ?? 3001}`)
  console.log(`Swagger disponível em: http://localhost:${process.env.PORT ?? 3001}/api`)
}

bootstrap().catch(console.error)
