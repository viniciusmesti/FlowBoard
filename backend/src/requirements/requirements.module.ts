import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Requirement, RequirementComment, ApprovalRequest } from './entities';
import { Task } from '../tasks/entities/task.entity';
import { RequirementsController } from './requirements.controller';
import { RequirementsService } from './requirements.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Requirement,
      RequirementComment,
      ApprovalRequest,
      Task
    ])
  ],
  controllers: [RequirementsController],
  providers: [RequirementsService],
  exports: [TypeOrmModule]
})
export class RequirementsModule {}
