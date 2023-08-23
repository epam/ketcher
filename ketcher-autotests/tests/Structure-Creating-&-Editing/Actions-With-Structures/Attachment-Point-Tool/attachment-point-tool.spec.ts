/* eslint-disable no-magic-numbers */
import { Page, expect, test } from '@playwright/test';
import {
  pressButton,
  delay,
  takeEditorScreenshot,
  openFileAndAddToCanvas,
  DELAY_IN_SECONDS,
  selectNestedTool,
  RgroupTool,
  AttachmentPoint,
  selectTopPanelButton,
  TopPanelButton,
  selectAtomInToolbar,
  AtomButton,
  LeftPanelButton,
  selectLeftPanelButton,
  dragMouseTo,
  selectRing,
  RingButton,
  resetCurrentTool,
  copyAndPaste,
  cutAndPaste,
  saveToFile,
  receiveFileComparisonData,
  clickOnAtom,
  screenshotBetweenUndoRedo,
  openFile,
} from '@utils';
import { getAtomByIndex } from '@utils/canvas/atoms';
import { getRotationHandleCoordinates } from '@utils/clicks/selectButtonByTitle';
import { getMolfile, getRxn, getSmiles } from '@utils/formats';

const CANVAS_CLICK_X = 300;
const CANVAS_CLICK_Y = 300;

async function selectNotListAtoms(page: Page) {
  await page.getByTestId('period-table').click();
  await page.getByText('Not List').click();
  await pressButton(page, 'U 92');
  await pressButton(page, 'Np 93');
  await pressButton(page, 'Pu 94');
  await page.getByRole('button', { name: 'Add', exact: true }).click();
}

async function selectExtendedTableElements(page: Page, element: string) {
  await page.getByTestId('extended-table').click();
  await page.getByRole('button', { name: element, exact: true }).click();
  await page.getByRole('button', { name: 'Add', exact: true }).click();
}

