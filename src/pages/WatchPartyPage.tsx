import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Users, X, Send, Copy, Play, Pause, SkipForward, SkipBack,
  Crown, LogOut, Tv, Sparkles, Check, AlertTriangle, ArrowLeft,
  MessageSquare, Film, Star, Clock, Calendar
} from 'lucide-react';
import { toast } from '../services/toast';
import {
  createWatchPartyRoom,
  subscribeToWatchParty,
  updateWatchPartyState,
  deleteWatchPartyRoom,
  joinWatchPartyRoom,
  leaveWatchPartyRoom,
  WatchPartyRoom,
  WatchPartyParticipant
} from '../services/firestoreSync';
import { getCurrentUser } from '../services/auth';
import { getPosterUrl, tmdb } from '../services/tmdb';
import { MediaDetails } from '../types';

interface WatchPartyPageProps {
  roomId?: string;
  mediaItem?: {
    id: number;
    title: string;
    type: 'movie' | 'tv';
    poster: string | null;
  };
  onClose: () => void;
  onNavigate: (route: string) => void;
}

export const WatchPartyPage: React.FC<WatchPartyPageProps> = ({
  roomId: initialRoomId,
  mediaItem,
  onClose,
  onNavigate
}) => {
  const [phase, setPhase] = useState<'lobby' | 'room'>(
    initialRoomId ? 'room' : (mediaItem ? 'lobby' : 'lobby')
  );
  const [roomId, setRoomId] = useState(initialRoomId || '');
  const [joinInput, setJoinInput] = useState('');
  const [roomData, setRoomData] = useState<WatchPartyRoom | null>(null);
  const [mediaDetails, setMediaDetails] = useState<MediaDetails | null>(null);
  const [chatText, setChatText] = useState('');
  const [copied, setCopied] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [mobileTab, setMobileTab] = useState<'details' | 'audience' | 'chat'>('chat');

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const hasJoinedRef = useRef(false);

  const currentUser = getCurrentUser();
  const myId = currentUser?.uid || 'guest-' + Date.now();
  const myName = currentUser?.displayName || 'Guest';

  const isHost = roomData?.hostId === myId;
  const activeParticipants: [string, WatchPartyParticipant][] = roomData?.participants
    ? (Object.entries(roomData.participants).filter(([, p]) => (p as WatchPartyParticipant)?.isActive) as [string, WatchPartyParticipant][])
    : [];
  const participantCount = activeParticipants.length;
  const canBegin = participantCount >= 2;

  useEffect(() => {
    if (!roomId) return;

    const unsub = subscribeToWatchParty(roomId, (data) => {
      setRoomData(data);
      if (!data && phase === 'room') {
        toast.info('Watch party has ended or room was closed');
        onClose();
      }
    });

    return () => unsub();
  }, [roomId, phase, onClose]);

  useEffect(() => {
    if (!roomId || hasJoinedRef.current) return;
    hasJoinedRef.current = true;
    joinWatchPartyRoom(roomId, myId, myName);
  }, [roomId, myId, myName]);

  useEffect(() => {
    const targetId = roomData?.mediaId || mediaItem?.id;
    const targetType = roomData?.mediaType || mediaItem?.type || 'movie';
    if (!targetId) return;

    let isCurrent = true;
    async function loadDetails() {
      try {
        const details = await tmdb.getMediaDetails(targetType, targetId);
        if (isCurrent) setMediaDetails(details);
      } catch {
      }
    }
    loadDetails();
    return () => { isCurrent = false; };
  }, [roomData?.mediaId, roomData?.mediaType, mediaItem?.id, mediaItem?.type]);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [roomData?.messages]);

  const handleLeave = useCallback(async (silent = false) => {
    if (!roomId) return;

    if (isHost && participantCount <= 1) {
      await deleteWatchPartyRoom(roomId);
    } else {
      await leaveWatchPartyRoom(roomId, myId);
    }

    if (!silent) {
      toast.info('Left Watch Party');
      onClose();
    }
  }, [roomId, isHost, participantCount, myId, onClose]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (roomId) handleLeave(true);
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [roomId, handleLeave]);

  const handleCreateRoom = async () => {
    if (!mediaItem) {
      toast.error('Select a movie or TV show to start a Watch Party!');
      return;
    }
    setIsCreating(true);
    try {
      const code = await createWatchPartyRoom({
        hostId: myId,
        hostName: myName,
        mediaId: mediaItem.id,
        mediaType: mediaItem.type,
        mediaTitle: mediaItem.title,
        mediaPoster: mediaItem.poster,
        currentTime: 0,
        isPlaying: true,
        messages: [{
          id: Date.now().toString(),
          sender: 'System',
          text: `Watch party created for "${mediaItem.title}". Invite friends! Movie begins when 2 or more people join.`,
          time: Date.now()
        }],
        participants: {
          [myId]: { displayName: myName, joinedAt: Date.now(), isActive: true }
        },
        participantCount: 1,
        updatedAt: Date.now()
      });
      setRoomId(code);
      setPhase('room');
      toast.success(`Watch Party room ${code} created!`);
    } catch {
      toast.error('Failed to create room');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async () => {
    const code = joinInput.trim().toUpperCase();
    if (!code) return;
    setRoomId(code);
    setPhase('room');
    toast.info(`Joining room ${code}...`);
  };

  const handleEndParty = async () => {
    if (!window.confirm('Are you sure you want to end the watch party? The room will be completely removed for everyone.')) return;
    try {
      await deleteWatchPartyRoom(roomId);
      toast.info('Watch Party ended and data deleted.');
      onClose();
    } catch {
      toast.error('Failed to end party');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatText.trim() || !roomData || !roomId) return;

    const newMsg = {
      id: Date.now().toString(),
      sender: myName,
      text: chatText.trim(),
      time: Date.now()
    };

    try {
      await updateWatchPartyState(roomId, {
        messages: [...(roomData.messages || []), newMsg]
      });
      setChatText('');
    } catch {
      toast.error('Failed to send message');
    }
  };

  const handleHostControl = async (action: 'play' | 'pause' | 'skip-fwd' | 'skip-back') => {
    if (!isHost || !roomData) return;
    let updates: Partial<WatchPartyRoom> = {};
    if (action === 'play') updates = { isPlaying: true };
    else if (action === 'pause') updates = { isPlaying: false };
    else if (action === 'skip-fwd') updates = { currentTime: (roomData.currentTime || 0) + 10 };
    else if (action === 'skip-back') updates = { currentTime: Math.max(0, (roomData.currentTime || 0) - 10) };
    await updateWatchPartyState(roomId, updates);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    toast.success('Room code copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const getStreamUrl = () => {
    const targetId = roomData?.mediaId || mediaItem?.id;
    const targetType = roomData?.mediaType || mediaItem?.type || 'movie';
    if (!targetId) return '';
    if (targetType === 'movie') return `https://vidlink.pro/movie/${targetId}`;
    return `https://vidlink.pro/tv/${targetId}/1/1`;
  };

  if (phase === 'lobby') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 animate-in fade-in duration-200">
        <div className="w-full max-w-lg glass-panel border border-[var(--color-primary)]/40 rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-5 border-b border-white/10 flex items-center justify-between bg-black/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-[var(--color-primary)] flex items-center justify-center shadow-lg">
                <Users className="w-5 h-5 text-black" />
              </div>
              <div>
                <h2 className="font-extrabold text-white text-lg">MovieBox Watch Party</h2>
                <p className="text-xs text-slate-400">Stream synchronously with friends</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

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
                <h4 className="font-bold text-white text-sm">Host New Party</h4>
                <p className="text-xs text-slate-400">You control play, pause, and skips.</p>
                <button
                  onClick={handleCreateRoom}
                  disabled={isCreating || !mediaItem}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-primary)] text-white font-bold text-xs shadow-md hover:brightness-110 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isCreating ? 'Creating Room...' : 'Host Room'}
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-center space-y-3">
                <Users className="w-8 h-8 text-cyan-400 mx-auto" />
                <h4 className="font-bold text-white text-sm">Join With Code</h4>
                <input
                  type="text"
                  placeholder="6-DIGIT CODE"
                  value={joinInput}
                  onChange={(e) => setJoinInput(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 bg-black/50 border border-white/10 text-white text-xs rounded-xl text-center uppercase tracking-widest focus:outline-none focus:border-[var(--color-primary)]"
                  maxLength={8}
                />
                <button
                  onClick={handleJoinRoom}
                  disabled={!joinInput.trim()}
                  className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs disabled:opacity-50 transition-all cursor-pointer"
                >
                  Join Party
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const title = roomData?.mediaTitle || mediaItem?.title || mediaDetails?.title || mediaDetails?.name || 'Watch Party';
  const overview = mediaDetails?.overview || 'Join the live streaming watch party.';
  const year = mediaDetails?.release_date?.substring(0, 4) || mediaDetails?.first_air_date?.substring(0, 4) || '';
  const rating = mediaDetails?.vote_average ? mediaDetails.vote_average.toFixed(1) : null;
  const runtime = mediaDetails?.runtime ? `${Math.floor(mediaDetails.runtime / 60)}h ${mediaDetails.runtime % 60}m` : null;

  return (
    <div className="fixed inset-0 z-50 bg-[#050505] text-white flex flex-col overflow-hidden">
      <header className="h-14 px-4 border-b border-white/10 bg-black/70 flex items-center justify-between gap-4 flex-shrink-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleLeave()}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all flex items-center gap-1.5 text-xs font-semibold"
            title="Leave party"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Leave Party</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-extrabold text-sm text-white truncate max-w-[200px] sm:max-w-md">
              {title}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400">Room:</span>
            <span className="font-black text-[var(--color-primary)] tracking-widest">{roomId}</span>
            <button
              onClick={handleCopyCode}
              className="p-1 hover:text-[var(--color-primary)] transition-colors"
              title="Copy Room Code"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {isHost ? (
            <button
              onClick={handleEndParty}
              className="px-3 py-1.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>End Party</span>
            </button>
          ) : (
            <button
              onClick={() => handleLeave()}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Leave</span>
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          
          <div className="relative w-full aspect-video max-h-[68vh] bg-black overflow-hidden flex-shrink-0 border-b border-white/10">
            
            {!canBegin ? (
              <div className="absolute inset-0 z-30 bg-black/95 flex flex-col items-center justify-center p-6 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center mx-auto animate-pulse">
                  <Users className="w-8 h-8 text-cyan-400" />
                </div>
                <div className="space-y-1 max-w-md">
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    Waiting for Audience to Join
                  </h3>
                  <p className="text-xs text-slate-300">
                    The movie cannot begin if there is only 1 person in the room. Share your room code with friends to start streaming together!
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
                  <span className="text-2xl font-black text-[var(--color-primary)] tracking-widest">{roomId}</span>
                  <button
                    onClick={handleCopyCode}
                    className="px-3 py-1.5 rounded-xl bg-[var(--color-primary)] text-black font-extrabold text-xs flex items-center gap-1.5 hover:brightness-110 transition-all cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied' : 'Copy Code'}
                  </button>
                </div>

                <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-400/10 px-3 py-1.5 rounded-full border border-amber-400/20">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Current members in room: {participantCount} (Need at least 2)</span>
                </div>
              </div>
            ) : (
              <>
                <iframe
                  ref={iframeRef}
                  src={getStreamUrl()}
                  className="w-full h-full border-0 select-none"
                  allowFullScreen
                  allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                  style={{ pointerEvents: isHost ? 'auto' : 'none' }}
                  title={title}
                />

                {!isHost && (
                  <div
                    className="absolute inset-0 z-20 cursor-not-allowed select-none"
                    style={{ background: 'transparent' }}
                    title="Only the host controls the movie playback"
                    onClick={() => toast.info(`Only host (${roomData?.hostName || 'Host'}) has playback controls.`)}
                  />
                )}
              </>
            )}
          </div>

          <div className="p-4 bg-black/60 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-black/80 border border-white/10 flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Roomcode:</span>
                <span className="text-sm font-black text-[var(--color-primary)] tracking-widest">{roomId}</span>
                <button
                  onClick={handleCopyCode}
                  className="p-1 text-slate-400 hover:text-white transition-colors"
                  title="Copy code"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="text-xs text-slate-400 hidden sm:flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-cyan-400" />
                <span>{participantCount} audience members</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isHost ? (
                <div className="flex items-center gap-1.5 bg-black/80 rounded-2xl border border-[var(--color-primary)]/40 px-3 py-1.5 shadow-lg shadow-[var(--color-primary)]/10">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Host Controls</span>
                  <div className="flex items-center gap-1 ml-2">
                    <button
                      onClick={() => handleHostControl('skip-back')}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
                      title="Skip back 10s"
                    >
                      <SkipBack className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleHostControl(roomData?.isPlaying ? 'pause' : 'play')}
                      className="p-1.5 rounded-lg bg-[var(--color-primary)] text-black font-bold hover:brightness-110 transition-all cursor-pointer"
                      title={roomData?.isPlaying ? 'Pause' : 'Play'}
                    >
                      {roomData?.isPlaying ? <Pause className="w-3.5 h-3.5 fill-black" /> : <Play className="w-3.5 h-3.5 fill-black" />}
                    </button>
                    <button
                      onClick={() => handleHostControl('skip-fwd')}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
                      title="Skip forward 10s"
                    >
                      <SkipForward className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-black/70 border border-white/10 text-xs text-slate-300">
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span>Host ({roomData?.hostName || 'Host'}) controls playback</span>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row items-start gap-4">
              {roomData?.mediaPoster && (
                <img
                  src={getPosterUrl(roomData.mediaPoster)}
                  alt={title}
                  className="w-20 sm:w-28 rounded-2xl shadow-xl border border-white/10 object-cover flex-shrink-0"
                />
              )}
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--color-primary)] text-black">
                    {roomData?.mediaType === 'tv' ? 'TV Show' : 'Movie'}
                  </span>
                  {year && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/10 text-slate-300 border border-white/10 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {year}
                    </span>
                  )}
                  {runtime && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/10 text-slate-300 border border-white/10 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {runtime}
                    </span>
                  )}
                  {rating && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" />
                      {rating}
                    </span>
                  )}
                </div>

                <h1 className="text-xl sm:text-2xl font-black text-white">{title}</h1>
                <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">{overview}</p>

                {mediaDetails?.genres && mediaDetails.genres.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {mediaDetails.genres.map((g) => (
                      <span
                        key={g.id}
                        className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] text-slate-300 border border-white/10"
                      >
                        {g.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-80 xl:w-96 border-t lg:border-t-0 lg:border-l border-white/10 bg-[#0a0a0a] flex flex-col flex-shrink-0 h-[450px] lg:h-auto min-h-0">
          
          <div className="h-44 sm:h-48 border-b border-white/10 flex flex-col min-h-0 bg-black/40">
            <div className="p-3 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Audience ({participantCount})
                </span>
              </div>
              <span className="text-[10px] text-slate-400">
                {isHost ? 'You are Host' : `Host: ${roomData?.hostName || 'Host'}`}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {activeParticipants.map(([uid, p]) => {
                const isUserHost = uid === roomData?.hostId;
                const isMe = uid === myId;
                return (
                  <div
                    key={uid}
                    className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[var(--color-primary)] to-purple-600 flex items-center justify-center text-[10px] font-black text-black flex-shrink-0">
                        {p.displayName?.[0]?.toUpperCase() || '?'}
                      </div>
                      <span className="text-xs font-semibold text-white truncate">
                        {p.displayName} {isMe ? '(You)' : ''}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {isUserHost && (
                        <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-black uppercase flex items-center gap-1">
                          <Crown className="w-2.5 h-2.5 text-amber-400" />
                          Host
                        </span>
                      )}
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex-1 flex flex-col min-h-0 bg-[#080808]">
            <div className="p-3 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[var(--color-primary)]" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Party Chat
                </span>
              </div>
              <span className="text-[10px] text-slate-500">Live Sync</span>
            </div>

            <div
              ref={chatBoxRef}
              className="flex-1 overflow-y-auto p-3 space-y-2.5 min-h-0 text-xs"
            >
              {(roomData?.messages || []).map((msg) => {
                const isSystem = msg.sender === 'System';
                const isMe = msg.sender === myName;
                return (
                  <div key={msg.id} className={isSystem ? 'text-center my-1' : ''}>
                    {isSystem ? (
                      <span className="text-[10px] text-slate-400 italic bg-white/5 px-2.5 py-1 rounded-full border border-white/5 inline-block">
                        {msg.text}
                      </span>
                    ) : (
                      <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        <span className="text-[9px] text-slate-500 mb-0.5 px-1">{msg.sender}</span>
                        <div
                          className={`px-3 py-1.5 rounded-2xl max-w-[85%] break-words ${
                            isMe
                              ? 'bg-[var(--color-primary)] text-black font-semibold rounded-br-sm'
                              : 'bg-white/10 text-white rounded-bl-sm'
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <form onSubmit={handleSendMessage} className="p-3 border-t border-white/10 flex gap-2 bg-black/40">
              <input
                type="text"
                value={chatText}
                onChange={(e) => setChatText(e.target.value)}
                placeholder="Say something to the room..."
                maxLength={200}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[var(--color-primary)] min-w-0"
              />
              <button
                type="submit"
                disabled={!chatText.trim()}
                className="p-2 rounded-xl bg-[var(--color-primary)] text-black font-bold disabled:opacity-40 hover:brightness-110 transition-all flex-shrink-0 cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
