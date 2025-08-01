import React, { useState, useEffect, useRef } from 'react';
import { Search, ArrowLeft, ArrowRight, RotateCcw, Home, Shield, Settings, Maximize, Menu, Star, Download, BookOpen, Clock } from 'lucide-react';
import BrowserFrame from './components/BrowserFrame';
import AddressBar from './components/AddressBar';
import ProgressBar from './components/ProgressBar';
import PWAInstaller from './components/PWAInstaller';
import BookmarkManager from './components/BookmarkManager';
import HistoryManager from './components/HistoryManager';
import DownloadManager from './components/DownloadManager';
import { translateAsnDomain } from './utils/domainTranslator';

function App() {
  const [currentUrl, setCurrentUrl] = useState('https://asenturisk.github.io/asn/');
  const [displayUrl, setDisplayUrl] = useState('hello.asn');
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<string[]>(['hello.asn']);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isSecure, setIsSecure] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showDownloads, setShowDownloads] = useState(false);
  const [bookmarks, setBookmarks] = useState<Array<{url: string, title: string, favicon?: string}>>([]);
  const [pageTitle, setPageTitle] = useState('');
  const [favicon, setFavicon] = useState('');

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const isValidUrl = (string: string) => {
    try {
      new URL(string.startsWith('http') ? string : `https://${string}`);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleNavigate = async (url: string) => {
    if (!url.trim()) return;
    
    setIsLoading(true);
    let finalUrl = '';
    let finalDisplayUrl = '';
    
    try {
      // Check if it's an .asn domain
      if (url.endsWith('.asn') || url.includes('.asn/')) {
        const translatedUrl = await translateAsnDomain(url);
        if (translatedUrl) {
          finalUrl = translatedUrl;
          finalDisplayUrl = url;
        } else {
          // If translation fails, show error page
          finalUrl = 'data:text/html,<html><body style="font-family: Inter, sans-serif; background: #0a0f1e; color: #fff; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0;"><div style="text-align: center;"><h1>Domain Not Found</h1><p>The .asn domain "' + url + '" could not be resolved.</p></div></body></html>';
          finalDisplayUrl = url;
        }
      } else if (isValidUrl(url) || url.includes('.')) {
        // Regular URL or domain
        finalUrl = url.startsWith('http') ? url : `https://${url}`;
        finalDisplayUrl = url;
      } else {
        // Search query - use Google
        finalUrl = `https://www.google.com/search?q=${encodeURIComponent(url)}`;
        finalDisplayUrl = `Search: ${url}`;
      }
      
      // Update state
      setCurrentUrl(finalUrl);
      setDisplayUrl(finalDisplayUrl);
      setIsSecure(finalUrl.startsWith('https://'));
      
      // Update history
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(finalDisplayUrl);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      
    } catch (error) {
      console.error('Navigation error:', error);
    }
    
    setIsLoading(false);
  };

  const handleGoBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const previousUrl = history[newIndex];
      handleNavigate(previousUrl);
    }
  };

  const handleGoForward = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const nextUrl = history[newIndex];
      handleNavigate(nextUrl);
    }
  };

  const handleReload = () => {
    setIsLoading(true);
    if (iframeRef.current) {
      const currentSrc = iframeRef.current.src;
      iframeRef.current.src = '';
      setTimeout(() => {
        if (iframeRef.current) {
          iframeRef.current.src = currentSrc;
        }
      }, 100);
    }
  };

  const handleHome = () => {
    handleNavigate('hello.asn');
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    // Initialize with home page
    handleNavigate('hello.asn');
  }, []);

  const addBookmark = () => {
    const bookmark = {
      url: displayUrl,
      title: pageTitle || displayUrl,
      favicon: favicon
    };
    setBookmarks(prev => [...prev, bookmark]);
  };

  const isBookmarked = bookmarks.some(b => b.url === displayUrl);

  if (isMobile) {
    return (
      <div className="h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
        {/* Mobile Header */}
        <div className="bg-black/20 backdrop-blur-lg border-b border-cyan-500/20 px-3 py-2">
          <div className="flex items-center gap-2">
            {/* Logo */}
            <h1 className="text-lg font-black text-white mr-2" 
                style={{ fontFamily: 'Orbitron, monospace' }}>
              Asentu
            </h1>

            {/* Address Bar */}
            <div className="flex-1">
              <AddressBar
                url={displayUrl}
                isSecure={isSecure}
                onNavigate={handleNavigate}
              />
            </div>

            {/* Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-200 text-white/70 hover:text-white"
            >
              <Menu size={18} />
            </button>
          </div>

          {/* Mobile Menu */}
          {showMobileMenu && (
            <div className="mt-2 p-2 bg-black/30 backdrop-blur-sm rounded-lg border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <button
                  onClick={handleGoBack}
                  disabled={historyIndex <= 0}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 text-white/70 hover:text-white"
                >
                  <ArrowLeft size={16} />
                </button>
                <button
                  onClick={handleGoForward}
                  disabled={historyIndex >= history.length - 1}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 text-white/70 hover:text-white"
                >
                  <ArrowRight size={16} />
                </button>
                <button
                  onClick={handleReload}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-200 text-white/70 hover:text-white"
                >
                  <RotateCcw size={16} />
                </button>
                <button
                  onClick={handleHome}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-200 text-white/70 hover:text-white"
                >
                  <Home size={16} />
                </button>
                <button
                  onClick={() => setShowBookmarks(!showBookmarks)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-200 text-white/70 hover:text-white"
                >
                  <BookOpen size={16} />
                </button>
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-200 text-white/70 hover:text-white"
                >
                  <Clock size={16} />
                </button>
                <button 
                  onClick={toggleFullscreen}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-200 text-white/70 hover:text-white"
                >
                  <Maximize size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Browser Content */}
        <div className="flex-1 relative">
          <BrowserFrame
            ref={iframeRef}
            url={currentUrl}
            isLoading={isLoading}
            onLoadStart={() => setIsLoading(true)}
            onLoadEnd={() => setIsLoading(false)}
            onTitleChange={setPageTitle}
            onFaviconChange={setFavicon}
            onTitleChange={setPageTitle}
            onFaviconChange={setFavicon}
          />
        </div>

        {/* Progress Bar */}
        <ProgressBar isLoading={isLoading} />

        {/* PWA Installer */}
        <PWAInstaller />
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-lg border-b border-cyan-500/20 px-4 py-1.5">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-xl font-black text-white" 
                style={{ fontFamily: 'Orbitron, monospace' }}>
              Asentu
            </h1>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleGoBack}
              disabled={historyIndex <= 0}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 text-white/70 hover:text-white"
            >
              <ArrowLeft size={16} />
            </button>
            <button
              onClick={handleGoForward}
              disabled={historyIndex >= history.length - 1}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 text-white/70 hover:text-white"
            >
              <ArrowRight size={16} />
            </button>
            <button
              onClick={handleReload}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-200 text-white/70 hover:text-white"
            >
              <RotateCcw size={16} />
            </button>
            <button
              onClick={handleHome}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-200 text-white/70 hover:text-white"
            >
              <Home size={16} />
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
            <button 
              onClick={addBookmark}
              disabled={isBookmarked}
              className={`p-1.5 rounded-lg transition-all duration-200 ${
                isBookmarked 
                  ? 'bg-yellow-500/20 text-yellow-400' 
                  : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white'
              }`}
            >
              <Star size={16} fill={isBookmarked ? 'currentColor' : 'none'} />
            </button>
            <button 
              onClick={() => setShowBookmarks(!showBookmarks)}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-200 text-white/70 hover:text-white"
            >
              <BookOpen size={16} />
            </button>
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-200 text-white/70 hover:text-white"
            >
              <Clock size={16} />
            </button>
            <button 
              onClick={() => setShowDownloads(!showDownloads)}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-200 text-white/70 hover:text-white"
            >
              <Download size={16} />
            </button>
            <button className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-200 text-white/70 hover:text-white">
              <Shield size={16} />
            </button>
            <button 
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-200 text-white/70 hover:text-white"
            >
              <Maximize size={16} />
            </button>
            <button className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-200 text-white/70 hover:text-white">
              <Settings size={16} />
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

      {/* PWA Installer */}
      <PWAInstaller />

      {/* Bookmark Manager */}
      {showBookmarks && (
        <BookmarkManager
          bookmarks={bookmarks}
          onClose={() => setShowBookmarks(false)}
          onNavigate={(url) => {
            handleNavigate(url);
            setShowBookmarks(false);
          }}
          onDelete={(index) => {
            setBookmarks(prev => prev.filter((_, i) => i !== index));
          }}
        />
      )}

      {/* History Manager */}
      {showHistory && (
        <HistoryManager
          history={history}
          onClose={() => setShowHistory(false)}
          onNavigate={(url) => {
            handleNavigate(url);
            setShowHistory(false);
          }}
        />
      )}

    </div>
  );
}

export default App;