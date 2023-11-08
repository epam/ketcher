import { Page, test } from '@playwright/test';
import {
  selectTopPanelButton,
  TopPanelButton,
  takeEditorScreenshot,
  waitForPageInit,
  pressButton,
  drawBenzeneRing,
  clickInTheMiddleOfTheScreen,
  openFileAndAddToCanvas,
  resetCurrentTool,
  selectRing,
  RingButton,
  getAtomByIndex,
} from '@utils';

async function setHydrogenLabelsOn(page: Page) {
  await selectTopPanelButton(TopPanelButton.Settings, page);
  await page.getByText('Atoms', { exact: true }).click();
  const deltaX = 0;
  const deltaY = 60;
  const scrollBarCoordinatesX = 638;
  const scrollBarCoordinatesY = 524;
  await page.mouse.move(scrollBarCoordinatesX, scrollBarCoordinatesY);
  await page.mouse.wheel(deltaX, deltaY);
  await page.getByRole('button', { name: 'Terminal and Hetero' }).click();
  await page.getByTestId('On-option').click();
  await pressButton(page, 'Apply');
}
async function selectExtendedTableElements(page: Page, element: string) {
  await page.getByTestId('extended-table').click();
  await page.getByRole('button', { name: element, exact: true }).click();
  await page.getByRole('button', { name: 'Add', exact: true }).click();
}
async function atomDefaultSettings(page: Page) {
  await selectTopPanelButton(TopPanelButton.Settings, page);
  await page.getByText('Atoms', { exact: true }).click();
  const deltaX = 0;
  const deltaY = 150;
  const scrollBarCoordinatesX = 638;
  const scrollBarCoordinatesY = 524;
  await page.mouse.move(scrollBarCoordinatesX, scrollBarCoordinatesY);
  await page.mouse.wheel(deltaX, deltaY);
}

async function ringBondCountQuery(page: Page, menuItem: string) {
  await page.getByText(menuItem).click();
  await page.locator('button:nth-child(5)').first().click();
}

async function substitutionCountQuery(page: Page, menuItem: string) {
  await page.getByText(menuItem).click();
  await page.getByRole('button', { name: 'As drawn' }).nth(1).click();
}

async function aromaticityQuery(page: Page, menuItem: string) {
  await page.getByText(menuItem).click();
  await page.getByRole('button', { name: 'aromatic' }).click();
}

async function ringSizeQuery(page: Page, menuItem: string) {
  await page.getByText(menuItem).click();
  await page
    .locator(
      'div:nth-child(8) > .contexify > .MuiToggleButtonGroup-root > button:nth-child(9)',
    )
    .click();
}

test.describe('Atom Settings', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  test('Set "on" for Show hydrogen labels', async ({ page }) => {
    // Test case: EPMLSOPKET-10080
    // Verify appear of hydrogen labels on the molecules after changing setting to 'on'
    await drawBenzeneRing(page);
    await setHydrogenLabelsOn(page);
  });

  test('Display Special nodes "Deuterium", "Tritium" when "Show hydrogen labels" = "Terminal and Hetero"', async ({
    page,
  }) => {
    // Test case: EPMLSOPKET-10081
    // Verify if hydrogen labels appear on 'D' and 'T' -> (DH, TH) when default settings are set
    const pointX = 250;
    const pointY = 250;
    await selectExtendedTableElements(page, 'D');
    await page.mouse.click(pointX, pointY);
    await selectExtendedTableElements(page, 'T');
    await clickInTheMiddleOfTheScreen(page);
  });

  test('”Terminal and Hetero” is set for default for “Show hydrogen labels”', async ({
    page,
  }) => {
    // Test case: EPMLSOPKET-10076 and EPMLSOPKET-10079
    // Verify the default setting for “Show hydrogen labels”
    await atomDefaultSettings(page);
  });

  test('Non-terminal hetero atom when "Show hydrogen labels" = Terminal and Hetero', async ({
    page,
  }) => {
    // Test case:EPMLSOPKET-10083
    // Verify if the non-terminal atom will Show hydrogen labels when set on Terminal and Hetero
    await atomDefaultSettings(page);
    await pressButton(page, 'Apply');
    await openFileAndAddToCanvas('KET/chain-with-atoms.ket', page);
  });

  test(' Add simple atom query primitives to the query specific properties', async ({
    page,
  }) => {
    const pointX = 200;
    const pointY = 200;

    await selectRing(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);
    await resetCurrentTool(page);

    const point = await getAtomByIndex(page, { label: 'C' }, 1);
    await page.mouse.click(point.x, point.y, { button: 'right' });
    await page.getByText('Query properties').click();
    await ringBondCountQuery(page, 'Ring bond count');
    await substitutionCountQuery(page, 'Substitution count');
    await aromaticityQuery(page, 'Aromaticity');
    await ringSizeQuery(page, 'Ring size');
    await page.mouse.click(pointX, pointY);
  });
});
