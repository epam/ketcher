#!/usr/bin/env node
/**
 * Scans src/locales/<locale>/ for this package's two namespaces and
 * generates src/i18n/localeResources.generated.ts — static imports plus
 * BASE_RESOURCES ('en') and EXTRA_LOCALE_RESOURCES (every other *complete*
 * locale). Mirrors packages/ketcher-react/scripts/generate-locale-resources.mjs
 * — see that file's header for the full rationale (static imports for
 * Rollup tree-shaking, skip-incomplete-locale behavior).
 *
 * This package's namespace completeness is tracked independently of
 * ketcher-react's — a language can be "supported" in ketcher-react's
 * SUPPORTED_LANGUAGES (its own six namespaces complete) while still missing
 * here; i18next falls back to English per-key for whatever's absent rather
 * than failing, so this is a visible-but-non-breaking degradation, not a
 * blocker to keep the two packages' locale sets in lockstep.
 */
import { existsSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { format, resolveConfig } from 'prettier';

const NAMESPACES = ['macromolecules', 'macromoleculesDialogs'];

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
  '// Source: packages/ketcher-macromolecules/scripts/generate-locale-resources.mjs',
);
lines.push(
  '// Adding or removing a language is just adding/removing its src/locales/<code>/ directory',
);
lines.push(
  '// (with both namespace files) and regenerating — no manual edit of this file or registerNamespaces.ts.',
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
lines.push('} as const satisfies Record<string, typeof BASE_RESOURCES>;');
lines.push('');

const prettierConfig = await resolveConfig(outFile, { editorconfig: true });
const formattedSource = await format(lines.join('\n'), {
  ...prettierConfig,
  filepath: outFile,
});
writeFileSync(outFile, formattedSource);
console.log(
  `generate-locale-resources: wrote ${path.relative(process.cwd(), outFile)} — base "en" + extra [${extraLocales.join(', ') || 'none'}]`,
);
