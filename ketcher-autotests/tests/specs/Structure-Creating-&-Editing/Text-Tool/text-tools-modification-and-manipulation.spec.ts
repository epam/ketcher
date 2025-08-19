import { Page, test } from '@fixtures';
import {
  takeEditorScreenshot,
  waitForPageInit,
  pressButton,
  openFileAndAddToCanvas,
  clickInTheMiddleOfTheScreen,
  dragMouseTo,
  waitForRender,
  clickOnCanvas,
  ZoomInByKeyboard,
  ZoomOutByKeyboard,
  deleteByKeyboard,
} from '@utils';
import { selectAllStructuresOnCanvas } from '@utils/canvas/selectSelection';
import { SelectionToolType } from '@tests/pages/constants/areaSelectionTool/Constants';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { selectRingButton } from '@tests/pages/molecules/BottomToolbar';
import { RingButton } from '@tests/pages/constants/ringButton/Constants';
import {
  addTextBoxToCanvas,
  TextEditorDialog,
} from '@tests/pages/molecules/canvas/TextEditorDialog';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import { getTextLabelLocator } from '@utils/canvas/text/getTextLabelLocator';

async function selectStructureWithSelectionTool(page: Page) {
  const point = { x: 97, y: 79 };
  const point1 = { x: 943, y: 114 };
  const point2 = { x: 844, y: 579 };
  const point3 = { x: 66, y: 611 };
  await page.mouse.move(point.x, point.y);
  await page.mouse.down();
  await page.mouse.move(point1.x, point1.y);
  await page.mouse.move(point2.x, point2.y);
  await page.mouse.move(point3.x, point3.y);
  await page.mouse.up();
}

async function moveStructureToNewPosition(page: Page) {
  const point = { x: 656, y: 359 };
  const point1 = { x: 906, y: 245 };
  await page.mouse.move(point.x, point.y);
  await page.mouse.down();
  await dragMouseTo(point1.x, point1.y, page);
  await page.mouse.up();
}

