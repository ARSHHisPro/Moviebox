import React, { useState, useEffect } from 'react';
import { tmdb } from '../services/tmdb';
import { MediaItem, Genre, FilterState } from '../types';
import { MovieCard } from '../components/MovieCard';
import { Film, Filter, Grid, List, ChevronLeft, ChevronRight } from 'lucide-react';

interface MoviesPageProps {
  onNavigate: (route: string) => void;
}

export const MoviesPage: React.FC<MoviesPageProps> = ({ onNavigate }) => {
  const [movies, setMovies] = useState<MediaItem[]>([]);
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
    tmdb.getGenres('movie').then((g) => setGenres(g)).catch(() => {});
  }, []);

  useEffect(() => {
    async function loadMovies() {
      setLoading(true);
      try {
        const res = await tmdb.discoverMedia('movie', filters, page);
        setMovies(res.results || []);
        setTotalPages(Math.min(res.total_pages || 1, 500));
      } catch (err) {
        console.error('Error discovering movies', err);
      } finally {
        setLoading(false);
      }
    }
    loadMovies();
  }, [filters, page]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-[var(--color-primary)] font-bold text-xs uppercase tracking-widest">
            <Film className="w-4 h-4" /> Feature Films
          </div>
          <h1 className="text-3xl font-extrabold text-white mt-1">Explore Movies</h1>
          <p className="text-xs text-slate-400 mt-0.5">Discover blockbusters, indies, and classics from around the globe</p>
        </div>

        {/* View mode toggle */}
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

        {/* Genre Dropdown */}
        <select
          value={filters.genreId || ''}
          onChange={(e) => {
            setFilters({ ...filters, genreId: e.target.value });
            setPage(1);
          }}
          className="bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 focus:outline-none focus:border-[var(--color-primary)]"
        >
          <option value="" className="bg-slate-900">All Genres</option>
          {genres.map((g) => (
            <option key={g.id} value={g.id} className="bg-slate-900">
              {g.name}
            </option>
          ))}
        </select>

        {/* Sort Dropdown */}
        <select
          value={filters.sortBy}
          onChange={(e) => {
            setFilters({ ...filters, sortBy: e.target.value });
            setPage(1);
          }}
          className="bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 focus:outline-none focus:border-[var(--color-primary)]"
        >
          <option value="popularity.desc" className="bg-slate-900">Most Popular</option>
          <option value="vote_average.desc" className="bg-slate-900">Highest Rated</option>
          <option value="primary_release_date.desc" className="bg-slate-900">Newest Releases</option>
          <option value="revenue.desc" className="bg-slate-900">Top Box Office</option>
        </select>

        {/* Release Year Dropdown */}
        <select
          value={filters.yearFrom || ''}
          onChange={(e) => {
            setFilters({ ...filters, yearFrom: e.target.value });
            setPage(1);
          }}
          className="bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 focus:outline-none focus:border-[var(--color-primary)]"
        >
          <option value="" className="bg-slate-900">Any Year</option>
          <option value="2025" className="bg-slate-900">2025</option>
          <option value="2024" className="bg-slate-900">2024</option>
          <option value="2023" className="bg-slate-900">2023</option>
          <option value="2020" className="bg-slate-900">2020s</option>
          <option value="2010" className="bg-slate-900">2010s</option>
          <option value="2000" className="bg-slate-900">2000s</option>
        </select>

        {/* Rating Filter */}
        <select
          value={filters.ratingMin || 0}
          onChange={(e) => {
            setFilters({ ...filters, ratingMin: Number(e.target.value) });
            setPage(1);
          }}
          className="bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 focus:outline-none focus:border-[var(--color-primary)]"
        >
          <option value={0} className="bg-slate-900">Any Rating</option>
          <option value={8} className="bg-slate-900">8.0+ Exceptional</option>
          <option value={7} className="bg-slate-900">7.0+ Great</option>
          <option value={6} className="bg-slate-900">6.0+ Good</option>
        </select>

        {(filters.genreId || filters.yearFrom || filters.ratingMin || filters.sortBy !== 'popularity.desc') && (
          <button
            onClick={() => {
              setFilters({ genreId: '', sortBy: 'popularity.desc', yearFrom: '', ratingMin: 0 });
              setPage(1);
            }}
            className="text-xs text-[var(--color-primary)] hover:underline ml-auto"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="aspect-[2/3] w-full rounded-2xl skeleton-shimmer" />
          ))}
        </div>
      ) : movies.length > 0 ? (
        <div className={viewMode === 'grid' ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4" : "space-y-3"}>
          {movies.map((m) => (
            <MovieCard
              key={m.id}
              media={{ ...m, media_type: 'movie' }}
              onSelect={(item) => onNavigate(`watch?type=movie&id=${item.id}`)}
            />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center glass-panel rounded-3xl space-y-3">
          <p className="text-slate-400 text-sm">No movies match your selected filter criteria.</p>
          <button
            onClick={() => setFilters({ genreId: '', sortBy: 'popularity.desc', yearFrom: '', ratingMin: 0 })}
            className="px-4 py-2 rounded-full bg-[var(--color-primary)]/20 text-[var(--color-primary)] text-xs font-bold border border-[var(--color-primary)]/30"
          >
            Reset All Filters
          </button>
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
