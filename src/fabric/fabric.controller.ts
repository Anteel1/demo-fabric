import { Controller, Get } from '@nestjs/common';

import { FabricService } from './fabric.service';

@Controller('api/fabric')
export class FabricController {
    constructor(private readonly fabricService: FabricService) { }

    @Get('getall')
    getall() {
        return this.fabricService.getAll()
    }
}
