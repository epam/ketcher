/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable max-len */
/* eslint-disable no-magic-numbers */
import { Page, expect } from '@playwright/test';
import { test } from '@fixtures';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import { pasteFromClipboardAndOpenAsNewProject } from '@utils/files/readFile';
import {
  selectAllStructuresOnCanvas,
  takeEditorScreenshot,
} from '@utils/canvas';
import { getAtomLocator } from '@utils/canvas/atoms/getAtomLocator/getAtomLocator';
import { getBondLocator } from '@utils/macromolecules/polymerBond';
import { clickOnCanvas } from '@utils/index';
import { CreateMonomerDialog } from '@tests/pages/molecules/canvas/CreateMonomerDialog';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { IndigoFunctionsToolbar } from '@tests/pages/molecules/IndigoFunctionsToolbar';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { TopRightToolbar } from '@tests/pages/molecules/TopRightToolbar';
import { RightToolbar } from '@tests/pages/molecules/RightToolbar';
import { BottomToolbar } from '@tests/pages/molecules/BottomToolbar';

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

async function deselectAtomsAndBonds(
  page: Page,
  AtomIDsToExclude?: string[],
  BondIDsToExclude?: string[],
) {
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
    await clickOnCanvas(page, 0, 0);
    await selectAllStructuresOnCanvas(page);
    await deselectAtomsAndBonds(
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
    await clickOnCanvas(page, 0, 0);
    await selectAllStructuresOnCanvas(page);
    await deselectAtomsAndBonds(
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
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);
  await deselectAtomsAndBonds(
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
    await clickOnCanvas(page, 0, 0);
    await selectAllStructuresOnCanvas(page);
    await deselectAtomsAndBonds(
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
    await clickOnCanvas(page, 0, 0);
    await selectAllStructuresOnCanvas(page);
    await deselectAtomsAndBonds(
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
