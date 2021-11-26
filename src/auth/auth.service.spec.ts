import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';

import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';

const mockJwtService = () => ({
  sign: jest.fn(),
});

jest.mock('../users/users.service');

describe('UsersService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        UsersService,
        { provide: JwtService, useValue: mockJwtService() },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect.assertions(3);
    expect(authService).toBeDefined();
    expect(usersService).toBeDefined();
    expect(jwtService).toBeDefined();
  });

  describe('validateUser', () => {
    const userId = 'testuser';
    const password = 'password';
    const loginUserDto = new LoginUserDto();
    loginUserDto.userId = userId;
    loginUserDto.password = password;

    it('로그인 한 유저의 유효성 검사에 성공한다', async () => {
      expect.assertions(3);

      const id = 1;
      const createdAt = new Date();
      const user = new User();
      user.id = id;
      user.userId = userId;
      user.password = password;
      user.createdAt = createdAt;
      jest.spyOn(usersService, 'findOne').mockResolvedValue(user);

      jest.spyOn(usersService, 'compareHash').mockResolvedValue(true);

      const result = await authService.validateUser(loginUserDto);
      expect(result.id).toEqual(id);
      expect(result.userId).toEqual(userId);
      expect(result.createdAt).toEqual(createdAt);
    });

    it('로그인을 시도한 유저가 존재하지 않아 유효성 검사에 실패한다', async () => {
      jest.spyOn(usersService, 'findOne').mockResolvedValue(null);

      const result = await authService.validateUser(loginUserDto);
      expect(result).toBe(null);
    });

    it('로그인을 시도한 유저의 비밀번호가 일치하지 않아 유효성 검사에 실패한다', async () => {
      const id = 1;
      const userPassword = 'userPassword';
      const createdAt = new Date();
      const user = new User();
      user.id = id;
      user.userId = userId;
      user.password = userPassword;
      user.createdAt = createdAt;

      jest.spyOn(usersService, 'findOne').mockResolvedValue(user);

      jest.spyOn(usersService, 'compareHash').mockResolvedValue(false);

      const result = await authService.validateUser(loginUserDto);
      expect(result).toBe(null);
    });
  });

  describe('signin', () => {
    it('JwtService에서 sign을 통해 토큰을 가져오는 데에 성공한다', async () => {
      const id = 1;
      const userId = 'testuser';
      const createdAt = new Date();
      const user = new User();
      user.id = id;
      user.userId = userId;
      user.createdAt = createdAt;

      const access_token = 'TOKEN';
      jest.spyOn(jwtService, 'sign').mockReturnValue(access_token);

      const result = await authService.signin(user);
      expect(result.access_token).toEqual(access_token);
    });
  });
});
