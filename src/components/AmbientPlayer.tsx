import React, { useState, useRef } from 'react';
import { Volume2, VolumeX, Music, Disc, Sparkles } from 'lucide-react';

interface Soundtrack {
  id: string;
  name: string;
  genre: string;
  url: string;
}

const SOUNDTRACKS: Soundtrack[] = [
  {
    id: 'rain',
    name: 'Cozy Rain on Cinema Glass',
    genre: 'Ambient Atmosphere',
    url: 'https://cdn.pixabay.com/download/audio/2021/09/06/audio_34b3f3b95d.mp3'
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon Horizon',
    genre: 'Synthwave Drone',
    url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8b18a3811.mp3'
  },
  {
    id: 'orchestral',
    name: 'Cinematic Orchestral Space',
    genre: 'Epic Atmosphere',
    url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3'
  }
];

export const AmbientPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSound, setCurrentSound] = useState<Soundtrack>(SOUNDTRACKS[0]);
  const [volume, setVolume] = useState(0.4);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.volume = volume;
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleSelect = (sound: Soundtrack) => {
    setCurrentSound(sound);
    if (audioRef.current) {
      audioRef.current.src = sound.url;
      if (isPlaying) {
        audioRef.current.play().catch(() => {});
      }
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-40 hidden md:flex items-center gap-3 p-2.5 rounded-2xl glass-panel border border-white/10 bg-black/60 shadow-xl backdrop-blur-md">
      <audio ref={audioRef} src={currentSound.url} loop />

      <button
        onClick={togglePlay}
        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
          isPlaying
            ? 'bg-[var(--color-primary)] text-black shadow-lg shadow-[var(--color-primary-glow)] animate-pulse'
            : 'bg-white/10 text-slate-300 hover:text-white'
        }`}
      >
        {isPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
      </button>

      <div className="text-left pr-2">
        <div className="text-[11px] font-bold text-white flex items-center gap-1.5">
          <Disc className={`w-3 h-3 text-[var(--color-primary)] ${isPlaying ? 'animate-spin' : ''}`} />
          {currentSound.name}
        </div>
        <div className="text-[9px] text-slate-400">{currentSound.genre}</div>
      </div>

      <div className="flex gap-1 border-l border-white/10 pl-2">
        {SOUNDTRACKS.map((s) => (
          <button
            key={s.id}
            onClick={() => handleSelect(s)}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
              currentSound.id === s.id
                ? 'bg-white/20 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {s.id.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
};
