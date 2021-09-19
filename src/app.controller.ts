import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Transport } from '@nestjs/microservices';

@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('nats')
  async sendDataNats(): Promise<void> {
    await this.appService.sendData(Transport.NATS);
  }

  @Get('tcp')
  async sendData(): Promise<void> {
    await this.appService.sendData(Transport.TCP);
  }
}
