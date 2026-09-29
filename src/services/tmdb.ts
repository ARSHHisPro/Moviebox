import { MediaItem, MediaDetails, Person, Genre, MediaType, FilterState, Episode } from '../types';

const BASE_URL = '/api/tmdb';
export const IMAGE_BASE_W500 = 'https://image.tmdb.org/t/p/w500';
export const IMAGE_BASE_ORIGINAL = 'https://image.tmdb.org/t/p/original';
export const IMAGE_BASE_W185 = 'https://image.tmdb.org/t/p/w185';

interface CacheEntry {
  data: any;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const pendingRequests = new Map<string, Promise<any>>();
const CACHE_TTL_MS = 30 * 60 * 1000;
const MAX_CACHE_ENTRIES = 200;

export function getPosterUrl(path: string | null, fallback = '/assets/placeholder-poster.png'): string {
  if (!path) return fallback;
  if (path.startsWith('http')) return path;
  return `${IMAGE_BASE_W500}${path}`;
}

export function getBackdropUrl(path: string | null, fallback = '/assets/placeholder-backdrop.png'): string {
  if (!path) return fallback;
  if (path.startsWith('http')) return path;
  return `${IMAGE_BASE_ORIGINAL}${path}`;
}

export function getProfileUrl(path: string | null, fallback = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'): string {
  if (!path) return fallback;
  if (path.startsWith('http')) return path;
  return `${IMAGE_BASE_W185}${path}`;
}

async function fetchFromTMDB<T>(endpoint: string, params: Record<string, string | number | boolean> = {}): Promise<T> {
  const urlObj = new URL(`${BASE_URL}${endpoint}`, window.location.origin);

  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      urlObj.searchParams.append(key, String(val));
    }
  });

  const fullUrl = urlObj.toString();

  const cached = cache.get(fullUrl);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data as T;
  }

  if (pendingRequests.has(fullUrl)) {
    return pendingRequests.get(fullUrl) as Promise<T>;
  }

  const requestPromise = (async () => {
    try {
      const response = await fetch(fullUrl);
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          if (cache.size >= MAX_CACHE_ENTRIES) {
            const oldestKey = cache.keys().next().value;
            if (oldestKey) cache.delete(oldestKey);
          }
          cache.set(fullUrl, { data, timestamp: Date.now() });
          return data as T;
        }
      }
    } catch {
      // Fallback to direct TMDB call via env key
    }

    const apiKey = import.meta.env.VITE_TMDB_KEY || '';
    if (!apiKey) throw new Error('TMDB API Key not set. Add VITE_TMDB_KEY to environment variables.');

    const fallbackUrlObj = new URL(`https://api.themoviedb.org/3${endpoint}`);
    fallbackUrlObj.searchParams.append('api_key', apiKey);
    fallbackUrlObj.searchParams.append('language', 'en-US');
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        fallbackUrlObj.searchParams.append(key, String(val));
      }
    });

    let retries = 2;
    let delay = 500;

    while (retries >= 0) {
      try {
        const response = await fetch(fallbackUrlObj.toString());
        if (response.status === 429) {
          await new Promise(r => setTimeout(r, delay * 2));
          retries--;
          delay *= 2;
          continue;
        }
        if (!response.ok) throw new Error(`TMDB error ${response.status}`);
        const data = await response.json();
        if (cache.size >= MAX_CACHE_ENTRIES) {
          const oldestKey = cache.keys().next().value;
          if (oldestKey) cache.delete(oldestKey);
        }
        cache.set(fullUrl, { data, timestamp: Date.now() });
        return data as T;
      } catch (err) {
        if (retries === 0) throw err;
        await new Promise(r => setTimeout(r, delay));
        retries--;
        delay *= 2;
      }
    }

    throw new Error(`Failed to fetch TMDB endpoint: ${endpoint}`);
  })();

  pendingRequests.set(fullUrl, requestPromise);
  try {
    const result = await requestPromise;
    return result;
  } finally {
    pendingRequests.delete(fullUrl);
  }
}

