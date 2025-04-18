import { addons, types } from '@storybook/addons';

import React, { Key } from 'react';

import InteractionPanelWrapper from './components/wrapper';

import { ADDON_ID, PANEL_ID } from './helpers/constants';

// Register addon
try {
  addons.ready().then(() => {
    addons.register(ADDON_ID, (api) => {
      addons.add(PANEL_ID, {
        type: types.PANEL,
        title: 'Interaction-2-Test',
        render: ({ active, key }) => {
          return (
            <InteractionPanelWrapper
              key={key as Key | null | undefined}
              api={api}
              active={active as boolean} />
          )
        },
      });
    });
  });
} catch (e) {
  console.error('❌ Error in addons.register:', e);
}
