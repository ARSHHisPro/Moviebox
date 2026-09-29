import React, { useState, useEffect } from 'react';
import { Megaphone, AlertCircle, Info, Sparkles, X, ChevronRight, Newspaper } from 'lucide-react';
import { api } from '../services/api';

interface AnnouncementData {
  text: string;
  type: 'info' | 'warning' | 'alert' | 'promo';
  active: boolean;
  updatedAt?: number;
}

interface NewsItem {
  id: string;
  headline: string;
  category: string;
  date: string;
}

export const AnnouncementBar: React.FC = () => {
  const [announcement, setAnnouncement] = useState<AnnouncementData | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [currentNewsIdx, setCurrentNewsIdx] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const res = await api.getAnnouncement();
        if (isMounted && res?.announcement?.active && res.announcement.text) {
          setAnnouncement(res.announcement);
        }
      } catch {
      }

      try {
        const newsRes = await api.getNews();
        if (isMounted && newsRes?.news && Array.isArray(newsRes.news)) {
          setNews(newsRes.news);
        }
      } catch {
      }
    }

    loadData();
    const interval = setInterval(loadData, 60000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (news.length <= 1) return;
    const ticker = setInterval(() => {
      setCurrentNewsIdx((prev) => (prev + 1) % news.length);
    }, 6000);
    return () => clearInterval(ticker);
  }, [news.length]);

  const hasAnnouncement = announcement?.active && announcement.text && !isDismissed;
  const hasNews = news.length > 0;

  if (!hasAnnouncement && !hasNews) return null;

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'alert':
        return {
          bg: 'bg-gradient-to-r from-rose-950/80 via-red-900/60 to-rose-950/80 border-rose-500/40 text-rose-200',
          iconColor: 'text-rose-400',
          badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
        };
      case 'warning':
        return {
          bg: 'bg-gradient-to-r from-amber-950/80 via-yellow-900/50 to-amber-950/80 border-amber-500/40 text-amber-200',
          iconColor: 'text-amber-400',
          badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        };
      case 'promo':
        return {
          bg: 'bg-gradient-to-r from-purple-950/80 via-indigo-900/50 to-purple-950/80 border-purple-500/40 text-purple-200',
          iconColor: 'text-purple-400',
          badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
        };
      case 'info':
      default:
        return {
          bg: 'bg-gradient-to-r from-cyan-950/80 via-blue-950/60 to-cyan-950/80 border-cyan-500/40 text-cyan-200',
          iconColor: 'text-cyan-400',
          badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
        };
    }
  };

  const style = announcement ? getTypeStyles(announcement.type) : getTypeStyles('info');
  const activeNews = news[currentNewsIdx] || news[0];

  return (
    <div className="w-full relative z-40 border-b border-white/10 backdrop-blur-md overflow-hidden animate-in fade-in duration-300">
      {hasAnnouncement && (
        <div className={`px-3 sm:px-6 py-2 border-b border-white/5 flex items-center justify-between gap-3 text-xs ${style.bg}`}>
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border flex items-center gap-1 ${style.badgeBg} flex-shrink-0`}>
              <Megaphone className={`w-3 h-3 ${style.iconColor}`} />
              Announcement
            </span>
            <p className="font-semibold text-white/95 text-xs truncate">
              {announcement?.text}
            </p>
          </div>
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors flex-shrink-0"
            title="Dismiss announcement"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {hasNews && activeNews && (
        <div className="px-3 sm:px-6 py-1.5 bg-black/60 border-t border-white/5 flex items-center justify-between gap-2 sm:gap-4 text-[11px] sm:text-xs">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="px-2 py-0.5 rounded-md bg-gradient-to-r from-rose-500/20 to-[var(--color-primary)]/20 text-white font-extrabold uppercase text-[10px] border border-white/10 flex items-center gap-1 flex-shrink-0">
              <Newspaper className="w-3 h-3 text-[var(--color-primary)]" />
              Today's News
            </span>
            <div className="flex items-center gap-2 truncate">
              <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.2 rounded border border-amber-400/20 hidden sm:inline">
                {activeNews.category}
              </span>
              <span className="text-white/90 font-medium truncate">
                {activeNews.headline}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-[10px] text-slate-400 flex-shrink-0">
            <span className="hidden md:inline">{activeNews.date}</span>
            <span className="text-slate-600 hidden md:inline">•</span>
            <button
              onClick={() => setCurrentNewsIdx((prev) => (prev + 1) % news.length)}
              className="text-[var(--color-primary)] hover:underline flex items-center gap-0.5 ml-1 font-semibold"
              title="Next news item"
            >
              <span>Next</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
