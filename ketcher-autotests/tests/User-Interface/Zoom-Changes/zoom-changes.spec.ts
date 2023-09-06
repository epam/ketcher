import { test, expect } from '@playwright/test';
import { TestIdSelectors } from '../../utils/selectors/testIdSelectors';
import { clickInTheMiddleOfTheScreen, pressButton } from '@utils/clicks';
import {
  FunctionalGroups,
  STRUCTURE_LIBRARY_BUTTON_NAME,
  TemplateLibrary,
  TopPanelButton,
  selectFunctionalGroups,
  selectUserTemplatesAndPlaceInTheMiddle,
} from '@utils/selectors';
import {
  resetCurrentTool,
  selectTopPanelButton,
  takeEditorScreenshot,
  takeTopToolbarScreenshot,
} from '@utils/canvas';
import { openFileAndAddToCanvas } from '@utils/files';

const randomNegativeNumber = -60;
const randomPositiveNumber = 60;

test.describe('Zoom changes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });

  /* Editor is zoomed correctly: */
  /* Zoom in */
  test('when using ctrl + mouse scroll up', async ({ page }) => {
    await clickInTheMiddleOfTheScreen(page);

    await page.keyboard.down('Control');
    await page.mouse.wheel(0, randomNegativeNumber);
    await page.mouse.wheel(0, randomNegativeNumber);
    await page.keyboard.up('Control');

    const zoomInput = page.getByTestId(TestIdSelectors.ZoomInput);
    const zoomInputValue = await zoomInput.evaluate(
      (el: HTMLElement) => el.innerText,
    );

    expect(zoomInputValue).toBe('120%');
  });

  /* Zoom out */
  test('when using ctrl + mouse scroll down', async ({ page }) => {
    await clickInTheMiddleOfTheScreen(page);

    await page.keyboard.down('Control');
    await page.mouse.wheel(0, randomPositiveNumber);
    await page.mouse.wheel(0, randomPositiveNumber);
    await page.keyboard.up('Control');

    const zoomInput = page.getByTestId(TestIdSelectors.ZoomInput);
    const zoomInputValue = await zoomInput.evaluate(
      (el: HTMLElement) => el.innerText,
    );

    expect(zoomInputValue).toBe('80%');
  });

  test('Zoom In button verification', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1761
    */
    await pressButton(page, STRUCTURE_LIBRARY_BUTTON_NAME);
    await page.getByRole('tab', { name: 'Functional Groups' }).click();
    await selectFunctionalGroups(FunctionalGroups.CO2Et, page);
    await clickInTheMiddleOfTheScreen(page);
    await resetCurrentTool(page);

    await takeTopToolbarScreenshot(page);
    await takeEditorScreenshot(page);

    const zoomInput = page.getByTestId(TestIdSelectors.ZoomInput);
    zoomInput.click();
    await page.getByText('Zoom in').click();

    await takeTopToolbarScreenshot(page);
    await takeEditorScreenshot(page);
  });

  test('Zoom Out button verification', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1762
    */
    await pressButton(page, STRUCTURE_LIBRARY_BUTTON_NAME);
    await page.getByRole('tab', { name: 'Functional Groups' }).click();
    await selectFunctionalGroups(FunctionalGroups.CO2Et, page);
    await clickInTheMiddleOfTheScreen(page);
    await resetCurrentTool(page);

    await takeTopToolbarScreenshot(page);
    await takeEditorScreenshot(page);

    const zoomInput = page.getByTestId(TestIdSelectors.ZoomInput);
    zoomInput.click();
    await page.getByText('Zoom out').click();

    await takeTopToolbarScreenshot(page);
    await takeEditorScreenshot(page);
  });

  test('Zoom in&out structure verification', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1763, EPMLSOPKET-1764
    */
    await selectUserTemplatesAndPlaceInTheMiddle(TemplateLibrary.Azulene, page);
    await resetCurrentTool(page);

    const zoomInput = page.getByTestId(TestIdSelectors.ZoomInput);
    zoomInput.click();
    await page.getByText('Zoom in').click();
    const zoomInputValue = await zoomInput.evaluate(
      (el: HTMLElement) => el.innerText,
    );
    expect(zoomInputValue).toBe('110%');

    await takeTopToolbarScreenshot(page);
    await takeEditorScreenshot(page);

    await resetCurrentTool(page);
    await selectTopPanelButton(TopPanelButton.Undo, page);
    await takeTopToolbarScreenshot(page);
    await takeEditorScreenshot(page);

    await resetCurrentTool(page);
    await selectTopPanelButton(TopPanelButton.Redo, page);
    await takeTopToolbarScreenshot(page);
    await takeEditorScreenshot(page);

    await resetCurrentTool(page);
    await selectTopPanelButton(TopPanelButton.Clear, page);
    await resetCurrentTool(page);

    await pressButton(page, STRUCTURE_LIBRARY_BUTTON_NAME);
    await page.getByRole('tab', { name: 'Functional Groups' }).click();
    await selectFunctionalGroups(FunctionalGroups.CO2Et, page);
    await clickInTheMiddleOfTheScreen(page);
    await resetCurrentTool(page);

    await page.keyboard.press('+');
    const zoomInputValueOne = await zoomInput.evaluate(
      (el: HTMLElement) => el.innerText,
    );
    expect(zoomInputValueOne).toBe('110%');
  });

  test('Zoom actions for structures with query features', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1765
    */
    await openFileAndAddToCanvas(
      'Molfiles-V2000/clean-diff-properties.mol',
      page,
    );
    const zoomInput = page.getByTestId(TestIdSelectors.ZoomInput);
    zoomInput.click();
    await page.getByText('Zoom in').click();
    await takeTopToolbarScreenshot(page);
    const zoomInputValue = await zoomInput.evaluate(
      (el: HTMLElement) => el.innerText,
    );
    expect(zoomInputValue).toBe('110%');

    await page.getByText('Zoom in').click();
    const zoomInputValueOne = await zoomInput.evaluate(
      (el: HTMLElement) => el.innerText,
    );
    expect(zoomInputValueOne).toBe('120%');

    await page.getByText('Zoom out').click();
    const zoomInputValueTwo = await zoomInput.evaluate(
      (el: HTMLElement) => el.innerText,
    );
    expect(zoomInputValueTwo).toBe('110%');

    await page.getByText('Zoom out').click();
    const zoomInputValueThree = await zoomInput.evaluate(
      (el: HTMLElement) => el.innerText,
    );
    expect(zoomInputValueThree).toBe('100%');
  });

  test('Zoom actions for structures with Rgroup', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1766
    */

    await openFileAndAddToCanvas(
      'Molfiles-V2000/all-kind-of-r-group.mol',
      page,
    );

    const zoomInput = page.getByTestId(TestIdSelectors.ZoomInput);
    zoomInput.click();
    await page.getByText('Zoom in').click();
    const zoomInputValue = await zoomInput.evaluate(
      (el: HTMLElement) => el.innerText,
    );
    expect(zoomInputValue).toBe('110%');
    await takeEditorScreenshot(page);

    await page.getByText('Zoom in').click();
    const zoomInputValueOne = await zoomInput.evaluate(
      (el: HTMLElement) => el.innerText,
    );
    expect(zoomInputValueOne).toBe('120%');
    await takeEditorScreenshot(page);

    await page.getByText('Zoom out').click();
    const zoomInputValueTwo = await zoomInput.evaluate(
      (el: HTMLElement) => el.innerText,
    );
    expect(zoomInputValueTwo).toBe('110%');
    await takeEditorScreenshot(page);

    await page.getByText('Zoom out').click();
    const zoomInputValueThree = await zoomInput.evaluate(
      (el: HTMLElement) => el.innerText,
    );
    expect(zoomInputValueThree).toBe('100%');
    await takeEditorScreenshot(page);
  });
});
