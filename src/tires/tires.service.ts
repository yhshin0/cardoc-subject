import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpService } from '@nestjs/axios';
import { Repository } from 'typeorm';
import { lastValueFrom, map } from 'rxjs';

import { CreateTireDto } from './dto/create-tire.dto';
import { Tire } from './entities/tire.entity';

interface Result {
  status: string;
  data: any;
}

@Injectable()
export class TiresService {
  constructor(
    @InjectRepository(Tire) private tiresRepository: Repository<Tire>,
    private httpService: HttpService,
  ) {}

  async create(createTireDto: CreateTireDto) {
    const { trim_id, user_id } = createTireDto;
    return await this.getTireInfoFromAPI(trim_id);
  }

  async getTireInfoFromAPI(trim_id: number): Promise<Result> {
    const url = `https://dev.mycar.cardoc.co.kr/v1/trim/${trim_id}`;
    const observer = this.httpService
      .get(url)
      .pipe(map((axiosResponse) => axiosResponse));

    const getTireInfo = (axiosResponse) => {
      return {
        status: 'success',
        data: {
          frontTire: axiosResponse.data.spec.driving.frontTire.value,
          rearTire: axiosResponse.data.spec.driving.rearTire.value,
        },
      };
    };

    const getError = (err) => ({
      status: 'error',
      data: { status: err.response.status, data: err.response.data },
    });

    return await lastValueFrom(observer).then(getTireInfo).catch(getError);
  }
}
