import React, { useState } from 'react';
import { auth, signOut } from '../services/auth';
import { UserProfile } from '../types';
import { favoritesStore, watchHistoryStore, continueWatchingStore } from '../services/store';
import { User, Crown, Shield, Film, Heart, Clock, LogOut, CheckCircle2, Lock } from 'lucide-react';
import { toast } from '../services/toast';
import { UserAvatar } from '../components/UserAvatar';
import { OwnerLockManagerModal } from '../components/OwnerLockManagerModal';

interface ProfilePageProps {
  onNavigate: (route: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate }) => {
  const user: UserProfile | null = auth.getCurrentUser();
  const [favoriteCount] = useState(favoritesStore.getItems().length);
  const [historyCount] = useState(watchHistoryStore.getItems().length);
  const [continueCount] = useState(continueWatchingStore.getItems().length);
  const [showLockModal, setShowLockModal] = useState(false);

  const handleSignOut = () => {
    signOut();
    toast.info('Signed out of MovieBox Premium');
    onNavigate('home');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Profile Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6 bg-gradient-to-r from-purple-900/20 via-black/40 to-[var(--color-primary)]/10">
        <div className="flex items-center gap-5">
          <UserAvatar username={user?.username || user?.displayName || 'User'} avatarUrl={user?.avatar} size="lg" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white">{user?.displayName || user?.username}</h1>
              {user?.isVIP && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-extrabold text-[10px] border border-amber-500/40 flex items-center gap-1">
                  <Crown className="w-3 h-3 fill-current" /> VIP Pass
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>
            <span className="inline-block mt-2 text-[10px] uppercase tracking-wider text-[var(--color-primary)] font-bold">
              Account Sync: Firestore Connected
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {auth.isCurrentAdmin() && (
            <button
              onClick={() => setShowLockModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-[#00d2ff]/10 hover:bg-[#00d2ff]/20 text-[#00d2ff] font-bold text-xs border border-[#00d2ff]/30 transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-[#00d2ff]/10"
            >
              <Lock className="w-4 h-4" /> Owner Movie Locks
            </button>
          )}

          <button
            onClick={handleSignOut}
            className="px-5 py-2.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold text-xs border border-rose-500/30 transition-all flex items-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>

      {/* User Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => onNavigate('favorites')}
          className="glass-panel p-6 rounded-2xl border border-white/10 cursor-pointer hover:border-[var(--color-primary)] transition-all space-y-2 group"
        >
          <Heart className="w-6 h-6 text-rose-400 group-hover:scale-110 transition-transform" />
          <div className="text-2xl font-black text-white">{favoriteCount}</div>
          <div className="text-xs text-slate-400">Saved Favorites & Watchlist</div>
        </div>

        <div
          onClick={() => onNavigate('history')}
          className="glass-panel p-6 rounded-2xl border border-white/10 cursor-pointer hover:border-[var(--color-primary)] transition-all space-y-2 group"
        >
          <Clock className="w-6 h-6 text-[var(--color-primary)] group-hover:scale-110 transition-transform" />
          <div className="text-2xl font-black text-white">{historyCount}</div>
          <div className="text-xs text-slate-400">Streamed Titles in History</div>
        </div>

        <div
          onClick={() => onNavigate('continue-watching')}
          className="glass-panel p-6 rounded-2xl border border-white/10 cursor-pointer hover:border-[var(--color-primary)] transition-all space-y-2 group"
        >
          <Film className="w-6 h-6 text-purple-400 group-hover:scale-110 transition-transform" />
          <div className="text-2xl font-black text-white">{continueCount}</div>
          <div className="text-xs text-slate-400">In-Progress Title Streams</div>
        </div>
      </div>

      {/* Account Settings Shortcut Card */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-[var(--color-primary)]" /> Subscription & Security Status
        </h3>

        <div className="space-y-3 text-xs text-slate-300">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
            <span>Membership Tier</span>
            <span className="font-bold text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> MovieBox Ultra 4K (Unlimited)
            </span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
            <span>Simultaneous Devices</span>
            <span className="font-bold text-white">4 Screens Active</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
            <span>Audio Format</span>
            <span className="font-bold text-white">Dolby Atmos & Spatial Audio</span>
          </div>
        </div>
      </div>

      {/* Owner Lock Manager Modal */}
      <OwnerLockManagerModal isOpen={showLockModal} onClose={() => setShowLockModal(false)} />
    </div>
  );
};

