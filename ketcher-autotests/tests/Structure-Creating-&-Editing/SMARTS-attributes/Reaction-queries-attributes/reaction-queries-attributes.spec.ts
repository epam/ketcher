import { Page, test } from '@playwright/test';
import {
  AtomButton,
  BondTypeName,
  LeftPanelButton,
  RingButton,
  TopPanelButton,
  clickInTheMiddleOfTheScreen,
  clickOnAtom,
  dragMouseTo,
  getCoordinatesOfTheMiddleOfTheScreen,
  getCoordinatesTopAtomOfBenzeneRing,
  moveMouseToTheMiddleOfTheScreen,
  pasteFromClipboard,
  pressButton,
  resetCurrentTool,
  selectAtomInToolbar,
  selectBond,
  selectDropdownTool,
  selectLeftPanelButton,
  selectRingButton,
  selectTopPanelButton,
  takeEditorScreenshot,
  waitForLoad,
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
    const defaultFileFormat = 'DL Rxnfile V2000';
    await drawStructureWithArrowOpenAngle(page);
    await takeEditorScreenshot(page);
    await checkSmartsValue(page, defaultFileFormat, '[#1]>>[#8]');
  });

  test('Checking SMARTS with reaction mapping tool', async ({ page }) => {
    const defaultFileFormat = 'MDL Molfile V2000';
    await selectBond(BondTypeName.Single, page);
    await clickInTheMiddleOfTheScreen(page);
    await page.keyboard.press('Escape');

    await selectDropdownTool(page, 'reaction-map', 'reaction-map');
    await clickOnAtom(page, 'C', 0);
    await clickOnAtom(page, 'C', 1);

    await takeEditorScreenshot(page);
    await checkSmartsValue(page, defaultFileFormat, '[#6:1]-[#6:2]');
  });

  test('Checking SMARTS with S-Group', async ({ page }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/3338
     * Description: pasting SMARTS with query groups should not trigger any error
     */
    const defaultFileFormat = 'MDL Molfile V2000';

    await selectRingButton(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);

    await selectLeftPanelButton(LeftPanelButton.S_Group, page);
    const { x, y } = await getCoordinatesTopAtomOfBenzeneRing(page);
    await page.mouse.click(x, y);
    await page.getByRole('button', { name: 'Data' }).click();
    await page.getByRole('option', { name: 'Query component' }).click();
    await page.getByRole('button', { name: 'Apply' }).click();

    await takeEditorScreenshot(page);
    await checkSmartsValue(
      page,
      defaultFileFormat,
      '([#6]1-[#6]=[#6]-[#6]=[#6]-[#6]=1)',
    );
  });
});

test.describe('Checking pasting S-Group as SMARTS', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Checking SMARTS with two query groups', async ({ page }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/3408
     * Description: pasting SMARTS with query groups should not trigger any error
     */
    const smartsWithOneQueryGroup = '([#6].[#7])';
    const smartsWithTwoQueryGroups = '([#6].[#7]).([#8])';
    await selectTopPanelButton(TopPanelButton.Open, page);
    await page.getByText('Paste from clipboard').click();
    await pasteFromClipboard(page, smartsWithOneQueryGroup);
    await waitForLoad(page, async () => {
      await pressButton(page, 'Add to Canvas');
    });
    await takeEditorScreenshot(page);

    await selectTopPanelButton(TopPanelButton.Open, page);
    await page.getByText('Paste from clipboard').click();
    await pasteFromClipboard(page, smartsWithTwoQueryGroups);
    await waitForLoad(page, async () => {
      await pressButton(page, 'Add to Canvas');
    });
    await takeEditorScreenshot(page);
  });
});
