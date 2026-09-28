import React, { useState, useEffect } from 'react';
import { Heart, Play, Star, Calendar, Lock, ShieldAlert } from 'lucide-react';
import { MediaItem, MediaType } from '../types';
import { getPosterUrl } from '../services/tmdb';
import { favoritesStore } from '../services/store';
import { lockStore } from '../services/lockStore';
import { toast } from '../services/toast';

interface MovieCardProps {
  media: MediaItem;
  onSelect: (media: MediaItem) => void;
  progress?: number;
}

export const MovieCard: React.FC<MovieCardProps> = ({ media, onSelect, progress }) => {
  const type: MediaType = media.media_type || (media.first_air_date ? 'tv' : 'movie');
  const title = media.title || media.name || 'Untitled';
  const releaseDate = media.release_date || media.first_air_date || '';
  const year = releaseDate ? releaseDate.substring(0, 4) : 'N/A';
  const rating = media.vote_average ? Math.round(media.vote_average * 10) / 10 : null;

  const [isFav, setIsFav] = useState(favoritesStore.isFavorite(media.id, type));
  const [lockStatus, setLockStatus] = useState(lockStore.isMovieLocked(media.id));

  useEffect(() => {
    const unsubFav = favoritesStore.subscribe(() => {
      setIsFav(favoritesStore.isFavorite(media.id, type));
    });
    const unsubLock = lockStore.subscribe(() => {
      setLockStatus(lockStore.isMovieLocked(media.id));
    });
    return () => {
      unsubFav();
      unsubLock();
    };
  }, [media.id, type]);

  const handleCardClick = () => {
    if (lockStatus.isLocked) {
      toast.error(`"${title}" is locked by the Owner!`, 'Access Denied');
      return;
    }
    onSelect(media);
  };

  const handleToggleFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    const added = favoritesStore.toggleFavorite(media);
    setIsFav(added);
    if (added) {
      toast.success(`Added "${title}" to Favorites`, 'Saved');
    } else {
      toast.info(`Removed "${title}" from Favorites`, 'Removed');
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group relative flex-shrink-0 w-44 sm:w-52 md:w-56 flex flex-col cursor-pointer select-none ${
        lockStatus.isLocked ? 'opacity-90' : ''
      }`}
    >
      
      <div className="relative aspect-[2/3] w-full rounded-3xl overflow-hidden mb-2.5 border border-white/5 bg-[#111] shadow-lg group-hover:border-[#00d2ff]/40 transition-all duration-300">
        <img
          src={getPosterUrl(media.poster_path)}
          alt={title}
          loading="lazy"
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
            lockStatus.isLocked ? 'grayscale blur-[2px]' : ''
          }`}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 opacity-70 group-hover:opacity-90 transition-opacity" />

        {lockStatus.isLocked && (
          <div className="absolute inset-0 z-30 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center p-3 text-center border-2 border-rose-500/50 rounded-3xl animate-in fade-in duration-300">
            
            <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#rose_500_1px,transparent_1px)] [background-size:16px_16px]" />
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-600 to-amber-500 p-0.5 shadow-xl shadow-rose-500/40 mb-2 animate-bounce">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Lock className="w-6 h-6 text-rose-500" />
              </div>
            </div>
            <span className="px-2 py-0.5 bg-rose-500/30 text-rose-300 border border-rose-500/50 rounded-full text-[9px] font-black uppercase tracking-wider mb-1">
              Locked by Owner
            </span>
            <p className="text-[10px] text-white/80 font-bold line-clamp-2">
              {lockStatus.reason || 'Restricted Content'}
            </p>
          </div>
        )}

        {!lockStatus.isLocked && (
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
            <span className="px-2 py-0.5 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-bold uppercase tracking-wider text-white/80 border border-white/10">
              {type}
            </span>

            <div className="flex items-center gap-1.5">
              {rating !== null && (
                <span className="px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-xs font-black text-[#00d2ff] border border-white/10 shadow-sm">
                  ★ {rating}
                </span>
              )}
              <button
                onClick={handleToggleFav}
                className={`p-1.5 rounded-lg backdrop-blur-md transition-all z-20 ${
                  isFav
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-500/50 scale-105'
                    : 'bg-black/60 text-white/70 hover:text-rose-400 hover:scale-105'
                }`}
                title={isFav ? "Remove from Favorites" : "Add to Favorites"}
              >
                <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
              </button>
            </div>
          </div>
        )}

        {!lockStatus.isLocked && (
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
            <div className="w-12 h-12 rounded-full bg-[#00d2ff] flex items-center justify-center scale-75 group-hover:scale-100 transition-transform duration-300 shadow-xl shadow-[#00d2ff]/30">
              <Play className="w-5 h-5 fill-black ml-0.5 text-black" />
            </div>
          </div>
        )}

        {progress !== undefined && progress > 0 && !lockStatus.isLocked && (
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/60 z-20">
            <div
              className="h-full bg-[#00d2ff] shadow-sm"
              style={{ width: `${Math.min(100, Math.max(0, progress * 100))}%` }}
            />
          </div>
        )}
      </div>

      <h3 className="font-bold truncate text-sm text-white uppercase tracking-tight group-hover:text-[#00d2ff] transition-colors">
        {title}
      </h3>
      <p className="text-xs text-white/40 font-medium mt-0.5">
        {year !== 'N/A' ? year : '2024'} • {type === 'movie' ? 'Movie' : 'TV Series'}
      </p>
    </div>
  );
};

