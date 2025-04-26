import { API } from '@storybook/api';

import { STORY_CHANGED, STORY_RENDERED } from '@storybook/core-events';
import React, { useState } from 'react';

// Component
import InteractionPanel from './panel';
// Helper
import { DEFINE_ACTORS, WS_PORT } from '../helpers/constants';
// Type
import type { Actors, Framework, ObjectExpression } from '../../types';

// WebSocket client
const ws = new WebSocket(`ws://localhost:${WS_PORT}`);

export default ({ api, active }: { api: API, active: boolean }) => {
  const [ actors, setActors ] = useState<Actors>();
  const [ renderedState, setRenderedState ] = useState<boolean>(false);
  const [ framework, setFramework ] = useState<Framework>('svelte');
  const [ componentName, setComponentName ] = useState<string>('');
  const [ extension, setExtension ] = useState<string>('');
  const [ props, setProps ] = useState<ObjectExpression['properties']>([]);
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
  ws.onmessage = (e) => {
    const response = JSON.parse(e.data);
    setComponentName(response.fileName);
    setExtension(response.fileExtension);
    setProps(response.exportDeclarations);
  };
  return (
    <InteractionPanel
      active={active as boolean}
      actors={actors as Actors}
      storyRendered={renderedState}
      framework={framework}
      component={{
        componentName,
        extension,
        props: props as ObjectExpression['properties'],
      }} />
  )
};
