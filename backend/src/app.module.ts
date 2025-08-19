import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RequirementsModule } from './requirements/requirements.module';
import { TasksModule } from './tasks/tasks.module';
import { MilestonesModule } from './milestones/milestones.module';
import { CommentsModule } from './comments/comments.module';
import { TemplatesModule } from './templates/templates.module';
import { NotificationsModule } from './notifications/notifications.module';
import { User } from './users/entities/user.entity';
import { Task } from './tasks/entities/task.entity';
import { SubTask } from './tasks/entities/subtask.entity';
import { Comment } from './comments/entities/comment.entity';
import { Attachment } from './attachments/entities/attachment.entity';
import { Activity } from './activities/entities/activity.entity';
import { Requirement } from './requirements/entities/requirement.entity';
import { Milestone } from './milestones/entities/milestone.entity';
import { RequirementComment }    from './requirements/entities/requirement-comment.entity';
import { ApprovalRequest }       from './requirements/entities/approval-request.entity';
import { Template } from './templates/entities/template.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      ...(process.env.DATABASE_URL ? {
        url: process.env.DATABASE_URL,
      } : {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_DATABASE || 'flowboard',
      }),
      entities: [
        User, 
        Task, 
        SubTask, 
        Comment, 
        Attachment, 
        Activity, 
        Requirement, 
        Milestone, 
        RequirementComment, 
        ApprovalRequest,
        Template,
      ],
      // TEMPORARIAMENTE habilitado para criar tabelas em produção
      synchronize: true, // process.env.NODE_ENV !== 'production',
      dropSchema: false,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      logging: process.env.NODE_ENV === 'development',
      retryAttempts: 3,
      retryDelay: 3000,
    }),
    AuthModule,
    UsersModule,
    RequirementsModule,
    TasksModule,
    MilestonesModule,
    CommentsModule,
    TemplatesModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
