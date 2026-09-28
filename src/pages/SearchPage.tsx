import React, { useState, useEffect } from 'react';
import { tmdb, getProfileUrl } from '../services/tmdb';
import { MediaItem, Person, MediaType } from '../types';
import { MovieCard } from '../components/MovieCard';
import { recentSearchStore } from '../services/store';
import { Search, Sparkles, User, History, Trash2 } from 'lucide-react';

interface SearchPageProps {
  route: string;
  onNavigate: (route: string) => void;
  onOpenAiConcierge: () => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({ route, onNavigate, onOpenAiConcierge }) => {
  const queryParams = new URLSearchParams(route.split('?')[1] || '');
  const initialQuery = queryParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<'all' | 'movie' | 'tv' | 'person'>('all');
  const [results, setResults] = useState<MediaItem[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return recentSearchStore.subscribe((items) => setRecentSearches(items));
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setPeople([]);
      return;
    }

    recentSearchStore.addSearch(query);

    async function performSearch() {
      setLoading(true);
      try {
        if (activeTab === 'movie') {
          const res = await tmdb.searchMovies(query);
          setResults((res.results || []).map((m) => ({ ...m, media_type: 'movie' })));
        } else if (activeTab === 'tv') {
          const res = await tmdb.searchTv(query);
          setResults((res.results || []).map((t) => ({ ...t, media_type: 'tv' })));
        } else if (activeTab === 'person') {
          const res = await tmdb.searchPeople(query);
          setPeople(res.results || []);
        } else {
          const res = await tmdb.searchMulti(query);
          const media = (res.results || []).filter((item) => item.media_type === 'movie' || item.media_type === 'tv');
          setResults(media);
        }
      } catch (err) {
        
      } finally {
        setLoading(false);
      }
    }

    performSearch();
  }, [query, activeTab]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onNavigate(`search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
        <h1 className="text-2xl sm:text-3xl font-black text-white">Search MovieBox Catalog</h1>
        <p className="text-xs text-slate-400">Search over 800,000+ movies, TV series, actors, and directors</p>

        <form onSubmit={handleSearchSubmit} className="relative max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Type a title, actor name, or genre..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-12 pr-28 py-3 bg-white/5 border border-white/10 text-white rounded-2xl text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-xl bg-[var(--color-primary)] text-black font-bold text-xs hover:brightness-110"
          >
            Search
          </button>
        </form>

        {recentSearches.length > 0 && (
          <div className="pt-2 flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-400 flex items-center gap-1 font-bold">
              <History className="w-3.5 h-3.5 text-slate-400" /> Recent:
            </span>
            {recentSearches.map((s, idx) => (
              <span
                key={idx}
                onClick={() => {
                  setQuery(s);
                  onNavigate(`search?q=${encodeURIComponent(s)}`);
                }}
                className="px-2.5 py-1 rounded-full text-xs bg-white/5 hover:bg-white/10 text-slate-300 cursor-pointer border border-white/5 transition-colors flex items-center gap-1"
              >
                {s}
              </span>
            ))}
            <button
              onClick={() => recentSearchStore.clear()}
              className="text-[11px] text-rose-400 hover:underline flex items-center gap-1 ml-2"
            >
              <Trash2 className="w-3 h-3" /> Clear
            </button>
          </div>
        )}
      </div>

      {query.trim() && (
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          {(['all', 'movie', 'tv', 'person'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                activeTab === tab
                  ? 'bg-[var(--color-primary)] text-black shadow-md shadow-[var(--color-primary-glow)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab === 'all' ? 'All Results' : tab === 'movie' ? 'Movies' : tab === 'tv' ? 'TV Series' : 'People'}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="aspect-[2/3] w-full rounded-2xl skeleton-shimmer" />
          ))}
        </div>
      ) : activeTab === 'person' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {people.map((p) => (
            <div
              key={p.id}
              onClick={() => onNavigate(`person?id=${p.id}`)}
              className="glass-panel p-4 rounded-2xl text-center cursor-pointer group hover:border-[var(--color-primary)] transition-all"
            >
              <img
                src={getProfileUrl(p.profile_path)}
                alt={p.name}
                className="w-24 h-24 rounded-full object-cover mx-auto mb-3 border-2 border-white/10 group-hover:border-[var(--color-primary)]"
              />
              <div className="text-xs font-bold text-white group-hover:text-[var(--color-primary)]">{p.name}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">{p.known_for_department || 'Artist'}</div>
            </div>
          ))}
        </div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {results.map((item) => (
            <MovieCard
              key={`${item.media_type}-${item.id}`}
              media={item}
              onSelect={(m) => onNavigate(`watch?type=${m.media_type || 'movie'}&id=${m.id}`)}
            />
          ))}
        </div>
      ) : query.trim() ? (
        <div className="py-16 text-center glass-panel rounded-3xl space-y-4">
          <p className="text-slate-400 text-sm">No results found for "{query}".</p>
          <p className="text-xs text-slate-500">Try checking spelling or ask Gemini AI for smart movie suggestions.</p>
          <button
            onClick={onOpenAiConcierge}
            className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-primary)] text-white text-xs font-bold shadow-lg shadow-[var(--color-primary-glow)] inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" /> Ask Gemini AI
          </button>
        </div>
      ) : null}
    </div>
  );
};
