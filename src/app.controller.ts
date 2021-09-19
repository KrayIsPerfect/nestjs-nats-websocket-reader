import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Transport } from '@nestjs/microservices';
import { DataTypeEnum } from './utils/data.type.enum';

@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('nats/file')
  async sendFileNats(): Promise<void> {
    await this.appService.sendData(DataTypeEnum.FILE, Transport.NATS);
  }

  @Get('tcp/file')
  async sendFileTcp(): Promise<void> {
    await this.appService.sendData(DataTypeEnum.FILE, Transport.TCP);
  }

  @Get('nats/object')
  async sendObjectNats(): Promise<void> {
    await this.appService.sendData(DataTypeEnum.DATA, Transport.NATS);
  }

  @Get('tcp/object')
  async sendObject(): Promise<void> {
    await this.appService.sendData(DataTypeEnum.DATA, Transport.TCP);
  }
}
