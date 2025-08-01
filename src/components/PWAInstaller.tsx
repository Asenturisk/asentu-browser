import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const PWAInstaller: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show prompt after a short delay to ensure page is loaded
      setTimeout(() => {
        setShowInstallPrompt(true);
      }, 2000);
    };

    const handleAppInstalled = () => {
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) {
      setShowInstallPrompt(false);
      return;
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Fallback for browsers that don't fire beforeinstallprompt
    const timer = setTimeout(() => {
      if (!deferredPrompt && !isStandalone) {
        // Show a manual install prompt for iOS Safari and other browsers
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
        
        if (isIOS && isSafari) {
          setShowInstallPrompt(true);
        }
      }
    }, 3000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      clearTimeout(timer);
    };
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowInstallPrompt(false);
      }
    } else {
      // For iOS Safari and other browsers, show instructions
      alert('To install Asentu:\n\n1. Tap the Share button\n2. Scroll down and tap "Add to Home Screen"\n3. Tap "Add" to confirm');
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
  };

  if (!showInstallPrompt) return null;

  return (
    <div className="fixed top-16 right-4 z-50 bg-black/90 backdrop-blur-lg border border-cyan-500/30 rounded-xl p-4 max-w-sm animate-slide-in shadow-2xl">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <Download size={16} className="text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-white font-semibold text-sm mb-1">Install Asentu</h3>
          <p className="text-white/70 text-xs mb-3">
            {deferredPrompt 
              ? "Install Asentu as an app for quick access and a better experience."
              : "Add Asentu to your home screen for quick access."
            }
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleInstallClick}
              className="px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-purple-500 text-white text-xs font-medium rounded-lg hover:from-cyan-600 hover:to-purple-600 transition-all duration-200"
            >
              {deferredPrompt ? "Install" : "Show Instructions"}
            </button>
            <button
              onClick={handleDismiss}
              className="px-3 py-1.5 bg-white/10 text-white/70 text-xs font-medium rounded-lg hover:bg-white/20 transition-all duration-200"
            >
              Later
            </button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-white/50 hover:text-white/80 transition-colors duration-200"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default PWAInstaller;