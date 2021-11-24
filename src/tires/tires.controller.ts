import { Controller } from '@nestjs/common';

import { TiresService } from './tires.service';

@Controller('tires')
export class TiresController {
  constructor(private readonly tiresService: TiresService) {}
}
