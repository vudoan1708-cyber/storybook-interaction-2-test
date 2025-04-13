module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: '14'
        },
        useBuiltIns: false,
      },
    ],
    '@babel/preset-typescript'
  ],
  plugins: [],
  ignore: ['**/*.d.ts'],
};
