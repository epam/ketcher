import fs from 'fs';
import { builtinModules } from 'module';
import path from 'path';

const packageRoot = path.resolve(__dirname, '../..');
const sourceRoot = path.join(packageRoot, 'src');

function listSourceFiles(): string[] {
  return fs
    .readdirSync(sourceRoot, { recursive: true })
    .map(String)
    .filter((file) => /\.(ts|tsx|js)$/.test(file) && !file.endsWith('.d.ts'))
    .map((file) => path.join(sourceRoot, file));
}

function listImportedNodeBuiltins(): string[] {
  const importPattern = /(?:from|import|require\()\s*['"]([^'"]+)['"]/g;
  const names = listSourceFiles().flatMap((file) =>
    [...fs.readFileSync(file, 'utf8').matchAll(importPattern)].map(
      ([, name]) => name.replace(/^node:/, '').split('/')[0],
    ),
  );

  // `domain` is both a Node builtin and a path alias for src/domain.
  const localNames = fs.readdirSync(sourceRoot);

  return [...new Set(names)].filter(
    (name) => builtinModules.includes(name) && !localNames.includes(name),
  );
}

describe('ketcher-core dependencies', () => {
  // The build cannot inline a Node builtin: the import stays `from 'events'` in dist.
  // A browser bundler then finds it only when the package of that name is installed.
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
