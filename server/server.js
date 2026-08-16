import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import { initDatabase } from './config/database.js';
import { configurePassport } from './config/passport.js';
import authRoutes from './routes/authRoutes.js';
import apiRoutes from './routes/apiRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const isProduction = process.env.NODE_ENV === 'production';

// Initialize Database schema
initDatabase();

// Configure Passport Strategies
configurePassport();

// Middleware: Trust proxy in production
if (isProduction) {
  app.set('trust proxy', 1);
}

// Middleware: CORS configuration
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Middleware: Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware: Session handling with secure HttpOnly cookies
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev_secret_social_auth_fallback_key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days expiration
    },
  })
);

// Middleware: Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Mount Routes
app.use('/auth', authRoutes);
app.use('/api', apiRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Social OAuth Authentication Backend is running',
    version: '1.0.0',
    providers: ['google', 'github', 'linkedin'],
    endpoints: {
      authMe: '/auth/me',
      providersStatus: '/auth/providers',
      health: '/api/health',
    },
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: isProduction ? 'An unexpected error occurred' : err.message,
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`\n🚀 Authentication Server running on http://localhost:${PORT}`);
  console.log(`👉 Client Origin: ${CLIENT_URL}`);
  console.log(`👉 Endpoints:`);
  console.log(`   - Google OAuth:   http://localhost:${PORT}/auth/google`);
  console.log(`   - GitHub OAuth:   http://localhost:${PORT}/auth/github`);
  console.log(`   - LinkedIn OAuth: http://localhost:${PORT}/auth/linkedin`);
  console.log(`   - Auth Status:    http://localhost:${PORT}/auth/me\n`);
});
