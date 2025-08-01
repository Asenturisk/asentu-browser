import React, { useState, KeyboardEvent } from 'react';
import { useEffect } from 'react';
import { Search, Lock, AlertTriangle, Globe } from 'lucide-react';

interface AddressBarProps {
  url: string;
  isSecure: boolean;
  onNavigate: (url: string) => void;
}

const AddressBar: React.FC<AddressBarProps> = ({ url, isSecure, onNavigate }) => {
  const [inputValue, setInputValue] = useState(url);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setInputValue(url);
    }
  }, [url, isFocused]);

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onNavigate(inputValue);
      (e.target as HTMLInputElement).blur();
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const getSecurityIcon = () => {
    if (url.endsWith('.asn') || url.includes('.asn/')) {
      return <Globe size={16} className="text-cyan-400" />;
    }
    return isSecure ? 
      <Lock size={16} className="text-green-400" /> : 
      <AlertTriangle size={16} className="text-yellow-400" />;
  };

  return (
    <div className={`relative flex items-center bg-black/30 backdrop-blur-sm rounded-xl border transition-all duration-300 ${
      isFocused 
        ? 'border-cyan-400/50 shadow-lg shadow-cyan-400/20' 
        : 'border-white/10 hover:border-white/20'
    }`}>
      {/* Security Icon */}
      <div className="pl-4 pr-2">
        {getSecurityIcon()}
      </div>

      {/* URL Input */}
      <input
        type="text"
        value={isFocused ? inputValue : url}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyPress={handleKeyPress}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder="Search or enter address"
        className="flex-1 bg-transparent text-white placeholder-white/50 px-2 py-2 focus:outline-none text-sm font-medium"
      />

      {/* Search Icon */}
      <div className="pr-4 pl-2">
        <Search size={16} className="text-white/40" />
      </div>

      {/* Glow Effect */}
      {isFocused && (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400/20 to-purple-500/20 blur-sm -z-10"></div>
      )}
    </div>
  );
};

export default AddressBar;