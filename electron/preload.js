const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  restartApp: () => ipcRenderer.invoke('restart-app'),
  generateReport: () => ipcRenderer.invoke('generate-report'),
  refreshAll: () => ipcRenderer.send('refresh-all'),
  onMenu: (action, callback) => {
    const listener = () => callback();
    ipcRenderer.on(action, listener);
    return () => ipcRenderer.removeListener(action, listener);
  },
  onUpdateAvailable: (callback) => {
    const listener = () => callback();
    ipcRenderer.on('update-available', listener);
    return () => ipcRenderer.removeListener('update-available', listener);
  },
  onUpdateDownloaded: (callback) => {
    const listener = () => callback();
    ipcRenderer.on('update-downloaded', listener);
    return () => ipcRenderer.removeListener('update-downloaded', listener);
  },
});
