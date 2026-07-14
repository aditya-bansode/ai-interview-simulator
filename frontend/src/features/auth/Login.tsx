import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AlertCircle, LogIn, Lock, Mail, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error(err);
      const detail = err.response?.data?.detail || 'Failed to sign in. Please verify your credentials.';
      setError(detail);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] w-full py-8">
      <motion.div 
        className="w-full max-w-md bg-bg-card border border-border-main rounded-2xl shadow-2xl overflow-hidden p-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent-primary/10 border border-accent-primary/20 text-accent-primary mb-4">
            <Sparkles size={24} />
          </div>
          <h2 className="text-2xl font-bold text-text-primary tracking-tight">Welcome back</h2>
          <p className="text-sm text-text-secondary mt-2">Sign in to your account to resume practicing</p>
        </div>

        {/* Error Notification */}
        {error && (
          <motion.div 
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-accent-error/10 border border-accent-error/20 text-xs text-red-400 mb-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <AlertCircle size={14} className="flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2" htmlFor="email">
              Email Address
            </label>
            <div className="relative flex items-center">
              <Mail size={16} className="text-text-secondary absolute left-3" />
              <input
                id="email"
                type="email"
                className="w-full bg-bg-main border border-border-main rounded-xl px-4 py-3 pl-10 text-sm text-text-primary outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-all placeholder:text-text-muted"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider" htmlFor="password">
                Password
              </label>
            </div>
            <div className="relative flex items-center">
              <Lock size={16} className="text-text-secondary absolute left-3" />
              <input
                id="password"
                type="password"
                className="w-full bg-bg-main border border-border-main rounded-xl px-4 py-3 pl-10 text-sm text-text-primary outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-all placeholder:text-text-muted"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-accent-primary hover:bg-accent-primary/90 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-accent-primary/25 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <LogIn size={16} />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-text-secondary">
          Don't have an account yet?{' '}
          <Link to="/register" className="text-accent-primary font-semibold hover:underline">
            Sign up for free
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
