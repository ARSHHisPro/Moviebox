import React, { useState, useEffect } from 'react';
import { tmdb } from '../services/tmdb';
import { MediaItem, WatchProgress } from '../types';
import { HeroBanner } from '../components/HeroBanner';
import { Carousel } from '../components/Carousel';
import { MovieCard } from '../components/MovieCard';
import { continueWatchingStore } from '../services/store';
import { Flame, PlayCircle, Film, Tv, Star, Sparkles, ChevronRight, Users, Shuffle, Trophy, Headphones, Trash2 } from 'lucide-react';
import { toast } from '../services/toast';

interface HomePageProps {
  onNavigate: (route: string) => void;
  onOpenTrailer: (item: MediaItem) => void;
  onOpenAiConcierge: () => void;
  onOpenWatchParty?: () => void;
  onOpenTrivia?: () => void;
  onOpenRoulette?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onOpenTrailer,
  onOpenAiConcierge,
  onOpenWatchParty,
  onOpenTrivia,
  onOpenRoulette
}) => {
  const [heroItems, setHeroItems] = useState<MediaItem[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<MediaItem[]>([]);
  const [popularTv, setPopularTv] = useState<MediaItem[]>([]);
  const [topRated, setTopRated] = useState<MediaItem[]>([]);
  const [nowPlaying, setNowPlaying] = useState<MediaItem[]>([]);
  const [continueList, setContinueList] = useState<WatchProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [trendingRes, moviesRes, tvRes, topRes, nowRes] = await Promise.all([
          tmdb.getTrending('all', 'day'),
          tmdb.getPopularMovies(1),
          tmdb.getPopularTv(1),
          tmdb.getTopRatedMovies(1),
          tmdb.getNowPlayingMovies(1),
        ]);

        setHeroItems((trendingRes.results || []).slice(0, 6));
        setTrendingMovies(moviesRes.results || []);
        setPopularTv(tvRes.results || []);
        setTopRated(topRes.results || []);
        setNowPlaying(nowRes.results || []);
      } catch (err) {
        
      } finally {
        setLoading(false);
      }
    }

    loadHomeData();

    return continueWatchingStore.subscribe((items) => {
      setContinueList(items);
    });
  }, []);

  const handleSelectItem = (item: MediaItem) => {
    const type = item.media_type || (item.first_air_date ? 'tv' : 'movie');
    onNavigate(`watch?type=${type}&id=${item.id}`);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-8">
        <div className="w-full h-[60vh] rounded-3xl skeleton-shimmer" />
        <div className="space-y-4">
          <div className="w-48 h-6 rounded-md skeleton-shimmer" />
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="w-48 h-72 rounded-2xl skeleton-shimmer flex-shrink-0" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8 space-y-6">

      <HeroBanner
        items={heroItems}
        onPlay={handleSelectItem}
        onOpenTrailer={onOpenTrailer}
        onOpenDetails={handleSelectItem}
      />

      <div className="glass-panel border border-[var(--color-primary)]/30 rounded-2xl p-6 relative overflow-hidden bg-gradient-to-r from-purple-900/30 via-black/40 to-[var(--color-primary)]/20 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="flex items-center gap-2 justify-center md:justify-start">
            <Sparkles className="w-5 h-5 text-[var(--color-primary)] animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-primary)]">
              AI Powered Movie Assistant
            </span>
          </div>
          <h3 className="text-xl font-bold text-white">Can't decide what to watch tonight?</h3>
          <p className="text-xs text-slate-300 max-w-xl">
            Ask MovieBox Gemini AI for personalized recommendations based on your favorite themes, directors, or mood.
          </p>
        </div>

        <button
          onClick={onOpenAiConcierge}
          className="px-6 py-3 rounded-full bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-primary)] text-white font-bold text-xs hover:brightness-110 shadow-lg shadow-[var(--color-primary-glow)] transition-all flex items-center gap-2 flex-shrink-0 cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          Ask MovieBox AI
        </button>
      </div>

      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#00d2ff]" />
            <h2 className="text-sm font-extrabold uppercase tracking-widest text-white/90">
              Cinephile Lounge & Interactive Features
            </h2>
          </div>
          <span className="text-[10px] font-bold text-[#00d2ff] bg-[#00d2ff]/10 px-2 py-0.5 rounded-md border border-[#00d2ff]/20">
            4 Live Modules Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          
          <div
            onClick={onOpenWatchParty}
            className="glass-panel p-5 rounded-2xl border border-cyan-500/30 hover:border-cyan-500/60 bg-gradient-to-br from-cyan-950/30 via-black/40 to-cyan-900/10 cursor-pointer transition-all hover:scale-[1.02] shadow-xl group space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-[10px] uppercase font-black text-cyan-400 tracking-wider">Multi-User Sync</span>
            </div>
            <div>
              <h3 className="text-sm font-black text-white group-hover:text-cyan-300 transition-colors">
                Host a Watch Party
              </h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                Create synchronized streaming rooms with live room chat, timestamp sync, and custom invite codes.
              </p>
            </div>
          </div>

          <div
            onClick={onOpenRoulette}
            className="glass-panel p-5 rounded-2xl border border-amber-500/30 hover:border-amber-500/60 bg-gradient-to-br from-amber-950/30 via-black/40 to-amber-900/10 cursor-pointer transition-all hover:scale-[1.02] shadow-xl group space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40">
                <Shuffle className="w-5 h-5" />
              </div>
              <span className="text-[10px] uppercase font-black text-amber-400 tracking-wider">3D Wheel Spinner</span>
            </div>
            <div>
              <h3 className="text-sm font-black text-white group-hover:text-amber-300 transition-colors">
                Surprise Movie Roulette
              </h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                Indecisive? Spin the animated 3D roulette wheel filtered by genre and rating for instant surprise picks.
              </p>
            </div>
          </div>

          <div
            onClick={onOpenTrivia}
            className="glass-panel p-5 rounded-2xl border border-emerald-500/30 hover:border-emerald-500/60 bg-gradient-to-br from-emerald-950/30 via-black/40 to-emerald-900/10 cursor-pointer transition-all hover:scale-[1.02] shadow-xl group space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                <Trophy className="w-5 h-5" />
              </div>
              <span className="text-[10px] uppercase font-black text-emerald-400 tracking-wider">Firestore Leaderboard</span>
            </div>
            <div>
              <h3 className="text-sm font-black text-white group-hover:text-emerald-300 transition-colors">
                Cinema Trivia Challenge
              </h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                Test your movie knowledge with timed questions and climb the live global Firestore trivia leaderboard.
              </p>
            </div>
          </div>
        </div>
      </div>

      {continueList.length > 0 && (
        <Carousel
          title="Continue Watching"
          subtitle="Resume where you left off"
          icon={PlayCircle}
          actionButton={
            <button
              onClick={() => onNavigate('continue-watching')}
              className="text-xs font-semibold text-[var(--color-primary)] hover:underline flex items-center gap-1"
            >
              See All <ChevronRight className="w-3.5 h-3.5" />
            </button>
          }
        >
          {continueList.map((item) => {
            const mediaItem: MediaItem = {
              id: item.id,
              media_type: item.type,
              title: item.title,
              name: item.title,
              poster_path: item.poster,
              backdrop_path: item.backdrop,
              overview: '',
              vote_average: 8.0,
            };
            return (
              <div key={`${item.type}-${item.id}-${item.season || 0}-${item.episode || 0}`} className="relative group">
                <MovieCard
                  media={mediaItem}
                  progress={item.progress}
                  onSelect={() => handleSelectItem(mediaItem)}
                />
                <button
                  onClick={(ev) => {
                    ev.stopPropagation();
                    continueWatchingStore.removeItem(item.id, item.type, item.season, item.episode);
                    toast.info(`Removed "${item.title}"`);
                  }}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/85 text-slate-300 hover:text-rose-400 border border-white/10 z-30 md:opacity-0 md:group-hover:opacity-100 opacity-100 transition-all shadow-md active:scale-90"
                  title="Remove from Continue Watching"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </Carousel>
      )}

      <Carousel
        title="Trending Movies"
        subtitle="Most watched films today"
        icon={Flame}
        actionButton={
          <button
            onClick={() => onNavigate('trending')}
            className="text-xs font-semibold text-[var(--color-primary)] hover:underline flex items-center gap-1"
          >
            Explore <ChevronRight className="w-3.5 h-3.5" />
          </button>
        }
      >
        {trendingMovies.map((movie) => (
          <MovieCard key={movie.id} media={{ ...movie, media_type: 'movie' }} onSelect={handleSelectItem} />
        ))}
      </Carousel>

      <Carousel
        title="Popular TV Series"
        subtitle="Binge-worthy shows"
        icon={Tv}
        actionButton={
          <button
            onClick={() => onNavigate('tv')}
            className="text-xs font-semibold text-[var(--color-primary)] hover:underline flex items-center gap-1"
          >
            All Shows <ChevronRight className="w-3.5 h-3.5" />
          </button>
        }
      >
        {popularTv.map((tv) => (
          <MovieCard key={tv.id} media={{ ...tv, media_type: 'tv' }} onSelect={handleSelectItem} />
        ))}
      </Carousel>

      <Carousel
        title="Critically Acclaimed"
        subtitle="Top rated masterpieces"
        icon={Star}
        actionButton={
          <button
            onClick={() => onNavigate('top-rated')}
            className="text-xs font-semibold text-[var(--color-primary)] hover:underline flex items-center gap-1"
          >
            View Top 100 <ChevronRight className="w-3.5 h-3.5" />
          </button>
        }
      >
        {topRated.map((item) => (
          <MovieCard key={item.id} media={{ ...item, media_type: 'movie' }} onSelect={handleSelectItem} />
        ))}
      </Carousel>

      <Carousel
        title="Now Playing in Cinemas"
        subtitle="Fresh theatrical releases"
        icon={Film}
      >
        {nowPlaying.map((item) => (
          <MovieCard key={item.id} media={{ ...item, media_type: 'movie' }} onSelect={handleSelectItem} />
        ))}
      </Carousel>
    </div>
  );
};
