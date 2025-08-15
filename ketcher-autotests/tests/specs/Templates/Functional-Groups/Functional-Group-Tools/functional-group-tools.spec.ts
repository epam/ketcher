/* eslint-disable no-magic-numbers */
import { test } from '@playwright/test';
import {
  openFileAndAddToCanvas,
  pressButton,
  clickInTheMiddleOfTheScreen,
  dragMouseTo,
  takeEditorScreenshot,
  clickOnAtom,
  waitForPageInit,
  moveOnAtom,
  waitForRender,
  cutToClipboardByKeyboard,
  pasteFromClipboardByKeyboard,
  copyToClipboardByKeyboard,
  clickOnCanvas,
  getCachedBodyCenter,
  keyboardPressOnCanvas,
  dragMouseAndMoveTo,
} from '@utils';
import { resetCurrentTool } from '@utils/canvas/tools/resetCurrentTool';
import { selectAllStructuresOnCanvas } from '@utils/canvas/selectSelection';
import { getAtomByIndex } from '@utils/canvas/atoms';
import { getRotationHandleCoordinates } from '@utils/clicks/selectButtonByTitle';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { SelectionToolType } from '@tests/pages/constants/areaSelectionTool/Constants';
import { RightToolbar } from '@tests/pages/molecules/RightToolbar';
import { Atom } from '@tests/pages/constants/atoms/atoms';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { MicroBondType } from '@tests/pages/constants/bondSelectionTool/Constants';
import { IndigoFunctionsToolbar } from '@tests/pages/molecules/IndigoFunctionsToolbar';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import { RGroupType } from '@tests/pages/constants/rGroupSelectionTool/Constants';
import { ArrowType } from '@tests/pages/constants/arrowSelectionTool/Constants';
import { ReactionMappingType } from '@tests/pages/constants/reactionMappingTool/Constants';
import { ShapeType } from '@tests/pages/constants/shapeSelectionTool/Constants';
import {
  BottomToolbar,
  selectRingButton,
} from '@tests/pages/molecules/BottomToolbar';
import { RingButton } from '@tests/pages/constants/ringButton/Constants';
import {
  contractAbbreviation,
  expandAbbreviation,
  removeAbbreviation,
} from '@utils/sgroup/helpers';
import {
  FunctionalGroupsTabItems,
  TabSection,
} from '@tests/pages/constants/structureLibraryDialog/Constants';
import { StructureLibraryDialog } from '@tests/pages/molecules/canvas/StructureLibraryDialog';
import { getAbbreviationLocator } from '@utils/canvas/s-group-signes/getAbbreviation';

// const X_DELTA = 300;

