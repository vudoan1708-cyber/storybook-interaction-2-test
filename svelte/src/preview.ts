import { ADDON_NAME, API_CALL_EVENT_NAME, debounce } from './helpers';

import type { APICallRecord } from '../types';
import { SET_CURRENT_STORY, STORY_CHANGED } from 'storybook/internal/core-events';

const windowPostMessageDebounced = debounce(() => {
  window.parent.postMessage(
    {
      key: API_CALL_EVENT_NAME,
      payload: window.__apiCallRecord,
    },
    window.origin,
  );
}, 150);

// Keep the wrapped fetch handler around for identity checks
let fetchWrapper: typeof fetch | null = null;

const patchedFetch = () => {
  const originalFetch = window.fetch;

  window.__apiCallRecord = {} as APICallRecord;

  if (originalFetch === fetchWrapper) return;

  // Monkey patching fetch
  window.fetch = async (...args) => {
    console.warn(`[${ADDON_NAME}] 🔧 Patching window.fetch: `, args);
    if (!window.__apiCallRecord) window.__apiCallRecord = {};

    const [ url, init ] = args;

    const response = await originalFetch(...args);
    
    // Response is a stream, and can only be consumed once, do this so we have a reference of the response later on
    const cloned = response.clone();

    const method = init?.method;

    window.__apiCallRecord[`[${method}] ${url}` as string] = {
      method: method as APICallRecord[string]['method'] || 'GET',
      requestBody: init?.body,
      // responseBody: response.status === 204 ? undefined : await response.json(),
      times: (window.__apiCallRecord[`[${method}] ${url}` as string]?.times || 0) + 1,
      status: response.status,
    };
    windowPostMessageDebounced();

    return cloned;
  };

  // Overwrite window.fetch with our new wrapper
  fetchWrapper = window.fetch;
};

patchedFetch();

window.addEventListener('message', patchedFetch);
