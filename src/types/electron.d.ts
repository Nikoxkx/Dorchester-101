interface ElectronAPI {
  onUpdateAvailable(callback: () => void): void;
  onUpdateDownloaded(callback: () => void): void;
  restartApp(): void;
}

interface Window {
  electron?: ElectronAPI;
}
