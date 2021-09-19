import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { NATS_DEFAULT_URL } from '@nestjs/microservices/constants';
import { AppController } from './app.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'NATS_MESSAGE_BUS',
        transport: Transport.NATS,
        options: {
          url: NATS_DEFAULT_URL,
        },
      },
    ]),
    ClientsModule.register([
      {
        name: 'TCP_MESSAGE_BUS',
        transport: Transport.TCP,
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
