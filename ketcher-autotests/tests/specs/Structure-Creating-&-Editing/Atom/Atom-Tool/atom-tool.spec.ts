/* eslint-disable @typescript-eslint/no-empty-function */
import { MAX_BOND_LENGTH } from '@constants/index';
import { test, Page, expect } from '@fixtures';
import {
  takeEditorScreenshot,
  clickInTheMiddleOfTheScreen,
  takeRightToolbarScreenshot,
  openFileAndAddToCanvas,
  clickOnAtom,
  moveMouseToTheMiddleOfTheScreen,
  getCoordinatesOfTheMiddleOfTheScreen,
  dragMouseTo,
  waitForRender,
  moveOnAtom,
  screenshotBetweenUndoRedo,
  selectPartOfMolecules,
  getCoordinatesTopAtomOfBenzeneRing,
  clickOnCanvas,
  ZoomInByKeyboard,
  ZoomOutByKeyboard,
  RxnFileFormat,
  MolFileFormat,
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
import { SelectionToolType } from '@tests/pages/constants/areaSelectionTool/Constants';
import { RightToolbar } from '@tests/pages/molecules/RightToolbar';
import { Atom } from '@tests/pages/constants/atoms/atoms';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { drawBenzeneRing } from '@tests/pages/molecules/BottomToolbar';
import {
  PeriodicTableDialog,
  selectElementFromPeriodicTable,
  selectElementsFromPeriodicTable,
} from '@tests/pages/molecules/canvas/PeriodicTableDialog';
import {
  PeriodicTableElement,
  TypeChoice,
} from '@tests/pages/constants/periodicTableDialog/Constants';
import { getAtomLocator } from '@utils/canvas/atoms/getAtomLocator/getAtomLocator';

const X_DELTA_ONE = 100;

test.describe('Atom Tool', () => {
  let page: Page;
  test.beforeAll(async ({ initMoleculesCanvas }) => {
    page = await initMoleculesCanvas();
  });
  test.afterAll(async ({ closePage }) => {
    await closePage();
  });
  test.beforeEach(async ({ MoleculesCanvas: _ }) => {});

  test('Periodic table dialog', async () => {
    /*
    Test case: EPMLSOPKET-1403
    Description: The "Periodic table" modal dialog is opened.
    Periodic table' window is closed. No symbols appear on the canvas.
    */
    await RightToolbar(page).periodicTable();
    await takeEditorScreenshot(page);
    await PeriodicTableDialog(page).cancel();
    await takeEditorScreenshot(page);
  });

  test('Extended table dialog', async () => {
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
    const extendedTableButton = RightToolbar(page).extendedTableButton;

    await extendedTableButton.click();
    await expect(RightToolbar(page).extendedTableButton).toBeEnabled();
  });

  test('Periodic table-selecting Atom in palette', async () => {
    /*
    Test case: EPMLSOPKET-1434
    Description: Pop-up windows appear with Si element.
    After pressing 'Add' button Si element added to canvas.
    */
    await selectElementFromPeriodicTable(page, PeriodicTableElement.Si);
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });

  test('Creating a new bond with atoms from Periodic table/Palette bar', async () => {
    /*
    Test case: EPMLSOPKET-1450
    Description: The structure is illustrated as H3Si-SH.
    */
    const atomToolbar = RightToolbar(page);

    await atomToolbar.clickAtom(Atom.Sulfur);
    await clickInTheMiddleOfTheScreen(page);
    await atomToolbar.clickAtom(Atom.Sulfur);
    await moveMouseToTheMiddleOfTheScreen(page);
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    const coordinatesWithShift = x + MAX_BOND_LENGTH;
    await dragMouseTo(coordinatesWithShift, y, page);
    await selectElementFromPeriodicTable(page, PeriodicTableElement.Si);
    await clickInTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });

  test('Creating a List from Periodic table', async () => {
    /*
    Test case: EPMLSOPKET-1464
    Description: The selected atom symbols appear on the canvas with square brackets, for example [C, N, O].
    All listed atom symbols should be colored with black.
    */
    await selectElementsFromPeriodicTable(page, TypeChoice.List, [
      PeriodicTableElement.Au,
      PeriodicTableElement.In,
      PeriodicTableElement.Am,
    ]);
    await clickInTheMiddleOfTheScreen(page);
    await CommonLeftToolbar(page).selectAreaSelectionTool();
    await takeEditorScreenshot(page);
  });

  test('Adding a List from Periodic table to structure', async () => {
    /*
    Test case: EPMLSOPKET-1464
    Description: The selected atom symbols appear on structure with square brackets, for example [C, N, O].
    All listed atom symbols should be colored with black.
    */
    const anyAtom = 2;
    await openFileAndAddToCanvas(page, 'KET/simple-chain.ket');
    await selectElementsFromPeriodicTable(page, TypeChoice.List, [
      PeriodicTableElement.Au,
      PeriodicTableElement.In,
      PeriodicTableElement.Am,
    ]);
    await clickOnAtom(page, 'C', anyAtom);
    await CommonLeftToolbar(page).selectAreaSelectionTool();
    await takeEditorScreenshot(page);
  });

  test('Creating a Not List from Periodic table', async () => {
    /*
    Test case: EPMLSOPKET-1466
    Description: The selected atom symbols appear on the canvas with square brackets, for example ![C, N, O].
    All listed atom symbols should be colored with black.
    */
    await selectElementsFromPeriodicTable(page, TypeChoice.NotList, [
      PeriodicTableElement.Ti,
      PeriodicTableElement.V,
      PeriodicTableElement.Cs,
    ]);
    await clickInTheMiddleOfTheScreen(page);
    await CommonLeftToolbar(page).selectAreaSelectionTool();
    await takeEditorScreenshot(page);
  });

  test('Adding a Not List from Periodic table to structure', async () => {
    /*
    Test case: EPMLSOPKET-1466
    Description: The selected atom symbols appear on structure with square brackets, for example ![C, N, O].
    All listed atom symbols should be colored with black.
    */
    const anyAtom = 2;
    await openFileAndAddToCanvas(page, 'KET/simple-chain.ket');
    await selectElementsFromPeriodicTable(page, TypeChoice.NotList, [
      PeriodicTableElement.V,
      PeriodicTableElement.Ti,
      PeriodicTableElement.Cs,
    ]);
    await clickOnAtom(page, 'C', anyAtom);
    await CommonLeftToolbar(page).selectAreaSelectionTool();
    await takeEditorScreenshot(page);
  });

  test('Select Generics from Extended table', async () => {
    /*
    Test case: EPMLSOPKET-1485
    Description: The selected button is highlighted. Several dialog buttons can`t be selected.
    The "Add" button becomes enabled when any generic group is selected.
    */
    const extendedTableButton = RightToolbar(page).extendedTableButton;

    await extendedTableButton.click();
    await page.getByRole('button', { name: 'AH', exact: true }).click();
    await takeEditorScreenshot(page);
  });

  test('Manipulation with structures with different atoms, List/Not List and Generic Group - Move whole structure', async () => {
    /*
    Test case: EPMLSOPKET-1527
    Description: The whole structure is moved.
    */
    const x = 300;
    const y = 300;
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/structure-list-notlist.mol',
    );
    await selectAllStructuresOnCanvas(page);
    await moveOnAtom(page, 'C', 0);
    await dragMouseTo(x, y, page);
    await takeEditorScreenshot(page);
  });

  test('Delete Generic atom from structure', async () => {
    /*
    Test case: EPMLSOPKET-1527
    Description: AH Generic is deleted from structure.
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/structure-list-notlist.mol',
    );
    await CommonLeftToolbar(page).selectEraseTool();
    await page.getByText('AH').click();
    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Erase part of structure with List/Not List and Generic Group', async () => {
    /*
    Test case: EPMLSOPKET-1527
    Description: Part of structure with List/Not List and Generic Group is deleted.
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/structure-list-notlist.mol',
    );
    await selectPartOfMolecules(page);
    await CommonLeftToolbar(page).selectEraseTool();
    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Zoom In and Zoom Out of structure with List/Not List and Generic Group', async () => {
    /*
    Test case: EPMLSOPKET-1527
    Description: Structure with List/Not List and Generic Group is Zoom In and Zoom Out.
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/structure-list-notlist.mol',
    );
    await ZoomOutByKeyboard(page, { repeat: 5 });

    await takeEditorScreenshot(page);

    await ZoomInByKeyboard(page, { repeat: 5 });
    await takeEditorScreenshot(page);
  });

  test('Copy and paste structure with List/Not List and Generic Group', async () => {
    /*
    Test case: EPMLSOPKET-1528
    Description: Structure with List/Not List and Generic Group is copy and pasted.
    */
    const x = 300;
    const y = 300;
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/structure-list-notlist.mol',
    );
    await copyAndPaste(page);
    await clickOnCanvas(page, x, y, { from: 'pageTopLeft' });
    await takeEditorScreenshot(page);
  });

  test('Cut and paste structure with List/Not List and Generic Group', async () => {
    /*
    Test case: EPMLSOPKET-1528
    Description: Structure with List/Not List and Generic Group is cut and pasted.
    */
    const x = 300;
    const y = 300;
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/structure-list-notlist.mol',
    );
    await cutAndPaste(page);
    await clickOnCanvas(page, x, y, { from: 'pageTopLeft' });
    await takeEditorScreenshot(page);
  });

  test('Drag and drop Bromine atom on Benzene ring-Merging atom-to-atom', async () => {
    /*
      Test case: EPMLSOPKET-1581
      Description: when drag & drop an atom on an atom it should replace it
    */
    const atomToolbar = RightToolbar(page);

    await drawBenzeneRing(page);

    const { x, y } = await getCoordinatesTopAtomOfBenzeneRing(page);
    const bromineCoordinates = { x: x + X_DELTA_ONE, y };

    await atomToolbar.clickAtom(Atom.Bromine);
    await clickOnCanvas(page, bromineCoordinates.x, bromineCoordinates.y, {
      from: 'pageTopLeft',
    });

    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await page.mouse.move(bromineCoordinates.x, bromineCoordinates.y);
    await dragMouseTo(x, y, page);
    await takeEditorScreenshot(page);
  });

  test('Colored atoms - save as mol-file and render', async () => {
    /*
    Test case: EPMLSOPKET-1533
    Description: Structure is represented with correctly colored atoms.
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/chain-with-colored-atoms.mol',
    );
    await verifyFileExport(
      page,
      'Molfiles-V2000/chain-with-colored-atoms-expected.mol',
      FileType.MOL,
      MolFileFormat.v2000,
    );
    await takeEditorScreenshot(page);
  });

  test('Colored atoms - save as rxn-file and render', async () => {
    /*
    Test case: EPMLSOPKET-1534
    Description: Structure is represented with correctly colored atoms.
    */
    await openFileAndAddToCanvas(
      page,
      'Rxn-V2000/reaction-with-colored-atoms.rxn',
    );
    await verifyFileExport(
      page,
      'Rxn-V2000/reaction-with-colored-atoms-expected.rxn',
      FileType.RXN,
      RxnFileFormat.v2000,
    );
    await takeEditorScreenshot(page);
  });

  test('List/Not List - save as mol-file and render', async () => {
    /*
    Test case: EPMLSOPKET-1577
    Description: The saved *.mol file is opened in Ketcher.
    Structure is represented with correct List and Not List atom symbols
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/structure-list-notlist.mol',
    );
    await verifyFileExport(
      page,
      'Molfiles-V2000/structure-list-notlist-expected.mol',
      FileType.MOL,
      MolFileFormat.v2000,
    );
    await takeEditorScreenshot(page);
  });

  test('List/Not List - save as rxn-file and render', async () => {
    /*
    Test case: EPMLSOPKET-1578
    Description: The saved *.rxn file is opened in Ketcher.
    The reaction is represented with correct List and Not List atom symbols.
    */
    await openFileAndAddToCanvas(page, 'Rxn-V2000/reaction-list-notlist.rxn');
    await verifyFileExport(
      page,
      'Rxn-V2000/reaction-list-notlist-expected.rxn',
      FileType.RXN,
      RxnFileFormat.v2000,
    );
    await takeEditorScreenshot(page);
  });

  test('Generic Groups - save as rxn-file and render', async () => {
    /*
    Test case: EPMLSOPKET-1580
    Description: The saved *.rxn file is opened in Ketcher.
    The reaction is represented with correct Generic Groups.
    */
    await openFileAndAddToCanvas(
      page,
      'Rxn-V2000/reaction-with-group-generics.rxn',
    );
    await verifyFileExport(
      page,
      'Rxn-V2000/reaction-with-group-generics-expected.rxn',
      FileType.RXN,
      RxnFileFormat.v2000,
    );
    await takeEditorScreenshot(page);
  });

  test('Generic Groups - save as mol-file and render', async () => {
    /*
    Test case: EPMLSOPKET-1579
    Description: The saved *.mol file is opened in Ketcher.
    Structure is represented with correct Generic Groups
    */
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/chain-with-group-generics.mol',
    );
    await verifyFileExport(
      page,
      'Molfiles-V2000/chain-with-group-generics-expected.mol',
      FileType.MOL,
      MolFileFormat.v2000,
    );
    await takeEditorScreenshot(page);
  });

  test('Select part of structure and press Atom in toolbar', async () => {
    /*
    Test case: EPMLSOPKET-12982
    Description: Atoms appears on selected part of structure.
    */
    const atomToolbar = RightToolbar(page);

    await openFileAndAddToCanvas(page, 'KET/simple-chain.ket');
    await selectPartOfMolecules(page);
    await atomToolbar.clickAtom(Atom.Oxygen);
    await takeEditorScreenshot(page);
  });

  test('Deleting an atom that is bonded to another atom not deleting second atom', async () => {
    /*
    Test case: EPMLSOPKET-10071
    Description: Only one atom should be removed and the other should remain
    */
    const numberOfAtom = 0;
    const atomToolbar = RightToolbar(page);

    await atomToolbar.clickAtom(Atom.Bromine);
    await clickInTheMiddleOfTheScreen(page);
    await atomToolbar.clickAtom(Atom.Nitrogen);
    await moveMouseToTheMiddleOfTheScreen(page);
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    const coordinatesWithShift = x + MAX_BOND_LENGTH;
    await dragMouseTo(coordinatesWithShift, y, page);
    await CommonLeftToolbar(page).selectEraseTool();
    await clickOnAtom(page, 'Br', numberOfAtom);
    await takeEditorScreenshot(page);
    await CommonTopLeftToolbar(page).undo();
    await clickOnAtom(page, 'N', numberOfAtom);
    await takeEditorScreenshot(page);
  });

  test('Deleting of one middle atom from a bunch of three not deleting another two atoms', async () => {
    /*
    Test case: EPMLSOPKET-10072
    Description: Deleting of one middle atom from a bunch of three not deleting another two atoms
    */
    const numberOfAtom = 0;
    await openFileAndAddToCanvas(page, 'KET/three-bonded-atoms.ket');
    await CommonLeftToolbar(page).selectEraseTool();
    await clickOnAtom(page, 'N', numberOfAtom);
    await takeEditorScreenshot(page);
  });
});

