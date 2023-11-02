import { Page, test, expect } from '@playwright/test';
import {
  clickInTheMiddleOfTheScreen,
  FunctionalGroups,
  getCoordinatesOfTheMiddleOfTheScreen,
  pressButton,
  selectFunctionalGroups,
  selectTopPanelButton,
  STRUCTURE_LIBRARY_BUTTON_NAME,
  takeEditorScreenshot,
  TopPanelButton,
  waitForPageInit,
  waitForRender,
} from '@utils';
import {
  editStructureTemplate,
  openFunctionalGroup,
  openStructureLibrary,
} from '@utils/templates';

async function setDisplayStereoFlagsSettingToOn(page: Page) {
  await selectTopPanelButton(TopPanelButton.Settings, page);
  await page.getByText('Stereochemistry', { exact: true }).click();
  await pressButton(page, 'IUPAC style');
  // Using "On" label style, to always show the stereo labels, so we can see the difference
  await page.getByRole('option', { name: 'On' }).click();
  await pressButton(page, 'Apply');
}

async function setIgnoreChiralFlagSetting(page: Page, newSetting: boolean) {
  await selectTopPanelButton(TopPanelButton.Settings, page);
  await page.getByText('Stereochemistry', { exact: true }).click();

  const checkLocator = page.getByText('Ignore the chiral flag');
  const isChecked = await checkLocator.isChecked();
  if (isChecked !== newSetting) {
    await checkLocator.click();
  }
  await pressButton(page, 'Apply');
}

async function placePhenylalanineMustard(page: Page, x: number, y: number) {
  await pressButton(page, STRUCTURE_LIBRARY_BUTTON_NAME);
  const phenylalanineLocator = page.locator(
    `div[title*="Phenylalanine mustard"] > div`,
  );
  if ((await phenylalanineLocator.count()) === 0) {
    await page.getByText('Aromatics').click();
  }
  await phenylalanineLocator.first().click();
  await page.mouse.click(x, y);
}

async function editAndClearTemplateName(
  page: Page,
  templateCategory: string,
  templateName: string,
) {
  await editStructureTemplate(page, templateCategory, templateName);
  await page.getByTestId('file-name-input').click();
  await page.keyboard.press('Control+a');
  await page.keyboard.press('Delete');
}

test.describe('Templates - Template Library', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  test('Template with chiral flag 0 with ignoreChiralFlag enabled/disabled', async ({
    page,
  }) => {
    // Phenylalanine mustard was chosen, because it has chiral flag 0, which allows us
    // to test ignoreChiralFlag, which has an effect on the structure only in this case
    const offsetX = 300;
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);

    await setDisplayStereoFlagsSettingToOn(page);

    await setIgnoreChiralFlagSetting(page, true);
    await placePhenylalanineMustard(page, x - offsetX, y);

    await setIgnoreChiralFlagSetting(page, false);
    await placePhenylalanineMustard(page, x + offsetX, y);
  });

  test('Structure Library UI', async ({ page }) => {
    // Test case: EPMLSOPKET-4265
    // Overview Templates Library structure
    await openStructureLibrary(page);
  });

  test('Open Structure Library tooltip', async ({ page }) => {
    // Test case: EPMLSOPKET-4265
    // Verify Structure LIbrary tooltip
    const button = page.getByTestId('template-lib');
    await expect(button).toHaveAttribute(
      'title',
      'Structure Library (Shift+T)',
    );
  });

  test('Template Library', async ({ page }) => {
    // Test case: EPMLSOPKET-4266
    // Verify correct display of Template Library
    const deltaX = 0;
    const deltaY = 220;
    const anyX = 638;
    const anyY = 524;
    await openStructureLibrary(page);
    await takeEditorScreenshot(page);
    await waitForRender(page, async () => {
      await page.mouse.move(anyX, anyY);
      await page.mouse.wheel(deltaX, deltaY);
    });
  });

  test('Functional groups tab', async ({ page }) => {
    // Test case: EPMLSOPKET-4267
    // Verify Functional Group tab
    await openFunctionalGroup(page);
  });

  test('Functional groups - adding structure', async ({ page }) => {
    // Test case: EPMLSOPKET-4267
    // Add structure from Functional Group into canvas
    await selectFunctionalGroups(FunctionalGroups.FMOC, page);
    await clickInTheMiddleOfTheScreen(page);
  });

  test('Edit templates', async ({ page }) => {
    // Test case: EPMLSOPKET-1699
    // Verify correct display of Template Edit window
    await editStructureTemplate(page, 'β-D-Sugars', 'β-D-Allopyranose');
  });

  test('Edit templates - name field with no character', async ({ page }) => {
    // Test case: EPMLSOPKET-1699
    // Verify validation if name field not contain any characters
    await editAndClearTemplateName(page, 'β-D-Sugars', 'β-D-Allopyranose');
  });

  test('Edit templates - name with just spaces', async ({ page }) => {
    // Test case: EPMLSOPKET-1699
    // Verify if structure name won't change if field will contain just spaces
    await editAndClearTemplateName(page, 'β-D-Sugars', 'β-D-Allopyranose');
    await page.getByTestId('file-name-input').fill('   ');
    await page.getByRole('button', { name: 'Edit', exact: true }).click();
    await page.getByText('β-D-Sugars').click();
  });

  test('Text field 128 characters limit test ', async ({ page }) => {
    // Verify maximum character validation on the name field
    const textField = page.getByTestId('file-name-input');
    const number = 129;
    const inputText = 'A'.repeat(number);
    await editAndClearTemplateName(page, 'β-D-Sugars', 'β-D-Allopyranose');
    await waitForRender(page, async () => {
      await textField.type(inputText);
    });
  });
});
