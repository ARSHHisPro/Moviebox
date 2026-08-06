import React, { useState } from 'react';
import { Sparkles, X, Shuffle, Film, Play } from 'lucide-react';
import { MediaItem } from '../types';
import { tmdb } from '../services/tmdb';

interface SurpriseWheelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToWatch: (mediaId: number, mediaType: 'movie' | 'tv') => void;
}

export const SurpriseWheelModal: React.FC<SurpriseWheelModalProps> = ({
  isOpen,
  onClose,
  onNavigateToWatch
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<MediaItem | null>(null);

  if (!isOpen) return null;

  const handleSpin = async () => {
    setIsSpinning(true);
    setSelectedMovie(null);

    try {
      const res = await tmdb.getPopularMovies(Math.floor(Math.random() * 5) + 1);
      const results = res.results || [];
      if (results.length > 0) {
        setTimeout(() => {
          const randomIndex = Math.floor(Math.random() * results.length);
          setSelectedMovie(results[randomIndex]);
          setIsSpinning(false);
        }, 1500);
      }
    } catch (e) {
      setIsSpinning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg glass-panel border border-[var(--color-primary)]/40 rounded-3xl overflow-hidden flex flex-col max-h-[90vh] shadow-2xl text-center">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--color-primary)]/20 text-[var(--color-primary)] border border-[var(--color-primary)]/30 flex items-center justify-center">
              <Shuffle className="w-5 h-5 animate-spin" />
            </div>
            <div className="text-left">
              <h2 className="font-extrabold text-white text-base sm:text-lg">
                Random Movie Roulette
              </h2>
              <p className="text-xs text-slate-400">Can't decide what to watch? Spin the wheel!</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Roulette Wheel Body */}
        <div className="p-8 space-y-6">
          {!selectedMovie ? (
            <div className="space-y-6">
              <div className={`w-32 h-32 mx-auto rounded-full border-4 border-dashed border-[var(--color-primary)] flex items-center justify-center bg-black/40 shadow-2xl transition-all ${isSpinning ? 'animate-spin border-cyan-400' : ''}`}>
                <Film className="w-12 h-12 text-[var(--color-primary)]" />
              </div>

              <p className="text-xs text-slate-400">Press Spin to pick a surprise top-rated cinematic hit!</p>

              <button
                onClick={handleSpin}
                disabled={isSpinning}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-primary)] text-white font-extrabold text-sm shadow-xl hover:brightness-110 disabled:opacity-50"
              >
                {isSpinning ? 'Spinning Roulette...' : 'Spin The Wheel 🎲'}
              </button>
            </div>
          ) : (
            <div className="space-y-5 animate-in zoom-in-95 duration-200">
              <span className="text-[10px] px-3 py-1 rounded-full bg-[var(--color-primary)]/20 text-[var(--color-primary)] font-bold uppercase border border-[var(--color-primary)]/30">
                🎉 Your Surprise Pick!
              </span>

              {selectedMovie.poster_path && (
                <img
                  src={`https://image.tmdb.org/t/p/w342${selectedMovie.poster_path}`}
                  alt={selectedMovie.title}
                  className="w-36 h-52 object-cover rounded-2xl border border-white/20 mx-auto shadow-2xl"
                />
              )}

              <div>
                <h3 className="text-xl font-black text-white">{selectedMovie.title || selectedMovie.name}</h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{selectedMovie.overview}</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSpin}
                  className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs"
                >
                  Spin Again
                </button>
                <button
                  onClick={() => {
                    onNavigateToWatch(selectedMovie.id, 'movie');
                    onClose();
                  }}
                  className="flex-1 py-3 rounded-xl bg-[var(--color-primary)] text-black font-extrabold text-xs flex items-center justify-center gap-1.5"
                >
                  <Play className="w-4 h-4 fill-black" /> Watch Now
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
