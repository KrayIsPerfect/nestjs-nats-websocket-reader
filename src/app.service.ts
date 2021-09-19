import {Inject, Injectable} from '@nestjs/common';
import {ClientProxy, Transport} from '@nestjs/microservices';
import * as fs from 'fs';
import {timeout} from 'rxjs/operators';
import {DataTypeEnum} from './utils/data.type.enum';
import {IData} from './utils/data.interface';
import {log} from "util";

const FILE_NAME = 'test_image.jpg';
const SEND_DATA_DELAY = 100;

@Injectable()
export class AppService {
  private sendDataOnTcp = true;
  private sendDataOnNats = true;
  private counterTcp = 0;
  private counterNats = 0;
  private counter = 0;

  constructor(
    @Inject('NATS_MESSAGE_BUS')
    private readonly clientNats: ClientProxy,
    @Inject('TCP_MESSAGE_BUS')
    private readonly clientTcp: ClientProxy,
  ) {}

  async startSendData() {
    while (true) {
      await this.delay(SEND_DATA_DELAY);
      this.sendData(DataTypeEnum.DATA, Transport.NATS);
      await this.delay(SEND_DATA_DELAY);
      this.sendData(DataTypeEnum.FILE, Transport.NATS);
      await this.delay(SEND_DATA_DELAY);
      this.sendData(DataTypeEnum.DATA, Transport.TCP);
      await this.delay(SEND_DATA_DELAY);
      this.sendData(DataTypeEnum.FILE, Transport.TCP);
      if (this.counter % 100 === 0) {
        this.clientTcp
            .emit({ cmd: 'writer.check.counter.tcp' }, this.counterTcp);
        this.clientNats.emit('writer.check.counter.nats', this.counterNats);
      }
      this.counter += 4;
    }
  }

  delay(val: number): Promise<void> {
    return new Promise<void>((resolve)=>{
      setTimeout(() => {
        resolve();
      }, val)
    });
  }

  async sendData(type: DataTypeEnum, transport: Transport): Promise<void> {
    try {
      if (this.sendDataOnTcp && transport === Transport.TCP || this.sendDataOnNats && transport === Transport.NATS) {
        if (transport === Transport.TCP) {
          this.counterTcp++;
        } else if (transport === Transport.NATS) {
          this.counterNats++;
        }
        console.log('Sending data...');
        if (type === DataTypeEnum.FILE) {
          await this.sendFile(transport);
        } else if (type === DataTypeEnum.DATA) {
          await this.sendObject(transport);
        } else {
          throw new Error('Unknown datatype');
        }
        console.log('Data send');
      }
    } catch (e) {
      console.log(e);
    }
  }

  private async sendDataByTransport(
    transport: Transport,
    data: IData,
  ): Promise<any> {
    let res = null;
    if (transport === Transport.TCP) {
      res = await this.clientTcp
        .send({ cmd: 'writer.handle.data.tcp' }, data)
        .pipe(timeout(1000))
        .toPromise();
    } else if (transport === Transport.NATS) {
      res = await this.clientNats
        .send('writer.handle.data.nats', data)
        .pipe(timeout(1000))
        .toPromise();
    } else {
      throw new Error('Unknown transport');
    }
    return res;
  }

  private async sendFile(transport: Transport): Promise<void> {
    let data = fs.readFileSync(FILE_NAME);
    let part = 1;
    try {
      if (data.length > 150000) {
        while (data.length > 150000) {
          const dataChunk = data.slice(0, 150000);
          data = data.slice(150000, data.length);
          const res = await this.sendDataByTransport(transport, {
            name: FILE_NAME,
            type: DataTypeEnum.FILE,
            part,
            data,
          });
          console.log(res);
          if (res.err) {
            throw new Error(`Error: ${res.err}`);
          }
          part++;
        }
      }
      const res = await this.sendDataByTransport(transport, {
        name: FILE_NAME,
        type: DataTypeEnum.FILE,
        part,
        data,
      });
      console.log(res);
      if (res.err) {
        throw new Error(`Error: ${res.err}`);
      }
    } catch (err) {
      console.log(err.message);
      const res = await this.sendDataByTransport(transport, {
        name: FILE_NAME,
        type: DataTypeEnum.FILE,
        part,
        data: null,
      });

      console.log(res);
    }
  }

  private async sendObject(transport: Transport): Promise<void> {
    try {
      const res = await this.sendDataByTransport(transport, {
        type: DataTypeEnum.DATA,
        data: { id: 123, description: 'Test another data format' },
      });
      console.log(res);
      if (res.err) {
        throw new Error(`Error: ${res.err}`);
      }
    } catch (err) {
      console.log(err);
    }
  }

  sendDataOnOff(state: boolean, transport: Transport) {
    if (transport === Transport.TCP) {
      this.sendDataOnNats = state;
    } else if (transport === Transport.NATS) {
      this.sendDataOnTcp = state;
    }
  }
}
