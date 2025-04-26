import { ADDON_NAME, LOCAL_STORAGE_KEY } from '.';
import type { RecordingSettings } from '../../types';

export const getFromLocalStorage = (): RecordingSettings | null => {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);

  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      console.error('[interaction-2-tests] Cannot parse the stored object');
    }
  }
  return null;
};

export const saveToLocalStorage = (settings: RecordingSettings) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(settings as RecordingSettings));
  } catch {
    console.error(`[${ADDON_NAME}] Cannot save the settings to the local storage`);
  }
};
