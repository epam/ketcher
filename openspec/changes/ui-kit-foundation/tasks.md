# UI Kit Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task by task. Steps use checkbox (`- [ ]`) syntax for tracking. Mark each box as soon as it is done, not in a batch at the end.

**Goal:** Lay the pixel-neutral foundation for unified styling: `--ketcher-*` tokens bridged into the legacy LESS and Emotion styles, plus a CSS browser floor. Then scaffold a Base UI-based UI kit inside `ketcher-react` with its safety net (lint boundaries, metrics, Storybook, story screenshots), move `Icon` into it, and migrate every MUI `Tooltip` to a kit `Tooltip` as the pilot.

**Architecture:**

- **Tokens.** One `tokens.css` declares `--ketcher-*` custom properties on `:root`. `ketcher-react`'s LESS variables and macromolecules' Emotion theme keys are re-pointed at it. Parity checks prove no rendered value changes.
- **Kit.** A self-contained `packages/ketcher-react/src/ui-kit/` folder, re-exported by `ketcher-react`. A `KitProvider` gives Base UI a portal container inside each editor root, plus the text direction.
- **Safety net.** Every step is guarded by unit tests, CSS/theme parity checks, zero-threshold story screenshots and the existing e2e suite with no baseline updates.

**Tech stack:** TypeScript 6, React 19 (peer range `^18.2 || ^19`), `@base-ui/react` 1.9, CSS Modules (`.module.css`) with PostCSS (`postcss-nesting` 14, `autoprefixer` 10), LESS 3 (legacy), Emotion 11 (legacy), rollup 2 with `rollup-plugin-postcss` 4, Jest 30 + React Testing Library, Node's `node:test`, Storybook 10.6 (`@storybook/react-vite`), Playwright 1.62 (Docker image `mcr.microsoft.com/playwright:v1.62.1-jammy`).

**Spec:** `openspec/changes/ui-kit-foundation/`. Read `proposal.md`, `design.md` (Decisions 1–15), `roadmap.md` and `specs/*/spec.md`. Tracking: #12193 (umbrella #12192). Branch: `12193-ui-kit-foundation`.

## Global Constraints

- **Pixel parity.** No section may change rendered output. The existing Playwright e2e suite must pass with **no baseline image updates**. CSS and theme parity checks must report zero differences, except vendor prefixes in Section 2.
- **CSS browser floor:** `chrome >= 111`, `edge >= 111`, `firefox >= 114`, `safari >= 16.4`, `ios_saf >= 16.4`. It applies to **CSS tooling only**. Never add a `.browserslistrc` or a `browserslist` field that Babel could pick up.
- **React peer range:** `^18.2.0 || ^19.0.0`. Kit components use `forwardRef` where they forward refs, because passing `ref` as a prop is React 19-only. They never touch `window` or `document` at module scope (SSR via `example-ssr`).
- **Kit boundary.** `src/ui-kit/**` may import only from `src/ui-kit/**`, `src/assets/**`, `@base-ui/react`, `react`, `react-dom` and `clsx`. Code outside the kit imports it only through `src/ui-kit` (ketcher-react) or `'ketcher-react'` (macromolecules).
- **Kit CSS:** plain `.module.css`; class and attribute selectors only; no element selectors, `:global`, `!important` or physical `left`/`right` properties; values come only from `--ketcher-*` tokens; no `@layer`.
- **Token placement:** tokens are declared on `:root`. Colours use two tiers (`--ketcher-palette-*` primitives, `--ketcher-color-*` semantics). Non-colour tokens are single-tier. When the two packages use the same name for different values, the macromolecules token takes the `-macro` suffix and the pair is listed in `DISCREPANCIES.md`.
- **No new MUI or Emotion imports** outside the allowlist (`scripts/ui-kit/legacyStylingAllowlist.mjs`) once Section 7 lands.
- **Unchanged:** all `data-testid`s, published package names and the host CSS import (`ketcher-react/dist/index.css`).
- **Translations:** the kit never imports i18n. Translated strings come from the call sites.
- **Commits:** never commit without the user's explicit approval (CLAUDE.md). Message format: `#12193 - <summary>`, ending with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. The pre-commit hook runs Prettier across every workspace, so back up unrelated uncommitted edits first.
- **E2E/Playwright:** before writing any Playwright test (Section 10), ask the user to proceed. Read `.memory-bank/testing.md` first, and draft an e2e test plan per `.memory-bank/e2e-test-plan-template.md`.

## Review Focus

1. **Tooltip `title` edge cases.** Covered in Section 13, steps 13.1–13.2.
   - `''`, `null`, `undefined` and `false` must render only the child. `0` must still show a tooltip.
   - The child gets `aria-label` exactly as MUI did: the string title, or `""` for an empty string. A child's own `aria-label` always wins.
2. **Nested or multiple `KitProvider`s.** Macromolecules' root sits inside the outer `ketcher-react` tree, and hosts can mount two editors. An overlay must render into the **nearest** provider's portal root. Covered in Section 6, step 6.2.
3. **RTL.** With an RTL language, kit overlays must inherit `dir` and lay out right-to-left, because they render inside the root. Covered in Section 6 step 6.2 and the `RightToLeft` story in Sections 12–13.
4. **LESS dropping a declaration silently.** A guard such as `iscolor()`, or a function, can drop a declaration without failing the build once its argument becomes `var()`. The full-stylesheet CSS parity check in Section 4 steps 4.6–4.7 catches this.
5. **Clipped or fullscreen overlays.** A tooltip anchored inside a scrolling or `overflow: hidden` panel (the monomer library), or inside fullscreen mode, must not be clipped. The positioner uses fixed positioning; covered in Section 13 step 13.1, plus the manual check in Section 14.

## Execution protocol

- Work directly on `12193-ui-kit-foundation`.
- For each section:
  1. Complete its subtasks.
  2. Run its **Code check** and **Visual check**.
  3. **STOP:** ask the user for approval to commit, then commit only that section's files.
  4. Report the commit hash and `git show --stat HEAD`.
  5. Wait for the user's go-ahead before starting the next section.
- If a check fails, fix the problem inside the section. Never update test snapshots or e2e baselines to make a check pass, unless the section explicitly says to.

---

## 0. Baselines (no code changes)

- [ ] 0.1 Make sure you are on the branch and dependencies are installed:
  ```bash
  git switch 12193-ui-kit-foundation && git status --short && npm ci
  ```
- [ ] 0.2 Create a local baseline folder that git ignores:
  ```bash
  mkdir -p .ui-kit-baseline && grep -qx '.ui-kit-baseline/' .git/info/exclude || echo '.ui-kit-baseline/' >> .git/info/exclude
  ```
- [ ] 0.3 Build the packages and keep the pre-change CSS:
  ```bash
  npm run build:packages
  cp packages/ketcher-react/dist/index.css .ui-kit-baseline/react-index.css
  cp packages/ketcher-macromolecules/dist/index.css .ui-kit-baseline/macro-index.css
  ```
- [ ] 0.4 Record the browserslist resolution that Babel sees today. There is no config, so this prints the `defaults` query:
  ```bash
  (cd packages/ketcher-react && npx browserslist) > .ui-kit-baseline/browserslist-react.txt
  (cd packages/ketcher-macromolecules && npx browserslist) > .ui-kit-baseline/browserslist-macro.txt
  ```
- [ ] 0.5 **Nothing to commit.** Continue to Section 1.

## 1. Token tooling: value normalisation and the CSS parity script

**Files:**

- Create: `scripts/ui-kit/tokenUtils.cjs`, `scripts/ui-kit/tokenUtils.d.cts`, `scripts/ui-kit/tokenUtils.test.mjs`
- Create: `scripts/ui-kit/cssParity.mjs`, `scripts/ui-kit/cssParity.test.mjs`
- Modify: root `package.json` (`scripts`)

**Interfaces produced:**

- `parseTokens(cssText: string): Map<string, string>`: every `--*` declaration, where the last one wins.
- `listSelectors(cssText: string): string[]`: the selector of every rule.
- `resolveVars(value: string, tokens: Map<string, string>): string`: recursive `var()` resolution. It handles fallbacks, leaves unknown variables as they are, and throws on cycles.
- `normalizeValue(value: string): string`: lowercases, strips quotes, collapses whitespace, turns every colour into `rgba(r,g,b,a)`, and evaluates `color-mix(in srgb, C P%, transparent)`.
- `collectDeclarations(cssText, tokens, { ignoreVendorPrefixes })`, `diffDeclarations(before, after)`, and a CLI: `node scripts/ui-kit/cssParity.mjs --before <a.css> --after <b.css> [--tokens <tokens.css>] [--ignore-vendor-prefixes]`. The CLI exits with 1 when there are differences.

- [ ] 1.1 Write the failing tests in `scripts/ui-kit/tokenUtils.test.mjs`:

  ```js
  import { test } from 'node:test';
  import assert from 'node:assert/strict';
  import { createRequire } from 'node:module';

  const require = createRequire(import.meta.url);
  const {
    parseTokens,
    listSelectors,
    resolveVars,
    normalizeValue,
  } = require('./tokenUtils.cjs');

  const TOKENS_CSS = `:root {
    --ketcher-palette-teal-30: #167782;
    --ketcher-color-primary: var(--ketcher-palette-teal-30);
    --ketcher-loop-a: var(--ketcher-loop-b);
    --ketcher-loop-b: var(--ketcher-loop-a);
  }`;

  test('parseTokens collects custom properties', () => {
    const tokens = parseTokens(TOKENS_CSS);
    assert.equal(tokens.get('--ketcher-palette-teal-30'), '#167782');
    assert.equal(
      tokens.get('--ketcher-color-primary'),
      'var(--ketcher-palette-teal-30)',
    );
  });

  test('listSelectors returns rule selectors', () => {
    assert.deepEqual(listSelectors(TOKENS_CSS), [':root']);
  });

  test('resolveVars resolves nested references and fallbacks', () => {
    const tokens = parseTokens(TOKENS_CSS);
    assert.equal(
      resolveVars('1px solid var(--ketcher-color-primary)', tokens),
      '1px solid #167782',
    );
    assert.equal(
      resolveVars('var(--missing, var(--ketcher-color-primary))', tokens),
      '#167782',
    );
    assert.equal(resolveVars('var(--missing)', tokens), 'var(--missing)');
    assert.throws(() => resolveVars('var(--ketcher-loop-a)', tokens), /cycle/);
  });

  test('normalizeValue makes equivalent colours equal', () => {
    const same = [
      '#FFF',
      '#ffffff',
      'white',
      'rgb(255 255 255)',
      'rgba(255, 255, 255, 1)',
    ];
    for (const value of same)
      assert.equal(normalizeValue(value), 'rgba(255,255,255,1)');
    assert.equal(
      normalizeValue('rgb(0 131 143 / 40%)'),
      normalizeValue('rgba(0,131,143,.4)'),
    );
    assert.equal(normalizeValue('transparent'), 'rgba(0,0,0,0)');
  });

  test('normalizeValue evaluates color-mix against transparent like LESS fade()', () => {
    assert.equal(
      normalizeValue('color-mix(in srgb, #5e5e5e 1%, transparent)'),
      normalizeValue('rgba(94, 94, 94, 0.01)'),
    );
  });

  test('normalizeValue ignores quotes and whitespace but not identifiers containing colour names', () => {
    assert.equal(
      normalizeValue(`Inter,  FreeSans, 'Droid Sans'`),
      normalizeValue('inter, freesans, "Droid Sans"'),
    );
    assert.equal(normalizeValue('white-space'), 'white-space');
  });
  ```

- [ ] 1.2 Run `node --test scripts/ui-kit/tokenUtils.test.mjs`. Expected: FAIL with `Cannot find module './tokenUtils.cjs'`.
- [ ] 1.3 Implement `scripts/ui-kit/tokenUtils.cjs`:

  ```js
  'use strict';
  /**
   * Value helpers for the UI-kit token migration
   * (openspec/changes/ui-kit-foundation, design.md Decisions 6-7).
   * Shared by scripts/ui-kit/cssParity.mjs and the token parity Jest tests.
   */
  const postcss = require('postcss');

  const NAMED_COLORS = {
    transparent: [0, 0, 0, 0],
    black: [0, 0, 0, 1],
    white: [255, 255, 255, 1],
    red: [255, 0, 0, 1],
    gray: [128, 128, 128, 1],
    grey: [128, 128, 128, 1],
  };
  const MAX_DEPTH = 20;
  const HEX_RE =
    /#([0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{4}|[0-9a-f]{3})(?![0-9a-z])/g;
  const RGB_RE = /rgba?\(([^()]*)\)/g;
  const NAMED_RE = new RegExp(
    `(?<![\\w-])(${Object.keys(NAMED_COLORS).join('|')})(?![\\w-])`,
    'g',
  );
  const COLOR_MIX_RE =
    /color-mix\(in srgb,(rgba\(\d+,\d+,\d+,[\d.]+\)) ([\d.]+)%,rgba\(0,0,0,0\)\)/g;

  function parseTokens(cssText) {
    const tokens = new Map();
    postcss.parse(cssText).walkDecls((decl) => {
      if (decl.prop.startsWith('--')) {
        tokens.set(decl.prop, decl.value.trim());
      }
    });
    return tokens;
  }

  function listSelectors(cssText) {
    const selectors = [];
    postcss.parse(cssText).walkRules((rule) => {
      selectors.push(rule.selector);
    });
    return selectors;
  }

  function findClosingParen(text, openIndex) {
    let depth = 0;
    for (let i = openIndex; i < text.length; i += 1) {
      if (text[i] === '(') depth += 1;
      if (text[i] === ')') {
        depth -= 1;
        if (depth === 0) return i;
      }
    }
    return -1;
  }

  function splitFallback(text) {
    let depth = 0;
    for (let i = 0; i < text.length; i += 1) {
      if (text[i] === '(') depth += 1;
      if (text[i] === ')') depth -= 1;
      if (text[i] === ',' && depth === 0) {
        return [text.slice(0, i), text.slice(i + 1)];
      }
    }
    return [text, undefined];
  }

  function resolveVars(value, tokens, depth = 0) {
    if (depth > MAX_DEPTH) {
      throw new Error(`Token reference cycle while resolving "${value}"`);
    }
    let result = '';
    let cursor = 0;
    for (;;) {
      const start = value.indexOf('var(', cursor);
      if (start === -1) return result + value.slice(cursor);
      const open = start + 'var'.length;
      const close = findClosingParen(value, open);
      if (close === -1) return result + value.slice(cursor);
      const [rawName, fallback] = splitFallback(value.slice(open + 1, close));
      const name = rawName.trim();
      let replacement = value.slice(start, close + 1);
      if (tokens.has(name)) {
        replacement = resolveVars(tokens.get(name), tokens, depth + 1);
      } else if (fallback !== undefined) {
        replacement = resolveVars(fallback.trim(), tokens, depth + 1);
      }
      result += value.slice(cursor, start) + replacement;
      cursor = close + 1;
    }
  }

  function formatRgba([r, g, b, a]) {
    const alpha = Math.round(a * 1000) / 1000;
    return `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${alpha})`;
  }

  function hexToRgba(hex) {
    let digits = hex.slice(1);
    if (digits.length <= 4) {
      digits = [...digits].map((digit) => digit + digit).join('');
    }
    const channel = (index) => parseInt(digits.slice(index, index + 2), 16);
    const alpha = digits.length === 8 ? channel(6) / 255 : 1;
    return [channel(0), channel(2), channel(4), alpha];
  }

  function parseAlpha(token) {
    if (token === undefined) return 1;
    return token.endsWith('%') ? parseFloat(token) / 100 : parseFloat(token);
  }

  // Accepts both "r, g, b[, a]" and "r g b[ / a]".
  function rgbArgsToRgba(args) {
    const [channels, slashAlpha] = args.split('/');
    const parts = channels.split(/[\s,]+/).filter(Boolean);
    const alpha = slashAlpha === undefined ? parts[3] : slashAlpha.trim();
    return [
      Number(parts[0]),
      Number(parts[1]),
      Number(parts[2]),
      parseAlpha(alpha),
    ];
  }

  function normalizeValue(value) {
    let normalized = value
      .toLowerCase()
      .replace(/["']/g, '')
      .replace(/\s+/g, ' ')
      .replace(/\s*,\s*/g, ',')
      .replace(/\(\s+/g, '(')
      .replace(/\s+\)/g, ')')
      .trim();
    normalized = normalized.replace(RGB_RE, (_, args) =>
      formatRgba(rgbArgsToRgba(args)),
    );
    normalized = normalized.replace(HEX_RE, (hex) =>
      formatRgba(hexToRgba(hex)),
    );
    normalized = normalized.replace(NAMED_RE, (name) =>
      formatRgba(NAMED_COLORS[name]),
    );
    return normalized.replace(COLOR_MIX_RE, (_, color, percent) => {
      const [r, g, b, a] = rgbArgsToRgba(color.slice('rgba('.length, -1));
      return formatRgba([r, g, b, (a * Number(percent)) / 100]);
    });
  }

  module.exports = { parseTokens, listSelectors, resolveVars, normalizeValue };
  ```

  And `scripts/ui-kit/tokenUtils.d.cts`:

  ```ts
  export declare function parseTokens(cssText: string): Map<string, string>;
  export declare function listSelectors(cssText: string): string[];
  export declare function resolveVars(
    value: string,
    tokens: Map<string, string>,
  ): string;
  export declare function normalizeValue(value: string): string;
  ```

