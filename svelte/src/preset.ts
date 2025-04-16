import path from 'path';

export const managerEntries = (entry = []) => {
  console.log('[interaction-2-test] 📦 managerEntries loaded');
  console.log('[interaction-2-test] path', path.resolve(__dirname, 'manager.js'));
  return [ ...entry, require.resolve(path.resolve(__dirname, 'manager.js')) ];
};

// export const previewEntries = (entry = []) => {
//   console.log('[interaction-2-test] 📦 previewEntries loaded');
//   console.log('[interaction-2-test] path', path.resolve(__dirname, 'preview.js'));
//   return [ ...entry, require.resolve(path.resolve(__dirname, 'preview.js')) ];
// };
