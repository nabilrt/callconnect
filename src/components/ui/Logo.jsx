import React from 'react';

const Logo = ({ size = 'md', className = '', showText = true, variant = 'default' }) => {
  const sizes = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8', 
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
    '2xl': 'w-20 h-20'
  };

  const textSizes = {
    xs: 'text-sm',
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl',
    '2xl': 'text-3xl'
  };

  const getColors = () => {
    switch (variant) {
      case 'white':
        return 'text-white';
      case 'dark':
        return 'text-gray-800';
      default:
        return 'text-indigo-600';
    }
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Logo Icon */}
      <div className={`${sizes[size]} flex-shrink-0 relative`}>
        <div className={`${sizes[size]} rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg`}>
          {/* Hub/Network Icon */}
          <svg 
            className="w-3/5 h-3/5 text-white" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            {/* Central hub */}
            <circle cx="12" cy="12" r="3" strokeWidth="2.5"/>
            {/* Connected nodes */}
            <circle cx="6" cy="6" r="2" strokeWidth="2"/>
            <circle cx="18" cy="6" r="2" strokeWidth="2"/>
            <circle cx="6" cy="18" r="2" strokeWidth="2"/>
            <circle cx="18" cy="18" r="2" strokeWidth="2"/>
            {/* Connection lines */}
            <path d="m8.5 8.5 2.8 2.8" strokeWidth="2"/>
            <path d="m15.5 8.5-2.8 2.8" strokeWidth="2"/>
            <path d="m8.5 15.5 2.8-2.8" strokeWidth="2"/>
            <path d="m15.5 15.5-2.8-2.8" strokeWidth="2"/>
          </svg>
        </div>
      </div>

      {/* Logo Text */}
      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold ${textSizes[size]} ${getColors()} leading-none`}>
            SocialHub
          </span>
          {(size === 'lg' || size === 'xl' || size === '2xl') && (
            <span className={`text-xs ${variant === 'white' ? 'text-white/70' : 'text-gray-500'} font-medium`}>
              Connect & Share
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default Logo;