import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';

// Run after build:core, as CI does. Native ESM must not inherit Jest's require.
it('loads built ESM without CommonJS globals and preserves SSR (#12610)', () => {
  expect(() =>
    execFileSync(process.execPath, ['--input-type=module'], {
      cwd: resolve(__dirname, '../..'),
      timeout: 30000,
      input: `
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const esmModule = new URL('./dist/application/render/raphael-ext.modern.js', import.meta.url);
assert.equal(typeof globalThis.require, 'undefined');
assert.equal((await import(esmModule.href)).default, undefined);
assert.equal(require('./dist/application/render/raphael-ext.js').default, undefined);

// Reuse the DOM implementation supplied by our existing Jest environment.
const { JSDOM } = createRequire(require.resolve('jest-environment-jsdom'))('jsdom');
const dom = new JSDOM();
globalThis.window = dom.window;
globalThis.document = dom.window.document;

try {
  // Re-evaluate the entry after its DOM-free import.
  const { default: Raphael } = await import(esmModule.href + '?browser');
  assert.equal(typeof Raphael, 'function');
  assert.equal(typeof Raphael.st.translateAbs, 'function');
  const transformations = [];
  Raphael.el.translateAbs.call({
    transform(value) { transformations.push(value); },
  }, 10, 20);
  assert.deepEqual(transformations, ['t10,20']);
} finally {
  dom.window.close();
}
`,
    }),
  ).not.toThrow();
});
