/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable max-len */
/* eslint-disable no-magic-numbers */
import { Page, expect } from '@playwright/test';
import { test } from '@fixtures';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import {
  openFileAndAddToCanvasAsNewProject,
  pasteFromClipboardAndOpenAsNewProject,
} from '@utils/files/readFile';
import {
  selectAllStructuresOnCanvas,
  takeEditorScreenshot,
  takeElementScreenshot,
} from '@utils/canvas';
import { getAtomLocator } from '@utils/canvas/atoms/getAtomLocator/getAtomLocator';
import { getBondLocator } from '@utils/macromolecules/polymerBond';
import {
  clickOnCanvas,
  dragTo,
  MolFileFormat,
  SdfFileFormat,
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
import { getMonomerLocator } from '@utils/macromolecules/monomer';
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
  verifyPNGExport,
  verifySVGExport,
} from '@utils/files/receiveFileComparisonData';

let page: Page;
test.beforeAll(async ({ initMoleculesCanvas }) => {
  page = await initMoleculesCanvas();
});
test.afterAll(async ({ closePage }) => {
  await closePage();
});
test.beforeEach(async ({ MoleculesCanvas: _ }) => {});

test('1. Check that a monomer creation wizard button added to the sidebar', async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7657
   * Description: Check that a monomer creation wizard button added to the sidebar
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Validate that a monomer creation wizard button visible
   *
   * Version 3.7
   */
  const createMonomerButton = LeftToolbar(page).createMonomerButton;
  await expect(createMonomerButton).toBeVisible();
});

test('2. Check that tooltip appears on hovering to wizard button', async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7657
   * Description: Check that tooltip appears on hovering to wizard button
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Hover mouse over monomer creation wizard button
   *      3. Validate that a tooltip appears
   *
   * Version 3.7
   */
  const createMonomerButton = LeftToolbar(page).createMonomerButton;
  await createMonomerButton.hover();
  await expect(createMonomerButton).toHaveAttribute(
    'title',
    'Create a monomer (Ctrl+M)',
  );
});

interface IMoleculesForMonomerCreation {
  testDescription: string;
  MoleculeSMARTS: string;
  AtomIDsToExclude?: string[];
  BondIDsToExclude?: string[];
  // Set shouldFail to true if you expect test to fail because of existed bug and put issues link to issueNumber
  shouldFail?: boolean;
  // issueNumber is mandatory if shouldFail === true
  issueNumber?: string;
  // set pageReloadNeeded to true if you need to restart ketcher before test (f.ex. to restart font renderer)
  pageReloadNeeded?: boolean;
}

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
      await getAtomLocator(page, { atomId: Number(atomId) }).click();
    }
  }
  if (BondIDsToExclude) {
    for (const bondId of BondIDsToExclude) {
      await getBondLocator(page, { bondId: Number(bondId) }).click();
    }
  }
  await page.keyboard.up('Shift');
}

const eligableMolecules: IMoleculesForMonomerCreation[] = [
  {
    testDescription:
      '1. One simple single bonds to the part of the structure that is not selected',
    MoleculeSMARTS: '[#6]-[#6]-[#6]',
    AtomIDsToExclude: ['0'],
  },
  {
    testDescription:
      '2. Five simple single bonds to the part of the structure that is not selected',
    MoleculeSMARTS:
      '[#6]-[#6](-[#6])-[#6]-[#6](-[#6])-[#6]-[#6](-[#6])-[#6]-[#6](-[#6])-[#6]-[#6](-[#6])-[#6]',
    AtomIDsToExclude: ['0', '5', '8', '11', '14'],
  },
  {
    testDescription:
      '3. Eight simple single bonds to the part of the structure that is not selected',
    MoleculeSMARTS:
      '[#6]-[#6](-[#6])-[#6](-[#6])-[#6](-[#6])-[#6](-[#6])-[#6](-[#6])-[#6](-[#6])-[#6]-[#6]',
    AtomIDsToExclude: ['0', '2', '4', '6', '8', '10', '12', '14'],
  },
];

for (const eligableMolecule of eligableMolecules) {
  test(`3. Check that ${eligableMolecule.testDescription} eligable for monomer creation`, async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/7657
     * Description: Check that if a chemical structure is selected on canvas and that
     *              chemical structure not fulfils the requirements (2.1), a monomer
     *              creation wizard button is disabled
     *
     * Case:
     *      1. Open Molecules canvas
     *      2. Load molecule on canvas
     *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
     *      4. Validate that the monomer creation wizard button is enabled
     *
     * Version 3.7
     */
    await pasteFromClipboardAndOpenAsNewProject(
      page,
      eligableMolecule.MoleculeSMARTS,
    );
    await prepareMoleculeForMonomerCreation(
      page,
      eligableMolecule.AtomIDsToExclude,
      eligableMolecule.BondIDsToExclude,
    );
    await expect(LeftToolbar(page).createMonomerButton).toBeEnabled();
  });
}

const nonEligableMolecules: IMoleculesForMonomerCreation[] = [
  {
    testDescription:
      '1. Structure have more than eight, simple single bonds to the part of the structure',
    MoleculeSMARTS:
      '[#6]-[#6](-[#6])-[#6](-[#6])-[#6](-[#6])-[#6](-[#6])-[#6](-[#6])-[#6](-[#6])-[#6](-[#6])-[#6]',
    AtomIDsToExclude: ['0', '2', '4', '6', '8', '10', '12', '14', '15'],
  },
  {
    testDescription: '2. Single Up bond to unselected structure',
    MoleculeSMARTS: '[#6]-[#6](/[#6])-[#6]',
    AtomIDsToExclude: ['2'],
  },
  {
    testDescription: '3. Single Down bond to unselected structure',
    MoleculeSMARTS: '[#6]-[#6](\\[#6])-[#6]',
    AtomIDsToExclude: ['2'],
  },
  {
    testDescription: '4. Single Up/Down bond to unselected structure',
    MoleculeSMARTS:
      'VmpDRDAxMDAEAwIBAAAAAAAAAAAAAAAAAAAAAAUIBAAAAB4AGggCAAMAGwgCAAQAAAEkAAAAAgACAOn9BQBBcmlhbAMA6f0PAFRpbWVzIE5ldyBSb21hbgADMgAIAP///////wAAAAAAAP//AAAAAP////8AAAAA//8AAAAA/////wAAAAD/////AAD//wGAAAAAABAIAgABAA8IAgABAAQCEAAWAPwABQXBAOv/zgD6+vQAA4AEAAAABIAFAAAAAAIIACsALQD7+hkAAAAEgAYAAAAAAggADgAPAPv6GQAwBAEABzEEEAAFAAAABwAAAAgAAAAFAAAARgQBAAIAAASABwAAAAACCAAAAAAAAAAAAAAABIAIAAAAAAIIAAAAAAD19TMAAAAFgAkAAAAEBgQABQAAAAUGBAAGAAAAAAAFgAoAAAAEBgQABgAAAAUGBAAHAAAAAAAFgAsAAAAEBgQABgAAAAUGBAAIAAAAAQYCAAgAAAAHgAAAAAAEAhAAAAAAAPX1MwAAAAAA9fUzAAAKAgAHAAcKAgALAD0KAgAAAAaAAAAAAAACCAAAAAAA9fUzAAEHAQABCAcBAAAABxIAAQAAAAMAYADIAAAAQ2hpcmFsAAAAAAAAAAAAAAAA',
    AtomIDsToExclude: ['3'],
  },
  {
    testDescription: '5. Double Cis/Trans bond to unselected structure',
    MoleculeSMARTS:
      'VmpDRDAxMDAEAwIBAAAAAAAAAAAAAAAAAAAAAAUIBAAAAB4AGggCAAMAGwgCAAQAAAEkAAAAAgACAOn9BQBBcmlhbAMA6f0PAFRpbWVzIE5ldyBSb21hbgADMgAIAP///////wAAAAAAAP//AAAAAP////8AAAAA//8AAAAA/////wAAAAD/////AAD//wGAAAAAABAIAgABAA8IAgABAAQCEAAUIAYB853rAOsf2QDokx8BA4AEAAAABIAFAAAAAAIIACoALQD7+hkAAAAEgAYAAAAAAggADgAPAPv6GQAwBAEABzEEEAAFAAAABwAAAAgAAAAFAAAARgQBAAIAAASABwAAAAACCAAAAAAAAAAAAAAABIAIAAAAAAIIAAAAAAD19TMAAAAFgAkAAAAEBgQABQAAAAUGBAAGAAAAAAAFgAoAAAAEBgQABgAAAAUGBAAHAAAAAAAFgAsAAAAEBgQABgAAAAUGBAAIAAAAAAYCAAIAAQYCAAgAAAAHgAAAAAAEAhAAAAAAAPX1MwAAAAAA9fUzAAAKAgAHAAcKAgALAD0KAgAAAAaAAAAAAAACCAAAAAAA9fUzAAEHAQABCAcBAAAABxIAAQAAAAMAYADIAAAAQ2hpcmFsAAAAAAAAAAAAAAAA',
    AtomIDsToExclude: ['3'],
  },
  {
    testDescription: '6. Double bond to unselected structure',
    MoleculeSMARTS: '[#6]-[#6](=[#6])-[#6]',
    AtomIDsToExclude: ['2'],
  },
  {
    testDescription: '7. Triple bond to unselected structure',
    MoleculeSMARTS: '[#6]-[#6](#[#6])-[#6]',
    AtomIDsToExclude: ['2'],
  },
  {
    testDescription: '8. Any bond to unselected structure',
    MoleculeSMARTS:
      'VmpDRDAxMDAEAwIBAAAAAAAAAAAAAAAAAAAAAAUIBAAAAB4AGggCAAMAGwgCAAQAAAEkAAAAAgACAOn9BQBBcmlhbAMA6f0PAFRpbWVzIE5ldyBSb21hbgADMgAIAP///////wAAAAAAAP//AAAAAP////8AAAAA//8AAAAA/////wAAAAD/////AAD//wGAAAAAABAIAgABAA8IAgABAAQCEAAAIPcAwN7kAAAgygDm1BgBA4AEAAAABIAFAAAAAAIIAAAALQAT+xkAAAAEgAYAAAAAAggAAAAPABP7GQAAAASABwAAAAACCAAAAAAAAAAAAAAABIAIAAAAAAIIAAAAAAAl9jMAAAAFgAkAAAAEBgQABQAAAAUGBAAGAAAAAAAFgAoAAAAEBgQABgAAAAUGBAAHAAAAAAYCAP//AAAFgAsAAAAEBgQABgAAAAUGBAAIAAAAAAAAAAAAAAAAAA==',
    AtomIDsToExclude: ['2'],
  },
  {
    testDescription: '9. Aromatic bond to unselected structure',
    MoleculeSMARTS: '[#6]-[#6](:[#6])-[#6]',
    AtomIDsToExclude: ['2'],
  },
  {
    testDescription: '10. Single/Double bond to unselected structure',
    MoleculeSMARTS: '[#6]-[#6](!:;-,=[#6])-[#6]',
    AtomIDsToExclude: ['2'],
  },
  {
    testDescription: '11. Single/Aromatic bond to unselected structure',
    MoleculeSMARTS: '[#6]-[#6](-[#6])[#6]',
    AtomIDsToExclude: ['3'],
  },
  {
    testDescription: '12. Single/Double bond to unselected structure',
    MoleculeSMARTS: '[#6]-[#6](!:;-,=[#6])-[#6]',
    AtomIDsToExclude: ['2'],
  },
  {
    testDescription: '13. Single/Aromatic bond to unselected structure',
    MoleculeSMARTS: '[#6]-[#6]([#6])-[#6]',
    AtomIDsToExclude: ['2'],
  },
  {
    testDescription: '14. Double/Aromatic bond to unselected structure',
    MoleculeSMARTS: '[#6]-[#6](=,:[#6])-[#6]',
    AtomIDsToExclude: ['2'],
  },
  {
    testDescription: '15. Dative bond to unselected structure',
    MoleculeSMARTS:
      'VmpDRDAxMDAEAwIBAAAAAAAAAAAAAAAAAAAAAAUIBAAAAB4AGggCAAMAGwgCAAQAAAEkAAAAAgACAOn9BQBBcmlhbAMA6f0PAFRpbWVzIE5ldyBSb21hbgADMgAIAP///////wAAAAAAAP//AAAAAP////8AAAAA//8AAAAA/////wAAAAD/////AAD//wGAAAAAABAIAgABAA8IAgABAAQCEAAAwOQA7YSqAADAtwAUe94AA4AEAAAABIAFAAAAAAIIAAAALQAT+xkAAAAEgAYAAAAAAggAAAAPABP7GQAAAASABwAAAAACCAAAAAAAAAAAAAAABIAIAAAAAAIIAAAAAAAm9jMAAAAFgAkAAAAEBgQABQAAAAUGBAAGAAAAAAAFgAoAAAAEBgQABgAAAAUGBAAHAAAAAAYCAAAQAAAFgAsAAAAEBgQABgAAAAUGBAAIAAAAAAAAAAAAAAAAAA==',
    AtomIDsToExclude: ['2'],
  },
  {
    testDescription: '16. Hydrogen bond to unselected structure',
    MoleculeSMARTS:
      'VmpDRDAxMDAEAwIBAAAAAAAAAAAAAAAAAAAAAAUIBAAAAB4AGggCAAMAGwgCAAQAAAEkAAAAAgACAOn9BQBBcmlhbAMA6f0PAFRpbWVzIE5ldyBSb21hbgADMgAIAP///////wAAAAAAAP//AAAAAP////8AAAAA//8AAAAA/////wAAAAD/////AAD//wGAAAAAABAIAgABAA8IAgABAAQCEAAVIPcAcufrAOsfygBo3R8BA4AEAAAABIAFAAAAAAIIACoALQD7+hkAAAAEgAYAAAAAAggADgAPAPv6GQAAAASABwAAAAACCAAAAAAAAAAAAAAABIAIAAAAAAIIAAAAAAD19TMAAAAFgAkAAAAEBgQABQAAAAUGBAAGAAAAAAAFgAoAAAAEBgQABgAAAAUGBAAHAAAAAAYCAABAAAAFgAsAAAAEBgQABgAAAAUGBAAIAAAAAAAAAAAAAAAAAA==',
    AtomIDsToExclude: ['2'],
  },
  {
    testDescription: '17. Chemical structure contain any S-groups',
    MoleculeSMARTS: 'CCCC |SgD:1,2:aaa:aaa::: :|',
    AtomIDsToExclude: ['0'],
  },
  {
    testDescription: '18. Chemical structure contain any S-groups',
    MoleculeSMARTS: 'CCCC |SgD:1,2:aaa:aaa::: :|',
    AtomIDsToExclude: ['0'],
  },
  {
    testDescription: '19. Chemical structure contain any R-groups',
    MoleculeSMARTS: 'C%91.CC%92.[*:3]%92%91 |$;;;_R3$|',
    AtomIDsToExclude: ['0'],
  },
  {
    testDescription:
      '20. Chemical structure contain any atoms from the extended table',
    MoleculeSMARTS: 'C(*CC)C',
    AtomIDsToExclude: ['0'],
  },
  {
    testDescription: '21. Selected chemical structure not continuous',
    MoleculeSMARTS: 'CCNCC',
    AtomIDsToExclude: ['2'],
  },
];

