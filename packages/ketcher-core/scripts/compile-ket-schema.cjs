const fs = require('fs');
const path = require('path');
const Ajv = require('ajv').default;
const standaloneCode = require('ajv/dist/standalone').default;

const schemaPath = path.resolve(
  __dirname,
  '../src/domain/serializers/ket/schema.json',
);
const outputPath = path.resolve(
  __dirname,
  '../src/domain/serializers/ket/compiledSchema.js',
);

const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
const ajv = new Ajv({
  allErrors: true,
  code: { source: true, esm: false },
  strict: false,
});
const validate = ajv.compile(schema);

const generatedCode = standaloneCode(ajv, validate).replace(
  /const (\w+) = require\("ajv\/dist\/runtime\/([^"]+)"\)\.default;/g,
  'const $1Module = require("ajv/dist/runtime/$2");const $1 = typeof $1Module === "function" ? $1Module : typeof $1Module.default === "function" ? $1Module.default : $1Module.default.default;',
);

fs.writeFileSync(outputPath, `${generatedCode}\n`, 'utf8');
