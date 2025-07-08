import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TodosService } from './todos.service'
import { TodosController } from './todos.controller'
import { Todo } from '../entities/todo.entity'
import { NotificationsModule } from '../notifications/notifications.module'
import { CacheModule } from '../cache/cache.module'

@Module({
  providers: [TodosService],
  controllers: [TodosController],
  imports: [TypeOrmModule.forFeature([Todo]), NotificationsModule, CacheModule],
})
export class TodosModule {}
