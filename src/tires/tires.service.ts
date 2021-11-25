import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpService } from '@nestjs/axios';
import { Repository } from 'typeorm';
import { lastValueFrom, map } from 'rxjs';

import { CreateTireDto } from './dto/create-tire.dto';
import { Tire } from './entities/tire.entity';
import { OwnCarsService } from '../own-cars/own-cars.service';
import { CreateOwnCarDto } from 'src/own-cars/dto/create-own-car.dto';

interface Result {
  status: string;
  data: any;
}

@Injectable()
export class TiresService {
  constructor(
    @InjectRepository(Tire) private tiresRepository: Repository<Tire>,
    private httpService: HttpService,
    private ownCarsService: OwnCarsService,
  ) {}

  async create(createTireDto: CreateTireDto) {
    const { trim_id, user_id } = createTireDto;
    const APIresult = await this.getTireInfoFromAPI(trim_id);

    if (APIresult.status === 'success') {
      const createOwnCarDto = new CreateOwnCarDto();
      createOwnCarDto.trim_id = trim_id.toString();
      const createdOwnCar = await this.ownCarsService.create(
        createOwnCarDto,
        user_id,
      );

      const { frontTire, rearTire } = APIresult.data;
      const [frontTireWidth, frontTireAspectRatio, frontTireWheelSize] =
        frontTire.split(/[\/R]/g);
      const [rearTireWidth, rearTireAspectRatio, rearTireWheelSize] =
        rearTire.split(/[\/R]/g);

      const tire = new Tire();
      tire.TIRE_FRONT_WIDTH = frontTireWidth;
      tire.TIRE_FRONT_ASPECT_RATIO = frontTireAspectRatio;
      tire.TIRE_FRONT_WHEEL_SIZE = frontTireWheelSize;
      tire.TIRE_REAR_WIDTH = rearTireWidth;
      tire.TIRE_REAR_ASPECT_RATIO = rearTireAspectRatio;
      tire.TIRE_REAR_WHEEL_SIZE = rearTireWheelSize;
      tire.ownCar = createdOwnCar;

      const { ownCar, ...createdTire } = await this.tiresRepository.save(tire);

      return { status: 'success', user_id, trim_id, tire: createdTire };
    } else if (APIresult.status === 'error') {
      return {
        status: 'error',
        user_id,
        trim_id,
        message: APIresult.data.message,
      };
    }
  }

  async getTireInfoFromAPI(trim_id: number): Promise<Result> {
    const url = `https://dev.mycar.cardoc.co.kr/v1/trim/${trim_id}`;
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
        status: 'success',
        data: { frontTire, rearTire },
      };
    };

    const validateTire = (tire, tireType) => {
      if (tire.search(/^[0-9]{3}\/[0-9]{2}R[0-9]{2}/g) === -1) {
        throw new InternalServerErrorException(
          `invalid ${tireType} tire format(${tire})`,
        );
      }
    };

    const getError = (err) => {
      if (err instanceof InternalServerErrorException) {
        return {
          status: 'error',
          data: { message: err.message },
        };
      }
      return {
        status: 'error',
        data: err.response.data,
      };
    };

    return await lastValueFrom(observer).then(getTireInfo).catch(getError);
  }
}
