import React, { useState, useEffect } from 'react';
import { tmdb } from '../services/tmdb';
import { MediaItem, WatchProgress } from '../types';
import { HeroBanner } from '../components/HeroBanner';
import { Carousel } from '../components/Carousel';
import { MovieCard } from '../components/MovieCard';
import { OwnerNoticeBanner } from '../components/OwnerNoticeBanner';
import { continueWatchingStore } from '../services/store';
import { Flame, PlayCircle, Film, Tv, Star, Sparkles, ChevronRight } from 'lucide-react';

interface HomePageProps {
  onNavigate: (route: string) => void;
  onOpenTrailer: (item: MediaItem) => void;
  onOpenAiConcierge: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onOpenTrailer, onOpenAiConcierge }) => {
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
        console.error('Home data load error', err);
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Notice Banner */}
      <OwnerNoticeBanner />

      {/* Featured Hero Banner */}
      <HeroBanner
        items={heroItems}
        onPlay={handleSelectItem}
        onOpenTrailer={onOpenTrailer}
        onOpenDetails={handleSelectItem}
      />

      {/* AI Movie Concierge CTA Card */}
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
          className="px-6 py-3 rounded-full bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-primary)] text-white font-bold text-xs hover:brightness-110 shadow-lg shadow-[var(--color-primary-glow)] transition-all flex items-center gap-2 flex-shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          Ask MovieBox AI
        </button>
      </div>

      {/* Continue Watching Carousel */}
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
              <MovieCard
                key={`${item.type}-${item.id}`}
                media={mediaItem}
                progress={item.progress}
                onSelect={() => handleSelectItem(mediaItem)}
              />
            );
          })}
        </Carousel>
      )}

      {/* Trending Movies */}
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

      {/* Popular TV Shows */}
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

      {/* Top Rated Hits */}
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

      {/* Now Playing in Theaters */}
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
