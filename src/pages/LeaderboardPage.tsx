import React, { useState, useEffect } from 'react';
import { 
  Trophy, Award, Flame, Sparkles, Crown, ArrowLeft, 
  HelpCircle, RefreshCw, Star, CheckCircle, Zap, Shield, Play
} from 'lucide-react';
import { subscribeToLeaderboard, getLeaderboardTop, LeaderboardEntry } from '../services/firestoreSync';
import { auth } from '../services/auth';

interface LeaderboardPageProps {
  onNavigate: (route: string) => void;
  onOpenTrivia?: () => void;
}

export const LeaderboardPage: React.FC<LeaderboardPageProps> = ({ onNavigate, onOpenTrivia }) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'weekly' | 'daily'>('all');
  const currentUser = auth.getCurrentUser();

  useEffect(() => {
    setLoading(true);
    const unsub = subscribeToLeaderboard((list) => {
      setEntries(list);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    const list = await getLeaderboardTop();
    setEntries(list);
    setLoading(false);
  };

  const topThree = entries.slice(0, 3);
  const remaining = entries.slice(3);

  return (
    <div className="min-h-screen pb-20 pt-6 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Top Breadcrumb & Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('home')}
            className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all border border-white/10 cursor-pointer"
            title="Back to Catalog"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live Firestore Sync
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-slate-400 font-semibold">{entries.length} Cinephiles Ranked</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5 mt-1 tracking-tight">
              <Trophy className="w-7 h-7 text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.5)]" />
              Global Trivia Leaderboard
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all cursor-pointer flex-shrink-0"
            title="Refresh Leaderboard"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[var(--color-primary)]' : ''}`} />
          </button>

          {onOpenTrivia && (
            <button
              onClick={onOpenTrivia}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:brightness-110 text-black font-extrabold text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <Zap className="w-4 h-4 fill-black" />
              <span>Play Trivia & Climb</span>
            </button>
          )}
        </div>
      </div>

      {/* Hero Podium (Top 3) */}
      {topThree.length > 0 && (
        <div className="relative pt-8 pb-4">
          <div className="text-center mb-6">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--color-primary)]">
              Hall of Fame
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">Top Cinephile Champions</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 items-end max-w-4xl mx-auto">
            
            {/* 2nd Place */}
            {topThree[1] && (
              <div className="order-2 md:order-1 glass-panel p-5 rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-cyan-950/40 via-black/60 to-black text-center relative flex flex-col items-center shadow-xl hover:border-cyan-500/60 transition-all">
                <div className="w-8 h-8 rounded-full bg-cyan-400/20 text-cyan-300 border border-cyan-400/40 font-black text-xs flex items-center justify-center mb-3">
                  #2
                </div>
                <div className="relative mb-3">
                  <img
                    src={topThree[1].avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(topThree[1].username)}&background=00d2ff&color=fff`}
                    alt={topThree[1].username}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-cyan-400 shadow-lg shadow-cyan-400/20"
                  />
                  <div className="absolute -bottom-1 -right-1 p-1 rounded-lg bg-cyan-500 text-black">
                    <Award className="w-3.5 h-3.5" />
                  </div>
                </div>
                <h3 className="font-extrabold text-white text-base line-clamp-1">{topThree[1].username}</h3>
                <span className="text-[11px] font-bold text-cyan-300/80 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20 mt-1">
                  {topThree[1].rankTitle || 'Master Cinephile'}
                </span>
                <div className="mt-4 pt-3 border-t border-white/10 w-full flex items-center justify-around">
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Score</div>
                    <div className="text-base font-black text-white">{topThree[1].score.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Streak</div>
                    <div className="text-base font-black text-amber-400 flex items-center justify-center gap-0.5">
                      <Flame className="w-3.5 h-3.5 fill-amber-400" />
                      {topThree[1].streak || 1}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 1st Place (Crown) */}
            {topThree[0] && (
              <div className="order-1 md:order-2 glass-panel p-6 rounded-3xl border border-amber-400/50 bg-gradient-to-b from-amber-950/50 via-black/80 to-black text-center relative flex flex-col items-center shadow-2xl shadow-amber-500/10 hover:border-amber-400/80 transition-all md:-translate-y-4">
                <div className="absolute -top-5 w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-black flex items-center justify-center shadow-lg shadow-amber-500/30 animate-bounce">
                  <Crown className="w-6 h-6 fill-black" />
                </div>
                <div className="w-8 h-8 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 font-black text-xs flex items-center justify-center mb-3 mt-2">
                  #1
                </div>
                <div className="relative mb-3">
                  <img
                    src={topThree[0].avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(topThree[0].username)}&background=f59e0b&color=000`}
                    alt={topThree[0].username}
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-amber-400 shadow-xl shadow-amber-400/30"
                  />
                  <div className="absolute -bottom-1.5 -right-1.5 p-1.5 rounded-xl bg-amber-400 text-black">
                    <Sparkles className="w-4 h-4 fill-black" />
                  </div>
                </div>
                <h3 className="font-black text-white text-lg line-clamp-1">{topThree[0].username}</h3>
                <span className="text-xs font-black text-amber-300 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/30 mt-1">
                  {topThree[0].rankTitle || 'Grand Cinephile'}
                </span>
                <div className="mt-5 pt-3.5 border-t border-amber-400/20 w-full flex items-center justify-around">
                  <div>
                    <div className="text-[10px] text-amber-200/70 font-bold uppercase">Total Score</div>
                    <div className="text-lg font-black text-amber-300">{topThree[0].score.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-amber-200/70 font-bold uppercase">Streak</div>
                    <div className="text-lg font-black text-amber-400 flex items-center justify-center gap-1">
                      <Flame className="w-4 h-4 fill-amber-400" />
                      {topThree[0].streak || 1}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3rd Place */}
            {topThree[2] && (
              <div className="order-3 md:order-3 glass-panel p-5 rounded-3xl border border-amber-600/30 bg-gradient-to-b from-amber-950/20 via-black/60 to-black text-center relative flex flex-col items-center shadow-xl hover:border-amber-600/60 transition-all">
                <div className="w-8 h-8 rounded-full bg-amber-700/20 text-amber-400 border border-amber-700/40 font-black text-xs flex items-center justify-center mb-3">
                  #3
                </div>
                <div className="relative mb-3">
                  <img
                    src={topThree[2].avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(topThree[2].username)}&background=d97706&color=fff`}
                    alt={topThree[2].username}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-600 shadow-lg shadow-amber-600/20"
                  />
                  <div className="absolute -bottom-1 -right-1 p-1 rounded-lg bg-amber-600 text-white">
                    <Award className="w-3.5 h-3.5" />
                  </div>
                </div>
                <h3 className="font-extrabold text-white text-base line-clamp-1">{topThree[2].username}</h3>
                <span className="text-[11px] font-bold text-amber-400/80 bg-amber-600/10 px-2.5 py-0.5 rounded-full border border-amber-600/20 mt-1">
                  {topThree[2].rankTitle || 'Film Historian'}
                </span>
                <div className="mt-4 pt-3 border-t border-white/10 w-full flex items-center justify-around">
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Score</div>
                    <div className="text-base font-black text-white">{topThree[2].score.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Streak</div>
                    <div className="text-base font-black text-amber-400 flex items-center justify-center gap-0.5">
                      <Flame className="w-3.5 h-3.5 fill-amber-400" />
                      {topThree[2].streak || 1}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Table / Rankings List */}
      <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden shadow-2xl bg-black/60">
        <div className="p-4 sm:p-6 border-b border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-white text-base sm:text-lg flex items-center gap-2">
              <Star className="w-4 h-4 text-[var(--color-primary)]" />
              Global Rankings
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Rankings reflect real-time scores recorded in Firestore database.
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/5 border border-white/10 text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                filter === 'all' ? 'bg-[var(--color-primary)] text-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setFilter('weekly')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                filter === 'weekly' ? 'bg-[var(--color-primary)] text-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setFilter('daily')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                filter === 'daily' ? 'bg-[var(--color-primary)] text-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              Today
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[var(--color-primary)]" />
            <p className="text-xs font-medium">Connecting to Firestore leaderboard collection...</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <Trophy className="w-10 h-10 mx-auto text-slate-600" />
            <h4 className="text-white font-bold text-sm">No scores submitted yet</h4>
            <p className="text-xs">Be the first cinephile to play trivia and claim #1 on the leaderboard!</p>
            {onOpenTrivia && (
              <button
                onClick={onOpenTrivia}
                className="mt-2 px-4 py-2 rounded-xl bg-[var(--color-primary)] text-black font-bold text-xs"
              >
                Play Trivia Now
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {entries.map((entry, idx) => {
              const rank = idx + 1;
              const isCurrentUser = currentUser?.uid === entry.userId || currentUser?.username === entry.username;

              return (
                <div
                  key={entry.id || idx}
                  className={`p-4 sm:p-5 flex items-center justify-between gap-4 transition-colors ${
                    isCurrentUser ? 'bg-[var(--color-primary)]/10 border-l-4 border-l-[var(--color-primary)]' : 'hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs flex-shrink-0 ${
                      rank === 1 ? 'bg-amber-400 text-black shadow-md shadow-amber-400/30' :
                      rank === 2 ? 'bg-cyan-400 text-black shadow-md shadow-cyan-400/30' :
                      rank === 3 ? 'bg-amber-700 text-white' :
                      'bg-white/5 text-slate-400 border border-white/10'
                    }`}>
                      {rank}
                    </span>

                    <img
                      src={entry.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(entry.username)}&background=00d2ff&color=fff`}
                      alt={entry.username}
                      className="w-10 h-10 rounded-xl object-cover border border-white/10 flex-shrink-0"
                    />

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-white text-sm truncate">{entry.username}</span>
                        {isCurrentUser && (
                          <span className="px-1.5 py-0.2 rounded bg-[var(--color-primary)] text-black font-black text-[9px] uppercase">
                            You
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 font-semibold truncate flex items-center gap-2 mt-0.5">
                        <span className="text-[var(--color-primary)]">{entry.rankTitle || 'Film Enthusiast'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 flex-shrink-0">
                    <div className="hidden sm:flex items-center gap-1.5 text-xs text-amber-400 font-bold bg-amber-400/10 px-2.5 py-1 rounded-xl border border-amber-400/20">
                      <Flame className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{entry.streak || 1} Streak</span>
                    </div>

                    <div className="text-right">
                      <div className="text-sm sm:text-base font-black text-white">
                        {entry.score.toLocaleString()} <span className="text-[10px] text-[var(--color-primary)] font-bold">PTS</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
