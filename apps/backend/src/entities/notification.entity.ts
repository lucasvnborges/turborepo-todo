import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm'
import { User } from './user.entity'
import { Todo } from './todo.entity'

export enum NotificationType {
  TODO_CREATED = 'TODO_CREATED',
  TODO_COMPLETED = 'TODO_COMPLETED',
  TODO_UPDATED = 'TODO_UPDATED',
  TODO_DELETED = 'TODO_DELETED',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ name: 'user_id' })
  userId: number

  @Column({ name: 'todo_id' })
  todoId: number

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType

  @Column()
  title: string

  @Column('text')
  message: string

  @Column({ default: false })
  read: boolean

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User

  @ManyToOne(() => Todo, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'todo_id' })
  todo: Todo

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date
}
