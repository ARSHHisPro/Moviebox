import React, { useState, useEffect, useRef } from 'react';
import { Search, Film, Tv, Heart, History, Flame, Sparkles, User, Settings, Menu, X, PlayCircle, Layers, SlidersHorizontal, LogIn, Users, Shuffle, Trophy, Shield } from 'lucide-react';
import { auth } from '../services/auth';
import { UserProfile } from '../types';
import { tmdb } from '../services/tmdb';
import { MediaItem } from '../types';
import { UserAvatar } from './UserAvatar';

interface NavbarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  onOpenAiConcierge: () => void;
  onOpenWatchParty?: () => void;
  onOpenTrivia?: () => void;
  onOpenRoulette?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRoute,
  onNavigate,
  onOpenAiConcierge,
  onOpenWatchParty,
  onOpenTrivia,
  onOpenRoulette
}) => {
  const [user, setUser] = useState<UserProfile | null>(auth.getCurrentUser());
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<MediaItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return auth.subscribe((u) => setUser(u));
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await tmdb.searchMulti(searchQuery, 1);
        setSuggestions((res.results || []).slice(0, 6));
        setShowSuggestions(true);
      } catch (err) {
        
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate(`search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSuggestions(false);
    }
  };

  const navLinks = [
    { route: 'home', label: 'Home', icon: Film },
    { route: 'movies', label: 'Movies', icon: Film },
    { route: 'tv', label: 'TV Shows', icon: Tv },
    { route: 'trending', label: 'Trending', icon: Flame },
    { route: 'genres', label: 'Genres', icon: Layers },
    { route: 'top-rated', label: 'Top Rated', icon: SlidersHorizontal },
    { route: 'favorites', label: 'Favorites', icon: Heart },
    { route: 'continue-watching', label: 'Continue Watching', icon: PlayCircle },
    { route: 'history', label: 'History', icon: History },
  ];

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-white/5 bg-black/40 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">

        <div className="flex items-center gap-2 cursor-pointer flex-shrink-0" onClick={() => onNavigate('home')}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00d2ff] to-[#7b2cbf] flex items-center justify-center shadow-md shadow-[#00d2ff]/20">
            <PlayCircle className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg sm:text-xl font-bold tracking-tight uppercase text-white">
            MovieBox<span className="text-[#00d2ff]">+</span>
          </span>
        </div>

        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.slice(0, 6).map((link) => {
            const isActive = currentRoute === link.route || currentRoute.startsWith(link.route);
            return (
              <button
                key={link.route}
                onClick={() => onNavigate(link.route)}
                className={`px-2.5 py-1.5 rounded-xl text-[11px] xl:text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-white/10 text-[#00d2ff] border border-[#00d2ff]/30 shadow-sm'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <link.icon className="w-3.5 h-3.5" />
                {link.label}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3 flex-1 justify-end min-w-0">

          <div ref={searchRef} className="relative flex-1 max-w-[160px] sm:max-w-[220px] md:max-w-[260px] xl:max-w-[300px] min-w-[110px]">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
              <input
                type="text"
                placeholder="Search movies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-9 pr-3 text-xs font-medium text-white placeholder-white/40 focus:outline-none focus:border-[#00d2ff]/50 transition-all truncate"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
              )}
            </form>

            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 glass-panel rounded-2xl overflow-hidden shadow-2xl border border-white/10 z-50 py-1">
                {suggestions.map((item) => {
                  const title = item.title || item.name || 'Untitled';
                  const date = item.release_date || item.first_air_date || '';
                  const year = date ? date.substring(0, 4) : '';
                  const type = item.media_type || (item.first_air_date ? 'tv' : 'movie');

                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        onNavigate(`watch?type=${type}&id=${item.id}`);
                        setShowSuggestions(false);
                      }}
                      className="px-3 py-2 hover:bg-white/10 cursor-pointer flex items-center gap-3 transition-colors"
                    >
                      <img
                        src={item.poster_path ? `https://image.tmdb.org/t/p/w92${item.poster_path}` : 'https://via.placeholder.com/92x138?text=No+Cover'}
                        alt={title}
                        className="w-8 h-12 object-cover rounded-md flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-white truncate">{title}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span className="capitalize px-1.5 py-0.2 rounded bg-white/10 text-[10px] font-medium text-slate-300">
                            {type}
                          </span>
                          {year && <span>{year}</span>}
                          {item.vote_average ? (
                            <span className="text-amber-400 font-bold">★ {item.vote_average.toFixed(1)}</span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            
            <div className="hidden 2xl:flex items-center gap-1 border-l border-white/10 pl-2">
              {onOpenWatchParty && (
                <button
                  onClick={onOpenWatchParty}
                  title="Host Watch Party"
                  className="px-2 py-1.5 rounded-full bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[11px] font-semibold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Party</span>
                </button>
              )}

              {onOpenRoulette && (
                <button
                  onClick={onOpenRoulette}
                  title="Surprise Movie Roulette"
                  className="px-2 py-1.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-semibold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  <span>Spin</span>
                </button>
              )}

              {onOpenTrivia && (
                <button
                  onClick={onOpenTrivia}
                  title="Movie Trivia Quiz"
                  className="px-2 py-1.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Trivia</span>
                </button>
              )}
            </div>

            <button
              onClick={onOpenAiConcierge}
              title="AI Movie Concierge"
              className="p-2 rounded-full bg-gradient-to-r from-purple-600/30 to-[var(--color-primary)]/30 border border-[var(--color-primary)]/40 hover:border-[var(--color-primary)] text-white hover:scale-105 transition-all flex items-center justify-center shadow-lg shadow-[var(--color-primary-glow)] flex-shrink-0 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[var(--color-primary)] animate-pulse" />
            </button>

            <div className="flex-shrink-0 flex items-center gap-1.5">
              {user ? (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onNavigate('profile')}
                    className="flex items-center gap-1.5 p-1 pl-1.5 pr-2.5 sm:pr-3.5 rounded-full bg-gradient-to-r from-white/10 to-white/5 hover:from-[#00d2ff]/20 hover:to-purple-600/20 border border-white/15 hover:border-[#00d2ff]/50 transition-all cursor-pointer shadow-md hover:shadow-[#00d2ff]/20 group flex-shrink-0"
                  >
                    <UserAvatar username={user.username} avatarUrl={user.avatar} size="sm" />
                    <span className="text-xs font-extrabold text-white group-hover:text-[#00d2ff] transition-colors max-w-[80px] sm:max-w-[110px] truncate">{user.username}</span>
                  </button>

                  <button
                    onClick={() => onNavigate('settings')}
                    title="Settings"
                    className="p-2 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-all hidden sm:flex cursor-pointer flex-shrink-0"
                  >
                    <Settings className="w-4 h-4" />
                  </button>

                  {(user?.role === 'admin' || user?.isAdmin || auth.isCurrentAdmin()) && (
                    <button
                      onClick={() => onNavigate('admin')}
                      title="Admin Command Center"
                      className="px-2.5 py-1.5 rounded-full bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shadow-rose-500/20 flex-shrink-0"
                    >
                      <Shield className="w-3.5 h-3.5 text-rose-400" />
                      <span className="hidden sm:inline">Admin</span>
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => onNavigate('auth')}
                  className="px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-primary)] text-white hover:brightness-110 shadow-md shadow-[var(--color-primary-glow)] transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              )}
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-200 lg:hidden flex-shrink-0 cursor-pointer"
              title="Open Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="lg:hidden glass-panel border-t border-white/10 py-3 px-4 flex flex-col gap-1.5 animate-in slide-in-from-top duration-200">
          {navLinks.map((link) => {
            const isActive = currentRoute === link.route || currentRoute.startsWith(link.route);
            return (
              <button
                key={link.route}
                onClick={() => {
                  onNavigate(link.route);
                  setIsMobileMenuOpen(false);
                }}
                className={`px-3 py-2 rounded-xl text-sm font-medium flex items-center gap-3 transition-all ${
                  isActive
                    ? 'text-[var(--color-primary)] bg-[var(--color-primary)]/10 font-semibold border border-[var(--color-primary)]/30'
                    : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                <link.icon className="w-4 h-4 text-[var(--color-primary)]" />
                {link.label}
              </button>
            );
          })}
          
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 my-1">
            {onOpenWatchParty && (
              <button
                onClick={() => {
                  onOpenWatchParty();
                  setIsMobileMenuOpen(false);
                }}
                className="p-2 rounded-xl bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex flex-col items-center justify-center gap-1 cursor-pointer"
              >
                <Users className="w-4 h-4" />
                <span>Watch Party</span>
              </button>
            )}
            {onOpenRoulette && (
              <button
                onClick={() => {
                  onOpenRoulette();
                  setIsMobileMenuOpen(false);
                }}
                className="p-2 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-semibold flex flex-col items-center justify-center gap-1 cursor-pointer"
              >
                <Shuffle className="w-4 h-4" />
                <span>Roulette</span>
              </button>
            )}
            {onOpenTrivia && (
              <button
                onClick={() => {
                  onOpenTrivia();
                  setIsMobileMenuOpen(false);
                }}
                className="p-2 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex flex-col items-center justify-center gap-1 cursor-pointer"
              >
                <Trophy className="w-4 h-4" />
                <span>Trivia Quiz</span>
              </button>
            )}
          </div>

          <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
            <button
              onClick={() => {
                onNavigate('profile');
                setIsMobileMenuOpen(false);
              }}
              className="px-3 py-2 rounded-xl text-sm font-semibold text-[#00d2ff] hover:bg-white/5 flex items-center gap-2 cursor-pointer"
            >
              <User className="w-4 h-4" /> Profile & Account
            </button>
            <button
              onClick={() => {
                onNavigate('settings');
                setIsMobileMenuOpen(false);
              }}
              className="px-3 py-2 rounded-xl text-sm font-medium text-slate-300 hover:bg-white/5 flex items-center gap-2 cursor-pointer"
            >
              <Settings className="w-4 h-4" /> Settings
            </button>
            {(user?.role === 'admin' || user?.isAdmin || auth.isCurrentAdmin()) && (
              <button
                onClick={() => {
                  onNavigate('admin');
                  setIsMobileMenuOpen(false);
                }}
                className="px-3 py-2 rounded-xl text-sm font-bold text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 cursor-pointer w-full"
              >
                <Shield className="w-4 h-4 text-rose-400" /> Admin Command Center
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
