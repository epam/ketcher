import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { createServer, resolveConfig } from 'vite';

const root = fileURLToPath(new URL('.', import.meta.url));
const standaloneSource = fileURLToPath(
  new URL('../packages/ketcher-standalone/src/index.ts', import.meta.url),
);
const binaryWasmImport = 'ketcher-standalone/dist/binaryWasm';
const raphaelEntry = fileURLToPath(
  new URL(
    '../packages/ketcher-core/src/application/render/raphael-ext.ts',
    import.meta.url,
  ),
);

test('example development resolves the binaryWasm entry to source without a library build', async () => {
  const server = await createServer({
    root,
    configFile: `${root}vite.config.js`,
    logLevel: 'silent',
    server: { middlewareMode: true },
    optimizeDeps: { noDiscovery: true, include: [] },
  });
  try {
    const resolved = await server.environments.client.pluginContainer.resolveId(
      binaryWasmImport,
      `${root}src/utils.ts`,
    );
    assert.equal(resolved?.id, standaloneSource);
    await server.environments.client.transformRequest('/src/utils.ts');
  } finally {
    await server.close();
  }
});

test('example development serves the Raphael entry with its require guard intact', async () => {
  const server = await createServer({
    root,
    configFile: `${root}vite.config.js`,
    logLevel: 'silent',
    server: { middlewareMode: true },
    optimizeDeps: { noDiscovery: true, include: [] },
  });
  try {
    const result = await server.environments.client.transformRequest(
      `/@fs/${raphaelEntry.replace(/^\//, '')}`,
    );
    assert.ok(result, 'the Raphael entry was not transformed');
    assert.doesNotMatch(result.code, /typeof\s+await\s+import/);
    assert.doesNotMatch(result.code, /typeof\s+require/);
    assert.match(result.code, /import\(/);
  } finally {
    await server.close();
  }
});

test('example production still consumes the built binaryWasm entry', async () => {
  const config = await resolveConfig(
    { root, configFile: `${root}vite.config.js`, logLevel: 'silent' },
    'build',
  );
  const sourceAlias = config.resolve.alias.find(({ find }) =>
    typeof find === 'string'
      ? binaryWasmImport === find || binaryWasmImport.startsWith(`${find}/`)
      : find.test(binaryWasmImport),
  );
  assert.equal(sourceAlias, undefined);
});
