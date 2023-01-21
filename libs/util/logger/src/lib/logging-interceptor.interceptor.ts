import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { FastifyReply, FastifyRequest } from 'fastify'
import { Observable, throwError } from 'rxjs'
import { catchError, tap } from 'rxjs/operators'
import { LogService } from './log.service'

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: LogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() === 'http') {
      const time = Date.now()
      const response = context.switchToHttp().getResponse<FastifyReply>()
      const request = context.switchToHttp().getRequest<FastifyRequest>()

      return next.handle().pipe(
        catchError((err) => {
          this.logger.request(request.method, request.url, Date.now() - time, response.statusCode)
          return throwError(() => err)
        }),
        tap(() => {
          this.logger.request(request.method, request.url, Date.now() - time, response.statusCode)
        })
      )
    }

    return next.handle()
  }
}
