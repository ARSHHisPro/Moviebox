import React, { useState } from 'react';
import { themeManager, ThemeOption } from '../services/theme';
import { Settings, Palette, Tv, HardDrive, Check, Trash2 } from 'lucide-react';
import { toast } from '../services/toast';
import { favoritesStore, watchHistoryStore, continueWatchingStore } from '../services/store';

interface SettingsPageProps {
  onNavigate: (route: string) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onNavigate }) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeOption>(themeManager.getTheme());
  const [defaultServer, setDefaultServer] = useState('0');
  const [autoplay, setAutoplay] = useState(true);

  const handleThemeChange = (option: ThemeOption) => {
    themeManager.setTheme(option);
    setCurrentTheme(option);
    toast.success(`Applied ${option.name} Theme`);
  };

  const handleResetData = () => {
    if (window.confirm('Reset all local data including history, favorites, and settings?')) {
      favoritesStore.clear();
      watchHistoryStore.clear();
      continueWatchingStore.clear();
      toast.info('Local cache & store state reset');
    }
  };

  const themes = themeManager.getVariants();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      <div className="pb-6 border-b border-white/10">
        <div className="flex items-center gap-2 text-[var(--color-primary)] font-bold text-xs uppercase tracking-widest">
          <Settings className="w-4 h-4" /> Preferences
        </div>
        <h1 className="text-3xl font-black text-white mt-1">Platform Settings</h1>
        <p className="text-xs text-slate-400 mt-0.5">Customize theme themes, default streaming servers, and playback behavior</p>
      </div>

      <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Palette className="w-5 h-5 text-[var(--color-primary)]" /> Aurora Glass Themes
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {themes.map((t) => {
            const isSelected = currentTheme.id === t.id;
            return (
              <button
                key={t.id}
                onClick={() => handleThemeChange(t)}
                className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between h-24 relative overflow-hidden ${
                  isSelected
                    ? 'border-[var(--color-primary)] bg-white/10 shadow-lg'
                    : 'border-white/10 bg-white/5 hover:border-white/30'
                }`}
              >
                <div className="flex items-center justify-between z-10">
                  <span className="text-xs font-bold text-white">{t.name}</span>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-[var(--color-primary)] text-black flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1.5 z-10">
                  <span className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: t.primary }} />
                  <span className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: t.secondary }} />
                  <span className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: t.bgDark }} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Tv className="w-5 h-5 text-[var(--color-primary)]" /> Streaming Player Preferences
        </h3>

        <div className="space-y-4 text-xs text-slate-300">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
            <div>
              <div className="font-bold text-white">Default Streaming Server</div>
              <div className="text-[11px] text-slate-400">Choose preferred embed server</div>
            </div>
            <select
              value={defaultServer}
              onChange={(e) => setDefaultServer(e.target.value)}
              className="bg-black/80 text-xs text-white p-2 rounded-xl border border-white/20"
            >
              <option value="0">Server 1 (vaplayer.ru)</option>
              <option value="1">Server 2 (embed.su)</option>
              <option value="2">Server 3 (vidsrc.to)</option>
              <option value="3">Server 4 (2embed.cc)</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
            <div>
              <div className="font-bold text-white">Autoplay Next Episode</div>
              <div className="text-[11px] text-slate-400">Automatically launch next episode upon credit sequence</div>
            </div>
            <input
              type="checkbox"
              checked={autoplay}
              onChange={(e) => setAutoplay(e.target.checked)}
              className="w-5 h-5 accent-[var(--color-primary)] rounded cursor-pointer"
            />
          </div>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-rose-400" /> Data & Cache Management
        </h3>

        <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
          <div>
            <div className="font-bold text-white">Reset Local Application Cache</div>
            <div className="text-[11px] text-slate-400">Clears offline watch history, progress, and stored preferences</div>
          </div>
          <button
            onClick={handleResetData}
            className="px-4 py-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold text-xs hover:bg-rose-500/30 transition-all flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" /> Reset Cache
          </button>
        </div>
      </div>
    </div>
  );
};
