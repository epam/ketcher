import { test, expect, Page } from '@fixtures';
import {
  takeTopToolbarScreenshot,
  takeEditorScreenshot,
  clickInTheMiddleOfTheScreen,
  openFileAndAddToCanvas,
  waitForPageInit,
  ZoomOutByKeyboard,
  ZoomInByKeyboard,
  readFileContent,
  pasteFromClipboardAndAddToCanvas,
} from '@utils';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import {
  BottomToolbar,
  drawBenzeneRing,
} from '@tests/pages/molecules/BottomToolbar';
import { expandAbbreviation } from '@utils/sgroup/helpers';
import {
  AromaticsTemplate,
  FunctionalGroupsTabItems,
  TemplateLibraryTab,
} from '@tests/pages/constants/structureLibraryDialog/Constants';
import { StructureLibraryDialog } from '@tests/pages/molecules/canvas/StructureLibraryDialog';
import { getAbbreviationLocator } from '@utils/canvas/s-group-signes/getAbbreviation';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';

async function checkZoomLevel(page: Page, zoomLevel: string) {
  const zoomSelector = CommonTopRightToolbar(page).zoomSelector;
  await expect(zoomSelector).toContainText(zoomLevel);
}

const randomNegativeNumber = -60;
const randomPositiveNumber = 60;

