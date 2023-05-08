import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FabricModule } from './fabric/fabric.module';

@Module({
  imports: [FabricModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
