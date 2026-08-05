import React from 'react';
import { Film, Home, ArrowLeft } from 'lucide-react';

interface NotFoundPageProps {
  onNavigate: (route: string) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-md mx-auto my-24 px-4 text-center space-y-6">
      <div className="glass-panel p-8 rounded-3xl border border-white/20 shadow-2xl space-y-6">
        <div className="w-20 h-20 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto text-3xl font-black">
          404
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black text-white">Scene Not Found</h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            The page or reel you are looking for has been moved, deleted, or does not exist in our catalog.
          </p>
        </div>

        <button
          onClick={() => onNavigate('home')}
          className="px-6 py-3 rounded-2xl bg-[var(--color-primary)] text-black font-extrabold text-xs shadow-lg shadow-[var(--color-primary-glow)] hover:brightness-110 transition-all flex items-center justify-center gap-2 mx-auto"
        >
          <Home className="w-4 h-4" /> Return to MovieBox Home
        </button>
      </div>
    </div>
  );
};
