import React, { useState, useEffect } from 'react';
import { tmdb, getProfileUrl } from '../services/tmdb';
import { MediaDetails, MediaItem, MediaType } from '../types';
import { Player } from '../components/Player';
import { Carousel } from '../components/Carousel';
import { MovieCard } from '../components/MovieCard';
import { Star, Calendar, Clock, Film, Sparkles, Heart, Users, Ticket, FolderPlus, MessageSquare } from 'lucide-react';
import { favoritesStore } from '../services/store';
import { toast } from '../services/toast';

import { WatchPartyModal } from '../components/WatchPartyModal';
import { VipTicketModal } from '../components/VipTicketModal';
import { CustomPlaylistModal } from '../components/CustomPlaylistModal';
import { CommunityReviewsModal } from '../components/CommunityReviewsModal';

interface WatchPageProps {
  route: string;
  onNavigate: (route: string) => void;
  onOpenTrailer: (item: MediaItem) => void;
}

export const WatchPage: React.FC<WatchPageProps> = ({ route, onNavigate, onOpenTrailer }) => {
  const queryParams = new URLSearchParams(route.split('?')[1] || '');
  const type: MediaType = (queryParams.get('type') as MediaType) || 'movie';
  const id = Number(queryParams.get('id')) || 550;
  const season = Number(queryParams.get('s')) || 1;
  const episode = Number(queryParams.get('e')) || 1;

  const [details, setDetails] = useState<MediaDetails | null>(null);
  const [loading, setLoading] = useState(true);

  const [watchPartyOpen, setWatchPartyOpen] = useState(false);
  const [vipTicketOpen, setVipTicketOpen] = useState(false);
  const [playlistOpen, setPlaylistOpen] = useState(false);
  const [reviewsOpen, setReviewsOpen] = useState(false);

  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    async function loadWatchDetails() {
      setLoading(true);
      try {
        const res = await tmdb.getMediaDetails(type, id);
        setDetails(res);
        setIsFav(favoritesStore.isFavorite(res.id, type));
      } catch (err) {
        
      } finally {
        setLoading(false);
      }
    }
    loadWatchDetails();
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const unsub = favoritesStore.subscribe(() => {
      setIsFav(favoritesStore.isFavorite(id, type));
    });
    return () => unsub();
  }, [type, id]);

  if (loading || !details) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-6">
        <div className="w-full h-[75vh] rounded-3xl skeleton-shimmer" />
        <div className="w-1/3 h-8 rounded-md skeleton-shimmer" />
        <div className="w-2/3 h-16 rounded-md skeleton-shimmer" />
      </div>
    );
  }

  const title = details.title || details.name || 'Untitled';
  const releaseDate = details.release_date || details.first_air_date || '';
  const year = releaseDate ? releaseDate.substring(0, 4) : '';
  const rating = details.vote_average ? Math.round(details.vote_average * 10) / 10 : null;
  const runtimeStr = details.runtime ? `${Math.floor(details.runtime / 60)}h ${details.runtime % 60}m` : null;

  const handleToggleFav = () => {
    const added = favoritesStore.toggleFavorite(details);
    setIsFav(added);
    if (added) toast.success(`Added "${title}" to Favorites`);
    else toast.info(`Removed "${title}" from Favorites`);
  };

  const similarItems = details.similar?.results || details.recommendations?.results || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">

      <Player
        media={details}
        type={type}
        initialSeason={season}
        initialEpisode={episode}
        onBack={() => onNavigate('home')}
      />

      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
        <div className="flex flex-col md:flex-row items-start justify-between gap-6">
          <div className="space-y-3 flex-1">

            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[var(--color-primary)] text-black">
                {type === 'movie' ? 'Movie' : 'TV Series'}
              </span>
              {year && (
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/10 text-slate-300 border border-white/10 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {year}
                </span>
              )}
              {runtimeStr && (
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/10 text-slate-300 border border-white/10 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {runtimeStr}
                </span>
              )}
              {rating && (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  {rating} / 10
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">{title}</h1>
            {details.tagline && (
              <p className="text-sm font-semibold text-[var(--color-primary)] italic">"{details.tagline}"</p>
            )}

            <p className="text-sm text-slate-300 leading-relaxed max-w-4xl">{details.overview}</p>

            {details.genres && details.genres.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mr-1">Genres:</span>
                {details.genres.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => onNavigate(`genre?id=${g.id}&name=${encodeURIComponent(g.name)}`)}
                    className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 text-xs text-slate-200 border border-white/10 transition-colors"
                  >
                    {g.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0 pt-2">
            <button
              onClick={handleToggleFav}
              className={`px-4 py-2.5 rounded-full text-xs font-bold border transition-all flex items-center gap-2 ${
                isFav
                  ? 'bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-500/40'
                  : 'bg-white/5 border-white/10 text-slate-200 hover:bg-white/10'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
              {isFav ? 'Favorited' : 'Add Favorite'}
            </button>

            <button
              onClick={() => setWatchPartyOpen(true)}
              className="px-4 py-2.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/10"
            >
              <Users className="w-4 h-4" /> Host Watch Party
            </button>

            <button
              onClick={() => setVipTicketOpen(true)}
              className="px-4 py-2.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-amber-500/10"
            >
              <Ticket className="w-4 h-4" /> VIP Pass
            </button>

            <button
              onClick={() => setPlaylistOpen(true)}
              className="px-4 py-2.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 hover:bg-purple-500/30 text-xs font-bold transition-all flex items-center gap-2"
            >
              <FolderPlus className="w-4 h-4" /> Custom Playlist
            </button>

            <button
              onClick={() => setReviewsOpen(true)}
              className="px-4 py-2.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 text-xs font-bold transition-all flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" /> Reviews
            </button>

            {details.videos?.results?.[0] && (
              <button
                onClick={() => onOpenTrailer(details)}
                className="px-4 py-2.5 rounded-full bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-primary)] text-white text-xs font-bold shadow-lg shadow-[var(--color-primary-glow)] transition-all flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" /> Trailer
              </button>
            )}
          </div>
        </div>

        {details.credits?.cast && details.credits.cast.length > 0 && (
          <div className="pt-6 border-t border-white/10">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4">Top Cast</h3>
            <div className="flex gap-4 overflow-x-auto scrollbar-none pb-2">
              {details.credits.cast.slice(0, 12).map((actor) => (
                <div
                  key={actor.id}
                  onClick={() => onNavigate(`person?id=${actor.id}`)}
                  className="flex-shrink-0 w-28 text-center cursor-pointer group"
                >
                  <img
                    src={getProfileUrl(actor.profile_path)}
                    alt={actor.name}
                    className="w-20 h-20 rounded-full object-cover mx-auto mb-2 border-2 border-white/10 group-hover:border-[var(--color-primary)] transition-all"
                  />
                  <div className="text-xs font-bold text-white line-clamp-1 group-hover:text-[var(--color-primary)]">
                    {actor.name}
                  </div>
                  <div className="text-[10px] text-slate-400 line-clamp-1">{actor.character}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {similarItems.length > 0 && (
        <Carousel title="More Like This" subtitle="Similar recommendations" icon={Film}>
          {similarItems.slice(0, 15).map((item) => (
            <MovieCard
              key={item.id}
              media={{ ...item, media_type: type }}
              onSelect={(m) => onNavigate(`watch?type=${type}&id=${m.id}`)}
            />
          ))}
        </Carousel>
      )}

      <WatchPartyModal
        isOpen={watchPartyOpen}
        onClose={() => setWatchPartyOpen(false)}
        mediaItem={{
          id: details.id,
          title,
          type,
          poster: details.poster_path ? `https://image.tmdb.org/t/p/w342${details.poster_path}` : null,
          year
        }}
        onNavigateToWatch={(mId, mType, roomId) => {
          setWatchPartyOpen(false);
          onNavigate(`watch?type=${mType}&id=${mId}${roomId ? `&room=${roomId}` : ''}`);
        }}
      />

      <VipTicketModal
        isOpen={vipTicketOpen}
        onClose={() => setVipTicketOpen(false)}
        mediaItem={{
          id: details.id,
          title,
          type,
          poster: details.poster_path ? `https://image.tmdb.org/t/p/w342${details.poster_path}` : null,
          year
        }}
      />

      <CustomPlaylistModal
        isOpen={playlistOpen}
        onClose={() => setPlaylistOpen(false)}
        mediaItem={{
          id: details.id,
          title,
          type,
          poster: details.poster_path ? `https://image.tmdb.org/t/p/w342${details.poster_path}` : null,
          year
        }}
      />

      <CommunityReviewsModal
        isOpen={reviewsOpen}
        onClose={() => setReviewsOpen(false)}
        mediaId={details.id}
        mediaTitle={title}
      />
    </div>
  );
};
