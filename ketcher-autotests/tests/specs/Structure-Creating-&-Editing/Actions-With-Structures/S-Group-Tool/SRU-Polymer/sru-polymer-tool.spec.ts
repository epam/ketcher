/* eslint-disable no-magic-numbers */
import { test } from '@fixtures';
import {
  BondType,
  clickInTheMiddleOfTheScreen,
  clickOnAtom,
  clickOnBond,
  clickOnCanvas,
  MolFileFormat,
  openFileAndAddToCanvas,
  screenshotBetweenUndoRedo,
  selectUndoByKeyboard,
  takeEditorScreenshot,
  waitForPageInit,
} from '@utils';
import {
  copyAndPaste,
  cutAndPaste,
  selectAllStructuresOnCanvas,
} from '@utils/canvas/selectSelection';
import { getBondByIndex } from '@utils/canvas/bonds';
import {
  FileType,
  verifyFileExport,
} from '@utils/files/receiveFileComparisonData';
import { RightToolbar } from '@tests/pages/molecules/RightToolbar';
import { Atom } from '@tests/pages/constants/atoms/atoms';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import { RGroupType } from '@tests/pages/constants/rGroupSelectionTool/Constants';
import { selectRingButton } from '@tests/pages/molecules/BottomToolbar';
import { RingButton } from '@tests/pages/constants/ringButton/Constants';
import { ContextMenu } from '@tests/pages/common/ContextMenu';
import { MicroBondOption } from '@tests/pages/constants/contextMenu/Constants';
import {
  RepeatPatternOption,
  TypeOption,
} from '@tests/pages/constants/s-GroupPropertiesDialog/Constants';
import { SGroupPropertiesDialog } from '@tests/pages/molecules/canvas/S-GroupPropertiesDialog';
import { RGroup } from '@tests/pages/constants/rGroupDialog/Constants';
import { RGroupDialog } from '@tests/pages/molecules/canvas/R-GroupDialog';

const CANVAS_CLICK_X = 500;
const CANVAS_CLICK_Y = 500;

