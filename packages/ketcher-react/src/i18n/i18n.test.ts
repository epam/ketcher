import fs from 'fs';
import path from 'path';
import i18n from './i18n';

const NAMESPACES = [
  'common',
  'toolbar',
  'toolbars',
  'dialogs',
  'components',
  'settings',
];

const SRC_ROOT = path.join(__dirname, '..');
const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx']);
const EXCLUDED_DIR_NAMES = new Set(['node_modules', 'dist', '__snapshots__']);

const LITERAL_KEY_RE = new RegExp(
  `['"]((?:${NAMESPACES.join('|')}):[A-Za-z0-9_.-]+)['"]`,
  'g',
);
const PREFIX_CONST_RE = new RegExp(
  `const\\s+(\\w+)\\s*=\\s*['"]((?:${NAMESPACES.join('|')}):[A-Za-z0-9_.-]*)['"]`,
  'g',
);
const TEMPLATE_KEY_RE = /`\$\{(\w+)\}([A-Za-z0-9_.-]+)`/g;

function walk(dir: string, files: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (EXCLUDED_DIR_NAMES.has(entry.name)) continue;

    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, files);
    } else if (
      SOURCE_EXTENSIONS.has(path.extname(entry.name)) &&
      !/\.(test|spec)\./.test(entry.name)
    ) {
      files.push(fullPath);
    }
  }
  return files;
}

function collectReferencedKeys(): Set<string> {
  const keys = new Set<string>();

  for (const file of walk(SRC_ROOT)) {
    const content = fs.readFileSync(file, 'utf8');

    for (const match of content.matchAll(LITERAL_KEY_RE)) {
      // Skip prefix fragments like `const f = 'settings:fields.'` (built up
      // further via template literals, handled below) and any comment text
      // that happens to look like a key — real leaf keys never end in '.'.
      if (!match[1].endsWith('.')) keys.add(match[1]);
    }

    const prefixes = new Map<string, string>();
    for (const match of content.matchAll(PREFIX_CONST_RE)) {
      prefixes.set(match[1], match[2]);
    }
    if (prefixes.size > 0) {
      for (const match of content.matchAll(TEMPLATE_KEY_RE)) {
        const prefix = prefixes.get(match[1]);
        if (prefix) keys.add(prefix + match[2]);
      }
    }
  }

  return keys;
}

describe('i18n', () => {
  it('initializes synchronously with the English baseline loaded', () => {
    expect(i18n.isInitialized).toBe(true);
    expect(i18n.language).toBe('en');
  });

  it('resolves every "namespace:key" reference found in ketcher-react source without a missing-key fallback', () => {
    // react-i18next's dev-only missingKeyHandler (see ./i18n.ts) only fires when
    // NODE_ENV === 'development', which Jest never sets — so instead of spying on
    // it, this re-derives the same signal `i18next` uses internally: a key that
    // isn't in the resource bundle resolves via `exists()` to `false`, and `t()`
    // falls back to returning the key itself unchanged.
    const referencedKeys = collectReferencedKeys();
    expect(referencedKeys.size).toBeGreaterThan(0);

    const missingKeys = [...referencedKeys].filter(
      (key) => !i18n.exists(key) || i18n.t(key) === key,
    );

    expect(missingKeys).toEqual([]);
  });
});
