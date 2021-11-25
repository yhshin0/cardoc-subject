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
    const { trim_id, user_id } = createTireDto;
    const APIresult = await this.getTireInfoFromAPI(trim_id);

    try {
      await this.validateCreateTireDto(createTireDto);

      if (APIresult.status !== TIRE_CONSTANTS.VALID_TIRE_STATUS) {
        throw new InternalServerErrorException(APIresult.data.message);
      }

      const { frontTire, rearTire } = APIresult.data;
      const { ownCar, ...createdTire } = await this.insertTireToTable(
        trim_id,
        user_id,
        frontTire,
        rearTire,
      );

      return {
        status: TIRE_CONSTANTS.VALID_TIRE_STATUS,
        user_id,
        trim_id,
        tire: createdTire,
      };
    } catch (error) {
      const result = {
        status: TIRE_CONSTANTS.INVALID_TIRE_STATUS,
        user_id,
        trim_id,
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
    trim_id: number,
    user_id: string,
    frontTire: string,
    rearTire: string,
  ): Promise<Tire> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // 소유 차량 정보 생성
      const createOwnCarDto = new CreateOwnCarDto();
      createOwnCarDto.trim_id = trim_id;
      const createdOwnCar = await this.ownCarsService.create(
        createOwnCarDto,
        user_id,
      );

      // 타이어 스펙 파싱
      const [frontTireWidth, frontTireAspectRatio, frontTireWheelSize] =
        frontTire.split(TIRE_CONSTANTS.TIRE_SPEC_SPLIT_REGEX);
      const [rearTireWidth, rearTireAspectRatio, rearTireWheelSize] =
        rearTire.split(TIRE_CONSTANTS.TIRE_SPEC_SPLIT_REGEX);

      // 타이어 DB에 데이터 생성
      const tire = new Tire();
      tire.TIRE_FRONT_WIDTH = +frontTireWidth;
      tire.TIRE_FRONT_ASPECT_RATIO = +frontTireAspectRatio;
      tire.TIRE_FRONT_WHEEL_SIZE = +frontTireWheelSize;
      tire.TIRE_REAR_WIDTH = +rearTireWidth;
      tire.TIRE_REAR_ASPECT_RATIO = +rearTireAspectRatio;
      tire.TIRE_REAR_WHEEL_SIZE = +rearTireWheelSize;
      tire.ownCar = createdOwnCar;

      const res = await this.tiresRepository.save(tire);
      await queryRunner.commitTransaction();
      return res;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException();
    } finally {
      await queryRunner.release();
    }
  }

  async getTireInfoFromAPI(
    trim_id: number,
  ): Promise<{ status: string; data: any }> {
    const url = TIRE_CONSTANTS.CAR_SPEC_API_URL + trim_id;
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
    user_id: string,
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
      .where('user.user_user_id=:user_id', { user_id })
      .skip(page * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return { totalCount: tireList[1], data: tireList[0] };
  }
}
