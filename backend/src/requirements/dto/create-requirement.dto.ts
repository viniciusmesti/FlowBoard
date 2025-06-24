import { 
    IsString, IsOptional, IsEnum, IsUUID,
    IsDateString, IsNumber, IsArray, IsBoolean 
  } from 'class-validator';
  
  export class CreateRequirementDto {
    @IsString()  
    title: string;
  
    @IsString()
    description: string;
  
    @IsString()
    color: string;
  
    @IsEnum(['planning','pending-approval','active','completed','on-hold','cancelled'])
    @IsOptional()
    status?: 'planning' | 'pending-approval' | 'active' | 'completed' | 'on-hold' | 'cancelled';
  
    @IsEnum(['low','medium','high'])
    @IsOptional()
    priority?: 'low' | 'medium' | 'high';
  
    @IsUUID()
    @IsOptional()
    ownerId?: string;
  
    @IsDateString()
    @IsOptional()
    startDate?: string;
  
    @IsDateString()
    @IsOptional()
    endDate?: string;
  
    @IsNumber()
    @IsOptional()
    estimatedHours?: number;
  
    @IsNumber()
    @IsOptional()
    budget?: number;
  
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    dependencies?: string[];
  
    @IsString()
    @IsOptional()
    category?: string;
  
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    tags?: string[];
  
    @IsBoolean()
    @IsOptional()
    approvalRequired?: boolean;
  }
  