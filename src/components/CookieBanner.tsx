import React, { useState, useEffect } from 'react';
import { Cookie, Shield, Check, X, Settings2, ExternalLink } from 'lucide-react';

interface CookieBannerProps {
  onNavigate: (route: string) => void;
}

export const CookieBanner: React.FC<CookieBannerProps> = ({ onNavigate }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true, // Always true and locked
    functional: true, // Saved history, continue watching, custom theme
    analytics: false, // Performance telemetry
  });

  useEffect(() => {
    // Check if user has already made a cookie choice
    try {
      const consent = localStorage.getItem('moviebox_cookie_consent');
      if (!consent) {
        // Show banner after brief delay for smooth appearance
        const timer = setTimeout(() => setIsVisible(true), 1200);
        return () => clearTimeout(timer);
      } else {
        const parsed = JSON.parse(consent);
        setPreferences(parsed);
      }
    } catch {
      setIsVisible(true);
    }

    const handleOpenPreferences = () => {
      setIsVisible(true);
      setShowPreferences(true);
    };

    window.addEventListener('open-cookie-banner', handleOpenPreferences);
    return () => window.removeEventListener('open-cookie-banner', handleOpenPreferences);
  }, []);

  const saveConsent = (choice: { essential: boolean; functional: boolean; analytics: boolean }) => {
    try {
      localStorage.setItem('moviebox_cookie_consent', JSON.stringify({
        ...choice,
        timestamp: Date.now(),
        version: '2.0.0'
      }));
    } catch {}
    setPreferences(choice);
    setIsVisible(false);
    setShowPreferences(false);
  };

  const handleAcceptAll = () => {
    saveConsent({ essential: true, functional: true, analytics: true });
  };

  const handleRejectNonEssential = () => {
    saveConsent({ essential: true, functional: false, analytics: false });
  };

  const handleSaveCustom = () => {
    saveConsent(preferences);
  };

  if (!isVisible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie and Privacy Consent"
      className="fixed bottom-0 sm:bottom-4 left-0 right-0 sm:left-4 sm:right-auto sm:max-w-xl z-50 p-4 sm:p-0 animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-cyan-500/30 bg-black/95 sm:bg-black/90 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] border-t border-t-[#00d2ff]/40 space-y-4">
        
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#00d2ff]/10 border border-[#00d2ff]/30 text-[#00d2ff] flex-shrink-0 shadow-sm shadow-[#00d2ff]/20">
              <Cookie className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <span>Privacy & Storage Choices</span>
                <span className="text-[10px] uppercase font-bold text-[#00d2ff] bg-[#00d2ff]/10 px-2 py-0.5 rounded-full border border-[#00d2ff]/20">
                  Zero Data Selling
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                MovieBox respects your autonomy. Your personal information is stored nowhere.
              </p>
            </div>
          </div>

          <button
            onClick={handleRejectNonEssential}
            className="text-slate-500 hover:text-white p-1 rounded-full transition-colors flex-shrink-0 cursor-pointer"
            title="Dismiss with essential storage only"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          We use secure client-side storage (<code className="text-[#00d2ff] text-[11px]">localStorage</code>) strictly to preserve your playback progress, watchlist, and selected theme. MovieBox does <strong className="text-white font-semibold">NOT host any media files</strong> and does not sell or share personal telemetry with external ad brokers.
        </p>

        {showPreferences && (
          <div className="pt-2 pb-1 space-y-2 border-t border-white/10 animate-in fade-in duration-200">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Strictly Necessary (Required)</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Required for site navigation, session tokens, and core security.
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider bg-emerald-400/10 px-2 py-1 rounded-md border border-emerald-400/20">
                Always Active
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Settings2 className="w-3.5 h-3.5 text-[#00d2ff]" />
                  <span>Functional & Preferences</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Remembers your Continue Watching timestamps, volume level, and custom UI color theme.
                </div>
              </div>
              <input
                type="checkbox"
                checked={preferences.functional}
                onChange={(e) => setPreferences({ ...preferences, functional: e.target.checked })}
                className="w-4 h-4 rounded text-[#00d2ff] focus:ring-[#00d2ff] cursor-pointer accent-[#00d2ff]"
              />
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
              <div>
                <div className="text-xs font-bold text-white">Anonymous Performance Metrics</div>
                <div className="text-[11px] text-slate-400">
                  Aggregated streaming latency checks to recommend the fastest active streaming server.
                </div>
              </div>
              <input
                type="checkbox"
                checked={preferences.analytics}
                onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                className="w-4 h-4 rounded text-[#00d2ff] focus:ring-[#00d2ff] cursor-pointer accent-[#00d2ff]"
              />
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10 text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                onNavigate('cookies');
                setIsVisible(false);
              }}
              className="hover:text-[#00d2ff] underline underline-offset-2 transition-colors cursor-pointer"
            >
              Cookie Policy
            </button>
            <span>•</span>
            <button
              onClick={() => {
                onNavigate('privacy');
                setIsVisible(false);
              }}
              className="hover:text-[#00d2ff] underline underline-offset-2 transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <span>•</span>
            <button
              onClick={() => {
                onNavigate('terms');
                setIsVisible(false);
              }}
              className="hover:text-[#00d2ff] underline underline-offset-2 transition-colors cursor-pointer"
            >
              Terms of Service
            </button>
          </div>

          <button
            onClick={() => setShowPreferences(!showPreferences)}
            className="text-slate-300 hover:text-white font-semibold transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>{showPreferences ? 'Hide Options' : 'Customize'}</span>
          </button>
        </div>

        <div className="flex items-center justify-end gap-2 pt-1">
          {showPreferences ? (
            <button
              onClick={handleSaveCustom}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Preferences</span>
            </button>
          ) : (
            <button
              onClick={handleRejectNonEssential}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-semibold text-xs border border-white/10 transition-all cursor-pointer"
            >
              Essential Only
            </button>
          )}

          <button
            onClick={handleAcceptAll}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00d2ff] to-cyan-500 hover:from-cyan-400 hover:to-[#00d2ff] text-black font-extrabold text-xs shadow-lg shadow-[#00d2ff]/20 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5 stroke-[3px]" />
            <span>Accept All</span>
          </button>
        </div>

      </div>
    </div>
  );
};
