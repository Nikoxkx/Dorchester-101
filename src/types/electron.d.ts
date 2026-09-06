interface ElectronAPI {
  checkForUpdates(): Promise<{ available: boolean }>;
  restartApp(): void;
  onUpdateAvailable(callback: () => void): void;
  onUpdateDownloaded(callback: () => void): void;
}

interface Window {
  electron?: ElectronAPI;
}
