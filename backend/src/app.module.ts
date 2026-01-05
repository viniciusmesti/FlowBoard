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
import { SystemsModule } from './systems/systems.module';
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
import { System } from './systems/entities/system.entity';

// Helper function to get database configuration with fallback
function getDatabaseConfig() {
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (process.env.DATABASE_URL) {
    // Parse DATABASE_URL to check if it's Internal or External
    const dbUrl = process.env.DATABASE_URL;
    const urlMatch = dbUrl.match(/^postgresql:\/\/([^:]+):([^@]+)@([^\/]+)\/(.+)$/);
    
    if (urlMatch) {
      const [, username, password, host, database] = urlMatch;
      
      // Supabase requer SSL. Para Supabase, usar rejectUnauthorized: false funciona
      const isSupabase = host.includes('supabase.com');
      return {
        type: 'postgres' as const,
        url: dbUrl,
        ssl: isProduction || isSupabase || dbUrl.includes('supabase.com') 
          ? { rejectUnauthorized: false } 
          : false,
      };
    }
  }
  
  // Fallback to individual environment variables
  return {
    type: 'postgres' as const,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'flowboard',
    ssl: isProduction ? { rejectUnauthorized: false } : false,
  };
}

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...getDatabaseConfig(),
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
        System,
      ],
      // TEMPORARIAMENTE habilitado para criar tabelas em produção
      synchronize: true, // process.env.NODE_ENV !== 'production',
      dropSchema: false,
      logging: process.env.NODE_ENV === 'development',
      retryAttempts: 5,
      retryDelay: 3000,
      // Better error handling
      extra: {
        connectTimeoutMS: 10000,
        statement_timeout: 30000,
      },
    }),
    AuthModule,
    UsersModule,
    RequirementsModule,
    TasksModule,
    MilestonesModule,
    CommentsModule,
    TemplatesModule,
    NotificationsModule,
    SystemsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
