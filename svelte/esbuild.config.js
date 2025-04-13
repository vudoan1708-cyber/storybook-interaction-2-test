// esbuild.config.js
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

async function start() {
  const ctx = await esbuild.context({
    entryPoints: ['src/recorder.tsx'],
    outfile: 'dist/recorder.js',
    bundle: true,
    platform: 'browser', // ⬅️ Changed from "node" to "browser"
    target: ['es2017'], // ⬅️ More appropriate for browser/manager UI
    external: ['react', 'react-dom'], // ⬅️ Essential for React addons!
    format: 'cjs',
    sourcemap: true,
    logLevel: 'info',
    loader: {
      '.ts': 'ts',
      '.tsx': 'tsx',
    },
    plugins: [
      {
        name: 'transpile-node-modules',
        setup(build) {
          build.onResolve({ filter: /.*/ }, args => {
            if (
              args.path.startsWith('.') ||
              path.isAbsolute(args.path)
            ) return;

            try {
              const resolved = require.resolve(args.path, {
                paths: [args.resolveDir],
              });

              if (includeFilter.test(resolved)) {
                return { path: resolved };
              }
            } catch (e) {
              // fallback
            }

            return { path: args.path, external: true };
          });
        },
      },
    ],
  });

  await ctx.watch();
  console.log('👀 Watching for changes...');
}

start().catch(err => {
  console.error(err);
  process.exit(1);
});
