/* eslint-disable no-magic-numbers */
import { Page, chromium, test, expect } from '@playwright/test';
import {
  MacromoleculesLeftPanelButton,
  openStructurePasteFromClipboard,
  pasteFromClipboardAndAddToMacromoleculesCanvas,
  selectClearCanvasTool,
  selectFlexLayoutModeTool,
  selectMacromoleculesLeftPanelButton,
  selectSequenceLayoutModeTool,
  selectSnakeLayoutModeTool,
  takeEditorScreenshot,
  waitForIndigoToLoad,
  waitForKetcherInit,
} from '@utils';
import {
  turnOnMacromoleculesEditor,
  zoomWithMouseWheel,
} from '@utils/macromolecules';

let page: Page;

test.beforeAll(async ({ browser }) => {
  let sharedContext;
  try {
    sharedContext = await browser.newContext();
  } catch (error) {
    console.error('Error on creation browser context:', error);
    console.log('Restarting browser...');
    await browser.close();
    browser = await chromium.launch();
    sharedContext = await browser.newContext();
  }

  // Reminder: do not pass page as async
  page = await sharedContext.newPage();

  await page.goto('', { waitUntil: 'domcontentloaded' });
  await waitForKetcherInit(page);
  await waitForIndigoToLoad(page);
  await turnOnMacromoleculesEditor(page);
});

test.afterEach(async () => {
  await page.keyboard.press('Control+0');
  await selectClearCanvasTool(page);
});

test.afterAll(async ({ browser }) => {
  const cntxt = page.context();
  await page.close();
  await cntxt.close();
  await browser.contexts().forEach((someContext) => {
    someContext.close();
  });
  // await browser.close();
});