test.describe('Zoom changes', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Zoom in on the position of mouse when using `ctrl` and mouse wheel to scroll up', async ({
    page,
  }) => {
    /* 
    Test case: EPMLSOPKET-16880
    Description: Editor is zoomed correctly: Zoom In to 120%
    */
    const numberOfMouseWheelScroll = 2;

    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).addFunctionalGroup(
      FunctionalGroupsTabItems.CO2Et,
    );
    await clickInTheMiddleOfTheScreen(page);
    CommonLeftToolbar(page).selectAreaSelectionTool();

    await page.keyboard.down('Control');
    for (let i = 0; i < numberOfMouseWheelScroll; i++) {
      await page.mouse.wheel(0, randomNegativeNumber);
    }
    await page.keyboard.up('Control');

    await checkZoomLevel(page, '120%');
    await takeEditorScreenshot(page);
  });

  test('Zoom out on the position of mouse when using `ctrl` and mouse wheel to scroll down', async ({
    page,
  }) => {
    /* 
    Test case: EPMLSOPKET-16880
    Description: Editor is zoomed correctly: Zoom Out to 80%
    */
    const numberOfMouseWheelScroll = 2;

    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).addFunctionalGroup(
      FunctionalGroupsTabItems.CO2Et,
    );
    await clickInTheMiddleOfTheScreen(page);
    CommonLeftToolbar(page).selectAreaSelectionTool();

    await page.keyboard.down('Control');
    for (let i = 0; i < numberOfMouseWheelScroll; i++) {
      await page.mouse.wheel(0, randomPositiveNumber);
    }
    await page.keyboard.up('Control');

    await checkZoomLevel(page, '80%');
    await takeEditorScreenshot(page);
  });

  test('Zoom In button verification', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1761
    */
    const zoomSelector = CommonTopRightToolbar(page).zoomSelector;
    const zoomInButton = CommonTopRightToolbar(page).zoomInButton;
    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).addFunctionalGroup(
      FunctionalGroupsTabItems.CO2Et,
    );
    await clickInTheMiddleOfTheScreen(page);
    CommonLeftToolbar(page).selectAreaSelectionTool();

    await expandAbbreviation(
      page,
      getAbbreviationLocator(page, { name: 'CO2Et' }),
    );

    await zoomSelector.click();
    await zoomInButton.click();

    await checkZoomLevel(page, '110%');
    await takeEditorScreenshot(page);
  });

  test('Zoom Out button verification', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1762
    */
    const zoomSelector = CommonTopRightToolbar(page).zoomSelector;
    const zoomOut = CommonTopRightToolbar(page).zoomOutButton;
    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).addFunctionalGroup(
      FunctionalGroupsTabItems.CO2Et,
    );
    await clickInTheMiddleOfTheScreen(page);
    CommonLeftToolbar(page).selectAreaSelectionTool();

    await expandAbbreviation(
      page,
      getAbbreviationLocator(page, { name: 'CO2Et' }),
    );
    await zoomSelector.click();
    await zoomOut.click();

    await checkZoomLevel(page, '90%');
    await takeEditorScreenshot(page);
  });

  test('Zoom In and Undo/Redo structure verification', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1763, EPMLSOPKET-1764
    */
    const zoomSelector = CommonTopRightToolbar(page).zoomSelector;
    const zoomInButton = CommonTopRightToolbar(page).zoomInButton;
    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).addTemplate(
      TemplateLibraryTab.Aromatics,
      AromaticsTemplate.Azulene,
    );
    await clickInTheMiddleOfTheScreen(page);
    CommonLeftToolbar(page).selectAreaSelectionTool();

    await zoomSelector.click();
    await zoomInButton.click();
    await checkZoomLevel(page, '110%');

    CommonLeftToolbar(page).selectAreaSelectionTool();
    await CommonTopLeftToolbar(page).undo();
    await takeTopToolbarScreenshot(page);
    await takeEditorScreenshot(page);

    CommonLeftToolbar(page).selectAreaSelectionTool();
    await CommonTopLeftToolbar(page).redo();
    await takeTopToolbarScreenshot(page);
    await takeEditorScreenshot(page);
  });

  test('Zoom In by hotkey structure verification.', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1763, EPMLSOPKET-1764
      */
    const zoomSelector = CommonTopRightToolbar(page).zoomSelector;
    const zoomInButton = CommonTopRightToolbar(page).zoomInButton;
    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).addFunctionalGroup(
      FunctionalGroupsTabItems.CO2Et,
    );
    await clickInTheMiddleOfTheScreen(page);
    CommonLeftToolbar(page).selectAreaSelectionTool();

    await ZoomInByKeyboard(page);
    await zoomSelector.click();
    await zoomInButton.click();
    await checkZoomLevel(page, '120%');
    await takeEditorScreenshot(page);
  });

  test('Zoom Out by hotkey structure verification.', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-18056
      */
    const zoomSelector = CommonTopRightToolbar(page).zoomSelector;
    const zoomOutButton = CommonTopRightToolbar(page).zoomOutButton;

    await drawBenzeneRing(page);
    CommonLeftToolbar(page).selectAreaSelectionTool();

    await ZoomOutByKeyboard(page);
    await zoomSelector.click();
    await zoomOutButton.click();
    await checkZoomLevel(page, '80%');
    await takeEditorScreenshot(page);
  });

  test('Zoom actions for structures with query features', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1765
    */
    const zoomSelector = CommonTopRightToolbar(page).zoomSelector;
    const zoomInButton = CommonTopRightToolbar(page).zoomInButton;
    const zoomOutButton = CommonTopRightToolbar(page).zoomOutButton;
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/clean-diff-properties.mol',
    );
    await zoomSelector.click();
    await zoomInButton.click();
    await checkZoomLevel(page, '110%');

    await zoomInButton.click();
    await checkZoomLevel(page, '120%');

    await zoomOutButton.click();
    await checkZoomLevel(page, '110%');

    await zoomOutButton.click();
    await checkZoomLevel(page, '100%');
  });

  test('Zoom actions for structures with Rgroup', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1766
    */
    const zoomSelector = CommonTopRightToolbar(page).zoomSelector;
    const zoomInButton = CommonTopRightToolbar(page).zoomInButton;
    const zoomOutButton = CommonTopRightToolbar(page).zoomOutButton;

    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/all-kind-of-r-group.mol',
    );

    await zoomSelector.click();
    await zoomInButton.click();
    await checkZoomLevel(page, '110%');

    await takeEditorScreenshot(page);

    await zoomInButton.click();
    await checkZoomLevel(page, '120%');

    await takeEditorScreenshot(page);

    await zoomOutButton.click();
    await checkZoomLevel(page, '110%');

    await takeEditorScreenshot(page);

    await zoomOutButton.click();
    await checkZoomLevel(page, '100%');

    await takeEditorScreenshot(page);
  });

  test('Automatically adjust zoom when opening a structure from a file', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-17662, EPMLSOPKET-16882
      Description: The correct structure fits on the canvas, and the zoom percentage 
      has decreased on the "Zoom panel"
    */
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/long-chain.mol');
    await expect(page).toHaveScreenshot();
  });

  test('Automatically adjust zoom when pasting a structure from a file', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-17663
      Description: The correct structure fits on the canvas, and the zoom percentage 
      has decreased on the "Zoom panel"
    */
    const fileContent = await readFileContent('Molfiles-V2000/long-chain.mol');

    await pasteFromClipboardAndAddToCanvas(page, fileContent);
    await clickInTheMiddleOfTheScreen(page);
    await expect(page).toHaveScreenshot();
  });
});
