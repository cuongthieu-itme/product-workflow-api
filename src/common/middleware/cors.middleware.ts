import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class CorsMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD',
    );
    res.header(
      'Access-Control-Allow-Headers',
      'Accept, Authorization, Content-Type, X-Requested-With, X-API-Key, X-HTTP-Method-Override, Cache-Control, Pragma, Expires, Last-Modified, ETag, If-None-Match, If-Modified-Since, Origin, Referer, User-Agent, Accept-Encoding, Accept-Language, Connection, Host, X-Forwarded-For, X-Real-IP, X-CSRF-Token, X-Frame-Options, X-Content-Type-Options',
    );
    res.header(
      'Access-Control-Expose-Headers',
      'Content-Length, Content-Type, Date, ETag, Last-Modified, Location, Server, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, X-Total-Count, X-Page-Count, X-Per-Page, X-Current-Page',
    );
    res.header('Access-Control-Allow-Credentials', 'false');
    res.header('Access-Control-Max-Age', '86400');

    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }

    next();
  }
}