- [ ] 1.4 Run `node --test scripts/ui-kit/tokenUtils.test.mjs`. Expected: PASS (6 tests).
- [ ] 1.5 Write the failing tests in `scripts/ui-kit/cssParity.test.mjs`:

  ```js
  import { test } from 'node:test';
  import assert from 'node:assert/strict';
  import { collectDeclarations, diffDeclarations } from './cssParity.mjs';

  const tokens = new Map([
    ['--ketcher-palette-grey-35', '#585858'],
    ['--ketcher-color-text-secondary', 'var(--ketcher-palette-grey-35)'],
  ]);
  const diff = (before, after, options) =>
    diffDeclarations(
      collectDeclarations(before, tokens, options),
      collectDeclarations(after, tokens, options),
    );

  test('identical stylesheets have no differences', () => {
    assert.deepEqual(diff('.a{color:red}', '.a{color:red}'), {
      removed: [],
      added: [],
    });
  });

  test('a token reference equals the literal it replaced', () => {
    const before = '.a{color:#585858;border:1px solid rgba(88,88,88,.7)}';
    const after =
      '.a{color:var(--ketcher-color-text-secondary);border:1px solid color-mix(in srgb, var(--ketcher-color-text-secondary) 70%, transparent)}';
    assert.deepEqual(diff(before, after), { removed: [], added: [] });
  });

  test('a dropped declaration is reported', () => {
    const result = diff('.a{color:red;box-shadow:none}', '.a{color:red}');
    assert.equal(result.removed.length, 1);
    assert.match(result.removed[0], /box-shadow: none/);
  });

  test('CSS-module hashes and custom property declarations are ignored', () => {
    assert.deepEqual(
      diff(
        '.Btn_root__a1B2c{color:red}',
        ':root{--x:1px}.Btn_root__Zz9_-{color:red}',
      ),
      { removed: [], added: [] },
    );
  });

  test('vendor prefixes can be ignored', () => {
    const before = '.a{-webkit-user-select:none;user-select:none}';
    const after = '.a{user-select:none}';
    assert.equal(diff(before, after).removed.length, 1);
    assert.deepEqual(diff(before, after, { ignoreVendorPrefixes: true }), {
      removed: [],
      added: [],
    });
  });
  ```

- [ ] 1.6 Run `node --test scripts/ui-kit/cssParity.test.mjs`. Expected: FAIL with `Cannot find module './cssParity.mjs'`.
- [ ] 1.7 Implement `scripts/ui-kit/cssParity.mjs`:

  ```js
  #!/usr/bin/env node
  /**
   * Compares two compiled stylesheets declaration by declaration, after resolving
   * --ketcher-* tokens and normalising values. Used to prove that token bridges are
   * pixel-neutral (openspec/changes/ui-kit-foundation, design.md Decision 7).
   */
  import { readFileSync } from 'node:fs';
  import { createRequire } from 'node:module';
  import { pathToFileURL } from 'node:url';
  import { parseArgs } from 'node:util';
  import postcss from 'postcss';

  const require = createRequire(import.meta.url);
  const {
    parseTokens,
    resolveVars,
    normalizeValue,
  } = require('./tokenUtils.cjs');

  const VENDOR_RE = /(^|[^a-z])-(webkit|moz|ms|o)-/;
  const MODULE_HASH_RE = /__[\w-]{5}(?![\w-])/g;

  export function collectDeclarations(
    cssText,
    tokens,
    { ignoreVendorPrefixes = false } = {},
  ) {
    const entries = [];
    postcss.parse(cssText).walkDecls((decl) => {
      if (decl.prop.startsWith('--')) return;
      const parent = decl.parent;
      const selector =
        parent.type === 'rule'
          ? parent.selector
              .replace(MODULE_HASH_RE, '__')
              .replace(/\s+/g, ' ')
              .trim()
          : `@${parent.name} ${parent.params}`;
      const atRules = [];
      for (
        let node = parent.parent;
        node && node.type !== 'root';
        node = node.parent
      ) {
        if (node.type === 'atrule')
          atRules.unshift(`@${node.name} ${node.params}`);
      }
      const isVendor = [decl.prop, decl.value, selector, ...atRules].some(
        (part) => VENDOR_RE.test(part),
      );
      if (ignoreVendorPrefixes && isVendor) return;
      const value = normalizeValue(resolveVars(decl.value, tokens));
      const important = decl.important ? ' !important' : '';
      entries.push(
        `${atRules.join(' ')} ${selector} { ${decl.prop.toLowerCase()}: ${value}${important} }`.trim(),
      );
    });
    return entries;
  }

  export function diffDeclarations(before, after) {
    const counts = new Map();
    for (const entry of before) counts.set(entry, (counts.get(entry) ?? 0) + 1);
    for (const entry of after) counts.set(entry, (counts.get(entry) ?? 0) - 1);
    const removed = [];
    const added = [];
    for (const [entry, count] of counts) {
      for (let i = 0; i < Math.abs(count); i += 1) {
        (count > 0 ? removed : added).push(entry);
      }
    }
    return { removed: removed.sort(), added: added.sort() };
  }

  function main() {
    const { values } = parseArgs({
      options: {
        before: { type: 'string' },
        after: { type: 'string' },
        tokens: { type: 'string' },
        'ignore-vendor-prefixes': { type: 'boolean', default: false },
      },
    });
    if (!values.before || !values.after) {
      console.error(
        'Usage: cssParity.mjs --before <a.css> --after <b.css> [--tokens <tokens.css>] [--ignore-vendor-prefixes]',
      );
      process.exit(2);
    }
    const tokens = values.tokens
      ? parseTokens(readFileSync(values.tokens, 'utf8'))
      : new Map();
    const options = { ignoreVendorPrefixes: values['ignore-vendor-prefixes'] };
    const { removed, added } = diffDeclarations(
      collectDeclarations(readFileSync(values.before, 'utf8'), tokens, options),
      collectDeclarations(readFileSync(values.after, 'utf8'), tokens, options),
    );
    for (const entry of removed) console.log(`- ${entry}`);
    for (const entry of added) console.log(`+ ${entry}`);
    console.log(`${removed.length} removed, ${added.length} added`);
    process.exit(removed.length + added.length === 0 ? 0 : 1);
  }

  if (
    process.argv[1] &&
    import.meta.url === pathToFileURL(process.argv[1]).href
  ) {
    main();
  }
  ```

- [ ] 1.8 Run `node --test scripts/ui-kit/cssParity.test.mjs`. Expected: PASS (5 tests).
- [ ] 1.9 Add a root script to `package.json` `scripts`, after `"check:autotests"`:
  ```json
  "test:ui-kit-scripts": "node --test \"scripts/ui-kit/**/*.test.mjs\"",
  ```
  Run `npm run test:ui-kit-scripts`. Expected: 11 passing tests.
- [ ] 1.10 **Code check:**
  - `npm run test:ui-kit-scripts` passes.
  - `npx eslint scripts/ui-kit` is clean.
  - `npx prettier --check "scripts/ui-kit/**/*.{mjs,cjs,cts}"` is clean.
- [ ] 1.11 **Visual check:** not applicable, because these are tools only.
- [ ] 1.12 **STOP:** ask to commit `scripts/ui-kit/*` and `package.json`, using the message `#12193 - Add token parity tooling`.

## 2. Shared PostCSS config and CSS browser floor

**Files:**

- Create: `postcss.config.cjs` (repo root), `scripts/ui-kit/cssBrowserFloor.cjs`, `scripts/ui-kit/postcssConfig.test.mjs`
- Modify: root `package.json` (`devDependencies`), `packages/ketcher-react/rollup.config.mjs`, `packages/ketcher-macromolecules/rollup.config.mjs`

**Why:**

- `rollup-plugin-postcss` and Vite both find the root config by searching up from each file. `example-ssr` (Next) also discovers it, and Next only accepts the object/string plugin form, so the config must use that form.
- The config must **not** carry browser targets in a place Babel reads.

- [ ] 2.1 Write the failing test `scripts/ui-kit/postcssConfig.test.mjs`:

  ```js
  import { test } from 'node:test';
  import assert from 'node:assert/strict';
  import { dirname, resolve } from 'node:path';
  import { fileURLToPath } from 'node:url';
  import postcss from 'postcss';
  import postcssrc from 'postcss-load-config';

  const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

  test('shared config flattens nesting and keeps color-mix', async () => {
    const { plugins } = await postcssrc({}, repoRoot);
    const { css } = await postcss(plugins).process(
      '.a { color: red; &[data-open] { color: color-mix(in srgb, var(--x) 20%, transparent); } }',
      { from: undefined },
    );
    assert.doesNotMatch(css, /&/);
    assert.match(css, /\.a\[data-open\]\s*\{/);
    assert.match(css, /color-mix\(in srgb, var\(--x\) 20%, transparent\)/);
  });

  test('autoprefixer targets the CSS browser floor', async () => {
    const { plugins } = await postcssrc({}, repoRoot);
    const autoprefixer = plugins.find(
      (plugin) => plugin.postcssPlugin === 'autoprefixer',
    );
    const info = autoprefixer.info();
    assert.match(info, /safari 16\.4/);
    assert.match(info, /chrome 111/);
    assert.doesNotMatch(info, /\bie \d/);
  });
  ```

- [ ] 2.2 Run `node --test scripts/ui-kit/postcssConfig.test.mjs`. Expected: FAIL, because no PostCSS config is found (`plugins` is empty).
- [ ] 2.3 Install the tools at the root (run from the repo root, without `-w`): `npm install -D postcss-nesting@^14.0.3 autoprefixer@^10.5.4`. Then create `scripts/ui-kit/cssBrowserFloor.cjs`:

  ```js
  'use strict';
  /**
   * CSS-only browser floor, aligned with issue #11997
   * (openspec/changes/ui-kit-foundation, design.md Decision 14).
   * Passed explicitly to CSS tooling. Do NOT move it into .browserslistrc or a
   * package.json "browserslist" field: Babel would pick it up and change the
   * published JS syntax level.
   */
  module.exports = [
    'chrome >= 111',
    'edge >= 111',
    'firefox >= 114',
    'safari >= 16.4',
    'ios_saf >= 16.4',
  ];
  ```

  and `postcss.config.cjs`:

  ```js
  /**
   * Shared PostCSS config for every package (rollup builds, the example Vite dev
   * server, Storybook). Object form so Next.js (example-ssr) accepts it too.
   */
  const CSS_BROWSER_FLOOR = require('./scripts/ui-kit/cssBrowserFloor.cjs');

  module.exports = {
    plugins: {
      'postcss-nesting': {},
      autoprefixer: {
        grid: 'autoplace',
        overrideBrowserslist: CSS_BROWSER_FLOOR,
      },
    },
  };
  ```

- [ ] 2.4 Run `node --test scripts/ui-kit/postcssConfig.test.mjs`. Expected: PASS.
- [ ] 2.5 Remove the inline autoprefixer from both rollup configs, so it doesn't run twice. In `packages/ketcher-react/rollup.config.mjs` and `packages/ketcher-macromolecules/rollup.config.mjs`:
  - delete the line `plugins: [autoprefixer({ grid: 'autoplace' })],` inside `postcss({...})`;
  - delete the now-unused `import autoprefixer from 'autoprefixer';`.

  Leave everything else in `postcss({...})` as it is.

- [ ] 2.6 Rebuild and compare against the baseline:
  ```bash
  npm run build:packages
  node scripts/ui-kit/cssParity.mjs --before .ui-kit-baseline/react-index.css --after packages/ketcher-react/dist/index.css --ignore-vendor-prefixes
  node scripts/ui-kit/cssParity.mjs --before .ui-kit-baseline/macro-index.css --after packages/ketcher-macromolecules/dist/index.css --ignore-vendor-prefixes
  ```
  Expected: `0 removed, 0 added` for both. Then run them again **without** `--ignore-vendor-prefixes` and paste the summary line into the section report. Differences there may only be vendor-prefixed lines.
- [ ] 2.7 Prove Babel's targets are unchanged:
  ```bash
  diff <(cd packages/ketcher-react && npx browserslist) .ui-kit-baseline/browserslist-react.txt
  diff <(cd packages/ketcher-macromolecules && npx browserslist) .ui-kit-baseline/browserslist-macro.txt
  ```
  Expected: no output from either.
- [ ] 2.8 **Code check:**
  - `npm run test:ui-kit-scripts` passes.
  - `npm run test -w ketcher-react` and `npm run test -w ketcher-macromolecules` pass.
  - `npm run build -w example-ssr` succeeds. This proves Next accepts the shared config.
- [ ] 2.9 **Visual check:** run `npm run serve:standalone` from `example/`, open the app, and confirm that the molecules and macromolecules editors look unchanged. Check toolbars, an open dialog, and the monomer library.
- [ ] 2.10 **STOP:** ask to commit, using the message `#12193 - Share PostCSS config with a CSS-only browser floor`.

## 3. Tokens, kit entry point and discrepancy list

**Files:**

- Create:
  - `packages/ketcher-react/src/ui-kit/tokens/tokens.css`
  - `packages/ketcher-react/src/ui-kit/tokens/DISCREPANCIES.md`
  - `packages/ketcher-react/src/ui-kit/tokens/tokens.test.ts`
  - `packages/ketcher-react/src/ui-kit/index.ts`
- Modify:
  - `packages/ketcher-react/src/index.tsx`
  - `packages/ketcher-react/src/script/ui/views/components/ContextMenu/ContextMenu.module.less:66`

**Interfaces produced:** the `--ketcher-*` token names below. Sections 4, 5, 13 and 14 use these exact names.

- [ ] 3.1 Write the failing test `packages/ketcher-react/src/ui-kit/tokens/tokens.test.ts`:

  ```ts
  /**
   * @jest-environment node
   */
  import fs from 'node:fs';
  import path from 'node:path';

  // Plain CommonJS helper shared with scripts/ui-kit/cssParity.mjs.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const tokenUtils = require('../../../../../scripts/ui-kit/tokenUtils.cjs');

  const css = fs.readFileSync(path.join(__dirname, 'tokens.css'), 'utf8');
  const tokens: Map<string, string> = tokenUtils.parseTokens(css);

  describe('tokens.css', () => {
    it('declares tokens on :root only', () => {
      expect(tokenUtils.listSelectors(css)).toEqual([':root']);
    });

    it('resolves every reference', () => {
      for (const value of tokens.values()) {
        expect(tokenUtils.resolveVars(value, tokens)).not.toContain('var(');
      }
    });

    it('keeps colour literals in the palette tier only', () => {
      for (const [name, value] of tokens) {
        if (name.startsWith('--ketcher-color-')) {
          expect(value).toMatch(
            /^(var\(--ketcher-palette-[a-z0-9-]+\)|transparent)$/,
          );
        }
        if (name.startsWith('--ketcher-palette-')) {
          expect(value).not.toContain('var(');
        }
      }
    });
  });
  ```

