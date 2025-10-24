/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-magic-numbers */
import { Page, test } from '@fixtures';
import {
  clickInTheMiddleOfTheScreen,
  takeEditorScreenshot,
  openFileAndAddToCanvas,
  pasteFromClipboardAndAddToCanvas,
  moveMouseToTheMiddleOfTheScreen,
  pressTab,
  FILE_TEST_DATA,
  clickOnAtom,
  moveOnAtom,
  clickOnCanvas,
  getCachedBodyCenter,
  deleteByKeyboard,
  keyboardPressOnCanvas,
  dragMouseAndMoveTo,
} from '@utils';
import {
  copyAndPaste,
  cutAndPaste,
  selectAllStructuresOnCanvas,
} from '@utils/canvas/selectSelection';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { SelectionToolType } from '@tests/pages/constants/areaSelectionTool/Constants';
import { SaveStructureDialog } from '@tests/pages/common/SaveStructureDialog';
import { RightToolbar } from '@tests/pages/molecules/RightToolbar';
import { Atom } from '@tests/pages/constants/atoms/atoms';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { MicroBondType } from '@tests/pages/constants/bondSelectionTool/Constants';
import { RGroupType } from '@tests/pages/constants/rGroupSelectionTool/Constants';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import { BottomToolbar } from '@tests/pages/molecules/BottomToolbar';
import { RingButton } from '@tests/pages/constants/ringButton/Constants';
import {
  contractAbbreviation,
  expandAbbreviation,
  removeAbbreviation,
} from '@utils/sgroup/helpers';
import { KETCHER_CANVAS } from '@tests/pages/constants/canvas/Constants';
import { StructureLibraryDialog } from '@tests/pages/molecules/canvas/StructureLibraryDialog';
import {
  FunctionalGroupsTabItems,
  SaltsAndSolventsTabItems,
  TemplateLibraryTab,
} from '@tests/pages/constants/structureLibraryDialog/Constants';
import { getAbbreviationLocator } from '@utils/canvas/s-group-signes/getAbbreviation';
import { TemplateEditDialog } from '@tests/pages/molecules/canvas/TemplateEditDialog';
import { getAtomLocator } from '@utils/canvas/atoms/getAtomLocator/getAtomLocator';

const CANVAS_CLICK_X = 300;
const CANVAS_CLICK_Y = 300;

// const MAX_BOND_LENGTH = 50;

const anyAtom = 3;

async function saveToTemplates(page: Page) {
  const saveToTemplatesButton = SaveStructureDialog(page).saveToTemplatesButton;
  const inputText = 'My Template';

  await CommonTopLeftToolbar(page).saveFile();
  await saveToTemplatesButton.click();
  await TemplateEditDialog(page).setMoleculeName(inputText);
  await TemplateEditDialog(page).save();
}