test.describe('Templates - Functional Group Tools', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Add a Bond to a contracted Functional Group', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-10086
    Description: A bond is added to a contracted functional group and form a bond
    */
    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).addFunctionalGroup(
      FunctionalGroupsTabItems.Boc,
    );
    await clickInTheMiddleOfTheScreen(page);

    await CommonLeftToolbar(page).selectBondTool(MicroBondType.Single);
    await clickInTheMiddleOfTheScreen(page);
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });

  test('Add a Chain to a contracted Functional Group', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-10087
    Description: A chain is added to a contracted functional group and form a bond
    */
    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).addFunctionalGroup(
      FunctionalGroupsTabItems.FMOC,
    );
    await clickInTheMiddleOfTheScreen(page);

    await LeftToolbar(page).chain();
    await dragMouseAndMoveTo(page, 300);
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });

  test('Fragment Selection of expanded Functional Group', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2889
    Description: All the Functional Group elements are selected and highlighted on the canvas
   */
    const anyAtom = 0;

    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/functional-group-expanded.mol',
    );
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Fragment,
    );
    await clickOnAtom(page, 'C', anyAtom);
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });

  test('Rotate of expanded Functional Group', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2900
    Description: All elements of the Functional Group are rotated
   */
    const COORDINATES_TO_PERFORM_ROTATION = {
      x: 20,
      y: 160,
    };
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/functional-group-expanded.mol',
    );

    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await selectAllStructuresOnCanvas(page);
    const coordinates = await getRotationHandleCoordinates(page);
    const { x: rotationHandleX, y: rotationHandleY } = coordinates;

    await page.mouse.move(rotationHandleX, rotationHandleY);
    await page.mouse.down();
    await page.mouse.move(
      COORDINATES_TO_PERFORM_ROTATION.x,
      COORDINATES_TO_PERFORM_ROTATION.y,
    );
    await page.mouse.up();
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });

  test('Rotate Tool (FG + Other structures)', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-3935
    Description: The selected Functional Group is rotated. Benzene ring is rotated.
   */
    const COORDINATES_TO_PERFORM_ROTATION = {
      x: 20,
      y: 160,
    };
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/expand-functional-group-with-benzene.mol',
    );

    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await selectAllStructuresOnCanvas(page);

    const coordinates = await getRotationHandleCoordinates(page);
    const { x: rotationHandleX, y: rotationHandleY } = coordinates;

    await page.mouse.move(rotationHandleX, rotationHandleY);
    await page.mouse.down();
    await page.mouse.move(
      COORDINATES_TO_PERFORM_ROTATION.x,
      COORDINATES_TO_PERFORM_ROTATION.y,
    );
    await page.mouse.up();
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });

  test('Add Charge to the Functional group', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2913
    Description: EDIT ABBREVIATION window appears after click by Charge on expanded FG.
    After click Remove abbreviation in modal window user can add Charge to structure.
   */
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/expanded-fg-CO2Et.mol');

    await LeftToolbar(page).chargeMinus();
    await clickInTheMiddleOfTheScreen(page);
    await waitForRender(page, async () => {
      await pressButton(page, 'Remove Abbreviation');
    });

    await LeftToolbar(page).chargePlus();
    await clickInTheMiddleOfTheScreen(page);
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });

  test('Dragging a selected Functional Group not duplicates it', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-8938
    Description: A duplicate is not created, the original Functional Group is dragged with the cursor
   */
    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).addFunctionalGroup(
      FunctionalGroupsTabItems.CO2Et,
    );
    await clickInTheMiddleOfTheScreen(page);

    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await dragMouseAndMoveTo(page, 300);
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });

  test('Add Bond to the expanded Functional group', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2908
    Description: EDIT ABBREVIATION window appears after click by Bond on expanded FG.
    After click Remove abbreviation in modal window user can add Bond to structure.
   */
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/expanded-fg-CO2Et.mol');

    await CommonLeftToolbar(page).selectBondTool(MicroBondType.Single);
    await clickInTheMiddleOfTheScreen(page);
    await waitForRender(page, async () => {
      await pressButton(page, 'Remove Abbreviation');
    });
    await clickInTheMiddleOfTheScreen(page);
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });

  test('Add Chain to the expanded Functional group', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2910
    Description: EDIT ABBREVIATION window appears after click by Chain on expanded FG.
    After click Remove abbreviation in modal window user can add Chain to structure.
   */
    const x = 650;
    const y = 650;
    const anyAtom = 1;
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/expanded-fg-CO2Et.mol');

    await LeftToolbar(page).chain();
    await clickInTheMiddleOfTheScreen(page);
    await waitForRender(page, async () => {
      await pressButton(page, 'Remove Abbreviation');
    });
    await clickOnAtom(page, 'O', anyAtom);
    await dragMouseTo(x, y, page);
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });

  test('Add Atom to the expanded Functional group', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2911
    Description: EDIT ABBREVIATION window appears after click by Chain on expanded FG.
    After click Remove abbreviation in modal window user can add Chain to structure.
   */
    const atomToolbar = RightToolbar(page);
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/expanded-fg-CO2Et.mol');

    await atomToolbar.clickAtom(Atom.Nitrogen);
    await clickInTheMiddleOfTheScreen(page);
    await waitForRender(page, async () => {
      await pressButton(page, 'Remove Abbreviation');
    });
    await clickInTheMiddleOfTheScreen(page);
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });

  test('Remove Abbreviation and Undo/Redo action for Functional group', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-2907
    Description: A modal window appears. Window contains two options: 'Expand Abbreviation', 'Remove Abbreviation'.
    FG is removed (ungrouped and displayed in expanded view).
    FG is contracted.
    FG is removed (ungrouped and displayed in expanded view).
   */
    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).addFunctionalGroup(
      FunctionalGroupsTabItems.CO2Et,
    );
    await clickInTheMiddleOfTheScreen(page);
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await removeAbbreviation(
      page,
      getAbbreviationLocator(page, { name: 'CO2Et' }).first(),
    );
    await CommonTopLeftToolbar(page).undo();
    await resetCurrentTool(page);
    await CommonTopLeftToolbar(page).redo();
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });
});

