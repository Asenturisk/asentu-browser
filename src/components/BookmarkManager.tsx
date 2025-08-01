import React from 'react';
import { X, Star, ExternalLink, Trash2 } from 'lucide-react';

interface Bookmark {
  url: string;
  title: string;
  favicon?: string;
}

interface BookmarkManagerProps {
  bookmarks: Bookmark[];
  onClose: () => void;
  onNavigate: (url: string) => void;
  onDelete: (index: number) => void;
}

const BookmarkManager: React.FC<BookmarkManagerProps> = ({
  bookmarks,
  onClose,
  onNavigate,
  onDelete
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800/90 backdrop-blur-lg border border-cyan-500/30 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Star size={20} className="text-yellow-400" />
            <h2 className="text-white font-semibold">Bookmarks</h2>
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
          {bookmarks.length === 0 ? (
            <div className="text-center py-8 text-white/60">
              <Star size={48} className="mx-auto mb-4 opacity-30" />
              <p>No bookmarks yet</p>
              <p className="text-sm mt-2">Click the star icon to bookmark pages</p>
            </div>
          ) : (
            <div className="space-y-2">
              {bookmarks.map((bookmark, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group"
                >
                  {bookmark.favicon ? (
                    <img
                      src={bookmark.favicon}
                      alt=""
                      className="w-4 h-4 rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-4 h-4 bg-gradient-to-r from-cyan-400 to-purple-500 rounded"></div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium truncate">{bookmark.title}</h3>
                    <p className="text-white/60 text-sm truncate">{bookmark.url}</p>
                  </div>
                  
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onNavigate(bookmark.url)}
                      className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white"
                    >
                      <ExternalLink size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(index)}
                      className="p-1.5 rounded-lg hover:bg-red-500/20 transition-colors text-white/70 hover:text-red-400"
                    >
                      <Trash2 size={16} />
                    </button>
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

export default BookmarkManager;