for (const nonEligableMolecule of nonEligableMolecules) {
  test(`3. Check that ${nonEligableMolecule.testDescription} not eligable for monomer creation`, async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/7657
     * Description: Check that wizard button not appear if the selected chemical
     *              structure have more than eight, simple single bonds to the part
     *              of the structure that is not selected
     *
     * Case:
     *      1. Open Molecules canvas
     *      2. Load molecule on canvas
     *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
     *      4. Validate that the monomer creation wizard button is disabled
     *
     * Version 3.7
     */
    await pasteFromClipboardAndOpenAsNewProject(
      page,
      nonEligableMolecule.MoleculeSMARTS,
    );
    await prepareMoleculeForMonomerCreation(
      page,
      nonEligableMolecule.AtomIDsToExclude,
      nonEligableMolecule.BondIDsToExclude,
    );
    await expect(LeftToolbar(page).createMonomerButton).toBeDisabled();
  });
}

test(`4. Check that when user clicks on the "Create monomer" button the structure is loaded in the monomer creation wizard`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7657
   * Description: Check that when user clicks on the "Create monomer" button the structure
   *              is loaded in the monomer creation wizard with blank properties
   *              (no monomer type, name, symbol, etc.) and with default attachment points.
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
   *      4. Press "Create monomer" button
   *      5. Take screenshot to validate initial wizard state
   *
   * Version 3.7
   */
  await pasteFromClipboardAndOpenAsNewProject(
    page,
    eligableMolecules[0].MoleculeSMARTS,
  );
  await prepareMoleculeForMonomerCreation(
    page,
    eligableMolecules[0].AtomIDsToExclude,
    eligableMolecules[0].BondIDsToExclude,
  );
  await expect(LeftToolbar(page).createMonomerButton).toBeEnabled();
  await LeftToolbar(page).createMonomer();
  await takeEditorScreenshot(page);
  await CreateMonomerDialog(page).discard();
});

test.fail(
  `5. Check that the toolbar icons are disabled/enabled when the monomer creation wizard is active`,
  async () => {
    // Bug: https://github.com/epam/ketcher/issues/7581
    /*
     * Test task: https://github.com/epam/ketcher/issues/7657
     * Description: Check that the toolbar icons are disabled/enabled when the monomer creation wizard is active
     *
     * Case:
     *      1. Open Molecules canvas
     *      2. Load molecule on canvas
     *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
     *      4. Press "Create monomer" button
     *      5. Validate that the toolbar icons are disabled/enabled
     *
     * Version 3.7
     */

    const commonTopLeftToolbar = CommonTopLeftToolbar(page);
    const indigoFunctionsToolbar = IndigoFunctionsToolbar(page);
    const commonTopRightToolbar = CommonTopRightToolbar(page);
    const topRightToolbar = TopRightToolbar(page);
    const rightToolbar = RightToolbar(page);
    const bottomToolbar = BottomToolbar(page);

    const commonLeftToolbar = CommonLeftToolbar(page);
    const leftToolbar = LeftToolbar(page);

    await pasteFromClipboardAndOpenAsNewProject(
      page,
      eligableMolecules[0].MoleculeSMARTS,
    );
    await prepareMoleculeForMonomerCreation(
      page,
      eligableMolecules[0].AtomIDsToExclude,
      eligableMolecules[0].BondIDsToExclude,
    );
    await leftToolbar.createMonomer();

    await Promise.all([
      expect(commonTopLeftToolbar.clearCanvasButton).toBeDisabled(),
      expect(commonTopLeftToolbar.openButton).toBeDisabled(),
      expect(commonTopLeftToolbar.saveButton).toBeDisabled(),
      expect(commonTopLeftToolbar.undoButton).toBeEnabled(),
      expect(commonTopLeftToolbar.redoButton).toBeEnabled(),
      expect(indigoFunctionsToolbar.aromatizeButton).toBeDisabled(),
      expect(indigoFunctionsToolbar.dearomatizeButton).toBeDisabled(),
      expect(indigoFunctionsToolbar.layoutButton).toBeDisabled(),
      expect(indigoFunctionsToolbar.cleanUpButton).toBeDisabled(),
      expect(indigoFunctionsToolbar.calculateCIPButton).toBeDisabled(),
      expect(indigoFunctionsToolbar.checkStructureButton).toBeDisabled(),
      expect(indigoFunctionsToolbar.calculatedValuesButton).toBeDisabled(),
      expect(
        indigoFunctionsToolbar.addRemoveExplicitHydrogensButton,
      ).toBeDisabled(),
      expect(indigoFunctionsToolbar.ThreeDViewerButton).toBeDisabled(),
      expect(commonTopRightToolbar.ketcherModeSwitcherCombobox).toBeDisabled(),
      expect(commonTopRightToolbar.fullScreenButton).toBeEnabled(),
      expect(commonTopRightToolbar.helpButton).toBeDisabled(),
      expect(commonTopRightToolbar.aboutButton).toBeDisabled(),
      expect(commonTopRightToolbar.zoomSelector).toBeEnabled(),
      expect(topRightToolbar.settingsButton).toBeDisabled(),

      expect(rightToolbar.hydrogenButton).toBeDisabled(),
      expect(rightToolbar.carbonButton).toBeDisabled(),
      expect(rightToolbar.nitrogenButton).toBeDisabled(),
      expect(rightToolbar.oxygenButton).toBeDisabled(),
      expect(rightToolbar.sulfurButton).toBeDisabled(),
      expect(rightToolbar.phosphorusButton).toBeDisabled(),
      expect(rightToolbar.fluorineButton).toBeDisabled(),
      expect(rightToolbar.chlorineButton).toBeDisabled(),
      expect(rightToolbar.bromineButton).toBeDisabled(),
      expect(rightToolbar.iodineButton).toBeDisabled(),
      expect(rightToolbar.periodicTableButton).toBeDisabled(),
      expect(rightToolbar.anyAtomButton).toBeDisabled(),
      expect(rightToolbar.extendedTableButton).toBeDisabled(),

      expect(commonLeftToolbar.handToolButton).toBeEnabled(),
      expect(commonLeftToolbar.areaSelectionDropdownButton).toBeEnabled(),
      expect(leftToolbar.chainButton).toBeDisabled(),
      expect(leftToolbar.stereochemistryButton).toBeDisabled(),
      expect(leftToolbar.chargePlusButton).toBeDisabled(),
      expect(leftToolbar.chargeMinusButton).toBeDisabled(),
      expect(leftToolbar.sGroupButton).toBeDisabled(),
      expect(leftToolbar.rGroupToolsButton).toBeDisabled(),
      expect(leftToolbar.createMonomerButton).toBeDisabled(),
      expect(leftToolbar.reactionPlusToolButton).toBeDisabled(),
      expect(leftToolbar.arrowToolsButton).toBeDisabled(),
      expect(leftToolbar.reactionMappingToolsButton).toBeDisabled(),
      expect(leftToolbar.shapeToolsButton).toBeDisabled(),
      expect(leftToolbar.addTextButton).toBeDisabled(),
      expect(leftToolbar.addImageButton).toBeDisabled(),

      expect(bottomToolbar.benzeneButton).toBeDisabled(),
      expect(bottomToolbar.cyclopentadieneButton).toBeDisabled(),
      expect(bottomToolbar.cyclohexaneButton).toBeDisabled(),
      expect(bottomToolbar.cyclopentaneButton).toBeDisabled(),
      expect(bottomToolbar.cyclopropaneButton).toBeDisabled(),
      expect(bottomToolbar.cyclobutaneButton).toBeDisabled(),
      expect(bottomToolbar.cycloheptaneButton).toBeDisabled(),
      expect(bottomToolbar.cyclooctaneButton).toBeDisabled(),
      expect(bottomToolbar.structureLibraryButton).toBeDisabled(),
    ]);
    await CreateMonomerDialog(page).discard();
  },
);

