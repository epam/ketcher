/* eslint-disable no-self-compare */
/* eslint-disable max-len */
/* eslint-disable no-magic-numbers */
import {
  chooseFileFormat,
  chooseTab,
  Tabs,
  turnOnMacromoleculesEditor,
  turnOnMicromoleculesEditor,
} from '@utils/macromolecules';
import { Page, test } from '@playwright/test';
import {
  takeEditorScreenshot,
  openFileAndAddToCanvasAsNewProject,
  selectClearCanvasTool,
  waitForPageInit,
  selectEraseTool,
  TopPanelButton,
  selectTopPanelButton,
  pressButton,
  selectAllStructuresOnCanvas,
  cutToClipboardByKeyboard,
  pasteFromClipboardByKeyboard,
  moveMouseToTheMiddleOfTheScreen,
  selectSnakeLayoutModeTool,
  selectSequenceLayoutModeTool,
  selectFlexLayoutModeTool,
  selectRectangleSelectionTool,
  dragMouseTo,
} from '@utils';
import {
  BondType,
  BondStereo,
  clickOnMicroBondByIndex,
  getBondLocator,
} from '@utils/macromolecules/polymerBond';
import {
  FileType,
  verifyFileExport,
} from '@utils/files/receiveFileComparisonData';
import { closeErrorMessage } from '@utils/common/helpers';
import {
  pressRedoButton,
  pressUndoButton,
} from '@utils/macromolecules/topToolBar';

let page: Page;

async function configureInitialState(page: Page) {
  await chooseTab(page, Tabs.Rna);
}

test.beforeAll(async ({ browser }) => {
  const context = await browser.newContext();
  page = await context.newPage();

  await waitForPageInit(page);
  await turnOnMacromoleculesEditor(page);
  await configureInitialState(page);
});

test.afterEach(async () => {
  await selectClearCanvasTool(page);
});

test.afterAll(async ({ browser }) => {
  await Promise.all(browser.contexts().map((context) => context.close()));
});

test(`Verify that bond lines between atoms do not overlap in any angle in macro mode`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/5960
   * Description: Verify that bond lines between atoms do not overlap in any angle in macro mode
   *
   * Case: 1. Load ket file with structures
   *       2. Take screenshot to witness canvas was rendered correct
   */
  await openFileAndAddToCanvasAsNewProject(
    'KET/Micro-Macro-Switcher/Micro bonds on macro canvas.ket',
    page,
  );
  await takeEditorScreenshot(page);

  // Test should be skipped if related bug exists
  test.fixme(
    true === true,
    `That test results are wrong because of https://github.com/epam/ketcher/issues/5961 issue(s).`,
  );
});

test(`Verify that connections between monomers and molecules are maintained correctly in both micro and macro modes`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/5960
   * Description: Verify that connections between monomers and molecules are maintained correctly in both micro and macro modes
   *
   * Case: 1. Load ket file with structures
   *       2. Take screenshot to witness canvas was rendered correct at macro
   *       3. Switch to Micromolecules mode
   *       4. Take screenshot to witness canvas was rendered correct at micro
   */
  await openFileAndAddToCanvasAsNewProject(
    'KET/Micro-Macro-Switcher/All type of monomers connected to micro.ket',
    page,
  );
  await takeEditorScreenshot(page);

  await turnOnMicromoleculesEditor(page);
  await takeEditorScreenshot(page);

  await turnOnMacromoleculesEditor(page);
});

test(`Verify that switching between micro and macro modes displays molecules without structural changes`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/5960
   * Description: Verify that switching between micro and macro modes displays molecules without structural changes
   *
   * Case: 1. Load ket file with structures at Macro
   *       2. Take screenshot to witness canvas was rendered correct at macro
   *       3. Switch to Micromolecules mode
   *       4. Take screenshot to witness canvas was rendered correct at micro
   *       Canvases should be equal
   */
  await turnOnMicromoleculesEditor(page);
  await openFileAndAddToCanvasAsNewProject(
    'KET/Micro-Macro-Switcher/Complicated structures on the canvas.ket',
    page,
  );
  await takeEditorScreenshot(page);

  await turnOnMacromoleculesEditor(page);
  await takeEditorScreenshot(page);
});

