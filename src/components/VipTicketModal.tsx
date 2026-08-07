import React, { useState } from 'react';
import { Ticket, X, Download, Share2, Sparkles, Check, QrCode } from 'lucide-react';
import { toast } from '../services/toast';

interface VipTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaItem: {
    id: number;
    title: string;
    type: 'movie' | 'tv';
    poster: string | null;
    year?: string;
  } | null;
}

export const VipTicketModal: React.FC<VipTicketModalProps> = ({
  isOpen,
  onClose,
  mediaItem
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !mediaItem) return null;

  const ticketNumber = `MBX-${mediaItem.id}-${Math.floor(1000 + Math.random() * 9000)}`;

  const handleShare = () => {
    navigator.clipboard.writeText('Check out my MovieBox VIP Cinema Pass for "' + mediaItem.title + '"! Ticket ID: ' + ticketNumber);
    setCopied(true);
    toast.success('VIP Pass details copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg glass-panel border border-amber-500/40 rounded-3xl overflow-hidden flex flex-col max-h-[90vh] shadow-2xl">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-white text-base sm:text-lg">
                MovieBox VIP Cinema Pass
              </h2>
              <p className="text-xs text-slate-400">Digital Access Ticket & Collectible</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Ticket Graphic */}
        <div className="p-6 space-y-6">
          <div className="relative p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-black border-2 border-amber-500/30 shadow-2xl overflow-hidden">
            {/* Holographic Watermark */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-500/10 to-purple-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-start justify-between pb-4 border-b border-amber-500/20">
              <div>
                <span className="text-[10px] font-black tracking-widest text-amber-400 uppercase">
                  VIP PASS • ADMIT ONE
                </span>
                <h3 className="text-xl font-black text-white mt-0.5">{mediaItem.title}</h3>
                <p className="text-xs text-slate-400 font-semibold">{mediaItem.year} • {mediaItem.type.toUpperCase()} • HD STEREO</p>
              </div>

              {mediaItem.poster && (
                <img src={mediaItem.poster} alt={mediaItem.title} className="w-14 h-20 object-cover rounded-xl border border-amber-500/30 shadow-lg" />
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 py-4 text-center border-b border-amber-500/20 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold">SEAT</span>
                <p className="font-bold text-white">BOX-07</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold">HOLDER</span>
                <p className="font-bold text-amber-400 truncate">ctrlquest18</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold">STATUS</span>
                <p className="font-bold text-emerald-400">UNLIMITED</p>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-500 font-mono">TICKET ID</p>
                <p className="text-xs font-mono font-bold text-amber-400 tracking-wider">{ticketNumber}</p>
              </div>
              <div className="p-2 bg-white rounded-xl">
                <QrCode className="w-8 h-8 text-black" />
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleShare}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg"
            >
              {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
              {copied ? 'Copied' : 'Share VIP Pass'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
