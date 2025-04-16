import fs from 'fs';
import path from 'path';

console.log('[interaction-2-test] 🧠 preset.ts is being loaded outside of managerEntries');
export const managerEntries = (entry = []) => {
  console.log('[interaction-2-test] 📦 preset loaded in managerEntries');
  console.log('[interaction-2-test] path', path.resolve(__dirname, 'manager.js'));
  return [ ...entry, require.resolve(path.resolve(__dirname, 'manager.js')) ];
};
