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
import { SGroupPropertiesDialog } from '@tests/pages/molecules/canvas/S-GroupPropertiesDialog';
import { TypeOption } from '@tests/pages/constants/s-GroupPropertiesDialog/Constants';

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
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);

    await LeftToolbar(page).sGroup();
    const { x, y } = await getCoordinatesTopAtomOfBenzeneRing(page);
    await clickOnCanvas(page, x, y);
    await SGroupPropertiesDialog(page).typeDropdown.click();

    await expect(page.getByTestId(TypeOption.Data)).toContainText('Data');
    await expect(page.getByTestId(TypeOption.MultipleGroup)).toContainText(
      'Multiple group',
    );
    await expect(page.getByTestId(TypeOption.SRUPolymer)).toContainText(
      'SRU polymer',
    );
    await expect(page.getByTestId(TypeOption.Superatom)).toContainText(
      'Superatom',
    );
    await expect(page.getByTestId(TypeOption.QueryComponent)).toContainText(
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
    await SGroupPropertiesDialog(page).setOptions({
      Type: TypeOption.Superatom,
      Name: 'Test',
    });
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
    await SGroupPropertiesDialog(page).setFieldNameValue(testName);
    await SGroupPropertiesDialog(page).setFieldValueValue(testValue);
    await takeEditorScreenshot(page);
    await SGroupPropertiesDialog(page).apply();
    await takeEditorScreenshot(page);
  });

  test('A query component  is created', async ({ page }) => {
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);

    await LeftToolbar(page).sGroup();
    const { x, y } = await getCoordinatesTopAtomOfBenzeneRing(page);
    await clickOnCanvas(page, x, y);
    await SGroupPropertiesDialog(page).selectType(TypeOption.QueryComponent);

    await takeEditorScreenshot(page);
    await SGroupPropertiesDialog(page).apply();
    await takeEditorScreenshot(page);
  });
});
