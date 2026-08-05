import React, { useState, useEffect } from 'react';
import { Film, Crown, Instagram, Sparkles, Lock } from 'lucide-react';
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
        
        {/* Background Glow Effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-gradient-to-r from-purple-600/10 via-[#00d2ff]/15 to-pink-600/10 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          
          {/* PROMINENT OWNER CREDITS BADGE */}
          <div 
            id="owner-footer-badge"
            className={`my-6 p-6 rounded-3xl border transition-all duration-500 flex flex-col sm:flex-row items-center justify-between gap-6 ${
              isHighlighted 
                ? 'bg-gradient-to-r from-purple-900/60 via-black to-cyan-900/60 border-[#00d2ff] ring-4 ring-[#00d2ff]/50 scale-[1.02] shadow-[0_0_40px_rgba(0,210,255,0.4)]' 
                : 'bg-white/5 border-white/10 hover:border-[#00d2ff]/40'
            }`}
          >
            {/* Left: Crown + Made by Arshh */}
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="relative flex flex-col items-center justify-center">
                {/* Jumping Crown Above */}
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

            {/* Right: Instagram Button */}
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

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 my-10">
            
            {/* Column 1: Brand */}
            <div className="space-y-4">
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
            </div>

            {/* Column 2: Browse */}
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
              </ul>
            </div>

            {/* Column 3: Personal */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Your Library</h4>
              <ul className="space-y-2 text-xs text-slate-400">
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

            {/* Column 4: Platform Status */}
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
                  <span className="text-slate-400">Firebase Database</span>
                  <span className="text-[#00d2ff] font-bold">Firestore Sync</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div>© {new Date().getFullYear()} MovieBox. Personal Streaming Project by Arshh.</div>
            <div className="flex items-center gap-6">
              <a href="https://www.instagram.com/arshhispro_/" target="_blank" rel="noopener noreferrer" className="hover:text-[#00d2ff] flex items-center gap-1">
                <Instagram className="w-3.5 h-3.5 text-pink-400" /> Instagram
              </a>
            </div>
          </div>

          {/* VERY LAST ITEM AT THE BOTTOM OF THE PAGE: HIDDEN SECRET ADMIN LINK */}
          <div className="mt-8 pt-4 border-t border-white/5 flex justify-center items-center">
            <button
              onClick={() => setShowAdminModal(true)}
              className="opacity-0 hover:opacity-100 transition-opacity duration-300 text-[10px] text-slate-500 hover:text-[#00d2ff] font-mono flex items-center gap-1.5 cursor-pointer py-1 px-3 rounded-full hover:bg-white/5 border border-transparent hover:border-white/10"
              title="Owner Secret Admin Key"
            >
              <Lock className="w-3 h-3 text-[#00d2ff]" />
              <span>[ Owner Secret Admin & Movie Lock Manager ]</span>
            </button>
          </div>

        </div>
      </footer>

      {/* Secret Owner Admin Lock Manager Modal */}
      <OwnerLockManagerModal isOpen={showAdminModal} onClose={() => setShowAdminModal(false)} />
    </>
  );
};
