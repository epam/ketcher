/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable no-magic-numbers */
import { test } from '@fixtures';
import { Page } from '@playwright/test';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import {
  openFileAndAddToCanvasAsNewProject,
  RdfFileFormat,
  takeEditorScreenshot,
} from '@utils';
import {
  FileType,
  verifyFileExport,
} from '@utils/files/receiveFileComparisonData';

let page: Page;

test.describe('Reaction data support in KET-format', () => {
  test.beforeAll(async ({ initMoleculesCanvas }) => {
    page = await initMoleculesCanvas();
  });
  test.afterEach(async () => {
    await CommonTopLeftToolbar(page).clearCanvas();
  });
  test.afterAll(async ({ closePage }) => {
    await closePage();
  });

  test('Case 1: Verify that a KET file for a simple one-step reaction contains the steps array with correct reactants and product', async () => {
    /*
     * Version 3.8
     * Test case: https://github.com/epam/Indigo/issues/2893
     * Description: A KET file for a simple one-step reaction contains the steps array with correct reactants and product
     * Scenario:
     * 1. Go to Micro mode
     * 2. Load the ket file with a simple one-step reaction
     * 3. Verify file, save it in KET format and open it again
     * 4. Verify that the file contains the steps array with correct reactants and product
     * The feature is not implemented in Ketcher front-end yet.
     * After implementation we need to update test file and snapshots.
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/first-reaction-example.ket',
    );
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'KET/first-reaction-example-expected.ket',
      FileType.KET,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/first-reaction-example-expected.ket',
    );
    await takeEditorScreenshot(page);
  });

  test('Case 2: Verify that a KET file for a multi-step reaction contains all intermediate steps with valid transitions between reactants and products', async () => {
    /*
     * Version 3.8
     * Test case: https://github.com/epam/Indigo/issues/2893
     * Description: A KET file for a multi-step reaction contains all intermediate steps with valid transitions between reactants and products
     * Scenario:
     * 1. Go to Micro mode
     * 2. Load the ket file with a multi-step reaction
     * 3. Verify file, save it in KET format and open it again
     * 4. Verify that the file contains all intermediate steps with valid transitions between reactants and products
     * The feature is not implemented in Ketcher front-end yet.
     * After implementation we need to update test file and snapshots.
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/second-testing-structure.ket',
    );
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'KET/second-testing-structure-expected.ket',
      FileType.KET,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/second-testing-structure-expected.ket',
    );
    await takeEditorScreenshot(page);
  });

  test('Case 3: Verify that a KET file supports mixing molecules and blocks in the same reactants array', async () => {
    /*
     * Version 3.8
     * Test case: https://github.com/epam/Indigo/issues/2893
     * Description: a KET file supports mixing molecules and blocks in the same reactants array
     * Scenario:
     * 1. Go to Micro mode
     * 2. Load the ket file with a mixing molecules and blocks in the same reactants array
     * 3. Verify file, save it in KET format and open it again
     * 4. Verify that the file contains all intermediate steps with valid transitions between reactants and products
     * The feature is not implemented in Ketcher front-end yet.
     * After implementation we need to update test file and snapshots.
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/third-test-structure.ket',
    );
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'KET/third-test-structure-expected.ket',
      FileType.KET,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/third-test-structure-expected.ket',
    );
    await takeEditorScreenshot(page);
  });

  test('Case 4: Verify that all IDs in the steps section (reactants and products) exist either in blocks or as defined molecules', async () => {
    /*
     * Version 3.8
     * Test case: https://github.com/epam/Indigo/issues/2893
     * Description: A KET file supports mixing molecules and blocks in the same reactants array
     * Scenario:
     * 1. Go to Micro mode
     * 2. Load the ket file with a mixing molecules and blocks in the same reactants array
     * 3. Verify file, save it in KET format and open it again
     * 4. Verify that the file contains all intermediate steps with valid transitions between reactants and products
     * The feature is not implemented in Ketcher front-end yet.
     * After implementation we need to update test file and snapshots.
     */
    const testCases = [
      {
        file: 'KET/first-reaction-example.ket',
        expectedFile: 'KET/first-reaction-exampleID-expected.ket',
      },
      {
        file: 'KET/second-testing-structure.ket',
        expectedFile: 'KET/second-testing-structureID-expected.ket',
      },
      {
        file: 'KET/third-test-structure.ket',
        expectedFile: 'KET/third-test-structureID-expected.ket',
      },
    ];
    for (const { file, expectedFile } of testCases) {
      await openFileAndAddToCanvasAsNewProject(page, file);
      await takeEditorScreenshot(page);
      await verifyFileExport(page, expectedFile, FileType.KET);
      await openFileAndAddToCanvasAsNewProject(page, expectedFile);
      await takeEditorScreenshot(page);
    }
  });

  test('Case 5: Verify that the blocks array exists and each block includes valid components and pluses arrays and a block can contain multiple components and that they are interpreted correctly in steps', async () => {
    /*
     * Version 3.8
     * Test case: https://github.com/epam/Indigo/issues/2893
     * Description: A KET file supports mixing molecules and blocks in the same reactants array
     * Scenario:
     * 1. Go to Micro mode
     * 2. Load the ket file with a mixing molecules and blocks in the same reactants array
     * 3. Verify file, save it in KET format and open it again
     * 4. Verify that the file contains all intermediate steps with valid transitions between reactants and products
     * The feature is not implemented in Ketcher front-end yet.
     * After implementation we need to update test file and snapshots.
     */
    const testCases = [
      {
        file: 'KET/reaction-with-blocks-and-molecules.ket',
        expectedFile: 'KET/reaction-with-blocks-and-molecules-expected.ket',
      },
      {
        file: 'KET/second-multistep-with-blocks-and-molecules.ket',
        expectedFile:
          'KET/second-multistep-with-blocks-and-molecules-expected.ket',
      },
      {
        file: 'KET/third-multistep-with-blocks-and-molecules.ket',
        expectedFile:
          'KET/third-multistep-with-blocks-and-molecules-expected.ket',
      },
    ];
    for (const { file, expectedFile } of testCases) {
      await openFileAndAddToCanvasAsNewProject(page, file);
      await takeEditorScreenshot(page);
      await verifyFileExport(page, expectedFile, FileType.KET);
      await openFileAndAddToCanvasAsNewProject(page, expectedFile);
      await takeEditorScreenshot(page);
    }
  });

  test('Case 6: Verify that a KET file can be opened with all reaction blocks, saved as RDF V3000, and then reopened successfully', async () => {
    /*
     * Version 3.8
     * Test case: https://github.com/epam/Indigo/issues/2893
     * Description: A KET file can be opened with all reaction blocks, saved as MOL V3000, and then reopened successfully
     * Scenario:
     * 1. Go to Micro mode
     * 2. Load the ket file with a mixing molecules and blocks in the same reactants array
     * 3. Verify file, save it in RDF V3000 format and open it again
     * 4. Verify that the file contains all intermediate steps with valid transitions between reactants and products
     * The feature is not implemented in Ketcher front-end yet.
     * After implementation we need to update test file and snapshots.
     */
    const testCases = [
      {
        file: 'KET/reaction-with-blocks-and-molecules-expected.ket',
        expectedFile:
          'RDF-V3000/reaction-with-blocks-and-molecules-expected.rdf',
      },
      {
        file: 'KET/second-multistep-with-blocks-and-molecules-expected.ket',
        expectedFile:
          'RDF-V3000/second-multistep-with-blocks-and-molecules-expected.rdf',
      },
      {
        file: 'KET/third-multistep-with-blocks-and-molecules-expected.ket',
        expectedFile:
          'RDF-V3000/third-multistep-with-blocks-and-molecules-expected.rdf',
      },
    ];
    for (const { file, expectedFile } of testCases) {
      await openFileAndAddToCanvasAsNewProject(page, file);
      await takeEditorScreenshot(page);
      await verifyFileExport(
        page,
        expectedFile,
        FileType.RDF,
        RdfFileFormat.v3000,
      );
      await openFileAndAddToCanvasAsNewProject(page, expectedFile);
      await takeEditorScreenshot(page);
    }
  });
});
