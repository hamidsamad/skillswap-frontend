import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Square,
  Trash2,
  Send,
  Play,
  Pause,
  AlertCircle,
  X,
  Loader2,
  Volume2
} from 'lucide-react';

/**
 * VoiceRecorderBar
 * Highly reliable, mobile-optimized audio recording component using MediaRecorder API.
 * Features:
 * - Configurable auto-stop duration limit (default 60s) to prevent indefinite recording
 * - Synchronous ref-guarded recording state machine preventing race conditions
 * - Mobile Safari & Android Chrome compatible: stops tracks only AFTER recorder flushes final chunk
 * - Handled browser interruptions, tab backgrounding (visibilitychange), and screen lock
 * - Dynamic MIME type detection for iOS (.mp4/.aac) and Android/Desktop (.webm/.ogg)
 * - Real-time elapsed duration with countdown when approaching auto-stop limit
 * - In-place audio preview with Play/Pause, Discard, and single-tap binary send
 */
export default function VoiceRecorderBar({
  onSendVoice,
  disabled = false,
  renderTextInput,
  maxDuration = 60 // 60s auto-stop limit by default
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioDuration, setAudioDuration] = useState(0);
  const [permissionError, setPermissionError] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Preview player states
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [previewTime, setPreviewTime] = useState(0);

  // Synchronous State Machine Refs (prevents stale closures and race conditions on mobile)
  const isRecordingRef = useRef(false);
  const isStartingRef = useRef(false);
  const isStoppingRef = useRef(false);
  const isCancelledRef = useRef(false);

  const mediaRecorderRef = useRef(null);
  const audioStreamRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const autoStopTimeoutRef = useRef(null);
  const stopSafetyTimeoutRef = useRef(null);
  const audioChunksRef = useRef([]);
  const previewAudioRef = useRef(null);
  const startTimeRef = useRef(0);
  const recordingTimeRef = useRef(0);
  const maxDurationRef = useRef(maxDuration);
  const selectedMimeRef = useRef('audio/webm');

  // Keep maxDurationRef in sync with prop
  useEffect(() => {
    maxDurationRef.current = maxDuration;
  }, [maxDuration]);

  // Format seconds into MM:SS
  const formatTime = (secs) => {
    if (!secs || isNaN(secs) || secs < 0 || !Number.isFinite(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Clear all running timers reliably
  const clearAllTimers = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (autoStopTimeoutRef.current) {
      clearTimeout(autoStopTimeoutRef.current);
      autoStopTimeoutRef.current = null;
    }
    if (stopSafetyTimeoutRef.current) {
      clearTimeout(stopSafetyTimeoutRef.current);
      stopSafetyTimeoutRef.current = null;
    }
  };

  // Safely stop all hardware audio tracks (only after MediaRecorder has stopped or during hard cancel)
  const cleanupTracks = () => {
    if (audioStreamRef.current) {
      try {
        audioStreamRef.current.getTracks().forEach((track) => {
          try {
            track.onended = null;
            track.stop();
          } catch (_) {}
        });
      } catch (_) {}
      audioStreamRef.current = null;
    }
  };

  // Full cleanup of recorder instance & streams
  const cleanupRecording = () => {
    clearAllTimers();
    if (mediaRecorderRef.current) {
      try {
        if (mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
        }
      } catch (_) {}
      mediaRecorderRef.current = null;
    }
    cleanupTracks();
    isRecordingRef.current = false;
    isStartingRef.current = false;
    isStoppingRef.current = false;
  };

  // Lifecycle cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupRecording();
      if (audioUrl) {
        try { URL.revokeObjectURL(audioUrl); } catch (_) {}
      }
    };
  }, [audioUrl]);

  // Handle browser tab backgrounding or mobile phone screen locking
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && isRecordingRef.current) {
        // Automatically stop and finalize voice note instead of letting it run in zombie background state
        stopRecording();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Internal finalizer called when MediaRecorder fires onstop or safety fallback triggers
  const handleRecorderStop = (mimeType) => {
    clearAllTimers();

    if (isCancelledRef.current) {
      cleanupTracks();
      isRecordingRef.current = false;
      isStartingRef.current = false;
      isStoppingRef.current = false;
      setIsRecording(false);
      return;
    }

    try {
      const chunks = audioChunksRef.current || [];
      const finalBlob = new Blob(chunks, { type: mimeType || selectedMimeRef.current || 'audio/webm' });
      const finalDuration = recordingTimeRef.current > 0
        ? recordingTimeRef.current
        : Math.max(1, Math.round((Date.now() - (startTimeRef.current || Date.now())) / 1000));

      if (finalBlob.size > 0 && finalDuration >= 1) {
        const finalUrl = URL.createObjectURL(finalBlob);
        setAudioBlob(finalBlob);
        setAudioUrl(finalUrl);
        setAudioDuration(finalDuration);
      } else if (chunks.length > 0 && finalBlob.size > 0) {
        const finalUrl = URL.createObjectURL(finalBlob);
        setAudioBlob(finalBlob);
        setAudioUrl(finalUrl);
        setAudioDuration(1);
      } else {
        console.warn('Voice recording captured empty audio buffer');
        setPermissionError('Audio recording was empty or too short. Please try speaking into the microphone again.');
      }
    } catch (err) {
      console.error('Failed to create audio blob:', err);
      setPermissionError('Could not process recorded audio. Please try again.');
    } finally {
      // Release microphone hardware tracks ONLY after blob has been safely built
      cleanupTracks();
      isRecordingRef.current = false;
      isStartingRef.current = false;
      isStoppingRef.current = false;
      setIsRecording(false);
    }
  };

  // Start recording
  const startRecording = async () => {
    if (isRecordingRef.current || isStartingRef.current || disabled) return;
    isStartingRef.current = true;
    isCancelledRef.current = false;
    setPermissionError('');

    // Clear old preview if any
    if (audioUrl) {
      try { URL.revokeObjectURL(audioUrl); } catch (_) {}
      setAudioUrl(null);
    }
    setAudioBlob(null);
    setAudioDuration(0);
    setRecordingTime(0);
    recordingTimeRef.current = 0;
    audioChunksRef.current = [];

    // Check secure context requirement for microphone access
    if (
      typeof window !== 'undefined' &&
      !window.isSecureContext &&
      window.location.hostname !== 'localhost' &&
      window.location.hostname !== '127.0.0.1'
    ) {
      setPermissionError('Microphone access requires a secure HTTPS connection in this browser.');
      isStartingRef.current = false;
      return;
    }

    // Validate browser support for MediaRecorder
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || typeof MediaRecorder === 'undefined') {
      setPermissionError('Voice recording is not supported by your current browser.');
      isStartingRef.current = false;
      return;
    }

    try {
      // 1. Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      audioStreamRef.current = stream;

      // Handle system interruption on audio tracks (e.g. phone call or headset disconnected)
      stream.getAudioTracks().forEach((track) => {
        track.onended = () => {
          if (isRecordingRef.current) {
            console.warn('Microphone track ended unexpectedly by system');
            stopRecording();
          }
        };
      });

      // 2. Select supported MIME type safely (iOS Safari prefers mp4/aac; Chrome prefers webm)
      const candidateTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/aac',
        'audio/ogg;codecs=opus',
        'audio/ogg'
      ];

      let selectedMime = '';
      if (typeof MediaRecorder.isTypeSupported === 'function') {
        selectedMime = candidateTypes.find((t) => {
          try { return MediaRecorder.isTypeSupported(t); } catch (_) { return false; }
        }) || '';
      }

      const recorderOptions = selectedMime ? { mimeType: selectedMime } : {};
      const recorder = new MediaRecorder(stream, recorderOptions);
      const recordedMime = recorder.mimeType || selectedMime || 'audio/webm';
      selectedMimeRef.current = recordedMime;
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onerror = (e) => {
        console.error('MediaRecorder runtime error:', e.error || e);
        setPermissionError('Voice recording was interrupted. Please try again.');
        stopRecording();
      };

      recorder.onstop = () => {
        handleRecorderStop(recordedMime);
      };

      startTimeRef.current = Date.now();
      // Collect chunks every 500ms
      recorder.start(500);

      isRecordingRef.current = true;
      isStartingRef.current = false;
      setIsRecording(true);

      // 3. Start live timer tracking elapsed seconds and enforce automatic stop limit
      timerIntervalRef.current = setInterval(() => {
        if (!isRecordingRef.current) return;
        const elapsed = Math.max(1, Math.floor((Date.now() - startTimeRef.current) / 1000));
        recordingTimeRef.current = elapsed;
        setRecordingTime(elapsed);

        // Automatic stop when reaching maximum recording limit
        if (elapsed >= maxDurationRef.current) {
          stopRecording();
        }
      }, 250);

      // Hard auto-stop safety timeout (in case setInterval drifts on backgrounded mobile thread)
      autoStopTimeoutRef.current = setTimeout(() => {
        if (isRecordingRef.current) {
          stopRecording();
        }
      }, (maxDurationRef.current + 0.5) * 1000);

    } catch (err) {
      console.error('Microphone access error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionError('Microphone permission was denied. Please allow microphone access in your browser settings to record voice messages.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setPermissionError('No microphone detected on your device. Please plug in a microphone.');
      } else {
        setPermissionError(err.message || 'Unable to access microphone.');
      }
      isStartingRef.current = false;
      isRecordingRef.current = false;
      setIsRecording(false);
      cleanupRecording();
    }
  };

  // Stop recording and transition smoothly to preview mode
  const stopRecording = () => {
    // Prevent double stops
    if (!isRecordingRef.current || isStoppingRef.current) return;
    isStoppingRef.current = true;

    // Immediately stop timer ticker and freeze elapsed time
    clearAllTimers();
    const finalElapsed = Math.max(1, Math.floor((Date.now() - startTimeRef.current) / 1000));
    recordingTimeRef.current = Math.min(finalElapsed, maxDurationRef.current);
    setRecordingTime(recordingTimeRef.current);

    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      try {
        // Flush any remaining audio data in recorder buffer
        try { recorder.requestData(); } catch (_) {}
        recorder.stop();
      } catch (err) {
        console.warn('Error invoking recorder.stop():', err);
        handleRecorderStop(selectedMimeRef.current);
      }
    } else {
      handleRecorderStop(selectedMimeRef.current);
    }

    // Fallback safety timeout (800ms) in case mobile browser fails to fire onstop
    stopSafetyTimeoutRef.current = setTimeout(() => {
      if (isRecordingRef.current) {
        console.warn('onstop safety timer triggered fallback completion');
        handleRecorderStop(selectedMimeRef.current);
      }
    }, 800);
  };

  // Cancel / Discard active recording immediately
  const cancelRecording = () => {
    isCancelledRef.current = true;
    cleanupRecording();
    setIsRecording(false);
    setRecordingTime(0);
    recordingTimeRef.current = 0;
    if (audioUrl) {
      try { URL.revokeObjectURL(audioUrl); } catch (_) {}
      setAudioUrl(null);
    }
    setAudioBlob(null);
    setAudioDuration(0);
    setIsPreviewPlaying(false);
  };

  // Preview audio handlers
  const togglePreviewPlay = () => {
    const audio = previewAudioRef.current;
    if (!audio) return;
    if (isPreviewPlaying) {
      audio.pause();
      setIsPreviewPlaying(false);
    } else {
      if (audio.ended) {
        audio.currentTime = 0;
      }
      audio.play().then(() => {
        setIsPreviewPlaying(true);
      }).catch(console.warn);
    }
  };

  // Send voice message
  const handleSend = async () => {
    if (!audioBlob || isUploading) return;
    setIsUploading(true);
    setPermissionError('');

    const currentBlob = audioBlob;
    const currentUrl = audioUrl;
    const finalDur = audioDuration || recordingTimeRef.current || 1;

    try {
      // Pass raw audioBlob directly to optimistic chat handler
      await onSendVoice({
        audioBlob: currentBlob,
        audioUrl: currentUrl,
        duration: finalDur
      });
      // Reset recorder bar after successful handoff
      cancelRecording();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to send voice message';
      setPermissionError(msg);
    } finally {
      setIsUploading(false);
    }
  };

  // 1. Permission error banner
  if (permissionError) {
    return (
      <div className="w-full flex items-center justify-between gap-3 p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs text-rose-600 dark:text-rose-400 animate-in fade-in duration-200">
        <div className="flex items-center gap-2 min-w-0">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="font-semibold truncate">{permissionError}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              setPermissionError('');
              cancelRecording();
            }}
            className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-600 dark:text-rose-400 text-[11px] font-bold transition-colors cursor-pointer"
          >
            Dismiss
          </button>
          <button
            type="button"
            onClick={() => {
              setPermissionError('');
              cancelRecording();
            }}
            className="p-1 rounded-lg hover:bg-rose-500/20 text-rose-500 transition-colors"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // 2. Active recording mode (with auto-stop countdown indicator & responsive mobile controls)
  if (isRecording) {
    const isNearLimit = maxDuration - recordingTime <= 10 && maxDuration > 10;
    const remainingSeconds = Math.max(0, maxDuration - recordingTime);

    return (
      <div className="w-full flex items-center justify-between gap-2 sm:gap-3 p-2 sm:p-2.5 px-3 sm:px-4 bg-rose-500/10 dark:bg-rose-950/30 border border-rose-500/30 rounded-2xl animate-in fade-in duration-200 touch-manipulation">
        {/* Pulsing red indicator & timer */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600" />
          </span>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">
              <span className="hidden xs:inline">Recording</span>
              <span className="xs:hidden">Rec</span>
            </span>
            <span className="text-xs sm:text-sm font-black tabular-nums text-slate-900 dark:text-white">
              {formatTime(recordingTime)}
            </span>
            <span className="text-[10px] text-slate-400 font-semibold tabular-nums hidden xs:inline">
              / {formatTime(maxDuration)}
            </span>
          </div>
        </div>

        {/* Center: Countdown warning when approaching auto-stop limit or wave animation */}
        <div className="flex-1 max-w-[160px] hidden sm:flex items-center justify-center">
          {isNearLimit ? (
            <span className="text-[11px] font-bold text-amber-500 dark:text-amber-400 animate-pulse truncate">
              Auto-stopping in {remainingSeconds}s
            </span>
          ) : (
            <div className="flex items-center justify-center gap-1 h-6 w-full">
              {[40, 75, 100, 50, 90, 60, 85, 30, 95, 45].map((h, i) => (
                <div
                  key={i}
                  className="w-1 bg-rose-500 rounded-full animate-pulse"
                  style={{
                    height: `${h}%`,
                    animationDelay: `${i * 0.12}s`,
                    animationDuration: '0.8s'
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Mobile near-limit banner if screen is small */}
        {isNearLimit && (
          <span className="text-[10px] font-bold text-amber-500 sm:hidden animate-pulse">
            {remainingSeconds}s left
          </span>
        )}

        {/* Stop and Cancel Controls (touch-optimized for mobile thumbs) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Cancel / Trash button */}
          <button
            type="button"
            onClick={cancelRecording}
            className="p-2 sm:p-2.5 min-h-[40px] text-xs font-bold text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer flex items-center gap-1 active:scale-95 touch-manipulation"
            title="Cancel recording"
            aria-label="Cancel recording"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Cancel</span>
          </button>

          {/* Stop / Done button */}
          <button
            type="button"
            onClick={stopRecording}
            className="px-3 sm:px-4 py-2 min-h-[40px] rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/20 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 touch-manipulation"
            title="Stop recording and review"
            aria-label="Stop recording and review"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Stop</span>
          </button>
        </div>
      </div>
    );
  }

  // 3. Recorded Audio Preview Mode (Preview before sending)
  if (audioUrl) {
    return (
      <div className="w-full flex items-center justify-between gap-2 sm:gap-3 p-2 sm:p-2.5 px-2.5 sm:px-4 bg-sky-500/10 dark:bg-sky-950/30 border border-sky-500/30 rounded-2xl animate-in fade-in duration-200 touch-manipulation">
        <audio
          ref={previewAudioRef}
          src={audioUrl}
          onTimeUpdate={() => setPreviewTime(previewAudioRef.current?.currentTime || 0)}
          onEnded={() => {
            setIsPreviewPlaying(false);
            setPreviewTime(0);
          }}
        />

        {/* Play/Pause preview */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <button
            type="button"
            onClick={togglePreviewPlay}
            disabled={isUploading}
            className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-xl bg-sky-600 hover:bg-sky-500 text-white flex items-center justify-center shadow-md shadow-sky-600/20 transition-all cursor-pointer active:scale-95 touch-manipulation"
            title={isPreviewPlaying ? 'Pause preview' : 'Play preview'}
            aria-label={isPreviewPlaying ? 'Pause preview' : 'Play preview'}
          >
            {isPreviewPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>

          <div className="flex flex-col min-w-0">
            <span className="text-[11px] sm:text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1 truncate">
              <span className="truncate">Preview Note</span>
              <Volume2 className="w-3.5 h-3.5 text-sky-500 shrink-0" />
            </span>
            <span className="text-[10px] sm:text-[11px] font-bold tabular-nums text-slate-500 dark:text-slate-400">
              {formatTime(previewTime)} / {formatTime(audioDuration)}
            </span>
          </div>
        </div>

        {/* Action Controls: Discard or Send */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Discard button */}
          <button
            type="button"
            onClick={cancelRecording}
            disabled={isUploading}
            className="p-2 min-h-[40px] text-xs font-bold text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer flex items-center gap-1 disabled:opacity-50 active:scale-95 touch-manipulation"
            title="Discard audio"
            aria-label="Discard audio"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Discard</span>
          </button>

          {/* Send voice button */}
          <button
            type="button"
            onClick={handleSend}
            disabled={isUploading}
            className="px-3 sm:px-4 py-2 min-h-[40px] rounded-xl bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-500 hover:to-emerald-500 text-white text-xs font-bold shadow-md shadow-sky-600/25 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 disabled:opacity-60 touch-manipulation"
            aria-label="Send voice message"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Send Voice</span>
                <span className="xs:hidden">Send</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // 4. Default Idle Mode: Sleek Microphone trigger button with accessible mobile touch target
  const micButton = (
    <button
      type="button"
      onClick={startRecording}
      disabled={disabled}
      className="p-2 sm:p-2.5 min-w-[42px] min-h-[42px] flex items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 hover:bg-sky-50 dark:bg-slate-900 dark:hover:bg-sky-950/40 text-slate-600 hover:text-sky-600 dark:text-slate-300 dark:hover:text-sky-400 transition-all cursor-pointer active:scale-95 shrink-0 touch-manipulation"
      title="Record voice message"
      aria-label="Record voice message"
    >
      <Mic className="w-4 h-4" />
    </button>
  );

  if (typeof renderTextInput === 'function') {
    return renderTextInput(micButton);
  }

  return micButton;
}
