import React from 'react';

/**
 * SkillExchangeLogo - Official Logo Component
 * Uses the user-provided Skill Swap "S" circular exchange arrow emblem.
 * Fully optimized for responsive sizing and both light & dark themes.
 */
export default function SkillExchangeLogo({
  className = 'w-9 h-9',
  showBadge = false,
  showFull = false,
  alt = 'Skill Swap Logo'
}) {
  if (showFull) {
    return (
      <div className="flex items-center">
        {/* Light theme logo */}
        <img
          src="/skillswap-transparent.png"
          alt={alt}
          className={`${className} object-contain dark:hidden`}
        />
        {/* Dark theme logo with crisp text */}
        <img
          src="/skillswap-logo-dark.png"
          alt={alt}
          className={`${className} object-contain hidden dark:block`}
        />
      </div>
    );
  }

  // Icon-only emblem (the S circular exchange arrows)
  const icon = (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      {/* Light theme icon */}
      <img
        src="/skillswap-icon.png"
        alt={alt}
        className="w-full h-full object-contain dark:hidden"
      />
      {/* Dark theme icon with boosted brightness */}
      <img
        src="/skillswap-icon.png"
        alt={alt}
        className="w-full h-full object-contain hidden dark:block filter invert brightness-125"
      />
    </div>
  );

  if (!showBadge) return icon;

  return (
    <div className="relative inline-flex items-center justify-center p-2 rounded-2xl bg-white dark:bg-[#0D1527] border border-slate-200/80 dark:border-slate-800 shadow-md">
      {icon}
    </div>
  );
}
