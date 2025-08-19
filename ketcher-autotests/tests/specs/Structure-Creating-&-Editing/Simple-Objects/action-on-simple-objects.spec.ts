import { Page, test } from '@fixtures';
import {
  openFileAndAddToCanvas,
  waitForPageInit,
  waitForRender,
  takeEditorScreenshot,
  clickInTheMiddleOfTheScreen,
  dragMouseTo,
  getCoordinatesOfTheMiddleOfTheScreen,
  clickOnCanvas,
  ZoomInByKeyboard,
  ZoomOutByKeyboard,
  deleteByKeyboard,
} from '@utils';
import {
  copyAndPaste,
  cutAndPaste,
  selectAllStructuresOnCanvas,
} from '@utils/canvas/selectSelection';
import {
  FileType,
  verifyFileExport,
} from '@utils/files/receiveFileComparisonData';
import { SelectionToolType } from '@tests/pages/constants/areaSelectionTool/Constants';
import { SaveStructureDialog } from '@tests/pages/common/SaveStructureDialog';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import { ShapeType } from '@tests/pages/constants/shapeSelectionTool/Constants';
import {
  BottomToolbar,
  drawBenzeneRing,
} from '@tests/pages/molecules/BottomToolbar';
import { StructureLibraryDialog } from '@tests/pages/molecules/canvas/StructureLibraryDialog';
import { TemplateLibraryTab } from '@tests/pages/constants/structureLibraryDialog/Constants';
import { TemplateEditDialog } from '@tests/pages/molecules/canvas/TemplateEditDialog';

const ellipseWidth = 120;
const ellipseHeight = 100;

const setupEllipse = async (page: Page) => {
  await LeftToolbar(page).selectShapeTool(ShapeType.Ellipse);
  const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
  const ellipseCoordinates = { x: x + ellipseWidth, y: y + ellipseHeight };
  await clickInTheMiddleOfTheScreen(page);
  await dragMouseTo(ellipseCoordinates.x, ellipseCoordinates.y, page);
  return ellipseCoordinates;
};

async function selectAndMoveSimpleObjects(page: Page) {
  const point = { x: 727, y: 359 };
  const point1 = { x: 83, y: 207 };
  await openFileAndAddToCanvas(page, 'KET/simple-objects.ket');
  await selectAllStructuresOnCanvas(page);
  await page.mouse.move(point.x, point.y);
  await page.mouse.down();
  await dragMouseTo(point1.x, point1.y, page);
}

async function saveToTemplates(page: Page) {
  const saveToTemplates = SaveStructureDialog(page).saveToTemplatesButton;
  const inputText = 'My New Template';

  await CommonTopLeftToolbar(page).saveFile();
  await saveToTemplates.click();
  await TemplateEditDialog(page).setMoleculeName(inputText);
  await TemplateEditDialog(page).save();
}

