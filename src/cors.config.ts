import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

// Cấu hình CORS cho phép tất cả - dùng cho development và testing
export const corsConfig: CorsOptions = {
  origin: true, // Cho phép tất cả origins
  methods: '*', // Cho phép tất cả HTTP methods
  allowedHeaders: '*', // Cho phép tất cả headers
  exposedHeaders: '*', // Expose tất cả headers
  credentials: true, // Cho phép cookies và credentials
  maxAge: 86400,
  preflightContinue: false,
  optionsSuccessStatus: 200,
};

// Cấu hình CORS rất mở cho development
export const corsConfigDev: CorsOptions = {
  origin: true, // Cho phép tất cả origins
  methods: '*', // Cho phép tất cả methods
  allowedHeaders: '*', // Cho phép tất cả headers
  exposedHeaders: '*', // Expose tất cả headers
  credentials: true,
  maxAge: 86400,
  preflightContinue: false,
  optionsSuccessStatus: 200,
};
