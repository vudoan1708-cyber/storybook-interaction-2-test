import { addons, types } from '@storybook/addons';
import React, { Key, useEffect, useState } from 'react';

import InteractionPanel from './panel';

const ADDON_ID = 'storybook/interaction-2-test';
const PANEL_ID = `${ADDON_ID}/panel`;

// Register addon
try {
  addons.ready().then(() => {
    addons.register(ADDON_ID, () => {
      console.log('Registering addon...');
      addons.add(PANEL_ID, {
        type: types.PANEL,
        title: 'Interaction-2-Test',
        render: ({ active, key }) => {
          return <InteractionPanel key={key as Key | null | undefined} active={active as boolean} />;
        },
      });
    });
  });
  console.log('✅ addons.register ran');
} catch (e) {
  console.error('❌ Error in addons.register:', e);
}
