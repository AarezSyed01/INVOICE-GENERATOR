import React from 'react';
import { CompanySettings } from '../../types';

interface LogoProps {
  settings?: CompanySettings;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ settings, size = 'md', showText = true }) => {
  const customLogo = settings?.logoUrl;

  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-14 w-14 text-base',
    xl: 'h-20 w-20 text-xl',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
    xl: 'text-2xl',
  };

  if (customLogo) {
    return (
      <div className="flex items-center gap-3">
        <img
          src={customLogo}
          alt={settings?.companyName || 'AR Web Solutions'}
          className={`${sizeClasses[size]} object-contain rounded-lg border border-red-100 dark:border-red-900/30`}
        />
        {showText && (
          <div>
            <div className={`font-extrabold tracking-tight text-gray-900 dark:text-white ${textSizes[size]}`}>
              {settings?.companyName || 'AR Web Solutions'}
            </div>
            {settings?.tagline && (
              <p className="text-[10px] sm:text-xs font-medium text-red-600 dark:text-red-400">
                {settings.tagline}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {/* Brand Icon SVG Badge in Red, White, Black */}
      <div
        className={`${sizeClasses[size]} bg-gradient-to-br from-red-600 via-red-700 to-black rounded-xl text-white font-black flex items-center justify-center shadow-md shadow-red-500/20 border border-red-500/30 shrink-0 relative overflow-hidden group`}
      >
        <span className="relative z-10 tracking-tighter">AR</span>
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {showText && (
        <div className="leading-tight">
          <div className={`font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center gap-1.5 ${textSizes[size]}`}>
            <span>AR Web Solutions</span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50">
              PRO
            </span>
          </div>
          <p className="text-[11px] font-semibold tracking-wide text-red-600 dark:text-red-400">
            {settings?.tagline || 'We Design • We Develop • We Grow'}
          </p>
        </div>
      )}
    </div>
  );
};
