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
  code: { source: true, esm: true },
  strict: false,
});
const validate = ajv.compile(schema);

let generatedCode = standaloneCode(ajv, validate);

// Convert any remaining require() calls to ES imports
const requireMatches = generatedCode.match(
  /const (\w+) = require\("([^"]+)"\)\.default;/g,
);
if (requireMatches) {
  const imports = [];
  requireMatches.forEach((match) => {
    const [, varName, modulePath] = match.match(
      /const (\w+) = require\("([^"]+)"\)\.default;/,
    );
    imports.push(`import ${varName} from "${modulePath}";`);
    generatedCode = generatedCode.replace(match, '');
  });
  generatedCode = imports.join('\n') + '\n' + generatedCode;
}

fs.writeFileSync(outputPath, `${generatedCode}\n`, 'utf8');
