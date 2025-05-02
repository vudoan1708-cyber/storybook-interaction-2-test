import fs from 'fs';
import path from 'path';
import { WebSocketServer } from 'ws';

import { ADDON_NAME, CONFIG_FILE_NAME, GLOBAL_ACTORS_IDENTIFIER, WS_PORT } from './helpers/constants';

// Helper functions
import { getFileContent, analyseCode } from './helpers/preset_fileParser';

const wss = new WebSocketServer({ port: WS_PORT });

const projectRoot = process.cwd();

const configPath = path.resolve(path.join(projectRoot, CONFIG_FILE_NAME));
const requireConfigFile = () => {
  try {
    return require(configPath);
  } catch {
    console.error(`[${ADDON_NAME}] Failed to load ${CONFIG_FILE_NAME} in the root directory`);
    return null;
  }
};

wss.on('connection', (ws) => {
  console.log(`[${ADDON_NAME}] ✅ WebSocket client connected`);

  // Send actors
  ws.send(JSON.stringify({
    key: GLOBAL_ACTORS_IDENTIFIER,
    actors: fs.existsSync(configPath) ? requireConfigFile() : null,
  }))
   
  ws.on('message', (message: any) => {
    const response = JSON.parse(message.toString());
    const baseFileName = path.basename(response.importPath, '.stories.svelte');
    // The importPath is the path to the stories file, we need to find the svelte file that gets imported in
    const regex = new RegExp(`((import).*(${baseFileName}))`);
    // Get file content from STORYBOOK
    const storybookFileContent = getFileContent(response.importPath);
    const fullPathToComponentFile = path.resolve(path.dirname(response.importPath), `${baseFileName}.svelte`);

    // 1) See if the component of the same base name is imported in the stories.svelte file, and determine if it exists
    if (regex.test(storybookFileContent ?? '') && fs.existsSync(fullPathToComponentFile)) {
      // 1_2) Analyse code
      const result = analyseCode({ filePath: fullPathToComponentFile, parameters: response.parameters });
      // 1_3) Send the result over to the client side
      ws.send(JSON.stringify({
        exportDeclarations: result,
        fileName: baseFileName,
        fileExtension: 'svelte',
      }));
    }

    // TODO: 2) Otherwise, we'll have to traverse through the stories file to find Meta and get its component attribute
  });
});

export const managerEntries = (entry = []) => {
  console.log(`[${ADDON_NAME}] 📦 managerEntries loaded`);
  return [ ...entry, require.resolve(path.resolve(__dirname, 'manager.js')) ];
};
export const previewEntries = (entry = []) => {
  console.log(`[${ADDON_NAME}] 📦 previewEntries loaded`);
  return [ ...entry, require.resolve(path.resolve(__dirname, 'preview.js')) ];
};
