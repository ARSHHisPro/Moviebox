import React from 'react';
import { Home, Flame, Search, Trophy, User } from 'lucide-react';

interface MobileBottomNavProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ currentRoute, onNavigate }) => {
  const baseRoute = currentRoute.split('?')[0];

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'trending', label: 'Trending', icon: Flame },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'leaderboard', label: 'Ranks', icon: Trophy },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0e]/95 backdrop-blur-2xl border-t border-white/10 px-2 py-1.5 safe-bottom transition-all duration-300 shadow-[0_-8px_30px_rgba(0,0,0,0.8)]"
      aria-label="Mobile Navigation"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = baseRoute === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 active:scale-90 ${
                isActive
                  ? 'text-[var(--color-primary)] font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <div
                className={`relative p-1 rounded-xl transition-all duration-200 ${
                  isActive ? 'bg-[var(--color-primary)]/15 scale-110 shadow-sm shadow-[var(--color-primary)]/20' : ''
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                {isActive && (
                  <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] shadow-sm shadow-[var(--color-primary)]" />
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight font-medium">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
