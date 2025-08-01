import React from 'react';

interface ProgressBarProps {
  isLoading: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ isLoading }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 h-1 bg-black/20">
      <div 
        className={`h-full bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 transition-all duration-300 ${
          isLoading ? 'w-full animate-pulse' : 'w-0'
        }`}
        style={{
          background: isLoading 
            ? 'linear-gradient(90deg, #00f5ff 0%, #8b5cf6 50%, #ec4899 100%)'
            : 'transparent'
        }}
      />
      
      {/* Animated shimmer effect */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" 
             style={{
               background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
               animation: 'shimmer 2s ease-in-out infinite'
             }}
        />
      )}
    </div>
  );
};

export default ProgressBar;