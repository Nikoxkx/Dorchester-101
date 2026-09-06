// DOR101 Electron Main Process
// This wraps the Next.js app in a native Windows window

const { app, BrowserWindow, Menu, Tray, shell, nativeImage } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow = null;
let tray = null;
let serverProcess = null;
const PORT = 3101;
const isDev = process.argv.includes('--dev');

// Single instance lock — prevent multiple copies
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
}

app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 900,
    minHeight: 600,
    title: 'DOR101 — Dorchester 101',
    icon: path.join(__dirname, '..', 'public', 'icon.svg'),
    backgroundColor: '#FAFAF8',
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });

  // Remove default menu
  Menu.setApplicationMenu(null);

  // Load the app
  const url = `http://localhost:${PORT}`;
  mainWindow.loadURL(url);

  // Show window when ready (prevents white flash)
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Open external links in default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function getAppRoot() {
  return app.isPackaged
    ? path.join(process.resourcesPath, 'app')
    : path.join(__dirname, '..');
}

function startServer() {
  return new Promise((resolve) => {
    if (isDev) {
      // In dev mode, assume next dev is already running
      resolve();
      return;
    }

    const appRoot = getAppRoot();
    const nextCli = path.join(appRoot, 'node_modules', 'next', 'dist', 'bin', 'next');

    // Electron binary runs as Node when ELECTRON_RUN_AS_NODE is set
    serverProcess = spawn(process.execPath, [nextCli, 'start', '-p', String(PORT)], {
      cwd: appRoot,
      env: { ...process.env, PORT: String(PORT), ELECTRON_RUN_AS_NODE: '1' },
      stdio: 'pipe',
      shell: false,
    });

    serverProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log('[Server]', output);
      if (output.includes('Ready') || output.includes('started') || output.includes(String(PORT))) {
        resolve();
      }
    });

    serverProcess.stderr.on('data', (data) => {
      console.error('[Server Error]', data.toString());
    });

    // Fallback: resolve after 5 seconds even if we don't see the "Ready" message
    setTimeout(resolve, 5000);
  });
}

function createTray() {
  // Simple tray with text menu
  tray = new Tray(nativeImage.createEmpty());
  tray.setToolTip('DOR101 — Dorchester 101');
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Open DOR101', click: () => { if (mainWindow) mainWindow.show(); } },
    { type: 'separator' },
    { label: 'About', click: () => { if (mainWindow) mainWindow.loadURL(`http://localhost:${PORT}/settings`); mainWindow.show(); } },
    { type: 'separator' },
    { label: 'Quit', click: () => { app.quit(); } },
  ]);
  tray.setContextMenu(contextMenu);
  tray.on('click', () => { if (mainWindow) mainWindow.show(); });
}

// App lifecycle
app.whenReady().then(async () => {
  await startServer();
  createWindow();
  createTray();
});

app.on('window-all-closed', () => {
  // On Windows, don't quit when window closes (stay in tray)
  // But for simplicity, we quit
  app.quit();
});

app.on('before-quit', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
