import React, { useState, useEffect } from 'react';
import { tmdb } from '../services/tmdb';
import { MediaItem, Genre, FilterState } from '../types';
import { MovieCard } from '../components/MovieCard';
import { Tv, Filter, Grid, List, ChevronLeft, ChevronRight } from 'lucide-react';

interface TvShowsPageProps {
  onNavigate: (route: string) => void;
}

export const TvShowsPage: React.FC<TvShowsPageProps> = ({ onNavigate }) => {
  const [shows, setShows] = useState<MediaItem[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [filters, setFilters] = useState<FilterState>({
    genreId: '',
    sortBy: 'popularity.desc',
    yearFrom: '',
    ratingMin: 0,
  });

  useEffect(() => {
    tmdb.getGenres('tv').then((g) => setGenres(g)).catch(() => {});
  }, []);

  useEffect(() => {
    async function loadTvShows() {
      setLoading(true);
      try {
        const res = await tmdb.discoverMedia('tv', filters, page);
        setShows(res.results || []);
        setTotalPages(Math.min(res.total_pages || 1, 500));
      } catch (err) {
        console.error('Error discovering TV shows', err);
      } finally {
        setLoading(false);
      }
    }
    loadTvShows();
  }, [filters, page]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-[var(--color-primary)] font-bold text-xs uppercase tracking-widest">
            <Tv className="w-4 h-4" /> Television Series
          </div>
          <h1 className="text-3xl font-extrabold text-white mt-1">Explore TV Series</h1>
          <p className="text-xs text-slate-400 mt-0.5">Stream episodic series, anime, docuseries, and serial dramas</p>
        </div>

        <div className="flex items-center gap-2 p-1 glass-panel rounded-xl">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === 'grid' ? 'bg-[var(--color-primary)] text-black font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Grid className="w-4 h-4" /> Grid
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === 'list' ? 'bg-[var(--color-primary)] text-black font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <List className="w-4 h-4" /> List
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center gap-2 text-slate-300 font-bold">
          <Filter className="w-4 h-4 text-[var(--color-primary)]" />
          Filter By:
        </div>

        <select
          value={filters.genreId || ''}
          onChange={(e) => {
            setFilters({ ...filters, genreId: e.target.value });
            setPage(1);
          }}
          className="bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 focus:outline-none focus:border-[var(--color-primary)]"
        >
          <option value="" className="bg-slate-900">All TV Genres</option>
          {genres.map((g) => (
            <option key={g.id} value={g.id} className="bg-slate-900">
              {g.name}
            </option>
          ))}
        </select>

        <select
          value={filters.sortBy}
          onChange={(e) => {
            setFilters({ ...filters, sortBy: e.target.value });
            setPage(1);
          }}
          className="bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 focus:outline-none focus:border-[var(--color-primary)]"
        >
          <option value="popularity.desc" className="bg-slate-900">Most Popular</option>
          <option value="vote_average.desc" className="bg-slate-900">Top Rated</option>
          <option value="first_air_date.desc" className="bg-slate-900">Recently Premiered</option>
        </select>

        <select
          value={filters.ratingMin || 0}
          onChange={(e) => {
            setFilters({ ...filters, ratingMin: Number(e.target.value) });
            setPage(1);
          }}
          className="bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 focus:outline-none focus:border-[var(--color-primary)]"
        >
          <option value={0} className="bg-slate-900">Any Rating</option>
          <option value={8} className="bg-slate-900">8.0+ Acclaimed</option>
          <option value={7} className="bg-slate-900">7.0+ High Quality</option>
        </select>
      </div>

      {/* Show Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="aspect-[2/3] w-full rounded-2xl skeleton-shimmer" />
          ))}
        </div>
      ) : shows.length > 0 ? (
        <div className={viewMode === 'grid' ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4" : "space-y-3"}>
          {shows.map((s) => (
            <MovieCard
              key={s.id}
              media={{ ...s, media_type: 'tv' }}
              onSelect={(item) => onNavigate(`watch?type=tv&id=${item.id}`)}
            />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center glass-panel rounded-3xl space-y-3">
          <p className="text-slate-400 text-sm">No TV shows match your filters.</p>
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex items-center justify-between pt-6 border-t border-white/10">
        <button
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-40 text-xs font-semibold text-white flex items-center gap-1.5"
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>

        <span className="text-xs text-slate-400 font-medium">
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
