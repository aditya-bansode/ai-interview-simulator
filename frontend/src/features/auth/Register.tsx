import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AlertCircle, UserPlus, Lock, Mail, User as UserIcon, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email || !password || !fullName) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register(email, password, fullName);
      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      console.error(err);
      const detail = err.response?.data?.detail || 'Failed to register account. Email may already be in use.';
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
          <h2 className="text-2xl font-bold text-text-primary tracking-tight">Create an account</h2>
          <p className="text-sm text-text-secondary mt-2">Get started with AI-driven interview feedback</p>
        </div>

        {/* Error / Success Notifications */}
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

        {success && (
          <motion.div 
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-accent-success/10 border border-accent-success/20 text-xs text-green-400 mb-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <AlertCircle size={14} className="flex-shrink-0" />
            <span>{success}</span>
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2" htmlFor="fullName">
              Full Name
            </label>
            <div className="relative flex items-center">
              <UserIcon size={16} className="text-text-secondary absolute left-3" />
              <input
                id="fullName"
                type="text"
                className="w-full bg-bg-main border border-border-main rounded-xl px-4 py-3 pl-10 text-sm text-text-primary outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-all placeholder:text-text-muted"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          </div>

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
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2" htmlFor="password">
              Password
            </label>
            <div className="relative flex items-center">
              <Lock size={16} className="text-text-secondary absolute left-3" />
              <input
                id="password"
                type="password"
                className="w-full bg-bg-main border border-border-main rounded-xl px-4 py-3 pl-10 text-sm text-text-primary outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-all placeholder:text-text-muted"
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <div className="relative flex items-center">
              <Lock size={16} className="text-text-secondary absolute left-3" />
              <input
                id="confirmPassword"
                type="password"
                className="w-full bg-bg-main border border-border-main rounded-xl px-4 py-3 pl-10 text-sm text-text-primary outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-all placeholder:text-text-muted"
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-accent-primary hover:bg-accent-primary/90 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-accent-primary/25 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <UserPlus size={16} />
                <span>Create Account</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-text-secondary">
          Already have an account?{' '}
          <Link to="/login" className="text-accent-primary font-semibold hover:underline">
            Sign in
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
