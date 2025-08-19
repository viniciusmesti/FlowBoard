import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(['admin', 'developer', 'designer', 'tester'])
  role: 'admin' | 'developer' | 'designer' | 'tester';

  @IsString()
  @IsOptional()
  avatar?: string;
} 