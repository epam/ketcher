import { Page, test } from '@fixtures';
import {
  clickInTheMiddleOfTheScreen,
  clickOnAtom,
  dragMouseTo,
  getCoordinatesOfTheMiddleOfTheScreen,
  getCoordinatesTopAtomOfBenzeneRing,
  moveMouseAway,
  moveMouseToTheMiddleOfTheScreen,
  takeEditorScreenshot,
  waitForPageInit,
  clickOnCanvas,
  pasteFromClipboardAndAddToCanvas,
} from '@utils';
import { selectAllStructuresOnCanvas } from '@utils/canvas/selectSelection';
import { MicroBondType } from '@tests/pages/constants/bondSelectionTool/Constants';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { RightToolbar } from '@tests/pages/molecules/RightToolbar';
import { Atom } from '@tests/pages/constants/atoms/atoms';
import { ArrowType } from '@tests/pages/constants/arrowSelectionTool/Constants';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import { ReactionMappingType } from '@tests/pages/constants/reactionMappingTool/Constants';
import { RingButton } from '@tests/pages/constants/ringButton/Constants';
import { SGroupPropertiesDialog } from '@tests/pages/molecules/canvas/S-GroupPropertiesDialog';
import { TypeOption } from '@tests/pages/constants/s-GroupPropertiesDialog/Constants';
import { getAtomLocator } from '@utils/canvas/atoms/getAtomLocator/getAtomLocator';
import { AtomsSetting } from '@tests/pages/constants/settingsDialog/Constants';
import { setSettingsOption } from '@tests/pages/molecules/canvas/SettingsDialog';
import { BottomToolbar } from '@tests/pages/molecules/BottomToolbar';
import { verifySMARTSExport } from '@utils/files/receiveFileComparisonData';

async function drawStructureWithArrowOpenAngle(page: Page) {
  const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
  const shiftForHydrogen = 25;
  const shiftForCoordinatesToResetArrowOpenAngleTool = 100;
  const shiftForOxygen = 125;
  const atomToolbar = RightToolbar(page);

  await atomToolbar.clickAtom(Atom.Hydrogen);
  await clickInTheMiddleOfTheScreen(page);
  await CommonLeftToolbar(page).areaSelectionTool();

  await moveMouseToTheMiddleOfTheScreen(page);
  await dragMouseTo(x - shiftForHydrogen, y, page);
  await CommonLeftToolbar(page).areaSelectionTool();

  await LeftToolbar(page).selectArrowTool(ArrowType.ArrowOpenAngle);
  await clickInTheMiddleOfTheScreen(page);
  await CommonLeftToolbar(page).areaSelectionTool();

  await page.mouse.move(x, y + shiftForCoordinatesToResetArrowOpenAngleTool);

  await atomToolbar.clickAtom(Atom.Oxygen);
  await clickOnCanvas(page, x + shiftForOxygen, y, {
    button: 'left',
    from: 'pageTopLeft',
  });
}

test.describe('Checking reaction queries attributes in SMARTS format', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Checking SMARTS with Arrow Open Angle', async ({ page }) => {
    await drawStructureWithArrowOpenAngle(page);
    await takeEditorScreenshot(page);
    await verifySMARTSExport(page, '[H]>>[#8]');
  });

  test('Checking SMARTS with reaction mapping tool', async ({ page }) => {
    await CommonLeftToolbar(page).bondTool(MicroBondType.Single);
    await clickInTheMiddleOfTheScreen(page);
    await page.keyboard.press('Escape');

    await LeftToolbar(page).selectReactionMappingTool(
      ReactionMappingType.ReactionMapping,
    );
    await getAtomLocator(page, { atomLabel: 'C', atomId: 0 }).click({
      force: true,
    });
    await getAtomLocator(page, { atomLabel: 'C', atomId: 1 }).click({
      force: true,
    });
    await takeEditorScreenshot(page);
    await verifySMARTSExport(page, '[#6:1]-[#6:2]');
  });

  test('Checking SMARTS with S-Group', async ({ page }) => {
    /**
     * Test case: https://github.com/epam/ketcher/issues/3338
     * Description: pasting SMARTS with query groups should not trigger any error
     */

    await BottomToolbar(page).clickRing(RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);

    await LeftToolbar(page).sGroup();
    const { x, y } = await getCoordinatesTopAtomOfBenzeneRing(page);
    await clickOnCanvas(page, x, y, { from: 'pageTopLeft' });
    await SGroupPropertiesDialog(page).setOptions({
      Type: TypeOption.QueryComponent,
    });
    await takeEditorScreenshot(page);
    await verifySMARTSExport(page, '([#6]1-[#6]=[#6]-[#6]=[#6]-[#6]=1)');
  });

  test('Checking SMARTS with S-Group with two elements', async ({ page }) => {
    /**
     * Test case: https://github.com/epam/Indigo/issues/1316
     */
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    const shiftValue = 50;
    const atomToolbar = RightToolbar(page);

    await BottomToolbar(page).clickRing(RingButton.Cyclopropane);
    await clickInTheMiddleOfTheScreen(page);
    await moveMouseAway(page);
    await atomToolbar.clickAtom(Atom.Carbon);
    await clickOnCanvas(page, x + shiftValue, y, { from: 'pageTopLeft' });

    await selectAllStructuresOnCanvas(page);
    await LeftToolbar(page).sGroup();
    await SGroupPropertiesDialog(page).setOptions({
      Type: TypeOption.QueryComponent,
    });
    await takeEditorScreenshot(page);
    await verifySMARTSExport(page, '([#6]1-[#6]-[#6]-1.[#6])');
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
    await clickOnCanvas(page, x + shiftValue, y, { from: 'pageTopLeft' });
    await page.keyboard.press('Escape');

    await LeftToolbar(page).selectReactionMappingTool(
      ReactionMappingType.ReactionMapping,
    );
    await getAtomLocator(page, { atomLabel: 'C', atomId: 0 }).click({
      force: true,
    });
    await getAtomLocator(page, { atomLabel: 'F', atomId: 1 }).click({
      force: true,
    });
    await setSettingsOption(page, AtomsSetting.DisplayCarbonExplicitly);

    const carbonPoint = await getAtomLocator(page, { atomLabel: 'C' })
      .first()
      .boundingBox();
    const fluorinePoint = await getAtomLocator(page, { atomLabel: 'F' })
      .first()
      .boundingBox();

    await LeftToolbar(page).sGroup();

    if (carbonPoint) {
      await page.mouse.move(carbonPoint.x - delta, carbonPoint.y + delta);
      await page.mouse.down();
    }
    if (fluorinePoint) {
      await page.mouse.move(fluorinePoint.x + delta, fluorinePoint.y - delta);
      await page.mouse.up();
    }

    await SGroupPropertiesDialog(page).setOptions({
      Type: TypeOption.QueryComponent,
    });

    await takeEditorScreenshot(page);
    await verifySMARTSExport(page, '([#6:1].[#9:2])');
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
