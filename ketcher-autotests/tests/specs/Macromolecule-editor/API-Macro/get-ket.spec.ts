/* eslint-disable @typescript-eslint/no-explicit-any */
import { test, expect } from '@playwright/test';
import {
  openFileAndAddToCanvasMacro,
  waitForPageInit,
  layout,
  recognize,
  clickInTheMiddleOfTheScreen,
} from '@utils';
import { selectAllStructuresOnCanvas } from '@utils/canvas/selectSelection';
import {
  FileType,
  verifyFileExport,
} from '@utils/files/receiveFileComparisonData';
import { RightToolbar } from '@tests/pages/molecules/RightToolbar';
import { Atom } from '@tests/pages/constants/atoms/atoms';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';

test.describe('getKet', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
  });

  test('with two monomers bonded', async ({ page }) => {
    await openFileAndAddToCanvasMacro(page, 'KET/alanine-monomers-bonded.ket');
    await verifyFileExport(
      page,
      'KET/alanine-monomers-bonded-expected.ket',
      FileType.KET,
    );
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

  const formatsToTest = [
    'getSmiles',
    'getRxn',
    'getSmarts',
    'getCml',
    'getSdf',
    'getCDXml',
    'getCDX',
  ];

  test.describe('Check that certain methods throw an Error', () => {
    formatsToTest.forEach((format) => {
      test(`Check that ${format} method throws an Error`, async ({ page }) => {
        /**
         * Test case: #3531
         * Description: 'getSmiles','getRxn','getSmarts','getCml','getSdf','getCDXml','getCDX', method throws an Error
         */

        await page.waitForFunction(() => (window as any).ketcher);

        let errorCaught = false;

        page.on('console', (msg) => {
          if (msg.type() === 'error') {
            errorCaught = true;
          }
        });

        try {
          await page.evaluate((fmt) => {
            const ketcher = (window as any).ketcher as unknown as {
              [key: string]: () => Promise<any>;
            };
            if (typeof ketcher[fmt] !== 'function') {
              throw new Error(`${fmt} is not a function`);
            }
            return ketcher[fmt]();
          }, format);
        } catch (e) {
          errorCaught = true;
        }

        if (!errorCaught) {
          throw new Error('Expected error was not thrown');
        }

        expect(errorCaught).toBe(true);
      });
    });
  });
});

test.describe('getKet', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Check that getKet function return ket file with selection flags in Micro mode', async ({
    page,
  }) => {
    /* 
  Test case: https://github.com/epam/ketcher/issues/4238
  Description: getKet function return ket file with selection flags in Micro mode
  */
    const atomToolbar = RightToolbar(page);

    await atomToolbar.clickAtom(Atom.Hydrogen);
    await clickInTheMiddleOfTheScreen(page);
    await selectAllStructuresOnCanvas(page);

    await verifyFileExport(
      page,
      'KET/selected-hydrogen-expected.ket',
      FileType.KET,
    );
  });
});
