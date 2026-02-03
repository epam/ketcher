/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-magic-numbers */
import { expect, Page, test } from '@fixtures';
import {
  takeEditorScreenshot,
  openFileAndAddToCanvas,
  clickInTheMiddleOfTheScreen,
  dragMouseTo,
  takeLeftToolbarScreenshot,
  waitForRender,
  keyboardPressOnCanvas,
  MacroFileType,
  pasteFromClipboardAndAddToMacromoleculesCanvas,
  clickOnCanvas,
  takeElementScreenshot,
  getCoordinatesOfTheMiddleOfTheCanvas,
  selectWithLasso,
  openFileAndAddToCanvasAsNewProject,
  MolFileFormat,
} from '@utils';
import { selectAllStructuresOnCanvas } from '@utils/canvas/selectSelection';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { SelectionToolType } from '@tests/pages/constants/areaSelectionTool/Constants';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import {
  BottomToolbar,
  drawBenzeneRing,
} from '@tests/pages/molecules/BottomToolbar';
import { RingButton } from '@tests/pages/constants/ringButton/Constants';
import { ContextMenu } from '@tests/pages/common/ContextMenu';
import { SGroupPropertiesDialog } from '@tests/pages/molecules/canvas/S-GroupPropertiesDialog';
import {
  ContextOption,
  PropertyLabelType,
  TypeOption,
} from '@tests/pages/constants/s-GroupPropertiesDialog/Constants';
import { getAtomLocator } from '@utils/canvas/atoms/getAtomLocator/getAtomLocator';
import { AtomsSetting } from '@tests/pages/constants/settingsDialog/Constants';
import { setSettingsOption } from '@tests/pages/molecules/canvas/SettingsDialog';
import { getBondLocator } from '@utils/macromolecules/polymerBond';
import { horizontalFlip, verticalFlip } from '../Rotation/utils';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { getAbbreviationLocator } from '@utils/canvas/s-group-signes/getAbbreviation';
import { MonomerOnMicroOption } from '@tests/pages/constants/contextMenu/Constants';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import {
  FileType,
  verifyFileExport,
  verifyPNGExport,
  verifySVGExport,
} from '@utils/files/receiveFileComparisonData';

