import fs from 'fs';
import path from 'path';

const SRC_ROOT = path.join(__dirname, '..');

// ketcher-macromolecules/src, scanned as a second root below (Sections 1-6 of
// the ketcher-macromolecules-i18n change). A separate root rather than a
// ketcher-react import: this file only ever touches the filesystem, so
// scanning a second package's source introduces no source-level dependency
// between the two (unlike importing runtime i18n code would).
const MACROMOLECULES_SRC_ROOT = path.join(
  __dirname,
  '../../../ketcher-macromolecules/src',
);

/**
 * Directories/files fully migrated to t() calls (Sections 1-6 of the
 * ketcher-react-i18n-foundation change). New JSX code added under these
 * paths must route display text through i18next instead of hardcoding it —
 * this guard fails CI if a literal string shows up in one of the handful of
 * JSX attributes that are always display text (title/label/placeholder/
 * tooltip/aria-label/alt), which is the exact regression pattern every prior
 * section had to hunt down by hand.
 */
const MIGRATED_PATHS = [
  'script/ui/action',
  'script/ui/views/toolbars',
  'script/ui/views/modal/components',
  'script/ui/views/components',
  'script/ui/data/schema/options-schema.ts',
  'components/Dialog/Dialog.tsx',
  'script/ui/component/actionmenu.tsx',
  'script/ui/component/form/form/form.tsx',
  'script/ui/component/form/MeasureInput/measure-input.tsx',
  'script/ui/component/form/Select/Select.tsx',
  'script/ui/utils/index.ts',
];

// Sections 1-6 of the ketcher-macromolecules-i18n change: components/shared,
// hooks, and helpers (Section 6) plus every directory extracted in the
// sections before it. Resolved against MACROMOLECULES_SRC_ROOT, not SRC_ROOT.
const MACROMOLECULES_MIGRATED_PATHS = [
  'components/menu',
  'components/TopMenuComponent',
  'components/LeftMenuComponent',
  'components/FloatingTools',
  'components/ZoomControls',
  'components/Layout',
  'components/LayoutModeButton',
  'components/ButtonsComponents',
  'components/SequenceTypeGroupButton',
  'components/SequenceSyncEditModeButton',
  'components/Ruler',
  'components/FullscreenButton',
  'components/macromoleculeProperties',
  'components/preview',
  'components/monomerLibrary',
  'components/contextMenu',
  'components/modal',
  'components/shared',
  'hooks',
  'helpers',
];

const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx']);
const EXCLUDED_DIR_NAMES = new Set(['node_modules', 'dist', '__snapshots__']);

/**
 * Reviewed-and-intentional exceptions, keyed by `path/relative/to/src:snippet`.
 * Each entry here was a deliberate decision made while migrating that file
 * (see the section's tasks.md entry), not an oversight — extend this list
 * only for the same kind of reason: dead/commented-out code, or a value that
 * isn't display text despite matching one of the TEXT_PROPS names below.
 */
const ALLOWED_VIOLATIONS = new Set([
  // Section 2: commented-out button, pending a future History feature — dead
  // code, never rendered.
  'script/ui/views/toolbars/TopToolbar/SystemControls.tsx:title="History"',
  // Section 5: a literal ellipsis used as a loading/pending-value
  // placeholder, not display text.
  'script/ui/views/components/MonomerCreationWizard/components/ModificationTypeDropdown/ModificationTypeDropdown.tsx:placeholder="..."',
]);

const TEXT_PROPS = [
  'title',
  'label',
  'placeholder',
  'tooltip',
  'aria-label',
  'alt',
];
// Matches `title="Some text"` / `label='Some text'` — but not `title={...}`,
// since a JS expression never starts with a quote right after `=`.
const HARDCODED_ATTR_RE = new RegExp(
  `\\b(?:${TEXT_PROPS.join('|')})=(["'])((?:(?!\\1).)+)\\1`,
  'g',
);

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

function collectMigratedFiles(root: string, relativePaths: string[]): string[] {
  const files: string[] = [];
  for (const relativePath of relativePaths) {
    const absolutePath = path.join(root, relativePath);
    const stat = fs.statSync(absolutePath);
    if (stat.isDirectory()) {
      walk(absolutePath, files);
    } else {
      files.push(absolutePath);
    }
  }
  return files;
}

interface Violation {
  file: string;
  line: number;
  snippet: string;
}

function findHardcodedStrings(root: string, files: string[]): Violation[] {
  const violations: Violation[] = [];

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');

    const relativeFile = path.relative(root, file);
    lines.forEach((line, index) => {
      for (const match of line.matchAll(HARDCODED_ATTR_RE)) {
        if (ALLOWED_VIOLATIONS.has(`${relativeFile}:${match[0]}`)) continue;
        violations.push({
          file: relativeFile,
          line: index + 1,
          snippet: match[0],
        });
      }
    });
  }

  return violations;
}

describe('no hardcoded UI strings in migrated directories', () => {
  it('does not introduce a literal title/label/placeholder/tooltip/aria-label/alt in an already-migrated file', () => {
    const files = collectMigratedFiles(SRC_ROOT, MIGRATED_PATHS);
    expect(files.length).toBeGreaterThan(0);

    const violations = findHardcodedStrings(SRC_ROOT, files);

    if (violations.length > 0) {
      const details = violations
        .map((v) => `  ${v.file}:${v.line} → ${v.snippet}`)
        .join('\n');
      throw new Error(
        `Found ${violations.length} hardcoded string(s) in migrated i18n directories. ` +
          `Route these through t() (see packages/ketcher-react/src/locales/README.md), ` +
          `or — if the value is genuinely not display text (a stable identifier, data-driven ` +
          `content, etc.) — extend this test's understanding rather than the app code:\n${details}`,
      );
    }
  });

  it('does not introduce a literal title/label/placeholder/tooltip/aria-label/alt in an already-migrated ketcher-macromolecules file', () => {
    const files = collectMigratedFiles(
      MACROMOLECULES_SRC_ROOT,
      MACROMOLECULES_MIGRATED_PATHS,
    );
    expect(files.length).toBeGreaterThan(0);

    const violations = findHardcodedStrings(MACROMOLECULES_SRC_ROOT, files);

    if (violations.length > 0) {
      const details = violations
        .map((v) => `  ${v.file}:${v.line} → ${v.snippet}`)
        .join('\n');
      throw new Error(
        `Found ${violations.length} hardcoded string(s) in migrated ketcher-macromolecules ` +
          `i18n directories. Route these through t() (see ` +
          `packages/ketcher-macromolecules/src/locales/README.md if present, or the pattern ` +
          `used elsewhere in that package), or — if the value is genuinely not display text ` +
          `(a stable identifier, data-driven content, etc.) — extend this test's understanding ` +
          `rather than the app code:\n${details}`,
      );
    }
  });
});
