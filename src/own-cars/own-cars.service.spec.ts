import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { OWN_CAR_ERROR_MSG } from './constants/own-cars.constants';
import { CreateOwnCarDto } from './dto/create-own-car.dto';
import { OwnCar } from './entities/own-car.entity';
import { OwnCarsService } from './own-cars.service';

const mockOwnCarsRepository = () => ({
  save: jest.fn(),
  create: jest.fn(),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

jest.mock('../users/users.service');

describe('OwnCarsService', () => {
  let ownCarsService: OwnCarsService;
  let usersService: UsersService;
  let ownCarsRepository: MockRepository<OwnCar>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OwnCarsService,
        UsersService,
        {
          provide: getRepositoryToken(OwnCar),
          useValue: mockOwnCarsRepository(),
        },
      ],
    }).compile();

    ownCarsService = module.get<OwnCarsService>(OwnCarsService);
    usersService = module.get<UsersService>(UsersService);
    ownCarsRepository = module.get<MockRepository<OwnCar>>(
      getRepositoryToken(OwnCar),
    );
  });

  it('should be defined', () => {
    expect.assertions(3);
    expect(ownCarsService).toBeDefined();
    expect(usersService).toBeDefined();
    expect(ownCarsRepository).toBeDefined();
  });

  describe('create', () => {
    const trimId = 1;
    const createOwnCarDto = new CreateOwnCarDto();
    createOwnCarDto.trimId = trimId;
    const userId = 'testuser';

    it('소유 자동차 정보 생성에 성공한다', async () => {
      const id = 1;
      const password = 'password';
      const createdAt = new Date();
      const user = new User();
      user.id = id;
      user.userId = userId;
      user.password = password;
      user.createdAt = createdAt;

      jest.spyOn(usersService, 'findOne').mockResolvedValue(user);

      const ownCarId = 1;
      const ownCarCreatedAt = new Date();
      const ownCar = new OwnCar();
      ownCar.id = ownCarId;
      ownCar.trimId = trimId;
      ownCar.user = user;
      ownCar.createdAt = ownCarCreatedAt;
      jest.spyOn(ownCarsRepository, 'create').mockReturnValue(ownCar);
      jest.spyOn(ownCarsRepository, 'save').mockResolvedValue(ownCar);

      const resultOwnCar = await ownCarsService.create(createOwnCarDto, userId);
      expect(resultOwnCar).toMatchObject(ownCar);
    });

    it('회원이 존재하지 않아 소유 자동차 정보 생성에 실패한다', async () => {
      expect.assertions(2);
      jest.spyOn(usersService, 'findOne').mockResolvedValue(undefined);

      try {
        const resultOwnCar = await ownCarsService.create(
          createOwnCarDto,
          userId,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toEqual(OWN_CAR_ERROR_MSG.NOT_EXIST_USER);
      }
    });
  });
});