test.describe('Selection tools', () => {
  let page: Page;
  test.beforeAll(async ({ initMoleculesCanvas }) => {
    page = await initMoleculesCanvas();
  });
  test.afterAll(async ({ closePage }) => {
    await closePage();
  });
  test.beforeEach(async ({ MoleculesCanvas: _ }) => {});

  test('Selection is not reset when using context menu', async () => {
    /*
    Test case: EPMLSOPKET-8925
    Description: Selection is not reset. User can use right-click menu in order to perform actions.
    */
    await BottomToolbar(page).clickRing(RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);
    await setSettingsOption(page, AtomsSetting.DisplayCarbonExplicitly);
    await selectAllStructuresOnCanvas(page);
    await ContextMenu(
      page,
      getAtomLocator(page, { atomLabel: 'C', atomId: 0 }),
    ).open();
    await takeEditorScreenshot(page);
  });

  test('Using rounded rectangles for selection of bonds and atom labels', async () => {
    /*
    Test case: EPMLSOPKET-12975
    Description: Selected bonds and atom labels with more than 1 symbol (e.g. "OH", "CH3")
    are highlighted with rounded rectangles.
    */
    await openFileAndAddToCanvas(page, 'KET/atoms-and-bonds.ket');
    await selectAllStructuresOnCanvas(page);
    await takeEditorScreenshot(page);
  });

  test('Pressing atoms hotkey when atoms are selected', async () => {
    /*
    Test case: EPMLSOPKET-12979
    Description: Selected atoms are replaces with those assigned to the hotkey.
    Selected tool remains active and the atom does not appear under mouse cursor.
    */
    await openFileAndAddToCanvas(page, 'KET/two-atoms.ket');
    await selectAllStructuresOnCanvas(page);
    await keyboardPressOnCanvas(page, 'o');
    await takeEditorScreenshot(page);
  });

  test('Hovering of selected Atom', async () => {
    /*
    Test case: EPMLSOPKET-13008
    Description: When hovered selected Atom becomes lighter than the rest of the structure.
    */
    await BottomToolbar(page).clickRing(RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);
    await selectAllStructuresOnCanvas(page);
    await getAtomLocator(page, { atomLabel: 'C', atomId: 6 }).hover({
      force: true,
    });
    await takeEditorScreenshot(page);
  });

  test('Hovering of selected Bond', async () => {
    /*
    Test case: EPMLSOPKET-13008
    Description: When hovered selected Bond becomes lighter than the rest of the structure.
    */
    const bondLocator = getBondLocator(page, { bondId: 7 });
    await BottomToolbar(page).clickRing(RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);
    await selectAllStructuresOnCanvas(page);
    await bondLocator.hover({ force: true });
    await takeEditorScreenshot(page);
  });

  test('Verify flipping horizontally with multiple disconnected structures selected', async () => {
    /*
    Test case: EPMLSOPKET-15508
    Description: All selected structures are flipped horizontally based on the selection box origin.
    */
    await openFileAndAddToCanvas(page, 'KET/two-benzene-with-atoms.ket');
    await selectAllStructuresOnCanvas(page);
    await horizontalFlip(page);
    await takeEditorScreenshot(page);
  });

  test('Verify flipping vertically with multiple disconnected structures selected', async () => {
    /*
    Test case: EPMLSOPKET-15509
    Description: All selected structures are flipped horizontally based on the selection box origin.
    */
    await openFileAndAddToCanvas(page, 'KET/two-benzene-with-atoms.ket');
    await selectAllStructuresOnCanvas(page);
    await verticalFlip(page);
    await takeEditorScreenshot(page);
  });

  test('Verify flipping horizontally of one expanded monomer in a structure', async ({
    SequenceCanvas: _,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/7915
    Description: Check that for any selection that includes one continuous monomer, flipping options horizontal enabled
    */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      `PEPTIDE1{[Abu].[2Nal].[D-3Pal]}$$$$V2.0`,
    );
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await selectAllStructuresOnCanvas(page);
    await ContextMenu(page, getAbbreviationLocator(page, { id: '1' })).click(
      MonomerOnMicroOption.ExpandMonomers,
    );
    await CommonLeftToolbar(page).handTool();
    await getAtomLocator(page, { atomId: 11 }).hover({
      force: true,
    });
    const locators = await getCoordinatesOfTheMiddleOfTheCanvas(page);
    await dragMouseTo(locators.x, locators.y, page);
    await CommonLeftToolbar(page).areaSelectionTool();
    await clickOnCanvas(page, 100, 100);
    await CommonTopRightToolbar(page).setZoomInputValue('70');
    await getAtomLocator(page, { atomId: 7 }).click();
    await horizontalFlip(page);
    await takeElementScreenshot(page, getAtomLocator(page, { atomId: 11 }), {
      padding: 210,
    });
    await CommonTopLeftToolbar(page).undo();
    await takeElementScreenshot(page, getAtomLocator(page, { atomId: 8 }), {
      padding: 250,
    });
  });

  test('Verify flipping horizontally of one expanded monomer in a structure and save/paste in KET format', async () => {
    /*
    Test case: https://github.com/epam/ketcher/issues/7915
    Description: Check that for any selection that includes one continuous monomer, flipping options horizontal enabled and KET format file is as required
    */
    await openFileAndAddToCanvasAsNewProject(page, 'KET/flipping-monomers.ket');
    await CommonTopRightToolbar(page).setZoomInputValue('70');
    await getAtomLocator(page, { atomId: 7 }).click();
    await horizontalFlip(page);
    await verifyFileExport(
      page,
      'KET/flipping-horizontally-one-monomer-expected.ket',
      FileType.KET,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/flipping-horizontally-one-monomer-expected.ket',
    );
    await takeElementScreenshot(page, getAtomLocator(page, { atomId: 11 }), {
      padding: 210,
    });
  });

  test('Verify flipping horizontally of one expanded monomer in a structure and save/paste in MOL V3000 format', async () => {
    /*
    Test case: https://github.com/epam/ketcher/issues/7915
    Description: Check that for any selection that includes one continuous monomer, flipping options horizontal enabled and MOL V3000 format file is as required
    */
    await openFileAndAddToCanvasAsNewProject(page, 'KET/flipping-monomers.ket');
    await CommonTopRightToolbar(page).setZoomInputValue('70');
    await getAtomLocator(page, { atomId: 7 }).click();
    await horizontalFlip(page);
    await verifyFileExport(
      page,
      'Molfiles-V3000/flipping-horizontally-one-monomer-expected.mol',
      FileType.MOL,
      MolFileFormat.v3000,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'Molfiles-V3000/flipping-horizontally-one-monomer-expected.mol',
    );
    await takeElementScreenshot(page, getAtomLocator(page, { atomId: 11 }), {
      padding: 210,
    });
  });

  test('Verify flipping horizontally of one expanded monomer in a structure and save/paste in SVG and PNG format', async () => {
    /*
    Test case: https://github.com/epam/ketcher/issues/7915
    Description: Check that for any selection that includes one continuous monomer, flipping options horizontal enabled and MOL V3000 format file is as required
    */
    await openFileAndAddToCanvasAsNewProject(page, 'KET/flipping-monomers.ket');
    await getAtomLocator(page, { atomId: 7 }).click();
    await horizontalFlip(page);
    await verifyPNGExport(page);
    await verifySVGExport(page);
  });

  test('Verify flipping vertically of one expanded monomer in a structure', async () => {
    /*
    Test case: https://github.com/epam/ketcher/issues/7915
    Description: Check that for any selection that includes one continuous monomer, flipping options vertical enabled
    */
    await openFileAndAddToCanvasAsNewProject(page, 'KET/flipping-monomers.ket');
    await CommonTopRightToolbar(page).setZoomInputValue('70');
    await getAtomLocator(page, { atomId: 7 }).click();
    await verticalFlip(page);
    await takeElementScreenshot(page, getAtomLocator(page, { atomId: 8 }), {
      padding: 250,
    });
    await CommonTopLeftToolbar(page).undo();
    await CommonTopLeftToolbar(page).redo();
    await takeElementScreenshot(page, getAtomLocator(page, { atomId: 8 }), {
      padding: 250,
    });
  });

  test('Verify flipping vertically of one expanded monomer in a structure and save/paste in KET format', async () => {
    /*
    Test case: https://github.com/epam/ketcher/issues/7915
    Description: Check that for any selection that includes one continuous monomer, flipping options vertical enabled and save/paste in KET format
    */
    await openFileAndAddToCanvasAsNewProject(page, 'KET/flipping-monomers.ket');
    await CommonTopRightToolbar(page).setZoomInputValue('70');
    await getAtomLocator(page, { atomId: 7 }).click();
    await verticalFlip(page);
    await verifyFileExport(
      page,
      'KET/flipping-vertically-one-monomer-expected.ket',
      FileType.KET,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/flipping-vertically-one-monomer-expected.ket',
    );
    await takeElementScreenshot(page, getAtomLocator(page, { atomId: 8 }), {
      padding: 250,
    });
  });

  test('Verify flipping vertically of one expanded monomer in a structure and save/paste in MOL V3000 format', async () => {
    /*
    Test case: https://github.com/epam/ketcher/issues/7915
    Description: Check that for any selection that includes one continuous monomer, flipping options vertical enabled and save/paste in MOL V3000 format
    */
    await openFileAndAddToCanvasAsNewProject(page, 'KET/flipping-monomers.ket');
    await CommonTopRightToolbar(page).setZoomInputValue('70');
    await getAtomLocator(page, { atomId: 7 }).click();
    await verticalFlip(page);
    await verifyFileExport(
      page,
      'Molfiles-V3000/flipping-vertically-one-monomer-expected.mol',
      FileType.MOL,
      MolFileFormat.v3000,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'Molfiles-V3000/flipping-vertically-one-monomer-expected.mol',
    );
    await takeElementScreenshot(page, getAtomLocator(page, { atomId: 8 }), {
      padding: 250,
    });
  });

  test('Verify flipping vertically of one expanded monomer in a structure and save in SVG and PNG format', async () => {
    /*
    Test case: https://github.com/epam/ketcher/issues/7915
    Description: Check that for any selection that includes one continuous monomer, flipping options vertical enabled and save in SVG and PNG format
    */
    await openFileAndAddToCanvasAsNewProject(page, 'KET/flipping-monomers.ket');
    await getAtomLocator(page, { atomId: 7 }).click();
    await verticalFlip(page);
    await verifyPNGExport(page);
    await verifySVGExport(page);
  });

  test('Verify flipping horizontally of more than one expanded monomers in a structure', async () => {
    /*
    Test case: https://github.com/epam/ketcher/issues/7915
    Description: Check that for any selection that includes more than continuous monomers, flipping options horizontal enabled
    */
    await openFileAndAddToCanvasAsNewProject(page, 'KET/flipping-monomers.ket');
    await CommonTopRightToolbar(page).setZoomInputValue('70');

    const locator1 = await getAtomLocator(page, { atomId: 22 }).boundingBox();
    const locator2 = await getAtomLocator(page, { atomId: 37 }).boundingBox();
    await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Lasso);
    if (!locator1 || !locator2) throw new Error('No bounding box');
    const padding = 10;
    await selectWithLasso(page, locator1.x - padding, locator1.y - padding, [
      { x: locator2.x + locator2.width + padding, y: locator1.y - padding },
      {
        x: locator2.x + locator2.width + padding,
        y: locator2.y + locator2.height + padding,
      },
      { x: locator1.x - padding, y: locator2.y + locator2.height + padding },
      { x: locator1.x - padding, y: locator1.y - padding },
    ]);
    await horizontalFlip(page);
    await takeElementScreenshot(page, getAtomLocator(page, { atomId: 11 }), {
      padding: 210,
    });
  });

  test('Verify flipping horizontally of more than one expanded monomers in a structure and save/paste in KET format', async () => {
    /*
    Test case: https://github.com/epam/ketcher/issues/7915
    Description: Check that for any selection that includes more than continuous monomers, flipping options horizontal enabled and save/paste in KET format
    */
    await openFileAndAddToCanvasAsNewProject(page, 'KET/flipping-monomers.ket');
    await CommonTopRightToolbar(page).setZoomInputValue('70');

    const locator1 = await getAtomLocator(page, { atomId: 22 }).boundingBox();
    const locator2 = await getAtomLocator(page, { atomId: 37 }).boundingBox();
    await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Lasso);
    if (!locator1 || !locator2) throw new Error('No bounding box');
    const padding = 10;
    await selectWithLasso(page, locator1.x - padding, locator1.y - padding, [
      { x: locator2.x + locator2.width + padding, y: locator1.y - padding },
      {
        x: locator2.x + locator2.width + padding,
        y: locator2.y + locator2.height + padding,
      },
      { x: locator1.x - padding, y: locator2.y + locator2.height + padding },
      { x: locator1.x - padding, y: locator1.y - padding },
    ]);
    await horizontalFlip(page);
    await verifyFileExport(
      page,
      'KET/flipping-horizontally-monomers-expected.ket',
      FileType.KET,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/flipping-horizontally-monomers-expected.ket',
    );
    await takeElementScreenshot(page, getAtomLocator(page, { atomId: 11 }), {
      padding: 210,
    });
  });

  test('Verify flipping horizontally of more than one expanded monomers in a structure and save/paste in MOL V3000 format', async () => {
    /*
    Test case: https://github.com/epam/ketcher/issues/7915
    Description: Check that for any selection that includes more than continuous monomers, flipping options horizontal enabled and save/paste in MOL V3000 format
    */
    await openFileAndAddToCanvasAsNewProject(page, 'KET/flipping-monomers.ket');
    await CommonTopRightToolbar(page).setZoomInputValue('70');

    const locator1 = await getAtomLocator(page, { atomId: 22 }).boundingBox();
    const locator2 = await getAtomLocator(page, { atomId: 37 }).boundingBox();
    await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Lasso);
    if (!locator1 || !locator2) throw new Error('No bounding box');
    const padding = 10;
    await selectWithLasso(page, locator1.x - padding, locator1.y - padding, [
      { x: locator2.x + locator2.width + padding, y: locator1.y - padding },
      {
        x: locator2.x + locator2.width + padding,
        y: locator2.y + locator2.height + padding,
      },
      { x: locator1.x - padding, y: locator2.y + locator2.height + padding },
      { x: locator1.x - padding, y: locator1.y - padding },
    ]);
    await horizontalFlip(page);
    await verifyFileExport(
      page,
      'Molfiles-V3000/flipping-horizontally-monomers-expected.mol',
      FileType.MOL,
      MolFileFormat.v3000,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'Molfiles-V3000/flipping-horizontally-monomers-expected.mol',
    );
    await takeElementScreenshot(page, getAtomLocator(page, { atomId: 11 }), {
      padding: 190,
    });
  });

  test('Verify flipping horizontally of more than one expanded monomers in a structure and save in SVG and PNG format', async () => {
    /*
    Test case: https://github.com/epam/ketcher/issues/7915
    Description: Check that for any selection that includes more than continuous monomers, flipping options horizontal enabled and save in SVG and PNG format
    */
    await openFileAndAddToCanvasAsNewProject(page, 'KET/flipping-monomers.ket');
    await CommonTopRightToolbar(page).setZoomInputValue('70');

    const locator1 = await getAtomLocator(page, { atomId: 22 }).boundingBox();
    const locator2 = await getAtomLocator(page, { atomId: 37 }).boundingBox();
    await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Lasso);
    if (!locator1 || !locator2) throw new Error('No bounding box');
    const padding = 10;
    await selectWithLasso(page, locator1.x - padding, locator1.y - padding, [
      { x: locator2.x + locator2.width + padding, y: locator1.y - padding },
      {
        x: locator2.x + locator2.width + padding,
        y: locator2.y + locator2.height + padding,
      },
      { x: locator1.x - padding, y: locator2.y + locator2.height + padding },
      { x: locator1.x - padding, y: locator1.y - padding },
    ]);
    await horizontalFlip(page);
    await verifyPNGExport(page);
    await verifySVGExport(page);
  });

  test('Verify flipping vertically of more than one expanded monomers in a structure', async () => {
    /*
    Test case: https://github.com/epam/ketcher/issues/7915
    Description: Check that for any selection that includes more than continuous monomers, flipping options vertical enabled
    */
    await openFileAndAddToCanvasAsNewProject(page, 'KET/flipping-monomers.ket');
    await CommonTopRightToolbar(page).setZoomInputValue('70');

    const locator1 = await getAtomLocator(page, { atomId: 22 }).boundingBox();
    const locator2 = await getAtomLocator(page, { atomId: 37 }).boundingBox();
    await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Lasso);
    if (!locator1 || !locator2) throw new Error('No bounding box');
    const padding = 10;
    await selectWithLasso(page, locator1.x - padding, locator1.y - padding, [
      { x: locator2.x + locator2.width + padding, y: locator1.y - padding },
      {
        x: locator2.x + locator2.width + padding,
        y: locator2.y + locator2.height + padding,
      },
      { x: locator1.x - padding, y: locator2.y + locator2.height + padding },
      { x: locator1.x - padding, y: locator1.y - padding },
    ]);
    await verticalFlip(page);
    await takeElementScreenshot(page, getAtomLocator(page, { atomId: 8 }), {
      padding: 250,
    });
  });

  test('Verify flipping vertically of more than one expanded monomers in a structure and save/paste in KET format', async () => {
    /*
    Test case: https://github.com/epam/ketcher/issues/7915
    Description: Check that for any selection that includes more than continuous monomers, flipping options vertical enabled and save/paste in KET format
    */
    await openFileAndAddToCanvasAsNewProject(page, 'KET/flipping-monomers.ket');
    await CommonTopRightToolbar(page).setZoomInputValue('70');

    const locator1 = await getAtomLocator(page, { atomId: 22 }).boundingBox();
    const locator2 = await getAtomLocator(page, { atomId: 37 }).boundingBox();
    await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Lasso);
    if (!locator1 || !locator2) throw new Error('No bounding box');
    const padding = 10;
    await selectWithLasso(page, locator1.x - padding, locator1.y - padding, [
      { x: locator2.x + locator2.width + padding, y: locator1.y - padding },
      {
        x: locator2.x + locator2.width + padding,
        y: locator2.y + locator2.height + padding,
      },
      { x: locator1.x - padding, y: locator2.y + locator2.height + padding },
      { x: locator1.x - padding, y: locator1.y - padding },
    ]);
    await verticalFlip(page);
    await verifyFileExport(
      page,
      'KET/flipping-vertically-monomers-expected.ket',
      FileType.KET,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/flipping-vertically-monomers-expected.ket',
    );
    await takeElementScreenshot(page, getAtomLocator(page, { atomId: 8 }), {
      padding: 250,
    });
  });

  test('Verify flipping vertically of more than one expanded monomers in a structure and save/paste in MOL V3000 format', async () => {
    /*
    Test case: https://github.com/epam/ketcher/issues/7915
    Description: Check that for any selection that includes more than continuous monomers, flipping options vertical enabled and save/paste in MOL V3000 format
    */
    await openFileAndAddToCanvasAsNewProject(page, 'KET/flipping-monomers.ket');
    await CommonTopRightToolbar(page).setZoomInputValue('70');

    const locator1 = await getAtomLocator(page, { atomId: 22 }).boundingBox();
    const locator2 = await getAtomLocator(page, { atomId: 37 }).boundingBox();
    await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Lasso);
    if (!locator1 || !locator2) throw new Error('No bounding box');
    const padding = 10;
    await selectWithLasso(page, locator1.x - padding, locator1.y - padding, [
      { x: locator2.x + locator2.width + padding, y: locator1.y - padding },
      {
        x: locator2.x + locator2.width + padding,
        y: locator2.y + locator2.height + padding,
      },
      { x: locator1.x - padding, y: locator2.y + locator2.height + padding },
      { x: locator1.x - padding, y: locator1.y - padding },
    ]);
    await verticalFlip(page);
    await verifyFileExport(
      page,
      'Molfiles-V3000/flipping-vertically-monomers-expected.mol',
      FileType.MOL,
      MolFileFormat.v3000,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'Molfiles-V3000/flipping-vertically-monomers-expected.mol',
    );
    await takeElementScreenshot(page, getAtomLocator(page, { atomId: 8 }), {
      padding: 250,
    });
  });

  test('Verify flipping vertically of more than one expanded monomers in a structure and save in SVG and PNG format', async () => {
    /*
    Test case: https://github.com/epam/ketcher/issues/7915
    Description: Check that for any selection that includes more than continuous monomers, flipping options vertical enabled
    */
    await openFileAndAddToCanvasAsNewProject(page, 'KET/flipping-monomers.ket');
    await CommonTopRightToolbar(page).setZoomInputValue('70');

    const locator1 = await getAtomLocator(page, { atomId: 22 }).boundingBox();
    const locator2 = await getAtomLocator(page, { atomId: 37 }).boundingBox();
    await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Lasso);
    if (!locator1 || !locator2) throw new Error('No bounding box');
    const padding = 10;
    await selectWithLasso(page, locator1.x - padding, locator1.y - padding, [
      { x: locator2.x + locator2.width + padding, y: locator1.y - padding },
      {
        x: locator2.x + locator2.width + padding,
        y: locator2.y + locator2.height + padding,
      },
      { x: locator1.x - padding, y: locator2.y + locator2.height + padding },
      { x: locator1.x - padding, y: locator1.y - padding },
    ]);
    await verticalFlip(page);
    await verifyPNGExport(page);
    await verifySVGExport(page);
  });

  test('Verify deletion of selected structures', async () => {
    /*
    Test case: EPMLSOPKET-15510
    Description: All selected structures are deleted from the canvas.
    */
    await openFileAndAddToCanvas(page, 'KET/two-benzene-with-atoms.ket');
    await selectAllStructuresOnCanvas(page);
    await page.getByTestId('delete').click();
    await takeEditorScreenshot(page);
  });

  test('(50px to Down) Structure Movement with Arrow Keys (1px move)', async () => {
    /*
    Test case: EPMLSOPKET-15512
    Description: The selected structure should move 1 pixel in the corresponding
    direction with each key press. In this test to 50px Down.
    */
    await openFileAndAddToCanvas(page, 'KET/two-benzene-with-atoms.ket');
    await takeEditorScreenshot(page);
    await selectAllStructuresOnCanvas(page);
    for (let i = 0; i < 50; i++) {
      await page.keyboard.press('ArrowDown');
    }
    await takeEditorScreenshot(page);
  });

  test(
    '(50px to Up) Structure Movement with Arrow Keys (1px move)',
    {
      tag: ['@SlowTest'],
    },
    async () => {
      /*
    Test case: EPMLSOPKET-15512
    Description: The selected structure should move 1 pixel in the corresponding
    direction with each key press. In this test to 50px Up.
    */
      test.slow();

      await openFileAndAddToCanvas(page, 'KET/two-benzene-with-atoms.ket');
      await takeEditorScreenshot(page);
      await selectAllStructuresOnCanvas(page);
      for (let i = 0; i < 50; i++) {
        await waitForRender(page, async () => {
          await page.keyboard.press('ArrowUp');
        });
      }
      await takeEditorScreenshot(page);
    },
  );

  test(
    '(50px to Right) Structure Movement with Arrow Keys (1px move)',
    {
      tag: ['@SlowTest'],
    },
    async () => {
      /*
    Test case: EPMLSOPKET-15512
    Description: The selected structure should move 1 pixel in the corresponding
    direction with each key press. In this test to 50px Right.
    */
      test.slow();

      await openFileAndAddToCanvas(page, 'KET/two-benzene-with-atoms.ket');
      await takeEditorScreenshot(page);
      await selectAllStructuresOnCanvas(page);
      for (let i = 0; i < 50; i++) {
        await waitForRender(page, async () => {
          await page.keyboard.press('ArrowRight');
        });
      }
      await takeEditorScreenshot(page);
    },
  );

  test(
    '(50px to Left) Structure Movement with Arrow Keys (1px move)',
    {
      tag: ['@SlowTest'],
    },
    async () => {
      /*
    Test case: EPMLSOPKET-15512
    Description: The selected structure should move 1 pixel in the corresponding
    direction with each key press. In this test to 50px Left.
    */
      test.slow();

      await openFileAndAddToCanvas(page, 'KET/two-benzene-with-atoms.ket');
      await takeEditorScreenshot(page);
      await selectAllStructuresOnCanvas(page);
      for (let i = 0; i < 50; i++) {
        await waitForRender(page, async () => {
          await page.keyboard.press('ArrowLeft');
        });
      }
      await takeEditorScreenshot(page);
    },
  );

  test('(100px to Down with Shift key) Structure Movement with Arrow Keys (10px move)', async () => {
    /*
    Test case: EPMLSOPKET-15512
    Description: The selected structure should move 10 pixel in the corresponding
    direction with each key press with Shift key. In this test to 100px Down.
    */
    await openFileAndAddToCanvas(page, 'KET/two-benzene-with-atoms.ket');
    await takeEditorScreenshot(page);
    await selectAllStructuresOnCanvas(page);
    await page.keyboard.down('Shift');
    for (let i = 0; i < 10; i++) {
      await waitForRender(page, async () => {
        await page.keyboard.press('ArrowDown');
      });
    }
    await page.keyboard.up('Shift');
    await takeEditorScreenshot(page);
  });

  test('(100px to Up with Shift key) Structure Movement with Arrow Keys (10px move)', async () => {
    /*
    Test case: EPMLSOPKET-15512
    Description: The selected structure should move 10 pixel in the corresponding
    direction with each key press with Shift key. In this test to 100px Up.
    */
    await openFileAndAddToCanvas(page, 'KET/two-benzene-with-atoms.ket');
    await takeEditorScreenshot(page);
    await selectAllStructuresOnCanvas(page);
    await page.keyboard.down('Shift');
    for (let i = 0; i < 10; i++) {
      await waitForRender(page, async () => {
        await page.keyboard.press('ArrowUp');
      });
    }
    await page.keyboard.up('Shift');
    await takeEditorScreenshot(page);
  });

  test('(100px to Right with Shift key) Structure Movement with Arrow Keys (10px move)', async () => {
    /*
    Test case: EPMLSOPKET-15512
    Description: The selected structure should move 10 pixel in the corresponding
    direction with each key presswith Shift key. In this test to 100px Right.
    */
    await openFileAndAddToCanvas(page, 'KET/two-benzene-with-atoms.ket');
    await takeEditorScreenshot(page);
    await selectAllStructuresOnCanvas(page);
    await page.keyboard.down('Shift');
    for (let i = 0; i < 10; i++) {
      await waitForRender(page, async () => {
        await page.keyboard.press('ArrowRight');
      });
    }
    await page.keyboard.up('Shift');
    await takeEditorScreenshot(page);
  });

  test('(100px to Left with Shift key) Structure Movement with Arrow Keys (10px move)', async () => {
    /*
    Test case: EPMLSOPKET-15512
    Description: The selected structure should move 10 pixel in the corresponding
    direction with each key press with Shift key. In this test to 100px Left.
    */
    await openFileAndAddToCanvas(page, 'KET/two-benzene-with-atoms.ket');
    await takeEditorScreenshot(page);
    await selectAllStructuresOnCanvas(page);
    await page.keyboard.down('Shift');
    for (let i = 0; i < 10; i++) {
      await waitForRender(page, async () => {
        await page.keyboard.press('ArrowLeft');
      });
    }
    await page.keyboard.up('Shift');
    await takeEditorScreenshot(page);
  });

  test('Field value text when placed on a structure becomes hard to access', async () => {
    /*
    Test case: EPMLSOPKET-12974
    Description: User can easily select 'Field value' text and move to desired location.
    */
    const pointx = 580;
    const pointy = 400;

    const pointx1 = 750;
    const pointy1 = 300;
    await openFileAndAddToCanvas(page, 'KET/two-benzene-with-atoms.ket');
    await LeftToolbar(page).sGroup();
    await getAtomLocator(page, { atomLabel: 'C', atomId: 16 }).click({
      force: true,
    });
    await SGroupPropertiesDialog(page).setOptions({
      Type: TypeOption.Data,
      Context: ContextOption.Fragment,
      FieldName: 'Test',
      FieldValue: '33',
      PropertyLabelType: PropertyLabelType.Absolute,
    });
    await CommonLeftToolbar(page).areaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await page.getByText('33', { exact: true }).click();
    await dragMouseTo(pointx, pointy, page);
    await takeEditorScreenshot(page);

    await page.getByText('33', { exact: true }).click();
    await dragMouseTo(pointx1, pointy1, page);
    await takeEditorScreenshot(page);
  });
});

