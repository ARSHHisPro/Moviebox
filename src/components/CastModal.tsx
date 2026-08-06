import React, { useState, useEffect } from 'react';
import { User, X, Film, Calendar, MapPin, Sparkles, ExternalLink } from 'lucide-react';
import { Person } from '../types';
import { tmdb } from '../services/tmdb';

interface CastModalProps {
  personId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigateToMedia: (mediaId: number, mediaType: 'movie' | 'tv') => void;
}

export const CastModal: React.FC<CastModalProps> = ({
  personId,
  isOpen,
  onClose,
  onNavigateToMedia
}) => {
  const [person, setPerson] = useState<Person | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && personId) {
      loadPerson();
    }
  }, [isOpen, personId]);

  const loadPerson = async () => {
    if (!personId) return;
    setIsLoading(true);
    try {
      const data = await tmdb.getPersonDetails(personId);
      setPerson(data);
    } catch (e) {
      console.warn('Cast details fetch warning:', e);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !personId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl glass-panel border border-purple-500/30 rounded-3xl overflow-hidden flex flex-col max-h-[90vh] shadow-2xl">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-white text-base sm:text-lg">
                Cast & Crew Profile
              </h2>
              <p className="text-xs text-slate-400">Actor & Director Filmography Archive</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading artist profile...</div>
        ) : person ? (
          <div className="p-6 space-y-6 flex-1 overflow-y-auto">
            <div className="flex flex-col sm:flex-row gap-6">
              {person.profile_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w300${person.profile_path}`}
                  alt={person.name}
                  className="w-32 h-44 object-cover rounded-2xl border border-white/10 shadow-lg mx-auto sm:mx-0"
                />
              ) : (
                <div className="w-32 h-44 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto sm:mx-0">
                  <User className="w-10 h-10 text-slate-500" />
                </div>
              )}

              <div className="space-y-2 text-center sm:text-left flex-1">
                <h3 className="text-2xl font-black text-white">{person.name}</h3>
                {person.known_for_department && (
                  <span className="inline-block px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold border border-purple-500/30 uppercase">
                    {person.known_for_department}
                  </span>
                )}

                <div className="space-y-1 text-xs text-slate-400 pt-2">
                  {person.birthday && (
                    <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                      <Calendar className="w-3.5 h-3.5 text-purple-400" /> Born: {person.birthday}
                    </div>
                  )}
                  {person.place_of_birth && (
                    <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                      <MapPin className="w-3.5 h-3.5 text-purple-400" /> {person.place_of_birth}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Biography */}
            {person.biography && (
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest">Biography</h4>
                <p className="text-xs text-slate-300 leading-relaxed max-h-32 overflow-y-auto pr-2">
                  {person.biography}
                </p>
              </div>
            )}

            {/* Filmography */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                <Film className="w-4 h-4 text-purple-400" /> Known For
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {person.movie_credits?.cast?.slice(0, 8).map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      onNavigateToMedia(m.id, 'movie');
                      onClose();
                    }}
                    className="p-2 rounded-xl bg-black/40 border border-white/5 hover:border-purple-500/40 transition-all text-left group"
                  >
                    {m.poster_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w185${m.poster_path}`}
                        alt={m.title || m.name}
                        className="w-full h-28 object-cover rounded-lg mb-2 group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-28 bg-slate-800 rounded-lg mb-2 flex items-center justify-center">
                        <Film className="w-6 h-6 text-slate-600" />
                      </div>
                    )}
                    <p className="font-bold text-white text-[11px] truncate">{m.title || m.name}</p>
                    <p className="text-[10px] text-slate-400">{m.release_date?.substring(0, 4)}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
