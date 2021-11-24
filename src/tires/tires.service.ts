import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateTireDto } from './dto/create-tire.dto';
import { Tire } from './entities/tire.entity';

@Injectable()
export class TiresService {
  constructor(
    @InjectRepository(Tire) private tiresRepository: Repository<Tire>,
  ) {}

  async create(createTireDto: CreateTireDto) {
    return 'Tire';
  }
}
