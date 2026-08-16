import express from 'express';
import passport from 'passport';
import {
  getCurrentUser,
  handleOAuthSuccess,
  handleOAuthFailure,
  logout,
  getProvidersStatus,
} from '../controllers/authController.js';

const router = express.Router();

// Current authenticated user
router.get('/me', getCurrentUser);

// Check which OAuth providers are configured
router.get('/providers', getProvidersStatus);

// Failure redirect handler
router.get('/failure', handleOAuthFailure);

// Logout route
router.post('/logout', logout);
router.get('/logout', logout);

// --- 1. Google OAuth Routes ---
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account',
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/auth/failure?error=Google+authentication+cancelled+or+failed',
  }),
  handleOAuthSuccess
);

// --- 2. GitHub OAuth Routes ---
router.get(
  '/github',
  passport.authenticate('github', {
    scope: ['user:email', 'read:user'],
  })
);

router.get(
  '/github/callback',
  passport.authenticate('github', {
    failureRedirect: '/auth/failure?error=GitHub+authentication+cancelled+or+failed',
  }),
  handleOAuthSuccess
);

// --- 3. LinkedIn OAuth / OIDC Routes ---
router.get(
  '/linkedin',
  passport.authenticate('linkedin', {
    scope: ['openid', 'profile', 'email'],
  })
);

router.get(
  '/linkedin/callback',
  passport.authenticate('linkedin', {
    failureRedirect: '/auth/failure?error=LinkedIn+authentication+cancelled+or+failed',
  }),
  handleOAuthSuccess
);

export default router;
