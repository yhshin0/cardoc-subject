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

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      await this.checkDuplicateUser(createUserDto.user_id);

      return await this.usersRepository.save(
        this.usersRepository.create({
          USER_USER_ID: createUserDto.user_id,
          USER_PASSWORD: createUserDto.password,
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

  private async checkDuplicateUser(user_id: string): Promise<void> {
    const user = await this.usersRepository.findOne({
      where: {
        USER_USER_ID: user_id,
      },
    });

    if (user) {
      throw new BadRequestException('해당 ID가 이미 존재합니다');
    }
  }

  async findOne(user_id: string): Promise<User> {
    return await this.usersRepository.findOne({ USER_USER_ID: user_id });
  }

  async compareHash(user: User, password: string): Promise<boolean> {
    return await bcrypt.compare(password, user.USER_PASSWORD);
  }
}
