import React from 'react';

/**
 * PageLoader: High-performance, themed fallback component for React Suspense route transitions.
 * Features a dual-ring animated spinner and ambient glowing badge in harmony with SkillSwap Pakistan aesthetics.
 */
export default function PageLoader() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="min-h-[55vh] flex flex-col items-center justify-center p-6 text-center select-none"
    >
      <div className="relative mb-4 flex items-center justify-center">
        {/* Soft pulse glow behind spinner */}
        <div className="absolute w-12 h-12 rounded-full bg-[#07866D]/15 dark:bg-[#07866D]/25 blur-md animate-pulse" />
        {/* Dual-ring spinner */}
        <div className="w-10 h-10 rounded-full border-[3px] border-[#07866D]/20 dark:border-emerald-500/20 border-t-[#07866D] dark:border-t-emerald-400 animate-spin" />
      </div>
      <p className="text-xs font-bold text-[#708096] dark:text-slate-400 tracking-wider uppercase">
        Loading...
      </p>
    </div>
  );
}
