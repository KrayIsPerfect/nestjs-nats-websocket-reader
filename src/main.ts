import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { NATS_DEFAULT_URL } from '@nestjs/microservices/constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.NATS,
    options: {
      servers: [NATS_DEFAULT_URL],
    },
  });
  await app.startAllMicroservices();
  await app.listen(3001, () => {
    console.log('Reader-service started');
  });
}
bootstrap();
