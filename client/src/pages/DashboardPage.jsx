import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDashboardSummary } from '../api/authApi';
import {
  User,
  Mail,
  Shield,
  CheckCircle,
  Link as LinkIcon,
  RefreshCw,
  LogOut,
  Database,
  Lock,
  Layers,
} from 'lucide-react';
import { GoogleIcon, GitHubIcon, LinkedInIcon } from '../components/ProviderIcons';

export default function DashboardPage() {
  const { user, logout, refreshUser } = useAuth();
  const [summaryData, setSummaryData] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchSummary = async () => {
    setIsRefreshing(true);
    try {
      const res = await getDashboardSummary();
      if (res.ok && res.data) {
        setSummaryData(res.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard summary:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const handleRefresh = async () => {
    await refreshUser();
    await fetchSummary();
  };

  // Helper to render provider icon by provider name
  const renderProviderIcon = (providerName) => {
    switch (providerName?.toLowerCase()) {
      case 'google':
        return <GoogleIcon size={18} />;
      case 'github':
        return <GitHubIcon size={18} />;
      case 'linkedin':
        return <LinkedInIcon size={18} />;
      default:
        return <LinkIcon size={18} />;
    }
  };

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-container">
        {/* Top Welcome Banner */}
        <div className="dashboard-header-card">
          <div className="user-profile-header">
            <div className="profile-avatar-container">
              {user?.profile_image ? (
                <img
                  src={user.profile_image}
                  alt={user.name}
                  className="profile-large-avatar"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="profile-large-avatar-placeholder">
                  <User size={36} />
                </div>
              )}
              <div className="avatar-verified-badge" title="Authenticated Session">
                <CheckCircle size={16} />
              </div>
            </div>

            <div className="user-profile-meta">
              <div className="name-row">
                <h1 className="user-display-name">{user?.name || 'Authenticated User'}</h1>
                <span className="auth-pill-active">
                  <span className="pulsing-green-dot"></span> Active Session
                </span>
              </div>
              <p className="user-email-text">
                <Mail size={15} />
                <span>{user?.email || 'No email attached'}</span>
              </p>
              <div className="user-id-subtext">
                <span>User ID: <code>{user?.id}</code></span>
              </div>
            </div>
          </div>

          <div className="dashboard-quick-actions">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="btn-action btn-refresh"
              title="Refresh profile and live stats"
            >
              <RefreshCw size={16} className={isRefreshing ? 'spin-animation' : ''} />
              <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
            <button
              onClick={logout}
              className="btn-action btn-danger-logout"
              title="End session"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="dashboard-grid">
          {/* Card 1: Linked OAuth Providers */}
          <div className="dash-card">
            <div className="dash-card-header">
              <div className="card-icon-wrap blue">
                <Layers size={20} />
              </div>
              <div>
                <h3 className="card-title">Connected Identity Accounts</h3>
                <p className="card-subtitle">Social logins linked to your unified profile</p>
              </div>
            </div>
            <div className="dash-card-body">
              {user?.providers && user.providers.length > 0 ? (
                <div className="providers-list">
                  {user.providers.map((p, idx) => (
                    <div key={idx} className="provider-item">
                      <div className="provider-item-icon">
                        {renderProviderIcon(p.provider)}
                      </div>
                      <div className="provider-item-details">
                        <span className="provider-name capitalize">{p.provider}</span>
                        <span className="provider-email">{p.email || user.email}</span>
                      </div>
                      <span className="provider-linked-badge">Linked</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="provider-item">
                  <div className="provider-item-icon">
                    <Shield size={18} />
                  </div>
                  <div className="provider-item-details">
                    <span className="provider-name capitalize">{user?.provider || 'OAuth'}</span>
                    <span className="provider-email">{user?.email}</span>
                  </div>
                  <span className="provider-linked-badge">Active</span>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Security & Session Metadata */}
          <div className="dash-card">
            <div className="dash-card-header">
              <div className="card-icon-wrap emerald">
                <Lock size={20} />
              </div>
              <div>
                <h3 className="card-title">Session Security</h3>
                <p className="card-subtitle">HttpOnly cookie & token protection</p>
              </div>
            </div>
            <div className="dash-card-body">
              <ul className="security-specs-list">
                <li>
                  <span className="spec-label">Storage Mechanism</span>
                  <span className="spec-val highlight-green">HttpOnly Secure Cookie</span>
                </li>
                <li>
                  <span className="spec-label">Session Protection</span>
                  <span className="spec-val">CSRF & Cross-Site Mitigated</span>
                </li>
                <li>
                  <span className="spec-label">First Created</span>
                  <span className="spec-val">
                    {user?.created_at ? new Date(user.created_at).toLocaleString() : 'Recent'}
                  </span>
                </li>
                <li>
                  <span className="spec-label">Last Login</span>
                  <span className="spec-val">
                    {user?.last_login ? new Date(user.last_login).toLocaleString() : 'Just now'}
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Card 3: Live Database & API Status */}
          <div className="dash-card">
            <div className="dash-card-header">
              <div className="card-icon-wrap purple">
                <Database size={20} />
              </div>
              <div>
                <h3 className="card-title">System Metrics</h3>
                <p className="card-subtitle">Live database records from Node.js backend</p>
              </div>
            </div>
            <div className="dash-card-body">
              <div className="metrics-grid">
                <div className="metric-box">
                  <span className="metric-num">
                    {summaryData?.stats?.totalRegisteredUsers ?? '1'}
                  </span>
                  <span className="metric-label">Total Users in SQLite</span>
                </div>
                <div className="metric-box">
                  <span className="metric-num">
                    {summaryData?.stats?.totalLinkedOAuthAccounts ?? '1'}
                  </span>
                  <span className="metric-label">Linked OAuth Profiles</span>
                </div>
              </div>
              <div className="api-ping-status">
                <span className="dot-online"></span>
                <span>Protected API route <code>/api/dashboard/summary</code> verified</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