test(`Verify that deleting a bond in macro mode removes the bond while maintaining the integrity of the surrounding structure`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/5960
   * Description: Verify that deleting a bond in macro mode removes the bond while maintaining the integrity of the surrounding structure
   *
   * Case: 1. Load ket file with structures at Macro
   *       2. Take screenshot to witness initial state
   *       3. Delete all bonds at the center of every molecule
   *       4. Take screenshot to witness final state
   */
  await openFileAndAddToCanvasAsNewProject(
    'KET/Micro-Macro-Switcher/All Bonds on Macro.ket',
    page,
  );
  await takeEditorScreenshot(page);

  await selectEraseTool(page);
  // removing single bond
  await clickOnMicroBondByIndex(page, 39);
  // removing double bond
  await clickOnMicroBondByIndex(page, 45);
  // removing single up bond
  await clickOnMicroBondByIndex(page, 51);
  // removing single down bond
  await clickOnMicroBondByIndex(page, 51);

  await takeEditorScreenshot(page);
});

test(`Verify that all 16 bond types are displayed correctly in macromolecules mode`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/6318
   * Description: Verify that all 16 bond types are displayed correctly in macromolecules mode
   *
   * Case: 1. Load ket file with 16 bonds at Macro
   *       2. Take screenshot to witness initial state
   * IMPORTANT: Screenshots are not quite correct because of the bugs:
   * https://github.com/epam/ketcher/issues/6234,
   * https://github.com/epam/ketcher/issues/6236
   * Will require to update screens after fix
   */
  await openFileAndAddToCanvasAsNewProject(
    'KET/Micro-Macro-Switcher/All 16 types of bonds.ket',
    page,
  );
  await takeEditorScreenshot(page);
});

test(`Verify that small molecules with any bond type retain their representation when switching from molecules mode to macromolecules mode`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/6318
   * Description: Verify that small molecules with any bond type retain their representation
   *              when switching from molecules mode to macromolecules mode
   *
   * Case: 1. Load ket file with 16 bonds at Micro
   *       2. Take screenshot to witness initial state
   *       3. Switch to Macro
   *       4. Take screenshot to witness canvas state at Macro
   *
   * IMPORTANT: Screenshots are not quite correct because of the bugs:
   * https://github.com/epam/ketcher/issues/6234,
   * https://github.com/epam/ketcher/issues/6236
   * Will require to update screens after fix
   */
  await turnOnMicromoleculesEditor(page);
  await openFileAndAddToCanvasAsNewProject(
    'KET/Micro-Macro-Switcher/All 16 types of bonds.ket',
    page,
  );
  await takeEditorScreenshot(page);
  await turnOnMacromoleculesEditor(page);
  await takeEditorScreenshot(page);
});

test(`Verify that all 16 bond types are saved/loaded correctly in macromolecules mode in KET`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/6318
   * Description: Verify that all 16 bond types are saved/loaded correctly in macromolecules mode in KET
   *
   * Case: 1. Load ket file with 16 bonds at Micro
   *       2. Take screenshot to witness initial state
   *       3. Verify export to KET
   *       4. Load exported KET file
   *       5. Take screenshot to witness canvas state at Macro
   *
   */

  await openFileAndAddToCanvasAsNewProject(
    'KET/Micro-Macro-Switcher/All 16 types of bonds.ket',
    page,
  );
  await takeEditorScreenshot(page);

  await verifyFileExport(
    page,
    'KET/Micro-Macro-Switcher/All 16 types of bonds-expected.ket',
    FileType.KET,
  );

  await openFileAndAddToCanvasAsNewProject(
    'KET/Micro-Macro-Switcher/All 16 types of bonds-expected.ket',
    page,
  );
  await takeEditorScreenshot(page);
});

