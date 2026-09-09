import fs from 'fs';
import path from 'path';
import i18n, { SUPPORTED_LANGUAGES } from './i18n';

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

function flattenLocaleFile(
  locale: string,
  namespace: string,
): Record<string, string> {
  const filePath = path.join(SRC_ROOT, 'locales', locale, `${namespace}.json`);
  const json: unknown = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const result: Record<string, string> = {};

  function walk(node: unknown, prefix: string) {
    if (typeof node === 'string') {
      result[prefix] = node;
    } else if (node && typeof node === 'object') {
      for (const [key, value] of Object.entries(node)) {
        walk(value, prefix ? `${prefix}.${key}` : key);
      }
    }
  }

  walk(json, '');
  return result;
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

describe('zh-CN locale parity', () => {
  it.each(NAMESPACES)(
    '%s.json: zh-CN has exactly the same keys as en',
    (namespace) => {
      const enKeys = Object.keys(flattenLocaleFile('en', namespace)).sort();
      const zhKeys = Object.keys(flattenLocaleFile('zh-CN', namespace)).sort();

      const missing = enKeys.filter((key) => !zhKeys.includes(key));
      const extra = zhKeys.filter((key) => !enKeys.includes(key));

      expect({ missing, extra }).toEqual({ missing: [], extra: [] });
    },
  );

  it('preserves every ICU interpolation placeholder between en and zh-CN', () => {
    const placeholderRe = /\{[a-zA-Z]+\}/g;
    const mismatches: string[] = [];

    for (const namespace of NAMESPACES) {
      const en = flattenLocaleFile('en', namespace);
      const zh = flattenLocaleFile('zh-CN', namespace);

      for (const key of Object.keys(en)) {
        if (!(key in zh)) continue; // already reported by the key-parity test above

        const enPlaceholders = [...en[key].matchAll(placeholderRe)]
          .map((match) => match[0])
          .sort()
          .join(',');
        const zhPlaceholders = [...zh[key].matchAll(placeholderRe)]
          .map((match) => match[0])
          .sort()
          .join(',');

        if (enPlaceholders !== zhPlaceholders) {
          mismatches.push(`${namespace}:${key}`);
        }
      }
    }

    expect(mismatches).toEqual([]);
  });

  it('resolves every referenced key against the zh-CN resource bundle without throwing or falling back to an empty value', async () => {
    const referencedKeys = collectReferencedKeys();
    await i18n.changeLanguage('zh-CN');

    try {
      const brokenKeys = [...referencedKeys].filter((key) => {
        try {
          const resolved: unknown = i18n.t(key);
          return typeof resolved !== 'string' || resolved.trim() === '';
        } catch {
          return true;
        }
      });

      expect(brokenKeys).toEqual([]);
    } finally {
      await i18n.changeLanguage('en');
    }
  });
});

describe('supported languages', () => {
  it('registers a resource bundle for every language listed in SUPPORTED_LANGUAGES', () => {
    expect(SUPPORTED_LANGUAGES.length).toBeGreaterThan(1);

    for (const { code } of SUPPORTED_LANGUAGES) {
      for (const namespace of NAMESPACES) {
        expect(i18n.hasResourceBundle(code, namespace)).toBe(true);
      }
    }
  });
});
