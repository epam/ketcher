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
  delay,
  MacroFileType,
  takeEditorScreenshot,
  takeElementScreenshot,
} from '@utils/canvas';
import { getAtomLocator } from '@utils/canvas/atoms/getAtomLocator/getAtomLocator';
import {
  bondTwoMonomers,
  getBondLocator,
} from '@utils/macromolecules/polymerBond';
import {
  dragTo,
  MolFileFormat,
  SdfFileFormat,
  SequenceFileFormat,
} from '@utils/index';
import {
  createMonomer,
  CreateMonomerDialog,
  prepareMoleculeForMonomerCreation,
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
  AttachmentPoint,
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
  verifyPNGExport,
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
import { NotificationMessageBanner } from '@tests/pages/molecules/canvas/createMonomer/NotificationMessageBanner';
import { ErrorMessage } from '@tests/pages/constants/notificationMessageBanner/Constants';
import { MonomerPreviewTooltip } from '@tests/pages/macromolecules/canvas/MonomerPreviewTooltip';

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
    AtomIDsToExclude: ['3'],
  },
  {
    testDescription: '21. Selected chemical structure not continuous',
    MoleculeSMARTS: 'CC(C)NC(C)C',
    AtomIDsToExclude: ['3'],
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
  await pasteFromClipboardAndOpenAsNewProject(page, 'CCC');
  await prepareMoleculeForMonomerCreation(page, ['0']);

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
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCC');
    await prepareMoleculeForMonomerCreation(page, ['0']);

    await leftToolbar.createMonomer();
    try {
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
        expect(
          commonTopRightToolbar.ketcherModeSwitcherCombobox,
        ).toBeDisabled(),
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
    } finally {
      await CreateMonomerDialog(page)
        .discard()
        .catch(() => {});
    }
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
  await pasteFromClipboardAndOpenAsNewProject(page, 'CCC');
  await prepareMoleculeForMonomerCreation(page, ['0']);

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
  await pasteFromClipboardAndOpenAsNewProject(page, 'CCC');
  await prepareMoleculeForMonomerCreation(page, ['0']);

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
  await pasteFromClipboardAndOpenAsNewProject(page, 'CCC');
  await prepareMoleculeForMonomerCreation(page, ['0']);

  await LeftToolbar(page).createMonomer();
  await expect(CreateMonomerDialog(page).typeCombobox).toContainText('');
  await CreateMonomerDialog(page).submit();
  expect(
    await NotificationMessageBanner(
      page,
      ErrorMessage.emptyMandatoryFields,
    ).getNotificationMessage(),
  ).toEqual('Mandatory fields must be filled.');
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
  await pasteFromClipboardAndOpenAsNewProject(page, 'CCC');
  await prepareMoleculeForMonomerCreation(page, ['0']);

  await LeftToolbar(page).createMonomer();
  await CreateMonomerDialog(page).selectType(MonomerType.AminoAcid);
  await expect(CreateMonomerDialog(page).nameEditbox).toContainText('');
  await CreateMonomerDialog(page).submit();
  expect(
    await NotificationMessageBanner(
      page,
      ErrorMessage.emptyMandatoryFields,
    ).getNotificationMessage(),
  ).toEqual('Mandatory fields must be filled.');
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

for (const [index, eligableName] of eligableNames.entries()) {
  test.fail(`11. Create monomer with ${eligableName.description}`, async () => {
    // Bug: https://github.com/epam/ketcher/issues/7745
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
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCC');
    await prepareMoleculeForMonomerCreation(page, ['0']);

    await createMonomer(page, {
      type: MonomerType.CHEM,
      symbol: `Test11-${index}`,
      name: eligableName.value,
    });
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    const monomer = getMonomerLocator(page, {
      monomerAlias: `Test11-${index}`,
    });
    await monomer.hover({ force: true });
    await dragTo(page, monomer, { x: 100, y: 100 });
    await monomer.hover({ force: true });
    // dirty hack, delay should be removed after fix of https://github.com/epam/ketcher/issues/7745
    await delay(1);
    // await MonomerPreviewTooltip(page).waitForBecomeVisible();
    await expect(page.getByTestId('preview-tooltip')).toBeVisible();
    expect(await MonomerPreviewTooltip(page).getTitleText()).toContain(
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
    const createMonomerDialog = CreateMonomerDialog(page);

    await pasteFromClipboardAndOpenAsNewProject(page, 'CCC');
    await prepareMoleculeForMonomerCreation(page, ['0']);

    await LeftToolbar(page).createMonomer();
    await createMonomerDialog.selectType(MonomerType.CHEM);
    await createMonomerDialog.setSymbol('Temp');
    await createMonomerDialog.setName(nonEligableName.value);
    await createMonomerDialog.submit();
    expect(
      await NotificationMessageBanner(
        page,
        ErrorMessage.emptyMandatoryFields,
      ).getNotificationMessage(),
    ).toEqual(nonEligableName.errorMessage);
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
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCC');
    await prepareMoleculeForMonomerCreation(page, ['0']);

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

    await pasteFromClipboardAndOpenAsNewProject(page, 'CCC');
    await prepareMoleculeForMonomerCreation(page, ['0']);

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
  const createMonomerDialog = CreateMonomerDialog(page);

  await pasteFromClipboardAndOpenAsNewProject(page, 'CCC');
  await prepareMoleculeForMonomerCreation(page, ['0']);

  await LeftToolbar(page).createMonomer();
  await createMonomerDialog.selectType(MonomerType.AminoAcid);
  await createMonomerDialog.setSymbol('AminoAcid');
  await createMonomerDialog.setName('Temp');

  await createMonomerDialog.submit();
  expect(
    await NotificationMessageBanner(
      page,
      ErrorMessage.emptyMandatoryFields,
    ).getNotificationMessage(),
  ).toEqual('Mandatory fields must be filled.');
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
  const createMonomerDialog = CreateMonomerDialog(page);

  await pasteFromClipboardAndOpenAsNewProject(page, 'CCC');
  await prepareMoleculeForMonomerCreation(page, ['0']);

  await LeftToolbar(page).createMonomer();
  await createMonomerDialog.selectType(MonomerType.Base);
  await createMonomerDialog.setSymbol('Base');
  await createMonomerDialog.setName('Temp');

  await createMonomerDialog.submit();
  expect(
    await NotificationMessageBanner(
      page,
      ErrorMessage.emptyMandatoryFields,
    ).getNotificationMessage(),
  ).toEqual('Mandatory fields must be filled.');
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
  const createMonomerDialog = CreateMonomerDialog(page);

  await pasteFromClipboardAndOpenAsNewProject(page, 'CCC');
  await prepareMoleculeForMonomerCreation(page, ['0']);

  await LeftToolbar(page).createMonomer();
  await createMonomerDialog.selectType(MonomerType.Nucleotide);
  await createMonomerDialog.setSymbol('Nucleotide');
  await createMonomerDialog.setName('Temp');

  await createMonomerDialog.submit();
  expect(
    await NotificationMessageBanner(
      page,
      ErrorMessage.emptyMandatoryFields,
    ).getNotificationMessage(),
  ).toEqual('Mandatory fields must be filled.');
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

  await pasteFromClipboardAndOpenAsNewProject(page, 'CCC');
  await prepareMoleculeForMonomerCreation(page, ['0']);

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

  await pasteFromClipboardAndOpenAsNewProject(page, 'CCC');
  await prepareMoleculeForMonomerCreation(page, ['0']);

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

  await pasteFromClipboardAndOpenAsNewProject(page, 'CCC');
  await prepareMoleculeForMonomerCreation(page, ['0']);

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

  await pasteFromClipboardAndOpenAsNewProject(page, 'CCC');
  await prepareMoleculeForMonomerCreation(page, ['0']);

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
    helm: 'PEPTIDE1{[AminoAcid]}$$$$V2.0',
  },
  {
    description: '2. Sugar',
    type: MonomerType.Sugar,
    symbol: 'Sugar',
    name: 'Sugar Test monomer',
    libraryCard: Sugar.Sugar,
    helm: 'RNA1{[Sugar]}$$$$V2.0',
  },
  // {
  //   description: '3. Base',
  //   type: MonomerType.Base,
  //   symbol: 'Base',
  //   name: 'Base Test monomer',
  //   naturalAnalogue: NucleotideNaturalAnalogue.A,
  //   libraryCard: Base.Base,
  // },
  {
    description: '4. Phosphate',
    type: MonomerType.Phosphate,
    symbol: 'Phosphate',
    name: 'Phosphate Test monomer',
    libraryCard: Phosphate.Phosphate,
    helm: 'RNA1{[Phosphate]}$$$$V2.0',
  },
  {
    description: '5. Nucleotide',
    type: MonomerType.Nucleotide,
    symbol: 'Nucleotide',
    name: 'Nucleotide Test monomer',
    naturalAnalogue: NucleotideNaturalAnalogue.A,
    libraryCard: Nucleotide.Nucleotide,
    helm: 'RNA1{[Nucleotide]}$$$$V2.0',
  },
  {
    description: '6. CHEM',
    type: MonomerType.CHEM,
    symbol: 'CHEM',
    name: 'CHEM Test monomer',
    libraryCard: Chem.CHEM,
    helm: 'CHEM1{[CHEM]}$$$$V2.0',
  },
];

for (const monomerToCreate of monomersToCreate) {
  test.fail(
    `22. Create monomer with ${monomerToCreate.description}`,
    async () => {
      // Bug: https://github.com/epam/ketcher/issues/7745
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
      await pasteFromClipboardAndOpenAsNewProject(page, 'CCC');
      await prepareMoleculeForMonomerCreation(page, ['0']);

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
      // dirty hack, delay should be removed after fix of https://github.com/epam/ketcher/issues/7745
      await delay(1);
      // await MonomerPreviewTooltip(page).waitForBecomeVisible();
      await expect(MonomerPreviewTooltip(page).window).toBeVisible();
      await expect(
        MonomerPreviewTooltip(page).monomerPreviewTooltipTitle,
      ).toContainText(monomerToCreate.name);
    },
  );
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

  await pasteFromClipboardAndOpenAsNewProject(page, 'CCC');
  await prepareMoleculeForMonomerCreation(page, ['0']);

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
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    if (await Library(page).isMonomerExist(monomerToCreate.libraryCard)) {
      await Library(page).dragMonomerOnCanvas(monomerToCreate.libraryCard, {
        x: 0,
        y: 0,
        fromCenter: true,
      });
    } else {
      await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
      await pasteFromClipboardAndOpenAsNewProject(page, 'CCC');
      await prepareMoleculeForMonomerCreation(page, ['0']);

      await createMonomer(page, {
        ...monomerToCreate,
      });
    }
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
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    if (await Library(page).isMonomerExist(monomerToCreate.libraryCard)) {
      await Library(page).dragMonomerOnCanvas(monomerToCreate.libraryCard, {
        x: 0,
        y: 0,
        fromCenter: true,
      });
    } else {
      await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
      await pasteFromClipboardAndOpenAsNewProject(page, 'CCC');
      await prepareMoleculeForMonomerCreation(page, ['0']);

      await createMonomer(page, {
        ...monomerToCreate,
      });
    }

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

const monomersToCreate25 = [
  {
    description: '1. Amino Acid',
    type: MonomerType.AminoAcid,
    symbol: 'AminoAcid25',
    name: 'Amino Acid Test monomer for test 25',
    naturalAnalogue: AminoAcidNaturalAnalogue.A,
  },
  {
    description: '2. Sugar',
    type: MonomerType.Sugar,
    symbol: 'Sugar25',
    name: 'Sugar Test monomer for test 25',
  },
  {
    description: '3. Base',
    type: MonomerType.Base,
    symbol: 'Base25',
    name: 'Base Test monomer for test 25',
    naturalAnalogue: NucleotideNaturalAnalogue.A,
  },
  {
    description: '4. Phosphate',
    type: MonomerType.Phosphate,
    symbol: 'Phosphate25',
    name: 'Phosphate Test monomer for test 25',
  },
  {
    description: '5. Nucleotide',
    type: MonomerType.Nucleotide,
    symbol: 'Nucleotide25',
    name: 'Nucleotide Test monomer for test 25',
    naturalAnalogue: NucleotideNaturalAnalogue.A,
  },
  {
    description: '6. CHEM',
    type: MonomerType.CHEM,
    symbol: 'CHEM25',
    name: 'CHEM Test monomer for test 25',
  },
];

for (const monomerToCreate of monomersToCreate25) {
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
     *      6. Delete atom outside the monomer
     *      7. Validate it appeared on the canvas
     *      8. Expand created monomer and click on its atom
     *      9. Take screenshot to validate monomer got expanded
     *
     * Version 3.7
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCC');
    await prepareMoleculeForMonomerCreation(page, ['0']);

    await createMonomer(page, {
      ...monomerToCreate,
    });
    await collapseMonomer(page, getAtomLocator(page, { atomId: 2 }));
    await getAtomLocator(page, { atomId: 0 }).click();
    await CommonLeftToolbar(page).erase();

    const monomerOnMicro = getAbbreviationLocator(page, {
      name: monomerToCreate.symbol,
    });
    expect(await monomerOnMicro.count()).toEqual(1);

    await expandMonomer(page, monomerOnMicro);
    await getAtomLocator(page, { atomId: 2 }).click();
    await takeEditorScreenshot(page);
  });
}

const monomersToCreate26 = [
  {
    description: '1. Amino Acid',
    type: MonomerType.AminoAcid,
    symbol: 'AminoAcid26',
    name: 'Amino Acid Test monomer for test 26',
    naturalAnalogue: AminoAcidNaturalAnalogue.A,
  },
  {
    description: '2. Sugar',
    type: MonomerType.Sugar,
    symbol: 'Sugar26',
    name: 'Sugar Test monomer for test 26',
  },
  {
    description: '3. Base',
    type: MonomerType.Base,
    symbol: 'Base26',
    name: 'Base Test monomer for test 26',
    naturalAnalogue: NucleotideNaturalAnalogue.A,
  },
  {
    description: '4. Phosphate',
    type: MonomerType.Phosphate,
    symbol: 'Phosphate26',
    name: 'Phosphate Test monomer for test 26',
  },
  {
    description: '5. Nucleotide',
    type: MonomerType.Nucleotide,
    symbol: 'Nucleotide26',
    name: 'Nucleotide Test monomer for test 26',
    naturalAnalogue: NucleotideNaturalAnalogue.A,
  },
  {
    description: '6. CHEM',
    type: MonomerType.CHEM,
    symbol: 'CHEM26',
    name: 'CHEM Test monomer for test 26',
  },
];

for (const monomerToCreate of monomersToCreate26) {
  // TODO: Test was skipped due to instability, need to be fixed in future
  test.skip(`26. Check that created ${monomerToCreate.description} monomer (expanded) can be saved/opened to/from KET in Micro mode`, async () => {
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
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCC');
    await prepareMoleculeForMonomerCreation(page, ['0']);

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

const monomersToCreate27 = [
  {
    description: '1. Amino Acid',
    type: MonomerType.AminoAcid,
    symbol: 'AminoAcid27',
    name: 'Amino Acid Test monomer for test 27',
    naturalAnalogue: AminoAcidNaturalAnalogue.A,
  },
  {
    description: '2. Sugar',
    type: MonomerType.Sugar,
    symbol: 'Sugar27',
    name: 'Sugar Test monomer for test 27',
  },
  {
    description: '3. Base',
    type: MonomerType.Base,
    symbol: 'Base27',
    name: 'Base Test monomer for test 27',
    naturalAnalogue: NucleotideNaturalAnalogue.A,
  },
  {
    description: '4. Phosphate',
    type: MonomerType.Phosphate,
    symbol: 'Phosphate27',
    name: 'Phosphate Test monomer for test 27',
  },
  {
    description: '5. Nucleotide',
    type: MonomerType.Nucleotide,
    symbol: 'Nucleotide27',
    name: 'Nucleotide Test monomer for test 27',
    naturalAnalogue: NucleotideNaturalAnalogue.A,
  },
  {
    description: '6. CHEM',
    type: MonomerType.CHEM,
    symbol: 'CHEM27',
    name: 'CHEM Test monomer for test 27',
  },
];

for (const monomerToCreate of monomersToCreate27) {
  // TODO: Test was skipped due to instability, need to be fixed in future
  test.skip(`27. Check that created ${monomerToCreate.description} monomer (expanded) can be saved/opened to/from MOL V2000 in Micro mode`, async () => {
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
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCC');
    await prepareMoleculeForMonomerCreation(page, ['0']);

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

const monomersToCreate28 = [
  {
    description: '1. Amino Acid',
    type: MonomerType.AminoAcid,
    symbol: 'AminoAcid28',
    name: 'Amino Acid Test monomer for test 28',
    naturalAnalogue: AminoAcidNaturalAnalogue.A,
  },
  {
    description: '2. Sugar',
    type: MonomerType.Sugar,
    symbol: 'Sugar28',
    name: 'Sugar Test monomer for test 28',
  },
  {
    description: '3. Base',
    type: MonomerType.Base,
    symbol: 'Base28',
    name: 'Base Test monomer for test 28',
    naturalAnalogue: NucleotideNaturalAnalogue.A,
  },
  {
    description: '4. Phosphate',
    type: MonomerType.Phosphate,
    symbol: 'Phosphate28',
    name: 'Phosphate Test monomer for test 28',
  },
  {
    description: '5. Nucleotide',
    type: MonomerType.Nucleotide,
    symbol: 'Nucleotide28',
    name: 'Nucleotide Test monomer for test 28',
    naturalAnalogue: NucleotideNaturalAnalogue.A,
  },
  {
    description: '6. CHEM',
    type: MonomerType.CHEM,
    symbol: 'CHEM28',
    name: 'CHEM Test monomer for test 28',
  },
];

for (const monomerToCreate of monomersToCreate28) {
  // TODO: Test was skipped due to instability, need to be fixed in future
  test.skip(`28. Check that created ${monomerToCreate.description} monomer (expanded) can be saved/opened to/from MOL V3000 in Micro mode`, async () => {
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
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCC');
    await prepareMoleculeForMonomerCreation(page, ['0']);

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

const monomersToCreate29 = [
  {
    description: '1. Amino Acid',
    type: MonomerType.AminoAcid,
    symbol: 'AminoAcid29',
    name: 'Amino Acid Test monomer for test 29',
    naturalAnalogue: AminoAcidNaturalAnalogue.A,
  },
  {
    description: '2. Sugar',
    type: MonomerType.Sugar,
    symbol: 'Sugar29',
    name: 'Sugar Test monomer for test 29',
  },
  {
    description: '3. Base',
    type: MonomerType.Base,
    symbol: 'Base29',
    name: 'Base Test monomer for test 29',
    naturalAnalogue: NucleotideNaturalAnalogue.A,
  },
  {
    description: '4. Phosphate',
    type: MonomerType.Phosphate,
    symbol: 'Phosphate29',
    name: 'Phosphate Test monomer for test 29',
  },
  {
    description: '5. Nucleotide',
    type: MonomerType.Nucleotide,
    symbol: 'Nucleotide29',
    name: 'Nucleotide Test monomer for test 29',
    naturalAnalogue: NucleotideNaturalAnalogue.A,
  },
  {
    description: '6. CHEM',
    type: MonomerType.CHEM,
    symbol: 'CHEM29',
    name: 'CHEM Test monomer for test 29',
  },
];

for (const monomerToCreate of monomersToCreate29) {
  test.fail(
    `29. Check that created ${monomerToCreate.description} monomer (expanded) can be saved/opened to/from SDF V2000 in Micro mode`,
    async () => {
      // Test fails due to issue: https://github.com/epam/Indigo/issues/3292
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
      await pasteFromClipboardAndOpenAsNewProject(page, 'CCC');
      await prepareMoleculeForMonomerCreation(page, ['0']);

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
    },
  );
}

const monomersToCreate30 = [
  {
    description: '1. Amino Acid',
    type: MonomerType.AminoAcid,
    symbol: 'AminoAcid30',
    name: 'Amino Acid Test monomer for test 30',
    naturalAnalogue: AminoAcidNaturalAnalogue.A,
  },
  {
    description: '2. Sugar',
    type: MonomerType.Sugar,
    symbol: 'Sugar30',
    name: 'Sugar Test monomer for test 30',
  },
  {
    description: '3. Base',
    type: MonomerType.Base,
    symbol: 'Base30',
    name: 'Base Test monomer for test 30',
    naturalAnalogue: NucleotideNaturalAnalogue.A,
  },
  {
    description: '4. Phosphate',
    type: MonomerType.Phosphate,
    symbol: 'Phosphate30',
    name: 'Phosphate Test monomer for test 30',
  },
  {
    description: '5. Nucleotide',
    type: MonomerType.Nucleotide,
    symbol: 'Nucleotide30',
    name: 'Nucleotide Test monomer for test 30',
    naturalAnalogue: NucleotideNaturalAnalogue.A,
  },
  {
    description: '6. CHEM',
    type: MonomerType.CHEM,
    symbol: 'CHEM30',
    name: 'CHEM Test monomer for test 30',
  },
];

for (const monomerToCreate of monomersToCreate30) {
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
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCC');
    await prepareMoleculeForMonomerCreation(page, ['0']);

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

const monomersToCreate31 = [
  {
    description: '1. Amino Acid',
    type: MonomerType.AminoAcid,
    symbol: 'AminoAcid31',
    name: 'Amino Acid Test monomer for test 31',
    naturalAnalogue: AminoAcidNaturalAnalogue.A,
  },
  {
    description: '2. Sugar',
    type: MonomerType.Sugar,
    symbol: 'Sugar31',
    name: 'Sugar Test monomer for test 31',
  },
  {
    description: '3. Base',
    type: MonomerType.Base,
    symbol: 'Base31',
    name: 'Base Test monomer for test 31',
    naturalAnalogue: NucleotideNaturalAnalogue.A,
  },
  {
    description: '4. Phosphate',
    type: MonomerType.Phosphate,
    symbol: 'Phosphate31',
    name: 'Phosphate Test monomer for test 31',
  },
  {
    description: '5. Nucleotide',
    type: MonomerType.Nucleotide,
    symbol: 'Nucleotide31',
    name: 'Nucleotide Test monomer for test 31',
    naturalAnalogue: NucleotideNaturalAnalogue.A,
  },
  {
    description: '6. CHEM',
    type: MonomerType.CHEM,
    symbol: 'CHEM31',
    name: 'CHEM Test monomer for test 31',
  },
];

for (const monomerToCreate of monomersToCreate31) {
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
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCC');
    await prepareMoleculeForMonomerCreation(page, ['0']);

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

const monomersToCreate32 = [
  {
    description: '1. Amino Acid',
    type: MonomerType.AminoAcid,
    symbol: 'AminoAcid32',
    name: 'Amino Acid Test monomer for test 32',
    naturalAnalogue: AminoAcidNaturalAnalogue.A,
  },
  {
    description: '2. Sugar',
    type: MonomerType.Sugar,
    symbol: 'Sugar32',
    name: 'Sugar Test monomer for test 32',
  },
  {
    description: '3. Base',
    type: MonomerType.Base,
    symbol: 'Base32',
    name: 'Base Test monomer for test 32',
    naturalAnalogue: NucleotideNaturalAnalogue.A,
  },
  {
    description: '4. Phosphate',
    type: MonomerType.Phosphate,
    symbol: 'Phosphate32',
    name: 'Phosphate Test monomer for test 32',
  },
  {
    description: '5. Nucleotide',
    type: MonomerType.Nucleotide,
    symbol: 'Nucleotide32',
    name: 'Nucleotide Test monomer for test 32',
    naturalAnalogue: NucleotideNaturalAnalogue.A,
  },
  {
    description: '6. CHEM',
    type: MonomerType.CHEM,
    symbol: 'CHEM32',
    name: 'CHEM Test monomer for test 32',
  },
];

for (const monomerToCreate of monomersToCreate32) {
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
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCC');
    await prepareMoleculeForMonomerCreation(page, ['0']);

    await createMonomer(page, {
      ...monomerToCreate,
    });

    await verifySVGExport(page);
  });
}

const monomersToCreate33 = [
  {
    description: '1. Amino Acid',
    type: MonomerType.AminoAcid,
    symbol: 'AminoAcid33',
    name: 'Amino Acid Test monomer for test 33',
    naturalAnalogue: AminoAcidNaturalAnalogue.A,
  },
  {
    description: '2. Sugar',
    type: MonomerType.Sugar,
    symbol: 'Sugar33',
    name: 'Sugar Test monomer for test 33',
  },
  {
    description: '3. Base',
    type: MonomerType.Base,
    symbol: 'Base33',
    name: 'Base Test monomer for test 33',
    naturalAnalogue: NucleotideNaturalAnalogue.A,
  },
  {
    description: '4. Phosphate',
    type: MonomerType.Phosphate,
    symbol: 'Phosphate33',
    name: 'Phosphate Test monomer for test 33',
  },
  {
    description: '5. Nucleotide',
    type: MonomerType.Nucleotide,
    symbol: 'Nucleotide33',
    name: 'Nucleotide Test monomer for test 33',
    naturalAnalogue: NucleotideNaturalAnalogue.A,
  },
  {
    description: '6. CHEM',
    type: MonomerType.CHEM,
    symbol: 'CHEM33',
    name: 'CHEM Test monomer for test 33',
  },
];

for (const monomerToCreate of monomersToCreate33) {
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
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCC');
    await prepareMoleculeForMonomerCreation(page, ['0']);

    await createMonomer(page, {
      ...monomerToCreate,
    });

    await verifyPNGExport(page);
  });
}

const monomersToCreate34 = [
  {
    description: '1. Amino Acid',
    type: MonomerType.AminoAcid,
    symbol: 'AminoAcid34',
    name: 'Amino Acid Test monomer for test 34',
    naturalAnalogue: AminoAcidNaturalAnalogue.A,
  },
  {
    description: '2. Sugar',
    type: MonomerType.Sugar,
    symbol: 'Sugar34',
    name: 'Sugar Test monomer for test 34',
  },
  {
    description: '3. Base',
    type: MonomerType.Base,
    symbol: 'Base34',
    name: 'Base Test monomer for test 34',
    naturalAnalogue: NucleotideNaturalAnalogue.A,
  },
  {
    description: '4. Phosphate',
    type: MonomerType.Phosphate,
    symbol: 'Phosphate34',
    name: 'Phosphate Test monomer for test 34',
  },
  {
    description: '5. Nucleotide',
    type: MonomerType.Nucleotide,
    symbol: 'Nucleotide34',
    name: 'Nucleotide Test monomer for test 34',
    naturalAnalogue: NucleotideNaturalAnalogue.A,
  },
  {
    description: '6. CHEM',
    type: MonomerType.CHEM,
    symbol: 'CHEM34',
    name: 'CHEM Test monomer for test 34',
  },
];

for (const monomerToCreate of monomersToCreate34) {
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
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCC');
    await prepareMoleculeForMonomerCreation(page, ['0']);

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

const monomersToCreate36 = [
  {
    description: '1. Amino Acid',
    type: MonomerType.AminoAcid,
    symbol: 'AminoAcid36',
    name: 'Amino Acid Test monomer for test 36',
    naturalAnalogue: AminoAcidNaturalAnalogue.A,
  },
  {
    description: '2. Sugar',
    type: MonomerType.Sugar,
    symbol: 'Sugar36',
    name: 'Sugar Test monomer for test 36',
  },
  {
    description: '3. Base',
    type: MonomerType.Base,
    symbol: 'Base36',
    name: 'Base Test monomer for test 36',
    naturalAnalogue: NucleotideNaturalAnalogue.A,
  },
  {
    description: '4. Phosphate',
    type: MonomerType.Phosphate,
    symbol: 'Phosphate36',
    name: 'Phosphate Test monomer for test 36',
  },
  {
    description: '5. Nucleotide',
    type: MonomerType.Nucleotide,
    symbol: 'Nucleotide36',
    name: 'Nucleotide Test monomer for test 36',
    naturalAnalogue: NucleotideNaturalAnalogue.A,
  },
  {
    description: '6. CHEM',
    type: MonomerType.CHEM,
    symbol: 'CHEM36',
    name: 'CHEM Test monomer for test 36',
  },
];

for (const monomerToCreate of monomersToCreate36) {
  // TODO: Test was skipped due to instability, need to be fixed in future
  test.skip(`36. Check that created ${monomerToCreate.description} monomer (collapesed) can be saved/opened to/from KET in Micro mode`, async () => {
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
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCC');
    await prepareMoleculeForMonomerCreation(page, ['0']);

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

const monomersToCreate37 = [
  {
    description: '1. Amino Acid',
    type: MonomerType.AminoAcid,
    symbol: 'AminoAcid37',
    name: 'Amino Acid Test monomer for test 37',
    naturalAnalogue: AminoAcidNaturalAnalogue.A,
  },
  {
    description: '2. Sugar',
    type: MonomerType.Sugar,
    symbol: 'Sugar37',
    name: 'Sugar Test monomer for test 37',
  },
  {
    description: '3. Base',
    type: MonomerType.Base,
    symbol: 'Base37',
    name: 'Base Test monomer for test 37',
    naturalAnalogue: NucleotideNaturalAnalogue.A,
  },
  {
    description: '4. Phosphate',
    type: MonomerType.Phosphate,
    symbol: 'Phosphate37',
    name: 'Phosphate Test monomer for test 37',
  },
  {
    description: '5. Nucleotide',
    type: MonomerType.Nucleotide,
    symbol: 'Nucleotide37',
    name: 'Nucleotide Test monomer for test 37',
    naturalAnalogue: NucleotideNaturalAnalogue.A,
  },
  {
    description: '6. CHEM',
    type: MonomerType.CHEM,
    symbol: 'CHEM37',
    name: 'CHEM Test monomer for test 37',
  },
];

for (const monomerToCreate of monomersToCreate37) {
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
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCC');
    await prepareMoleculeForMonomerCreation(page, ['0']);

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

const monomersToCreate38 = [
  {
    description: '1. Amino Acid',
    type: MonomerType.AminoAcid,
    symbol: 'AminoAcid38',
    name: 'Amino Acid Test monomer for test 38',
    naturalAnalogue: AminoAcidNaturalAnalogue.A,
  },
  {
    description: '2. Sugar',
    type: MonomerType.Sugar,
    symbol: 'Sugar38',
    name: 'Sugar Test monomer for test 38',
  },
  {
    description: '3. Base',
    type: MonomerType.Base,
    symbol: 'Base38',
    name: 'Base Test monomer for test 38',
    naturalAnalogue: NucleotideNaturalAnalogue.A,
  },
  {
    description: '4. Phosphate',
    type: MonomerType.Phosphate,
    symbol: 'Phosphate38',
    name: 'Phosphate Test monomer for test 38',
  },
  {
    description: '5. Nucleotide',
    type: MonomerType.Nucleotide,
    symbol: 'Nucleotide38',
    name: 'Nucleotide Test monomer for test 38',
    naturalAnalogue: NucleotideNaturalAnalogue.A,
  },
  {
    description: '6. CHEM',
    type: MonomerType.CHEM,
    symbol: 'CHEM38',
    name: 'CHEM Test monomer for test 38',
  },
];

for (const monomerToCreate of monomersToCreate38) {
  // TODO: Test was skipped due to instability, need to be fixed in future
  test.skip(`38. Check that created ${monomerToCreate.description} monomer (collapsed) can be saved/opened to/from MOL V3000 in Micro mode`, async () => {
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
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCC');
    await prepareMoleculeForMonomerCreation(page, ['0']);

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

const monomersToCreate39 = [
  {
    description: '1. Amino Acid',
    type: MonomerType.AminoAcid,
    symbol: 'AminoAcid39',
    name: 'Amino Acid Test monomer for test 39',
    naturalAnalogue: AminoAcidNaturalAnalogue.A,
  },
  {
    description: '2. Sugar',
    type: MonomerType.Sugar,
    symbol: 'Sugar39',
    name: 'Sugar Test monomer for test 39',
  },
  {
    description: '3. Base',
    type: MonomerType.Base,
    symbol: 'Base39',
    name: 'Base Test monomer for test 39',
    naturalAnalogue: NucleotideNaturalAnalogue.A,
  },
  {
    description: '4. Phosphate',
    type: MonomerType.Phosphate,
    symbol: 'Phosphate39',
    name: 'Phosphate Test monomer for test 39',
  },
  {
    description: '5. Nucleotide',
    type: MonomerType.Nucleotide,
    symbol: 'Nucleotide39',
    name: 'Nucleotide Test monomer for test 39',
    naturalAnalogue: NucleotideNaturalAnalogue.A,
  },
  {
    description: '6. CHEM',
    type: MonomerType.CHEM,
    symbol: 'CHEM39',
    name: 'CHEM Test monomer for test 39',
  },
];

for (const monomerToCreate of monomersToCreate39) {
  // TODO: Test was skipped due to instability, need to be fixed in future
  test.skip(`39. Check that created ${monomerToCreate.description} monomer (collapsed) can be saved/opened to/from SDF V2000 in Micro mode`, async () => {
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
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCC');
    await prepareMoleculeForMonomerCreation(page, ['0']);

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

const monomersToCreate40 = [
  {
    description: '1. Amino Acid',
    type: MonomerType.AminoAcid,
    symbol: 'AminoAcid40',
    name: 'Amino Acid Test monomer for test 40',
    naturalAnalogue: AminoAcidNaturalAnalogue.A,
  },
  {
    description: '2. Sugar',
    type: MonomerType.Sugar,
    symbol: 'Sugar40',
    name: 'Sugar Test monomer for test 40',
  },
  {
    description: '3. Base',
    type: MonomerType.Base,
    symbol: 'Base40',
    name: 'Base Test monomer for test 40',
    naturalAnalogue: NucleotideNaturalAnalogue.A,
  },
  {
    description: '4. Phosphate',
    type: MonomerType.Phosphate,
    symbol: 'Phosphate40',
    name: 'Phosphate Test monomer for test 40',
  },
  {
    description: '5. Nucleotide',
    type: MonomerType.Nucleotide,
    symbol: 'Nucleotide40',
    name: 'Nucleotide Test monomer for test 40',
    naturalAnalogue: NucleotideNaturalAnalogue.A,
  },
  {
    description: '6. CHEM',
    type: MonomerType.CHEM,
    symbol: 'CHEM40',
    name: 'CHEM Test monomer for test 40',
  },
];

for (const monomerToCreate of monomersToCreate40) {
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
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCC');
    await prepareMoleculeForMonomerCreation(page, ['0']);

    await createMonomer(page, {
      ...monomerToCreate,
    });
    await collapseMonomer(page, getAtomLocator(page, { atomId: 2 }));

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

const monomersToCreate41 = [
  {
    description: '1. Amino Acid',
    type: MonomerType.AminoAcid,
    symbol: 'AminoAcid41',
    name: 'Amino Acid Test monomer for test 41',
    naturalAnalogue: AminoAcidNaturalAnalogue.A,
  },
  {
    description: '2. Sugar',
    type: MonomerType.Sugar,
    symbol: 'Sugar41',
    name: 'Sugar Test monomer for test 41',
  },
  {
    description: '3. Base',
    type: MonomerType.Base,
    symbol: 'Base41',
    name: 'Base Test monomer for test 41',
    naturalAnalogue: NucleotideNaturalAnalogue.A,
  },
  {
    description: '4. Phosphate',
    type: MonomerType.Phosphate,
    symbol: 'Phosphate41',
    name: 'Phosphate Test monomer for test 41',
  },
  {
    description: '5. Nucleotide',
    type: MonomerType.Nucleotide,
    symbol: 'Nucleotide41',
    name: 'Nucleotide Test monomer for test 41',
    naturalAnalogue: NucleotideNaturalAnalogue.A,
  },
  {
    description: '6. CHEM',
    type: MonomerType.CHEM,
    symbol: 'CHEM41',
    name: 'CHEM Test monomer for test 41',
  },
];

for (const monomerToCreate of monomersToCreate41) {
  // TODO: Test was skipped due to instability, need to be fixed in future
  test.skip(`41. Check that created ${monomerToCreate.description} monomer (collapsed) can be saved/opened to/from CML in Micro mode`, async () => {
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
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCC');
    await prepareMoleculeForMonomerCreation(page, ['0']);

    await createMonomer(page, {
      ...monomerToCreate,
    });
    await collapseMonomer(page, getAtomLocator(page, { atomId: 2 }));

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

const monomersToCreate42 = [
  {
    description: '1. Amino Acid',
    type: MonomerType.AminoAcid,
    symbol: 'AminoAcid42',
    name: 'Amino Acid Test monomer for test 42',
    naturalAnalogue: AminoAcidNaturalAnalogue.A,
  },
  {
    description: '2. Sugar',
    type: MonomerType.Sugar,
    symbol: 'Sugar42',
    name: 'Sugar Test monomer for test 42',
  },
  {
    description: '3. Base',
    type: MonomerType.Base,
    symbol: 'Base42',
    name: 'Base Test monomer for test 42',
    naturalAnalogue: NucleotideNaturalAnalogue.A,
  },
  {
    description: '4. Phosphate',
    type: MonomerType.Phosphate,
    symbol: 'Phosphate42',
    name: 'Phosphate Test monomer for test 42',
  },
  {
    description: '5. Nucleotide',
    type: MonomerType.Nucleotide,
    symbol: 'Nucleotide42',
    name: 'Nucleotide Test monomer for test 42',
    naturalAnalogue: NucleotideNaturalAnalogue.A,
  },
  {
    description: '6. CHEM',
    type: MonomerType.CHEM,
    symbol: 'CHEM42',
    name: 'CHEM Test monomer for test 42',
  },
];

for (const monomerToCreate of monomersToCreate42) {
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
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCC');
    await prepareMoleculeForMonomerCreation(page, ['0']);

    await createMonomer(page, {
      ...monomerToCreate,
    });
    await collapseMonomer(page, getAtomLocator(page, { atomId: 2 }));

    await verifySVGExport(page);
  });
}

const monomersToCreate43 = [
  {
    description: '1. Amino Acid',
    type: MonomerType.AminoAcid,
    symbol: 'AminoAcid43',
    name: 'Amino Acid Test monomer for test 43',
    naturalAnalogue: AminoAcidNaturalAnalogue.A,
  },
  {
    description: '2. Sugar',
    type: MonomerType.Sugar,
    symbol: 'Sugar43',
    name: 'Sugar Test monomer for test 43',
  },
  {
    description: '3. Base',
    type: MonomerType.Base,
    symbol: 'Base43',
    name: 'Base Test monomer for test 43',
    naturalAnalogue: AminoAcidNaturalAnalogue.A,
  },
  {
    description: '4. Phosphate',
    type: MonomerType.Phosphate,
    symbol: 'Phosphate43',
    name: 'Phosphate Test monomer for test 43',
  },
  {
    description: '5. Nucleotide',
    type: MonomerType.Nucleotide,
    symbol: 'Nucleotide43',
    name: 'Nucleotide Test monomer for test 43',
    naturalAnalogue: NucleotideNaturalAnalogue.A,
  },
  {
    description: '6. CHEM',
    type: MonomerType.CHEM,
    symbol: 'CHEM43',
    name: 'CHEM Test monomer for test 43',
  },
];

for (const monomerToCreate of monomersToCreate43) {
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
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCC');
    await prepareMoleculeForMonomerCreation(page, ['0']);

    await createMonomer(page, {
      ...monomerToCreate,
    });
    await collapseMonomer(page, getAtomLocator(page, { atomId: 2 }));

    await verifyPNGExport(page);
  });
}

const monomersToCreate44 = [
  {
    description: '1. Amino Acid',
    type: MonomerType.AminoAcid,
    symbol: 'AminoAcid44',
    name: 'Amino Acid Test monomer for test 44',
    naturalAnalogue: AminoAcidNaturalAnalogue.A,
  },
  {
    description: '2. Sugar',
    type: MonomerType.Sugar,
    symbol: 'Sugar44',
    name: 'Sugar Test monomer for test 44',
  },
  {
    description: '3. Base',
    type: MonomerType.Base,
    symbol: 'Base44',
    name: 'Base Test monomer for test 44',
    naturalAnalogue: AminoAcidNaturalAnalogue.A,
  },
  {
    description: '4. Phosphate',
    type: MonomerType.Phosphate,
    symbol: 'Phosphate44',
    name: 'Phosphate Test monomer for test 44',
  },
  {
    description: '5. Nucleotide',
    type: MonomerType.Nucleotide,
    symbol: 'Nucleotide44',
    name: 'Nucleotide Test monomer for test 44',
    naturalAnalogue: NucleotideNaturalAnalogue.A,
  },
  {
    description: '6. CHEM',
    type: MonomerType.CHEM,
    symbol: 'CHEM44',
    name: 'CHEM Test monomer for test 44',
  },
];

for (const monomerToCreate of monomersToCreate44) {
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
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCC');
    await prepareMoleculeForMonomerCreation(page, ['0']);

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

const monomersToCreate46 = [
  {
    description: '1. Amino Acid',
    type: MonomerType.AminoAcid,
    symbol: 'AminoAcid46',
    name: 'Amino Acid Test monomer for test 46',
    naturalAnalogue: AminoAcidNaturalAnalogue.A,
  },
  {
    description: '2. Sugar',
    type: MonomerType.Sugar,
    symbol: 'Sugar46',
    name: 'Sugar Test monomer for test 46',
  },
  {
    description: '3. Base',
    type: MonomerType.Base,
    symbol: 'Base46',
    name: 'Base Test monomer for test 46',
    naturalAnalogue: AminoAcidNaturalAnalogue.A,
  },
  {
    description: '4. Phosphate',
    type: MonomerType.Phosphate,
    symbol: 'Phosphate46',
    name: 'Phosphate Test monomer for test 46',
  },
  {
    description: '5. Nucleotide',
    type: MonomerType.Nucleotide,
    symbol: 'Nucleotide46',
    name: 'Nucleotide Test monomer for test 46',
    naturalAnalogue: NucleotideNaturalAnalogue.A,
  },
  {
    description: '6. CHEM',
    type: MonomerType.CHEM,
    symbol: 'CHEM46',
    name: 'CHEM Test monomer for test 46',
  },
];

for (const monomerToCreate of monomersToCreate46) {
  test.fail(
    `46. Check that created ${monomerToCreate.description} monomer can be saved/opened to/from KET in Macro mode`,
    async () => {
      // Bug: https://github.com/epam/ketcher/issues/7769
      /*
       * Test task: https://github.com/epam/ketcher/issues/7657
       * Description: Check that created ${monomerToCreate.description} monomer can be saved/opened to/from KET in Macro mode
       *
       * Case:
       *      1. Open Molecules canvas
       *      2. Load molecule on canvas
       *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
       *      4. Create monomer with given attributes
       *      5. Switch to Macro mode
       *      6. Save it to KET and validate the result
       *      7. Load saved monomer from KET as New Project
       *      8. Take screenshot to validate monomer got loaded
       *
       * Version 3.7
       */
      await pasteFromClipboardAndOpenAsNewProject(page, 'CCC');
      await prepareMoleculeForMonomerCreation(page, ['0']);

      await createMonomer(page, {
        ...monomerToCreate,
      });
      await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
      await verifyFileExport(
        page,
        `KET/Chromium-popup/Create-monomer/${monomerToCreate.description}-macro-expected.ket`,
        FileType.KET,
      );
      await openFileAndAddToCanvasAsNewProjectMacro(
        page,
        `KET/Chromium-popup/Create-monomer/${monomerToCreate.description}-macro-expected.ket`,
        MacroFileType.KetFormat,
      );
      await takeEditorScreenshot(page, {
        hideMacromoleculeEditorScrollBars: true,
        hideMonomerPreview: true,
      });
    },
  );
}

const monomersToCreate47 = [
  {
    description: '1. Amino Acid',
    type: MonomerType.AminoAcid,
    symbol: 'AminoAcid47',
    name: 'Amino Acid Test monomer for test 47',
    naturalAnalogue: AminoAcidNaturalAnalogue.A,
  },
  {
    description: '2. Sugar',
    type: MonomerType.Sugar,
    symbol: 'Sugar47',
    name: 'Sugar Test monomer for test 47',
  },
  {
    description: '3. Base',
    type: MonomerType.Base,
    symbol: 'Base47',
    name: 'Base Test monomer for test 47',
    naturalAnalogue: AminoAcidNaturalAnalogue.A,
  },
  {
    description: '4. Phosphate',
    type: MonomerType.Phosphate,
    symbol: 'Phosphate47',
    name: 'Phosphate Test monomer for test 47',
  },
  {
    description: '5. Nucleotide',
    type: MonomerType.Nucleotide,
    symbol: 'Nucleotide47',
    name: 'Nucleotide Test monomer for test 47',
    naturalAnalogue: NucleotideNaturalAnalogue.A,
  },
  {
    description: '6. CHEM',
    type: MonomerType.CHEM,
    symbol: 'CHEM47',
    name: 'CHEM Test monomer for test 47',
  },
];

for (const monomerToCreate of monomersToCreate47) {
  test(`47. Check that created ${monomerToCreate.description} monomer can be saved/opened to/from MOL V3000 in Macro mode`, async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/7657
     * Description: Check that created ${monomerToCreate.description} monomer (expanded) can be saved/opened to/from MOL V3000 in Macro mode
     *
     * Case:
     *      1. Open Molecules canvas
     *      2. Load molecule on canvas
     *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
     *      4. Create monomer with given attributes
     *      5. Switch to Macro mode
     *      6. Save it to MOL V3000 and validate the result
     *      7. Load saved monomer from MOL V3000 as New Project
     *      8. Take screenshot to validate monomer got loaded
     *
     * Version 3.7
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCC');
    await prepareMoleculeForMonomerCreation(page, ['0']);

    await createMonomer(page, {
      ...monomerToCreate,
    });
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await verifyFileExport(
      page,
      `Molfiles-V3000/Chromium-popup/Create-monomer/${monomerToCreate.description}-macro-expected.mol`,
      FileType.MOL,
      MolFileFormat.v3000,
    );
    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      `Molfiles-V3000/Chromium-popup/Create-monomer/${monomerToCreate.description}-macro-expected.mol`,
      MacroFileType.MOLv3000,
    );
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
      hideMonomerPreview: true,
    });
  });
}

const monomersToCreate48 = [
  {
    description: '1. Amino Acid',
    type: MonomerType.AminoAcid,
    symbol: 'AminoAcid48',
    name: 'Amino Acid Test monomer for test 48',
    naturalAnalogue: AminoAcidNaturalAnalogue.A,
  },
  {
    description: '5. Nucleotide',
    type: MonomerType.Nucleotide,
    symbol: 'Nucleotide48',
    name: 'Nucleotide Test monomer for test 48',
    naturalAnalogue: NucleotideNaturalAnalogue.A,
  },
];

for (const monomerToCreate of monomersToCreate48) {
  test(`48. Check that created ${monomerToCreate.description} monomer can be saved/opened to/from Sequence (1-letter-code) in Macro mode`, async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/7657
     * Description: Check that created Amino acid and Nucleotide monomer can be saved/opened to/from SDF V2000 in Macro mode
     *
     * Case:
     *      1. Open Molecules canvas
     *      2. Load molecule on canvas
     *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
     *      4. Create monomer with given attributes
     *      5. Select and delete atom outside monomer
     *      6. Switch to Macro mode
     *      7. Save it to Sequence (1-letter-code) and validate the result
     *      8. Load saved monomer from Sequence (1-letter-code) as New Project
     *      9. Take screenshot to validate monomer got loaded
     *
     * Version 3.7
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCC');
    await prepareMoleculeForMonomerCreation(page, ['0']);

    await createMonomer(page, {
      ...monomerToCreate,
    });
    await getAtomLocator(page, { atomId: 0 }).click();
    await CommonLeftToolbar(page).erase();

    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await verifyFileExport(
      page,
      `Sequence/Chromium-popup/Create-monomer/${monomerToCreate.description}-macro-expected.seq`,
      FileType.SEQ,
      SequenceFileFormat.oneLetter,
    );

    if (monomerToCreate.type === MonomerType.AminoAcid) {
      await openFileAndAddToCanvasAsNewProjectMacro(
        page,
        `Sequence/Chromium-popup/Create-monomer/${monomerToCreate.description}-macro-expected.seq`,
        [
          MacroFileType.Sequence,
          [SequenceMonomerType.Peptide, PeptideLetterCodeType.oneLetterCode],
        ],
      );
    }
    if (monomerToCreate.type === MonomerType.Nucleotide) {
      await openFileAndAddToCanvasAsNewProjectMacro(
        page,
        `Sequence/Chromium-popup/Create-monomer/${monomerToCreate.description}-macro-expected.seq`,
        [MacroFileType.Sequence, SequenceMonomerType.RNA],
      );
    }
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
      hideMonomerPreview: true,
    });
  });
}

const monomersToCreate49 = [
  {
    description: '1. Amino Acid',
    type: MonomerType.AminoAcid,
    symbol: 'AminoAcid49',
    name: 'Amino Acid Test monomer for test 49',
    naturalAnalogue: AminoAcidNaturalAnalogue.A,
  },
];

for (const monomerToCreate of monomersToCreate49) {
  test(`49. Check that created ${monomerToCreate.description} monomer can be saved/opened to/from Sequence (3-letter-code) in Macro mode`, async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/7657
     * Description: Check that created Amino acid monomer can be saved/opened to/from Sequence (3-letter-code) in Macro mode
     *
     * Case:
     *      1. Open Molecules canvas
     *      2. Load molecule on canvas
     *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
     *      4. Create monomer with given attributes
     *      5. Select and delete atom outside monomer
     *      6. Switch to Macro mode
     *      7. Save it to Sequence (3-letter-code) and validate the result
     *      8. Load saved monomer from Sequence (3-letter-code) as New Project
     *      9. Take screenshot to validate monomer got loaded
     *
     * Version 3.7
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCC');
    await prepareMoleculeForMonomerCreation(page, ['0']);

    await createMonomer(page, {
      ...monomerToCreate,
    });
    await getAtomLocator(page, { atomId: 0 }).click();
    await CommonLeftToolbar(page).erase();

    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await verifyFileExport(
      page,
      `Sequence/Three-Letter/Chromium-popup/Create-monomer/${monomerToCreate.description}-macro-expected.seq`,
      FileType.SEQ,
      SequenceFileFormat.threeLetter,
    );

    if (monomerToCreate.type === MonomerType.AminoAcid) {
      await openFileAndAddToCanvasAsNewProjectMacro(
        page,
        `Sequence/Three-Letter/Chromium-popup/Create-monomer/${monomerToCreate.description}-macro-expected.seq`,
        [
          MacroFileType.Sequence,
          [SequenceMonomerType.Peptide, PeptideLetterCodeType.threeLetterCode],
        ],
      );
    }
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
      hideMonomerPreview: true,
    });
  });
}

const monomersToCreate50 = [
  {
    description: '1. Amino Acid',
    type: MonomerType.AminoAcid,
    symbol: 'AminoAcid50',
    name: 'Amino Acid Test monomer for test 50',
    naturalAnalogue: AminoAcidNaturalAnalogue.A,
  },
  {
    description: '5. Nucleotide',
    type: MonomerType.Nucleotide,
    symbol: 'Nucleotide50',
    name: 'Nucleotide Test monomer for test 50',
    naturalAnalogue: NucleotideNaturalAnalogue.A,
  },
];

for (const monomerToCreate of monomersToCreate50) {
  test(`50. Check that created ${monomerToCreate.description} monomer can be saved/opened to/from FASTA in Macro mode`, async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/7657
     * Description: Check that created ${monomerToCreate.description} can be saved/opened to/from FASTA in Macro mode
     *
     * Case:
     *      1. Open Molecules canvas
     *      2. Load molecule on canvas
     *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
     *      4. Create monomer with given attributes
     *      5. Select and delete atom outside monomer
     *      6. Switch to Macro mode
     *      7. Save it to FASTA and validate the result
     *      8. Load saved monomer from FASTA as New Project
     *      9. Take screenshot to validate monomer got loaded
     *
     * Version 3.7
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCC');
    await prepareMoleculeForMonomerCreation(page, ['0']);

    await createMonomer(page, {
      ...monomerToCreate,
    });
    await getAtomLocator(page, { atomId: 0 }).click();
    await CommonLeftToolbar(page).erase();

    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await verifyFileExport(
      page,
      `FASTA/Chromium-popup/Create-monomer/${monomerToCreate.description}-macro-expected.fasta`,
      FileType.FASTA,
    );

    if (monomerToCreate.type === MonomerType.AminoAcid) {
      await openFileAndAddToCanvasAsNewProjectMacro(
        page,
        `FASTA/Chromium-popup/Create-monomer/${monomerToCreate.description}-macro-expected.fasta`,
        [MacroFileType.FASTA, SequenceMonomerType.Peptide],
      );
    }
    if (monomerToCreate.type === MonomerType.Nucleotide) {
      await openFileAndAddToCanvasAsNewProjectMacro(
        page,
        `FASTA/Chromium-popup/Create-monomer/${monomerToCreate.description}-macro-expected.fasta`,
        [MacroFileType.FASTA, SequenceMonomerType.RNA],
      );
    }

    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
      hideMonomerPreview: true,
    });
  });
}

const monomersToCreate51 = [
  {
    description: '1. Amino Acid',
    type: MonomerType.AminoAcid,
    symbol: 'AminoAcid51',
    name: 'Amino Acid Test monomer for test 51',
    naturalAnalogue: AminoAcidNaturalAnalogue.A,
  },
  {
    description: '2. Sugar',
    type: MonomerType.Sugar,
    symbol: 'Sugar51',
    name: 'Sugar Test monomer for test 51',
  },
  {
    description: '3. Base',
    type: MonomerType.Base,
    symbol: 'Base51',
    name: 'Base Test monomer for test 51',
    naturalAnalogue: AminoAcidNaturalAnalogue.A,
  },
  {
    description: '4. Phosphate',
    type: MonomerType.Phosphate,
    symbol: 'Phosphate51',
    name: 'Phosphate Test monomer for test 51',
  },
  {
    description: '5. Nucleotide',
    type: MonomerType.Nucleotide,
    symbol: 'Nucleotide51',
    name: 'Nucleotide Test monomer for test 51',
    naturalAnalogue: NucleotideNaturalAnalogue.A,
  },
  {
    description: '6. CHEM',
    type: MonomerType.CHEM,
    symbol: 'CHEM51',
    name: 'CHEM Test monomer for test 51',
  },
];

for (const monomerToCreate of monomersToCreate51) {
  test(`51. Check that created ${monomerToCreate.description} monomer can not be saved to IDT in Macro mode`, async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/7657
     * Description: Check that created ${monomerToCreate.description} monomer can not be saved to IDT in Macro mode
     *
     * Case:
     *      1. Open Molecules canvas
     *      2. Load molecule on canvas
     *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
     *      4. Create monomer with given attributes
     *      5. Select and delete atom outside monomer
     *      6. Switch to Macro mode
     *      7. Save it to IDT
     *      8. Validate the error message shown on the screen: Convert error! Sequence saver: Cannot save...
     *
     * Version 3.7
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCC');
    await prepareMoleculeForMonomerCreation(page, ['0']);

    await createMonomer(page, {
      ...monomerToCreate,
    });
    await getAtomLocator(page, { atomId: 0 }).click();
    await CommonLeftToolbar(page).erase();

    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MacromoleculesFileFormatType.IDT,
    );
    const errorMessage = await ErrorMessageDialog(page).getErrorMessage();
    expect(errorMessage).toContain('Convert error! Sequence saver:');
    await ErrorMessageDialog(page).close();
    await SaveStructureDialog(page).cancel();
  });
}

const monomersToCreate52 = [
  {
    description: '1. Amino Acid',
    type: MonomerType.AminoAcid,
    symbol: 'AminoAcid52',
    name: 'Amino Acid Test monomer for test 52',
    naturalAnalogue: AminoAcidNaturalAnalogue.A,
  },
  {
    description: '2. Sugar',
    type: MonomerType.Sugar,
    symbol: 'Sugar52',
    name: 'Sugar Test monomer for test 52',
  },
  {
    description: '3. Base',
    type: MonomerType.Base,
    symbol: 'Base52',
    name: 'Base Test monomer for test 52',
    naturalAnalogue: AminoAcidNaturalAnalogue.A,
  },
  {
    description: '4. Phosphate',
    type: MonomerType.Phosphate,
    symbol: 'Phosphate52',
    name: 'Phosphate Test monomer for test 52',
  },
  {
    description: '5. Nucleotide',
    type: MonomerType.Nucleotide,
    symbol: 'Nucleotide52',
    name: 'Nucleotide Test monomer for test 52',
    naturalAnalogue: NucleotideNaturalAnalogue.A,
  },
  {
    description: '6. CHEM',
    type: MonomerType.CHEM,
    symbol: 'CHEM52',
    name: 'CHEM Test monomer for test 52',
  },
];

for (const monomerToCreate of monomersToCreate52) {
  test(`52. Check that created ${monomerToCreate.description} monomer can be saved to SVG Document in Macro mode`, async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/7657
     * Description: Check that created ${monomerToCreate.description} monomer can be saved to SVG Document in Macro mode
     *
     * Case:
     *      1. Open Molecules canvas
     *      2. Load molecule on canvas
     *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
     *      4. Create monomer with given attributes
     *      5. Switch to Macro mode
     *      6. Verify export to SVG Document
     *
     * Version 3.7
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCC');
    await prepareMoleculeForMonomerCreation(page, ['0']);

    await createMonomer(page, {
      ...monomerToCreate,
    });
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await verifySVGExport(page);
  });
}

const monomersToCreate53 = [
  {
    description: '1. Amino Acid',
    type: MonomerType.AminoAcid,
    symbol: 'AminoAcid',
    name: 'Amino Acid Test monomer for test 53',
    naturalAnalogue: AminoAcidNaturalAnalogue.A,
    libraryCard: Peptide.AminoAcid,
    helm: 'PEPTIDE1{[AminoAcid]}$$$$V2.0',
  },
  {
    description: '2. Sugar',
    type: MonomerType.Sugar,
    symbol: 'Sugar',
    name: 'Sugar Test monomer for test 53',
    libraryCard: Sugar.Sugar,
    helm: 'RNA1{[Sugar]}$$$$V2.0',
  },
  {
    description: '3. Base',
    type: MonomerType.Base,
    symbol: 'Base',
    name: 'Base Test monomer for test 53',
    naturalAnalogue: NucleotideNaturalAnalogue.A,
    libraryCard: Base.Base,
  },
  {
    description: '4. Phosphate',
    type: MonomerType.Phosphate,
    symbol: 'Phosphate',
    name: 'Phosphate Test monomer for test 53',
    libraryCard: Phosphate.Phosphate,
    helm: 'RNA1{[Phosphate]}$$$$V2.0',
  },
  {
    description: '5. Nucleotide',
    type: MonomerType.Nucleotide,
    symbol: 'Nucleotide',
    name: 'Nucleotide Test monomer for test 53',
    naturalAnalogue: NucleotideNaturalAnalogue.A,
    libraryCard: Nucleotide.Nucleotide,
    helm: 'RNA1{[Nucleotide]}$$$$V2.0',
  },
  {
    description: '6. CHEM',
    type: MonomerType.CHEM,
    symbol: 'CHEM',
    name: 'CHEM Test monomer for test 53',
    libraryCard: Chem.CHEM,
    helm: 'CHEM1{[CHEM]}$$$$V2.0',
  },
];

for (const monomerToCreate of monomersToCreate53) {
  test(`53. Check that created ${monomerToCreate.description} monomer can be saved/opened to/from HELM in Macro mode`, async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/7657
     * Description: Check that created ${monomerToCreate.description} monomer can be saved/opened to/from HELM in Macro mode
     *
     * Case:
     *      1. Open Molecules canvas
     *      2. Load molecule on canvas
     *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
     *      4. Create monomer with given attributes
     *      5. Select and delete atom outside monomer
     *      6. Switch to Macro mode
     *      7. Verify export to HELM
     *
     * Version 3.7
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCC');
    await prepareMoleculeForMonomerCreation(page, ['0']);

    await createMonomer(page, {
      ...monomerToCreate,
    });
    await getAtomLocator(page, { atomId: 0 }).click();
    await CommonLeftToolbar(page).erase();

    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    if (monomerToCreate.helm) {
      await verifyHELMExport(page, monomerToCreate.helm);

      await pasteFromClipboardAndOpenAsNewProjectMacro(
        page,
        MacroFileType.HELM,
        monomerToCreate.helm,
      );
      await takeEditorScreenshot(page, {
        hideMacromoleculeEditorScrollBars: true,
        hideMonomerPreview: true,
      });
    }
  });
}

const monomersToCreate54 = [
  {
    description: '1. Amino Acid',
    type: MonomerType.AminoAcid,
    symbol: 'AminoAcid54',
    name: 'Amino Acid Test monomer for test 54',
    naturalAnalogue: AminoAcidNaturalAnalogue.A,
  },
  {
    description: '2. Sugar',
    type: MonomerType.Sugar,
    symbol: 'Sugar54',
    name: 'Sugar Test monomer for test 54',
  },
  {
    description: '3. Base',
    type: MonomerType.Base,
    symbol: 'Base54',
    name: 'Base Test monomer for test 54',
    naturalAnalogue: AminoAcidNaturalAnalogue.A,
  },
  {
    description: '4. Phosphate',
    type: MonomerType.Phosphate,
    symbol: 'Phosphate54',
    name: 'Phosphate Test monomer for test 54',
  },
  {
    description: '5. Nucleotide',
    type: MonomerType.Nucleotide,
    symbol: 'Nucleotide54',
    name: 'Nucleotide Test monomer for test 54',
    naturalAnalogue: NucleotideNaturalAnalogue.A,
  },
  {
    description: '6. CHEM',
    type: MonomerType.CHEM,
    symbol: 'CHEM54',
    name: 'CHEM Test monomer for test 54',
  },
];

for (const monomerToCreate of monomersToCreate54) {
  test(`54. Check that created ${monomerToCreate.description} can be deleted on canvas by Erase tool in Micro mode`, async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/7657
     * Description: Check that created ${monomerToCreate.description} monomer can be deleted on canvas by Erase tool in Micro mode
     *
     * Case:
     *      1. Open Molecules canvas
     *      2. Load molecule on canvas
     *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
     *      4. Create monomer with given attributes
     *      5. Collapse created monomer
     *      6. Verify that monomer is present on canvas
     *      7. Select Erase tool
     *      8. Delete monomer by clicking on it
     *      9. Verify that monomer is deleted from canvas
     *
     * Version 3.7
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCC');
    await prepareMoleculeForMonomerCreation(page, ['0']);

    await createMonomer(page, {
      ...monomerToCreate,
    });

    await collapseMonomer(page, getAtomLocator(page, { atomId: 2 }));
    const monomerOnMicro = getAbbreviationLocator(page, {
      name: monomerToCreate.symbol,
    });
    await expect(monomerOnMicro).toBeVisible();

    await CommonLeftToolbar(page).erase();
    await monomerOnMicro.click();
    await expect(monomerOnMicro).not.toBeVisible();
  });
}

const monomersToCreate55 = [
  {
    description: '1. Amino Acid',
    type: MonomerType.AminoAcid,
    symbol: 'AminoAcid55',
    name: 'Amino Acid Test monomer for test 55',
    naturalAnalogue: AminoAcidNaturalAnalogue.A,
  },
  {
    description: '2. Sugar',
    type: MonomerType.Sugar,
    symbol: 'Sugar55',
    name: 'Sugar Test monomer for test 55',
  },
  {
    description: '3. Base',
    type: MonomerType.Base,
    symbol: 'Base55',
    name: 'Base Test monomer for test 55',
    naturalAnalogue: AminoAcidNaturalAnalogue.A,
  },
  {
    description: '4. Phosphate',
    type: MonomerType.Phosphate,
    symbol: 'Phosphate55',
    name: 'Phosphate Test monomer for test 55',
  },
  {
    description: '5. Nucleotide',
    type: MonomerType.Nucleotide,
    symbol: 'Nucleotide55',
    name: 'Nucleotide Test monomer for test 55',
    naturalAnalogue: NucleotideNaturalAnalogue.A,
  },
  {
    description: '6. CHEM',
    type: MonomerType.CHEM,
    symbol: 'CHEM55',
    name: 'CHEM Test monomer for test 55',
  },
];

for (const monomerToCreate of monomersToCreate55) {
  test(`55. Check that created ${monomerToCreate.description} can be deleted on canvas by Erase tool in Macro mode`, async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/7657
     * Description: Check that created ${monomerToCreate.description} monomer can be deleted on canvas by Erase tool in Macro mode
     *
     * Case:
     *      1. Open Molecules canvas
     *      2. Load molecule on canvas
     *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
     *      4. Create monomer with given attributes
     *      5. Switch to Macro mode
     *      6. Verify that monomer is present on canvas
     *      7. Select Erase tool
     *      8. Delete monomer by clicking on it
     *      9. Verify that monomer is deleted from canvas
     *
     * Version 3.7
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCC');
    await prepareMoleculeForMonomerCreation(page, ['0']);

    await createMonomer(page, {
      ...monomerToCreate,
    });

    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    const monomerOnMacro = getMonomerLocator(page, {
      monomerAlias: monomerToCreate.symbol,
    });
    await expect(monomerOnMacro).toBeVisible();

    await CommonLeftToolbar(page).erase();
    await monomerOnMacro.click();
    await expect(monomerOnMacro).not.toBeVisible();
  });
}

const monomersToCreate56 = [
  {
    description: '1. Amino Acid',
    type: MonomerType.AminoAcid,
    symbol: 'AminoAcid56',
    name: 'Amino Acid Test monomer for test 56',
    naturalAnalogue: AminoAcidNaturalAnalogue.A,
  },
  {
    description: '2. Sugar',
    type: MonomerType.Sugar,
    symbol: 'Sugar56',
    name: 'Sugar Test monomer for test 56',
  },
  {
    description: '3. Base',
    type: MonomerType.Base,
    symbol: 'Base56',
    name: 'Base Test monomer for test 56',
    naturalAnalogue: AminoAcidNaturalAnalogue.A,
  },
  {
    description: '4. Phosphate',
    type: MonomerType.Phosphate,
    symbol: 'Phosphate56',
    name: 'Phosphate Test monomer for test 56',
  },
  {
    description: '5. Nucleotide',
    type: MonomerType.Nucleotide,
    symbol: 'Nucleotide56',
    name: 'Nucleotide Test monomer for test 56',
    naturalAnalogue: NucleotideNaturalAnalogue.A,
  },
  {
    description: '6. CHEM',
    type: MonomerType.CHEM,
    symbol: 'CHEM56',
    name: 'CHEM Test monomer for test 56',
  },
];

for (const monomerToCreate of monomersToCreate56) {
  test(`56. Check that created ${monomerToCreate.description} looks like ${monomerToCreate.description} in Macro mode (Flex->Snake->Sequence)`, async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/7657
     * Description: Check that created ${monomerToCreate.description} looks like ${monomerToCreate.description} in Macro mode (Flex->Snake->Sequence)
     *
     * Case:
     *      1. Open Molecules canvas
     *      2. Load molecule on canvas
     *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
     *      4. Create monomer with given attributes
     *      5. Switch to Macro mode
     *      6. Select and delete atom outside monomer
     *      7. Verify that monomer is present on canvas
     *      8. Select Erase tool
     *      9. Delete monomer by clicking on it
     *      10. Verify that monomer is deleted from canvas
     *
     * Version 3.7
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCC');
    await prepareMoleculeForMonomerCreation(page, ['0']);

    await createMonomer(page, {
      ...monomerToCreate,
    });
    await getAtomLocator(page, { atomId: 0 }).click();
    await CommonLeftToolbar(page).erase();

    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
    const monomerOnMacro = getMonomerLocator(page, {
      monomerAlias: monomerToCreate.symbol,
    });
    await takeElementScreenshot(page, monomerOnMacro);

    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await takeElementScreenshot(page, monomerOnMacro);

    await MacromoleculesTopToolbar(page).selectLayoutModeTool(
      LayoutMode.Sequence,
    );
    const monomerOnSequence = getSymbolLocator(page, {});
    await takeElementScreenshot(page, monomerOnSequence);
  });
}

const monomersConnectTo = [
  {
    description: 'Amino Acid (DACys)',
    monomer: Peptide.DACys,
    attachmentPoint: AttachmentPoint.R2,
  },
  {
    description: 'Sugar (5cGT)',
    monomer: Sugar._5cGT,
    attachmentPoint: AttachmentPoint.R2,
  },
  {
    description: 'Base (C)',
    monomer: Base.C,
    attachmentPoint: AttachmentPoint.R1,
  },
  {
    description: 'Phosphate (AmC6)',
    monomer: Phosphate.AmC6,
    attachmentPoint: AttachmentPoint.R2,
  },
  {
    description: 'Nucleotide (3Puro)',
    monomer: Nucleotide._3Puro,
    attachmentPoint: AttachmentPoint.R1,
  },
];

for (const monomerToCreate of monomersToCreate) {
  for (const monomerConnectTo of monomersConnectTo) {
    test(`57.1 Check that created ${monomerToCreate.description} can be connected to ${monomerConnectTo.description} in Macro mode from library by center to center in Macro mode (Flex)`, async () => {
      /*
       * Test task: https://github.com/epam/ketcher/issues/7657
       * Description: Check that created ${monomerToCreate.description} can be connected to ${monomerConnectTo.description} in Macro mode
       *              from library by center to center in Macro mode (Flex)
       *
       * Case:
       *      1. Open Molecules canvas
       *      2. Load molecule on canvas
       *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
       *      4. Create monomer with given attributes
       *      5. Select and delete atom outside monomer
       *      6. Switch to Macro mode - Flex layout
       *      7. Drag and drop ${monomerConnectTo.description} monomer from library to the canvas
       *      8. Connect both monomers by center to center
       *      9. Validate that connection is created correctly
       *
       * Version 3.7
       */
      await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
      if (await Library(page).isMonomerExist(monomerToCreate.libraryCard)) {
        await Library(page).dragMonomerOnCanvas(monomerToCreate.libraryCard, {
          x: 0,
          y: 0,
          fromCenter: true,
        });
      } else {
        await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
        await pasteFromClipboardAndOpenAsNewProject(page, 'CCC');
        await prepareMoleculeForMonomerCreation(page, ['0']);

        await createMonomer(page, {
          ...monomerToCreate,
        });
        await getAtomLocator(page, { atomId: 0 }).click();
        await CommonLeftToolbar(page).erase();
      }

      await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
      await MacromoleculesTopToolbar(page).selectLayoutModeTool(
        LayoutMode.Flex,
      );
      const monomerOnMacro = getMonomerLocator(page, {
        monomerAlias: monomerToCreate.symbol,
      });
      await Library(page).dragMonomerOnCanvas(monomerConnectTo.monomer, {
        x: 100,
        y: 100,
      });
      const monomerConnectToOnMacro = getMonomerLocator(
        page,
        monomerConnectTo.monomer,
      );
      await bondTwoMonomers(page, monomerOnMacro, monomerConnectToOnMacro);
      const bondLocator = getBondLocator(page, {});
      expect(await bondLocator.count()).toEqual(1);
    });
  }
}

for (const monomerToCreate of monomersToCreate) {
  for (const monomerConnectTo of monomersConnectTo) {
    test(`57.2 Check that created ${monomerToCreate.description} can be connected to ${monomerConnectTo.description} in Macro mode from library by center to center in Macro mode (Snake)`, async () => {
      /*
       * Test task: https://github.com/epam/ketcher/issues/7657
       * Description: Check that created ${monomerToCreate.description} can be connected to ${monomerConnectTo.description} in Macro mode
       *              from library by center to center in Macro mode (Snake)
       *
       * Case:
       *      1. Open Molecules canvas
       *      2. Load molecule on canvas
       *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
       *      4. Create monomer with given attributes
       *      5. Select and delete atom outside monomer
       *      6. Switch to Macro mode - Snake layout
       *      7. Drag and drop ${monomerConnectTo.description} monomer from library to the canvas
       *      8. Connect both monomers by center to center
       *      9. Validate that connection is created correctly
       *
       * Version 3.7
       */
      await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
      if (await Library(page).isMonomerExist(monomerToCreate.libraryCard)) {
        await Library(page).dragMonomerOnCanvas(monomerToCreate.libraryCard, {
          x: 0,
          y: 0,
          fromCenter: true,
        });
      } else {
        await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
        await pasteFromClipboardAndOpenAsNewProject(page, 'CCC');
        await prepareMoleculeForMonomerCreation(page, ['0']);

        await createMonomer(page, {
          ...monomerToCreate,
        });
        await getAtomLocator(page, { atomId: 0 }).click();
        await CommonLeftToolbar(page).erase();
      }

      await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
      await MacromoleculesTopToolbar(page).selectLayoutModeTool(
        LayoutMode.Snake,
      );
      const monomerOnMacro = getMonomerLocator(page, {
        monomerAlias: monomerToCreate.symbol,
      });
      await Library(page).dragMonomerOnCanvas(monomerConnectTo.monomer, {
        x: 100,
        y: 100,
      });
      const monomerConnectToOnMacro = getMonomerLocator(
        page,
        monomerConnectTo.monomer,
      );
      await bondTwoMonomers(page, monomerOnMacro, monomerConnectToOnMacro);
      const bondLocator = getBondLocator(page, {});
      expect(await bondLocator.count()).toEqual(1);
    });
  }
}

for (const monomerToCreate of monomersToCreate) {
  for (const monomerConnectTo of monomersConnectTo) {
    test(`58.1 Check that created ${monomerToCreate.description} can be connected to ${monomerConnectTo.description} in Macro mode from library by center to center in Macro mode (Flex)`, async () => {
      /*
       * Test task: https://github.com/epam/ketcher/issues/7657
       * Description: Check that created ${monomerToCreate.description} can be connected to ${monomerConnectTo.description} in Macro mode
       *              from library by center to center in Macro mode (Flex)
       *
       * Case:
       *      1. Open Molecules canvas
       *      2. Load molecule on canvas
       *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
       *      4. Create monomer with given attributes
       *      5. Select and delete atom outside monomer
       *      6. Switch to Macro mode - Flex layout
       *      7. Drag and drop ${monomerConnectTo.description} monomer from library to the canvas
       *      8. Connect both monomers by center to center
       *      9. Validate that connection is created correctly
       *
       * Version 3.7
       */
      await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
      if (await Library(page).isMonomerExist(monomerToCreate.libraryCard)) {
        await Library(page).dragMonomerOnCanvas(monomerToCreate.libraryCard, {
          x: 0,
          y: 0,
          fromCenter: true,
        });
      } else {
        await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
        await pasteFromClipboardAndOpenAsNewProject(page, 'CCC');
        await prepareMoleculeForMonomerCreation(page, ['0']);

        await createMonomer(page, {
          ...monomerToCreate,
        });
        await getAtomLocator(page, { atomId: 0 }).click();
        await CommonLeftToolbar(page).erase();
      }

      await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
      await MacromoleculesTopToolbar(page).selectLayoutModeTool(
        LayoutMode.Flex,
      );
      const monomerOnMacro = getMonomerLocator(page, {
        monomerAlias: monomerToCreate.symbol,
      });
      await Library(page).dragMonomerOnCanvas(monomerConnectTo.monomer, {
        x: 100,
        y: 100,
      });
      const monomerConnectToOnMacro = getMonomerLocator(
        page,
        monomerConnectTo.monomer,
      );
      await bondTwoMonomers(
        page,
        monomerOnMacro,
        monomerConnectToOnMacro,
        AttachmentPoint.R1,
        monomerConnectTo.attachmentPoint,
      );
      const bondLocator = getBondLocator(page, {});
      expect(await bondLocator.count()).toEqual(1);
    });
  }
}

for (const monomerToCreate of monomersToCreate) {
  for (const monomerConnectTo of monomersConnectTo) {
    test(`58.2 Check that created ${monomerToCreate.description} can be connected to ${monomerConnectTo.description} in Macro mode from library by center to center in Macro mode (Snake)`, async () => {
      /*
       * Test task: https://github.com/epam/ketcher/issues/7657
       * Description: Check that created ${monomerToCreate.description} can be connected to ${monomerConnectTo.description} in Macro mode
       *              from library by center to center in Macro mode (Snake)
       *
       * Case:
       *      1. Open Molecules canvas
       *      2. Load molecule on canvas
       *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
       *      4. Create monomer with given attributes
       *      5. Select and delete atom outside monomer
       *      6. Switch to Macro mode - Snake layout
       *      7. Drag and drop ${monomerConnectTo.description} monomer from library to the canvas
       *      8. Connect both monomers by center to center
       *      9. Validate that connection is created correctly
       *
       * Version 3.7
       */
      await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
      if (await Library(page).isMonomerExist(monomerToCreate.libraryCard)) {
        await Library(page).dragMonomerOnCanvas(monomerToCreate.libraryCard, {
          x: 0,
          y: 0,
          fromCenter: true,
        });
      } else {
        await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
        await pasteFromClipboardAndOpenAsNewProject(page, 'CCC');
        await prepareMoleculeForMonomerCreation(page, ['0']);

        await createMonomer(page, {
          ...monomerToCreate,
        });
        await getAtomLocator(page, { atomId: 0 }).click();
        await CommonLeftToolbar(page).erase();
      }

      await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
      await MacromoleculesTopToolbar(page).selectLayoutModeTool(
        LayoutMode.Snake,
      );
      const monomerOnMacro = getMonomerLocator(page, {
        monomerAlias: monomerToCreate.symbol,
      });
      await Library(page).dragMonomerOnCanvas(monomerConnectTo.monomer, {
        x: 100,
        y: 100,
      });
      const monomerConnectToOnMacro = getMonomerLocator(
        page,
        monomerConnectTo.monomer,
      );
      await bondTwoMonomers(
        page,
        monomerOnMacro,
        monomerConnectToOnMacro,
        AttachmentPoint.R1,
        monomerConnectTo.attachmentPoint,
      );
      const bondLocator = getBondLocator(page, {});
      expect(await bondLocator.count()).toEqual(1);
    });
  }
}
