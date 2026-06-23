// =============================================================================
// Konfigurasi Aplikasi Express
// =============================================================================
// Setup utama Express app: middleware, routing, Swagger UI, dan error handling.
// =============================================================================

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';

// Konfigurasi
import swaggerSpec from './config/swagger.js';

// Middleware
import errorHandler from './middleware/errorHandler.js';

// Routes - akan diimport setelah file route dibuat
import authRoutes from './routes/auth.routes.js';
import categoryRoutes from './routes/category.routes.js';
import productRoutes from './routes/product.routes.js';
import cartRoutes from './routes/cart.routes.js';
import orderRoutes from './routes/order.routes.js';
import reviewRoutes from './routes/review.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';

// Inisialisasi Express
const app = express();

// =============================================================================
// Middleware Global
// =============================================================================

// Keamanan: set HTTP headers untuk proteksi (XSS, clickjacking, dll)
app.use(helmet());

// CORS: izinkan request dari origin yang berbeda
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Logging HTTP request (format 'dev' untuk development)
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Parsing body request
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate Limiting: batasi 100 request per 15 menit per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 100, // Maksimal 100 request per window
  standardHeaders: true, // Kirim info rate limit di header `RateLimit-*`
  legacyHeaders: false, // Nonaktifkan header `X-RateLimit-*`
  message: {
    success: false,
    message: 'Terlalu banyak request. Silakan coba lagi setelah 15 menit.',
  },
});
app.use(limiter);

// =============================================================================
// Dokumentasi API (Swagger UI)
// =============================================================================

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'API E-Commerce - Dokumentasi',
}));

// =============================================================================
// Route Utama
// =============================================================================

// Route info - endpoint root
app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'Selamat datang di API E-Commerce',
    version: '1.0.0',
    documentation: '/api-docs',
    endpoints: {
      auth: '/api/auth',
      categories: '/api/categories',
      products: '/api/products',
      cart: '/api/cart',
      orders: '/api/orders',
      reviews: '/api/reviews',
      dashboard: '/api/dashboard',
    },
  });
});

// Mount semua route di bawah prefix /api
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/dashboard', dashboardRoutes);

// =============================================================================
// Penanganan Route Tidak Ditemukan (404)
// =============================================================================

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint tidak ditemukan. Cek dokumentasi di /api-docs',
  });
});

// =============================================================================
// Global Error Handler (harus didaftarkan paling akhir)
// =============================================================================

app.use(errorHandler);

export default app;
