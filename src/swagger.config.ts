import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const setupSwagger = (app: INestApplication): void => {
  const config = new DocumentBuilder()
    .setTitle('🚀 Workflow API')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description:
          'Nhập JWT token để xác thực (Không cần thêm "Bearer " ở đầu)',
        in: 'header',
      },
      'JWT-auth',
    )
    .addServer('http://localhost:8080', '🔧 Development Server')
    .addServer('https://api.yourdomain.com', '🚀 Production Server')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: '🚀 Workflow API - Tài liệu API',
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
      defaultModelsExpandDepth: 2,
      defaultModelExpandDepth: 2,
      displayRequestDuration: true,
      deepLinking: true,
      filter: true,
      syntaxHighlight: {
        activated: true,
        theme: 'monokai',
      },
      requestSnippetsEnabled: true,
      tryItOutEnabled: true,
      preauthorizeBasic: false,
      persistAuthorization: true,
      displayOperationId: true,
      docExpansion: 'list',
      defaultModelRendering: 'model',
      showMutatedRequest: true,
      showCommonExtensions: true,
      showExtensions: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customCss: `
      /* Import Google Fonts */
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
      
      /* Root variables for consistent theming */
      :root {
        --primary-color: #2563eb;
        --primary-dark: #1d4ed8;
        --success-color: #10b981;
        --warning-color: #f59e0b;
        --danger-color: #ef4444;
        --info-color: #06b6d4;
        --purple-color: #8b5cf6;
        --bg-primary: #ffffff;
        --bg-secondary: #f8fafc;
        --bg-tertiary: #f1f5f9;
        --text-primary: #1e293b;
        --text-secondary: #64748b;
        --border-color: #e2e8f0;
        --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
        --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
        --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
        --radius: 8px;
        --radius-lg: 12px;
      }

      /* Base styles */
      .swagger-ui {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        line-height: 1.6;
        color: var(--text-primary);
      }

      /* Hide top bar */
      .swagger-ui .topbar { 
        display: none; 
      }

      /* Main container */
      .swagger-ui .swagger-container {
        max-width: 1400px;
        margin: 0 auto;
        padding: 0 20px;
      }

      /* Header section */
      .swagger-ui .info {
        margin: 40px 0;
        padding: 30px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: var(--radius-lg);
        color: white;
        box-shadow: var(--shadow-lg);
      }

      .swagger-ui .info .title {
        color: white !important;
        font-size: 2.5rem;
        font-weight: 700;
        margin-bottom: 16px;
        text-align: center;
      }

      .swagger-ui .info .description {
        font-size: 1rem;
        opacity: 0.95;
        text-align: left;
      }

      .swagger-ui .info .description h3 {
        color: white !important;
      }

      /* Scheme container (servers) */
      .swagger-ui .scheme-container {
        background: var(--bg-secondary);
        padding: 24px;
        border-radius: var(--radius-lg);
        margin: 24px 0;
        border: 1px solid var(--border-color);
        box-shadow: var(--shadow-sm);
      }

      .swagger-ui .scheme-container .schemes {
        display: flex;
        gap: 12px;
        align-items: center;
        flex-wrap: wrap;
      }

      .swagger-ui .opblock-summary-control {
        border-radius: var(--radius-lg);
        background: var(--bg-secondary);
        padding: 8px;
        border: 1px solid var(--border-color);
        box-shadow: var(--shadow-sm);
      }

      .swagger-ui .scheme-container .schemes > label {
        font-weight: 600;
        color: var(--text-primary);
        margin-right: 8px;
      }

      /* Authorization button */
      .swagger-ui .btn.authorize {
        background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
        border: none;
        color: white;
        padding: 12px 24px;
        border-radius: var(--radius);
        font-weight: 600;
        transition: all 0.3s ease;
        box-shadow: var(--shadow-md);
      }

      .swagger-ui .btn.authorize:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-lg);
        background: linear-gradient(135deg, var(--primary-dark) 0%, #1e40af 100%);
      }

      .swagger-ui .btn.authorize svg {
        margin-right: 8px;
      }

      /* Operation blocks */
      .swagger-ui .opblock {
        margin: 16px 0;
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-md);
        overflow: hidden;
        transition: all 0.3s ease;
        background: var(--bg-primary);
      }

      .swagger-ui .opblock:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-lg);
      }

      .swagger-ui .opblock .opblock-summary {
        padding: 16px 20px;
        cursor: pointer;
        transition: all 0.3s ease;
        font-weight: 500;
      }

      .swagger-ui .opblock.opblock-post {
        border-left: 4px solid var(--success-color);
      }
      .swagger-ui .opblock.opblock-post .opblock-summary {
        background: rgba(16, 185, 129, 0.1);
        border-color: var(--success-color);
      }
      .swagger-ui .opblock.opblock-post .opblock-summary:hover {
        background: rgba(16, 185, 129, 0.15);
      }

      .swagger-ui .opblock.opblock-get {
        border-left: 4px solid var(--primary-color);
      }
      .swagger-ui .opblock.opblock-get .opblock-summary {
        background: rgba(37, 99, 235, 0.1);
        border-color: var(--primary-color);
      }
      .swagger-ui .opblock.opblock-get .opblock-summary:hover {
        background: rgba(37, 99, 235, 0.15);
      }

      .swagger-ui .opblock.opblock-put {
        border-left: 4px solid var(--warning-color);
      }
      .swagger-ui .opblock.opblock-put .opblock-summary {
        background: rgba(245, 158, 11, 0.1);
        border-color: var(--warning-color);
      }
      .swagger-ui .opblock.opblock-put .opblock-summary:hover {
        background: rgba(245, 158, 11, 0.15);
      }

      .swagger-ui .opblock.opblock-delete {
        border-left: 4px solid var(--danger-color);
      }
      .swagger-ui .opblock.opblock-delete .opblock-summary {
        background: rgba(239, 68, 68, 0.1);
        border-color: var(--danger-color);
      }
      .swagger-ui .opblock.opblock-delete .opblock-summary:hover {
        background: rgba(239, 68, 68, 0.15);
      }

      .swagger-ui .opblock.opblock-patch {
        border-left: 4px solid var(--purple-color);
      }
      .swagger-ui .opblock.opblock-patch .opblock-summary {
        background: rgba(139, 92, 246, 0.1);
        border-color: var(--purple-color);
      }
      .swagger-ui .opblock.opblock-patch .opblock-summary:hover {
        background: rgba(139, 92, 246, 0.15);
      }

      /* HTTP method labels */
      .swagger-ui .opblock .opblock-summary-method {
        font-weight: 700;
        padding: 6px 12px;
        border-radius: var(--radius);
        margin-right: 12px;
        font-size: 0.875rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      /* Tags */
      .swagger-ui .opblock-tag {
        font-size: 1.5rem !important;
        font-weight: 700 !important;
        color: var(--text-primary) !important;
        margin: 32px 0 16px 0 !important;
        padding: 16px 0 !important;
        border-bottom: 3px solid var(--primary-color) !important;
        display: flex !important;
        align-items: center !important;
      }

      .swagger-ui .opblock-tag:before {
        content: '';
        width: 4px;
        height: 24px;
        background: var(--primary-color);
        margin-right: 12px;
        border-radius: 2px;
      }

      /* Parameters and responses */
      .swagger-ui .parameters-container,
      .swagger-ui .responses-wrapper {
        padding: 20px;
        background: var(--bg-secondary);
        margin: 16px 0;
        border-radius: var(--radius);
      }

      .swagger-ui .parameter__name {
        font-weight: 600;
        color: var(--text-primary);
      }

      .swagger-ui .parameter__type {
        color: var(--text-secondary);
        font-size: 0.875rem;
      }

      /* Try it out button */
      .swagger-ui .btn.try-out__btn {
        background: var(--info-color);
        border: none;
        color: white;
        padding: 8px 16px;
        border-radius: var(--radius);
        font-weight: 500;
        transition: all 0.3s ease;
      }

      .swagger-ui .btn.try-out__btn:hover {
        background: #0891b2;
        transform: translateY(-1px);
      }

      /* Execute button */
      .swagger-ui .btn.execute {
        background: linear-gradient(135deg, var(--success-color) 0%, #059669 100%);
        border: none;
        color: white;
        padding: 12px 24px;
        border-radius: var(--radius);
        font-weight: 600;
        transition: all 0.3s ease;
        box-shadow: var(--shadow-md);
      }

      .swagger-ui .btn.execute:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-lg);
      }

      /* Response section */
      .swagger-ui .responses-table {
        border-radius: var(--radius);
        overflow: hidden;
        box-shadow: var(--shadow-sm);
      }

      .swagger-ui .response-col_status {
        font-weight: 600;
      }

      /* Input fields */
      .swagger-ui input[type="text"],
      .swagger-ui input[type="password"],
      .swagger-ui input[type="email"],
      .swagger-ui textarea,
      .swagger-ui select {
        border: 2px solid var(--border-color);
        border-radius: var(--radius);
        padding: 12px;
        font-family: inherit;
        transition: all 0.3s ease;
        background: var(--bg-primary);
      }

      .swagger-ui input[type="text"]:focus,
      .swagger-ui input[type="password"]:focus,
      .swagger-ui input[type="email"]:focus,
      .swagger-ui textarea:focus,
      .swagger-ui select:focus {
        border-color: var(--primary-color);
        outline: none;
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
      }

      /* Model section */
      .swagger-ui .model-container {
        background: var(--bg-secondary);
        border-radius: var(--radius);
        padding: 16px;
        margin: 16px 0;
        border: 1px solid var(--border-color);
      }

      .swagger-ui .model .property {
        padding: 8px 0;
        border-bottom: 1px solid var(--border-color);
      }

      .swagger-ui .model .property:last-child {
        border-bottom: none;
      }

      /* Filter */
      .swagger-ui .filter-container {
        margin: 20px 0;
      }

      .swagger-ui .filter-container input {
        width: 100%;
        max-width: 400px;
        padding: 12px 16px;
        border: 2px solid var(--border-color);
        border-radius: var(--radius-lg);
        font-size: 1rem;
        transition: all 0.3s ease;
        background: var(--bg-primary);
      }

      .swagger-ui .filter-container input:focus {
        border-color: var(--primary-color);
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        outline: none;
      }

      /* Scrollbar styling */
      .swagger-ui ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }

      .swagger-ui ::-webkit-scrollbar-track {
        background: var(--bg-tertiary);
        border-radius: 4px;
      }

      .swagger-ui ::-webkit-scrollbar-thumb {
        background: var(--text-secondary);
        border-radius: 4px;
      }

      .swagger-ui ::-webkit-scrollbar-thumb:hover {
        background: var(--text-primary);
      }

      /* Responsive design */
      @media (max-width: 768px) {
        .swagger-ui .swagger-container {
          padding: 0 16px;
        }
        
        .swagger-ui .info {
          margin: 20px 0;
          padding: 20px;
        }
        
        .swagger-ui .info .title {
          font-size: 2rem;
        }
        
        .swagger-ui .scheme-container {
          padding: 16px;
        }
        
        .swagger-ui .opblock .opblock-summary {
          padding: 12px 16px;
        }
      }

      /* Animation for loading */
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .swagger-ui .opblock {
        animation: fadeIn 0.3s ease;
      }

      /* Success/Error indicators */
      .swagger-ui .response.highlighted {
        border-left: 4px solid var(--success-color);
        background: rgba(16, 185, 129, 0.05);
      }

      .swagger-ui .response.error {
        border-left: 4px solid var(--danger-color);
        background: rgba(239, 68, 68, 0.05);
      }

      /* Custom badges */
      .swagger-ui .opblock .opblock-summary .opblock-summary-description {
        font-weight: 400;
        color: var(--text-secondary);
      }

      /* Download links */
      .swagger-ui .download-contents {
        background: var(--bg-secondary);
        padding: 16px;
        border-radius: var(--radius);
        margin: 16px 0;
        text-align: center;
      }

      .swagger-ui .download-contents a {
        color: var(--primary-color);
        text-decoration: none;
        font-weight: 600;
        margin: 0 12px;
        padding: 8px 16px;
        border: 2px solid var(--primary-color);
        border-radius: var(--radius);
        transition: all 0.3s ease;
        display: inline-block;
      }

      .swagger-ui .download-contents a:hover {
        background: var(--primary-color);
        color: white;
        transform: translateY(-2px);
      }
    `,
  });
};
