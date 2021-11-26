import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { USER_ERROR_MSG } from './constants/users.constants';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

const mockUsersRepository = () => ({
  save: jest.fn(),
  create: jest.fn(),
  findOne: jest.fn(),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('UsersService', () => {
  let usersService: UsersService;
  let usersRepository: MockRepository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockUsersRepository() },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    usersRepository = module.get<MockRepository<User>>(
      getRepositoryToken(User),
    );
  });

  it('should be defined', () => {
    expect.assertions(2);
    expect(usersService).toBeDefined();
    expect(usersRepository).toBeDefined();
  });

  describe('create', () => {
    const userId = 'testuser';
    const password = 'password';
    const createUserDto = new CreateUserDto();
    createUserDto.userId = userId;
    createUserDto.password = password;

    const id = 1;
    const createdAt = new Date();
    const user = new User();
    user.id = id;
    user.userId = userId;
    user.password = password;
    user.createdAt = createdAt;

    it('유저 생성에 성공한다', async () => {
      expect.assertions(4);

      jest
        .spyOn(UsersService.prototype as any, 'checkDuplicateUser')
        .mockResolvedValue(undefined);

      jest.spyOn(usersRepository, 'save').mockResolvedValue(user);
      jest.spyOn(usersRepository, 'create').mockResolvedValue(user);
      const expectUser = await usersService.create(createUserDto);

      expect(expectUser.id).toEqual(user.id);
      expect(expectUser.userId).toEqual(user.userId);
      expect(expectUser.password).toEqual(user.password);
      expect(expectUser.createdAt).toEqual(user.createdAt);
    });

    it('아이디가 중복되어 유저 생성에 실패한다', async () => {
      expect.assertions(2);

      jest
        .spyOn(UsersService.prototype as any, 'checkDuplicateUser')
        .mockRejectedValue(
          new BadRequestException(USER_ERROR_MSG.DUPLICATE_USER_ID),
        );

      try {
        const expectUser = await usersService.create(createUserDto);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toEqual(USER_ERROR_MSG.DUPLICATE_USER_ID);
      }
    });
  });

  describe('findOne', () => {
    it('유저 조회에 성공한다', async () => {
      expect.assertions(4);
      const userId = 'testuser';
      const password = 'password';
      const id = 1;
      const createdAt = new Date();

      const user = new User();
      user.id = id;
      user.userId = userId;
      user.password = password;
      user.createdAt = createdAt;

      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(user);

      const expectUser = await usersService.findOne(userId);

      expect(expectUser.id).toEqual(user.id);
      expect(expectUser.userId).toEqual(user.userId);
      expect(expectUser.password).toEqual(user.password);
      expect(expectUser.createdAt).toEqual(user.createdAt);
    });
  });

  describe('compareHash', () => {
    it('비밀번호 비교에 성공한다', async () => {
      const userId = 'testuser';
      const userPassword = 'password';
      const id = 1;
      const createdAt = new Date();

      const user = new User();
      user.id = id;
      user.userId = userId;
      user.password = userPassword;
      user.createdAt = createdAt;

      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      const password = 'password';
      const result = await usersService.compareHash(user, password);

      expect(result).toEqual(true);
    });
  });
});
