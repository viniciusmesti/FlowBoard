import { Injectable, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    try {
      const user = await this.usersService.findByEmail(email);
      if (user && await bcrypt.compare(password, user.password)) {
        const { password, ...result } = user;
        return result;
      }
      return null;
    } catch (error) {
      console.error('Erro ao validar usuário:', error);
      throw new InternalServerErrorException('Erro interno ao validar usuário');
    }
  }

  async login(loginDto: LoginDto) {
    try {
      const user = await this.validateUser(loginDto.email, loginDto.password);
      if (!user) {
        throw new UnauthorizedException('Credenciais inválidas');
      }

      const payload = { email: user.email, sub: user.id };
      const token = this.jwtService.sign(payload);
      
      console.log('Login bem-sucedido para:', user.email);
      
      return {
        access_token: token,
        user,
      };
    } catch (error) {
      console.error('Erro no login:', error);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('Erro interno no login');
    }
  }

  async register(createUserDto: CreateUserDto) {
    try {
      console.log('Tentando registrar usuário:', { 
        email: createUserDto.email, 
        name: createUserDto.name,
        role: createUserDto.role,
        avatar: createUserDto.avatar 
      });

      const user = await this.usersService.create(createUserDto);
      const { password, ...result } = user;
      
      const payload = { email: user.email, sub: user.id };
      const token = this.jwtService.sign(payload);
      
      console.log('Usuário registrado com sucesso:', user.email);
      
      return {
        access_token: token,
        user: result,
      };
    } catch (error) {
      console.error('Erro no registro:', error);
      
      // Se for erro de email duplicado
      if (error.message && error.message.includes('duplicate key')) {
        throw new UnauthorizedException('Email já está em uso');
      }
      
      throw new InternalServerErrorException('Erro interno no registro');
    }
  }
} 