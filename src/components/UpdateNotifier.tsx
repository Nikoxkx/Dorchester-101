'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

export function UpdateNotifier() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateDownloaded, setUpdateDownloaded] = useState(false);
  const [isElectron] = useState(() => typeof window !== 'undefined' && (window as any).electron !== undefined);

  useEffect(() => {
    if (!isElectron) return;

    const handleUpdateAvailable = () => {
      setUpdateAvailable(true);
    };

    const handleUpdateDownloaded = () => {
      setUpdateAvailable(false);
      setUpdateDownloaded(true);
    };

    const electron = (window as any).electron;
    if (electron) {
      electron.onUpdateAvailable(handleUpdateAvailable);
      electron.onUpdateDownloaded(handleUpdateDownloaded);
    }

    return () => {
      // Cleanup listeners if needed
    };
  }, [isElectron]);

  const handleRestartAndInstall = () => {
    const electron = (window as any).electron;
    if (electron) {
      electron.restartApp();
    }
  };

  if (!isElectron) {
    return null; // Don't show on web version
  }

  return (
    <>
      {updateAvailable && (
        <Card className="fixed bottom-4 right-4 w-96 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Download className="h-5 w-5 text-blue-600" />
              Update Available
            </CardTitle>
            <CardDescription>A new version is being downloaded in the background.</CardDescription>
          </CardHeader>
        </Card>
      )}

      {updateDownloaded && (
        <Card className="fixed bottom-4 right-4 w-96 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertCircle className="h-5 w-5 text-green-600" />
              Update Ready to Install
            </CardTitle>
            <CardDescription>Restart the app to apply the latest version.</CardDescription>
          </CardHeader>
          <CardContent>
            <button
              onClick={handleRestartAndInstall}
              className="w-full rounded-lg bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700"
            >
              Restart Now
            </button>
          </CardContent>
        </Card>
      )}
    </>
  );
}
