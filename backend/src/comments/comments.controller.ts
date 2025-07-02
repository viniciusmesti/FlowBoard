import { Controller, Post, Param, Body } from '@nestjs/common';
import { CommentsService } from './comments.service';

@Controller('tasks/:taskId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  create(
    @Param('taskId') taskId: string,
    @Body('content') content: string,
    @Body('authorId') authorId: string,
  ) {
    return this.commentsService.create(taskId, authorId, content);
  }
}