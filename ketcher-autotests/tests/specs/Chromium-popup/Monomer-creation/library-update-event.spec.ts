/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable max-len */
/* eslint-disable no-magic-numbers */
import { Page } from '@playwright/test';
import { test } from '@fixtures';
import { pasteFromClipboardAndOpenAsNewProject } from '@utils/files/readFile';
import { selectAllStructuresOnCanvas } from '@utils/canvas';
import { clickOnCanvas } from '@utils/index';
import {
  createMonomer,
  ModificationTypeDropdown,
} from '@tests/pages/molecules/canvas/CreateMonomerDialog';
import {
  AminoAcidNaturalAnalogue,
  ModificationType,
  MonomerType,
  NucleotideNaturalAnalogue,
} from '@tests/pages/constants/createMonomerDialog/Constants';
import { Peptide } from '@tests/pages/constants/monomers/Peptides';
import { verifyConsoleExport } from '@utils/files/receiveFileComparisonData';
import { Base } from '@tests/pages/constants/monomers/Bases';
import { Sugar } from '@tests/pages/constants/monomers/Sugars';
import { Phosphate } from '@tests/pages/constants/monomers/Phosphates';
import { Nucleotide } from '@tests/pages/constants/monomers/Nucleotides';
import { Chem } from '@tests/pages/constants/monomers/Chem';

let page: Page;
test.beforeAll(async ({ initMoleculesCanvas }) => {
  page = await initMoleculesCanvas();
  await page.evaluate(async () => {
    await window.ketcher.editor.subscribe('libraryUpdate', console.log);
  });
});
test.afterAll(async ({ closePage }) => {
  await closePage();
});
test.beforeEach(async ({ MoleculesCanvas: _ }) => {});

test(`1. Check that system sends update on peptide monomer creation`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8717
   * Description:
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Subscribe on libraryUpdate event
   *      3. Load structure to the canvas
   *      4. Create peptide monomer from structure on the canvas
   *      5. Verify that event libraryUpdate was fired with correct sdf file in console
   *
   * Version 3.10
   */
  let libraryUpdateSDF = '';
  page.on('console', (msg) => {
    libraryUpdateSDF = msg.text();
  });

  await pasteFromClipboardAndOpenAsNewProject(
    page,
    'C%91%92%93C.[*:2]%91.[*:1]%92.[*:3]%93 |$;;_R2;_R1;_R3$|',
  );
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);

  await createMonomer(page, {
    type: MonomerType.AminoAcid,
    symbol: Peptide.Peptide.alias,
    name: 'Peptide Test monomer',
    naturalAnalogue: AminoAcidNaturalAnalogue.A,
    modificationTypes: [
      {
        dropdown: ModificationTypeDropdown.First,
        type: ModificationType.Citrullination,
      },
      {
        dropdown: ModificationTypeDropdown.Second,
        customModification: ModificationType.Hydroxylation,
      },
      {
        dropdown: ModificationTypeDropdown.Third,
        customModification: ModificationType.Inversion,
      },
      {
        dropdown: ModificationTypeDropdown.Fourth,
        customModification: ModificationType.NMethylation,
      },
      {
        dropdown: ModificationTypeDropdown.Fifth,
        customModification: 'Custom Modification',
      },
    ],
    HELMAlias: 'PeptTest',
  });

  await verifyConsoleExport(
    libraryUpdateSDF,
    'SDF/Chromium-popup/Monomer-creation/Peptide-monomer-expected.sdf',
  );
});

test(`2. Check that system sends update on base monomer creation`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8717
   * Description:
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Subscribe on libraryUpdate event
   *      3. Load structure to the canvas
   *      4. Create base monomer from structure on the canvas
   *      5. Verify that event libraryUpdate was fired with correct sdf file in console
   *
   * Version 3.10
   */
  let libraryUpdateSDF = '';
  page.on('console', (msg) => {
    libraryUpdateSDF = msg.text();
  });

  await pasteFromClipboardAndOpenAsNewProject(
    page,
    'C%91%92%93C.[*:2]%91.[*:1]%92.[*:3]%93 |$;;_R2;_R1;_R3$|',
  );
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);

  await createMonomer(page, {
    type: MonomerType.Base,
    symbol: Base.Base.alias,
    name: 'Base Test monomer',
    naturalAnalogue: NucleotideNaturalAnalogue.A,
    HELMAlias: 'BaseTest',
  });

  await verifyConsoleExport(
    libraryUpdateSDF,
    'SDF/Chromium-popup/Monomer-creation/Base-monomer-expected.sdf',
  );
});

