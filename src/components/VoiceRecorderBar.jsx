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
 * Browser native MediaRecorder API voice recording component.
 * Features:
 * - Proper microphone permission requesting & error handling
 * - Start / Stop recording with live timer
 * - Animated audio wave visualizer
 * - Cancel / Discard recording
 * - Audio preview before sending (Play / Pause / Progress)
 * - Safe Blob to Base64 conversion for Cloudinary upload
 */
export default function VoiceRecorderBar({
  onSendVoice,
  disabled = false,
  renderTextInput
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

  const mediaRecorderRef = useRef(null);
  const audioStreamRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const audioChunksRef = useRef([]);
  const previewAudioRef = useRef(null);
  const startTimeRef = useRef(0);
  const recordingTimeRef = useRef(0);

  // Format seconds into MM:SS
  const formatTime = (secs) => {
    if (!secs || isNaN(secs) || secs < 0 || !Number.isFinite(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupRecording();
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const cleanupRecording = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
      audioStreamRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        // ignore already inactive
      }
    }
  };

  // Start recording
  const startRecording = async () => {
    setPermissionError('');
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setAudioBlob(null);
    setAudioDuration(0);
    setRecordingTime(0);
    recordingTimeRef.current = 0;

    // Check secure context requirement for microphone access
    if (
      typeof window !== 'undefined' &&
      !window.isSecureContext &&
      window.location.hostname !== 'localhost' &&
      window.location.hostname !== '127.0.0.1'
    ) {
      setPermissionError('Microphone access requires a secure HTTPS connection in this browser.');
      return;
    }

    // Validate browser support for MediaRecorder
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || typeof MediaRecorder === 'undefined') {
      setPermissionError('Voice recording is not supported by your current browser.');
      return;
    }

    try {
      // 1. Request microphone permission with high-quality constraints
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      audioStreamRef.current = stream;

      // 2. Select supported MIME type safely without hardcoded crash
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
        selectedMime = candidateTypes.find((t) => MediaRecorder.isTypeSupported(t)) || '';
      }

      const recorderOptions = selectedMime ? { mimeType: selectedMime } : {};
      const recorder = new MediaRecorder(stream, recorderOptions);
      const recordedMime = recorder.mimeType || selectedMime || 'audio/webm';

      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const finalBlob = new Blob(audioChunksRef.current, { type: recordedMime });
        const finalUrl = URL.createObjectURL(finalBlob);
        const finalDuration = recordingTimeRef.current > 0
          ? recordingTimeRef.current
          : Math.max(1, Math.round((Date.now() - (startTimeRef.current || Date.now())) / 1000));

        setAudioBlob(finalBlob);
        setAudioUrl(finalUrl);
        setAudioDuration(finalDuration);
        setIsRecording(false);
      };

      startTimeRef.current = Date.now();
      recorder.start(250); // collect chunks every 250ms
      setIsRecording(true);

      // Start timer tracking exact seconds with ref
      timerIntervalRef.current = setInterval(() => {
        const elapsed = Math.max(1, Math.floor((Date.now() - startTimeRef.current) / 1000));
        recordingTimeRef.current = elapsed;
        setRecordingTime(elapsed);
      }, 500);

    } catch (err) {
      console.error('Microphone access error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionError('Microphone permission was denied. Please allow microphone access in your browser settings to record voice messages.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setPermissionError('No microphone detected on your device. Please plug in a microphone.');
      } else {
        setPermissionError(err.message || 'Unable to access microphone.');
      }
      setIsRecording(false);
      cleanupRecording();
    }
  };

  // Stop recording and show preview
  const stopRecording = () => {
    if (!isRecording) return;
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
      audioStreamRef.current = null;
    }
  };

  // Cancel / Discard recording
  const cancelRecording = () => {
    cleanupRecording();
    setIsRecording(false);
    setRecordingTime(0);
    recordingTimeRef.current = 0;
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
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
      // Pass raw audioBlob directly to avoid 33% Base64 expansion and main-thread blocking
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

  // 2. Active recording mode
  if (isRecording) {
    return (
      <div className="w-full flex items-center justify-between gap-2 sm:gap-3 p-2 sm:p-2.5 px-3 sm:px-4 bg-rose-500/10 dark:bg-rose-950/30 border border-rose-500/30 rounded-2xl animate-in fade-in duration-200">
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
          </div>
        </div>

        {/* Animated Sound Wave Bars */}
        <div className="flex-1 max-w-[140px] hidden sm:flex items-center justify-center gap-1 h-6">
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

        {/* Stop and Cancel Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Cancel button */}
          <button
            type="button"
            onClick={cancelRecording}
            className="p-1.5 sm:p-2 text-xs font-bold text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer flex items-center gap-1"
            title="Cancel recording"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Cancel</span>
          </button>

          {/* Stop / Preview button */}
          <button
            type="button"
            onClick={stopRecording}
            className="px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/20 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
            title="Stop and preview"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Done</span>
          </button>
        </div>
      </div>
    );
  }

  // 3. Recorded Audio Preview Mode (Preview before sending)
  if (audioUrl) {
    return (
      <div className="w-full flex items-center justify-between gap-2 sm:gap-3 p-2 sm:p-2.5 px-2.5 sm:px-4 bg-sky-500/10 dark:bg-sky-950/30 border border-sky-500/30 rounded-2xl animate-in fade-in duration-200">
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
            className="w-8 h-8 sm:w-9 sm:h-9 shrink-0 rounded-xl bg-sky-600 hover:bg-sky-500 text-white flex items-center justify-center shadow-md shadow-sky-600/20 transition-all cursor-pointer active:scale-95"
            title={isPreviewPlaying ? 'Pause preview' : 'Play preview'}
          >
            {isPreviewPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>

          <div className="flex flex-col min-w-0">
            <span className="text-[11px] sm:text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1 truncate">
              <span className="truncate">Preview</span>
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
            className="p-1.5 sm:p-2 text-xs font-bold text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer flex items-center gap-1 disabled:opacity-50"
            title="Discard audio"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Discard</span>
          </button>

          {/* Send voice button */}
          <button
            type="button"
            onClick={handleSend}
            disabled={isUploading}
            className="px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-500 hover:to-emerald-500 text-white text-xs font-bold shadow-md shadow-sky-600/25 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 disabled:opacity-60"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Uploading...</span>
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

  // 4. Default Idle Mode: Sleek Microphone trigger button
  const micButton = (
    <button
      type="button"
      onClick={startRecording}
      disabled={disabled}
      className="p-2.5 min-w-[42px] min-h-[42px] flex items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 hover:bg-sky-50 dark:bg-slate-900 dark:hover:bg-sky-950/40 text-slate-600 hover:text-sky-600 dark:text-slate-300 dark:hover:text-sky-400 transition-all cursor-pointer active:scale-95 shrink-0"
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