test.describe('Import/export sequence:', () => {
  test.setTimeout(300000);
  test.describe.configure({ retries: 0 });

  test('Verify that the dropdown contains the following options: Ket Format, MDL Molfile V3000, and Sequence.', async () => {
    /*
        Test case: https://github.com/epam/ketcher/issues/4422 - Case 1-2, 30
        Description: 
        Case 1:
        Open sequence dialog: Verify that the dropdown contains the following 
        options: "Ket Format," "MDL Molfile V3000," and "Sequence."
        Ensure "Ket Format" is the default selected option.
        Case 2:
        "Choose ""Sequence"" from the dropdown menu.
        Check if additional options for RNA, DNA, and Peptide formats are displayed."
        Case 30: 
        The "FASTA" option should be available in the format dropdown menu, and selecting 
        it should display the additional options "RNA", "DNA", "Peptide"

    */
    await selectSequenceLayoutModeTool(page);
    await openStructurePasteFromClipboard(page);

    const fileFormatComboBox = page
      .getByTestId('dropdown-select')
      .getByRole('combobox');

    const defaultValue = await fileFormatComboBox
      .locator('span')
      .first()
      .innerText();
    expect(defaultValue).toBe('Ket');

    await fileFormatComboBox.click();

    const options = page.getByRole('option');
    const values = await options.allTextContents();

    const expectedValues = [
      'Ket',
      'MDL Molfile V3000',
      'Sequence',
      'FASTA',
      'IDT',
    ];
    for (const value of expectedValues) {
      expect(values).toContain(value);
    }
    // Case 2
    await page.getByText('Sequence').click();

    const typeSelectorComboBox = page
      .getByTestId('dropdown-select-type')
      .getByRole('combobox');
    await typeSelectorComboBox.click();

    const options2 = page.getByRole('option');
    const values2 = await options2.allTextContents();

    const expectedValues2 = ['RNA', 'DNA', 'Peptide'];
    for (const value2 of expectedValues2) {
      expect(values2).toContain(value2);
    }
    await page.keyboard.press('Escape');

    // Case 30
    await fileFormatComboBox.click();
    await page.getByText('FASTA').click();
    await typeSelectorComboBox.click();
    const options3 = page.getByRole('option');
    const values3 = await options3.allTextContents();

    const expectedValues3 = ['RNA', 'DNA', 'Peptide'];
    for (const value3 of expectedValues3) {
      expect(values3).toContain(value3);
    }

    await page.keyboard.press('Escape');
    await page.keyboard.press('Escape');
  });

  test('It is possible to paste from clipboard A, T, C, G, U for RNA open structure', async () => {
    /*
        Test case: https://github.com/epam/ketcher/issues/4422 - Case 3.1 (RNA case)
        Description: 
        Case 3:
        Select "RNA" from the sequence format dropdown.
        Enter symbols A, T, C, G, U (case insensitive) in the sequence input.
        Ensure no errors are displayed.
    */

    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      'Sequence',
      'RNA',
      'ATCGUatcgu',
    );

    await zoomWithMouseWheel(page, 300);
    await takeEditorScreenshot(page);
  });

  test('It is possible to paste from clipboard A, T, C, G, U for DNA open structure', async () => {
    /*
        Test case: https://github.com/epam/ketcher/issues/4422 - Case 3.2 (DNA case)
        Description: 
        Case 3:
        Select "DNA" from the sequence format dropdown.
        Enter symbols A, T, C, G, U (case insensitive) in the sequence input.
        Ensure no errors are displayed.
    */

    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      'Sequence',
      'RNA',
      'ATCGUatcgu',
    );

    await zoomWithMouseWheel(page, 300);
    await takeEditorScreenshot(page);
  });

  test('It is possible to paste from clipboard A, C, D, E, F, G, H, I, K, L, M, N, P, Q, R, S, T, V, W, Y for Peptide open structure', async () => {
    /*
        Test case: https://github.com/epam/ketcher/issues/4422 - Case 3.3 (Peptide case)
        Description: 
        Case 4:
        Select "Peptide" from the sequence format dropdown.
        Enter symbols A, C, D, E, F, G, H, I, K, L, M, N, P, Q, R, S, T, V, W, Y (case insensitive) in the sequence input.
        Confirm no errors are displayed.
    */

    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      'Sequence',
      'Peptide',
      'ACDEFGHIKLMNPQRSTVWYacdefghiklmnpqrstcwy',
    );

    await selectSnakeLayoutModeTool(page);
    await takeEditorScreenshot(page);
    await selectFlexLayoutModeTool(page);
  });

  // Fail while performance issue on Indigo side
  // test('Error message is dispayed if unsupported symbol used for RNA/DNA/Peptide', async () => {
  //   /*
  //       Test case: https://github.com/epam/ketcher/issues/4422 - Case 4
  //       Description:
  //       Case 5:
  //       "Select any sequence format.
  //       Enter symbols other than the supported ones.
  //       Check if an error message is displayed."
  //   */
  //
  //   await pasteFromClipboardAndAddToMacromoleculesCanvas(
  //     page,
  //     'Sequence',
  //     'RNA',
  //     'Unsupported symbols',
  //     false,
  //   );
  //   await takeEditorScreenshot(page);
  //   await page.getByRole('button', { name: 'Close', exact: true }).click();
  //   await page.getByRole('dialog').getByRole('textbox').click();
  //   await page
  //     .getByRole('button', { name: 'Close window', exact: true })
  //     .click();
  //
  //   await pasteFromClipboardAndAddToMacromoleculesCanvas(
  //     page,
  //     'Sequence',
  //     'DNA',
  //     'Unsupported symbols',
  //     false,
  //   );
  //   await takeEditorScreenshot(page);
  //   await page.getByRole('button', { name: 'Close', exact: true }).click();
  //   await page.getByRole('dialog').getByRole('textbox').click();
  //   await page
  //     .getByRole('button', { name: 'Close window', exact: true })
  //     .click();
  //
  //   await pasteFromClipboardAndAddToMacromoleculesCanvas(
  //     page,
  //     'Sequence',
  //     'Peptide',
  //     'Unsupported symbols',
  //     false,
  //   );
  //   await takeEditorScreenshot(page);
  //   await page.getByRole('button', { name: 'Close', exact: true }).click();
  //   await page.getByRole('dialog').getByRole('textbox').click();
  //   await page
  //     .getByRole('button', { name: 'Close window', exact: true })
  //     .click();
  // });

  test('Verify that the save dropdown contains the following options: Ket Format, MDL Molfile V3000, and Sequence.', async () => {
    /*
        Test case: https://github.com/epam/ketcher/issues/3808 - Case 5, 31
        Description: 
        Case 5:
        Open the modal window for saving structure and find the dropdown for file format selection.
        Confirm that the dropdown now includes the option "Sequence.
        Case 31: Check option "FASTA" to dropdown 'File format' of modal window 'Save Structure'
    */
    await selectSequenceLayoutModeTool(page);
    await selectMacromoleculesLeftPanelButton(
      MacromoleculesLeftPanelButton.Save,
      page,
    );

    const fileFormatComboBox = page.getByRole('combobox');

    const defaultValue = await fileFormatComboBox
      .locator('span')
      .first()
      .innerText();
    expect(defaultValue).toBe('Ket');

    await fileFormatComboBox.click();

    const options = page.getByRole('option');
    const values = await options.allTextContents();

    const expectedValues = [
      'Ket',
      'MDL Molfile V3000',
      'Sequence',
      'FASTA',
      'IDT',
    ];
    for (const value of expectedValues) {
      expect(values).toContain(value);
    }

    await page.keyboard.press('Escape');
    await page.keyboard.press('Escape');
  });
});