const eightAttachmentPointsMolecules: IMoleculesForMonomerCreation[] = [
  {
    testDescription:
      '1. Eight attachment points molecule attached to two atoms',
    MoleculeSMARTS: 'Br(Br(C)(C)(C)C)(C)(C)(C)C',
    AtomIDsToExclude: ['2', '3', '4', '5', '6', '7', '8', '9'],
  },
  {
    testDescription:
      '2. Eight attachment points molecule attached to eight atoms',
    MoleculeSMARTS: 'CBrBr(C)Br(C)Br(C)Br(C)Br(C)Br(C)BrC',
    AtomIDsToExclude: ['0', '3', '5', '7', '9', '11', '13', '15'],
  },
];

for (const eightAttachmentPointsMolecule of eightAttachmentPointsMolecules) {
  test(`6. Check that ${eightAttachmentPointsMolecule.testDescription} has correct leaving groups and bonds`, async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/7657
     * Description: 1. Check that the default attachment points is attachment atom is the atom
     *                 within the selected structure that has a simple single bond with the
     *                 non-selected part of the structure
     *              2. Check that the default attachment points is the leaving group atom (a hydrogen)
     *                 is added by default at the end of the bond connecting the attachment atom and
     *                 the non-selected part of the structure
     *              3. Check that leaving group atoms are marked (see mockups), until the user confirms
     *                 (clicks OK) on the warning message in the error/warning area at the bottom for
     *                 the wizard: "Attachment points are set by default with hydrogens as leaving groups
     * Case:
     *      1. Open Molecules canvas
     *      2. Load molecule on canvas
     *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
     *      4. Press "Create Monomer" button
     *      5. Take a screenshot of the canvas validate leaving groups and bonds
     *
     * Version 3.7
     */
    const notificationMessage = page.getByText(
      'Attachment points are set by default with hydrogens as leaving groups.',
    );
    await pasteFromClipboardAndOpenAsNewProject(
      page,
      eightAttachmentPointsMolecule.MoleculeSMARTS,
    );
    await prepareMoleculeForMonomerCreation(
      page,
      eightAttachmentPointsMolecule.AtomIDsToExclude,
      eightAttachmentPointsMolecule.BondIDsToExclude,
    );
    await LeftToolbar(page).createMonomer();
    await takeEditorScreenshot(page);
    expect(await notificationMessage.count()).toBeGreaterThan(0);
    await CreateMonomerDialog(page).discard();
  });
}

test(`7. Check than monomer Type field is blank when open it first time`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7657
   * Description: Check than monomer Type field is blank when open it first time
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
   *      4. Press "Create Monomer" button
   *      5. Check than monomer Type field is blank when open it first time
   *
   * Version 3.7
   */
  await pasteFromClipboardAndOpenAsNewProject(
    page,
    eligableMolecules[0].MoleculeSMARTS,
  );
  await prepareMoleculeForMonomerCreation(
    page,
    eligableMolecules[0].AtomIDsToExclude,
    eligableMolecules[0].BondIDsToExclude,
  );
  await LeftToolbar(page).createMonomer();

  await expect(CreateMonomerDialog(page).typeCombobox).toContainText('');
  await CreateMonomerDialog(page).discard();
});

test(`8. Check options from the drop-down menu Type`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7657
   * Description: Check options from the drop-down menu Type
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
   *      4. Press "Create Monomer" button
   *      5. Check options from the drop-down menu Type are in place
   *
   * Version 3.7
   */
  await pasteFromClipboardAndOpenAsNewProject(
    page,
    eligableMolecules[0].MoleculeSMARTS,
  );
  await prepareMoleculeForMonomerCreation(
    page,
    eligableMolecules[0].AtomIDsToExclude,
    eligableMolecules[0].BondIDsToExclude,
  );
  await LeftToolbar(page).createMonomer();
  await CreateMonomerDialog(page).typeCombobox.click();
  await Promise.all([
    expect(page.getByTestId(MonomerType.AminoAcid)).toContainText('Amino acid'),
    expect(page.getByTestId(MonomerType.Sugar)).toContainText('Sugar'),
    expect(page.getByTestId(MonomerType.Base)).toContainText('Base'),
    expect(page.getByTestId(MonomerType.Phosphate)).toContainText('Phosphate'),
    expect(page.getByTestId(MonomerType.Nucleotide)).toContainText(
      'Nucleotide',
    ),
    expect(page.getByTestId(MonomerType.CHEM)).toContainText('CHEM'),
  ]);
  await page.getByTestId(MonomerType.AminoAcid).click();
  await CreateMonomerDialog(page).discard();
});

test(`9. Check that if the monomer type is not selected error message occures`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7657
   * Description: Check that if the monomer type is not selected, and the user clicks on Save/Finish in the wizard,
   *              an error message appears in the error/warning area: "Mandatory fields must be filled.",
   *              and the type drop-down is highlighted
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
   *      4. Press "Create Monomer" button
   *      4.1 Validate that Type drop-down is not filled
   *      5. Press Submit button
   *      6. Verify that the error message is displayed
   *      7. Take screenshot to validate that Type drop-down is highlighted
   *
   * Version 3.7
   */
  const errorMessage = page.getByText('Mandatory fields must be filled.');
  await pasteFromClipboardAndOpenAsNewProject(
    page,
    eligableMolecules[0].MoleculeSMARTS,
  );
  await prepareMoleculeForMonomerCreation(
    page,
    eligableMolecules[0].AtomIDsToExclude,
    eligableMolecules[0].BondIDsToExclude,
  );
  await LeftToolbar(page).createMonomer();
  await expect(CreateMonomerDialog(page).typeCombobox).toContainText('');
  await CreateMonomerDialog(page).submit();
  expect(await errorMessage.count()).toBeGreaterThan(0);
  await takeElementScreenshot(page, CreateMonomerDialog(page).typeCombobox);
  await CreateMonomerDialog(page).discard();
});

test(`10. Check that if the monomer name is not entered error message occures`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7657
   * Description: 1. Verify that the "Monomer name" field is present in the monomer creation wizard
   *              2. Check that if no name is entered, and the user clicks on Save/Finish in the wizard, an error
   *                 message appears in the error/warning area: "Mandatory fields must be filled.", and the name
   *                 input field is highlighted
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
   *      4. Press "Create Monomer" button
   *      5. Select Type - Amino acid
   *      6 Validate that Name edit box is not filled
   *      7. Press Submit button
   *      8. Verify that the error message is displayed
   *      9. Take screenshot to validate that Name drop-down is highlighted
   *
   * Version 3.7
   */
  const errorMessage = page.getByText('Mandatory fields must be filled.');
  await pasteFromClipboardAndOpenAsNewProject(
    page,
    eligableMolecules[0].MoleculeSMARTS,
  );
  await prepareMoleculeForMonomerCreation(
    page,
    eligableMolecules[0].AtomIDsToExclude,
    eligableMolecules[0].BondIDsToExclude,
  );
  await LeftToolbar(page).createMonomer();
  await CreateMonomerDialog(page).selectType(MonomerType.AminoAcid);
  await expect(CreateMonomerDialog(page).nameEditbox).toContainText('');
  await CreateMonomerDialog(page).submit();
  expect(await errorMessage.count()).toBeGreaterThan(0);
  await takeElementScreenshot(page, CreateMonomerDialog(page).nameEditbox);
  await CreateMonomerDialog(page).discard();
});

const eligableNames = [
  // Bug: https://github.com/epam/ketcher/issues/7745
  {
    description: '1. Longest Name',
    value:
      "N-[4-(dimethylethyl)benzoyl]-2'-O-(tetrahydromethoxypyranyl)adenylyl-(3'→5')-4-deamino-4-(2,4-dimethylphenoxy)-2'-O-(tetrahydromethoxypyranyl)cytidylyl-(3'→5')-4-deamino-4-(2,4-dimethylphenoxy)-2'-O-(tetrahydromethoxypyranyl)cytidylyl-(3'→5')-N-[4-(dimethylethyl)benzoyl]-2'-O-(tetrahydromethoxypyranyl)cytidylyl-(3'→5')-N-[4-(dimethylethyl)benzoyl]-2'-O-(tetrahydromethoxypyranyl)cytidylyl-(3'→5')-N-[[4-(dimethylethyl)phenyl]acetyl]-2'-O-(tetrahydromethoxypyranyl)guanylyl-(3'→5')-N-[[4-(dimethylethyl)phenyl]acetyl]-2'-O-(tetrahydromethoxypyranyl)guanylyl-(3'→5')-N-[4-(dimethylethyl)benzoyl]-2'-O-(tetrahydromethoxypyranyl)adenylyl-(3'→5')-N-[4-(dimethylethyl)benzoyl]-2'-O-(tetrahydromethoxypyranyl)cytidylyl-(3'→5')-4-deamino-4-(2,4-dimethylphenoxy)-2'-O-(tetrahydromethoxypyranyl)cytidylyl-(3'→5')-4-deamino-4-(2,4-dimethylphenoxy)-2'-O-(tetrahydromethoxypyranyl)cytidylyl-(3'→5')-N-[[4-(dimethylethyl)phenyl]acetyl]-2'-O-(tetrahydromethoxypyranyl)guanylyl-(3'→5')-4-deamino-4-(2,4-dimethylphenoxy)-2'-O-(tetrahydromethoxypyranyl)cytidylyl-(3'→5')-N-[4-(dimethylethyl)benzoyl]-2'-O-(tetrahydromethoxypyranyl)cytidylyl-(3'→5')-N-[4-(dimethylethyl)benzoyl]-2'-O-(tetrahydromethoxypyranyl)cytidylyl-(3'→5')-N-[4-(dimethylethyl)benzoyl]-2'-O-(tetrahydromethoxypyranyl)adenylyl-(3'→5')-N-[4-(dimethylethyl)benzoyl]-2'-O-(tetrahydromethoxypyranyl)cytidylyl-(3'→5')-N-[4-(dimethylethyl)benzoyl]-2'-O-(tetrahydromethoxypyranyl)cytidylyl-(3'→5')-N-[4-(dimethylethyl)benzoyl]-2',3'-O-(methoxymetylene)-octadecakis(2-chlorophenyl)ester. 5'-[2-(dibromomethyl)benzoate]",
  },
  { description: '2. Shortest Name', value: 's' },
  {
    description: '3. Name of special symbols',
    value: '!@#$%^&*()_-+{}[]~}<>;,.\\|/:',
  },
  {
    description: '4. Name of with spaces',
    value: '1 2  3   4    5     6       End',
  },
];