test(`Verify that all 16 bond types are saved/loaded correctly in macromolecules mode in MOL v3000`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/6318
   * Description: Verify that all 16 bond types are saved/loaded correctly in macromolecules mode in MOL v3000
   *
   * Case: 1. Load ket file with 16 bonds at Micro
   *       2. Take screenshot to witness initial state
   *       3. Verify export to MOL v3000
   *       4. Load exported MOL file
   *       5. Take screenshot to witness canvas state at Macro
   *
   */

  await openFileAndAddToCanvasAsNewProject(
    'KET/Micro-Macro-Switcher/All 16 types of bonds.ket',
    page,
  );
  await takeEditorScreenshot(page);

  await verifyFileExport(
    page,
    'KET/Micro-Macro-Switcher/All 16 types of bonds-expected.mol',
    FileType.MOL,
    'v3000',
  );

  await openFileAndAddToCanvasAsNewProject(
    'KET/Micro-Macro-Switcher/All 16 types of bonds-expected.mol',
    page,
  );
  await takeEditorScreenshot(page);
});

test(`Verify that all 16 bond types can't be saved correctly in macromolecules mode into Sequence (1-letter code)`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/6318
   * Description: Verify that all 16 bond types can't be saved correctly in macromolecules mode into Sequence (1-letter code)
   *
   * Case: 1. Load ket file with 16 bonds at Micro
   *       2. Take screenshot to witness initial state
   *       3. Save to Sequence (1-letter code)
   *       4. Take screenshot to witness error message occured
   *
   */
  await openFileAndAddToCanvasAsNewProject(
    'KET/Micro-Macro-Switcher/All 16 types of bonds.ket',
    page,
  );
  await takeEditorScreenshot(page);

  await selectTopPanelButton(TopPanelButton.Save, page);
  await chooseFileFormat(page, 'Sequence (1-letter code)');
  await takeEditorScreenshot(page);

  await closeErrorMessage(page);
  await pressButton(page, 'Cancel');
});

test(`Verify that all 16 bond types can't be saved correctly in macromolecules mode into Sequence (3-letter code)`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/6318
   * Description: Verify that all 16 bond types can't be saved correctly in macromolecules mode into Sequence (3-letter code)
   *
   * Case: 1. Load ket file with 16 bonds at Micro
   *       2. Take screenshot to witness initial state
   *       3. Save to Sequence (3-letter code)
   *       4. Take screenshot to witness error message occured
   *
   */
  await openFileAndAddToCanvasAsNewProject(
    'KET/Micro-Macro-Switcher/All 16 types of bonds.ket',
    page,
  );
  await takeEditorScreenshot(page);

  await selectTopPanelButton(TopPanelButton.Save, page);
  await chooseFileFormat(page, 'Sequence (3-letter code)');
  await takeEditorScreenshot(page);

  // await closeErrorMessage(page);
  await pressButton(page, 'Cancel');
  test.fixme(
    true,
    `Works wrong because of https://github.com/epam/ketcher/issues/6314 issue(s).
     Test should be updated after fix`,
  );
});

test(`Verify that all 16 bond types can't be saved correctly in macromolecules mode into IDT`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/6318
   * Description: Verify that all 16 bond types can't be saved correctly in macromolecules mode into IDT
   *
   * Case: 1. Load ket file with 16 bonds at Micro
   *       2. Take screenshot to witness initial state
   *       3. Save to IDT
   *       4. Take screenshot to witness error message occured
   *
   */
  await openFileAndAddToCanvasAsNewProject(
    'KET/Micro-Macro-Switcher/All 16 types of bonds.ket',
    page,
  );
  await takeEditorScreenshot(page);

  await selectTopPanelButton(TopPanelButton.Save, page);
  await chooseFileFormat(page, 'IDT');
  await takeEditorScreenshot(page);

  // await closeErrorMessage(page);
  await pressButton(page, 'Cancel');
  test.fixme(
    true,
    `Works wrong because of https://github.com/epam/ketcher/issues/6314 issue(s).
     Test should be updated after fix`,
  );
});

