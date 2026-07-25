import { CanActivate, ExecutionContext, Injectable, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common'
import type { Request } from 'express'
import { AuthenticatedRequest } from './auth.types'

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>()
    const cookie = request.headers.cookie
    if (!cookie) throw new UnauthorizedException('Sign in required')

    const correlationId = request.headers['x-correlation-id']
    const headers: Record<string, string> = { cookie }
    if (typeof correlationId === 'string') headers['x-correlation-id'] = correlationId

    const configuredTimeout = Number.parseInt(process.env.AUTH_SERVICE_TIMEOUT_MS ?? '3000', 10)
    const timeoutMs = Number.isFinite(configuredTimeout) && configuredTimeout > 0 ? configuredTimeout : 3000
    const authServiceUrl = (process.env.AUTH_SERVICE_URL || 'http://localhost:5100').replace(/\/+$/, '')

    try {
      const response = await fetch(`${authServiceUrl}/api/auth/me`, {
        headers,
        signal: AbortSignal.timeout(timeoutMs),
      })
      if (response.status === 401) throw new UnauthorizedException('Sign in required')
      if (!response.ok) throw new ServiceUnavailableException('Authentication service unavailable')
      ;(request as unknown as AuthenticatedRequest).user = await response.json() as AuthenticatedRequest['user']
      return true
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof ServiceUnavailableException) throw error
      throw new ServiceUnavailableException('Authentication service unavailable')
    }
  }
}
