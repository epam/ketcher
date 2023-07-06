import { test } from '@playwright/test';
import {
  clickInTheMiddleOfTheScreen,
  takeEditorScreenshot,
  openFromFileViaClipboard,
  selectTopPanelButton,
  TopPanelButton,
} from '@utils';

test.describe('', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  test(
    'Open and Save file - Generate structure from ' +
      'InChI String - inserting correct string for multiple structures',
    async ({ page }) => {
      /**
       * Test case: EPMLSOPKET-1963
       * Description: Open multiple structures from InChi string
       */
      // add first structure from clipboard to canvas
      await selectTopPanelButton(TopPanelButton.Open, page);
      await openFromFileViaClipboard('tests/test-data/1963_inchi.txt', page);
      await clickInTheMiddleOfTheScreen(page);
    }
  );

  test(
    'Open and Save file - Generate structure from InChI String - ' +
      'Chain string with single bonds only',
    async ({ page }) => {
      /**
       * Test case: EPMLSOPKET-1967
       * Description: Open structure with single bonds from InChi string
       */
      // add first structure from clipboard to canvas
      await selectTopPanelButton(TopPanelButton.Open, page);
      await openFromFileViaClipboard('tests/test-data/1967_InChi.txt', page);
      await clickInTheMiddleOfTheScreen(page);
    }
  );

  test(
    'Open and Save file - Generate structure from InChI String - ' +
      'Chain string that contains some double bonds',
    async ({ page }) => {
      /**
       * Test case: EPMLSOPKET-1968
       * Description: Open structure with some double bonds from InChi string
       */
      // add first structure from clipboard to canvas
      await selectTopPanelButton(TopPanelButton.Open, page);
      await openFromFileViaClipboard('tests/test-data/1968_InChi.txt', page);
      await clickInTheMiddleOfTheScreen(page);
    }
  );

  test(
    'Open and Save file - Generate structure from InChI ' +
      'String - Chain string that contains some triple bonds',
    async ({ page }) => {
      /**
       * Test case: EPMLSOPKET-1969
       * Description: Open structure with some triple bonds from InChi string
       */
      // add first structure from clipboard to canvas
      await selectTopPanelButton(TopPanelButton.Open, page);
      await openFromFileViaClipboard('tests/test-data/1969_InChi.txt', page);
      await clickInTheMiddleOfTheScreen(page);
    }
  );

  test(
    'Open and Save file - Generate structure from ' +
      'InChI String - Cyclic structure with single bonds only',
    async ({ page }) => {
      /**
       * Test case: EPMLSOPKET-1970
       * Description: Open cyclic structure with single bonds from InChi string
       */
      // add first structure from clipboard to canvas
      await selectTopPanelButton(TopPanelButton.Open, page);
      await openFromFileViaClipboard('tests/test-data/1970_InChi.txt', page);
      await clickInTheMiddleOfTheScreen(page);
    }
  );

  test(
    'Open and Save file - Generate structure ' +
      'from InChI String - Sugars without stereobonds',
    async ({ page }) => {
      /**
       * Test case: EPMLSOPKET-1971
       * Description: Open sugar without stereobonds from InChi string
       */
      // add first structure from clipboard to canvas
      await selectTopPanelButton(TopPanelButton.Open, page);
      await openFromFileViaClipboard('tests/test-data/1971_InChi.txt', page);
      await clickInTheMiddleOfTheScreen(page);
    }
  );

  test(
    'Open and Save file - Generate structure ' +
      'from InChI String - Structure with stereobonds',
    async ({ page }) => {
      /**
       * Test case: EPMLSOPKET-1974
       * Description: Open structure with stereobonds from InChi string
       */
      // add first structure from clipboard to canvas
      await selectTopPanelButton(TopPanelButton.Open, page);
      await openFromFileViaClipboard('tests/test-data/1974_InChi.txt', page);
      await clickInTheMiddleOfTheScreen(page);
    }
  );

  test(
    'Open and Save file - Generate structure ' +
      'from InChI String - Fused structure',
    async ({ page }) => {
      /**
       * Test case: EPMLSOPKET-1975
       * Description: Open structure with fused bonds from InChi string
       */
      // add first structure from clipboard to canvas
      await selectTopPanelButton(TopPanelButton.Open, page);
      await openFromFileViaClipboard('tests/test-data/1975_InChi.txt', page);
      await clickInTheMiddleOfTheScreen(page);
    }
  );

  test(
    'Open and Save file - Generate structure ' +
      'from InChI String - Spiro structure',
    async ({ page }) => {
      /**
       * Test case: EPMLSOPKET-1976
       * Description: Open spiro structure from InChi string
       */
      // add first structure from clipboard to canvas
      await selectTopPanelButton(TopPanelButton.Open, page);
      await openFromFileViaClipboard('tests/test-data/1976_InChi.txt', page);
      await clickInTheMiddleOfTheScreen(page);
    }
  );
});
