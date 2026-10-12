import React from 'react';
import { X, ExternalLink, Key, CheckCircle, Shield, Copy, AlertTriangle } from 'lucide-react';

export default function GoogleSetupModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const copyToClipboard = (text) => {
    navigator.clipboard?.writeText(text);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white dark:bg-[#0E1526] rounded-2xl sm:rounded-3xl border border-[#EAEFEA] dark:border-slate-800 shadow-2xl p-5 sm:p-7 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#EAEFEA] dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-[#0E7057] dark:text-emerald-400 flex items-center justify-center">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#0F243B] dark:text-white font-display">
                Google OAuth Setup Guide
              </h3>
              <p className="text-xs text-[#708096] dark:text-slate-400">
                Connect your real Google account authentication in 4 quick steps
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps */}
        <div className="mt-5 space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          {/* Step 1 */}
          <div className="p-3.5 rounded-xl bg-[#F8FAF9] dark:bg-[#0A0F1D] border border-[#E5EFE8] dark:border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-[#0F243B] dark:text-white">
              <span className="w-5 h-5 rounded-full bg-[#0E7057] text-white flex items-center justify-center text-[10px]">
                1
              </span>
              <span>Open Google Cloud Console</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 pl-7">
              Go to{' '}
              <a
                href="https://console.cloud.google.com/apis/credentials"
                target="_blank"
                rel="noreferrer"
                className="font-bold text-[#0E7057] dark:text-emerald-400 underline inline-flex items-center gap-1"
              >
                console.cloud.google.com/apis/credentials <ExternalLink className="w-3 h-3" />
              </a>
              , select or create your project (e.g. <strong>SkillSwap PK</strong>), and configure your OAuth Consent Screen.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-3.5 rounded-xl bg-[#F8FAF9] dark:bg-[#0A0F1D] border border-[#E5EFE8] dark:border-slate-800 space-y-2">
            <div className="flex items-center gap-2 font-bold text-[#0F243B] dark:text-white">
              <span className="w-5 h-5 rounded-full bg-[#0E7057] text-white flex items-center justify-center text-[10px]">
                2
              </span>
              <span>Create OAuth 2.0 Web Client ID</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 pl-7">
              Click <strong>Create Credentials</strong> &rarr; <strong>OAuth client ID</strong> &rarr; Application type:{' '}
              <strong>Web application</strong>.
            </p>
            <div className="pl-7 space-y-1">
              <div className="text-[11px] font-semibold text-slate-500">Authorized JavaScript origins:</div>
              <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono">
                <span>http://localhost:5173</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard('http://localhost:5173')}
                  className="text-slate-400 hover:text-emerald-600"
                  title="Copy"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono">
                <span>https://skillsswap67.vercel.app</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard('https://skillsswap67.vercel.app')}
                  className="text-slate-400 hover:text-emerald-600"
                  title="Copy"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-3.5 rounded-xl bg-[#F8FAF9] dark:bg-[#0A0F1D] border border-[#E5EFE8] dark:border-slate-800 space-y-2">
            <div className="flex items-center gap-2 font-bold text-[#0F243B] dark:text-white">
              <span className="w-5 h-5 rounded-full bg-[#0E7057] text-white flex items-center justify-center text-[10px]">
                3
              </span>
              <span>Add Client ID to frontend/.env</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 pl-7">
              Paste your Client ID into your frontend environment file:
            </p>
            <div className="pl-7">
              <div className="px-3 py-2 rounded-lg bg-slate-900 text-emerald-400 font-mono text-xs select-all">
                VITE_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="p-3.5 rounded-xl bg-[#F8FAF9] dark:bg-[#0A0F1D] border border-[#E5EFE8] dark:border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-[#0F243B] dark:text-white">
              <span className="w-5 h-5 rounded-full bg-[#0E7057] text-white flex items-center justify-center text-[10px]">
                4
              </span>
              <span>Restart Vite Development Server</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 pl-7">
              Restart your Vite server with <code className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[11px]">npm run dev</code> to reload environment variables.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#0E7057] hover:bg-[#0c5c47] text-white text-xs font-bold transition-colors"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}
