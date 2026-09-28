import React, { useState, useEffect } from 'react';
import { tmdb } from '../services/tmdb';
import { MediaItem } from '../types';
import { MovieCard } from '../components/MovieCard';
import { Flame, Clock } from 'lucide-react';

interface TrendingPageProps {
  onNavigate: (route: string) => void;
}

export const TrendingPage: React.FC<TrendingPageProps> = ({ onNavigate }) => {
  const [mediaType, setMediaType] = useState<'all' | 'movie' | 'tv'>('all');
  const [timeWindow, setTimeWindow] = useState<'day' | 'week'>('day');
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTrending() {
      setLoading(true);
      try {
        const res = await tmdb.getTrending(mediaType, timeWindow);
        setItems(res.results || []);
      } catch (err) {
        
      } finally {
        setLoading(false);
      }
    }
    loadTrending();
  }, [mediaType, timeWindow]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-rose-500 font-bold text-xs uppercase tracking-widest">
            <Flame className="w-4 h-4 fill-current" /> Viral Trends
          </div>
          <h1 className="text-3xl font-black text-white mt-1">Trending Now</h1>
          <p className="text-xs text-slate-400 mt-0.5">Real-time popular titles updated hourly</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          
          <div className="flex items-center gap-1 p-1 glass-panel rounded-xl">
            <button
              onClick={() => setTimeWindow('day')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                timeWindow === 'day' ? 'bg-[var(--color-primary)] text-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setTimeWindow('week')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                timeWindow === 'week' ? 'bg-[var(--color-primary)] text-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              This Week
            </button>
          </div>

          <div className="flex items-center gap-1 p-1 glass-panel rounded-xl">
            {(['all', 'movie', 'tv'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setMediaType(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                  mediaType === t ? 'bg-[var(--color-primary)] text-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="aspect-[2/3] w-full rounded-2xl skeleton-shimmer" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {items.map((item, idx) => {
            const type = item.media_type || (item.first_air_date ? 'tv' : 'movie');
            return (
              <div key={`${type}-${item.id}`} className="relative">
                <div className="absolute top-2 left-2 z-20 px-2 py-0.5 rounded-full bg-black/80 text-[var(--color-primary)] font-extrabold text-[11px] border border-[var(--color-primary)]/40">
                  #{idx + 1}
                </div>
                <MovieCard
                  media={{ ...item, media_type: type }}
                  onSelect={(m) => onNavigate(`watch?type=${type}&id=${m.id}`)}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