test.describe('Templates - Functional Group Tools2', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('EDIT ABBREVIATION window appears after click on expanded Functional Group', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-2909
    Description: EDIT ABBREVIATION window appears after click by Bond tool on expanded FG and
    after click Cancel in modal window FG still have brackets.
   */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/functional-group-expanded.mol',
    );

    await CommonLeftToolbar(page).selectBondTool(MicroBondType.Single);
    const point = await getAtomByIndex(page, { label: 'C' }, 0);
    await clickOnCanvas(page, point.x, point.y, { from: 'pageTopLeft' });

    await resetCurrentTool(page);
    await takeEditorScreenshot(page);

    await pressButton(page, 'Cancel');
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });

  test('Vertical Flip of expanded Functional Group', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2928
    Description: If only FG is selected then only
    FG is flipped 180 degrees in the vertical direction;
    If nothing is selected then all the structures
    on the canvas are flipped 180 degrees in the vertical direction
   */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/expand-functional-group-with-benzene.mol',
    );
    await selectAllStructuresOnCanvas(page);
    await pressButton(page, 'Vertical Flip (Alt+V)');

    await resetCurrentTool(page);
    await takeEditorScreenshot(page);

    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await clickInTheMiddleOfTheScreen(page);

    await pressButton(page, 'Vertical Flip (Alt+V)');
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });

  test('Horizontal Flip of expanded Functional Group', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2928
    Description: If only FG is selected then only
    FG is flipped 180 degrees in the horizontal direction;
    If nothing is selected then all the structures
    on the canvas are flipped 180 degrees in the horizontal direction
   */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/expand-functional-group-with-benzene.mol',
    );

    await selectAllStructuresOnCanvas(page);
    await pressButton(page, 'Horizontal Flip (Alt+H)');

    await resetCurrentTool(page);
    await takeEditorScreenshot(page);

    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await clickInTheMiddleOfTheScreen(page);

    await pressButton(page, 'Horizontal Flip (Alt+H)');
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });

  test('Erase of contracted and expanded Functional Group', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-2901
    Description: Contracted Functional Group is removed after click with Erase tool;
    Expanded Functional Group is removed if were selected by Rectangle selection;
    EDIT ABBREVIATION window appears if click by Erase tool on expanded FG without selection.
   */
    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).addFunctionalGroup(
      FunctionalGroupsTabItems.Boc,
    );
    await clickInTheMiddleOfTheScreen(page);

    await CommonLeftToolbar(page).selectEraseTool();
    await getAbbreviationLocator(page, { name: 'Boc' }).first().click();

    await resetCurrentTool(page);
    await takeEditorScreenshot(page);

    await CommonTopLeftToolbar(page).undo();
    await getAbbreviationLocator(page, { name: 'Boc' }).first().click();
    await CommonLeftToolbar(page).selectEraseTool();

    await resetCurrentTool(page);
    await takeEditorScreenshot(page);

    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/functional-group-expanded.mol',
    );
    await selectAllStructuresOnCanvas(page);
    await page.getByTestId('delete').click();
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });

  test('Add Template to the Functional group', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2912
    Description: EDIT ABBREVIATION window appears after click by Template on expanded FG.
    After click Remove abbreviation in modal window user can add Template to structure.
   */
    let point: { x: number; y: number };
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/functional-group-expanded.mol',
    );

    await selectRingButton(page, RingButton.Benzene);
    point = await getAtomByIndex(page, { label: 'C' }, 0);
    await clickOnCanvas(page, point.x, point.y, { from: 'pageTopLeft' });
    await waitForRender(page, async () => {
      await pressButton(page, 'Remove Abbreviation');
    });

    await takeEditorScreenshot(page);

    await selectRingButton(page, RingButton.Cyclopentadiene);
    point = await getAtomByIndex(page, { label: 'C' }, 0);
    await clickOnCanvas(page, point.x, point.y, { from: 'pageTopLeft' });
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });

  test('Expand/Contract/Remove Abbreviation of Functional Group', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-2914
    Description: 1)Functional group is expanded. 2)Functional group is contracted.
    3)Functional group is ungrouped and displayed in expanded view.
    The 'Remove Abbreviation' option does not remove the atoms and bonds.
   */
    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).addFunctionalGroup(
      FunctionalGroupsTabItems.Boc,
    );
    await clickInTheMiddleOfTheScreen(page);

    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );

    const middleOfTheScreen = await getCachedBodyCenter(page);
    await expandAbbreviation(page, middleOfTheScreen);
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);

    await contractAbbreviation(page, middleOfTheScreen);
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);

    await removeAbbreviation(page, middleOfTheScreen);

    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });

  test('Expand/Contract Abbreviation of Functional Group and Undo/Redo action', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-2904
    Description: 'Expand/Contract Abbreviation' button can work several times on the same FG.
    Undo/Redo actions are correct expand and contract Functional Group.
   */
    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).addFunctionalGroup(
      FunctionalGroupsTabItems.CO2Et,
    );
    await clickInTheMiddleOfTheScreen(page);

    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    const middleOfTheScreen = await getCachedBodyCenter(page);
    await expandAbbreviation(page, middleOfTheScreen);
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);

    await contractAbbreviation(page, middleOfTheScreen);

    await resetCurrentTool(page);
    await takeEditorScreenshot(page);

    await CommonTopLeftToolbar(page).undo();
    await CommonTopLeftToolbar(page).redo();
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });

  test('Rectangle and Lasso Selection of expanded Functional Group', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-2888
    Description: All the Functional Group elements are selected and highlighted on the canvas
   */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/functional-group-expanded.mol',
    );

    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await clickInTheMiddleOfTheScreen(page);
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);

    await CommonTopLeftToolbar(page).clearCanvas();

    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/functional-group-expanded.mol',
    );

    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Lasso,
    );
    await clickInTheMiddleOfTheScreen(page);
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });

  test('Expand Functional Group on a structure', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2917
    Description: Functional Group is expanded on a Benzene ring. No overlapping.
   */
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/benzene-bond-fg.mol');
    await expandAbbreviation(
      page,
      getAbbreviationLocator(page, { name: 'Boc' }),
    );
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });

  test('Contract Functional Group on a structure', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2918
    Description: Functional Group is contracted on a Benzene ring.
   */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/expanded-fg-benzene.mol',
    );
    const middleOfTheScreen = await getCachedBodyCenter(page);
    await contractAbbreviation(page, middleOfTheScreen);

    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });

  test('Bond between Functional Group and structure not disappears after adding Functional Group again', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-10085
    Description: Added Functional Group replaces the existing one and the bond remains in place
   */
    const clickCoordines = {
      x1: 560,
      y1: 360,
      x2: 700,
      y2: 360,
    };

    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/benzene-with-two-bonds.mol',
    );
    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).addFunctionalGroup(
      FunctionalGroupsTabItems.CO2Et,
    );
    await clickOnCanvas(page, clickCoordines.x1, clickCoordines.y1, {
      from: 'pageTopLeft',
    });
    await resetCurrentTool(page);
    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).addFunctionalGroup(
      FunctionalGroupsTabItems.CPh3,
    );
    await clickOnCanvas(page, clickCoordines.x2, clickCoordines.y2, {
      from: 'pageTopLeft',
    });
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });

  test('The Functional Group is added to all top of the bonds', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-8927
    Description: The Functional Group is added to all bonds without errors and distortions
   */
    const COORDS_CLICK = {
      x1: 560,
      y1: 330,
      x2: 650,
      y2: 280,
      x3: 720,
      y3: 320,
      x4: 720,
      y4: 400,
      x5: 650,
      y5: 450,
      x6: 560,
      y6: 400,
    };

    await openFileAndAddToCanvas(page, 'Molfiles-V2000/benzene-with-bonds.mol');
    await clickInTheMiddleOfTheScreen(page);
    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).addFunctionalGroup(
      FunctionalGroupsTabItems.Ac,
    );
    await clickOnCanvas(page, COORDS_CLICK.x2, COORDS_CLICK.y2, {
      from: 'pageTopLeft',
    });
    await clickOnCanvas(page, COORDS_CLICK.x3, COORDS_CLICK.y3, {
      from: 'pageTopLeft',
    });
    await clickOnCanvas(page, COORDS_CLICK.x1, COORDS_CLICK.y1, {
      from: 'pageTopLeft',
    });
    await clickOnCanvas(page, COORDS_CLICK.x4, COORDS_CLICK.y4, {
      from: 'pageTopLeft',
    });
    await clickOnCanvas(page, COORDS_CLICK.x5, COORDS_CLICK.y5, {
      from: 'pageTopLeft',
    });
    await clickOnCanvas(page, COORDS_CLICK.x6, COORDS_CLICK.y6, {
      from: 'pageTopLeft',
    });
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });

  test('Functional Group replaced by atom', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-3994
    Description: The FG is replaced by Nitrogen atom
   */
    const atomToolbar = RightToolbar(page);
    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).addFunctionalGroup(
      FunctionalGroupsTabItems.FMOC,
    );
    await clickInTheMiddleOfTheScreen(page);

    await atomToolbar.clickAtom(Atom.Nitrogen);
    await clickInTheMiddleOfTheScreen(page);
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });
});

