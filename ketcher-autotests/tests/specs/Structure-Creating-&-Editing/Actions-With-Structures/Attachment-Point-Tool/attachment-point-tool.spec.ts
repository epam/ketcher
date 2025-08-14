/* eslint-disable no-magic-numbers */
import { Page, test } from '@playwright/test';
import {
  takeEditorScreenshot,
  openFileAndAddToCanvas,
  clickOnAtom,
  screenshotBetweenUndoRedo,
  waitForPageInit,
  clickOnCanvas,
  openFileAndAddToCanvasAsNewProject,
  RxnFileFormat,
  MolFileFormat,
  deleteByKeyboard,
  dragTo,
} from '@utils';
import { resetCurrentTool } from '@utils/canvas/tools/resetCurrentTool';
import {
  copyAndPaste,
  cutAndPaste,
  selectAllStructuresOnCanvas,
} from '@utils/canvas/selectSelection';
import { getRotationHandleCoordinates } from '@utils/clicks/selectButtonByTitle';
import {
  FileType,
  verifyFileExport,
} from '@utils/files/receiveFileComparisonData';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { SelectionToolType } from '@tests/pages/constants/areaSelectionTool/Constants';
import { RightToolbar } from '@tests/pages/molecules/RightToolbar';
import { Atom } from '@tests/pages/constants/atoms/atoms';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { MicroBondType } from '@tests/pages/constants/bondSelectionTool/Constants';
import { IndigoFunctionsToolbar } from '@tests/pages/molecules/IndigoFunctionsToolbar';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import { RGroupType } from '@tests/pages/constants/rGroupSelectionTool/Constants';
import { selectRingButton } from '@tests/pages/molecules/BottomToolbar';
import { RingButton } from '@tests/pages/constants/ringButton/Constants';
import {
  PeriodicTableElement,
  TypeChoice,
} from '@tests/pages/constants/periodicTableDialog/Constants';
import { selectElementsFromPeriodicTable } from '@tests/pages/molecules/canvas/PeriodicTableDialog';
import {
  AttachmentPointsDialog,
  setAttachmentPoints,
} from '@tests/pages/molecules/canvas/AttachmentPointsDialog';
import { getAtomLocator } from '@utils/canvas/atoms/getAtomLocator/getAtomLocator';

const CANVAS_CLICK_X = 300;
const CANVAS_CLICK_Y = 300;

async function selectExtendedTableElements(page: Page, element: string) {
  const extendedTableButton = RightToolbar(page).extendedTableButton;

  await extendedTableButton.click();
  await page.getByRole('button', { name: element, exact: true }).click();
  await page.getByRole('button', { name: 'Add', exact: true }).click();
}

