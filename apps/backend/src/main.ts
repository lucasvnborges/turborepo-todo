import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { ValidationPipe } from '@nestjs/common'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // Habilitar CORS
  app.enableCors()

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

  await app.listen(process.env.PORT ?? 3001)
}

bootstrap().catch(console.error)
