import React, { useState, useEffect } from 'react';
import { Film, Crown, Instagram, Sparkles, Lock, User, Cookie, Shield, FileText } from 'lucide-react';
import { OwnerLockManagerModal } from './OwnerLockManagerModal';

interface FooterProps {
  onNavigate: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);

  useEffect(() => {
    const handleHighlight = () => {
      setIsHighlighted(true);
      setTimeout(() => setIsHighlighted(false), 4500);
    };

    const handleOpenSecretAdmin = () => {
      setShowAdminModal(true);
    };

    window.addEventListener('highlight-owner-footer', handleHighlight);
    window.addEventListener('open-secret-admin', handleOpenSecretAdmin);
    return () => {
      window.removeEventListener('highlight-owner-footer', handleHighlight);
      window.removeEventListener('open-secret-admin', handleOpenSecretAdmin);
    };
  }, []);

  return (
    <>
      <footer className="mt-20 border-t border-white/10 bg-black/80 backdrop-blur-2xl relative overflow-hidden">

        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-gradient-to-r from-purple-600/10 via-[#00d2ff]/15 to-pink-600/10 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

          <div 
            id="owner-footer-badge"
            className={`my-6 p-6 rounded-3xl border transition-all duration-500 flex flex-col sm:flex-row items-center justify-between gap-6 ${
              isHighlighted 
                ? 'bg-gradient-to-r from-purple-900/60 via-black to-cyan-900/60 border-[#00d2ff] ring-4 ring-[#00d2ff]/50 scale-[1.02] shadow-[0_0_40px_rgba(0,210,255,0.4)]' 
                : 'bg-white/5 border-white/10 hover:border-[#00d2ff]/40'
            }`}
          >
            
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="relative flex flex-col items-center justify-center">
                
                <Crown className="w-7 h-7 text-amber-400 animate-bounce drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]" />
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-[#00d2ff] p-0.5 mt-1 shadow-lg shadow-[#00d2ff]/30">
                  <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-[#00d2ff]" />
                  </div>
                </div>
              </div>

              <div>
                <div className="text-xs uppercase tracking-widest text-slate-400 font-bold">Website Creator</div>
                <div className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                  <span>Made by</span>
                  <span className="bg-gradient-to-r from-[#00d2ff] via-cyan-200 to-[#ec4899] bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(0,210,255,0.9)] animate-pulse">
                    Arshh
                  </span>
                </div>
              </div>
            </div>

            <a
              href="https://www.instagram.com/arshhispro_/"
              target="_blank"
              rel="noopener noreferrer"
              className="group px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-600 via-purple-600 to-[#00d2ff] p-0.5 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-pink-500/20 cursor-pointer"
            >
              <div className="px-5 py-2.5 rounded-[14px] bg-slate-950 flex items-center gap-3 text-white font-bold text-xs group-hover:bg-transparent transition-colors">
                <Instagram className="w-5 h-5 text-pink-400 group-hover:text-white transition-colors" />
                <span>Follow @arshhispro_</span>
              </div>
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8 my-10">

            <div className="space-y-4 sm:col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('home')}>
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-[#00d2ff] p-0.5 flex items-center justify-center">
                  <div className="w-full h-full bg-black rounded-[10px] flex items-center justify-center">
                    <Film className="w-4 h-4 text-[#00d2ff]" />
                  </div>
                </div>
                <span className="font-extrabold text-lg text-white">MovieBox Premium</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Personal high-definition streaming portal. Stream thousands of movies & TV series with zero ads.
              </p>
              <div className="text-[11px] text-slate-500 font-medium">
                Zero media files hosted • External embeds only
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Browse Content</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li>
                  <button onClick={() => onNavigate('movies')} className="hover:text-[#00d2ff] transition-colors">
                    Popular Movies
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('tv')} className="hover:text-[#00d2ff] transition-colors">
                    TV Series
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('trending')} className="hover:text-[#00d2ff] transition-colors">
                    Trending Now
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('leaderboard')} className="hover:text-[#00d2ff] transition-colors flex items-center gap-1 font-bold text-amber-400">
                    Leaderboard & Trivia
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Your Library</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li>
                  <button onClick={() => onNavigate('profile')} className="hover:text-[#00d2ff] transition-colors flex items-center gap-1.5 font-bold text-white/90">
                    <User className="w-3.5 h-3.5 text-[#00d2ff]" /> User Profile & Settings
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('favorites')} className="hover:text-[#00d2ff] transition-colors">
                    Favorites & Watchlist
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('continue-watching')} className="hover:text-[#00d2ff] transition-colors">
                    Continue Watching
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Legal & Privacy</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li>
                  <button onClick={() => onNavigate('terms')} className="hover:text-[#00d2ff] transition-colors flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#00d2ff]" />
                    <span>Terms of Service</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('privacy')} className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Privacy Policy</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('cookies')} className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                    <Cookie className="w-3.5 h-3.5 text-amber-400" />
                    <span>Cookie Policy</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => window.dispatchEvent(new Event('open-cookie-banner'))}
                    className="hover:text-amber-300 transition-colors flex items-center gap-1.5 text-amber-400/90 font-medium"
                  >
                    <span>Cookie Preferences</span>
                  </button>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-2">Platform Status</h4>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-300 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Streaming Engine</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> 7 Active HD Servers
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Main Data Stored</span>
                  <span className="text-emerald-400 font-bold">Nowhere (0%)</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Firebase Database</span>
                  <span className="text-[#00d2ff] font-bold">Firestore Sync</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
              <div>© {new Date().getFullYear()} MovieBox. Personal Streaming Project by Arshh.</div>
              <div className="hidden sm:inline text-slate-700">•</div>
              <div className="flex items-center gap-3 text-[11px]">
                <button onClick={() => onNavigate('terms')} className="hover:text-white transition-colors">Terms</button>
                <span>•</span>
                <button onClick={() => onNavigate('privacy')} className="hover:text-white transition-colors">Privacy</button>
                <span>•</span>
                <button onClick={() => onNavigate('cookies')} className="hover:text-white transition-colors">Cookies</button>
              </div>
            </div>
            <div className="flex items-center gap-4 sm:gap-6">
              <button
                onClick={() => onNavigate('profile')}
                className="px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider text-[#00d2ff] bg-[#00d2ff]/10 hover:bg-[#00d2ff]/20 border border-[#00d2ff]/50 shadow-[0_0_15px_rgba(0,210,255,0.4)] hover:shadow-[0_0_25px_rgba(0,210,255,0.8)] animate-pulse hover:animate-none transition-all flex items-center gap-2 cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-[#00d2ff]" />
                <span>My Profile</span>
              </button>
              <a href="https://www.instagram.com/arshhispro_/" target="_blank" rel="noopener noreferrer" className="hover:text-[#00d2ff] flex items-center gap-1">
                <Instagram className="w-3.5 h-3.5 text-pink-400" /> Instagram
              </a>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-white/5 flex justify-center items-center">
            <button
              onClick={() => onNavigate('admin')}
              className="text-[11px] text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1.5 cursor-pointer py-1.5 px-3.5 rounded-full bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-all mr-2"
              title="Open Admin Command Center & Announcements"
            >
              <Lock className="w-3.5 h-3.5 text-rose-400" />
              <span>Admin Panel & Announcements</span>
            </button>
            <button
              onClick={() => setShowAdminModal(true)}
              className="text-[11px] text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1.5 cursor-pointer py-1.5 px-3.5 rounded-full bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 transition-all"
              title="Owner Secret Movie Lock Manager"
            >
              <Lock className="w-3.5 h-3.5 text-[#00d2ff]" />
              <span>Movie Lock Manager</span>
            </button>
          </div>

        </div>
      </footer>

      <OwnerLockManagerModal isOpen={showAdminModal} onClose={() => setShowAdminModal(false)} onNavigate={onNavigate} />
    </>
  );
};
