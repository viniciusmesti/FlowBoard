import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { Task } from './entities/task.entity';
import { SubTask } from './entities/subtask.entity';
import { TasksService } from './tasks.service';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  async create(@Body() createTaskDto: Partial<Task>) {
    return this.tasksService.create(createTaskDto);
  }

  @Get()
  async findAll() {
    return this.tasksService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateTaskDto: Partial<Task>) {
    return this.tasksService.update(id, updateTaskDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.tasksService.remove(id);
  }

  @Post(':id/subtasks')
  async addSubtask(
    @Param('id') taskId: string,
    @Body() subtaskData: Partial<SubTask>
  ) {
    return this.tasksService.addSubtask(taskId, subtaskData);
  }

  @Patch(':taskId/subtasks/:subtaskId')
  async updateSubtask(
    @Param('taskId') taskId: string,
    @Param('subtaskId') subtaskId: string,
    @Body() subtaskData: Partial<SubTask>
  ) {
    return this.tasksService.updateSubtask(taskId, subtaskId, subtaskData);
  }

  @Delete(':taskId/subtasks/:subtaskId')
  async removeSubtask(
    @Param('taskId') taskId: string,
    @Param('subtaskId') subtaskId: string
  ) {
    return this.tasksService.removeSubtask(taskId, subtaskId);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: Task['status']
  ) {
    return this.tasksService.updateStatus(id, status);
  }

  @Patch(':id/progress')
  async updateProgress(
    @Param('id') id: string,
    @Body('progress') progress: number
  ) {
    return this.tasksService.updateProgress(id, progress);
  }
} 