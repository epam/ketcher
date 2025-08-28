/* eslint-disable prettier/prettier */
import { test } from '@fixtures';
import {
  takeEditorScreenshot,
  clickInTheMiddleOfTheScreen,
  dragMouseTo,
  pressButton,
  clickOnAtom,
  moveOnAtom,
  waitForPageInit,
  openFileAndAddToCanvas,
  addCyclopentadieneRingWithTwoAtoms,
  clickOnBond,
  BondType,
  takePageScreenshot,
  moveOnBond,
  moveMouseToTheMiddleOfTheScreen,
  getRightAtomByAttributes,
  cutToClipboardByKeyboard,
  pasteFromClipboardByKeyboard,
  copyToClipboardByKeyboard,
  clickOnCanvas,
  selectUndoByKeyboard,
  waitForElementInCanvas,
  pasteFromClipboardAndAddToCanvas,
  getCachedBodyCenter,
  RxnFileFormat,
  MolFileFormat,
} from '@utils';
import { selectAllStructuresOnCanvas } from '@utils/canvas/selectSelection';
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
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { MicroBondType } from '@tests/pages/constants/bondSelectionTool/Constants';
import { RGroupType } from '@tests/pages/constants/rGroupSelectionTool/Constants';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import {
  BottomToolbar,
  drawBenzeneRing,
  drawCyclohexaneRing,
  drawCyclopentadieneRing,
  selectRingButton,
} from '@tests/pages/molecules/BottomToolbar';
import { RingButton } from '@tests/pages/constants/ringButton/Constants';
import { expandAbbreviation } from '@utils/sgroup/helpers';
import { ContextMenu } from '@tests/pages/common/ContextMenu';
import { MicroAtomOption } from '@tests/pages/constants/contextMenu/Constants';
import { AttachmentPointsDialog } from '@tests/pages/molecules/canvas/AttachmentPointsDialog';
import { StructureLibraryDialog } from '@tests/pages/molecules/canvas/StructureLibraryDialog';
import {
  AromaticsTemplate,
  FunctionalGroupsTabItems,
  TabSection,
  TemplateLibraryTab,
} from '@tests/pages/constants/structureLibraryDialog/Constants';
import { getAtomLocator } from '@utils/canvas/atoms/getAtomLocator/getAtomLocator';
import { TemplateEditDialog } from '@tests/pages/molecules/canvas/TemplateEditDialog';

test.describe('Template Manupulations', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Template palette', async ({ page }) => {
    /*
    Test case: 1666
    Description: Look at the bottom of the application.
    Choose any template.
    */
    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).editTemplate(
      TemplateLibraryTab.Aromatics,
      AromaticsTemplate.Naphtalene,
    );
    await TemplateEditDialog(page).clickMoleculeName();
    await takeEditorScreenshot(page);
  });
});

