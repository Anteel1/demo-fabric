import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AriesConfig } from './aries/config.aries';

@Module({
  controllers: [AppController],
  providers: [AppService, AriesConfig],
})
export class AppModule { }
