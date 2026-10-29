import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { Linter } from 'eslint';
import tsParser from '@typescript-eslint/parser';
import ts from 'typescript';
import {
  ALLOWED_DOMAIN_IMPORTS,
  ALLOWED_MODEL_MUTATIONS,
  ALLOWED_UI_IMPORTS,
  rules,
} from './eslint-invariants-rules.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.dirname(HERE);
const DOCS = path.join(REPO_ROOT, 'packages/ketcher-core/src');

const linter = new Linter();

const BASE_CONFIG = {
  files: ['**/*.ts'],
  plugins: { ketcher: { rules } },
  languageOptions: {
    parser: tsParser,
    parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  },
};

const lint = (code, rulesConfig, filename) =>
  linter
    .verify(code, { ...BASE_CONFIG, rules: rulesConfig }, filename)
    .map((m) => m.line);

const lintRealFile = (relativePath, rulesConfig) => {
  const filename = path.join(REPO_ROOT, relativePath);
  return lint(fs.readFileSync(filename, 'utf8'), rulesConfig, filename);
};

const toRuleConfig = (name, options) => ({
  [`ketcher/${name}`]: options === undefined ? 'error' : ['error', options],
});

const statementLinesFor = (filename, modules) => {
  const text = fs.readFileSync(filename, 'utf8');
  const sf = ts.createSourceFile(
    filename,
    text,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  const lines = [];
  const walk = (node) => {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
      if (node.moduleSpecifier && modules.includes(node.moduleSpecifier.text)) {
        lines.push(sf.getLineAndCharacterOfPosition(node.getStart()).line + 1);
      }
    }
    ts.forEachChild(node, walk);
  };
  walk(sf);
  return lines;
};

test('A1 flags building a Command and calling mutating DrawingEntitiesManager methods in a renderer', () => {
  const code = [
    "import { Command } from 'domain/entities/Command';",
    'function f() {',
    '  const a = new Command();',
    '  editor.drawingEntitiesManager.unselectDrawingEntity(x);',
    '  const r = editor.drawingEntitiesManager.monomers.get(1);',
    '  this.deletePolymerBond(y);',
    '}',
  ].join('\n');
  assert.deepEqual(
    lint(
      code,
      toRuleConfig('renderer-no-model-mutations'),
      path.join(DOCS, 'application/render/renderer.ts'),
    ),
    [3, 4],
  );
});

test('A1 options allowlist suppresses only the named patterns for the named files', () => {
  const code = [
    "import { Command } from 'domain/entities/Command';",
    'function f() {',
    '  const a = new Command();',
    '  editor.drawingEntitiesManager.unselectDrawingEntity(x);',
    '}',
  ].join('\n');
  const allowed = [
    {
      file: 'packages/ketcher-core/src/application/render/renderer.ts',
      patterns: ['newCommand', 'unselectDrawingEntity'],
    },
  ];
  assert.deepEqual(
    lint(
      code,
      toRuleConfig('renderer-no-model-mutations', { allowedFiles: allowed }),
      path.join(DOCS, 'application/render/renderer.ts'),
    ),
    [],
  );
  assert.deepEqual(
    lint(
      code,
      toRuleConfig('renderer-no-model-mutations', { allowedFiles: [] }),
      path.join(DOCS, 'application/render/renderer.ts'),
    ),
    [3, 4],
  );
});

test('A4 flags runtime imports from render, editor, and React; type-only imports pass', () => {
  const code = [
    "import { provideEditorInstance } from 'application/editor/editorSingleton';",
    "import type { Base } from 'application/render/renderers/BaseRenderer';",
    "import { type Diff } from 'application/editor/tools/types';",
    "import * as React from 'react';",
    "import { MachineState } from '../../application/editor/machineStates';",
    "import { Vec2 } from 'domain/entities/vec2';",
  ].join('\n');
  assert.deepEqual(
    lint(
      code,
      toRuleConfig('domain-no-application-imports'),
      path.join(DOCS, 'domain/some.ts'),
    ),
    [1, 4, 5],
  );
});

test('A4 allowlist suppresses named specifiers for named domain files and nothing else', () => {
  const allow = [
    {
      file: 'packages/ketcher-core/src/domain/entities/some.ts',
      imports: ['application/editor/editorSingleton'],
    },
  ];
  const code = [
    "import { provideEditorInstance } from 'application/editor/editorSingleton';",
    "import { editorEvents } from 'application/editor/editorEvents';",
  ].join('\n');
  assert.deepEqual(
    lint(
      code,
      toRuleConfig('domain-no-application-imports', { allow }),
      path.join(DOCS, 'domain/entities/some.ts'),
    ),
    [2],
  );
});

