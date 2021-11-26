import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TIRE_CONSTANTS, TIRE_ERROR_MSG } from './constants/tire.constants';
import { CreateTireDto } from './dto/create-tire.dto';

import { Tire } from './entities/tire.entity';
import { TiresController } from './tires.controller';
import { TiresService } from './tires.service';

jest.mock('./tires.service');

describe('TiresController', () => {
  let tiresController: TiresController;
  let tiresService: TiresService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TiresController],
      providers: [TiresService],
    }).compile();

    tiresController = module.get<TiresController>(TiresController);
    tiresService = module.get<TiresService>(TiresService);
  });

  it('should be defined', async () => {
    expect.assertions(2);
    expect(tiresController).toBeDefined();
    expect(tiresService).toBeDefined();
  });

  describe('findByUserId', () => {
    it('유저 ID로 타이어 정보를 조회하는 데에 성공한다', async () => {
      const userId = 'testuser';
      const page = '1';
      const pageSize = '3';

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
      const expectResult = { totalCount: tireList.length, data: tireList };

      jest.spyOn(tiresService, 'findByUserId').mockResolvedValue(expectResult);

      const result = await tiresController.findByUserId(userId, page, pageSize);
      expect(result).toMatchObject(expectResult);
    });
  });

  describe('create', () => {
    it('타이어 정보 생성에 성공한다', async () => {
      const userId = 'testuser';
      const trimId = 1;
      const createTireDto = new CreateTireDto({ userId, trimId });
      const body = [createTireDto];

      jest
        .spyOn(TiresController.prototype as any, 'checkArray')
        .mockReturnValue(undefined);

      const createdTireList = [];
      const status = TIRE_CONSTANTS.VALID_TIRE_STATUS;
      const createdAt = new Date();
      const tire = new Tire();
      tire.id = 1;
      tire.frontWidth = 225;
      tire.frontAspectRatio = 40;
      tire.frontWheelSize = 18;
      tire.rearWidth = 225;
      tire.rearAspectRatio = 40;
      tire.rearWheelSize = 18;
      tire.createdAt = createdAt;
      const tireServiceCreateResult = { status, userId, trimId, tire };
      createdTireList.push(tireServiceCreateResult);

      jest
        .spyOn(tiresService, 'create')
        .mockResolvedValue(tireServiceCreateResult);

      const expectResult = {
        createdTireCount: createdTireList.length,
        result: createdTireList,
      };

      const result = await tiresController.create(body);
      expect(result).toMatchObject(expectResult);
    });

    it('여러 개의 타이어 정보를 입력하여 일부 타이어 정보 생성에 성공한다', async () => {
      const userId1 = 'testuser1';
      const trimId1 = 1;
      const createTireDto1 = new CreateTireDto({
        userId: userId1,
        trimId: trimId1,
      });
      const userId2 = 'testuser2';
      const trimId2 = 0;
      const createTireDto2 = new CreateTireDto({
        userId: userId2,
        trimId: trimId2,
      });
      const userId3 = 'testuser3';
      const trimId3 = 3;
      const createTireDto3 = new CreateTireDto({
        userId: userId3,
        trimId: trimId3,
      });

      const body = [createTireDto1, createTireDto2, createTireDto3];

      jest
        .spyOn(TiresController.prototype as any, 'checkArray')
        .mockReturnValue(undefined);

      const createdTireList = [];
      const status1 = TIRE_CONSTANTS.VALID_TIRE_STATUS;
      const createdAt1 = new Date();
      const tire1 = new Tire();
      tire1.id = 1;
      tire1.frontWidth = 225;
      tire1.frontAspectRatio = 40;
      tire1.frontWheelSize = 18;
      tire1.rearWidth = 225;
      tire1.rearAspectRatio = 40;
      tire1.rearWheelSize = 18;
      tire1.createdAt = createdAt1;
      const tireServiceCreateResult1 = {
        status: status1,
        userId: userId1,
        trimId: trimId1,
        tire: tire1,
      };
      createdTireList.push(tireServiceCreateResult1);

      jest
        .spyOn(tiresService, 'create')
        .mockResolvedValueOnce(tireServiceCreateResult1);

      const status2 = TIRE_CONSTANTS.INVALID_TIRE_STATUS;
      const errorMessage = 'No value present';
      const tireServiceCreateResult2 = {
        status: status2,
        userId: userId2,
        trimId: trimId2,
        message: errorMessage,
      };
      createdTireList.push(tireServiceCreateResult2);

      jest
        .spyOn(tiresService, 'create')
        .mockResolvedValueOnce(tireServiceCreateResult2);

      const status3 = TIRE_CONSTANTS.VALID_TIRE_STATUS;
      const createdAt3 = new Date();
      const tire3 = new Tire();
      tire3.id = 3;
      tire3.frontWidth = 225;
      tire3.frontAspectRatio = 40;
      tire3.frontWheelSize = 18;
      tire3.rearWidth = 225;
      tire3.rearAspectRatio = 40;
      tire3.rearWheelSize = 18;
      tire3.createdAt = createdAt3;
      const tireServiceCreateResult3 = {
        status: status3,
        userId: userId3,
        trimId: trimId3,
        tire: tire3,
      };
      createdTireList.push(tireServiceCreateResult3);

      jest
        .spyOn(tiresService, 'create')
        .mockResolvedValueOnce(tireServiceCreateResult3);

      const expectResult = {
        createdTireCount: createdTireList.filter(
          (item) => item.status === TIRE_CONSTANTS.VALID_TIRE_STATUS,
        ).length,
        result: createdTireList,
      };

      const result = await tiresController.create(body);
      expect(result).toMatchObject(expectResult);
    });

    it('입력 정보가 배열이 아니라서 타이어 정보 생성에 실패한다', async () => {
      const userId = 'testuser';
      const trimId = 1;
      const body = new CreateTireDto({ userId, trimId });

      jest
        .spyOn(TiresController.prototype as any, 'checkArray')
        .mockImplementation(() => {
          throw new BadRequestException(TIRE_ERROR_MSG.INVALID_INPUT_DATA);
        });

      try {
        const result = await tiresController.create(body);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toEqual(TIRE_ERROR_MSG.INVALID_INPUT_DATA);
      }
    });

    it('입력 정보가 빈 배열이라서 타이어 정보 생성에 실패한다', async () => {
      const body = [];

      jest
        .spyOn(TiresController.prototype as any, 'checkArray')
        .mockImplementation(() => {
          throw new BadRequestException(TIRE_ERROR_MSG.NO_INPUT_DATA);
        });

      try {
        const result = await tiresController.create(body);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toEqual(TIRE_ERROR_MSG.NO_INPUT_DATA);
      }
    });

    it('입력 정보 개수가 5개를 넘어서 타이어 정보 생성에 실패한다', async () => {
      const body = [];
      for (let i = 1; i < 7; i++) {
        const userId = `testuser${i}`;
        const trimId = i;
        const createTireDto = new CreateTireDto({ userId, trimId });
        body.push(createTireDto);
      }

      jest
        .spyOn(TiresController.prototype as any, 'checkArray')
        .mockImplementation(() => {
          throw new BadRequestException(TIRE_ERROR_MSG.EXCEED_INPUT_DATA);
        });

      try {
        const result = await tiresController.create(body);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toEqual(TIRE_ERROR_MSG.EXCEED_INPUT_DATA);
      }
    });
  });
});
