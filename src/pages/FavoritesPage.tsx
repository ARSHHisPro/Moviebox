import React, { useState, useEffect } from 'react';
import { favoritesStore } from '../services/store';
import { FavoriteItem, MediaItem } from '../types';
import { MovieCard } from '../components/MovieCard';
import { Heart, Trash2, Film, Tv, Sparkles } from 'lucide-react';
import { toast } from '../services/toast';

interface FavoritesPageProps {
  onNavigate: (route: string) => void;
}

export const FavoritesPage: React.FC<FavoritesPageProps> = ({ onNavigate }) => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'movie' | 'tv'>('all');

  useEffect(() => {
    return favoritesStore.subscribe((items) => setFavorites(items));
  }, []);

  const filtered = favorites.filter((f) => (filterType === 'all' ? true : f.type === filterType));

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all favorites?')) {
      favoritesStore.clear();
      toast.info('Cleared all saved favorites');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-widest">
            <Heart className="w-4 h-4 fill-current" /> Personal Library
          </div>
          <h1 className="text-3xl font-extrabold text-white mt-1">Your Favorites ({favorites.length})</h1>
          <p className="text-xs text-slate-400 mt-0.5">Quick access to your bookmarked movies and series</p>
        </div>

        {favorites.length > 0 && (
          <button
            onClick={handleClearAll}
            className="px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold hover:bg-rose-500/20 transition-all flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear All Favorites
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      {favorites.length > 0 && (
        <div className="flex items-center gap-2">
          {(['all', 'movie', 'tv'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                filterType === t
                  ? 'bg-[var(--color-primary)] text-black font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {t === 'all' ? 'All Types' : t === 'movie' ? 'Movies' : 'TV Shows'}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((fav) => {
            const mediaItem: MediaItem = {
              id: fav.id,
              media_type: fav.type,
              title: fav.title,
              name: fav.title,
              poster_path: fav.poster,
              backdrop_path: fav.backdrop,
              vote_average: fav.rating,
              overview: '',
            };
            return (
              <MovieCard
                key={`${fav.type}-${fav.id}`}
                media={mediaItem}
                onSelect={() => onNavigate(`watch?type=${fav.type}&id=${fav.id}`)}
              />
            );
          })}
        </div>
      ) : (
        <div className="py-20 text-center glass-panel rounded-3xl space-y-4">
          <Heart className="w-12 h-12 text-slate-600 mx-auto" />
          <p className="text-slate-400 text-sm">No favorites saved yet.</p>
          <button
            onClick={() => onNavigate('movies')}
            className="px-5 py-2.5 rounded-full bg-[var(--color-primary)] text-black text-xs font-bold"
          >
            Explore Movies & TV Shows
          </button>
        </div>
      )}
    </div>
  );
};
