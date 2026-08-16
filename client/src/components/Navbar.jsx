import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, LogOut, LayoutDashboard, UserCheck } from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="app-navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <div className="brand-icon-wrapper">
            <ShieldCheck className="brand-icon" size={24} />
          </div>
          <span className="brand-title">AuthSphere</span>
          <span className="brand-badge">OAuth 2.0</span>
        </Link>

        <nav className="navbar-nav">
          {isAuthenticated && user ? (
            <div className="navbar-user-section">
              <Link to="/dashboard" className="nav-link">
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </Link>
              <div className="user-pill">
                {user.profile_image ? (
                  <img
                    src={user.profile_image}
                    alt={user.name}
                    className="user-avatar"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="user-avatar-placeholder">
                    <UserCheck size={16} />
                  </div>
                )}
                <span className="user-name">{user.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="btn-logout"
                title="Log out of session"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="navbar-actions">
              <Link to="/login" className="btn-nav-login">
                Sign In
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
