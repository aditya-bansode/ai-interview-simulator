import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { useForm } from 'react-hook-form';
import { AlertCircle, CheckCircle, Save, Key, User as UserIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProfileFormData {
  fullName: string;
}

interface PasswordFormData {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // React Hook Form for Profile Info
  const { register: registerProfile, handleSubmit: handleSubmitProfile, formState: { errors: profileErrors } } = useForm<ProfileFormData>({
    defaultValues: {
      fullName: user?.full_name || ''
    }
  });

  // React Hook Form for Password Change
  const { register: registerPassword, handleSubmit: handleSubmitPassword, reset: resetPasswordForm, formState: { errors: passwordErrors }, watch } = useForm<PasswordFormData>();

  const newPasswordWatch = watch('newPassword');

  const onUpdateProfile = async (data: ProfileFormData) => {
    setProfileError(null);
    setProfileSuccess(null);
    setIsUpdatingProfile(true);

    try {
      const response = await api.put('/users/me', { full_name: data.fullName });
      updateUser(response.data);
      setProfileSuccess('Profile updated successfully.');
    } catch (err: any) {
      console.error(err);
      const detail = err.response?.data?.detail || 'Failed to update profile settings.';
      setProfileError(detail);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const onUpdatePassword = async (data: PasswordFormData) => {
    setPasswordError(null);
    setPasswordSuccess(null);
    setIsUpdatingPassword(true);

    try {
      await api.put('/users/me', {
        current_password: data.currentPassword,
        new_password: data.newPassword
      });
      setPasswordSuccess('Password updated successfully.');
      resetPasswordForm();
    } catch (err: any) {
      console.error(err);
      const detail = err.response?.data?.detail || 'Failed to update password. Please check your current password.';
      setPasswordError(detail);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-8" style={{ animation: 'fadeIn 0.5s ease' }}>
      <div>
        <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">Profile Settings</h1>
        <p className="text-text-secondary text-sm mt-1">Manage your identity details, email settings, and security passwords.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Profile Card */}
        <motion.div 
          className="bg-bg-card border border-border-main rounded-xl p-6 shadow-xl flex flex-col justify-between"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div>
            <h2 className="text-base font-bold text-text-primary flex items-center gap-2 mb-6 border-b border-border-main/50 pb-3">
              <UserIcon size={18} className="text-accent-primary" />
              <span>Identity Profile</span>
            </h2>

            {profileSuccess && (
              <div className="alert alert-success">
                <CheckCircle size={14} className="flex-shrink-0" />
                <span>{profileSuccess}</span>
              </div>
            )}

            {profileError && (
              <div className="alert alert-error">
                <AlertCircle size={14} className="flex-shrink-0" />
                <span>{profileError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitProfile(onUpdateProfile)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                  Email Address (Verified)
                </label>
                <input
                  type="text"
                  className="w-full bg-bg-main border border-border-main/60 rounded-xl px-4 py-3 text-xs text-text-muted cursor-not-allowed opacity-50"
                  value={user?.email || ''}
                  disabled
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2" htmlFor="fullName">
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  className={`w-full bg-bg-main border rounded-xl px-4 py-3 text-xs text-text-primary outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-all ${
                    profileErrors.fullName ? 'border-accent-error' : 'border-border-main'
                  }`}
                  placeholder="John Doe"
                  {...registerProfile('fullName', { required: 'Full name is required.' })}
                />
                {profileErrors.fullName && (
                  <p className="text-[10px] text-accent-error mt-1.5">{profileErrors.fullName.message}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-accent-primary hover:bg-accent-primary/90 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-accent-primary/25 transition-all text-xs disabled:opacity-50 mt-4"
                disabled={isUpdatingProfile}
              >
                {isUpdatingProfile ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Save size={14} />
                    <span>Save Profile Settings</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </motion.div>

        {/* Security / Password Card */}
        <motion.div 
          className="bg-bg-card border border-border-main rounded-xl p-6 shadow-xl flex flex-col justify-between"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div>
            <h2 className="text-base font-bold text-text-primary flex items-center gap-2 mb-6 border-b border-border-main/50 pb-3">
              <Key size={18} className="text-accent-secondary" />
              <span>Password & Security</span>
            </h2>

            {passwordSuccess && (
              <div className="alert alert-success">
                <CheckCircle size={14} className="flex-shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            {passwordError && (
              <div className="alert alert-error">
                <AlertCircle size={14} className="flex-shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitPassword(onUpdatePassword)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2" htmlFor="currentPassword">
                  Current Password
                </label>
                <input
                  id="currentPassword"
                  type="password"
                  className={`w-full bg-bg-main border rounded-xl px-4 py-3 text-xs text-text-primary outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-all ${
                    passwordErrors.currentPassword ? 'border-accent-error' : 'border-border-main'
                  }`}
                  placeholder="••••••••"
                  {...registerPassword('currentPassword', { required: 'Current password is required.' })}
                />
                {passwordErrors.currentPassword && (
                  <p className="text-[10px] text-accent-error mt-1.5">{passwordErrors.currentPassword.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2" htmlFor="newPassword">
                  New Password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  className={`w-full bg-bg-main border rounded-xl px-4 py-3 text-xs text-text-primary outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-all ${
                    passwordErrors.newPassword ? 'border-accent-error' : 'border-border-main'
                  }`}
                  placeholder="Min. 8 characters"
                  {...registerPassword('newPassword', { 
                    required: 'New password is required.',
                    minLength: { value: 8, message: 'Password must be at least 8 characters.' }
                  })}
                />
                {passwordErrors.newPassword && (
                  <p className="text-[10px] text-accent-error mt-1.5">{passwordErrors.newPassword.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2" htmlFor="confirmPassword">
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  className={`w-full bg-bg-main border rounded-xl px-4 py-3 text-xs text-text-primary outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-all ${
                    passwordErrors.confirmPassword ? 'border-accent-error' : 'border-border-main'
                  }`}
                  placeholder="••••••••"
                  {...registerPassword('confirmPassword', { 
                    required: 'Please confirm your password.',
                    validate: value => value === newPasswordWatch || 'Passwords do not match.'
                  })}
                />
                {passwordErrors.confirmPassword && (
                  <p className="text-[10px] text-accent-error mt-1.5">{passwordErrors.confirmPassword.message}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-bg-sec border border-border-main hover:bg-bg-sec/80 text-text-primary font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all text-xs disabled:opacity-50 mt-4"
                disabled={isUpdatingPassword}
              >
                {isUpdatingPassword ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Key size={14} />
                    <span>Update Password Credentials</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </motion.div>

      </div>
    </div>
  );
};
