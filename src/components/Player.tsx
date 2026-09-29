import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  ArrowLeft, Play, Pause, Volume2, VolumeX, Maximize, 
  Layers, Share2, SkipForward, Lock, ExternalLink, RefreshCw,
  ShieldCheck, Chrome, LogIn, Mail, User, ShieldAlert
} from 'lucide-react';
import { MediaDetails, Episode, MediaType } from '../types';
import { tmdb } from '../services/tmdb';
import { continueWatchingStore, watchHistoryStore, favoritesStore } from '../services/store';
import { auth, isAuthenticated, signInWithGoogle, signInWithEmail, signUpWithEmail } from '../services/auth';
import { lockStore } from '../services/lockStore';
import { toast } from '../services/toast';

interface PlayerProps {
  media: MediaDetails;
  type: MediaType;
  initialSeason?: number;
  initialEpisode?: number;
  onBack: () => void;
  onNavigateToItem?: (id: number, type: MediaType) => void;
}

const SERVERS = [
  { 
    id: 'vidlink', 
    name: 'Server 1 (VidLink HD)', 
    movieUrl: (id: number) => `https://vidlink.pro/movie/${id}`,
    tvUrl: (id: number, s: number, e: number) => `https://vidlink.pro/tv/${id}/${s}/${e}`
  },
  { 
    id: 'vidsrc_cc', 
    name: 'Server 2 (VidSrc.cc)', 
    movieUrl: (id: number) => `https://vidsrc.cc/v2/embed/movie/${id}`,
    tvUrl: (id: number, s: number, e: number) => `https://vidsrc.cc/v2/embed/tv/${id}/${s}/${e}`
  },
  { 
    id: 'vidbinge', 
    name: 'Server 3 (VidBinge Pro)', 
    movieUrl: (id: number) => `https://vidbinge.dev/embed/movie/${id}`,
    tvUrl: (id: number, s: number, e: number) => `https://vidbinge.dev/embed/tv/${id}/${s}/${e}`
  },
  { 
    id: 'vidsrc_to', 
    name: 'Server 4 (VidSrc.to)', 
    movieUrl: (id: number) => `https://vidsrc.to/embed/movie/${id}`,
    tvUrl: (id: number, s: number, e: number) => `https://vidsrc.to/embed/tv/${id}/${s}/${e}`
  },
  { 
    id: 'embedsu', 
    name: 'Server 5 (Embed.su)', 
    movieUrl: (id: number) => `https://embed.su/embed/movie/${id}`,
    tvUrl: (id: number, s: number, e: number) => `https://embed.su/embed/tv/${id}/${s}/${e}`
  },
  { 
    id: 'autoembed', 
    name: 'Server 6 (AutoEmbed 4K)', 
    movieUrl: (id: number) => `https://player.autoembed.cc/embed/movie/${id}`,
    tvUrl: (id: number, s: number, e: number) => `https://player.autoembed.cc/embed/tv/${id}/${s}/${e}`
  },
  { 
    id: '2embed', 
    name: 'Server 7 (2Embed)', 
    movieUrl: (id: number) => `https://www.2embed.cc/embed/${id}`,
    tvUrl: (id: number, s: number, e: number) => `https://www.2embed.cc/embedtv/${id}&s=${s}&e=${e}`
  },
  { 
    id: 'vidsrc_pro', 
    name: 'Server 8 (VidSrc.pro)', 
    movieUrl: (id: number) => `https://vidsrc.pro/embed/movie/${id}`,
    tvUrl: (id: number, s: number, e: number) => `https://vidsrc.pro/embed/tv/${id}/${s}/${e}`
  },
  { 
    id: 'smashystream', 
    name: 'Server 9 (SmashyStream)', 
    movieUrl: (id: number) => `https://embed.smashystream.com/playere.php?tmdb=${id}`,
    tvUrl: (id: number, s: number, e: number) => `https://embed.smashystream.com/playere.php?tmdb=${id}&season=${s}&episode=${e}`
  }
];

