/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { LoggingInterceptor, LogService } from '@dashy/util/logger'
import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

import { AppModule } from './app/app.module'

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter())
  const globalPrefix = 'api'
  const logger = app.get(LogService)

  app.setGlobalPrefix(globalPrefix)
  app.enableShutdownHooks()
  app.useGlobalInterceptors(new LoggingInterceptor(logger))
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }))

  const config = new DocumentBuilder()
    .setTitle('Dashy Api')
    .setDescription('Api')
    .setVersion('1.0')
    .addTag('Tools')
    .addTag('Storage')
    .addTag('Backups')
    .addBearerAuth({ type: 'http', scheme: 'bearer' })
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup(globalPrefix, app, document)

  const port = process.env.PORT || 3000
  await app.listen(port, '0.0.0.0')
  logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`, 'Main')
}

bootstrap()
