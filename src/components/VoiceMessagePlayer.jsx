import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Mic, Volume2, AlertCircle, RefreshCw } from 'lucide-react';
import { resolveMediaUrl } from '../utils/mediaUrl';

/**
 * Modern Messaging Voice Note Player
 * Features:
 * - Play / Pause controls with cross-origin media URL resolution
 * - Interactive audio waveform scrubber
 * - Current playback time & total duration (with Chromium WebM Infinity duration workaround)
 * - Playback speed toggle (1x / 1.5x / 2x)
 * - Coordinated global audio pausing (only 1 audio plays at a time)
 * - Graceful error handling and retry mechanism
 */
export default function VoiceMessagePlayer({
  voiceUrl,
  duration = 0,
  isMe = false,
  createdAt
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(Number(duration) || 0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const audioRef = useRef(null);

  // Resolve media URL (handles data URIs, Cloudinary URLs, and relative /uploads paths)
  const resolvedUrl = resolveMediaUrl(voiceUrl);

  // Format seconds to MM:SS
  const formatTime = (secs) => {
    if (!secs || isNaN(secs) || secs < 0 || !Number.isFinite(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    setHasError(false);
    setIsPlaying(false);
    setCurrentTime(0);

    const handleLoadedMetadata = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        setTotalDuration(audio.duration);
      } else if (duration && Number(duration) > 0) {
        setTotalDuration(Number(duration));
      }
      setIsLoading(false);
      setHasError(false);
    };

    const handleTimeUpdate = () => {
      if (Number.isFinite(audio.currentTime)) {
        setCurrentTime(audio.currentTime);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      try {
        audio.currentTime = 0;
      } catch (e) {}
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handlePlay = () => {
      setIsPlaying(true);
      setHasError(false);
      // Pause any other playing audio on the page
      window.dispatchEvent(new CustomEvent('skillswap_audio_play', { detail: { src: resolvedUrl } }));
    };

    const handleError = () => {
      console.warn('Voice message audio load error for URL:', resolvedUrl);
      setIsLoading(false);
      setIsPlaying(false);
      setHasError(true);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('error', handleError);

    // Global listener to pause when another audio plays
    const handleGlobalPlay = (e) => {
      if (e.detail?.src !== resolvedUrl && audioRef.current && !audioRef.current.paused) {
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
      audio.removeEventListener('error', handleError);
      window.removeEventListener('skillswap_audio_play', handleGlobalPlay);
    };
  }, [resolvedUrl, duration]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      setIsLoading(true);
      setHasError(false);

      // If audio already reached the end, rewind before playing
      const effDur = Number.isFinite(totalDuration) && totalDuration > 0 ? totalDuration : (audio.duration || 0);
      if (audio.ended || (effDur > 0 && Math.abs(audio.currentTime - effDur) < 0.2)) {
        audio.currentTime = 0;
      }

      audio.play().then(() => {
        setIsLoading(false);
        setIsPlaying(true);
      }).catch((err) => {
        console.warn('Playback error:', err.message);
        setIsLoading(false);
        setIsPlaying(false);
        setHasError(true);
      });
    }
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));

    const effectiveDuration = (Number.isFinite(totalDuration) && totalDuration > 0)
      ? totalDuration
      : (Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : 1);

    const newTime = ratio * effectiveDuration;
    if (Number.isFinite(newTime)) {
      audio.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const toggleSpeed = () => {
    const nextRate = playbackRate === 1 ? 1.5 : playbackRate === 1.5 ? 2 : 1;
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  const retryPlayback = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setHasError(false);
    setIsLoading(true);
    audio.load();
    togglePlay();
  };

  // Generate 26 pseudo-random deterministic waveform bar heights
  const bars = [
    28, 45, 75, 30, 90, 60, 40, 85, 100, 70, 45, 90, 65,
    35, 80, 55, 95, 75, 40, 60, 85, 30, 70, 50, 40, 65
  ];

  const effectiveTotal = Number.isFinite(totalDuration) && totalDuration > 0 ? totalDuration : 1;
  const progressPercent = effectiveTotal > 0 ? (currentTime / effectiveTotal) * 100 : 0;

  return (
    <div className={`flex flex-col gap-1.5 w-full max-w-[240px] xs:w-64 sm:w-72 select-none ${isMe ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
      <audio
        ref={audioRef}
        src={resolvedUrl}
        preload="metadata"
      />

      <div className="flex items-center gap-3">
        {/* Big circular Play/Pause Button */}
        <button
          type="button"
          onClick={hasError ? retryPlayback : togglePlay}
          className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-md transition-all active:scale-95 cursor-pointer ${
            hasError
              ? 'bg-rose-500 text-white hover:bg-rose-600 shadow-rose-500/25'
              : isMe
                ? 'bg-white text-[#102B50] hover:bg-white/90 shadow-black/10'
                : 'bg-gradient-to-tr from-[#07866D] to-teal-600 text-white hover:from-[#06725C] hover:to-teal-500 shadow-emerald-600/25'
          }`}
          aria-label={hasError ? 'Retry loading audio' : (isPlaying ? 'Pause voice message' : 'Play voice message')}
        >
          {hasError ? (
            <RefreshCw className="w-5 h-5" />
          ) : isPlaying ? (
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
                        ? '#07866D'
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
      <div className="flex items-center justify-between text-[10px] font-semibold opacity-80 pt-0.5">
        <div className="flex items-center gap-1.5">
          <Mic className="w-3 h-3 shrink-0" />
          <span>Voice Message</span>
        </div>
        {hasError && (
          <span className="text-rose-400 font-bold flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Audio unavailable
          </span>
        )}
      </div>
    </div>
  );
}
