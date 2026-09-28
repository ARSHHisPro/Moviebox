import React, { useState } from 'react';
import { FolderPlus, X, Plus, Film, Check, Sparkles } from 'lucide-react';
import { toast } from '../services/toast';
import { saveUserPlaylist } from '../services/firestoreSync';

interface CustomPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaItem?: {
    id: number;
    title: string;
    type: 'movie' | 'tv';
    poster: string | null;
    year?: string;
  };
}

export const CustomPlaylistModal: React.FC<CustomPlaylistModalProps> = ({
  isOpen,
  onClose,
  mediaItem
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsLoading(true);
    try {
      await saveUserPlaylist('ctrlquest18', {
        userId: 'ctrlquest18',
        title: title.trim(),
        description: description.trim(),
        itemCount: mediaItem ? 1 : 0,
        items: mediaItem ? [{
          id: mediaItem.id,
          title: mediaItem.title,
          poster: mediaItem.poster,
          type: mediaItem.type,
          year: mediaItem.year
        }] : [],
        createdAt: Date.now()
      });
      toast.success(`Custom playlist "${title}" saved to Firestore!`);
      setTitle('');
      setDescription('');
      onClose();
    } catch (e) {
      toast.error('Failed saving playlist');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-md glass-panel border border-[var(--color-primary)]/40 rounded-3xl overflow-hidden flex flex-col shadow-2xl">

        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--color-primary)]/20 text-[var(--color-primary)] border border-[var(--color-primary)]/30 flex items-center justify-center">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-white text-base">New Custom Playlist</h2>
              <p className="text-xs text-slate-400">Organize your movies & TV shows</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleCreate} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Playlist Title</label>
            <input
              type="text"
              placeholder="e.g. Weekend Binge, Sci-Fi Gems, Date Night"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white/5 border border-white/10 text-white text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-[var(--color-primary)]"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Description (Optional)</label>
            <textarea
              rows={2}
              placeholder="Brief description of this custom collection..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white/5 border border-white/10 text-white text-xs rounded-xl p-3 focus:outline-none focus:border-[var(--color-primary)] resize-none"
            />
          </div>

          {mediaItem && (
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
              {mediaItem.poster ? (
                <img src={mediaItem.poster} alt={mediaItem.title} className="w-8 h-12 object-cover rounded-lg" />
              ) : (
                <Film className="w-6 h-6 text-slate-500" />
              )}
              <div className="text-xs">
                <span className="text-[10px] text-slate-400">Initial Item</span>
                <p className="font-bold text-white truncate">{mediaItem.title}</p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={!title.trim() || isLoading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-primary)] text-white font-bold text-xs shadow-lg hover:brightness-110 disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Create & Save Playlist'}
          </button>
        </form>
      </div>
    </div>
  );
};
