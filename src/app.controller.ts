import {Controller, Get} from '@nestjs/common';
import {AppService} from './app.service';
import {MessagePattern, Transport} from '@nestjs/microservices';
import {DataTypeEnum} from './utils/data.type.enum';

@Controller()
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

  @Get('sendDataOn')
  sendDataOn(): void {
    this.appService.sendDataOnOff(true, Transport.NATS);
    this.appService.sendDataOnOff(true, Transport.TCP);
  }

  @Get('sendDataOff')
  sendDataOff(): void {
    this.appService.sendDataOnOff(false, Transport.NATS);
    this.appService.sendDataOnOff(false, Transport.TCP);
  }

  @MessagePattern('reader.send.data.on.off.nats', Transport.NATS)
  handleDataNats(data: boolean): void {
    console.log('received "reader.send.data.on.off.nats"');
    this.appService.sendDataOnOff(data, Transport.NATS);
  }

  @MessagePattern({cmd: 'reader.send.data.on.off.tcp'}, Transport.TCP)
  handleDataTcp(data: boolean): void {
    console.log('received "reader.send.data.on.off.tcp"');
    this.appService.sendDataOnOff(data, Transport.TCP);
  }
}