test(`Verify that all 16 types of bonds saved in macro mode can be opened in micro mode in MOL v3000`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/6318
   * Description: Verify that all 16 types of bonds saved in macro mode can be opened in micro mode in MOL v3000
   *
   * Case: 1. Load ket file with 16 bonds at Micro
   *       2. Take screenshot to witness initial state
   *       3. Verify export to MOL v3000
   *       4. Switch to Molecules mode
   *       4. Load exported MOL file
   *       5. Take screenshot to witness canvas state at Macro
   *
   */

  await openFileAndAddToCanvasAsNewProject(
    'KET/Micro-Macro-Switcher/All 16 types of bonds.ket',
    page,
  );
  await takeEditorScreenshot(page);

  await verifyFileExport(
    page,
    'KET/Micro-Macro-Switcher/All 16 types of bonds-expected.mol',
    FileType.MOL,
    'v3000',
  );

  await turnOnMicromoleculesEditor(page);

  await openFileAndAddToCanvasAsNewProject(
    'KET/Micro-Macro-Switcher/All 16 types of bonds-expected.mol',
    page,
  );
  await takeEditorScreenshot(page);

  await turnOnMacromoleculesEditor(page);
});

test(`Verify that switching back from macromolecules mode to molecules mode does not corrupt or change bond types`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/6318
   * Description: Verify that switching back from macromolecules mode to molecules mode does not corrupt or change bond types
   *
   * Case: 1. Load ket file with 16 bonds at Micro
   *       2. Take screenshot to witness initial state
   *       3. Switch to Macro
   *       4. Take screenshot to witness canvas state at Macro
   *       3. Switch to Micro
   *       4. Take screenshot to witness canvas state at Micro
   *
   * IMPORTANT: Screenshots are not quite correct because of the bugs:
   * https://github.com/epam/ketcher/issues/6234,
   * https://github.com/epam/ketcher/issues/6236
   * Will require to update screens after fix
   */
  await turnOnMicromoleculesEditor(page);
  await openFileAndAddToCanvasAsNewProject(
    'KET/Micro-Macro-Switcher/All 16 types of bonds.ket',
    page,
  );
  await takeEditorScreenshot(page);
  await turnOnMacromoleculesEditor(page);
  await takeEditorScreenshot(page);

  await turnOnMicromoleculesEditor(page);
  await takeEditorScreenshot(page);
});

test(`Verify that deleting a bond in macromolecules mode removes only the selected bond without affecting adjacent structures`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/6318
   * Description: Verify that deleting a bond in macromolecules mode removes only the selected bond without affecting adjacent structures
   *
   * Case:
   * 1. Load ket file with 14 bonds at Macro
   * 2. Take screenshot to witness initial state
   * 3. Delete every bond one by one and take screenshot after each deletion
   */
  await openFileAndAddToCanvasAsNewProject(
    'KET/Micro-Macro-Switcher/Deleting a bonds in macromolecules mode test.ket',
    page,
  );
  await selectEraseTool(page);

  const bondsToDelete = [
    { bondType: BondType.Single, bondStereo: BondStereo.None, bondId: 137 },
    { bondType: BondType.Double, bondStereo: BondStereo.None },
    { bondType: BondType.Triple },
    { bondType: BondType.Any },
    { bondType: BondType.Aromatic },
    { bondType: BondType.SingleDouble },
    { bondType: BondType.SingleAromatic },
    { bondType: BondType.DoubleAromatic },
    { bondType: BondType.Dative },
    { bondType: BondType.Hydrogen },
    { bondType: BondType.Single, bondStereo: BondStereo.Up },
    { bondType: BondType.Single, bondStereo: BondStereo.Down },
    { bondType: BondType.Single, bondStereo: BondStereo.Either },
    { bondType: BondType.Double, bondStereo: BondStereo.CisTrans },
  ];

  for (const bond of bondsToDelete) {
    const bondLocator = await getBondLocator(page, bond);
    await bondLocator.first().click({ force: true });
    await takeEditorScreenshot(page);
  }
});

