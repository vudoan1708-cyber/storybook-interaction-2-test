import { API_CALL_EVENT_NAME, debounce } from './helpers';

import type { APICallRecord } from '../types';

const windowPostMessageDebounced = debounce(() => {
  window.parent.postMessage(
    {
      key: API_CALL_EVENT_NAME,
      payload: window.__apiCallRecord,
    },
    window.origin,
  );
}, 150);

const patchedFetch = () => {
  if (window.__fetchPatched || typeof window.fetch !== 'function') return;
  window.__fetchPatched = true;

  const originalFetch = window.fetch;

  window.__apiCallRecord = {} as APICallRecord;

  // Monkey patching fetch
  window.fetch = async (...args) => {
    if (!window.__apiCallRecord) window.__apiCallRecord = {};

    const [ url, init ] = args;

    const response = await originalFetch(...args);
    
    // Response is a stream, and can only be consumed once, do this so we have a reference of the response later on
    const cloned = response.clone();

    window.__apiCallRecord[url as string] = {
      method: init?.method as APICallRecord[string]['method'] || 'GET',
      requestBody: init?.body,
      // responseBody: response.status === 204 ? undefined : await response.json(),
      times: (window.__apiCallRecord[url as string]?.times || 0) + 1,
      status: response.status,
    };
    windowPostMessageDebounced();

    return cloned;
  };
};

requestAnimationFrame(() => {
  patchedFetch();
});

export const parameters = {};