- [ ] 3.2 Run `npx jest src/ui-kit/tokens` in `packages/ketcher-react`. Expected: FAIL with `ENOENT … tokens.css`.
- [ ] 3.3 Create `packages/ketcher-react/src/ui-kit/tokens/tokens.css`:

  ```css
  /*
   * Ketcher design tokens: the single source of truth for UI-chrome values.
   * Seeded from ketcher-react style/variables.less and ketcher-macromolecules
   * theming/defaultTheme so nothing renders differently (pixel parity).
   * Colours: --ketcher-palette-* primitives, --ketcher-color-* semantics.
   * Names ending in -macro hold the macromolecules value where both packages
   * used the same name for different values; see DISCREPANCIES.md.
   * Hosts may override any token on an ancestor of the editor.
   */
  :root {
    /* Palette */
    --ketcher-palette-white: #fff;
    --ketcher-palette-black: #000;
    --ketcher-palette-grey-20: #333;
    --ketcher-palette-grey-32: #525252;
    --ketcher-palette-grey-35: #585858;
    --ketcher-palette-grey-44: #717171;
    --ketcher-palette-grey-48: #7a7a7a;
    --ketcher-palette-grey-49: #7c7c7f;
    --ketcher-palette-grey-68: #aeaeae;
    --ketcher-palette-grey-77: #c4c4c4;
    --ketcher-palette-grey-78: #c8c8c8;
    --ketcher-palette-grey-80: #ccc;
    --ketcher-palette-grey-87: #ddd;
    --ketcher-palette-grey-95: #f2f2f2;
    --ketcher-palette-grey-96: #f5f5f5;
    --ketcher-palette-grey-99: #fcfcfc;
    --ketcher-palette-slate-41: #5b6077;
    --ketcher-palette-slate-69: #a5afb9;
    --ketcher-palette-slate-83: #cad3dd;
    --ketcher-palette-slate-90: #e1e5ea;
    --ketcher-palette-slate-95: #eff2f5;
    --ketcher-palette-slate-96: #f5f6f7;
    --ketcher-palette-sage-81: #cad3d0;
    --ketcher-palette-lavender-77: #b4b9d6;
    --ketcher-palette-lavender-85: #d1d5e3;
    --ketcher-palette-cyan-96: #f3f8f9;
    --ketcher-palette-cyan-99: #f8feff;
    --ketcher-palette-teal-19: #005662;
    --ketcher-palette-teal-23: #006775;
    --ketcher-palette-teal-28: #00838f;
    --ketcher-palette-teal-30: #167782;
    --ketcher-palette-teal-34: #188794;
    --ketcher-palette-teal-37: #2e858f;
    --ketcher-palette-teal-51: #43b5c0;
    --ketcher-palette-teal-53: #4fb3bf;
    --ketcher-palette-teal-73: #99d7dc;
    --ketcher-palette-red-49: #f40724;
    --ketcher-palette-red-65: #ff4a4a;
    --ketcher-palette-teal-28-a40: rgb(0 131 143 / 40%);
    --ketcher-palette-grey-32-a40: rgb(82 82 82 / 40%);
    --ketcher-palette-grey-37-a80: rgb(94 94 94 / 80%);
    --ketcher-palette-grey-38-a92: rgb(97 97 97 / 92%);
    --ketcher-palette-grey-44-a40: rgb(113 113 113 / 40%);
    --ketcher-palette-lavender-14-a28: rgb(26 26 44 / 28%);
    --ketcher-palette-lavender-23-a22: rgb(51 52 66 / 22%);
    --ketcher-palette-lavender-46-a15: rgb(103 104 132 / 15%);
    --ketcher-palette-lavender-46-a18: rgb(103 104 132 / 18%);
    --ketcher-palette-lavender-46-a25: rgb(103 104 132 / 25%);
    --ketcher-palette-navy-10-a10: rgb(1 1 50 / 10%);
    --ketcher-palette-white-a30: rgb(255 255 255 / 30%);
    --ketcher-palette-mist-96-a60: rgb(243 245 247 / 60%);
    --ketcher-palette-black-a87: rgb(0 0 0 / 87%);

    /* Typography */
    --ketcher-font-family-inter:
      Inter, FreeSans, Arimo, 'Droid Sans', Helvetica, 'Helvetica Neue', Arial,
      sans-serif;
    --ketcher-font-family-montserrat: Montserrat, sans-serif;
    --ketcher-font-family-roboto:
      Roboto, FreeSans, Arimo, 'Droid Sans', Helvetica, 'Helvetica Neue', Arial,
      sans-serif;
    --ketcher-font-family-tooltip: Roboto, Helvetica, Arial, sans-serif;
    --ketcher-font-size-header: 14px;
    --ketcher-font-size-regular: 12px;
    --ketcher-font-size-input: 14px;
    --ketcher-font-size-medium: 14px;
    --ketcher-font-size-small: 8px;
    --ketcher-font-size-small-macro: 10px;
    --ketcher-font-size-xsmall: 6px;
    --ketcher-font-size-tooltip: 0.6875rem;
    --ketcher-font-size-tooltip-light: 11px;
    --ketcher-line-height-header: 12px;
    --ketcher-line-height-regular: 14px;
    --ketcher-line-height-input: 16px;
    --ketcher-font-weight-medium: 500;
    --ketcher-font-weight-tooltip: 500;

    /* Shape, elevation, layering */
    --ketcher-radius-tooltip: 4px;
    --ketcher-shadow-tooltip-light: 0 1px 5px 0 var(--ketcher-palette-grey-80);
    --ketcher-z-index-tooltip: 1500;

    /* Brand and base */
    --ketcher-color-primary: var(--ketcher-palette-teal-30);
    --ketcher-color-primary-green: var(--ketcher-palette-teal-30);
    --ketcher-color-primary-hover: var(--ketcher-palette-teal-23);
    --ketcher-color-primary-light: var(--ketcher-palette-slate-95);
    --ketcher-color-secondary-red: var(--ketcher-palette-red-49);
    --ketcher-color-grey-3: var(--ketcher-palette-slate-90);
    --ketcher-color-grey-4: var(--ketcher-palette-slate-83);
    --ketcher-color-grey-5: var(--ketcher-palette-lavender-77);
    --ketcher-color-grey-6: var(--ketcher-palette-grey-35);
    --ketcher-color-grey-7: var(--ketcher-palette-cyan-96);
    --ketcher-color-error: var(--ketcher-palette-red-65);
    --ketcher-color-divider: var(--ketcher-palette-grey-68);
    --ketcher-color-spinner: var(--ketcher-palette-teal-19);

    /* Backgrounds */
    --ketcher-color-background-primary: var(--ketcher-palette-white);
    --ketcher-color-background-secondary: var(--ketcher-palette-cyan-99);
    --ketcher-color-background-canvas: var(--ketcher-palette-grey-95);
    --ketcher-color-background-canvas-macro: var(--ketcher-palette-grey-96);
    --ketcher-color-background-canvas-light: var(--ketcher-palette-grey-99);
    --ketcher-color-background-panel: var(--ketcher-palette-slate-96);
    --ketcher-color-background-overlay: var(--ketcher-palette-grey-37-a80);

    /* Buttons */
    --ketcher-color-button-primary: var(--ketcher-palette-teal-19);
    --ketcher-color-button-primary-active: var(--ketcher-palette-teal-30);
    --ketcher-color-button-primary-hover: var(--ketcher-palette-teal-28);
    --ketcher-color-button-primary-clicked: var(--ketcher-palette-teal-53);
    --ketcher-color-button-primary-disabled: var(--ketcher-palette-teal-28-a40);
    --ketcher-color-button-primary-disabled-macro: var(
      --ketcher-palette-grey-44-a40
    );
    --ketcher-color-spec-button-primary-hover: var(--ketcher-palette-teal-34);
    --ketcher-color-spec-button-hover: var(--ketcher-palette-grey-35);
    --ketcher-color-button-secondary: var(--ketcher-palette-grey-44);
    --ketcher-color-button-secondary-active: var(--ketcher-palette-grey-35);
    --ketcher-color-button-secondary-hover: var(--ketcher-palette-grey-20);
    --ketcher-color-button-secondary-clicked: var(--ketcher-palette-grey-68);
    --ketcher-color-button-secondary-disabled: var(
      --ketcher-palette-grey-44-a40
    );
    --ketcher-color-button-atom: var(--ketcher-palette-grey-95);
    --ketcher-color-button-atom-hover: var(--ketcher-palette-lavender-85);
    --ketcher-color-button-atom-clicked: var(--ketcher-palette-teal-28);
    --ketcher-color-button-group-active: var(--ketcher-palette-teal-30);
    --ketcher-color-button-group-hover: var(--ketcher-palette-teal-37);
    --ketcher-color-button-transparent-active: transparent;
    --ketcher-color-button-text-primary: var(--ketcher-palette-white);
    --ketcher-color-button-text-secondary: var(--ketcher-palette-teal-19);
    --ketcher-color-button-text-disabled: var(--ketcher-palette-grey-48);

    /* Text */
    --ketcher-color-text-primary: var(--ketcher-palette-grey-20);
    --ketcher-color-text-secondary: var(--ketcher-palette-grey-35);
    --ketcher-color-text-secondary-macro: var(--ketcher-palette-teal-30);
    --ketcher-color-text-light: var(--ketcher-palette-white);
    --ketcher-color-text-light-macro: var(--ketcher-palette-grey-35);
    --ketcher-color-text-legend: var(--ketcher-palette-grey-68);
    --ketcher-color-text-black: var(--ketcher-palette-black);
    --ketcher-color-text-dark: var(--ketcher-palette-black);
    --ketcher-color-text-error: var(--ketcher-palette-red-65);
    --ketcher-color-text-lightgrey: var(--ketcher-palette-grey-49);

    /* Icons */
    --ketcher-color-icon-active: var(--ketcher-palette-grey-32);
    --ketcher-color-icon-active-menu: var(--ketcher-palette-teal-19);
    --ketcher-color-icon-hover: var(--ketcher-palette-teal-19);
    --ketcher-color-icon-clicked: var(--ketcher-palette-white);
    --ketcher-color-icon-disabled: var(--ketcher-palette-grey-32-a40);
    --ketcher-color-icon-grey: var(--ketcher-palette-lavender-77);

    /* Tabs, scroll, borders */
    --ketcher-color-tab-active: var(--ketcher-palette-teal-19);
    --ketcher-color-tab-active-macro: var(--ketcher-palette-slate-90);
    --ketcher-color-tab-regular: var(--ketcher-palette-white);
    --ketcher-color-tab-hover: var(--ketcher-palette-teal-28);
    --ketcher-color-tab-content: var(--ketcher-palette-slate-95);
    --ketcher-color-scroll: var(--ketcher-palette-slate-69);
    --ketcher-color-scroll-regular: var(--ketcher-palette-grey-44);
    --ketcher-color-scroll-inactive: var(--ketcher-palette-grey-87);
    --ketcher-color-border-main: var(--ketcher-palette-teal-19);
    --ketcher-color-border-hover: var(--ketcher-palette-grey-87);
    --ketcher-color-border-input: var(--ketcher-palette-slate-83);
    --ketcher-color-border-primary: var(--ketcher-palette-slate-83);
    --ketcher-color-border-secondary: var(--ketcher-palette-grey-49);

    /* Shadows */
    --ketcher-color-dropcontainer-shadow: var(
      --ketcher-palette-lavender-46-a18
    );
    --ketcher-color-dropcontainer-hover-shadow: var(
      --ketcher-palette-lavender-23-a22
    );
    --ketcher-color-dropcontainer-active-shadow: var(
      --ketcher-palette-lavender-14-a28
    );
    --ketcher-color-open-window-shadow: var(--ketcher-palette-lavender-46-a25);
    --ketcher-color-accordion-shadow: var(--ketcher-palette-navy-10-a10);

    /* Dropdown, select, slider */
    --ketcher-color-dropdown-primary: var(--ketcher-palette-grey-20);
    --ketcher-color-dropdown-secondary: var(--ketcher-palette-white);
    --ketcher-color-dropdown-hover: var(--ketcher-palette-grey-87);
    --ketcher-color-dropdown-disabled: var(--ketcher-palette-grey-48);
    --ketcher-color-select-border: var(--ketcher-palette-sage-81);
    --ketcher-color-select-text: var(--ketcher-palette-slate-41);
    --ketcher-color-select-box-shadow: var(--ketcher-palette-lavender-46-a15);
    --ketcher-color-select-background: var(--ketcher-palette-mist-96-a60);
    --ketcher-color-slider-background: var(--ketcher-palette-grey-77);
    --ketcher-color-slider-body-background: var(--ketcher-palette-white-a30);

    /* Inputs */
    --ketcher-color-input-hover: var(--ketcher-palette-teal-51);
    --ketcher-color-input-text-default: var(--ketcher-palette-grey-35);
    --ketcher-color-input-text-active: var(--ketcher-palette-grey-20);
    --ketcher-color-input-text-disabled: var(--ketcher-palette-grey-35);
    --ketcher-color-input-text-error: var(--ketcher-palette-red-65);
    --ketcher-color-input-background-primary: var(--ketcher-palette-white);
    --ketcher-color-input-background-default: var(--ketcher-palette-slate-95);
    --ketcher-color-input-background-hover: var(--ketcher-palette-grey-87);
    --ketcher-color-input-background-disabled: var(--ketcher-palette-slate-95);
    --ketcher-color-input-border-regular: var(--ketcher-palette-slate-83);
    --ketcher-color-input-border-active: var(--ketcher-palette-white);
    --ketcher-color-input-border-hover: var(--ketcher-palette-teal-51);
    --ketcher-color-input-border-focus: var(--ketcher-palette-slate-95);
    --ketcher-color-input-border-error: var(--ketcher-palette-red-65);

    /* Links, tooltips, misc */
    --ketcher-color-link-active: var(--ketcher-palette-teal-28);
    --ketcher-color-link-hover: var(--ketcher-palette-teal-19);
    --ketcher-color-tooltip-background: var(--ketcher-palette-white);
    --ketcher-color-tooltip-text: var(--ketcher-palette-grey-20);
    --ketcher-color-tooltip-dark-background: var(--ketcher-palette-grey-38-a92);
    --ketcher-color-tooltip-dark-text: var(--ketcher-palette-white);
    --ketcher-color-tooltip-light-background: var(--ketcher-palette-white);
    --ketcher-color-tooltip-light-text: var(--ketcher-palette-black-a87);
    --ketcher-color-monomer-default: var(--ketcher-palette-grey-78);
    --ketcher-color-edit-mode-sequence-in-rna-builder: var(
      --ketcher-palette-teal-73
    );
  }
  ```

  If stylelint asks for a different notation, for example colour-function or hex-length rules, change the notation only. The parity tests in Sections 4–5 compare normalised values.

