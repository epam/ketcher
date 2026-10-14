import { execFileSync } from 'node:child_process';
import { cpSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'vite';
import { VARIANTS } from '../vite.config.mjs';

const rootDir = fileURLToPath(new URL('..', import.meta.url));
const typesDir = join(rootDir, '.types');

const variants = [
  { name: 'base64' },
  { name: 'base64Cjs' },
  { name: 'wasm' },
  { name: 'base64WithoutRender', separateIndigoRender: true },
  { name: 'base64WithoutRenderCjs', separateIndigoRender: true },
  { name: 'wasmWithoutRender', separateIndigoRender: true },
];

for (const { name, separateIndigoRender } of variants) {
  process.env.NODE_ENV = 'production';
  process.env.INDIGO_MODULE_NAME = name;

  if (separateIndigoRender) {
    process.env.SEPARATE_INDIGO_RENDER = 'true';
  } else {
    delete process.env.SEPARATE_INDIGO_RENDER;
  }

  await build();
}

// Declarations are emitted once and then copied into every variant dir. The
// copies are required: TypeScript with `moduleResolution: node10` ignores
// `exports`, so `ketcher-standalone/dist/binaryWasm` resolves by path to
// `dist/binaryWasm/index.d.ts`.
const tscBin = createRequire(import.meta.url).resolve('typescript/bin/tsc');
execFileSync(process.execPath, [tscBin, '-p', 'tsconfig.build.json'], {
  cwd: rootDir,
  stdio: 'inherit',
});

for (const { name } of variants) {
  cpSync(typesDir, join(rootDir, VARIANTS[name].dir), { recursive: true });
}

rmSync(typesDir, { recursive: true, force: true });
