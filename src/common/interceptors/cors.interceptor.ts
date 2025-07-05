import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class CorsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const origin = request.headers.origin || '*';
    response.header('Access-Control-Allow-Origin', origin);
    response.header(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD',
    );
    response.header(
      'Access-Control-Allow-Headers',
      'Accept, Authorization, Content-Type, X-Requested-With, X-API-Key, X-HTTP-Method-Override, Cache-Control, Pragma, Expires, Last-Modified, ETag, If-None-Match, If-Modified-Since, Origin, Referer, User-Agent, Accept-Encoding, Accept-Language, Connection, Host, X-Forwarded-For, X-Real-IP, X-CSRF-Token, X-Frame-Options, X-Content-Type-Options, Access-Control-Allow-Origin, Access-Control-Allow-Methods, Access-Control-Allow-Headers, Access-Control-Allow-Credentials',
    );
    response.header(
      'Access-Control-Expose-Headers',
      'Content-Length, Content-Type, Date, ETag, Last-Modified, Location, Server, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, X-Total-Count, X-Page-Count, X-Per-Page, X-Current-Page, Access-Control-Allow-Origin',
    );
    response.header('Access-Control-Allow-Credentials', 'true'); // Allow credentials
    response.header('Access-Control-Max-Age', '86400');

    return next.handle().pipe(
      map((data) => {
        return data;
      }),
    );
  }
}
