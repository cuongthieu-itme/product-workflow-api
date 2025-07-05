import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

// Cấu hình CORS cho production - cho phép tất cả origins
export const corsConfigProduction: CorsOptions = {
  origin: true, // Cho phép tất cả origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
  allowedHeaders: [
    'Accept',
    'Authorization',
    'Content-Type',
    'X-Requested-With',
    'X-API-Key',
    'X-HTTP-Method-Override',
    'Cache-Control',
    'Pragma',
    'Expires',
    'Last-Modified',
    'ETag',
    'If-None-Match',
    'If-Modified-Since',
    'Origin',
    'Referer',
    'User-Agent',
    'Accept-Encoding',
    'Accept-Language',
    'Connection',
    'Host',
    'X-Forwarded-For',
    'X-Real-IP',
    'X-CSRF-Token',
    'X-Frame-Options',
    'X-Content-Type-Options',
    'Access-Control-Allow-Origin',
    'Access-Control-Allow-Methods',
    'Access-Control-Allow-Headers',
    'Access-Control-Allow-Credentials',
  ],
  exposedHeaders: [
    'Content-Length',
    'Content-Type',
    'Date',
    'ETag',
    'Last-Modified',
    'Location',
    'Server',
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset',
    'X-Total-Count',
    'X-Page-Count',
    'X-Per-Page',
    'X-Current-Page',
    'Access-Control-Allow-Origin',
  ],
  credentials: true,
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

// Cấu hình CORS cho development - cũng cho phép tất cả để dev dễ dàng hơn
export const corsConfigDevelopment: CorsOptions = {
  origin: true, // Cho phép tất cả origins trong development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
  allowedHeaders: [
    'Accept',
    'Authorization',
    'Content-Type',
    'X-Requested-With',
    'X-API-Key',
    'X-HTTP-Method-Override',
    'Cache-Control',
    'Pragma',
    'Expires',
    'Last-Modified',
    'ETag',
    'If-None-Match',
    'If-Modified-Since',
    'Origin',
    'Referer',
    'User-Agent',
    'Accept-Encoding',
    'Accept-Language',
    'Connection',
    'Host',
    'X-Forwarded-For',
    'X-Real-IP',
    'X-CSRF-Token',
    'X-Frame-Options',
    'X-Content-Type-Options',
    'Access-Control-Allow-Origin',
    'Access-Control-Allow-Methods',
    'Access-Control-Allow-Headers',
    'Access-Control-Allow-Credentials',
  ],
  exposedHeaders: [
    'Content-Length',
    'Content-Type',
    'Date',
    'ETag',
    'Last-Modified',
    'Location',
    'Server',
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset',
    'X-Total-Count',
    'X-Page-Count',
    'X-Per-Page',
    'X-Current-Page',
    'Access-Control-Allow-Origin',
  ],
  credentials: true,
  maxAge: 86400,
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

// Export dynamic config based on environment
export const getCorsConfig = (): CorsOptions => {
  const isProduction = process.env.NODE_ENV === 'production';
  return isProduction ? corsConfigProduction : corsConfigDevelopment;
};

// Export default config for backward compatibility
export const corsConfig = getCorsConfig();

// Deprecated - kept for backward compatibility
export const corsConfigDev = corsConfigDevelopment;
