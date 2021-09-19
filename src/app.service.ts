import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy, Transport } from '@nestjs/microservices';
import * as fs from 'fs';
import { timeout } from 'rxjs/operators';

const FILE_NAME = 'test_image.jpg';

@Injectable()
export class AppService {
  constructor(
    @Inject('NATS_MESSAGE_BUS')
    private readonly clientNats: ClientProxy,
    @Inject('TCP_MESSAGE_BUS')
    private readonly clientTcp: ClientProxy,
  ) {}

  async sendData(transport: Transport): Promise<void> {
    try {
      console.log('Sending data...');
      let data = fs.readFileSync(FILE_NAME);
      let part = 1;
      try {
        if (data.length > 150000) {
          while (data.length > 150000) {
            const dataChunk = data.slice(0, 150000);
            data = data.slice(150000, data.length);
            const res = await this.sendByTransport(transport, {
              name: FILE_NAME,
              type: 'file',
              part,
              dataChunk: dataChunk,
            });
            console.log(res);
            if (res.err) {
              throw new Error(`Error: ${res.err}`);
            }
            part++;
          }
        }
        const res = await this.sendByTransport(transport, {
          name: FILE_NAME,
          type: 'file',
          part,
          dataChunk: data,
        });
        console.log(res);
        if (res.err) {
          throw new Error(`Error: ${res.err}`);
        }
      } catch (err) {
        console.log(err.message);
        const res = await this.sendByTransport(transport, {
          name: FILE_NAME,
          type: 'file',
          part,
          dataChunk: null,
        });

        console.log(res);
      }
    } catch (e) {
      console.log(e);
    }
  }

  private async sendByTransport(transport: Transport, data) {
    let res = null;
    if (transport === Transport.TCP) {
      res = await this.clientTcp
        .send({ cmd: 'writer.handle.data.tcp' }, data)
        .pipe(timeout(10000))
        .toPromise();
    } else if (transport === Transport.NATS) {
      res = await this.clientNats
        .send('writer.handle.data.nats', data)
        .pipe(timeout(10000))
        .toPromise();
    } else {
      console.log('Unknown transport');
    }
    return res;
  }
}
