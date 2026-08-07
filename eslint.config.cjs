const path = require('node:path');
const js = require('@eslint/js');
const { FlatCompat } = require('@eslint/eslintrc');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

const scopeLegacyConfig = (scope) => {
  const scopedPrefix = `${scope}/`;
  const scopedCompat = new FlatCompat({
    baseDirectory: path.resolve(__dirname, scope),
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all,
  });

  return scopedCompat.config({ extends: ['./.eslintrc.json'] }).map((entry) => {
    const scopedEntry = { ...entry };

    if (entry.files) {
      scopedEntry.files = entry.files.map((fileGlob) =>
        typeof fileGlob === 'string' ? `${scopedPrefix}${fileGlob}` : fileGlob,
      );
    } else {
      scopedEntry.files = [`${scope}/**/*`];
    }

    if (entry.ignores) {
      scopedEntry.ignores = entry.ignores.map(
        (ignoreGlob) =>
          typeof ignoreGlob === 'string'
            ? `${scopedPrefix}${ignoreGlob}`
            : ignoreGlob,
      );
    }

    return scopedEntry;
  });
};

module.exports = [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      'packages/ketcher-core/docs/**',
      'example/public/**',
      'example/build/**',
      'example/config/**',
      'ketcher-autotests/playwright-report/**',
      'ketcher-autotests/test-results/**',
      'ketcher-autotests/tests/utils/**',
      'ketcher-autotests/build/**',
      'packages/ketcher-core/src/domain/serializers/ket/compiledSchema.js',
    ],
  },

  ...compat.config({ extends: ['./.eslintrc.json'] }),

  ...scopeLegacyConfig('packages/ketcher-core'),
  ...scopeLegacyConfig('packages/ketcher-react'),
  ...scopeLegacyConfig('packages/ketcher-macromolecules'),
  ...scopeLegacyConfig('packages/ketcher-standalone'),
  ...scopeLegacyConfig('example'),
  ...scopeLegacyConfig('ketcher-autotests'),
];