test.describe('Template Manupulations', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('1-2) Fuse atom-to-atom', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1674
    Description: Create a structure from the template. 
    Choose any element from the left panel or Periodic Table and click on any atom of the created structure.
    */
    const anyAtom = 0;
    const atomToolbar = RightToolbar(page);

    await drawBenzeneRing(page);
    await atomToolbar.clickAtom(Atom.Oxygen);
    await clickOnAtom(page, 'C', anyAtom);
    await takeEditorScreenshot(page);
  });

  test('3) Fuse atom-to-atom: drag atom slightly', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1674
    Description: Create a structure from the template. 
    Put the cursor on any other structure atom, click, and drag slightly.
    */
    const anyAtom = 0;
    const x = 200;
    const y = 200;
    await drawBenzeneRing(page);
    await moveOnAtom(page, 'C', anyAtom);
    await dragMouseTo(x, y, page);
    await takeEditorScreenshot(page);
  });

  test('5) Fuse atom-to-atom: click and drag atom to fuse atom-to-atom', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1674
    Description: Put the cursor on any other structure atom, press, and drag. 
    Release the cursor when the distance from the cursor to the selected atom is more than the bond length. 
    */
    const anyAtom = 0;
    await drawBenzeneRing(page);
    await BottomToolbar(page).clickRing(RingButton.Benzene);
    await clickOnAtom(page, 'C', anyAtom);
    await takeEditorScreenshot(page);
  });

  test('Fuse atom-to-atom: click and drag atom to extend bonds', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1674
    Description: Create a structure from the template. 
    */
    const anyAtom = 0;
    const x = 300;
    const y = 300;
    await drawBenzeneRing(page);
    await moveOnAtom(page, 'C', anyAtom);
    await dragMouseTo(x, y, page);
    await takeEditorScreenshot(page);
  });

  test('Fuse bond-to-bond', async ({ page }) => {
    /*
    Test case: 1676
    Description:
    Choose any template and click any bond of the created structure.
    With the template select any bond of the created structure, hold and drag "left-right".
    */
    const shift = 10;
    await CommonLeftToolbar(page).selectBondTool(MicroBondType.Single);
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
    await selectAllStructuresOnCanvas(page);
    const { x: rotationHandleX, y: rotationHandleY } =
      await getRotationHandleCoordinates(page);
    await dragMouseTo(rotationHandleX, rotationHandleY, page);
    await dragMouseTo(rotationHandleX, rotationHandleY - shift, page);
    await takeEditorScreenshot(page);
  });

  test('Place template on the Canvas', async ({ page }) => {
    /*
    Test case: 1678
    Description: Choose any template and click on the canvas.
    */
    await selectRingButton(page, RingButton.Cyclopentadiene);
    await clickInTheMiddleOfTheScreen(page);
    await CommonLeftToolbar(page).selectAreaSelectionTool();
    await takeEditorScreenshot(page);
  });

  test(
    'Templates - Manipulations with Selection Tool',
    {
      tag: ['@FlakyTest'],
    },
    async ({ page }) => {
      /*
    Test case: 1733
    Description:
    With Select Tool (Lasso or Rectangle) select any atom/bond/part of structure/whole structure, press and drag on the canvas.
    With Fragment select tool select whole template structure and move it.
    Select any part of the structure (or whole structure) and click the 'Delete' keyboard button.
    with Ctrl+A hot key select all ojects on canvas and click the 'Delete' keyboard button.
    */
      const atomToolbar = RightToolbar(page);

      await atomToolbar.clickAtom(Atom.Fluorine);
      await clickInTheMiddleOfTheScreen(page);
      await CommonLeftToolbar(page).selectAreaSelectionTool(
        SelectionToolType.Fragment,
      );
      await page.getByTestId('canvas').getByText('F').first().click();
      await takeEditorScreenshot(page);
      await selectAllStructuresOnCanvas(page);
      await selectAllStructuresOnCanvas(page);
      await cutToClipboardByKeyboard(page);
      await selectUndoByKeyboard(page);
      await takeEditorScreenshot(page);
    },
  );

  test('Templates - Manipulations with Bond Tool', async ({ page }) => {
    /*
    Test case: 1734
    Description:
    With Bond Tool change the template bonds and add new ones.
    With Chain Tool click any template atom and sprout the chain from the selected atom.
    Load the smile-string CCCCC ("Open..." -> "Paste from clipboard").
    With the benzene template click the third atom of the created chain.
    */
    const x = 300;
    const y = 300;
    const anyAtom = 0;
    const atomToolbar = RightToolbar(page);

    await CommonLeftToolbar(page).selectBondTool(MicroBondType.Single);
    await clickInTheMiddleOfTheScreen(page);
    await moveOnAtom(page, 'C', anyAtom);
    await dragMouseTo(x, y, page);
    await LeftToolbar(page).chain();
    await atomToolbar.clickAtom(Atom.Iodine);
    await clickOnAtom(page, 'C', anyAtom);

    await pasteFromClipboardAndAddToCanvas(
      page,
      'CCCCC/CC/C:CC.C(C)CCCCCCCCCC',
    );
    await clickInTheMiddleOfTheScreen(page, 'left', {
      waitForMergeInitialization: true,
    });
    await selectRingButton(page, RingButton.Benzene);
    await moveOnAtom(page, 'C', anyAtom);
    await dragMouseTo(x, y, page);
    await takeEditorScreenshot(page);
  });

  test('Templates - Manipulations with Erase Tool', async ({ page }) => {
    /*
    Test case: 1735
    Description:
    With the 'Erase' tool press, hold and drag around (or click) any atom/bond/part of structure/whole structure.
    Select the 'Fragment Selection' tool, click the structure, and then select 'Erase' tool and click the template structure.
    */
    const atomToolbar = RightToolbar(page);

    await atomToolbar.clickAtom(Atom.Sulfur);
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
    await CommonLeftToolbar(page).selectEraseTool();
    await page.getByTestId('canvas').getByText('S').first().click();
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await atomToolbar.clickAtom(Atom.Sulfur);
    await clickInTheMiddleOfTheScreen(page);
    await CommonLeftToolbar(page).selectEraseTool();
    await page.getByTestId('canvas').getByText('S').first().click();
    await CommonTopLeftToolbar(page).clearCanvas();
    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).openTab(TabSection.TemplateLibraryTab);
    await takeEditorScreenshot(page);
  });

  test('Templates - Atom symbol editing', async ({ page }) => {
    /*
    Test case: 1736
    Description:
    With Selection Tool (Rectangle) click any atom of the template structure and type any correct atom symbol.
    */
    const atomToolbar = RightToolbar(page);

    await atomToolbar.clickAtom(Atom.Sulfur);
    await clickInTheMiddleOfTheScreen(page);

    await LeftToolbar(page).selectRGroupTool(RGroupType.AttachmentPoint);
    await getAtomLocator(page, { atomLabel: 'S', atomId: 0 }).click();
    await AttachmentPointsDialog(
      page,
    ).primaryAttachmentPointCheckbox.setChecked(true);
    await takeEditorScreenshot(page);
    await AttachmentPointsDialog(page).apply();
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );

    await ContextMenu(
      page,
      getAtomLocator(page, { atomLabel: 'S', atomId: 0 }),
    ).click(MicroAtomOption.Edit);
    await page.getByLabel('Label').click();
    await page.getByLabel('Label').fill('Br');
    await page.getByTestId('OK').click();
    await takeEditorScreenshot(page);
  });

  test('Undo/Redo action', async ({ page }) => {
    /*
    Test case: 1737
    Description: Edit the structures in any way.
    Click Undo multiple times.
    Click Redo multiple times.
    */
    const anyAtom = 0;
    const anyAnotherAtom = 4;
    const atomToolbar = RightToolbar(page);

    await drawBenzeneRing(page);
    await atomToolbar.clickAtom(Atom.Fluorine);
    await clickOnAtom(page, 'C', anyAtom);
    await clickOnAtom(page, 'C', anyAnotherAtom);
    const numberOfPressingUndo = 2;
    for (let i = 0; i < numberOfPressingUndo; i++) {
      await CommonTopLeftToolbar(page).undo();
    }
    await takeEditorScreenshot(page);
    const numberOfPressingRedo = 2;
    for (let i = 0; i < numberOfPressingRedo; i++) {
      await CommonTopLeftToolbar(page).redo();
    }
    await takeEditorScreenshot(page);
  });

  test('Rotate/Flip the template structure', async ({ page }) => {
    /*
    Test case: 1745
    Description: Choose the 'Rotate Tool', select the structure and rotate it.
    Select the structure and flip it horizontally with the 'Horizontal Flip' tool.
    Select the structure and flip it vertically with the 'Vertical Flip' tool.
    */
    const anyAtom = 0;
    const atomToolbar = RightToolbar(page);

    await drawBenzeneRing(page);
    await atomToolbar.clickAtom(Atom.Fluorine);
    await clickOnAtom(page, 'C', anyAtom);
    await selectAllStructuresOnCanvas(page);
    await pressButton(page, 'Vertical Flip (Alt+V)');
    await takeEditorScreenshot(page);
    await pressButton(page, 'Horizontal Flip (Alt+H)');
    await takeEditorScreenshot(page);
  });

  test('Templates - Zoom action for the template structure', async ({
    page,
  }) => {
    /*
    Test case: 1746
    Description:
    Open the percentage dropdown in the top right corner.
    Click the Zoom In button several times.
    Click the Zoom Out button several times.
    Create the reaction.
    Click the Zoom In button several times.
    Click the Zoom Out button several times.
    */
    const zoomSelector = CommonTopRightToolbar(page).zoomSelector;
    await CommonTopRightToolbar(page).selectZoomOutTool();
    await clickInTheMiddleOfTheScreen(page);
    await drawBenzeneRing(page);
    await page.getByTestId('reaction-plus').click();
    await clickOnCanvas(page, 1, 1, { from: 'pageCenter' });
    await selectRingButton(page, RingButton.Cyclooctane);
    // eslint-disable-next-line no-magic-numbers
    await clickOnCanvas(page, 1, -4, { from: 'pageCenter' });
    await takePageScreenshot(page);
    await LeftToolbar(page).selectArrowTool();
    await clickOnCanvas(page, 1, 0, { from: 'pageCenter' });
    await takePageScreenshot(page);
    await zoomSelector.click();
    await takeEditorScreenshot(page);
  });

  test('Save as *.mol file', async ({ page }) => {
    /*
    Test case: 1747
    Description: Click the 'Save As' button, and click the 'Save' button.
    Open the saved *.mol file and edit it in any way.
    */
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/three-templates.mol');
    await verifyFileExport(
      page,
      'Molfiles-V2000/three-templates-expected.mol',
      FileType.MOL,
      MolFileFormat.v2000,
    );
    await takeEditorScreenshot(page);
  });

  test('Save as *.rxn file', async ({ page }) => {
    /*
    Test case: 1748
    Description: Click the 'Save As' button and click the 'Save' button.
    Open the saved *.rxn file and edit it in any way.
    */
    await openFileAndAddToCanvas(page, 'Rxn-V2000/templates-reaction.rxn');
    await verifyFileExport(
      page,
      'Rxn-V2000/templates-reaction-expected.rxn',
      FileType.RXN,
      RxnFileFormat.v2000,
    );
    await takeEditorScreenshot(page);
  });

  test('If connect to a single bond with two atoms then replace double bond by single bond for the fusion', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-15504
    Add cyclopentadiene ring on canvas
    Add another cyclopentadiene ring to a single bond with two atoms, where each atom is connected to any atom with a double bond
    */
    await drawCyclopentadieneRing(page);
    await addCyclopentadieneRingWithTwoAtoms(page);
    await selectRingButton(page, RingButton.Cyclopentadiene);
    await takeEditorScreenshot(page);
  });

  test('Double cyclopentadiene ring - If connect to a double bond with two atom then cyclopentadiene rotate rand use double bond for the fusion', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-15505
    Add Benzene ring on canvas
    Add cyclopentadiene ring to to a double bond with two atom, where each atom is connected to any atom with a single bond
    */
    await drawBenzeneRing(page);
    await addCyclopentadieneRingWithTwoAtoms(page);
    await selectRingButton(page, RingButton.Cyclopentadiene);
    await takeEditorScreenshot(page);
  });

  test('Double cyclopentadiene ring-if connect to a single bond with two atoms-but one atom is connected with a single bond and another with a double bond', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-15506
    Add Cyclohexane ring on canvas and add double bond on it and atom
    Add cyclopentadiene ring to a single bond with two atoms, but one atom is connected with a single bond and another with a double bond
    */
    const atomToolbar = RightToolbar(page);

    await drawCyclohexaneRing(page);
    await atomToolbar.clickAtom(Atom.Nitrogen);
    await clickOnAtom(page, 'C', 0);
    const anyAtom = 4;
    await clickOnAtom(page, 'C', anyAtom);
    await selectRingButton(page, RingButton.Cyclopentadiene);
    await takeEditorScreenshot(page);
  });

  test('Double cyclopentadiene ring - if all bonds are single', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-15507
    Add Cyclohexane ring on canvas and add on it an atom
    Add cyclopentadiene ring to a single bond
    */
    const atomToolbar = RightToolbar(page);

    await drawCyclohexaneRing(page);
    await atomToolbar.clickAtom(Atom.Nitrogen);
    await clickOnAtom(page, 'C', 0);
    await selectRingButton(page, RingButton.Cyclopentadiene);
    await takeEditorScreenshot(page);
  });

  test('Adding the template to the existing structure', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-4735
    Click on the Cyclopentadiene atom in the existing structure to add the same template.
    To add the structure connected with a single bond click & drag.
    */
    await drawCyclopentadieneRing(page);
    await clickOnBond(page, BondType.SINGLE, 0);
    await clickOnBond(page, BondType.SINGLE, 1);
    // eslint-disable-next-line no-magic-numbers
    await clickOnBond(page, BondType.SINGLE, 2);
    await clickOnBond(page, BondType.SINGLE, 1);
    await clickOnBond(page, BondType.SINGLE, 0);
    const coordinates = await getRotationHandleCoordinates(page);
    const { x: rotationHandleX, y: rotationHandleY } = coordinates;
    await page.mouse.move(rotationHandleX, rotationHandleY);
    await takeEditorScreenshot(page);
  });

  test('Inappropriate structure is not generated when drawing fused aromatic rings', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-4738
    Description:
    Draw benzene using the template
    Again using the benzene template, left click on the single bond circled in blue.
    */
    await drawCyclopentadieneRing(page);
    await clickOnBond(page, BondType.SINGLE, 0);
    await takeEditorScreenshot(page);
  });

  test('Templates - Edit abbreviation window appear when user trying to add structure to a functional group or salt', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-12985
    Description:
    Add any FG or Salt to the canvas
    Expand abbreviation
    Select any structure from template toolbar or from template library
    Attach selected structure to the FG
    */
    const X_DELTA_ONE = 100;
    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).addFunctionalGroup(
      FunctionalGroupsTabItems.CONH2,
    );
    await clickInTheMiddleOfTheScreen(page);
    const middleOfTheScreen = await getCachedBodyCenter(page);
    await expandAbbreviation(page, middleOfTheScreen);
    const { x, y } = middleOfTheScreen;
    const nitrogenCoordinates = { x: x + X_DELTA_ONE, y };
    await selectRingButton(page, RingButton.Benzene);
    await clickOnCanvas(page, nitrogenCoordinates.x, nitrogenCoordinates.y, {
      from: 'pageTopLeft',
    });
    await takeEditorScreenshot(page);
  });
});

