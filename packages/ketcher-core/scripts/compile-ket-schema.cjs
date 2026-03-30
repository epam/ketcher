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

fs.writeFileSync(outputPath, `${standaloneCode(ajv, validate)}\n`, 'utf8');
