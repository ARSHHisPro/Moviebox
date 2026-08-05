import React, { useState, useEffect } from 'react';
import { tmdb } from '../services/tmdb';
import { Genre } from '../types';
import { Layers, Film, Tv } from 'lucide-react';

interface GenresPageProps {
  onNavigate: (route: string) => void;
}

const GENRE_GRADIENTS = [
  'from-rose-600 to-orange-500',
  'from-purple-600 to-indigo-500',
  'from-cyan-500 to-blue-600',
  'from-emerald-500 to-teal-700',
  'from-amber-500 to-red-600',
  'from-fuchsia-600 to-pink-500',
  'from-violet-600 to-purple-800',
  'from-blue-600 to-cyan-500',
];

export const GenresPage: React.FC<GenresPageProps> = ({ onNavigate }) => {
  const [movieGenres, setMovieGenres] = useState<Genre[]>([]);
  const [tvGenres, setTvGenres] = useState<Genre[]>([]);
  const [activeTab, setActiveTab] = useState<'movie' | 'tv'>('movie');

  useEffect(() => {
    tmdb.getAllGenres().then(({ movieGenres, tvGenres }) => {
      setMovieGenres(movieGenres);
      setTvGenres(tvGenres);
    });
  }, []);

  const genres = activeTab === 'movie' ? movieGenres : tvGenres;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-[var(--color-primary)] font-bold text-xs uppercase tracking-widest">
            <Layers className="w-4 h-4" /> Categorized Catalog
          </div>
          <h1 className="text-3xl font-extrabold text-white mt-1">Explore Genres</h1>
          <p className="text-xs text-slate-400 mt-0.5">Browse titles by theme, mood, and cinematic style</p>
        </div>

        <div className="flex items-center gap-2 p-1 glass-panel rounded-xl">
          <button
            onClick={() => setActiveTab('movie')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'movie' ? 'bg-[var(--color-primary)] text-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Film className="w-4 h-4" /> Movie Genres
          </button>
          <button
            onClick={() => setActiveTab('tv')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'tv' ? 'bg-[var(--color-primary)] text-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Tv className="w-4 h-4" /> TV Genres
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {genres.map((g, idx) => {
          const gradient = GENRE_GRADIENTS[idx % GENRE_GRADIENTS.length];
          return (
            <div
              key={g.id}
              onClick={() => onNavigate(`genre?id=${g.id}&name=${encodeURIComponent(g.name)}&type=${activeTab}`)}
              className={`relative h-32 rounded-3xl p-6 cursor-pointer overflow-hidden bg-gradient-to-br ${gradient} shadow-lg hover:scale-105 active:scale-95 transition-all flex flex-col justify-end group`}
            >
              <div className="absolute top-3 right-3 p-2 rounded-full bg-black/20 backdrop-blur-md opacity-60 group-hover:opacity-100 transition-opacity">
                <Layers className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-black text-white drop-shadow-md">{g.name}</h3>
              <span className="text-[10px] text-white/80 font-bold tracking-wider uppercase mt-1">Explore Catalog →</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
