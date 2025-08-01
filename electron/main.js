const { app, BrowserWindow, Menu, shell, ipcMain, dialog, session } = require('electron');
const path = require('path');
const Store = require('electron-store');
const fetch = require('node-fetch');

// Initialize store for settings and data
const store = new Store();

let mainWindow;
let isDev = process.argv.includes('--dev');

// ASN Domain Translation
const ASN_DOMAINS_URL = 'https://asenturisk.github.io/asn/domains.json';
let cachedDomains = null;
let lastFetch = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function translateAsnDomain(url) {
  try {
    let domain = url;
    if (url.includes('/')) {
      domain = url.split('/')[0];
    }
    if (!domain.endsWith('.asn')) {
      domain += '.asn';
    }

    const domains = await fetchDomainMappings();
    
    if (domains && domains[domain]) {
      const targetUrl = domains[domain];
      
      if (url.includes('/') && url !== domain) {
        const path = url.substring(url.indexOf('/'));
        return targetUrl + (targetUrl.endsWith('/') ? path.substring(1) : path);
      }
      
      return targetUrl;
    }

    return null;
  } catch (error) {
    console.error('Error translating .asn domain:', error);
    return null;
  }
}

async function fetchDomainMappings() {
  const now = Date.now();
  
  if (cachedDomains && (now - lastFetch) < CACHE_DURATION) {
    return cachedDomains;
  }

  try {
    const response = await fetch(ASN_DOMAINS_URL);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const domains = await response.json();
    
    cachedDomains = domains;
    lastFetch = now;
    
    return domains;
  } catch (error) {
    console.error('Error fetching domain mappings:', error);
    
    if (cachedDomains) {
      return cachedDomains;
    }
    
    return {
      "trend.asn": "https://trend.muxday.com/",
      "asenturisk.asn": "https://asenturisk.web.app/",
      "hello.asn": "https://asenturisk.github.io/asn/",
      "mukto.asn": "https://muxday.com/mukto/"
    };
  }
}

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: true,
      allowRunningInsecureContent: false
    },
    icon: path.join(__dirname, 'assets', 'icon.png'),
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    show: false
  });

  // Load the app
  mainWindow.loadFile('index.html');

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Create menu
  createMenu();
}

function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Tab',
          accelerator: 'CmdOrCtrl+T',
          click: () => {
            // Handle new tab
            mainWindow.webContents.send('new-tab');
          }
        },
        {
          label: 'New Window',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            createWindow();
          }
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Navigate',
      submenu: [
        {
          label: 'Back',
          accelerator: 'Alt+Left',
          click: () => {
            mainWindow.webContents.send('navigate-back');
          }
        },
        {
          label: 'Forward',
          accelerator: 'Alt+Right',
          click: () => {
            mainWindow.webContents.send('navigate-forward');
          }
        },
        {
          label: 'Home',
          accelerator: 'Alt+Home',
          click: () => {
            mainWindow.webContents.send('navigate-home');
          }
        }
      ]
    },
    {
      label: 'Bookmarks',
      submenu: [
        {
          label: 'Add Bookmark',
          accelerator: 'CmdOrCtrl+D',
          click: () => {
            mainWindow.webContents.send('add-bookmark');
          }
        },
        {
          label: 'Show Bookmarks',
          accelerator: 'CmdOrCtrl+Shift+B',
          click: () => {
            mainWindow.webContents.send('show-bookmarks');
          }
        }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About Asentu',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About Asentu Browser',
              message: 'Asentu Browser',
              detail: 'The next-generation browser with .asn domain support\n\nVersion 1.0.0\nBuilt with Electron'
            });
          }
        }
      ]
    }
  ];

  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    });
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// IPC Handlers
ipcMain.handle('translate-asn-domain', async (event, url) => {
  return await translateAsnDomain(url);
});

ipcMain.handle('get-bookmarks', () => {
  return store.get('bookmarks', []);
});

ipcMain.handle('save-bookmarks', (event, bookmarks) => {
  store.set('bookmarks', bookmarks);
});

ipcMain.handle('get-history', () => {
  return store.get('history', []);
});

ipcMain.handle('save-history', (event, history) => {
  store.set('history', history);
});

ipcMain.handle('show-save-dialog', async (event, options) => {
  const result = await dialog.showSaveDialog(mainWindow, options);
  return result;
});

// App event handlers
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    shell.openExternal(navigationUrl);
  });
});

// Handle certificate errors
app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  // In production, you should properly validate certificates
  if (isDev) {
    event.preventDefault();
    callback(true);
  } else {
    callback(false);
  }
});