test(`Verify that undo/redo functionality restores deleted bonds correctly in macromolecules mode`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/6318
   * Description: Verify that undo/redo functionality restores deleted bonds correctly in macromolecules mode
   *
   * Case:
   * 1. Load ket file with 14 bonds at Macro
   * 2. Take screenshot to witness initial state
   * 3. Delete every bond one by one
   * 4. Undo every deletion and take screenshot after each undo
   * 5. Redo every deletion and take screenshot after each redo
   */
  test.slow();
  await openFileAndAddToCanvasAsNewProject(
    'KET/Micro-Macro-Switcher/Deleting a bonds in macromolecules mode test.ket',
    page,
  );
  await selectEraseTool(page);

  const bondsToDelete = [
    { bondType: BondType.Single, bondStereo: BondStereo.None, bondId: 137 },
    { bondType: BondType.Double, bondStereo: BondStereo.None },
    { bondType: BondType.Triple },
    { bondType: BondType.Any },
    { bondType: BondType.Aromatic },
    { bondType: BondType.SingleDouble },
    { bondType: BondType.SingleAromatic },
    { bondType: BondType.DoubleAromatic },
    { bondType: BondType.Dative },
    { bondType: BondType.Hydrogen },
    { bondType: BondType.Single, bondStereo: BondStereo.Up },
    { bondType: BondType.Single, bondStereo: BondStereo.Down },
    { bondType: BondType.Single, bondStereo: BondStereo.Either },
    { bondType: BondType.Double, bondStereo: BondStereo.CisTrans },
  ];

  for (const bond of bondsToDelete) {
    const bondLocator = await getBondLocator(page, bond);
    await bondLocator.first().click({ force: true });
  }

  for (let i = bondsToDelete.length - 1; i >= 0; i--) {
    await pressUndoButton(page);
    await takeEditorScreenshot(page);
  }

  for (let i = bondsToDelete.length - 1; i >= 0; i--) {
    await pressRedoButton(page);
    await takeEditorScreenshot(page);
  }
});

test(`Verify that copying and pasting structures with all bond types in macromolecules mode retains the bond representations`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/6318
   * Description: Verify that copying and pasting structures with all bond types in macromolecules mode retains the bond representations
   *
   * Case: 1. Load ket file with 16 bonds at Micro
   *       2. Select all and cut to clipboard
   *       3. Take screenshot to witness empty canvas
   *       3. Switch to Macro
   *       4. Paste from clipboard
   *       5. Take screenshot to witness canvas state
   *
   * IMPORTANT: Screenshots are not quite correct because of the bugs:
   * https://github.com/epam/ketcher/issues/6234,
   * https://github.com/epam/ketcher/issues/6236
   * Will require to update screens after fix
   */
  await turnOnMicromoleculesEditor(page);
  await openFileAndAddToCanvasAsNewProject(
    'KET/Micro-Macro-Switcher/All 16 types of bonds.ket',
    page,
  );
  await selectAllStructuresOnCanvas(page);
  await cutToClipboardByKeyboard(page);
  await takeEditorScreenshot(page);

  await turnOnMacromoleculesEditor(page);
  await moveMouseToTheMiddleOfTheScreen(page);
  await pasteFromClipboardByKeyboard(page);

  await takeEditorScreenshot(page);
});

