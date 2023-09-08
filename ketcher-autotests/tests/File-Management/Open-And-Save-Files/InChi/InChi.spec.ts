import { test } from '@playwright/test';
import {
  clickInTheMiddleOfTheScreen,
  takeEditorScreenshot,
  openFromFileViaClipboard,
  selectTopPanelButton,
  TopPanelButton,
  waitForPageInit,
} from '@utils';

test.describe('', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
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
      await openFromFileViaClipboard(
        'tests/test-data/Txt/1963-inchi.txt',
        page,
      );
      await clickInTheMiddleOfTheScreen(page);
    },
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
      await openFromFileViaClipboard(
        'tests/test-data/Txt/1967-inchi.txt',
        page,
      );
      await clickInTheMiddleOfTheScreen(page);
    },
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
      await openFromFileViaClipboard(
        'tests/test-data/Txt/1968-inchi.txt',
        page,
      );
      await clickInTheMiddleOfTheScreen(page);
    },
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
      await openFromFileViaClipboard(
        'tests/test-data/Txt/1969-inchi.txt',
        page,
      );
      await clickInTheMiddleOfTheScreen(page);
    },
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
      await openFromFileViaClipboard(
        'tests/test-data/Txt/1970-inchi.txt',
        page,
      );
      await clickInTheMiddleOfTheScreen(page);
    },
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
      await openFromFileViaClipboard(
        'tests/test-data/Txt/1971-inchi.txt',
        page,
      );
      await clickInTheMiddleOfTheScreen(page);
    },
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
      await openFromFileViaClipboard(
        'tests/test-data/Txt/1974-inchi.txt',
        page,
      );
      await clickInTheMiddleOfTheScreen(page);
    },
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
      await openFromFileViaClipboard(
        'tests/test-data/Txt/1975-inchi.txt',
        page,
      );
      await clickInTheMiddleOfTheScreen(page);
    },
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
      await openFromFileViaClipboard(
        'tests/test-data/Txt/1976-inchi.txt',
        page,
      );
      await clickInTheMiddleOfTheScreen(page);
    },
  );
});
