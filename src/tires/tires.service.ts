import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpService } from '@nestjs/axios';
import { Connection, Repository } from 'typeorm';
import { lastValueFrom, map } from 'rxjs';
import { validate } from 'class-validator';

import { CreateTireDto } from './dto/create-tire.dto';
import { Tire } from './entities/tire.entity';
import { OwnCarsService } from '../own-cars/own-cars.service';
import { CreateOwnCarDto } from '../own-cars/dto/create-own-car.dto';
import { TIRE_CONSTANTS, TIRE_ERROR_MSG } from './constants/tire.constants';

@Injectable()
export class TiresService {
  constructor(
    @InjectRepository(Tire) private tiresRepository: Repository<Tire>,
    private httpService: HttpService,
    private ownCarsService: OwnCarsService,
    private connection: Connection,
  ) {}

  private async validateCreateTireDto(
    createTireDto: CreateTireDto,
  ): Promise<void> {
    const res = await validate(createTireDto);
    if (res.length > 0) {
      throw new BadRequestException(TIRE_ERROR_MSG.INVALID_INPUT_DATA);
    }
  }

  async create(createTireDto: CreateTireDto): Promise<any> {
    const { trimId, userId } = createTireDto;
    const APIresult = await this.getTireInfoFromAPI(trimId);

    try {
      await this.validateCreateTireDto(createTireDto);

      if (APIresult.status !== TIRE_CONSTANTS.VALID_TIRE_STATUS) {
        throw new InternalServerErrorException(APIresult.data.message);
      }

      const { frontTire, rearTire } = APIresult.data;
      const { ownCar, ...createdTire } = await this.insertTireToTable(
        trimId,
        userId,
        frontTire,
        rearTire,
      );

      return {
        status: TIRE_CONSTANTS.VALID_TIRE_STATUS,
        userId,
        trimId,
        tire: createdTire,
      };
    } catch (error) {
      const result = {
        status: TIRE_CONSTANTS.INVALID_TIRE_STATUS,
        userId,
        trimId,
        message: '',
      };

      if (error instanceof HttpException) {
        result.message = error.message;
      } else {
        result.message = APIresult.data.message;
      }
      return result;
    }
  }

  private async insertTireToTable(
    trimId: number,
    userId: string,
    frontTire: string,
    rearTire: string,
  ): Promise<Tire> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // 소유 차량 정보 생성
      const createOwnCarDto = new CreateOwnCarDto();
      createOwnCarDto.trimId = trimId;
      const createdOwnCar = await this.ownCarsService.create(
        createOwnCarDto,
        userId,
      );

      // 타이어 스펙 파싱
      const [frontTireWidth, frontTireAspectRatio, frontTireWheelSize] =
        frontTire.split(TIRE_CONSTANTS.TIRE_SPEC_SPLIT_REGEX);
      const [rearTireWidth, rearTireAspectRatio, rearTireWheelSize] =
        rearTire.split(TIRE_CONSTANTS.TIRE_SPEC_SPLIT_REGEX);

      // 타이어 DB에 데이터 생성
      const tire = new Tire();
      tire.frontWidth = +frontTireWidth;
      tire.frontAspectRatio = +frontTireAspectRatio;
      tire.frontWheelSize = +frontTireWheelSize;
      tire.rearWidth = +rearTireWidth;
      tire.rearAspectRatio = +rearTireAspectRatio;
      tire.rearWheelSize = +rearTireWheelSize;
      tire.ownCar = createdOwnCar;

      const res = await this.tiresRepository.save(tire);
      await queryRunner.commitTransaction();
      return res;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(error.message);
    } finally {
      await queryRunner.release();
    }
  }

  private async getTireInfoFromAPI(
    trimId: number,
  ): Promise<{ status: string; data: any }> {
    const url = TIRE_CONSTANTS.CAR_SPEC_API_URL + trimId;
    const observer = this.httpService
      .get(url)
      .pipe(map((axiosResponse) => axiosResponse));

    const getTireInfo = (axiosResponse) => {
      let frontTire = axiosResponse.data.spec.driving.frontTire.value;
      let rearTire = axiosResponse.data.spec.driving.rearTire.value;

      frontTire = frontTire.replace(' ', '');
      rearTire = rearTire.replace(' ', '');

      validateTire(frontTire, 'front');
      validateTire(rearTire, 'rear');

      return {
        status: TIRE_CONSTANTS.VALID_TIRE_STATUS,
        data: { frontTire, rearTire },
      };
    };

    const validateTire = (tire, tireType) => {
      if (tire.search(TIRE_CONSTANTS.TIRE_FORMAT_REGEX) === -1) {
        throw new InternalServerErrorException(
          `invalid ${tireType} tire format(${tire})`,
        );
      }
    };

    const getError = (err) => {
      if (err instanceof InternalServerErrorException) {
        return {
          status: TIRE_CONSTANTS.INVALID_TIRE_STATUS,
          data: { message: err.message },
        };
      }
      return {
        status: TIRE_CONSTANTS.INVALID_TIRE_STATUS,
        data: err.response.data,
      };
    };

    return await lastValueFrom(observer).then(getTireInfo).catch(getError);
  }

  async findByUserId(
    userId: string,
    page: number,
    pageSize: number,
  ): Promise<{ totalCount: number; data: Tire[] }> {
    page = isNaN(page) || page <= 0 ? TIRE_CONSTANTS.DEFAULT_PAGE : page - 1;
    pageSize =
      isNaN(pageSize) || pageSize <= 0
        ? TIRE_CONSTANTS.DEFAULT_PAGE_SIZE
        : pageSize;

    const tireList = await this.tiresRepository
      .createQueryBuilder('tire')
      .innerJoin('tire.ownCar', 'own_car')
      .innerJoin('own_car.user', 'user')
      .where('user.USER_USER_ID=:userId', { userId })
      .skip(page * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return { totalCount: tireList[1], data: tireList[0] };
  }
}
