import { test } from '@playwright/test';
import {
  clickInTheMiddleOfTheScreen,
  takeEditorScreenshot,
  openFileAndAddToCanvas,
  waitForPageInit,
  openFileAndAddToCanvasAsNewProject,
  readFileContent,
  pasteFromClipboardAndAddToCanvas,
} from '@utils';

const X_OFFSET = 200;

test.describe('open files with different formats', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('opening rxn files', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1839
    */

    await openFileAndAddToCanvas('Rxn-V2000/1839-ketcher.rxn', page);
    await takeEditorScreenshot(page);
  });

  test('opening smi files', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1840
    */
    await openFileAndAddToCanvas('SMILES/1840-cyclopentyl.smi', page);
    await takeEditorScreenshot(page);
  });

  test('opening inchi files', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1841
    */
    await openFileAndAddToCanvas('InChI/1841-ketcher.inchi', page);
    await takeEditorScreenshot(page);
  });

  /* two structures should be added on the canvas in the following test
  (same as in EPMLSOPKET-1835), however in this test when second structure is added
  the first one disappears. Couldn't reproduct manually.
  */
  test('Open file - Input .mol, InChi', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-1835
     * Description: Two structures are added to canvas - one opened from clipboard, another from file
     */
    // add first stucture from clipboard to canvas
    const fileContent = await readFileContent('Txt/1840225-mol-1.txt');

    await pasteFromClipboardAndAddToCanvas(page, fileContent);
    await clickInTheMiddleOfTheScreen(page);

    // add second structure from file to canvas
    await openFileAndAddToCanvas(
      'Molfiles-V2000/glutamine.mol',
      page,
      X_OFFSET,
      0,
    );
    await takeEditorScreenshot(page);
  });

  test('Open file - Input .rxn string', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-2860
     * Description: Two structures are added to canvas - one opened from clipboard, another from file
     */
    // add first stucture from clipboard to canvas
    const fileContent = await readFileContent('Txt/1879938-rxn-1[1].txt');

    await pasteFromClipboardAndAddToCanvas(page, fileContent);
    // add second structure from file to canvas
    await openFileAndAddToCanvas(
      'Rxn-V2000/rxn-reaction.rxn',
      page,
      0,
      -X_OFFSET,
    );
    await takeEditorScreenshot(page);
  });

  test('Open file - Input InChi-string 1/3', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-1837
     * Description: Open structures from InChi string
     */
    // add first stucture from clipboard to canvas
    const fileContent = await readFileContent('Txt/1837-inchi-1.txt');

    await pasteFromClipboardAndAddToCanvas(page, fileContent);
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });

  test('Open file - Input InChi-string 2/3', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-1837
     * Description: Open structures from InChi string
     */
    // add first stucture from clipboard to canvas
    const fileContent = await readFileContent('Txt/1837-inchi-2.txt');

    await pasteFromClipboardAndAddToCanvas(page, fileContent);
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });

  test('Open file - Input InChi-string 3/3', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-1837
     * Description: Open structures from InChi string
     */
    // add first structure from clipboard to canvas
    const fileContent = await readFileContent('Txt/1837-inchi-3.txt');

    await pasteFromClipboardAndAddToCanvas(page, fileContent);
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });

  test('Open file - Open *.mol file 1/2', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-1838
     * Description: Open structures from mol file
     */
    // add first structure from clipboard to canvas
    await openFileAndAddToCanvasAsNewProject(
      'Molfiles-V3000/a-query-notList.mol',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Open file - Open *.mol file 2/2', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-1838
     * Description: Open structures from mol file
     */
    // add first stucture from clipboard to canvas
    await openFileAndAddToCanvasAsNewProject(
      'Molfiles-V3000/dhis-prohibit-atoms.mol',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Open ket file with SMARTS attributes', async ({ page }) => {
    /*
      Test case: https://github.com/epam/ketcher/issues/3397
      Description: ket file with SMARTS attributes should be open without error
      */
    await openFileAndAddToCanvas(
      'KET/benzene-with-smarts-attributes.ket',
      page,
    );
    await takeEditorScreenshot(page);
  });
});
