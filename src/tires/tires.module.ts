import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TiresService } from './tires.service';
import { TiresController } from './tires.controller';
import { Tire } from './entities/tire.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tire])],
  controllers: [TiresController],
  providers: [TiresService],
})
export class TiresModule {}
