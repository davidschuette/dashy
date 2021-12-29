import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Observable } from 'rxjs'
import { FastifyRequest } from 'fastify'
import { environment } from '../../environments/environment'

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<FastifyRequest>()

    return (
      request.headers.authorization === environment.apiKey ||
      request.headers.authorization === 'Bearer ' + environment.apiKey ||
      request.headers.authorization === 'bearer ' + environment.apiKey
    )
  }
}
