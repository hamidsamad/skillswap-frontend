import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Mic, Volume2 } from 'lucide-react';

/**
 * Modern Messaging Voice Note Player
 * Features:
 * - Play / Pause controls
 * - Interactive audio waveform scrubber
 * - Current playback time & total duration
 * - Playback speed toggle (1x / 1.5x / 2x)
 * - Coordinated global audio pausing (only 1 audio plays at a time)
 */
export default function VoiceMessagePlayer({
  voiceUrl,
  duration = 0,
  isMe = false,
  createdAt
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(duration || 0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef(null);

  // Format seconds to MM:SS
  const formatTime = (secs) => {
    if (!secs || isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && audio.duration !== Infinity) {
        setTotalDuration(audio.duration);
      }
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      audio.currentTime = 0;
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handlePlay = () => {
      setIsPlaying(true);
      // Pause any other playing audio on the page
      window.dispatchEvent(new CustomEvent('skillswap_audio_play', { detail: { src: voiceUrl } }));
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('play', handlePlay);

    // Global listener to pause when another audio plays
    const handleGlobalPlay = (e) => {
      if (e.detail?.src !== voiceUrl && audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
      }
    };
    window.addEventListener('skillswap_audio_play', handleGlobalPlay);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('play', handlePlay);
      window.removeEventListener('skillswap_audio_play', handleGlobalPlay);
    };
  }, [voiceUrl]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      setIsLoading(true);
      audio.play().then(() => {
        setIsLoading(false);
        setIsPlaying(true);
      }).catch((err) => {
        console.warn('Playback error:', err.message);
        setIsLoading(false);
        setIsPlaying(false);
      });
    }
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = ratio * (totalDuration || audio.duration || 1);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const toggleSpeed = () => {
    const nextRate = playbackRate === 1 ? 1.5 : playbackRate === 1.5 ? 2 : 1;
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  // Generate 26 pseudo-random deterministic waveform bar heights
  const bars = [
    28, 45, 75, 30, 90, 60, 40, 85, 100, 70, 45, 90, 65,
    35, 80, 55, 95, 75, 40, 60, 85, 30, 70, 50, 40, 65
  ];

  const progressPercent = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  return (
    <div className={`flex flex-col gap-1.5 w-full max-w-[240px] xs:w-64 sm:w-72 select-none ${isMe ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
      <audio ref={audioRef} src={voiceUrl} preload="metadata" />

      <div className="flex items-center gap-3">
        {/* Big circular Play/Pause Button */}
        <button
          type="button"
          onClick={togglePlay}
          className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-md transition-all active:scale-95 cursor-pointer ${
            isMe
              ? 'bg-white text-sky-600 hover:bg-sky-50 shadow-black/10'
              : 'bg-gradient-to-tr from-sky-600 to-teal-600 text-white hover:from-sky-500 hover:to-teal-500 shadow-sky-600/25'
          }`}
          aria-label={isPlaying ? 'Pause voice message' : 'Play voice message'}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 fill-current" />
          ) : (
            <Play className="w-5 h-5 fill-current ml-0.5" />
          )}
        </button>

        {/* Waveform Scrubber & Progress */}
        <div className="flex-1 min-w-0">
          <div
            onClick={handleSeek}
            className="h-8 flex items-center gap-[2.5px] cursor-pointer group py-1"
            title="Click to seek"
          >
            {bars.map((height, i) => {
              const barPercent = (i / bars.length) * 100;
              const isPlayed = progressPercent >= barPercent;

              return (
                <div
                  key={i}
                  className="flex-1 rounded-full transition-all duration-150"
                  style={{
                    height: `${height}%`,
                    backgroundColor: isMe
                      ? isPlayed
                        ? '#FFFFFF'
                        : 'rgba(255, 255, 255, 0.35)'
                      : isPlayed
                        ? '#0284C7'
                        : 'rgba(148, 163, 184, 0.45)'
                  }}
                />
              );
            })}
          </div>

          {/* Time & Duration Row */}
          <div className="flex items-center justify-between text-[11px] font-bold opacity-90 mt-0.5">
            <span className="tabular-nums">
              {isPlaying || currentTime > 0 ? formatTime(currentTime) : formatTime(totalDuration)}
            </span>
            <span className="tabular-nums opacity-75">
              {formatTime(totalDuration)}
            </span>
          </div>
        </div>

        {/* Playback Speed Switcher (1x / 1.5x / 2x) */}
        <button
          type="button"
          onClick={toggleSpeed}
          className={`text-[10px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider shrink-0 transition-all ${
            isMe
              ? 'bg-white/20 text-white hover:bg-white/30'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
          }`}
          title="Playback speed"
        >
          {playbackRate}x
        </button>
      </div>

      {/* Voice Badge Pill */}
      <div className="flex items-center gap-1.5 text-[10px] font-semibold opacity-80 pt-0.5">
        <Mic className="w-3 h-3 shrink-0" />
        <span>Voice Message</span>
      </div>
    </div>
  );
}
