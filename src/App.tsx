import React, { useState, useEffect, useRef } from 'react';
import { Search, ArrowLeft, ArrowRight, RotateCcw, Home, Shield, Settings } from 'lucide-react';
import BrowserFrame from './components/BrowserFrame';
import AddressBar from './components/AddressBar';
import ProgressBar from './components/ProgressBar';
import { translateAsnDomain } from './utils/domainTranslator';

function App() {
  const [currentUrl, setCurrentUrl] = useState('https://asenturisk.github.io/asn/');
  const [displayUrl, setDisplayUrl] = useState('asenturisk.asn');
  const [isLoading, setIsLoading] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [isSecure, setIsSecure] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleNavigate = async (url: string) => {
    setIsLoading(true);
    
    try {
      // Check if it's an .asn domain
      if (url.endsWith('.asn') || url.includes('.asn/')) {
        const translatedUrl = await translateAsnDomain(url);
        if (translatedUrl) {
          setCurrentUrl(translatedUrl);
          setDisplayUrl(url);
          setIsSecure(translatedUrl.startsWith('https://'));
        } else {
          // If translation fails, show error page
          setCurrentUrl('data:text/html,<html><body style="font-family: Inter, sans-serif; background: #0a0f1e; color: #fff; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0;"><div style="text-align: center;"><h1>Domain Not Found</h1><p>The .asn domain "' + url + '" could not be resolved.</p></div></body></html>');
          setDisplayUrl(url);
          setIsSecure(false);
        }
      } else {
        // Regular URL
        const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
        setCurrentUrl(formattedUrl);
        setDisplayUrl(url);
        setIsSecure(formattedUrl.startsWith('https://'));
      }
    } catch (error) {
      console.error('Navigation error:', error);
    }
    
    // Simulate loading time
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const handleGoBack = () => {
    if (iframeRef.current) {
      iframeRef.current.contentWindow?.history.back();
    }
  };

  const handleGoForward = () => {
    if (iframeRef.current) {
      iframeRef.current.contentWindow?.history.forward();
    }
  };

  const handleReload = () => {
    setIsLoading(true);
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  };

  const handleHome = () => {
    handleNavigate('asenturisk.asn');
  };

  useEffect(() => {
    // Initialize with home page
    handleNavigate('asenturisk.asn');
  }, []);

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-lg border-b border-cyan-500/20 px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-sm opacity-90"></div>
            </div>
            <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500" 
                style={{ fontFamily: 'Orbitron, monospace' }}>
              ASENTU
            </h1>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleGoBack}
              disabled={!canGoBack}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 text-white/70 hover:text-white"
            >
              <ArrowLeft size={18} />
            </button>
            <button
              onClick={handleGoForward}
              disabled={!canGoForward}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 text-white/70 hover:text-white"
            >
              <ArrowRight size={18} />
            </button>
            <button
              onClick={handleReload}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-200 text-white/70 hover:text-white"
            >
              <RotateCcw size={18} />
            </button>
            <button
              onClick={handleHome}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-200 text-white/70 hover:text-white"
            >
              <Home size={18} />
            </button>
          </div>

          {/* Address Bar */}
          <div className="flex-1">
            <AddressBar
              url={displayUrl}
              isSecure={isSecure}
              onNavigate={handleNavigate}
            />
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-200 text-white/70 hover:text-white">
              <Shield size={18} />
            </button>
            <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-200 text-white/70 hover:text-white">
              <Settings size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Browser Content */}
      <div className="flex-1 relative">
        <BrowserFrame
          ref={iframeRef}
          url={currentUrl}
          isLoading={isLoading}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
        />
      </div>

      {/* Progress Bar */}
      <ProgressBar isLoading={isLoading} />
    </div>
  );
}

export default App;