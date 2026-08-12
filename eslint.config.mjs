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
  js.configs.recommended,
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
      'react-you-might-not-need-an-effect':
        reactYouMightNotNeedAnEffectPlugin,
    },
    rules: {
      'linebreak-style': ['error', 'unix'],
      'prettier/prettier': 'error',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/no-explicit-any': 'error',
      'object-shorthand': 'error',
      '@typescript-eslint/no-empty-function': 'off',
      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'warn',
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
      'react-hooks/exhaustive-deps': 'warn',
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
    files: ['ketcher-autotests/**/*.{ts,tsx}'],
    rules: {
      'no-unused-vars': 'off',
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
    files: [
      'packages/ketcher-react/src/script/editor/Editor.ts',
      'packages/ketcher-react/src/script/editor/HoverIcon.ts',
      'packages/ketcher-react/src/script/editor/tool/Tool.ts',
      'packages/ketcher-react/src/script/editor/tool/atom.ts',
      'packages/ketcher-react/src/script/editor/tool/bond.ts',
      'packages/ketcher-react/src/script/editor/tool/chain.ts',
      'packages/ketcher-react/src/script/editor/tool/charge.ts',
      'packages/ketcher-react/src/script/editor/tool/eraser.ts',
      'packages/ketcher-react/src/script/editor/tool/helper/dropAndMerge.ts',
      'packages/ketcher-react/src/script/editor/tool/helper/lasso.ts',
      'packages/ketcher-react/src/script/editor/tool/helper/locate.ts',
      'packages/ketcher-react/src/script/editor/tool/paste.ts',
      'packages/ketcher-react/src/script/editor/tool/reactionarrow.ts',
      'packages/ketcher-react/src/script/editor/tool/reactionmap.ts',
      'packages/ketcher-react/src/script/editor/tool/reactionplus.ts',
      'packages/ketcher-react/src/script/editor/tool/rotate-controller.test.ts',
      'packages/ketcher-react/src/script/editor/tool/rotate-controller.ts',
      'packages/ketcher-react/src/script/editor/tool/rotate.ts',
      'packages/ketcher-react/src/script/editor/tool/select.ts',
      'packages/ketcher-react/src/script/editor/tool/sgroup.ts',
      'packages/ketcher-react/src/script/editor/tool/simpleobject.ts',
      'packages/ketcher-react/src/script/editor/tool/template.ts',
      'packages/ketcher-react/src/script/editor/tool/text.ts',
      'packages/ketcher-react/src/script/editor/utils/customOnChangeHandler.ts',
      'packages/ketcher-react/src/script/ui/App/initApp.tsx',
      'packages/ketcher-react/src/script/ui/Portal/Portal.tsx',
      'packages/ketcher-react/src/script/ui/action/action.types.ts',
      'packages/ketcher-react/src/script/ui/action/isHidden.ts',
      'packages/ketcher-react/src/script/ui/component/form/Input/Input.tsx',
      'packages/ketcher-react/src/script/ui/component/form/colorPicker/ColorPicker.tsx',
      'packages/ketcher-react/src/script/ui/component/structrender.tsx',
      'packages/ketcher-react/src/script/ui/component/view/savebutton.tsx',
      'packages/ketcher-react/src/script/ui/data/convert/structConverter.ts',
      'packages/ketcher-react/src/script/ui/data/convert/structconv.ts',
      'packages/ketcher-react/src/script/ui/data/schema/options-schema.ts',
      'packages/ketcher-react/src/script/ui/dialog/index.ts',
      'packages/ketcher-react/src/script/ui/dialog/template/TemplateDialog.tsx',
      'packages/ketcher-react/src/script/ui/dialog/template/TemplateTable.tsx',
      'packages/ketcher-react/src/script/ui/dialog/toolbox/enhancedStereo/enhancedStereo.tsx',
      'packages/ketcher-react/src/script/ui/state/functionalGroups/index.ts',
      'packages/ketcher-react/src/script/ui/state/handleHotkeysOverItem.ts',
      'packages/ketcher-react/src/script/ui/state/hotkeys.ts',
      'packages/ketcher-react/src/script/ui/state/shared.ts',
      'packages/ketcher-react/src/script/ui/utils/index.ts',
      'packages/ketcher-react/src/script/ui/views/AppClipArea.tsx',
      'packages/ketcher-react/src/script/ui/views/components/Dialog/Dialog.tsx',
      'packages/ketcher-react/src/script/ui/views/components/StructEditor/InfoPanel.tsx',
      'packages/ketcher-react/src/script/ui/views/components/StructEditor/InfoTooltip.tsx',
      'packages/ketcher-react/src/script/ui/views/modal/Modal.tsx',
      'packages/ketcher-react/src/script/ui/views/modal/components/Text/Text.tsx',
      'packages/ketcher-react/src/script/ui/views/modal/components/document/Open/Open.tsx',
      'packages/ketcher-react/src/script/ui/views/modal/components/meta/Settings/Settings.tsx',
      'packages/ketcher-react/src/script/ui/views/modal/components/process/Miew/Miew.tsx',
      'packages/ketcher-react/src/script/ui/views/modal/components/toolbox/Atom/Atom.container.ts',
      'packages/ketcher-react/src/script/ui/views/modal/components/toolbox/Attach/Attach.container.ts',
      'packages/ketcher-react/src/script/ui/views/modal/components/toolbox/Automap/Automap.container.ts',
      'packages/ketcher-react/src/script/ui/views/modal/components/toolbox/Bond/Bond.container.ts',
      'packages/ketcher-react/src/script/ui/views/modal/components/toolbox/FG/RemoveFG.tsx',
      'packages/ketcher-react/src/script/ui/views/modal/components/toolbox/RgroupLogic/RgroupLogic.container.ts',
      'packages/ketcher-react/src/script/ui/views/modal/components/toolbox/RgroupLogic/components/IfThenSelect/IfThenSelect.tsx',
      'packages/ketcher-react/src/script/ui/views/modal/modal.types.ts',
      'packages/ketcher-react/src/script/ui/views/toolbars/ArrowScroll/ArrowScroll.tsx',
      'packages/ketcher-react/src/script/ui/views/toolbars/BottomToolbar/BottomToolbar.tsx',
      'packages/ketcher-react/src/script/ui/views/toolbars/BottomToolbar/TemplatesList/TemplatesList.tsx',
      'packages/ketcher-react/src/script/ui/views/toolbars/FloatingTools/FloatingTools.container.ts',
      'packages/ketcher-react/src/script/ui/views/toolbars/LeftToolbar/LeftToolbar.container.ts',
      'packages/ketcher-react/src/script/ui/views/toolbars/RightToolbar/AtomsList/AtomsList.tsx',
      'packages/ketcher-react/src/script/ui/views/toolbars/RightToolbar/RightToolbar.tsx',
      'packages/ketcher-react/src/script/ui/views/toolbars/TopToolbar/TopToolbar.container.ts',
      'packages/ketcher-react/src/typings.d.ts',
    ],
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  prettierConfig,
];
