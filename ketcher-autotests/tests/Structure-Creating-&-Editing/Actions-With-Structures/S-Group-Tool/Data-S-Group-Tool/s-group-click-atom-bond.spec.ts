import { test } from '@playwright/test';
import {
  getCoordinatesTopAtomOfBenzeneRing,
  selectRingButton,
  LeftPanelButton,
  selectLeftPanelButton,
  clickInTheMiddleOfTheScreen,
  takeEditorScreenshot,
  RingButton,
} from '@utils';

test.describe('S-Group Properties', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  test('Checking S-Group drop-down types', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1502
      Description: Checking S-Group drop-down types 'Type' drop-down list with Data, 
      Multiple group, SRU polymer and Superatom items. Data item is selected by default;
    */
    await selectRingButton(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);

    await selectLeftPanelButton(LeftPanelButton.S_Group, page);
    const { x, y } = await getCoordinatesTopAtomOfBenzeneRing(page);
    await page.mouse.click(x, y);
    await page.getByRole('button', { name: 'Data' }).click();
  });

  test('A superatom named `Test` is created', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1537
      Description: A superatom named `Test` is created. Atom enclosed in brackets.
    */
    await selectRingButton(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);

    await selectLeftPanelButton(LeftPanelButton.S_Group, page);
    const { x, y } = await getCoordinatesTopAtomOfBenzeneRing(page);
    await page.mouse.click(x, y);
    await page.getByRole('button', { name: 'Data' }).click();
    await page.getByRole('option', { name: 'Superatom' }).click();
    await page.getByLabel('Name').click();
    await page.getByLabel('Name').fill('Test');

    await takeEditorScreenshot(page);
    await page.getByRole('button', { name: 'Apply' }).click();
  });

  test('An atom is created with the name `Test` and the value 8', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1542
      Description: An atom is created with the name `Test` and the value 8
    */
    const testName = 'Test';
    const testValue = '8';
    await selectRingButton(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);

    await selectLeftPanelButton(LeftPanelButton.S_Group, page);
    const { x, y } = await getCoordinatesTopAtomOfBenzeneRing(page);
    await page.mouse.click(x, y);
    await page.getByPlaceholder('Enter name').click();
    await page.getByPlaceholder('Enter name').fill(testName);
    await page.getByPlaceholder('Enter value').click();
    await page.getByPlaceholder('Enter value').fill(testValue);

    await takeEditorScreenshot(page);
    await page.getByRole('button', { name: 'Apply' }).click();
  });
});