test.describe('Atom Tool', () => {
  let page: Page;
  test.beforeAll(async ({ initMoleculesCanvas }) => {
    page = await initMoleculesCanvas();
  });
  test.afterAll(async ({ closePage }) => {
    await closePage();
  });
  test.beforeEach(async ({ MoleculesCanvas: _ }) => {});

  test('Addition element buttons to right atom panel', async () => {
    /*
    Test case: EPMLSOPKET-1435
    Description: The additional button with the selected atom symbol appears on the Atom Palette
    */
    const elementNames = [
      PeriodicTableElement.Si,
      PeriodicTableElement.Au,
      PeriodicTableElement.In,
      PeriodicTableElement.Am,
      PeriodicTableElement.Se,
      PeriodicTableElement.Pu,
      PeriodicTableElement.Rn,
    ];

    for (const elementName of elementNames) {
      await selectElementFromPeriodicTable(page, elementName);
    }
    await takeRightToolbarScreenshot(page);
  });

  test('Addition 8th element buttons to right atom panel', async () => {
    /*
    Test case: EPMLSOPKET-1435
    Description: The first additional atom symbol is replaced with the new one.
    The 8th button isn't added. In our test 'Si' replaces by 'Db'.
    */
    const elementNames = [
      PeriodicTableElement.Si,
      PeriodicTableElement.Au,
      PeriodicTableElement.In,
      PeriodicTableElement.Am,
      PeriodicTableElement.Se,
      PeriodicTableElement.Pu,
      PeriodicTableElement.Rn,
      PeriodicTableElement.Db,
    ];

    for (const elementName of elementNames) {
      await selectElementFromPeriodicTable(page, elementName);
    }

    await takeRightToolbarScreenshot(page);
  });

  test('Adding to structure a new atom from Periodic table', async () => {
    /*
    Test case: EPMLSOPKET-1443
    Description: The additional button with the selected atom symbol appears on the Atom Palette.
    Additional atom can be added to structure.
    */
    const elementNames = [
      PeriodicTableElement.Si,
      PeriodicTableElement.Au,
      PeriodicTableElement.In,
      PeriodicTableElement.Am,
      PeriodicTableElement.Se,
      PeriodicTableElement.Pu,
      PeriodicTableElement.Rn,
    ];

    for (const elementName of elementNames) {
      await selectElementFromPeriodicTable(page, elementName);
    }

    const anyAtom = 0;
    await openFileAndAddToCanvas(page, 'KET/simple-chain.ket');
    await RightToolbar(page).clickAtom(Atom.Aurum);
    await clickOnAtom(page, 'C', anyAtom);
    await takeEditorScreenshot(page);
  });

  test('Click on the keyboard shortcut related to the molecule', async () => {
    /*
    Test case: EPMLSOPKET-5262
    Description: The selected atom appeared on the canvas
    */
    const atomShortcuts = ['A', 'Q', 'R', 'K', 'M', 'X'];

    for (const labelKey of atomShortcuts) {
      await waitForRender(page, async () => {
        await page.keyboard.press(labelKey);
        await clickInTheMiddleOfTheScreen(page);
        await CommonLeftToolbar(page).selectAreaSelectionTool();
        const atom = getAtomLocator(page, { atomLabel: labelKey });
        expect(await atom.count()).toEqual(1);
        await CommonTopLeftToolbar(page).clearCanvas();
        await clickInTheMiddleOfTheScreen(page);
      });
    }
  });

  test('Default colours of atom symbols', async () => {
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
  const atomsNames: Atom[] = [
    Atom.Hydrogen,
    Atom.Carbon,
    Atom.Nitrogen,
    Atom.Oxygen,
    Atom.Sulfur,
    Atom.Phosphorus,
    Atom.Fluorine,
    Atom.Chlorine,
    Atom.Bromine,
    Atom.Iodine,
  ];

  for (const atomName of atomsNames) {
    const anyAtom = 0;
    test(`Add ${atomName} from right toolbar to Benzene ring`, async () => {
      const atomToolbar = RightToolbar(page);

      await drawBenzeneRing(page);
      await atomToolbar.clickAtom(atomName);
      await clickOnAtom(page, 'C', anyAtom);
      await CommonLeftToolbar(page).selectAreaSelectionTool();
      await takeEditorScreenshot(page);
    });
  }
  const atomShortcuts = ['h', 'c', 'n', 'o', 's', 'p', 'f', 'b', 'i'];
  for (const atomName of atomShortcuts) {
    test(`Add ${atomName} by hotkey to Benzene ring`, async () => {
      /*
      Test case: EPMLSOPKET-1354, EPMLSOPKET-1361, EPMLSOPKET-1369, EPMLSOPKET-1370,
      EPMLSOPKET-1372, EPMLSOPKET-1373, EPMLSOPKET-1379, EPMLSOPKET-1387, EPMLSOPKET-1388, EPMLSOPKET-1402
      Description: Atom added to Benzene ring.
      */
      const anyAtom = 2;
      await drawBenzeneRing(page);
      await CommonLeftToolbar(page).selectAreaSelectionTool();
      await clickOnAtom(page, 'C', anyAtom);
      await page.keyboard.press(atomName);
      await takeEditorScreenshot(page);
    });
  }

  for (const atomName of atomsNames) {
    test(`Select ${
      Object.entries(Atom).find(([, value]) => value === atomName)?.[0]
    } and drag on Benzene ring`, async () => {
      /*
      Test case: EPMLSOPKET-1354, EPMLSOPKET-1361, EPMLSOPKET-1369, EPMLSOPKET-1370,
      EPMLSOPKET-1372, EPMLSOPKET-1373, EPMLSOPKET-1379, EPMLSOPKET-1387, EPMLSOPKET-1388, EPMLSOPKET-1402
      Description: Atom added to Benzene ring.
      */
      const anyAtom = 2;
      const atomToolbar = RightToolbar(page);

      await drawBenzeneRing(page);
      await atomToolbar.clickAtom(atomName);
      await moveOnAtom(page, 'C', anyAtom);
      const { x, y } = await getCoordinatesTopAtomOfBenzeneRing(page);
      const coordinatesWithShift = y - MAX_BOND_LENGTH;
      await dragMouseTo(x, coordinatesWithShift, page);
      await takeEditorScreenshot(page);
      await CommonTopLeftToolbar(page).undo();
    });
  }
});