test(`Verify that switching between different visualization modes (e.g., flex, snake) retains bond types and structure integrity`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/6318
   * Description: Verify that switching between different visualization modes (e.g., flex, snake) retains bond types and structure integrity
   *
   * Case: 1. Load ket file with 16 bonds (in one molecule) at Macro
   *       2. Switch to Snake mode
   *       3. Take screenshot to witness resulted canvas
   *       3. Switch to Sequence mode
   *       4. Take screenshot to witness resulted canvas
   *
   * IMPORTANT: Screenshots are not quite correct because of the bugs:
   * https://github.com/epam/ketcher/issues/6234,
   * https://github.com/epam/ketcher/issues/6236
   * Will require to update screens after fix
   */
  await openFileAndAddToCanvasAsNewProject(
    'KET/Micro-Macro-Switcher/Switching between different visualization modes.ket',
    page,
  );

  await selectSnakeLayoutModeTool(page);
  await takeEditorScreenshot(page);

  await selectSequenceLayoutModeTool(page);
  await takeEditorScreenshot(page);

  await selectFlexLayoutModeTool(page);
});

test(`Verify the behavior when bonds are dragged and moved in macromolecules mode (e.g., ensuring they stay connected)`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/6318
   * Description: Verify the behavior when bonds are dragged and moved in macromolecules mode (e.g., ensuring they stay connected)
   *
   * Case:
   * 1. Load ket file with 14 bonds at Macro
   * 2. Take screenshot to witness initial state
   * 3. Grab every bond and move it to the new position
   * 4. Take screenshot to witness new molecule's state
   */
  await openFileAndAddToCanvasAsNewProject(
    'KET/Micro-Macro-Switcher/Deleting a bonds in macromolecules mode test.ket',
    page,
  );
  await selectRectangleSelectionTool(page);

  const bondsToDrag = [
    { bondType: BondType.Single, bondStereo: BondStereo.None, bondId: 137 },
    { bondType: BondType.Double, bondStereo: BondStereo.None },
    { bondType: BondType.Triple },
    { bondType: BondType.Any },
    { bondType: BondType.Aromatic },
    { bondType: BondType.SingleDouble },
    { bondType: BondType.SingleAromatic },
    { bondType: BondType.DoubleAromatic },
    { bondType: BondType.Dative },
    { bondType: BondType.Hydrogen },
    { bondType: BondType.Single, bondStereo: BondStereo.Up },
    { bondType: BondType.Single, bondStereo: BondStereo.Down },
    { bondType: BondType.Single, bondStereo: BondStereo.Either },
    { bondType: BondType.Double, bondStereo: BondStereo.CisTrans },
  ];

  for (const bond of bondsToDrag) {
    const bondLocator = await getBondLocator(page, bond);
    await selectAllStructuresOnCanvas(page);
    await bondLocator.first().hover({ force: true });
    await dragMouseTo(400, 400, page);
    await takeEditorScreenshot(page);
  }
});

test(`Verify that selecting a bond highlights it properly, even in complex structures`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/6318
   * Description: Verify that selecting a bond highlights it properly, even in complex structures
   *
   * Case:
   * 1. Load ket file with 14 bonds at Macro
   * 2. Click on every bond one by one
   * 3. Take screenshot to witness bond selection
   */
  await openFileAndAddToCanvasAsNewProject(
    'KET/Micro-Macro-Switcher/Deleting a bonds in macromolecules mode test.ket',
    page,
  );
  await selectRectangleSelectionTool(page);

  const bondsToDrag = [
    { bondType: BondType.Single, bondStereo: BondStereo.None, bondId: 137 },
    { bondType: BondType.Double, bondStereo: BondStereo.None },
    { bondType: BondType.Triple },
    { bondType: BondType.Any },
    { bondType: BondType.Aromatic },
    { bondType: BondType.SingleDouble },
    { bondType: BondType.SingleAromatic },
    { bondType: BondType.DoubleAromatic },
    { bondType: BondType.Dative },
    { bondType: BondType.Hydrogen },
    { bondType: BondType.Single, bondStereo: BondStereo.Up },
    { bondType: BondType.Single, bondStereo: BondStereo.Down },
    { bondType: BondType.Single, bondStereo: BondStereo.Either },
    { bondType: BondType.Double, bondStereo: BondStereo.CisTrans },
  ];

  for (const bond of bondsToDrag) {
    const bondLocator = await getBondLocator(page, bond);
    await bondLocator.first().click({ force: true });
    await takeEditorScreenshot(page);
  }
});
