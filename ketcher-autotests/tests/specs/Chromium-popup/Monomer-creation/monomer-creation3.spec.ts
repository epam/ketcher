/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable max-len */
/* eslint-disable no-magic-numbers */
import { Page, expect } from '@playwright/test';
import { test } from '@fixtures';
import { pasteFromClipboardAndOpenAsNewProject } from '@utils/files/readFile';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import {
  selectAllStructuresOnCanvas,
  takeEditorScreenshot,
  takeElementScreenshot,
} from '@utils/canvas';
import { clickOnCanvas, dragMouseTo } from '@utils/index';
import {
  CreateMonomerDialog,
  prepareMoleculeForMonomerCreation,
} from '@tests/pages/molecules/canvas/CreateMonomerDialog';
import { setSettingsOption } from '@tests/pages/molecules/canvas/SettingsDialog';
import {
  AtomsSetting,
  OptionsForDebuggingSetting,
} from '@tests/pages/constants/settingsDialog/Constants';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { getAtomLocator } from '@utils/canvas/atoms/getAtomLocator/getAtomLocator';
import { ConnectionPointOption } from '@tests/pages/constants/contextMenu/Constants';
import { ContextMenu } from '@tests/pages/common/ContextMenu';
import { AttachmentPoint } from '@utils/macromolecules/monomer';
import { MonomerType } from '@tests/pages/constants/createMonomerDialog/Constants';

let page: Page;
test.beforeAll(async ({ initMoleculesCanvas }) => {
  page = await initMoleculesCanvas();
});
test.afterAll(async ({ closePage }) => {
  await closePage();
});
test.beforeEach(async ({ MoleculesCanvas: _ }) => {});

interface IMoleculesForMonomerCreation {
  testDescription: string;
  loadString: string;
  // Set shouldFail to true if you expect test to fail because of existed bug and put issues link to issueNumber
  shouldFail?: boolean;
  // issueNumber is mandatory if shouldFail === true
  issueNumber?: string;
  // set pageReloadNeeded to true if you need to restart ketcher before test (f.ex. to restart font renderer)
  pageReloadNeeded?: boolean;
}

