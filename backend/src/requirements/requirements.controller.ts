import { 
    Controller, Get, Post, Patch, Delete, 
    Body, Param, ParseUUIDPipe, HttpCode 
  } from '@nestjs/common';
  import { RequirementsService }      from './requirements.service';
  import { CreateRequirementDto }     from './dto/create-requirement.dto';
  import { UpdateRequirementDto }     from './dto/update-requirement.dto';
  
  @Controller('requirements')
  export class RequirementsController {
    constructor(private readonly svc: RequirementsService) {}
  
    @Get()
    getAll() {
      return this.svc.findAll();
    }
  
    @Get(':id')
    getOne(@Param('id', new ParseUUIDPipe()) id: string) {
      return this.svc.findOne(id);
    }
  
    @Post()
    create(@Body() dto: CreateRequirementDto) {
      return this.svc.create(dto);
    }
  
    @Patch(':id')
    update(
      @Param('id', new ParseUUIDPipe()) id: string,
      @Body() dto: UpdateRequirementDto
    ) {
      return this.svc.update(id, dto);
    }
  
    @Delete(':id')
    @HttpCode(204)
    remove(@Param('id', new ParseUUIDPipe()) id: string) {
      return this.svc.remove(id);
    }
  }
  