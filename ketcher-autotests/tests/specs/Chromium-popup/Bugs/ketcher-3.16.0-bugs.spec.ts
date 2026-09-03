import { Page, test, expect } from '@fixtures';
import {
  openFileAndAddToCanvas,
  copyToClipboardByKeyboard,
  pasteFromClipboardByKeyboard,
  clickOnCanvas,
  selectRectangleArea,
  getCoordinatesOfTheMiddleOfTheScreen,
  takeEditorScreenshot,
} from '@utils';
import { IndigoFunctionsToolbar } from '@tests/pages/molecules/IndigoFunctionsToolbar';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { SaveStructureDialog } from '@tests/pages/common/SaveStructureDialog';
import { TopRightToolbar } from '@tests/pages/molecules/TopRightToolbar';
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

test('Case 2: Aromatize action on clean canvas shouldnt add NULL in the beginning of exported molfile', async () => {
  /**
   * Test task: https://github.com/epam/ketcher/issues/10502
   * Bug: https://github.com/epam/ketcher/issues/3951
   * Description: NULL in MOLFILE appears after Aromatize is applied to empty canvas
   * Scenario:
   * 1. Open the app
   * 2. Click Aromatize button
   * 3. Click Ctrl+S
   * Actual result: NULL appears in the beginning of the content (Molfile V2000)
   * Expected result: NULL is not present
   */
  await IndigoFunctionsToolbar(page).aromatize();
  await CommonTopLeftToolbar(page).saveButton.click();
  const saveMolfilePreview = (
    await SaveStructureDialog(page).saveStructureTextarea.allTextContents()
  ).join();
  expect(saveMolfilePreview).not.toMatch(/^null\b/i);
});

test('Case 3: S-Group brackets should be drawn correctly for simple aromatic molecule', async () => {
  /**
   * Test task: https://github.com/epam/ketcher/issues/10502
   * Bug: https://github.com/epam/ketcher/issues/3976
   * Description: S-Group brackets should be drawn correctly for simple aromatic molecule
   * Scenario:
   * 1. Open the app
   * 2. Open KET/Chromium-popup/Bugs/ketcher-3.16.0-bugs/BrokenBrackets.ket file
   * 3. Check the S-Group brackets
   * Actual result: brackets are rotated and only include part of the molecule
   * Expected result: two vertical brackers are displayed at the left and right sides of the molecule
   */
  await openFileAndAddToCanvas(
    page,
    'KET/Chromium-popup/Bugs/ketcher-3.16.0-bugs/BrokenBrackets.ket',
  );
  await takeEditorScreenshot(page);
});

test('Case 4: S-Group labels should be positioned correctly after adding explicit hydrogens', async () => {
  /**
   * Test task: https://github.com/epam/ketcher/issues/10502
   * Bug: https://github.com/epam/ketcher/issues/3977
   * Description: S-Group labels should be positioned correctly after adding explicit hydrogens
   * Scenario:
   * 1. Open the app
   * 2. Open KET/Chromium-popup/Bugs/ketcher-3.16.0-bugs/All types of bond - Either topology - Unmarked - S-Group - Data - Bond.ket file
   * 3. Click the Add/Remove explicit hydrogens button
   * Actual result: S-groups labels are displayed above the structures
   * Expected result: S-group labels stay near the structures
   */
  await openFileAndAddToCanvas(
    page,
    'KET/Chromium-popup/Bugs/ketcher-3.16.0-bugs/All types of bond - Either topology - Unmarked - S-Group - Data - Bond.ket',
  );
  await IndigoFunctionsToolbar(page).addRemoveExplicitHydrogens();
  await takeEditorScreenshot(page);
});
