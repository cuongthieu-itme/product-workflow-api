import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

const DEFAULT_METHODS = 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS';
const DEFAULT_ALLOWED_HEADERS = [
  'Accept',
  'Authorization',
  'Content-Type',
  'X-Requested-With',
];
const DEFAULT_EXPOSED_HEADERS = [
  'Content-Length',
  'Content-Type',
  'Date',
  'ETag',
];

export const buildCorsOptions = (): CorsOptions => {
  const isProduction = process.env.NODE_ENV === 'production';
  const originEnv = process.env.CORS_ORIGINS;

  let origin: boolean | string[] = true;

  if (originEnv) {
    if (originEnv === '*') {
      origin = true;
    } else {
      origin = originEnv.split(',').map((o) => o.trim());
    }
  } else if (isProduction) {
    origin = false;
  }

  return {
    origin,
    methods: DEFAULT_METHODS,
    allowedHeaders: DEFAULT_ALLOWED_HEADERS,
    exposedHeaders: DEFAULT_EXPOSED_HEADERS,
    credentials: true,
    maxAge: 86400,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  } as CorsOptions;
};

export const corsOptions: CorsOptions = buildCorsOptions();
