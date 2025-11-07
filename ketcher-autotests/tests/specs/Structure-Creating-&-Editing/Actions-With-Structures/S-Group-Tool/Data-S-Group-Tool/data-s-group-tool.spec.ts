/* eslint-disable max-len */
/* eslint-disable no-magic-numbers */
import { test } from '@fixtures';
import {
  clickInTheMiddleOfTheScreen,
  takeEditorScreenshot,
  openFileAndAddToCanvas,
  moveMouseToTheMiddleOfTheScreen,
  clickOnAtom,
  screenshotBetweenUndoRedo,
  waitForPageInit,
  clickOnCanvas,
  MolFileFormat,
  deleteByKeyboard,
  waitForRender,
  moveMouseAway,
} from '@utils';
import {
  copyAndPaste,
  cutAndPaste,
  selectAllStructuresOnCanvas,
} from '@utils/canvas/selectSelection';
import {
  FileType,
  verifyFileExport,
} from '@utils/files/receiveFileComparisonData';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { RightToolbar } from '@tests/pages/molecules/RightToolbar';
import { Atom } from '@tests/pages/constants/atoms/atoms';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import { RGroupType } from '@tests/pages/constants/rGroupSelectionTool/Constants';
import { RingButton } from '@tests/pages/constants/ringButton/Constants';
import {
  ContextOption,
  PropertyLabelType,
  TypeOption,
} from '@tests/pages/constants/s-GroupPropertiesDialog/Constants';
import { SGroupPropertiesDialog } from '@tests/pages/molecules/canvas/S-GroupPropertiesDialog';
import { RGroup } from '@tests/pages/constants/rGroupDialog/Constants';
import { RGroupDialog } from '@tests/pages/molecules/canvas/R-GroupDialog';
import { getAtomLocator } from '@utils/canvas/atoms/getAtomLocator/getAtomLocator';
import { AtomsSetting } from '@tests/pages/constants/settingsDialog/Constants';
import { setSettingsOption } from '@tests/pages/molecules/canvas/SettingsDialog';
import { BottomToolbar } from '@tests/pages/molecules/BottomToolbar';
import { getBondLocator } from '@utils/macromolecules/polymerBond';

const CANVAS_CLICK_X = 600;
const CANVAS_CLICK_Y = 600;

