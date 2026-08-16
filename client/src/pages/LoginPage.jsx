import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleIcon, GitHubIcon, LinkedInIcon } from '../components/ProviderIcons';
import { ShieldCheck, AlertCircle, Lock, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const { user, isAuthenticated, login } = useAuth();
  const [activeProvider, setActiveProvider] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      const origin = location.state?.from?.pathname || '/dashboard';
      navigate(origin, { replace: true });
    }
  }, [isAuthenticated, user, navigate, location]);

  // Read error parameters from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const errorParam = params.get('error');
    if (errorParam) {
      setErrorMessage(decodeURIComponent(errorParam));
    }
  }, [location.search]);

  const handleOAuthClick = (provider) => {
    setActiveProvider(provider);
    setErrorMessage(null);
    login(provider);
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-container">
        <div className="login-card">
          {/* Header */}
          <div className="login-header">
            <div className="login-badge-wrapper">
              <div className="shield-icon-bg">
                <ShieldCheck size={26} className="shield-icon" />
              </div>
              <span className="security-tag">Production OAuth 2.0</span>
            </div>
            <h1 className="login-title">Welcome back</h1>
            <p className="login-subtitle">
              Sign in with your preferred social account to access your secure dashboard.
            </p>
          </div>

          {/* Error Message Box */}
          {errorMessage && (
            <div className="alert-box alert-error" role="alert">
              <AlertCircle size={20} className="alert-icon" />
              <div className="alert-content">
                <p className="alert-title">Authentication Error</p>
                <p className="alert-desc">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Social OAuth Buttons */}
          <div className="oauth-button-stack">
            {/* Google */}
            <button
              id="btn-login-google"
              onClick={() => handleOAuthClick('google')}
              disabled={Boolean(activeProvider)}
              className="btn-oauth btn-google"
            >
              <span className="oauth-icon-wrapper">
                <GoogleIcon size={20} />
              </span>
              <span className="oauth-text">
                {activeProvider === 'google' ? 'Connecting to Google...' : 'Continue with Google'}
              </span>
              <ArrowRight size={16} className="oauth-arrow" />
            </button>

            {/* GitHub */}
            <button
              id="btn-login-github"
              onClick={() => handleOAuthClick('github')}
              disabled={Boolean(activeProvider)}
              className="btn-oauth btn-github"
            >
              <span className="oauth-icon-wrapper">
                <GitHubIcon size={20} />
              </span>
              <span className="oauth-text">
                {activeProvider === 'github' ? 'Connecting to GitHub...' : 'Continue with GitHub'}
              </span>
              <ArrowRight size={16} className="oauth-arrow" />
            </button>

            {/* LinkedIn */}
            <button
              id="btn-login-linkedin"
              onClick={() => handleOAuthClick('linkedin')}
              disabled={Boolean(activeProvider)}
              className="btn-oauth btn-linkedin"
            >
              <span className="oauth-icon-wrapper">
                <LinkedInIcon size={20} />
              </span>
              <span className="oauth-text">
                {activeProvider === 'linkedin' ? 'Connecting to LinkedIn...' : 'Continue with LinkedIn'}
              </span>
              <ArrowRight size={16} className="oauth-arrow" />
            </button>
          </div>

          {/* Security Notice */}
          <div className="login-footer">
            <div className="security-notice">
              <Lock size={14} />
              <span>Protected by OAuth 2.0 & HttpOnly encrypted session cookies.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
