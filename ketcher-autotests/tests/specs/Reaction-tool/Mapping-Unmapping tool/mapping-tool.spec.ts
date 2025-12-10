/* eslint-disable no-magic-numbers */
import { test } from '@fixtures';
import {
  takeEditorScreenshot,
  clickInTheMiddleOfTheScreen,
  openFileAndAddToCanvas,
  getCoordinatesTopAtomOfBenzeneRing,
  dragMouseTo,
  waitForPageInit,
  mapTwoAtoms,
  clickOnCanvas,
  RxnFileFormat,
  deleteByKeyboard,
} from '@utils';
import {
  FileType,
  verifyFileExport,
} from '@utils/files/receiveFileComparisonData';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import { ReactionMappingType } from '@tests/pages/constants/reactionMappingTool/Constants';
import { RingButton } from '@tests/pages/constants/ringButton/Constants';
import { getAtomLocator } from '@utils/canvas/atoms/getAtomLocator/getAtomLocator';
import { AtomsSetting } from '@tests/pages/constants/settingsDialog/Constants';
import { setSettingsOption } from '@tests/pages/molecules/canvas/SettingsDialog';
import { BottomToolbar } from '@tests/pages/molecules/BottomToolbar';

test.describe('Mapping Tools', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Click atoms to map atoms in a reaction', async ({ page }) => {
    /* Test case: EPMLSOPKET-1799, EPMLSOPKET-8909
    Description:  Click atoms to map atoms in a reaction
    */
    await openFileAndAddToCanvas(page, 'Rxn-V2000/reaction-3.rxn');
    await LeftToolbar(page).selectReactionMappingTool(
      ReactionMappingType.ReactionMapping,
    );
    await setSettingsOption(page, AtomsSetting.DisplayCarbonExplicitly);
    await mapTwoAtoms(
      page,
      getAtomLocator(page, { atomLabel: 'C' }).nth(4),
      getAtomLocator(page, { atomLabel: 'C' }).nth(14),
    );
    await setSettingsOption(page, AtomsSetting.DisplayCarbonExplicitly);
    await takeEditorScreenshot(page);
  });

  test.describe('Mapping Tools', () => {
    test.beforeEach(async ({ page }) => {
      await openFileAndAddToCanvas(page, 'Rxn-V2000/mapped-atoms.rxn');
    });

    test('Click the single mapped atom to delete mapping', async ({ page }) => {
      // EPMLSOPKET-1827
      await LeftToolbar(page).selectReactionMappingTool(
        ReactionMappingType.ReactionUnmapping,
      );
      await getAtomLocator(page, { atomLabel: 'C' }).first().click({
        force: true,
      });
    });

    test('Map ordering', async ({ page }) => {
      await LeftToolbar(page).selectReactionMappingTool(
        ReactionMappingType.ReactionMapping,
      );
      await page.getByText('ALK').click();
      await page.getByText('ABH').click();
      await page.getByText('CHC').click();
      await page.getByText('ARY').click();
    });
  });

  test('No Unmapping after the arrow deleting', async ({ page }) => {
    // EPMLSOPKET-1828
    await openFileAndAddToCanvas(page, 'Rxn-V2000/mapped-rection-benz.rxn');
    await CommonLeftToolbar(page).erase();
    await clickInTheMiddleOfTheScreen(page);
  });

  test('Click atoms to map atoms of reactants or products', async ({
    page,
  }) => {
    await openFileAndAddToCanvas(page, 'Rxn-V2000/reaction-3.rxn');
    await setSettingsOption(page, AtomsSetting.DisplayCarbonExplicitly);
    await LeftToolbar(page).selectReactionMappingTool(
      ReactionMappingType.ReactionMapping,
    );
    await getAtomLocator(page, { atomLabel: 'C', atomId: 0 }).click();
    const { x, y } = await getCoordinatesTopAtomOfBenzeneRing(page);
    await dragMouseTo(x, y, page);
  });

  test('Undo working in atom mapping, able to remove mapping', async ({
    page,
  }) => {
    // EPMLSOPKET-12961
    // Undo not working properly https://github.com/epam/ketcher/issues/2174
    await BottomToolbar(page).clickRing(RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);
    await LeftToolbar(page).selectReactionMappingTool(
      ReactionMappingType.ReactionMapping,
    );
    const { x, y } = await getCoordinatesTopAtomOfBenzeneRing(page);
    await clickOnCanvas(page, x, y, { from: 'pageTopLeft' });
    await takeEditorScreenshot(page);

    await CommonTopLeftToolbar(page).undo();
  });

  test.describe('Mapping reactions', () => {
    test.beforeEach(async ({ page }) => {
      await openFileAndAddToCanvas(page, 'Rxn-V2000/mapped-reaction.rxn');
      await clickInTheMiddleOfTheScreen(page);
    });

    test('Remove the reaction components', async ({ page }) => {
      // EPMLSOPKET-1831
      await LeftToolbar(page).selectReactionMappingTool(
        ReactionMappingType.ReactionMapping,
      );
      await page.getByText('CEL').click();
      await deleteByKeyboard(page);
      await takeEditorScreenshot(page);

      await CommonTopLeftToolbar(page).undo();
    });

    test('Unmap the mapped reaction', async ({ page }) => {
      // EPMLSOPKET-1830
      await LeftToolbar(page).selectReactionMappingTool(
        ReactionMappingType.ReactionUnmapping,
      );
      await page.getByText('CEL').click();
    });
  });
});

test.describe('Mapping reactions', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Save as *.rxn file', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1830
    Description: Structure with attachment points saved as .rxn file
    */
    await openFileAndAddToCanvas(page, 'Rxn-V2000/mapped-reaction.rxn');
    await verifyFileExport(
      page,
      'Rxn-V2000/mapped-reaction-expected.rxn',
      FileType.RXN,
      RxnFileFormat.v2000,
    );
  });
});
