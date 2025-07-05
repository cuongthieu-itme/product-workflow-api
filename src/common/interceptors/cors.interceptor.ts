import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';

@Injectable()
export class CorsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const response = context.switchToHttp().getResponse<Response>();

    response.header('Access-Control-Allow-Origin', '*');
    response.header(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD',
    );
    response.header(
      'Access-Control-Allow-Headers',
      'Accept, Authorization, Content-Type, X-Requested-With, X-API-Key, X-HTTP-Method-Override, Cache-Control, Pragma, Expires, Last-Modified, ETag, If-None-Match, If-Modified-Since, Origin, Referer, User-Agent, Accept-Encoding, Accept-Language, Connection, Host, X-Forwarded-For, X-Real-IP, X-CSRF-Token, X-Frame-Options, X-Content-Type-Options',
    );
    response.header(
      'Access-Control-Expose-Headers',
      'Content-Length, Content-Type, Date, ETag, Last-Modified, Location, Server, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, X-Total-Count, X-Page-Count, X-Per-Page, X-Current-Page',
    );
    response.header('Access-Control-Allow-Credentials', 'false');
    response.header('Access-Control-Max-Age', '86400');

    return next.handle().pipe(
      map((data) => {
        return data;
      }),
    );
  }
}
