import { build } from 'vite';

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
