import React from 'react';
import { ShieldAlert, Sparkles, ExternalLink } from 'lucide-react';

export const OwnerNoticeBanner: React.FC = () => {
  const handleOwnerClick = () => {
    // Scroll to footer
    const footerElem = document.getElementById('owner-footer-badge');
    if (footerElem) {
      footerElem.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Dispatch custom highlight event
      window.dispatchEvent(new CustomEvent('highlight-owner-footer'));
    } else {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full bg-gradient-to-r from-purple-950/80 via-slate-900/90 to-cyan-950/80 border-y border-white/10 backdrop-blur-md py-2.5 px-4 my-2 relative z-20 shadow-lg overflow-hidden">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs sm:text-sm text-slate-200">
        
        <div className="flex items-center gap-2.5 mx-auto text-center flex-wrap justify-center font-medium">
          <ShieldAlert className="w-4 h-4 text-amber-400 animate-pulse flex-shrink-0" />
          <span>
            This is a personal website and should not be shared or leaked without{' '}
            <button
              onClick={handleOwnerClick}
              className="inline-flex items-center gap-1 font-black px-2 py-0.5 rounded-lg bg-black/60 border border-[#00d2ff]/40 text-[#00d2ff] uppercase tracking-wider hover:scale-105 transition-transform cursor-pointer shadow-md shadow-[#00d2ff]/30 animate-pulse underline decoration-dashed decoration-[#00d2ff]"
              title="Click to view Owner details in footer"
            >
              <Sparkles className="w-3 h-3 text-amber-300 animate-spin" />
              <span className="drop-shadow-[0_0_8px_rgba(0,210,255,0.8)]">Owner</span>
              <ExternalLink className="w-3 h-3 opacity-80" />
            </button>
            's permission.
          </span>
        </div>

      </div>
    </div>
  );
};
