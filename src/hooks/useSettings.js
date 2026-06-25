import { useCallback, useEffect, useState } from 'react';
import { getSettings, setSettings, onSettingsChanged } from '../utils/settingsStore';

// Shared settings access for any page (Newtab, Popup, Options). Stays in
// sync across contexts via chrome.storage.onChanged, so a change made in
// one open page (e.g. Options) is reflected live in another (e.g. Newtab).
export default function useSettings() {
  const [settings, setSettingsState] = useState(null);

  useEffect(() => {
    let mounted = true;
    getSettings().then((s) => {
      if (mounted) setSettingsState(s);
    });
    const unsubscribe = onSettingsChanged((next) => {
      if (mounted) setSettingsState(next);
    });
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const update = useCallback((partial) => {
    return setSettings(partial).then((next) => {
      setSettingsState(next);
      return next;
    });
  }, []);

  return { settings, update, loading: settings === null };
}
