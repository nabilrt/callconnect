import React, { useEffect, useState } from 'react';

const PageTransition = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger the animation when the component mounts
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 10);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative">
      {/* Loading overlay */}
      <div 
        className={`absolute inset-0 bg-gray-50 transition-opacity duration-200 ease-out z-10 ${
          isVisible ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <div className="flex items-center justify-center h-16">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-indigo-600 border-t-transparent"></div>
        </div>
      </div>

      {/* Main content */}
      <div 
        className={`transform transition-all duration-400 ease-out ${
          isVisible 
            ? 'translate-y-0 opacity-100' 
            : 'translate-y-4 opacity-0'
        }`}
      >
        {children}
      </div>
    </div>
  );
};

export default PageTransition;