test.describe('Selection tools', () => {
  let page: Page;
  test.beforeAll(async ({ initMoleculesCanvas }) => {
    page = await initMoleculesCanvas();
  });
  test.afterAll(async ({ closePage }) => {
    await closePage();
  });
  test.beforeEach(async ({ MoleculesCanvas: _ }) => {});

  test('Selection tools is not change when user press ESC button', async () => {
    /*
    Test case: EPMLSOPKET-10074
    Description: If user presses esc, then last chosen selected tool must be
    selected and pressing esc doesn't choose another mode of selection tool
    */
    await BottomToolbar(page).clickRing(RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);
    await selectAllStructuresOnCanvas(page);
    for (let i = 0; i < 2; i++) {
      await page.keyboard.press('Escape');
    }
    await expect(page).toHaveScreenshot();
  });

  test('Verify removal of current flip and rotation buttons in the left toolbar', async () => {
    /*
    Test case: EPMLSOPKET-15511
    Description: The flip and rotation buttons are no longer present in the left toolbar.
    */
    await takeLeftToolbarScreenshot(page);
  });

  test('Canvas Expansion when Structure is Moved Outside Down', async () => {
    /*
    Test case: EPMLSOPKET-15514
    Description: The canvas should automatically expand in the direction the structure is being moved.
    */
    await openFileAndAddToCanvas(page, 'KET/two-benzene-with-atoms.ket');
    await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Fragment);
    await getAtomLocator(page, { atomLabel: 'N', atomId: 22 }).click({
      force: true,
    });
    await page.keyboard.down('Shift');
    for (let i = 0; i < 50; i++) {
      await page.keyboard.press('ArrowDown');
    }
    await page.keyboard.up('Shift');
    await expect(page).toHaveScreenshot();
  });

  test('Canvas Expansion when Structure is Moved Outside Up', async () => {
    /*
    Test case: EPMLSOPKET-15514
    Description: The canvas should automatically expand in the direction the structure is being moved.
    */
    await openFileAndAddToCanvas(page, 'KET/two-benzene-with-atoms.ket');
    await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Fragment);
    await getAtomLocator(page, { atomLabel: 'N', atomId: 22 }).click({
      force: true,
    });
    await page.keyboard.down('Shift');
    for (let i = 0; i < 50; i++) {
      await page.keyboard.press('ArrowUp');
    }
    await page.keyboard.up('Shift');
    await expect(page).toHaveScreenshot();
  });

  test('Canvas Expansion when Structure is Moved Outside Right', async () => {
    /*
    Test case: EPMLSOPKET-15515
    Description: The canvas should automatically expand in the direction the structure is being moved.
    */
    await openFileAndAddToCanvas(page, 'KET/two-benzene-with-atoms.ket');
    await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Fragment);
    await getAtomLocator(page, { atomLabel: 'N', atomId: 22 }).click({
      force: true,
    });
    await page.keyboard.down('Shift');
    for (let i = 0; i < 80; i++) {
      await page.keyboard.press('ArrowRight');
    }
    await page.keyboard.up('Shift');
    await expect(page).toHaveScreenshot();
  });

  test('Canvas Expansion when Structure is Moved Outside Left', async () => {
    /*
    Test case: EPMLSOPKET-15515
    Description: The canvas should automatically expand in the direction the structure is being moved.
    */
    await openFileAndAddToCanvas(page, 'KET/two-benzene-with-atoms.ket');
    await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Fragment);
    await getAtomLocator(page, { atomLabel: 'N', atomId: 22 }).click({
      force: true,
    });
    await page.keyboard.down('Shift');
    for (let i = 0; i < 80; i++) {
      await page.keyboard.press('ArrowLeft');
    }
    await page.keyboard.up('Shift');
    await expect(page).toHaveScreenshot();
  });

  test('Move structure over the border of the canvas', async () => {
    /*
    Test case: EPMLSOPKET-10068
    Description: The canvas should automatically expand in the direction the structure is being moved.
    Structure is visible on the canvas.
    */
    await openFileAndAddToCanvas(page, 'KET/two-benzene-with-atoms.ket');
    await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Fragment);
    await getAtomLocator(page, { atomLabel: 'N', atomId: 22 }).click({
      force: true,
    });
    await page.keyboard.down('Shift');
    for (let i = 0; i < 100; i++) {
      await page.keyboard.press('ArrowDown');
    }
    await page.keyboard.up('Shift');
    await expect(page).toHaveScreenshot();
  });

  test('Selection Drop-down list', async () => {
    /*
    Test case: EPMLSOPKET-10068
    Description: Selection palette should contain Rectangle Selection, Lasso Selection, Fragment Selection tools.
    */
    await CommonLeftToolbar(page).areaSelectionDropdownButton.click();
    await expect(page).toHaveScreenshot();
  });

  test('Selection when hovering atom and bond', async () => {
    /*
    Test case: EPMLSOPKET-16944
    Description: When mouse hover on Benzene ring atom or bond, selection appears.
    */

    const bondLocator = getBondLocator(page, { bondId: 7 });
    await drawBenzeneRing(page);
    await CommonLeftToolbar(page).areaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await getAtomLocator(page, { atomLabel: 'C', atomId: 6 }).hover({
      force: true,
    });
    await takeEditorScreenshot(page);
    await bondLocator.hover({ force: true });
    await takeEditorScreenshot(page);
  });

  test('Selection for several templates', async () => {
    /*
    Test case: EPMLSOPKET-16945
    Description: All structures selected on the canvas are highlighted in green.
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/several-templates-selection-tool.mol',
    );
    await selectAllStructuresOnCanvas(page);
    await takeEditorScreenshot(page);
  });

  test('Selection for chain structure', async () => {
    /*
    Test case: EPMLSOPKET-17668
    Description: All chain structures selected on the canvas are highlighted in green.
    */
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/chain-r1.mol');
    await selectAllStructuresOnCanvas(page);
    await takeEditorScreenshot(page);
  });

  test('Switching tools inside the "Selection tool" using "Shift+Tab", after selecting the Lasso', async () => {
    /*
    Test case: EPMLSOPKET-18047
    Description: Shift+Tab switch selection tools after selecting Lasso.
    */
    await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Lasso);
    await takeLeftToolbarScreenshot(page);
    for (let i = 0; i < 4; i++) {
      await page.keyboard.press('Shift+Tab');
      await takeLeftToolbarScreenshot(page);
    }
  });
});
