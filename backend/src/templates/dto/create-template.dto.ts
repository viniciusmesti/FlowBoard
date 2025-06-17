import { IsString, IsEnum, IsOptional } from 'class-validator';

export class CreateTemplateDto {
  @IsString() name: string;
  @IsString() description: string;
  @IsString() color: string;

  @IsEnum(['low','medium','high'])
  @IsOptional()
  priority?: 'low'|'medium'|'high';
}