for (const eligableName of eligableNames) {
  test(`11. Create monomer with ${eligableName.description}`, async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/7657
     * Description: Entering a valid monomer name allows saving
     *
     * Case:
     *      1. Open Molecules canvas
     *      2. Load molecule on canvas
     *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
     *      4. Create monomer with eligable name
     *      5. Switch to Macromolecules editor
     *      6. Hover mouse over created monomer
     *      7. Validate monomer preview contains ${eligableName.value}
     *
     * Version 3.7
     */
    await pasteFromClipboardAndOpenAsNewProject(
      page,
      eligableMolecules[0].MoleculeSMARTS,
    );
    await prepareMoleculeForMonomerCreation(
      page,
      eligableMolecules[0].AtomIDsToExclude,
      eligableMolecules[0].BondIDsToExclude,
    );
    await createMonomer(page, {
      type: MonomerType.CHEM,
      symbol: 'Temp',
      name: eligableName.value,
    });
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    const monomer = getMonomerLocator(page, {
      monomerAlias: 'Temp',
    });
    await dragTo(page, monomer, { x: 450, y: 250 });
    await monomer.hover({ force: true });
    await waitForMonomerPreview(page);
    await expect(page.getByTestId('preview-tooltip-title')).toContainText(
      eligableName.value,
    );
  });
}

const nonEligableNames = [
  {
    description: '1. Spaces only',
    value: '   ',
    errorMessage: 'Mandatory fields must be filled.',
  },
];

for (const nonEligableName of nonEligableNames) {
  test(`12. Create monomer with ${nonEligableName.description}`, async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/7657
     * Description: Entering a invalid monomer name causes an error
     *
     * Case:
     *      1. Open Molecules canvas
     *      2. Load molecule on canvas
     *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
     *      4. Try to create monomer with non-eligible name
     *      5. Validate error message is shown
     *
     * Version 3.7
     */
    const errorMessage = page.getByText(nonEligableName.errorMessage);
    const createMonomerDialog = CreateMonomerDialog(page);

    await pasteFromClipboardAndOpenAsNewProject(
      page,
      eligableMolecules[0].MoleculeSMARTS,
    );
    await prepareMoleculeForMonomerCreation(
      page,
      eligableMolecules[0].AtomIDsToExclude,
      eligableMolecules[0].BondIDsToExclude,
    );
    await LeftToolbar(page).createMonomer();
    await createMonomerDialog.selectType(MonomerType.CHEM);
    await createMonomerDialog.setSymbol('Temp');
    await createMonomerDialog.setName(nonEligableName.value);
    await createMonomerDialog.submit();
    expect(await errorMessage.count()).toBeGreaterThan(0);
    await CreateMonomerDialog(page).discard();
  });
}

const eligableSymbols = [
  {
    description: '1. Longest Symbol (uppercase and lowercase letters, numbers)',
    value:
      'LongestSymbolabcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890',
  },
  { description: '2. Shortest Symbol', value: 's' },
  {
    description: '3. Symbol of special characters',
    value: '-_*',
  },
  {
    description: '4. Symbol with all allowed characters',
    value: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890-_*',
  },
];

for (const eligableSymbol of eligableSymbols) {
  test(`13. Create monomer with ${eligableSymbol.description}`, async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/7657
     * Description: Entering a valid monomer name allows saving
     *
     * Case:
     *      1. Open Molecules canvas
     *      2. Load molecule on canvas
     *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
     *      4. Create monomer with eligable symbol value
     *      5. Switch to Macromolecules editor
     *      7. Validate that monomer with ${eligableSymbol.value} present on the canvas
     *
     * Version 3.7
     */
    await pasteFromClipboardAndOpenAsNewProject(
      page,
      eligableMolecules[0].MoleculeSMARTS,
    );
    await prepareMoleculeForMonomerCreation(
      page,
      eligableMolecules[0].AtomIDsToExclude,
      eligableMolecules[0].BondIDsToExclude,
    );
    await createMonomer(page, {
      type: MonomerType.CHEM,
      symbol: eligableSymbol.value,
      name: 'Temp',
    });
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    const monomer = getMonomerLocator(page, {
      monomerAlias: eligableSymbol.value,
    });
    expect(await monomer.count()).toEqual(1);
  });
}

const nonEligableSymbols = [
  {
    description: '1. Spaces only',
    symbol: '   ',
    type: MonomerType.CHEM,
    errorMessage: 'Mandatory fields must be filled.',
  },
  {
    description: '2. Incorrect characters',
    symbol: '!@#$%^&*()_-+{}[]~}<>;,.\\|/:',
    type: MonomerType.CHEM,
    errorMessage:
      'The monomer symbol must consist only of uppercase and lowercase letters, numbers, hyphens (-), underscores (_), and asterisks (*).',
  },
  {
    description: '3. Non-unique for one HELM class (Peptides-Amino acids)',
    symbol: '1Nal',
    type: MonomerType.AminoAcid,
    naturalAnalogue: AminoAcidNaturalAnalogue.C,
    errorMessage:
      'The symbol must be unique amongst peptide, RNA, or CHEM monomers.',
  },
  {
    description: '4. Non-unique for one HELM class (RNA-Sugars)',
    symbol: '12ddR',
    type: MonomerType.Sugar,
    errorMessage:
      'The symbol must be unique amongst peptide, RNA, or CHEM monomers.',
  },
  {
    description: '5. Non-unique for one HELM class (RNA-Bases)',
    symbol: '2imen2',
    type: MonomerType.Base,
    naturalAnalogue: NucleotideNaturalAnalogue.C,
    errorMessage:
      'The symbol must be unique amongst peptide, RNA, or CHEM monomers.',
  },
  {
    description: '6. Non-unique for one HELM class (RNA-Phosphates)',
    symbol: 'AmC12',
    type: MonomerType.Phosphate,
    errorMessage:
      'The symbol must be unique amongst peptide, RNA, or CHEM monomers.',
  },
  {
    description: '7. Non-unique for one HELM class (RNA-Nucleotides)',
    symbol: '3Puro',
    type: MonomerType.Nucleotide,
    errorMessage:
      'The symbol must be unique amongst peptide, RNA, or CHEM monomers.',
  },
  {
    description: '8. Non-unique for one HELM class (RNA-CHEM)',
    symbol: '2-Bio',
    type: MonomerType.CHEM,
    errorMessage:
      'The symbol must be unique amongst peptide, RNA, or CHEM monomers.',
  },
  {
    description: '9. No symbol entered',
    symbol: '',
    type: MonomerType.CHEM,
    errorMessage: 'Mandatory fields must be filled.',
  },
];

for (const nonEligableSymbol of nonEligableSymbols) {
  test(`14. Create monomer with ${nonEligableSymbol.description}`, async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/7657
     * Description: Entering a invalid monomer symbol causes an error
     *
     * Case:
     *      1. Open Molecules canvas
     *      2. Load molecule on canvas
     *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
     *      4. Try to create monomer with non-eligible name
     *      5. Validate error message is shown
     *
     * Version 3.7
     */
    const errorMessage = page.getByText(nonEligableSymbol.errorMessage);
    const createMonomerDialog = CreateMonomerDialog(page);

    await pasteFromClipboardAndOpenAsNewProject(
      page,
      eligableMolecules[0].MoleculeSMARTS,
    );
    await prepareMoleculeForMonomerCreation(
      page,
      eligableMolecules[0].AtomIDsToExclude,
      eligableMolecules[0].BondIDsToExclude,
    );
    await LeftToolbar(page).createMonomer();
    await createMonomerDialog.selectType(nonEligableSymbol.type);
    await createMonomerDialog.setSymbol(nonEligableSymbol.symbol);
    await createMonomerDialog.setName('Temp');
    if (nonEligableSymbol.naturalAnalogue) {
      await createMonomerDialog.selectNaturalAnalogue(
        nonEligableSymbol.naturalAnalogue,
      );
    }
    await createMonomerDialog.submit();
    expect(await errorMessage.count()).toBeGreaterThan(0);
    await CreateMonomerDialog(page).discard();
  });
}

test(`15. Check that when selected amino acids in wizard Monomer natural analogue field is mandatory for it`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7657
   * Description: 1. Check that when selected amino acids in wizard Monomer natural analogue field is mandatory for it
   *              2. Check that if no natural analogue is chosen, and the user clicks on Save/Finish in the wizard,
   *                 an error message appears in the error/warning area
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
   *      4. Try to create monomer with Amino acid type and no natural analogue
   *      5. Validate error message is shown
   *      6. Take screenshot to validate that Natural analogue drop-down is highlighted
   *
   * Version 3.7
   */
  const errorMessage = page.getByText('Mandatory fields must be filled.');
  const createMonomerDialog = CreateMonomerDialog(page);

  await pasteFromClipboardAndOpenAsNewProject(
    page,
    eligableMolecules[0].MoleculeSMARTS,
  );
  await prepareMoleculeForMonomerCreation(
    page,
    eligableMolecules[0].AtomIDsToExclude,
    eligableMolecules[0].BondIDsToExclude,
  );
  await LeftToolbar(page).createMonomer();
  await createMonomerDialog.selectType(MonomerType.AminoAcid);
  await createMonomerDialog.setSymbol('AminoAcid');
  await createMonomerDialog.setName('Temp');

  await createMonomerDialog.submit();
  expect(await errorMessage.count()).toBeGreaterThan(0);
  await takeElementScreenshot(
    page,
    CreateMonomerDialog(page).naturalAnalogueCombobox,
  );
  await CreateMonomerDialog(page).discard();
});

