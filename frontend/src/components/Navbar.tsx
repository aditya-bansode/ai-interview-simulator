import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Terminal } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!isAuthenticated) return null;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="logo">
          <Terminal size={22} style={{ color: 'var(--primary)' }} />
          <span>AI Interviewer</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <ul className="nav-links">
            <li>
              <Link 
                to="/dashboard" 
                className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link 
                to="/profile" 
                className={`nav-item ${location.pathname === '/profile' ? 'active' : ''}`}
              >
                Profile
              </Link>
            </li>
          </ul>
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem', 
            borderLeft: '1px solid var(--border-color)', 
            paddingLeft: '1.5rem' 
          }}>
            <span className="user-badge">{user?.full_name || user?.email}</span>
            <button 
              onClick={handleLogout} 
              className="btn btn-secondary" 
              style={{ 
                width: '32px', 
                height: '32px', 
                padding: 0, 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}
              title="Logout"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
