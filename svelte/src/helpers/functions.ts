import { ADDON_NAME } from "./constants";

export const debounce = <T extends (...args: any[]) => void>(fn: T, delay: number): T => {
  let timer: ReturnType<typeof setTimeout> | null = null;

  const debouncedFn = (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };

  return debouncedFn as T;
};

export const sleep = (delay = 50): Promise<void> => {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      clearTimeout(timeout);
      resolve();
    }, delay);
  });
}

export const getLocalStorage = {
  getItem: (key: string) => {
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        console.error('[interaction-2-tests] Cannot parse the stored object');
      }
    }
    return null;
  },
  setItem: (key: string, value: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      console.error(`[${ADDON_NAME}] Cannot save the settings to the local storage`);
    }
  }
};
