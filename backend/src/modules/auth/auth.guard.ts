import { CanActivate, ExecutionContext, Injectable, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common'
import type { Request } from 'express'
import { AuthenticatedRequest } from './auth.types'

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>()
    const cookie = request.headers.cookie
    if (!cookie) throw new UnauthorizedException('Sign in required')
    try {
      const response = await fetch(`${process.env.AUTH_SERVICE_URL || 'http://localhost:5100'}/api/auth/me`, { headers: { cookie } })
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
