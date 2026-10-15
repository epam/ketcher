const fs = require('node:fs');
const path = require('node:path');
const Ajv = require('ajv').default;
const standaloneCode = require('ajv/dist/standalone').default;

const rootDir = path.resolve(__dirname, '..');
const schemaPath = path.resolve(
  rootDir,
  'src/domain/serializers/ket/schema.json',
);
const outputPath = path.resolve(
  rootDir,
  'src/domain/serializers/ket/compiledSchema.js',
);

const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
const ajv = new Ajv({
  allErrors: true,
  code: { source: true, esm: true },
  strict: false,
});
const validate = ajv.compile(schema);

// Even with `esm: true`, Ajv emits its runtime helpers as `require()` calls
// (ajv-validator/ajv#2209). Bundling the generated module with Ajv inlined
// turns those calls into plain ESM code, so the validator is self-contained
// and needs no hand-written rewrite.
// Vite's lib mode resolves `entry` to an absolute path before plugins run, so
// the virtual entry is an absolute (non-existent) file inside the package -
// that also lets Ajv's runtime imports resolve from this package.
const VIRTUAL_ENTRY = path.join(rootDir, 'ket-schema-validator.virtual.js');

async function main() {
  const { build } = await import('vite');
  const [output] = await build({
    configFile: false,
    root: rootDir,
    logLevel: 'warn',
    plugins: [
      {
        name: 'ket-schema-validator',
        resolveId: (id) => (id === VIRTUAL_ENTRY ? VIRTUAL_ENTRY : null),
        load: (id) =>
          id === VIRTUAL_ENTRY ? standaloneCode(ajv, validate) : null,
      },
    ],
    build: {
      write: false,
      minify: false,
      lib: {
        entry: VIRTUAL_ENTRY,
        formats: ['es'],
        fileName: 'compiledSchema',
      },
    },
  });

  const chunks = output.output.filter((file) => file.type === 'chunk');
  if (chunks.length !== 1) {
    throw new Error(
      `compile-ket-schema: expected one bundled chunk, got ${chunks.length}.`,
    );
  }

  fs.writeFileSync(outputPath, chunks[0].code, 'utf8');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
