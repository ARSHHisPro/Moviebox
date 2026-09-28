import React, { useState, useEffect } from 'react';
import { Play, Info, Star, Heart, Calendar, Sparkles } from 'lucide-react';
import { MediaItem, MediaType } from '../types';
import { getBackdropUrl } from '../services/tmdb';
import { favoritesStore } from '../services/store';
import { toast } from '../services/toast';

interface HeroBannerProps {
  items: MediaItem[];
  onPlay: (item: MediaItem) => void;
  onOpenTrailer: (item: MediaItem) => void;
  onOpenDetails: (item: MediaItem) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ items, onPlay, onOpenTrailer, onOpenDetails }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [items.length]);

  if (!items || items.length === 0) return null;

  const currentItem = items[currentIndex];
  const type: MediaType = currentItem.media_type || (currentItem.first_air_date ? 'tv' : 'movie');
  const title = currentItem.title || currentItem.name || 'Untitled';
  const releaseDate = currentItem.release_date || currentItem.first_air_date || '';
  const year = releaseDate ? releaseDate.substring(0, 4) : '';
  const rating = currentItem.vote_average ? Math.round(currentItem.vote_average * 10) / 10 : null;

  const [isFav, setIsFav] = useState(favoritesStore.isFavorite(currentItem.id, type));

  useEffect(() => {
    setIsFav(favoritesStore.isFavorite(currentItem.id, type));
    const unsub = favoritesStore.subscribe(() => {
      setIsFav(favoritesStore.isFavorite(currentItem.id, type));
    });
    return () => unsub();
  }, [currentItem.id, type]);

  const handleToggleFav = () => {
    const added = favoritesStore.toggleFavorite(currentItem);
    setIsFav(added);
    if (added) toast.success(`Added "${title}" to Favorites`);
    else toast.info(`Removed "${title}" from Favorites`);
  };

  return (
    <div className="relative w-full h-[500px] sm:h-[540px] rounded-[2.5rem] overflow-hidden flex items-end p-6 sm:p-10 shadow-2xl group border border-white/5 mb-10">
      
      <div className="absolute inset-0">
        <img
          src={getBackdropUrl(currentItem.backdrop_path)}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-[#020202]/50 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#020202] via-[#020202]/70 to-transparent z-10" />
      </div>

      <div className="relative z-20 max-w-2xl">

        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="px-2.5 py-0.5 rounded-full bg-[#00d2ff] text-black text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#00d2ff]/20">
            Hot Now
          </span>
          <span className="text-xs sm:text-sm font-medium text-white/80">
            • {type === 'movie' ? 'Movie' : 'TV Series'} {year ? `• ${year}` : ''}
          </span>
          {rating && (
            <span className="text-xs font-bold text-[#00d2ff] bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/10 ml-1">
              ★ {rating}
            </span>
          )}
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-none mb-4 uppercase">
          {title}
        </h1>

        <p className="text-xs sm:text-sm text-white/70 max-w-xl line-clamp-3 mb-6 font-normal leading-relaxed">
          {currentItem.overview || 'Experience this thrilling trending visual content on MovieBox+.'}
        </p>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onPlay(currentItem)}
            className="flex items-center gap-2 px-8 py-3 bg-[#00d2ff] text-black rounded-full font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-[#00d2ff]/30 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-black" />
            Watch Now
          </button>

          <button
            onClick={() => onOpenTrailer(currentItem)}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white text-xs font-bold uppercase tracking-wider hover:bg-white/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#00d2ff]" />
            Trailer
          </button>

          <button
            onClick={() => onOpenDetails(currentItem)}
            className="w-11 h-11 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white hover:bg-white/20 transition-all cursor-pointer"
            title="Details"
          >
            <Info className="w-4 h-4" />
          </button>

          <button
            onClick={handleToggleFav}
            className={`w-11 h-11 flex items-center justify-center rounded-full backdrop-blur-md border transition-all cursor-pointer ${
              isFav
                ? 'bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-500/40'
                : 'bg-white/10 border-white/10 text-white hover:bg-white/20'
            }`}
            title="Toggle Favorite"
          >
            <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      <div className="absolute bottom-6 right-8 z-20 flex items-center gap-2">
        {items.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-2 rounded-full transition-all cursor-pointer ${
              idx === currentIndex
                ? 'w-6 bg-[#00d2ff] shadow-md shadow-[#00d2ff]/50'
                : 'w-2 bg-white/30 hover:bg-white/60'
            }`}
            aria-label={`Slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