export const Player: React.FC<PlayerProps> = ({ 
  media, 
  type, 
  initialSeason = 1, 
  initialEpisode = 1, 
  onBack 
}) => {
  const [currentUser, setCurrentUser] = useState(auth.getCurrentUser());
  const [lockStatus, setLockStatus] = useState(lockStore.isMovieLocked(media.id));
  const [selectedServer, setSelectedServer] = useState(0);
  const [season, setSeason] = useState(initialSeason);
  const [episode, setEpisode] = useState(initialEpisode);
  const [episodesList, setEpisodesList] = useState<Episode[]>([]);
  const [showEpisodeDrawer, setShowEpisodeDrawer] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const title = media.title || media.name || 'Untitled';

  useEffect(() => {
    const unsubAuth = auth.subscribe((usr) => setCurrentUser(usr));
    const unsubLock = lockStore.subscribe(() => setLockStatus(lockStore.isMovieLocked(media.id)));
    return () => {
      unsubAuth();
      unsubLock();
    };
  }, [media.id]);

  useEffect(() => {
    if (type !== 'tv') return;
    let isCurrent = true;
    async function loadEpisodes() {
      try {
        const data = await tmdb.getTvSeasonDetails(media.id, season);
        if (isCurrent && data?.episodes) {
          setEpisodesList(data.episodes);
        }
      } catch {
      }
    }
    loadEpisodes();
    return () => { isCurrent = false; };
  }, [type, media.id, season]);

  const playStartTimeRef = useRef(Date.now());
  const initialPositionRef = useRef(0);

  useEffect(() => {
    playStartTimeRef.current = Date.now();
    const currentSaved = continueWatchingStore.getById(media.id, type, season, episode);
    initialPositionRef.current = currentSaved?.lastPosition || 0;
  }, [media.id, type, season, episode]);

  useEffect(() => {
    if (!currentUser) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - playStartTimeRef.current) / 1000);
      const newPosition = initialPositionRef.current + elapsed;
      
      continueWatchingStore.saveProgress({
        id: media.id,
        type,
        title,
        poster: media.poster_path,
        backdrop: media.backdrop_path,
        season: type === 'tv' ? season : undefined,
        episode: type === 'tv' ? episode : undefined,
        lastPosition: newPosition,
        duration: 3600,
      });
    }, 15000);

    return () => clearInterval(interval);
  }, [currentUser, media.id, type, season, episode, title, media.poster_path, media.backdrop_path]);



  const embedUrl = useMemo(() => {
    const server = SERVERS[selectedServer] || SERVERS[0];
    if (type === 'movie') {
      return server.movieUrl(media.id);
    } else {
      return server.tvUrl(media.id, season, episode);
    }
  }, [selectedServer, media.id, type, season, episode]);

  const handleOpenDirectStream = () => {
    window.open(embedUrl, '_blank', 'noopener,noreferrer');
  };

  const handleInlineAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      if (authMode === 'signup') {
        if (!authName.trim()) {
          toast.error('Please enter a display name');
          setAuthLoading(false);
          return;
        }
        await signUpWithEmail(authEmail, authPassword, authName);
        toast.success(`Welcome ${authName}! Enjoy the movie.`);
      } else {
        await signInWithEmail(authEmail, authPassword);
        toast.success('Signed in successfully! Unlocking stream...');
      }
    } catch (err: any) {
      
      toast.error(err.message || 'Authentication failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    try {
      const user = await signInWithGoogle();
      toast.success(`Welcome ${user.username}! Unlocking stream...`);
    } catch (err: any) {
      
      if (err.code !== 'auth/popup-closed-by-user') {
        toast.error(err.message || 'Google sign in failed');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3500);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Streaming link copied to clipboard!');
    }
  };

  const handleNextEpisode = () => {
    if (type !== 'tv' || episodesList.length === 0) return;
    if (episode < episodesList.length) {
      setEpisode(episode + 1);
      toast.info(`Playing S${season} E${episode + 1}`);
    } else if (media.seasons && season < media.seasons.length) {
      setSeason(season + 1);
      setEpisode(1);
      toast.info(`Advancing to Season ${season + 1} Episode 1`);
    }
  };

  if (lockStatus.isLocked) {
    return (
      <div className="relative w-full h-[85vh] min-h-[520px] max-h-[900px] bg-gradient-to-b from-slate-950 via-black to-slate-950 rounded-3xl overflow-hidden border border-rose-500/40 shadow-2xl flex flex-col items-center justify-center p-6 text-center select-none">
        
        {media.backdrop_path && (
          <img
            src={`https://image.tmdb.org/t/p/w1280${media.backdrop_path}`}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover opacity-10 blur-2xl pointer-events-none"
          />
        )}

        <div className="relative z-10 max-w-md w-full glass-panel p-8 rounded-3xl border border-rose-500/50 bg-black/90 shadow-2xl space-y-5">
          
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-rose-600 via-amber-500 to-rose-700 p-0.5 mx-auto flex items-center justify-center shadow-xl shadow-rose-500/40 animate-bounce">
            <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center">
              <Lock className="w-8 h-8 text-rose-500" />
            </div>
          </div>

          <div>
            <span className="px-3 py-1 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-full text-[10px] font-bold uppercase tracking-wider">
              Content Locked by Owner
            </span>
            <h2 className="text-xl font-black text-white mt-2">"{title}" is Currently Locked</h2>
            <p className="text-xs text-rose-200/80 mt-2 font-medium bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
              {lockStatus.reason || 'This title has been locked for scheduled maintenance or restricted viewing.'}
            </p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={onBack}
              className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/15 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back to Catalog
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="relative w-full h-[85vh] min-h-[520px] max-h-[900px] bg-gradient-to-b from-slate-950 via-black to-slate-950 rounded-3xl overflow-hidden border border-white/10 shadow-2xl flex flex-col items-center justify-center p-6 text-center select-none">
        
        {media.backdrop_path && (
          <img
            src={`https://image.tmdb.org/t/p/w1280${media.backdrop_path}`}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover opacity-15 blur-xl pointer-events-none"
          />
        )}

        <div className="relative z-10 max-w-md w-full glass-panel p-8 rounded-3xl border border-white/15 bg-black/85 shadow-2xl space-y-5">
          
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-rose-500 to-[#00d2ff] p-0.5 mx-auto flex items-center justify-center shadow-xl shadow-[#00d2ff]/20">
            <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center">
              <Lock className="w-8 h-8 text-[#00d2ff] animate-pulse" />
            </div>
          </div>

          <div>
            <span className="px-3 py-1 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-full text-[10px] font-bold uppercase tracking-wider">
              Authentication Required
            </span>
            <h2 className="text-xl font-black text-white mt-2">Sign In to Play "{title}"</h2>
            <p className="text-xs text-white/60 mt-1">
              Playback is restricted. Please sign in or create a free MovieBox account with Firebase to unlock 4K video streams.
            </p>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={authLoading}
            className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/15 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Chrome className="w-4 h-4 text-[#00d2ff]" />
            Quick Google Sign In
          </button>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="flex-shrink mx-3 text-[10px] text-white/40 font-bold uppercase tracking-wider">or sign in with email</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          <form onSubmit={handleInlineAuthSubmit} className="space-y-3 text-left">
            {authMode === 'signup' && (
              <div>
                <label className="text-[11px] font-bold text-white/70 block mb-1">Display Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
                  <input
                    type="text"
                    required
                    placeholder="Your Name"
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 text-white text-xs rounded-xl focus:outline-none focus:border-[#00d2ff]"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-[11px] font-bold text-white/70 block mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 text-white text-xs rounded-xl focus:outline-none focus:border-[#00d2ff]"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-white/70 block mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 text-white text-xs rounded-xl focus:outline-none focus:border-[#00d2ff]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-[#00d2ff] text-white font-bold text-xs shadow-lg shadow-[#00d2ff]/20 hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              {authLoading ? 'Verifying...' : (authMode === 'signup' ? 'Sign Up & Watch' : 'Sign In & Watch')}
            </button>
          </form>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
              className="text-xs text-[#00d2ff] hover:underline font-semibold"
            >
              {authMode === 'signin' ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full h-[85vh] min-h-[500px] max-h-[900px] bg-black rounded-3xl overflow-hidden glass-panel border border-white/10 shadow-2xl flex flex-col group select-none"
    >
      
      <div
        className={`absolute top-0 left-0 right-0 z-30 p-4 bg-gradient-to-b from-black/95 via-black/50 to-transparent flex items-center justify-between transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-white line-clamp-1">{title}</h1>
            {type === 'tv' && (
              <span className="text-xs text-[#00d2ff] font-semibold">
                Season {season} • Episode {episode}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          
          <div className="relative">
            <select
              value={selectedServer}
              onChange={(e) => setSelectedServer(Number(e.target.value))}
              className="bg-black/90 text-xs font-bold text-white px-3 py-2 rounded-full border border-white/20 focus:outline-none focus:border-[#00d2ff] backdrop-blur-md cursor-pointer"
            >
              {SERVERS.map((s, idx) => (
                <option key={s.id} value={idx} className="bg-slate-900 text-white">
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleOpenDirectStream}
            className="p-2 rounded-full bg-[#00d2ff]/20 hover:bg-[#00d2ff]/30 text-[#00d2ff] border border-[#00d2ff]/40 backdrop-blur-md transition-all flex items-center gap-1.5 px-3 text-xs font-bold cursor-pointer"
            title="Open stream in a new tab if iframe is blocked by browser"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Direct Tab</span>
          </button>

          {type === 'tv' && (
            <button
              onClick={handleNextEpisode}
              className="p-2 rounded-full bg-[#00d2ff]/20 hover:bg-[#00d2ff]/30 text-[#00d2ff] border border-[#00d2ff]/40 backdrop-blur-md transition-all flex items-center gap-1.5 px-3 text-xs font-bold cursor-pointer"
              title="Next Episode"
            >
              <SkipForward className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Next Episode</span>
            </button>
          )}

          {type === 'tv' && (
            <button
              onClick={() => setShowEpisodeDrawer(!showEpisodeDrawer)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all flex items-center gap-1.5 px-3 text-xs font-semibold cursor-pointer"
            >
              <Layers className="w-4 h-4 text-[#00d2ff]" />
              Episodes
            </button>
          )}

          <button
            onClick={handleShare}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all cursor-pointer"
            title="Share Stream"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="relative flex-1 w-full h-full bg-slate-950">
        <iframe
          key={`${selectedServer}-${media.id}-${type}-${season}-${episode}`}
          src={embedUrl}
          className="w-full h-full border-0"
          allowFullScreen
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture; accelerometer; gyroscope; clipboard-write"
          referrerPolicy="origin"
          title={`Streaming ${title}`}
        />
      </div>

      {showEpisodeDrawer && type === 'tv' && (
        <div className="absolute right-0 top-0 bottom-0 w-full sm:w-80 bg-slate-950/95 backdrop-blur-2xl border-l border-white/10 z-40 p-4 flex flex-col animate-in slide-in-from-right duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
            <h3 className="font-bold text-white text-sm">Episodes</h3>
            <button
              onClick={() => setShowEpisodeDrawer(false)}
              className="text-slate-400 hover:text-white text-xs font-semibold"
            >
              Close
            </button>
          </div>

          {media.seasons && media.seasons.length > 0 && (
            <div className="mb-3">
              <label className="text-[11px] uppercase tracking-wider text-slate-400 block mb-1 font-bold">
                Select Season
              </label>
              <select
                value={season}
                onChange={(e) => {
                  setSeason(Number(e.target.value));
                  setEpisode(1);
                }}
                className="w-full bg-white/5 border border-white/10 text-white text-xs rounded-xl p-2 focus:outline-none focus:border-[#00d2ff]"
              >
                {media.seasons
                  .filter((s) => s.season_number > 0)
                  .map((s) => (
                    <option key={s.id} value={s.season_number} className="bg-slate-900">
                      Season {s.season_number} ({s.episode_count} Episodes)
                    </option>
                  ))}
              </select>
            </div>
          )}

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {episodesList.map((ep) => {
              const isCurrent = ep.episode_number === episode;
              return (
                <div
                  key={ep.id}
                  onClick={() => {
                    setEpisode(ep.episode_number);
                    setShowEpisodeDrawer(false);
                  }}
                  className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center gap-3 ${
                    isCurrent
                      ? 'bg-[#00d2ff]/20 border-[#00d2ff] text-white font-bold'
                      : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="w-6 h-6 rounded-md bg-black/40 flex items-center justify-center font-extrabold text-[11px] text-[#00d2ff] flex-shrink-0">
                    {ep.episode_number}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="truncate font-semibold">{ep.name || `Episode ${ep.episode_number}`}</div>
                    {ep.runtime && <div className="text-[10px] text-slate-400">{ep.runtime} mins</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