test(`16. Check that when selected Base in wizard Monomer natural analogue field is mandatory for it`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7657
   * Description: 1. Check that when selected Base in wizard Monomer natural analogue field is mandatory for it
   *              2. Check that if no natural analogue is chosen, and the user clicks on Save/Finish in the wizard,
   *                 an error message appears in the error/warning area
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
   *      4. Try to create monomer with Base type and no natural analogue
   *      5. Validate error message is shown
   *      6. Take screenshot to validate that Natural analogue drop-down is highlighted
   *
   * Version 3.7
   */
  const errorMessage = page.getByText('Mandatory fields must be filled.');
  const createMonomerDialog = CreateMonomerDialog(page);

  await pasteFromClipboardAndOpenAsNewProject(
    page,
    eligableMolecules[0].MoleculeSMARTS,
  );
  await prepareMoleculeForMonomerCreation(
    page,
    eligableMolecules[0].AtomIDsToExclude,
    eligableMolecules[0].BondIDsToExclude,
  );
  await LeftToolbar(page).createMonomer();
  await createMonomerDialog.selectType(MonomerType.Base);
  await createMonomerDialog.setSymbol('Base');
  await createMonomerDialog.setName('Temp');

  await createMonomerDialog.submit();
  expect(await errorMessage.count()).toBeGreaterThan(0);
  await takeElementScreenshot(
    page,
    CreateMonomerDialog(page).naturalAnalogueCombobox,
  );
  await CreateMonomerDialog(page).discard();
});

test(`17. Check that when selected Nucleotide in wizard Monomer natural analogue field is mandatory for it`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7657
   * Description: 1. Check that when selected Nucleotide in wizard Monomer natural analogue field is mandatory for it
   *              2. Check that if no natural analogue is chosen, and the user clicks on Save/Finish in the wizard,
   *                 an error message appears in the error/warning area
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
   *      4. Try to create monomer with Nucleotide type and no natural analogue
   *      5. Validate error message is shown
   *      6. Take screenshot to validate that Natural analogue drop-down is highlighted
   *
   * Version 3.7
   */
  const errorMessage = page.getByText('Mandatory fields must be filled.');
  const createMonomerDialog = CreateMonomerDialog(page);

  await pasteFromClipboardAndOpenAsNewProject(
    page,
    eligableMolecules[0].MoleculeSMARTS,
  );
  await prepareMoleculeForMonomerCreation(
    page,
    eligableMolecules[0].AtomIDsToExclude,
    eligableMolecules[0].BondIDsToExclude,
  );
  await LeftToolbar(page).createMonomer();
  await createMonomerDialog.selectType(MonomerType.Nucleotide);
  await createMonomerDialog.setSymbol('Nucleotide');
  await createMonomerDialog.setName('Temp');

  await createMonomerDialog.submit();
  expect(await errorMessage.count()).toBeGreaterThan(0);
  await takeElementScreenshot(
    page,
    CreateMonomerDialog(page).naturalAnalogueCombobox,
  );
  await CreateMonomerDialog(page).discard();
});

test(`18. Check drop-down grid for Natural analogue for Amino acid`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7657
   * Description: Check drop-down grid for Natural analogue for Amino acid
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
   *      4. Try to create monomer with Amino acid type
   *      5. Click on Natural analogue
   *      6. Validate drop-down grid is displayed
   *
   * Version 3.7
   */
  const createMonomerDialog = CreateMonomerDialog(page);

  await pasteFromClipboardAndOpenAsNewProject(
    page,
    eligableMolecules[0].MoleculeSMARTS,
  );
  await prepareMoleculeForMonomerCreation(
    page,
    eligableMolecules[0].AtomIDsToExclude,
    eligableMolecules[0].BondIDsToExclude,
  );
  await LeftToolbar(page).createMonomer();
  await createMonomerDialog.selectType(MonomerType.AminoAcid);
  await createMonomerDialog.setSymbol('AminoAcid');
  await createMonomerDialog.setName('Temp');
  await createMonomerDialog.naturalAnalogueCombobox.click();
  await Promise.all(
    Object.values(AminoAcidNaturalAnalogue).map((testId) =>
      expect(page.getByTestId(testId)).toBeVisible(),
    ),
  );
  await createMonomerDialog.naturalAnalogueCombobox.click({ force: true });
  await CreateMonomerDialog(page).discard();
});

test(`19. Check drop-down grid for Natural analogue for Base`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7657
   * Description: Check drop-down grid for Natural analogue for Base
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
   *      4. Try to create monomer with Base type
   *      5. Click on Natural analogue
   *      6. Validate drop-down grid is displayed
   *
   * Version 3.7
   */
  const createMonomerDialog = CreateMonomerDialog(page);

  await pasteFromClipboardAndOpenAsNewProject(
    page,
    eligableMolecules[0].MoleculeSMARTS,
  );
  await prepareMoleculeForMonomerCreation(
    page,
    eligableMolecules[0].AtomIDsToExclude,
    eligableMolecules[0].BondIDsToExclude,
  );
  await LeftToolbar(page).createMonomer();
  await createMonomerDialog.selectType(MonomerType.Base);
  await createMonomerDialog.setSymbol('Base');
  await createMonomerDialog.setName('Temp');
  await createMonomerDialog.naturalAnalogueCombobox.click();
  await Promise.all(
    Object.values(NucleotideNaturalAnalogue).map((testId) =>
      expect(page.getByTestId(testId)).toBeVisible(),
    ),
  );
  await createMonomerDialog.naturalAnalogueCombobox.click({ force: true });
  await CreateMonomerDialog(page).discard();
});

test(`20. Check drop-down grid for Natural analogue for Nucleotide`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7657
   * Description: Check drop-down grid for Natural analogue for Nucleotide
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
   *      4. Try to create monomer with Nucleotide type
   *      5. Click on Natural analogue
   *      6. Validate drop-down grid is displayed
   *
   * Version 3.7
   */
  const createMonomerDialog = CreateMonomerDialog(page);

  await pasteFromClipboardAndOpenAsNewProject(
    page,
    eligableMolecules[0].MoleculeSMARTS,
  );
  await prepareMoleculeForMonomerCreation(
    page,
    eligableMolecules[0].AtomIDsToExclude,
    eligableMolecules[0].BondIDsToExclude,
  );
  await LeftToolbar(page).createMonomer();
  await createMonomerDialog.selectType(MonomerType.Nucleotide);
  await createMonomerDialog.setSymbol('Base');
  await createMonomerDialog.setName('Temp');
  await createMonomerDialog.naturalAnalogueCombobox.click();
  await Promise.all(
    Object.values(NucleotideNaturalAnalogue).map((testId) =>
      expect(page.getByTestId(testId)).toBeVisible(),
    ),
  );
  await createMonomerDialog.naturalAnalogueCombobox.click({ force: true });
  await CreateMonomerDialog(page).discard();
});

test(`21. Check that if the user changes the monomer type after they've set a natural analogue, the natural analogue field is reset to blank`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7657
   * Description: Check that if the user changes the monomer type after they've
   *              set a natural analogue, the natural analogue field is reset to blank
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
   *      4. Try to create monomer with Nucleotide type, valid Symbol and Name and "A" natural analogue
   *      5. Change type to Base
   *      6. Validate natural analogue drop-down grid is empty (contains 'Select an analogue')
   *
   * Version 3.7
   */
  const createMonomerDialog = CreateMonomerDialog(page);

  await pasteFromClipboardAndOpenAsNewProject(
    page,
    eligableMolecules[0].MoleculeSMARTS,
  );
  await prepareMoleculeForMonomerCreation(
    page,
    eligableMolecules[0].AtomIDsToExclude,
    eligableMolecules[0].BondIDsToExclude,
  );
  await LeftToolbar(page).createMonomer();
  await createMonomerDialog.selectType(MonomerType.Nucleotide);
  await createMonomerDialog.setSymbol('Base');
  await createMonomerDialog.setName('Temp');
  await createMonomerDialog.selectNaturalAnalogue(NucleotideNaturalAnalogue.A);
  await createMonomerDialog.selectType(MonomerType.Base);
  await expect(CreateMonomerDialog(page).naturalAnalogueCombobox).toContainText(
    'Select an analogue',
  );
  await CreateMonomerDialog(page).discard();
});

const monomersToCreate = [
  {
    description: '1. Amino Acid',
    type: MonomerType.AminoAcid,
    symbol: 'AminoAcid',
    name: 'Amino Acid Test monomer',
    naturalAnalogue: AminoAcidNaturalAnalogue.A,
    libraryCard: Peptide.AminoAcid,
  },
  {
    description: '2. Sugar',
    type: MonomerType.Sugar,
    symbol: 'Sugar',
    name: 'Sugar Test monomer',
    libraryCard: Sugar.Sugar,
  },
  {
    description: '3. Base',
    type: MonomerType.Base,
    symbol: 'Base',
    name: 'Base Test monomer',
    naturalAnalogue: NucleotideNaturalAnalogue.A,
    libraryCard: Base.Base,
  },
  {
    description: '4. Phosphate',
    type: MonomerType.Phosphate,
    symbol: 'Phosphate',
    name: 'Phosphate Test monomer',
    libraryCard: Phosphate.Phosphate,
  },
  {
    description: '5. Nucleotide',
    type: MonomerType.Nucleotide,
    symbol: 'Nucleotide',
    name: 'Nucleotide Test monomer',
    naturalAnalogue: NucleotideNaturalAnalogue.A,
    libraryCard: Nucleotide.Nucleotide,
  },
  {
    description: '6. CHEM',
    type: MonomerType.CHEM,
    symbol: 'CHEM',
    name: 'CHEM Test monomer',
    libraryCard: Chem.CHEM,
  },
];

for (const monomerToCreate of monomersToCreate) {
  test(`22. Create monomer with ${monomerToCreate.description}`, async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/7657
     * Description: Check that when the user saves the monomer, the wizard is exited
     *              (and all appropriate tollbar icons enabled), that monomer is added
     *              to the library in the appropriate place with all attributes defined
     *              by the user, and it appears on canvas as an expanded monomer
     *
     * Case:
     *      1. Open Molecules canvas
     *      2. Load molecule on canvas
     *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
     *      4. Create monomer with some attributes
     *      5. Switch to Macromolecules editor
     *      6. Validate that monomer with ${monomerToCreate.symbol} present on the canvas
     *      7. Hover mouse over monomer and wait for preview tooltip
     *      8. Validate that preview tooltip displays correct monomer ${monomerToCreate.name}
     *
     * Version 3.7
     */
    await pasteFromClipboardAndOpenAsNewProject(
      page,
      eligableMolecules[0].MoleculeSMARTS,
    );
    await prepareMoleculeForMonomerCreation(
      page,
      eligableMolecules[0].AtomIDsToExclude,
      eligableMolecules[0].BondIDsToExclude,
    );

    await createMonomer(page, {
      ...monomerToCreate,
    });

    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    const monomer = getMonomerLocator(page, {
      monomerAlias: monomerToCreate.symbol,
    });
    expect(await monomer.count()).toEqual(1);

    await dragTo(page, monomer, { x: 450, y: 250 });
    await monomer.hover({ force: true });
    await waitForMonomerPreview(page);
    await expect(page.getByTestId('preview-tooltip-title')).toContainText(
      monomerToCreate.name,
    );
  });
}

