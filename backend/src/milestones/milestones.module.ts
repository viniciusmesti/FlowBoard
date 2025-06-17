import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Milestone } from './entities';
import { Task } from '../tasks/entities/task.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Milestone, Task])
  ],
  controllers: [],
  providers: [],
  exports: [TypeOrmModule]
})
export class MilestonesModule {}
