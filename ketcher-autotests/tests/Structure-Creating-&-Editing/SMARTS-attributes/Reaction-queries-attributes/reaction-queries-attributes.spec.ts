import { Page, test } from '@playwright/test';
import {
  AtomButton,
  BondTypeName,
  LeftPanelButton,
  clickInTheMiddleOfTheScreen,
  clickOnAtom,
  dragMouseTo,
  getCoordinatesOfTheMiddleOfTheScreen,
  moveMouseToTheMiddleOfTheScreen,
  resetCurrentTool,
  selectAtomInToolbar,
  selectBond,
  selectDropdownTool,
  selectLeftPanelButton,
  takeEditorScreenshot,
  waitForPageInit,
} from '@utils';
import { checkSmartsValue } from '../utils';

async function drawStructureWithArrowOpenAngle(page: Page) {
  const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
  const shiftForHydrogen = 25;
  const shiftForCoordinatesToResetArrowOpenAngleTool = 100;
  const shiftForOxygen = 125;

  await selectAtomInToolbar(AtomButton.Hydrogen, page);
  await clickInTheMiddleOfTheScreen(page);
  await resetCurrentTool(page);

  await moveMouseToTheMiddleOfTheScreen(page);
  await dragMouseTo(x - shiftForHydrogen, y, page);
  await resetCurrentTool(page);

  await selectLeftPanelButton(LeftPanelButton.ArrowOpenAngleTool, page);
  await clickInTheMiddleOfTheScreen(page);
  await resetCurrentTool(page);

  await page.mouse.move(x, y + shiftForCoordinatesToResetArrowOpenAngleTool);
  await page.mouse.click;

  await selectAtomInToolbar(AtomButton.Oxygen, page);
  await page.mouse.click(x + shiftForOxygen, y, {
    button: 'left',
  });
}

test.describe('Checking reaction queries attributes in SMARTS format', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Checking SMARTS with Arrow Open Angle', async ({ page }) => {
    await drawStructureWithArrowOpenAngle(page);
    await takeEditorScreenshot(page);
    await checkSmartsValue(page, '[#1]>>[#8]');
  });

  test('Checking SMARTS with reaction mapping tool', async ({ page }) => {
    await selectBond(BondTypeName.Single, page);
    await clickInTheMiddleOfTheScreen(page);
    await page.keyboard.press('Escape');

    await selectDropdownTool(page, 'reaction-map', 'reaction-map');
    await clickOnAtom(page, 'C', 0);
    await clickOnAtom(page, 'C', 1);

    await takeEditorScreenshot(page);
    await checkSmartsValue(page, '[#6:1]-[#6:2]');
  });
});
