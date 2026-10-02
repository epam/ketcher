#!/usr/bin/env node
/**
 * Scans src/locales/<locale>/ for this package's six namespaces and
 * generates src/i18n/localeResources.generated.ts — static imports plus
 * BASE_RESOURCES ('en') and EXTRA_LOCALE_RESOURCES (every other *complete*
 * locale). Keeps imports static (required for Rollup to tree-shake unused
 * locales out of the English-only default build) while removing the need
 * to hand-edit i18n.ts every time a locale is added or removed — adding a
 * language is "drop files under src/locales/<code>/, rerun this script."
 *
 * A locale missing any of the six namespace files is skipped with a
 * warning rather than included half-translated (i18next would silently
 * fall back to English per-key, which is a worse failure mode than just
 * not offering the language yet).
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const NAMESPACES = [
  'common',
  'toolbar',
  'toolbars',
  'dialogs',
  'components',
  'settings',
];

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const localesDir = path.resolve(scriptDir, '../src/locales');
const outFile = path.resolve(
  scriptDir,
  '../src/i18n/localeResources.generated.ts',
);

function namespaceFiles(locale) {
  return NAMESPACES.map((ns) => ({
    ns,
    file: path.join(localesDir, locale, `${ns}.json`),
  }));
}

function isComplete(locale) {
  return namespaceFiles(locale).every(({ file }) => existsSync(file));
}

function toIdentifier(locale, ns) {
  return `${ns}_${locale.replace(/[^a-zA-Z0-9]/g, '_')}`;
}

const allLocales = readdirSync(localesDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

if (!allLocales.includes('en') || !isComplete('en')) {
  throw new Error(
    `generate-locale-resources: base locale "en" is missing or incomplete in ${localesDir} — every namespace (${NAMESPACES.join(', ')}) must be present.`,
  );
}

const extraLocales = [];
for (const locale of allLocales) {
  if (locale === 'en') continue;
  if (isComplete(locale)) {
    extraLocales.push(locale);
  } else {
    const missing = namespaceFiles(locale)
      .filter(({ file }) => !existsSync(file))
      .map(({ ns }) => ns);
    console.warn(
      `generate-locale-resources: skipping incomplete locale "${locale}" — missing namespace(s): ${missing.join(', ')}`,
    );
  }
}
extraLocales.sort();

const lines = [];
lines.push('// AUTO-GENERATED — do not edit by hand.');
lines.push(
  '// Regenerate with: npm run i18n:generate (also runs automatically before build/test).',
);
lines.push(
  '// Source: packages/ketcher-react/scripts/generate-locale-resources.mjs',
);
lines.push(
  '// Adding or removing a language is just adding/removing its src/locales/<code>/ directory',
);
lines.push(
  '// (with all six namespace files) and regenerating — no manual edit of this file or i18n.ts.',
);
lines.push('');

for (const ns of NAMESPACES) {
  lines.push(`import ${ns} from '../locales/en/${ns}.json';`);
}
lines.push('');

for (const locale of extraLocales) {
  for (const ns of NAMESPACES) {
    lines.push(
      `import ${toIdentifier(locale, ns)} from '../locales/${locale}/${ns}.json';`,
    );
  }
  lines.push('');
}

lines.push(`export const BASE_RESOURCES = { ${NAMESPACES.join(', ')} };`);
lines.push('');
lines.push('export const EXTRA_LOCALE_RESOURCES = {');
for (const locale of extraLocales) {
  const fields = NAMESPACES.map(
    (ns) => `${ns}: ${toIdentifier(locale, ns)}`,
  ).join(', ');
  lines.push(`  '${locale}': { ${fields} },`);
}
lines.push('} as const;');
lines.push('');

writeFileSync(outFile, lines.join('\n'));
execFileSync('npx', ['prettier', '--write', outFile], { stdio: 'ignore' });
console.log(
  `generate-locale-resources: wrote ${path.relative(process.cwd(), outFile)} — base "en" + extra [${extraLocales.join(', ') || 'none'}]`,
);