- [ ] 3.4 Create `packages/ketcher-react/src/ui-kit/tokens/DISCREPANCIES.md`:

  ```markdown
  # Token discrepancies

  Values that `ketcher-react` and `ketcher-macromolecules` define differently for the
  same role. Both are kept for pixel parity; resolve them in the visual-refresh
  initiative (see `openspec/changes/ui-kit-foundation/roadmap.md`), ideally
  against the Figma file noted in `design.md` Open Questions.

  | Role                    | ketcher-react (LESS)                                                       | ketcher-macromolecules (theme)                                                                  |
  | ----------------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
  | Canvas background       | `--ketcher-color-background-canvas` `#f2f2f2` (`@color-background-canvas`) | `--ketcher-color-background-canvas-macro` `#f5f5f5` (`color.background.canvas`)                 |
  | Secondary text          | `--ketcher-color-text-secondary` `#585858` (`@color-text-secondary`)       | `--ketcher-color-text-secondary-macro` `#167782` (`color.text.secondary`)                       |
  | Light text              | `--ketcher-color-text-light` `#fff` (`@color-text-light`)                  | `--ketcher-color-text-light-macro` `#585858` (`color.text.light`)                               |
  | Active tab              | `--ketcher-color-tab-active` `#005662` (`@color-tab-active`)               | `--ketcher-color-tab-active-macro` `#e1e5ea` (`color.tab.active`)                               |
  | Disabled primary button | `--ketcher-color-button-primary-disabled` `rgb(0 131 143 / 40%)`           | `--ketcher-color-button-primary-disabled-macro` `rgb(113 113 113 / 40%)`                        |
  | Small font size         | `--ketcher-font-size-small` `8px` (`@font-size-small`)                     | `--ketcher-font-size-small-macro` `10px` (`font.size.small`)                                    |
  | Tooltip                 | MUI default dark tooltip (`--ketcher-color-tooltip-dark-*`)                | `--ketcher-color-tooltip-background`/`-text` (white/#333), used by legacy macromolecules styles |
  ```

- [ ] 3.5 Run `npx jest src/ui-kit/tokens` in `packages/ketcher-react`. Expected: PASS (3 tests).
- [ ] 3.6 Neutralise the dormant reference. `var(--ketcher-font-size-regular)` is undefined today, so it resolves to `inherit`; defining the token would change that. In `packages/ketcher-react/src/script/ui/views/components/ContextMenu/ContextMenu.module.less` line 66, change `line-height: var(--ketcher-font-size-regular);` to `line-height: inherit;`.
- [ ] 3.7 Create the kit entry `packages/ketcher-react/src/ui-kit/index.ts`:

  ```ts
  /**
   * Ketcher UI kit: the only public entry point (openspec/changes/ui-kit-foundation).
   * Importing it also loads the --ketcher-* design tokens.
   */
  import './tokens/tokens.css';

  export {};
  ```

  Then add `export * from './ui-kit';` to `packages/ketcher-react/src/index.tsx`, directly after `export * from './components';`.

- [ ] 3.8 Rebuild and check that the tokens reach the published stylesheet, and that nothing else changed:
  ```bash
  npm run build:packages
  grep -c -- '--ketcher-color-primary:' packages/ketcher-react/dist/index.css   # expected: 1
  node scripts/ui-kit/cssParity.mjs --before .ui-kit-baseline/react-index.css --after packages/ketcher-react/dist/index.css --tokens packages/ketcher-react/src/ui-kit/tokens/tokens.css --ignore-vendor-prefixes
  ```
  Expected: `0 removed, 0 added`. The ContextMenu change shows up as `line-height: inherit` against the baseline's `line-height: var(--ketcher-font-size-regular)`, which is unresolvable. That one pair is the only accepted difference; note it in the report.
- [ ] 3.9 **Code check:** `npm run test -w ketcher-react` passes. That covers prettier, stylelint, eslint, types, circular dependencies and unit tests.
- [ ] 3.10 **Visual check:** in the example app, open a context menu (right-click an atom) and confirm the line height looks unchanged.
- [ ] 3.11 **STOP:** ask to commit, using the message `#12193 - Add --ketcher-* design tokens`.

## 4. LESS bridge

**Files:**

- Create: `packages/ketcher-react/src/ui-kit/tokens/lessBridge.parity.test.ts`
- Modify:
  - `packages/ketcher-react/src/style/variables.less`
  - `packages/ketcher-react/src/style/mixins.less`
  - the LESS files that call `fade()`:
    - `src/script/ui/dialog/template/template-lib.module.less`
    - `src/script/ui/dialog/template/TemplateTable.module.less`
    - `src/script/ui/views/components/MonomerCreationWizard/RnaPresetTabs.module.less`
    - `src/script/ui/views/modal/Modal.module.less`
    - `src/script/ui/views/modal/components/ExtendedTable/components/GenericGroups/GenGroup.module.less`

- [ ] 4.1 Write the parity snapshot test **before** touching any LESS. Create `packages/ketcher-react/src/ui-kit/tokens/lessBridge.parity.test.ts`:

  ```ts
  /**
   * @jest-environment node
   */
  import fs from 'node:fs';
  import path from 'node:path';

  /* eslint-disable @typescript-eslint/no-require-imports */
  const less = require('less');
  const postcss = require('postcss');
  const tokenUtils = require('../../../../../scripts/ui-kit/tokenUtils.cjs');
  /* eslint-enable @typescript-eslint/no-require-imports */

  const VARIABLES_LESS = path.resolve(__dirname, '../../style/variables.less');
  const tokens: Map<string, string> = tokenUtils.parseTokens(
    fs.readFileSync(path.join(__dirname, 'tokens.css'), 'utf8'),
  );

  // Every variable bridged to a token, plus the values derived from them.
  const PROBED_VARIABLES = [
    'font-size-header',
    'line-height-header',
    'font-size-regular',
    'line-height-regular',
    'font-size-input',
    'line-height-input',
    'font-size-small',
    'font-weight-medium',
    'Inter',
    'color-primary-light',
    'color-primary-green',
    'color-grey-3',
    'color-grey-4',
    'color-grey-5',
    'color-grey-6',
    'color-grey-7',
    'color-secondary-red',
    'color-primary',
    'color-primary-hover',
    'color-background-primary',
    'color-background-canvas',
    'color-background-canvas-light',
    'color-background-secondary',
    'color-background-panel',
    'color-button-primary',
    'color-button-primary-hover',
    'color-spec-button-primary-hover',
    'color-spec-button-hover',
    'color-button-primary-clicked',
    'color-button-primary-disabled',
    'color-button-secondary',
    'color-button-secondary-hover',
    'color-button-secondary-disabled',
    'color-button-secondary-clicked',
    'color-button-atom',
    'color-button-atom-hover',
    'color-button-atom-clicked',
    'color-text-primary',
    'color-text-secondary',
    'color-text-light',
    'color-text-legend',
    'color-text-black',
    'color-icon-active',
    'color-icon-disabled',
    'color-icon-hover',
    'color-tab-active',
    'color-divider',
    'color-scroll',
    'color-scroll-inactive',
    'color-border-hover',
    'color-border-main',
    'color-border-input',
    'color-dropcontainer-shadow',
    'color-dropcontainer-hover-shadow',
    'color-dropcontainer-active-shadow',
    'color-open-window-shadow',
    'color-accordion-shadow',
    'color-dropdown-hover',
    'color-slider-background',
    'color-slider-body-background',
    'color-input-hover',
    'color-select-border',
    'color-select-text',
    'color-select-box-shadow',
    'color-select-background',
    'shadow-dropcontainer',
    'shadow-dropcontainer-hover',
    'shadow-dropcontainer-active',
    'color-input',
    'color-input-hover-svg',
    'color-input-default',
    'color-input-disabled',
    'color-input-checked-disabled',
  ];

  it('bridged LESS variables resolve to their pre-token values', async () => {
    const probe = [
      `@import (reference) '${VARIABLES_LESS}';`,
      '.probe {',
      ...PROBED_VARIABLES.map((name) => `  x-${name}: @${name};`),
      '}',
    ].join('\n');
    const { css } = await less.render(probe, { filename: VARIABLES_LESS });
    const values: Record<string, string> = {};
    postcss.parse(css).walkDecls((decl: { prop: string; value: string }) => {
      values[decl.prop.slice(2)] = tokenUtils.normalizeValue(
        tokenUtils.resolveVars(decl.value, tokens),
      );
    });
    expect(Object.keys(values)).toHaveLength(PROBED_VARIABLES.length);
    expect(values).toMatchSnapshot();
  });
  ```

- [ ] 4.2 Run `npx jest src/ui-kit/tokens/lessBridge` in `packages/ketcher-react`. Expected: PASS, with `1 snapshot written`. Open the `.snap` file and check that it holds literal values such as `rgba(22,119,130,1)` for `color-primary`. **From now on, never run this test with `-u`.**
- [ ] 4.3 Make the guarded mixin and the `fade()` calls work with `var()`. In `src/style/mixins.less`, replace lines 92–100 (both `.highlight-shadow` definitions that take a colour) with:

  ```less
  .highlight-shadow(inset, @color: @active-color) {
    box-shadow:
      0 -1px 6px color-mix(in srgb, @color 5%, transparent) inset,
      0 1px 3px @color inset;
  }

  // default() instead of iscolor(): iscolor() is false for var(--ketcher-*) tokens,
  // which would silently drop the shadow.
  .highlight-shadow(@color: @active-color) when (default()) {
    box-shadow: inset 0 0 1px 1px color-mix(in srgb, @color 12%, transparent);
  }
  ```

  Then replace every remaining `fade(X, N%)` with `color-mix(in srgb, X N%, transparent)`:
  - `mixins.less` lines 423, 424 and 453;
  - `template-lib.module.less:160`;
  - `TemplateTable.module.less:114` and `:128`;
  - `RnaPresetTabs.module.less:148`;
  - `Modal.module.less:34`;
  - `GenGroup.module.less:48`, keeping its existing `!important`.

  Confirm none are left: `grep -rnE "\bfade\(" packages/ketcher-react/src --include='*.less'` prints nothing.

- [ ] 4.4 Run the parity test again. Expected: PASS. The variables are still literal; this proves `color-mix` is equivalent.
- [ ] 4.5 Bridge the variables. In `src/style/variables.less`:
  1. Replace the `//Fonts` block with:
     ```less
     //Fonts (bridged to --ketcher-* tokens, src/ui-kit/tokens/tokens.css)
     @font-size-header: var(--ketcher-font-size-header);
     @line-height-header: var(--ketcher-line-height-header);

     @font-size-regular: var(--ketcher-font-size-regular);
     @line-height-regular: var(--ketcher-line-height-regular);

     @font-size-input: var(--ketcher-font-size-input);
     @line-height-input: var(--ketcher-line-height-input);

     @font-size-small: var(--ketcher-font-size-small);

     @font-weight-medium: var(--ketcher-font-weight-medium);

     @Inter: var(--ketcher-font-family-inter);
     ```
  2. Replace the `@color-input…` block (the six lines starting `@color-input: escape(`) with:
     ```less
     // Literal copies for compile-time functions (escape() in SVG data URIs, mix()).
     // They must equal the matching --ketcher-* tokens; lessBridge.parity.test.ts guards this.
     @_literal-color-primary: #167782;
     @_literal-color-button-primary-clicked: #4fb3bf;
     @_literal-color-grey-5: #b4b9d6;
     @_literal-color-grey-3: #e1e5ea;

     //using for changing color of SVG for checkboxes and radiobuttons
     @color-input: escape(@_literal-color-primary);
     @color-input-hover-svg: escape(@_literal-color-button-primary-clicked);
     @color-input-default: escape(@_literal-color-grey-5);
     @color-input-disabled: escape(@_literal-color-grey-3);
     @color-input-checked-disabled-color: mix(
       @_literal-color-primary,
       @_literal-color-grey-3,
       40%
     );
     @color-input-checked-disabled: escape(
       ~'@{color-input-checked-disabled-color}'
     );
     ```
  3. In the blocks from `// new styles` through `//Select`, change every variable listed in `PROBED_VARIABLES` that holds a literal to `var(--ketcher-<name>)`, using the same name. For example:
     - `@color-primary: var(--ketcher-color-primary);`
     - `@color-dropcontainer-shadow: var(--ketcher-color-dropcontainer-shadow);`

     Leave the `@shadow-dropcontainer*` composites, `@color-gray`, every `//Floating windows size`, `// old styles`, `#large-dim`/`#small-dim`, breakpoint and `// Periodic table coloring` variable unchanged.
- [ ] 4.6 Run the parity test. Expected: PASS, with no snapshot written or updated. If a value differs, fix the token or the variable, **not** the snapshot.
- [ ] 4.7 Run the full-stylesheet check:
  ```bash
  npm run build:packages
  node scripts/ui-kit/cssParity.mjs --before .ui-kit-baseline/react-index.css --after packages/ketcher-react/dist/index.css --tokens packages/ketcher-react/src/ui-kit/tokens/tokens.css --ignore-vendor-prefixes
  ```
  Expected: only the ContextMenu `line-height` pair accepted in 3.8. Anything else, especially a `removed` line with no matching `added` line, means a guard or function dropped a declaration. Fix it.
- [ ] 4.8 **Code check:** `npm run test -w ketcher-react` passes.
- [ ] 4.9 **Visual check:** in the example app, check every place the bridge touches:
  - a dialog with checkbox/radio inputs (Settings), including the checked, disabled and hover states;
  - the template library hover;
  - a form error highlight (type an invalid value in the Atom Properties label field);
  - toolbar buttons hover/active;
  - the context menu.

  Everything must look unchanged.

- [ ] 4.10 **STOP:** ask to commit, using the message `#12193 - Bridge ketcher-react LESS variables to design tokens`.

## 5. Emotion bridge, `theme.less` removal and hygiene

This is the end of sub-project #0.

**Files:**

- Create: `packages/ketcher-macromolecules/src/theming/defaultTheme/defaultTheme.parity.test.ts`
- Modify:
  - `packages/ketcher-macromolecules/src/theming/defaultTheme/defaultTheme.ts`
  - `packages/ketcher-macromolecules/src/Editor.tsx`
  - `packages/ketcher-macromolecules/src/components/shared/Tabs/TabPanel.module.less`
  - `packages/ketcher-macromolecules/src/components/Ruler/RulerArea.module.less`
  - `packages/ketcher-react/src/script/ui/views/components/ContextMenu/ContextMenu.module.less:59`
  - root `package.json` and `package-lock.json`
- Delete: `packages/ketcher-macromolecules/src/theme.less`

- [ ] 5.1 Write the snapshot test **before** changing the theme. Create `defaultTheme.parity.test.ts`:

  ```ts
  /**
   * @jest-environment node
   */
  import fs from 'node:fs';
  import path from 'node:path';
  import { defaultTheme } from './defaultTheme';

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const tokenUtils = require('../../../../../scripts/ui-kit/tokenUtils.cjs');

  const tokens: Map<string, string> = tokenUtils.parseTokens(
    fs.readFileSync(
      path.resolve(
        __dirname,
        '../../../../ketcher-react/src/ui-kit/tokens/tokens.css',
      ),
      'utf8',
    ),
  );

  const flatten = (value: unknown, prefix = ''): Record<string, string> => {
    if (value !== null && typeof value === 'object') {
      return Object.assign(
        {},
        ...Object.entries(value).map(([key, child]) =>
          flatten(child, prefix ? `${prefix}.${key}` : key),
        ),
      );
    }
    return {
      [prefix]: tokenUtils.normalizeValue(
        tokenUtils.resolveVars(String(value), tokens),
      ),
    };
  };

  it('default theme resolves to its pre-token values', () => {
    expect(flatten(defaultTheme)).toMatchSnapshot();
  });
  ```

- [ ] 5.2 Run `npx jest src/theming/defaultTheme/defaultTheme.parity` in `packages/ketcher-macromolecules`. Expected: PASS, with `1 snapshot written`. **From now on, never run it with `-u`.**
- [ ] 5.3 Bridge the UI-chrome keys. In `defaultTheme.ts`, replace the `color` and `font` blocks of `defaultTheme` with the following. Leave `color.icon.active` literal, because it is used as an SVG `fill` attribute. Leave `font.weight`, `monomer`, `peptide`, `border`, `shadow`, `outline`, `transition` and `zIndex` untouched.

  ```ts
    color: {
      background: {
        canvas: 'var(--ketcher-color-background-canvas-macro)',
        primary: 'var(--ketcher-color-background-primary)',
        secondary: 'var(--ketcher-color-background-secondary)',
        overlay: 'var(--ketcher-color-background-overlay)',
      },
      border: {
        primary: 'var(--ketcher-color-border-primary)',
        secondary: 'var(--ketcher-color-border-secondary)',
      },
      text: {
        primary: 'var(--ketcher-color-text-primary)',
        secondary: 'var(--ketcher-color-text-secondary-macro)',
        light: 'var(--ketcher-color-text-light-macro)',
        dark: 'var(--ketcher-color-text-dark)',
        error: 'var(--ketcher-color-text-error)',
        lightgrey: 'var(--ketcher-color-text-lightgrey)',
      },
      tab: {
        regular: 'var(--ketcher-color-tab-regular)',
        active: 'var(--ketcher-color-tab-active-macro)',
        hover: 'var(--ketcher-color-tab-hover)',
        content: 'var(--ketcher-color-tab-content)',
      },
      scroll: {
        regular: 'var(--ketcher-color-scroll-regular)',
        inactive: 'var(--ketcher-color-scroll-inactive)',
      },
      button: {
        primary: {
          active: 'var(--ketcher-color-button-primary-active)',
          hover: 'var(--ketcher-color-button-primary-hover)',
          clicked: 'var(--ketcher-color-button-primary-clicked)',
          disabled: 'var(--ketcher-color-button-primary-disabled-macro)',
        },
        secondary: {
          active: 'var(--ketcher-color-button-secondary-active)',
          hover: 'var(--ketcher-color-button-secondary-hover)',
          clicked: 'var(--ketcher-color-button-secondary-clicked)',
          disabled: 'var(--ketcher-color-button-secondary-disabled)',
        },
        group: {
          active: 'var(--ketcher-color-button-group-active)',
          hover: 'var(--ketcher-color-button-group-hover)',
        },
        transparent: {
          active: 'var(--ketcher-color-button-transparent-active)',
        },
        text: {
          primary: 'var(--ketcher-color-button-text-primary)',
          secondary: 'var(--ketcher-color-button-text-secondary)',
          disabled: 'var(--ketcher-color-button-text-disabled)',
        },
      },
      dropdown: {
        primary: 'var(--ketcher-color-dropdown-primary)',
        secondary: 'var(--ketcher-color-dropdown-secondary)',
        hover: 'var(--ketcher-color-dropdown-hover)',
        disabled: 'var(--ketcher-color-dropdown-disabled)',
      },
      tooltip: {
        background: 'var(--ketcher-color-tooltip-background)',
        text: 'var(--ketcher-color-tooltip-text)',
      },
      link: {
        active: 'var(--ketcher-color-link-active)',
        hover: 'var(--ketcher-color-link-hover)',
      },
      divider: 'var(--ketcher-color-divider)',
      spinner: 'var(--ketcher-color-spinner)',
      error: 'var(--ketcher-color-error)',
      input: {
        text: {
          default: 'var(--ketcher-color-input-text-default)',
          active: 'var(--ketcher-color-input-text-active)',
          disabled: 'var(--ketcher-color-input-text-disabled)',
          error: 'var(--ketcher-color-input-text-error)',
        },
        background: {
          primary: 'var(--ketcher-color-input-background-primary)',
          default: 'var(--ketcher-color-input-background-default)',
          hover: 'var(--ketcher-color-input-background-hover)',
          disabled: 'var(--ketcher-color-input-background-disabled)',
        },
        border: {
          regular: 'var(--ketcher-color-input-border-regular)',
          active: 'var(--ketcher-color-input-border-active)',
          hover: 'var(--ketcher-color-input-border-hover)',
          focus: 'var(--ketcher-color-input-border-focus)',
          error: 'var(--ketcher-color-input-border-error)',
        },
      },
      icon: {
        grey: 'var(--ketcher-color-icon-grey)',
        hover: 'var(--ketcher-color-icon-hover)',
        // Literal on purpose: used as an SVG fill attribute, which cannot resolve var().
        active: '#525252',
        activeMenu: 'var(--ketcher-color-icon-active-menu)',
        clicked: 'var(--ketcher-color-icon-clicked)',
        disabled: 'var(--ketcher-color-icon-disabled)',
      },
      monomer: {
        default: 'var(--ketcher-color-monomer-default)',
      },
      editMode: {
        sequenceInRNABuilder: 'var(--ketcher-color-edit-mode-sequence-in-rna-builder)',
      },
    },
    font: {
      size: {
        small: 'var(--ketcher-font-size-small-macro)',
        regular: 'var(--ketcher-font-size-regular)',
        medium: 'var(--ketcher-font-size-medium)',
        xsmall: 'var(--ketcher-font-size-xsmall)',
      },
      family: {
        montserrat: 'var(--ketcher-font-family-montserrat)',
        inter: 'var(--ketcher-font-family-inter)',
        roboto: 'var(--ketcher-font-family-roboto)',
      },
      weight: {
        light: 300,
        regular: 400,
        bold: 600,
      },
    },
  ```

- [ ] 5.4 Run the parity test. Expected: PASS, with no snapshot written. If a key differs, fix the token mapping, not the snapshot.
- [ ] 5.5 Replace the consumers of `theme.less`, then delete it:
  - In `components/shared/Tabs/TabPanel.module.less`: `var(--color-tab-active)` becomes `var(--ketcher-color-tab-active-macro)`.
  - In `components/Ruler/RulerArea.module.less`:
    - `var(--color-input-border-hover)` becomes `var(--ketcher-color-input-border-hover)` (both occurrences);
    - `var(--color-background-canvas)` becomes `var(--ketcher-color-background-canvas-macro)`.
  - In `ketcher-react/.../ContextMenu/ContextMenu.module.less:59`: `color: var(--color-icon-grey, @color-grey-5);` becomes `color: @color-grey-5;`. Both resolve to `#b4b9d6`.
  - Delete `packages/ketcher-macromolecules/src/theme.less`, and remove `import './theme.less';` from `packages/ketcher-macromolecules/src/Editor.tsx`.
  - Confirm nothing references the old variables: `grep -rnE "var\(--(color|font)-" packages/ketcher-react/src packages/ketcher-macromolecules/src` prints nothing.
- [ ] 5.6 Memoize the merged theme in `EditorContainer` (`packages/ketcher-macromolecules/src/Editor.tsx`). Import `useMemo` from `react`, then replace the two `const` assignments with:

  ```tsx
  const editorTheme: EditorTheme = useMemo(
    () => (theme ? merge(defaultTheme, theme) : defaultTheme),
    [theme],
  );

  const mergedTheme: MergedThemeType = useMemo(
    () => merge(muiTheme, { ketcher: editorTheme }),
    [editorTheme],
  );
  ```

- [ ] 5.7 Remove the dangling workspace. Delete `"example-separate-editors",` from the root `package.json` `workspaces`, then run `npm install --package-lock-only`. Check with `git diff package-lock.json` that only that workspace entry disappeared.
- [ ] 5.8 Rebuild and run the parity check for macromolecules:
  ```bash
  npm run build:packages
  node scripts/ui-kit/cssParity.mjs --before .ui-kit-baseline/macro-index.css --after packages/ketcher-macromolecules/dist/index.css --tokens packages/ketcher-react/src/ui-kit/tokens/tokens.css --ignore-vendor-prefixes
  ```
  Expected: `0 removed, 0 added`. The deleted `theme.less` held only custom properties, which the script skips, and the three replaced `var()` references resolve to the same values.
- [ ] 5.9 **Code check:**
  - `npm test` at the root passes (all four packages).
  - `npm run test:ui-kit-scripts` passes.
- [ ] 5.10 **Visual check:** in the example app's macromolecules mode, check the monomer library (tabs, items, hover), the RNA builder, the ruler, the sequence/snake/flex modes, a modal (Open), the macromolecule properties window and the settings dialog. Everything must look unchanged.
- [ ] 5.11 **STOP:** ask to commit, using the message `#12193 - Bridge macromolecules theme to design tokens; remove theme.less`.
- [ ] 5.12 **Sub-project #0 gate.** Ask the user to push the branch and open a **draft PR** referencing #12193, so CI runs the full e2e suite. Expected: green, with **no baseline updates**. Do not continue to Section 6 until the user confirms.

## 6. Kit scaffold: Base UI dependency and `KitProvider`

**Files:**

- Modify: `packages/ketcher-react/package.json`, `packages/ketcher-react/src/typings.d.ts`, `packages/ketcher-react/src/ui-kit/index.ts`
- Create:
  - `packages/ketcher-react/src/ui-kit/providers/KitProvider.tsx`
  - `KitProvider.module.css` and `KitProvider.test.tsx` (same folder)
  - `providers/index.ts`
  - `packages/ketcher-react/src/ui-kit/README.md`
- Modify (mount points):
  - `packages/ketcher-react/src/script/ui/App/App.tsx`
  - `packages/ketcher-macromolecules/src/Editor.tsx`
- Modify (macromolecules typing and test mock):
  - `packages/ketcher-macromolecules/src/types/ketcher-react.d.ts`
  - `packages/ketcher-macromolecules/src/testMocks/ketcher-react.tsx`

**Interfaces produced:**

- `type KitDirection = 'ltr' | 'rtl'`
- `KitProvider({ direction: KitDirection; children: ReactNode })`
- `usePortalContainer(): RefObject<HTMLDivElement | null> | undefined`
- `useKitDirection(): KitDirection`

- [ ] 6.1 Install Base UI: `npm install -w ketcher-react @base-ui/react@^1.9.0`. Then add CSS-module typings **at the top** of `packages/ketcher-react/src/typings.d.ts`. TypeScript uses the first matching wildcard declaration, and `rollup-plugin-shims.d.ts` declares `*.css` as a string.

  ```ts
  declare module '*.module.css' {
    const classes: { [className: string]: string };
    export default classes;
  }
  ```

- [ ] 6.2 Write the failing tests in `KitProvider.test.tsx`:

  ```tsx
  import { render, screen } from '@testing-library/react';
  import {
    KitProvider,
    useKitDirection,
    usePortalContainer,
  } from './KitProvider';

  const Probe = ({ id }: { id: string }) => {
    const container = usePortalContainer();
    const direction = useKitDirection();
    return (
      <span data-testid={id} data-direction={direction}>
        {container?.current ? 'container' : 'none'}
      </span>
    );
  };

  describe('KitProvider', () => {
    it('renders a portal root after its children', () => {
      const { container } = render(
        <KitProvider direction="ltr">
          <span>child</span>
        </KitProvider>,
      );
      const portalRoot = container.querySelector('[data-ketcher-portal-root]');
      expect(portalRoot).not.toBeNull();
      expect(portalRoot?.previousElementSibling?.textContent).toBe('child');
    });

    it('exposes direction and the portal container to descendants', () => {
      const { container, rerender } = render(
        <KitProvider direction="rtl">
          <Probe id="probe" />
        </KitProvider>,
      );
      rerender(
        <KitProvider direction="rtl">
          <Probe id="probe" />
        </KitProvider>,
      );
      expect(screen.getByTestId('probe')).toHaveAttribute(
        'data-direction',
        'rtl',
      );
      expect(screen.getByTestId('probe')).toHaveTextContent('container');
      expect(
        container.querySelectorAll('[data-ketcher-portal-root]'),
      ).toHaveLength(1);
    });

    it('lets the nearest provider win when nested', () => {
      const { container } = render(
        <KitProvider direction="ltr">
          <KitProvider direction="rtl">
            <Probe id="inner" />
          </KitProvider>
        </KitProvider>,
      );
      const roots = container.querySelectorAll('[data-ketcher-portal-root]');
      expect(roots).toHaveLength(2);
      expect(screen.getByTestId('inner')).toHaveAttribute(
        'data-direction',
        'rtl',
      );
    });

    it('defaults to ltr and no container without a provider', () => {
      render(<Probe id="bare" />);
      expect(screen.getByTestId('bare')).toHaveAttribute(
        'data-direction',
        'ltr',
      );
      expect(screen.getByTestId('bare')).toHaveTextContent('none');
    });
  });
  ```

  The ref is set after the first commit, which is why the second test re-renders once before asserting.

- [ ] 6.3 Run `npx jest src/ui-kit/providers` in `packages/ketcher-react`. Expected: FAIL with `Cannot find module './KitProvider'`.
- [ ] 6.4 Implement `providers/KitProvider.tsx`:

  ```tsx
  import { DirectionProvider } from '@base-ui/react/direction-provider';
  import {
    createContext,
    useContext,
    useMemo,
    useRef,
    type ReactNode,
    type RefObject,
  } from 'react';
  import styles from './KitProvider.module.css';

  export type KitDirection = 'ltr' | 'rtl';

  interface KitContextValue {
    portalContainer: RefObject<HTMLDivElement | null>;
    direction: KitDirection;
  }

  const KitContext = createContext<KitContextValue | null>(null);

  export interface KitProviderProps {
    /** Text direction of the editor UI, taken from the consumer's i18n. */
    direction: KitDirection;
    children: ReactNode;
  }

  /**
   * Mount once per editor root. Kit overlays (tooltips, popovers, menus, dialogs)
   * portal into the root rendered here, so they inherit the editor's tokens and
   * direction instead of escaping to <body>.
   */
  export const KitProvider = ({ direction, children }: KitProviderProps) => {
    const portalContainer = useRef<HTMLDivElement>(null);
    const value = useMemo(() => ({ portalContainer, direction }), [direction]);

    return (
      <KitContext.Provider value={value}>
        <DirectionProvider direction={direction}>
          {children}
          <div
            ref={portalContainer}
            className={styles.portalRoot}
            data-ketcher-portal-root=""
          />
        </DirectionProvider>
      </KitContext.Provider>
    );
  };

  export const usePortalContainer = () =>
    useContext(KitContext)?.portalContainer;

  export const useKitDirection = (): KitDirection =>
    useContext(KitContext)?.direction ?? 'ltr';
  ```

  Then `providers/KitProvider.module.css`:

  ```css
  /* Out of layout: the portal root must not affect the editor's flex/grid layout. */
  .portalRoot {
    display: contents;
  }
  ```

  Then `providers/index.ts`:

  ```ts
  export {
    KitProvider,
    usePortalContainer,
    useKitDirection,
    type KitDirection,
    type KitProviderProps,
  } from './KitProvider';
  ```

  Finally, replace `export {};` in `src/ui-kit/index.ts` with `export * from './providers';`.

- [ ] 6.5 Run `npx jest src/ui-kit/providers`. Expected: PASS (4 tests).
- [ ] 6.6 Mount the provider in the micromolecules app root. It is its own React root, created in `MicromoleculesEditor.tsx`. In `packages/ketcher-react/src/script/ui/App/App.tsx`:
  - add `import { useTranslation } from 'react-i18next';` and `import { KitProvider } from 'src/ui-kit';`;
  - inside the component, add `const { i18n } = useTranslation();`;
  - wrap the `<div className={classes.app}>…</div>` element, inside `<ThemeProvider>`, as `<KitProvider direction={i18n.dir()}> … </KitProvider>`.
- [ ] 6.7 Mount it in the macromolecules root. In `packages/ketcher-macromolecules/src/Editor.tsx`, `EditorContainer`:
  - add `import { KitProvider } from 'ketcher-react';` and `import { useTranslation } from 'react-i18next';` (if not already imported);
  - add `const { i18n } = useTranslation();`;
  - wrap the `<Editor … />` element inside `<EditorWrapper>` as `<KitProvider direction={i18n.dir()}> … </KitProvider>`.
- [ ] 6.8 Declare the new export for macromolecules' typing and test mock:
  - In `src/types/ketcher-react.d.ts`, inside `declare module 'ketcher-react'`, add:
    ```ts
    export const KitProvider: React.ComponentType<{
      direction: 'ltr' | 'rtl';
      children?: React.ReactNode;
    }>;
    ```
  - In `src/testMocks/ketcher-react.tsx`, add:
    ```tsx
    export const KitProvider = ({
      children,
    }: {
      children?: React.ReactNode;
    }) => <>{children}</>;
    ```
- [ ] 6.9 Create `packages/ketcher-react/src/ui-kit/README.md`. It holds the conventions from `design.md` Decisions 9, 11 and 12, copied as short rules:
  - the boundary;
  - the styling rules;
  - the component contract;
  - consumer customisation order: props, then component custom properties, then `className` for layout only;
  - the migration recipe link (`roadmap.md`);
  - "never import i18n".
- [ ] 6.10 **Code check:** `npm test` at the root passes.
- [ ] 6.11 **Visual check:** in the example app, check both editors. They must look unchanged, and the DOM must contain exactly one `[data-ketcher-portal-root]` inside `.Ketcher-root` and one inside `.Ketcher-polymer-editor-root`. Switch the language if a non-English locale is enabled, or set `dir="rtl"` on the wrapper in devtools; nothing should break.
- [ ] 6.12 **STOP:** ask to commit, using the message `#12193 - Add UI kit provider with portal root and direction`.

## 7. Lint boundaries: ESLint and stylelint

**Files:**

- Create:
  - `scripts/ui-kit/generateLegacyAllowlist.mjs`
  - `scripts/ui-kit/legacyStylingAllowlist.mjs` (generated)
  - `scripts/ui-kit/lintBoundaries.test.mjs`
- Modify: `eslint.config.mjs`, `.stylelintrc.json`

- [ ] 7.1 Write the generator `scripts/ui-kit/generateLegacyAllowlist.mjs`:

  ```js
  #!/usr/bin/env node
  /** Writes legacyStylingAllowlist.mjs: files allowed to import @mui/* or @emotion/*. */
  import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
  import { dirname, join, relative, resolve } from 'node:path';
  import { fileURLToPath } from 'node:url';

  const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
  const SOURCE_DIRS = [
    'packages/ketcher-react/src',
    'packages/ketcher-macromolecules/src',
  ];
  const IMPORT_RE = /from\s+['"]@(mui|emotion)\//;

  const files = SOURCE_DIRS.flatMap((dir) =>
    readdirSync(join(repoRoot, dir), { recursive: true })
      .map((file) => join(dir, file))
      .filter((file) => /\.(ts|tsx)$/.test(file))
      .filter((file) =>
        IMPORT_RE.test(readFileSync(join(repoRoot, file), 'utf8')),
      ),
  )
    .map((file) =>
      relative(repoRoot, join(repoRoot, file)).split('\\').join('/'),
    )
    .sort();

  writeFileSync(
    join(repoRoot, 'scripts/ui-kit/legacyStylingAllowlist.mjs'),
    `// Generated by generateLegacyAllowlist.mjs. Shrink it as components migrate; never grow it.\nexport const LEGACY_STYLING_ALLOWLIST = ${JSON.stringify(files, null, 2)};\n`,
  );
  console.log(`${files.length} files allowlisted`);
  ```

  Run `node scripts/ui-kit/generateLegacyAllowlist.mjs`. Expected: roughly 100–120 files, because test files and the macromolecules Emotion files are included.

- [ ] 7.2 Write the failing lint tests in `scripts/ui-kit/lintBoundaries.test.mjs`:

  ```js
  import { test } from 'node:test';
  import assert from 'node:assert/strict';
  import { dirname, resolve } from 'node:path';
  import { fileURLToPath } from 'node:url';
  import { ESLint } from 'eslint';
  import stylelint from 'stylelint';
  import { LEGACY_STYLING_ALLOWLIST } from './legacyStylingAllowlist.mjs';

  const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
  const eslint = new ESLint({ cwd: repoRoot });
  const lint = async (code, filePath) => {
    const [result] = await eslint.lintText(code, {
      filePath: resolve(repoRoot, filePath),
    });
    return result.messages.filter(
      (message) => message.ruleId !== 'prettier/prettier',
    );
  };
  const ruleIds = (messages) => messages.map((message) => message.ruleId);

  const KIT_FILE =
    'packages/ketcher-react/src/ui-kit/components/Probe/Probe.tsx';
  const REACT_FILE = 'packages/ketcher-react/src/script/ui/probe.tsx';
  const MACRO_FILE = 'packages/ketcher-macromolecules/src/components/probe.tsx';

  test('kit code cannot import editor code', async () => {
    for (const source of [
      'ketcher-core',
      'src/constants',
      'components',
      'react-i18next',
      'react-redux',
    ]) {
      const messages = await lint(
        `import x from '${source}';\nexport default x;\n`,
        KIT_FILE,
      );
      assert.ok(ruleIds(messages).includes('no-restricted-imports'), source);
    }
    const relativeEscape = await lint(
      "import x from '../../../script/ui/App/App';\nexport default x;\n",
      KIT_FILE,
    );
    assert.ok(ruleIds(relativeEscape).includes('import/no-restricted-paths'));
  });

  test('kit code may import kit code, assets and Base UI', async () => {
    const isBoundaryRule = (id) =>
      id?.startsWith('import/') || id === 'no-restricted-imports';
    const component = await lint(
      "import { Tooltip } from '@base-ui/react/tooltip';\nimport clsx from 'clsx';\nimport { KitProvider } from '../../providers';\nimport Svg from '../../../assets/icons/files/about.svg';\nexport { Tooltip, clsx, KitProvider, Svg };\n",
      KIT_FILE,
    );
    assert.deepEqual(ruleIds(component).filter(isBoundaryRule), []);
    const entry = await lint(
      "export { KitProvider } from './providers';\nexport { Icon } from './components/Icon';\n",
      'packages/ketcher-react/src/ui-kit/index.ts',
    );
    assert.deepEqual(ruleIds(entry).filter(isBoundaryRule), []);
  });

  test('new MUI or Emotion imports are rejected outside the allowlist', async () => {
    for (const file of [REACT_FILE, MACRO_FILE]) {
      const messages = await lint(
        "import { Tooltip } from '@mui/material';\nexport { Tooltip };\n",
        file,
      );
      assert.ok(ruleIds(messages).includes('no-restricted-imports'), file);
    }
  });

  test('allowlisted files may keep their MUI imports', async () => {
    const file = LEGACY_STYLING_ALLOWLIST.find((path) =>
      path.startsWith('packages/ketcher-react/'),
    );
    const messages = await lint(
      "import { Tooltip } from '@mui/material';\nexport { Tooltip };\n",
      file,
    );
    assert.ok(!ruleIds(messages).includes('no-restricted-imports'));
  });

  test('deep imports into the kit are rejected', async () => {
    const messages = await lint(
      "import { KitProvider } from '../../ui-kit/providers/KitProvider';\nexport { KitProvider };\n",
      REACT_FILE,
    );
    assert.ok(ruleIds(messages).includes('no-restricted-imports'));
  });

  test('kit stylesheets reject !important, :global, element selectors and physical properties', async () => {
    const code =
      '.a { margin-left: 1px; color: red !important; }\n:global(.b) { color: red; }\n.c span { color: red; }\n';
    const { results } = await stylelint.lint({
      code,
      codeFilename: resolve(
        repoRoot,
        'packages/ketcher-react/src/ui-kit/components/Probe/Probe.module.css',
      ),
      cwd: repoRoot,
    });
    const rules = results[0].warnings.map((warning) => warning.rule);
    for (const rule of [
      'property-disallowed-list',
      'declaration-no-important',
      'selector-pseudo-class-disallowed-list',
      'selector-max-type',
    ]) {
      assert.ok(rules.includes(rule), rule);
    }
  });
  ```

- [ ] 7.3 Run `npm run test:ui-kit-scripts`. Expected: the new tests FAIL; the earlier ones still pass.
- [ ] 7.4 Implement the ESLint rules in `eslint.config.mjs`:
  1. Add the import and helpers after the existing imports:
     ```js
     import { LEGACY_STYLING_ALLOWLIST } from './scripts/ui-kit/legacyStylingAllowlist.mjs';

     const ASSERT_RESTRICTION = {
       name: 'assert',
       message:
         "Node's 'assert' module breaks browser bundlers (see issue #3733). Use `import { assert } from 'ketcher-core'` instead.",
     };
     const LEGACY_STYLING_RESTRICTION = {
       group: ['@mui/*', '@emotion/*'],
       message:
         'MUI/Emotion are being replaced by the UI kit (openspec/changes/ui-kit-foundation). Use a kit component or a .module.css file.',
     };
     const DEEP_KIT_IMPORT_RESTRICTION = {
       regex: 'ui-kit/.+',
       message:
         "Import the UI kit only through its entry point ('src/ui-kit' or 'ketcher-react').",
     };
     // Anchored regex, not gitignore-style groups: a group like 'components/*' would
     // also match the kit's own relative imports such as './components/Icon'.
     const KIT_FORBIDDEN_RESTRICTION = {
       regex:
         '^(ketcher-core|ketcher-macromolecules|components|src|redux|react-redux|i18next|react-i18next)(/.*)?$',
       message:
         'UI-kit code may only import kit code, src/assets, @base-ui/react, react and clsx.',
     };
     const restrictedImports = (...patterns) => [
       'error',
       { paths: [ASSERT_RESTRICTION], patterns },
     ];
     ```
  2. In the existing block for `packages/ketcher-react/**` plus `packages/ketcher-macromolecules/**`, replace its `'no-restricted-imports'` value with `restrictedImports(LEGACY_STYLING_RESTRICTION, DEEP_KIT_IMPORT_RESTRICTION)`.
  3. Directly after that block, add:
     ```js
     {
       files: LEGACY_STYLING_ALLOWLIST,
       rules: {
         'no-restricted-imports': restrictedImports(DEEP_KIT_IMPORT_RESTRICTION),
       },
     },
     {
       files: ['packages/ketcher-react/src/ui-kit/**/*.{ts,tsx}'],
       settings: {
         'import/resolver': { node: { extensions: ['.ts', '.tsx', '.js', '.jsx'] } },
       },
       rules: {
         'no-restricted-imports': restrictedImports(
           LEGACY_STYLING_RESTRICTION,
           KIT_FORBIDDEN_RESTRICTION,
         ),
         'import/no-restricted-paths': [
           'error',
           {
             basePath: import.meta.dirname,
             zones: [
               {
                 target: './packages/ketcher-react/src/ui-kit',
                 from: './packages/ketcher-react/src',
                 except: ['./ui-kit', './assets'],
                 message: 'UI-kit code may only import kit code and src/assets.',
               },
             ],
           },
         ],
       },
     },
     ```
  4. Add `'**/storybook-static/**'` to the global `ignores` list. It is needed in Section 9.
- [ ] 7.5 Implement the stylelint rules. Append an override to `.stylelintrc.json` `overrides`:

  ```json
  {
    "files": ["packages/ketcher-react/src/ui-kit/**/*.css"],
    "rules": {
      "declaration-no-important": true,
      "selector-pseudo-class-disallowed-list": ["global"],
      "selector-max-type": 0,
      "property-disallowed-list": [
        "left",
        "right",
        "margin-left",
        "margin-right",
        "padding-left",
        "padding-right",
        "border-left",
        "border-right",
        "border-left-width",
        "border-right-width",
        "border-left-color",
        "border-right-color",
        "border-left-style",
        "border-right-style",
        "border-top-left-radius",
        "border-top-right-radius",
        "border-bottom-left-radius",
        "border-bottom-right-radius",
        "float",
        "clear"
      ],
      "declaration-property-value-disallowed-list": {
        "text-align": ["left", "right"]
      }
    }
  }
  ```

  Also add `storybook-static` to `.stylelintignore`.

- [ ] 7.6 Run `npm run test:ui-kit-scripts`. Expected: all tests PASS.
- [ ] 7.7 **Code check:**
  - `npm test` at the root passes. That proves the whole repo, including the allowlisted files and the kit, lints clean.
  - `npx stylelint "packages/ketcher-react/src/ui-kit/**/*.css"` is clean.
- [ ] 7.8 **Visual check:** not applicable.
- [ ] 7.9 **STOP:** ask to commit, using the message `#12193 - Enforce UI kit import boundaries and legacy styling allowlist`.

