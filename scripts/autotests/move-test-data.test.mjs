import assert from 'node:assert/strict';
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  writeFileSync,
  existsSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';

import {
  featureFolder,
  findDataPaths,
  findDynamicPaths,
  findSpec,
  formatReport,
  isPopupSpec,
  moveTestData,
} from './move-test-data.mjs';

const POPUP_SPEC =
  'ketcher-autotests/tests/specs/Chromium-popup/Features/5359-Display-molecules.spec.ts';
const FULL_SCALE_SPEC =
  'ketcher-autotests/tests/specs/Features/8000-Some-feature.spec.ts';

/**
 * Creates a repository root with the given files.
 * @param {Record<string, string>} files Path relative to the root → content.
 * @returns {string} Absolute root path.
 */
function makeRepo(files) {
  const root = mkdtempSync(join(tmpdir(), 'move-test-data-'));
  for (const [path, content] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), content);
  }
  return root;
}

/**
 * Reads a file of the repository.
 * @param {string} root
 * @param {string} path
 * @returns {string}
 */
function read(root, path) {
  return readFileSync(join(root, path), 'utf8');
}

const DATA = 'ketcher-autotests/tests/test-data';

describe('featureFolder', () => {
  it('adds Chromium-popup for a popup spec', () => {
    assert.equal(
      featureFolder('KET', '5359-X', true),
      'KET/Chromium-popup/5359-X',
    );
  });

  it('has no Chromium-popup for a full-scale spec', () => {
    assert.equal(
      featureFolder('Molfiles-V3000', '5359-X', false),
      'Molfiles-V3000/5359-X',
    );
  });
});

describe('isPopupSpec', () => {
  it('tells popup and full-scale specs apart', () => {
    assert.equal(isPopupSpec(POPUP_SPEC), true);
    assert.equal(isPopupSpec(FULL_SCALE_SPEC), false);
  });
});

describe('findDataPaths', () => {
  it('finds quoted paths whose first folder is a test-data format', () => {
    const text = [
      `await openFile(page, 'KET/Micro-Macro-Switcher/All Bonds on Macro.ket');`,
      `await openFile(page, "Molfiles-V3000/a b (1).mol");`,
      'await verify(page, `KET/x/expected.ket`, FileType.KET);',
      `await openFile(page, 'KET/Micro-Macro-Switcher/All Bonds on Macro.ket');`,
      `const image = 'snapshot-linux.png';`,
      `await take(page, 'Unknown/folder/file.ket');`,
      'await openFile(page, `KET/${name}.ket`);',
      `await openFile(page, "KET/Bugs/Carbon label doesn't appear.ket");`,
    ].join('\n');
    assert.deepEqual(findDataPaths(text, ['KET', 'Molfiles-V3000']), [
      'KET/Micro-Macro-Switcher/All Bonds on Macro.ket',
      'Molfiles-V3000/a b (1).mol',
      'KET/x/expected.ket',
      "KET/Bugs/Carbon label doesn't appear.ket",
    ]);
  });
});

describe('findDynamicPaths', () => {
  it('finds template literals that build a data path from variables', () => {
    const text = [
      'await openFile(page, `KET/${folder}/${name}.ket`);',
      'await openFile(page, `KET/fixed/a.ket`);',
      `await openFile(page, 'KET/fixed/b.ket');`,
    ].join('\n');
    assert.deepEqual(findDynamicPaths(text), ['KET/${folder}/${name}.ket']);
  });
});

describe('findSpec', () => {
  it('finds the spec by file name, or returns null', () => {
    const root = makeRepo({ [POPUP_SPEC]: '' });
    assert.equal(findSpec(root, '5359-Display-molecules.spec.ts'), POPUP_SPEC);
    assert.equal(findSpec(root, 'missing.spec.ts'), null);
  });
});