test.describe('Attachment Point Tool', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  test('Attachment point dialog', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1625
    Description: The Attachment Points dialog box is opened.
    */
    await openFileAndAddToCanvas('Ket/simple-chain.ket', page);
    await selectNestedTool(page, RgroupTool.ATTACHMENT_POINTS);
    await clickOnAtom(page, 'C', 3);
  });

  test('Able to check any check-mark', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1626
    Description: Check-mark are checked.
    */
    await openFileAndAddToCanvas('Ket/simple-chain.ket', page);
    await selectNestedTool(page, RgroupTool.ATTACHMENT_POINTS);
    await clickOnAtom(page, 'C', 3);
    await page.getByLabel(AttachmentPoint.PRIMARY).check();
    await page.getByLabel(AttachmentPoint.SECONDARY).check();
  });

  test('Rendering of Attachment points', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1627
    Description: All four Attachment points added to atoms of chain.
    */
    await openFileAndAddToCanvas('Ket/simple-chain.ket', page);
    await selectNestedTool(page, RgroupTool.ATTACHMENT_POINTS);
    await clickOnAtom(page, 'C', 2);
    await page.getByLabel(AttachmentPoint.PRIMARY).check();
    await pressButton(page, 'Apply');

    await clickOnAtom(page, 'C', 3);
    await page.getByLabel(AttachmentPoint.SECONDARY).check();
    await pressButton(page, 'Apply');

    await clickOnAtom(page, 'C', 4);
    await page.getByLabel(AttachmentPoint.PRIMARY).check();
    await page.getByLabel(AttachmentPoint.SECONDARY).check();
    await pressButton(page, 'Apply');
  });

  test('Undo/Redo actions', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1628
    Description: All four Attachment points added to atoms of chain.
    Undo removes two attachment points and Redo puts them back.
    */
    await openFileAndAddToCanvas('Ket/simple-chain.ket', page);
    await selectNestedTool(page, RgroupTool.ATTACHMENT_POINTS);
    await clickOnAtom(page, 'C', 2);
    await page.getByLabel(AttachmentPoint.PRIMARY).check();
    await pressButton(page, 'Apply');

    await clickOnAtom(page, 'C', 3);
    await page.getByLabel(AttachmentPoint.SECONDARY).check();
    await pressButton(page, 'Apply');

    await clickOnAtom(page, 'C', 4);
    await page.getByLabel(AttachmentPoint.PRIMARY).check();
    await page.getByLabel(AttachmentPoint.SECONDARY).check();
    await pressButton(page, 'Apply');

    for (let i = 0; i < 2; i++) {
      await selectTopPanelButton(TopPanelButton.Undo, page);
    }
    await takeEditorScreenshot(page);

    for (let i = 0; i < 2; i++) {
      await selectTopPanelButton(TopPanelButton.Redo, page);
    }
  });

  test('Click cancel in dialog window', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1629
    Description: Nothing is changed, the attachment points don't appear.
    */
    await openFileAndAddToCanvas('Ket/simple-chain.ket', page);
    await selectNestedTool(page, RgroupTool.ATTACHMENT_POINTS);
    await clickOnAtom(page, 'C', 2);
    await page.getByLabel(AttachmentPoint.PRIMARY).check();
    await pressButton(page, 'Cancel');

    await takeEditorScreenshot(page);

    await clickOnAtom(page, 'C', 3);
    await page.getByLabel(AttachmentPoint.SECONDARY).check();
    await pressButton(page, 'Cancel');
  });

  test('Click not on atom', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1630
    Description: The Attachment Point dialog box is not opened.
    */
    const clickToOutsideStructureX = 100;
    const clickToOutsideStructureY = 100;
    await openFileAndAddToCanvas('Ket/simple-chain.ket', page);
    await selectNestedTool(page, RgroupTool.ATTACHMENT_POINTS);
    await page.mouse.click(clickToOutsideStructureX, clickToOutsideStructureY);
  });

  test('Modify attachment point', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1631
    Description: Primary attachment point is created on the selected atom.
    Previously created primary attachment point is changed with secondary attachment point.
    Previously modified attachment point is changed with primary attachment point.
    */
    await openFileAndAddToCanvas('Ket/simple-chain.ket', page);
    await selectNestedTool(page, RgroupTool.ATTACHMENT_POINTS);
    await clickOnAtom(page, 'C', 3);

    await page.getByLabel(AttachmentPoint.PRIMARY).check();
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);

    await clickOnAtom(page, 'C', 3);

    await page.getByLabel(AttachmentPoint.PRIMARY).uncheck();
    await page.getByLabel(AttachmentPoint.SECONDARY).check();
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);

    await clickOnAtom(page, 'C', 3);

    await page.getByLabel(AttachmentPoint.SECONDARY).uncheck();
    await page.getByLabel(AttachmentPoint.PRIMARY).check();
    await pressButton(page, 'Apply');
  });

  test('Remove attachment points', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1632
    Description: User is able to remove the attachment points.
    */
    await openFileAndAddToCanvas(
      'Ket/Ket/chain-with-attachment-points.ket',
      page,
    );
    await selectNestedTool(page, RgroupTool.ATTACHMENT_POINTS);
    await clickOnAtom(page, 'C', 2);
    await page.getByLabel(AttachmentPoint.PRIMARY).uncheck();
    await pressButton(page, 'Apply');

    await clickOnAtom(page, 'C', 3);
    await page.getByLabel(AttachmentPoint.SECONDARY).uncheck();
    await pressButton(page, 'Apply');

    await clickOnAtom(page, 'C', 5);
    await page.getByLabel(AttachmentPoint.PRIMARY).uncheck();
    await page.getByLabel(AttachmentPoint.SECONDARY).uncheck();
    await pressButton(page, 'Apply');
  });

  test('Modify atom with Attchment point (add atom)', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1644
    Description: The attachment point's asterisk is colored with the same color as the atom symbol.
    */
    await openFileAndAddToCanvas('Ket/chain-with-attachment-points.ket', page);
    await selectAtomInToolbar(AtomButton.Nitrogen, page);
    await clickOnAtom(page, 'C', 2);

    await selectAtomInToolbar(AtomButton.Oxygen, page);
    await clickOnAtom(page, 'C', 2);

    await selectAtomInToolbar(AtomButton.Sulfur, page);
    await clickOnAtom(page, 'C', 3);
  });

  test('Modify atom with Attchment point (add Not List atom, Any Atom, Group Generics)', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1644
    Description: The Not List atom, Any Atom, Group Generics is attached to attachment points.
    */
    await openFileAndAddToCanvas('Ket/chain-with-attachment-points.ket', page);
    await selectNotListAtoms(page);
    await clickOnAtom(page, 'C', 2);

    await page.getByTestId('any-atom').click();
    await clickOnAtom(page, 'C', 2);

    await selectExtendedTableElements(page, 'G');
    await clickOnAtom(page, 'C', 3);
  });

  test('Create reaction with Attachment point', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1647
    Description: Attachment points are created correctly if the reaction arrow 
    and plus sign(s) are present on the canvas.
    */
    await openFileAndAddToCanvas('Ket/reaction-with-arrow-and-plus.ket', page);

    await selectNestedTool(page, RgroupTool.ATTACHMENT_POINTS);
    await clickOnAtom(page, 'C', 2);
    await page.getByLabel(AttachmentPoint.PRIMARY).check();
    await pressButton(page, 'Apply');

    await clickOnAtom(page, 'C', 3);
    await page.getByLabel(AttachmentPoint.SECONDARY).check();
    await pressButton(page, 'Apply');

    await clickOnAtom(page, 'C', 5);
    await page.getByLabel(AttachmentPoint.PRIMARY).check();
    await page.getByLabel(AttachmentPoint.SECONDARY).check();
    await pressButton(page, 'Apply');
  });

  test.fixme('Copy/Paste actions', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1648
    Description: Pasted structures are displayed with correct attachment points.
    Undo/Redo actions for each step are correct.
    */
    await openFileAndAddToCanvas('Ket/chain-with-attachment-points.ket', page);
    await copyAndPaste(page);
    await page.mouse.click(CANVAS_CLICK_X, CANVAS_CLICK_Y);

    await screenshotBetweenUndoRedo(page);
  });

  test.fixme('Cut/Paste actions', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1648
    Description: Pasted structures are displayed with correct attachment points.
    Undo/Redo actions for each step are correct.
    */
    await openFileAndAddToCanvas('Ket/chain-with-attachment-points.ket', page);
    await cutAndPaste(page);
    await page.mouse.click(CANVAS_CLICK_X, CANVAS_CLICK_Y);

    await screenshotBetweenUndoRedo(page);
  });

  test.fixme('Copy/Paste reaction with Attachment point', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1646
    Description: Pasted structures are displayed with the correct attachment points.
    Undo/Redo actions for each step are correct.
    */
    await openFileAndAddToCanvas('Ket/reaction-with-arrow-and-plus.ket', page);
    await copyAndPaste(page);
    await page.mouse.click(CANVAS_CLICK_X, CANVAS_CLICK_Y);
  });

  test.fixme('Cut/Paste reaction with Attachment point', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1646
    Description: Pasted structures are displayed with the correct attachment points.
    Undo/Redo actions for each step are correct.
    */
    const x = 0;
    const y = 300;
    await openFileAndAddToCanvas('Ket/reaction-with-arrow-and-plus.ket', page);
    await cutAndPaste(page);
    await page.mouse.click(x, y);

    await screenshotBetweenUndoRedo(page);
  });

  test('Save as *.mol file', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1651
    Description: Structure with attachment points saved as .mol file
    */
    await openFileAndAddToCanvas('Ket/chain-with-attachment-points.ket', page);
    const expectedFile = await getMolfile(page);
    await saveToFile('chain-with-attachment-points-expected.mol', expectedFile);
    const METADATA_STRING_INDEX = [1];
    const { fileExpected: molFileExpected, file: molFile } =
      await receiveFileComparisonData({
        page,
        metaDataIndexes: METADATA_STRING_INDEX,
        expectedFileName:
          'tests/test-data/chain-with-attachment-points-expected.mol',
      });
    expect(molFile).toEqual(molFileExpected);
  });

  test('Click and Save as *.mol file', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1747
    Description: Click the 'Save As' button, and click the 'Save' button.
    Open the saved *.mol file and edit it in any way.
    */
    await openFileAndAddToCanvas('Ket/chain-with-attachment-points.ket', page);
    const expectedFile = await getMolfile(page);
    await saveToFile('chain-with-attachment-points-expected.mol', expectedFile);
    await openFile('chain-with-attachment-points-expected.mol', page);
    const METADATA_STRING_INDEX = [1];
    const { fileExpected: molFileExpected, file: molFile } =
      await receiveFileComparisonData({
        page,
        metaDataIndexes: METADATA_STRING_INDEX,
        expectedFileName:
          'tests/test-data/chain-with-attachment-points-expected.mol',
      });
    expect(molFile).toEqual(molFileExpected);
  });

  test('Save as *.mol file V3000', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1651
    Description: Structure with attachment points saved as .mol file V3000
    */
    await openFileAndAddToCanvas('Ket/chain-with-attachment-points.ket', page);
    const expectedFile = await getMolfile(page, 'v3000');
    await saveToFile(
      'chain-with-attachment-points-expectedV3000.mol',
      expectedFile,
    );
    const METADATA_STRING_INDEX = [1];
    const { fileExpected: molFileExpected, file: molFile } =
      await receiveFileComparisonData({
        page,
        metaDataIndexes: METADATA_STRING_INDEX,
        expectedFileName:
          'tests/test-data/chain-with-attachment-points-expectedV3000.mol',
        fileFormat: 'v3000',
      });
    expect(molFile).toEqual(molFileExpected);
  });

  test('Save as *.rxn file', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1652
    Description: Structure with attachment points saved as .rxn file
    */
    await openFileAndAddToCanvas('Ket/reaction-with-arrow-and-plus.ket', page);
    const expectedFile = await getRxn(page);
    await saveToFile('reaction-with-arrow-and-plus-expected.rxn', expectedFile);

    const METADATA_STRING_INDEX = [2, 7, 30, 37];
    const { fileExpected: rxnFileExpected, file: rxnFile } =
      await receiveFileComparisonData({
        page,
        metaDataIndexes: METADATA_STRING_INDEX,
        expectedFileName:
          'tests/test-data/reaction-with-arrow-and-plus-expected.rxn',
      });
    expect(rxnFile).toEqual(rxnFileExpected);
  });

  test('Click and Save as *.rxn file', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1748
    Description: Click the 'Save As' button and click the 'Save' button.
    Open the saved *.rxn file and edit it in any way.
    */
    await openFileAndAddToCanvas('Ket/reaction-with-arrow-and-plus.ket', page);
    const expectedFile = await getRxn(page);
    await saveToFile('reaction-with-arrow-and-plus-expected.rxn', expectedFile);
    await openFile('reaction-with-arrow-and-plus-expected.rxn', page);

    const METADATA_STRING_INDEX = [2, 7, 30, 37];
    const { fileExpected: rxnFileExpected, file: rxnFile } =
      await receiveFileComparisonData({
        page,
        metaDataIndexes: METADATA_STRING_INDEX,
        expectedFileName:
          'tests/test-data/reaction-with-arrow-and-plus-expected.rxn',
      });
    expect(rxnFile).toEqual(rxnFileExpected);
  });

  test('Save as *.rxn file V3000', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1652
    Description: Structure with attachment points saved as .rxn file V3000
    */
    await openFileAndAddToCanvas('Ket/reaction-with-arrow-and-plus.ket', page);
    const expectedFile = await getRxn(page, 'v3000');
    await saveToFile(
      'reaction-with-arrow-and-plus-expectedV3000.rxn',
      expectedFile,
    );

    const METADATA_STRING_INDEX = [2];
    const { fileExpected: rxnFileExpected, file: rxnFile } =
      await receiveFileComparisonData({
        page,
        metaDataIndexes: METADATA_STRING_INDEX,
        expectedFileName:
          'tests/test-data/reaction-with-arrow-and-plus-expectedV3000.rxn',
        fileFormat: 'v3000',
      });
    expect(rxnFile).toEqual(rxnFileExpected);
  });

  test('Save as *.smi file', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1653
    Description: Structure with attachment points saved as .smi file
    */
    await openFileAndAddToCanvas('Ket/chain-with-attachment-points.ket', page);
    const expectedFile = await getSmiles(page);
    await saveToFile('chain-with-attachment-points-expected.smi', expectedFile);

    const { fileExpected: smiFileExpected, file: smiFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/chain-with-attachment-points-expected.smi',
      });
    expect(smiFile).toEqual(smiFileExpected);
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
    await openFileAndAddToCanvas('Ket/chain-with-attachment-points.ket', page);
    const expectedFile = await getSmiles(page);
    await saveToFile('chain-with-attachment-points-expected.smi', expectedFile);
    await openFile('chain-with-attachment-points-expected.smi', page);

    const { fileExpected: smiFileExpected, file: smiFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/chain-with-attachment-points-expected.smi',
      });
    expect(smiFile).toEqual(smiFileExpected);
  });

  test.fixme(
    'Clean Up and Layout distorted chain with attachment points',
    async ({ page }) => {
      /*
    Test case: EPMLSOPKET-1654
    Description: The structures are cleaned correctly without attachment point(s) loss.
    */
      await openFileAndAddToCanvas(
        'distorted-chain-with-attachment-points.mol',
        page,
      );

      await selectTopPanelButton(TopPanelButton.Layout, page);
      await takeEditorScreenshot(page);

      await selectTopPanelButton(TopPanelButton.Undo, page);

      await selectTopPanelButton(TopPanelButton.Clean, page);
      await delay(DELAY_IN_SECONDS.SEVEN);
      await takeEditorScreenshot(page);
    },
  );

  test('Rotate structure with attachment points', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1670
    Description: Structure with attachment points is rotated correctly. Structure rotated 90 degrees counterclockwise.
   */
    const COORDINATES_TO_PERFORM_ROTATION = {
      x: 20,
      y: 160,
    };
    await openFileAndAddToCanvas('Ket/chain-with-attachment-points.ket', page);

    await page.keyboard.press('Control+a');
    const coordinates = await getRotationHandleCoordinates(page);
    const { x: rotationHandleX, y: rotationHandleY } = coordinates;

    await page.mouse.move(rotationHandleX, rotationHandleY);
    await page.mouse.down();
    await page.mouse.move(
      COORDINATES_TO_PERFORM_ROTATION.x,
      COORDINATES_TO_PERFORM_ROTATION.y,
    );
    await page.mouse.up();
  });

  test('Drag atoms consist attachment points', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1645
      Description: With selection tool click the atom with attachment point(s) and drag selected atom.
    */
    const yDelta = 100;
    await openFileAndAddToCanvas('chain-attachment-list.mol', page);

    await selectLeftPanelButton(LeftPanelButton.RectangleSelection, page);
    const point = await getAtomByIndex(page, { label: 'N' }, 0);
    await page.mouse.click(point.x, point.y);
    const coordinatesWithShift = point.y + yDelta;
    await dragMouseTo(point.x, coordinatesWithShift, page);

    const point2 = await getAtomByIndex(page, { label: 'L#' }, 0);
    await page.mouse.click(point2.x, point2.y);
    const coordinatesWithShift2 = point.y + yDelta;
    await dragMouseTo(point2.x, coordinatesWithShift2, page);

    await takeEditorScreenshot(page);

    for (let i = 0; i < 2; i++) {
      await selectTopPanelButton(TopPanelButton.Undo, page);
    }
  });

  test('Delete the atom with attachment point(s) with Erase tool.', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1645
      Description: With erase tool click the atom with attachment point(s) and delete selected atom.
    */
    await openFileAndAddToCanvas('chain-attachment-list.mol', page);

    await selectLeftPanelButton(LeftPanelButton.Erase, page);
    await clickOnAtom(page, 'N', 0);

    await clickOnAtom(page, 'L#', 0);

    await takeEditorScreenshot(page);

    for (let i = 0; i < 2; i++) {
      await selectTopPanelButton(TopPanelButton.Undo, page);
    }
  });

  test('Delete the atom with attachment point(s) with hotkey.', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1645
      Description: Hotkey click the atom with attachment point(s) delete selected atom.
    */
    let point: { x: number; y: number };
    await openFileAndAddToCanvas('chain-attachment-list.mol', page);

    await selectLeftPanelButton(LeftPanelButton.Erase, page);
    point = await getAtomByIndex(page, { label: 'N' }, 0);
    await page.mouse.move(point.x, point.y);
    await page.keyboard.press('Delete');

    point = await getAtomByIndex(page, { label: 'L#' }, 0);
    await page.mouse.move(point.x, point.y);
    await page.keyboard.press('Delete');

    await takeEditorScreenshot(page);

    for (let i = 0; i < 2; i++) {
      await selectTopPanelButton(TopPanelButton.Undo, page);
    }
  });

  test('Select any Atom from Atom Palette, press the atom with attachment point and drag.', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1645
      Description: New bond is created, the attachment point isn't removed.
    */
    const yDelta = 100;
    await openFileAndAddToCanvas('chain-attachment-list.mol', page);

    await selectAtomInToolbar(AtomButton.Oxygen, page);
    const point = await getAtomByIndex(page, { label: 'N' }, 0);
    await page.mouse.click(point.x, point.y);
    const coordinatesWithShift = point.y + yDelta;
    await dragMouseTo(point.x, coordinatesWithShift, page);

    const point2 = await getAtomByIndex(page, { label: 'L#' }, 0);
    await page.mouse.click(point2.x, point2.y);
    const coordinatesWithShift2 = point.y + yDelta;
    await dragMouseTo(point2.x, coordinatesWithShift2, page);

    await takeEditorScreenshot(page);

    for (let i = 0; i < 4; i++) {
      await selectTopPanelButton(TopPanelButton.Undo, page);
    }
  });

  test('With any Bond tool click the atom with attachment point(s.', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1645
      Description: New bond is created, the attachment point isn't removed.
    */
    await openFileAndAddToCanvas('chain-attachment-list.mol', page);

    await selectLeftPanelButton(LeftPanelButton.SingleBond, page);
    await clickOnAtom(page, 'N', 0);

    await clickOnAtom(page, 'L#', 0);

    await takeEditorScreenshot(page);

    for (let i = 0; i < 2; i++) {
      await selectTopPanelButton(TopPanelButton.Undo, page);
    }
  });

  test('Select any Template, press the atom with attachment point and drag.', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1645
      Description: The template is sprouted from the selected atom, the attachment point(s) isn't changed or removed.
    */
    const yDelta = 100;
    await openFileAndAddToCanvas('chain-attachment-list.mol', page);

    await selectRing(RingButton.Benzene, page);
    const point = await getAtomByIndex(page, { label: 'N' }, 0);
    await page.mouse.move(point.x, point.y);
    const coordinatesWithShift = point.y + yDelta;
    await dragMouseTo(point.x, coordinatesWithShift, page);

    const point2 = await getAtomByIndex(page, { label: 'L#' }, 0);
    await page.mouse.move(point2.x, point2.y);
    const coordinatesWithShift2 = point.y + yDelta;
    await dragMouseTo(point2.x, coordinatesWithShift2, page);
    await resetCurrentTool(page);

    await takeEditorScreenshot(page);

    for (let i = 0; i < 2; i++) {
      await selectTopPanelButton(TopPanelButton.Undo, page);
    }
  });
});
