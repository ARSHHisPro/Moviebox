import React, { useState, useEffect } from 'react';
import { tmdb } from '../services/tmdb';
import { MediaItem, MediaType } from '../types';
import { MovieCard } from '../components/MovieCard';
import { Layers, ChevronLeft, ChevronRight, Film, Tv } from 'lucide-react';

interface GenreDetailPageProps {
  route: string;
  onNavigate: (route: string) => void;
}

export const GenreDetailPage: React.FC<GenreDetailPageProps> = ({ route, onNavigate }) => {
  const queryParams = new URLSearchParams(route.split('?')[1] || '');
  const genreId = queryParams.get('id') || '28';
  const genreName = queryParams.get('name') || 'Action';
  const initialType: MediaType = (queryParams.get('type') as MediaType) || 'movie';

  const [type, setType] = useState<MediaType>(initialType);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadGenreItems() {
      setLoading(true);
      try {
        const res = await tmdb.discoverMedia(type, { genreId, sortBy: 'popularity.desc' }, page);
        setItems(res.results || []);
        setTotalPages(Math.min(res.total_pages || 1, 200));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadGenreItems();
  }, [genreId, type, page]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <button
            onClick={() => onNavigate('genres')}
            className="text-xs font-bold text-[var(--color-primary)] hover:underline flex items-center gap-1 mb-2"
          >
            ← Back to All Genres
          </button>
          <div className="flex items-center gap-2 text-[var(--color-primary)] font-bold text-xs uppercase tracking-widest">
            <Layers className="w-4 h-4" /> Genre Collection
          </div>
          <h1 className="text-3xl font-black text-white mt-1">{genreName}</h1>
        </div>

        <div className="flex items-center gap-2 p-1 glass-panel rounded-xl">
          <button
            onClick={() => {
              setType('movie');
              setPage(1);
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              type === 'movie' ? 'bg-[var(--color-primary)] text-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Film className="w-4 h-4" /> Movies
          </button>
          <button
            onClick={() => {
              setType('tv');
              setPage(1);
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              type === 'tv' ? 'bg-[var(--color-primary)] text-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Tv className="w-4 h-4" /> TV Shows
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="aspect-[2/3] w-full rounded-2xl skeleton-shimmer" />
          ))}
        </div>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {items.map((item) => (
            <MovieCard
              key={item.id}
              media={{ ...item, media_type: type }}
              onSelect={(m) => onNavigate(`watch?type=${type}&id=${m.id}`)}
            />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center glass-panel rounded-3xl text-slate-400">
          No items found in {genreName}.
        </div>
      )}

      <div className="flex items-center justify-between pt-6 border-t border-white/10">
        <button
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-40 text-xs font-semibold text-white flex items-center gap-1.5"
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>
        <span className="text-xs text-slate-400">
          Page <strong className="text-white">{page}</strong> of {totalPages}
        </span>
        <button
          disabled={page >= totalPages}
          onClick={() => setPage(page + 1)}
          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-40 text-xs font-semibold text-white flex items-center gap-1.5"
        >
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
