# Asentu Browser - Electron Version

This is the desktop version of Asentu Browser built with Electron.

## Features

- Full desktop browser experience
- .asn domain translation
- Bookmarks management
- History tracking
- Download management
- Cross-platform support (Windows, macOS, Linux)
- Native menu integration
- Keyboard shortcuts

## Development

### Prerequisites

- Node.js 16 or higher
- npm or yarn

### Setup

1. Navigate to the electron directory:
```bash
cd electron
```

2. Install dependencies:
```bash
npm install
```

3. Run in development mode:
```bash
npm run dev
```

### Building

Build for current platform:
```bash
npm run build
```

Build for specific platforms:
```bash
npm run build-win    # Windows
npm run build-mac    # macOS
npm run build-linux  # Linux
```

### Distribution

Create distributable packages:
```bash
npm run dist
```

## Project Structure

```
electron/
├── main.js          # Main Electron process
├── preload.js       # Preload script for security
├── renderer.js      # Renderer process (UI logic)
├── index.html       # Main window HTML
├── package.json     # Dependencies and build config
├── assets/          # Icons and resources
└── README.md        # This file
```

## Security

The Electron version implements several security best practices:

- Context isolation enabled
- Node integration disabled in renderer
- Secure preload script for IPC communication
- Certificate validation
- External link handling

## Keyboard Shortcuts

- `Ctrl/Cmd + T` - New Tab
- `Ctrl/Cmd + N` - New Window
- `Ctrl/Cmd + D` - Add Bookmark
- `Ctrl/Cmd + Shift + B` - Show Bookmarks
- `Alt + Left` - Back
- `Alt + Right` - Forward
- `Alt + Home` - Home
- `F5` - Reload
- `F11` - Toggle Fullscreen

## Platform-Specific Notes

### Windows
- Uses NSIS installer
- Supports auto-updater
- System tray integration available

### macOS
- Native menu bar integration
- App bundle with proper icons
- Supports macOS-specific features

### Linux
- AppImage format for universal compatibility
- Desktop file integration
- Follows Linux desktop standards