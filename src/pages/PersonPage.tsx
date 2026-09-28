import React, { useState, useEffect } from 'react';
import { tmdb, getProfileUrl } from '../services/tmdb';
import { Person, MediaItem } from '../types';
import { MovieCard } from '../components/MovieCard';
import { User, Calendar, MapPin, Award, ExternalLink } from 'lucide-react';

interface PersonPageProps {
  route: string;
  onNavigate: (route: string) => void;
}

export const PersonPage: React.FC<PersonPageProps> = ({ route, onNavigate }) => {
  const queryParams = new URLSearchParams(route.split('?')[1] || '');
  const personId = Number(queryParams.get('id')) || 1158;

  const [person, setPerson] = useState<Person | null>(null);
  const [activeTab, setActiveTab] = useState<'movies' | 'tv'>('movies');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPerson() {
      setLoading(true);
      try {
        const res = await tmdb.getPersonDetails(personId);
        setPerson(res);
      } catch (err) {
        
      } finally {
        setLoading(false);
      }
    }
    loadPerson();
  }, [personId]);

  if (loading || !person) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-6">
        <div className="w-full h-64 rounded-3xl skeleton-shimmer" />
      </div>
    );
  }

  const movieCredits = person.movie_credits?.cast || [];
  const tvCredits = person.tv_credits?.cast || [];
  const credits = activeTab === 'movies' ? movieCredits : tvCredits;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 flex flex-col md:flex-row items-start gap-8">
        <img
          src={getProfileUrl(person.profile_path)}
          alt={person.name}
          className="w-40 h-40 sm:w-52 sm:h-52 rounded-3xl object-cover border-2 border-[var(--color-primary)] shadow-2xl flex-shrink-0 mx-auto md:mx-0"
        />

        <div className="space-y-4 flex-1">
          <div>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[var(--color-primary)]/20 text-[var(--color-primary)] border border-[var(--color-primary)]/30">
              {person.known_for_department || 'Artist'}
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-white mt-2">{person.name}</h1>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
            {person.birthday && (
              <span className="flex items-center gap-1.5 font-medium">
                <Calendar className="w-4 h-4 text-slate-400" /> Born: {person.birthday}
              </span>
            )}
            {person.place_of_birth && (
              <span className="flex items-center gap-1.5 font-medium">
                <MapPin className="w-4 h-4 text-slate-400" /> {person.place_of_birth}
              </span>
            )}
            {person.popularity && (
              <span className="flex items-center gap-1.5 font-bold text-amber-400">
                <Award className="w-4 h-4" /> Popularity Score: {Math.round(person.popularity)}
              </span>
            )}
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl line-clamp-6">
            {person.biography || 'No biography details available for this artist.'}
          </p>

          {person.external_ids?.imdb_id && (
            <a
              href={`https://www.imdb.com/name/${person.external_ids.imdb_id}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/30 hover:bg-amber-500/30 transition-all"
            >
              View on IMDb <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">Filmography</h2>

          <div className="flex items-center gap-2 p-1 glass-panel rounded-xl">
            <button
              onClick={() => setActiveTab('movies')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'movies' ? 'bg-[var(--color-primary)] text-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              Movies ({movieCredits.length})
            </button>
            <button
              onClick={() => setActiveTab('tv')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'tv' ? 'bg-[var(--color-primary)] text-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              TV Shows ({tvCredits.length})
            </button>
          </div>
        </div>

        {credits.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {credits.slice(0, 20).map((item) => (
              <MovieCard
                key={item.id}
                media={{ ...item, media_type: activeTab === 'movies' ? 'movie' : 'tv' }}
                onSelect={(m) => onNavigate(`watch?type=${activeTab === 'movies' ? 'movie' : 'tv'}&id=${m.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center glass-panel rounded-3xl text-slate-400">
            No filmography records found.
          </div>
        )}
      </div>
    </div>
  );
};
