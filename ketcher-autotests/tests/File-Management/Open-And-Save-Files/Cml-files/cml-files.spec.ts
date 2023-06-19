import { Page, expect, test } from '@playwright/test';
import {
  takeEditorScreenshot,
  receiveCmlFileComparisonData,
  openFileAndAddToCanvas,
  saveToFile,
  delay,
  DELAY_IN_SECONDS,
} from '@utils';
import { getCml } from '@utils/formats';

async function openFileAddToCanvasTakeScreenshot(page: Page, fileName: string) {
  await openFileAndAddToCanvas(fileName, page);
  await takeEditorScreenshot(page);
}

test.describe('CML files', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });

  test('Open and Save files - CML - CML for empty canvas', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-1944
     * Description: Save a clear canvas in CML format with preset parameters:
     * The input field contains <?xml version="1.0" ?> <cml> <molecule title="" /> </cml>.
     */

    await delay(DELAY_IN_SECONDS.EIGHT);
    const { cmlFile, cmlFileExpected } = await receiveCmlFileComparisonData(
      page,
      'tests/test-data/cml-12492-compare.cml'
    );
    // comparing cml file with golden cml file
    expect(cmlFile).toEqual(cmlFileExpected);
  });

  test('Open and Save file - CML - CML for structure', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-1945
     * Description: Saved cml file with structure is compering with paste cml structure golden file
     */
    await openFileAddToCanvasTakeScreenshot(page, 'cml-1945.cml');
    // check that structure opened from file is displayed correctly

    const { cmlFile, cmlFileExpected } = await receiveCmlFileComparisonData(
      page,
      'tests/test-data/cml-1945.cml'
    );
    // comparing cml file with golden cml file

    expect(cmlFile).toEqual(cmlFileExpected);
  });

  test('Open and Save file - CML - CML for some structures', async ({
    page,
  }) => {
    /**
     * Test case: EPMLSOPKET-1946
     * Description: Saved cml file with structure is compering with paste cml 3 structures
     */
    await openFileAddToCanvasTakeScreenshot(page, 'cml-1946.cml');
    // check that structure opened from file is displayed correctly

    const { cmlFile, cmlFileExpected } = await receiveCmlFileComparisonData(
      page,
      'tests/test-data/cml-1946-expected.cml'
    );
    // comparing cml file with golden cml file

    expect(cmlFile).toEqual(cmlFileExpected);
  });

  test('Open and Save file - CML - CML for reaction', async ({ page }) => {
    /**
   * Test case: EPMLSOPKET-1947
    Description: Saved cml file with structure is compering with paste reaction from rxn file
  */
    await openFileAddToCanvasTakeScreenshot(page, 'Cml-1947-reaction.rxn');
    // check that structure opened from file is displayed correctly

    const { cmlFile, cmlFileExpected } = await receiveCmlFileComparisonData(
      page,
      'tests/test-data/Cml-1947.cml'
    );
    // comparing cml file with golden cml file

    expect(cmlFile).toEqual(cmlFileExpected);
  });

  test('Open and Save file - CML - CML for R-group and other features', async ({
    page,
  }) => {
    /**
     * Test case: EPMLSOPKET-1948
     * Description: Saved cml file with structure is compering with paste R-group from a mol file
     */

    await openFileAddToCanvasTakeScreenshot(page, 'Cml-1948-r-group.mol');
    // check that structure opened from file is displayed correctly

    const { cmlFile, cmlFileExpected } = await receiveCmlFileComparisonData(
      page,
      'tests/test-data/Cml-1948.cml'
    );
    // comparing cml file with golden cml file

    expect(cmlFile).toEqual(cmlFileExpected);
  });
});

test.skip('Update golden file', async ({ page }) => {
  await page.goto('');
  await openFileAndAddToCanvas('cml-1948.cml', page);
  const cml = await getCml(page);
  await saveToFile('cml-1948', cml);
});
