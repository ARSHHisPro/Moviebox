import React, { useState, useEffect } from 'react';
import { isAdmin, authenticateAdmin } from '../services/auth';
import { Shield, Lock, Users, Activity, Film, AlertTriangle, CheckCircle2, Key } from 'lucide-react';
import { toast } from '../services/toast';

interface AdminPageProps {
  onNavigate: (route: string) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onNavigate }) => {
  const [authenticated, setAuthenticated] = useState(isAdmin());
  const [passcode, setPasscode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [activeTab, setActiveTab] = useState<'users' | 'system' | 'moderation'>('users');

  const mockUsers = [
    { id: '1', name: 'Alex Rivers', email: 'alex@moviebox.io', role: 'admin', status: 'Active' },
    { id: '2', name: 'Sophia Chen', email: 'sophia@moviebox.io', role: 'vip', status: 'Active' },
    { id: '3', name: 'Marcus Vance', email: 'marcus@moviebox.io', role: 'user', status: 'Active' },
    { id: '4', name: 'David Miller', email: 'david@test.com', role: 'user', status: 'Suspended' },
  ];

  const [newPass, setNewPass] = useState('');
  const [isUpdatingPass, setIsUpdatingPass] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await authenticateAdmin(passcode);
    if (success) {
      setAuthenticated(true);
      toast.success('Admin authorization granted');
    } else {
      setErrorMsg('Invalid admin password. Default passcode: MMSW-BLUEBOX');
    }
  };

  const handleUpdateFirestorePass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPass.trim()) return;
    setIsUpdatingPass(true);
    try {
      const { updateAdminPasswordInFirestore } = await import('../services/firestoreSync');
      const ok = await updateAdminPasswordInFirestore(newPass.trim());
      if (ok) {
        toast.success(`Firestore admin password updated at /config/Admin panel!`);
        setNewPass('');
      } else {
        toast.error('Failed to update password in Firestore');
      }
    } catch (e) {
      toast.error('Error updating password in Firestore');
    } finally {
      setIsUpdatingPass(false);
    }
  };

  if (!authenticated) {
    return (
      <div className="max-w-md mx-auto my-20 px-4">
        <div className="glass-panel p-8 rounded-3xl border border-white/20 shadow-2xl text-center space-y-6 bg-black/80">
          <div className="w-16 h-16 rounded-3xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/20">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <h1 className="text-2xl font-black text-white">MovieBox Admin Console</h1>
            <p className="text-xs text-slate-400 mt-1">Please authenticate with security credentials</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                Passcode Gate
              </label>
              <div className="relative">
                <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  placeholder="Enter passcode (e.g. admin67)"
                  value={passcode}
                  onChange={(e) => {
                    setPasscode(e.target.value);
                    setErrorMsg('');
                  }}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl text-xs focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>
            </div>

            {errorMsg && <p className="text-xs text-rose-400 font-bold">{errorMsg}</p>}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-primary)] text-white font-bold text-xs shadow-lg shadow-[var(--color-primary-glow)] hover:brightness-110"
            >
              Unlock Admin Terminal
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-widest">
            <Shield className="w-4 h-4" /> Restricted Access
          </div>
          <h1 className="text-3xl font-black text-white mt-1">Admin Command Center</h1>
          <p className="text-xs text-slate-400 mt-0.5">Manage users, streaming servers, and server infrastructure</p>
        </div>

        <button
          onClick={() => {
            localStorage.removeItem('moviebox_admin_flag');
            setAuthenticated(false);
          }}
          className="px-4 py-2 rounded-xl bg-rose-500/20 text-rose-400 text-xs font-bold border border-rose-500/30"
        >
          Lock Console
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'users' ? 'bg-[var(--color-primary)] text-black' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" /> User Management
        </button>
        <button
          onClick={() => setActiveTab('system')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'system' ? 'bg-[var(--color-primary)] text-black' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Activity className="w-4 h-4" /> System Health
        </button>
      </div>

      {/* Content Body */}
      {activeTab === 'users' ? (
        <div className="glass-panel p-6 rounded-3xl border border-white/10 overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="border-b border-white/10 uppercase text-[10px] text-slate-400 font-bold">
              <tr>
                <th className="pb-3">User Name</th>
                <th className="pb-3">Email</th>
                <th className="pb-3">Role</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {mockUsers.map((u) => (
                <tr key={u.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3.5 font-bold text-white">{u.name}</td>
                  <td className="py-3.5 text-slate-400">{u.email}</td>
                  <td className="py-3.5 font-bold uppercase text-[var(--color-primary)]">{u.role}</td>
                  <td className="py-3.5">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                      {u.status}
                    </span>
                  </td>
                  <td className="py-3.5 text-right space-x-2">
                    <button className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold">
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-2">
              <div className="text-xs text-slate-400 font-bold">TMDB API Cache Status</div>
              <div className="text-2xl font-extrabold text-emerald-400">98.4% Hit Rate</div>
              <div className="text-[11px] text-slate-500">In-memory LRU Cache active</div>
            </div>
            <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-2">
              <div className="text-xs text-slate-400 font-bold">Streaming Mirror 1</div>
              <div className="text-2xl font-extrabold text-emerald-400">Online (24ms)</div>
              <div className="text-[11px] text-slate-500">vaplayer.ru active</div>
            </div>
            <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-2">
              <div className="text-xs text-slate-400 font-bold">Gemini AI Endpoint</div>
              <div className="text-2xl font-extrabold text-[var(--color-primary)]">Ready</div>
              <div className="text-[11px] text-slate-500">Connected & Fallback Active</div>
            </div>
          </div>

          {/* Firestore Admin Passcode Manager Card */}
          <div className="glass-panel p-6 rounded-3xl border border-rose-500/30 space-y-4 bg-black/60">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
              <Key className="w-4 h-4" /> Firestore Admin Password Manager
            </div>
            <p className="text-xs text-slate-400">
              The admin password is stored in Firestore at <code className="text-rose-300 font-mono">/config/Admin panel</code> in field <code className="text-rose-300 font-mono">"password"</code>.
            </p>

            <form onSubmit={handleUpdateFirestorePass} className="flex gap-3 max-w-md">
              <input
                type="password"
                placeholder="Enter new admin password"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 text-white text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-rose-500"
              />
              <button
                type="submit"
                disabled={!newPass.trim() || isUpdatingPass}
                className="px-4 py-2.5 bg-rose-500 text-white font-bold text-xs rounded-xl hover:bg-rose-600 disabled:opacity-50"
              >
                {isUpdatingPass ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
