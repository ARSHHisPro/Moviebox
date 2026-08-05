import React, { useState, useEffect } from 'react';
import { watchHistoryStore } from '../services/store';
import { WatchHistoryItem } from '../types';
import { getPosterUrl } from '../services/tmdb';
import { History, Trash2, Calendar, Play } from 'lucide-react';
import { toast } from '../services/toast';

interface HistoryPageProps {
  onNavigate: (route: string) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ onNavigate }) => {
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);

  useEffect(() => {
    return watchHistoryStore.subscribe((list) => setHistory(list));
  }, []);

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear your entire watch history?')) {
      watchHistoryStore.clear();
      toast.info('Watch history cleared');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-[var(--color-primary)] font-bold text-xs uppercase tracking-widest">
            <History className="w-4 h-4" /> Viewing Timeline
          </div>
          <h1 className="text-3xl font-extrabold text-white mt-1">Watch History ({history.length})</h1>
          <p className="text-xs text-slate-400 mt-0.5">Timeline of all titles you have streamed on MovieBox</p>
        </div>

        {history.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold hover:bg-rose-500/20 flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear History
          </button>
        )}
      </div>

      {history.length > 0 ? (
        <div className="space-y-3">
          {history.map((item) => {
            const dateStr = new Date(item.watchedAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={`${item.id}-${item.watchedAt}`}
                onClick={() => onNavigate(`watch?type=${item.type}&id=${item.id}`)}
                className="glass-panel p-3.5 rounded-2xl border border-white/10 flex items-center justify-between gap-4 cursor-pointer hover:border-[var(--color-primary)] transition-all group"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <img
                    src={getPosterUrl(item.poster)}
                    alt={item.title}
                    className="w-12 h-16 object-cover rounded-xl flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-white group-hover:text-[var(--color-primary)] truncate">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                      <span className="capitalize px-2 py-0.5 rounded bg-white/10 font-medium text-[10px]">
                        {item.type}
                      </span>
                      {item.season && <span>S{item.season} E{item.episode}</span>}
                      <span className="flex items-center gap-1 text-[11px] text-slate-500">
                        <Calendar className="w-3 h-3" /> {dateStr}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate(`watch?type=${item.type}&id=${item.id}`);
                    }}
                    className="p-2 rounded-full bg-[var(--color-primary)]/20 text-[var(--color-primary)] group-hover:bg-[var(--color-primary)] group-hover:text-black transition-all"
                  >
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      watchHistoryStore.removeItem(item.id, item.type);
                      toast.info(`Removed from history`);
                    }}
                    className="p-2 rounded-full text-slate-500 hover:text-rose-400 hover:bg-white/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-20 text-center glass-panel rounded-3xl space-y-4">
          <History className="w-12 h-12 text-slate-600 mx-auto" />
          <p className="text-slate-400 text-sm">Your watch history is currently empty.</p>
        </div>
      )}
    </div>
  );
};
