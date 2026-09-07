// DOR101 Electron Main Process
//
// This wraps the Next.js app in a native Windows window. The packaged app ships
// the production build (`next build` output in resources/app) and runs a real
// Next.js server in-process — the site has server-rendered API routes
// (/api/news, /api/mbta, /api/market-data, ...), so there is no static export to
// load from file://.

const { app, BrowserWindow, Menu, Tray, shell, nativeImage, dialog } = require('electron');
const path = require('path');
const http = require('http');
const net = require('net');
const { spawn } = require('child_process');

const HOST = '127.0.0.1';
const DEV_PORT = 3000;
/** Long enough for a cold `next start` on a slow disk; short enough to not look hung. */
const SERVER_READY_TIMEOUT_MS = 60_000;

const isDev = process.argv.includes('--dev');

let mainWindow = null;
let tray = null;
let serverProcess = null;
let port = null;
let shuttingDown = false;

// Single instance lock — prevent multiple copies (and two servers on one port)
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

/**
 * Let the OS hand us a free port. A hardcoded one collides with whatever else
 * the machine is running, and the failure mode is a window that never loads.
 */
function findFreePort() {
  return new Promise((resolve, reject) => {
    const probe = net.createServer();
    probe.unref();
    probe.on('error', reject);
    probe.listen(0, HOST, () => {
      const assigned = probe.address().port;
      probe.close(() => resolve(assigned));
    });
  });
}

/** Poll until the server answers, rather than guessing from its stdout. */
function waitForServer(url, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  return new Promise((resolve) => {
    const attempt = () => {
      const request = http.get(url, (res) => {
        res.resume();
        resolve(true);
      });
      request.on('error', () => {
        if (Date.now() > deadline) resolve(false);
        else setTimeout(attempt, 250);
      });
      request.setTimeout(3000, () => request.destroy());
    };
    attempt();
  });
}

function getAppRoot() {
  return app.isPackaged
    ? path.join(process.resourcesPath, 'app')
    : path.join(__dirname, '..');
}

/** electron/assets is not packaged; the .ico is copied beside the exe instead. */
function getIconPath() {
  return app.isPackaged
    ? path.join(process.resourcesPath, 'icon.ico')
    : path.join(__dirname, 'assets', 'icon.ico');
}

function startServer() {
  if (isDev) {
    // `npm run electron:dev` assumes `npm run dev` is already up on :3000.
    port = DEV_PORT;
    return waitForServer(`http://${HOST}:${port}`, SERVER_READY_TIMEOUT_MS);
  }

  return findFreePort().then(
    (freePort) =>
      new Promise((resolve) => {
        port = freePort;
        const appRoot = getAppRoot();
        const nextCli = path.join(appRoot, 'node_modules', 'next', 'dist', 'bin', 'next');
        const log = [];

        // The Electron binary runs as Node when ELECTRON_RUN_AS_NODE is set, so
        // the packaged app needs no separate Node.js installation.
        serverProcess = spawn(
          process.execPath,
          [nextCli, 'start', '-H', HOST, '-p', String(port)],
          {
            cwd: appRoot,
            env: {
              ...process.env,
              HOSTNAME: HOST,
              PORT: String(port),
              NODE_ENV: 'production',
              ELECTRON_RUN_AS_NODE: '1',
            },
            stdio: ['ignore', 'pipe', 'pipe'],
            shell: false,
            windowsHide: true,
          },
        );

        serverProcess.stdout.on('data', (data) => {
          const line = data.toString().trim();
          if (line) console.log('[Server]', line);
        });

        serverProcess.stderr.on('data', (data) => {
          const line = data.toString().trim();
          if (line) {
            console.error('[Server Error]', line);
            log.push(line);
          }
        });

        serverProcess.on('error', (error) => {
          log.push(String(error && error.message ? error.message : error));
          resolve(false);
        });

        // A server that exits before the window opens is a build problem the
        // user needs to see, not a window that spins forever.
        serverProcess.once('exit', (code) => {
          if (shuttingDown) return;
          if (mainWindow === null) {
            log.push(`next start exited with code ${code}`);
            resolve(false);
            return;
          }
          dialog.showErrorBox(
            'DOR101 stopped working',
            'The local server behind this app stopped unexpectedly. Close the window and start DOR101 again.\n\n' +
              log.slice(-5).join('\n'),
          );
          app.quit();
        });

        waitForServer(`http://${HOST}:${port}`, SERVER_READY_TIMEOUT_MS).then((ready) => {
          if (!ready) {
            dialog.showErrorBox(
              'DOR101 could not start',
              'The bundled website did not answer within ' +
                Math.round(SERVER_READY_TIMEOUT_MS / 1000) +
                ' seconds.\n\n' +
                log.slice(-5).join('\n'),
            );
            resolve(false);
            return;
          }
          resolve(true);
        });
      }),
  );
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 900,
    minHeight: 600,
    title: 'DOR101 — Dorchester 101',
    icon: getIconPath(),
    backgroundColor: '#FAFAF8',
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // Remove default menu
  Menu.setApplicationMenu(null);

  // Load the app
  mainWindow.loadURL(`http://${HOST}:${port}`);

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

function createTray() {
  const trayIcon = nativeImage.createFromPath(getIconPath());
  // Without an icon the tray entry is invisible on Windows and the menu behind
  // it is unreachable, so skip the tray rather than ship a ghost.
  if (trayIcon.isEmpty()) return;

  tray = new Tray(trayIcon);
  tray.setToolTip('DOR101 — Dorchester 101');
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open DOR101',
      click: () => {
        if (mainWindow) mainWindow.show();
      },
    },
    { type: 'separator' },
    {
      label: 'Settings',
      click: () => {
        if (mainWindow) {
          mainWindow.loadURL(`http://${HOST}:${port}/settings`);
          mainWindow.show();
        }
      },
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.quit();
      },
    },
  ]);
  tray.setContextMenu(contextMenu);
  tray.on('click', () => {
    if (mainWindow) mainWindow.show();
  });
}

// App lifecycle
app.whenReady().then(async () => {
  const ready = await startServer();
  if (!ready) {
    app.quit();
    return;
  }
  createWindow();
  createTray();
});

app.on('window-all-closed', () => {
  // On Windows, don't quit when window closes (stay in tray)
  // But for simplicity, we quit
  app.quit();
});

app.on('before-quit', () => {
  shuttingDown = true;
  if (serverProcess && serverProcess.exitCode === null) {
    serverProcess.kill();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