test.describe('Functional Groups', () => {
  let page: Page;
  test.beforeAll(async ({ initMoleculesCanvas }) => {
    page = await initMoleculesCanvas();
  });
  test.afterAll(async ({ closePage }) => {
    await closePage();
  });
  test.beforeEach(async ({ MoleculesCanvas: _ }) => {});

  test('Open from V2000 file with expanded functional group', async () => {
    /*
    Test case: EPMLSOPKET-2890
    Description: Functional Group contract and remove abbreviation
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/functional-groups-expanded.mol',
    );

    const middleOfTheScreen = await getCachedBodyCenter(page);
    await contractAbbreviation(page, middleOfTheScreen);
    await takeEditorScreenshot(page);
    await removeAbbreviation(
      page,
      getAbbreviationLocator(page, { name: 'Bz' }),
    );
    await takeEditorScreenshot(page);
  });

  test('Open from V2000 file with contracted functional group', async () => {
    /*
    Test case: EPMLSOPKET-2891
    Description: Functional Group expand and remove abbreviation
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/functional-group-contracted.mol',
    );

    const middleOfTheScreen = await getCachedBodyCenter(page);
    await expandAbbreviation(page, middleOfTheScreen);

    await takeEditorScreenshot(page);

    await removeAbbreviation(page, middleOfTheScreen);
    await takeEditorScreenshot(page);
  });

  test('Open functional group from library', async () => {
    /*
    Test case: EPMLSOPKET-2895
    Description: Contracted functional group is on the canvas. FG added on canvas near cursor.
    */
    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).addFunctionalGroup(
      FunctionalGroupsTabItems.FMOC,
    );
    await clickInTheMiddleOfTheScreen(page);
    await CommonLeftToolbar(page).selectAreaSelectionTool();
    await takeEditorScreenshot(page);
  });

  test('Copy/Paste action with expanded functional group', async () => {
    /*
     *Test case: EPMLSOPKET-2897
     *Description: Functional group is copied and pasted as expanded.
     */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/functional-groups-expanded.mol',
    );
    await copyAndPaste(page);
    await clickOnCanvas(page, CANVAS_CLICK_X, CANVAS_CLICK_Y, {
      from: 'pageTopLeft',
    });
    await takeEditorScreenshot(page);
  });

  test('Cut/Paste action with expanded functional group', async () => {
    /*
    Test case: EPMLSOPKET-2897
    Description: Functional group is cut and pasted as expanded.
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/functional-groups-expanded.mol',
    );
    await cutAndPaste(page);
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });

  test('Copy/Paste action with contracted functional group', async () => {
    /*
    Test case: EPMLSOPKET-2898
    Description: Functional group is copied and pasted as expanded.
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/functional-group-contracted.mol',
    );
    await copyAndPaste(page);
    await clickOnCanvas(page, CANVAS_CLICK_X, CANVAS_CLICK_Y, {
      from: 'pageTopLeft',
    });
    await takeEditorScreenshot(page);
  });

  test('Cut/Paste action with contracted functional group', async () => {
    /*
    Test case: EPMLSOPKET-2898
    Description: Functional group is cut and pasted as expanded.
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/functional-group-contracted.mol',
    );
    await cutAndPaste(page);
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });

  test('Attach functional group to the molecule', async () => {
    /*
    Test case: EPMLSOPKET-2916
    Description: Contracted FG is connected to the structure.
    */
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/structure-co2et.mol');
    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).addFunctionalGroup(
      FunctionalGroupsTabItems.CO2Et,
    );
    await clickInTheMiddleOfTheScreen(page);
    await CommonLeftToolbar(page).selectAreaSelectionTool();
    await takeEditorScreenshot(page);
  });

  test('Save functional groups to Custom Templates', async () => {
    /*
    Test case: EPMLSOPKET-2953
    Description: Contracted FG is connected to the structure.
    */
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/custom-template.mol');

    await saveToTemplates(page);

    await CommonTopLeftToolbar(page).clearCanvas();
    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).openSection(
      TemplateLibraryTab.UserTemplate,
    );
    await page.getByText('0OOCH3CCl3OO').click();
    await clickInTheMiddleOfTheScreen(page);
    await CommonLeftToolbar(page).selectAreaSelectionTool();
    await takeEditorScreenshot(page);
  });
});