## 8. Migration metrics and CI

**Files:**

- Create:
  - `scripts/ui-kit/metrics.mjs`
  - `scripts/ui-kit/metrics.test.mjs`
  - `scripts/ui-kit/metrics-baseline.json` (generated)
- Modify: root `package.json`, `.github/workflows/ci.yml`

**Interfaces produced:**

- `collectMetrics(rootDir: string): { muiImportFiles: number; emotionImportFiles: number; muiClassSelectors: number; importantDeclarations: number; lessFiles: number }`
- CLI: `node scripts/ui-kit/metrics.mjs [--check | --write]`
  - `--check` fails when any count is above `metrics-baseline.json`.
  - `--write` rewrites the baseline. Use it only when counts went down.
  - Both modes print the sizes of `dist/index.css` and `dist/index.js`, when present, for information only.

- [ ] 8.1 Write the failing test `scripts/ui-kit/metrics.test.mjs`:

  ```js
  import { test } from 'node:test';
  import assert from 'node:assert/strict';
  import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
  import { tmpdir } from 'node:os';
  import { join } from 'node:path';
  import { collectMetrics, compareMetrics } from './metrics.mjs';

  const fixture = () => {
    const root = mkdtempSync(join(tmpdir(), 'ui-kit-metrics-'));
    for (const pkg of ['ketcher-react', 'ketcher-macromolecules']) {
      mkdirSync(join(root, 'packages', pkg, 'src'), { recursive: true });
    }
    const src = (pkg, file) => join(root, 'packages', pkg, 'src', file);
    writeFileSync(
      src('ketcher-react', 'a.tsx'),
      "import { Tooltip } from '@mui/material';\n",
    );
    writeFileSync(
      src('ketcher-react', 'a.module.less'),
      ':global(.MuiPaper-root) { color: red !important; }\n',
    );
    writeFileSync(
      src('ketcher-react', 'a.test.tsx'),
      "import { Tooltip } from '@mui/material';\n",
    );
    writeFileSync(
      src('ketcher-macromolecules', 'b.ts'),
      "import styled from '@emotion/styled';\nconst x = '.MuiTabs-root';\n",
    );
    return root;
  };

  test('collectMetrics counts legacy styling usage, excluding tests', () => {
    assert.deepEqual(collectMetrics(fixture()), {
      muiImportFiles: 1,
      emotionImportFiles: 1,
      muiClassSelectors: 2,
      importantDeclarations: 1,
      lessFiles: 1,
    });
  });

  test('compareMetrics reports only increases', () => {
    const baseline = { muiImportFiles: 2, lessFiles: 5 };
    assert.deepEqual(
      compareMetrics({ muiImportFiles: 1, lessFiles: 6 }, baseline),
      ['lessFiles: 5 -> 6'],
    );
  });
  ```

