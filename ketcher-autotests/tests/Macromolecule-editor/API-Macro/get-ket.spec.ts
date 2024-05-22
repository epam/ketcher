import { test, expect } from '@playwright/test';
import {
  openFileAndAddToCanvasMacro,
  readFileContents,
  waitForPageInit,
  turnOnMacromoleculesEditor,
  getKet,
  saveToFile,
  layout,
  recognize,
} from '@utils';

test.describe('getKet', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
  });

  test('with two monomers bonded', async ({ page }) => {
    await openFileAndAddToCanvasMacro('KET/alanine-monomers-bonded.ket', page);
    const ket = await getKet(page);
    await saveToFile('KET/alanine-monomers-bonded-expected.ket', ket);
    const fileContents = await readFileContents(
      'tests/test-data/KET/alanine-monomers-bonded-expected.ket',
    );
    expect(ket).toBe(fileContents);
  });

  test('Check that layout method throws an Error: layout is not available in macro mode', async ({
    page,
  }) => {
    /**
     * Test case: #3531
     * Description: Layout method throws an Error: layout is not available in macro mode
     */

    let errorCaught = false;

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errorCaught = true;
      }
    });

    try {
      await layout(page);
    } catch (e) {
      errorCaught = true;
    }

    if (!errorCaught) {
      throw new Error('Expected error was not thrown');
    }
    expect(errorCaught).toBe(true);
  });

  test('Check that recognize method throws an Error with invalid input', async ({
    page,
  }) => {
    /**
     * Test case: #3531
     * Description: Recognize method throws an Error with invalid input
     */

    let errorCaught = false;

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errorCaught = true;
      }
    });

    const invalidBlob = new Blob(['invalid data'], { type: 'image/png' });

    try {
      await recognize(page, invalidBlob);
    } catch (e) {
      errorCaught = true;
    }

    if (!errorCaught) {
      throw new Error('Expected error was not thrown');
    }
    expect(errorCaught).toBe(true);
  });
});
