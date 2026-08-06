import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ToastContainer } from './components/ToastContainer';
import { TrailerModal } from './components/TrailerModal';
import { GeminiConciergeModal } from './components/GeminiConciergeModal';
import { AuthModal } from './components/AuthModal';
import { auth } from './services/auth';

// Pages
import { HomePage } from './pages/HomePage';
import { MoviesPage } from './pages/MoviesPage';
import { TvShowsPage } from './pages/TvShowsPage';
import { WatchPage } from './pages/WatchPage';
import { SearchPage } from './pages/SearchPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { ContinueWatchingPage } from './pages/ContinueWatchingPage';
import { HistoryPage } from './pages/HistoryPage';
import { GenresPage } from './pages/GenresPage';
import { GenreDetailPage } from './pages/GenreDetailPage';
import { TopRatedPage } from './pages/TopRatedPage';
import { TrendingPage } from './pages/TrendingPage';
import { PersonPage } from './pages/PersonPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { AuthPage } from './pages/AuthPage';
import { AdminPage } from './pages/AdminPage';
import { NotFoundPage } from './pages/NotFoundPage';

import { AmbientPlayer } from './components/AmbientPlayer';
import { WatchPartyModal } from './components/WatchPartyModal';
import { TriviaGameModal } from './components/TriviaGameModal';
import { SurpriseWheelModal } from './components/SurpriseWheelModal';

import { MediaItem } from './types';
import { tmdb } from './services/tmdb';
import { themeManager } from './services/theme';

export function App() {
  const [route, setRoute] = useState<string>('home');
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [trailerTitle, setTrailerTitle] = useState('');
  const [aiConciergeOpen, setAiConciergeOpen] = useState(false);

  // Cinephile Tool Modals State
  const [watchPartyOpen, setWatchPartyOpen] = useState(false);
  const [triviaOpen, setTriviaOpen] = useState(false);
  const [rouletteOpen, setRouletteOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Initialize active theme and check auth
  useEffect(() => {
    themeManager.init();

    const unsubscribe = auth.subscribe((user) => {
      if (!user) {
        setAuthModalOpen(true);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleNavigate = (newRoute: string) => {
    setRoute(newRoute);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenTrailer = async (item: MediaItem) => {
    const type = item.media_type || (item.first_air_date ? 'tv' : 'movie');
    const title = item.title || item.name || 'Untitled';
    setTrailerTitle(title);
    setTrailerKey(null);
    setTrailerOpen(true);

    try {
      const key = await tmdb.getTrailerKey(type, item.id);
      setTrailerKey(key);
    } catch (err) {
      console.error(err);
    }
  };

  const renderRoutePage = () => {
    const baseRoute = route.split('?')[0];

    switch (baseRoute) {
      case 'home':
        return (
          <HomePage
            onNavigate={handleNavigate}
            onOpenTrailer={handleOpenTrailer}
            onOpenAiConcierge={() => setAiConciergeOpen(true)}
            onOpenWatchParty={() => setWatchPartyOpen(true)}
            onOpenTrivia={() => setTriviaOpen(true)}
            onOpenRoulette={() => setRouletteOpen(true)}
          />
        );
      case 'movies':
        return <MoviesPage onNavigate={handleNavigate} />;
      case 'tv':
        return <TvShowsPage onNavigate={handleNavigate} />;
      case 'watch':
        return <WatchPage route={route} onNavigate={handleNavigate} onOpenTrailer={handleOpenTrailer} />;
      case 'search':
        return (
          <SearchPage
            route={route}
            onNavigate={handleNavigate}
            onOpenAiConcierge={() => setAiConciergeOpen(true)}
          />
        );
      case 'favorites':
        return <FavoritesPage onNavigate={handleNavigate} />;
      case 'continue-watching':
        return <ContinueWatchingPage onNavigate={handleNavigate} />;
      case 'history':
        return <HistoryPage onNavigate={handleNavigate} />;
      case 'genres':
        return <GenresPage onNavigate={handleNavigate} />;
      case 'genre':
        return <GenreDetailPage route={route} onNavigate={handleNavigate} />;
      case 'top-rated':
        return <TopRatedPage onNavigate={handleNavigate} />;
      case 'trending':
        return <TrendingPage onNavigate={handleNavigate} />;
      case 'popular':
        return <MoviesPage onNavigate={handleNavigate} />;
      case 'person':
        return <PersonPage route={route} onNavigate={handleNavigate} />;
      case 'profile':
        return <ProfilePage onNavigate={handleNavigate} />;
      case 'settings':
        return <SettingsPage onNavigate={handleNavigate} />;
      case 'auth':
        return <AuthPage onNavigate={handleNavigate} />;
      case 'admin':
        return <AdminPage onNavigate={handleNavigate} />;
      default:
        return <NotFoundPage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="bg-[#020202] min-h-screen text-white flex flex-col font-sans selection:bg-[#00d2ff] selection:text-black relative overflow-x-hidden">
      
      {/* Background Radial Gradient Canvas */}
      <div
        className="fixed inset-0 pointer-events-none -z-20"
        style={{
          backgroundImage:
            'radial-gradient(circle at 0% 0%, #111111 0%, #020202 50%), radial-gradient(circle at 100% 100%, #1a0b2e 0%, #020202 50%)',
        }}
      />

      {/* Aurora Glow Effects */}
      <div className="fixed top-[-20%] left-[10%] w-[500px] h-[500px] bg-[#00d2ff]/10 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="fixed bottom-[-10%] right-[5%] w-[400px] h-[400px] bg-[#7b2cbf]/10 blur-[100px] rounded-full pointer-events-none -z-10" />
      <div className="fixed top-[40%] right-[20%] w-[300px] h-[300px] bg-[#ec4899]/5 blur-[100px] rounded-full pointer-events-none -z-10" />

      {/* Global Navigation Bar */}
      <Navbar
        currentRoute={route}
        onNavigate={handleNavigate}
        onOpenAiConcierge={() => setAiConciergeOpen(true)}
        onOpenWatchParty={() => setWatchPartyOpen(true)}
        onOpenTrivia={() => setTriviaOpen(true)}
        onOpenRoulette={() => setRouletteOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 relative z-10">
        {renderRoutePage()}
      </main>

      {/* Ambient Soundscapes Player */}
      <AmbientPlayer />

      {/* Global Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Modals & Floating Toasts */}
      <TrailerModal
        isOpen={trailerOpen}
        videoKey={trailerKey}
        title={trailerTitle}
        onClose={() => setTrailerOpen(false)}
      />

      <GeminiConciergeModal
        isOpen={aiConciergeOpen}
        onClose={() => setAiConciergeOpen(false)}
        onSearchQuery={(q) => {
          setAiConciergeOpen(false);
          handleNavigate(`search?q=${encodeURIComponent(q)}`);
        }}
      />

      <WatchPartyModal
        isOpen={watchPartyOpen}
        onClose={() => setWatchPartyOpen(false)}
        onNavigateToWatch={(id, type, roomId) => {
          handleNavigate(`watch?type=${type}&id=${id}${roomId ? `&room=${roomId}` : ''}`);
        }}
      />

      <TriviaGameModal
        isOpen={triviaOpen}
        onClose={() => setTriviaOpen(false)}
      />

      <SurpriseWheelModal
        isOpen={rouletteOpen}
        onClose={() => setRouletteOpen(false)}
        onNavigateToWatch={(id, type) => {
          handleNavigate(`watch?type=${type}&id=${id}`);
        }}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => setAuthModalOpen(false)}
      />

      <ToastContainer />
    </div>
  );
}

export default App;
