import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppConfigService } from './common/config/app-config.service';




async function bootstrap() {

  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.useGlobalPipes(
    new ValidationPipe({
      transform:true,
      whitelist:true
    })
  );
  app.setGlobalPrefix(globalPrefix);
  app.enableCors();
  const PORT = AppConfigService.getAppPort();
  await app.listen(PORT);
  Logger.log(`Nest is running on port ${process.env.PORT}`);
}
bootstrap();