test(`23. Check that if the user selects Discard/Cancel, the wizard is exited, and no monomer is saved`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7657
   * Description: Check that if the user selects Discard/Cancel, the wizard is exited, and no monomer is saved
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
   *      4. Try to create monomer with Nucleotide type, valid Symbol and Name and "A" natural analogue
   *      5. Press Discard button
   *      6. Switch to Macromolecules editor
   *      7. Validate that no monomer is present on the canvas
   *
   * Version 3.7
   */
  const createMonomerDialog = CreateMonomerDialog(page);

  await pasteFromClipboardAndOpenAsNewProject(
    page,
    eligableMolecules[0].MoleculeSMARTS,
  );
  await prepareMoleculeForMonomerCreation(
    page,
    eligableMolecules[0].AtomIDsToExclude,
    eligableMolecules[0].BondIDsToExclude,
  );
  await LeftToolbar(page).createMonomer();
  await createMonomerDialog.selectType(MonomerType.Nucleotide);
  await createMonomerDialog.setSymbol('Nucleotide');
  await createMonomerDialog.setName('Temp');
  await createMonomerDialog.selectNaturalAnalogue(NucleotideNaturalAnalogue.A);
  await CreateMonomerDialog(page).discard();

  await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
  const monomer = getMonomerLocator(page, {});
  expect(await monomer.count()).toEqual(0);
});

for (const monomerToCreate of monomersToCreate) {
  test(`24. Check that created ${monomerToCreate.description} monomer can be selected and added on canvas via arrow button`, async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/7657
     * Description: Check that created monomer can be selected and added on canvas
     *              (Amino acid, Peptide, Sugar, Base, Phosphate, Nucleotide, CHEM)
     *
     * Case:
     *      1. Open Molecules canvas
     *      2. Load molecule on canvas
     *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
     *      4. Create monomer with given attributes
     *      5. Switch to Macromolecules editor
     *      6. Clear the canvas
     *      7. Find monomer in the Library and press arrow button on its card
     *      8. Validate that monomer appeared on the canvas
     *
     * Version 3.7
     */
    await pasteFromClipboardAndOpenAsNewProject(
      page,
      eligableMolecules[0].MoleculeSMARTS,
    );
    await prepareMoleculeForMonomerCreation(
      page,
      eligableMolecules[0].AtomIDsToExclude,
      eligableMolecules[0].BondIDsToExclude,
    );

    await createMonomer(page, {
      ...monomerToCreate,
    });

    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await CommonTopLeftToolbar(page).clearCanvas();
    await Library(page).clickMonomerAutochain(monomerToCreate.libraryCard);

    const monomer = getMonomerLocator(page, {
      monomerAlias: monomerToCreate.symbol,
    });
    expect(await monomer.count()).toEqual(1);
  });
}

for (const monomerToCreate of monomersToCreate) {
  test(`24. Check that created ${monomerToCreate.description} monomer can be selected and added on canvas via drag and drop`, async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/7657
     * Description: Check that created monomer can be drag and dropped on canvas
     *              (Amino acid, Peptide, Sugar, Base, Phosphate, Nucleotide, CHEM)
     *
     * Case:
     *      1. Open Molecules canvas
     *      2. Load molecule on canvas
     *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
     *      4. Create monomer with given attributes
     *      5. Switch to Macromolecules editor
     *      6. Clear the canvas
     *      7. Find monomer in the Library and drag and drop it on canvas
     *      8. Validate that monomer appeared on the canvas
     *
     * Version 3.7
     */
    await pasteFromClipboardAndOpenAsNewProject(
      page,
      eligableMolecules[0].MoleculeSMARTS,
    );
    await prepareMoleculeForMonomerCreation(
      page,
      eligableMolecules[0].AtomIDsToExclude,
      eligableMolecules[0].BondIDsToExclude,
    );

    await createMonomer(page, {
      ...monomerToCreate,
    });

    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await CommonTopLeftToolbar(page).clearCanvas();
    await Library(page).dragMonomerOnCanvas(monomerToCreate.libraryCard, {
      x: 0,
      y: 0,
      fromCenter: true,
    });

    const monomer = getMonomerLocator(page, {
      monomerAlias: monomerToCreate.symbol,
    });
    expect(await monomer.count()).toEqual(1);
  });
}

for (const monomerToCreate of monomersToCreate) {
  test(`25. Check that created ${monomerToCreate.description} monomer can be contracted and expanded on canvas`, async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/7657
     * Description: Check that created monomer can be contracted and expanded on canvas
     *              (Amino acid, Peptide, Sugar, Base, Phosphate, Nucleotide, CHEM)
     *
     * Case:
     *      1. Open Molecules canvas
     *      2. Load molecule on canvas
     *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
     *      4. Create monomer with given attributes
     *      5. Contract created monomer
     *      6. Validate it appeared on the canvas
     *      7. Expand created monomer and click on its atom
     *      8. Take screenshot to validate monomer got expanded
     *
     * Version 3.7
     */
    await pasteFromClipboardAndOpenAsNewProject(
      page,
      eligableMolecules[0].MoleculeSMARTS,
    );
    await prepareMoleculeForMonomerCreation(
      page,
      eligableMolecules[0].AtomIDsToExclude,
      eligableMolecules[0].BondIDsToExclude,
    );

    await createMonomer(page, {
      ...monomerToCreate,
    });

    await collapseMonomer(page, getAtomLocator(page, { atomId: 2 }));

    const monomerOnMicro = getAbbreviationLocator(page, {
      name: monomerToCreate.symbol,
    });
    expect(await monomerOnMicro.count()).toEqual(1);

    await expandMonomer(page, monomerOnMicro);
    await getAtomLocator(page, { atomId: 2 }).click();
    await takeEditorScreenshot(page);
  });
}

for (const monomerToCreate of monomersToCreate) {
  test(`26. Check that created ${monomerToCreate.description} monomer (expanded) can be saved/opened to/from KET in Micro mode`, async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/7657
     * Description: Check that created ${monomerToCreate.description} monomer (expanded) can be saved/opened to/from KET in Micro mode
     *
     * Case:
     *      1. Open Molecules canvas
     *      2. Load molecule on canvas
     *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
     *      4. Create monomer with given attributes
     *      5. Save it to KET and validate the result
     *      6. Load saved monomer from KET as New Project
     *      7. Take screenshot to validate monomer got loaded
     *
     * Version 3.7
     */
    await pasteFromClipboardAndOpenAsNewProject(
      page,
      eligableMolecules[0].MoleculeSMARTS,
    );
    await prepareMoleculeForMonomerCreation(
      page,
      eligableMolecules[0].AtomIDsToExclude,
      eligableMolecules[0].BondIDsToExclude,
    );

    await createMonomer(page, {
      ...monomerToCreate,
    });

    await verifyFileExport(
      page,
      `KET/Chromium-popup/Create-monomer/${monomerToCreate.description}-expected.ket`,
      FileType.KET,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      `KET/Chromium-popup/Create-monomer/${monomerToCreate.description}-expected.ket`,
    );
    await takeEditorScreenshot(page);
  });
}

for (const monomerToCreate of monomersToCreate) {
  test(`27. Check that created ${monomerToCreate.description} monomer (expanded) can be saved/opened to/from MOL V2000 in Micro mode`, async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/7657
     * Description: Check that created ${monomerToCreate.description} monomer (expanded) can be saved/opened to/from MOL V2000 in Micro mode
     *
     * Case:
     *      1. Open Molecules canvas
     *      2. Load molecule on canvas
     *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
     *      4. Create monomer with given attributes
     *      5. Save it to MOL V2000 and validate the result
     *      6. Load saved monomer from MOL V2000 as New Project
     *      7. Take screenshot to validate monomer got loaded
     *
     * Version 3.7
     */
    await pasteFromClipboardAndOpenAsNewProject(
      page,
      eligableMolecules[0].MoleculeSMARTS,
    );
    await prepareMoleculeForMonomerCreation(
      page,
      eligableMolecules[0].AtomIDsToExclude,
      eligableMolecules[0].BondIDsToExclude,
    );

    await createMonomer(page, {
      ...monomerToCreate,
    });

    await verifyFileExport(
      page,
      `Molfiles-V2000/Chromium-popup/Create-monomer/${monomerToCreate.description}-expected.mol`,
      FileType.MOL,
      MolFileFormat.v2000,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      `Molfiles-V2000/Chromium-popup/Create-monomer/${monomerToCreate.description}-expected.mol`,
    );
    await takeEditorScreenshot(page);
  });
}

for (const monomerToCreate of monomersToCreate) {
  test(`28. Check that created ${monomerToCreate.description} monomer (expanded) can be saved/opened to/from MOL V3000 in Micro mode`, async () => {
    // Screenshots are wrong because of bug: https://github.com/epam/ketcher/issues/7764
    /*
     * Test task: https://github.com/epam/ketcher/issues/7657
     * Description: Check that created ${monomerToCreate.description} monomer (expanded) can be saved/opened to/from MOL V3000 in Micro mode
     *
     * Case:
     *      1. Open Molecules canvas
     *      2. Load molecule on canvas
     *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
     *      4. Create monomer with given attributes
     *      5. Save it to MOL V3000 and validate the result
     *      6. Load saved monomer from MOL V3000 as New Project
     *      7. Take screenshot to validate monomer got loaded
     *
     * Version 3.7
     */
    await pasteFromClipboardAndOpenAsNewProject(
      page,
      eligableMolecules[0].MoleculeSMARTS,
    );
    await prepareMoleculeForMonomerCreation(
      page,
      eligableMolecules[0].AtomIDsToExclude,
      eligableMolecules[0].BondIDsToExclude,
    );

    await createMonomer(page, {
      ...monomerToCreate,
    });

    await verifyFileExport(
      page,
      `Molfiles-V3000/Chromium-popup/Create-monomer/${monomerToCreate.description}-expected.mol`,
      FileType.MOL,
      MolFileFormat.v3000,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      `Molfiles-V3000/Chromium-popup/Create-monomer/${monomerToCreate.description}-expected.mol`,
    );
    await takeEditorScreenshot(page);
  });
}

