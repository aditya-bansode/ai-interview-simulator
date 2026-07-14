import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Activity, 
  Trash2, 
  ShieldAlert, 
  CheckCircle, 
  Loader2, 
  AlertCircle, 
  FileText,
  Clock,
  Award
} from 'lucide-react';
import api from '../../services/api';

interface AdminUser {
  id: string;
  email: string;
  full_name: string | null;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
}

interface ActiveSession {
  user_email: string;
  role: string;
  experience_level: string;
  started_at: string;
}

interface RecentReport {
  id: string;
  user: string;
  role: string;
  score: number;
  date: string;
}

interface DashboardStats {
  total_users: number;
  total_interviews: number;
  average_score: number;
  active_sessions: ActiveSession[];
  recent_reports: RecentReport[];
}

export const AdminPanel: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  const fetchAdminData = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const [statsRes, usersRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/users')
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.detail || "Failed to load administration workspace data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleDeleteUser = async (userId: string, email: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete user account: ${email}? This will cascade delete their associated resume and mock evaluations.`)) {
      return;
    }

    setDeletingUserId(userId);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await api.delete(`/admin/users/${userId}`);
      setSuccessMsg(`Successfully deleted account: ${email}`);
      // Refresh user lists
      setUsers(prev => prev.filter(u => u.id !== userId));
      if (stats) {
        setStats({
          ...stats,
          total_users: stats.total_users - 1
        });
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.detail || "Failed to delete user account.");
    } finally {
      setDeletingUserId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
        <Loader2 className="animate-spin text-accent-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12" style={{ animation: 'fadeIn 0.4s ease' }}>
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-text-primary tracking-tight">Admin Console Workspace</h2>
          <p className="text-sm text-text-secondary mt-1">Monitor system metrics, active sessions, and manage user accounts.</p>
        </div>
        <button 
          onClick={fetchAdminData}
          className="bg-bg-card border border-border-main hover:bg-bg-sec text-text-secondary hover:text-text-primary font-semibold px-4 py-2 rounded-xl text-xs transition-colors cursor-pointer"
        >
          Refresh Feed
        </button>
      </div>

      {errorMsg && (
        <div className="alert alert-error max-w-4xl">
          <AlertCircle size={16} className="flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="alert alert-success max-w-4xl">
          <CheckCircle size={16} className="flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Global Stat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Total Users */}
        <div className="bg-bg-card border border-border-main rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-accent-primary/10 border border-accent-primary/20 text-accent-primary">
            <Users size={22} />
          </div>
          <div>
            <p className="text-[10px] text-text-secondary uppercase tracking-wider font-bold">Total Registered Users</p>
            <h4 className="text-2xl font-extrabold text-text-primary mt-1">{stats?.total_users || 0}</h4>
          </div>
        </div>

        {/* Total Interviews Statistics */}
        <div className="bg-bg-card border border-border-main rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-accent-success/10 border border-accent-success/20 text-accent-success">
            <Activity size={22} />
          </div>
          <div>
            <p className="text-[10px] text-text-secondary uppercase tracking-wider font-bold">Total Assessments Conducted</p>
            <h4 className="text-2xl font-extrabold text-text-primary mt-1">{stats?.total_interviews || 0}</h4>
          </div>
        </div>

        {/* Global Average Score */}
        <div className="bg-bg-card border border-border-main rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-accent-warning/10 border border-accent-warning/20 text-accent-warning">
            <Award size={22} />
          </div>
          <div>
            <p className="text-[10px] text-text-secondary uppercase tracking-wider font-bold">Global Performance Mean</p>
            <h4 className="text-2xl font-extrabold text-text-primary mt-1">{stats?.average_score || 0}%</h4>
          </div>
        </div>
      </div>

      {/* Grid: Active Sessions & Reports List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Active Mock Sessions */}
        <div className="bg-bg-card border border-border-main rounded-xl p-6 space-y-4">
          <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5 border-b border-border-main/50 pb-2">
            <Clock className="text-accent-primary" size={14} />
            <span>Active Proctoring Sessions ({stats?.active_sessions.length || 0})</span>
          </h3>

          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {stats?.active_sessions && stats.active_sessions.length > 0 ? (
              stats.active_sessions.map((sess, idx) => (
                <div key={idx} className="flex justify-between items-center bg-bg-sec/30 border border-border-main/50 rounded-xl p-3.5 text-xs">
                  <div>
                    <h5 className="font-bold text-text-primary leading-none mb-1">{sess.user_email}</h5>
                    <p className="text-[10px] text-text-secondary">{sess.role} ({sess.experience_level})</p>
                  </div>
                  <span className="text-[9px] font-bold text-accent-success bg-accent-success/10 border border-accent-success/20 px-2 py-0.5 rounded-full animate-pulse">
                    {sess.started_at}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-text-muted italic">No active interviews ongoing.</p>
            )}
          </div>
        </div>

        {/* Recent Assessment Reports */}
        <div className="bg-bg-card border border-border-main rounded-xl p-6 space-y-4">
          <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5 border-b border-border-main/50 pb-2">
            <FileText className="text-accent-primary" size={14} />
            <span>Recent Performance Reports</span>
          </h3>

          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {stats?.recent_reports && stats.recent_reports.length > 0 ? (
              stats.recent_reports.map((report, idx) => (
                <div key={idx} className="flex justify-between items-center bg-bg-sec/30 border border-border-main/50 rounded-xl p-3.5 text-xs">
                  <div>
                    <h5 className="font-bold text-text-primary leading-none mb-1">{report.user}</h5>
                    <p className="text-[10px] text-text-secondary">{report.role} • {report.date}</p>
                  </div>
                  <span className="font-extrabold text-accent-primary">
                    {report.score}%
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-text-muted italic">No reports generated yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* User Management & Delete Table */}
      <div className="bg-bg-card border border-border-main rounded-xl p-6 space-y-4">
        <div className="border-b border-border-main/50 pb-3 flex items-center justify-between">
          <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
            <ShieldAlert className="text-accent-error" size={14} />
            <span>Registered Simulator Accounts ({users.length})</span>
          </h3>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border-main/60 text-text-secondary font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Full Name</th>
                <th className="py-3 px-4">Email Address</th>
                <th className="py-3 px-4">Date Joined</th>
                <th className="py-3 px-4">Privileges</th>
                <th className="py-3 px-4 text-right">Delete Action</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((u) => (
                  <tr key={u.id} className="border-b border-border-main/30 hover:bg-bg-sec/20 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-text-primary">
                      {u.full_name || 'Candidate Account'}
                    </td>
                    <td className="py-3.5 px-4 text-text-secondary">
                      {u.email}
                    </td>
                    <td className="py-3.5 px-4 text-text-secondary">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4">
                      {u.is_admin ? (
                        <span className="text-[9px] font-bold text-accent-error bg-accent-error/10 border border-accent-error/20 px-2 py-0.5 rounded-full">
                          Administrator
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold text-accent-primary bg-accent-primary/10 border border-accent-primary/20 px-2 py-0.5 rounded-full">
                          Candidate
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {u.is_admin ? (
                        <span className="text-[10px] text-text-muted italic">Protected</span>
                      ) : (
                        <button
                          onClick={() => handleDeleteUser(u.id, u.email)}
                          disabled={deletingUserId === u.id}
                          className="text-accent-error hover:text-accent-error/80 disabled:opacity-50 p-1.5 rounded hover:bg-accent-error/10 transition-all cursor-pointer inline-flex items-center"
                          title="Permanently Delete Candidate User"
                        >
                          {deletingUserId === u.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Trash2 size={14} />
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-text-muted italic">
                    No accounts registered in database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