test.describe('Attachment Point Tool', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Attachment point dialog', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1625
    Description: The Attachment Points dialog box is opened.
    */
    await openFileAndAddToCanvas(page, 'KET/simple-chain.ket');
    await LeftToolbar(page).selectRGroupTool(RGroupType.AttachmentPoint);
    await clickOnAtom(page, 'C', 3);
    await takeEditorScreenshot(page);
  });

  test('Able to check any check-mark', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1626
    Description: Check-mark are checked.
    */
    await openFileAndAddToCanvas(page, 'KET/simple-chain.ket');
    await LeftToolbar(page).selectRGroupTool(RGroupType.AttachmentPoint);
    await clickOnAtom(page, 'C', 3);
    await AttachmentPointsDialog(
      page,
    ).primaryAttachmentPointCheckbox.setChecked(true);
    await AttachmentPointsDialog(
      page,
    ).secondaryAttachmentPointCheckbox.setChecked(true);
    await takeEditorScreenshot(page);
  });

  test('Rendering of Attachment points', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1627
    Description: All four Attachment points added to atoms of chain.
    */
    await openFileAndAddToCanvas(page, 'KET/simple-chain.ket');
    await setAttachmentPoints(
      page,
      { label: 'C', index: 2 },
      { primary: true },
    );

    await setAttachmentPoints(
      page,
      { label: 'C', index: 3 },
      { secondary: true },
    );

    await setAttachmentPoints(
      page,
      { label: 'C', index: 4 },
      { primary: true, secondary: true },
    );
    await takeEditorScreenshot(page);
  });

  test('Undo/Redo actions', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1628
    Description: All four Attachment points added to atoms of chain.
    Undo removes two attachment points and Redo puts them back.
    */
    await openFileAndAddToCanvas(page, 'KET/simple-chain.ket');
    await setAttachmentPoints(
      page,
      { label: 'C', index: 2 },
      { primary: true },
    );

    await setAttachmentPoints(
      page,
      { label: 'C', index: 3 },
      { secondary: true },
    );

    await setAttachmentPoints(
      page,
      { label: 'C', index: 4 },
      { primary: true, secondary: true },
    );

    for (let i = 0; i < 2; i++) {
      await CommonTopLeftToolbar(page).undo();
    }
    await takeEditorScreenshot(page);

    for (let i = 0; i < 2; i++) {
      await CommonTopLeftToolbar(page).redo();
    }
    await takeEditorScreenshot(page);
  });

  test('Click cancel in dialog window', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1629
    Description: Nothing is changed, the attachment points don't appear.
    */
    await openFileAndAddToCanvas(page, 'KET/simple-chain.ket');
    await LeftToolbar(page).selectRGroupTool(RGroupType.AttachmentPoint);
    await clickOnAtom(page, 'C', 3);
    await AttachmentPointsDialog(
      page,
    ).primaryAttachmentPointCheckbox.setChecked(true);
    await AttachmentPointsDialog(page).cancel();

    await takeEditorScreenshot(page);

    await clickOnAtom(page, 'C', 3);
    await AttachmentPointsDialog(
      page,
    ).secondaryAttachmentPointCheckbox.setChecked(true);
    await AttachmentPointsDialog(page).cancel();
    await takeEditorScreenshot(page);
  });

  test('Click not on atom', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1630
    Description: The Attachment Point dialog box is not opened.
    */
    const clickToOutsideStructureX = 100;
    const clickToOutsideStructureY = 100;
    await openFileAndAddToCanvas(page, 'KET/simple-chain.ket');
    await LeftToolbar(page).selectRGroupTool(RGroupType.AttachmentPoint);
    await clickOnCanvas(
      page,
      clickToOutsideStructureX,
      clickToOutsideStructureY,
    );
    await takeEditorScreenshot(page);
  });

  test('Modify attachment point', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1631
    Description: Primary attachment point is created on the selected atom.
    Previously created primary attachment point is changed with secondary attachment point.
    Previously modified attachment point is changed with primary attachment point.
    */
    await openFileAndAddToCanvas(page, 'KET/simple-chain.ket');
    await setAttachmentPoints(
      page,
      { label: 'C', index: 3 },
      { primary: true },
    );
    await takeEditorScreenshot(page);

    await setAttachmentPoints(
      page,
      { label: 'C', index: 3 },
      { primary: false, secondary: true },
    );
    await takeEditorScreenshot(page);

    await setAttachmentPoints(
      page,
      { label: 'C', index: 3 },
      { primary: true, secondary: false },
    );
    await takeEditorScreenshot(page);
  });

  test('Remove attachment points', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1632
    Description: User is able to remove the attachment points.
    */
    await openFileAndAddToCanvas(page, 'KET/chain-with-attachment-points.ket');
    await setAttachmentPoints(
      page,
      { label: 'C', index: 2 },
      { primary: false },
    );

    await setAttachmentPoints(
      page,
      { label: 'C', index: 3 },
      { secondary: false },
    );

    await setAttachmentPoints(
      page,
      { label: 'C', index: 5 },
      { primary: false, secondary: false },
    );
    await takeEditorScreenshot(page);
  });

  test('Modify atom with Attchment point (add atom)', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1644
    Description: The attachment point's asterisk is colored with the same color as the atom symbol.
    */
    const atomToolbar = RightToolbar(page);

    await openFileAndAddToCanvas(page, 'KET/chain-with-attachment-points.ket');
    await atomToolbar.clickAtom(Atom.Nitrogen);
    await clickOnAtom(page, 'C', 2);

    await atomToolbar.clickAtom(Atom.Oxygen);
    await clickOnAtom(page, 'C', 2);

    await atomToolbar.clickAtom(Atom.Sulfur);
    await clickOnAtom(page, 'C', 3);
    await takeEditorScreenshot(page);
  });

  test('Modify atom with Attchment point (add Not List atom, Any Atom, Group Generics)', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1644
    Description: The Not List atom, Any Atom, Group Generics is attached to attachment points.
    */
    const anyAtomButton = RightToolbar(page).anyAtomButton;

    await openFileAndAddToCanvas(page, 'KET/chain-with-attachment-points.ket');
    await selectElementsFromPeriodicTable(page, TypeChoice.NotList, [
      PeriodicTableElement.U,
      PeriodicTableElement.Np,
      PeriodicTableElement.Pu,
    ]);

    await clickOnAtom(page, 'C', 2);

    await anyAtomButton.click();
    await clickOnAtom(page, 'C', 2);

    await selectExtendedTableElements(page, 'G');
    await clickOnAtom(page, 'C', 3);
    await takeEditorScreenshot(page);
  });

  test('Create reaction with Attachment point', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1647
    Description: Attachment points are created correctly if the reaction arrow 
    and plus sign(s) are present on the canvas.
    */
    await openFileAndAddToCanvas(page, 'KET/reaction-with-arrow-and-plus.ket');
    await setAttachmentPoints(
      page,
      { label: 'C', index: 2 },
      { primary: true },
    );

    await setAttachmentPoints(
      page,
      { label: 'C', index: 3 },
      { secondary: true },
    );

    await setAttachmentPoints(
      page,
      { label: 'C', index: 5 },
      { primary: true, secondary: true },
    );
    await takeEditorScreenshot(page);
  });

  test('Copy/Paste actions', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1648
    Description: Pasted structures are displayed with correct attachment points.
    Undo/Redo actions for each step are correct.
    */
    await openFileAndAddToCanvas(page, 'KET/chain-with-attachment-points.ket');
    await copyAndPaste(page);
    await clickOnCanvas(page, CANVAS_CLICK_X, CANVAS_CLICK_Y);
    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Cut/Paste actions', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1648
    Description: Pasted structures are displayed with correct attachment points.
    Undo/Redo actions for each step are correct.
    */
    await openFileAndAddToCanvas(page, 'KET/chain-with-attachment-points.ket');
    await cutAndPaste(page);
    await clickOnCanvas(page, CANVAS_CLICK_X, CANVAS_CLICK_Y);

    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Copy/Paste reaction with Attachment point', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1646
    Description: Pasted structures are displayed with the correct attachment points.
    */
    const x = 500;
    const y = 200;
    await openFileAndAddToCanvas(
      page,
      'KET/reaction-with-attachment-points.ket',
    );
    await copyAndPaste(page);
    await clickOnCanvas(page, x, y);
    await takeEditorScreenshot(page);
  });

  test('Cut/Paste reaction with Attachment point', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1646
    Description: Pasted structures are displayed with the correct attachment points.
    Undo/Redo actions for each step are correct.
    */
    const x = 500;
    const y = 200;
    await openFileAndAddToCanvas(
      page,
      'KET/reaction-with-attachment-points.ket',
    );
    await cutAndPaste(page);
    await clickOnCanvas(page, x, y);

    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Save as *.mol file', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1651
    Description: Structure with attachment points saved as .mol file
    */
    await openFileAndAddToCanvas(page, 'KET/chain-with-attachment-points.ket');

    await verifyFileExport(
      page,
      'Molfiles-V2000/chain-with-attachment-points-expected.mol',
      FileType.MOL,
      MolFileFormat.v2000,
      [1],
    );
  });

  test('Click and Save as *.mol file', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1747
    Description: Click the 'Save As' button, and click the 'Save' button.
    Open the saved *.mol file and edit it in any way.
    */
    await openFileAndAddToCanvas(page, 'KET/chain-with-attachment-points.ket');

    await verifyFileExport(
      page,
      'Molfiles-V2000/chain-with-attachment-points-expected.mol',
      FileType.MOL,
      MolFileFormat.v2000,
      [1],
    );
  });

  test('Save as *.mol file V3000', async ({ page }) => {
    /*
     * Test case: EPMLSOPKET-1651
     * Description: Structure with attachment points saved as .mol file V3000
     */
    await openFileAndAddToCanvas(page, 'KET/chain-with-attachment-points.ket');
    await verifyFileExport(
      page,
      'Molfiles-V3000/chain-with-attachment-points-expectedV3000.mol',
      FileType.MOL,
      MolFileFormat.v3000,
    );
    await takeEditorScreenshot(page);
  });

  test('Save as *.rxn file', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1652
    Description: Structure with attachment points saved as .rxn file
    */
    await openFileAndAddToCanvas(page, 'KET/reaction-with-arrow-and-plus.ket');
    await verifyFileExport(
      page,
      'Rxn-V2000/reaction-with-arrow-and-plus-expected.rxn',
      FileType.RXN,
      RxnFileFormat.v2000,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'Rxn-V2000/reaction-with-arrow-and-plus-expected.rxn',
    );
    await takeEditorScreenshot(page);
  });

  test('Click and Save as *.rxn file', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1748
    Description: Click the 'Save As' button and click the 'Save' button.
    Open the saved *.rxn file and edit it in any way.
    */
    await openFileAndAddToCanvas(page, 'KET/reaction-with-arrow-and-plus.ket');
    await verifyFileExport(
      page,
      'Rxn-V2000/reaction-with-arrow-and-plus-expected.rxn',
      FileType.RXN,
      RxnFileFormat.v2000,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'Rxn-V2000/reaction-with-arrow-and-plus-expected.rxn',
    );
    await takeEditorScreenshot(page);
  });

  test('Save as *.rxn file V3000', async ({ page }) => {
    /*
     * IMPORTANT: Test fails because we have bug https://github.com/epam/Indigo/issues/2490
     * Test case: EPMLSOPKET-1652
     * Description: Structure with attachment points saved as .rxn file V3000
     */
    await openFileAndAddToCanvas(page, 'KET/reaction-with-arrow-and-plus.ket');
    await verifyFileExport(
      page,
      'Rxn-V3000/reaction-with-arrow-and-plus-expectedV3000.rxn',
      FileType.RXN,
      RxnFileFormat.v3000,
    );
    await takeEditorScreenshot(page);
  });

  test('Save as *.smi file', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1653
    Description: Structure with attachment points saved as .smi file
    */
    await openFileAndAddToCanvas(page, 'KET/chain-with-attachment-points.ket');
    await verifyFileExport(
      page,
      'SMILES/chain-with-attachment-points-expected.smi',
      FileType.SMILES,
    );
    await takeEditorScreenshot(page);
  });

  test('Click and Save as *.smi file', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1749
    Description: Click the 'Save As' button, save as Smiles file ('Daylight SMILES' format).
    Open the saved *.smi file and edit it in any way.
    Click the 'Save As' button, save as InChi file.
    Open the saved *.inchi file and edit it in any way.
    Click the 'Save As' button, save as CML file.
    Open the saved *.cml file and edit it in any way.
    */
    await openFileAndAddToCanvas(page, 'KET/chain-with-attachment-points.ket');
    await verifyFileExport(
      page,
      'SMILES/chain-with-attachment-points-expected.smi',
      FileType.SMILES,
    );
    await takeEditorScreenshot(page);
  });

  test('Rotate structure with attachment points', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1670
    Description: Structure with attachment points is rotated correctly. Structure rotated 90 degrees counterclockwise.
   */
    const COORDINATES_TO_PERFORM_ROTATION = {
      x: 20,
      y: 160,
    };
    await openFileAndAddToCanvas(page, 'KET/chain-with-attachment-points.ket');

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
    await takeEditorScreenshot(page);
  });

  test('Drag atoms consist attachment points', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1645
      Description: With selection tool click the atom with attachment point(s) and drag selected atom.
    */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'Molfiles-V2000/chain-attachment-list.mol',
    );
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );

    await dragTo(page, getAtomLocator(page, { atomId: 2 }), {
      x: 520,
      y: 450,
    });
    await dragTo(page, getAtomLocator(page, { atomId: 6 }), {
      x: 670,
      y: 450,
    });
    await takeEditorScreenshot(page);

    for (let i = 0; i < 2; i++) {
      await CommonTopLeftToolbar(page).undo();
    }
    await takeEditorScreenshot(page);
  });

  test('Delete the atom with attachment point(s) with Erase tool.', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1645
      Description: With erase tool click the atom with attachment point(s) and delete selected atom.
    */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'Molfiles-V2000/chain-attachment-list.mol',
    );

    await CommonLeftToolbar(page).selectEraseTool();
    await getAtomLocator(page, { atomId: 2 }).click();
    await getAtomLocator(page, { atomId: 6 }).click();
    await takeEditorScreenshot(page);

    for (let i = 0; i < 2; i++) {
      await CommonTopLeftToolbar(page).undo();
    }
    await takeEditorScreenshot(page);
  });

  test('Delete the atom with attachment point(s) with hotkey.', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1645
      Description: Hotkey click the atom with attachment point(s) delete selected atom.
    */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'Molfiles-V2000/chain-attachment-list.mol',
    );

    await CommonLeftToolbar(page).selectEraseTool();
    await getAtomLocator(page, { atomId: 2 }).hover();
    await deleteByKeyboard(page);

    await getAtomLocator(page, { atomId: 6 }).hover();
    await deleteByKeyboard(page);

    await takeEditorScreenshot(page);

    for (let i = 0; i < 2; i++) {
      await CommonTopLeftToolbar(page).undo();
    }
    await takeEditorScreenshot(page);
  });

  test('Select any Atom from Atom Palette, press the atom with attachment point and drag.', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1645
      Description: New bond is created, the attachment point isn't removed.
    */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'Molfiles-V2000/chain-attachment-list.mol',
    );

    await RightToolbar(page).clickAtom(Atom.Oxygen);
    await dragTo(page, getAtomLocator(page, { atomId: 2 }), {
      x: 520,
      y: 450,
    });
    await dragTo(page, getAtomLocator(page, { atomId: 6 }), {
      x: 670,
      y: 450,
    });
    await takeEditorScreenshot(page);

    for (let i = 0; i < 2; i++) {
      await CommonTopLeftToolbar(page).undo();
    }
    await takeEditorScreenshot(page);
  });

  test('With any Bond tool click the atom with attachment point(s.', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1645
      Description: New bond is created, the attachment point isn't removed.
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/chain-attachment-list.mol',
    );

    await CommonLeftToolbar(page).selectBondTool(MicroBondType.Single);
    await clickOnAtom(page, 'N', 0);

    await clickOnAtom(page, 'L#', 0);

    await takeEditorScreenshot(page);

    for (let i = 0; i < 2; i++) {
      await CommonTopLeftToolbar(page).undo();
    }
    await takeEditorScreenshot(page);
  });

  test('Select any Template, press the atom with attachment point and drag.', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1645
      Description: The template is sprouted from the selected atom, the attachment point(s) isn't changed or removed.
    */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'Molfiles-V2000/chain-attachment-list.mol',
    );

    await selectRingButton(page, RingButton.Benzene);
    await dragTo(page, getAtomLocator(page, { atomId: 2 }), {
      x: 520,
      y: 450,
    });
    await dragTo(page, getAtomLocator(page, { atomId: 6 }), {
      x: 670,
      y: 450,
    });
    await resetCurrentTool(page);

    await takeEditorScreenshot(page);

    for (let i = 0; i < 2; i++) {
      await CommonTopLeftToolbar(page).undo();
    }
    await takeEditorScreenshot(page);
  });

  test('Verify that the attachment point visualization matches the rendering to PNG/SVG mockup(on several structures)', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-15516, EPMLSOPKET-15517, EPMLSOPKET-15522
    Description: Openeded structures are displayed with the correct attachment points.
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/three-examples-attachment-points.mol',
    );
    await takeEditorScreenshot(page);
  });

  test('Verify that the attachment point visualization matches the rendering to PNG/SVG mockup(on one structure)', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-15516, EPMLSOPKET-15518
    Description: Openeded structure are displayed with the correct attachment points.
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/four-attachment-point.mol',
    );
    await takeEditorScreenshot(page);
  });

  test('Verify that changing primary attachment points to secondary updates the visualization', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-15519
    Description: Visualization updates accordingly, displaying 
    the attachment point labels near the curve line.
    */
    await openFileAndAddToCanvas(page, 'KET/simple-chain.ket');
    await setAttachmentPoints(
      page,
      { label: 'C', index: 3 },
      { primary: true },
    );
    await takeEditorScreenshot(page);
    await setAttachmentPoints(
      page,
      { label: 'C', index: 3 },
      { primary: false, secondary: true },
    );
    await takeEditorScreenshot(page);
  });

  test('Verify that changing secondary attachment points to primary updates the visualization', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-15520
    Description: visualization updates accordingly, 
    removing the attachment point labels near the curve line.
    */
    await openFileAndAddToCanvas(page, 'KET/simple-chain.ket');
    await setAttachmentPoints(
      page,
      { label: 'C', index: 3 },
      { secondary: true },
    );
    await takeEditorScreenshot(page);
    await setAttachmentPoints(
      page,
      { label: 'C', index: 3 },
      { primary: true, secondary: false },
    );
    await takeEditorScreenshot(page);
  });

  test('Verify that removing all attachment points updates the visualization', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-15521
    Description:  Visualization no longer displays any 
    attachment point labels near the curve line.
    */
    await openFileAndAddToCanvas(page, 'KET/simple-chain.ket');
    await setAttachmentPoints(
      page,
      { label: 'C', index: 3 },
      { primary: true, secondary: true },
    );
    await takeEditorScreenshot(page);
    await setAttachmentPoints(
      page,
      { label: 'C', index: 3 },
      { primary: false, secondary: false },
    );
    await takeEditorScreenshot(page);
  });
});

test.describe('Attachment Point Tool', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Clean Up and Layout distorted chain with attachment points', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1654
    Description: The structures are cleaned correctly without attachment point(s) loss.
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/distorted-chain-with-attachment-points.mol',
    );

    await IndigoFunctionsToolbar(page).layout();
    await takeEditorScreenshot(page);

    await CommonTopLeftToolbar(page).undo();

    await IndigoFunctionsToolbar(page).cleanUp();
    await takeEditorScreenshot(page, { maxDiffPixelRatio: 0.05 });
  });
});
