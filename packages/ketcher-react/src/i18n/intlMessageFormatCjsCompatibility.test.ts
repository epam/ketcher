import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { Script } from 'node:vm';

// Regression test for https://github.com/epam/ketcher/issues/12731.
//
// i18next-icu's CommonJS build does `require('intl-messageformat')` (see
// i18next-icu/dist/commonjs/index.js). Consumer apps that run Jest load that
// chain through Jest's CJS loader, which — unlike Vitest, and unlike Node's
// own `require()` since Node 22's require(esm) support — compiles
// node_modules files as plain (non-ESM) scripts and never transforms them.
// intl-messageformat@11 ships ESM-only (`"type": "module"`, top-level
// `import`/`export`, no `require` export condition), so that compilation
// throws `SyntaxError: Cannot use import statement outside a module` and
// crashes every consumer Jest suite that touches ketcher-react — Vitest
// never sees this because it treats intl-messageformat as real ESM.
//
// The fix was pinning intl-messageformat to a version that still ships a
// genuine CommonJS build (`^10.7.18` in this package's package.json). This
// test fails the moment that pin is bumped back to an ESM-only release,
// without needing Jest itself as a dependency: it reproduces Jest's node_modules
// loading by compiling the resolved file as a plain script, the same way the
// `vm.Script` call below does.
describe('intl-messageformat CJS compatibility (consumer Jest apps)', () => {
  const require = createRequire(import.meta.url);

  it('is not published as an ESM-only package', () => {
    // Read package.json straight off disk rather than through require(),
    // since an ESM-only release can omit "./package.json" from its exports
    // map entirely (as v11 does), which would make require() throw before
    // we even get to inspect "type".
    const entry = require.resolve('intl-messageformat');
    const packageJsonPath = join(dirname(entry), 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

    expect(packageJson.type).not.toBe('module');
  });

  it('compiles as plain CommonJS, the way Jest loads node_modules', () => {
    const entry = require.resolve('intl-messageformat');
    const source = readFileSync(entry, 'utf-8');

    expect(() => new Script(source, { filename: entry })).not.toThrow(
      /Cannot use import statement outside a module/,
    );
  });

  it('is the same copy i18next-icu requires at runtime', () => {
    // Resolve through the "require" export condition, same as Jest/Node's
    // require() would — not the "import"/"module" condition Vitest prefers.
    const i18nextIcuCjsEntry = require.resolve('i18next-icu');
    const i18nextIcuRequire = createRequire(i18nextIcuCjsEntry);

    expect(i18nextIcuRequire.resolve('intl-messageformat')).toBe(
      require.resolve('intl-messageformat'),
    );
  });
});
