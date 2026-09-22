import { test, expect, Page } from '@fixtures';
import * as fs from 'fs';
import * as path from 'path';
import { Peptide } from '@tests/pages/constants/monomers/Peptides';
import { Preset } from '@tests/pages/constants/monomers/Presets';
import { Base } from '@tests/pages/constants/monomers/Bases';
import { Sugar } from '@tests/pages/constants/monomers/Sugars';
import { Chem } from '@tests/pages/constants/monomers/Chem';
import { SequenceMonomerType } from '@tests/pages/constants/monomers/Constants';
import { PresetType, Monomer } from '@utils/types';
import { Library } from '@tests/pages/macromolecules/Library';
import {
  getMonomerLocator,
  connectMonomersWithBonds,
  AttachmentPoint,
} from '@utils/macromolecules/monomer';
import { bondTwoMonomers } from '@utils/macromolecules/polymerBond';
import { AttachmentPointsDialog } from '@tests/pages/macromolecules/canvas/AttachmentPointsDialog';
import {
  hasBondBetweenMonomers,
  getBondAttachmentPoints,
} from '@utils/macromolecules/bonds';
import {
  getKet,
  openFileAndAddToCanvasMacro,
  pasteFromClipboardAndAddToMacromoleculesCanvas,
  MacroFileType,
} from '@utils';

/**
 * TEMPORARY — Phase 2 fixture generator for the drag-and-drop monomer
 * replacement test plan (e2e-test-plan-7455-drag-drop-replacement.md).
 *
 * Each "generate" test builds one .ket fixture on a live canvas and exports it
 * via `window.ketcher.getKet()` into tests/test-data/Monomer-Replacement/.
 * The "verify" tests re-open every generated file and assert the expected
 * monomers/bonds survived the round trip.
 *
 * NOTE: a preset placed on the canvas is rendered as its component monomers
 * (sugar / base / phosphate), each with its own data-monomertype — there is no
 * element with data-monomertype="Preset". Preset presence is therefore
 * verified through component locators (e.g. `Preset.A.base`), and preset
 * chains are bonded component-to-component (phosphate → sugar), mirroring
 * tests/specs/Macromolecule-editor/Snake-Mode/snake-bond-tool.spec.ts.
 *
 * Delete this file once the fixtures are generated and verified.
 */

const FIXTURES_DIR = path.resolve(
  __dirname,
  '../../../test-data/Monomer-Replacement',
);

// Canvas x positions. Kept <= ~420: with the library open in popup mode,
// canvas-relative x beyond ~450 lands on the library panel.
const X_FIRST = 150;
const X_MIDDLE = 270;
const X_LAST = 390;
const MONOMER_Y = 300;
// Diagonal placement for the non-standard-bond fixture.
const NON_STANDARD_Y_TOP = 150;
const NON_STANDARD_Y_BOTTOM = 420;

// Long RNA chain (16 presets) so that a replacement-induced shift pushes
// content outside the viewport (req. 14).
const LONG_RNA_SEQUENCE = 'ACGUACGUACGUACGU';
const LONG_CHAIN_LENGTH = 16;

function saveFixture(fileName: string, ket: string) {
  fs.mkdirSync(FIXTURES_DIR, { recursive: true });
  const filePath = path.join(FIXTURES_DIR, fileName);
  fs.writeFileSync(filePath, ket);
  console.log(`Saved ${filePath} (${ket.length} chars)`);
}

/** Component monomer of a preset (throws if the preset lacks that component). */
function presetComponent(
  preset: PresetType,
  part: 'sugar' | 'base' | 'phosphate',
): Monomer {
  const component = preset[part];
  if (!component) {
    throw new Error(`Preset ${preset.alias} has no ${part} component`);
  }
  return component;
}

/** Number of presets of a given base on the canvas (presets render as components). */
async function countPresetsByBase(
  page: Page,
  preset: PresetType,
): Promise<number> {
  return getMonomerLocator(page, presetComponent(preset, 'base')).count();
}

let page: Page;

