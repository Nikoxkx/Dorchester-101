const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');

let mainWindow = null;
let serverProcess = null;
const PORT = Number(process.env.DOR101_PORT || 3101);
const isDev = process.argv.includes('--dev');

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

function waitForServer(timeoutMs = 20000) {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const ping = () => {
      const req = http.get({ hostname: '127.0.0.1', port: PORT, path: '/api/health', timeout: 1500 }, (res) => {
        res.resume();
        if (res.statusCode && res.statusCode < 500) resolve();
        else retry();
      });
      req.on('error', retry);
      req.on('timeout', () => {
        req.destroy();
        retry();
      });
    };
    const retry = () => {
      if (Date.now() - started > timeoutMs) {
        reject(new Error('Next server did not start'));
        return;
      }
      setTimeout(ping, 400);
    };
    ping();
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 880,
    minHeight: 560,
    title: 'DOR101 — Dorchester, Boston',
    backgroundColor: '#f4f6f8',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });

  Menu.setApplicationMenu(
    Menu.buildFromTemplate([
      {
        label: 'File',
        submenu: [
          { role: 'reload' },
          { type: 'separator' },
          { role: 'quit' },
        ],
      },
      {
        label: 'View',
        submenu: [
          { role: 'togglefullscreen' },
          { role: 'resetZoom' },
          { role: 'zoomIn' },
          { role: 'zoomOut' },
          { type: 'separator' },
          { label: 'Developer Tools', click: () => mainWindow && mainWindow.webContents.openDevTools() },
        ],
      },
      {
        label: 'Directory',
        submenu: [
          { label: 'Refresh All', click: () => mainWindow && mainWindow.webContents.send('refresh-all') },
          { label: 'Generate Report', click: () => mainWindow && mainWindow.webContents.send('generate-report') },
          { type: 'separator' },
          { label: 'Home', click: () => mainWindow && mainWindow.loadURL(`http://127.0.0.1:${PORT}/`) },
        ],
      },
      {
        label: 'Help',
        submenu: [
          { label: 'Source', click: () => shell.openExternal('https://github.com/Nikoxkx/Dorchester-101') },
          { label: 'Report an issue', click: () => shell.openExternal('https://github.com/Nikoxkx/Dorchester-101/issues') },
        ],
      },
    ]),
  );

  const url = `http://127.0.0.1:${PORT}`;
  mainWindow.loadURL(url);
  mainWindow.once('ready-to-show', () => mainWindow.show());

  mainWindow.webContents.setWindowOpenHandler(({ url: next }) => {
    if (next.startsWith('http://127.0.0.1') || next.startsWith(`http://localhost:${PORT}`)) {
      return { action: 'allow' };
    }
    shell.openExternal(next);
    return { action: 'deny' };
  });

  mainWindow.webContents.on('will-navigate', (event, next) => {
    const local = next.startsWith(url);
    if (!local) {
      event.preventDefault();
      shell.openExternal(next);
    }
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
  return new Promise((resolve, reject) => {
    if (isDev) {
      resolve();
      return;
    }

    const appRoot = getAppRoot();
    const nextCli = path.join(appRoot, 'node_modules', 'next', 'dist', 'bin', 'next');

    serverProcess = spawn(process.execPath, [nextCli, 'start', '-p', String(PORT)], {
      cwd: appRoot,
      env: { ...process.env, PORT: String(PORT), ELECTRON_RUN_AS_NODE: '1' },
      stdio: 'pipe',
      shell: false,
    });

    serverProcess.stdout.on('data', (data) => {
      process.stdout.write(`[next] ${data}`);
    });
    serverProcess.stderr.on('data', (data) => {
      process.stderr.write(`[next] ${data}`);
    });
    serverProcess.on('exit', (code) => {
      if (!app.isQuitting && code) reject(new Error(`next start exited ${code}`));
    });

    waitForServer().then(resolve).catch(resolve);
  });
}

ipcMain.handle('check-for-updates', async () => ({ available: false }));
ipcMain.handle('generate-report', async () => {
  const reportData = {
    generatedAt: new Date().toISOString(),
    sources: ['HUD FY2026 (AMI + FMR)', 'MBTA', 'BPDA', 'BHA', 'Mass.gov / EOHLC (RAFT)', 'USDA SNAP (DTA)'],
    status: 'complete',
  };
  return reportData;
});
ipcMain.handle('restart-app', () => {
  app.relaunch();
  app.exit(0);
});

app.whenReady().then(async () => {
  await startServer();
  if (isDev) {
    try {
      await waitForServer(8000);
    } catch {
      /* next dev may still be compiling */
    }
  }
  createWindow();
});

app.on('window-all-closed', () => {
  app.quit();
});

app.on('before-quit', () => {
  app.isQuitting = true;
  if (serverProcess) serverProcess.kill();
});

app.on('activate', () => {
  if (mainWindow === null) createWindow();
});