- [ ] 8.2 Run `npm run test:ui-kit-scripts`. Expected: FAIL, because `metrics.mjs` is missing.
- [ ] 8.3 Implement `scripts/ui-kit/metrics.mjs`:

  ```js
  #!/usr/bin/env node
  /** UI-kit migration burn-down (openspec/changes/ui-kit-foundation, Decision 11). */
  import {
    existsSync,
    readFileSync,
    readdirSync,
    statSync,
    writeFileSync,
  } from 'node:fs';
  import { dirname, join, resolve } from 'node:path';
  import { fileURLToPath, pathToFileURL } from 'node:url';
  import { parseArgs } from 'node:util';

  const SOURCE_DIRS = [
    'packages/ketcher-react/src',
    'packages/ketcher-macromolecules/src',
  ];
  const EXCLUDED =
    /(\.test\.|\.spec\.|\.stories\.|[\\/]testMocks[\\/]|__snapshots__)/;

  const sourceFiles = (rootDir) =>
    SOURCE_DIRS.flatMap((dir) => {
      const absolute = join(rootDir, dir);
      if (!existsSync(absolute)) return [];
      return readdirSync(absolute, { recursive: true })
        .map((file) => join(absolute, file))
        .filter((file) => statSync(file).isFile() && !EXCLUDED.test(file));
    });

  const count = (text, re) => (text.match(re) ?? []).length;

  export function collectMetrics(rootDir) {
    const metrics = {
      muiImportFiles: 0,
      emotionImportFiles: 0,
      muiClassSelectors: 0,
      importantDeclarations: 0,
      lessFiles: 0,
    };
    for (const file of sourceFiles(rootDir)) {
      if (file.endsWith('.less')) metrics.lessFiles += 1;
      if (!/\.(tsx?|less|css)$/.test(file)) continue;
      const text = readFileSync(file, 'utf8');
      if (/from\s+['"]@mui\//.test(text)) metrics.muiImportFiles += 1;
      if (/from\s+['"]@emotion\//.test(text)) metrics.emotionImportFiles += 1;
      metrics.muiClassSelectors += count(
        text,
        /\.Mui[A-Z][A-Za-z]*(-[A-Za-z]+)?/g,
      );
      metrics.importantDeclarations += count(text, /!important/g);
    }
    return metrics;
  }

  export function compareMetrics(current, baseline) {
    return Object.entries(baseline)
      .filter(([key, value]) => current[key] > value)
      .map(([key, value]) => `${key}: ${value} -> ${current[key]}`);
  }

  function distSizes(rootDir) {
    return ['ketcher-react', 'ketcher-macromolecules']
      .flatMap((pkg) =>
        ['dist/index.css', 'dist/index.js'].map((file) => {
          const path = join(rootDir, 'packages', pkg, file);
          return existsSync(path)
            ? `${pkg}/${file}: ${statSync(path).size} bytes`
            : null;
        }),
      )
      .filter(Boolean);
  }

  function main() {
    const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
    const baselinePath = join(rootDir, 'scripts/ui-kit/metrics-baseline.json');
    const { values } = parseArgs({
      options: { check: { type: 'boolean' }, write: { type: 'boolean' } },
    });
    const current = collectMetrics(rootDir);
    console.table(current);
    for (const line of distSizes(rootDir)) console.log(line);
    if (values.write) {
      writeFileSync(baselinePath, `${JSON.stringify(current, null, 2)}\n`);
      return;
    }
    if (values.check) {
      const increases = compareMetrics(
        current,
        JSON.parse(readFileSync(baselinePath, 'utf8')),
      );
      if (increases.length) {
        console.error(`UI-kit metrics went up:\n${increases.join('\n')}`);
        process.exit(1);
      }
    }
  }

  if (
    process.argv[1] &&
    import.meta.url === pathToFileURL(process.argv[1]).href
  ) {
    main();
  }
  ```

- [ ] 8.4 Run `npm run test:ui-kit-scripts`. Expected: PASS. Then write the baseline with `node scripts/ui-kit/metrics.mjs --write` and paste the printed table into the section report.
- [ ] 8.5 Add a root script to `package.json`: `"check:ui-kit-metrics": "node scripts/ui-kit/metrics.mjs --check"`. Then, in `.github/workflows/ci.yml`, add two steps right after the existing `npm test` step of the `build` job:

  ```yaml
  - name: UI kit tooling tests
    run: npm run test:ui-kit-scripts
  - name: UI kit migration metrics
    run: npm run check:ui-kit-metrics
  ```

- [ ] 8.6 **Code check:** `npm run test:ui-kit-scripts && npm run check:ui-kit-metrics` passes.
- [ ] 8.7 **STOP:** ask to commit, using the message `#12193 - Track UI kit migration metrics in CI`.

## 9. Storybook

**Files:**

- Modify: `packages/ketcher-react/package.json`, root `.gitignore`
- Create:
  - `packages/ketcher-react/.storybook/main.ts`
  - `packages/ketcher-react/.storybook/preview.tsx`
  - `packages/ketcher-react/.storybook/preview-head.html`
  - `packages/ketcher-react/src/ui-kit/providers/KitProvider.stories.tsx`

- [ ] 9.1 Install the tools: `npm install -D -w ketcher-react storybook@10.6.2 @storybook/react-vite@10.6.2 vite@8.0.16 vite-plugin-svgr@^4.5.0`. Do not add the pseudo-states addon yet: this change's stories set their open state through props. Add it with the first component that needs hover or focus stories (Button, sub-project #2). Add `storybook-static/` to the root `.gitignore`, then add scripts to `packages/ketcher-react/package.json`:
  ```json
  "storybook": "storybook dev -p 6006 --no-open",
  "build-storybook": "storybook build -o storybook-static --quiet"
  ```
- [ ] 9.2 Create `.storybook/main.ts`:

  ```ts
  import type { StorybookConfig } from '@storybook/react-vite';
  import { mergeConfig } from 'vite';
  import svgr from 'vite-plugin-svgr';

  // Kit and characterisation stories only need SVGR. The example app's package
  // aliases move into a shared helper when the first story imports editor or
  // macromolecules code (design.md Decision 13).
  const config: StorybookConfig = {
    framework: '@storybook/react-vite',
    stories: [
      '../src/**/*.stories.@(ts|tsx)',
      '../../ketcher-macromolecules/src/**/*.stories.@(ts|tsx)',
    ],
    core: { disableTelemetry: true },
    async viteFinal(baseConfig) {
      return mergeConfig(baseConfig, {
        plugins: [
          svgr({ include: '**/*.svg', svgrOptions: { exportType: 'default' } }),
        ],
      });
    },
  };

  export default config;
  ```

- [ ] 9.3 Create `.storybook/preview-head.html`. It mirrors what the example app's `normalize.css` gives the page, so popups render as they do in the app:

  ```html
  <style>
    html {
      line-height: 1.15;
    }
    body {
      margin: 0;
    }
  </style>
  ```

  Then create `.storybook/preview.tsx`:

  ```tsx
  import type { Decorator, Preview } from '@storybook/react-vite';
  import { KitProvider, type KitDirection } from '../src/ui-kit';

  // Mimics an editor root: the same root class (KETCHER_ROOT_NODE_CLASS_NAME),
  // direction and kit provider as App.tsx.
  const withEditorRoot: Decorator = (Story, context) => {
    const direction: KitDirection = context.parameters.direction ?? 'ltr';
    return (
      <div className="Ketcher-root" dir={direction}>
        <KitProvider direction={direction}>
          <Story />
        </KitProvider>
      </div>
    );
  };

  const preview: Preview = {
    decorators: [withEditorRoot],
    parameters: { layout: 'centered' },
  };

  export default preview;
  ```

- [ ] 9.4 Create a smoke story `src/ui-kit/providers/KitProvider.stories.tsx`. It isn't tagged `visual`; it only proves the setup works.

  ```tsx
  import type { Meta, StoryObj } from '@storybook/react-vite';
  import { useKitDirection } from './KitProvider';

  const DirectionLabel = () => <span>direction: {useKitDirection()}</span>;

  const meta = {
    title: 'UI kit/KitProvider',
    component: DirectionLabel,
  } satisfies Meta<typeof DirectionLabel>;
  export default meta;

  export const LeftToRight: StoryObj<typeof meta> = {};
  export const RightToLeft: StoryObj<typeof meta> = {
    parameters: { direction: 'rtl' },
  };
  ```

- [ ] 9.5 Run `npm run build-storybook -w ketcher-react`. Expected: success, with `packages/ketcher-react/storybook-static/index.json` listing `ui-kit-kitprovider--left-to-right`. If Storybook fails because the macromolecules glob matches no files, remove that glob for now and leave a comment. Sub-project #2 adds it back with the first macromolecules story.
- [ ] 9.6 **Code check:** `npm run test -w ketcher-react` passes. The stories are type-checked and linted, and `storybook-static` is ignored by prettier, eslint and stylelint.
- [ ] 9.7 **Visual check:** run `npm run storybook -w ketcher-react` and open `http://localhost:6006`. Both KitProvider stories render, and the RTL one says `direction: rtl`.
- [ ] 9.8 **STOP:** ask to commit, using the message `#12193 - Add Storybook for the UI kit`.

## 10. Story screenshot tests (Playwright `ui-kit` project)

> **Gate:** this section writes Playwright tests. Before starting it:
>
> 1. ask the user whether to proceed;
> 2. read `.memory-bank/testing.md`;
> 3. draft an e2e test plan per `.memory-bank/e2e-test-plan-template.md` and get it approved.
>
> The code below is the proposed starting point for that plan.

**Files:**

- Create:
  - `ketcher-autotests/tests/ui-kit/stories.spec.ts`
  - `ketcher-autotests/test_run_ui_kit.sh`
  - `.github/workflows/ui-kit-visual.yml`
- Modify: `ketcher-autotests/playwright.config.ts`, `ketcher-autotests/package.json`