const eligableForMonomerCreation: IMoleculesForMonomerCreation[] = [
  {
    testDescription: '1. Single bond and single bond to LGA',
    loadString: 'CCC',
  },
  {
    testDescription: '2. Double bond and single bond to LGA',
    loadString: 'C=CC',
  },
  {
    testDescription: '3. Triple bond and single bond to LGA',
    loadString: 'C#CC',
  },
  {
    testDescription: '4. Any bond and single bond to LGA',
    loadString:
      'VmpDRDAxMDAEAwIBAAAAAAAAAAAAAAAAAAAAAAUIBAAAAB4AGggCAAMAGwgCAAQAAAEkAAAAAgACAOn9BQBBcmlhbAMA6f0PAFRpbWVzIE5ldyBSb21hbgADMgAIAP///////wAAAAAAAP//AAAAAP////8AAAAA//8AAAAA/////wAAAAD/////AAD//wGAAAAAABAIAgABAA8IAgABAAQCEAAAoO8A7OTdAACg4AAU2xEBA4AEAAAABIAFAAAAAAIIAAAAAAAAAAAAAAAEgAYAAAAAAggAAAAPABP7GQAAAASABwAAAAACCAAAAAAAJ/YzAAAABYAIAAAABAYEAAUAAAAFBgQABgAAAAAGAgD//wAABYAJAAAABAYEAAYAAAAFBgQABwAAAAAAAAAAAAAAAAA=',
  },
  {
    testDescription: '5. Aromatic bond and single bond to LGA',
    loadString: 'c:cC',
  },
  {
    testDescription: '6. Single/Double bond and single bond to LGA',
    loadString: '[#6]!:;-,=[#6]-[#6]',
  },
  {
    testDescription: '7. Single/Aromatic bond and single bond to LGA',
    loadString: '[#6][#6]-[#6]',
  },
  {
    testDescription: '8. Double/Aromatic bond and single bond to LGA',
    loadString: '[#6]=,:[#6]-[#6]',
  },
  {
    testDescription: '9. Dative bond and single bond to LGA',
    loadString:
      'VmpDRDAxMDAEAwIBAAAAAAAAAAAAAAAAAAAAAAUIBAAAAB4AGggCAAMAGwgCAAQAAAEkAAAAAgACAOn9BQBBcmlhbAMA6f0PAFRpbWVzIE5ldyBSb21hbgADMgAIAP///////wAAAAAAAP//AAAAAP////8AAAAA//8AAAAA/////wAAAAD/////AAD//wGAAAAAABAIAgABAA8IAgABAAQCEAAAoHEA7KTzAACgYgASmycBA4AEAAAABIAFAAAAAAIIAAAAAAAAAAAAAAAEgAYAAAAAAggAAAAPABT7GQAAAASABwAAAAACCAAAAAAAJvYzAAAABYAIAAAABAYEAAYAAAAFBgQABwAAAAAABYAJAAAABAYEAAYAAAAFBgQABQAAAAAGAgAAEAAAAAAAAAAAAAA=',
  },
  {
    testDescription: '10. Hydrogen bond and single bond to LGA',
    loadString:
      'VmpDRDAxMDAEAwIBAAAAAAAAAAAAAAAAAAAAAAUIBAAAAB4AGggCAAMAGwgCAAQAAAEkAAAAAgACAOn9BQBBcmlhbAMA6f0PAFRpbWVzIE5ldyBSb21hbgADMgAIAP///////wAAAAAAAP//AAAAAP////8AAAAA//8AAAAA/////wAAAAD/////AAD//wGAAAAAABAIAgABAA8IAgABAAQCEAAAoHEA7KTzAACgYgASmycBA4AEAAAABIAFAAAAAAIIAAAAAAAAAAAAAAAEgAYAAAAAAggAAAAPABT7GQAAAASABwAAAAACCAAAAAAAJvYzAAAABYAIAAAABAYEAAYAAAAFBgQABwAAAAAABYAJAAAABAYEAAYAAAAFBgQABQAAAAAGAgAAEAAAAAAAAAAAAAA=',
  },
  {
    testDescription: '11. Single Up bond and single bond to LGA',
    loadString: '[#6]/[#6]-[#6]',
  },
  {
    testDescription: '12. Single Down bond and single bond to LGA',
    loadString: '[#6][#6]-[#6]',
  },
  {
    testDescription: '13. Single Up/Down bond and single bond to LGA',
    loadString:
      'VmpDRDAxMDAEAwIBAAAAAAAAAAAAAAAAAAAAAAUIBAAAAB4AGggCAAMAGwgCAAQAAAEkAAAAAgACAOn9BQBBcmlhbAMA6f0PAFRpbWVzIE5ldyBSb21hbgADMgAIAP///////wAAAAAAAP//AAAAAP////8AAAAA//8AAAAA/////wAAAAD/////AAD//wGAAAAAABAIAgABAA8IAgABAAQCEAAAoHEA7KTzAACgYgASmycBA4AEAAAABIAFAAAAAAIIAAAAAAAAAAAAAAAEgAYAAAAAAggAAAAPABT7GQAAAASABwAAAAACCAAAAAAAJvYzAAAABYAIAAAABAYEAAYAAAAFBgQABwAAAAAABYAJAAAABAYEAAYAAAAFBgQABQAAAAAGAgAAEAAAAAAAAAAAAAA=',
  },
  {
    testDescription: '14. Double CIS/Trans bond and single bond to LGA',
    loadString:
      'VmpDRDAxMDAEAwIBAAAAAAAAAAAAAAAAAAAAAAUIBAAAAB4AGggCAAMAGwgCAAQAAAEkAAAAAgACAOn9BQBBcmlhbAMA6f0PAFRpbWVzIE5ldyBSb21hbgADMgAIAP///////wAAAAAAAP//AAAAAP////8AAAAA//8AAAAA/////wAAAAD/////AAD//wGAAAAAABAIAgABAA8IAgABAAQCEAAAoHEA7KTzAACgYgASmycBA4AEAAAABIAFAAAAAAIIAAAAAAAAAAAAAAAEgAYAAAAAAggAAAAPABT7GQAwBAEABzEEEAAFAAAABwAAAAUAAAAFAAAARgQBAAIAAASABwAAAAACCAAAAAAAJvYzAAAABYAIAAAABAYEAAYAAAAFBgQABwAAAAAABYAJAAAABAYEAAYAAAAFBgQABQAAAAAGAgACAAEGAgAIAAAAB4AAAAAABAIQAAAAAAAm9jMAAAAAACb2MwAACgIABwAHCgIACwA9CgIAAAAGgAAAAAAAAggAAAAAACb2MwABBwEAAQgHAQAAAAcSAAEAAAADAGAAyAAAAENoaXJhbAAAAAAAAAAAAAAAAA==',
  },
  {
    testDescription: '15. Single bond connected to R-Group',
    loadString: '[#6]%91.[*:1]-%91',
  },
  {
    testDescription: '16. Double bond connected to R-Group',
    loadString: '[#6]%91.[*:1]=%91',
  },
  {
    testDescription: '17. Triple bond connected to R-Group',
    loadString: '[#6]%91.[*:1]#%91',
  },
  {
    testDescription: '18. Any bond connected to R-Group',
    loadString:
      'VmpDRDAxMDAEAwIBAAAAAAAAAAAAAAAAAAAAAAUIBAAAAB4AGggCAAMAGwgCAAQAAAEkAAAAAgACAOn9BQBBcmlhbAMA6f0PAFRpbWVzIE5ldyBSb21hbgADMgAIAP///////wAAAAAAAP//AAAAAP////8AAAAA//8AAAAA/////wAAAAD/////AAD//wGAAAAAABAIAgABAA8IAgABAAQCEAD/338AAKANAf/ffwAAoCsBA4AEAAAABIAFAAAAAAIIAAAAAAAAAAAAAAAEgAYAAAAABAIABwAzBAMAAABBAAIIAAAAAAAAAB4ABoAAAAAAAAIIAAAAAAAAAB4AIwgBAAAABw4AAQAAAAMAYADIAAAAUjEAAAAABYAHAAAABAYEAAYAAAAFBgQABQAAAAAGAgD//wAAAAAAAAAAAAA=',
  },
  {
    testDescription: '19. Aromatic bond connected to R-Group',
    loadString: '[#6]%91.[*:1]:%91',
  },
  {
    testDescription: '20. Single/Double connected to R-Group',
    loadString: '[#6]%91.[*:1]!:;-,=%91',
  },
  {
    testDescription: '21. Single/Aromatic bond connected to R-Group',
    loadString: '[#6]%91.[*:1]%91',
  },
  {
    testDescription: '22. Double/Aromatic bond connected to R-Group',
    loadString: '[#6]%91.[*:1]=,:%91',
  },
  {
    testDescription: '23. Dative bond connected to R-Group',
    loadString:
      'VmpDRDAxMDAEAwIBAAAAAAAAAAAAAAAAAAAAAAUIBAAAAB4AGggCAAMAGwgCAAQAAAEkAAAAAgACAOn9BQBBcmlhbAMA6f0PAFRpbWVzIE5ldyBSb21hbgADMgAIAP///////wAAAAAAAP//AAAAAP////8AAAAA//8AAAAA/////wAAAAD/////AAD//wGAAAAAABAIAgABAA8IAgABAAQCEAAAoIYAAGARAQCghgAAYC8BA4AEAAAABIAFAAAAAAIIAAAAAAAAAAAAAAAEgAYAAAAABAIABwAzBAMAAABBAAIIAAAAAAAAAB4ABoAAAAAAAAIIAAAAAAAAAB4AIwgBAAAABw4AAQAAAAMAYADIAAAAUjEAAAAABYAHAAAABAYEAAYAAAAFBgQABQAAAAAGAgAAEAAAAAAAAAAAAAA=',
  },
  {
    testDescription: '24. Hydrogen bond connected to R-Group',
    loadString:
      'VmpDRDAxMDAEAwIBAAAAAAAAAAAAAAAAAAAAAAUIBAAAAB4AGggCAAMAGwgCAAQAAAEkAAAAAgACAOn9BQBBcmlhbAMA6f0PAFRpbWVzIE5ldyBSb21hbgADMgAIAP///////wAAAAAAAP//AAAAAP////8AAAAA//8AAAAA/////wAAAAD/////AAD//wGAAAAAABAIAgABAA8IAgABAAQCEAAAoIYAAGARAQCghgAAYC8BA4AEAAAABIAFAAAAAAIIAAAAAAAAAAAAAAAEgAYAAAAABAIABwAzBAMAAABBAAIIAAAAAAAAAB4ABoAAAAAAAAIIAAAAAAAAAB4AIwgBAAAABw4AAQAAAAMAYADIAAAAUjEAAAAABYAHAAAABAYEAAYAAAAFBgQABQAAAAAGAgAAEAAAAAAAAAAAAAA=',
  },
  {
    testDescription: '25. Single Up bond connected to R-Group',
    loadString: '[#6]%91.[*:1]/%91',
  },
  {
    testDescription: '26. Single Down bond connected to R-Group',
    loadString: '[#6]%91.[*:1]%91',
  },
  {
    testDescription: '27. Single Up/Down bond connected to R-Group',
    loadString:
      'VmpDRDAxMDAEAwIBAAAAAAAAAAAAAAAAAAAAAAUIBAAAAB4AGggCAAMAGwgCAAQAAAEkAAAAAgACAOn9BQBBcmlhbAMA6f0PAFRpbWVzIE5ldyBSb21hbgADMgAIAP///////wAAAAAAAP//AAAAAP////8AAAAA//8AAAAA/////wAAAAD/////AAD//wGAAAAAABAIAgABAA8IAgABAAQCEAAA4I4AAGAjAQDgjgAAYEEBA4AEAAAABIAFAAAAAAQCAAcAMwQDAAAAQQACCAAAAAAAAAAeAAaAAAAAAAACCAAAAAAAAAAeACMIAQAAAAcOAAEAAAADAGAAyAAAAFIxAAAAAASABgAAAAACCAAAAAAAAAAAAAAABYAHAAAABAYEAAUAAAAFBgQABgAAAAEGAgAIAAAAAAAAAAAAAAA=',
  },
  {
    testDescription: '28. Double CIS/Trans bond connected to R-Group',
    loadString:
      'VmpDRDAxMDAEAwIBAAAAAAAAAAAAAAAAAAAAAAUIBAAAAB4AGggCAAMAGwgCAAQAAAEkAAAAAgACAOn9BQBBcmlhbAMA6f0PAFRpbWVzIE5ldyBSb21hbgADMgAIAP///////wAAAAAAAP//AAAAAP////8AAAAA//8AAAAA/////wAAAAD/////AAD//wGAAAAAABAIAgABAA8IAgABAAQCEAAA4I4AAGAjAQDgjgAAYEEBA4AEAAAABIAFAAAAAAQCAAcAMwQDAAAAQQACCAAAAAAAAAAeAAaAAAAAAAACCAAAAAAAAAAeACMIAQAAAAcOAAEAAAADAGAAyAAAAFIxAAAAAASABgAAAAACCAAAAAAAAAAAAAAABYAHAAAABAYEAAUAAAAFBgQABgAAAAAGAgACAAEGAgAIAAAAAAAAAAAAAAA=',
  },
  {
    testDescription: '29. Molecule with eight R-Groups on terminal positions',
    loadString:
      'C1%91C%92C%93C%94C%95C%96C%97C%981.[*:2]%97.[*:3]%96.[*:4]%95.[*:5]%94.[*:6]%93.[*:7]%92.[*:8]%91.[*:1]%98 |$;;;;;;;;_R2;_R3;_R4;_R5;_R6;_R7;_R8;_R1$|',
  },
];

for (const monomerToCreate of eligableForMonomerCreation) {
  test(`1. Check it is possible to create monomer for ${monomerToCreate.testDescription}`, async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/7948
     * Description: 1. Check that the selected structure doesn't have to have simple-single bonds to non-selected
     *                 parts of the structure, if it contains at least one potential leaving group atom
     *              2. Check that the selected structure doesn't have to have simple-single bonds to non-selected
     *                 parts of the structure, if it contains at least one R-group
     *              3. Check that the selected structure can contain R-groups (R-group labels), but only at terminal
     *                 positions connected via a simple single bond (one R-group can be connected only to one atom
     *                 taking into account both selected and non-selected parts of the structure)
     *              4. Check that the number of simple-single bonds to non-selected parts of the structure + the
     *                 number of R-groups cannot be more than 8 (not more than 8)
     *
     * Case:
     *      1. Open Molecules canvas
     *      2. Load molecule on canvas
     *      3. Validate that Create Monomer button is enabled
     *
     * Version 3.8
     */
    await pasteFromClipboardAndOpenAsNewProject(
      page,
      monomerToCreate.loadString,
    );
    await clickOnCanvas(page, 0, 0);
    await selectAllStructuresOnCanvas(page);
    expect(LeftToolbar(page).createMonomerButton).toBeEnabled();
  });
}

const notEligableForMonomerCreation1: IMoleculesForMonomerCreation[] = [
  {
    testDescription: '1. Cycle with no single bonds to LGA',
    loadString: 'C1CCCCCCC1',
  },
  {
    testDescription: '2. R-Groups not at terminal positions',
    loadString:
      '[*:3]%87%88.[*:2]%89%87.[*:1]%87%89.[*:6]%89%87.[*:5]%87%89.[*:4]%88%87 |$_R3;_R2;_R1;_R6;_R5;_R4$|',
  },
  {
    testDescription:
      '3. R-Groups not at terminal position poisons entire molecule',
    loadString: 'C%91CC%92CC%93.[*:2]%91%93.[*:1]%92 |$;;;;;_R2;_R1$|',
  },
  {
    testDescription:
      '4. Number of R-Groups exceeds number of possible attachment points (8)',
    loadString:
      'C1(C%85%86)C(C%87%88)C%89C(C%90%91)C(C%92%93)C(C%94%95)C%96C1C%97%98.[*:14]%96.[*:7]%89.[*:13]%97.[*:12]%98.[*:6]%90.[*:5]%91.[*:4]%92.[*:3]%93.[*:2]%94.[*:1]%95.[*:11]%85.[*:10]%86.[*:9]%87.[*:8]%88 |$;;;;;;;;;;;;;;_R14;_R7;_R13;_R12;_R6;_R5;_R4;_R3;_R2;_R1;_R11;_R10;_R9;_R8$|',
  },
];
const notEligableForMonomerCreation2: IMoleculesForMonomerCreation[] = [
  {
    testDescription: '2. Double bond with no potential LGA',
    loadString: 'C=C',
  },
  {
    testDescription: '3. Triple bond with no potential LGA',
    loadString: 'C#C',
  },
  {
    testDescription: '4. Any bond with no potential LGA',
    loadString:
      'VmpDRDAxMDAEAwIBAAAAAAAAAAAAAAAAAAAAAAUIBAAAAB4AGggCAAMAGwgCAAQAAAEkAAAAAgACAOn9BQBBcmlhbAMA6f0PAFRpbWVzIE5ldyBSb21hbgADMgAIAP///////wAAAAAAAP//AAAAAP////8AAAAA//8AAAAA/////wAAAAD/////AAD//wGAAAAAABAIAgABAA8IAgABAAQCEAAAMOEApnP2AAAw4QCmcxQBA4AEAAAABIAFAAAAAAIIAAAAAAAAAAAAAAAEgAYAAAAAAggAAAAAAAAAHgAAAAWABwAAAAQGBAAFAAAABQYEAAYAAAAABgIA//8AAAAAAAAAAAAA',
  },
  {
    testDescription: '5. Aromatic bond with no potential LGA',
    loadString: 'c:c',
  },
  {
    testDescription: '6. Single/Double bond with no potential LGA',
    loadString: '[#6]!:;-,=[#6]',
  },
  {
    testDescription: '7. Single/Aromatic bond with no potential LGA',
    loadString: '[#6][#6]',
  },
  {
    testDescription: '8. Double/Aromatic bond with no potential LGA',
    loadString: '[#6]=,:[#6]',
  },
  {
    testDescription: '9. Dative bond with no potential LGA',
    loadString:
      'VmpDRDAxMDAEAwIBAAAAAAAAAAAAAAAAAAAAAAUIBAAAAB4AGggCAAMAGwgCAAQAAAEkAAAAAgACAOn9BQBBcmlhbAMA6f0PAFRpbWVzIE5ldyBSb21hbgADMgAIAP///////wAAAAAAAP//AAAAAP////8AAAAA//8AAAAA/////wAAAAD/////AAD//wGAAAAAABAIAgABAA8IAgABAAQCEAAAYN4AAKDmAABg3gAAoAQBA4AEAAAABIAFAAAAAAIIAAAAAAAAAAAAAAAEgAYAAAAAAggAAAAAAAAAHgAAAAWABwAAAAQGBAAFAAAABQYEAAYAAAAABgIAABAAAAAAAAAAAAAA',
  },
  {
    testDescription: '10. Hydrogen bond with no potential LGA',
    loadString:
      'VmpDRDAxMDAEAwIBAAAAAAAAAAAAAAAAAAAAAAUIBAAAAB4AGggCAAMAGwgCAAQAAAEkAAAAAgACAOn9BQBBcmlhbAMA6f0PAFRpbWVzIE5ldyBSb21hbgADMgAIAP///////wAAAAAAAP//AAAAAP////8AAAAA//8AAAAA/////wAAAAD/////AAD//wGAAAAAABAIAgABAA8IAgABAAQCEAAAYN4AAKDmAABg3gAAoAQBA4AEAAAABIAFAAAAAAIIAAAAAAAAAAAAAAAEgAYAAAAAAggAAAAAAAAAHgAAAAWABwAAAAQGBAAFAAAABQYEAAYAAAAABgIAAEAAAAAAAAAAAAAA',
  },
  {
    testDescription: '11. Single Up bond with no potential LGA',
    loadString: '[#6]/[#6]',
  },
  {
    testDescription: '12. Single Down bond with no potential LGA',
    loadString: '[#6][#6]',
  },
  {
    testDescription: '13. Single Up/Down bond with no potential LGA',
    loadString:
      'VmpDRDAxMDAEAwIBAAAAAAAAAAAAAAAAAAAAAAUIBAAAAB4AGggCAAMAGwgCAAQAAAEkAAAAAgACAOn9BQBBcmlhbAMA6f0PAFRpbWVzIE5ldyBSb21hbgADMgAIAP///////wAAAAAAAP//AAAAAP////8AAAAA//8AAAAA/////wAAAAD/////AAD//wGAAAAAABAIAgABAA8IAgABAAQCEAAAYN4AAKDmAABg3gAAoAQBA4AEAAAABIAFAAAAAAIIAAAAAAAAAAAAAAAEgAYAAAAAAggAAAAAAAAAHgAAAAWABwAAAAQGBAAFAAAABQYEAAYAAAABBgIACAAAAAAAAAAAAAAA',
  },
  {
    testDescription: '14. CIS/Trans bond with no potential LGA',
    loadString:
      'VmpDRDAxMDAEAwIBAAAAAAAAAAAAAAAAAAAAAAUIBAAAAB4AGggCAAMAGwgCAAQAAAEkAAAAAgACAOn9BQBBcmlhbAMA6f0PAFRpbWVzIE5ldyBSb21hbgADMgAIAP///////wAAAAAAAP//AAAAAP////8AAAAA//8AAAAA/////wAAAAD/////AAD//wGAAAAAABAIAgABAA8IAgABAAQCEAAAYMwAAKDUAABgzAD/n/IAA4AEAAAABIAFAAAAAAIIAAAAAAAAAAAAAAAEgAYAAAAAAggAAAAAAP//HQAAAAWABwAAAAQGBAAFAAAABQYEAAYAAAAABgIAAgABBgIACAAAAAAAAAAAAAAA',
  },
];

for (const monomerToCreate of notEligableForMonomerCreation1) {
  test(`2.1 Check it is not possible to create monomer for ${monomerToCreate.testDescription}`, async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/7948
     * Description: 1. Check that the selected structure if it not contains at least one R-group or LGA not activate monomer wizard button
     *              2. Check that the selected structure if it contains R-groups (R-group labels), but they are not at terminal
     *              3. Number of R-Groups exceeds number of possible attachment points (8)
     *
     * Case:
     *      1. Open Molecules canvas
     *      2. Load molecule on canvas
     *      3. Select whole molecule
     *      3. Validate that Create Monomer button is disabled
     *
     * Version 3.8
     */
    await pasteFromClipboardAndOpenAsNewProject(
      page,
      monomerToCreate.loadString,
    );
    await clickOnCanvas(page, 0, 0);
    await selectAllStructuresOnCanvas(page);
    expect(LeftToolbar(page).createMonomerButton).toBeDisabled();
  });
}

for (const monomerToCreate of notEligableForMonomerCreation2) {
  test(`2.2 Check it is not possible to create monomer for ${monomerToCreate.testDescription}`, async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/7948
     * Description: Check that the selected structure if it not contains at least one R-group or LGA not activate monomer wizard button
     *
     * Case:
     *      1. Open Molecules canvas
     *      2. Load molecule on canvas
     *      3. Select whole molecule
     *      3. Validate that Create Monomer button is disabled
     *
     * Version 3.8
     */
    await pasteFromClipboardAndOpenAsNewProject(
      page,
      monomerToCreate.loadString,
    );
    await clickOnCanvas(page, 0, 0);
    await selectAllStructuresOnCanvas(page);
    expect(LeftToolbar(page).createMonomerButton).toBeDisabled();
  });
}

test(`3. Check that the number of simple-single bonds to non-selected parts of the structure + the number of R-groups cannot be more than 8`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7657
   * Description: Check that the number of simple-single bonds to non-selected parts of the
   *              structure + the number of R-groups cannot be more than 8
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
   *      4. Validate that Create Monomer button is disabled
   *
   * Version 3.8
   */

  await pasteFromClipboardAndOpenAsNewProject(
    page,
    'CC(C(C)C(C)C(C)C(C)C(C)C(C)C(C)C)C',
  );
  await prepareMoleculeForMonomerCreation(page, [
    '0',
    '5',
    '3',
    '9',
    '7',
    '11',
    '13',
    '15',
    '16',
    '17',
  ]);
  expect(LeftToolbar(page).createMonomerButton).toBeDisabled();
});

test(`4. Check that every R-group gets replaced with a hydrogen upon entering the wizard, and it is considered a leaving group for an attachment point. The atom it was attached to becomes the attachment atom.
`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7657
   * Description: 1. Check that every R-group gets replaced with a hydrogen upon entering the wizard, and it is considered
   *                 a leaving group for an attachment point. The atom it was attached to becomes the attachment atom.
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
   *      4. Press Create Monomer button
   *      5. Take screenshot to validate that R-groups replaced with Hydrogens
   *
   * Version 3.8
   */

  await pasteFromClipboardAndOpenAsNewProject(
    page,
    'C1%91C%92C%93C%94C%95C%96C%97C%981.[*:2]%97.[*:3]%96.[*:4]%95.[*:5]%94.[*:6]%93.[*:7]%92.[*:8]%91.[*:1]%98 |$;;;;;;;;_R2;_R3;_R4;_R5;_R6;_R7;_R8;_R1$|',
  );
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);
  await LeftToolbar(page).createMonomer();

  // to make molecule visible
  await CommonLeftToolbar(page).handTool();
  await page.mouse.move(600, 200);
  await dragMouseTo(500, 250, page);

  await takeEditorScreenshot(page);
  await CreateMonomerDialog(page).discard();
});

