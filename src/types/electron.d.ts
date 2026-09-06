interface ElectronAPI {
  checkForUpdates(): Promise<{ available: boolean }>;
  restartApp(): void;
  refreshAll(): void;
  generateReport(): Promise<unknown>;
  onMenu(action: string, callback: () => void): () => void;
  onUpdateAvailable(callback: () => void): () => void;
  onUpdateDownloaded(callback: () => void): () => void;
}

interface Window {
  electron?: ElectronAPI;
}
