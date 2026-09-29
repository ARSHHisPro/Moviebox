import React, { useState, useEffect } from 'react';
import { continueWatchingStore } from '../services/store';
import { WatchProgress, MediaItem } from '../types';
import { MovieCard } from '../components/MovieCard';
import { PlayCircle, Trash2, CheckCircle2 } from 'lucide-react';
import { toast } from '../services/toast';

interface ContinueWatchingPageProps {
  onNavigate: (route: string) => void;
}

export const ContinueWatchingPage: React.FC<ContinueWatchingPageProps> = ({ onNavigate }) => {
  const [items, setItems] = useState<WatchProgress[]>([]);

  useEffect(() => {
    return continueWatchingStore.subscribe((list) => setItems(list));
  }, []);

  const handleClear = () => {
    if (window.confirm('Clear all items from Continue Watching?')) {
      continueWatchingStore.clear();
      toast.info('Cleared continue watching list');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-[var(--color-primary)] font-bold text-xs uppercase tracking-widest">
            <PlayCircle className="w-4 h-4" /> In Progress
          </div>
          <h1 className="text-3xl font-extrabold text-white mt-1">Continue Watching ({items.length})</h1>
          <p className="text-xs text-slate-400 mt-0.5">Pick up right where you left off</p>
        </div>

        {items.length > 0 && (
          <button
            onClick={handleClear}
            className="px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold hover:bg-rose-500/20 flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear All
          </button>
        )}
      </div>

      {items.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {items.map((item) => {
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
              <div key={`${item.type}-${item.id}-${item.season}-${item.episode}`} className="relative group">
                <MovieCard
                  media={mediaItem}
                  progress={item.progress}
                  onSelect={() => {
                    const s = item.season ? `&s=${item.season}` : '';
                    const e = item.episode ? `&e=${item.episode}` : '';
                    onNavigate(`watch?type=${item.type}&id=${item.id}${s}${e}`);
                  }}
                />

                <button
                  onClick={(ev) => {
                    ev.stopPropagation();
                    continueWatchingStore.removeItem(item.id, item.type, item.season, item.episode);
                    toast.info(`Removed "${item.title}"`);
                  }}
                  className="absolute top-2 right-2 p-2 rounded-full bg-black/85 text-slate-300 hover:text-rose-400 border border-white/10 z-30 md:opacity-0 md:group-hover:opacity-100 opacity-100 transition-all shadow-lg active:scale-90"
                  title="Remove from Continue Watching"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-20 text-center glass-panel rounded-3xl space-y-4">
          <PlayCircle className="w-12 h-12 text-slate-600 mx-auto" />
          <p className="text-slate-400 text-sm">No active watch progress saved.</p>
          <button
            onClick={() => onNavigate('home')}
            className="px-5 py-2.5 rounded-full bg-[var(--color-primary)] text-black text-xs font-bold"
          >
            Start Watching
          </button>
        </div>
      )}
    </div>
  );
};
