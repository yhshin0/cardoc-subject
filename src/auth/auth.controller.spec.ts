import { Test, TestingModule } from '@nestjs/testing';

import { User } from '../users/entities/user.entity';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

jest.mock('./auth.service');
jest.mock('../users/users.service');

describe('UsersService', () => {
  let authController: AuthController;
  let authService: AuthService;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService, UsersService],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect.assertions(3);
    expect(authController).toBeDefined();
    expect(authService).toBeDefined();
    expect(usersService).toBeDefined();
  });

  describe('signup', () => {
    it('회원가입에 성공한다', async () => {
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
      jest.spyOn(usersService, 'create').mockResolvedValue(user);

      const access_token = 'TOKEN';
      jest.spyOn(authService, 'signin').mockResolvedValue({ access_token });

      const result = await authController.signup(createUserDto);
      expect(result.access_token).toEqual(access_token);
    });
  });

  describe('signin', () => {
    it('로그인에 성공한다', async () => {
      const id = 1;
      const userId = 'testuser';
      const password = 'password';
      const createdAt = new Date();
      const user = new User();
      user.id = id;
      user.userId = userId;
      user.password = password;
      user.createdAt = createdAt;
      const req = { user };

      const access_token = 'TOKEN';
      jest.spyOn(authService, 'signin').mockResolvedValue({ access_token });

      const result = await authController.signin(req);
      expect(result.access_token).toEqual(access_token);
    });
  });
});