for (const monomerToCreate of monomersToCreate) {
  test(`29. Check that created ${monomerToCreate.description} monomer (expanded) can be saved/opened to/from SDF V2000 in Micro mode`, async () => {
    // Screenshots are wrong because of bug: https://github.com/epam/ketcher/issues/7764
    /*
     * Test task: https://github.com/epam/ketcher/issues/7657
     * Description: Check that created ${monomerToCreate.description} monomer (expanded) can be saved/opened to/from SDF V2000 in Micro mode
     *
     * Case:
     *      1. Open Molecules canvas
     *      2. Load molecule on canvas
     *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
     *      4. Create monomer with given attributes
     *      5. Save it to SDF V2000 and validate the result
     *      6. Load saved monomer from SDF V2000 as New Project
     *      7. Take screenshot to validate monomer got loaded
     *
     * Version 3.7
     */
    await pasteFromClipboardAndOpenAsNewProject(
      page,
      eligableMolecules[0].MoleculeSMARTS,
    );
    await prepareMoleculeForMonomerCreation(
      page,
      eligableMolecules[0].AtomIDsToExclude,
      eligableMolecules[0].BondIDsToExclude,
    );

    await createMonomer(page, {
      ...monomerToCreate,
    });

    await verifyFileExport(
      page,
      `SDF-V2000/Chromium-popup/Create-monomer/${monomerToCreate.description}-expected.sdf`,
      FileType.SDF,
      SdfFileFormat.v2000,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      `SDF-V2000/Chromium-popup/Create-monomer/${monomerToCreate.description}-expected.sdf`,
    );
    await takeEditorScreenshot(page);
  });
}

for (const monomerToCreate of monomersToCreate) {
  test(`30. Check that created ${monomerToCreate.description} monomer (expanded) can be saved/opened to/from SDF V3000 in Micro mode`, async () => {
    // Screenshots are wrong because of bug: https://github.com/epam/ketcher/issues/7764
    /*
     * Test task: https://github.com/epam/ketcher/issues/7657
     * Description: Check that created ${monomerToCreate.description} monomer (expanded) can be saved/opened to/from SDF V3000 in Micro mode
     *
     * Case:
     *      1. Open Molecules canvas
     *      2. Load molecule on canvas
     *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
     *      4. Create monomer with given attributes
     *      5. Save it to SDF V3000 and validate the result
     *      6. Load saved monomer from SDF V3000 as New Project
     *      7. Take screenshot to validate monomer got loaded
     *
     * Version 3.7
     */
    await pasteFromClipboardAndOpenAsNewProject(
      page,
      eligableMolecules[0].MoleculeSMARTS,
    );
    await prepareMoleculeForMonomerCreation(
      page,
      eligableMolecules[0].AtomIDsToExclude,
      eligableMolecules[0].BondIDsToExclude,
    );

    await createMonomer(page, {
      ...monomerToCreate,
    });

    await verifyFileExport(
      page,
      `SDF-V3000/Chromium-popup/Create-monomer/${monomerToCreate.description}-expected.sdf`,
      FileType.SDF,
      SdfFileFormat.v3000,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      `SDF-V3000/Chromium-popup/Create-monomer/${monomerToCreate.description}-expected.sdf`,
    );
    await takeEditorScreenshot(page);
  });
}

for (const monomerToCreate of monomersToCreate) {
  test(`31. Check that created ${monomerToCreate.description} monomer (expanded) can be saved/opened to/from CML in Micro mode`, async () => {
    // Screenshots are wrong because of bug: https://github.com/epam/ketcher/issues/7764
    /*
     * Test task: https://github.com/epam/ketcher/issues/7657
     * Description: Check that created ${monomerToCreate.description} monomer (expanded) can be saved/opened to/from CML in Micro mode
     *
     * Case:
     *      1. Open Molecules canvas
     *      2. Load molecule on canvas
     *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
     *      4. Create monomer with given attributes
     *      5. Save it to CML and validate the result
     *      6. Load saved monomer from CML as New Project
     *      7. Take screenshot to validate monomer got loaded
     *
     * Version 3.7
     */
    await pasteFromClipboardAndOpenAsNewProject(
      page,
      eligableMolecules[0].MoleculeSMARTS,
    );
    await prepareMoleculeForMonomerCreation(
      page,
      eligableMolecules[0].AtomIDsToExclude,
      eligableMolecules[0].BondIDsToExclude,
    );

    await createMonomer(page, {
      ...monomerToCreate,
    });

    await verifyFileExport(
      page,
      `CML/Chromium-popup/Create-monomer/${monomerToCreate.description}-expected.cml`,
      FileType.CML,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      `CML/Chromium-popup/Create-monomer/${monomerToCreate.description}-expected.cml`,
    );
    await takeEditorScreenshot(page);
  });
}

for (const monomerToCreate of monomersToCreate) {
  test(`32. Check that created ${monomerToCreate.description} monomer (expanded) can be saved to SVG in Micro mode`, async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/7657
     * Description: Check that created ${monomerToCreate.description} monomer (expanded) can be saved SVG in Micro mode
     *
     * Case:
     *      1. Open Molecules canvas
     *      2. Load molecule on canvas
     *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
     *      4. Create monomer with given attributes
     *      5. Save it to SVG and validate the result
     *
     * Version 3.7
     */
    await pasteFromClipboardAndOpenAsNewProject(
      page,
      eligableMolecules[0].MoleculeSMARTS,
    );
    await prepareMoleculeForMonomerCreation(
      page,
      eligableMolecules[0].AtomIDsToExclude,
      eligableMolecules[0].BondIDsToExclude,
    );

    await createMonomer(page, {
      ...monomerToCreate,
    });

    await verifySVGExport(page);
  });
}

for (const monomerToCreate of monomersToCreate) {
  test(`33. Check that created ${monomerToCreate.description} monomer (expanded) can be saved to PNG in Micro mode`, async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/7657
     * Description: Check that created ${monomerToCreate.description} monomer (expanded) can be saved PNG in Micro mode
     *
     * Case:
     *      1. Open Molecules canvas
     *      2. Load molecule on canvas
     *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
     *      4. Create monomer with given attributes
     *      5. Save it to PNG and validate the result
     *
     * Version 3.7
     */
    await pasteFromClipboardAndOpenAsNewProject(
      page,
      eligableMolecules[0].MoleculeSMARTS,
    );
    await prepareMoleculeForMonomerCreation(
      page,
      eligableMolecules[0].AtomIDsToExclude,
      eligableMolecules[0].BondIDsToExclude,
    );

    await createMonomer(page, {
      ...monomerToCreate,
    });

    await verifyPNGExport(page);
  });
}

for (const monomerToCreate of monomersToCreate) {
  test(`34. Check that created ${monomerToCreate.description} monomer (expanded) can be saved/opened to/from CDXML in Micro mode`, async () => {
    // Screenshots are wrong because of bug: https://github.com/epam/ketcher/issues/7764
    /*
     * Test task: https://github.com/epam/ketcher/issues/7657
     * Description: Check that created ${monomerToCreate.description} monomer (expanded) can be saved/opened to/from CDXML in Micro mode
     *
     * Case:
     *      1. Open Molecules canvas
     *      2. Load molecule on canvas
     *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
     *      4. Create monomer with given attributes
     *      5. Save it to CDXML and validate the result
     *      6. Load saved monomer from CDXML as New Project
     *      7. Take screenshot to validate monomer got loaded
     *
     * Version 3.7
     */
    await pasteFromClipboardAndOpenAsNewProject(
      page,
      eligableMolecules[0].MoleculeSMARTS,
    );
    await prepareMoleculeForMonomerCreation(
      page,
      eligableMolecules[0].AtomIDsToExclude,
      eligableMolecules[0].BondIDsToExclude,
    );

    await createMonomer(page, {
      ...monomerToCreate,
    });

    await verifyFileExport(
      page,
      `CDXML/Chromium-popup/Create-monomer/${monomerToCreate.description}-expected.cdxml`,
      FileType.CDXML,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      `CDXML/Chromium-popup/Create-monomer/${monomerToCreate.description}-expected.cdxml`,
    );
    await takeEditorScreenshot(page);
  });
}

for (const monomerToCreate of monomersToCreate) {
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
    await pasteFromClipboardAndOpenAsNewProject(
      page,
      eligableMolecules[0].MoleculeSMARTS,
    );
    await prepareMoleculeForMonomerCreation(
      page,
      eligableMolecules[0].AtomIDsToExclude,
      eligableMolecules[0].BondIDsToExclude,
    );

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
  });
}

for (const monomerToCreate of monomersToCreate) {
  test(`36. Check that created ${monomerToCreate.description} monomer (collapesed) can be saved/opened to/from KET in Micro mode`, async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/7657
     * Description: Check that created ${monomerToCreate.description} monomer (collapesed) can be saved/opened to/from KET in Micro mode
     *
     * Case:
     *      1. Open Molecules canvas
     *      2. Load molecule on canvas
     *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
     *      4. Create monomer with given attributes
     *      5. Collapse it
     *      6. Save it to KET and validate the result
     *      7. Load saved monomer from KET as New Project
     *      8. Take screenshot to validate monomer got loaded
     *
     * Version 3.7
     */
    await pasteFromClipboardAndOpenAsNewProject(
      page,
      eligableMolecules[0].MoleculeSMARTS,
    );
    await prepareMoleculeForMonomerCreation(
      page,
      eligableMolecules[0].AtomIDsToExclude,
      eligableMolecules[0].BondIDsToExclude,
    );

    await createMonomer(page, {
      ...monomerToCreate,
    });
    await collapseMonomer(page, getAtomLocator(page, { atomId: 2 }));
    await verifyFileExport(
      page,
      `KET/Chromium-popup/Create-monomer/${monomerToCreate.description}-collapsed-expected.ket`,
      FileType.KET,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      `KET/Chromium-popup/Create-monomer/${monomerToCreate.description}-collapsed-expected.ket`,
    );
    await takeEditorScreenshot(page);
  });
}

for (const monomerToCreate of monomersToCreate) {
  test(`37. Check that created ${monomerToCreate.description} monomer (collapsed) can be saved/opened to/from MOL V2000 in Micro mode`, async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/7657
     * Description: Check that created ${monomerToCreate.description} monomer (collapsed) can be saved/opened to/from MOL V2000 in Micro mode
     *
     * Case:
     *      1. Open Molecules canvas
     *      2. Load molecule on canvas
     *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
     *      4. Create monomer with given attributes
     *      5. Collapse it
     *      6. Save it to MOL V2000 and validate the result
     *      7. Load saved monomer from MOL V2000 as New Project
     *      8. Take screenshot to validate monomer got loaded
     *
     * Version 3.7
     */
    await pasteFromClipboardAndOpenAsNewProject(
      page,
      eligableMolecules[0].MoleculeSMARTS,
    );
    await prepareMoleculeForMonomerCreation(
      page,
      eligableMolecules[0].AtomIDsToExclude,
      eligableMolecules[0].BondIDsToExclude,
    );

    await createMonomer(page, {
      ...monomerToCreate,
    });
    await collapseMonomer(page, getAtomLocator(page, { atomId: 2 }));
    await verifyFileExport(
      page,
      `Molfiles-V2000/Chromium-popup/Create-monomer/${monomerToCreate.description}-collapsed-expected.mol`,
      FileType.MOL,
      MolFileFormat.v2000,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      `Molfiles-V2000/Chromium-popup/Create-monomer/${monomerToCreate.description}-collapsed-expected.mol`,
    );
    await takeEditorScreenshot(page);
  });
}

