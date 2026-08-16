import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="not-found-wrapper">
      <div className="not-found-card">
        <ShieldAlert size={48} className="text-warning" />
        <h1>404 - Page Not Found</h1>
        <p>The page you are looking for does not exist or has moved.</p>
        <Link to="/" className="btn-primary">
          <ArrowLeft size={16} /> Return to Home
        </Link>
      </div>
    </div>
  );
}
