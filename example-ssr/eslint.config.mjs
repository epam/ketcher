import nextConfig from 'eslint-config-next/core-web-vitals';

export default [
  ...nextConfig,
  {
    settings: {
      react: {
        version: '19.2',
      },
    },
  },
];
