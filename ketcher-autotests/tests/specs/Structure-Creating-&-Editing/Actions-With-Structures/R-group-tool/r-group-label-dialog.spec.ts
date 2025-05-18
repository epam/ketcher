import { test } from '@playwright/test';
import {
  takeEditorScreenshot,
  clickInTheMiddleOfTheScreen,
  getCoordinatesTopAtomOfBenzeneRing,
  selectRingButton,
  RingButton,
  pressButton,
  dragMouseTo,
  openFileAndAddToCanvas,
  clickOnAtom,
  copyAndPaste,
  cutAndPaste,
  waitForRender,
  waitForPageInit,
  selectAllStructuresOnCanvas,
  clickOnCanvas,
  ZoomInByKeyboard,
  moveMouseAway,
} from '@utils';
import { getAtomByIndex } from '@utils/canvas/atoms';
import {
  FileType,
  verifyFileExport,
} from '@utils/files/receiveFileComparisonData';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { SelectionToolType } from '@tests/pages/constants/areaSelectionTool/Constants';
import { MicroBondType } from '@tests/pages/constants/bondSelectionTool/Constants';
import { TopLeftToolbar } from '@tests/pages/common/TopLeftToolbar';
import { IndigoFunctionsToolbar } from '@tests/pages/molecules/IndigoFunctionsToolbar';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import { RGroupType } from '@tests/pages/constants/rGroupSelectionTool/Constants';