test.describe('Phase 2: generate .ket fixtures for monomer replacement (#7455)', () => {
  test.beforeAll(async ({ initFlexCanvas }) => {
    page = await initFlexCanvas();
  });
  test.beforeEach(async ({ FlexCanvas: _ }) => {});
  test.afterAll(async ({ closePage }) => {
    await closePage();
  });

  test('generate monomer-chain-simple.ket (peptide A-C-D chain)', async () => {
    await Library(page).dragMonomerOnCanvas(Peptide.A, {
      x: X_FIRST,
      y: MONOMER_Y,
    });
    await Library(page).dragMonomerOnCanvas(Peptide.C, {
      x: X_MIDDLE,
      y: MONOMER_Y,
    });
    await Library(page).dragMonomerOnCanvas(Peptide.D, {
      x: X_LAST,
      y: MONOMER_Y,
    });
    await connectMonomersWithBonds(page, ['A', 'C', 'D']);

    const monomerA = getMonomerLocator(page, Peptide.A);
    const monomerC = getMonomerLocator(page, Peptide.C);
    const monomerD = getMonomerLocator(page, Peptide.D);
    expect(await monomerA.count()).toBe(1);
    expect(await monomerC.count()).toBe(1);
    expect(await monomerD.count()).toBe(1);
    expect(await hasBondBetweenMonomers(page, monomerA, monomerC)).toBe(true);
    expect(await hasBondBetweenMonomers(page, monomerC, monomerD)).toBe(true);

    saveFixture('monomer-chain-simple.ket', await getKet(page));
  });

  test('generate preset-chain-same-geometry.ket (RNA preset A-C chain)', async () => {
    await Library(page).dragMonomerOnCanvas(Preset.A, {
      x: X_FIRST,
      y: MONOMER_Y,
    });
    await Library(page).dragMonomerOnCanvas(Preset.C, {
      x: X_LAST,
      y: MONOMER_Y,
    });

    const phosphateA = getMonomerLocator(
      page,
      presetComponent(Preset.A, 'phosphate'),
    ).nth(0);
    const sugarC = getMonomerLocator(
      page,
      presetComponent(Preset.C, 'sugar'),
    ).nth(1);
    await bondTwoMonomers(page, phosphateA, sugarC);

    expect(await countPresetsByBase(page, Preset.A)).toBe(1);
    expect(await countPresetsByBase(page, Preset.C)).toBe(1);
    expect(await hasBondBetweenMonomers(page, phosphateA, sugarC)).toBe(true);

    console.log(
      'preset A-C bond APs:',
      JSON.stringify(await getBondAttachmentPoints(page, phosphateA, sugarC)),
    );

    saveFixture('preset-chain-same-geometry.ket', await getKet(page));
  });

  test('generate preset-non-standard-bonds.ket (diagonally placed A-C presets)', async () => {
    await Library(page).dragMonomerOnCanvas(Preset.A, {
      x: X_FIRST,
      y: NON_STANDARD_Y_TOP,
    });
    await Library(page).dragMonomerOnCanvas(Preset.C, {
      x: X_LAST,
      y: NON_STANDARD_Y_BOTTOM,
    });

    const phosphateA = getMonomerLocator(
      page,
      presetComponent(Preset.A, 'phosphate'),
    ).nth(0);
    const sugarC = getMonomerLocator(
      page,
      presetComponent(Preset.C, 'sugar'),
    ).nth(1);
    await bondTwoMonomers(page, phosphateA, sugarC);

    expect(await countPresetsByBase(page, Preset.A)).toBe(1);
    expect(await countPresetsByBase(page, Preset.C)).toBe(1);
    expect(await hasBondBetweenMonomers(page, phosphateA, sugarC)).toBe(true);

    saveFixture('preset-non-standard-bonds.ket', await getKet(page));
  });

  test('generate rn-bond-priority.ket (preset A - lone sugar R - preset C)', async () => {
    await Library(page).dragMonomerOnCanvas(Preset.A, {
      x: X_FIRST,
      y: MONOMER_Y,
    });
    await Library(page).dragMonomerOnCanvas(Sugar.R, {
      x: X_MIDDLE,
      y: MONOMER_Y,
    });
    await Library(page).dragMonomerOnCanvas(Preset.C, {
      x: X_LAST,
      y: MONOMER_Y,
    });

    // nth(0) sugar/phosphate belong to preset A, nth(1) is the lone sugar,
    // nth(2) sugar / nth(1) phosphate belong to preset C.
    const phosphateA = getMonomerLocator(
      page,
      presetComponent(Preset.A, 'phosphate'),
    ).nth(0);
    const loneSugar = getMonomerLocator(page, Sugar.R).nth(1);
    const phosphateC = getMonomerLocator(
      page,
      presetComponent(Preset.C, 'phosphate'),
    ).nth(1);

    // Sugar-to-sugar bonding is rejected by the connection rules, so the
    // lone sugar bonds to preset C through its phosphate instead. The
    // sugar-phosphate drag opens the attachment-point dialog; select the APs
    // explicitly through the dialog POM.
    await bondTwoMonomers(page, phosphateA, loneSugar);
    await bondTwoMonomers(page, loneSugar, phosphateC);
    const sugarPhosphateDialog = AttachmentPointsDialog(page);
    if (await sugarPhosphateDialog.isVisible()) {
      // Ribose R1 and Phosphate R1 are disabled in the dialog; use ribose
      // R2 and phosphate R2.
      await sugarPhosphateDialog.selectAttachmentPoints({
        leftMonomer: AttachmentPoint.R2,
        rightMonomer: AttachmentPoint.R2,
      });
      await sugarPhosphateDialog.connect();
    }

    expect(await countPresetsByBase(page, Preset.A)).toBe(1);
    expect(await getMonomerLocator(page, Sugar.R).count()).toBe(3);
    expect(await countPresetsByBase(page, Preset.C)).toBe(1);

    const bondAR = await hasBondBetweenMonomers(page, phosphateA, loneSugar);
    const bondRC = await hasBondBetweenMonomers(page, loneSugar, phosphateC);
    console.log(`rn-bond-priority bonds: A-R=${bondAR} R-C=${bondRC}`);
    expect(bondAR).toBe(true);
    expect(bondRC).toBe(true);

    saveFixture('rn-bond-priority.ket', await getKet(page));
  });

  test('generate long-chain-viewport-edge.ket (16-preset RNA chain)', async () => {
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      [MacroFileType.Sequence, SequenceMonomerType.RNA],
      LONG_RNA_SEQUENCE,
    );

    const totalPresets =
      (await getMonomerLocator(page, Base.A).count()) +
      (await getMonomerLocator(page, Base.C).count()) +
      (await getMonomerLocator(page, Base.G).count()) +
      (await getMonomerLocator(page, Base.U).count());
    expect(totalPresets).toBe(LONG_CHAIN_LENGTH);

    saveFixture('long-chain-viewport-edge.ket', await getKet(page));
  });

  test('generate chem-bonded-target.ket (peptide A-C chain bonded to chem EG)', async () => {
    await Library(page).dragMonomerOnCanvas(Peptide.A, {
      x: X_FIRST,
      y: MONOMER_Y,
    });
    await Library(page).dragMonomerOnCanvas(Peptide.C, {
      x: X_MIDDLE,
      y: MONOMER_Y,
    });
    await Library(page).dragMonomerOnCanvas(Chem.EG, {
      x: X_LAST,
      y: MONOMER_Y,
    });
    await connectMonomersWithBonds(page, ['A', 'C']);

    // Peptide-to-chem bonding opens the attachment-point dialog; select the
    // APs explicitly through the dialog POM.
    const monomerC = getMonomerLocator(page, Peptide.C);
    const chemEG = getMonomerLocator(page, Chem.EG);
    await bondTwoMonomers(page, monomerC, chemEG);
    const attachmentPointsDialog = AttachmentPointsDialog(page);
    if (await attachmentPointsDialog.isVisible()) {
      // Cysteine R1 is occupied by the A-C backbone bond and disabled in the
      // dialog; use its R2 (OH) and EG's R1 (H).
      await attachmentPointsDialog.selectAttachmentPoints({
        leftMonomer: AttachmentPoint.R2,
        rightMonomer: AttachmentPoint.R1,
      });
      await attachmentPointsDialog.connect();
    }

    expect(await getMonomerLocator(page, Peptide.A).count()).toBe(1);
    expect(await monomerC.count()).toBe(1);
    expect(await chemEG.count()).toBe(1);

    const bondAC = await hasBondBetweenMonomers(
      page,
      getMonomerLocator(page, Peptide.A),
      monomerC,
    );
    const bondCEG = await hasBondBetweenMonomers(page, monomerC, chemEG);
    console.log(`chem-bonded-target bonds: A-C=${bondAC} C-EG=${bondCEG}`);
    expect(bondAC).toBe(true);
    expect(bondCEG).toBe(true);

    saveFixture('chem-bonded-target.ket', await getKet(page));
  });

  test('verify monomer-chain-simple.ket round trip', async () => {
    await openFileAndAddToCanvasMacro(
      page,
      'Monomer-Replacement/monomer-chain-simple.ket',
    );

    const monomerA = getMonomerLocator(page, Peptide.A);
    const monomerC = getMonomerLocator(page, Peptide.C);
    const monomerD = getMonomerLocator(page, Peptide.D);
    expect(await monomerA.count()).toBe(1);
    expect(await monomerC.count()).toBe(1);
    expect(await monomerD.count()).toBe(1);
    expect(await hasBondBetweenMonomers(page, monomerA, monomerC)).toBe(true);
    expect(await hasBondBetweenMonomers(page, monomerC, monomerD)).toBe(true);
  });

  test('verify preset-chain-same-geometry.ket round trip', async () => {
    await openFileAndAddToCanvasMacro(
      page,
      'Monomer-Replacement/preset-chain-same-geometry.ket',
    );

    expect(await countPresetsByBase(page, Preset.A)).toBe(1);
    expect(await countPresetsByBase(page, Preset.C)).toBe(1);
    const phosphateA = getMonomerLocator(
      page,
      presetComponent(Preset.A, 'phosphate'),
    ).nth(0);
    const sugarC = getMonomerLocator(
      page,
      presetComponent(Preset.C, 'sugar'),
    ).nth(1);
    expect(await hasBondBetweenMonomers(page, phosphateA, sugarC)).toBe(true);
  });

  test('verify preset-non-standard-bonds.ket round trip', async () => {
    await openFileAndAddToCanvasMacro(
      page,
      'Monomer-Replacement/preset-non-standard-bonds.ket',
    );

    expect(await countPresetsByBase(page, Preset.A)).toBe(1);
    expect(await countPresetsByBase(page, Preset.C)).toBe(1);
    const phosphateA = getMonomerLocator(
      page,
      presetComponent(Preset.A, 'phosphate'),
    ).nth(0);
    const sugarC = getMonomerLocator(
      page,
      presetComponent(Preset.C, 'sugar'),
    ).nth(1);
    expect(await hasBondBetweenMonomers(page, phosphateA, sugarC)).toBe(true);
  });

  test('verify rn-bond-priority.ket round trip', async () => {
    await openFileAndAddToCanvasMacro(
      page,
      'Monomer-Replacement/rn-bond-priority.ket',
    );

    expect(await countPresetsByBase(page, Preset.A)).toBe(1);
    expect(await getMonomerLocator(page, Sugar.R).count()).toBe(3);
    expect(await countPresetsByBase(page, Preset.C)).toBe(1);
    const phosphateA = getMonomerLocator(
      page,
      presetComponent(Preset.A, 'phosphate'),
    ).nth(0);
    const loneSugar = getMonomerLocator(page, Sugar.R).nth(1);
    const phosphateC = getMonomerLocator(
      page,
      presetComponent(Preset.C, 'phosphate'),
    ).nth(1);
    expect(await hasBondBetweenMonomers(page, phosphateA, loneSugar)).toBe(
      true,
    );
    expect(await hasBondBetweenMonomers(page, loneSugar, phosphateC)).toBe(
      true,
    );
  });

  test('verify long-chain-viewport-edge.ket round trip', async () => {
    await openFileAndAddToCanvasMacro(
      page,
      'Monomer-Replacement/long-chain-viewport-edge.ket',
    );

    const totalPresets =
      (await getMonomerLocator(page, Base.A).count()) +
      (await getMonomerLocator(page, Base.C).count()) +
      (await getMonomerLocator(page, Base.G).count()) +
      (await getMonomerLocator(page, Base.U).count());
    expect(totalPresets).toBe(LONG_CHAIN_LENGTH);
  });

  test('verify chem-bonded-target.ket round trip', async () => {
    await openFileAndAddToCanvasMacro(
      page,
      'Monomer-Replacement/chem-bonded-target.ket',
    );

    const monomerA = getMonomerLocator(page, Peptide.A);
    const monomerC = getMonomerLocator(page, Peptide.C);
    const chemEG = getMonomerLocator(page, Chem.EG);
    expect(await monomerA.count()).toBe(1);
    expect(await monomerC.count()).toBe(1);
    expect(await chemEG.count()).toBe(1);
    expect(await hasBondBetweenMonomers(page, monomerA, monomerC)).toBe(true);
    expect(await hasBondBetweenMonomers(page, monomerC, chemEG)).toBe(true);
  });
});
