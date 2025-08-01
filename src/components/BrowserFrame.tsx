import React, { forwardRef, useState } from 'react';
import { Globe, AlertCircle } from 'lucide-react';

interface BrowserFrameProps {
  url: string;
  isLoading: boolean;
  onLoadStart: () => void;
  onLoadEnd: () => void;
}

const BrowserFrame = forwardRef<HTMLIFrameElement, BrowserFrameProps>(
  ({ url, isLoading, onLoadStart, onLoadEnd }, ref) => {
    const [hasError, setHasError] = useState(false);

    const handleLoad = () => {
      onLoadEnd();
      setHasError(false);
    };

    const handleError = () => {
      onLoadEnd();
      setHasError(true);
    };

    if (hasError) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800/50 to-purple-900/30">
          <div className="text-center space-y-4">
            <AlertCircle size={64} className="text-red-400 mx-auto" />
            <h2 className="text-2xl font-bold text-white">Unable to load page</h2>
            <p className="text-white/60">Check your connection and try again</p>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full h-full relative overflow-hidden rounded-lg">
        {isLoading && (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800/80 to-purple-900/60 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mx-auto"></div>
              <p className="text-white/70 font-medium">Loading...</p>
            </div>
          </div>
        )}
        
        <iframe
          ref={ref}
          src={url}
          className="w-full h-full border-0"
          onLoad={handleLoad}
          onError={handleError}
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation"
          title="Browser Content"
        />
      </div>
    );
  }
);

BrowserFrame.displayName = 'BrowserFrame';

export default BrowserFrame;