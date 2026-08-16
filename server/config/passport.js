import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { Strategy as LinkedInStrategy } from 'passport-linkedin-oauth2';
import { findUserById, findOrCreateUserFromOAuth } from '../models/userModel.js';

export function configurePassport() {
  const SERVER_URL = process.env.SERVER_URL || 'http://localhost:5000';

  // Serialize user ID to session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user from session by ID
  passport.deserializeUser((id, done) => {
    try {
      const user = findUserById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });

  // 1. Google OAuth 2.0 Strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: `${SERVER_URL}/auth/google/callback`,
        },
        (accessToken, refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value;
            const name = profile.displayName || `${profile.name?.givenName || ''} ${profile.name?.familyName || ''}`.trim();
            const profileImage = profile.photos?.[0]?.value;

            const user = findOrCreateUserFromOAuth({
              provider: 'google',
              providerId: profile.id,
              email,
              name,
              profileImage,
            });

            return done(null, user);
          } catch (err) {
            return done(err, null);
          }
        }
      )
    );
    console.log('✅ Google OAuth strategy registered');
  }

  // 2. GitHub OAuth Strategy
  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    passport.use(
      new GitHubStrategy(
        {
          clientID: process.env.GITHUB_CLIENT_ID,
          clientSecret: process.env.GITHUB_CLIENT_SECRET,
          callbackURL: `${SERVER_URL}/auth/github/callback`,
          scope: ['user:email', 'read:user'],
        },
        (accessToken, refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value;
            const name = profile.displayName || profile.username || 'GitHub User';
            const profileImage = profile.photos?.[0]?.value || profile._json?.avatar_url;

            const user = findOrCreateUserFromOAuth({
              provider: 'github',
              providerId: profile.id,
              email,
              name,
              profileImage,
            });

            return done(null, user);
          } catch (err) {
            return done(err, null);
          }
        }
      )
    );
    console.log('✅ GitHub OAuth strategy registered');
  }

  // 3. LinkedIn OAuth 2.0 / Modern OpenID Connect Strategy
  if (process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET) {
    const linkedInStrategy = new LinkedInStrategy(
      {
        clientID: process.env.LINKEDIN_CLIENT_ID,
        clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
        callbackURL: `${SERVER_URL}/auth/linkedin/callback`,
        scope: ['openid', 'profile', 'email'],
        state: true,
      },
      (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          const name = profile.displayName || `${profile.name?.givenName || ''} ${profile.name?.familyName || ''}`.trim() || 'LinkedIn User';
          const profileImage = profile.photos?.[0]?.value;

          const user = findOrCreateUserFromOAuth({
            provider: 'linkedin',
            providerId: profile.id,
            email,
            name,
            profileImage,
          });

          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
    );

    // Override userProfile to fetch from LinkedIn's official modern OpenID Connect userinfo endpoint
    linkedInStrategy.userProfile = function (accessToken, done) {
      fetch('https://api.linkedin.com/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error(`LinkedIn UserInfo failed with status: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          const profile = {
            provider: 'linkedin',
            id: data.sub,
            displayName: data.name || `${data.given_name || ''} ${data.family_name || ''}`.trim(),
            emails: data.email ? [{ value: data.email }] : [],
            photos: data.picture ? [{ value: data.picture }] : [],
            _json: data,
          };
          done(null, profile);
        })
        .catch((err) => {
          console.error('LinkedIn UserInfo Fetch Error:', err);
          done(err, null);
        });
    };

    passport.use(linkedInStrategy);
    console.log('✅ LinkedIn OpenID Connect strategy registered');
  }
}
