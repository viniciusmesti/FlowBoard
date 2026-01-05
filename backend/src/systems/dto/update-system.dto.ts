import { IsString, IsOptional, IsArray, IsUUID } from 'class-validator';

export class UpdateSystemDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsUUID()
  @IsOptional()
  ownerId?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  requirementTypes?: string[];
}