test(`3. Check that system sends update on sugar monomer creation`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8717
   * Description:
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Subscribe on libraryUpdate event
   *      3. Load structure to the canvas
   *      4. Create sugar monomer from structure on the canvas
   *      5. Verify that event libraryUpdate was fired with correct sdf file in console
   *
   * Version 3.10
   */
  let libraryUpdateSDF = '';
  page.on('console', (msg) => {
    libraryUpdateSDF = msg.text();
  });

  await pasteFromClipboardAndOpenAsNewProject(
    page,
    'C%91%92%93C.[*:2]%91.[*:1]%92.[*:3]%93 |$;;_R2;_R1;_R3$|',
  );
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);

  await createMonomer(page, {
    type: MonomerType.Sugar,
    symbol: Sugar.Sugar.alias,
    name: 'Sugar Test monomer',
    HELMAlias: 'SugarTest',
  });

  await verifyConsoleExport(
    libraryUpdateSDF,
    'SDF/Chromium-popup/Monomer-creation/Sugar-monomer-expected.sdf',
  );
});

test(`4. Check that system sends update on phosphate monomer creation`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8717
   * Description:
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Subscribe on libraryUpdate event
   *      3. Load structure to the canvas
   *      4. Create phosphate monomer from structure on the canvas
   *      5. Verify that event libraryUpdate was fired with correct sdf file in console
   *
   * Version 3.10
   */
  let libraryUpdateSDF = '';
  page.on('console', (msg) => {
    libraryUpdateSDF = msg.text();
  });

  await pasteFromClipboardAndOpenAsNewProject(
    page,
    'C%91%92%93C.[*:2]%91.[*:1]%92.[*:3]%93 |$;;_R2;_R1;_R3$|',
  );
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);

  await createMonomer(page, {
    type: MonomerType.Phosphate,
    symbol: Phosphate.Phosphate.alias,
    name: 'Phosphate Test monomer',
    HELMAlias: 'PhosphateTest',
  });

  await verifyConsoleExport(
    libraryUpdateSDF,
    'SDF/Chromium-popup/Monomer-creation/Phosphate-monomer-expected.sdf',
  );
});

test(`5. Check that system sends update on nucleotide monomer creation`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8717
   * Description:
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Subscribe on libraryUpdate event
   *      3. Load structure to the canvas
   *      4. Create nucleotide monomer from structure on the canvas
   *      5. Verify that event libraryUpdate was fired with correct sdf file in console
   *
   * Version 3.10
   */
  let libraryUpdateSDF = '';
  page.on('console', (msg) => {
    libraryUpdateSDF = msg.text();
  });

  await pasteFromClipboardAndOpenAsNewProject(
    page,
    'C%91%92%93C.[*:2]%91.[*:1]%92.[*:3]%93 |$;;_R2;_R1;_R3$|',
  );
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);

  await createMonomer(page, {
    type: MonomerType.Nucleotide,
    symbol: Nucleotide.Nucleotide.alias,
    name: 'Nucleotide Test monomer',
    naturalAnalogue: NucleotideNaturalAnalogue.A,
  });

  await verifyConsoleExport(
    libraryUpdateSDF,
    'SDF/Chromium-popup/Monomer-creation/Nucleotide-monomer-expected.sdf',
  );
});

test(`6. Check that system sends update on CHEM monomer creation`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8717
   * Description:
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Subscribe on libraryUpdate event
   *      3. Load structure to the canvas
   *      4. Create CHEM monomer from structure on the canvas
   *      5. Verify that event libraryUpdate was fired with correct sdf file in console
   *
   * Version 3.10
   */
  let libraryUpdateSDF = '';
  page.on('console', (msg) => {
    libraryUpdateSDF = msg.text();
  });

  await pasteFromClipboardAndOpenAsNewProject(
    page,
    'C%91%92%93C.[*:2]%91.[*:1]%92.[*:3]%93 |$;;_R2;_R1;_R3$|',
  );
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);

  await createMonomer(page, {
    type: MonomerType.CHEM,
    symbol: Chem.CHEM.alias,
    name: 'CHEM Test monomer',
  });

  await verifyConsoleExport(
    libraryUpdateSDF,
    'SDF/Chromium-popup/Monomer-creation/CHEM-monomer-expected.sdf',
  );
});