test.describe('Templates - Functional Group Tools3', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Filtering Functional Groups', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2930
    Description: All FG's which contain symbols 'C2' are displayed on FG's window.
    All FG's which contain symbols 'Y' are displayed on FG's window.
   */
    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).openTab(TabSection.FunctionalGroupsTab);
    await StructureLibraryDialog(page).setSearchValue('C2');
    await StructureLibraryDialog(page).clickSearch();
    await takeEditorScreenshot(page);

    await page.getByRole('banner').getByRole('button').click();

    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).setSearchValue('Y');
    await StructureLibraryDialog(page).clickSearch();
    await takeEditorScreenshot(page);
  });

  test('Expand/Remove abbreviation context menu with selected tools', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-3933
    Description:  Functional Group-Expand/Remove abbreviation context menu is shown
   */
    const timeout = 120_000;
    test.setTimeout(timeout);
    const atomToolbar = RightToolbar(page);
    const commonLeftToolbar = CommonLeftToolbar(page);
    const leftToolbar = LeftToolbar(page);

    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).addFunctionalGroup(
      FunctionalGroupsTabItems.CO2Et,
    );
    await clickInTheMiddleOfTheScreen(page);

    await commonLeftToolbar.selectHandTool();
    await commonLeftToolbar.areaSelectionDropdownButton.click();
    await clickInTheMiddleOfTheScreen(page, 'right');
    await takeEditorScreenshot(page);

    await commonLeftToolbar.eraseButton.click();
    await clickInTheMiddleOfTheScreen(page, 'right');
    await takeEditorScreenshot(page);

    await commonLeftToolbar.selectBondTool(MicroBondType.Single);
    await clickInTheMiddleOfTheScreen(page, 'right');
    await takeEditorScreenshot(page);

    await leftToolbar.chain();
    await clickInTheMiddleOfTheScreen(page, 'right');
    await takeEditorScreenshot(page);

    await leftToolbar.chargePlus();
    await clickInTheMiddleOfTheScreen(page, 'right');
    await takeEditorScreenshot(page);

    await leftToolbar.chargeMinus();
    await clickInTheMiddleOfTheScreen(page, 'right');
    await takeEditorScreenshot(page);

    await leftToolbar.sGroup();
    await clickInTheMiddleOfTheScreen(page, 'right');
    await takeEditorScreenshot(page);

    await leftToolbar.selectRGroupTool(RGroupType.RGroupLabel);
    await clickInTheMiddleOfTheScreen(page, 'right');
    await takeEditorScreenshot(page);

    await leftToolbar.selectArrowTool(ArrowType.ArrowOpenAngle);
    await clickInTheMiddleOfTheScreen(page, 'right');
    await takeEditorScreenshot(page);

    await leftToolbar.selectReactionMappingTool(
      ReactionMappingType.ReactionMapping,
    );
    await clickInTheMiddleOfTheScreen(page, 'right');
    await takeEditorScreenshot(page);

    await leftToolbar.selectRGroupTool(RGroupType.RGroupLabel);
    await clickInTheMiddleOfTheScreen(page, 'right');

    await leftToolbar.selectShapeTool(ShapeType.Ellipse);
    await clickInTheMiddleOfTheScreen(page, 'right');
    await takeEditorScreenshot(page);

    await leftToolbar.text();

    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page, 'right');
    await takeEditorScreenshot(page);

    await atomToolbar.clickAtom(Atom.Nitrogen);
    await clickInTheMiddleOfTheScreen(page, 'right');
    await takeEditorScreenshot(page);
  });

  test('Expand/Contract/Remove Abbreviation with multiple FG', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-2902
    Description: 1) All selected FG's are expanded.
    2) All selected FG's are contracted. 3) All selected FG's abbreviations are removed.
   */
    const middleOfTheScreen = await getCachedBodyCenter(page);
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/contracted-fg-abbreviation.mol',
    );
    await selectAllStructuresOnCanvas(page);
    await expandAbbreviation(
      page,
      getAbbreviationLocator(page, { name: 'Boc' }),
    );
    await takeEditorScreenshot(page);
    await selectAllStructuresOnCanvas(page);
    await contractAbbreviation(page, middleOfTheScreen);
    await takeEditorScreenshot(page);
    await selectAllStructuresOnCanvas(page);
    const point = await getAtomByIndex(page, { label: 'C' }, 0);
    await removeAbbreviation(page, point);
    await takeEditorScreenshot(page);
  });

  test('Save to SDF', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2931
    Description: FG is downloaded ('ketcher-fg-tmpls.sdf' file). File contains all FG's from library
   */
    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).openTab(TabSection.FunctionalGroupsTab);
    await StructureLibraryDialog(page).clickSaveToSdfButton();
  });

  test('Check aromatize/dearomatize tool on FG', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2954
    Description: Two FG's are added. Aromatize funcion is selected, nothing happens.
    Dearomatize function is selected, nothing happens.
    */
    const clickCoordines = {
      x1: 560,
      y1: 360,
      x2: 700,
      y2: 360,
    };

    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).addFunctionalGroup(
      FunctionalGroupsTabItems.Bn,
    );
    await clickOnCanvas(page, clickCoordines.x1, clickCoordines.y1, {
      from: 'pageTopLeft',
    });
    await resetCurrentTool(page);

    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).addFunctionalGroup(
      FunctionalGroupsTabItems.Boc,
    );
    await clickOnCanvas(page, clickCoordines.x2, clickCoordines.y2, {
      from: 'pageTopLeft',
    });
    await resetCurrentTool(page);

    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await expandAbbreviation(
      page,
      getAbbreviationLocator(page, { name: 'Bn' }),
    );

    await IndigoFunctionsToolbar(page).aromatize();
    await takeEditorScreenshot(page);

    await IndigoFunctionsToolbar(page).dearomatize();
    await takeEditorScreenshot(page);
  });

  test('Check layout and cleanup buttons tool on FG', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2955
    Description: Two FG's are added,
    one Expanded and one Contracted.
    Layout button is selected, nothing happens.
    Clean Up button is selected, nothing happens.
    */

    const clickCoordines = {
      x1: 560,
      y1: 360,
      x2: 700,
      y2: 360,
    };

    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).addFunctionalGroup(
      FunctionalGroupsTabItems.CCl3,
    );
    await clickOnCanvas(page, clickCoordines.x1, clickCoordines.y1, {
      from: 'pageTopLeft',
    });
    await resetCurrentTool(page);

    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).addFunctionalGroup(
      FunctionalGroupsTabItems.C2H5,
    );
    await clickOnCanvas(page, clickCoordines.x2, clickCoordines.y2, {
      from: 'pageTopLeft',
    });
    await resetCurrentTool(page);

    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await expandAbbreviation(
      page,
      getAbbreviationLocator(page, { name: 'CCl3' }),
    );

    await IndigoFunctionsToolbar(page).layout();
    await takeEditorScreenshot(page);

    await IndigoFunctionsToolbar(page).cleanUp();
    await takeEditorScreenshot(page);
  });

  test('Check structure on canvas when atom is hovered and Functional Group selected using hotkey', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-12970
    Description: Structure on canvas remains unchanged
   */
    const anyAtom = 2;
    const x = 300;
    const y = 300;
    await openFileAndAddToCanvas(page, 'KET/chain.ket');
    await moveOnAtom(page, 'C', anyAtom);
    await page.keyboard.press('Shift+f');
    await page.getByText('Boc').click();
    await clickOnCanvas(page, x, y, { from: 'pageTopLeft' });
    await takeEditorScreenshot(page);
  });

  test('Hotkeys for atoms work on Functional Groups abbreviations', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-15503
    Description: Oxygen atoms replace a Functional Groups abbreviations on canvas
   */
    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).addFunctionalGroup(
      FunctionalGroupsTabItems.Boc,
    );
    await clickInTheMiddleOfTheScreen(page);
    await keyboardPressOnCanvas(page, 'n');
    await takeEditorScreenshot(page);
  });

  test.skip(
    // Consider review since test doesn't do that it should. Copied functional group doesn't attach to atom
    // Is that a bug?
    'Attach copied Functional Group to atoms of structure',
    {
      tag: ['@FlakyTest'],
    },
    async ({ page }) => {
      /*
    Test case: EPMLSOPKET-16925
    Description: Can attach copied Functional Group to atoms of structure
   */
      const anyAtom = 4;
      await openFileAndAddToCanvas(
        page,
        'Molfiles-V2000/functional-group-and-benzene.mol',
      );
      await page.getByText('Boc').click();
      await copyToClipboardByKeyboard(page);
      await pasteFromClipboardByKeyboard(page);
      await waitForRender(page, async () => {
        await clickOnAtom(page, 'C', anyAtom);
      });
      await takeEditorScreenshot(page);
    },
  );

  test('Attach cutted Functional Group to atoms of structure', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-18058
    Description: Can attach cutted Functional Group to atoms of structure
    Test not working proberly right now. Bug https://github.com/epam/ketcher/issues/2660
   */
    test.fail();
    const anyAtom = 4;
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/functional-group-and-benzene.mol',
    );
    await waitForRender(page, async () => {
      await getAbbreviationLocator(page, { name: 'Boc' }).click();
    });
    await cutToClipboardByKeyboard(page);
    await pasteFromClipboardByKeyboard(page);
    await waitForRender(page, async () => {
      await clickOnAtom(page, 'C', anyAtom);
    });
    await takeEditorScreenshot(page);
  });

  test('Contracted Functional Group in 3D Viewer', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-3938
    Description: Contracted Functional Group shown as expanded in 3D view
   */
    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).addFunctionalGroup(
      FunctionalGroupsTabItems.Boc,
    );
    await clickInTheMiddleOfTheScreen(page);
    await IndigoFunctionsToolbar(page).ThreeDViewer();
    await takeEditorScreenshot(page);
  });
});