test.describe('Action on simples objects', () => {
  // selecting 'Shape Line', drawing it on canvas, highlighting created line
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Simple Objects - Zoom In, Zoom Out', async ({ page }) => {
    // Test case: EPMLSOPKET-1978
    await openFileAndAddToCanvas(page, 'KET/simple-objects.ket');
    await ZoomOutByKeyboard(page, { repeat: 5 });
    await takeEditorScreenshot(page);
    await ZoomInByKeyboard(page, { repeat: 5 });
    await takeEditorScreenshot(page);
  });

  test('Simple Object - Action with zoom tool', async ({ page }) => {
    // Test case: EPMLSOPKET-1980
    await CommonTopRightToolbar(page).setZoomInputValue('20');
    await setupEllipse(page);
    await CommonTopRightToolbar(page).setZoomInputValue('200');
    await clickInTheMiddleOfTheScreen(page);
    await CommonTopRightToolbar(page).setZoomInputValue('100');
    await CommonTopRightToolbar(page).zoomSelector.click();
    await takeEditorScreenshot(page);
  });

  test('Simple objest - Simple Objects and Structures selection', async ({
    page,
  }) => {
    // Test case: EPMLSOPKET-1981
    // Move the elements by dragging and dropping
    const point = { x: 639, y: 359 };
    const point1 = { x: 401, y: 179 };
    const point2 = { x: 492, y: 184 };
    const point3 = { x: 306, y: 224 };
    await setupEllipse(page);
    await page.mouse.move(point.x, point.y);
    await page.mouse.down();
    await dragMouseTo(point1.x, point1.y, page);
    await drawBenzeneRing(page);
    await takeEditorScreenshot(page);
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Lasso,
    );
    await clickOnCanvas(page, point2.x, point2.y, { from: 'pageTopLeft' });
    await waitForRender(page, async () => {
      await dragMouseTo(point3.x, point3.y, page);
    });
    await takeEditorScreenshot(page);
  });

  test('Simple object - Delete Simple Objects with Delete button', async ({
    page,
  }) => {
    // Test case: EPMLSOPKET-1983
    await openFileAndAddToCanvas(page, 'KET/simple-objects.ket');
    await selectAllStructuresOnCanvas(page);
    await deleteByKeyboard(page);
    await takeEditorScreenshot(page);
  });

  test('Simple object - Delete Simple Objects with Backspace button', async ({
    page,
  }) => {
    // Test case: EPMLSOPKET-1983
    await openFileAndAddToCanvas(page, 'KET/simple-objects.ket');
    await selectAllStructuresOnCanvas(page);
    await page.keyboard.press('Backspace');
    await takeEditorScreenshot(page);
  });

  test('Simple Objects - Copy/Cut/Paste actions on simple objects', async ({
    page,
  }) => {
    // Test case: EPMLSOPKET-1984
    const numberOfPress = 1;
    const anyPointX = 200;
    const anyPointY = 200;
    await openFileAndAddToCanvas(page, 'KET/simple-objects.ket');
    await ZoomOutByKeyboard(page, { repeat: 5 });
    await copyAndPaste(page);
    await clickOnCanvas(page, anyPointX, anyPointY, { from: 'pageTopLeft' });
    await takeEditorScreenshot(page);
    for (let i = 0; i < numberOfPress; i++) {
      await CommonTopLeftToolbar(page).undo();
    }
    await cutAndPaste(page);
    await clickOnCanvas(page, anyPointX, anyPointY, { from: 'pageTopLeft' });
    await takeEditorScreenshot(page);
    for (let i = 0; i < numberOfPress; i++) {
      await CommonTopLeftToolbar(page).undo();
    }
    await takeEditorScreenshot(page);
  });

  test('Simple Objects - Adding structure to simple objects', async ({
    page,
  }) => {
    // Test case: EPMLSOPKET-1982
    // Open file with simple object and adding some structure
    await selectAndMoveSimpleObjects(page);
    await waitForRender(page, async () => {
      await drawBenzeneRing(page);
    });
    await takeEditorScreenshot(page);
  });

  test('Simple objects - Open and save as .ket file', async ({ page }) => {
    // Test case: EPMLSOPKET-1982
    await openFileAndAddToCanvas(page, 'KET/simple-objects-with-changes.ket');

    await verifyFileExport(
      page,
      'KET/simple-objects-with-changes-expected.ket',
      FileType.KET,
    );
    await takeEditorScreenshot(page);
  });

  test('Simple Objects - Save to Templates', async ({ page }) => {
    // Test case: EPMLSOPKET-14027
    await selectAndMoveSimpleObjects(page);
    await clickInTheMiddleOfTheScreen(page);
    await drawBenzeneRing(page);
    await saveToTemplates(page);
    await CommonTopLeftToolbar(page).clearCanvas();
    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).openSection(
      TemplateLibraryTab.UserTemplate,
    );
    await takeEditorScreenshot(page);
  });
});
