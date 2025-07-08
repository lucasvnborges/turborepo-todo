import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TodosService } from './todos.service'
import { TodosController } from './todos.controller'
import { Todo } from '../entities/todo.entity'
import { NotificationsModule } from '../notifications/notifications.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([Todo]),
    NotificationsModule,
  ],
  controllers: [TodosController],
  providers: [TodosService],
})
export class TodosModule {}
