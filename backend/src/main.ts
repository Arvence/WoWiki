import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { randomUUID } from 'node:crypto'
import { static as serveStatic, type NextFunction, type Request, type Response } from 'express'
import { join } from 'node:path'
import { AppModule } from './app.module'
import { ApiExceptionFilter } from './common/filters/api-exception.filter'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.enableShutdownHooks()
  app.use((request: Request, response: Response, next: NextFunction) => {
    const suppliedCorrelationId = request.header('X-Correlation-ID')
    const correlationId = suppliedCorrelationId && /^[0-9a-f]{32}$/i.test(suppliedCorrelationId)
      ? suppliedCorrelationId.toLowerCase()
      : randomUUID().replaceAll('-', '')

    request.headers['x-correlation-id'] = correlationId
    response.setHeader('X-Correlation-ID', correlationId)
    next()
  })
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
  app.useGlobalFilters(new ApiExceptionFilter())
  app.use('/images', serveStatic(join(process.cwd(), 'src', 'assets', 'images')))
  app.setGlobalPrefix('api')
  const port = Number.parseInt(process.env.BACKEND_PORT ?? '5000', 10)
  const host = process.env.BACKEND_HOST ?? '127.0.0.1'
  await app.listen(port, host)
  console.log(`Backend running at http://${host}:${port}/api`)
}

bootstrap()
