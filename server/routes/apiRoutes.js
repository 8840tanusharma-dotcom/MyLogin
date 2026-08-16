import express from 'express';
import { ensureAuthenticated } from '../middleware/authMiddleware.js';
import db from '../config/database.js';

const router = express.Router();

/**
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

/**
 * Protected dashboard summary data
 */
router.get('/dashboard/summary', ensureAuthenticated, (req, res) => {
  const usersCountRow = db.prepare('SELECT COUNT(*) as count FROM users').get();
  const providersCountRow = db.prepare('SELECT COUNT(*) as count FROM user_providers').get();

  res.json({
    user: req.user,
    stats: {
      totalRegisteredUsers: usersCountRow ? usersCountRow.count : 0,
      totalLinkedOAuthAccounts: providersCountRow ? providersCountRow.count : 0,
      sessionActive: true,
      currentServerTime: new Date().toISOString(),
    },
  });
});

export default router;
