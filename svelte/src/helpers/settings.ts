import { getLocalStorage, LOCAL_STORAGE_KEY } from '.';
import type { RecordingSettings } from '../../types';

export const getFromLocalStorage = (): RecordingSettings | null => {
  return getLocalStorage.getItem(LOCAL_STORAGE_KEY);
};

export const saveToLocalStorage = (settings: RecordingSettings) => {
  return getLocalStorage.setItem(LOCAL_STORAGE_KEY, settings as RecordingSettings);
};