test.describe('Open Ketcher', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('The different templates are attached to the atoms of existing benzene-1', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1669/1
    Description:
    Move with mouse over the template button with benzene structure.
    Select and paste benzene from templates on the canvas.
    Attach different templates to atoms of existing benzene
     -click with template any atom of the created benzene; 
    Clear All.
    */
    await drawBenzeneRing(page);
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/s-group-with-attachment-points.mol',
    );
    await moveOnAtom(page, 'C', 1);
    await moveOnAtom(page, 'C', 0);
    await takePageScreenshot(page);
    await CommonTopLeftToolbar(page).clearCanvas();
  });

  test('The different templates are attached to the atoms of existing benzene-2', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1669/2
    Description:
    Paste benzene from templates on the canvas.
     -click with template the bond of the created benzene; 
    Clear All.
    */
    await drawBenzeneRing(page);
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/s-group-with-attachment-points.mol',
    );
    await moveOnBond(page, BondType.DOUBLE, 1);
    await moveOnBond(page, BondType.DOUBLE, 0);
    await waitForElementInCanvas(page, 'A=Test');

    await takePageScreenshot(page);
    await CommonTopLeftToolbar(page).clearCanvas();
  });

  test('The different templates are attached to the atoms of existing benzene-3', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1669/3
    Description:
    Paste benzene from templates on the canvas.
    Edit benzene with all possible ways.
    */
    const anyAtom = 2;
    await drawBenzeneRing(page);
    await moveOnAtom(page, 'C', anyAtom);
    await takePageScreenshot(page);
  });

  test('Templates - The full preview of the Template from the Templates toolbar, following mouse cursor', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-18050
    Description:
    Verify if the full preview of the Template is displayed under the mouse cursor
    */
    const xOffsetFromCenter = 40;
    await BottomToolbar(page).Benzene();
    await moveMouseToTheMiddleOfTheScreen(page);
    await clickOnCanvas(page, xOffsetFromCenter, 0, { from: 'pageCenter' });
    await takePageScreenshot(page);
    await BottomToolbar(page).Cyclopentadiene();
    const point = await getRightAtomByAttributes(page, { label: 'C' });
    await page.mouse.move(point.x, point.y);
    await takePageScreenshot(page);
  });

  test('Templates - The full preview of the Template from the Template library, following mouse cursor', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-18051
    Description:
    Verify if the full preview of the Template is displayed under the mouse cursor
    Click on any empty place on the canvas
    Verify if the full preview of the Template is displayed under the mouse cursor
    */
    const xOffsetFromCenter = 40;
    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).addTemplate(
      TemplateLibraryTab.Aromatics,
      AromaticsTemplate.Azulene,
    );
    await moveMouseToTheMiddleOfTheScreen(page);
    await clickOnCanvas(page, xOffsetFromCenter, 0, { from: 'pageCenter' });
    await takePageScreenshot(page);
    const point = await getRightAtomByAttributes(page, { label: 'C' });
    await page.mouse.move(point.x, point.y);
    await takePageScreenshot(page);
  });

  test(
    'Templates - The preview of how the Template from the Templates toolbar will be merged, using Paste tool',
    {
      tag: ['@FlakyTest'],
    },
    async ({ page }) => {
      /*
    Test case: EPMLSOPKET-18052
    Description:
    Verify if merging these Templates after clicking matches the full preview of merging these Templates"
    */
      const xOffsetFromCenter = 40;
      await selectRingButton(page, RingButton.Benzene);
      await clickOnCanvas(page, xOffsetFromCenter, 0, { from: 'pageCenter' });
      await CommonLeftToolbar(page).selectAreaSelectionTool(
        SelectionToolType.Rectangle,
      );
      await takePageScreenshot(page);

      await selectAllStructuresOnCanvas(page);
      await cutToClipboardByKeyboard(page);
      await pasteFromClipboardByKeyboard(page);
      await clickOnCanvas(page, xOffsetFromCenter, 0, { from: 'pageCenter' });
      await selectRingButton(page, RingButton.Benzene);
      await clickInTheMiddleOfTheScreen(page);
      await selectRingButton(page, RingButton.Benzene);
      await takePageScreenshot(page);
    },
  );

  test('Templates - The preview of how the Template from the Template library will be merged, using Paste tool', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-18053
    Description:
    Verify if the full preview of merging the pasted Template with another Template is displayed under the mouse cursor, and click
    */
    const xOffsetFromCenter = 40;
    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).addTemplate(
      TemplateLibraryTab.Aromatics,
      AromaticsTemplate.Naphtalene,
    );
    await moveMouseToTheMiddleOfTheScreen(page);
    await clickOnCanvas(page, xOffsetFromCenter, 0, { from: 'pageCenter' });
    await takePageScreenshot(page);
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await takePageScreenshot(page);
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await selectAllStructuresOnCanvas(page);
    await copyToClipboardByKeyboard(page);
    await pasteFromClipboardByKeyboard(page);
    await moveMouseToTheMiddleOfTheScreen(page);
    await clickInTheMiddleOfTheScreen(page);
  });

  test('Templates - Merging the Template from the Templates toolbar and the Template from the Template library', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-18054
    Description:
    Verify if merging these Templates after clicking matches the full preview of merging these Templates"
    */
    await BottomToolbar(page).Benzene();
    await clickInTheMiddleOfTheScreen(page);
    await takePageScreenshot(page);
    await BottomToolbar(page).StructureLibrary();
    await StructureLibraryDialog(page).addTemplate(
      TemplateLibraryTab.Aromatics,
      AromaticsTemplate.Azulene,
    );
    const anyAtom = 2;
    await moveOnAtom(page, 'C', anyAtom);
    await takePageScreenshot(page);
  });
});
