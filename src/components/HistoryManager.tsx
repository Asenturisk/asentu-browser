import React from 'react';
import { X, Clock, ExternalLink } from 'lucide-react';

interface HistoryManagerProps {
  history: string[];
  onClose: () => void;
  onNavigate: (url: string) => void;
}

const HistoryManager: React.FC<HistoryManagerProps> = ({
  history,
  onClose,
  onNavigate
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800/90 backdrop-blur-lg border border-cyan-500/30 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Clock size={20} className="text-cyan-400" />
            <h2 className="text-white font-semibold">History</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 max-h-96 overflow-y-auto">
          {history.length === 0 ? (
            <div className="text-center py-8 text-white/60">
              <Clock size={48} className="mx-auto mb-4 opacity-30" />
              <p>No history yet</p>
              <p className="text-sm mt-2">Start browsing to see your history</p>
            </div>
          ) : (
            <div className="space-y-2">
              {history.slice().reverse().map((url, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group cursor-pointer"
                  onClick={() => onNavigate(url)}
                >
                  <div className="w-4 h-4 bg-gradient-to-r from-cyan-400 to-purple-500 rounded"></div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-white truncate">{url}</p>
                  </div>
                  
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink size={16} className="text-white/70" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryManager;