/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable max-len */
/* eslint-disable no-magic-numbers */
import { Page, expect } from '@playwright/test';
import { test } from '@fixtures';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import { pasteFromClipboardAndOpenAsNewProject } from '@utils/files/readFile';
import { selectAllStructuresOnCanvas } from '@utils/canvas';
import { getAtomLocator } from '@utils/canvas/atoms/getAtomLocator/getAtomLocator';
import { getBondLocator } from '@utils/macromolecules/polymerBond';
import { clickOnCanvas } from '@utils/index';

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
