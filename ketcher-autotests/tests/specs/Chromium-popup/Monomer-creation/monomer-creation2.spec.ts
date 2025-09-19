/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable max-len */
/* eslint-disable no-magic-numbers */
import { Page, expect } from '@playwright/test';
import { test } from '@fixtures';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import {
  openFileAndAddToCanvasAsNewProject,
  openFileAndAddToCanvasAsNewProjectMacro,
  pasteFromClipboardAndOpenAsNewProject,
  pasteFromClipboardAndOpenAsNewProjectMacro,
} from '@utils/files/readFile';
import {
  MacroFileType,
  selectAllStructuresOnCanvas,
  takeEditorScreenshot,
  takeElementScreenshot,
} from '@utils/canvas';
import { getAtomLocator } from '@utils/canvas/atoms/getAtomLocator/getAtomLocator';
import {
  bondTwoMonomers,
  getBondLocator,
} from '@utils/macromolecules/polymerBond';
import {
  clickOnCanvas,
  dragTo,
  MolFileFormat,
  SdfFileFormat,
  SequenceFileFormat,
  waitForMonomerPreview,
} from '@utils/index';
import {
  createMonomer,
  CreateMonomerDialog,
} from '@tests/pages/molecules/canvas/CreateMonomerDialog';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { IndigoFunctionsToolbar } from '@tests/pages/molecules/IndigoFunctionsToolbar';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { TopRightToolbar } from '@tests/pages/molecules/TopRightToolbar';
import { RightToolbar } from '@tests/pages/molecules/RightToolbar';
import { BottomToolbar } from '@tests/pages/molecules/BottomToolbar';
import {
  AminoAcidNaturalAnalogue,
  MonomerType,
  NucleotideNaturalAnalogue,
} from '@tests/pages/constants/createMonomerDialog/Constants';
import {
  getMonomerLocator,
  getSymbolLocator,
  MonomerAttachmentPoint,
} from '@utils/macromolecules/monomer';
import { Library } from '@tests/pages/macromolecules/Library';
import { Peptide } from '@tests/pages/constants/monomers/Peptides';
import { Sugar } from '@tests/pages/constants/monomers/Sugars';
import { Base } from '@tests/pages/constants/monomers/Bases';
import { Phosphate } from '@tests/pages/constants/monomers/Phosphates';
import { Nucleotide } from '@tests/pages/constants/monomers/Nucleotides';
import { Chem } from '@tests/pages/constants/monomers/Chem';
import { collapseMonomer, expandMonomer } from '@utils/canvas/monomer/helpers';
import { getAbbreviationLocator } from '@utils/canvas/s-group-signes/getAbbreviation';
import {
  FileType,
  verifyFileExport,
  verifyHELMExport,
  verifySVGExport,
} from '@utils/files/receiveFileComparisonData';
import {
  PeptideLetterCodeType,
  SequenceMonomerType,
} from '@tests/pages/constants/monomers/Constants';
import { MacromoleculesFileFormatType } from '@tests/pages/constants/fileFormats/macroFileFormats';
import { SaveStructureDialog } from '@tests/pages/common/SaveStructureDialog';
import { ErrorMessageDialog } from '@tests/pages/common/ErrorMessageDialog';
import { LayoutMode } from '@tests/pages/constants/macromoleculesTopToolbar/Constants';
import { MacromoleculesTopToolbar } from '@tests/pages/macromolecules/MacromoleculesTopToolbar';
import { PasteFromClipboardDialog } from '@tests/pages/common/PasteFromClipboardDialog';

let page: Page;
test.beforeAll(async ({ initMoleculesCanvas }) => {
  page = await initMoleculesCanvas();
});
test.afterAll(async ({ closePage }) => {
  await closePage();
});
test.beforeEach(async ({ MoleculesCanvas: _ }) => {});

async function prepareMoleculeForMonomerCreation(
  page: Page,
  AtomIDsToExclude?: string[],
  BondIDsToExclude?: string[],
) {
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);
  await page.keyboard.down('Shift');
  if (AtomIDsToExclude) {
    for (const atomId of AtomIDsToExclude) {
      await getAtomLocator(page, { atomId: Number(atomId) }).click({
        force: true,
      });
    }
  }
  if (BondIDsToExclude) {
    for (const bondId of BondIDsToExclude) {
      await getBondLocator(page, { bondId: Number(bondId) }).click();
    }
  }
  await page.keyboard.up('Shift');
}

