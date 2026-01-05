import { IsString, IsOptional, IsUUID, IsArray } from 'class-validator';

export class CreateSystemDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  color: string;

  @IsUUID()
  ownerId: string;

  @IsArray()
  @IsString({ each: true })
  requirementTypes: string[];
}

