import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const setupSwagger = (app: INestApplication): void => {
  const config = new DocumentBuilder()
    .setTitle('Workflow API')
    .setDescription('Comprehensive API documentation for Workflow platform')
    .setVersion('1.0')
    .addTag('Authentication', 'Authentication endpoints')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addServer('http://localhost:8080', 'Development server')
    .addServer('https://api.yourdomain.com', 'Production server')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Workflow API Documentation',
    customfavIcon: 'https://nestjs.com/img/logo-small.svg',
    explorer: true,
    jsonDocumentUrl: 'api/docs/json',
    yamlDocumentUrl: 'api/docs/yaml',
    swaggerOptions: {
      withCredentials: false,
      supportedSubmitMethods: [
        'get',
        'post',
        'put',
        'delete',
        'patch',
        'options',
        'head',
      ],
      defaultModelsExpandDepth: 1,
      defaultModelExpandDepth: 1,
      displayRequestDuration: true,
      deepLinking: true,
      filter: true,
      syntaxHighlight: {
        activated: true,
        theme: 'agate',
      },
      requestSnippetsEnabled: true,
      tryItOutEnabled: true,
      preauthorizeBasic: false,
      persistAuthorization: true,
      displayOperationId: false,
      docExpansion: 'list',
      defaultModelRendering: 'example',
      showMutatedRequest: true,
      showCommonExtensions: true,
      showExtensions: true,
    },
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info { margin: 50px 0 }
      .swagger-ui .info .title { color: #3b82f6 }
      .swagger-ui .scheme-container { background: #f8fafc; padding: 20px; border-radius: 8px; }
      .swagger-ui .btn.authorize { background-color: #3b82f6; border-color: #3b82f6; }
      .swagger-ui .btn.authorize:hover { background-color: #2563eb; border-color: #2563eb; }
      .swagger-ui .opblock.opblock-post { border-color: #10b981; }
      .swagger-ui .opblock.opblock-post .opblock-summary { border-color: #10b981; }
      .swagger-ui .opblock.opblock-get { border-color: #3b82f6; }
      .swagger-ui .opblock.opblock-get .opblock-summary { border-color: #3b82f6; }
      .swagger-ui .opblock.opblock-put { border-color: #f59e0b; }
      .swagger-ui .opblock.opblock-put .opblock-summary { border-color: #f59e0b; }
      .swagger-ui .opblock.opblock-delete { border-color: #ef4444; }
      .swagger-ui .opblock.opblock-delete .opblock-summary { border-color: #ef4444; }
      .swagger-ui .opblock.opblock-patch { border-color: #8b5cf6; }
      .swagger-ui .opblock.opblock-patch .opblock-summary { border-color: #8b5cf6; }
    `,
  });
};
