import { API } from '@storybook/api';

import { STORY_RENDERED } from '@storybook/core-events';
import React, { Key, useState } from 'react';

// Component
import InteractionPanel from './panel';
// Helper
import { DEFINE_ACTORS, WS_PORT } from '../helpers/constants';
// Type
import { Actors } from '../../types';

// WebSocket client
const ws = new WebSocket(`ws://localhost:${WS_PORT}`);

export default ({ api, active }: { api: API, active: boolean }) => {
  const [ actors, setActors ] = useState<Actors>();
  // Listen for future story selections
  api.on(STORY_RENDERED, () => {
    const currentStory = api.getCurrentStoryData();
    setActors((currentStory?.parameters as any)?.[DEFINE_ACTORS]);
    console.log('✨ currentStory:', currentStory);

    ws.send(JSON.stringify({
      eventType: STORY_RENDERED,
      parameters: currentStory.parameters,
      importPath: (currentStory.parameters as any)?.fileName,
    }));
  });
  return (
    <InteractionPanel
      active={active as boolean}
      actors={actors as Actors} />
  )
};
