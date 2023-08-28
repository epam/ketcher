import { test } from '@playwright/test';
import {
  clickInTheMiddleOfTheScreen,
  openFile,
  pressButton,
  takeEditorScreenshot,
  openFromFileViaClipboard,
  clickOnTheCanvas,
  waitForLoad,
  openFileAndAddToCanvas,
  TopPanelButton,
  selectTopPanelButton,
} from '@utils';

const X_OFFSET = 200;

test.describe('open files with different formats', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  test('opening rxn files', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1839
    */

    await openFileAndAddToCanvas('Rxn/1839-ketcher.rxn', page);
  });

  test('opening smi files', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1840
    */
    await openFileAndAddToCanvas('1840-cyclopentyl.smi', page);
  });

  test('opening inchi files', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1841
    */
    await openFileAndAddToCanvas('1841-ketcher.inchi', page);
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
    await selectTopPanelButton(TopPanelButton.Open, page);
    await openFromFileViaClipboard('tests/test-data/1840225_mol_1.txt', page);
    await clickInTheMiddleOfTheScreen(page);
    // add second structure from file to canvas
    await selectTopPanelButton(TopPanelButton.Open, page);
    await openFile('glutamine.mol', page);
    await waitForLoad(page, () => {
      pressButton(page, 'Add to Canvas');
    });
    await clickOnTheCanvas(page, X_OFFSET, 0);
  });

  test.fixme('Open file - Input .rxn string', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-2860
     * Description: Two structures are added to canvas - one opened from clipboard, another from file
     */
    // add first stucture from clipboard to canvas
    await selectTopPanelButton(TopPanelButton.Open, page);
    await openFromFileViaClipboard(
      'tests/test-data/1879938_rxn_1[1].txt',
      page,
    );
    // add second structure from file to canvas
    await selectTopPanelButton(TopPanelButton.Open, page);
    await openFile('Rxn/rxn-reaction.rxn', page);
    await waitForLoad(page, () => {
      pressButton(page, 'Add to Canvas');
    });
    await clickOnTheCanvas(page, 0, -X_OFFSET);
  });

  test('Open file - Input InChi-string 1/3', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-1837
     * Description: Open structures from InChi string
     */
    // add first stucture from clipboard to canvas
    await selectTopPanelButton(TopPanelButton.Open, page);
    await openFromFileViaClipboard(
      'tests/test-data/Txt/1837-inchi-1.txt',
      page,
    );
    await clickInTheMiddleOfTheScreen(page);
  });

  test('Open file - Input InChi-string 2/3', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-1837
     * Description: Open structures from InChi string
     */
    // add first stucture from clipboard to canvas
    await selectTopPanelButton(TopPanelButton.Open, page);
    await openFromFileViaClipboard(
      'tests/test-data/Txt/1837-inchi-2.txt',
      page,
    );
    await clickInTheMiddleOfTheScreen(page);
  });

  test('Open file - Input InChi-string 3/3', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-1837
     * Description: Open structures from InChi string
     */
    // add first structure from clipboard to canvas
    await selectTopPanelButton(TopPanelButton.Open, page);
    await openFromFileViaClipboard(
      'tests/test-data/Txt/1837-inchi-3.txt',
      page,
    );
    await clickInTheMiddleOfTheScreen(page);
  });

  test('Open file - Open *.mol file 1/2', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-1838
     * Description: Open structures from mol file
     */
    // add first structure from clipboard to canvas
    await selectTopPanelButton(TopPanelButton.Open, page);
    await openFile('Molfiles-V3000/a-query-notList.mol', page);
    await waitForLoad(page, () => {
      pressButton(page, 'Open as New Project');
    });
  });

  test('Open file - Open *.mol file 2/2', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-1838
     * Description: Open structures from mol file
     */
    // add first stucture from clipboard to canvas
    await selectTopPanelButton(TopPanelButton.Open, page);
    await openFile('Molfiles-V3000/dhis-prohibit-atoms.mol', page);
    await waitForLoad(page, () => {
      pressButton(page, 'Open as New Project');
    });
  });
});
