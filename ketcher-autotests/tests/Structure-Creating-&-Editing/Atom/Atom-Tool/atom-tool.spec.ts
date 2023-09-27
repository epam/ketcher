import { MAX_BOND_LENGTH } from '@constants/index';
import { test, expect, Page } from '@playwright/test';
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
  selectEraseTool,
  screenshotBetweenUndoRedo,
  selectPartOfMolecules,
  copyAndPaste,
  cutAndPaste,
  saveToFile,
  receiveFileComparisonData,
  selectLeftPanelButton,
  LeftPanelButton,
  selectTopPanelButton,
  TopPanelButton,
} from '@utils';
import { getMolfile, getRxn } from '@utils/formats';

async function clickAtomShortcut(page: Page, labelKey: string) {
  await waitForRender(page, async () => {
    await page.keyboard.press(labelKey);
  });
  await waitForRender(page, async () => {
    await clickInTheMiddleOfTheScreen(page);
  });
}

test.describe('Atom Tool', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
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
    await page.getByTestId('extended-table').click();
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
  });

  test('Creating a new bond with atoms from Periodic table/Palette bar', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-1450
    Description: The structure is illustrated as H3Si-SH.
    For now it is working incorrect https://github.com/epam/ketcher/issues/3362
    */
    await selectAtomInToolbar(AtomButton.Sulfur, page);
    await clickInTheMiddleOfTheScreen(page);
    await selectAtomInToolbar(AtomButton.Sulfur, page);
    await moveMouseToTheMiddleOfTheScreen(page);
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    const coordinatesWithShift = x + MAX_BOND_LENGTH;
    await dragMouseTo(coordinatesWithShift, y, page);
    await selectAtomInToolbar(AtomButton.Periodic, page);
    await page.getByRole('button', { name: 'Si 14' }).click();
    await page.getByTestId('OK').click();
    await waitForRender(page, async () => {
      await clickInTheMiddleOfTheScreen(page);
    });
  });

  test('Creating a List from Periodic table', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1464
    Description: The selected atom symbols appear on the canvas with square brackets, for example [C, N, O]. 
    All listed atom symbols should be colored with black.
    */
    await selectAtomsFromPeriodicTable(page, 'List', [
      'Au 79',
      'In 49',
      'Am 95',
    ]);
    await clickInTheMiddleOfTheScreen(page);
    await resetCurrentTool(page);
  });

  test('Adding a List from Periodic table to structure', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1464
    Description: The selected atom symbols appear on structure with square brackets, for example [C, N, O]. 
    All listed atom symbols should be colored with black.
    */
    const anyAtom = 2;
    await openFileAndAddToCanvas('KET/simple-chain.ket', page);
    await selectAtomsFromPeriodicTable(page, 'List', [
      'Au 79',
      'In 49',
      'Am 95',
    ]);
    await clickOnAtom(page, 'C', anyAtom);
    await resetCurrentTool(page);
  });

  test('Creating a Not List from Periodic table', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1466
    Description: The selected atom symbols appear on the canvas with square brackets, for example ![C, N, O]. 
    All listed atom symbols should be colored with black.
    */
    await selectAtomsFromPeriodicTable(page, 'Not List', [
      'Ti 22',
      'V 23',
      'Cs 55',
    ]);
    await clickInTheMiddleOfTheScreen(page);
    await resetCurrentTool(page);
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
    await selectAtomsFromPeriodicTable(page, 'Not List', [
      'V 23',
      'Ti 22',
      'Cs 55',
    ]);
    await clickOnAtom(page, 'C', anyAtom);
    await resetCurrentTool(page);
  });

  test('Select Generics from Extended table', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1485
    Description: The selected button is highlighted. Several dialog buttons can`t be selected. 
    The "Add" button becomes enabled when any generic group is selected.
    */
    await page.getByTestId('extended-table').click();
    await page.getByRole('button', { name: 'AH', exact: true }).click();
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
    await page.keyboard.press('Control+a');
    await moveOnAtom(page, 'C', 0);
    await dragMouseTo(x, y, page);
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
    await waitForRender(page, async () => {
      await page.getByTestId('erase').click();
    });
    await screenshotBetweenUndoRedo(page);
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
      await waitForRender(page, async () => {
        await page.keyboard.press('Control+=');
      });
    }
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
    await page.mouse.click(x, y);
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
    await page.mouse.click(x, y);
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
    const expectedFile = await getMolfile(page, 'v2000');
    await saveToFile(
      'Molfiles-V2000/chain-with-colored-atoms-expected.mol',
      expectedFile,
    );

    const METADATA_STRING_INDEX = [1];
    const { fileExpected: molFileExpected, file: molFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/Molfiles-V2000/chain-with-colored-atoms-expected.mol',
        fileFormat: 'v2000',
        metaDataIndexes: METADATA_STRING_INDEX,
      });

    expect(molFile).toEqual(molFileExpected);
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
    const expectedFile = await getRxn(page, 'v2000');
    await saveToFile(
      'Rxn-V2000/reaction-with-colored-atoms-expected.rxn',
      expectedFile,
    );
    // eslint-disable-next-line no-magic-numbers
    const METADATA_STRING_INDEX = [2, 7, 30];
    const { fileExpected: rxnFileExpected, file: rxnFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/Rxn-V2000/reaction-with-colored-atoms-expected.rxn',
        fileFormat: 'v2000',
        metaDataIndexes: METADATA_STRING_INDEX,
      });

    expect(rxnFile).toEqual(rxnFileExpected);
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
    const expectedFile = await getMolfile(page, 'v2000');
    await saveToFile(
      'Molfiles-V2000/structure-list-notlist-expected.mol',
      expectedFile,
    );

    const METADATA_STRING_INDEX = [1];
    const { fileExpected: molFileExpected, file: molFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/Molfiles-V2000/structure-list-notlist-expected.mol',
        fileFormat: 'v2000',
        metaDataIndexes: METADATA_STRING_INDEX,
      });

    expect(molFile).toEqual(molFileExpected);
  });

  test('List/Not List - save as rxn-file and render', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1578
    Description: The saved *.rxn file is opened in Ketcher. 
    The reaction is represented with correct List and Not List atom symbols.
    */
    await openFileAndAddToCanvas('Rxn-V2000/reaction-list-notlist.rxn', page);
    const expectedFile = await getRxn(page, 'v2000');
    await saveToFile(
      'Rxn-V2000/reaction-list-notlist-expected.rxn',
      expectedFile,
    );
    // eslint-disable-next-line no-magic-numbers
    const METADATA_STRING_INDEX = [2, 7, 32];
    const { fileExpected: rxnFileExpected, file: rxnFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/Rxn-V2000/reaction-list-notlist-expected.rxn',
        fileFormat: 'v2000',
        metaDataIndexes: METADATA_STRING_INDEX,
      });

    expect(rxnFile).toEqual(rxnFileExpected);
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
    const expectedFile = await getRxn(page, 'v2000');
    await saveToFile(
      'Rxn-V2000/reaction-with-group-generics-expected.rxn',
      expectedFile,
    );
    // eslint-disable-next-line no-magic-numbers
    const METADATA_STRING_INDEX = [2, 7, 30];
    const { fileExpected: rxnFileExpected, file: rxnFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/Rxn-V2000/reaction-with-group-generics-expected.rxn',
        fileFormat: 'v2000',
        metaDataIndexes: METADATA_STRING_INDEX,
      });

    expect(rxnFile).toEqual(rxnFileExpected);
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
    const expectedFile = await getMolfile(page, 'v2000');
    await saveToFile(
      'Molfiles-V2000/chain-with-group-generics-expected.mol',
      expectedFile,
    );

    const METADATA_STRING_INDEX = [1];
    const { fileExpected: molFileExpected, file: molFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/Molfiles-V2000/chain-with-group-generics-expected.mol',
        fileFormat: 'v2000',
        metaDataIndexes: METADATA_STRING_INDEX,
      });

    expect(molFile).toEqual(molFileExpected);
  });

  test('Select part of structure and press Atom in toolbar', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-12982
    Description: Atoms appears on selected part of structure.
    */
    await openFileAndAddToCanvas('KET/simple-chain.ket', page);
    await selectPartOfMolecules(page);
    await selectAtomInToolbar(AtomButton.Oxygen, page);
  });

  test('Deleting an atom that is bonded to another atom not deleting second atom', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-10071
    Description: Only one atom should be removed and the other should remain
    */
    const numberOfAtom = 0;
    await selectAtomInToolbar(AtomButton.Bromine, page);
    await clickInTheMiddleOfTheScreen(page);
    await selectAtomInToolbar(AtomButton.Nitrogen, page);
    await moveMouseToTheMiddleOfTheScreen(page);
    const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
    const coordinatesWithShift = x + MAX_BOND_LENGTH;
    await dragMouseTo(coordinatesWithShift, y, page);
    await selectLeftPanelButton(LeftPanelButton.Erase, page);
    await clickOnAtom(page, 'Br', numberOfAtom);
    await takeEditorScreenshot(page);
    await selectTopPanelButton(TopPanelButton.Undo, page);
    await clickOnAtom(page, 'N', numberOfAtom);
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
    await selectLeftPanelButton(LeftPanelButton.Erase, page);
    await clickOnAtom(page, 'N', numberOfAtom);
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
    const elementNames = [
      'Si 14',
      'Au 79',
      'In 49',
      'Am 95',
      'Se 34',
      'Pu 94',
      'Rn 86',
    ];

    for (const elementName of elementNames) {
      await selectAtomInToolbar(AtomButton.Periodic, page);
      await page.getByRole('button', { name: elementName }).click();
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
    const elementNames = [
      'Si 14',
      'Au 79',
      'In 49',
      'Am 95',
      'Se 34',
      'Pu 94',
      'Rn 86',
      'Db 105',
    ];

    for (const elementName of elementNames) {
      await selectAtomInToolbar(AtomButton.Periodic, page);
      await page.getByRole('button', { name: elementName }).click();
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
    const elementNames = [
      'Si 14',
      'Au 79',
      'In 49',
      'Am 95',
      'Se 34',
      'Pu 94',
      'Rn 86',
    ];

    for (const elementName of elementNames) {
      await selectAtomInToolbar(AtomButton.Periodic, page);
      await page.getByRole('button', { name: elementName }).click();
      await page.getByTestId('OK').click();
    }

    const anyAtom = 0;
    await openFileAndAddToCanvas('KET/simple-chain.ket', page);
    await selectAtomInToolbar(AtomButton.Gold, page);
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
      await clickAtomShortcut(page, labelKey);
      await resetCurrentTool(page);
      await takeEditorScreenshot(page);
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
});