test(`5. Check that if the structure contains one and only one R1 group, that R1 is replaced with a hydrogen that becomes a leaving group of AP R1, the atom that R1 was attached to becomes the attachment atom of AP R1
`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7657
   * Description: Check that if the structure contains one and only one R1 group, that R1 is replaced with a hydrogen
   *              that becomes a leaving group of AP R1, the atom that R1 was attached to becomes the attachment atom of AP R1
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
   *      4. Press Create Monomer button
   *      5. Take screenshot to validate that R-group replaced with Hydrogen, the atom that R1 was attached to becomes the attachment atom of AP R1
   *
   * Version 3.8
   */

  await pasteFromClipboardAndOpenAsNewProject(
    page,
    'C1(C)C%91C(C)C(C)C(C)C(C)C(C)C1C.[*:1]%91 |$;;;;;;;;;;;;;;;_R1$|',
  );
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);
  await LeftToolbar(page).createMonomer();

  // to make molecule visible
  await CommonLeftToolbar(page).handTool();
  await page.mouse.move(600, 200);
  await dragMouseTo(500, 250, page);

  await takeEditorScreenshot(page);
  await CreateMonomerDialog(page).discard();
});

test(`6. Check that if the structure contains one and only one R2 group, that R2 is replaced with a hydrogen that becomes a leaving group of AP R2, the atom that R2 was attached to becomes the attachment atom of AP R2
`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7657
   * Description: Check that if the structure contains one and only one R2 group, that R2 is replaced with a hydrogen
   *              that becomes a leaving group of AP R2, the atom that R2 was attached to becomes the attachment atom of AP R2
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
   *      4. Press Create Monomer button
   *      5. Take screenshot to validate that R-group replaced with Hydrogen, the atom that R2 was attached to becomes the attachment atom of AP R2
   *
   * Version 3.8
   */

  await pasteFromClipboardAndOpenAsNewProject(
    page,
    'C1(C)C%91C(C)C(C)C(C)C(C)C(C)C1C.[*:1]%91 |$;;;;;;;;;;;;;;;_R2$|',
  );
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);
  await LeftToolbar(page).createMonomer();

  // to make molecule visible
  await CommonLeftToolbar(page).handTool();
  await page.mouse.move(600, 200);
  await dragMouseTo(500, 250, page);

  await takeEditorScreenshot(page);
  await CreateMonomerDialog(page).discard();
});

test(`7. Check that in case of multiple R1 the one whose attachment atom is the first in the KET file gets interpreted as R1`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7657
   * Description: Check that in case of multiple R1 the one whose attachment atom is the first in the KET file gets interpreted as R1
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
   *      4. Press Create Monomer button
   *      5. Take screenshot to validate that the correct R-group replaced with Hydrogen, the atom that R1 was attached to becomes the attachment atom of AP R1
   *
   * Version 3.8
   */
  await setSettingsOption(page, OptionsForDebuggingSetting.ShowAtomIds);
  await pasteFromClipboardAndOpenAsNewProject(
    page,
    'C1%91C(C)C(C)C(C)C%92C(C)C(C)C1C.[*:1]%92.[*:1]%91 |$;;;;;;;;;;;;;;_R1;_R1$|',
  );
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);
  await LeftToolbar(page).createMonomer();

  // to make molecule visible
  await CommonLeftToolbar(page).handTool();
  await page.mouse.move(600, 200);
  await dragMouseTo(500, 250, page);

  await takeEditorScreenshot(page);
  await CreateMonomerDialog(page).discard();
});

test(`8. Check that in case of multiple R1 the one whose attachment atom is the first in the KET file gets interpreted as R2`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7657
   * Description: Check that in case of multiple R1 the one whose attachment atom is the first in the KET file gets interpreted as R2
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
   *      4. Press Create Monomer button
   *      5. Take screenshot to validate that the correct R-group replaced with Hydrogen, the atom that R2 was attached to becomes the attachment atom of AP R2
   *
   * Version 3.8
   */
  await setSettingsOption(page, OptionsForDebuggingSetting.ShowAtomIds);
  await pasteFromClipboardAndOpenAsNewProject(
    page,
    'C1%91C(C)C(C)C(C)C%92C(C)C(C)C1C.[*:1]%92.[*:1]%91 |$;;;;;;;;;;;;;;_R2;_R2$|',
  );
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);
  await LeftToolbar(page).createMonomer();

  // to make molecule visible
  await CommonLeftToolbar(page).handTool();
  await page.mouse.move(600, 200);
  await dragMouseTo(500, 250, page);

  await takeEditorScreenshot(page);
  await CreateMonomerDialog(page).discard();
});

test(`9. Check that if the structure contains one and only one Rn group (where 2<n<9), that Rn group should be interpreted as belonging to AP Rn if possible`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7657
   * Description: 1. Check that if the structure contains one and only one Rn group (where 2<n<9), that Rn
   *                 group should be interpreted as belonging to AP Rn if possible
   *              2. Check that for all other attachment points where the R-group number cannot be determined,
   *                 they are assigned to the smallest available Rn (n>2) if available, or to R1 if available,
   *                 or to R2 in the end, starting from the first attachment atom in the KET file
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
   *      4. Press Create Monomer button
   *      5. Take screenshot to validate that the R-group assigned to the correct AP
   *
   * Version 3.8
   */
  await pasteFromClipboardAndOpenAsNewProject(
    page,
    '[*:6]C%91C%92C%93C%94C%95C%96%97.[*:23]%96.[*:25]%92.[*:5]%93.[*:24]%94.[*:4]%95.[*:26]%91.[*:3]%97 |$_R6;;;;;;;_R23;_R25;_R5;_R24;_R4;_R26;_R3$|',
  );
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);
  await LeftToolbar(page).createMonomer();

  // to make molecule visible
  await CommonLeftToolbar(page).handTool();
  await page.mouse.move(600, 200);
  await dragMouseTo(450, 200, page);

  await takeEditorScreenshot(page);
  await CreateMonomerDialog(page).discard();
});

