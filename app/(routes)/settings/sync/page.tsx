'use client';

import { useEffect, useState } from 'react';
import Card from '@/lib/ui/card/Card';
import Button from '@/lib/ui/buttons/Button';
import { toast } from 'react-toastify';
import { useSyncConfig, useUpdateSyncConfig } from '@/lib/hooks/useSync';
import ErrorBanner from '@/lib/ui/feedback/ErrorBanner';

const MIN_INTERVAL = 10;
const MAX_INTERVAL = 3600;

const SyncSettingsPage = () => {
  const { data: config, isLoading, error } = useSyncConfig();
  const { mutateAsync: updateConfig, isPending } = useUpdateSyncConfig();

  const [enabled, setEnabled] = useState(true);
  const [intervalSecs, setIntervalSecs] = useState(30);

  useEffect(() => {
    if (config) {
      setEnabled(config.autoSyncEnabled);
      setIntervalSecs(config.autoSyncIntervalSecs);
    }
  }, [config]);

  const handleSave = async () => {
    if (enabled && (intervalSecs < MIN_INTERVAL || intervalSecs > MAX_INTERVAL)) {
      toast.error(`Interval must be between ${MIN_INTERVAL} and ${MAX_INTERVAL} seconds`);
      return;
    }

    try {
      await updateConfig({ autoSyncEnabled: enabled, autoSyncIntervalSecs: intervalSecs });
      toast.success('Sync settings saved');
    } catch {
      toast.error('Failed to save sync settings');
    }
  };

  if (isLoading) {
    return <div className="text-gray-400 text-sm">Loading…</div>;
  }

  if (error) {
    return (
      <ErrorBanner
        title="Failed to load sync settings"
        message={error.message}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-white">Sync Settings</h1>
        <p className="text-gray-400 text-sm mt-1">
          Configure how Revive keeps AWS resource data up to date.
        </p>
      </div>

      <Card className="p-6 space-y-6">
        {/* Auto-sync toggle */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-medium">Auto-sync</p>
            <p className="text-gray-400 text-sm mt-0.5">
              Automatically sync AWS resources in the background at the interval below.
            </p>
          </div>
          <button
            role="switch"
            aria-checked={enabled}
            onClick={() => setEnabled((v) => !v)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
              enabled ? 'bg-blue-600' : 'bg-gray-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform ${
                enabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <hr className="border-gray-700" />

        {/* Interval input */}
        <div className={enabled ? '' : 'opacity-40 pointer-events-none'}>
          <label htmlFor="interval" className="form-label">
            Sync interval (seconds)
          </label>
          <p className="text-gray-500 text-xs mb-2">
            How often to automatically sync. Minimum {MIN_INTERVAL}s, maximum {MAX_INTERVAL}s (1 hour).
          </p>
          <div className="flex items-center gap-3">
            <input
              id="interval"
              type="number"
              min={MIN_INTERVAL}
              max={MAX_INTERVAL}
              value={intervalSecs}
              onChange={(e) => setIntervalSecs(Number(e.target.value))}
              className="form-input w-32"
              disabled={!enabled}
            />
            <span className="text-gray-400 text-sm">seconds</span>
          </div>

          {/* Preset buttons */}
          <div className="flex gap-2 mt-3 flex-wrap">
            {[15, 30, 60, 300].map((preset) => (
              <button
                key={preset}
                onClick={() => setIntervalSecs(preset)}
                disabled={!enabled}
                className={`px-3 py-1 text-xs rounded-md border transition ${
                  intervalSecs === preset
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500'
                }`}
              >
                {preset < 60 ? `${preset}s` : `${preset / 60}m`}
              </button>
            ))}
          </div>
        </div>

        <hr className="border-gray-700" />

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? 'Saving…' : 'Save Changes'}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default SyncSettingsPage;
