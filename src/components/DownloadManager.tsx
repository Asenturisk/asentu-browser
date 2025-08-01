import React, { useState } from 'react';
import { X, Download, FileText, CheckCircle, AlertCircle } from 'lucide-react';

interface DownloadItem {
  id: string;
  filename: string;
  url: string;
  progress: number;
  status: 'downloading' | 'completed' | 'failed';
  size?: string;
}

interface DownloadManagerProps {
  onClose: () => void;
}

const DownloadManager: React.FC<DownloadManagerProps> = ({ onClose }) => {
  const [downloads] = useState<DownloadItem[]>([
    // Mock data for demonstration
    {
      id: '1',
      filename: 'example-document.pdf',
      url: 'https://example.com/document.pdf',
      progress: 100,
      status: 'completed',
      size: '2.4 MB'
    },
    {
      id: '2',
      filename: 'image-file.jpg',
      url: 'https://example.com/image.jpg',
      progress: 65,
      status: 'downloading',
      size: '1.8 MB'
    }
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} className="text-green-400" />;
      case 'failed':
        return <AlertCircle size={16} className="text-red-400" />;
      default:
        return <Download size={16} className="text-cyan-400" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800/90 backdrop-blur-lg border border-cyan-500/30 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Download size={20} className="text-cyan-400" />
            <h2 className="text-white font-semibold">Downloads</h2>
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
          {downloads.length === 0 ? (
            <div className="text-center py-8 text-white/60">
              <Download size={48} className="mx-auto mb-4 opacity-30" />
              <p>No downloads yet</p>
              <p className="text-sm mt-2">Downloaded files will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {downloads.map((download) => (
                <div
                  key={download.id}
                  className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <FileText size={20} className="text-white/70" />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium truncate">{download.filename}</h3>
                      <p className="text-white/60 text-sm truncate">{download.url}</p>
                    </div>
                    {getStatusIcon(download.status)}
                  </div>
                  
                  {download.status === 'downloading' && (
                    <div className="mt-2">
                      <div className="flex justify-between text-sm text-white/60 mb-1">
                        <span>{download.progress}%</span>
                        <span>{download.size}</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-cyan-400 to-purple-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${download.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  {download.status === 'completed' && download.size && (
                    <div className="mt-1 text-sm text-white/60">
                      {download.size} • Completed
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DownloadManager;