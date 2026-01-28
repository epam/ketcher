/* eslint-disable max-len */
/* eslint-disable no-magic-numbers */
/* eslint-disable @typescript-eslint/no-empty-function */
import { Page, test, expect } from '@fixtures';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { ContextMenu } from '@tests/pages/common/ContextMenu';
import { ErrorMessageDialog } from '@tests/pages/common/ErrorMessageDialog';
import { OpenStructureDialog } from '@tests/pages/common/OpenStructureDialog';
import { PasteFromClipboardDialog } from '@tests/pages/common/PasteFromClipboardDialog';
import { SaveStructureDialog } from '@tests/pages/common/SaveStructureDialog';
import { ConfirmMessageDialog } from '@tests/pages/molecules/canvas/createMonomer/ConfirmMessageDialog';
import { SelectionToolType } from '@tests/pages/constants/areaSelectionTool/Constants';
import { Atom } from '@tests/pages/constants/atoms/atoms';
import { MacroBondType } from '@tests/pages/constants/bondSelectionTool/Constants';
import {
  MonomerOnMicroOption,
  MonomerOption,
} from '@tests/pages/constants/contextMenu/Constants';
import {
  MonomerType,
  NucleotideNaturalAnalogue,
} from '@tests/pages/constants/createMonomerDialog/Constants';
import { MacromoleculesFileFormatType } from '@tests/pages/constants/fileFormats/macroFileFormats';
import { RNASection } from '@tests/pages/constants/library/Constants';
import { LayoutMode } from '@tests/pages/constants/macromoleculesTopToolbar/Constants';
import { Base } from '@tests/pages/constants/monomers/Bases';
import {
  PeptideLetterCodeType,
  SequenceMonomerType,
} from '@tests/pages/constants/monomers/Constants';
import { Nucleotide } from '@tests/pages/constants/monomers/Nucleotides';
import { Peptide } from '@tests/pages/constants/monomers/Peptides';
import { Phosphate } from '@tests/pages/constants/monomers/Phosphates';
import { Preset } from '@tests/pages/constants/monomers/Presets';
import { Sugar } from '@tests/pages/constants/monomers/Sugars';
import {
  OptionsForDebuggingSetting,
  ResetToSelectToolOption,
} from '@tests/pages/constants/settingsDialog/Constants';
import { CalculateVariablesPanel } from '@tests/pages/macromolecules/CalculateVariablesPanel';
import { Library } from '@tests/pages/macromolecules/Library';
import { MacromoleculesTopToolbar } from '@tests/pages/macromolecules/MacromoleculesTopToolbar';
import { AtomPropertiesDialog } from '@tests/pages/molecules/canvas/AtomPropertiesDialog';
import { NucleotidePresetTab } from '@tests/pages/molecules/canvas/createMonomer/constants/nucleiotidePresetSection/Constants';
import { NucleotidePresetSection } from '@tests/pages/molecules/canvas/createMonomer/NucleotidePresetSection';
import {
  CreateMonomerDialog,
  selectAtomAndBonds,
  selectMonomersAndBonds,
} from '@tests/pages/molecules/canvas/CreateMonomerDialog';
import { SGroupPropertiesDialog } from '@tests/pages/molecules/canvas/S-GroupPropertiesDialog';
import { setSettingsOption } from '@tests/pages/molecules/canvas/SettingsDialog';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import { RightToolbar } from '@tests/pages/molecules/RightToolbar';
import {
  takeEditorScreenshot,
  clickInTheMiddleOfTheScreen,
  openFileAndAddToCanvas,
  openFileAndAddToCanvasAsNewProject,
  selectAllStructuresOnCanvas,
  clickOnCanvas,
  waitForRender,
  selectWithLasso,
  getCachedBodyCenter,
  getCoordinatesOfTheMiddleOfTheCanvas,
  openFileAndAddToCanvasMacro,
  pasteFromClipboardAndAddToMacromoleculesCanvas,
  MacroFileType,
  pasteFromClipboardAndOpenAsNewProject,
  takeMonomerLibraryScreenshot,
  pasteFromClipboardAndAddToCanvas,
  takePageScreenshot,
  layout,
  dragMouseTo,
  setMode,
  keyboardPressOnCanvas,
  MolFileFormat,
  takeElementScreenshot,
  SdfFileFormat,
  dragMouseAndMoveTo,
} from '@utils';
import { getAtomLocator } from '@utils/canvas/atoms/getAtomLocator/getAtomLocator';
import { getAbbreviationLocator } from '@utils/canvas/s-group-signes/getAbbreviation';
import {
  FileType,
  verifyFileExport,
  verifyHELMExport,
  verifyPNGExport,
  verifySVGExport,
} from '@utils/files/receiveFileComparisonData';
import { replaceMonomersLibrary } from '@utils/library/replaceMonomersLibrary';
import { updateMonomersLibrary } from '@utils/library/updateLibrary';
import {
  getMonomerLocator,
  getSymbolLocator,
} from '@utils/macromolecules/monomer';
import {
  bondTwoMonomers,
  getBondLocator,
} from '@utils/macromolecules/polymerBond';

let page: Page;