test.describe('R-Group Label Tool', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('R-group label dialog appears', async ({ page }) => {
    /* Test case: EPMLSOPKET-1556
      Description: R-group label dialog appears
    */
    await selectRingButton(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);

    await LeftToolbar(page).selectRGroupTool(RGroupType.RGroupLabel);
    const { x, y } = await getCoordinatesTopAtomOfBenzeneRing(page);
    await clickOnCanvas(page, x, y);
    await takeEditorScreenshot(page);
  });

  test('Try to create R-Group not with clicking on atom', async ({ page }) => {
    /* Test case: EPMLSOPKET-1557
      Description: The "R-Group" dialog box is opened when user click the empty area and user is able create the Rgroup label.
    */

    await LeftToolbar(page).selectRGroupTool(RGroupType.RGroupLabel);
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });

  test('Single R-Group label', async ({ page }) => {
    /* Test case: EPMLSOPKET-1558
      Description: Single R-Group label
    */

    await selectRingButton(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);

    await LeftToolbar(page).selectRGroupTool(RGroupType.RGroupLabel);
    const { x, y } = await getCoordinatesTopAtomOfBenzeneRing(page);
    await clickOnCanvas(page, x, y);
    await pressButton(page, 'R5');
    await waitForRender(page, async () => {
      await pressButton(page, 'Apply');
    });
    await takeEditorScreenshot(page);
  });

  test('Multiple R-Group label', async ({ page }) => {
    /* Test case: EPMLSOPKET-1559
      Description: Multiple R-Group label
    */

    await selectRingButton(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);

    await LeftToolbar(page).selectRGroupTool(RGroupType.RGroupLabel);
    const { x, y } = await getCoordinatesTopAtomOfBenzeneRing(page);
    await clickOnCanvas(page, x, y);
    await pressButton(page, 'R4');
    await pressButton(page, 'R5');
    await pressButton(page, 'R6');
    await waitForRender(page, async () => {
      await pressButton(page, 'Apply');
    });
    await takeEditorScreenshot(page);
  });

  test('Delete R-Group label using Erase tool', async ({ page }) => {
    /* Test case: EPMLSOPKET-1562
      Description: Delete R-Group label using Erase tool
    */

    await selectRingButton(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);

    await LeftToolbar(page).selectRGroupTool(RGroupType.RGroupLabel);
    const { x, y } = await getCoordinatesTopAtomOfBenzeneRing(page);
    await clickOnCanvas(page, x, y);
    await pressButton(page, 'R5');
    await pressButton(page, 'Apply');

    await CommonLeftToolbar(page).selectEraseTool();
    await waitForRender(page, async () => {
      await page.getByText('R5').click();
    });
    await takeEditorScreenshot(page);
  });

  test('Edit R-Group label', async ({ page }) => {
    /* Test case: EPMLSOPKET-1560
      Description: R-group atom label is changed accordingly on the canvas. The R-group label buttons in the "R-Group" dialog are highlighted properly.
    */

    await selectRingButton(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);

    await LeftToolbar(page).selectRGroupTool(RGroupType.RGroupLabel);
    const { x, y } = await getCoordinatesTopAtomOfBenzeneRing(page);
    await clickOnCanvas(page, x, y);
    await pressButton(page, 'R5');
    await pressButton(page, 'Apply');

    await page.getByText('R5').click();
    await pressButton(page, 'R5');
    await pressButton(page, 'R8');
    await waitForRender(page, async () => {
      await pressButton(page, 'Apply');
    });
    await takeEditorScreenshot(page);
  });

  test('Create S-Group with R-Group', async ({ page }) => {
    /* Test case: EPMLSOPKET-1575
      Description: Create S-Group with R-Group
    */

    await selectRingButton(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);

    await LeftToolbar(page).sGroup();
    const { x, y } = await getCoordinatesTopAtomOfBenzeneRing(page);
    await clickOnCanvas(page, x, y);

    await page.getByTestId('s-group-type-input-span').click();
    await page.getByRole('option', { name: 'Multiple group' }).click();
    await page.getByLabel('Repeat count').click();
    await page.getByLabel('Repeat count').fill('1');
    await pressButton(page, 'Apply');

    await LeftToolbar(page).selectRGroupTool(RGroupType.RGroupLabel);
    let point: { x: number; y: number };
    // eslint-disable-next-line no-magic-numbers, prefer-const
    point = await getAtomByIndex(page, { label: 'C' }, 2);
    await clickOnCanvas(page, point.x, point.y);
    await pressButton(page, 'R5');
    await waitForRender(page, async () => {
      await pressButton(page, 'Apply');
    });
    await takeEditorScreenshot(page);
  });

  test('Rotate R-group', async ({ page }) => {
    /* Test case: EPMLSOPKET-1571
      Description: Structure with R-Group label is rotated correctly
    */

    await selectRingButton(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);

    await LeftToolbar(page).selectRGroupTool(RGroupType.RGroupLabel);
    const { x, y } = await getCoordinatesTopAtomOfBenzeneRing(page);
    await clickOnCanvas(page, x, y);
    await pressButton(page, 'R5');
    await pressButton(page, 'Apply');

    await selectAllStructuresOnCanvas(page);
    await waitForRender(page, async () => {
      await pressButton(page, 'Vertical Flip (Alt+V)');
    });
    await takeEditorScreenshot(page);
  });

  test('Undo-Redo with R-group label', async ({ page }) => {
    /* Test case: EPMLSOPKET-1558
      Description: Single R-Group label
    */

    await selectRingButton(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);

    await LeftToolbar(page).selectRGroupTool(RGroupType.RGroupLabel);
    const { x, y } = await getCoordinatesTopAtomOfBenzeneRing(page);
    await clickOnCanvas(page, x, y);
    await pressButton(page, 'R5');
    await pressButton(page, 'Apply');

    await page.getByText('R5').click();
    await pressButton(page, 'R5');
    await pressButton(page, 'R7');
    await pressButton(page, 'R8');
    await pressButton(page, 'Apply');
    await TopLeftToolbar(page).undo();
    await takeEditorScreenshot(page);
    await TopLeftToolbar(page).redo();
    await takeEditorScreenshot(page);
  });

  test('Create the same R-Group label as existing', async ({ page }) => {
    /* Test case: EPMLSOPKET-1563
      Description: Create the same R-Group label as existing. The same R-group atom label is created correctly.
    */

    await selectRingButton(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);

    await LeftToolbar(page).selectRGroupTool(RGroupType.RGroupLabel);
    const { x, y } = await getCoordinatesTopAtomOfBenzeneRing(page);
    await clickOnCanvas(page, x, y);
    await pressButton(page, 'R5');
    await pressButton(page, 'Apply');
    await moveMouseAway(page);

    await LeftToolbar(page).selectRGroupTool(RGroupType.RGroupLabel);
    let point: { x: number; y: number };
    // eslint-disable-next-line no-magic-numbers, prefer-const
    point = await getAtomByIndex(page, { label: 'C' }, 2);
    await clickOnCanvas(page, point.x, point.y);
    await pressButton(page, 'R5');
    await pressButton(page, 'Apply');

    await moveMouseAway(page);

    await takeEditorScreenshot(page);
  });

  test('Zoom In/Zoom Out', async ({ page }) => {
    /* Test case: EPMLSOPKET-1574
      Description: The structures are zoomed correctly without R-group labels loss
    */

    await selectRingButton(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);

    await LeftToolbar(page).selectRGroupTool(RGroupType.RGroupLabel);
    const { x, y } = await getCoordinatesTopAtomOfBenzeneRing(page);
    await clickOnCanvas(page, x, y);
    await pressButton(page, 'R5');
    await pressButton(page, 'Apply');

    // eslint-disable-next-line no-magic-numbers
    for (let i = 0; i < 5; i++) {
      await waitForRender(page, async () => {
        await page.keyboard.press('Control+_');
      });
    }
    await takeEditorScreenshot(page);

    // eslint-disable-next-line no-magic-numbers
    for (let i = 0; i < 5; i++) {
      await ZoomInByKeyboard(page);
    }
    await takeEditorScreenshot(page);
  });

  test('Delete R-Group label using hotkey', async ({ page }) => {
    /* Test case: EPMLSOPKET-1561
      Description: Delete R-Group label using hotkey
    */

    await selectRingButton(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);

    await LeftToolbar(page).selectRGroupTool(RGroupType.RGroupLabel);
    const { x, y } = await getCoordinatesTopAtomOfBenzeneRing(page);
    await clickOnCanvas(page, x, y);
    await pressButton(page, 'R5');
    await pressButton(page, 'Apply');

    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await page.getByText('R5').click();
    await waitForRender(page, async () => {
      await page.keyboard.press('Delete');
    });
    await takeEditorScreenshot(page);
  });

  test('Move Structure with R-Group label', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1564
      Description: User is able to move the R-group label, a part of the structure.
    */
    const x = 500;
    const y = 200;
    await openFileAndAddToCanvas('Molfiles-V2000/chain-r1.mol', page);
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await page.getByText('R1').click();
    await dragMouseTo(x, y, page);
    await takeEditorScreenshot(page);
  });

  test('Move whole Structure with R-Group label', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1564
      Description: User is able to move the R-group label, the whole structure.
    */
    const x = 500;
    const y = 200;
    await openFileAndAddToCanvas('Molfiles-V2000/chain-r1.mol', page);
    await selectAllStructuresOnCanvas(page);
    await page.getByText('R1').click();
    await dragMouseTo(x, y, page);
    await takeEditorScreenshot(page);
  });

  test('Move Actions with Reaction components with R-Group label', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1565
      Description: User is able to create the reaction with components which contain the R-group labels.
      User is able to move the reaction components with R-group label, part of the reaction and the whole reaction.
    */
    const x = 500;
    const y = 200;
    const anyAtom = 3;
    await openFileAndAddToCanvas('KET/reaction-with-arrow-and-plus.ket', page);
    await LeftToolbar(page).selectRGroupTool(RGroupType.RGroupLabel);
    await clickOnAtom(page, 'C', anyAtom);
    await pressButton(page, 'R8');
    await pressButton(page, 'Apply');
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await page.getByText('R8').click();
    await dragMouseTo(x, y, page);
    await takeEditorScreenshot(page);
  });

  test('Move whole Reaction components with R-Group label', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1565
      Description: User is able to create the reaction with components which contain the R-group labels.
      User is able to move the reaction components with R-group label, part of the reaction and the whole reaction.
    */
    const x = 500;
    const y = 200;
    const anyAtom = 3;
    await openFileAndAddToCanvas('KET/reaction-with-arrow-and-plus.ket', page);
    await LeftToolbar(page).selectRGroupTool(RGroupType.RGroupLabel);
    await clickOnAtom(page, 'C', anyAtom);
    await pressButton(page, 'R8');
    await pressButton(page, 'Apply');
    await selectAllStructuresOnCanvas(page);
    await page.getByText('R8').click();
    await dragMouseTo(x, y, page);
    await takeEditorScreenshot(page);
  });

  test('Copy/Paste actions Structure with R-Group label', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1566
      Description: User is able to Copy/Paste structure with R-group label.
    */
    const x = 500;
    const y = 200;
    await openFileAndAddToCanvas('Rxn-V2000/chain-with-r-group.rxn', page);
    await copyAndPaste(page);
    await clickOnCanvas(page, x, y);
    await takeEditorScreenshot(page);
  });

  test('Cut/Paste actions Structure with R-Group label', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1566
      Description: User is able to Cut/Paste the structure with R-group label.
    */
    const x = 500;
    const y = 200;
    await openFileAndAddToCanvas('Rxn-V2000/chain-with-r-group.rxn', page);
    await cutAndPaste(page);
    await clickOnCanvas(page, x, y);
    await takeEditorScreenshot(page);
  });

  test('Atom properties do not implement for the Rgroup labels', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1572
      Description: The plus symbol does not appear near the R-group label.
      The minus symbol does not appear near the R-group label.
    */
    await openFileAndAddToCanvas('Rxn-V2000/chain-with-r-group.rxn', page);
    await LeftToolbar(page).chargePlus();
    await page.getByText('R8').click();
    await LeftToolbar(page).chargeMinus();
    await waitForRender(page, async () => {
      await page.getByText('R13').click();
    });
    await takeEditorScreenshot(page);
  });

  test('Add Bond to the R-Group Label', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1573
      Description: The correct bond is sprouted from the R-group label
    */
    const x = 100;
    const y = 100;
    await openFileAndAddToCanvas(
      'Rxn-V2000/chain-with-three-r-groups.rxn',
      page,
    );
    await CommonLeftToolbar(page).selectBondTool(MicroBondType.Single);
    await page.getByText('R8').hover();
    await dragMouseTo(x, y, page);
    await takeEditorScreenshot(page);
  });

  test('Add Chain to the R-Group Label', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1573
      Description: The correct Chain is sprouted from the R-group label
    */
    const x = 500;
    const y = 500;
    await openFileAndAddToCanvas(
      'Rxn-V2000/chain-with-three-r-groups.rxn',
      page,
    );
    await LeftToolbar(page).chain();
    await page.getByText('R10').hover();
    await dragMouseTo(x, y, page);
    await takeEditorScreenshot(page);
  });

  test('Add Template to the R-Group Label', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1573
      Description: The correct Template is sprouted from the R-group label
    */
    const x = 500;
    const y = 500;
    await openFileAndAddToCanvas(
      'Rxn-V2000/chain-with-three-r-groups.rxn',
      page,
    );
    await selectRingButton(RingButton.Benzene, page);
    await page.getByText('R10').hover();
    await dragMouseTo(x, y, page);
    await takeEditorScreenshot(page);
  });

  test('Layout action to the distorted structure with R-Group Label', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1576
      Description: The structure is layout correctly without R-group label loss.
    */
    await openFileAndAddToCanvas(
      'Molfiles-V2000/distorted-structure-with-r-group.mol',
      page,
    );
    await IndigoFunctionsToolbar(page).layout();
    await takeEditorScreenshot(page);
  });
});

test.describe('R-Group Label Tool', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Save as *.rxn file', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1568
    Description: User is able to save the structure with R-group label as .rxn file
    */
    await openFileAndAddToCanvas('Rxn-V2000/chain-with-r-group.rxn', page);
    await verifyFileExport(
      page,
      'Rxn-V2000/chain-with-r-group-expected.rxn',
      FileType.RXN,
      'v2000',
    );
  });

  test('Save as *.rxn V3000 file', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1567
    Description: User is able to save the structure with R-group label as .rxn V3000 file
    */
    await openFileAndAddToCanvas(
      'Rxn-V3000/chain-with-r-group-V3000.rxn',
      page,
    );
    await verifyFileExport(
      page,
      'Rxn-V3000/chain-with-r-group-V3000-expected.rxn',
      FileType.RXN,
      'v3000',
    );
  });

  test('Save as *.smi file', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1568
    Description: User is able to save the structure with R-group label as .smi file
    */
    await openFileAndAddToCanvas('SMILES/chain-with-r-group.smi', page);
    await verifyFileExport(
      page,
      'SMILES/chain-with-r-group-expected.smi',
      FileType.SMILES,
    );
  });
});
