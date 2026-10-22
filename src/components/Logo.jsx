import React from 'react';
import { Link } from 'react-router-dom';

export const Logo = ({ size = 'normal', showText = true, className = '' }) => {
  const isSmall = size === 'small';
  const isLarge = size === 'large';

  const iconDim = isSmall ? 'w-8 h-8' : isLarge ? 'w-12 h-12' : 'w-10 h-10';
  const textSize = isSmall ? 'text-lg' : isLarge ? 'text-2xl' : 'text-xl';

  return (
    <Link to="/" className={`inline-flex items-center gap-2.5 group select-none ${className}`}>
      {/* Official SkillSwap Vector Mark */}
      <div className={`relative ${iconDim} rounded-xl bg-gradient-to-br from-slate-900 via-navy-900 to-slate-950 p-1.5 shadow-md border border-slate-700/60 flex items-center justify-center overflow-hidden transition-transform duration-200 group-hover:scale-105`}>
        <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/20 to-transparent pointer-events-none"></div>
        <svg viewBox="0 0 40 40" className="w-full h-full" fill="none">
          {/* Top curve / swap arrow */}
          <path
            d="M10 16 C10 11, 16 8, 24 8 L30 8 M30 8 L26 4 M30 8 L26 12"
            stroke="#14B8A6"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Bottom curve / swap arrow */}
          <path
            d="M30 24 C30 29, 24 32, 16 32 L10 32 M10 32 L14 36 M10 32 L14 28"
            stroke="#2DD4BF"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Central Exchange Node / Glow */}
          <circle cx="20" cy="20" r="3" fill="#FFFFFF" />
          <circle cx="20" cy="20" r="4.5" stroke="#14B8A6" strokeWidth="1.2" strokeOpacity="0.8" />
          {/* Skill Star Accent */}
          <path d="M31 7 L33 9 L31 11 L29 9 Z" fill="#5EEAD4" />
        </svg>
      </div>

      {showText && (
        <div className="flex items-center tracking-tight">
          <span className={`font-extrabold ${textSize} text-slate-900 tracking-tight font-display`}>
            Skill
          </span>
          <span className={`font-extrabold ${textSize} text-teal-600 tracking-tight font-display`}>
            Swap
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-teal-500 ml-0.5 mt-2"></span>
        </div>
      )}
    </Link>
  );
};

export default Logo;