test.describe('Functional Groups', () => {
  let page: Page;
  test.beforeAll(async ({ initMoleculesCanvas }) => {
    page = await initMoleculesCanvas();
  });
  test.afterAll(async ({ closePage }) => {
    await closePage();
  });
  test.beforeEach(async ({ MoleculesCanvas: _ }) => {});

  test('Open from V3000 file with contracted and expanded functional groups', async () => {
    /*
    Test case: EPMLSOPKET-2893
    Description: Contracted and Expanded functional groups are displayed on the canvas.
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V3000/V3000-contracted-and-expanded-fg.mol',
    );
    await takeEditorScreenshot(page);
  });

  test('Open from .ket file with contracted and expanded functional groups', async () => {
    /*
    Test case: EPMLSOPKET-2894
    Description: Contracted and Expanded functional groups are displayed on the canvas.
    */
    await openFileAndAddToCanvas(page, 'KET/expanded-and-contracted-fg.ket');
    await takeEditorScreenshot(page);
  });

  test('Paste from Clipboard with contracted and expanded functional groups', async () => {
    /*
    Test case: EPMLSOPKET-2892
    Description: Contracted and Expanded functional groups are displayed on the canvas.
    */
    await pasteFromClipboardAndAddToCanvas(
      page,
      FILE_TEST_DATA.expandedAndContractedFg,
    );
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });

  test('Highlight Functional Group with Selection tool', async () => {
    /*
    Test case: EPMLSOPKET-2899
    Description: Expanded functional group are highlight with Selection tool.
    */
    const x = 600;
    const y = 400;
    const smallShift = 10;
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/functional-group-expanded.mol',
    );
    await page.mouse.move(x, y);
    await page.mouse.move(x + smallShift, y);
    await takeEditorScreenshot(page);
  });

  test('Add Bond to expanded Functional Group', async () => {
    /*
    Test case: EPMLSOPKET-5236
    Description: When Adding 'Bond' to expanded Functional Group system display 'Edit Abbreviation' pop-up window.
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/functional-group-expanded.mol',
    );
    await CommonLeftToolbar(page).selectBondTool(MicroBondType.Single);
    await clickOnAtom(page, 'C', anyAtom);
    await takeEditorScreenshot(page);
  });

  test('Add Atom to expanded Functional Group', async () => {
    /*
    Test case: EPMLSOPKET-5238
    Description: When Adding 'Atom' to expanded Functional Group system display 'Edit Abbreviation' pop-up window.
    */
    const atomToolbar = RightToolbar(page);
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/functional-group-expanded.mol',
    );

    await atomToolbar.clickAtom(Atom.Nitrogen);
    await clickOnAtom(page, 'C', anyAtom);
    await takeEditorScreenshot(page);
  });

  test('Add Chain to expanded Functional Group', async () => {
    /*
    Test case: EPMLSOPKET-5237
    Description: When Adding 'Chain' to expanded Functional Group system display 'Edit Abbreviation' pop-up window.
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/functional-group-expanded.mol',
    );
    await LeftToolbar(page).chain();
    await clickOnAtom(page, 'C', anyAtom);
    await takeEditorScreenshot(page);
  });

  test('Add Template to expanded Functional Group', async () => {
    /*
    Test case: EPMLSOPKET-5239
    Description: When Adding 'Template' to expanded Functional Group system display 'Edit Abbreviation' pop-up window.
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/functional-group-expanded.mol',
    );
    await BottomToolbar(page).clickRing(RingButton.Benzene);
    await clickOnAtom(page, 'C', anyAtom);
    await takeEditorScreenshot(page);
  });

  test('Add Charge Plus to expanded Functional Group', async () => {
    /*
    Test case: EPMLSOPKET-5240
    Description: When Adding 'Charge Plus' to expanded Functional Group system display 'Edit Abbreviation' pop-up window.
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/functional-group-expanded.mol',
    );
    await LeftToolbar(page).chargePlus();
    await clickOnAtom(page, 'C', anyAtom);
    await takeEditorScreenshot(page);
  });

  test('Add Charge Minus to expanded Functional Group', async () => {
    /*
    Test case: EPMLSOPKET-5241
    Description: When Adding 'Charge Minus' to expanded Functional Group system display 'Edit Abbreviation' pop-up window.
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/functional-group-expanded.mol',
    );
    await LeftToolbar(page).chargeMinus();
    await clickOnAtom(page, 'C', anyAtom);
    await takeEditorScreenshot(page);
  });

  test('Add Erase to expanded Functional Group', async () => {
    /*
    Test case: EPMLSOPKET-5242
    Description: When Adding 'Erase' to expanded Functional Group system display 'Edit Abbreviation' pop-up window.
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/functional-group-expanded.mol',
    );
    await CommonLeftToolbar(page).erase();
    await clickOnAtom(page, 'C', anyAtom);
    await takeEditorScreenshot(page);
  });

  test('Click S-Group tool to expanded Functional Group', async () => {
    /*
    Test case: EPMLSOPKET-3937
    Description: When click 'S-Group tool to expanded Functional Group system display 'Edit Abbreviation' pop-up window.
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/functional-group-expanded.mol',
    );
    await selectAllStructuresOnCanvas(page);
    await LeftToolbar(page).sGroup();
    await takeEditorScreenshot(page);
  });

  test('Click S-Group tool to contracted Functional Group', async () => {
    /*
    Test case: EPMLSOPKET-13009
    Description: When click 'S-Group tool to contracted Functional Group system display 'Edit Abbreviation' pop-up window.
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/functional-group-contracted.mol',
    );
    await selectAllStructuresOnCanvas(page);
    await LeftToolbar(page).sGroup();
    await takeEditorScreenshot(page);
  });

  test('Add R-Group Label Tool to expanded Functional Group', async () => {
    /*
    Test case: EPMLSOPKET-5244
    Description: When Adding 'R-Group Label Tool' to expanded Functional Group system display 'Edit Abbreviation' pop-up window.
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/functional-group-expanded.mol',
    );
    await LeftToolbar(page).selectRGroupTool(RGroupType.RGroupLabel);
    await clickOnAtom(page, 'C', anyAtom);
    await takeEditorScreenshot(page);
  });

  test('Add R-Group Fragment Tool to expanded Functional Group', async () => {
    /*
    Test case: EPMLSOPKET-5244
    Description: When Adding 'R-Group Fragment Tool' to expanded Functional Group system display 'Edit Abbreviation' pop-up window.
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/functional-group-expanded.mol',
    );
    await LeftToolbar(page).selectRGroupTool(RGroupType.RGroupFragment);
    await clickOnAtom(page, 'C', anyAtom);
    await takeEditorScreenshot(page);
  });

  test('Add Attachment Point Tool to expanded Functional Group', async () => {
    /*
    Test case: EPMLSOPKET-5244
    Description: When Adding 'Attachment Point Tool' to expanded Functional Group system display 'Edit Abbreviation' pop-up window.
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/functional-group-expanded.mol',
    );
    await LeftToolbar(page).selectRGroupTool(RGroupType.AttachmentPoint);
    await clickOnAtom(page, 'C', anyAtom);
    await takeEditorScreenshot(page);
  });

  test('Ordinary elements should not show explicit valences (SO3H)', async () => {
    /*
    Test case: EPMLSOPKET-8915
    Description: Ordinary elements should not show explicit valences for 'S'.
    */
    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).addFunctionalGroup(
      FunctionalGroupsTabItems.SO3H,
    );
    await clickInTheMiddleOfTheScreen(page);

    const middleOfTheScreen = await getCachedBodyCenter(page);
    await expandAbbreviation(page, middleOfTheScreen);
    await takeEditorScreenshot(page);
  });

  test('Ordinary elements should not show explicit valences (PO4H2)', async () => {
    /*
    Test case: EPMLSOPKET-8915
    Description: Ordinary elements should not show explicit valences for 'P'.
    */
    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).addFunctionalGroup(
      FunctionalGroupsTabItems.PO4H2,
    );
    await clickInTheMiddleOfTheScreen(page);

    const middleOfTheScreen = await getCachedBodyCenter(page);
    await expandAbbreviation(page, middleOfTheScreen);
    await takeEditorScreenshot(page);
  });

  test('Selection highlight is displayed correctly for functional groups with longer names', async () => {
    /*
    Test case: EPMLSOPKET-8916
    Description: Selection highlight all abbreviation.
    */
    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).addFunctionalGroup(
      FunctionalGroupsTabItems.PhCOOH,
    );
    await clickInTheMiddleOfTheScreen(page);

    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });

  test('Selection highlight is displayed correctly for salts and solvents with longer names', async () => {
    /*
    Test case: EPMLSOPKET-13010
    Description: Selection highlight all abbreviation.
    */
    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).addSaltsAndSolvents(
      SaltsAndSolventsTabItems.MethaneSulphonicAcid,
    );
    await clickInTheMiddleOfTheScreen(page);

    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });

  test('Selection highlight appears immediately after hover over text', async () => {
    /*
    Test case: EPMLSOPKET-8920
    Description: Selection highlight appears immediately after hover over text.
    */
    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).addSaltsAndSolvents(
      SaltsAndSolventsTabItems.MethaneSulphonicAcid,
    );
    await clickInTheMiddleOfTheScreen(page);

    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await page
      .getByTestId(KETCHER_CANVAS)
      .filter({ has: page.locator(':visible') })
      .getByText('me')
      .first()
      .hover();
    await takeEditorScreenshot(page);
  });

  test('Add Atom by hotkey to expanded Functional Group', async () => {
    /*
    Test case: EPMLSOPKET-8928
    Description: When Adding 'Atom' by hotkey to expanded Functional Group system display 'Edit Abbreviation' pop-up window.
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/functional-group-expanded.mol',
    );
    await moveOnAtom(page, 'C', anyAtom);
    await keyboardPressOnCanvas(page, 'n');
    await takeEditorScreenshot(page);
  });

  test('Add Atom by hotkey to expanded Salts and Solvents', async () => {
    /*
    Test case: EPMLSOPKET-8928
    Description: When Adding 'Atom' by hotkey to expanded Salts and Solvents system display 'Edit Abbreviation' pop-up window.
    */
    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).addSaltsAndSolvents(
      SaltsAndSolventsTabItems.MethaneSulphonicAcid,
    );

    await clickInTheMiddleOfTheScreen(page);
    const middleOfTheScreen = await getCachedBodyCenter(page);
    await expandAbbreviation(page, middleOfTheScreen);

    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    const point = await getAtomLocator(page, { atomLabel: 'S' })
      .first()
      .boundingBox();
    if (point) {
      await page.mouse.move(point.x, point.y);
      await keyboardPressOnCanvas(page, 'n');
    }
    await takeEditorScreenshot(page);
  });

  test('Add Functional Group abbreviation to FG connected to terminal atoms of structure', async () => {
    /*
    Test case: EPMLSOPKET-10112
    Description: With each addition of FG to FG connected to terminal atoms of structure,
    bond is not disappears and structure is not decreases.
    */
    const x = 540;
    const y = 350;
    await openFileAndAddToCanvas(page, 'KET/chain.ket');
    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).addFunctionalGroup(
      FunctionalGroupsTabItems.CN,
    );
    const point = await getAtomLocator(page, { atomLabel: 'C' })
      .first()
      .boundingBox();
    if (point) {
      await clickOnCanvas(page, point.x, point.y, { from: 'pageTopLeft' });
    }
    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).addFunctionalGroup(
      FunctionalGroupsTabItems.Ms,
    );
    await clickOnCanvas(page, x, y, { from: 'pageTopLeft' });
    await CommonLeftToolbar(page).selectAreaSelectionTool();
    await takeEditorScreenshot(page);
  });

  test('Hotkey (Del) can delete Functional Groups abbreviation', async () => {
    /*
    Test case: EPMLSOPKET-11844
    Description: Hotkey (Del) delete Functional Groups abbreviation.
    */
    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).addFunctionalGroup(
      FunctionalGroupsTabItems.Boc,
    );
    await clickInTheMiddleOfTheScreen(page);

    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await moveMouseToTheMiddleOfTheScreen(page);
    await deleteByKeyboard(page);
    await CommonLeftToolbar(page).selectAreaSelectionTool();
    await takeEditorScreenshot(page);
  });

  test('Hotkey (Del) can delete Salts and Solvents abbreviation', async () => {
    /*
    Test case: EPMLSOPKET-11844
    Description: Hotkey (Del) delete Salts and Solvents abbreviation.
    */
    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).addSaltsAndSolvents(
      SaltsAndSolventsTabItems.MethaneSulphonicAcid,
    );
    await clickInTheMiddleOfTheScreen(page);

    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await moveMouseToTheMiddleOfTheScreen(page);
    await deleteByKeyboard(page);
    await CommonLeftToolbar(page).selectAreaSelectionTool();
    await takeEditorScreenshot(page);
  });

  test('Hotkey for Atom can replace Functional Groups abbreviation', async () => {
    /*
    Test case: EPMLSOPKET-11845
    Description: Hotkey for Atom (e.g. N) replace Functional Group abbreviation.
    */
    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).addFunctionalGroup(
      FunctionalGroupsTabItems.Boc,
    );
    await clickInTheMiddleOfTheScreen(page);

    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await moveMouseToTheMiddleOfTheScreen(page);
    await keyboardPressOnCanvas(page, 'n');
    await CommonLeftToolbar(page).selectAreaSelectionTool();
    await takeEditorScreenshot(page);
  });

  test('Hotkey for Atom can replace Salts and Solvents abbreviation', async () => {
    /*
    Test case: EPMLSOPKET-11845
    Description: Hotkey for Atom (e.g. N) replace Salts and Solvents abbreviation.
    */
    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).addSaltsAndSolvents(
      SaltsAndSolventsTabItems.MethaneSulphonicAcid,
    );
    await clickInTheMiddleOfTheScreen(page);
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await moveMouseToTheMiddleOfTheScreen(page);
    await keyboardPressOnCanvas(page, 'o');
    await CommonLeftToolbar(page).selectAreaSelectionTool();
    await takeEditorScreenshot(page);
  });

  test('Select Functional Group by hovering one of the atom of structure and press hotkey', async () => {
    /*
    Test case: EPMLSOPKET-11849
    Description: Structure on canvas not becomes 'undefined' when atom is hovered and Functional Group selected using hotkey.
    */
    await openFileAndAddToCanvas(page, 'KET/chain.ket');
    await moveOnAtom(page, 'C', anyAtom);
    await page.keyboard.press('Shift+t');
    await pressTab(page, 'Functional Groups');
    await page.getByTitle('Boc').click();
    await clickInTheMiddleOfTheScreen(page);
    await CommonLeftToolbar(page).selectAreaSelectionTool();
    await takeEditorScreenshot(page);
  });

  test('Expand/Contract unknown superatom', async () => {
    /*
    Test case: EPMLSOPKET-11851
    Description: Unknown superatom expand and contract.
    */
    const middleOfTheScreen = await getCachedBodyCenter(page);

    await openFileAndAddToCanvas(page, 'Molfiles-V2000/unknown-superatom.mol');
    await expandAbbreviation(page, middleOfTheScreen);
    await takeEditorScreenshot(page);

    await contractAbbreviation(page, middleOfTheScreen);
    await takeEditorScreenshot(page);
  });

  test('Check that expanded Functional Groups not overlap each other', async () => {
    /*
      Test case: EPMLSOPKET-12977
      Description: Expanded Functional Groups not overlap each other
    */
    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).addFunctionalGroup(
      FunctionalGroupsTabItems.Cbz,
    );
    await clickInTheMiddleOfTheScreen(page);

    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).addFunctionalGroup(
      FunctionalGroupsTabItems.Boc,
    );
    await dragMouseAndMoveTo(page, 50);
    await selectAllStructuresOnCanvas(page);
    const middleOfTheScreen = await getCachedBodyCenter(page);
    await expandAbbreviation(page, middleOfTheScreen);
    await takeEditorScreenshot(page);
  });

  test('Add a custom structure to a canvas with an expanded functional group and contract it', async () => {
    /*
    Test case: EPMLSOPKET-12978
    Description: Functional Group contract and remove abbreviation
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/custom-structure-with-expanded-fg.mol',
    );

    const middleOfTheScreen = await getCachedBodyCenter(page);
    await contractAbbreviation(page, middleOfTheScreen);
    await takeEditorScreenshot(page);
  });

  test('After expand a Functional Group hotkeys for atoms not stop working', async () => {
    /*
    Test case: EPMLSOPKET-12988
    Description: After pressing hotkey 'N' it can be placed on canvas.
    Test working not properly. We have open bug https://github.com/epam/ketcher/issues/2591
    */
    const x = 300;
    const y = 300;
    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).addFunctionalGroup(
      FunctionalGroupsTabItems.Boc,
    );
    await clickInTheMiddleOfTheScreen(page);

    await CommonLeftToolbar(page).selectAreaSelectionTool();
    await expandAbbreviation(
      page,
      getAbbreviationLocator(page, { name: 'Boc' }),
    );
    await page.keyboard.press('n');
    await clickOnCanvas(page, x, y, { from: 'pageTopLeft' });
    await takeEditorScreenshot(page);
  });
});