export const tmdb = {
  getTrending: async (type: 'all' | 'movie' | 'tv' = 'all', timeWindow: 'day' | 'week' = 'day', page = 1) => {
    return fetchFromTMDB<{ results: MediaItem[]; total_pages: number }>(`/trending/${type}/${timeWindow}`, { page });
  },

  getPopularMovies: (page = 1) => fetchFromTMDB<{ results: MediaItem[]; total_pages: number }>('/movie/popular', { page }),
  getTopRatedMovies: (page = 1) => fetchFromTMDB<{ results: MediaItem[]; total_pages: number }>('/movie/top_rated', { page }),
  getNowPlayingMovies: (page = 1) => fetchFromTMDB<{ results: MediaItem[]; total_pages: number }>('/movie/now_playing', { page }),
  getUpcomingMovies: (page = 1) => fetchFromTMDB<{ results: MediaItem[]; total_pages: number }>('/movie/upcoming', { page }),

  getPopularTv: (page = 1) => fetchFromTMDB<{ results: MediaItem[]; total_pages: number }>('/tv/popular', { page }),
  getTopRatedTv: (page = 1) => fetchFromTMDB<{ results: MediaItem[]; total_pages: number }>('/tv/top_rated', { page }),
  getAiringTodayTv: (page = 1) => fetchFromTMDB<{ results: MediaItem[]; total_pages: number }>('/tv/airing_today', { page }),

  discoverMedia: (type: MediaType, filters: FilterState, page = 1) => {
    const params: Record<string, any> = { page };
    if (filters.sortBy) params.sort_by = filters.sortBy;
    if (filters.genreId) params.with_genres = filters.genreId;
    if (filters.yearFrom) {
      if (type === 'movie') params['primary_release_date.gte'] = `${filters.yearFrom}-01-01`;
      else params['first_air_date.gte'] = `${filters.yearFrom}-01-01`;
    }
    if (filters.yearTo) {
      if (type === 'movie') params['primary_release_date.lte'] = `${filters.yearTo}-12-31`;
      else params['first_air_date.lte'] = `${filters.yearTo}-12-31`;
    }
    if (filters.ratingMin) params['vote_average.gte'] = filters.ratingMin;
    return fetchFromTMDB<{ results: MediaItem[]; total_pages: number }>(`/discover/${type}`, params);
  },

  searchMulti: (query: string, page = 1) => fetchFromTMDB<{ results: MediaItem[]; total_pages: number }>('/search/multi', { query, page }),
  searchMovies: (query: string, page = 1) => fetchFromTMDB<{ results: MediaItem[]; total_pages: number }>('/search/movie', { query, page }),
  searchTv: (query: string, page = 1) => fetchFromTMDB<{ results: MediaItem[]; total_pages: number }>('/search/tv', { query, page }),
  searchPeople: (query: string, page = 1) => fetchFromTMDB<{ results: Person[]; total_pages: number }>('/search/person', { query, page }),

  getMediaDetails: async (type: MediaType, id: number): Promise<MediaDetails> => {
    const details = await fetchFromTMDB<MediaDetails>(`/${type}/${id}`, {
      append_to_response: 'credits,videos,similar,recommendations,external_ids'
    });
    return { ...details, media_type: type };
  },

  getTvSeasonDetails: (tvId: number, seasonNumber: number) => {
    return fetchFromTMDB<{ id: number; name: string; episodes: Episode[]; overview: string }>(`/tv/${tvId}/season/${seasonNumber}`);
  },

  getGenres: async (type: MediaType): Promise<Genre[]> => {
    const res = await fetchFromTMDB<{ genres: Genre[] }>(`/genre/${type}/list`);
    return res.genres || [];
  },

  getAllGenres: async (): Promise<{ movieGenres: Genre[]; tvGenres: Genre[] }> => {
    const [movieRes, tvRes] = await Promise.all([
      fetchFromTMDB<{ genres: Genre[] }>('/genre/movie/list'),
      fetchFromTMDB<{ genres: Genre[] }>('/genre/tv/list')
    ]);
    return { movieGenres: movieRes.genres || [], tvGenres: tvRes.genres || [] };
  },

  getPersonDetails: async (id: number): Promise<Person> => {
    return fetchFromTMDB<Person>(`/person/${id}`, {
      append_to_response: 'movie_credits,tv_credits,external_ids'
    });
  },

  getTrailerKey: async (type: MediaType, id: number): Promise<string | null> => {
    try {
      const res = await fetchFromTMDB<{ results: Array<{ key: string; type: string; site: string }> }>(`/${type}/${id}/videos`);
      const trailer = res.results?.find(v => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser'));
      return trailer ? trailer.key : (res.results?.[0]?.key || null);
    } catch {
      return null;
    }
  }
};
