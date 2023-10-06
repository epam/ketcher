import { test, expect, Page } from '@playwright/test';
import {
  resetCurrentTool,
  takeTopToolbarScreenshot,
  takeEditorScreenshot,
  selectTopPanelButton,
  clickInTheMiddleOfTheScreen,
  selectFunctionalGroups,
  FunctionalGroups,
  selectUserTemplatesAndPlaceInTheMiddle,
  TemplateLibrary,
  TopPanelButton,
  openFileAndAddToCanvas,
  waitForPageInit,
} from '@utils';
import { TestIdSelectors } from '@utils/selectors/testIdSelectors';

async function checkZoomLevel(page: Page, zoomLevel: string) {
  const zoomInput = page.getByTestId(TestIdSelectors.ZoomInput);
  const zoomInputValue = await zoomInput.evaluate(
    (el: HTMLElement) => el.innerText,
  );
  expect(zoomInputValue).toBe(zoomLevel);
}

const randomNegativeNumber = -60;
const randomPositiveNumber = 60;

test.describe('Zoom changes', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('when using ctrl + mouse scroll up', async ({ page }) => {
    /* 
    Description: Editor is zoomed correctly: Zoom In to 120%
    */
    const numberOfMouseWheelScroll = 2;

    await clickInTheMiddleOfTheScreen(page);

    await page.keyboard.down('Control');
    for (let i = 0; i < numberOfMouseWheelScroll; i++) {
      await page.mouse.wheel(0, randomNegativeNumber);
    }
    await page.keyboard.up('Control');

    await checkZoomLevel(page, '120%');
  });

  test('when using ctrl + mouse scroll down', async ({ page }) => {
    /* 
    Description: Editor is zoomed correctly: Zoom Out to 80%
    */
    const numberOfMouseWheelScroll = 2;

    await clickInTheMiddleOfTheScreen(page);

    await page.keyboard.down('Control');
    for (let i = 0; i < numberOfMouseWheelScroll; i++) {
      await page.mouse.wheel(0, randomPositiveNumber);
    }
    await page.keyboard.up('Control');

    await checkZoomLevel(page, '80%');
  });

  test('Zoom In button verification', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1761
    */
    await selectFunctionalGroups(FunctionalGroups.CO2Et, page);
    await clickInTheMiddleOfTheScreen(page);
    await resetCurrentTool(page);

    await page.getByText('CO2Et').click({ button: 'right' });
    await page.getByText('Expand Abbreviation').click();
    await page.getByTestId('zoom-input').click();
    await page.getByTestId('zoom-in').click();

    await checkZoomLevel(page, '110%');
  });

  test('Zoom Out button verification', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1762
    */
    await selectFunctionalGroups(FunctionalGroups.CO2Et, page);
    await clickInTheMiddleOfTheScreen(page);
    await resetCurrentTool(page);

    await page.getByText('CO2Et').click({ button: 'right' });
    await page.getByText('Expand Abbreviation').click();
    await page.getByTestId('zoom-input').click();
    await page.getByTestId('zoom-out').click();

    await checkZoomLevel(page, '90%');
  });

  test('Zoom In and Undo/Redo structure verification', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1763, EPMLSOPKET-1764
    */
    await selectUserTemplatesAndPlaceInTheMiddle(TemplateLibrary.Azulene, page);
    await resetCurrentTool(page);

    await page.getByTestId('zoom-input').click();
    await page.getByTestId('zoom-in').click();
    await checkZoomLevel(page, '110%');

    await resetCurrentTool(page);
    await selectTopPanelButton(TopPanelButton.Undo, page);
    await takeTopToolbarScreenshot(page);
    await takeEditorScreenshot(page);

    await resetCurrentTool(page);
    await selectTopPanelButton(TopPanelButton.Redo, page);
    await takeTopToolbarScreenshot(page);
    await takeEditorScreenshot(page);
  });

  test('Zoom In by hotkey structure verification.', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1763, EPMLSOPKET-1764
      */
    await selectFunctionalGroups(FunctionalGroups.CO2Et, page);
    await clickInTheMiddleOfTheScreen(page);
    await resetCurrentTool(page);

    await page.keyboard.press('Control+=');
    await page.getByTestId('zoom-input').click();
    await page.getByTestId('zoom-in').click();
    await checkZoomLevel(page, '120%');
  });

  test('Zoom actions for structures with query features', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1765
    */
    await openFileAndAddToCanvas(
      'Molfiles-V2000/clean-diff-properties.mol',
      page,
    );
    await page.getByTestId('zoom-input').click();
    await page.getByTestId('zoom-in').click();
    await checkZoomLevel(page, '110%');

    await page.getByTestId('zoom-in').click();
    await checkZoomLevel(page, '120%');

    await page.getByTestId('zoom-out').click();
    await checkZoomLevel(page, '110%');

    await page.getByTestId('zoom-out').click();
    await checkZoomLevel(page, '100%');
  });

  test('Zoom actions for structures with Rgroup', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1766
    */

    await openFileAndAddToCanvas(
      'Molfiles-V2000/all-kind-of-r-group.mol',
      page,
    );

    await page.getByTestId('zoom-input').click();
    await page.getByTestId('zoom-in').click();
    await checkZoomLevel(page, '110%');

    await takeEditorScreenshot(page);

    await page.getByTestId('zoom-in').click();
    await checkZoomLevel(page, '120%');

    await takeEditorScreenshot(page);

    await page.getByTestId('zoom-out').click();
    await checkZoomLevel(page, '110%');

    await takeEditorScreenshot(page);

    await page.getByTestId('zoom-out').click();
    await checkZoomLevel(page, '100%');

    await takeEditorScreenshot(page);
  });
});