test('A5 flags React imports in ketcher-core, unless the file is allowlisted', () => {
  const code = [
    "import detectMobile from 'react-device-detect';",
    "import * as React from 'react';",
  ].join('\n');
  const allowlisted = path.join(
    REPO_ROOT,
    'packages/ketcher-core/src/utilities/shortcutsUtil.ts',
  );
  assert.deepEqual(
    lint(code, toRuleConfig('ui-imports-in-core'), allowlisted),
    [2],
  );
  assert.deepEqual(
    lint(
      code,
      toRuleConfig('ui-imports-in-core'),
      path.join(REPO_ROOT, 'packages/ketcher-core/src/other.ts'),
    ),
    [1, 2],
  );
});

test('A5 rejects declared React or UI-framework dependencies and tolerates the react-device-detect debt', () => {
  const code = 'const x = 1;';
  assert.equal(
    lint(
      code,
      toRuleConfig('ui-deps-in-core', {
        forbiddenDeps: ['react', 'react-device-detect'],
      }),
      path.join(REPO_ROOT, 'packages/ketcher-core/src/x.ts'),
    ).length,
    1,
  );
  assert.equal(
    lint(
      code,
      toRuleConfig('ui-deps-in-core', {
        forbiddenDeps: ['react-device-detect'],
      }),
      path.join(REPO_ROOT, 'packages/ketcher-core/src/x.ts'),
    ).length,
    0,
  );
  assert.equal(
    lint(
      code,
      toRuleConfig('ui-deps-in-core', { forbiddenDeps: [] }),
      path.join(REPO_ROOT, 'packages/ketcher-core/src/x.ts'),
    ).length,
    0,
  );
});

test('every ALLOWED_DOMAIN_IMPORTS entry still suppresses a real violation and leaves none behind', () => {
  assert.ok(ALLOWED_DOMAIN_IMPORTS.length > 0, 'the allowlist is not empty');
  for (const entry of ALLOWED_DOMAIN_IMPORTS) {
    const filename = path.join(REPO_ROOT, entry.file);
    const expectedLines = statementLinesFor(filename, entry.imports);
    assert.ok(
      expectedLines.length >= entry.imports.length,
      `${entry.file} no longer contains the allowlisted imports: ${entry.imports.join(', ')}. Update ALLOWED_DOMAIN_IMPORTS.`,
    );
    const violations = lintRealFile(
      entry.file,
      toRuleConfig('domain-no-application-imports'),
    );
    assert.deepEqual(
      violations,
      [],
      `${entry.file} has uncovered invariant A4 violations at lines ${violations.join(', ')}. Extend ALLOWED_DOMAIN_IMPORTS or fix the code.`,
    );
  }
});

test('every ALLOWED_UI_IMPORTS entry still suppresses a real react-device-detect import', () => {
  assert.ok(ALLOWED_UI_IMPORTS.length > 0, 'the allowlist is not empty');
  for (const entry of ALLOWED_UI_IMPORTS) {
    const filename = path.join(REPO_ROOT, entry.file);
    const text = fs.readFileSync(filename, 'utf8');
    for (const specifier of entry.imports) {
      assert.ok(
        new RegExp(
          `from ['"]${specifier.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`,
        ).test(text),
        `${entry.file} no longer imports ${specifier}. Update ALLOWED_UI_IMPORTS.`,
      );
    }
    const violations = lintRealFile(
      entry.file,
      toRuleConfig('ui-imports-in-core'),
    );
    assert.deepEqual(
      violations,
      [],
      `${entry.file} has uncovered invariant A5 import violations at lines ${violations.join(', ')}.`,
    );
  }
});

test('every ALLOWED_MODEL_MUTATIONS entry still suppresses a real violation and leaves none behind', () => {
  assert.ok(ALLOWED_MODEL_MUTATIONS.length > 0, 'the allowlist is not empty');
  for (const entry of ALLOWED_MODEL_MUTATIONS) {
    const folder = path.join(REPO_ROOT, path.dirname(entry.file));
    const filename = path.join(folder, path.basename(entry.file));
    assert.ok(
      fs.existsSync(filename),
      `${entry.file} no longer exists. Remove its ALLOWED_MODEL_MUTATIONS entry.`,
    );
    const violations = lintRealFile(
      entry.file,
      toRuleConfig('renderer-no-model-mutations'),
    );
    assert.deepEqual(
      violations,
      [],
      `${entry.file} has uncovered invariant A1 violations at lines ${violations.join(', ')}. Extend ALLOWED_MODEL_MUTATIONS or fix the code.`,
    );
  }
});
