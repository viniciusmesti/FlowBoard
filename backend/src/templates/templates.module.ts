import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Template } from './entities/template.entity';
import { Task } from '../tasks/entities/task.entity';
import { TemplatesController } from './templates.controller';
import { TemplatesService } from './templates.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Template, Task])
  ],
  controllers: [TemplatesController],
  providers: [TemplatesService],
  exports: [TemplatesService]
})
export class TemplatesModule {}