test.describe('Bugs: ketcher-3.11.0 — first trio', () => {
  test.beforeAll(async ({ initMoleculesCanvas }) => {
    page = await initMoleculesCanvas();
  });
  test.afterEach(async ({ initMoleculesCanvas }) => {
    page = await initMoleculesCanvas();
    await CommonTopLeftToolbar(page).clearCanvas();
  });
  test.afterAll(async ({ closePage }) => {
    await closePage();
  });
  test('Case 1 — Rotation tool: selection box for expanded s-groups includes label and padding', async () => {
    /* Test case: https://github.com/epam/ketcher/issues/8974
     * Bug: https://github.com/epam/ketcher/issues/2597
     * Steps (reproduce expected behavior visually):
     * 1. Load molecule that contains an expanded S-group with label and brackets
     * 2. Select the S-group (or the whole group)
     * 3. Take editor screenshot to verify selection box includes label and padding
     * Expected result: We need to include the group label into the rotation box and
     * introduce some padding for the brackets. We also need to keep the same way as it works now, so it should not take padding into account.
     */

    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/S-Groups/All types of Nucleotide Componets S-Groups.ket',
    );
    await clickInTheMiddleOfTheScreen(page);

    await takeElementScreenshot(page, getAtomLocator(page, { atomId: 11 }), {
      padding: 250,
    });
  });

  test('Case 2.1 — Context menu should be shown for clicked functional group (not for highlighted one)', async () => {
    /* Test case: https://github.com/epam/ketcher/issues/8974
     * Bug: https://github.com/epam/ketcher/issues/2576
     * Scenario 1
     * Steps:
     * 1. Load or draw structure with two functional groups (one expanded/one contracted)
     * 2. Select/highlight the first functional group
     * 3. Right click on the second (not highlighted) functional group abbreviation
     * 4. Verify the context menu corresponds to the clicked FG (visual verification)
     * Expected Result: When right clicking on a Functional Group that is not currently highlighted, the right click menu should be shown for the clicked Functional Group.
     */

    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/S-Groups/All types of Nucleotide Componets S-Groups.ket',
    );
    await waitForRender(page, async () => {
      await getBondLocator(page, { bondId: 6 }).click({
        force: true,
      });
    });

    await ContextMenu(page, getBondLocator(page, { bondId: 12 })).open();
    await takeElementScreenshot(page, getBondLocator(page, { bondId: 12 }), {
      padding: 170,
    });
  });

  test('Case 2.2 — Context menu should be shown for clicked functional group (not for highlighted one)', async () => {
    /* Test case: https://github.com/epam/ketcher/issues/8974
     * Bug: https://github.com/epam/ketcher/issues/2576
     * Scenario 2
     * Steps:
     * 1. Open Ketcher
     * 2. Add two atoms on canvas
     * 3. Select with Selection tool one atom
     * 4. Make right click on another atom
     */

    await CommonTopLeftToolbar(page).clearCanvas();
    const atomToolbar = RightToolbar(page);

    await atomToolbar.clickAtom(Atom.Nitrogen);
    await clickInTheMiddleOfTheScreen(page);

    await atomToolbar.clickAtom(Atom.Oxygen);
    await clickOnCanvas(page, 200, 200);

    await CommonLeftToolbar(page).handToolButton.click();

    await waitForRender(page, async () => {
      await getAtomLocator(page, { atomId: 0 }).click({
        force: true,
      });
    });
    await ContextMenu(page, getAtomLocator(page, { atomId: 1 })).open();
    await takeElementScreenshot(page, getAtomLocator(page, { atomId: 1 }), {
      padding: 200,
    });
  });

  test('Case 2.3 — Context menu should be shown for clicked functional group (not for highlighted one)', async () => {
    /* Test case: https://github.com/epam/ketcher/issues/8974
     * Bug: https://github.com/epam/ketcher/issues/2576
     * Scenario 3
     * Steps:
     * 1. Open Ketcher
     * 2. Add structure on canvas (e.g. Benzene)
     * 3. Select with Selection tool all structure
     * 4. Make right click on any place on canvas
     */

    await CommonTopLeftToolbar(page).clearCanvas();
    await openFileAndAddToCanvasAsNewProject(
      page,
      'Molfiles-V2000/benzene.mol',
    );

    await CommonLeftToolbar(page).areaSelectionTool();
    await selectAllStructuresOnCanvas(page);

    await clickOnCanvas(page, 300, 300, { button: 'right' });
    await takeElementScreenshot(page, getAtomLocator(page, { atomId: 1 }), {
      padding: 60,
    });
  });

  test('Case 2.4 — Context menu should be shown for clicked functional group (not for highlighted one)', async () => {
    /* Test case: https://github.com/epam/ketcher/issues/8974
     * Bug: https://github.com/epam/ketcher/issues/2576
     * Scenario 4
     * Steps:
     * 1. Open Ketcher
     * 2. Add two structures on canvas (e.g. Benzene)
     * 3. Select with Selection tool one of structure
     * 4. Make right click on atom of not highlighted structure
     * Expected Result: Context menu is shown for clicked atom and selected structure is unhighlighted
     */

    await CommonTopLeftToolbar(page).clearCanvas();
    await openFileAndAddToCanvasAsNewProject(
      page,
      'Molfiles-V2000/two-benzene-rings.mol',
    );

    await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Lasso);
    await selectWithLasso(page, 360, 260, [
      { x: 720, y: 260 },
      { x: 720, y: 370 },
      { x: 360, y: 370 },
      { x: 360, y: 260 },
      { x: 360, y: 260 },
    ]);

    await ContextMenu(page, getAtomLocator(page, { atomId: 0 })).open();
    await takeElementScreenshot(page, getAtomLocator(page, { atomId: 6 }), {
      padding: 230,
    });
  });

  test('Case 2.5 — Context menu should be shown for clicked functional group (not for highlighted one)', async () => {
    /* Test case: https://github.com/epam/ketcher/issues/8974
     * Bug: https://github.com/epam/ketcher/issues/2576
     * Scenario 5
     * Steps:
     * 1. Add any structure to the canvas, such as benzene
     * 2. Click Select Tool, and select some atoms/bonds of the structure
     * Right click on one of the selected atoms/bonds
     */

    await CommonTopLeftToolbar(page).clearCanvas();
    await openFileAndAddToCanvasAsNewProject(
      page,
      'Molfiles-V2000/benzene.mol',
    );

    await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Lasso);
    const { x: centerX, y: centerY } = await getCachedBodyCenter(page);
    await selectWithLasso(page, centerX - 100, centerY - 50, [
      { x: centerX, y: centerY - 50 },
      { x: centerX, y: centerY + 50 },
      { x: centerX - 100, y: centerY + 50 },
      { x: centerX - 100, y: centerY - 50 },
      { x: centerX - 100, y: centerY - 50 },
    ]);

    await ContextMenu(page, getBondLocator(page, { bondId: 3 })).open();
    await takeElementScreenshot(page, getBondLocator(page, { bondId: 3 }), {
      padding: 200,
    });
  });

  test('Case 3 — Superatom rendering with multiple connection points — part of structure should not disappear', async () => {
    /* Test case: https://github.com/epam/ketcher/issues/8974
     * Bug: https://github.com/epam/ketcher/issues/2517
     * Steps:
     * 1. Load a superatom (superatom with multiple connection points)
     * 2. Verify the rendering: brackets and label present, no disappearing parts
     * Visual verification via screenshot. If there are specific molfile fixtures in repo, replace the inline MOL below with readFile helper to load fixture.
     * Expected Result: File opens with Superaton name and brackets
     */

    await openFileAndAddToCanvas(page, 'Molfiles-V2000/superatom.mol');

    await LeftToolbar(page).sGroup();

    const wLocator = page.getByText('w', { exact: true });
    const wBox = await wLocator.boundingBox();
    if (wBox) {
      const clickX = wBox.x - 10;
      const clickY = wBox.y + wBox.height / 2;
      await page.mouse.click(clickX, clickY);
    }

    await SGroupPropertiesDialog(page).setNameValue('Test@!#$%12345');
    await SGroupPropertiesDialog(page).apply();
    await takeElementScreenshot(page, getAtomLocator(page, { atomId: 18 }), {
      padding: 220,
    });
  });

  test('Case 4 - When atoms are selected, pressing atoms hotkey opens a modal window instead of an instant replacement', async () => {
    /* Test case: https://github.com/epam/ketcher/issues/8974
     * Bug: https://github.com/epam/ketcher/issues/2490
     * Steps:
     * 1. Open Ketcher
     * 2. Add few atoms on canvas (e.g. Nitrogen)
     * 3. Select all atoms with 'Selection tool'
     * 4. Press 'O' hotkey
     * Expected Result:
     *  Selected atoms are replaces with those assigned to the hotkey.
     *  Selected tool remains active and the atom does not appear under mouse cursor.
     */

    const atomToolbar = RightToolbar(page);

    await atomToolbar.clickAtom(Atom.Nitrogen);

    const canvasCenter = await getCoordinatesOfTheMiddleOfTheCanvas(page);
    await clickOnCanvas(page, canvasCenter.x, canvasCenter.y);
    await clickOnCanvas(page, canvasCenter.x - 50, canvasCenter.y);
    await clickOnCanvas(page, canvasCenter.x + 50, canvasCenter.y);
    await clickOnCanvas(page, canvasCenter.x, canvasCenter.y - 50);

    await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Lasso);
    await selectWithLasso(page, 450, 260, [
      { x: 810, y: 260 },
      { x: 810, y: 480 },
      { x: 450, y: 480 },
      { x: 450, y: 260 },
      { x: 450, y: 260 },
    ]);

    await page.keyboard.press('O');
    await takeElementScreenshot(page, getAtomLocator(page, { atomId: 0 }), {
      padding: 80,
    });
  });

  test('Case 5 - Cannot add atom properties to Any atom as it is defined with an incorrect label', async () => {
    /* Test case: https://github.com/epam/ketcher/issues/8974
     * Bug: https://github.com/epam/ketcher/issues/2593
     * Steps:
     * 1. Open Ketcher
     * 2. Put 'Chain' on canvas
     * 3. Add 'Any atom' on chain atom
     * 4. Double click on 'Any atom' and try add any atom properties (e.g. Alias, Charge, Valence)
     * Expected Result: Can add to 'Any atom' atom properties as it is not defined as a wrong label and 'Apply' button active.
     */

    await openFileAndAddToCanvasAsNewProject(page, 'KET/chain.ket');
    const atomToolbar = RightToolbar(page);

    await atomToolbar.clickAtom(Atom.Nitrogen);
    await getAtomLocator(page, { atomId: 2 }).click({ force: true });
    await CommonLeftToolbar(page).areaSelectionTool();
    await getAtomLocator(page, { atomId: 2 }).dblclick({
      force: true,
    });
    await AtomPropertiesDialog(page).fillAlias('N1');
    expect(await AtomPropertiesDialog(page).applyButton.isEnabled()).toBe(true);
  });

  test('Case 6 - Ambiguous phosphates (alternatives and mixed) in sequence shown as % symbol instead of @ symbol', async ({
    SequenceCanvas: _,
  }) => {
    /* Test case: https://github.com/epam/ketcher/issues/8974
     * Bug: https://github.com/epam/ketcher/issues/6731
     * Steps:
     * 1. Go to Macro - Sequence mode (clean canvas)
     * 2. Load from KET file a structure with ambiguous phosphates (alternatives and mixed)
     * 3. Verify that ambiguous phosphates are shown with @ symbol (not %)
     * Expected Result: Ambiguous phosphates (alternatives and mixed) in sequence shown as @ symbol
     */

    await openFileAndAddToCanvasMacro(
      page,
      'KET/Ambiguous-monomers-bonds/ketcherPhosphateMixedAndAlternatives.ket',
    );
    await CommonTopRightToolbar(page).setZoomInputValue('60');
    await takeElementScreenshot(
      page,
      getSymbolLocator(page, { symbolId: 27 }),
      {
        padding: 34,
      },
    );
  });

  test('Case 7 - System does not unite ambiguous sugars (alternatives and mixed) into one @ symbol', async ({
    SequenceCanvas: _,
  }) => {
    /* Test case: https://github.com/epam/ketcher/issues/8974
     * Bug: https://github.com/epam/ketcher/issues/6727
     * Steps:
     * 1. Go to Macro - Sequence mode (clean canvas)
     * 2. Load from KET file a structure with ambiguous sugars (alternatives and mixed)
     * 3. Verify that ambiguous sugars are united into one @ symbol
     * Expected Result: System unites ambiguous sugars (alternatives and mixed) into one @ symbol
     */

    await openFileAndAddToCanvasMacro(
      page,
      'KET/Ambiguous-monomers-bonds/ketcherSugarsMixedAndAlternatives.ket',
    );
    await takeElementScreenshot(page, page.getByTestId('sequence-item'), {
      padding: 30,
    });
  });

  test('Case 8 - System does not unite ambiguous CHEMs (alternatives and mixed) into one @ symbol', async ({
    SequenceCanvas: _,
  }) => {
    /* Test case: https://github.com/epam/ketcher/issues/8974
     * Bug: https://github.com/epam/ketcher/issues/6734
     * Steps:
     * 1. Go to Macro - Sequence mode (clean canvas)
     * 2. Load from KET file a structure with ambiguous CHEMs (alternatives and mixed)
     * 3. Verify that ambiguous CHEMs are united into one @ symbol
     * Expected Result: System unites ambiguous CHEMs (alternatives and mixed) into one @ symbol and other symbols
     * (if they exist) should follow right after that one in the same manner as it happens when system unite ordinary CHEMs in one symbol @
     */

    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'CHEM1{([sDBL],[4aPEGMal])}|CHEM2{([sDBL]+[4aPEGMal])}|CHEM3{([sDBL],[4aPEGMal])}|CHEM4{([sDBL]+[4aPEGMal])}$CHEM1,CHEM2,1:R2-1:R1|CHEM2,CHEM3,1:R2-1:R1|CHEM3,CHEM4,1:R2-1:R1$$$V2.0',
    );
    await takeElementScreenshot(page, page.getByTestId('sequence-item'), {
      padding: 30,
    });
  });

  test('Case 9 - Verify Undo/Redo do not restore partial selection after cancelling monomer creation (GH-7578)', async () => {
    /* Test case: https://github.com/epam/ketcher/issues/8974
     * Bug: https://github.com/epam/ketcher/issues/7578
     * Steps:
     * 1. Open Ketcher (Popup)
     * 2. Put Cyclohexane on canvas
     * 3. Make a partial selection suitable for monomer creation
     * 4. Open Monomer Creation Wizard
     * 5. Close wizard without submitting
     * 6. Press Undo/Redo several times
     * Expected Result: Canvas state after Undo/Redo should be identical to state before opening the wizard.
     */

    await pasteFromClipboardAndOpenAsNewProject(page, 'C1CCCCC1');
    await selectAtomAndBonds(page, { atomIds: [1, 2], bondIds: [1] });

    await LeftToolbar(page).createMonomer();

    await CreateMonomerDialog(page).discard();

    await CommonTopLeftToolbar(page).undo();
    await takeEditorScreenshot(page);
    await CommonTopLeftToolbar(page).redo();
    await takeEditorScreenshot(page);
    await CommonTopLeftToolbar(page).undo();
    await takeEditorScreenshot(page);
    await CommonTopLeftToolbar(page).redo();
    await takeEditorScreenshot(page);
  });

  test('Case 10 - Delete option is unavailable when right-clicking on a bond in macro mode', async ({
    SnakeCanvas: _,
  }) => {
    /* Test case: https://github.com/epam/ketcher/issues/8974
     * Bug: https://github.com/epam/ketcher/issues/7326
     * Steps:
     * 1. Open any structure in macro mode.
     * 2. Right-click on a bond between macro components (e.g., between sugar and phosphate).
     * 3. Observe the context menu.
     * Expected Result: The "Delete" option should be enabled and allow the user to remove the bond.
     */

    await openFileAndAddToCanvasMacro(page, 'KET/sugar-phosphate-core.ket');
    await ContextMenu(page, getBondLocator(page, { bondId: 45 })).open();
    await page.waitForTimeout(200);
    await takeElementScreenshot(
      page,
      getMonomerLocator(page, { monomerId: 32 }),
      {
        padding: 185,
      },
    );
  });

  test('Case 11 - Preview tooltips for monomers loaded from HELM with inline smiles are wrong', async ({
    FlexCanvas: _,
  }) => {
    /* Test case: https://github.com/epam/ketcher/issues/8974
     * Bug: https://github.com/epam/ketcher/issues/5469
     * Steps:
     * 1. Toggle to Macro - Flex mode
     * 2. Load HELM from paste from clipboard way
     * 3. Hover mouse over any monomer
     * Expected Result: Preview tooltip contains header with alias name
     */

    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'PEPTIDE1{[N%91[C@H](C%92=O)C.[*:2]%92.[*:1]%91 |$;;;;;_R2;_R1$|].[C%91([C@H](CS%92)N%93)=O.[*:2]%91.[*:1]%93.[*:3]%92 |$;;;;;;_R2;_R1;_R3$|].[C%91([C@H](CC(O%92)=O)N%93)=O.[*:1]%93.[*:2]%91.[*:3]%92 |$;;;;;;;;_R1;_R2;_R3$|].[C([C@@H](C%91=O)N%92)C(C)C.[*:2]%91.[*:1]%92 |$;;;;;;;;_R2;_R1$|]}$$$$V2.0',
    );
    await page.getByText('Mod3').first().hover({ force: true });
    await page.waitForTimeout(1000);
    await takePageScreenshot(page);
  });

  test('Case 12 - The tooltip does not appear below the cursor when hovering over the “plus” button and stripe', async ({
    SequenceCanvas: _,
  }) => {
    /* Test case: https://github.com/epam/ketcher/issues/8974
     * Bug: https://github.com/epam/ketcher/issues/5214
     * Steps:
     * 1. Switch to the Macro mode
     * 2. Enter any letters
     * 3. Hover above or below this sequence
     * 4. Hover over the “plus” button or the stripe
     * Expected Result: The tooltip “Add sequence here” appears
     */

    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{r(A,C,U)p.r(G)p.r(C,U)p.r(C)p.r(A,C,U)p.r(G,U)p.r(U)p.r(C,G,U)}|RNA2{r(A,C,U)p.r(G)p.r(A,C,U)p.r(G)p.r(A,C,U)p.r(G)}$$$$V2.0',
    );
    const plusButton = page.getByTestId('NewSequencePlusButtonIcon');

    await expect(
      plusButton
        .locator('xpath=ancestor::*[name()="g"]//*[name()="title"]')
        .first(),
    ).toHaveText('Add sequence here');
  });

  test('Case 13 - Labels for empty ambiguous monomer categories are present in the library', async ({
    SequenceCanvas: _,
  }) => {
    /* Test case: https://github.com/epam/ketcher/issues/8974
     * Bug: https://github.com/epam/ketcher/issues/6855
     * Steps:
     * 1. Go to Macro
     * 2. Input v symbol to Search by name edit box in the library
     * 3. Go to RNA tab, Bases accordion section
     * Expected Result:
     * Only natural analog category name (U) is present above brviny and vinyl5 bases
     * Labels for empty sections of natural analog monomers are not present
     * Labels for empty sections of ambiguous monomers are not present
     */

    await Library(page).setSearchValue('v');
    await Library(page).openRNASection(RNASection.Bases);
    await takeMonomerLibraryScreenshot(page);
  });

  test('Case 14 - Selection circle is different on micro and macro modes', async ({
    FlexCanvas: _,
  }) => {
    /* Test case: https://github.com/epam/ketcher/issues/8974
     * Bug: https://github.com/epam/ketcher/issues/5664
     * Steps:
     * 1. Go to Macro - Flex mode
     * 2. Add file to the Canvas
     * 3. Click and hover mouse over any atom
     * Expected Result: Selection for atom is the same on both modes
     */

    await openFileAndAddToCanvasMacro(page, 'KET/chain-with-atoms.ket');
    const atomlocator = await getAtomLocator(page, { atomId: 0 });
    atomlocator.hover({ force: true });
    await takeElementScreenshot(page, getAtomLocator(page, { atomId: 3 }), {
      padding: 155,
    });
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await atomlocator.hover();
    await takeElementScreenshot(page, getAtomLocator(page, { atomId: 3 }), {
      padding: 155,
    });
  });

  test('Case 15 - Peptide section for ambiguous monomers should have "Ambiguous Amino Acids" name', async ({
    FlexCanvas: _,
  }) => {
    /* Test case: https://github.com/epam/ketcher/issues/8974
     * Bug: https://github.com/epam/ketcher/issues/5578
     * Steps:
     * 1. Go to Macro - Flex mode
     * 2. Open Library, go to Peptides tab
     * 3. Navigate to the bottom of the list
     * Expected Result: Section for ambiguous monomers have "Ambiguous Amino Acids" name (all first letters are CAPITAL)
     */

    await Library(page).switchToPeptidesTab();
    await Library(page).selectMonomer(Peptide.X);
    const text = page.getByText('Ambiguous Amino Acids');
    await expect(text).toBeVisible();
    await expect(text).toContainText('Ambiguous Amino Acids');
    await takeMonomerLibraryScreenshot(page);
  });

  test('Case 16 - Font size and label position should be corrected at "Open structure" dialog', async ({
    FlexCanvas: _,
  }) => {
    /* Test case: https://github.com/epam/ketcher/issues/8974
     * Bug: https://github.com/epam/ketcher/issues/5927
     * Steps:
     * 1. Go to Macro - Flex mode
     * 2. Open Paste from clipboard way form
     * Expected Result:
     * Load content type label (Sequence and etc) has 12 px size
     * Peptide and 1-letter code has no shift up
     */

    await CommonTopLeftToolbar(page).openButton.click({ force: true });
    await OpenStructureDialog(page).pasteFromClipboardButton.click();
    const contentTypeSelector =
      PasteFromClipboardDialog(page).contentTypeSelector;
    const monomerTypeSelector =
      PasteFromClipboardDialog(page).monomerTypeSelector;
    const peptideLettersSelector =
      PasteFromClipboardDialog(page).peptideLettersCodeSelector;

    await PasteFromClipboardDialog(page).contentTypeSelector.click();
    await page.getByRole('option', { name: MacroFileType.Sequence }).click();
    const contentTypeFontSize = await contentTypeSelector
      .locator('span')
      .first()
      .evaluate((element) => window.getComputedStyle(element).fontSize);
    expect(contentTypeFontSize).toBe('12px');

    await monomerTypeSelector.click();
    await page
      .getByRole('option', { name: SequenceMonomerType.Peptide })
      .click();
    const monomerTypeFontSize = await monomerTypeSelector
      .locator('span')
      .first()
      .evaluate((element) => window.getComputedStyle(element).fontSize);
    expect(monomerTypeFontSize).toBe('12px');

    await peptideLettersSelector.click();
    await page
      .getByRole('option', { name: PeptideLetterCodeType.oneLetterCode })
      .click();
    const peptideLetterFontSize = await peptideLettersSelector
      .locator('span')
      .first()
      .evaluate((element) => window.getComputedStyle(element).fontSize);
    expect(peptideLetterFontSize).toBe('12px');

    await takeEditorScreenshot(page);
  });

  test('Case 17 - System shows inner circles of aromatized benzene rings from collapsed monomers on Molecules canvas', async ({
    SequenceCanvas: _,
  }) => {
    /* Test case: https://github.com/epam/ketcher/issues/8974
     * Bug: https://github.com/epam/ketcher/issues/7735
     * Steps:
     * 1. Select Macromolecules mode:
     * 2. Click the folder icon "Open..." in the top left corner of the top panel:
     * 3. Click on Paste from Clipboard
     * 4. In Open Structure pop-up click on dropdown with preselected "Ket" value
     * 5. Select "HELM" in the dropdown
     * 6. Paste the following HELM notation in the text area
     * 7. Click on "Add to Canvas" button
     * 8. Switch to Molecules mode
     * Expected Result: System shows collapsed monomer on the canvas only
     */

    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'PEPTIDE1{[c1(c(-c2ccc([*:2])cc2)c(-c2ccc([*:3])cc2)c(-c2ccc([*:4])cc2)c(-c2ccc([*:5])cc2)c1-c1ccc([*:6])cc1)-c1ccc([*:1])cc1 |$;;;;;;_R2;;;;;;;;_R3;;;;;;;;_R4;;;;;;;;_R5;;;;;;;;_R6;;;;;;;_R1;;$|]}$$$$V2.0',
    );
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await takeElementScreenshot(page, page.getByText('Mod0'), {
      padding: 35,
    });
  });

  test('Case 18 - Charge tools does not work for "star" atoms', async () => {
    /* Test case: https://github.com/epam/ketcher/issues/8974
     * Bug: https://github.com/epam/ketcher/issues/7559
     * Steps:
     * 1. Switch to Molecules mode using the switcher in the top right corner of the top panel
     * 2. Click the folder icon "Open..." in the top left corner of the top panel
     * 3. Click on Paste from Clipboard
     * 4. Copy and paste this SMILES string
     * 5. Click on "Add to Canvas" button
     * 6. Click on the Canvas to place the chemical structure
     * 7. Select the "Star" atom
     * 8. Click the "A+" icon in the left toolbar to use the "Charge Plus" tool
     * 9. Using the "Charge Plus" tool, click on any atom marked with a star (*) two or three times to increase its charge
     * Expected Result: Charge value for "star" atom is increased
     */

    await pasteFromClipboardAndAddToCanvas(
      page,
      '*1C=*C=*C=1 |$star_e;;star_e;;star_e;$|',
    );
    await clickInTheMiddleOfTheScreen(page);
    await LeftToolbar(page).chargePlusButton.click();
    const starAtom = getAtomLocator(page, { atomId: 6 });
    await starAtom.click({ force: true });
    await starAtom.click({ force: true });
    await starAtom.click({ force: true });
    await takeElementScreenshot(page, starAtom, {
      padding: 80,
    });
  });

  test('Case 19 - Dropdown for units (Da/kDa/MDa) is not aligned in width with the selector button', async ({
    SequenceCanvas: _,
  }) => {
    /* Test case: https://github.com/epam/ketcher/issues/8974
     * Bug: https://github.com/epam/ketcher/issues/7022
     * Steps:
     * 1. Select "Macromolecules" mode from the switcher at the top right of the top panel
     * 2. Click the "A" preset in the RNA Presets panel on the right side to add it to the Canvas
     * 3. Click the flask-like icon "Calculate properties" in the top left of the top panel
     * 4. Observe "Calculate value" window at the bottom of the screen and click to "Da" to open dropdown
     * 5. Observe the dropdown width compared to the button width
     * Expected Result: The dropdown menu should match the button width, including borders, so that their edges are aligned.
     */

    await MacromoleculesTopToolbar(page).rna();
    await Library(page).selectMonomer(Preset.A);
    await MacromoleculesTopToolbar(page).calculateProperties();
    await CalculateVariablesPanel(page).isVisible();
    await CalculateVariablesPanel(page).molecularMassUnitsCombobox.click();
    await page.waitForTimeout(1000);
    await takeElementScreenshot(page, page.getByTestId('Molecular Mass Unit'), {
      padding: 180,
    });
  });

  test('Case 20 - Number of selected elements in context menu is wrong for sense/antisense chains', async ({
    SequenceCanvas: _,
  }) => {
    /* Test case: https://github.com/epam/ketcher/issues/8974
     * Bug: https://github.com/epam/ketcher/issues/7148
     * Steps:
     * 1. Open Ketcher in Macro
     * 2. Paste the following HELM notation in the text area
     * 3. Click on "Add to Canvas" button
     * 4. Click on "Select Rectangle" on the left panel
     * 5. Make left click + drag to select the entire chemical structure created
     * 6. Right-click on selected structure to open the context menu and observe
     * Expected Result: Number of selected elements is 4
     */

    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{R(A)P}|RNA2{[5Br-dU].R(U)}|RNA3{[2-damdA]}$RNA1,RNA2,2:pair-3:pair|RNA1,RNA3,3:R2-1:R1|RNA3,RNA2,1:pair-1:pair$$$V2.0',
    );
    await CommonLeftToolbar(page).areaSelectionTool();
    await selectAllStructuresOnCanvas(page);
    const point = getSymbolLocator(page, { symbolId: 14 });
    await ContextMenu(page, point).open();
    await takeEditorScreenshot(page);
  });

  test('Case 21 - In Macro mode clicking on Selection tool icon does not open dropdown menu as in Micro mode', async () => {
    /* Test case: https://github.com/epam/ketcher/issues/8974
     * Bug: https://github.com/epam/ketcher/issues/7776
     * Steps:
     * 1. Open Ketcher in Macro mode.
     * 2. Click on the Selection tool icon (not the triangle part).
     * 3. Observe that no dropdown appears.
     * 4. Switch to Micro mode.
     * 5. Click on the Selection tool icon → dropdown with all selection tools appears.
     * Expected Result:
     * Clicking on the Selection tool icon (both in Macro and Micro modes) should open the dropdown menu with all selection tools, providing a consistent user experience.
     */

    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Ambiguous-monomers-bonds/ketcherPhosphateMixedAndAlternatives.ket',
    );
    await CommonLeftToolbar(page).areaSelectionDropdownButton.click();
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await CommonLeftToolbar(page).areaSelectionDropdownButton.click();
    await takeElementScreenshot(page, page.getByTestId('select-rectangle'), {
      padding: 90,
    });
  });

  test('Case 22 - Context menu remains visible after creating cyclic structure via right-click menu', async ({
    FlexCanvas: _,
  }) => {
    /* Test case: https://github.com/epam/ketcher/issues/8974
     * Bug: https://github.com/epam/ketcher/issues/8397
     * Steps:
     * 1. Switch to Macromolecules → Flex mode.
     * 2. Draw a valid polymer chain that meets cyclic structure criteria.
     * 3. Right-click on the selected structure.
     * 4. Select Create cyclic structure from the context menu.
     * Expected Result: After clicking Create cyclic structure, the context menu should automatically close.
     * The cyclic structure should be generated, and the canvas should regain focus immediately.
     */

    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/polymer-chain-that-meets-cyclic-structure-criteria.ket',
    );
    await CommonLeftToolbar(page).areaSelectionTool();
    await selectMonomersAndBonds(page, {
      monomerIds: [68, 69, 82, 83, 73, 76, 71, 72, 80, 79, 81, 84],
      bondIds: [97, 112, 115, 101, 102, 113, 114, 100, 111, 108, 104, 109],
    });
    await ContextMenu(page, getMonomerLocator(page, { monomerId: 80 })).click(
      MonomerOption.ArrangeAsARing,
    );
    await CommonTopRightToolbar(page).setZoomInputValue('60');
    await takeElementScreenshot(
      page,
      getMonomerLocator(page, { monomerId: 198 }),
      {
        padding: 150,
      },
    );
  });

  test('Case 23 - Tooltip is shown in wrong place for ambigous monomers in popup mode', async ({
    FlexCanvas: _,
  }) => {
    /* Test case: https://github.com/epam/ketcher/issues/8974
     * Bug: https://github.com/epam/ketcher/issues/7506
     * Steps:
     * 1. Click the five connected dots icon (it is located to the left of the gear icon in the top-right panel)
     * 2. From the dropdown menu, choose the second option "Macromolecules"
     * 3. In the top panel, click the "A" button (it is located between the flask icon and the RNA icon)
     * 4. Select the third option "Switch to flex layout mode"
     * 5. Click on Folder icon "Open..." in the top left corner of the top panel
     * 6. Add HELM from paste from clipboard way
     * 7. Click the "Add to Canvas" button
     * 8. Hover the mouse over the peptide structure on the Canvas
     * Expected Result: Tooltip should appear directly above the peptide structure
     */

    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'PEPTIDE1{(A,C,D,E,F,G,H,I,K,L,M,N,O,P,Q,R,S,T,U,V,W,Y)}$$$$V2.0',
    );
    const monomer = page.getByText('X').first();
    await monomer.hover({ force: true });
    await page.waitForTimeout(1000);
    await takeElementScreenshot(page, monomer, {
      padding: 100,
    });
  });

  test('Case 24 - Preview for chain of CHEMs works wrong in sequence mode', async ({
    SequenceCanvas: _,
  }) => {
    /* Test case: https://github.com/epam/ketcher/issues/8974
     * Bug: https://github.com/epam/ketcher/issues/5677
     * Steps:
     * 1. Go to Macro - Sequence
     * 2. Load from HELM
     * 3. Hover mouse over @ symbol
     * Expected Result: System should show the list of monomers in the same manner as it is done for ambiguous monomers
     */

    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'CHEM1{[4aPEGMal]}|CHEM2{[4FB]}|CHEM3{[A6OH]}$CHEM2,CHEM1,1:R2-1:R1|CHEM3,CHEM2,1:R2-1:R1$$$V2.0',
    );
    const chainlocator = getSymbolLocator(page, { chainId: 8 });
    await chainlocator.hover({ force: true });
    await page.waitForTimeout(1000);
    await takeElementScreenshot(page, chainlocator, {
      padding: 140,
    });
  });

  test('Case 25 - 5NitInd unsplit nucleotide should be shown as X symbol instead of @ one', async ({
    SequenceCanvas: _,
  }) => {
    /* Test case: https://github.com/epam/ketcher/issues/8974
     * Bug: https://github.com/epam/ketcher/issues/6737
     * Steps:
     * 1. Go to Macro - Sequence mode (clean canvas)
     * 2. Go to RNA tab - Nucleotides section
     * 3. Click on 5NitInd nucleotide
     * Expected Result: X symbol appears on sequence canvas
     */

    await Library(page).openRNASection(RNASection.Nucleotides);
    await Library(page).selectMonomer(Nucleotide._5NitInd);
    await takeElementScreenshot(page, page.getByTestId('sequence-item'), {
      padding: 30,
    });
  });

  test('Case 26 - In case of multipal R1 or R2 groups second R1/R2 groups should be assigned to the smallest available Rn (n>2) if available', async () => {
    /* Test case: https://github.com/epam/ketcher/issues/8974
     * Bug: https://github.com/epam/ketcher/issues/7955
     * Steps:
     * 1. Open Molecules mode (clear canvas)
     * 2. Turn on Show atom Ids option in Settings
     * 3. Load from Extended SMILES using paste from clipboard way
     * 4. Select whole structure
     * 5. Press Create monomer button
     * Expected Result: Second R1 group got converted to R3
     */

    await setSettingsOption(
      page,
      OptionsForDebuggingSetting.ShowAtomIds,
      ResetToSelectToolOption.Off,
    );
    await pasteFromClipboardAndOpenAsNewProject(
      page,
      'C1%91C(C)C(C)C(C)C%92C(C)C(C)C1C.[*:1]%92.[*:1]%91 |$;;;;;;;;;;;;;;_R1;_R1$|',
    );
    await CommonLeftToolbar(page).areaSelectionTool();
    await selectAllStructuresOnCanvas(page);
    await LeftToolbar(page).createMonomer();
    await takeEditorScreenshot(page);
  });

  test('Case 27 - Former molecule selection causes invalid attachment point creation in Monomer creation wizard', async () => {
    /* Test case: https://github.com/epam/ketcher/issues/8974
     * Bug: https://github.com/epam/ketcher/issues/8847
     * Steps:
     * 1. Go to Ketcher Molecules mode (clear canvas)
     * 2. Paste following SMILES on the canvas
     * 3. Select part of the structure
     * 4. Click on the canvas to remove selection
     * 5. Press Create a monomer button
     * Expected Result: No attachment point created
     */

    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCC(C)CCCC(C)CCC');
    await selectAtomAndBonds(page, {
      atomIds: [0, 4],
      bondIds: [0, 1, 2, 3, 4, 5],
    });
    await clickOnCanvas(page, 300, 300);
    await LeftToolbar(page).createMonomer();
    await takeEditorScreenshot(page);
  });

  test('Case 28 - Unable to create more than one nucleotide monomer - system throws exception', async () => {
    /* Test case: https://github.com/epam/ketcher/issues/8974
     * Bug: https://github.com/epam/ketcher/issues/8846
     * Steps:
     * 1. Go to Ketcher Molecules mode (clear canvas)
     * 2. Paste following SMILES on the canvas
     * 3. Select whole structure and press Create a monomer button
     * 4. Create Nucleotide (preset) of this molecule using following options
     * 5. Press Submit button
     * 6. Clear canvas
     * 7. Paste same molecule on canvas again
     * 8. Select it and press Create a monomer button
     * Expected Result: All fields are empty
     */

    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCC(C)CCCC(C)CCC');

    await CommonLeftToolbar(page).areaSelectionTool();
    await selectAllStructuresOnCanvas(page);
    await LeftToolbar(page).createMonomer();
    const dialog = CreateMonomerDialog(page);
    const presetSection = NucleotidePresetSection(page);
    await dialog.selectType(MonomerType.NucleotidePreset);

    await presetSection.setName('N1');

    await presetSection.setupBase({
      atomIds: [0, 1, 2, 3, 4],
      bondIds: [0, 1, 2, 3],
      symbol: Base.Base.alias,
      name: 'B1',
      naturalAnalogue: NucleotideNaturalAnalogue.A,
      HELMAlias: 'BaseAlias',
    });

    await CommonLeftToolbar(page).handTool();
    await page.mouse.move(600, 200);
    await dragMouseTo(450, 250, page);
    await page.mouse.move(600, 200);
    await dragMouseTo(450, 250, page);

    await presetSection.setupSugar({
      atomIds: [5, 6, 7],
      bondIds: [5, 6],
      symbol: Sugar.Sugar.alias,
      name: 'S1',
      HELMAlias: 'SugAlias',
    });

    await presetSection.setupPhosphate({
      atomIds: [8, 9, 10, 11, 12],
      bondIds: [8, 9, 10, 11],
      symbol: Phosphate.Phosphate.alias,
      name: 'P1',
      HELMAlias: 'PhosAlias',
    });

    await dialog.submit();

    await page.waitForTimeout(1000);
    await CommonTopLeftToolbar(page).clearCanvasButton.click();
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCC(C)CCCC(C)CCC');
    await CommonLeftToolbar(page).areaSelectionTool();
    await selectAllStructuresOnCanvas(page);
    await LeftToolbar(page).createMonomer();
    await dialog.selectType(MonomerType.NucleotidePreset);
    await takeEditorScreenshot(page);
    await presetSection.openTab(NucleotidePresetTab.Sugar);
    await takeEditorScreenshot(page);
  });

  test('Case 29 - System should be able to load unknown monomer on any position', async ({
    FlexCanvas: _,
  }) => {
    /* Test case: https://github.com/epam/ketcher/issues/8974
     * Bug: https://github.com/epam/Indigo/issues/3265
     * Steps:
     * 1. Go to Macro - Flex mode
     * 2. Load from AxoLabs
     * Expected Result: System loads sequence of three unknown monomers
     */

    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.AxoLabs,
      "5'-(Unknown1)(Unknown2)(Unknown3)-3'",
    );
    await takeElementScreenshot(
      page,
      getMonomerLocator(page, { monomerId: 6 }),
      {
        padding: 100,
      },
    );
  });

  test('Case 30 - Export to sugar monomer to AxoLabs error message is wrong', async ({
    FlexCanvas: _,
  }) => {
    /* Test case: https://github.com/epam/ketcher/issues/8974
     * Bug: https://github.com/epam/Indigo/issues/3267
     * Steps:
     * 1. Go to Macro - Flex mode
     * 2. Load from HELM
     * 3. Export canvas to AxoLabs file format
     * Expected Result: System throws an error: Convert error! Sequence saver: Sugar monomer '12ddR' has no AxoLabs alias.
     */

    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{[d12r]}$$$$V2.0',
    );
    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MacromoleculesFileFormatType.AxoLabs,
    );
    const errorMessage = await ErrorMessageDialog(page).getErrorMessage();
    expect(errorMessage).toContain(
      'Convert error! Sequence saver: Sugar:12ddR has no AxoLabs alias.',
    );
    await ErrorMessageDialog(page).close();
  });

  test('Case 31 - Layout works wrong', async () => {
    /* Test case: https://github.com/epam/ketcher/issues/8974
     * Bug: https://github.com/epam/Indigo/issues/3291
     * Steps:
     * 1. Go to Macro - Flex mode
     * 2. Load following mol file as New project
     * 3. Make area selection
     * 4. Press Layout button
     * Expected Result: Layout works correct
     */

    await openFileAndAddToCanvasAsNewProject(
      page,
      'Molfiles-V2000/complex-molecule-for-layout.mol',
    );
    await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Lasso);
    await selectWithLasso(page, 420, 290, [
      { x: 740, y: 170 },
      { x: 740, y: 455 },
      { x: 300, y: 455 },
      { x: 300, y: 170 },
      { x: 420, y: 290 },
    ]);
    await layout(page);
    await CommonTopRightToolbar(page).setZoomInputValue('40');
    await takeElementScreenshot(page, getAtomLocator(page, { atomId: 13 }), {
      padding: 210,
    });
  });

  test('Case 32 - Unable to create more than one nucleotide monomer - system throws exception', async () => {
    /* Test case: https://github.com/epam/ketcher/issues/8974
     * Bug: https://github.com/epam/ketcher/issues/8845
     * Steps:
     * 1. Go to Ketcher Molecules mode (clear canvas)
     * 2. Paste following SMILES on the canvas
     * 3. Select whole structure and press Create a monomer button
     * 4. Create Nucleotide (preset) of this molecule using following options
     * 5. Press Submit button
     * Expected Result: All bonds remain in place
     */

    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCC(C)CCCC(C)CCC');
    await CommonLeftToolbar(page).areaSelectionTool();
    await selectAllStructuresOnCanvas(page);
    await LeftToolbar(page).createMonomer();
    const dialog = CreateMonomerDialog(page);
    const presetSection = NucleotidePresetSection(page);
    await dialog.selectType(MonomerType.NucleotidePreset);

    await presetSection.setName('N2');

    await presetSection.setupBase({
      atomIds: [0, 1, 2, 3, 4],
      bondIds: [0, 1, 2, 3],
      symbol: Base.Base.alias,
      name: 'B1',
      naturalAnalogue: NucleotideNaturalAnalogue.A,
      HELMAlias: 'BaseAlias',
    });

    await CommonLeftToolbar(page).handTool();
    await page.mouse.move(600, 200);
    await dragMouseTo(450, 250, page);
    await page.mouse.move(600, 200);
    await dragMouseTo(450, 250, page);

    await presetSection.setupSugar({
      atomIds: [5, 6, 7],
      bondIds: [5, 6],
      symbol: Sugar.Sugar.alias,
      name: 'S1',
      HELMAlias: 'SugAlias',
    });

    await presetSection.setupPhosphate({
      atomIds: [8, 9, 10, 11, 12],
      bondIds: [8, 9, 10, 11],
      symbol: Phosphate.Phosphate.alias,
      name: 'P1',
      HELMAlias: 'PhosAlias',
    });

    await dialog.submit();

    await page.waitForTimeout(1000);
    await takeElementScreenshot(page, getAtomLocator(page, { atomId: 5 }), {
      padding: 240,
    });
  });

  test('Case 33 - When using the “ketcher.setMode(mode)” method, the icon of the "Type mode" drop-down does not change', async ({
    SequenceCanvas: _,
  }) => {
    /* Test case: https://github.com/epam/ketcher/issues/8974
     * Bug: https://github.com/epam/ketcher/issues/4891
     * Steps:
     * 1. Switch to the Macro mode and open the Console
     * 2. Add any nucleotide on the canvas
     * 3. Enter ketcher.setMode('sequence') in the Console and press the “Enter” key
     * 4. Enter ketcher.setMode('snake') in the Console and press the “Enter” key
     * Expected Result: The icon of the "Type mode" drop-down is changed, when switching the mode via the Console
     */

    await Library(page).openRNASection(RNASection.Nucleotides);
    await Library(page).selectMonomer(Nucleotide.InvdA);
    await page.waitForTimeout(1000);
    await setMode(page, 'sequence');
    await takeElementScreenshot(page, page.getByTestId('layout-mode'));
    await setMode(page, 'snake');
    await takeElementScreenshot(page, page.getByTestId('layout-mode'));
  });

  test('Case 34 - System does not allow to add monomers with the same structure but different names (part2)', async ({
    FlexCanvas: _,
  }) => {
    /* Test case: https://github.com/epam/ketcher/issues/8974
     * Bug: https://github.com/epam/Indigo/issues/3278
     * Steps:
     * 1. Open Macromolecules - Flex mode (clean canvas)
     * 2. Go to console and paste code
     * Expected Result:
     * System adds _Base1 and _Base2 bases to the library.
     * All of them are operational and it is possible to add them to the canvas
     */

    const sdf =
      '\n  -INDIGO-10092512402D\n\n  0  0  0  0  0  0  0  0  0  0  0 V3000\nM  V30 BEGIN CTAB\nM  V30 COUNTS 1 0 0 0 0\nM  V30 BEGIN ATOM\nM  V30 1 _Base1 10.9051 -9.2 0.0 0 CLASS=BASE\nM  V30 END ATOM\nM  V30 BEGIN BOND\nM  V30 END BOND\nM  V30 END CTAB\nM  V30 BEGIN TEMPLATE\nM  V30 TEMPLATE 1 BASE/_Base1/_Base1 NATREPLACE=BASE/A\nM  V30 BEGIN CTAB\nM  V30 COUNTS 13 12 5 0 0\nM  V30 BEGIN ATOM\nM  V30 1 H -4.33 0.75 0.0 0\nM  V30 2 P -3.464 0.25 0.0 0\nM  V30 3 C -2.598 0.75 0.0 0\nM  V30 4 C -1.732 0.25 0.0 0\nM  V30 5 C -0.866 0.75 0.0 0\nM  V30 6 C 0.0 0.25 0.0 0\nM  V30 7 C 0.866 0.75 0.0 0\nM  V30 8 C 1.732 0.25 0.0 0\nM  V30 9 C 2.598 0.75 0.0 0\nM  V30 10 C 3.464 0.25 0.0 0\nM  V30 11 H 4.33 0.75 0.0 0\nM  V30 12 H -3.464 -0.75 0.0 0\nM  V30 13 H -1.732 -0.75 0.0 0\nM  V30 END ATOM\nM  V30 BEGIN BOND\nM  V30 1 1 1 2\nM  V30 2 1 2 3\nM  V30 3 1 3 4\nM  V30 4 1 4 5\nM  V30 5 1 5 6\nM  V30 6 1 6 7\nM  V30 7 1 7 8\nM  V30 8 1 8 9\nM  V30 9 1 9 10\nM  V30 10 1 10 11\nM  V30 11 1 2 12\nM  V30 12 1 4 13\nM  V30 END BOND\nM  V30 BEGIN SGROUP\nM  V30 1 SUP 1 ATOMS=(1 1) XBONDS=(1 1) BRKXYZ=(9 0.433000 -0.250000 0.000000-\nM  V30  0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLASS=-\nM  V30 LGRP\nM  V30 2 SUP 2 ATOMS=(1 11) XBONDS=(1 10) BRKXYZ=(9 -0.433000 -0.250000 0.000-\nM  V30 000 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLA-\nM  V30 SS=LGRP\nM  V30 3 SUP 3 ATOMS=(1 12) XBONDS=(1 11) BRKXYZ=(9 0.000000 0.500000 0.00000-\nM  V30 0 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLASS-\nM  V30 =LGRP\nM  V30 4 SUP 4 ATOMS=(1 13) XBONDS=(1 12) BRKXYZ=(9 0.000000 0.500000 0.00000-\nM  V30 0 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLASS-\nM  V30 =LGRP\nM  V30 5 SUP 5 ATOMS=(9 2 3 4 5 6 7 8 9 10) XBONDS=(4 1 11 12 10) BRKXYZ=(9 --\nM  V30 0.433000 0.250000 0.000000 0.000000 -0.500000 0.000000 0.000000 0.0000-\nM  V30 00 0.000000) BRKXYZ=(9 0.000000 -0.500000 0.000000 0.433000 0.250000 0-\nM  V30 .000000 0.000000 0.000000 0.000000) LABEL=_Base1 CLASS=BASE SAP=(3 2 1-\nM  V30  Al) SAP=(3 10 11 Br) SAP=(3 2 12 Cx) SAP=(3 4 13 Dx) NATREPLACE=BASE/A\nM  V30 END SGROUP\nM  V30 END CTAB\nM  V30 END TEMPLATE\nM  END\n>  <type>\nmonomerTemplate\n\n>  <aliasHELM>\n_Base1_HELM\n\n$$$$\n\n  -INDIGO-10092512402D\n\n  0  0  0  0  0  0  0  0  0  0  0 V3000\nM  V30 BEGIN CTAB\nM  V30 COUNTS 1 0 0 0 0\nM  V30 BEGIN ATOM\nM  V30 1 _Base2 10.9051 -9.2 0.0 0 CLASS=BASE\nM  V30 END ATOM\nM  V30 BEGIN BOND\nM  V30 END BOND\nM  V30 END CTAB\nM  V30 BEGIN TEMPLATE\nM  V30 TEMPLATE 1 BASE/_Base2/_Base2 NATREPLACE=BASE/A\nM  V30 BEGIN CTAB\nM  V30 COUNTS 13 12 5 0 0\nM  V30 BEGIN ATOM\nM  V30 1 H -4.33 0.75 0.0 0\nM  V30 2 P -3.464 0.25 0.0 0\nM  V30 3 C -2.598 0.75 0.0 0\nM  V30 4 C -1.732 0.25 0.0 0\nM  V30 5 C -0.866 0.75 0.0 0\nM  V30 6 C 0.0 0.25 0.0 0\nM  V30 7 C 0.866 0.75 0.0 0\nM  V30 8 C 1.732 0.25 0.0 0\nM  V30 9 C 2.598 0.75 0.0 0\nM  V30 10 C 3.464 0.25 0.0 0\nM  V30 11 H 4.33 0.75 0.0 0\nM  V30 12 H -3.464 -0.75 0.0 0\nM  V30 13 H -1.732 -0.75 0.0 0\nM  V30 END ATOM\nM  V30 BEGIN BOND\nM  V30 1 1 1 2\nM  V30 2 1 2 3\nM  V30 3 1 3 4\nM  V30 4 1 4 5\nM  V30 5 1 5 6\nM  V30 6 1 6 7\nM  V30 7 1 7 8\nM  V30 8 1 8 9\nM  V30 9 1 9 10\nM  V30 10 1 10 11\nM  V30 11 1 2 12\nM  V30 12 1 4 13\nM  V30 END BOND\nM  V30 BEGIN SGROUP\nM  V30 1 SUP 1 ATOMS=(1 1) XBONDS=(1 1) BRKXYZ=(9 0.433000 -0.250000 0.000000-\nM  V30  0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLASS=-\nM  V30 LGRP\nM  V30 2 SUP 2 ATOMS=(1 11) XBONDS=(1 10) BRKXYZ=(9 -0.433000 -0.250000 0.000-\nM  V30 000 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLA-\nM  V30 SS=LGRP\nM  V30 3 SUP 3 ATOMS=(1 12) XBONDS=(1 11) BRKXYZ=(9 0.000000 0.500000 0.00000-\nM  V30 0 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLASS-\nM  V30 =LGRP\nM  V30 4 SUP 4 ATOMS=(1 13) XBONDS=(1 12) BRKXYZ=(9 0.000000 0.500000 0.00000-\nM  V30 0 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLASS-\nM  V30 =LGRP\nM  V30 5 SUP 5 ATOMS=(9 2 3 4 5 6 7 8 9 10) XBONDS=(4 1 11 12 10) BRKXYZ=(9 --\nM  V30 0.433000 0.250000 0.000000 0.000000 -0.500000 0.000000 0.000000 0.0000-\nM  V30 00 0.000000) BRKXYZ=(9 0.000000 -0.500000 0.000000 0.433000 0.250000 0-\nM  V30 .000000 0.000000 0.000000 0.000000) LABEL=_Base2 CLASS=BASE SAP=(3 2 1-\nM  V30  Al) SAP=(3 10 11 Br) SAP=(3 2 12 Cx) SAP=(3 4 13 Dx) NATREPLACE=BASE/A\nM  V30 END SGROUP\nM  V30 END CTAB\nM  V30 END TEMPLATE\nM  END\n>  <type>\nmonomerTemplate\n\n>  <aliasHELM>\n_Base2_HELM\n\n$$$$\n';
    const error = await updateMonomersLibrary(page, sdf);
    expect(error).toBeNull();

    expect(await Library(page).isMonomerExist(Base._Base1)).toBeTruthy();
    expect(await Library(page).isMonomerExist(Base._Base2)).toBeTruthy();

    await Library(page).dragMonomerOnCanvas(Base._Base1, {
      x: 0,
      y: 0,
      fromCenter: true,
    });

    await Library(page).dragMonomerOnCanvas(Base._Base2, {
      x: 30,
      y: 10,
      fromCenter: true,
    });
    await takeElementScreenshot(
      page,
      getMonomerLocator(page, { monomerId: 0 }),
      {
        padding: 40,
      },
    );
  });

  test('Case 35 - System adds broken Preset to the library (part2)', async ({
    FlexCanvas: _,
  }) => {
    /* Test case: https://github.com/epam/ketcher/issues/8974
     * Bug: https://github.com/epam/Indigo/issues/3277
     * Steps:
     * 1. Open Macromolecules - Flex mode (clean canvas)
     * 2. Go to console and paste code
     * Expected Result:
     * System adds _A1 and _A2 presets and their components (Sugar1 sugar, Base1 base and Phosphate1 phosphate) to the library.
     * All of them are operational and it is possible to add them to the canvas
     */

    const sdf =
      '\r\n  -INDIGO-10092514292D\r\n\r\n  0  0  0  0  0  0  0  0  0  0  0 V3000\r\nM  V30 BEGIN CTAB\r\nM  V30 COUNTS 3 2 0 0 0\r\nM  V30 BEGIN ATOM\r\nM  V30 1 Base1 7.7 -8.025 0.0 0 CLASS=BASE SEQID=1 ATTCHORD=(2 3 Al)\r\nM  V30 2 Phosphate1 9.2 -6.525 0.0 0 CLASS=PHOSPHATE SEQID=1 ATTCHORD=(2 3 Al-\r\nM  V30 )\r\nM  V30 3 Sugar1 7.7 -6.525 0.0 0 CLASS=SUGAR SEQID=1 ATTCHORD=(4 1 Cx 2 Br)\r\nM  V30 END ATOM\r\nM  V30 BEGIN BOND\r\nM  V30 1 1 3 1\r\nM  V30 2 1 3 2\r\nM  V30 END BOND\r\nM  V30 END CTAB\r\nM  V30 BEGIN TEMPLATE\r\nM  V30 TEMPLATE 1 BASE/Base1/Base1 NATREPLACE=BASE/U\r\nM  V30 BEGIN CTAB\r\nM  V30 COUNTS 13 12 5 0 0\r\nM  V30 BEGIN ATOM\r\nM  V30 1 H -4.33 0.75 0.0 0\r\nM  V30 2 C -3.464 0.25 0.0 0\r\nM  V30 3 C -2.598 0.75 0.0 0\r\nM  V30 4 C -1.732 0.25 0.0 0\r\nM  V30 5 C -0.866 0.75 0.0 0\r\nM  V30 6 C 0.0 0.25 0.0 0\r\nM  V30 7 C 0.866 0.75 0.0 0\r\nM  V30 8 C 1.732 0.25 0.0 0\r\nM  V30 9 C 2.598 0.75 0.0 0\r\nM  V30 10 C 3.464 0.25 0.0 0\r\nM  V30 11 H 4.33 0.75 0.0 0\r\nM  V30 12 H -3.464 -0.75 0.0 0\r\nM  V30 13 H -1.732 -0.75 0.0 0\r\nM  V30 END ATOM\r\nM  V30 BEGIN BOND\r\nM  V30 1 1 1 2\r\nM  V30 2 1 2 3\r\nM  V30 3 1 3 4\r\nM  V30 4 1 4 5\r\nM  V30 5 1 5 6\r\nM  V30 6 1 6 7\r\nM  V30 7 1 7 8\r\nM  V30 8 1 8 9\r\nM  V30 9 1 9 10\r\nM  V30 10 1 10 11\r\nM  V30 11 1 2 12\r\nM  V30 12 1 4 13\r\nM  V30 END BOND\r\nM  V30 BEGIN SGROUP\r\nM  V30 1 SUP 1 ATOMS=(1 1) XBONDS=(1 1) BRKXYZ=(9 0.433000 -0.250000 0.000000-\r\nM  V30  0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLASS=-\r\nM  V30 LGRP\r\nM  V30 2 SUP 2 ATOMS=(1 11) XBONDS=(1 10) BRKXYZ=(9 -0.433000 -0.250000 0.000-\r\nM  V30 000 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLA-\r\nM  V30 SS=LGRP\r\nM  V30 3 SUP 3 ATOMS=(1 12) XBONDS=(1 11) BRKXYZ=(9 0.000000 0.500000 0.00000-\r\nM  V30 0 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLASS-\r\nM  V30 =LGRP\r\nM  V30 4 SUP 4 ATOMS=(1 13) XBONDS=(1 12) BRKXYZ=(9 0.000000 0.500000 0.00000-\r\nM  V30 0 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLASS-\r\nM  V30 =LGRP\r\nM  V30 5 SUP 5 ATOMS=(9 2 3 4 5 6 7 8 9 10) XBONDS=(4 1 11 12 10) BRKXYZ=(9 --\r\nM  V30 0.433000 0.250000 0.000000 0.000000 -0.500000 0.000000 0.000000 0.0000-\r\nM  V30 00 0.000000) BRKXYZ=(9 0.000000 -0.500000 0.000000 0.433000 0.250000 0-\r\nM  V30 .000000 0.000000 0.000000 0.000000) LABEL=Base1 CLASS=BASE SAP=(3 2 1 -\r\nM  V30 Al) SAP=(3 10 11 Br) SAP=(3 2 12 Cx) SAP=(3 4 13 Dx) NATREPLACE=BASE/U\r\nM  V30 END SGROUP\r\nM  V30 END CTAB\r\nM  V30 TEMPLATE 2 PHOSPHATE/Phosphate1/Phosphate1 NATREPLACE=PHOSPHATE/P\r\nM  V30 BEGIN CTAB\r\nM  V30 COUNTS 16 15 6 0 0\r\nM  V30 BEGIN ATOM\r\nM  V30 1 H -5.196 0.75 0.0 0\r\nM  V30 2 C -4.33 0.25 0.0 0\r\nM  V30 3 C -3.464 0.75 0.0 0\r\nM  V30 4 C -2.598 0.25 0.0 0\r\nM  V30 5 C -1.732 0.75 0.0 0\r\nM  V30 6 C -0.866 0.25 0.0 0\r\nM  V30 7 C 0.0 0.75 0.0 0\r\nM  V30 8 C 0.866 0.25 0.0 0\r\nM  V30 9 C 1.732 0.75 0.0 0\r\nM  V30 10 C 2.598 0.25 0.0 0\r\nM  V30 11 C 3.464 0.75 0.0 0\r\nM  V30 12 C 4.33 0.25 0.0 0\r\nM  V30 13 H 5.196 0.75 0.0 0\r\nM  V30 14 H -4.33 -0.75 0.0 0\r\nM  V30 15 H -2.598 -0.75 0.0 0\r\nM  V30 16 H -0.866 -0.75 0.0 0\r\nM  V30 END ATOM\r\nM  V30 BEGIN BOND\r\nM  V30 1 1 1 2\r\nM  V30 2 1 2 3\r\nM  V30 3 1 3 4\r\nM  V30 4 1 4 5\r\nM  V30 5 1 5 6\r\nM  V30 6 1 6 7\r\nM  V30 7 1 7 8\r\nM  V30 8 1 8 9\r\nM  V30 9 1 9 10\r\nM  V30 10 1 10 11\r\nM  V30 11 1 11 12\r\nM  V30 12 1 12 13\r\nM  V30 13 1 2 14\r\nM  V30 14 1 4 15\r\nM  V30 15 1 6 16\r\nM  V30 END BOND\r\nM  V30 BEGIN SGROUP\r\nM  V30 1 SUP 1 ATOMS=(1 1) XBONDS=(1 1) BRKXYZ=(9 0.433000 -0.250000 0.000000-\r\nM  V30  0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLASS=-\r\nM  V30 LGRP\r\nM  V30 2 SUP 2 ATOMS=(1 13) XBONDS=(1 12) BRKXYZ=(9 -0.433000 -0.250000 0.000-\r\nM  V30 000 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLA-\r\nM  V30 SS=LGRP\r\nM  V30 3 SUP 3 ATOMS=(1 14) XBONDS=(1 13) BRKXYZ=(9 0.000000 0.500000 0.00000-\r\nM  V30 0 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLASS-\r\nM  V30 =LGRP\r\nM  V30 4 SUP 4 ATOMS=(1 15) XBONDS=(1 14) BRKXYZ=(9 0.000000 0.500000 0.00000-\r\nM  V30 0 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLASS-\r\nM  V30 =LGRP\r\nM  V30 5 SUP 5 ATOMS=(1 16) XBONDS=(1 15) BRKXYZ=(9 0.000000 0.500000 0.00000-\r\nM  V30 0 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLASS-\r\nM  V30 =LGRP\r\nM  V30 6 SUP 6 ATOMS=(11 2 3 4 5 6 7 8 9 10 11 12) XBONDS=(5 1 13 14 15 12) B-\r\nM  V30 RKXYZ=(9 -0.433000 0.250000 0.000000 0.000000 -0.500000 0.000000 0.000-\r\nM  V30 000 0.000000 0.000000) BRKXYZ=(9 0.000000 -0.500000 0.000000 0.000000 -\r\nM  V30 -0.500000 0.000000 0.000000 0.000000 0.000000) BRKXYZ=(9 0.433000 0.25-\r\nM  V30 0000 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) L-\r\nM  V30 ABEL=Phosphate1 CLASS=PHOSPHATE SAP=(3 2 1 Al) SAP=(3 12 13 Br) SAP=(3-\r\nM  V30  2 14 Cx) SAP=(3 4 15 Dx) SAP=(3 6 16 Ex) NATREPLACE=PHOSPHATE/P\r\nM  V30 END SGROUP\r\nM  V30 END CTAB\r\nM  V30 TEMPLATE 3 SUGAR/Sugar1/Sugar1 NATREPLACE=SUGAR/R\r\nM  V30 BEGIN CTAB\r\nM  V30 COUNTS 14 13 4 0 0\r\nM  V30 BEGIN ATOM\r\nM  V30 1 H -5.196 0.75 0.0 0\r\nM  V30 2 C -4.33 0.25 0.0 0\r\nM  V30 3 C -3.464 0.75 0.0 0\r\nM  V30 4 C -2.598 0.25 0.0 0\r\nM  V30 5 C -1.732 0.75 0.0 0\r\nM  V30 6 C -0.866 0.25 0.0 0\r\nM  V30 7 C 0.0 0.75 0.0 0\r\nM  V30 8 C 0.866 0.25 0.0 0\r\nM  V30 9 C 1.732 0.75 0.0 0\r\nM  V30 10 C 2.598 0.25 0.0 0\r\nM  V30 11 C 3.464 0.75 0.0 0\r\nM  V30 12 C 4.33 0.25 0.0 0\r\nM  V30 13 H 5.196 0.75 0.0 0\r\nM  V30 14 H -4.33 -0.75 0.0 0\r\nM  V30 END ATOM\r\nM  V30 BEGIN BOND\r\nM  V30 1 1 1 2\r\nM  V30 2 1 2 3\r\nM  V30 3 1 3 4\r\nM  V30 4 1 4 5\r\nM  V30 5 1 5 6\r\nM  V30 6 1 6 7\r\nM  V30 7 1 7 8\r\nM  V30 8 1 8 9\r\nM  V30 9 1 9 10\r\nM  V30 10 1 10 11\r\nM  V30 11 1 11 12\r\nM  V30 12 1 12 13\r\nM  V30 13 1 2 14\r\nM  V30 END BOND\r\nM  V30 BEGIN SGROUP\r\nM  V30 1 SUP 1 ATOMS=(1 1) XBONDS=(1 1) BRKXYZ=(9 0.433000 -0.250000 0.000000-\r\nM  V30  0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLASS=-\r\nM  V30 LGRP\r\nM  V30 2 SUP 2 ATOMS=(1 13) XBONDS=(1 12) BRKXYZ=(9 -0.433000 -0.250000 0.000-\r\nM  V30 000 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLA-\r\nM  V30 SS=LGRP\r\nM  V30 3 SUP 3 ATOMS=(1 14) XBONDS=(1 13) BRKXYZ=(9 0.000000 0.500000 0.00000-\r\nM  V30 0 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLASS-\r\nM  V30 =LGRP\r\nM  V30 4 SUP 4 ATOMS=(11 2 3 4 5 6 7 8 9 10 11 12) XBONDS=(3 1 13 12) BRKXYZ=-\r\nM  V30 (9 -0.433000 0.250000 0.000000 0.000000 -0.500000 0.000000 0.000000 0.-\r\nM  V30 000000 0.000000) BRKXYZ=(9 0.433000 0.250000 0.000000 0.000000 0.00000-\r\nM  V30 0 0.000000 0.000000 0.000000 0.000000) LABEL=Sugar1 CLASS=SUGAR SAP=(3-\r\nM  V30  2 1 Al) SAP=(3 12 13 Br) SAP=(3 2 14 Cx) NATREPLACE=SUGAR/R\r\nM  V30 END SGROUP\r\nM  V30 END CTAB\r\nM  V30 END TEMPLATE\r\nM  END\r\n>  <type>\r\nmonomerGroupTemplate\r\n\r\n>  <groupClass>\r\nRNA\r\n\r\n>  <groupName>\r\n_A1\r\n\r\n>  <idtAliases>\r\nbase=r_A1\r\n\r\n$$$$\r\n\r\n  -INDIGO-10092514292D\r\n\r\n  0  0  0  0  0  0  0  0  0  0  0 V3000\r\nM  V30 BEGIN CTAB\r\nM  V30 COUNTS 3 2 0 0 0\r\nM  V30 BEGIN ATOM\r\nM  V30 1 Base1 7.7 -8.025 0.0 0 CLASS=BASE SEQID=1 ATTCHORD=(2 3 Al)\r\nM  V30 2 Phosphate1 9.2 -6.525 0.0 0 CLASS=PHOSPHATE SEQID=1 ATTCHORD=(2 3 Al-\r\nM  V30 )\r\nM  V30 3 Sugar1 7.7 -6.525 0.0 0 CLASS=SUGAR SEQID=1 ATTCHORD=(4 1 Cx 2 Br)\r\nM  V30 END ATOM\r\nM  V30 BEGIN BOND\r\nM  V30 1 1 3 1\r\nM  V30 2 1 3 2\r\nM  V30 END BOND\r\nM  V30 END CTAB\r\nM  V30 BEGIN TEMPLATE\r\nM  V30 TEMPLATE 1 BASE/Base1/Base1 NATREPLACE=BASE/U\r\nM  V30 BEGIN CTAB\r\nM  V30 COUNTS 13 12 5 0 0\r\nM  V30 BEGIN ATOM\r\nM  V30 1 H -4.33 0.75 0.0 0\r\nM  V30 2 C -3.464 0.25 0.0 0\r\nM  V30 3 C -2.598 0.75 0.0 0\r\nM  V30 4 C -1.732 0.25 0.0 0\r\nM  V30 5 C -0.866 0.75 0.0 0\r\nM  V30 6 C 0.0 0.25 0.0 0\r\nM  V30 7 C 0.866 0.75 0.0 0\r\nM  V30 8 C 1.732 0.25 0.0 0\r\nM  V30 9 C 2.598 0.75 0.0 0\r\nM  V30 10 C 3.464 0.25 0.0 0\r\nM  V30 11 H 4.33 0.75 0.0 0\r\nM  V30 12 H -3.464 -0.75 0.0 0\r\nM  V30 13 H -1.732 -0.75 0.0 0\r\nM  V30 END ATOM\r\nM  V30 BEGIN BOND\r\nM  V30 1 1 1 2\r\nM  V30 2 1 2 3\r\nM  V30 3 1 3 4\r\nM  V30 4 1 4 5\r\nM  V30 5 1 5 6\r\nM  V30 6 1 6 7\r\nM  V30 7 1 7 8\r\nM  V30 8 1 8 9\r\nM  V30 9 1 9 10\r\nM  V30 10 1 10 11\r\nM  V30 11 1 2 12\r\nM  V30 12 1 4 13\r\nM  V30 END BOND\r\nM  V30 BEGIN SGROUP\r\nM  V30 1 SUP 1 ATOMS=(1 1) XBONDS=(1 1) BRKXYZ=(9 0.433000 -0.250000 0.000000-\r\nM  V30  0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLASS=-\r\nM  V30 LGRP\r\nM  V30 2 SUP 2 ATOMS=(1 11) XBONDS=(1 10) BRKXYZ=(9 -0.433000 -0.250000 0.000-\r\nM  V30 000 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLA-\r\nM  V30 SS=LGRP\r\nM  V30 3 SUP 3 ATOMS=(1 12) XBONDS=(1 11) BRKXYZ=(9 0.000000 0.500000 0.00000-\r\nM  V30 0 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLASS-\r\nM  V30 =LGRP\r\nM  V30 4 SUP 4 ATOMS=(1 13) XBONDS=(1 12) BRKXYZ=(9 0.000000 0.500000 0.00000-\r\nM  V30 0 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLASS-\r\nM  V30 =LGRP\r\nM  V30 5 SUP 5 ATOMS=(9 2 3 4 5 6 7 8 9 10) XBONDS=(4 1 11 12 10) BRKXYZ=(9 --\r\nM  V30 0.433000 0.250000 0.000000 0.000000 -0.500000 0.000000 0.000000 0.0000-\r\nM  V30 00 0.000000) BRKXYZ=(9 0.000000 -0.500000 0.000000 0.433000 0.250000 0-\r\nM  V30 .000000 0.000000 0.000000 0.000000) LABEL=Base1 CLASS=BASE SAP=(3 2 1 -\r\nM  V30 Al) SAP=(3 10 11 Br) SAP=(3 2 12 Cx) SAP=(3 4 13 Dx) NATREPLACE=BASE/U\r\nM  V30 END SGROUP\r\nM  V30 END CTAB\r\nM  V30 TEMPLATE 2 PHOSPHATE/Phosphate1/Phosphate1 NATREPLACE=PHOSPHATE/P\r\nM  V30 BEGIN CTAB\r\nM  V30 COUNTS 16 15 6 0 0\r\nM  V30 BEGIN ATOM\r\nM  V30 1 H -5.196 0.75 0.0 0\r\nM  V30 2 C -4.33 0.25 0.0 0\r\nM  V30 3 C -3.464 0.75 0.0 0\r\nM  V30 4 C -2.598 0.25 0.0 0\r\nM  V30 5 C -1.732 0.75 0.0 0\r\nM  V30 6 C -0.866 0.25 0.0 0\r\nM  V30 7 C 0.0 0.75 0.0 0\r\nM  V30 8 C 0.866 0.25 0.0 0\r\nM  V30 9 C 1.732 0.75 0.0 0\r\nM  V30 10 C 2.598 0.25 0.0 0\r\nM  V30 11 C 3.464 0.75 0.0 0\r\nM  V30 12 C 4.33 0.25 0.0 0\r\nM  V30 13 H 5.196 0.75 0.0 0\r\nM  V30 14 H -4.33 -0.75 0.0 0\r\nM  V30 15 H -2.598 -0.75 0.0 0\r\nM  V30 16 H -0.866 -0.75 0.0 0\r\nM  V30 END ATOM\r\nM  V30 BEGIN BOND\r\nM  V30 1 1 1 2\r\nM  V30 2 1 2 3\r\nM  V30 3 1 3 4\r\nM  V30 4 1 4 5\r\nM  V30 5 1 5 6\r\nM  V30 6 1 6 7\r\nM  V30 7 1 7 8\r\nM  V30 8 1 8 9\r\nM  V30 9 1 9 10\r\nM  V30 10 1 10 11\r\nM  V30 11 1 11 12\r\nM  V30 12 1 12 13\r\nM  V30 13 1 2 14\r\nM  V30 14 1 4 15\r\nM  V30 15 1 6 16\r\nM  V30 END BOND\r\nM  V30 BEGIN SGROUP\r\nM  V30 1 SUP 1 ATOMS=(1 1) XBONDS=(1 1) BRKXYZ=(9 0.433000 -0.250000 0.000000-\r\nM  V30  0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLASS=-\r\nM  V30 LGRP\r\nM  V30 2 SUP 2 ATOMS=(1 13) XBONDS=(1 12) BRKXYZ=(9 -0.433000 -0.250000 0.000-\r\nM  V30 000 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLA-\r\nM  V30 SS=LGRP\r\nM  V30 3 SUP 3 ATOMS=(1 14) XBONDS=(1 13) BRKXYZ=(9 0.000000 0.500000 0.00000-\r\nM  V30 0 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLASS-\r\nM  V30 =LGRP\r\nM  V30 4 SUP 4 ATOMS=(1 15) XBONDS=(1 14) BRKXYZ=(9 0.000000 0.500000 0.00000-\r\nM  V30 0 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLASS-\r\nM  V30 =LGRP\r\nM  V30 5 SUP 5 ATOMS=(1 16) XBONDS=(1 15) BRKXYZ=(9 0.000000 0.500000 0.00000-\r\nM  V30 0 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLASS-\r\nM  V30 =LGRP\r\nM  V30 6 SUP 6 ATOMS=(11 2 3 4 5 6 7 8 9 10 11 12) XBONDS=(5 1 13 14 15 12) B-\r\nM  V30 RKXYZ=(9 -0.433000 0.250000 0.000000 0.000000 -0.500000 0.000000 0.000-\r\nM  V30 000 0.000000 0.000000) BRKXYZ=(9 0.000000 -0.500000 0.000000 0.000000 -\r\nM  V30 -0.500000 0.000000 0.000000 0.000000 0.000000) BRKXYZ=(9 0.433000 0.25-\r\nM  V30 0000 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) L-\r\nM  V30 ABEL=Phosphate1 CLASS=PHOSPHATE SAP=(3 2 1 Al) SAP=(3 12 13 Br) SAP=(3-\r\nM  V30  2 14 Cx) SAP=(3 4 15 Dx) SAP=(3 6 16 Ex) NATREPLACE=PHOSPHATE/P\r\nM  V30 END SGROUP\r\nM  V30 END CTAB\r\nM  V30 TEMPLATE 3 SUGAR/Sugar1/Sugar1 NATREPLACE=SUGAR/R\r\nM  V30 BEGIN CTAB\r\nM  V30 COUNTS 14 13 4 0 0\r\nM  V30 BEGIN ATOM\r\nM  V30 1 H -5.196 0.75 0.0 0\r\nM  V30 2 C -4.33 0.25 0.0 0\r\nM  V30 3 C -3.464 0.75 0.0 0\r\nM  V30 4 C -2.598 0.25 0.0 0\r\nM  V30 5 C -1.732 0.75 0.0 0\r\nM  V30 6 C -0.866 0.25 0.0 0\r\nM  V30 7 C 0.0 0.75 0.0 0\r\nM  V30 8 C 0.866 0.25 0.0 0\r\nM  V30 9 C 1.732 0.75 0.0 0\r\nM  V30 10 C 2.598 0.25 0.0 0\r\nM  V30 11 C 3.464 0.75 0.0 0\r\nM  V30 12 C 4.33 0.25 0.0 0\r\nM  V30 13 H 5.196 0.75 0.0 0\r\nM  V30 14 H -4.33 -0.75 0.0 0\r\nM  V30 END ATOM\r\nM  V30 BEGIN BOND\r\nM  V30 1 1 1 2\r\nM  V30 2 1 2 3\r\nM  V30 3 1 3 4\r\nM  V30 4 1 4 5\r\nM  V30 5 1 5 6\r\nM  V30 6 1 6 7\r\nM  V30 7 1 7 8\r\nM  V30 8 1 8 9\r\nM  V30 9 1 9 10\r\nM  V30 10 1 10 11\r\nM  V30 11 1 11 12\r\nM  V30 12 1 12 13\r\nM  V30 13 1 2 14\r\nM  V30 END BOND\r\nM  V30 BEGIN SGROUP\r\nM  V30 1 SUP 1 ATOMS=(1 1) XBONDS=(1 1) BRKXYZ=(9 0.433000 -0.250000 0.000000-\r\nM  V30  0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLASS=-\r\nM  V30 LGRP\r\nM  V30 2 SUP 2 ATOMS=(1 13) XBONDS=(1 12) BRKXYZ=(9 -0.433000 -0.250000 0.000-\r\nM  V30 000 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLA-\r\nM  V30 SS=LGRP\r\nM  V30 3 SUP 3 ATOMS=(1 14) XBONDS=(1 13) BRKXYZ=(9 0.000000 0.500000 0.00000-\r\nM  V30 0 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLASS-\r\nM  V30 =LGRP\r\nM  V30 4 SUP 4 ATOMS=(11 2 3 4 5 6 7 8 9 10 11 12) XBONDS=(3 1 13 12) BRKXYZ=-\r\nM  V30 (9 -0.433000 0.250000 0.000000 0.000000 -0.500000 0.000000 0.000000 0.-\r\nM  V30 000000 0.000000) BRKXYZ=(9 0.433000 0.250000 0.000000 0.000000 0.00000-\r\nM  V30 0 0.000000 0.000000 0.000000 0.000000) LABEL=Sugar1 CLASS=SUGAR SAP=(3-\r\nM  V30  2 1 Al) SAP=(3 12 13 Br) SAP=(3 2 14 Cx) NATREPLACE=SUGAR/R\r\nM  V30 END SGROUP\r\nM  V30 END CTAB\r\nM  V30 END TEMPLATE\r\nM  END\r\n>  <type>\r\nmonomerGroupTemplate\r\n\r\n>  <groupClass>\r\nRNA\r\n\r\n>  <groupName>\r\n_A2\r\n\r\n>  <idtAliases>\r\nbase=r_A2\r\n\r\n$$$$\r\n';
    const error = await updateMonomersLibrary(page, sdf);
    expect(error).toBeNull();

    expect(await Library(page).isMonomerExist(Preset._A1)).toBeTruthy();
    expect(await Library(page).isMonomerExist(Preset._A2)).toBeTruthy();
    expect(await Library(page).isMonomerExist(Sugar.Sugar1)).toBeTruthy();
    expect(
      await Library(page).isMonomerExist(Phosphate.Phosphate1),
    ).toBeTruthy();
    expect(await Library(page).isMonomerExist(Base.Base1)).toBeTruthy();

    await Library(page).dragMonomerOnCanvas(Preset._A1, {
      x: 0,
      y: 0,
      fromCenter: true,
    });
    await Library(page).dragMonomerOnCanvas(Preset._A2, {
      x: 40,
      y: 30,
      fromCenter: true,
    });
    await takeElementScreenshot(
      page,
      getMonomerLocator(page, { monomerId: 0 }),
      {
        padding: 100,
      },
    );

    const locatorA2 = await Library(page).getMonomerLibraryCardLocator(
      Preset._A2,
    );
    await locatorA2.hover();
    await page.waitForTimeout(1000);
    await takeElementScreenshot(
      page,
      Library(page).getMonomerLibraryCardLocator(Preset._A2),
      {
        padding: 200,
      },
    );
  });

  test('Case 36 - indigoSaveCdxml does not support reaction molecules', async () => {
    /* Test case: https://github.com/epam/ketcher/issues/8974
     * Bug: https://github.com/epam/Indigo/issues/3261
     * Steps:
     * 1. paste cdxml file with reaction
     * Expected Result: The cdxml() function should return the cdxml data for the molecule
     */

    await openFileAndAddToCanvasAsNewProject(page, 'CDXML/cdxml-3261.cdxml');
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'CDXML/cdxml-3261-expected.cdxml',
      FileType.CDXML,
    );
  });

  test('Case 37 - System ignored HELM alias for bases on monomer load to Library', async ({
    FlexCanvas: _,
  }) => {
    /* Test case: https://github.com/epam/ketcher/issues/8974
     * Bug: https://github.com/epam/Indigo/issues/3269
     * Steps:
     * 1. Open Macromolecules - Flex mode (clean canvas)
     * 2. Go to console and execute following commands
     * 3. Put appeared in the Libraty _Base3 base to the canvas, put R sugar and connect them with bond
     * 4. Export canvas to HELM
     * Expected Result: RNA1{r([_Base3_HELM***---])}$$$$V2.0
     */

    const sdf =
      '\n  -INDIGO-10092512402D\n\n  0  0  0  0  0  0  0  0  0  0  0 V3000\nM  V30 BEGIN CTAB\nM  V30 COUNTS 1 0 0 0 0\nM  V30 BEGIN ATOM\nM  V30 1 _Base3 10.9051 -9.2 0.0 0 CLASS=BASE\nM  V30 END ATOM\nM  V30 BEGIN BOND\nM  V30 END BOND\nM  V30 END CTAB\nM  V30 BEGIN TEMPLATE\nM  V30 TEMPLATE 1 BASE/_Base3/_Base3 NATREPLACE=BASE/A\nM  V30 BEGIN CTAB\nM  V30 COUNTS 13 12 5 0 0\nM  V30 BEGIN ATOM\nM  V30 1 H -4.33 0.75 0.0 0\nM  V30 2 C -3.464 0.25 0.0 0\nM  V30 3 C -2.598 0.75 0.0 0\nM  V30 4 P -1.732 0.25 0.0 0\nM  V30 5 C -0.866 0.75 0.0 0\nM  V30 6 C 0.0 0.25 0.0 0\nM  V30 7 C 0.866 0.75 0.0 0\nM  V30 8 C 1.732 0.25 0.0 0\nM  V30 9 C 2.598 0.75 0.0 0\nM  V30 10 C 3.464 0.25 0.0 0\nM  V30 11 H 4.33 0.75 0.0 0\nM  V30 12 H -3.464 -0.75 0.0 0\nM  V30 13 H -1.732 -0.75 0.0 0\nM  V30 END ATOM\nM  V30 BEGIN BOND\nM  V30 1 1 1 2\nM  V30 2 1 2 3\nM  V30 3 1 3 4\nM  V30 4 1 4 5\nM  V30 5 1 5 6\nM  V30 6 1 6 7\nM  V30 7 1 7 8\nM  V30 8 1 8 9\nM  V30 9 1 9 10\nM  V30 10 1 10 11\nM  V30 11 1 2 12\nM  V30 12 1 4 13\nM  V30 END BOND\nM  V30 BEGIN SGROUP\nM  V30 1 SUP 1 ATOMS=(1 1) XBONDS=(1 1) BRKXYZ=(9 0.433000 -0.250000 0.000000-\nM  V30  0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLASS=-\nM  V30 LGRP\nM  V30 2 SUP 2 ATOMS=(1 11) XBONDS=(1 10) BRKXYZ=(9 -0.433000 -0.250000 0.000-\nM  V30 000 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLA-\nM  V30 SS=LGRP\nM  V30 3 SUP 3 ATOMS=(1 12) XBONDS=(1 11) BRKXYZ=(9 0.000000 0.500000 0.00000-\nM  V30 0 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLASS-\nM  V30 =LGRP\nM  V30 4 SUP 4 ATOMS=(1 13) XBONDS=(1 12) BRKXYZ=(9 0.000000 0.500000 0.00000-\nM  V30 0 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLASS-\nM  V30 =LGRP\nM  V30 5 SUP 5 ATOMS=(9 2 3 4 5 6 7 8 9 10) XBONDS=(4 1 11 12 10) BRKXYZ=(9 --\nM  V30 0.433000 0.250000 0.000000 0.000000 -0.500000 0.000000 0.000000 0.0000-\nM  V30 00 0.000000) BRKXYZ=(9 0.000000 -0.500000 0.000000 0.433000 0.250000 0-\nM  V30 .000000 0.000000 0.000000 0.000000) LABEL=_Base3 CLASS=BASE SAP=(3 2 1-\nM  V30  Al) SAP=(3 10 11 Br) SAP=(3 2 12 Cx) SAP=(3 4 13 Dx) NATREPLACE=BASE/A\nM  V30 END SGROUP\nM  V30 END CTAB\nM  V30 END TEMPLATE\nM  END\n>  <aliasHELM>\n_Base3_HELM***---\n\n>  <idtAliases>\nbase=_Base3\n\n$$$$\n';
    const error = await updateMonomersLibrary(page, sdf);
    expect(error).toBeNull();

    expect(await Library(page).isMonomerExist(Base._Base3)).toBeTruthy();

    await Library(page).openRNASection(RNASection.Bases);
    await takeMonomerLibraryScreenshot(page);
    await Library(page).dragMonomerOnCanvas(Base._Base3, { x: 400, y: 200 });
    await Library(page).dragMonomerOnCanvas(Sugar.R, {
      x: 300,
      y: 150,
    });
    await CommonLeftToolbar(page).bondTool(MacroBondType.Single);
    await bondTwoMonomers(
      page,
      getMonomerLocator(page, Sugar.R),
      getMonomerLocator(page, Base._Base3),
    );
    await verifyHELMExport(page, 'RNA1{r([_Base3_HELM***---])}$$$$V2.0');
  });

  test('Case 38 - SVG/PNG: Export of any atom with Isotope (atomic mass) value set does not work', async () => {
    /* Test case: https://github.com/epam/ketcher/issues/8974
     * Bug: https://github.com/epam/Indigo/issues/3247
     * Steps:
     * 1. Load from file
     * 2. Export canvas to png and svg
     */

    await openFileAndAddToCanvasAsNewProject(page, 'KET/atom-with-isotope.ket');
    await verifyPNGExport(page);
    await verifySVGExport(page);
  });

  test('Case 39 - System does not save monomer expand/collapse state in Mol v3000 for user created monomers (they always come in collapsed state)', async () => {
    /* Test case: https://github.com/epam/ketcher/issues/8974
     * Bug: https://github.com/epam/Indigo/issues/3239
     * Steps:
     * 1. load file
     * 2. Expand monomer
     * 3. Save canvas to Mol v3000 and load back as New project
     * Expected Result: asdasdasdasd monomer appears on the canvas in expanded state
     */

    await openFileAndAddToCanvasAsNewProject(
      page,
      'Molfiles-V3000/monomer-collapse-expand-state.mol',
    );
    await CommonLeftToolbar(page).areaSelectionTool();
    await selectAllStructuresOnCanvas(page);
    await ContextMenu(
      page,
      getAbbreviationLocator(page, { name: 'asdasdasdasd' }),
    ).click(MonomerOnMicroOption.ExpandMonomer);
    await verifyFileExport(
      page,
      'Molfiles-V3000/monomer-collapse-expand-state-expected.mol',
      FileType.MOL,
      MolFileFormat.v3000,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'Molfiles-V3000/monomer-collapse-expand-state-expected.mol',
    );
    const atomLokator = await getAtomLocator(page, { atomId: 0 });
    const boundingBox = await atomLokator.boundingBox();
    if (boundingBox) {
      await page.mouse.move(
        boundingBox.x + boundingBox.width / 2,
        boundingBox.y + boundingBox.height / 2 - 40,
      );
    }
    await takeElementScreenshot(page, atomLokator, {
      padding: 100,
    });
  });

  test('Case 40 - Save to SDF v2000 works wrong for created monomers', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8974
     * Bug: https://github.com/epam/Indigo/issues/3292
     * Steps:
     * 1. Open Macromolecules - Flex mode (clean canvas)
     * 2. Load following KET file as New project
     * 3. Save canvas to SDF v2000 file format and load it back as New Project
     * Expected Result: Layout is correct
     */

    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/monomers-for-bug-3292.ket',
    );
    await verifyFileExport(
      page,
      'SDF-V2000/monomers-for-bug-3292-expected.sdf',
      FileType.SDF,
      SdfFileFormat.v2000,
    );

    await openFileAndAddToCanvasAsNewProject(
      page,
      'SDF-V2000/monomers-for-bug-3292-expected.sdf',
    );
    await takeElementScreenshot(page, getAtomLocator(page, { atomId: 0 }), {
      padding: 80,
    });
  });

  test('Case 41 - Library update works wrong if we use empty SDF file', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8974
     * Bug: https://github.com/epam/Indigo/issues/3293
     * Steps:
     * Open Macromolecules - Flex mode (clean canvas)
     * Go to console and execute following commands
     * Expected result: No exception. Library got updated and become empty.
     */

    const sdf =
      '\n  -INDIGO-EMPTYLIBRARY-10082518012D\n\n  0  0  0  0  0  0  0  0  0  0  0 V3000\nM  V30 BEGIN CTAB\nM  V30 COUNTS 0 0 0 0 0\nM  V30 END CTAB\nM  END\n$$$$';
    const error = await replaceMonomersLibrary(page, sdf);
    expect(error).toBeNull();
  });

  test('Case 42 - System losts stereo bonds on monomer load to Library', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/8974
     * Bug: https://github.com/epam/Indigo/issues/3338
     * Steps:
     * 1. Open Macromolecules - Flex mode (clean canvas)
     * 2. Go to console and execute following commands
     * 3. Go to Library and place create peptide (Stereo) on the canvas
     * 4. Switch to Molecules mode and expand monomer on the canvas
     * Expected Result: All stereo bonds are in place
     */

    const sdf =
      '\n  -INDIGO-11192512292D\n\n  0  0  0  0  0  0  0  0  0  0  0 V3000\nM  V30 BEGIN CTAB\nM  V30 COUNTS 1 0 0 0 0\nM  V30 BEGIN ATOM\nM  V30 1 stereo 16.7221 -10.525 0.0 0 CLASS=AA SEQID=1\nM  V30 END ATOM\nM  V30 BEGIN BOND\nM  V30 END BOND\nM  V30 END CTAB\nM  V30 BEGIN TEMPLATE\nM  V30 TEMPLATE 1 AA/stereo/stereo/ NATREPLACE=AA/A FULLNAME=stereo\nM  V30 BEGIN CTAB\nM  V30 COUNTS 10 9 3 0 0\nM  V30 BEGIN ATOM\nM  V30 1 H -3.897 0.25 0.0 0\nM  V30 2 C -3.031 -0.25 0.0 0 CFG=2\nM  V30 3 C -2.165 0.25 0.0 0 CFG=1\nM  V30 4 C -1.299 -0.25 0.0 0 CFG=1\nM  V30 5 C -0.433 0.25 0.0 0\nM  V30 6 C 0.433 -0.25 0.0 0\nM  V30 7 C 1.299 0.25 0.0 0\nM  V30 8 C 2.165 -0.25 0.0 0\nM  V30 9 C 3.031 0.25 0.0 0\nM  V30 10 H 3.897 -0.25 0.0 0\nM  V30 END ATOM\nM  V30 BEGIN BOND\nM  V30 1 1 1 2\nM  V30 2 1 2 3 CFG=1\nM  V30 3 1 3 4 CFG=3\nM  V30 4 1 4 5 CFG=2\nM  V30 5 1 5 6\nM  V30 6 1 6 7\nM  V30 7 1 7 8\nM  V30 8 1 8 9\nM  V30 9 1 9 10\nM  V30 END BOND\nM  V30 BEGIN COLLECTION\nM  V30 MDLV30/STEABS ATOMS=(3 2 3 4)\nM  V30 END COLLECTION\nM  V30 BEGIN SGROUP\nM  V30 1 SUP 1 ATOMS=(1 1) XBONDS=(1 1) BRKXYZ=(9 0.433000 -0.250000 0.000000-\nM  V30  0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLASS=-\nM  V30 LGRP\nM  V30 2 SUP 2 ATOMS=(1 10) XBONDS=(1 9) BRKXYZ=(9 -0.433000 0.250000 0.00000-\nM  V30 0 0.000000 0.000000 0.000000 0.000000 0.000000 0.000000) LABEL=H CLASS-\nM  V30 =LGRP\nM  V30 3 SUP 3 ATOMS=(8 2 3 4 5 6 7 8 9) XBONDS=(2 1 9) BRKXYZ=(9 -0.433000 0-\nM  V30 .250000 0.000000 0.433000 -0.250000 0.000000 0.000000 0.000000 0.00000-\nM  V30 0) LABEL=stereo CLASS=AA SAP=(3 2 1 Al) SAP=(3 9 10 Br) NATREPLACE=AA/-\nM  V30 A\nM  V30 END SGROUP\nM  V30 END CTAB\nM  V30 END TEMPLATE\nM  END\n>  <type>\nmonomerTemplate\n\n>  <modificationTypes>\nNatural amino acid2222222;ssssss;\n\n>  <aliasHELM>\n_Stereo_HELM\n\n>  <idtAliases>\nbase=_Stereo\n\n$$$$';
    const error = await updateMonomersLibrary(page, sdf);
    expect(error).toBeNull();

    expect(await Library(page).isMonomerExist(Peptide.stereo)).toBeTruthy();

    await MacromoleculesTopToolbar(page).selectLayoutModeTool(
      LayoutMode.Sequence,
    );
    await Library(page).switchToPeptidesTab();
    await takeMonomerLibraryScreenshot(page);
    await Library(page).selectMonomer(Peptide.stereo);
    await keyboardPressOnCanvas(page, 'Enter');
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await CommonLeftToolbar(page).areaSelectionTool();
    await selectAllStructuresOnCanvas(page);
    await ContextMenu(
      page,
      getAbbreviationLocator(page, { name: 'stereo' }),
    ).click(MonomerOnMicroOption.ExpandMonomer);
    await CommonLeftToolbar(page).handTool();
    await dragMouseAndMoveTo(page, 300);
    await takeElementScreenshot(page, getAtomLocator(page, { atomId: 4 }), {
      padding: 180,
    });
  });

  test('Case 43 - Stackoverflow when iterating the s-group components', async () => {
    /* Test case: https://github.com/epam/ketcher/issues/8974
     * Bug: https://github.com/epam/Indigo/issues/3237
     * Steps:
     * 1. upload mol file as a new project
     * Expected result: warning modal window about unsupported s-group is displayed
     */

    await openFileAndAddToCanvasAsNewProject(
      page,
      'Molfiles-V2000/unsupported-s-group.mol',
    );
    const warningMessage = await ConfirmMessageDialog(page).getQuestionText();
    expect(warningMessage).toContain(
      'Unsupported S-group type found. Would you like to import structure without it?',
    );
    await ConfirmMessageDialog(page).cancel();
  });
});
