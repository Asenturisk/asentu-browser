const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // ASN Domain translation
  translateAsnDomain: (url) => ipcRenderer.invoke('translate-asn-domain', url),
  
  // Bookmarks
  getBookmarks: () => ipcRenderer.invoke('get-bookmarks'),
  saveBookmarks: (bookmarks) => ipcRenderer.invoke('save-bookmarks', bookmarks),
  
  // History
  getHistory: () => ipcRenderer.invoke('get-history'),
  saveHistory: (history) => ipcRenderer.invoke('save-history', history),
  
  // File operations
  showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
  
  // Navigation events
  onNavigateBack: (callback) => ipcRenderer.on('navigate-back', callback),
  onNavigateForward: (callback) => ipcRenderer.on('navigate-forward', callback),
  onNavigateHome: (callback) => ipcRenderer.on('navigate-home', callback),
  onNewTab: (callback) => ipcRenderer.on('new-tab', callback),
  onAddBookmark: (callback) => ipcRenderer.on('add-bookmark', callback),
  onShowBookmarks: (callback) => ipcRenderer.on('show-bookmarks', callback),
  
  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
  
  // Platform info
  platform: process.platform,
  isElectron: true
});