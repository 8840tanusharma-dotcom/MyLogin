import db from '../config/database.js';
import crypto from 'node:crypto';

/**
 * Find user by internal ID
 */
export function findUserById(id) {
  const stmt = db.prepare(`SELECT * FROM users WHERE id = ?`);
  const user = stmt.get(id);
  if (!user) return null;

  const providersStmt = db.prepare(`SELECT provider, provider_id, email, created_at FROM user_providers WHERE user_id = ?`);
  const providers = providersStmt.all(id);

  return {
    ...user,
    providers
  };
}

/**
 * Find user by email
 */
export function findUserByEmail(email) {
  if (!email) return null;
  const stmt = db.prepare(`SELECT * FROM users WHERE LOWER(email) = LOWER(?)`);
  const user = stmt.get(email);
  if (!user) return null;

  const providersStmt = db.prepare(`SELECT provider, provider_id, email, created_at FROM user_providers WHERE user_id = ?`);
  const providers = providersStmt.all(user.id);

  return {
    ...user,
    providers
  };
}

/**
 * Find user by OAuth provider and provider ID
 */
export function findUserByProvider(provider, providerId) {
  const stmt = db.prepare(`
    SELECT u.* FROM users u
    INNER JOIN user_providers up ON u.id = up.user_id
    WHERE up.provider = ? AND up.provider_id = ?
  `);
  const user = stmt.get(provider, String(providerId));
  if (!user) return null;

  const providersStmt = db.prepare(`SELECT provider, provider_id, email, created_at FROM user_providers WHERE user_id = ?`);
  const providers = providersStmt.all(user.id);

  return {
    ...user,
    providers
  };
}

/**
 * Create a new user and link the initial OAuth provider
 */
export function createUser({ name, email, profileImage, provider, providerId }) {
  const userId = crypto.randomUUID();
  const now = new Date().toISOString();

  // Insert user
  const insertUserStmt = db.prepare(`
    INSERT INTO users (id, name, email, profile_image, created_at, updated_at, last_login)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  insertUserStmt.run(userId, name || 'User', email, profileImage || null, now, now, now);

  // Insert provider link
  const insertProviderStmt = db.prepare(`
    INSERT INTO user_providers (user_id, provider, provider_id, email, profile_image, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  insertProviderStmt.run(userId, provider, String(providerId), email, profileImage || null, now);

  return findUserById(userId);
}

/**
 * Link an additional OAuth provider to an existing user
 */
export function linkProviderToUser(userId, { provider, providerId, email, profileImage, name }) {
  const now = new Date().toISOString();

  // Check if provider link already exists
  const checkStmt = db.prepare(`
    SELECT * FROM user_providers WHERE provider = ? AND provider_id = ?
  `);
  const existingLink = checkStmt.get(provider, String(providerId));

  if (!existingLink) {
    const insertProviderStmt = db.prepare(`
      INSERT INTO user_providers (user_id, provider, provider_id, email, profile_image, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    insertProviderStmt.run(userId, provider, String(providerId), email, profileImage || null, now);
  }

  // Update profile image if user doesn't have one
  const user = findUserById(userId);
  if (user && !user.profile_image && profileImage) {
    const updateImgStmt = db.prepare(`UPDATE users SET profile_image = ?, updated_at = ? WHERE id = ?`);
    updateImgStmt.run(profileImage, now, userId);
  }

  // Update last login
  updateLastLogin(userId);

  return findUserById(userId);
}

/**
 * Update user last login timestamp
 */
export function updateLastLogin(userId) {
  const now = new Date().toISOString();
  const stmt = db.prepare(`UPDATE users SET last_login = ?, updated_at = ? WHERE id = ?`);
  stmt.run(now, now, userId);
}

/**
 * Unified OAuth find-or-create logic with safe Account Linking
 */
export function findOrCreateUserFromOAuth({ provider, providerId, email, name, profileImage }) {
  // 1. Check if user is already linked with this specific provider & provider ID
  const existingProviderUser = findUserByProvider(provider, providerId);
  if (existingProviderUser) {
    updateLastLogin(existingProviderUser.id);
    return existingProviderUser;
  }

  // 2. If email is provided, check if user exists with this email (Account Linking)
  if (email) {
    const existingEmailUser = findUserByEmail(email);
    if (existingEmailUser) {
      // Link this new provider to the existing account
      return linkProviderToUser(existingEmailUser.id, {
        provider,
        providerId,
        email,
        profileImage,
        name
      });
    }
  }

  // 3. Otherwise, create a brand new user
  // If provider didn't supply an email (rare), generate a placeholder provider email
  const userEmail = email || `${provider}_${providerId}@auth.local`;
  return createUser({
    name: name || 'User',
    email: userEmail,
    profileImage: profileImage || null,
    provider,
    providerId
  });
}