- [ ] 10.1 Ask the user to proceed. Then read `testing.md`, write the test plan per the template, and wait for approval.
- [ ] 10.2 Add the project to `playwright.config.ts`:
  - make the `chromium` project ignore the kit specs, by changing its `testIgnore` to `['**/Chromium-popup/**/*.ts', '**/ui-kit/**']`;
  - append the new project:
    ```ts
    {
      name: 'ui-kit',
      testMatch: '**/ui-kit/**/*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 640, height: 360 },
        baseURL: process.env.STORYBOOK_URL ?? 'http://127.0.0.1:6006',
        launchOptions: { headless: true, args: ['--disable-gpu', '--no-sandbox'] },
      },
    },
    ```
- [ ] 10.3 Create `tests/ui-kit/stories.spec.ts`. It generates one test per `visual` story, so there is no per-story test code:

  ```ts
  import { expect, test } from '@playwright/test';
  import { readFileSync } from 'node:fs';
  import path from 'node:path';

  interface StoryIndexEntry {
    id: string;
    title: string;
    name: string;
    type: 'story' | 'docs';
    tags?: string[];
  }

  const STORYBOOK_STATIC_DIR =
    process.env.STORYBOOK_STATIC_DIR ??
    path.resolve(__dirname, '../../../packages/ketcher-react/storybook-static');

  const { entries } = JSON.parse(
    readFileSync(path.join(STORYBOOK_STATIC_DIR, 'index.json'), 'utf8'),
  ) as { entries: Record<string, StoryIndexEntry> };

  const visualStories = Object.values(entries).filter(
    (entry) => entry.type === 'story' && entry.tags?.includes('visual'),
  );

  for (const story of visualStories) {
    test(`${story.title} › ${story.name}`, async ({ page }) => {
      await page.goto(`/iframe.html?id=${story.id}&viewMode=story`);
      await page.locator('#storybook-root > *').first().waitFor();
      await page.evaluate(() => document.fonts.ready);
      await expect(page).toHaveScreenshot(`${story.id}.png`, {
        animations: 'disabled',
        caret: 'hide',
        maxDiffPixels: 0,
      });
    });
  }
  ```

- [ ] 10.4 Create the Docker runner `ketcher-autotests/test_run_ui_kit.sh`. It expects `packages/ketcher-react/storybook-static` to be built on the host first:

  ```sh
  #!/bin/sh
  set -ex
  cd /ketcher/packages/ketcher-react
  nohup npx --yes http-server@14.1.1 storybook-static -p 6006 -s &
  sleep 2
  cd /app
  STORYBOOK_URL=http://127.0.0.1:6006 npx playwright test --project=ui-kit "$@"
  ```

  Then add scripts to `ketcher-autotests/package.json`:

  ```json
  "docker:test-ui-kit": "docker-compose run --rm autotests bash /app/test_run_ui_kit.sh",
  "docker:update-ui-kit": "docker-compose run --rm autotests bash /app/test_run_ui_kit.sh --update-snapshots=changed"
  ```

- [ ] 10.5 Create `.github/workflows/ui-kit-visual.yml`:

  ```yaml
  name: UI kit visual tests
  on:
    pull_request:
      branches: [master, 'release/**']
      paths:
        - 'packages/ketcher-react/**'
        - 'packages/ketcher-macromolecules/**'
        - 'ketcher-autotests/tests/ui-kit/**'
        - 'postcss.config.cjs'
    workflow_dispatch:
  jobs:
    stories:
      runs-on: ubuntu-latest
      container: mcr.microsoft.com/playwright:v1.62.1-jammy
      steps:
        - uses: actions/checkout@v7
          with:
            fetch-depth: 1
        - name: Install dependencies
          run: npm ci
        - name: Build Storybook
          run: npm run build-storybook -w ketcher-react
        - name: Run story screenshots
          run: |
            cd packages/ketcher-react && nohup npx --yes http-server@14.1.1 storybook-static -p 6006 -s > /dev/null 2>&1 &
            sleep 2
            cd ketcher-autotests
            npx playwright install chromium
            STORYBOOK_URL=http://127.0.0.1:6006 npx playwright test --project=ui-kit
        - uses: actions/upload-artifact@v7
          if: always()
          with:
            name: ui-kit-visual-report
            path: ketcher-autotests/playwright-report/
            retention-days: 5
  ```

- [ ] 10.6 Prove the pipeline works with an empty set of `visual` stories:
  ```bash
  npm run build-storybook -w ketcher-react
  cd ketcher-autotests && npm run docker:test-ui-kit
  ```
  Expected: `0 tests` and success. There are no `visual` stories yet; Section 11 adds the first.
- [ ] 10.7 **Code check:** `npm run check:code` in `ketcher-autotests` passes.
- [ ] 10.8 **STOP:** ask to commit, using the message `#12193 - Add story screenshot tests for the UI kit`.

## 11. Move `Icon` into the kit

**Files:**

- Move: `packages/ketcher-react/src/components/Icon/**` to `packages/ketcher-react/src/ui-kit/components/Icon/**`
- Create:
  - `packages/ketcher-react/src/components/Icon/index.tsx` (re-export shim)
  - `packages/ketcher-react/src/components/Icon/iconNameKeys.test.ts`
  - `packages/ketcher-react/src/ui-kit/components/Icon/Icon.test.tsx`
  - `packages/ketcher-react/src/ui-kit/components/Icon/Icon.stories.tsx`
- Modify: `packages/ketcher-react/src/ui-kit/index.ts`, `scripts/ui-kit/legacyStylingAllowlist.mjs` (only if paths change)

**Interfaces:** unchanged. `Icon`, `getIconName`, `IconName` and `IIconProps` are still exported from `'ketcher-react'` and from `components`.

- [ ] 11.1 Write the drift test **outside** the kit, because it may import `ketcher-core`. Create `src/components/Icon/iconNameKeys.test.ts`:

  ```ts
  import {
    CREATE_MONOMER_TOOL_NAME,
    IMAGE_KEY,
    MULTITAIL_ARROW_TOOL_NAME,
  } from 'ketcher-core';
  import { getIconName } from 'src/ui-kit';

  // The kit cannot import ketcher-core, so the icon map spells these keys as string
  // literals. This test fails if ketcher-core renames them.
  it.each([CREATE_MONOMER_TOOL_NAME, IMAGE_KEY, MULTITAIL_ARROW_TOOL_NAME])(
    'has an icon for ketcher-core key %s',
    (key) => {
      expect(getIconName(key)).toBe(key);
    },
  );
  ```

  And `src/ui-kit/components/Icon/Icon.test.tsx`:

  ```tsx
  import { render, screen } from '@testing-library/react';
  import { Icon } from '../../index';

  it('renders the named icon and forwards the test id', () => {
    render(<Icon name="about" dataTestId="about-icon" />);
    expect(screen.getByTestId('about-icon')).toBeInTheDocument();
  });
  ```

- [ ] 11.2 Run `npx jest src/components/Icon src/ui-kit/components/Icon`. Expected: FAIL, because `getIconName`/`Icon` aren't exported from `src/ui-kit` yet.
- [ ] 11.3 Move the files and fix the paths:

  ```bash
  cd packages/ketcher-react/src
  mkdir -p ui-kit/components
  git mv components/Icon ui-kit/components/Icon
  sed -i '' "s#'../../../assets/icons/files/#'../../../../assets/icons/files/#" ui-kit/components/Icon/utils/iconNameToIcon.ts
  ```

  In `ui-kit/components/Icon/utils/iconNameToIcon.ts`:
  - replace the `import { CREATE_MONOMER_TOOL_NAME, IMAGE_KEY, MULTITAIL_ARROW_TOOL_NAME } from 'ketcher-core';` block with local constants carrying the same values:
    ```ts
    // Mirrors ketcher-core constants (kit code cannot import ketcher-core);
    // src/components/Icon/iconNameKeys.test.ts guards against drift.
    const MULTITAIL_ARROW_TOOL_NAME = 'reaction-arrow-multitail';
    const IMAGE_KEY = 'images';
    const CREATE_MONOMER_TOOL_NAME = 'create-monomer';
    ```
  - remove any license-header duplication introduced by the move.

  Then create the shim `src/components/Icon/index.tsx`:

  ```tsx
  export {
    Icon,
    getIconName,
    type IconName,
    type IIconProps,
  } from '../../ui-kit';
  ```

  Then add to `src/ui-kit/index.ts`:

  ```ts
  export {
    Icon,
    getIconName,
    type IconName,
    type IIconProps,
  } from './components/Icon';
  ```

- [ ] 11.4 Run `npx jest src/components/Icon src/ui-kit/components/Icon`. Expected: PASS (4 tests).
- [ ] 11.5 Add the first visual story, `src/ui-kit/components/Icon/Icon.stories.tsx`:

  ```tsx
  import type { Meta, StoryObj } from '@storybook/react-vite';
  import { Icon } from './index';
  import type { IconName } from './types';

  const SAMPLE: IconName[] = [
    'about',
    'bond-single',
    'erase',
    'zoom-in',
    'settings',
    'help',
  ];

  const IconGrid = () => (
    <div style={{ display: 'flex', gap: 8 }}>
      {SAMPLE.map((name) => (
        <Icon key={name} name={name} />
      ))}
    </div>
  );

  const meta = {
    title: 'UI kit/Icon',
    component: IconGrid,
    tags: ['visual'],
  } satisfies Meta<typeof IconGrid>;
  export default meta;

  export const Sample: StoryObj<typeof meta> = {};
  ```

  If any name in `SAMPLE` isn't a key of `iconNameToIcon`, TypeScript fails. Replace it with an existing key.

- [ ] 11.6 Generate the first baseline:
  ```bash
  npm run build-storybook -w ketcher-react && (cd ketcher-autotests && npm run docker:update-ui-kit)
  ```
  Expected: `ketcher-autotests/tests/ui-kit/stories.spec.ts-snapshots/ui-kit-icon--sample-ui-kit-linux.png` is created. Check it shows the six icons.
- [ ] 11.7 **Code check:**
  - `npm test` at the root passes. Macromolecules still compiles against `Icon` from `'ketcher-react'`.
  - `npm run test:ui-kit-scripts` passes.
  - `npm run check:ui-kit-metrics` passes.
- [ ] 11.8 **Visual check:** the example app's toolbars and the macromolecules library icons look unchanged.
- [ ] 11.9 **STOP:** ask to commit, including the baseline PNG, using the message `#12193 - Move Icon into the UI kit`.

## 12. Tooltip characterisation (legacy MUI stories and baselines)

**Files:**

- Create: `packages/ketcher-react/src/script/ui/legacyStories/Tooltip.legacy.stories.tsx`
- Modify: `scripts/ui-kit/legacyStylingAllowlist.mjs`, to add this file. It imports `@mui/material` and is deleted in Section 13.

The story names below are the **contract** for Section 13. The kit stories reuse the same `title` and export names, so their story IDs, and therefore their baselines, stay the same.

- [ ] 12.1 Add `'packages/ketcher-react/src/script/ui/legacyStories/Tooltip.legacy.stories.tsx'` to `LEGACY_STYLING_ALLOWLIST`, keeping the list sorted.
- [ ] 12.2 Create `Tooltip.legacy.stories.tsx`. It reproduces the three MUI looks exactly as the call sites configure them:

  ```tsx
  import { Tooltip } from '@mui/material';
  import type { Meta, StoryObj } from '@storybook/react-vite';
  import type { ReactNode } from 'react';

  // Characterisation of today's MUI tooltips (ui-kit-foundation, Section 12).
  // Deleted when the kit Tooltip takes over the same story IDs in Section 13.
  const LIGHT_SX = {
    maxWidth: '220px',
    padding: '12px',
    backgroundColor: 'white',
    color: 'rgba(0, 0, 0, 0.87)',
    boxShadow: '0 1px 5px 0 #CCCCCC',
    fontSize: 11,
  };
  const LONG_TEXT =
    'Hydrophobicity is calculated as the sum of the hydrophobicity values of the monomers divided by the number of monomers';

  const Anchor = ({ children = 'Anchor' }: { children?: ReactNode }) => (
    <button type="button">{children}</button>
  );

  const meta = { title: 'UI kit/Tooltip', tags: ['visual'] } satisfies Meta;
  export default meta;
  type Story = StoryObj<typeof meta>;

  export const DarkBottom: Story = {
    render: () => (
      <Tooltip title="Short tooltip text" open>
        <Anchor />
      </Tooltip>
    ),
  };

  export const DarkLongText: Story = {
    render: () => (
      <Tooltip title={LONG_TEXT} open>
        <Anchor />
      </Tooltip>
    ),
  };

  export const DarkRight: Story = {
    render: () => (
      <Tooltip
        title="Attachment group cannot be created"
        placement="right"
        open
        slotProps={{ tooltip: { sx: { backgroundColor: '#333333' } } }}
      >
        <Anchor>Create attachment group</Anchor>
      </Tooltip>
    ),
  };

  export const LightBottom: Story = {
    render: () => (
      <Tooltip title={LONG_TEXT} open slotProps={{ tooltip: { sx: LIGHT_SX } }}>
        <Anchor />
      </Tooltip>
    ),
  };

  export const RightToLeft: Story = {
    parameters: { direction: 'rtl' },
    render: () => (
      <Tooltip title="Short tooltip text" open>
        <Anchor />
      </Tooltip>
    ),
  };
  ```

- [ ] 12.3 Generate the legacy baselines:
  ```bash
  npm run build-storybook -w ketcher-react && (cd ketcher-autotests && npm run docker:update-ui-kit)
  ```
  Expected: five new PNGs named `ui-kit-tooltip--{dark-bottom,dark-long-text,dark-right,light-bottom,right-to-left}-ui-kit-linux.png`. Open each one, and check it shows the tooltip with the right look and placement.
- [ ] 12.4 **Code check:** `npm run test -w ketcher-react` and `npm run test:ui-kit-scripts` pass.
- [ ] 12.5 **STOP:** ask to commit, using the message `#12193 - Characterise MUI tooltips in Storybook`.

## 13. Kit `Tooltip`

**Files:**

- Create, under `packages/ketcher-react/src/ui-kit/components/Tooltip/`:
  - `Tooltip.tsx`, `Tooltip.module.css`, `Tooltip.test.tsx`
  - `Tooltip.stories.tsx`, `Tooltip.stories.module.css`
  - `index.ts`
- Delete: `packages/ketcher-react/src/script/ui/legacyStories/Tooltip.legacy.stories.tsx`, and its allowlist entry
- Modify: `packages/ketcher-react/src/ui-kit/index.ts`

**Interfaces produced** (Section 14 uses these):

```ts
type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';
type TooltipVariant = 'dark' | 'light';
interface TooltipProps {
  title: ReactNode; // falsy except 0: no tooltip, child rendered as-is
  children: ReactElement; // must accept DOM props and a ref (same as MUI)
  placement?: TooltipPlacement; // default 'bottom'
  variant?: TooltipVariant; // default 'dark'
  className?: string; // merged onto the popup
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  'data-testid'?: string; // on the popup
}
```

The popup reads `--ketcher-tooltip-background`, a component-scoped custom property, before falling back to its variant colour.

- [ ] 13.1 Write the failing tests in `Tooltip.test.tsx`:

  ```tsx
  import { render, screen } from '@testing-library/react';
  import userEvent from '@testing-library/user-event';
  import { KitProvider } from '../../providers';
  import { Tooltip } from './Tooltip';

  const renderInProvider = (ui: React.ReactElement) =>
    render(<KitProvider direction="ltr">{ui}</KitProvider>);

  describe('Tooltip', () => {
    it.each([null, undefined, false])(
      'renders only the child when title is %p',
      (title) => {
        renderInProvider(
          <Tooltip title={title} defaultOpen>
            <button type="button">anchor</button>
          </Tooltip>,
        );
        expect(screen.getByRole('button')).not.toHaveAttribute('aria-label');
        expect(
          document.querySelector('[data-ketcher-portal-root]'),
        ).toBeEmptyDOMElement();
      },
    );

    it('treats an empty string like MUI: no tooltip, empty aria-label', () => {
      renderInProvider(
        <Tooltip title="" defaultOpen>
          <button type="button">anchor</button>
        </Tooltip>,
      );
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', '');
      expect(
        document.querySelector('[data-ketcher-portal-root]'),
      ).toBeEmptyDOMElement();
    });

    it('shows a numeric 0 title', () => {
      renderInProvider(
        <Tooltip title={0} defaultOpen>
          <button type="button">anchor</button>
        </Tooltip>,
      );
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('labels the child with a string title unless the child has its own label', () => {
      renderInProvider(
        <>
          <Tooltip title="Save">
            <button type="button">a</button>
          </Tooltip>
          <Tooltip title="Ignored">
            <button type="button" aria-label="Own label">
              b
            </button>
          </Tooltip>
        </>,
      );
      expect(screen.getByText('a')).toHaveAttribute('aria-label', 'Save');
      expect(screen.getByText('b')).toHaveAttribute('aria-label', 'Own label');
    });

    it('renders the popup inside the nearest portal root, with fixed positioning', () => {
      renderInProvider(
        <Tooltip title="Hello" defaultOpen data-testid="tooltip">
          <button type="button">anchor</button>
        </Tooltip>,
      );
      const popup = screen.getByTestId('tooltip');
      expect(popup.closest('[data-ketcher-portal-root]')).not.toBeNull();
      expect(popup.parentElement).toHaveStyle({ position: 'fixed' });
    });

    it('falls back to document.body without a provider', () => {
      render(
        <Tooltip title="Hello" defaultOpen data-testid="tooltip">
          <button type="button">anchor</button>
        </Tooltip>,
      );
      expect(
        screen.getByTestId('tooltip').closest('[data-ketcher-portal-root]'),
      ).toBeNull();
    });

    it('applies variant, placement and className to the popup', () => {
      renderInProvider(
        <Tooltip
          title="Hi"
          defaultOpen
          variant="light"
          placement="right"
          className="extra"
          data-testid="tooltip"
        >
          <button type="button">anchor</button>
        </Tooltip>,
      );
      const popup = screen.getByTestId('tooltip');
      expect(popup).toHaveAttribute('data-variant', 'light');
      expect(popup).toHaveAttribute('data-side', 'right');
      expect(popup).toHaveClass('extra');
    });

    it('opens on hover and reports the change', async () => {
      const onOpenChange = jest.fn();
      renderInProvider(
        <Tooltip title="Hover text" onOpenChange={onOpenChange}>
          <button type="button">anchor</button>
        </Tooltip>,
      );
      await userEvent.hover(screen.getByRole('button'));
      expect(await screen.findByText('Hover text')).toBeInTheDocument();
      expect(onOpenChange).toHaveBeenCalledWith(true);
    });
  });
  ```

