import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const user = await this.usersRepository.findOne({
      where: {
        USER_USER_ID: createUserDto.user_id,
      },
    });

    if (user) {
      throw new BadRequestException('해당 ID가 이미 존재합니다');
    }

    return this.usersRepository.save(
      this.usersRepository.create({
        USER_USER_ID: createUserDto.user_id,
        USER_PASSWORD: createUserDto.password,
      }),
    );
  }

  findAll() {
    return this.usersRepository.find();
  }
}
