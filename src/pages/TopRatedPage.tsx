import React, { useState, useEffect } from 'react';
import { tmdb } from '../services/tmdb';
import { MediaItem, MediaType } from '../types';
import { MovieCard } from '../components/MovieCard';
import { Star, Film, Tv, Trophy } from 'lucide-react';

interface TopRatedPageProps {
  onNavigate: (route: string) => void;
}

export const TopRatedPage: React.FC<TopRatedPageProps> = ({ onNavigate }) => {
  const [type, setType] = useState<MediaType>('movie');
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTopRated() {
      setLoading(true);
      try {
        const res = type === 'movie' ? await tmdb.getTopRatedMovies(1) : await tmdb.getTopRatedTv(1);
        setItems(res.results || []);
      } catch (err) {
        
      } finally {
        setLoading(false);
      }
    }
    loadTopRated();
  }, [type]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-widest">
            <Trophy className="w-4 h-4" /> Critically Acclaimed
          </div>
          <h1 className="text-3xl font-black text-white mt-1">Top Rated Titles</h1>
          <p className="text-xs text-slate-400 mt-0.5">The highest user-rated films and series of all time</p>
        </div>

        <div className="flex items-center gap-2 p-1 glass-panel rounded-xl">
          <button
            onClick={() => setType('movie')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              type === 'movie' ? 'bg-[var(--color-primary)] text-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Film className="w-4 h-4" /> Top Movies
          </button>
          <button
            onClick={() => setType('tv')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              type === 'tv' ? 'bg-[var(--color-primary)] text-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Tv className="w-4 h-4" /> Top TV Shows
          </button>
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
          {items.map((item, index) => (
            <div key={item.id} className="relative group">
              
              <div className="absolute top-2 left-2 z-20 w-8 h-8 rounded-full bg-amber-500 text-black font-extrabold text-xs flex items-center justify-center shadow-lg border border-amber-300">
                #{index + 1}
              </div>
              <MovieCard
                media={{ ...item, media_type: type }}
                onSelect={(m) => onNavigate(`watch?type=${type}&id=${m.id}`)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
