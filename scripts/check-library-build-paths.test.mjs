import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { INDIGO_WORKER_IMPORTS } from '../build-config/indigo-worker-imports.mjs';

const packages = [
  'ketcher-core',
  'ketcher-standalone',
  'ketcher-macromolecules',
  'ketcher-react',
];

for (const packageName of packages) {
  test(`${packageName} uses native filesystem paths for build entries`, async () => {
    const packageUrl = new URL(`../packages/${packageName}/`, import.meta.url);
    const pkg = JSON.parse(
      readFileSync(new URL('package.json', packageUrl), 'utf8'),
    );
    const { default: config } = await import(
      new URL('vite.config.mjs', packageUrl).href
    );
    const expectedEntry = resolve(fileURLToPath(packageUrl), pkg.source);

    if (packageName === 'ketcher-standalone') {
      assert.deepEqual(config.build.lib.entry, { main: expectedEntry });
      assert.deepEqual(config.build.rolldownOptions.input, {
        main: expectedEntry,
      });
      const workerShim = config.resolve.alias['_indigo-worker-import-alias_'];
      const workerImport = ['wasm', 'wasmWithoutRender'].includes(
        process.env.INDIGO_MODULE_NAME,
      )
        ? INDIGO_WORKER_IMPORTS.WORKER_URL
        : INDIGO_WORKER_IMPORTS.INLINE;
      assert.equal(
        workerShim,
        resolve(
          fileURLToPath(packageUrl),
          'src/infrastructure/services/struct',
          workerImport,
        ),
      );
      assert.ok(existsSync(`${workerShim}.ts`));
    } else {
      assert.equal(config.build.lib.entry, expectedEntry);
      assert.equal(config.build.rolldownOptions.input, expectedEntry);
    }
    assert.ok(existsSync(expectedEntry));
  });
}
