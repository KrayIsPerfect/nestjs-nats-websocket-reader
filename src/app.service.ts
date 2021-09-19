import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import * as fs from 'fs';
import { timeout } from 'rxjs/operators';

const FILE_NAME = 'test_image.jpg';

@Injectable()
export class AppService {
  constructor(
    @Inject('APP_MESSAGE_BUS')
    private readonly clientNats: ClientProxy,
  ) {}

  async sendData(): Promise<void> {
    try {
      console.log('Sending data...');
      let data = fs.readFileSync(FILE_NAME);
      let part = 1;
      try {
        if (data.length > 150000) {
          while (data.length > 150000) {
            const dataChunk = data.slice(0, 150000);
            data = data.slice(150000, data.length);
            const res = await this.clientNats
              .send('writer.handle.data', {
                name: FILE_NAME,
                type: 'file',
                part,
                dataChunk: dataChunk,
              })
              .pipe(timeout(10000))
              .toPromise();
            console.log(res);
            if (res.err) {
              throw new Error(`Error: ${res.err}`);
            }
            part++;
          }
        }
        const res = await this.clientNats
          .send('writer.handle.data', {
            name: FILE_NAME,
            type: 'file',
            part,
            dataChunk: data,
          })
          .pipe(timeout(10000))
          .toPromise();
        console.log(res);
        if (res.err) {
          throw new Error(`Error: ${res.err}`);
        }
      } catch (err) {
        console.log(err.message);
        const res = await this.clientNats
          .send('writer.handle.data', {
            name: FILE_NAME,
            type: 'file',
            part,
            dataChunk: null,
          })
          .pipe(timeout(10000))
          .toPromise();

        console.log(res);
      }
    } catch (e) {
      console.log(e);
    }
  }
}