test.describe('Data S-Group tool', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Create S-Group', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1510
      Description: The Field value appears near bottom right corner of structure.
    */
    await openFileAndAddToCanvas(page, 'KET/simple-chain.ket');
    await selectAllStructuresOnCanvas(page);
    await LeftToolbar(page).sGroup();
    await SGroupPropertiesDialog(page).setOptions({
      Type: TypeOption.Data,
      Context: ContextOption.Fragment,
      FieldName: 'Test',
      FieldValue: '33',
      PropertyLabelType: PropertyLabelType.Absolute,
    });
    await takeEditorScreenshot(page);
  });

  test('S-Group properties dialog for atom of Benzene ring', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1499
      Description: The 'S-Group Properties' dialog appears when user selects atom.
    */
    await BottomToolbar(page).clickRing(RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);
    await LeftToolbar(page).sGroup();
    await clickOnAtom(page, 'C', 3);
    await takeEditorScreenshot(page);
  });

  test('S-Group properties dialog for bond of Benzene ring', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1499
      Description: The 'S-Group Properties' dialog appears when user selects bond.
    */
    await BottomToolbar(page).clickRing(RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);
    await LeftToolbar(page).sGroup();
    await getBondLocator(page, { bondId: 8 }).click({ force: true });
    await takeEditorScreenshot(page);
  });

  test('S-Group properties dialog for whole structure of Benzene ring', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1499
      Description: The 'S-Group Properties' dialog appears when user selects whole structure.
    */
    await BottomToolbar(page).clickRing(RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);
    await selectAllStructuresOnCanvas(page);
    await LeftToolbar(page).sGroup();
    await takeEditorScreenshot(page);
  });

  test('Edit S-Group', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1511
      Description: User is able to edit the Data S-group.
    */
    await openFileAndAddToCanvas(page, 'KET/chain-with-name-and-value.ket');
    await selectAllStructuresOnCanvas(page);
    await LeftToolbar(page).sGroup();
    await SGroupPropertiesDialog(page).setOptions({
      Type: TypeOption.MultipleGroup,
      RepeatCount: '1',
    });
    await takeEditorScreenshot(page);
  });

  test('Copy/Paste structure with S-Group', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1514
      Description: User is able to copy and paste structure with Data S-group.
    */
    await openFileAndAddToCanvas(page, 'KET/chain-with-name-and-value.ket');
    await copyAndPaste(page);
    await clickOnCanvas(page, CANVAS_CLICK_X, CANVAS_CLICK_Y, {
      from: 'pageTopLeft',
    });
    await takeEditorScreenshot(page);
  });

  test('Cut/Paste structure with S-Group', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1514
      Description: User is able to cut and paste structure with Data S-group.
    */
    await openFileAndAddToCanvas(page, 'KET/chain-with-name-and-value.ket');
    await cutAndPaste(page);
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });

  test('Save/Open S-Group', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1517
      Description: User is able to save and open structure with Data S-group.
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/chain-with-name-and-value.mol',
    );

    await verifyFileExport(
      page,
      'Molfiles-V2000/chain-with-name-and-value-expected.mol',
      FileType.MOL,
      MolFileFormat.v2000,
      [1],
    );
  });

  test('Add Data S-Group to atoms of Chain', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1551
      Description: Data S-Group added to all atoms of Chain
    */
    await openFileAndAddToCanvas(page, 'KET/simple-chain.ket');
    await selectAllStructuresOnCanvas(page);
    await LeftToolbar(page).sGroup();
    await SGroupPropertiesDialog(page).setOptions({
      Type: TypeOption.Data,
      Context: ContextOption.Atom,
      FieldName: 'Test',
      FieldValue: '8',
      PropertyLabelType: PropertyLabelType.Absolute,
    });
    await takeEditorScreenshot(page);
  });

  test('Add Data S-Group to bonds of Chain', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1550
      Description: Data S-Group added to all bonds of Chain
    */
    await openFileAndAddToCanvas(page, 'KET/simple-chain.ket');
    await selectAllStructuresOnCanvas(page);
    await LeftToolbar(page).sGroup();
    await SGroupPropertiesDialog(page).setOptions({
      Type: TypeOption.Data,
      Context: ContextOption.Bond,
      FieldName: 'Test',
      FieldValue: '8',
      PropertyLabelType: PropertyLabelType.Absolute,
    });
    await takeEditorScreenshot(page);
  });

  test('Add Data S-Group Group context to Chain', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1552
      Description: Data S-Group added to all structure of Chain
    */
    await openFileAndAddToCanvas(page, 'KET/simple-chain.ket');
    await selectAllStructuresOnCanvas(page);
    await LeftToolbar(page).sGroup();
    await SGroupPropertiesDialog(page).setOptions({
      Type: TypeOption.Data,
      Context: ContextOption.Group,
      FieldName: 'T@#qwer123',
      FieldValue: 'Qw@!23#$%',
      PropertyLabelType: PropertyLabelType.Absolute,
    });
    await takeEditorScreenshot(page);
  });

  test('Add Data S-Group Multifragment context to Chain', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-12986
      Description: Data S-Group added to all structure of Chain
    */
    await openFileAndAddToCanvas(page, 'KET/simple-chain.ket');
    await selectAllStructuresOnCanvas(page);
    await LeftToolbar(page).sGroup();
    await SGroupPropertiesDialog(page).setOptions({
      Type: TypeOption.Data,
      Context: ContextOption.Multifragment,
      FieldName: 'T@#qwer123',
      FieldValue: 'Qw@!23#$%',
      PropertyLabelType: PropertyLabelType.Relative,
    });
    await takeEditorScreenshot(page);
  });

  test('Add Data S-Group for the reaction components', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1553
      Description: Data S-Group added to only structures. Not to plus sign and arrow.
    */
    await openFileAndAddToCanvas(page, 'KET/reaction-with-arrow-and-plus.ket');
    await selectAllStructuresOnCanvas(page);
    await LeftToolbar(page).sGroup();
    await SGroupPropertiesDialog(page).setOptions({
      Type: TypeOption.Data,
      Context: ContextOption.Multifragment,
      FieldName: 'T@#qwer123',
      FieldValue: 'Qw@!23#$%',
      PropertyLabelType: PropertyLabelType.Absolute,
    });
    await waitForRender(page, async () => {
      await moveMouseToTheMiddleOfTheScreen(page);
    });
    await takeEditorScreenshot(page);
  });

  test('Add Data S-Group for the reaction components with attached radio button', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1553
      Description: Data S-Group attached to only on atoms of structures. Not to plus sign and arrow.
    */
    await openFileAndAddToCanvas(page, 'KET/reaction-with-arrow-and-plus.ket');
    await selectAllStructuresOnCanvas(page);
    await LeftToolbar(page).sGroup();
    await SGroupPropertiesDialog(page).setOptions({
      Type: TypeOption.Data,
      Context: ContextOption.Multifragment,
      FieldName: 'T@#qwer123',
      FieldValue: '8',
      PropertyLabelType: PropertyLabelType.Attached,
    });
    await moveMouseAway(page);
    await waitForRender(page, async () => {
      await moveMouseToTheMiddleOfTheScreen(page);
    });
    await takeEditorScreenshot(page);
  });

  test('Edit Data S-Group Field name and Field Value', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1543
      Description: User is able to edit the Data S-group Field name and Field Value.
    */
    await openFileAndAddToCanvas(page, 'KET/chain-with-name-and-value.ket');
    await selectAllStructuresOnCanvas(page);
    await LeftToolbar(page).sGroup();
    await SGroupPropertiesDialog(page).setOptions({
      Type: TypeOption.Data,
      Context: ContextOption.Multifragment,
      FieldName: 'T@#qwer123',
      FieldValue: '8',
      PropertyLabelType: PropertyLabelType.Attached,
    });
    await takeEditorScreenshot(page);
  });

  test('Add atom on Chain with Data S-Group', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1544
      Description: User is able to add atom on structure with Data S-group.
    */
    const atomToolbar = RightToolbar(page);

    await openFileAndAddToCanvas(page, 'KET/chain-with-name-and-value.ket');
    await atomToolbar.clickAtom(Atom.Oxygen);
    await clickOnAtom(page, 'C', 3);
    await CommonLeftToolbar(page).selectAreaSelectionTool();
    await takeEditorScreenshot(page);
  });

  test('Delete and Undo/Redo atom on Chain with Data S-Group', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1544
      Description: User is able to delete and undo/redo atom on structure with Data S-group.
    */
    await openFileAndAddToCanvas(page, 'KET/chain-with-name-and-value.ket');
    await CommonLeftToolbar(page).erase();
    await clickOnAtom(page, 'C', 3);
    await takeEditorScreenshot(page);

    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Add R-Group Label and Undo/Redo on Chain with Data S-Group', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1544
      Description: User is able to add R-Group Label and Undo/Redo on structure with Data S-group.
    */
    await openFileAndAddToCanvas(page, 'KET/chain-with-name-and-value.ket');
    await LeftToolbar(page).selectRGroupTool(RGroupType.RGroupLabel);
    await clickOnAtom(page, 'C', 3);
    await RGroupDialog(page).setRGroupLabels(RGroup.R8);
    await CommonLeftToolbar(page).selectAreaSelectionTool();
    await takeEditorScreenshot(page);

    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Delete whole Chain with Data S-Group and Undo/Redo', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1544
      Description: User is able to delete whole Chain with Data S-Group and undo/redo.
    */
    await openFileAndAddToCanvas(page, 'KET/chain-with-name-and-value.ket');
    await selectAllStructuresOnCanvas(page);
    await page.getByTestId('delete').click();
    await takeEditorScreenshot(page);

    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Delete and Undo/Redo using hotkeys atom on Chain with Data S-Group', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1513
      Description: User is able to delete and undo/redo by hotkeys atom on structure with Data S-group.
    */
    await openFileAndAddToCanvas(page, 'KET/chain-with-name-and-value.ket');
    await setSettingsOption(page, AtomsSetting.DisplayCarbonExplicitly);
    await CommonLeftToolbar(page).erase();
    await getAtomLocator(page, { atomLabel: 'C', atomId: 3 }).click();
    await deleteByKeyboard(page);
    await takeEditorScreenshot(page);

    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Open .mol file with Data S-Group and save it as .cml file', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1546
      Description: .mol file opened and saved as .cml file
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V3000/chain-with-data-s-group-partstructure.mol',
    );

    await verifyFileExport(
      page,
      'CML/chain-with-data-s-group-partstructure-expected.cml',
      FileType.CML,
    );
    await takeEditorScreenshot(page);
  });

  test('Click on atom opens menu with context for atom', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1549
      Description: Openns S-Group menu with filled context field Atom
    */
    await openFileAndAddToCanvas(page, 'KET/simple-chain.ket');
    await LeftToolbar(page).sGroup();
    await clickOnAtom(page, 'C', 3);
    await takeEditorScreenshot(page);
  });

  test('Click on bond opens menu with context for bond', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1549
      Description: Openns S-Group menu with filled context field Bond
    */
    await openFileAndAddToCanvas(page, 'KET/simple-chain.ket');
    await LeftToolbar(page).sGroup();
    await getBondLocator(page, { bondId: 11 }).click({ force: true });
    await takeEditorScreenshot(page);
  });

  test('Selecting all structure opens menu with context for Fragment', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1549
      Description: Openns S-Group menu with filled context field Bond
    */
    await openFileAndAddToCanvas(page, 'KET/simple-chain.ket');
    await selectAllStructuresOnCanvas(page);
    await LeftToolbar(page).sGroup();
    await takeEditorScreenshot(page);
  });

  test('Hover over created S-Group displays tooltip for it', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-8907
      Description: Hover over created S-Group displays tooltip for Benzene ring with Nitrogen atom
    */
    await openFileAndAddToCanvas(page, 'KET/benzene-with-data-s-group.ket');
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
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
      Type: TypeOption.Data,
      Context: ContextOption.Multifragment,
      FieldName: 'T@#qwer123',
      FieldValue: '8',
      PropertyLabelType: PropertyLabelType.Absolute,
    });
    await verifyFileExport(
      page,
      'KET/cyclopropane-and-h2o-expected.ket',
      FileType.KET,
    );
    await takeEditorScreenshot(page);
  });
});
