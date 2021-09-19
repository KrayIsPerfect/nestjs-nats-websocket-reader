import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { NATS_DEFAULT_URL } from '@nestjs/microservices/constants';
import {AppService} from "./app.service";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const microserviceNATS = app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.NATS,
    options: {
      servers: [NATS_DEFAULT_URL],
    },
  });
  const microserviceTCP = app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      port: 3001,
    },
  });
  await app.startAllMicroservices();
  await app.listen(3002, () => {
    app.get(AppService).startSendData();
    console.log('Reader-service started');
  });
}
bootstrap();
