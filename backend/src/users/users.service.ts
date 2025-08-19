import { Injectable, ConflictException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      console.log('UsersService.create - Dados recebidos:', {
        email: createUserDto.email,
        name: createUserDto.name,
        role: createUserDto.role,
        avatar: createUserDto.avatar
      });

      // Verificar se o usuário já existe
      const existingUser = await this.findByEmail(createUserDto.email);
      if (existingUser) {
        console.log('Usuário já existe com email:', createUserDto.email);
        throw new ConflictException('Email já está em uso');
      }

      // Definir avatar padrão se não fornecido
      if (!createUserDto.avatar) {
        createUserDto.avatar = 'user';
        console.log('Avatar padrão definido:', createUserDto.avatar);
      }
      
      console.log('Criando usuário com avatar:', createUserDto.avatar);
      
      const user = this.usersRepository.create(createUserDto);
      const savedUser = await this.usersRepository.save(user);
      
      console.log('Usuário criado com sucesso:', {
        id: savedUser.id,
        email: savedUser.email,
        avatar: savedUser.avatar
      });
      
      return savedUser;
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      
      if (error instanceof ConflictException) {
        throw error;
      }
      
      // Log detalhado do erro
      if (error.code) {
        console.error('Código do erro:', error.code);
      }
      if (error.detail) {
        console.error('Detalhes do erro:', error.detail);
      }
      
      throw new InternalServerErrorException('Erro interno ao criar usuário');
    }
  }

  async findAll(): Promise<User[]> {
    try {
      return await this.usersRepository.find();
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      throw new InternalServerErrorException('Erro interno ao buscar usuários');
    }
  }

  async findOne(id: string): Promise<User> {
    try {
      const user = await this.usersRepository.findOne({ where: { id } });
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Erro ao buscar usuário por ID:', error);
      throw new InternalServerErrorException('Erro interno ao buscar usuário');
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      return await this.usersRepository.findOne({ where: { email } });
    } catch (error) {
      console.error('Erro ao buscar usuário por email:', error);
      throw new InternalServerErrorException('Erro interno ao buscar usuário por email');
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      const user = await this.findOne(id);
      
      if (updateUserDto.password) {
        updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
      }

      Object.assign(user, updateUserDto);
      return await this.usersRepository.save(user);
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Erro interno ao atualizar usuário');
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const user = await this.findOne(id);
      await this.usersRepository.remove(user);
    } catch (error) {
      console.error('Erro ao remover usuário:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Erro interno ao remover usuário');
    }
  }
} 