test.describe('Text tools test cases', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test(' Modify the created text object', async ({ page }) => {
    // Test case: EPMLSOPKET-2228
    // Verify if possible is modify created text object by adding some extra symbols
    await addTextBoxToCanvas(page);
    await TextEditorDialog(page).setText('TEST');
    await TextEditorDialog(page).apply();
    await takeEditorScreenshot(page);
    await getTextLabelLocator(page, { text: 'TEST' }).dblclick();
    await TextEditorDialog(page).addText('TEST123');
    await TextEditorDialog(page).apply();
    await takeEditorScreenshot(page);
  });

  test(' Delete the created text object', async ({ page }) => {
    // Test case: EPMLSOPKET-2229
    // Delte created text object with Erase tool
    await addTextBoxToCanvas(page);
    await TextEditorDialog(page).setText('TEST');
    await TextEditorDialog(page).apply();
    await CommonLeftToolbar(page).selectEraseTool();
    await getTextLabelLocator(page, { text: 'TEST' }).click();
    await CommonTopLeftToolbar(page).undo();
    await CommonTopLeftToolbar(page).redo();
    await CommonTopLeftToolbar(page).undo();
    await takeEditorScreenshot(page);
  });

  // Delete created text object with and Lasso Selection Tool and 'Delete' button on a keyboard
  test(' Delete created text object with Selection Tool and "Delete" button on a keyboard', async ({
    page,
  }) => {
    await openFileAndAddToCanvas(page, 'KET/text-object-for-test.ket');
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Lasso,
    );
    await getTextLabelLocator(page, { text: 'TEXT' }).click();
    await deleteByKeyboard(page);
    await CommonTopLeftToolbar(page).undo();
    await CommonTopLeftToolbar(page).redo();
    await CommonTopLeftToolbar(page).undo();
    await takeEditorScreenshot(page);
  });

  // Delete created text object in the text editor field
  test(' Delete created text object in the text editor field', async ({
    page,
  }) => {
    await openFileAndAddToCanvas(page, 'KET/test-text-object.ket');
    await getTextLabelLocator(page, { text: 'TEST' }).dblclick();
    await pressButton(page, 'Cancel');
    await getTextLabelLocator(page, { text: 'TEST' }).dblclick();
    await TextEditorDialog(page).selectAllText();
    await deleteByKeyboard(page);
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
    await CommonTopLeftToolbar(page).undo();
    await CommonTopLeftToolbar(page).redo();
    await CommonTopLeftToolbar(page).undo();
    await takeEditorScreenshot(page);
  });

  test('Create a single text object by pasting text', async ({ page }) => {
    // Test case: EPMLSOPKET-2230
    // Verify if possible is create text object by pasting text
    const pasteText =
      'Ketcher is a tool to draw molecular structures and chemical reactions';
    await addTextBoxToCanvas(page);
    await TextEditorDialog(page).setText(pasteText);
    await TextEditorDialog(page).cancel();
    await LeftToolbar(page).text();
    await clickInTheMiddleOfTheScreen(page);
    await TextEditorDialog(page).setText(pasteText);
    await TextEditorDialog(page).apply();
    await takeEditorScreenshot(page);
  });

  test('Create several text objects and modifited them', async ({ page }) => {
    const x = 150;
    const y = 145;
    // Test case: EPMLSOPKET-2231 & EPMLSOPKET-2232
    // Verify if possible is created few text object and modify them
    await addTextBoxToCanvas(page);
    await TextEditorDialog(page).setText('&&&');
    await TextEditorDialog(page).cancel();

    await clickInTheMiddleOfTheScreen(page);
    await TextEditorDialog(page).setText('+++');
    await TextEditorDialog(page).apply();
    await takeEditorScreenshot(page);

    await clickOnCanvas(page, x, y, { from: 'pageTopLeft' });
    await TextEditorDialog(page).setText(
      'Ketcher is a tool to draw molecular structures and chemical reactions',
    );
    await TextEditorDialog(page).apply();

    await getTextLabelLocator(page, { text: '+++' }).dblclick();
    await TextEditorDialog(page).addText('123');
    await TextEditorDialog(page).cancel();

    await getTextLabelLocator(page, { text: '+++' }).dblclick();
    await selectAllStructuresOnCanvas(page);
    await TextEditorDialog(page).addText('Test');
    await TextEditorDialog(page).apply();
    await takeEditorScreenshot(page);

    await getTextLabelLocator(page, {
      text: 'Ketcher is a tool to draw molecular structures and chemical reactions',
    }).dblclick();

    await TextEditorDialog(page).addText('123');
    await TextEditorDialog(page).cancel();

    await getTextLabelLocator(page, {
      text: 'Ketcher is a tool to draw molecular structures and chemical reactions',
    }).dblclick();

    await selectAllStructuresOnCanvas(page);
    await TextEditorDialog(page).addText('Super');
    await TextEditorDialog(page).apply();
    await takeEditorScreenshot(page);
  });

  test(' Delete several created text objects', async ({ page }) => {
    // Test case: EPMLSOPKET-2233
    // Delete several created ealier text objects with hotkey (Delete) and  'Erase' tool.
    await addTextBoxToCanvas(page);
    await TextEditorDialog(page).setText('&&&');
    await TextEditorDialog(page).apply();
    await takeEditorScreenshot(page);

    await page.getByTestId('canvas').click({ position: { x: 100, y: 100 } });
    await TextEditorDialog(page).setText('Ketcher is a coool tool');
    await TextEditorDialog(page).apply();
    await takeEditorScreenshot(page);
  });

  test('Text tool - Delete with Erase tool', async ({ page }) => {
    await openFileAndAddToCanvas(page, 'KET/two-different-text-objects.ket');
    await CommonLeftToolbar(page).selectEraseTool();
    await getTextLabelLocator(page, { text: '&&&' }).dblclick();
    await CommonTopLeftToolbar(page).undo();
    await CommonTopLeftToolbar(page).redo();
    await CommonTopLeftToolbar(page).undo();
    await takeEditorScreenshot(page);
  });

  test('Delete with and Lasso Selection Tool and "Delete" button on a keyboard', async ({
    page,
  }) => {
    await openFileAndAddToCanvas(page, 'KET/two-different-text-objects.ket');
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Lasso,
    );
    await getTextLabelLocator(page, {
      text: 'Ketcher is a cool tool',
    }).click();
    await deleteByKeyboard(page);
    await CommonTopLeftToolbar(page).undo();
    await CommonTopLeftToolbar(page).redo();
    await CommonTopLeftToolbar(page).undo();
    await takeEditorScreenshot(page);
  });

  test(' Delete two objects with Erase and Lasso Selection Tool and "Delete" button on a keyboard', async ({
    page,
  }) => {
    await openFileAndAddToCanvas(page, 'KET/two-different-text-objects.ket');
    await clickInTheMiddleOfTheScreen(page);
    await selectAllStructuresOnCanvas(page);
    await page
      .getByTestId('erase')
      .filter({ has: page.locator(':visible') })
      .click();
    await CommonTopLeftToolbar(page).undo();
    await CommonTopLeftToolbar(page).redo();
    await CommonTopLeftToolbar(page).undo();
    await takeEditorScreenshot(page);
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Lasso,
    );
    await selectStructureWithSelectionTool(page);
    await deleteByKeyboard(page);
    await CommonTopLeftToolbar(page).undo();
    await CommonTopLeftToolbar(page).redo();
    await CommonTopLeftToolbar(page).undo();
    await takeEditorScreenshot(page);
  });

  test(' Manipulations with the created text object', async ({ page }) => {
    // Test case: EPMLSOPKET-2234
    // Verify if possible is to modify created ealier text object and moving it with use Selection Tool
    await addTextBoxToCanvas(page);
    await TextEditorDialog(page).setText('Test123');
    await TextEditorDialog(page).apply();
    await CommonTopLeftToolbar(page).undo();
    await CommonTopLeftToolbar(page).redo();
    await selectAllStructuresOnCanvas(page);
    await getTextLabelLocator(page, { text: 'Test123' }).click();
    await moveStructureToNewPosition(page);
    await takeEditorScreenshot(page);
  });

  test(' Manipulations with the another created text object', async ({
    page,
  }) => {
    // Verify if possible is perform different manipulations with text objects using different tools (zoom)
    await addTextBoxToCanvas(page);
    await TextEditorDialog(page).setText('ABC123');
    await TextEditorDialog(page).apply();
    await CommonTopLeftToolbar(page).undo();
    await CommonTopLeftToolbar(page).redo();
    await selectAllStructuresOnCanvas(page);
    await getTextLabelLocator(page, { text: 'ABC123' }).click();
    await moveStructureToNewPosition(page);
    await ZoomInByKeyboard(page, { repeat: 2 });
    await takeEditorScreenshot(page);
    await ZoomOutByKeyboard(page, { repeat: 2 });
    await takeEditorScreenshot(page);
  });

  test(' Selection of a text object and a structure', async ({ page }) => {
    const x = 500;
    const y = 250;
    // Test case: EPMLSOPKET-2236
    // Verify if all created and selected elements are moved together
    await addTextBoxToCanvas(page);
    await TextEditorDialog(page).setText('OneTwoThree');
    await TextEditorDialog(page).apply();
    await selectRingButton(page, RingButton.Benzene);
    await waitForRender(page, async () => {
      await page.getByTestId('canvas').click({ position: { x, y } });
    });
    await takeEditorScreenshot(page);
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Lasso,
    );
    await selectStructureWithSelectionTool(page);
    await moveStructureToNewPosition(page);
    await takeEditorScreenshot(page);
  });
});
