import fs from 'fs';
import path from 'path';
import { WebSocketServer } from 'ws';

import { WS_PORT } from './helpers/constants';

// Helper functions
import { getFileContent, analyseCode } from './helpers/preset_fileParser';

const wss = new WebSocketServer({ port: WS_PORT });

wss.on('connection', (ws) => {
  console.log('[interaction-2-test] ✅ WebSocket client connected');
   
  ws.on('message', (message: any) => {
    const response = JSON.parse(message.toString());
    const baseFileName = path.basename(response.importPath, '.stories.svelte');
    console.log('[interaction-2-test] base name', baseFileName);
    // The importPath is the path to the stories file, we need to find the svelte file that gets imported in
    const regex = new RegExp(`((import).*(${baseFileName}))`);
    // Get file content from STORYBOOK
    const storybookFileContent = getFileContent(response.importPath);
    const fullPathToComponentFile = path.resolve(path.dirname(response.importPath), `${baseFileName}.svelte`);

    // 1) See if the component of the same base name is imported in the stories.svelte file, and determine if it exists
    if (regex.test(storybookFileContent ?? '') && fs.existsSync(fullPathToComponentFile)) {
      // 1_2) Analyse code
      analyseCode({ filePath: fullPathToComponentFile, parameters: response.parameters });
    }

    // 2) Otherwise, we'll have to traverse through the stories file to get Meta component attribute

  });
});

export const managerEntries = (entry = []) => {
  console.log('[interaction-2-test] 📦 managerEntries loaded');
  console.log('[interaction-2-test] path', path.resolve(__dirname, 'manager.js'));
  return [ ...entry, require.resolve(path.resolve(__dirname, 'manager.js')) ];
};
