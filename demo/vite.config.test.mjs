import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { resolveConfig } from 'vite';

const root = fileURLToPath(new URL('.', import.meta.url));

for (const [publicUrl, expectedBase] of [
  ['', '/'],
  ['/ketcher-demo', '/ketcher-demo/'],
  ['/ketcher-demo/', '/ketcher-demo/'],
  ['./', './'],
  ['https://example.org/ketcher-demo', 'https://example.org/ketcher-demo/'],
]) {
  test(`demo assets use the PUBLIC_URL base ${JSON.stringify(publicUrl)}`, async () => {
    const previousPublicUrl = process.env.PUBLIC_URL;
    process.env.PUBLIC_URL = publicUrl;
    try {
      const config = await resolveConfig(
        { root, configFile: `${root}vite.config.ts`, logLevel: 'silent' },
        'build',
      );
      assert.equal(config.base, expectedBase);
    } finally {
      if (previousPublicUrl === undefined) delete process.env.PUBLIC_URL;
      else process.env.PUBLIC_URL = previousPublicUrl;
    }
  });
}
