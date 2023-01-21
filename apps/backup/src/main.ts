/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'

import { AppModule } from './app/app.module'
import { LoggingInterceptor, LogService } from '@dashy/util/logger'

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter())
  const globalPrefix = 'api'
  const logger = app.get(LogService)
  app.setGlobalPrefix(globalPrefix)
  app.enableShutdownHooks()
  app.useGlobalInterceptors(new LoggingInterceptor(logger))

  const config = new DocumentBuilder().setTitle('Dashy Backup').setDescription('Backup tool').setVersion('1.0').addTag('Backups').build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup(globalPrefix, app, document)

  const port = process.env.PORT || 3334
  await app.listen(port)
  logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`, 'Main')
}

bootstrap()
