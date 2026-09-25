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

// Owned by ketcher-macromolecules, merged into this shared i18next instance
// at runtime via ketcher-macromolecules/src/i18n/registerNamespaces.ts (see
// that file for why: avoiding a reverse ketcher-react -> ketcher-macromolecules
// source dependency). This test mirrors that same registration below by
// reading the locale JSON directly off disk instead of importing the file,
// for the identical reason — a test-only import would still be a real
// source-level dependency edge.
const MACROMOLECULES_NAMESPACES = ['macromolecules', 'macromoleculesDialogs'];

const ALL_NAMESPACES = [...NAMESPACES, ...MACROMOLECULES_NAMESPACES];

const SRC_ROOT = path.join(__dirname, '..');
const MACROMOLECULES_SRC_ROOT = path.join(
  __dirname,
  '../../../ketcher-macromolecules/src',
);
const SCAN_ROOTS = [SRC_ROOT, MACROMOLECULES_SRC_ROOT];

const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx']);
const EXCLUDED_DIR_NAMES = new Set(['node_modules', 'dist', '__snapshots__']);

const LITERAL_KEY_RE = new RegExp(
  `['"]((?:${ALL_NAMESPACES.join('|')}):[A-Za-z0-9_.-]+)['"]`,
  'g',
);
const PREFIX_CONST_RE = new RegExp(
  `const\\s+(\\w+)\\s*=\\s*['"]((?:${ALL_NAMESPACES.join('|')}):[A-Za-z0-9_.-]*)['"]`,
  'g',
);
const TEMPLATE_KEY_RE = /`\$\{(\w+)\}([A-Za-z0-9_.-]+)`/g;

