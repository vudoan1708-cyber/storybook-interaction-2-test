const esbuild = require('esbuild');
const path = require('path');

// List of node_modules you want to force-include (transpile)
const includeModules = [
  '@storybook/preview-api',
  '@storybook/addons',
  '@storybook/client-logger',
  '@storybook/channels',
  '@storybook/core-events',
  '@storybook/global',
];

// Build regex to match full paths inside those modules
const includeFilter = new RegExp(
  `(${includeModules.map(m => m.replace('/', '[\\/\\\\]')).join('|')})`
);

const sharedOptions = {
  bundle: true,
  sourcemap: true,
  logLevel: 'info',
  loader: {
    '.ts': 'ts',
    '.tsx': 'tsx',
  },
};

function buildBrowser() {
  return esbuild.context({
    ...sharedOptions,
    entryPoints: [
      './svelte/src/manager.tsx',
      // 'svelte/src/preview.ts'
    ],
    outdir: 'dist',
    platform: 'browser',
    target: ['es2017'],
    external: ['react', 'react-dom', 'svelte', '@storybook/addons', '@storybook/components'],
    format: 'cjs',
  });
}

function buildNode() {
  return esbuild.context({
    ...sharedOptions,
    entryPoints: ['./svelte/src/preset.ts'],
    outdir: 'dist',
    platform: 'node',
    target: ['node14'],
    external: ['svelte'],
    format: 'cjs',
  });
}

async function start() {
  const [browserCtx, nodeCtx] = await Promise.all([buildBrowser(), buildNode()]);
  await Promise.all([browserCtx.watch(), nodeCtx.watch()]);
  console.log('👀 Watching browser + node builds...');
}

start().catch(err => {
  console.error(err);
  process.exit(1);
});
