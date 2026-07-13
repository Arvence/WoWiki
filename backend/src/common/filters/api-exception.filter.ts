import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common'
import { Request, Response } from 'express'
import { ApiErrorResponse } from '../types/api-error-response.type'

type HttpExceptionBody = {
  error?: string
  message?: string | string[]
}

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp()
    const request = context.getRequest<Request>()
    const response = context.getResponse<Response>()
    const statusCode = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR
    const exceptionBody = this.getExceptionBody(exception)
    const body: ApiErrorResponse = {
      statusCode,
      error: exceptionBody.error ?? this.getErrorName(statusCode),
      message: exceptionBody.message ?? 'Internal server error',
      timestamp: new Date().toISOString(),
      path: request.originalUrl,
    }

    response.status(statusCode).json(body)
  }

  private getExceptionBody(exception: unknown): HttpExceptionBody {
    if (!(exception instanceof HttpException)) return {}
    const response = exception.getResponse()
    return typeof response === 'string' ? { message: response } : (response as HttpExceptionBody)
  }

  private getErrorName(statusCode: number): string {
    const statusName = HttpStatus[statusCode]
    return typeof statusName === 'string' ? statusName : 'INTERNAL_SERVER_ERROR'
  }
}
