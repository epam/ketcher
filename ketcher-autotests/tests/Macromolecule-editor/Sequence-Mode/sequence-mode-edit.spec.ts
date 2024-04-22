import { test } from '@playwright/test';
import {
  selectSequenceLayoutModeTool,
  selectSnakeLayoutModeTool,
  SequenceType,
  startNewSequence,
  switchSequenceEnteringType,
  takeEditorScreenshot,
  typePeptideAlphabet,
  typeRNADNAAlphabet,
  waitForPageInit,
} from '@utils';
import { turnOnMacromoleculesEditor } from '@utils/macromolecules';

test.describe('Sequence edit mode', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
    await selectSequenceLayoutModeTool(page);
  });

  test('Add/edit sequence', async ({ page }) => {
    await startNewSequence(page);
    await typeRNADNAAlphabet(page);
    await switchSequenceEnteringType(page, SequenceType.DNA);
    await typeRNADNAAlphabet(page);
    await switchSequenceEnteringType(page, SequenceType.PEPTIDE);
    await typePeptideAlphabet(page);
    await page.keyboard.press('Enter');
    await typePeptideAlphabet(page);
    await takeEditorScreenshot(page);
    await selectSnakeLayoutModeTool(page);
    await takeEditorScreenshot(page);
  });
});
