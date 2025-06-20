import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { SeedDataService } from './seed-data';
import { Requirement } from '../requirements/entities/requirement.entity';
import { Task } from '../tasks/entities/task.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Requirement, Task, User]),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, SeedDataService],
})
export class NotificationsModule {}
