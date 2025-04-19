import { API } from '@storybook/api';

import { STORY_CHANGED, STORY_RENDERED } from '@storybook/core-events';
import React, { Key, useState } from 'react';

// Component
import InteractionPanel from './panel';
// Helper
import { DEFINE_ACTORS, WS_PORT } from '../helpers/constants';
// Type
import { Actors, Framework } from '../../types';

// WebSocket client
const ws = new WebSocket(`ws://localhost:${WS_PORT}`);

export default ({ api, active }: { api: API, active: boolean }) => {
  const [ actors, setActors ] = useState<Actors>();
  const [ renderedState, setRenderedState ] = useState<boolean>(false);
  const [ framework, setFramework ] = useState<Framework>('svelte');
  // Listen for future story selections
  api.on(STORY_RENDERED, () => {
    const currentStory = api.getCurrentStoryData();
    setActors((currentStory?.parameters as any)?.[DEFINE_ACTORS]);
    setRenderedState(true);
    setFramework((currentStory?.parameters as any).framework);

    ws.send(JSON.stringify({
      eventType: STORY_RENDERED,
      parameters: currentStory.parameters,
      importPath: (currentStory.parameters as any)?.fileName,
    }));
  });
  api.on(STORY_CHANGED, () => {
    setRenderedState(false);
  });
  return (
    <InteractionPanel
      active={active as boolean}
      actors={actors as Actors}
      storyRendered={renderedState}
      framework={framework} />
  )
};