const monomersToCreate35 = [
  {
    description: '1. Amino Acid',
    type: MonomerType.AminoAcid,
    symbol: 'AminoAcid35',
    name: 'Amino Acid Test monomer for test 35',
    naturalAnalogue: AminoAcidNaturalAnalogue.A,
  },
  {
    description: '2. Sugar',
    type: MonomerType.Sugar,
    symbol: 'Sugar35',
    name: 'Sugar Test monomer for test 35',
  },
  {
    description: '3. Base',
    type: MonomerType.Base,
    symbol: 'Base35',
    name: 'Base Test monomer for test 35',
    naturalAnalogue: NucleotideNaturalAnalogue.A,
  },
  {
    description: '4. Phosphate',
    type: MonomerType.Phosphate,
    symbol: 'Phosphate35',
    name: 'Phosphate Test monomer for test 35',
  },
  {
    description: '5. Nucleotide',
    type: MonomerType.Nucleotide,
    symbol: 'Nucleotide35',
    name: 'Nucleotide Test monomer for test 35',
    naturalAnalogue: NucleotideNaturalAnalogue.A,
  },
  {
    description: '6. CHEM',
    type: MonomerType.CHEM,
    symbol: 'CHEM35',
    name: 'CHEM Test monomer for test 35',
  },
];

for (const monomerToCreate of monomersToCreate35) {
  test(`35. Check that created ${monomerToCreate.description} monomer (expanded) can be saved/opened to/from CDX in Micro mode`, async () => {
    // Screenshots are wrong because of bug: https://github.com/epam/ketcher/issues/7764
    /*
     * Test task: https://github.com/epam/ketcher/issues/7657
     * Description: Check that created ${monomerToCreate.description} monomer (expanded) can be saved/opened to/from CDX in Micro mode
     *
     * Case:
     *      1. Open Molecules canvas
     *      2. Load molecule on canvas
     *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
     *      4. Create monomer with given attributes
     *      5. Save it to CDX and validate the result
     *      6. Load saved monomer from CDX as New Project
     *      7. Take screenshot to validate monomer got loaded
     *
     * Version 3.7
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCC');
    await prepareMoleculeForMonomerCreation(page, ['0']);

    await createMonomer(page, {
      ...monomerToCreate,
    });

    await verifyFileExport(
      page,
      `CDX/Chromium-popup/Create-monomer/${monomerToCreate.description}-expected.cdx`,
      FileType.CDX,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      `CDX/Chromium-popup/Create-monomer/${monomerToCreate.description}-expected.cdx`,
    );
    await takeEditorScreenshot(page);

    if (await ErrorMessageDialog(page).infoModalWindow.isVisible()) {
      await ErrorMessageDialog(page).close();
      await PasteFromClipboardDialog(page).cancel();
    }
  });
}

const monomersToCreate45 = [
  {
    description: '1. Amino Acid',
    type: MonomerType.AminoAcid,
    symbol: 'AminoAcid45',
    name: 'Amino Acid Test monomer for test 45',
    naturalAnalogue: AminoAcidNaturalAnalogue.A,
  },
  {
    description: '2. Sugar',
    type: MonomerType.Sugar,
    symbol: 'Sugar45',
    name: 'Sugar Test monomer for test 45',
  },
  {
    description: '3. Base',
    type: MonomerType.Base,
    symbol: 'Base45',
    name: 'Base Test monomer for test 45',
    naturalAnalogue: AminoAcidNaturalAnalogue.A,
  },
  {
    description: '4. Phosphate',
    type: MonomerType.Phosphate,
    symbol: 'Phosphate45',
    name: 'Phosphate Test monomer for test 45',
  },
  {
    description: '5. Nucleotide',
    type: MonomerType.Nucleotide,
    symbol: 'Nucleotide45',
    name: 'Nucleotide Test monomer for test 45',
    naturalAnalogue: NucleotideNaturalAnalogue.A,
  },
  {
    description: '6. CHEM',
    type: MonomerType.CHEM,
    symbol: 'CHEM45',
    name: 'CHEM Test monomer for test 45',
  },
];

for (const monomerToCreate of monomersToCreate45) {
  test(`45. Check that created ${monomerToCreate.description} monomer (collapsed) can be saved/opened to/from CDX in Micro mode`, async () => {
    // Screenshots are wrong because of bug: https://github.com/epam/ketcher/issues/7764
    /*
     * Test task: https://github.com/epam/ketcher/issues/7657
     * Description: Check that created ${monomerToCreate.description} monomer (collapsed) can be saved/opened to/from CDX in Micro mode
     *
     * Case:
     *      1. Open Molecules canvas
     *      2. Load molecule on canvas
     *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
     *      4. Create monomer with given attributes
     *      5. Collapse it
     *      6. Save it to CDX and validate the result
     *      7. Load saved monomer from CDX as New Project
     *      8. Take screenshot to validate monomer got loaded
     *
     * Version 3.7
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCC');
    await prepareMoleculeForMonomerCreation(page, ['0']);

    await createMonomer(page, {
      ...monomerToCreate,
    });
    await collapseMonomer(page, getAtomLocator(page, { atomId: 2 }));
    await verifyFileExport(
      page,
      `CDX/Chromium-popup/Create-monomer/${monomerToCreate.description}-collapsed-expected.cdx`,
      FileType.CDX,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      `CDX/Chromium-popup/Create-monomer/${monomerToCreate.description}-collapsed-expected.cdx`,
    );
    await takeEditorScreenshot(page);

    if (await ErrorMessageDialog(page).infoModalWindow.isVisible()) {
      await ErrorMessageDialog(page).close();
      await PasteFromClipboardDialog(page).cancel();
    }
  });
}
