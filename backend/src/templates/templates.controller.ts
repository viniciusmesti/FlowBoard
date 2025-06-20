import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UsePipes, ValidationPipe } from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { Template } from './entities/template.entity';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';

@Controller('templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Post()
  create(@Body() createTemplateDto: CreateTemplateDto, @Request() req): Promise<Template> {
    return this.templatesService.create(createTemplateDto, req.user);
  }

  @Get()
  findAll(): Promise<Template[]> {
    return this.templatesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Template> {
    return this.templatesService.findOne(id);
  }

  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTemplateDto: UpdateTemplateDto
  ): Promise<Template> {
    return this.templatesService.update(id, updateTemplateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.templatesService.remove(id);
  }

  // Aplica as defaultTasks de um template em um requirement existente
  @Post(':id/apply/:requirementId')
  applyTemplate(
    @Param('id') templateId: string,
    @Param('requirementId') requirementId: string,
    @Request() req
  ) {
    return this.templatesService.applyTemplate(
      templateId,
      requirementId,
      req.user.id
    );
  }

  // Cria uma task única a partir do template
  @Post(':id/create-task')
  createTaskFromTemplate(
    @Param('id') templateId: string,
    @Request() req
  ) {
    return this.templatesService.createTaskFromTemplate(
      templateId,
      req.user.id
    );
  }
}