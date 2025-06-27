import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseInterceptors, 
  UploadedFiles,
  BadRequestException,
  Logger
} from '@nestjs/common';
import { Task } from './entities/task.entity';
import { SubTask } from './entities/subtask.entity';
import { TasksService } from './tasks.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { File as MulterFile } from 'multer';

@Controller('tasks')
export class TasksController {
  private readonly logger = new Logger(TasksController.name);

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
    this.logger.log(`Finding task with ID: ${id}`);
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

  @Post(':id/attachments')
  @UseInterceptors(FilesInterceptor('files', 10, {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const taskId = req.params.id;
        const dir = `uploads/tasks/${taskId}`;
        const fs = require('fs');
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + extname(file.originalname));
      },
    }),
    fileFilter: (req, file, cb) => {
      // Optional: Add file type validation
      cb(null, true);
    },
  }))
  async uploadAttachments(
    @Param('id') taskId: string,
    @UploadedFiles() files: MulterFile[],
  ) {
    this.logger.log(`Uploading attachments for task ${taskId}`);
    this.logger.log(`Files received: ${files?.length || 0}`);
    
    if (!taskId) {
      throw new BadRequestException('Task ID is required');
    }
    
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    try {
      // First check if task exists
      const taskExists = await this.tasksService.taskExists(taskId);
      if (!taskExists) {
        this.logger.error(`Task with ID ${taskId} does not exist`);
        throw new BadRequestException(`Task with ID ${taskId} not found`);
      }

      this.logger.log(`Task ${taskId} exists, proceeding with upload`);
      
      const result = await this.tasksService.addAttachments(taskId, files);
      
      this.logger.log(`Successfully uploaded ${files.length} files for task ${taskId}`);
      
      return result;
    } catch (error) {
      this.logger.error(`Error uploading attachments for task ${taskId}:`, error.message);
      throw error;
    }
  }

  // Debug endpoint to check if task exists
  @Get(':id/exists')
  async checkTaskExists(@Param('id') id: string) {
    const exists = await this.tasksService.taskExists(id);
    return { id, exists };
  }
}