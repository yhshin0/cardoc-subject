import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Connection, QueryRunner, Repository } from 'typeorm';

import { OWN_CAR_ERROR_MSG } from '../own-cars/constants/own-cars.constants';
import { OwnCar } from '../own-cars/entities/own-car.entity';
import { OwnCarsService } from '../own-cars/own-cars.service';
import { TIRE_CONSTANTS, TIRE_ERROR_MSG } from './constants/tire.constants';
import { CreateTireDto } from './dto/create-tire.dto';
import { Tire } from './entities/tire.entity';
import { TiresService } from './tires.service';

const mockTiresRepository = () => ({
  save: jest.fn(),
  createQueryBuilder: jest.fn(),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

jest.mock('../own-cars/own-cars.service');

const mockHttpService = () => ({
  get: jest.fn(),
});

const mockQueryRunner = {
  manager: {},
} as QueryRunner;

mockQueryRunner.connect = jest.fn();
mockQueryRunner.startTransaction = jest.fn();
mockQueryRunner.commitTransaction = jest.fn();
mockQueryRunner.rollbackTransaction = jest.fn();
mockQueryRunner.release = jest.fn();

class MockConnection {
  createQueryRunner(mode?: 'master' | 'slave'): QueryRunner {
    return mockQueryRunner;
  }
}

describe('TiresService', () => {
  let tiresService: TiresService;
  let httpService: HttpService;
  let ownCarsService: OwnCarsService;
  let tiresRepository: MockRepository<Tire>;
  let connection: Connection;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TiresService,
        OwnCarsService,
        { provide: HttpService, useValue: mockHttpService() },
        { provide: getRepositoryToken(Tire), useValue: mockTiresRepository() },
        { provide: Connection, useClass: MockConnection },
      ],
    }).compile();

    tiresService = module.get<TiresService>(TiresService);
    httpService = module.get<HttpService>(HttpService);
    ownCarsService = module.get<OwnCarsService>(OwnCarsService);
    tiresRepository = module.get<MockRepository<Tire>>(
      getRepositoryToken(Tire),
    );
    connection = module.get<Connection>(Connection);
  });

  it('should be defined', () => {
    expect.assertions(5);
    expect(tiresService).toBeDefined();
    expect(httpService).toBeDefined();
    expect(ownCarsService).toBeDefined();
    expect(tiresRepository).toBeDefined();
    expect(connection).toBeDefined();
  });

  describe('create', () => {
    it('타이어 정보 생성에 성공한다', async () => {
      const userId = 'testuser';
      const trimId = 1;
      const createTireDto = new CreateTireDto({ userId, trimId });

      const frontTire = '225/40R18';
      const rearTire = '225/40R18';
      const validAPIResult = {
        status: TIRE_CONSTANTS.VALID_TIRE_STATUS,
        data: { frontTire, rearTire },
      };
      jest
        .spyOn(TiresService.prototype as any, 'getTireInfoFromAPI')
        .mockResolvedValue(validAPIResult);

      jest
        .spyOn(TiresService.prototype as any, 'validateCreateTireDto')
        .mockResolvedValue(undefined);

      const createdAt = new Date();
      const createdTire = new Tire();
      createdTire.id = 1;
      createdTire.frontWidth = 225;
      createdTire.frontAspectRatio = 40;
      createdTire.frontWheelSize = 18;
      createdTire.rearWidth = 225;
      createdTire.rearAspectRatio = 40;
      createdTire.rearWheelSize = 18;
      createdTire.createdAt = createdAt;

      const ownCar = new OwnCar();

      jest
        .spyOn(TiresService.prototype as any, 'insertTireToTable')
        .mockResolvedValue({ ownCar, ...createdTire });
      const expectResult = {
        status: TIRE_CONSTANTS.VALID_TIRE_STATUS,
        userId,
        trimId,
        tire: createdTire,
      };
      const result = await tiresService.create(createTireDto);
      expect(result).toMatchObject(expectResult);
    });

    it('존재하지 않는 userId가 입력되어 타이어 정보 생성에 실패한다', async () => {
      const userId = 'notExistUser';
      const trimId = 1;
      const createTireDto = new CreateTireDto({ userId, trimId });

      const frontTire = '225/40R18';
      const rearTire = '225/40R18';
      const validAPIResult = {
        status: TIRE_CONSTANTS.VALID_TIRE_STATUS,
        data: { frontTire, rearTire },
      };
      jest
        .spyOn(TiresService.prototype as any, 'getTireInfoFromAPI')
        .mockResolvedValue(validAPIResult);

      jest
        .spyOn(TiresService.prototype as any, 'validateCreateTireDto')
        .mockResolvedValue(undefined);

      jest
        .spyOn(TiresService.prototype as any, 'insertTireToTable')
        .mockRejectedValue(
          new InternalServerErrorException(OWN_CAR_ERROR_MSG.NOT_EXIST_USER),
        );

      const expectResult = {
        status: TIRE_CONSTANTS.INVALID_TIRE_STATUS,
        userId,
        trimId,
        message: OWN_CAR_ERROR_MSG.NOT_EXIST_USER,
      };

      const result = await tiresService.create(createTireDto);
      expect(result).toMatchObject(expectResult);
    });

    it('유효하지 않은 trimId가 입력되어 타이어 정보 생성에 실패한다', async () => {
      const userId = 'testuser';
      const trimId = 0;
      const createTireDto = new CreateTireDto({ userId, trimId });

      const invalidAPICode = -1000;
      const invalidAPIMessage = 'No value present';
      const invalidAPIResult = {
        status: TIRE_CONSTANTS.INVALID_TIRE_STATUS,
        data: { code: invalidAPICode, message: invalidAPIMessage },
      };
      jest
        .spyOn(TiresService.prototype as any, 'getTireInfoFromAPI')
        .mockResolvedValue(invalidAPIResult);

      jest
        .spyOn(TiresService.prototype as any, 'validateCreateTireDto')
        .mockResolvedValue(undefined);

      const expectResult = {
        status: TIRE_CONSTANTS.INVALID_TIRE_STATUS,
        userId,
        trimId,
        message: invalidAPIMessage,
      };

      const result = await tiresService.create(createTireDto);
      expect(result).toMatchObject(expectResult);
    });

    it('유효하지 않은 타이어 정보를 받아 타이어 정보 생성에 실패한다', async () => {
      const userId = 'testuser';
      const trimId = 1;
      const createTireDto = new CreateTireDto({ userId, trimId });

      const invalidAPIMessage = 'invalid front tire format(aaa/aaPaa)';
      const invalidAPIResult = {
        status: TIRE_CONSTANTS.INVALID_TIRE_STATUS,
        data: { message: invalidAPIMessage },
      };
      jest
        .spyOn(TiresService.prototype as any, 'getTireInfoFromAPI')
        .mockResolvedValue(invalidAPIResult);

      jest
        .spyOn(TiresService.prototype as any, 'validateCreateTireDto')
        .mockResolvedValue(undefined);

      const expectResult = {
        status: TIRE_CONSTANTS.INVALID_TIRE_STATUS,
        userId,
        trimId,
        message: invalidAPIMessage,
      };

      const result = await tiresService.create(createTireDto);
      expect(result).toMatchObject(expectResult);
    });

    it('createTireDto가 유효하지 않아 타이어 정보 생성에 실패한다', async () => {
      const userId = 'testuser';
      const trimId = '1';
      const createTireDto = new CreateTireDto({ userId, trimId });

      const frontTire = '225/40R18';
      const rearTire = '225/40R18';
      const validAPIResult = {
        status: TIRE_CONSTANTS.VALID_TIRE_STATUS,
        data: { frontTire, rearTire },
      };
      jest
        .spyOn(TiresService.prototype as any, 'getTireInfoFromAPI')
        .mockResolvedValue(validAPIResult);

      jest
        .spyOn(TiresService.prototype as any, 'validateCreateTireDto')
        .mockRejectedValue(
          new BadRequestException(TIRE_ERROR_MSG.INVALID_INPUT_DATA),
        );
      const expectResult = {
        status: TIRE_CONSTANTS.INVALID_TIRE_STATUS,
        userId,
        trimId,
        message: TIRE_ERROR_MSG.INVALID_INPUT_DATA,
      };
      const result = await tiresService.create(createTireDto);
      expect(result).toMatchObject(expectResult);
    });
  });

  describe('findByUserId', () => {
    it('유저 아이디를 통해 타이어 정보 조회에 성공한다', async () => {
      const userId = 'testuser';
      const page = 1;
      const pageSize = 3;

      const tireList = [];
      for (let i = 1; i < 4; i++) {
        const createdAt = new Date();
        const tire = new Tire();
        tire.id = i;
        tire.frontWidth = 225;
        tire.frontAspectRatio = 40;
        tire.frontWheelSize = 18;
        tire.rearWidth = 225;
        tire.rearAspectRatio = 40;
        tire.rearWheelSize = 18;
        tire.createdAt = createdAt;
        tireList.push(tire);
      }

      const createQueryBuilder = {
        innerJoin: () => createQueryBuilder,
        where: () => createQueryBuilder,
        skip: () => createQueryBuilder,
        take: () => createQueryBuilder,
        getManyAndCount: () => [tireList, tireList.length],
      };

      tiresRepository.createQueryBuilder.mockImplementation(
        () => createQueryBuilder,
      );

      const result = await tiresService.findByUserId(userId, page, pageSize);
      expect(result).toMatchObject({
        totalCount: tireList.length,
        data: tireList,
      });
    });
  });
});
