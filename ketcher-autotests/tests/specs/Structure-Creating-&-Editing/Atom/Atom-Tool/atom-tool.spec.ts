import { MAX_BOND_LENGTH } from '@constants/index';
import { test, Page } from '@playwright/test';
import {
  pressButton,
  takeEditorScreenshot,
  waitForPageInit,
  selectAtomInToolbar,
  AtomButton,
  clickInTheMiddleOfTheScreen,
  takeRightToolbarScreenshot,
  openFileAndAddToCanvas,
  clickOnAtom,
  moveMouseToTheMiddleOfTheScreen,
  getCoordinatesOfTheMiddleOfTheScreen,
  dragMouseTo,
  waitForRender,
  selectAtomsFromPeriodicTable,
  resetCurrentTool,
  moveOnAtom,
  screenshotBetweenUndoRedo,
  selectPartOfMolecules,
  copyAndPaste,
  cutAndPaste,
  drawBenzeneRing,
  getCoordinatesTopAtomOfBenzeneRing,
  selectAllStructuresOnCanvas,
  clickOnCanvas,
  ZoomInByKeyboard,
} from '@utils';
import { atomsNames } from '@utils/canvas/atoms/excludedAtoms';
import {
  FileType,
  verifyFileExport,
} from '@utils/files/receiveFileComparisonData';
import { pressUndoButton } from '@tests/pages/common/TopLeftToolbar';
import {
  selectAreaSelectionTool,
  selectEraseTool,
} from '@tests/pages/common/CommonLeftToolbar';
import { SelectionToolType } from '@tests/pages/constants/areaSelectionTool/Constants';
import { rightToolbar } from '@tests/pages/molecules/RightToolbar';
import { Atom } from '@tests/pages/constants/atoms/atoms';

const X_DELTA_ONE = 100;

async function clickAtomShortcut(page: Page, labelKey: string) {
  await page.keyboard.press(labelKey);
  await clickInTheMiddleOfTheScreen(page);
}

