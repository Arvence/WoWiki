import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { static as serveStatic } from 'express'
import { join } from 'node:path'
import { AppModule } from './app.module'
import { ApiExceptionFilter } from './common/filters/api-exception.filter'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
  })
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
  app.useGlobalFilters(new ApiExceptionFilter())
  app.use('/images', serveStatic(join(process.cwd(), 'src', 'assets', 'images')))
  app.setGlobalPrefix('api')
  await app.listen(5000)
  console.log('Backend running at http://localhost:5000/api')
}

bootstrap()