test.describe('SRU Polymer tool', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Brackets rendering for atom', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1529
      Description: The brackets are rendered correctly around Atom
    */
    await openFileAndAddToCanvas(page, 'KET/simple-chain.ket');
    await LeftToolbar(page).sGroup();
    await clickOnAtom(page, 'C', 3);
    await SGroupPropertiesDialog(page).setOptions({
      Type: TypeOption.SRUPolymer,
      PolymerLabel: 'A',
      RepeatPattern: RepeatPatternOption.HeadToTail,
    });
    await takeEditorScreenshot(page);
  });

  test('Brackets rendering for bond', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1529
      Description: The brackets are rendered correctly around Bond
    */
    await openFileAndAddToCanvas(page, 'KET/simple-chain.ket');
    await LeftToolbar(page).sGroup();
    await clickOnBond(page, BondType.SINGLE, 3);
    await SGroupPropertiesDialog(page).setOptions({
      Type: TypeOption.SRUPolymer,
      PolymerLabel: 'A',
      RepeatPattern: RepeatPatternOption.HeadToTail,
    });
    await takeEditorScreenshot(page);
  });

  test('Brackets rendering for whole structure', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1529
      Description: The brackets are rendered correctly around whole structure
    */
    await openFileAndAddToCanvas(page, 'KET/simple-chain.ket');
    await selectAllStructuresOnCanvas(page);
    await LeftToolbar(page).sGroup();
    await SGroupPropertiesDialog(page).setOptions({
      Type: TypeOption.SRUPolymer,
      PolymerLabel: 'A',
      RepeatPattern: RepeatPatternOption.HeadToTail,
    });
    await takeEditorScreenshot(page);
  });

  test('Connection of labels "Head-to-tail"', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1530
      Description: No connection label should be present at the right-top side of the brackets when the
      'Head-to-tail' connection type is opened.
    */
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/sru-polymer.mol');
    await takeEditorScreenshot(page);
  });

  test('Connection of labels "Head-to-head"', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1530
      Description: The 'hh' connection label should be present at the right-top side of the brackets when the
      'Head-to-head' connection type is selected.
    */
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/sru-polymer.mol');
    await LeftToolbar(page).sGroup();
    const point = await getBondByIndex(page, { type: BondType.SINGLE }, 3);
    await ContextMenu(page, point).click(MicroBondOption.EditSGroup);
    await SGroupPropertiesDialog(page).selectRepeatPattern(
      RepeatPatternOption.HeadToHead,
    );
    await SGroupPropertiesDialog(page).apply();
    await takeEditorScreenshot(page);
  });

  test('Connection of labels "Either unknown"', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1530
      Description: The 'eu' connection label should be present at the right-top side of the brackets when the
      'Either unknown' connection type is selected.
    */
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/sru-polymer.mol');
    await LeftToolbar(page).sGroup();
    const point = await getBondByIndex(page, { type: BondType.SINGLE }, 3);
    await ContextMenu(page, point).click(MicroBondOption.EditSGroup);
    await SGroupPropertiesDialog(page).selectRepeatPattern(
      RepeatPatternOption.EitherUnknown,
    );
    await SGroupPropertiesDialog(page).apply();
    await takeEditorScreenshot(page);
  });

  test('Edit SRU polymer S-Group', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1531
      Description: The 'eu' connection label should be present at the right-top side of the brackets when the
      'Either unknown' connection type is selected. And 'n' letter changes to 'A'
    */
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/sru-polymer.mol');
    await LeftToolbar(page).sGroup();
    const point = await getBondByIndex(page, { type: BondType.SINGLE }, 3);
    await ContextMenu(page, point).click(MicroBondOption.EditSGroup);
    await SGroupPropertiesDialog(page).setPolymerLabelValue('A');
    await SGroupPropertiesDialog(page).selectRepeatPattern(
      RepeatPatternOption.EitherUnknown,
    );
    await SGroupPropertiesDialog(page).apply();
    await takeEditorScreenshot(page);
    await selectUndoByKeyboard(page);
    await takeEditorScreenshot(page);
  });

  test('Add atom on Chain with SRU polymer S-Group', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1532
      Description: User is able to add atom on structure with SRU polymer S-group.
    */
    const atomToolbar = RightToolbar(page);

    await openFileAndAddToCanvas(page, 'Molfiles-V2000/sru-polymer.mol');
    await atomToolbar.clickAtom(Atom.Oxygen);
    await clickOnAtom(page, 'C', 3);
    await CommonLeftToolbar(page).selectAreaSelectionTool();
    await takeEditorScreenshot(page);
  });

  test('Delete and Undo/Redo atom on Chain with SRU polymer S-Group', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1532
      Description: User is able to delete and undo/redo atom on structure with SRU polymer S-group.
    */
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/sru-polymer.mol');
    await CommonLeftToolbar(page).selectEraseTool();
    await clickOnAtom(page, 'C', 3);
    await takeEditorScreenshot(page);

    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Delete whole Chain with SRU polymer S-Group and Undo/Redo', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1532
      Description: User is able to delete whole Chain with SRU polymer S-Group and undo/redo.
    */
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/sru-polymer.mol');
    await selectAllStructuresOnCanvas(page);
    await page.getByTestId('delete').click();
    await takeEditorScreenshot(page);

    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Add Template on Chain with SRU polymer S-Group', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1532
      Description: User is able to add Template on structure with SRU polymer S-group.
    */
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/sru-polymer.mol');
    await selectRingButton(page, RingButton.Benzene);
    await clickOnAtom(page, 'C', 3);
    await CommonLeftToolbar(page).selectAreaSelectionTool();
    await takeEditorScreenshot(page);

    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Add R-Group Label and Undo/Redo on Chain with SRU polymer S-Group', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1532
      Description: User is able to add R-Group Label and Undo/Redo on structure with SRU polymer S-group.
    */
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/sru-polymer.mol');
    await LeftToolbar(page).selectRGroupTool(RGroupType.RGroupLabel);
    await clickOnAtom(page, 'C', 3);
    await RGroupDialog(page).setRGroupLabels(RGroup.R12);
    await CommonLeftToolbar(page).selectAreaSelectionTool();
    await takeEditorScreenshot(page);

    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Copy/Paste structure with SRU polymer S-Group', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1535
      Description: User is able to copy and paste structure with SRU polymer S-group.
    */
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/sru-polymer.mol');
    await copyAndPaste(page);
    await clickOnCanvas(page, CANVAS_CLICK_X, CANVAS_CLICK_Y, {
      from: 'pageTopLeft',
    });
    await takeEditorScreenshot(page);
  });

  test('Cut/Paste structure with SRU polymer S-Group', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1535
      Description: User is able to cut and paste structure with SRU polymer S-group.
    */
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/sru-polymer.mol');
    await cutAndPaste(page);
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });

  test('Save/Open SRU polymer S-Group', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1536
      Description: User is able to save and open structure with SRU polymer S-group.
    */
    await openFileAndAddToCanvas(page, 'KET/sru-polymer-data.ket');

    await verifyFileExport(
      page,
      'Molfiles-V2000/sru-polymer-data-expected.mol',
      FileType.MOL,
      MolFileFormat.v2000,
      [1],
    );
  });

  test('Add S-Group properties to structure and atom', async ({ page }) => {
    /*
      Test case: https://github.com/epam/ketcher/issues/3949
      Description: S-Group added to the structure and represent in .ket file.
      The test is currently not functioning correctly as the bug has not been fixed.
    */
    await openFileAndAddToCanvas(page, 'KET/cyclopropane-and-h2o.ket');
    await selectAllStructuresOnCanvas(page);
    await LeftToolbar(page).sGroup();
    await SGroupPropertiesDialog(page).setOptions({
      Type: TypeOption.SRUPolymer,
      PolymerLabel: 'A',
      RepeatPattern: RepeatPatternOption.HeadToTail,
    });
    await verifyFileExport(
      page,
      'KET/cyclopropane-and-h2o-sru-expected.ket',
      FileType.KET,
    );
    await takeEditorScreenshot(page);
  });
});