// test(`10. Check that for already set APs the user can change the R-group number by clicking on an LGA`, async () => {
//   /*
//    * Test task: https://github.com/epam/ketcher/issues/7657
//    * Description: 1. Check that for already set APs the user can change the R-group number by clicking on an LGA
//    *              2. Check that for already set APs the users can pick any R-number (R1, ... ,R8), and it obvious what numbers are already in use
//    *
//    * Case:
//    *      1. Open Molecules canvas
//    *      2. Load molecule on canvas
//    *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
//    *      4. Press Create Monomer button
//    *      5. Change R-group number for R1 and R2
//    *      6. Take screenshot to validate that the R-group assigned to the correct AP
//    *
//    * Version 3.8
//    */
//   await pasteFromClipboardAndOpenAsNewProject(
//     page,
//     '[*:1]CCCCCCC%91.[*:2]%91 |$_R1;;;;;;;;_R2$|',
//   );
//   await clickOnCanvas(page, 0, 0);
//   await selectAllStructuresOnCanvas(page);
//   await LeftToolbar(page).createMonomer();

//   // to make molecule visible
//   await CommonLeftToolbar(page).handTool();
//   await page.mouse.move(600, 200);
//   await dragMouseTo(600, 250, page);

//   const attachmentPointR1 = page.getByTestId(AttachmentPoint.R1).first();
//   const attachmentPointR3 = page.getByTestId(AttachmentPoint.R3).first();

//   await EditConnectionPointPopup(
//     page,
//     attachmentPointR1,
//   ).selectConnectionPointName(AttachmentPointName.R3);

//   await expect(attachmentPointR3).toHaveText('R3');

//   await CreateMonomerDialog(page).discard();
// });

// test(`11. Check that for already set APs the user can change the R-group number by r-clicking on an AA`, async () => {
//   /*
//    * Test task: https://github.com/epam/ketcher/issues/7657
//    * Description: Check that for already set APs the user can change the R-group number by r-clicking on an AA
//    *
//    * Case:
//    *      1. Open Molecules canvas
//    *      2. Load molecule on canvas
//    *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
//    *      4. Press Create Monomer button
//    *      5. Change R-group number for R1 and R2
//    *      6. Take screenshot to validate that the R-group assigned to the correct AP
//    *
//    * Version 3.8
//    */
//   await pasteFromClipboardAndOpenAsNewProject(
//     page,
//     '[*:1]CCCCCCC%91.[*:2]%91 |$_R1;;;;;;;;_R2$|',
//   );
//   await clickOnCanvas(page, 0, 0);
//   await selectAllStructuresOnCanvas(page);
//   await LeftToolbar(page).createMonomer();

//   // to make molecule visible
//   await CommonLeftToolbar(page).handTool();
//   await page.mouse.move(600, 200);
//   await dragMouseTo(600, 250, page);

//   const attachmentPointR1 = page.getByTestId(AttachmentPoint.R1).first();
//   await ContextMenu(page, attachmentPointR1).click(
//     ConnectionPointOption.EditConnectionPoint,
//   );

//   await EditConnectionPointPopup(page).selectConnectionPointName(
//     AttachmentPointName.R3,
//   );

//   const attachmentPointR3 = page.getByTestId(AttachmentPoint.R3).first();
//   await expect(attachmentPointR3).toHaveText('R3');

//   await CreateMonomerDialog(page).discard();
// });

test(`12. Check that for already set APs the user can Delete the AP by r-clicking on an AA`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7657
   * Description: Check that for already set APs the user can Delete the AP by r-clicking on an AA
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
   *      4. Press Create Monomer button
   *      5. Delete R1 via context menu
   *      6. Validate that the R1 is no longer on the canvas
   *
   * Version 3.8
   */
  await pasteFromClipboardAndOpenAsNewProject(
    page,
    '[*:1]CCCCCCC%91.[*:2]%91 |$_R1;;;;;;;;_R2$|',
  );
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);
  await LeftToolbar(page).createMonomer();

  // to make molecule visible
  await CommonLeftToolbar(page).handTool();
  await page.mouse.move(600, 200);
  await dragMouseTo(600, 250, page);

  const attachmentPointR1 = page.getByTestId(AttachmentPoint.R1).first();
  await ContextMenu(page, attachmentPointR1).click(
    ConnectionPointOption.RemoveAssignment,
  );

  await expect(attachmentPointR1).not.toBeVisible();

  await CreateMonomerDialog(page).discard();
});

test(`13. Check that users can set a new AP by selecting a potential AA, and R-number got assigned automatically`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7657
   * Description: Check that users can set a new AP by selecting a potential AA, and R-number got assigned automatically
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
   *      4. Press Create Monomer button
   *      5. Create new AP via context menu
   *      6. Validate that the R1 is appeared on the canvas
   *
   * Version 3.8
   */
  await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCCCCC');
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);
  await LeftToolbar(page).createMonomer();

  // to make molecule visible
  await CommonLeftToolbar(page).handTool();
  await page.mouse.move(600, 200);
  await dragMouseTo(600, 250, page);

  const attachmentAtom = getAtomLocator(page, { atomId: 0 });
  await ContextMenu(page, attachmentAtom).click(
    ConnectionPointOption.MarkAsLeavingGroup,
  );

  const attachmentPointR1 = page.getByTestId(AttachmentPoint.R1).first();
  await expect(attachmentPointR1).toBeVisible();

  await CreateMonomerDialog(page).discard();
});

