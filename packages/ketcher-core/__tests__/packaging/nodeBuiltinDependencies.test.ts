import fs from 'fs';
import { builtinModules } from 'module';
import path from 'path';

const packageRoot = path.resolve(__dirname, '../..');
const sourceRoot = path.join(packageRoot, 'src');

function listSourceFiles(): string[] {
  return fs
    .readdirSync(sourceRoot, { recursive: true })
    .map(String)
    .filter(
      (file) =>
        /\.(ts|tsx|js)$/.test(file) &&
        !file.endsWith('.d.ts') &&
        !/(^|[\\/])__tests__[\\/]|\.test\./.test(file),
    )
    .map((file) => path.join(sourceRoot, file));
}

function listImportedNodeBuiltins(): string[] {
  const typeOnlyStatements = [
    /^\s*(?:import|export)\s+type\b[^;]*;/gm,
    /^\s*import\s*\{\s*type\s+[^,}]+(?:\s*,\s*type\s+[^,}]+)*\s*,?\s*\}\s*from\s*['"][^'"]+['"];/gm,
  ];
  const specifier =
    /\bfrom\s*['"]([^'"]+)['"]|\b(?:import|require)\s*\(?\s*['"]([^'"]+)['"]/g;
  const names = listSourceFiles().flatMap((file) => {
    const code = typeOnlyStatements.reduce(
      (text, pattern) => text.replace(pattern, ''),
      fs.readFileSync(file, 'utf8'),
    );

    return [...code.matchAll(specifier)].map(([, fromName, callName]) => {
      const name = fromName ?? callName;

      return name.startsWith('node:') ? name : name.split('/')[0];
    });
  });

  // `domain` is both a Node builtin and a path alias for src/domain.
  const localNames = fs.readdirSync(sourceRoot);

  return [...new Set(names)].filter(
    (name) =>
      (name.startsWith('node:') || builtinModules.includes(name)) &&
      !localNames.includes(name),
  );
}

describe('ketcher-core dependencies', () => {
  // The build cannot inline a Node builtin: the import stays `from 'events'` in dist.
  // A browser bundler then finds it only when the package of that name is installed.
  // No package can satisfy a `node:` specifier, so any `node:` import fails here.
  it('declares every Node builtin module that src imports', () => {
    const { dependencies } = JSON.parse(
      fs.readFileSync(path.join(packageRoot, 'package.json'), 'utf8'),
    );

    const undeclared = listImportedNodeBuiltins().filter(
      (name) => !Object.keys(dependencies).includes(name),
    );

    expect(undeclared).toEqual([]);
  });
});
