/**
 * Middleware to protect API routes from unauthenticated access
 */
export function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({
    success: false,
    message: 'Unauthorized: Please log in to access this resource',
    authenticated: false,
  });
}

/**
 * Helper middleware to check if provider credentials are set before attempting OAuth redirect
 */
export function checkProviderConfigured(provider) {
  return (req, res, next) => {
    const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

    if (provider === 'google' && (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET)) {
      return res.redirect(`${CLIENT_URL}/login?error=Google+OAuth+credentials+missing+in+server+.env`);
    }
    if (provider === 'github' && (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET)) {
      return res.redirect(`${CLIENT_URL}/login?error=GitHub+OAuth+credentials+missing+in+server+.env`);
    }
    if (provider === 'facebook' && (!process.env.FACEBOOK_APP_ID || !process.env.FACEBOOK_APP_SECRET)) {
      return res.redirect(`${CLIENT_URL}/login?error=Facebook+OAuth+credentials+missing+in+server+.env`);
    }
    if (provider === 'linkedin' && (!process.env.LINKEDIN_CLIENT_ID || !process.env.LINKEDIN_CLIENT_SECRET)) {
      return res.redirect(`${CLIENT_URL}/login?error=LinkedIn+OAuth+credentials+missing+in+server+.env`);
    }

    next();
  };
}
