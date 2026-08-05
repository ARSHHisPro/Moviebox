export type MediaType = 'movie' | 'tv';

export interface Genre {
  id: number;
  name: string;
}

export interface MediaItem {
  id: number;
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  media_type?: MediaType;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count?: number;
  release_date?: string;
  first_air_date?: string;
  genre_ids?: number[];
  genres?: Genre[];
  overview: string;
  popularity?: number;
  number_of_seasons?: number;
  number_of_episodes?: number;
  tagline?: string;
  runtime?: number;
  imdb_id?: string;
  status?: string;
}

export interface CastMember {
  id: number;
  name: string;
  character?: string;
  profile_path: string | null;
  known_for_department?: string;
}

export interface MediaDetails extends MediaItem {
  credits?: {
    cast: CastMember[];
    crew: Array<{ id: number; name: string; job: string }>;
  };
  videos?: {
    results: Array<{
      id: string;
      key: string;
      name: string;
      site: string;
      type: string;
    }>;
  };
  similar?: {
    results: MediaItem[];
  };
  recommendations?: {
    results: MediaItem[];
  };
  external_ids?: {
    imdb_id?: string;
    facebook_id?: string;
    instagram_id?: string;
    twitter_id?: string;
  };
  seasons?: Season[];
}

export interface Season {
  id: number;
  season_number: number;
  name: string;
  episode_count: number;
  poster_path: string | null;
  overview?: string;
  air_date?: string;
}

export interface Episode {
  id: number;
  episode_number: number;
  season_number: number;
  name: string;
  overview: string;
  still_path: string | null;
  vote_average: number;
  air_date?: string;
  runtime?: number;
}

export interface Person {
  id: number;
  name: string;
  profile_path: string | null;
  biography?: string;
  birthday?: string;
  place_of_birth?: string;
  popularity?: number;
  known_for_department?: string;
  imdb_id?: string;
  movie_credits?: { cast: MediaItem[] };
  tv_credits?: { cast: MediaItem[] };
  external_ids?: {
    imdb_id?: string;
    instagram_id?: string;
    twitter_id?: string;
  };
}

export interface FavoriteItem {
  id: number;
  type: MediaType;
  title: string;
  poster: string | null;
  backdrop: string | null;
  rating: number;
  year: string;
  genres: string[];
  addedAt: number;
}

export interface WatchProgress {
  id: number;
  type: MediaType;
  title: string;
  poster: string | null;
  backdrop: string | null;
  season?: number;
  episode?: number;
  lastPosition: number; // in seconds
  duration: number; // in seconds
  progress: number; // 0 to 1
  lastWatched: number; // timestamp
}

export interface WatchHistoryItem {
  id: number;
  type: MediaType;
  title: string;
  poster: string | null;
  progress: number;
  duration: number;
  watchedAt: number;
  season?: number;
  episode?: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  username: string;
  displayName?: string;
  isAdmin: boolean;
  isVIP?: boolean;
  avatar: string;
  watchTimeMinutes: number;
  streamedCount: number;
  createdAt: number;
  lastLogin: number;
  isBanned?: boolean;
}

export type ThemeVariant = 'cyan' | 'midnight' | 'ocean' | 'purple' | 'emerald' | 'crimson';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
}

export interface FilterState {
  genreId?: number | string;
  sortBy: string;
  yearFrom?: string;
  yearTo?: string;
  ratingMin?: number;
}
