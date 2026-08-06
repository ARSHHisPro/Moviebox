import React, { useState, useEffect } from 'react';
import { Users, X, Send, Copy, Play, Pause, Tv, Sparkles, Check } from 'lucide-react';
import { toast } from '../services/toast';
import { createWatchPartyRoom, subscribeToWatchParty, updateWatchPartyState, WatchPartyRoom } from '../services/firestoreSync';
import { getCurrentUser } from '../services/auth';

interface WatchPartyModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaItem?: {
    id: number;
    title: string;
    type: 'movie' | 'tv';
    poster: string | null;
  };
  onNavigateToWatch: (mediaId: number, mediaType: 'movie' | 'tv', roomId?: string) => void;
}

export const WatchPartyModal: React.FC<WatchPartyModalProps> = ({
  isOpen,
  onClose,
  mediaItem,
  onNavigateToWatch
}) => {
  const [roomId, setRoomId] = useState<string>('');
  const [joinInput, setJoinInput] = useState<string>('');
  const [roomData, setRoomData] = useState<WatchPartyRoom | null>(null);
  const [chatText, setChatText] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState<boolean>(false);

  useEffect(() => {
    if (!roomId) return;
    const unsubscribe = subscribeToWatchParty(roomId, (data) => {
      setRoomData(data);
    });
    return () => unsubscribe();
  }, [roomId]);

  if (!isOpen) return null;

  const handleCreateRoom = async () => {
    if (!mediaItem) {
      toast.error('Select a movie or TV show to start a Watch Party!');
      return;
    }
    setIsCreating(true);
    const currentUser = getCurrentUser();
    const hostId = currentUser ? currentUser.uid : 'guest-' + Date.now();
    const hostName = currentUser ? currentUser.displayName : 'Guest Host';

    try {
      const code = await createWatchPartyRoom({
        hostId,
        hostName,
        mediaId: mediaItem.id,
        mediaType: mediaItem.type,
        mediaTitle: mediaItem.title,
        mediaPoster: mediaItem.poster,
        currentTime: 0,
        isPlaying: true,
        messages: [
          {
            id: '1',
            sender: 'System',
            text: `🎉 Watch Party initialized for "${mediaItem.title}"! Share room code to invite friends.`,
            time: Date.now()
          }
        ],
        participantCount: 1,
        updatedAt: Date.now()
      });
      setRoomId(code);
      toast.success(`Watch Party room ${code} generated!`);
    } catch (e) {
      toast.error('Failed creating Watch Party room');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = () => {
    const code = joinInput.trim().toUpperCase();
    if (!code) return;
    setRoomId(code);
    toast.info(`Joined Watch Party room ${code}`);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatText.trim() || !roomData || !roomId) return;

    const currentUser = getCurrentUser();
    const sender = currentUser ? currentUser.displayName : 'Guest Cinephile';

    const newMsg = {
      id: Date.now().toString(),
      sender,
      text: chatText.trim(),
      time: Date.now()
    };

    try {
      await updateWatchPartyState(roomId, {
        messages: [...(roomData.messages || []), newMsg]
      });
      setChatText('');
    } catch (e) {
      toast.error('Failed sending message');
    }
  };

  const handleCopyCode = () => {
    if (!roomId) return;
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    toast.success('Room code copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl glass-panel border border-[var(--color-primary)]/40 rounded-3xl overflow-hidden flex flex-col max-h-[90vh] shadow-2xl">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-[var(--color-primary)] p-0.5 flex items-center justify-center shadow-lg">
              <Users className="w-5 h-5 text-black" />
            </div>
            <div>
              <h2 className="font-extrabold text-white text-base sm:text-lg flex items-center gap-2">
                MovieBox Sync Watch Party
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/30">
                  Real-time Sync
                </span>
              </h2>
              <p className="text-xs text-slate-400">Watch simultaneously with friends in live sync</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {!roomId ? (
          <div className="p-6 space-y-6">
            {mediaItem && (
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4">
                {mediaItem.poster ? (
                  <img src={mediaItem.poster} alt={mediaItem.title} className="w-12 h-16 object-cover rounded-xl shadow-md" />
                ) : (
                  <div className="w-12 h-16 bg-slate-800 rounded-xl flex items-center justify-center">
                    <Tv className="w-6 h-6 text-slate-500" />
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-white text-sm">{mediaItem.title}</h3>
                  <p className="text-xs text-slate-400 uppercase font-semibold mt-0.5">{mediaItem.type}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 text-center space-y-3">
                <Sparkles className="w-8 h-8 text-[var(--color-primary)] mx-auto animate-pulse" />
                <h4 className="font-bold text-white text-sm">Host a New Room</h4>
                <p className="text-xs text-slate-400">Generate a unique sync room code for this title.</p>
                <button
                  onClick={handleCreateRoom}
                  disabled={isCreating}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-primary)] text-white font-bold text-xs shadow-md hover:brightness-110 disabled:opacity-50"
                >
                  {isCreating ? 'Generating...' : 'Host Watch Party'}
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-center space-y-3">
                <Users className="w-8 h-8 text-cyan-400 mx-auto" />
                <h4 className="font-bold text-white text-sm">Join Existing Room</h4>
                <input
                  type="text"
                  placeholder="Enter 6-digit Code"
                  value={joinInput}
                  onChange={(e) => setJoinInput(e.target.value)}
                  className="w-full px-3 py-2 bg-black/50 border border-white/10 text-white text-xs rounded-xl text-center uppercase tracking-widest focus:outline-none focus:border-[var(--color-primary)]"
                />
                <button
                  onClick={handleJoinRoom}
                  disabled={!joinInput.trim()}
                  className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs disabled:opacity-50 transition-all"
                >
                  Join Room
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-5 space-y-4 flex-1 flex flex-col overflow-hidden">
            {/* Room Info Bar */}
            <div className="p-3 rounded-2xl bg-black/60 border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Room Code</span>
                <div className="text-lg font-black text-[var(--color-primary)] tracking-widest">{roomId}</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyCode}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy Code'}
                </button>
                {roomData && (
                  <button
                    onClick={() => {
                      onNavigateToWatch(roomData.mediaId, roomData.mediaType, roomId);
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[var(--color-primary)] text-black font-extrabold text-xs flex items-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 fill-black" /> Stream Now
                  </button>
                )}
              </div>
            </div>

            {/* Chat Box */}
            <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-black/40 rounded-2xl border border-white/5 min-h-[200px]">
              {roomData?.messages?.map((msg) => (
                <div key={msg.id} className="text-xs">
                  <span className="font-bold text-[var(--color-primary)]">{msg.sender}: </span>
                  <span className="text-slate-200">{msg.text}</span>
                </div>
              ))}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                placeholder="Type live message..."
                value={chatText}
                onChange={(e) => setChatText(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 text-white text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-[var(--color-primary)]"
              />
              <button
                type="submit"
                disabled={!chatText.trim()}
                className="p-2.5 bg-[var(--color-primary)] text-black rounded-xl font-bold disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
