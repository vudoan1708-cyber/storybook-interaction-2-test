import { addons, types } from '@storybook/addons';
import { STORY_RENDERED } from '@storybook/core-events';

import React, { Key } from 'react';

import InteractionPanel from './panel';

import { ADDON_ID, PANEL_ID } from './helpers/constants';

// Register addon
try {
  addons.ready().then(() => {
    addons.register(ADDON_ID, (api) => {
      // Listen for future story selections
      api.on(STORY_RENDERED, (storyId) => {
        console.log('✨ story changed to:', storyId);
        const currentStory = api.getCurrentStoryData();
        console.log('currentStory', currentStory);
      });

      addons.add(PANEL_ID, {
        type: types.PANEL,
        title: 'Interaction-2-Test',
        render: ({ active, key }) => {
          return <InteractionPanel key={key as Key | null | undefined} active={active as boolean} />;
        },
      });
    });
  });
} catch (e) {
  console.error('❌ Error in addons.register:', e);
}
