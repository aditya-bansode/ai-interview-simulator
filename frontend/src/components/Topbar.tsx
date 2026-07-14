import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { Search, Bell, Shield, Sparkles } from 'lucide-react';

export const Topbar: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) return null;

  // Determine page title based on path
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/dashboard':
        return 'Dashboard';
      case '/chat':
        return 'AI Mock Workspace';
      case '/profile':
        return 'Profile Settings';
      case '/settings':
        return 'Configuration Settings';
      default:
        return 'Overview';
    }
  };

  return (
    <header className="bg-bg-main/80 backdrop-blur-md border-b border-border-main h-16 flex items-center justify-between px-6 sticky top-0 z-40">
      {/* Page Title & Context */}
      <div className="flex items-center gap-3">
        <h2 className="text-sm font-semibold text-text-primary tracking-wide">{getPageTitle()}</h2>
        <div className="h-4 w-[1px] bg-border-main hidden sm:block"></div>
        <span className="text-xs text-text-secondary hidden sm:flex items-center gap-1">
          <Shield size={12} className="text-accent-primary" />
          <span>Secured Session</span>
        </span>
      </div>

      {/* Global Actions */}
      <div className="flex items-center gap-4">
        {/* Search Input Placeholder */}
        <div className="relative hidden md:block">
          <Search size={14} className="text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search simulations, questions..." 
            className="bg-bg-sec border border-border-main text-xs rounded-lg pl-9 pr-4 py-2 w-64 focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-all text-text-primary"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button className="relative p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-card transition-colors">
            <Bell size={16} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-accent-primary rounded-full"></span>
          </button>

          <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-accent-primary/20 bg-accent-primary/10 text-[11px] font-semibold text-accent-primary hover:bg-accent-primary/20 transition-colors">
            <Sparkles size={12} />
            <span>Pro Active</span>
          </button>
        </div>
      </div>
    </header>
  );
};
