/**
 * Returns current authenticated user and linked provider accounts
 */
export function getCurrentUser(req, res) {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(200).json({
      authenticated: false,
      user: null,
    });
  }

  return res.status(200).json({
    authenticated: true,
    user: req.user,
  });
}

/**
 * Handles successful OAuth redirect back to the React application
 */
export function handleOAuthSuccess(req, res) {
  const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
  return res.redirect(`${CLIENT_URL}/dashboard`);
}

/**
 * Handles OAuth failure redirect
 */
export function handleOAuthFailure(req, res) {
  const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
  const errorMessage = req.query.error_description || req.query.error || 'Authentication failed. Please try again.';
  return res.redirect(`${CLIENT_URL}/login?error=${encodeURIComponent(errorMessage)}`);
}

/**
 * Log out user, invalidate session, and clear session cookie
 */
export function logout(req, res) {
  if (req.logout) {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Logout failed', error: err.message });
      }

      req.session.destroy((destroyErr) => {
        if (destroyErr) {
          return res.status(500).json({ success: false, message: 'Failed to destroy session' });
        }

        res.clearCookie('connect.sid', {
          path: '/',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        });

        return res.status(200).json({
          success: true,
          message: 'Logged out successfully',
          authenticated: false,
        });
      });
    });
  } else {
    return res.status(200).json({ success: true, message: 'Already logged out' });
  }
}

/**
 * Returns public status of configured OAuth providers (NO secrets exposed)
 */
export function getProvidersStatus(req, res) {
  return res.status(200).json({
    google: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    github: Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET),
    linkedin: Boolean(process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET),
  });
}