- [ ] 13.2 Run `npx jest src/ui-kit/components/Tooltip`. Expected: FAIL with `Cannot find module './Tooltip'`.
- [ ] 13.3 Implement `Tooltip.tsx`:

  ```tsx
  import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';
  import clsx from 'clsx';
  import { cloneElement, type ReactElement, type ReactNode } from 'react';
  import { usePortalContainer } from '../../providers';
  import styles from './Tooltip.module.css';

  export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';
  export type TooltipVariant = 'dark' | 'light';

  export interface TooltipProps {
    /** Falsy values (except 0) render the child without a tooltip, like MUI. */
    title: ReactNode;
    /** A single element that accepts DOM props and a ref. */
    children: ReactElement<{ 'aria-label'?: string }>;
    placement?: TooltipPlacement;
    variant?: TooltipVariant;
    className?: string;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    'data-testid'?: string;
  }

  // Parity with MUI Tooltip defaults: enterDelay 100 ms, leaveDelay 0,
  // 14 px gap (12 px offset + the popup's 2 px margin).
  const OPEN_DELAY_MS = 100;
  const SIDE_OFFSET_PX = 12;

  const hasTitle = (title: ReactNode) =>
    typeof title === 'number' || Boolean(title);

  // MUI labels the child with a string title; a label set on the child wins.
  const childAriaLabel = (title: ReactNode, child: TooltipProps['children']) =>
    'aria-label' in child.props
      ? child.props['aria-label']
      : typeof title === 'string'
        ? title
        : undefined;

  export const Tooltip = ({
    title,
    children,
    placement = 'bottom',
    variant = 'dark',
    className,
    open,
    defaultOpen,
    onOpenChange,
    'data-testid': dataTestId,
  }: TooltipProps) => {
    const portalContainer = usePortalContainer();
    const trigger = cloneElement(children, {
      'aria-label': childAriaLabel(title, children),
    });

    if (!hasTitle(title)) {
      return trigger;
    }

    return (
      <BaseTooltip.Root
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={
          onOpenChange ? (nextOpen) => onOpenChange(nextOpen) : undefined
        }
      >
        <BaseTooltip.Trigger
          render={trigger}
          delay={OPEN_DELAY_MS}
          closeDelay={0}
          closeOnClick={false}
        />
        <BaseTooltip.Portal container={portalContainer}>
          <BaseTooltip.Positioner
            className={styles.positioner}
            side={placement}
            sideOffset={SIDE_OFFSET_PX}
            positionMethod="fixed"
          >
            <BaseTooltip.Popup
              className={clsx(styles.popup, className)}
              data-variant={variant}
              data-testid={dataTestId}
            >
              {title}
            </BaseTooltip.Popup>
          </BaseTooltip.Positioner>
        </BaseTooltip.Portal>
      </BaseTooltip.Root>
    );
  };
  ```

  Then `Tooltip.module.css`. The values come from MUI v5's Tooltip, and the `line-height`, `text-align`, `white-space` and `box-sizing` pins replace what MUI inherited from `<body>`:

  ```css
  .positioner {
    z-index: var(--ketcher-z-index-tooltip);
  }

  .popup {
    box-sizing: content-box;
    max-inline-size: 300px;
    margin: 2px;
    padding: 4px 8px;
    border-radius: var(--ketcher-radius-tooltip);
    background-color: var(
      --ketcher-tooltip-background,
      var(--ketcher-color-tooltip-dark-background)
    );
    color: var(--ketcher-color-tooltip-dark-text);
    font-family: var(--ketcher-font-family-tooltip);
    font-size: var(--ketcher-font-size-tooltip);
    font-style: normal;
    font-weight: var(--ketcher-font-weight-tooltip);
    line-height: 1.15;
    text-align: start;
    white-space: normal;
    overflow-wrap: break-word;
    transform-origin: var(--transform-origin);
    transition:
      opacity 150ms,
      transform 150ms;

    &[data-variant='light'] {
      max-inline-size: 220px;
      padding: 12px;
      background-color: var(
        --ketcher-tooltip-background,
        var(--ketcher-color-tooltip-light-background)
      );
      color: var(--ketcher-color-tooltip-light-text);
      font-size: var(--ketcher-font-size-tooltip-light);
      box-shadow: var(--ketcher-shadow-tooltip-light);
    }

    &[data-starting-style],
    &[data-ending-style] {
      opacity: 0;
      transform: scale(0.75);
    }
  }
  ```

  Then `index.ts`:

  ```ts
  export {
    Tooltip,
    type TooltipProps,
    type TooltipPlacement,
    type TooltipVariant,
  } from './Tooltip';
  ```

  Finally, add to `src/ui-kit/index.ts`:

  ```ts
  export {
    Tooltip,
    type TooltipProps,
    type TooltipPlacement,
    type TooltipVariant,
  } from './components/Tooltip';
  ```

- [ ] 13.4 Run `npx jest src/ui-kit/components/Tooltip`. Expected: PASS (10 tests). If the `data-side` or fixed-position assertions fail because Base UI names an attribute or style differently in 1.9, check the installed `@base-ui/react/tooltip` typings and adjust the **test selectors only**. The behaviour requirement stays.
- [ ] 13.5 Swap the stories, keeping the same story IDs:
  - delete `src/script/ui/legacyStories/Tooltip.legacy.stories.tsx` and its allowlist entry;
  - create `Tooltip.stories.module.css`:

    ```css
    /* Mirrors AttachmentGroupActionMenuItem's darker tooltip. */
    .darkerBackground {
      --ketcher-tooltip-background: var(--ketcher-color-text-primary);
    }
    ```

  - create `Tooltip.stories.tsx`:

    ```tsx
    import type { Meta, StoryObj } from '@storybook/react-vite';
    import type { ReactNode } from 'react';
    import { Tooltip } from './Tooltip';
    import storyStyles from './Tooltip.stories.module.css';

    const LONG_TEXT =
      'Hydrophobicity is calculated as the sum of the hydrophobicity values of the monomers divided by the number of monomers';

    const Anchor = ({ children = 'Anchor' }: { children?: ReactNode }) => (
      <button type="button">{children}</button>
    );

    const meta = { title: 'UI kit/Tooltip', tags: ['visual'] } satisfies Meta;
    export default meta;
    type Story = StoryObj<typeof meta>;

    export const DarkBottom: Story = {
      render: () => (
        <Tooltip title="Short tooltip text" defaultOpen>
          <Anchor />
        </Tooltip>
      ),
    };

    export const DarkLongText: Story = {
      render: () => (
        <Tooltip title={LONG_TEXT} defaultOpen>
          <Anchor />
        </Tooltip>
      ),
    };

    export const DarkRight: Story = {
      render: () => (
        <Tooltip
          title="Attachment group cannot be created"
          placement="right"
          className={storyStyles.darkerBackground}
          defaultOpen
        >
          <Anchor>Create attachment group</Anchor>
        </Tooltip>
      ),
    };

    export const LightBottom: Story = {
      render: () => (
        <Tooltip title={LONG_TEXT} variant="light" defaultOpen>
          <Anchor />
        </Tooltip>
      ),
    };

    export const RightToLeft: Story = {
      parameters: { direction: 'rtl' },
      render: () => (
        <Tooltip title="Short tooltip text" defaultOpen>
          <Anchor />
        </Tooltip>
      ),
    };
    ```

- [ ] 13.6 Run the parity gate against the legacy baselines. **Do not update them.**
  ```bash
  npm run build-storybook -w ketcher-react && (cd ketcher-autotests && npm run docker:test-ui-kit)
  ```
  Expected: all 6 stories pass with zero diff (5 Tooltip and 1 Icon). If a story differs:
  - Open the Playwright HTML report and compare.
  - Adjust only `Tooltip.module.css`, or the `SIDE_OFFSET_PX` and `collisionPadding` values, and re-run.
  - If the one remaining difference is intended, update that single baseline with `docker:update-ui-kit` and record the justification in the section report. The likely candidate is `RightToLeft`, because the kit now inherits the editor's direction where MUI used `<body>`'s.
- [ ] 13.7 **Code check:**
  - `npm run test -w ketcher-react` passes.
  - `npm run test:ui-kit-scripts` passes.
  - `npm run check:ui-kit-metrics` passes.
- [ ] 13.8 **STOP:** ask to commit, using the message `#12193 - Add UI kit Tooltip on Base UI`.

## 14. Migrate every MUI `Tooltip` call site

**Files:**

- Modify (ketcher-react, import from `'src/ui-kit'`):
  - `src/script/ui/component/form/form/form.tsx` (lines 40, 270, 297)
  - `src/script/ui/component/form/MeasureInput/measure-input.tsx` (lines 33, 181)
  - `src/script/ui/views/components/ContextMenu/menuItems/AttachmentGroupActionMenuItem.tsx` (lines 1, 47–61), plus its module stylesheet
- Modify (macromolecules, import from `'ketcher-react'`):
  - `src/components/monomerLibrary/RnaPresetItem/RnaPresetItem.tsx` (lines 37, 122)
  - `src/components/monomerLibrary/RnaBuilder/RnaEditor/RnaEditorExpanded/RnaEditorExpanded.tsx` (lines 92, 490, 535, 706, 719)
  - `src/components/monomerLibrary/monomerLibraryItem/MonomerItem.tsx` (lines 40, 210)
  - `src/components/macromoleculeProperties/MacromoleculePropertiesWindow.tsx` (lines 50, 203–214, 424–431)
  - `src/components/modal/Settings/SettingsField.tsx` (lines 17, 65)
- Modify:
  - `packages/ketcher-macromolecules/src/types/ketcher-react.d.ts`
  - `packages/ketcher-macromolecules/src/testMocks/ketcher-react.tsx`
  - `scripts/ui-kit/legacyStylingAllowlist.mjs`
  - `scripts/ui-kit/metrics-baseline.json`

- [ ] 14.1 Declare the kit `Tooltip` for macromolecules:
  - In `src/types/ketcher-react.d.ts`, add:
    ```ts
    export const Tooltip: React.ComponentType<{
      title: React.ReactNode;
      children: React.ReactElement;
      placement?: 'top' | 'bottom' | 'left' | 'right';
      variant?: 'dark' | 'light';
      className?: string;
      open?: boolean;
      defaultOpen?: boolean;
      onOpenChange?: (open: boolean) => void;
      'data-testid'?: string;
    }>;
    ```
  - In `src/testMocks/ketcher-react.tsx`, add a pass-through that keeps MUI's `aria-label` semantics, so existing tests that query by label keep working:
    ```tsx
    export const Tooltip = ({
      title,
      children,
    }: {
      title: React.ReactNode;
      children: React.ReactElement<{ 'aria-label'?: string }>;
    }) =>
      React.cloneElement(children, {
        'aria-label':
          'aria-label' in children.props
            ? children.props['aria-label']
            : typeof title === 'string'
              ? title
              : undefined,
      });
    ```
- [ ] 14.2 Make the mechanical swaps. Each of these keeps `title` and its children unchanged and only changes the import:
  - `form.tsx`: `import { Tooltip } from '@mui/material';` becomes `import { Tooltip } from 'src/ui-kit';`.
  - `measure-input.tsx`: same change.
  - `RnaPresetItem.tsx`, `RnaEditorExpanded.tsx`, `MonomerItem.tsx`: `import Tooltip from '@mui/material/Tooltip';` becomes `import { Tooltip } from 'ketcher-react';`.
  - `SettingsField.tsx`: remove `Tooltip` from the `@mui/material` import, and add `import { Tooltip } from 'ketcher-react';`. The file keeps its other MUI imports and stays allowlisted.
- [ ] 14.3 `AttachmentGroupActionMenuItem.tsx`: replace the MUI import with `import { Tooltip } from 'src/ui-kit';`, then replace the `slotProps` with a class:
  ```tsx
  <Tooltip
    title={
      isAttachmentGroupCreateDisabled
        ? ATTACHMENT_GROUP_CREATION_DISABLED_TOOLTIP
        : ''
    }
    placement="right"
    className={styles.attachmentGroupTooltip}
  >
    <span className={styles.tooltipTarget}>Create attachment group</span>
  </Tooltip>
  ```
  Then add to the stylesheet this file already imports as `styles`:
  ```less
  .attachmentGroupTooltip {
    --ketcher-tooltip-background: var(--ketcher-color-text-primary);
  }
  ```
- [ ] 14.4 `MacromoleculePropertiesWindow.tsx`:
  - delete `StyledTooltip` (lines 203–214) and the `@mui/material/Tooltip` import;
  - import `{ Tooltip } from 'ketcher-react'`;
  - at line 424, render `<Tooltip title={props.hint} variant="light">…</Tooltip>`, keeping the existing children.
- [ ] 14.5 Shrink the allowlist and the metrics:
  ```bash
  node scripts/ui-kit/generateLegacyAllowlist.mjs
  node scripts/ui-kit/metrics.mjs --write
  git diff --stat scripts/ui-kit/
  ```
  Expected:
  - the allowlist **loses** the files that no longer import MUI or Emotion, and gains none;
  - `muiImportFiles` drops;
  - `grep -rn "Tooltip" packages/*/src --include='*.tsx' | grep "@mui"` prints nothing.
- [ ] 14.6 **Code check:**
  - `npm test` at the root passes.
  - `npm run test:ui-kit-scripts` passes.
  - `npm run check:ui-kit-metrics` passes.
  - `npm run build-storybook -w ketcher-react && (cd ketcher-autotests && npm run docker:test-ui-kit)` passes with zero diff.
  - `npm run build:packages && npm run build -w example-ssr` succeeds. Kit modules must not touch `window` or `document` at import time.
- [ ] 14.7 **Visual check (call sites without e2e screenshot coverage).** Check each item in the example app and list it in the report:
  1. Settings dialog: hover the ⓘ icons; the tooltip appears below, dark.
  2. Atom/bond property forms: label tooltips.
  3. Measure inputs (Settings, the size fields): ⓘ tooltip.
  4. Context menu on a selection where attachment group creation is disabled: the tooltip appears to the right, with the darker background.
  5. Monomer library: hover the autochain icon on a monomer item and on an RNA preset item. The tooltip must not be clipped by the scrolling list.
  6. RNA builder (expanded): phosphate-position options and the trigger tooltip; the "Add to presets"/"Save" disabled-reason tooltips.
  7. Macromolecule properties window: hover the hydrophobicity hint; light look, max 220 px wide.
  8. Repeat 5 and 7 in **fullscreen** mode. The tooltips must be visible; under MUI they rendered into `<body>` outside the fullscreen element.
- [ ] 14.8 **STOP:** ask to commit, using the message `#12193 - Migrate MUI tooltips to the UI kit Tooltip`.
- [ ] 14.9 **Sub-project #1 gate.** Ask the user to push. The draft PR's CI must show:
  - full e2e green with **no baseline updates**;
  - the `UI kit visual tests` workflow green;
  - `ci.yml` green, including tooling tests and metrics.

## 15. Documentation and release notes

**Files:**

- Modify: `README.md` (repo root)
- Create: `openspec/changes/ui-kit-foundation/release-notes.md`

- [ ] 15.1 In `README.md`, add a **Supported browsers** subsection, next to the existing integration/setup docs. It says:
  - Ketcher's styles target Chrome/Edge 111+, Firefox 114+ and Safari 16.4+, per #11997;
  - the JavaScript syntax level is unchanged for now.
- [ ] 15.2 Create `release-notes.md` with the host-visible changes, for the next release's notes:
  - new `--ketcher-*` CSS custom properties are declared on `:root`. Override them on an ancestor of the editor to theme UI chrome;
  - UI-chrome overrides passed through the macromolecules `Editor` `theme` prop are **deprecated** (canvas colours still work). Tooltips no longer read them;
  - tooltips now render inside the editor root (`[data-ketcher-portal-root]`) instead of `<body>`. Host CSS that targeted `.MuiTooltip-*` no longer applies;
  - the CSS browser floor is documented.
- [ ] 15.3 Do **not** update the memory bank here. That happens at `/opsx:archive` (CLAUDE.md).
- [ ] 15.4 **STOP:** ask to commit, using the message `#12193 - Document browser floor and UI kit release notes`.
