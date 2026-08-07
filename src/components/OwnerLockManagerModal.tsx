import React, { useState, useEffect } from 'react';
import { Lock, Unlock, Sparkles, Clock, ShieldAlert, X, Search, CheckCircle, KeyRound, ShieldCheck } from 'lucide-react';
import { lockStore, LockedMovie } from '../services/lockStore';
import { auth } from '../services/auth';
import { tmdb } from '../services/tmdb';
import { toast } from '../services/toast';

interface OwnerLockManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OwnerLockManagerModal: React.FC<OwnerLockManagerModalProps> = ({ isOpen, onClose }) => {
  const [isAdmin, setIsAdmin] = useState(auth.isCurrentAdmin());
  const [passcode, setPasscode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const [locks, setLocks] = useState<Record<number, LockedMovie>>({});
  const [tmdbIdInput, setTmdbIdInput] = useState('');
  const [mediaType, setMediaType] = useState<'movie' | 'tv'>('movie');
  const [reason, setReason] = useState('Exclusive Owner Lock');
  const [durationMins, setDurationMins] = useState<number>(0); // 0 = indefinite
  const [isLocking, setIsLocking] = useState(false);

  // Quick TMDB search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    const unsubAuth = auth.subscribe(() => {
      setIsAdmin(auth.isCurrentAdmin());
    });
    const unsubLock = lockStore.subscribe((updatedLocks) => {
      setLocks(updatedLocks);
    });
    return () => {
      unsubAuth();
      unsubLock();
    };
  }, []);

  const handleVerifyPasscode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) return;

    setIsVerifying(true);
    try {
      const success = await auth.claimAdmin(passcode);
      if (success) {
        setIsAdmin(true);
        setPasscode('');
        toast.success('Welcome Owner! Secret Admin Unlocked.');
      } else {
        toast.error('Invalid passcode! Access denied.');
      }
    } catch (err) {
      toast.error('Verification error');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    try {
      const res = await tmdb.searchMulti(searchQuery, 1);
      setSearchResults(res.results.slice(0, 4));
    } catch (e) {
      toast.error('Failed searching TMDB catalog');
    }
  };

  const handleSelectSearchResult = (item: any) => {
    setTmdbIdInput(String(item.id));
    setMediaType(item.first_air_date ? 'tv' : 'movie');
    setSearchResults([]);
    setSearchQuery(item.title || item.name || '');
  };

  const handleApplyLock = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = parseInt(tmdbIdInput, 10);
    if (isNaN(id) || id <= 0) {
      toast.error('Please enter a valid numeric TMDB ID');
      return;
    }

    setIsLocking(true);
    try {
      await lockStore.lockMovie(id, mediaType, searchQuery || `TMDB ID #${id}`, durationMins, reason);
      setTmdbIdInput('');
      setSearchQuery('');
    } catch (err: any) {
      toast.error('Failed applying lock');
    } finally {
      setIsLocking(false);
    }
  };

  const handleUnlock = async (tmdbId: number) => {
    await lockStore.unlockMovie(tmdbId);
  };

  const handleTriggerTestConfetti = () => {
    lockStore.triggerConfetti();
    toast.success('Confetti test released!');
  };

  if (!isOpen) return null;

  const activeLocks = (Object.values(locks) as LockedMovie[]).filter((l) => l.isLocked);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-950 rounded-3xl border border-white/15 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-purple-900/40 via-slate-950 to-cyan-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 to-[#00d2ff] p-0.5 flex items-center justify-center shadow-lg shadow-[#00d2ff]/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Lock className="w-5 h-5 text-[#00d2ff]" />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                Owner Firestore Lock Manager
              </h2>
              <p className="text-xs text-white/50">Restricted Admin Panel for MovieBox</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <button
                onClick={handleTriggerTestConfetti}
                className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                title="Test Confetti Burst"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Confetti Test
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
          
          {/* IF NOT ADMIN: SHOW PASSCODE PROMPT */}
          {!isAdmin ? (
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 text-center space-y-5 my-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-[#00d2ff] p-0.5 mx-auto flex items-center justify-center shadow-xl shadow-amber-500/20">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <KeyRound className="w-7 h-7 text-amber-400" />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-black text-white">Owner Passcode Required</h3>
                <p className="text-xs text-white/60 mt-1 max-w-sm mx-auto">
                  Enter the secret Firestore-backed owner password to access movie lock controls.
                </p>
              </div>

              <form onSubmit={handleVerifyPasscode} className="max-w-sm mx-auto space-y-3">
                <input
                  type="password"
                  required
                  placeholder="Enter passcode..."
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="w-full px-4 py-3 bg-black/60 border border-white/15 text-white rounded-xl text-center font-mono tracking-widest focus:outline-none focus:border-[#00d2ff]"
                />

                <button
                  type="submit"
                  disabled={isVerifying}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-[#00d2ff] text-white font-bold text-xs shadow-lg shadow-[#00d2ff]/20 hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4" />
                  {isVerifying ? 'Verifying Firestore Passcode...' : 'Unlock Owner Panel'}
                </button>
              </form>
            </div>
          ) : (
            /* IF ADMIN: SHOW FULL LOCK CONTROLS */
            <>
              {/* Lock Creator Form */}
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400" /> Lock New Content by TMDB ID
                </h3>

                {/* Quick Search Helper */}
                <form onSubmit={handleSearch} className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
                    <input
                      type="text"
                      placeholder="Search movie title to get TMDB ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-black/50 border border-white/10 text-white rounded-xl focus:outline-none focus:border-[#00d2ff]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-all cursor-pointer"
                  >
                    Find ID
                  </button>
                </form>

                {/* Search Results Dropdown */}
                {searchResults.length > 0 && (
                  <div className="space-y-1 bg-black/80 p-2 rounded-xl border border-white/10">
                    {searchResults.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleSelectSearchResult(item)}
                        className="p-2 rounded-lg hover:bg-white/10 cursor-pointer flex items-center justify-between text-white"
                      >
                        <span className="font-bold truncate">{item.title || item.name}</span>
                        <span className="text-[10px] bg-[#00d2ff]/20 text-[#00d2ff] px-2 py-0.5 rounded font-mono font-bold">
                          ID: {item.id}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <form onSubmit={handleApplyLock} className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="font-bold text-white/80 block mb-1">TMDB ID</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 101299"
                      value={tmdbIdInput}
                      onChange={(e) => setTmdbIdInput(e.target.value)}
                      className="w-full px-3 py-2 bg-black/50 border border-white/10 text-white rounded-xl focus:outline-none focus:border-[#00d2ff] font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-white/80 block mb-1">Media Type</label>
                    <select
                      value={mediaType}
                      onChange={(e) => setMediaType(e.target.value as any)}
                      className="w-full px-3 py-2 bg-black/50 border border-white/10 text-white rounded-xl focus:outline-none focus:border-[#00d2ff]"
                    >
                      <option value="movie" className="bg-slate-900">Movie</option>
                      <option value="tv" className="bg-slate-900">TV Show</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-white/80 block mb-1">Duration (Minutes)</label>
                    <select
                      value={durationMins}
                      onChange={(e) => setDurationMins(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-black/50 border border-white/10 text-white rounded-xl focus:outline-none focus:border-[#00d2ff]"
                    >
                      <option value={0} className="bg-slate-900">Indefinite (Until manually unlocked)</option>
                      <option value={5} className="bg-slate-900">5 Minutes (Quick Test)</option>
                      <option value={15} className="bg-slate-900">15 Minutes</option>
                      <option value={60} className="bg-slate-900">1 Hour</option>
                      <option value={1440} className="bg-slate-900">24 Hours</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-white/80 block mb-1">Lock Reason / Message</label>
                    <input
                      type="text"
                      placeholder="Reason for viewers..."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full px-3 py-2 bg-black/50 border border-white/10 text-white rounded-xl focus:outline-none focus:border-[#00d2ff]"
                    />
                  </div>

                  <div className="sm:col-span-2 pt-2">
                    <button
                      type="submit"
                      disabled={isLocking}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-[#00d2ff] text-white font-bold text-xs shadow-lg shadow-rose-500/20 hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Lock className="w-4 h-4" />
                      {isLocking ? 'Applying Lock...' : 'Lock Movie in Firestore'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Active Locks List */}
              <div className="space-y-3">
                <h3 className="font-bold text-white text-sm flex items-center justify-between">
                  <span>Active Firestore Locks ({activeLocks.length})</span>
                </h3>

                {activeLocks.length === 0 ? (
                  <div className="p-6 text-center rounded-2xl bg-white/5 border border-white/5 text-white/50">
                    <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-60" />
                    No active locks. All catalog items are unlocked!
                  </div>
                ) : (
                  <div className="space-y-2">
                    {activeLocks.map((item) => (
                      <div
                        key={item.tmdbId}
                        className="p-3.5 rounded-2xl bg-rose-950/20 border border-rose-500/30 flex items-center justify-between gap-4"
                      >
                        <div className="space-y-0.5">
                          <div className="font-bold text-white text-xs flex items-center gap-2">
                            <span className="text-rose-400">[LOCKED] {item.title || 'TMDB ID #' + item.tmdbId}</span>
                            <span className="px-1.5 py-0.2 rounded bg-white/10 text-[10px] text-white/60 font-mono">
                              ID: {item.tmdbId}
                            </span>
                          </div>
                          <p className="text-[11px] text-rose-200/70">{item.reason}</p>
                          {item.lockedUntil && (
                            <div className="text-[10px] text-amber-400 font-semibold flex items-center gap-1">
                              <Clock className="w-3 h-3" /> Auto-unlocks in {Math.max(1, Math.round((item.lockedUntil - Date.now()) / 60000))} mins
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => handleUnlock(item.tmdbId)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <Unlock className="w-3.5 h-3.5" /> Unlock & Confetti
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

        </div>

      </div>
    </div>
  );
};
