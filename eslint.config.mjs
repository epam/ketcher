import css from '@eslint/css';
import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettierConfig from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import jestPlugin from 'eslint-plugin-jest';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import nPlugin from 'eslint-plugin-n';
import promisePlugin from 'eslint-plugin-promise';
import prettierPlugin from 'eslint-plugin-prettier';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import testingLibraryPlugin from 'eslint-plugin-testing-library';
import reactYouMightNotNeedAnEffectPlugin from 'eslint-plugin-react-you-might-not-need-an-effect';
import globals from 'globals';

const sanitizeGlobals = (source) => {
  if (!source || typeof source !== 'object') {
    return {};
  }

  return Object.fromEntries(
    Object.entries(source).filter(([name]) =>
      /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name),
    ),
  );
};

export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      'packages/ketcher-core/docs/**',
      'example/public/**',
      'example/build/**',
      'example/config/**',
      'ketcher-autotests/playwright-report/**',
      'ketcher-autotests/test-results/**',
      'ketcher-autotests/tests/utils/**',
      'ketcher-autotests/build/**',
      'packages/ketcher-core/src/domain/serializers/ket/compiledSchema.js',
      '**/*.d.ts',
      '**/*.test.{ts,tsx,js,jsx}',
      '**/*.spec.{ts,tsx,js,jsx}',
      '**/setupTests.{ts,tsx,js,jsx}',
      '**/testMocks/**',
      '**/__tests__/**',
    ],
  },
  {
    ...js.configs.recommended,
    files: ['**/*.{js,cjs,mjs,jsx,ts,tsx}'],
  },
  {
    files: ['**/*.{js,cjs,mjs,jsx,ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
        requireConfigFile: false,
      },
      globals: {
        ...sanitizeGlobals(globals.browser),
        ...sanitizeGlobals(globals.node),
        ...sanitizeGlobals(globals.es2024),
        ...sanitizeGlobals(globals.jest),
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        JSX: 'readonly',
        React: 'readonly',
        global: 'readonly',
        VoidFunction: 'readonly',
        withThemeProvider: 'readonly',
        withThemeAndStoreProvider: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      import: importPlugin,
      jest: jestPlugin,
      'jsx-a11y': jsxA11yPlugin,
      n: nPlugin,
      promise: promisePlugin,
      prettier: prettierPlugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'testing-library': testingLibraryPlugin,
      'react-you-might-not-need-an-effect': reactYouMightNotNeedAnEffectPlugin,
    },
    rules: {
      'linebreak-style': ['error', 'unix'],
      'prettier/prettier': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      'object-shorthand': 'error',
      '@typescript-eslint/no-empty-function': 'off',
      'no-constant-condition': ['error', { checkLoops: false }],
      'no-dupe-class-members': 'off',
      '@typescript-eslint/no-dupe-class-members': 'error',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-use-before-define': [
        'error',
        { functions: false, typedefs: false },
      ],
      'no-duplicate-imports': 'error',
      'no-alert': 'error',
      'comma-dangle': 0,
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
      'react-hooks/preserve-manual-memoization': 'off',
      'jest/expect-expect': 'off',
      'testing-library/no-container': 'off',
      'testing-library/no-node-access': 'off',
      'testing-library/no-unnecessary-act': 'off',
      'react-you-might-not-need-an-effect/no-chain-state-updates': 'off',
      'react-you-might-not-need-an-effect/no-event-handler': 'off',
    },
  },
  {
    files: ['ketcher-autotests/**/*.{ts,tsx,js,jsx}'],
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'no-duplicate-imports': 'error',
      'react-hooks/rules-of-hooks': 'off',
      'react-hooks/exhaustive-deps': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/static-components': 'off',
      'react-hooks/use-memo': 'off',
      'react-hooks/immutability': 'off',
      'react-hooks/preserve-manual-memoization': 'off',
      'react-hooks/refs': 'off',
    },
  },
  {
    files: ['**/*.{js,cjs,mjs,jsx}'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-dupe-class-members': 'off',
      'no-dupe-class-members': 'error',
    },
  },
  {
    files: [
      'packages/ketcher-react/**/*.{ts,tsx,js,jsx}',
      'packages/ketcher-macromolecules/**/*.{ts,tsx,js,jsx}',
    ],
    rules: {
      'jsx-a11y/label-has-associated-control': 'warn',
      'jsx-a11y/no-static-element-interactions': 'warn',
      'jsx-a11y/no-autofocus': 'warn',
      'jsx-a11y/no-noninteractive-element-interactions': 'warn',
      'jsx-a11y/alt-text': 'warn',
      'jsx-a11y/click-events-have-key-events': 'warn',
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'assert',
              message:
                "Node's 'assert' module breaks browser bundlers (see issue #3733). Use `import { assert } from 'ketcher-core'` instead.",
            },
          ],
        },
      ],
      'react-hooks/set-state-in-effect': 'error',
      'react-hooks/static-components': 'error',
      'react-hooks/use-memo': 'error',
      'react-hooks/immutability': 'error',
      'react-hooks/preserve-manual-memoization': 'error',
      'react-hooks/refs': 'error',
      'react-you-might-not-need-an-effect/no-chain-state-updates': 'error',
      'react-you-might-not-need-an-effect/no-event-handler': 'error',
    },
  },
  {
    files: ['packages/ketcher-react/**/*.{ts,tsx,js,jsx}'],
    rules: {
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'separate-type-imports',
        },
      ],
    },
  },
  {
    files: ['example/**/*.{ts,tsx,js,jsx}'],
    rules: {
      '@typescript-eslint/ban-ts-comment': 'warn',
      'jsx-a11y/label-has-associated-control': 'warn',
      'jsx-a11y/no-static-element-interactions': 'warn',
      'jsx-a11y/no-autofocus': 'warn',
      'jsx-a11y/no-noninteractive-element-interactions': 'warn',
      'jsx-a11y/alt-text': 'warn',
      'jsx-a11y/click-events-have-key-events': 'warn',
    },
  },
  {
    files: [
      'example/**/__tests__/**/*.[jt]s?(x)',
      'example/**/*.{spec,test}.[jt]s?(x)',
    ],
    rules: {
      'testing-library/no-container': 'warn',
      'testing-library/no-node-access': 'warn',
    },
  },
  {
    files: ['ketcher-autotests/**/*.{ts,tsx,js,jsx}'],
    rules: {
      semi: ['error', 'always'],
      'max-depth': ['error', 3],
      'no-else-return': [
        'error',
        {
          allowElseIf: true,
        },
      ],
      'no-magic-numbers': [
        'warn',
        {
          ignore: [0, 1],
          ignoreArrayIndexes: true,
          ignoreDefaultValues: true,
          ignoreClassFieldInitialValues: true,
        },
      ],
      'no-nested-ternary': 'error',
      'prefer-template': 'error',
      'max-len': ['error', 180],
      'no-multiple-empty-lines': ['error', { max: 1 }],
      'no-implicit-coercion': 'error',
      'no-inline-comments': 'error',
      'no-lonely-if': 'error',
      'no-multi-assign': 'error',
      'no-restricted-exports': [
        'error',
        {
          restrictDefaultExports: { direct: true },
        },
      ],
      curly: 'error',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'no-duplicate-imports': 'error',
      'react-hooks/rules-of-hooks': 'off',
      'react-hooks/exhaustive-deps': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/static-components': 'off',
      'react-hooks/use-memo': 'off',
      'react-hooks/immutability': 'off',
      'react-hooks/preserve-manual-memoization': 'off',
      'react-hooks/refs': 'off',
    },
  },
  {
    files: ['packages/ketcher-core/**/*.{ts,tsx,js,jsx}'],
    rules: {
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'separate-type-imports',
        },
      ],
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'assert',
              message:
                "Node's 'assert' module breaks browser bundlers (see issue #3733). Use `import { assert } from 'utilities'` instead.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ['packages/ketcher-standalone/**/*.{ts,tsx,js,jsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'assert',
              message:
                "Node's 'assert' module breaks browser bundlers (see issue #3733). Use `import { assert } from 'ketcher-core'` instead.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.css'],
    ignores: ['**/build/**', '**/dist/**', '**/node_modules/**'],
    language: 'css/css',
    plugins: {
      css,
    },
    rules: {
      ...css.configs.recommended.rules,
    },
  },
  prettierConfig,
];
