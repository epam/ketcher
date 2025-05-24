import { Page, test } from '@playwright/test';
import {
  clickInTheMiddleOfTheScreen,
  clickOnAtom,
  dragMouseTo,
  getAtomByIndex,
  getCoordinatesOfTheMiddleOfTheScreen,
  getCoordinatesTopAtomOfBenzeneRing,
  moveMouseAway,
  moveMouseToTheMiddleOfTheScreen,
  resetCurrentTool,
  selectAllStructuresOnCanvas,
  takeEditorScreenshot,
  waitForPageInit,
  clickOnCanvas,
  pasteFromClipboardAndAddToCanvas,
} from '@utils';
import { checkSmartsValue } from '../utils';
import { MicroBondType } from '@tests/pages/constants/bondSelectionTool/Constants';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { RightToolbar } from '@tests/pages/molecules/RightToolbar';
import { Atom } from '@tests/pages/constants/atoms/atoms';
import { ArrowType } from '@tests/pages/constants/arrowSelectionTool/Constants';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import { ReactionMappingType } from '@tests/pages/constants/reactionMappingTool/Constants';
import { selectRingButton } from '@tests/pages/molecules/BottomToolbar';

async function drawStructureWithArrowOpenAngle(page: Page) {
  const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
  const shiftForHydrogen = 25;
  const shiftForCoordinatesToResetArrowOpenAngleTool = 100;
  const shiftForOxygen = 125;
  const atomToolbar = RightToolbar(page);

  await atomToolbar.clickAtom(Atom.Hydrogen);
  await clickInTheMiddleOfTheScreen(page);
  await resetCurrentTool(page);

  await moveMouseToTheMiddleOfTheScreen(page);
  await dragMouseTo(x - shiftForHydrogen, y, page);
  await resetCurrentTool(page);

  await LeftToolbar(page).selectArrowTool(ArrowType.ArrowOpenAngle);
  await clickInTheMiddleOfTheScreen(page);
  await resetCurrentTool(page);

  await page.mouse.move(x, y + shiftForCoordinatesToResetArrowOpenAngleTool);
  await clickOnCanvas;

  await atomToolbar.clickAtom(Atom.Oxygen);
  await clickOnCanvas(page, x + shiftForOxygen, y, {
    button: 'left',
  });
}

async function creatingComponentGroup(page: Page) {
  await page.getByTestId('s-group-type').first().click();
  await page.getByRole('option', { name: 'Query component' }).click();
  await page.getByRole('button', { name: 'Apply' }).click();
}

test.describe('Checking reaction queries attributes in SMARTS format', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Checking SMARTS with Arrow Open Angle', async ({ page }) => {
    await drawStructureWithArrowOpenAngle(page);
    await takeEditorScreenshot(page);
    await checkSmartsValue(page, '[H]>>[#8]');
  });

  test('Checking SMARTS with reaction mapping tool', async ({ page }) => {
    await CommonLeftToolbar(page).selectBondTool(MicroBondType.Single);
    await clickInTheMiddleOfTheScreen(page);
    await page.keyboard.press('Escape');

    await LeftToolbar(page).selectReactionMappingTool(
      ReactionMappingType.ReactionMapping,
    );
    await clickOnAtom(page, 'C', 0);
    await clickOnAtom(page, 'C', 1);

    await takeEditorScreenshot(page);
    await checkSmartsValue(page, '[#6:1]-[#6:2]');
  });

  test('Checking SMARTS with S-Group', async ({ page }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/3338
     * Description: pasting SMARTS with query groups should not trigger any error
     */

    await selectRingButton(page, 'Benzene');
    await clickInTheMiddleOfTheScreen(page);

    await LeftToolbar(page).sGroup();
    const { x, y } = await getCoordinatesTopAtomOfBenzeneRing(page);
    await clickOnCanvas(page, x, y);
    await page.getByTestId('s-group-type').first().click();
    await page.getByRole('option', { name: 'Query component' }).click();
    await page.getByRole('button', { name: 'Apply' }).click();

    await takeEditorScreenshot(page);
    await checkSmartsValue(page, '([#6]1-[#6]=[#6]-[#6]=[#6]-[#6]=1)');
  });

  test('Checking SMARTS with S-Group with two elements', async ({ page }) => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/1316
     */
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    const shiftValue = 50;
    const atomToolbar = RightToolbar(page);

    await selectRingButton(page, 'Cyclopropane');
    await clickInTheMiddleOfTheScreen(page);
    await moveMouseAway(page);
    await atomToolbar.clickAtom(Atom.Carbon);
    await clickOnCanvas(page, x + shiftValue, y);

    await selectAllStructuresOnCanvas(page);
    await LeftToolbar(page).sGroup();
    await creatingComponentGroup(page);
    await takeEditorScreenshot(page);
    await checkSmartsValue(page, '([#6]1-[#6]-[#6]-1.[#6])');
  });

  test('Checking SMARTS with reaction mapping and S-Group', async ({
    page,
  }) => {
    test.fail();
    /**
     * Test case: https://github.com/epam/Indigo/issues/1252
     */
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    const shiftValue = 50;
    const delta = 30;
    const atomToolbar = RightToolbar(page);

    await atomToolbar.clickAtom(Atom.Carbon);
    await clickInTheMiddleOfTheScreen(page);
    await atomToolbar.clickAtom(Atom.Fluorine);
    await clickOnCanvas(page, x + shiftValue, y);
    await page.keyboard.press('Escape');

    await LeftToolbar(page).selectReactionMappingTool(
      ReactionMappingType.ReactionMapping,
    );
    await clickOnAtom(page, 'C', 0);
    await clickOnAtom(page, 'F', 0);

    const carbonPoint = await getAtomByIndex(page, { label: 'C' }, 0);
    const fluorinePoint = await getAtomByIndex(page, { label: 'F' }, 0);

    await LeftToolbar(page).sGroup();

    await page.mouse.move(carbonPoint.x - delta, carbonPoint.y + delta);
    await page.mouse.down();
    await page.mouse.move(fluorinePoint.x + delta, fluorinePoint.y - delta);
    await page.mouse.up();

    await creatingComponentGroup(page);

    await takeEditorScreenshot(page);
    await checkSmartsValue(page, '([#6:1].[#9:2])');
  });
});

test.describe('Checking pasting S-Group as SMARTS', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  const testCases = [
    {
      smarts: '([#6].[#7])',
      description:
        'Pasting SMARTS with one query group should not trigger any error',
    },
    {
      smarts: '([#6].[#7]).([#8])',
      description:
        'Pasting SMARTS with two query groups should not trigger any error',
    },
  ];

  testCases.forEach(({ smarts, description }) => {
    test(description, async ({ page }) => {
      await pasteFromClipboardAndAddToCanvas(page, smarts);
      await takeEditorScreenshot(page);
    });
  });
});