for (const monomerToCreate of monomersToCreate) {
  test(`38. Check that created ${monomerToCreate.description} monomer (collapsed) can be saved/opened to/from MOL V3000 in Micro mode`, async () => {
    // Screenshots are wrong because of bug: https://github.com/epam/ketcher/issues/7764
    /*
     * Test task: https://github.com/epam/ketcher/issues/7657
     * Description: Check that created ${monomerToCreate.description} monomer (collapsed) can be saved/opened to/from MOL V3000 in Micro mode
     *
     * Case:
     *      1. Open Molecules canvas
     *      2. Load molecule on canvas
     *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
     *      4. Create monomer with given attributes
     *      5. Collapse it
     *      6. Save it to MOL V3000 and validate the result
     *      7. Load saved monomer from MOL V3000 as New Project
     *      8. Take screenshot to validate monomer got loaded
     *
     * Version 3.7
     */
    await pasteFromClipboardAndOpenAsNewProject(
      page,
      eligableMolecules[0].MoleculeSMARTS,
    );
    await prepareMoleculeForMonomerCreation(
      page,
      eligableMolecules[0].AtomIDsToExclude,
      eligableMolecules[0].BondIDsToExclude,
    );

    await createMonomer(page, {
      ...monomerToCreate,
    });
    await collapseMonomer(page, getAtomLocator(page, { atomId: 2 }));
    await verifyFileExport(
      page,
      `Molfiles-V3000/Chromium-popup/Create-monomer/${monomerToCreate.description}-collapsed-expected.mol`,
      FileType.MOL,
      MolFileFormat.v3000,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      `Molfiles-V3000/Chromium-popup/Create-monomer/${monomerToCreate.description}-collapsed-expected.mol`,
    );
    await takeEditorScreenshot(page);
  });
}

for (const monomerToCreate of monomersToCreate) {
  test(`39. Check that created ${monomerToCreate.description} monomer (collapsed) can be saved/opened to/from SDF V2000 in Micro mode`, async () => {
    // Screenshots are wrong because of bug: https://github.com/epam/ketcher/issues/7764
    /*
     * Test task: https://github.com/epam/ketcher/issues/7657
     * Description: Check that created ${monomerToCreate.description} monomer (collapsed) can be saved/opened to/from SDF V2000 in Micro mode
     *
     * Case:
     *      1. Open Molecules canvas
     *      2. Load molecule on canvas
     *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
     *      4. Create monomer with given attributes
     *      5. Collapse it
     *      6. Save it to SDF V2000 and validate the result
     *      7. Load saved monomer from SDF V2000 as New Project
     *      8. Take screenshot to validate monomer got loaded
     *
     * Version 3.7
     */
    await pasteFromClipboardAndOpenAsNewProject(
      page,
      eligableMolecules[0].MoleculeSMARTS,
    );
    await prepareMoleculeForMonomerCreation(
      page,
      eligableMolecules[0].AtomIDsToExclude,
      eligableMolecules[0].BondIDsToExclude,
    );

    await createMonomer(page, {
      ...monomerToCreate,
    });
    await collapseMonomer(page, getAtomLocator(page, { atomId: 2 }));
    await verifyFileExport(
      page,
      `SDF-V2000/Chromium-popup/Create-monomer/${monomerToCreate.description}-collapsed-expected.sdf`,
      FileType.SDF,
      SdfFileFormat.v2000,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      `SDF-V2000/Chromium-popup/Create-monomer/${monomerToCreate.description}-collapsed-expected.sdf`,
    );
    await takeEditorScreenshot(page);
  });
}

for (const monomerToCreate of monomersToCreate) {
  test(`40. Check that created ${monomerToCreate.description} monomer (collapsed) can be saved/opened to/from SDF V3000 in Micro mode`, async () => {
    // Screenshots are wrong because of bug: https://github.com/epam/ketcher/issues/7764
    /*
     * Test task: https://github.com/epam/ketcher/issues/7657
     * Description: Check that created ${monomerToCreate.description} monomer (collapsed) can be saved/opened to/from SDF V3000 in Micro mode
     *
     * Case:
     *      1. Open Molecules canvas
     *      2. Load molecule on canvas
     *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
     *      4. Create monomer with given attributes
     *      5. Collapse it
     *      6. Save it to SDF V3000 and validate the result
     *      7. Load saved monomer from SDF V3000 as New Project
     *      8. Take screenshot to validate monomer got loaded
     *
     * Version 3.7
     */
    await pasteFromClipboardAndOpenAsNewProject(
      page,
      eligableMolecules[0].MoleculeSMARTS,
    );
    await prepareMoleculeForMonomerCreation(
      page,
      eligableMolecules[0].AtomIDsToExclude,
      eligableMolecules[0].BondIDsToExclude,
    );
    await collapseMonomer(page, getAtomLocator(page, { atomId: 2 }));
    await createMonomer(page, {
      ...monomerToCreate,
    });

    await verifyFileExport(
      page,
      `SDF-V3000/Chromium-popup/Create-monomer/${monomerToCreate.description}-collapsed-expected.sdf`,
      FileType.SDF,
      SdfFileFormat.v3000,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      `SDF-V3000/Chromium-popup/Create-monomer/${monomerToCreate.description}-collapsed-expected.sdf`,
    );
    await takeEditorScreenshot(page);
  });
}

for (const monomerToCreate of monomersToCreate) {
  test(`41. Check that created ${monomerToCreate.description} monomer (collapsed) can be saved/opened to/from CML in Micro mode`, async () => {
    // Screenshots are wrong because of bug: https://github.com/epam/ketcher/issues/7764
    /*
     * Test task: https://github.com/epam/ketcher/issues/7657
     * Description: Check that created ${monomerToCreate.description} monomer (collapsed) can be saved/opened to/from CML in Micro mode
     *
     * Case:
     *      1. Open Molecules canvas
     *      2. Load molecule on canvas
     *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
     *      4. Create monomer with given attributes
     *      5. Collapse it
     *      6. Save it to CML and validate the result
     *      7. Load saved monomer from CML as New Project
     *      8. Take screenshot to validate monomer got loaded
     *
     * Version 3.7
     */
    await pasteFromClipboardAndOpenAsNewProject(
      page,
      eligableMolecules[0].MoleculeSMARTS,
    );
    await prepareMoleculeForMonomerCreation(
      page,
      eligableMolecules[0].AtomIDsToExclude,
      eligableMolecules[0].BondIDsToExclude,
    );
    await collapseMonomer(page, getAtomLocator(page, { atomId: 2 }));
    await createMonomer(page, {
      ...monomerToCreate,
    });

    await verifyFileExport(
      page,
      `CML/Chromium-popup/Create-monomer/${monomerToCreate.description}-collapsed-expected.cml`,
      FileType.CML,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      `CML/Chromium-popup/Create-monomer/${monomerToCreate.description}-collapsed-expected.cml`,
    );
    await takeEditorScreenshot(page);
  });
}

for (const monomerToCreate of monomersToCreate) {
  test(`42. Check that created ${monomerToCreate.description} monomer (collapsed) can be saved to SVG in Micro mode`, async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/7657
     * Description: Check that created ${monomerToCreate.description} monomer (collapsed) can be saved SVG in Micro mode
     *
     * Case:
     *      1. Open Molecules canvas
     *      2. Load molecule on canvas
     *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
     *      4. Create monomer with given attributes
     *      5. Collapse it
     *      6. Save it to SVG and validate the result
     *
     * Version 3.7
     */
    await pasteFromClipboardAndOpenAsNewProject(
      page,
      eligableMolecules[0].MoleculeSMARTS,
    );
    await prepareMoleculeForMonomerCreation(
      page,
      eligableMolecules[0].AtomIDsToExclude,
      eligableMolecules[0].BondIDsToExclude,
    );
    await collapseMonomer(page, getAtomLocator(page, { atomId: 2 }));
    await createMonomer(page, {
      ...monomerToCreate,
    });

    await verifySVGExport(page);
  });
}

for (const monomerToCreate of monomersToCreate) {
  test(`43. Check that created ${monomerToCreate.description} monomer (collapsed) can be saved to PNG in Micro mode`, async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/7657
     * Description: Check that created ${monomerToCreate.description} monomer (collapsed) can be saved PNG in Micro mode
     *
     * Case:
     *      1. Open Molecules canvas
     *      2. Load molecule on canvas
     *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
     *      4. Create monomer with given attributes
     *      5. Collapse it
     *      6. Save it to PNG and validate the result
     *
     * Version 3.7
     */
    await pasteFromClipboardAndOpenAsNewProject(
      page,
      eligableMolecules[0].MoleculeSMARTS,
    );
    await prepareMoleculeForMonomerCreation(
      page,
      eligableMolecules[0].AtomIDsToExclude,
      eligableMolecules[0].BondIDsToExclude,
    );
    await collapseMonomer(page, getAtomLocator(page, { atomId: 2 }));
    await createMonomer(page, {
      ...monomerToCreate,
    });

    await verifyPNGExport(page);
  });
}

for (const monomerToCreate of monomersToCreate) {
  test(`44. Check that created ${monomerToCreate.description} monomer (collapsed) can be saved/opened to/from CDXML in Micro mode`, async () => {
    // Screenshots are wrong because of bug: https://github.com/epam/ketcher/issues/7764
    /*
     * Test task: https://github.com/epam/ketcher/issues/7657
     * Description: Check that created ${monomerToCreate.description} monomer collapsed) can be saved/opened to/from CDXML in Micro mode
     *
     * Case:
     *      1. Open Molecules canvas
     *      2. Load molecule on canvas
     *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
     *      4. Create monomer with given attributes
     *      5. Collapse it
     *      6. Save it to CDXML and validate the result
     *      7. Load saved monomer from CDXML as New Project
     *      8. Take screenshot to validate monomer got loaded
     *
     * Version 3.7
     */
    await pasteFromClipboardAndOpenAsNewProject(
      page,
      eligableMolecules[0].MoleculeSMARTS,
    );
    await prepareMoleculeForMonomerCreation(
      page,
      eligableMolecules[0].AtomIDsToExclude,
      eligableMolecules[0].BondIDsToExclude,
    );

    await createMonomer(page, {
      ...monomerToCreate,
    });
    await collapseMonomer(page, getAtomLocator(page, { atomId: 2 }));
    await verifyFileExport(
      page,
      `CDXML/Chromium-popup/Create-monomer/${monomerToCreate.description}-collapsed-expected.cdxml`,
      FileType.CDXML,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      `CDXML/Chromium-popup/Create-monomer/${monomerToCreate.description}-collapsed-expected.cdxml`,
    );
    await takeEditorScreenshot(page);
  });
}

for (const monomerToCreate of monomersToCreate) {
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
    await pasteFromClipboardAndOpenAsNewProject(
      page,
      eligableMolecules[0].MoleculeSMARTS,
    );
    await prepareMoleculeForMonomerCreation(
      page,
      eligableMolecules[0].AtomIDsToExclude,
      eligableMolecules[0].BondIDsToExclude,
    );

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
  });
}