// ketcher-macromolecules code overwhelmingly calls `useTranslation(ns)` once
// near the top of a component and then `t('bare.key')` without repeating the
// namespace in the string literal (unlike ketcher-react, which mixes that
// style with a lot of explicit `t('ns:key')` calls) — so LITERAL_KEY_RE alone
// would find almost nothing to check there. These three patterns resolve the
// bare form on a best-effort, file-scoped basis: find the namespace(s) bound
// via useTranslation in a file, then treat every bare t('key') call in that
// same file as belonging to those namespace(s), verified against all of them
// together via i18next's own `{ ns: [...] }` fallback-order resolution
// (mirroring what `t()` actually does at runtime for an array-bound call)
// rather than guessing a single "ns:key" string. Known gap: a key referenced
// only through a variable (e.g. `t(labelKey)` in the Settings dialog, where
// labelKey is a plain string constant defined elsewhere) isn't a string
// literal at the call site at all, so no static pattern can find it — those
// were verified by hand during that section's live browser QA instead.
const BARE_T_CALL_RE = /\bt\(\s*['"]([A-Za-z0-9_.-]+)['"]/g;
const USE_TRANSLATION_SINGLE_RE = /useTranslation\(\s*['"]([\w-]+)['"]\s*\)/g;
const USE_TRANSLATION_ARRAY_RE = /useTranslation\(\s*\[([^\]]+)\]\s*\)/g;

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

  for (const root of SCAN_ROOTS) {
    for (const file of walk(root)) {
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
  }

  return keys;
}

interface NamespaceBoundKeyRef {
  key: string;
  namespaces: string[];
}

function collectNamespaceBoundBareKeys(): NamespaceBoundKeyRef[] {
  const refs: NamespaceBoundKeyRef[] = [];

  for (const file of walk(MACROMOLECULES_SRC_ROOT)) {
    const content = fs.readFileSync(file, 'utf8');

    let namespaces: string[] | undefined;
    for (const match of content.matchAll(USE_TRANSLATION_ARRAY_RE)) {
      namespaces = [...match[1].matchAll(/['"]([\w-]+)['"]/g)].map((m) => m[1]);
      break;
    }
    if (!namespaces) {
      for (const match of content.matchAll(USE_TRANSLATION_SINGLE_RE)) {
        namespaces = [match[1]];
        break;
      }
    }
    // Only files whose bound namespace(s) are ones this suite actually loads
    // resource bundles for are worth checking — anything else is out of scope
    // for this heuristic (and not a pattern seen in this codebase today).
    if (!namespaces?.some((ns) => ALL_NAMESPACES.includes(ns))) continue;

    for (const match of content.matchAll(BARE_T_CALL_RE)) {
      const key = match[1];
      if (key.includes(':')) continue; // explicit ns:key, already caught above
      refs.push({ key, namespaces });
    }
  }

  return refs;
}

function localeRootFor(namespace: string): string {
  return MACROMOLECULES_NAMESPACES.includes(namespace)
    ? MACROMOLECULES_SRC_ROOT
    : SRC_ROOT;
}

function loadLocaleJson(locale: string, namespace: string): unknown {
  const filePath = path.join(
    localeRootFor(namespace),
    'locales',
    locale,
    `${namespace}.json`,
  );
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function flattenLocaleFile(
  locale: string,
  namespace: string,
): Record<string, string> {
  const json = loadLocaleJson(locale, namespace);
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

// Mirrors ketcher-macromolecules/src/i18n/registerNamespaces.ts's runtime
// side effect, so this shared `i18n` instance behaves in tests exactly as it
// does once ketcher-macromolecules is lazy-loaded into the real app.
for (const locale of ['en', 'zh-CN']) {
  for (const namespace of MACROMOLECULES_NAMESPACES) {
    i18n.addResourceBundle(
      locale,
      namespace,
      loadLocaleJson(locale, namespace),
    );
  }
}

describe('i18n', () => {
  it('initializes synchronously with the English baseline loaded', () => {
    expect(i18n.isInitialized).toBe(true);
    expect(i18n.language).toBe('en');
  });

  it('resolves every "namespace:key" reference found in ketcher-react and ketcher-macromolecules source without a missing-key fallback', () => {
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

  it('resolves every bare, namespace-bound t(key) call found in ketcher-macromolecules source', () => {
    // Complements the test above for ketcher-macromolecules' dominant style —
    // see collectNamespaceBoundBareKeys's comment for what this does and does
    // not cover. Checked with `{ ns }` so a call bound to
    // useTranslation(['macromoleculesDialogs', 'common']) is verified with
    // the same fallback-order resolution react-i18next itself would use.
    const bareRefs = collectNamespaceBoundBareKeys();
    expect(bareRefs.length).toBeGreaterThan(0);

    const missingRefs = bareRefs.filter(({ key, namespaces }) => {
      const options = { ns: namespaces };
      return !i18n.exists(key, options) || i18n.t(key, options) === key;
    });

    expect(missingRefs).toEqual([]);
  });
});

describe('zh-CN locale parity', () => {
  it.each(ALL_NAMESPACES)(
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

    for (const namespace of ALL_NAMESPACES) {
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
    const bareRefs = collectNamespaceBoundBareKeys();
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

      const brokenBareRefs = bareRefs.filter(({ key, namespaces }) => {
        try {
          const resolved: unknown = i18n.t(key, { ns: namespaces });
          return typeof resolved !== 'string' || resolved.trim() === '';
        } catch {
          return true;
        }
      });

      expect(brokenKeys).toEqual([]);
      expect(brokenBareRefs).toEqual([]);
    } finally {
      await i18n.changeLanguage('en');
    }
  });
});

describe('supported languages', () => {
  it('registers a resource bundle for every language listed in SUPPORTED_LANGUAGES', () => {
    expect(SUPPORTED_LANGUAGES.length).toBeGreaterThan(1);

    for (const { code } of SUPPORTED_LANGUAGES) {
      for (const namespace of ALL_NAMESPACES) {
        expect(i18n.hasResourceBundle(code, namespace)).toBe(true);
      }
    }
  });
});
