import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { USER_ERROR_MSG } from './constants/users.constants';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      await this.checkDuplicateUser(createUserDto.userId);

      return await this.usersRepository.save(
        this.usersRepository.create({
          userId: createUserDto.userId,
          password: createUserDto.password,
        }),
      );
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      } else {
        throw new InternalServerErrorException(error.message);
      }
    }
  }

  private async checkDuplicateUser(userId: string): Promise<void> {
    const user = await this.findOne(userId);

    if (user) {
      throw new BadRequestException(USER_ERROR_MSG.DUPLICATE_USER_ID);
    }
  }

  async findOne(userId: string): Promise<User> {
    return await this.usersRepository.findOne({ userId });
  }

  async compareHash(user: User, password: string): Promise<boolean> {
    return await bcrypt.compare(password, user.password);
  }
}
