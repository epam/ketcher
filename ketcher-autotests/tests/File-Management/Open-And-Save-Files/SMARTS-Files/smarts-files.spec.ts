import { Page, test } from '@playwright/test';
import {
  takeEditorScreenshot,
  clickInTheMiddleOfTheScreen,
  waitForPageInit,
  pasteFromClipboardAndAddToCanvas,
  pasteFromClipboardAndOpenAsNewProject,
  openFileAndAddToCanvas,
  openFileAndAddToCanvasAsNewProject,
  waitForRender,
} from '@utils';
import {
  FileType,
  verifyFileExport,
} from '@utils/files/receiveFileComparisonData';

test.describe('Loading SMARTS files', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Loading SMARTS with custom query', async ({ page }) => {
    /*
    Test case: https://github.com/epam/Indigo/issues/1358
    Description: [!#6,!#7,!#8] should be loaded as custom query without any error
    */
    const smartsStringToPaste = '[!#6,!#7,!#8]';
    await pasteFromClipboardAndOpenAsNewProject(page, smartsStringToPaste);
    await takeEditorScreenshot(page);
  });

  test('Loading SMARTS with aromatic atom list', async ({ page }) => {
    /*
    Test case: https://github.com/epam/Indigo/issues/1332
    Description: c1-[#6]=[#6]-[#6]=[#6]-[c,n]=1 should be loaded as benzene with aromatic atom list (carbon and nitrogen)
    */
    const smartsStringToPaste = 'c1-[#6]=[#6]-[#6]=[#6]-[c,n]=1';
    await pasteFromClipboardAndAddToCanvas(page, smartsStringToPaste, false);
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });

  test('Validate that unsplit nucleotides connected with chems could be saved to SMARTS file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #4382
    Description: Validate that unsplit nucleotides connected with chems could be saved to SMARTS file and loaded back
    */

    await openFileAndAddToCanvas(
      'KET/unsplit-nucleotides-connected-with-chems.ket',
      page,
    );

    await verifyFileExport(
      page,
      'SMARTS/unsplit-nucleotides-connected-with-chems.smarts',
      FileType.SMARTS,
    );

    await openFileAndAddToCanvasAsNewProject(
      'SMARTS/unsplit-nucleotides-connected-with-chems.smarts',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that unsplit nucleotides connected with nucleotides could be saved to SMARTS file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #4382
    Description: Validate that unsplit nucleotides connected with nucleotides could be saved to SMARTS file and loaded back
    */

    await openFileAndAddToCanvas(
      'KET/unsplit-nucleotides-connected-with-nucleotides.ket',
      page,
    );

    await verifyFileExport(
      page,
      'SMARTS/unsplit-nucleotides-connected-with-nucleotides.smarts',
      FileType.SMARTS,
    );

    await openFileAndAddToCanvasAsNewProject(
      'SMARTS/unsplit-nucleotides-connected-with-nucleotides.smarts',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that unsplit nucleotides connected with bases could be saved to SMARTS file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #4382
    Description: Validate that unsplit nucleotides connected with bases could be saved to SMARTS file and loaded back
    */

    await openFileAndAddToCanvas(
      'KET/unsplit-nucleotides-connected-with-bases.ket',
      page,
    );

    await verifyFileExport(
      page,
      'SMARTS/unsplit-nucleotides-connected-with-bases.smarts',
      FileType.SMARTS,
    );

    await openFileAndAddToCanvasAsNewProject(
      'SMARTS/unsplit-nucleotides-connected-with-bases.smarts',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that unsplit nucleotides connected with sugars could be saved to SMARTS file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #4382
    Description: Validate that unsplit nucleotides connected with sugars could be saved to SMARTS file and loaded back
    */

    await openFileAndAddToCanvas(
      'KET/unsplit-nucleotides-connected-with-sugars.ket',
      page,
    );

    await verifyFileExport(
      page,
      'SMARTS/unsplit-nucleotides-connected-with-sugars.smarts',
      FileType.SMARTS,
    );

    await openFileAndAddToCanvasAsNewProject(
      'SMARTS/unsplit-nucleotides-connected-with-sugars.smarts',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that unsplit nucleotides connected with phosphates could be saved to SMARTS file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #4382
    Description: Validate that unsplit nucleotides connected with phosphates could be saved to SMARTS file and loaded back
    */

    await openFileAndAddToCanvas(
      'KET/unsplit-nucleotides-connected-with-phosphates.ket',
      page,
    );

    await verifyFileExport(
      page,
      'SMARTS/unsplit-nucleotides-connected-with-phosphates.smarts',
      FileType.SMARTS,
    );

    await openFileAndAddToCanvasAsNewProject(
      'SMARTS/unsplit-nucleotides-connected-with-phosphates.smarts',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that unsplit nucleotides connected with peptides could be saved to SMARTS file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #4382
    Description: Validate that unsplit nucleotides connected with peptides could be saved to SMARTS file and loaded back
    */

    await openFileAndAddToCanvas(
      'KET/unsplit-nucleotides-connected-with-peptides.ket',
      page,
    );

    await verifyFileExport(
      page,
      'SMARTS/unsplit-nucleotides-connected-with-peptides.smarts',
      FileType.SMARTS,
    );

    await openFileAndAddToCanvasAsNewProject(
      'SMARTS/unsplit-nucleotides-connected-with-peptides.smarts',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that the simple schema with retrosynthetic arrow could be saved to SMARTS file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #2071
    Description: Validate that the schema with retrosynthetic arrow could be saved to SMARTS file and loaded back
    */

    await openFileAndAddToCanvas(
      'KET/simple-schema-with-retrosynthetic-arrow.ket',
      page,
    );

    await verifyFileExport(
      page,
      'SMARTS/simple-schema-with-retrosynthetic-arrow.smarts',
      FileType.SMARTS,
    );

    await openFileAndAddToCanvasAsNewProject(
      'SMARTS/simple-schema-with-retrosynthetic-arrow.smarts',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test.fail(
    'Validate that the schema with retrosynthetic, angel arrows and plus could be saved to SMARTS file and loaded back',
    async ({ page }) => {
      /*
    Test case: #2071
    Description: Validate that the schema with retrosynthetic arrow could be saved to SMARTS file and loaded back
    We have a bug https://github.com/epam/Indigo/issues/2210
    */

      await openFileAndAddToCanvas(
        'KET/schema-with-retrosynthetic-angel-arrows-and-plus.ket',
        page,
      );

      await verifyFileExport(
        page,
        'SMARTS/schema-with-retrosynthetic-angel-arrows-and-plus.smarts',
        FileType.SMARTS,
      );

      await openFileAndAddToCanvasAsNewProject(
        'SMARTS/schema-with-retrosynthetic-angel-arrows-and-plus.smarts',
        page,
      );
      await takeEditorScreenshot(page);
    },
  );

  test('Validate that the schema with vertical retrosynthetic arrow could be saved to SMARTS file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #2071
    Description: Validate that the schema with retrosynthetic arrow could be saved to SMARTS file and loaded back
    */

    await openFileAndAddToCanvas(
      'KET/schema-with-vertical-retrosynthetic-arrow.ket',
      page,
    );

    await verifyFileExport(
      page,
      'SMARTS/schema-with-vertical-retrosynthetic-arrow.smarts',
      FileType.SMARTS,
    );

    await openFileAndAddToCanvasAsNewProject(
      'SMARTS/schema-with-vertical-retrosynthetic-arrow.smarts',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that the schema with two retrosynthetic arrows could be saved to SMARTS file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #2071
    Description: Validate that the schema with retrosynthetic arrow could be saved to SMARTS file and loaded back
    */

    await openFileAndAddToCanvas(
      'KET/schema-with-two-retrosynthetic-arrows.ket',
      page,
    );

    await verifyFileExport(
      page,
      'SMARTS/schema-with-two-retrosynthetic-arrows.smarts',
      FileType.SMARTS,
    );

    await openFileAndAddToCanvasAsNewProject(
      'SMARTS/schema-with-two-retrosynthetic-arrows.smarts',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that the schema with diagonaly retrosynthetic arrow could be saved to SMARTS file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #2071
    Description: Validate that the schema with retrosynthetic arrow could be saved to SMARTS file and loaded back
    */

    await openFileAndAddToCanvas(
      'KET/schema-with-diagonal-retrosynthetic-arrow.ket',
      page,
    );

    await verifyFileExport(
      page,
      'SMARTS/schema-with-diagonal-retrosynthetic-arrow.smarts',
      FileType.SMARTS,
    );

    await openFileAndAddToCanvasAsNewProject(
      'SMARTS/schema-with-diagonal-retrosynthetic-arrow.smarts',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that the schema with reverse retrosynthetic arrow and pluses could be saved to SMARTS file and loaded back', async ({
    page,
  }) => {
    /*
    Test case: #2071
    Description: Validate that the schema with retrosynthetic arrow could be saved to SMARTS file and loaded back
    */

    await openFileAndAddToCanvas(
      'KET/schema-with-reverse-retrosynthetic-arrow-and-pluses.ket',
      page,
    );

    await verifyFileExport(
      page,
      'SMARTS/schema-with-reverse-retrosynthetic-arrow-and-pluses.smarts',
      FileType.SMARTS,
    );

    await openFileAndAddToCanvasAsNewProject(
      'SMARTS/schema-with-reverse-retrosynthetic-arrow-and-pluses.smarts',
      page,
    );
    await takeEditorScreenshot(page);
  });
});

interface IMonomer {
  monomerDescription: string;
  KETFile: string;
  SMARTSFile_Expected: string;
  monomerLocatorText: string;
  // Set shouldFail to true if you expect test to fail because of existed bug and put issues link to issueNumber
  shouldFail?: boolean;
  // issueNumber is mandatory if shouldFail === true
  issueNumber?: string;
}

const allTypesExpandableOfMonomers: IMonomer[] = [
  {
    monomerDescription: '1. Petide D (from library)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Positive/1. Petide D (from library).ket',
    SMARTSFile_Expected:
      'SMARTS/Micro-Macro-Switcher/Basic-Monomers/Positive/1. Petide D (from library)-expected.smarts',
    monomerLocatorText: 'D',
  },
  {
    monomerDescription: '2. Sugar UNA (from library)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Positive/2. Sugar UNA (from library).ket',
    SMARTSFile_Expected:
      'SMARTS/Micro-Macro-Switcher/Basic-Monomers/Positive/2. Sugar UNA (from library)-expected.smarts',
    monomerLocatorText: 'UNA',
  },
  {
    monomerDescription: '3. Base hU (from library)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Positive/3. Base hU (from library).ket',
    SMARTSFile_Expected:
      'SMARTS/Micro-Macro-Switcher/Basic-Monomers/Positive/3. Base hU (from library)-expected.smarts',
    monomerLocatorText: 'hU',
  },
  {
    monomerDescription: '4. Phosphate bnn (from library)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Positive/4. Phosphate bnn (from library).ket',
    SMARTSFile_Expected:
      'SMARTS/Micro-Macro-Switcher/Basic-Monomers/Positive/4. Phosphate bnn (from library)-expected.smarts',
    monomerLocatorText: 'bnn',
  },
  {
    monomerDescription: '5. Unsplit nucleotide 5hMedC (from library)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Positive/5. Unsplit nucleotide 5hMedC (from library).ket',
    SMARTSFile_Expected:
      'SMARTS/Micro-Macro-Switcher/Basic-Monomers/Positive/5. Unsplit nucleotide 5hMedC (from library)-expected.smarts',
    monomerLocatorText: '5hMedC',
  },
  {
    monomerDescription: '6. CHEM 4aPEGMal (from library)',
    KETFile:
      'KET/Micro-Macro-Switcher/Basic-Monomers/Positive/6. CHEM 4aPEGMal (from library).ket',
    SMARTSFile_Expected:
      'SMARTS/Micro-Macro-Switcher/Basic-Monomers/Positive/6. CHEM 4aPEGMal (from library)-expected.smarts',
    monomerLocatorText: '4aPEGMal',
  },
];

test.describe('Saving collapsed monomer to SMARTS: ', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  for (const monomer of allTypesExpandableOfMonomers) {
    test(`${monomer.monomerDescription}`, async ({ page }) => {
      /*
       * Test task: https://github.com/epam/ketcher/issues/5832
       * Description: Verify saving collapsed monomers in Daylight SMARTS
       *
       * Case: 1. Load monomer chain on Molecules canvas
       *       2. Take screenshot to witness initial state
       *       3. For each monomer do the following:
       *          3.1 Save monomer to Daylight SMARTS
       *          3.2 Validate saved file using template
       *          3.3 Load saved file back to canvas
       *          3.4 Take screenshot to witness result on the canvas
       */
      await openFileAndAddToCanvasAsNewProject(monomer.KETFile, page);
      await takeEditorScreenshot(page);

      await verifyFileExport(
        page,
        monomer.SMARTSFile_Expected,
        FileType.SMARTS,
      );

      await openFileAndAddToCanvasAsNewProject(
        monomer.SMARTSFile_Expected,
        page,
      );
      await takeEditorScreenshot(page);

      // Test should be skipped if related bug exists
      test.fixme(
        monomer.shouldFail === true,
        `That test results are wrong because of ${monomer.issueNumber} issue(s).`,
      );
    });
  }
});

async function callContexMenu(page: Page, locatorText: string) {
  const canvasLocator = page.getByTestId('ketcher-canvas');
  await canvasLocator.getByText(locatorText, { exact: true }).click({
    button: 'right',
  });
}

async function expandMonomer(page: Page, locatorText: string) {
  await callContexMenu(page, locatorText);
  await waitForRender(page, async () => {
    await page.getByText('Expand monomer').click();
  });
}

test.describe('Saving expanded monomer to SMARTS: ', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  for (const monomer of allTypesExpandableOfMonomers) {
    test(`${monomer.monomerDescription}`, async ({ page }) => {
      /*
       * Test task: https://github.com/epam/ketcher/issues/5832
       * Description: Verify saving expanded monomers in Daylight SMARTS
       *
       * Case: 1. Load monomer chain on Molecules canvas
       *       2. Expand monomer on the canvas
       *       2. Take screenshot to witness initial state
       *       3. For each monomer do the following:
       *          3.1 Save monomer to Daylight SMARTS
       *          3.2 Validate saved file using template
       *          3.3 Load saved file back to canvas
       *          3.4 Take screenshot to witness result on the canvas
       */
      await openFileAndAddToCanvasAsNewProject(monomer.KETFile, page);
      await expandMonomer(page, monomer.monomerLocatorText);
      await takeEditorScreenshot(page);

      await verifyFileExport(
        page,
        monomer.SMARTSFile_Expected,
        FileType.SMARTS,
      );

      await openFileAndAddToCanvasAsNewProject(
        monomer.SMARTSFile_Expected,
        page,
      );
      await takeEditorScreenshot(page);

      // Test should be skipped if related bug exists
      test.fixme(
        monomer.shouldFail === true,
        `That test results are wrong because of ${monomer.issueNumber} issue(s).`,
      );
    });
  }
});