test.describe('Atom Tool', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Periodic table dialog', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1403
    Description: The "Periodic table" modal dialog is opened.
    Periodic table' window is closed. No symbols appear on the canvas.
    */
    await selectAtomInToolbar(AtomButton.Periodic, page);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Cancel');
    await takeEditorScreenshot(page);
  });

  test('Extended table dialog', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1467
    Description: "Extended Table"  contains:
    - the "Extended Table" title;
    - "Atom Generics" section;
    - "Group Generics" section with "Acyclic" and "Cyclic" sections;
    - "Special Nodes" section;
    - "Cancel" and "Add" buttons are at the right bottom corner of the window: "Cancel" is always active, "Add" becomes active when any symbol is selected;
    - "x" button is at the top right corner of the window.
    */
    const extendedTableButton = rightToolbar(page).extendedTableButton;

    await extendedTableButton.click();
    await takeEditorScreenshot(page);
  });

  test('Periodic table-selecting Atom in palette', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1434
    Description: Pop-up windows appear with Si element.
    After pressing 'Add' button Si element added to canvas.
    */
    await selectAtomInToolbar(AtomButton.Periodic, page);
    await page.getByRole('button', { name: 'Si 14' }).click();
    await takeEditorScreenshot(page);
    await page.getByTestId('OK').click();
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });

  test('Creating a new bond with atoms from Periodic table/Palette bar', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1450
    Description: The structure is illustrated as H3Si-SH.
    */
    const atomToolbar = rightToolbar(page);

    await atomToolbar.clickAtom(Atom.Sulfur);
    await clickInTheMiddleOfTheScreen(page);
    await atomToolbar.clickAtom(Atom.Sulfur);
    await moveMouseToTheMiddleOfTheScreen(page);
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    const coordinatesWithShift = x + MAX_BOND_LENGTH;
    await dragMouseTo(coordinatesWithShift, y, page);
    await selectAtomInToolbar(AtomButton.Periodic, page);
    await page.getByRole('button', { name: 'Si 14' }).click();
    await page.getByTestId('OK').click();
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });

  test('Creating a List from Periodic table', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1464
    Description: The selected atom symbols appear on the canvas with square brackets, for example [C, N, O].
    All listed atom symbols should be colored with black.
    */
    await selectAtomsFromPeriodicTable(page, 'List', ['Au', 'In', 'Am']);
    await clickInTheMiddleOfTheScreen(page);
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });

  test('Adding a List from Periodic table to structure', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1464
    Description: The selected atom symbols appear on structure with square brackets, for example [C, N, O].
    All listed atom symbols should be colored with black.
    */
    const anyAtom = 2;
    await openFileAndAddToCanvas('KET/simple-chain.ket', page);
    await selectAtomsFromPeriodicTable(page, 'List', ['Au', 'In', 'Am']);
    await clickOnAtom(page, 'C', anyAtom);
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });

  test('Creating a Not List from Periodic table', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1466
    Description: The selected atom symbols appear on the canvas with square brackets, for example ![C, N, O].
    All listed atom symbols should be colored with black.
    */
    await selectAtomsFromPeriodicTable(page, 'Not List', ['Ti', 'V', 'Cs']);
    await clickInTheMiddleOfTheScreen(page);
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });

  test('Adding a Not List from Periodic table to structure', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1466
    Description: The selected atom symbols appear on structure with square brackets, for example ![C, N, O].
    All listed atom symbols should be colored with black.
    */
    const anyAtom = 2;
    await openFileAndAddToCanvas('KET/simple-chain.ket', page);
    await selectAtomsFromPeriodicTable(page, 'Not List', ['V', 'Ti', 'Cs']);
    await clickOnAtom(page, 'C', anyAtom);
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });

  test('Select Generics from Extended table', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1485
    Description: The selected button is highlighted. Several dialog buttons can`t be selected.
    The "Add" button becomes enabled when any generic group is selected.
    */
    const extendedTableButton = rightToolbar(page).extendedTableButton;

    await extendedTableButton.click();
    await page.getByRole('button', { name: 'AH', exact: true }).click();
    await takeEditorScreenshot(page);
  });

  test('Manipulation with structures with different atoms, List/Not List and Generic Group - Move whole structure', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1527
    Description: The whole structure is moved.
    */
    const x = 300;
    const y = 300;
    await openFileAndAddToCanvas(
      'Molfiles-V2000/structure-list-notlist.mol',
      page,
    );
    await selectAllStructuresOnCanvas(page);
    await moveOnAtom(page, 'C', 0);
    await dragMouseTo(x, y, page);
    await takeEditorScreenshot(page);
  });

  test('Delete Generic atom from structure', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1527
    Description: AH Generic is deleted from structure.
    */
    await openFileAndAddToCanvas(
      'Molfiles-V2000/structure-list-notlist.mol',
      page,
    );
    await selectEraseTool(page);
    await page.getByText('AH').click();
    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Erase part of structure with List/Not List and Generic Group', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1527
    Description: Part of structure with List/Not List and Generic Group is deleted.
    */
    await openFileAndAddToCanvas(
      'Molfiles-V2000/structure-list-notlist.mol',
      page,
    );
    await selectPartOfMolecules(page);
    await await selectEraseTool(page);
    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Zoom In and Zoom Out of structure with List/Not List and Generic Group', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1527
    Description: Structure with List/Not List and Generic Group is Zoom In and Zoom Out.
    */
    const numberOfPressZoomOut = 5;
    const numberOfPressZoomIn = 5;
    await openFileAndAddToCanvas(
      'Molfiles-V2000/structure-list-notlist.mol',
      page,
    );
    for (let i = 0; i < numberOfPressZoomOut; i++) {
      await waitForRender(page, async () => {
        await page.keyboard.press('Control+_');
      });
    }

    await takeEditorScreenshot(page);

    for (let i = 0; i < numberOfPressZoomIn; i++) {
      await ZoomInByKeyboard(page);
    }
    await takeEditorScreenshot(page);
  });

  test('Copy and paste structure with List/Not List and Generic Group', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1528
    Description: Structure with List/Not List and Generic Group is copy and pasted.
    */
    const x = 300;
    const y = 300;
    await openFileAndAddToCanvas(
      'Molfiles-V2000/structure-list-notlist.mol',
      page,
    );
    await copyAndPaste(page);
    await clickOnCanvas(page, x, y);
    await takeEditorScreenshot(page);
  });

  test('Cut and paste structure with List/Not List and Generic Group', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1528
    Description: Structure with List/Not List and Generic Group is cut and pasted.
    */
    const x = 300;
    const y = 300;
    await openFileAndAddToCanvas(
      'Molfiles-V2000/structure-list-notlist.mol',
      page,
    );
    await cutAndPaste(page);
    await clickOnCanvas(page, x, y);
    await takeEditorScreenshot(page);
  });

  test('Drag and drop Bromine atom on Benzene ring-Merging atom-to-atom', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1581
      Description: when drag & drop an atom on an atom it should replace it
    */
    const atomToolbar = rightToolbar(page);

    await drawBenzeneRing(page);

    const { x, y } = await getCoordinatesTopAtomOfBenzeneRing(page);
    const bromineCoordinates = { x: x + X_DELTA_ONE, y };

    await atomToolbar.clickAtom(Atom.Bromine);
    await clickOnCanvas(page, bromineCoordinates.x, bromineCoordinates.y);

    await selectAreaSelectionTool(page, SelectionToolType.Rectangle);
    await page.mouse.move(bromineCoordinates.x, bromineCoordinates.y);
    await dragMouseTo(x, y, page);
    await takeEditorScreenshot(page);
  });

  test('Colored atoms - save as mol-file and render', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1533
    Description: Structure is represented with correctly colored atoms.
    */
    await openFileAndAddToCanvas(
      'Molfiles-V2000/chain-with-colored-atoms.mol',
      page,
    );
    await verifyFileExport(
      page,
      'Molfiles-V2000/chain-with-colored-atoms-expected.mol',
      FileType.MOL,
      'v2000',
    );
    await takeEditorScreenshot(page);
  });

  test('Colored atoms - save as rxn-file and render', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1534
    Description: Structure is represented with correctly colored atoms.
    */
    await openFileAndAddToCanvas(
      'Rxn-V2000/reaction-with-colored-atoms.rxn',
      page,
    );
    await verifyFileExport(
      page,
      'Rxn-V2000/reaction-with-colored-atoms-expected.rxn',
      FileType.RXN,
      'v2000',
    );
    await takeEditorScreenshot(page);
  });

  test('List/Not List - save as mol-file and render', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1577
    Description: The saved *.mol file is opened in Ketcher.
    Structure is represented with correct List and Not List atom symbols
    */
    await openFileAndAddToCanvas(
      'Molfiles-V2000/structure-list-notlist.mol',
      page,
    );
    await verifyFileExport(
      page,
      'Molfiles-V2000/structure-list-notlist-expected.mol',
      FileType.MOL,
      'v2000',
    );
    await takeEditorScreenshot(page);
  });

  test('List/Not List - save as rxn-file and render', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1578
    Description: The saved *.rxn file is opened in Ketcher.
    The reaction is represented with correct List and Not List atom symbols.
    */
    await openFileAndAddToCanvas('Rxn-V2000/reaction-list-notlist.rxn', page);
    await verifyFileExport(
      page,
      'Rxn-V2000/reaction-list-notlist-expected.rxn',
      FileType.RXN,
      'v2000',
    );
    await takeEditorScreenshot(page);
  });

  test('Generic Groups - save as rxn-file and render', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1580
    Description: The saved *.rxn file is opened in Ketcher.
    The reaction is represented with correct Generic Groups.
    */
    await openFileAndAddToCanvas(
      'Rxn-V2000/reaction-with-group-generics.rxn',
      page,
    );
    await verifyFileExport(
      page,
      'Rxn-V2000/reaction-with-group-generics-expected.rxn',
      FileType.RXN,
      'v2000',
    );
    await takeEditorScreenshot(page);
  });

  test('Generic Groups - save as mol-file and render', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1579
    Description: The saved *.mol file is opened in Ketcher.
    Structure is represented with correct Generic Groups
    */
    await openFileAndAddToCanvas(
      'Molfiles-V2000/chain-with-group-generics.mol',
      page,
    );
    await verifyFileExport(
      page,
      'Molfiles-V2000/chain-with-group-generics-expected.mol',
      FileType.MOL,
      'v2000',
    );
    await takeEditorScreenshot(page);
  });

  test('Select part of structure and press Atom in toolbar', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-12982
    Description: Atoms appears on selected part of structure.
    */
    const atomToolbar = rightToolbar(page);

    await openFileAndAddToCanvas('KET/simple-chain.ket', page);
    await selectPartOfMolecules(page);
    await atomToolbar.clickAtom(Atom.Oxygen);
    await takeEditorScreenshot(page);
  });

  test('Deleting an atom that is bonded to another atom not deleting second atom', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-10071
    Description: Only one atom should be removed and the other should remain
    */
    const numberOfAtom = 0;
    const atomToolbar = rightToolbar(page);

    await atomToolbar.clickAtom(Atom.Bromine);
    await clickInTheMiddleOfTheScreen(page);
    await atomToolbar.clickAtom(Atom.Nitrogen);
    await moveMouseToTheMiddleOfTheScreen(page);
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    const coordinatesWithShift = x + MAX_BOND_LENGTH;
    await dragMouseTo(coordinatesWithShift, y, page);
    await selectEraseTool(page);
    await clickOnAtom(page, 'Br', numberOfAtom);
    await takeEditorScreenshot(page);
    await pressUndoButton(page);
    await clickOnAtom(page, 'N', numberOfAtom);
    await takeEditorScreenshot(page);
  });

  test('Deleting of one middle atom from a bunch of three not deleting another two atoms', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-10072
    Description: Deleting of one middle atom from a bunch of three not deleting another two atoms
    */
    const numberOfAtom = 0;
    await openFileAndAddToCanvas('KET/three-bonded-atoms.ket', page);
    await selectEraseTool(page);
    await clickOnAtom(page, 'N', numberOfAtom);
    await takeEditorScreenshot(page);
  });
});

test.describe('Atom Tool', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Addition element buttons to right atom panel', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1435
    Description: The additional button with the selected atom symbol appears on the Atom Palette
    */
    const elementNames = ['Si', 'Au', 'In', 'Am', 'Se', 'Pu', 'Rn'];

    for (const elementName of elementNames) {
      await selectAtomInToolbar(AtomButton.Periodic, page);
      await page.click(`button[data-testid="${elementName}-button"]`);
      await page.getByTestId('OK').click();
    }

    await takeRightToolbarScreenshot(page);
  });

  test('Addition 8th element buttons to right atom panel', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1435
    Description: The first additional atom symbol is replaced with the new one.
    The 8th button isn't added. In our test 'Si' replaces by 'Db'.
    */
    const elementNames = ['Si', 'Au', 'In', 'Am', 'Se', 'Pu', 'Rn', 'Db'];

    for (const elementName of elementNames) {
      await selectAtomInToolbar(AtomButton.Periodic, page);
      await page.click(`button[data-testid="${elementName}-button"]`);
      await page.getByTestId('OK').click();
    }

    await takeRightToolbarScreenshot(page);
  });

  test('Adding to structure a new atom from Periodic table', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1443
    Description: The additional button with the selected atom symbol appears on the Atom Palette.
    Additional atom can be added to structure.
    */
    const atomToolbar = rightToolbar(page);
    const elementNames = ['Si', 'Au', 'In', 'Am', 'Se', 'Pu', 'Rn'];

    for (const elementName of elementNames) {
      await selectAtomInToolbar(AtomButton.Periodic, page);
      await page.click(`button[data-testid="${elementName}-button"]`);
      await page.getByTestId('OK').click();
    }

    const anyAtom = 0;
    await openFileAndAddToCanvas('KET/simple-chain.ket', page);
    await atomToolbar.clickAtom(Atom.Aurum);
    await clickOnAtom(page, 'C', anyAtom);
    await takeEditorScreenshot(page);
  });

  test('Click on the keyboard shortcut related to the molecule', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-5262
    Description: The selected atom appeared on the canvas
    */
    const atomShortcuts = ['a', 'q', 'r', 'k', 'm', 'x'];

    for (const labelKey of atomShortcuts) {
      await waitForRender(page, async () => {
        await clickAtomShortcut(page, labelKey);
        await resetCurrentTool(page);
        await takeEditorScreenshot(page);
      });
    }
  });

  test('Default colours of atom symbols', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1344, EPMLSOPKET-1341
    Description:
    "H" and "C" are #000000, black.
    "N" is #304FF7, blue.
    "O" is #FF0D0D, red.
    "S" is #C99A19, yellow.
    "P" is #FF8000, brick red.
    "F" is #78BC42, grass green.
    "Cl" is #1FD01F, light green.
    "Br" is #A62929, red-brown.
    "I" is #940094, purple.
    */
    await takeRightToolbarScreenshot(page);
  });

  /*
    Test case: EPMLSOPKET-1354, EPMLSOPKET-1361, EPMLSOPKET-1369, EPMLSOPKET-1370,
    EPMLSOPKET-1372, EPMLSOPKET-1373, EPMLSOPKET-1379, EPMLSOPKET-1387, EPMLSOPKET-1388, EPMLSOPKET-1402
    Description: Atom added to Benzene ring.
    */
  for (const atomName of atomsNames) {
    const anyAtom = 0;
    test(`Add ${atomName} from right toolbar to Benzene ring`, async ({
      page,
    }) => {
      await drawBenzeneRing(page);
      await selectAtomInToolbar(atomName, page);
      await clickOnAtom(page, 'C', anyAtom);
      await resetCurrentTool(page);
      await takeEditorScreenshot(page);
    });
  }
  const atomShortcuts = ['h', 'c', 'n', 'o', 's', 'p', 'f', 'b', 'i'];
  for (const atomName of atomShortcuts) {
    test(`Add ${atomName} by hotkey to Benzene ring`, async ({ page }) => {
      /*
      Test case: EPMLSOPKET-1354, EPMLSOPKET-1361, EPMLSOPKET-1369, EPMLSOPKET-1370,
      EPMLSOPKET-1372, EPMLSOPKET-1373, EPMLSOPKET-1379, EPMLSOPKET-1387, EPMLSOPKET-1388, EPMLSOPKET-1402
      Description: Atom added to Benzene ring.
      */
      const anyAtom = 2;
      await drawBenzeneRing(page);
      await resetCurrentTool(page);
      await clickOnAtom(page, 'C', anyAtom);
      await page.keyboard.press(atomName);
      await takeEditorScreenshot(page);
    });
  }

  for (const atomName of atomsNames) {
    test(`Select ${atomName} and drag on Benzene ring`, async ({ page }) => {
      /*
      Test case: EPMLSOPKET-1354, EPMLSOPKET-1361, EPMLSOPKET-1369, EPMLSOPKET-1370,
      EPMLSOPKET-1372, EPMLSOPKET-1373, EPMLSOPKET-1379, EPMLSOPKET-1387, EPMLSOPKET-1388, EPMLSOPKET-1402
      Description: Atom added to Benzene ring.
      */
      const anyAtom = 2;
      await drawBenzeneRing(page);
      await selectAtomInToolbar(atomName, page);
      await moveOnAtom(page, 'C', anyAtom);
      const { x, y } = await getCoordinatesTopAtomOfBenzeneRing(page);
      const coordinatesWithShift = y - MAX_BOND_LENGTH;
      await dragMouseTo(x, coordinatesWithShift, page);
      await takeEditorScreenshot(page);
      await pressUndoButton(page);
    });
  }
});
