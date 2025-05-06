/* eslint-disable no-self-compare */
/* eslint-disable max-len */
/* eslint-disable no-magic-numbers */
import { chooseTab, Tabs } from '@utils/macromolecules';
import { Page, test } from '@playwright/test';
import {
  takeEditorScreenshot,
  openFileAndAddToCanvasAsNewProject,
  waitForPageInit,
  selectAllStructuresOnCanvas,
  cutToClipboardByKeyboard,
  pasteFromClipboardByKeyboard,
  moveMouseToTheMiddleOfTheScreen,
  selectSnakeLayoutModeTool,
  selectFlexLayoutModeTool,
  dragMouseTo,
  moveMouseAway,
} from '@utils';
import { selectSequenceLayoutModeTool } from '@utils/canvas/tools';
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
import { closeErrorMessage, pageReload } from '@utils/common/helpers';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { SelectionToolType } from '@tests/pages/constants/areaSelectionTool/Constants';
import { MacromoleculesFileFormatType } from '@tests/pages/constants/fileFormats/macroFileFormats';
import { SaveStructureDialog } from '@tests/pages/common/SaveStructureDialog';
import { TopLeftToolbar } from '@tests/pages/common/TopLeftToolbar';
import { CommonTopRightToolbar } from '@tests/pages/common/TopRightToolbar';

let page: Page;

async function configureInitialState(page: Page) {
  await chooseTab(page, Tabs.Rna);
}

test.beforeAll(async ({ browser }) => {
  const context = await browser.newContext();
  page = await context.newPage();

  await waitForPageInit(page);
  await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
  await configureInitialState(page);
});

test.afterEach(async () => {
  await TopLeftToolbar(page).clearCanvas();
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

  await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
  await takeEditorScreenshot(page);

  await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
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
  await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
  await openFileAndAddToCanvasAsNewProject(
    'KET/Micro-Macro-Switcher/Complicated structures on the canvas.ket',
    page,
  );
  await takeEditorScreenshot(page);

  await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
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
  await pageReload(page);
  await openFileAndAddToCanvasAsNewProject(
    'KET/Micro-Macro-Switcher/All Bonds on Macro.ket',
    page,
  );
  await takeEditorScreenshot(page);

  await CommonLeftToolbar(page).selectEraseTool();
  // removing single bond
  await clickOnMicroBondByIndex(page, 41);
  // removing double bond
  await clickOnMicroBondByIndex(page, 47);
  // removing single up bond
  await clickOnMicroBondByIndex(page, 53);
  // removing single down bond
  await clickOnMicroBondByIndex(page, 53);

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
  await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
  await openFileAndAddToCanvasAsNewProject(
    'KET/Micro-Macro-Switcher/All 16 types of bonds.ket',
    page,
  );
  await takeEditorScreenshot(page);
  await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
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

  await TopLeftToolbar(page).saveFile();
  await SaveStructureDialog(page).chooseFileFormat(
    MacromoleculesFileFormatType.Sequence1LetterCode,
  );
  await takeEditorScreenshot(page);

  await closeErrorMessage(page);
  await SaveStructureDialog(page).cancel();
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

  await TopLeftToolbar(page).saveFile();
  await SaveStructureDialog(page).chooseFileFormat(
    MacromoleculesFileFormatType.Sequence3LetterCode,
  );
  await takeEditorScreenshot(page);

  // await closeErrorMessage(page);
  await SaveStructureDialog(page).cancel();
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

  await TopLeftToolbar(page).saveFile();
  await SaveStructureDialog(page).chooseFileFormat(
    MacromoleculesFileFormatType.IDT,
  );
  await takeEditorScreenshot(page);

  // await closeErrorMessage(page);
  await SaveStructureDialog(page).cancel();
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

  await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();

  await openFileAndAddToCanvasAsNewProject(
    'KET/Micro-Macro-Switcher/All 16 types of bonds-expected.mol',
    page,
  );
  await takeEditorScreenshot(page);

  await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
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
  await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
  await openFileAndAddToCanvasAsNewProject(
    'KET/Micro-Macro-Switcher/All 16 types of bonds.ket',
    page,
  );
  await takeEditorScreenshot(page);
  await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
  await takeEditorScreenshot(page);

  await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
  await takeEditorScreenshot(page);

  await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
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
  await CommonLeftToolbar(page).selectEraseTool();

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
    const bondLocator = getBondLocator(page, bond);
    await bondLocator.first().click({ force: true });
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
    });
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
  await CommonLeftToolbar(page).selectEraseTool();

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
    const bondLocator = getBondLocator(page, bond);
    await bondLocator.first().click({ force: true });
  }

  for (let i = bondsToDelete.length - 1; i >= 0; i--) {
    await TopLeftToolbar(page).undo();
    await takeEditorScreenshot(page);
  }

  for (let i = bondsToDelete.length - 1; i >= 0; i--) {
    await TopLeftToolbar(page).redo();
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
  await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
  await openFileAndAddToCanvasAsNewProject(
    'KET/Micro-Macro-Switcher/All 16 types of bonds.ket',
    page,
  );
  await selectAllStructuresOnCanvas(page);
  await cutToClipboardByKeyboard(page);
  await takeEditorScreenshot(page);

  await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
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
  await CommonLeftToolbar(page).selectAreaSelectionTool(
    SelectionToolType.Rectangle,
  );

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
    const bondLocator = getBondLocator(page, bond);
    await selectAllStructuresOnCanvas(page);
    await bondLocator.first().hover({ force: true });
    await dragMouseTo(400, 400, page);
    await moveMouseAway(page);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
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
  await CommonLeftToolbar(page).selectAreaSelectionTool(
    SelectionToolType.Rectangle,
  );

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
    const bondLocator = getBondLocator(page, bond);
    await bondLocator.first().click({ force: true });
    await takeEditorScreenshot(page);
  }
});