test(`14. Check that after an AP is set, it shows up in the Attributes panel with its LGA and R-number`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7657
   * Description: Check that after an AP is set, it shows up in the Attributes panel with its LGA and R-number
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
   *      4. Press Create Monomer button
   *      5. Create new AP via context menu
   *      6. Validate that the R1 is appeared at Attributes panel
   *
   * Version 3.8
   */
  await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCCCCC');
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);
  await LeftToolbar(page).createMonomer();

  // to make molecule visible
  await CommonLeftToolbar(page).handTool();
  await page.mouse.move(600, 200);
  await dragMouseTo(600, 250, page);

  const attachmentAtom = getAtomLocator(page, { atomId: 0 });
  await ContextMenu(page, attachmentAtom).click(
    ConnectionPointOption.MarkAsConnectionPoint,
  );

  await expect(CreateMonomerDialog(page).r1NameCombobox).toBeVisible();
  await expect(CreateMonomerDialog(page).r1AtomCombobox).toBeVisible();
  await expect(CreateMonomerDialog(page).r1DeleteButton).toBeVisible();

  await CreateMonomerDialog(page).discard();
});

test(`15. Check that hovering over an already set AP on the canvas (over an AA), highlights the corresponding AP in the Attributes panel`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7657
   * Description: Check that hovering over an already set AP on the canvas (over an AA),
   *              highlights the corresponding AP in the Attributes panel
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
   *      4. Press Create Monomer button
   *      5. Create new AP via context menu
   *      6. Hover mouse over the AA
   *      7. Validate that the R1 is highlighted in the Attributes panel
   *
   * Version 3.8
   */
  await setSettingsOption(page, AtomsSetting.DisplayCarbonExplicitly);
  await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCCCCC');
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);
  await LeftToolbar(page).createMonomer();

  // to make molecule visible
  await CommonLeftToolbar(page).handTool();
  await page.mouse.move(600, 200);
  await dragMouseTo(600, 250, page);

  const attachmentAtom = getAtomLocator(page, { atomId: 0 });
  await ContextMenu(page, attachmentAtom).click(
    ConnectionPointOption.MarkAsConnectionPoint,
  );

  await attachmentAtom.hover();
  await takeElementScreenshot(page, CreateMonomerDialog(page).r1ControlGroup);

  await CreateMonomerDialog(page).discard();
});

test(`16. Check that hovering over an already set AP on the canvas (over an LGA), highlights the corresponding AP in the Attributes panel`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7657
   * Description: Check that hovering over an already set AP on the canvas (over an LGA),
   *              highlights the corresponding AP in the Attributes panel
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
   *      4. Press Create Monomer button
   *      5. Create new AP via context menu
   *      6. Hover mouse over the LGA
   *      7. Validate that the R1 is highlighted in the Attributes panel
   *
   * Version 3.8
   */
  await setSettingsOption(page, AtomsSetting.DisplayCarbonExplicitly);
  await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCCCCC');
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);
  await LeftToolbar(page).createMonomer();

  // to make molecule visible
  await CommonLeftToolbar(page).handTool();
  await page.mouse.move(600, 200);
  await dragMouseTo(600, 250, page);

  const attachmentAtom = getAtomLocator(page, { atomId: 0 });
  await ContextMenu(page, attachmentAtom).click(
    ConnectionPointOption.MarkAsConnectionPoint,
  );

  const leavingGroupAtom = getAtomLocator(page, { atomId: 9 });
  await leavingGroupAtom.hover();
  await takeElementScreenshot(page, CreateMonomerDialog(page).r1ControlGroup);

  await CreateMonomerDialog(page).discard();
});

test(`17. Check that hovering over an already set AP on the canvas (over the bond connecting them), highlights the corresponding AP in the Attributes panel`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7657
   * Description: Check that hovering over an already set AP on the canvas (over the bond connecting them),
   *              highlights the corresponding AP in the Attributes panel
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
   *      4. Press Create Monomer button
   *      5. Create new AP via context menu
   *      6. Validate that the R1 is highlighted in the Attributes panel
   *
   * Version 3.8
   */
  await setSettingsOption(page, AtomsSetting.DisplayCarbonExplicitly);
  await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCCCCC');
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);
  await LeftToolbar(page).createMonomer();

  // to make molecule visible
  await CommonLeftToolbar(page).handTool();
  await page.mouse.move(600, 200);
  await dragMouseTo(600, 250, page);

  const attachmentAtom = getAtomLocator(page, { atomId: 0 });
  await ContextMenu(page, attachmentAtom).click(
    ConnectionPointOption.MarkAsConnectionPoint,
  );

  const leavingGroupAtom = getAtomLocator(page, { atomId: 9 });
  await leavingGroupAtom.hover();
  await takeElementScreenshot(page, CreateMonomerDialog(page).r1ControlGroup);

  await CreateMonomerDialog(page).discard();
});

test(`18. Check that Symbol and Name fields are disabled when Type is not selected`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8045
   * Description: System should not allow to fill Symbol and Name fields if Type is not selected
   *              on Monomer creation wizard
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Select whole molecule and deselect atoms/bonds that not needed for monomer
   *      4. Press "Create Monomer" button
   *      5. Verify that Symbol and Name fields are disabled when Type is not selected
   *      6. Select a Type
   *      7. Verify that Symbol and Name fields are enabled
   *
   * Version 3.9
   */
  await pasteFromClipboardAndOpenAsNewProject(page, 'CCC');
  await prepareMoleculeForMonomerCreation(page, ['0']);

  await LeftToolbar(page).createMonomer();

  // Verify that Symbol and Name fields are disabled when Type is not selected
  await expect(CreateMonomerDialog(page).symbolEditbox).toBeDisabled();
  await expect(CreateMonomerDialog(page).nameEditbox).toBeDisabled();

  // Select a Type
  await CreateMonomerDialog(page).selectType(MonomerType.AminoAcid);

  // Verify that Symbol and Name fields are enabled after Type is selected
  await expect(CreateMonomerDialog(page).symbolEditbox).toBeEnabled();
  await expect(CreateMonomerDialog(page).nameEditbox).toBeEnabled();

  await CreateMonomerDialog(page).discard();
});
