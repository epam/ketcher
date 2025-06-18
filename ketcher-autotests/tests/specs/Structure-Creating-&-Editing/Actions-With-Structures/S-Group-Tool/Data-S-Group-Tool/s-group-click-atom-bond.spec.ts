import { test, expect } from '@playwright/test';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import { selectRingButton } from '@tests/pages/molecules/BottomToolbar';
import {
  getCoordinatesTopAtomOfBenzeneRing,
  clickInTheMiddleOfTheScreen,
  takeEditorScreenshot,
  waitForPageInit,
  clickOnCanvas,
} from '@utils';
import { RingButton } from '@tests/pages/constants/ringButton/Constants';

test.describe('S-Group Properties', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Checking S-Group drop-down types', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1502
      Description: Checking S-Group drop-down types 'Type' drop-down list with Data,
      Multiple group, SRU polymer, Superatom and Query Component items. Data item is selected by default;
    */
    const sGroupTypeInputSpan = page.getByTestId('s-group-type-input-span');
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);

    await LeftToolbar(page).sGroup();
    const { x, y } = await getCoordinatesTopAtomOfBenzeneRing(page);
    await clickOnCanvas(page, x, y);
    await sGroupTypeInputSpan.click();

    await expect(page.getByTestId('Data-option')).toContainText('Data');
    await expect(page.getByTestId('Multiple group-option')).toContainText(
      'Multiple group',
    );
    await expect(page.getByTestId('SRU polymer-option')).toContainText(
      'SRU polymer',
    );
    await expect(page.getByTestId('Superatom-option')).toContainText(
      'Superatom',
    );
    await expect(page.getByTestId('Query component-option')).toContainText(
      'Query component',
    );
  });

  test('A superatom named `Test` is created', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1537
      Description: A superatom named `Test` is created. Atom enclosed in brackets.
    */
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);

    await LeftToolbar(page).sGroup();
    const { x, y } = await getCoordinatesTopAtomOfBenzeneRing(page);
    await clickOnCanvas(page, x, y);
    await page.getByTestId('s-group-type-input-span').click();
    await page.getByRole('option', { name: 'Superatom' }).click();
    await page.getByLabel('Name').click();
    await page.getByLabel('Name').fill('Test');
    await page.getByRole('button', { name: 'Apply' }).click();
    await takeEditorScreenshot(page);
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
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);

    await LeftToolbar(page).sGroup();
    const { x, y } = await getCoordinatesTopAtomOfBenzeneRing(page);
    await clickOnCanvas(page, x, y);
    await page.getByPlaceholder('Enter name').click();
    await page.getByPlaceholder('Enter name').fill(testName);
    await page.getByPlaceholder('Enter value').click();
    await page.getByPlaceholder('Enter value').fill(testValue);

    await takeEditorScreenshot(page);
    await page.getByRole('button', { name: 'Apply' }).click();
    await takeEditorScreenshot(page);
  });

  test('A query component  is created', async ({ page }) => {
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);

    await LeftToolbar(page).sGroup();
    const { x, y } = await getCoordinatesTopAtomOfBenzeneRing(page);
    await clickOnCanvas(page, x, y);
    await page.getByTestId('s-group-type-input-span').click();
    await page.getByRole('option', { name: 'Query component' }).click();

    await takeEditorScreenshot(page);
    await page.getByRole('button', { name: 'Apply' }).click();
    await takeEditorScreenshot(page);
  });
});
