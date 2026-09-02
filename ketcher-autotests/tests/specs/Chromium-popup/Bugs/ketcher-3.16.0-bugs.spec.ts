import { Page, test, expect } from '@fixtures';
import {
  openFileAndAddToCanvas,
  takeEditorScreenshot,
  copyToClipboardByKeyboard,
  pasteFromClipboardByKeyboard,
  clickOnCanvas,
  selectRectangleArea,
  getCoordinatesOfTheMiddleOfTheScreen,
} from '@utils';
let page: Page;
test.beforeAll(async ({ initMoleculesCanvas }) => {
  page = await initMoleculesCanvas();
});
test.afterAll(async ({ closePage }) => {
  await closePage();
});
test.beforeEach(async ({ MoleculesCanvas: _ }) => {});

test('Case 1: Copy/paste action with large structions shouldnt cause expections', async () => {
  /**
   * Test task: https://github.com/epam/ketcher/issues/10502
   * Bug: https://github.com/epam/ketcher/issues/3848
   * Description: When part of the large structure is copied using Ctrl+C/Ctrl+V hotkeys it shoudn't throw and error
   * Scenario:
   * 1. Load molecule from file: AllPossibleQueryFeatures.zip (unzip first)
   * 2. Select few rings
   * 3. Press Ctrl+C/Ctrl+V reasonably fast
   * Actual result: exception is thrown
   * Expected result: there are not errors in the console
   */
  const consoleErrors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  await openFileAndAddToCanvas(
    page,
    'KET/all-possible-query-features-with-out-custom-query.ket',
  );
  const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
  await selectRectangleArea(page, x - 250, y - 210, x + 100, y + 110);
  await copyToClipboardByKeyboard(page);
  await pasteFromClipboardByKeyboard(page);
  await clickOnCanvas(page, 0, 100, { from: 'pageCenter' });
  const clipboardErrors = consoleErrors.filter((error) =>
    error.includes('No valid data on clipboard'),
  );
  expect(clipboardErrors.length).toBe(0);
});
