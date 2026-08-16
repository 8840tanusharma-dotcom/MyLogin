const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Common fetch wrapper with credentials included for session cookies
 */
async function fetchWithCredentials(url, options = {}) {
  const defaultOptions = {
    credentials: 'include', // Ensures session cookie (connect.sid) is sent
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, defaultOptions);
    const data = await response.json().catch(() => ({}));
    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    console.error(`API Fetch Error [${url}]:`, error);
    return { ok: false, status: 0, data: { error: 'Network error or server unreachable' } };
  }
}

/**
 * Fetch the currently authenticated user session
 */
export async function getAuthUser() {
  return fetchWithCredentials('/auth/me');
}

/**
 * Fetch status of configured OAuth providers
 */
export async function getProviderStatus() {
  return fetchWithCredentials('/auth/providers');
}

/**
 * Log out user from session
 */
export async function logoutUser() {
  return fetchWithCredentials('/auth/logout', { method: 'POST' });
}

/**
 * Fetch protected dashboard summary statistics
 */
export async function getDashboardSummary() {
  return fetchWithCredentials('/api/dashboard/summary');
}

/**
 * Trigger OAuth login by redirecting the browser to the backend OAuth URL
 */
export function redirectToOAuth(provider) {
  window.location.href = `${API_BASE_URL}/auth/${provider}`;
}

export { API_BASE_URL };
