import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  MessageSquare, 
  BarChart3,
  ShieldAlert,
  User, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

export const Sidebar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!isAuthenticated) return null;

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'AI Interview', path: '/chat', icon: MessageSquare },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    ...(user?.is_admin ? [{ name: 'Admin Console', path: '/admin', icon: ShieldAlert }] : []),
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <motion.aside 
      className="bg-bg-sec border-r border-border-main flex flex-col justify-between h-screen sticky top-0 transition-all duration-300 z-50"
      animate={{ width: isCollapsed ? 72 : 240 }}
    >
      {/* Brand & Logo */}
      <div>
        <div className="flex items-center justify-between p-4 h-16 border-b border-border-main">
          {!isCollapsed && (
            <motion.div 
              className="flex items-center gap-2 font-bold text-lg bg-gradient-to-r from-text-primary to-accent-primary bg-clip-text text-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Sparkles className="text-accent-primary" size={20} />
              <span>Interviewer AI</span>
            </motion.div>
          )}
          {isCollapsed && (
            <div className="mx-auto">
              <Sparkles className="text-accent-primary" size={20} />
            </div>
          )}
          
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-text-secondary hover:text-text-primary p-1 rounded-md hover:bg-bg-card transition-colors hidden md:block"
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link 
                key={item.name} 
                to={item.path}
                className={`flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-all group relative ${
                  isActive 
                    ? 'bg-bg-card text-accent-primary border-l-2 border-accent-primary' 
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-card/50'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-accent-primary' : 'text-text-secondary group-hover:text-text-primary'} />
                {!isCollapsed && (
                  <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {item.name}
                  </motion.span>
                )}
                
                {/* Tooltip for collapsed mode */}
                {isCollapsed && (
                  <div className="absolute left-16 bg-bg-card border border-border-main px-2 py-1 rounded text-xs text-text-primary opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                    {item.name}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile & Logout */}
      <div className="p-3 border-t border-border-main space-y-2">
        {!isCollapsed && (
          <div className="flex items-center gap-3 p-2 bg-bg-card/30 border border-border-main/50 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center font-semibold text-accent-primary text-xs uppercase">
              {user?.full_name?.charAt(0) || user?.email.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-text-primary truncate">{user?.full_name || 'User'}</p>
              <p className="text-[10px] text-text-secondary truncate">{user?.email}</p>
            </div>
          </div>
        )}

        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 p-3 rounded-lg text-sm font-medium text-accent-error hover:bg-accent-error/10 w-full group relative transition-colors"
        >
          <LogOut size={18} />
          {!isCollapsed && <span>Log Out</span>}
          {isCollapsed && (
            <div className="absolute left-16 bg-bg-card border border-border-main px-2 py-1 rounded text-xs text-accent-error opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
              Log Out
            </div>
          )}
        </button>
      </div>
    </motion.aside>
  );
};