describe('moveTestData', () => {
  it('copies a file from another folder and rewrites the spec', () => {
    const root = makeRepo({
      [POPUP_SPEC]: `openFile(page, 'KET/Micro-Macro-Switcher/All Bonds on Macro.ket');`,
      [`${DATA}/KET/Micro-Macro-Switcher/All Bonds on Macro.ket`]: 'bonds',
    });
    const moves = moveTestData(root, POPUP_SPEC);
    const to =
      'KET/Chromium-popup/5359-Display-molecules/All Bonds on Macro.ket';
    assert.deepEqual(moves, [
      {
        from: 'KET/Micro-Macro-Switcher/All Bonds on Macro.ket',
        to,
        copied: true,
      },
    ]);
    assert.equal(read(root, `${DATA}/${to}`), 'bonds');
    assert.equal(
      read(root, `${DATA}/KET/Micro-Macro-Switcher/All Bonds on Macro.ket`),
      'bonds',
    );
    assert.equal(read(root, POPUP_SPEC), `openFile(page, '${to}');`);
  });

  it('only changes the folder of a file that does not exist yet', () => {
    const root = makeRepo({
      [FULL_SCALE_SPEC]: `verify(page, 'KET/Other/result-expected.ket');`,
      [`${DATA}/KET/.keep`]: '',
    });
    const moves = moveTestData(root, FULL_SCALE_SPEC);
    const to = 'KET/8000-Some-feature/result-expected.ket';
    assert.deepEqual(moves, [
      { from: 'KET/Other/result-expected.ket', to, copied: false },
    ]);
    assert.equal(existsSync(join(root, DATA, to)), false);
    assert.equal(read(root, FULL_SCALE_SPEC), `verify(page, '${to}');`);
  });

  it('leaves paths that are already in the feature folder', () => {
    const path = 'KET/Chromium-popup/5359-Display-molecules/a.ket';
    const root = makeRepo({
      [POPUP_SPEC]: `openFile(page, '${path}');`,
      [`${DATA}/${path}`]: 'a',
    });
    assert.deepEqual(moveTestData(root, POPUP_SPEC), []);
    assert.equal(read(root, POPUP_SPEC), `openFile(page, '${path}');`);
  });

  it('numbers a copy when another file in the folder has the same name', () => {
    const root = makeRepo({
      [POPUP_SPEC]: `open('KET/A/x.ket'); open('KET/B/x.ket'); open('KET/A/x.ket');`,
      [`${DATA}/KET/A/x.ket`]: 'from A',
      [`${DATA}/KET/B/x.ket`]: 'from B',
    });
    const moves = moveTestData(root, POPUP_SPEC);
    const folder = 'KET/Chromium-popup/5359-Display-molecules';
    assert.deepEqual(
      moves.map((move) => move.to),
      [`${folder}/x.ket`, `${folder}/x-2.ket`],
    );
    assert.equal(read(root, `${DATA}/${folder}/x.ket`), 'from A');
    assert.equal(read(root, `${DATA}/${folder}/x-2.ket`), 'from B');
    assert.equal(
      read(root, POPUP_SPEC),
      `open('${folder}/x.ket'); open('${folder}/x-2.ket'); open('${folder}/x.ket');`,
    );
  });

  it('moves a double-quoted path with an apostrophe', () => {
    const root = makeRepo({
      [POPUP_SPEC]: `open("KET/Bugs/doesn't work.ket");`,
      [`${DATA}/KET/Bugs/doesn't work.ket`]: 'x',
    });
    moveTestData(root, POPUP_SPEC);
    assert.equal(
      read(root, POPUP_SPEC),
      `open("KET/Chromium-popup/5359-Display-molecules/doesn't work.ket");`,
    );
  });

  it('copies binary files as they are', () => {
    const bytes = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x00, 0xff]);
    const root = makeRepo({ [POPUP_SPEC]: `open('CDX/old/a.cdx');` });
    mkdirSync(join(root, DATA, 'CDX/old'), { recursive: true });
    writeFileSync(join(root, DATA, 'CDX/old/a.cdx'), bytes);
    moveTestData(root, POPUP_SPEC);
    const copy = readFileSync(
      join(root, DATA, 'CDX/Chromium-popup/5359-Display-molecules/a.cdx'),
    );
    assert.equal(copy.equals(bytes), true);
  });
});

describe('formatReport', () => {
  it('lists the copied files and the paths built from variables', () => {
    const text = formatReport(
      [
        { from: 'KET/A/a.ket', to: 'KET/F/a.ket', copied: true },
        { from: 'KET/A/e.ket', to: 'KET/F/e.ket', copied: false },
      ],
      ['KET/${name}.ket'],
    );
    assert.equal(
      text,
      [
        'Test data copied into the feature folder:',
        '- `KET/A/a.ket` → `KET/F/a.ket`',
        '',
        'Check by hand that these paths are in the feature folder (the spec builds them from variables):',
        '- `KET/${name}.ket`',
      ].join('\n'),
    );
  });

  it('is empty when there is nothing to report', () => {
    assert.equal(formatReport([], []), '');
  });
});
