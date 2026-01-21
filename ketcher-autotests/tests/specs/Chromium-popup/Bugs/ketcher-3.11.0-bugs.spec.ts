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
import { SelectionToolType } from '@tests/pages/constants/areaSelectionTool/Constants';
import { Atom } from '@tests/pages/constants/atoms/atoms';
import { MacromoleculesFileFormatType } from '@tests/pages/constants/fileFormats/macroFileFormats';
import { RNASection } from '@tests/pages/constants/library/Constants';
import {
  PeptideLetterCodeType,
  SequenceMonomerType,
} from '@tests/pages/constants/monomers/Constants';
import { Nucleotide } from '@tests/pages/constants/monomers/Nucleotides';
import { Preset } from '@tests/pages/constants/monomers/Presets';
import {
  OptionsForDebuggingSetting,
  ResetToSelectToolOption,
} from '@tests/pages/constants/settingsDialog/Constants';
import { CalculateVariablesPanel } from '@tests/pages/macromolecules/CalculateVariablesPanel';
import { Library } from '@tests/pages/macromolecules/Library';
import { MacromoleculesTopToolbar } from '@tests/pages/macromolecules/MacromoleculesTopToolbar';
import { AtomPropertiesDialog } from '@tests/pages/molecules/canvas/AtomPropertiesDialog';
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
} from '@utils';
import { getAtomLocator } from '@utils/canvas/atoms/getAtomLocator/getAtomLocator';
import {
  getMonomerLocator,
  getSymbolLocator,
} from '@utils/macromolecules/monomer';
import { getBondLocator } from '@utils/macromolecules/polymerBond';

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
    // Test case: https://github.com/epam/ketcher/issues/8974
    // Bug: https://github.com/epam/ketcher/issues/2597
    // Steps (reproduce expected behavior visually):
    // 1. Load molecule that contains an expanded S-group with label and brackets
    // 2. Select the S-group (or the whole group)
    // 3. Take editor screenshot to verify selection box includes label and padding
    // Expected result: We need to include the group label into the rotation box and
    // introduce some padding for the brackets. We also need to keep the same way as it works now, so it should not take padding into account.

    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/S-Groups/All types of Nucleotide Componets S-Groups.ket',
    );

    // click to ensure group is selected
    await clickInTheMiddleOfTheScreen(page);

    await takeEditorScreenshot(page);
  });

  test('Case 2 — Context menu should be shown for clicked functional group (not for highlighted one)', async () => {
    // Test case: https://github.com/epam/ketcher/issues/8974
    // Bug: https://github.com/epam/ketcher/issues/2576
    // Scenario 1
    // Steps:
    // 1. Load or draw structure with two functional groups (one expanded/one contracted)
    // 2. Select/highlight the first functional group
    // 3. Right click on the second (not highlighted) functional group abbreviation
    // 4. Verify the context menu corresponds to the clicked FG (visual verification)
    // Expected Result: When right clicking on a Functional Group that is not currently highlighted, the right click menu
    //  should be shown for the clicked Functional Group.

    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/S-Groups/All types of Nucleotide Componets S-Groups.ket',
    );
    await waitForRender(page, async () => {
      await getBondLocator(page, { bondId: 6 }).click({
        force: true,
      });
    });
    await takeEditorScreenshot(page);

    await ContextMenu(page, getBondLocator(page, { bondId: 12 })).open();
    await takeEditorScreenshot(page);

    // Scenario 2
    // Steps:
    // 1. Open Ketcher
    // 2. Add two atoms on canvas
    // 3. Select with Selection tool one atom
    // 4. Make right click on another atom

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
    await takeEditorScreenshot(page);

    await ContextMenu(page, getAtomLocator(page, { atomId: 1 })).open();
    await takeEditorScreenshot(page);

    // Scenario 3
    // Steps:
    // 1. Open Ketcher
    // 2. Add structure on canvas (e.g. Benzene)
    // 3. Select with Selection tool all structure
    // 4. Make right click on any place on canvas

    await CommonTopLeftToolbar(page).clearCanvas();
    await openFileAndAddToCanvasAsNewProject(
      page,
      'Molfiles-V2000/benzene.mol',
    );

    await CommonLeftToolbar(page).areaSelectionTool();
    await selectAllStructuresOnCanvas(page);
    await takeEditorScreenshot(page);

    await clickOnCanvas(page, 300, 300, { button: 'right' });
    await takeEditorScreenshot(page);

    // Scenario 4
    // Steps:
    // 1. Open Ketcher
    // 2. Add two structures on canvas (e.g. Benzene)
    // 3. Select with Selection tool one of structure
    // 4. Make right click on atom of not highlighted structure
    // Description: Context menu is shown for clicked atom and selected structure is unhighlighted

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
    await takeEditorScreenshot(page);

    await ContextMenu(page, getAtomLocator(page, { atomId: 0 })).open();
    await takeEditorScreenshot(page);

    // Scenario 5
    // Steps:
    // 1. Add any structure to the canvas, such as benzene
    // Click Select Tool, and select some atoms/bonds of the structure
    // Right click on one of the selected atoms/bonds

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
    await takeEditorScreenshot(page);

    await ContextMenu(page, getBondLocator(page, { bondId: 3 })).open();
    await takeEditorScreenshot(page);
  });

  test('Case 3 — Superatom rendering with multiple connection points — part of structure should not disappear', async () => {
    // Test case: https://github.com/epam/ketcher/issues/8974
    // Bug: https://github.com/epam/ketcher/issues/2517
    // Steps:
    // 1. Load a superatom (superatom with multiple connection points)
    // 2. Verify the rendering: brackets and label present, no disappearing parts
    // Visual verification via screenshot. If there are specific molfile fixtures in repo,
    // replace the inline MOL below with readFile helper to load fixture.
    // Expected Result: File opens with Superaton name and brackets

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
    await takeEditorScreenshot(page);
  });

  test('Case 4 - When atoms are selected, pressing atoms hotkey opens a modal window instead of an instant replacement', async () => {
    // Test case: https://github.com/epam/ketcher/issues/8974
    // Bug: https://github.com/epam/ketcher/issues/2490
    // Steps:
    // 1. Open Ketcher
    // 2. Add few atoms on canvas (e.g. Nitrogen)
    // 3. Select all atoms with 'Selection tool'
    // 4. Press 'O' hotkey
    // Expected Result:
    // Selected atoms are replaces with those assigned to the hotkey.
    // Selected tool remains active and the atom does not appear under mouse cursor.

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
    await takeEditorScreenshot(page);
  });

  test('Case 5 - Cannot add atom properties to Any atom as it is defined with an incorrect label', async () => {
    // Test case: https://github.com/epam/ketcher/issues/8974
    // Bug: https://github.com/epam/ketcher/issues/2593
    // Steps:
    // 1. Open Ketcher
    // 2. Put 'Chain' on canvas
    // 3. Add 'Any atom' on chain atom
    // 4. Double click on 'Any atom' and try add any atom properties (e.g. Alias, Charge, Valence)
    // Expected Result: Can add to 'Any atom' atom properties as it is not defined as a wrong label and 'Apply' button active.

    await openFileAndAddToCanvasAsNewProject(page, 'KET/chain.ket');
    const atomToolbar = RightToolbar(page);

    await atomToolbar.clickAtom(Atom.Nitrogen);
    await getAtomLocator(page, { atomId: 2 }).click({ force: true });
    await takeEditorScreenshot(page);
    await CommonLeftToolbar(page).areaSelectionTool();
    await getAtomLocator(page, { atomId: 2 }).dblclick({
      force: true,
    });
    await AtomPropertiesDialog(page).fillAlias('N1');
    expect(await AtomPropertiesDialog(page).applyButton.isEnabled()).toBe(true);
    await takeEditorScreenshot(page);
  });

  test('Case 6 - Ambiguous phosphates (alternatives and mixed) in sequence shown as % symbol instead of @ symbol', async ({
    SequenceCanvas: _,
  }) => {
    // Test case: https://github.com/epam/ketcher/issues/8974
    // Bug: https://github.com/epam/ketcher/issues/6731
    // Steps:
    // 1. Go to Macro - Sequence mode (clean canvas)
    // 2. Load from KET file a structure with ambiguous phosphates (alternatives and mixed)
    // 3. Verify that ambiguous phosphates are shown with @ symbol (not %)
    // Expected Result: Ambiguous phosphates (alternatives and mixed) in sequence shown as @ symbol

    await openFileAndAddToCanvasMacro(
      page,
      'KET/Ambiguous-monomers-bonds/ketcherPhosphateMixedAndAlternatives.ket',
    );
    await takeEditorScreenshot(page);
  });

  test('Case 7 - System does not unite ambiguous sugars (alternatives and mixed) into one @ symbol', async ({
    SequenceCanvas: _,
  }) => {
    // Test case: https://github.com/epam/ketcher/issues/8974
    // Bug: https://github.com/epam/ketcher/issues/6727
    // Steps:
    // 1. Go to Macro - Sequence mode (clean canvas)
    // 2. Load from KET file a structure with ambiguous sugars (alternatives and mixed)
    // 3. Verify that ambiguous sugars are united into one @ symbol
    // Expected Result: System unites ambiguous sugars (alternatives and mixed) into one @ symbol

    await openFileAndAddToCanvasMacro(
      page,
      'KET/Ambiguous-monomers-bonds/ketcherSugarsMixedAndAlternatives.ket',
    );
    await takeEditorScreenshot(page);
  });

  test('Case 8 - System does not unite ambiguous CHEMs (alternatives and mixed) into one @ symbol', async ({
    SequenceCanvas: _,
  }) => {
    // Test case: https://github.com/epam/ketcher/issues/8974
    // Bug: https://github.com/epam/ketcher/issues/6734
    // Steps:
    // 1. Go to Macro - Sequence mode (clean canvas)
    // 2. Load from KET file a structure with ambiguous CHEMs (alternatives and mixed)
    // 3. Verify that ambiguous CHEMs are united into one @ symbol
    // Expected Result: System unites ambiguous CHEMs (alternatives and mixed) into one @ symbol and other symbols
    // (if they exist) should follow right after that one in the same manner as it happens when system unite ordinary CHEMs in one symbol @

    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'CHEM1{([sDBL],[4aPEGMal])}|CHEM2{([sDBL]+[4aPEGMal])}|CHEM3{([sDBL],[4aPEGMal])}|CHEM4{([sDBL]+[4aPEGMal])}$CHEM1,CHEM2,1:R2-1:R1|CHEM2,CHEM3,1:R2-1:R1|CHEM3,CHEM4,1:R2-1:R1$$$V2.0',
    );
    await takeEditorScreenshot(page);
  });

  test('Case 9 - Verify Undo/Redo do not restore partial selection after cancelling monomer creation (GH-7578)', async () => {
    // Test case: https://github.com/epam/ketcher/issues/8974
    // Bug: https://github.com/epam/ketcher/issues/7578
    // Steps:
    // 1. Open Ketcher (Popup)
    // 2. Put Cyclohexane on canvas
    // 3. Make a partial selection suitable for monomer creation
    // 4. Open Monomer Creation Wizard
    // 5. Close wizard without submitting
    // 6. Press Undo/Redo several times
    // Expected Result: Canvas state after Undo/Redo should be identical to state before opening the wizard.

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
    // Test case: https://github.com/epam/ketcher/issues/8974
    // Bug: https://github.com/epam/ketcher/issues/7326
    // Steps:
    // 1. Open any structure in macro mode.
    // 2. Right-click on a bond between macro components (e.g., between sugar and phosphate).
    // 3. Observe the context menu.
    // Expected Result: The "Delete" option should be enabled and allow the user to remove the bond.

    await openFileAndAddToCanvasMacro(page, 'KET/sugar-phosphate-core.ket');
    await ContextMenu(page, getBondLocator(page, { bondId: 45 })).open();
    await takeEditorScreenshot(page);
  });

  test('Case 11 - Preview tooltips for monomers loaded from HELM with inline smiles are wrong', async ({
    FlexCanvas: _,
  }) => {
    // Test case: https://github.com/epam/ketcher/issues/8974
    // Bug: https://github.com/epam/ketcher/issues/5469
    // Steps:
    // 1. Toggle to Macro - Flex mode
    // 2. Load HELM from paste from clipboard way
    // 3. Hover mouse over any monomer
    // Expected Result: Preview tooltip contains header with alias name

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
    // Test case: https://github.com/epam/ketcher/issues/8974
    // Bug: https://github.com/epam/ketcher/issues/5214
    // Steps:
    // 1. Switch to the Macro mode
    // 2. Enter any letters
    // 3. Hover above or below this sequence
    // 4. Hover over the “plus” button or the stripe
    // Expected Result: The tooltip “Add sequence here” appears

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
    // Test case: https://github.com/epam/ketcher/issues/8974
    // Bug: https://github.com/epam/ketcher/issues/6855
    // Steps:
    // 1. Go to Macro
    // 2. Input v symbol to Search by name edit box in the library
    // 3. Go to RNA tab, Bases accordion section
    // Expected Result:
    // Only natural analog category name (U) is present above brviny and vinyl5 bases
    // Labels for empty sections of natural analog monomers are not present
    // Labels for empty sections of ambiguous monomers are not present

    await Library(page).setSearchValue('v');
    await Library(page).openRNASection(RNASection.Bases);
    await takeMonomerLibraryScreenshot(page);
  });

  test('Case 14 - Selection circle is different on micro and macro modes', async ({
    FlexCanvas: _,
  }) => {
    // Test case: https://github.com/epam/ketcher/issues/8974
    // Bug: https://github.com/epam/ketcher/issues/5664
    // Steps:
    // 1. Go to Macro - Flex mode
    // 2. Add file to the Canvas
    // 3. Click and hover mouse over any atom
    // Expected Result: Selection for atom is the same on both modes

    await openFileAndAddToCanvasMacro(page, 'KET/chain-with-atoms.ket');
    await getAtomLocator(page, { atomId: 0 }).hover({ force: true });
    await takeEditorScreenshot(page);
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await getAtomLocator(page, { atomId: 0 }).hover({ force: true });
    await takeEditorScreenshot(page);
  });

  test('Case 15 - Peptide section for ambiguous monomers should have "Ambiguous Amino Acids" name', async ({
    FlexCanvas: _,
  }) => {
    // Test case: https://github.com/epam/ketcher/issues/8974
    // Bug: https://github.com/epam/ketcher/issues/5578
    // Steps:
    // 1. Go to Macro - Flex mode
    // 2. Open Library, go to Peptides tab
    // 3. Navigate to the bottom of the list
    // Expected Result: Section for ambiguous monomers have "Ambiguous Amino Acids" name (all first letters are CAPITAL)

    await Library(page).switchToPeptidesTab();
    await Library(page).scrollActiveTabToBottom();
    await takeMonomerLibraryScreenshot(page);
  });

  test('Case 16 - Font size and label position should be corrected at "Open structure" dialog', async ({
    FlexCanvas: _,
  }) => {
    // Test case: https://github.com/epam/ketcher/issues/8974
    // Bug: https://github.com/epam/ketcher/issues/5927
    // Steps:
    // 1. Go to Macro - Flex mode
    // 2. Open Paste from clipboard way form
    // Expected Result:
    // Load content type label (Sequence and etc) has 12 px size
    // Peptide and 1-letter code has no shift up

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
    // Test case: https://github.com/epam/ketcher/issues/8974
    // Bug: https://github.com/epam/ketcher/issues/7735
    // Steps:
    // 1. Select Macromolecules mode:
    // 2. Click the folder icon "Open..." in the top left corner of the top panel:
    // 3. Click on Paste from Clipboard
    // 4. In Open Structure pop-up click on dropdown with preselected "Ket" value
    // 5. Select "HELM" in the dropdown
    // 6. Paste the following HELM notation in the text area
    // 7. Click on "Add to Canvas" button
    // 8. Switch to Molecules mode
    // Expected Result: System shows collapsed monomer on the canvas only

    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'PEPTIDE1{[c1(c(-c2ccc([*:2])cc2)c(-c2ccc([*:3])cc2)c(-c2ccc([*:4])cc2)c(-c2ccc([*:5])cc2)c1-c1ccc([*:6])cc1)-c1ccc([*:1])cc1 |$;;;;;;_R2;;;;;;;;_R3;;;;;;;;_R4;;;;;;;;_R5;;;;;;;;_R6;;;;;;;_R1;;$|]}$$$$V2.0',
    );
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await takeEditorScreenshot(page);
  });

  test('Case 18 - Charge tools does not work for "star" atoms', async () => {
    // Test case: https://github.com/epam/ketcher/issues/8974
    // Bug: https://github.com/epam/ketcher/issues/7559
    // Steps:
    // 1. Switch to Molecules mode using the switcher in the top right corner of the top panel
    // 2. Click the folder icon "Open..." in the top left corner of the top panel
    // 3. Click on Paste from Clipboard
    // 4. Copy and paste this SMILES string
    // 5. Click on "Add to Canvas" button
    // 6. Click on the Canvas to place the chemical structure
    // 7. Select the "Star" atom
    // 8. Click the "A+" icon in the left toolbar to use the "Charge Plus" tool
    // 9. Using the "Charge Plus" tool, click on any atom marked with a star (*) two or three times to increase its charge
    // Expected Result: Charge value for "star" atom is increased

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
    await takeEditorScreenshot(page);
  });

  test('Case 19 - Dropdown for units (Da/kDa/MDa) is not aligned in width with the selector button', async ({
    SequenceCanvas: _,
  }) => {
    // Test case: https://github.com/epam/ketcher/issues/8974
    // Bug: https://github.com/epam/ketcher/issues/7022
    // Steps:
    // 1. Select "Macromolecules" mode from the switcher at the top right of the top panel
    // 2. Click the "A" preset in the RNA Presets panel on the right side to add it to the Canvas
    // 3. Click the flask-like icon "Calculate properties" in the top left of the top panel
    // 4. Observe "Calculate value" window at the bottom of the screen and click to "Da" to open dropdown
    // 5. Observe the dropdown width compared to the button width
    // Expected Result: The dropdown menu should match the button width, including borders, so that their edges are aligned.

    await MacromoleculesTopToolbar(page).rna();
    await Library(page).selectMonomer(Preset.A);
    await MacromoleculesTopToolbar(page).calculateProperties();
    await CalculateVariablesPanel(page).isVisible();
    await CalculateVariablesPanel(page).molecularMassUnitsCombobox.click();
    await takePageScreenshot(page);
  });

  test('Case 20 - Number of selected elements in context menu is wrong for sense/antisense chains', async ({
    SequenceCanvas: _,
  }) => {
    // Test case: https://github.com/epam/ketcher/issues/8974
    // Bug: https://github.com/epam/ketcher/issues/7148
    // Steps:
    // 1. Open Ketcher in Macro
    // 2. Paste the following HELM notation in the text area
    // 3. Click on "Add to Canvas" button
    // 4. Click on "Select Rectangle" on the left panel
    // 5. Make left click + drag to select the entire chemical structure created
    // 6. Right-click on selected structure to open the context menu and observe
    // Expected Result: Number of selected elements is 4

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
    // Test case: https://github.com/epam/ketcher/issues/8974
    // Bug: https://github.com/epam/ketcher/issues/7776
    // Steps:
    // 1. Open Ketcher in Macro mode.
    // 2. Click on the Selection tool icon (not the triangle part).
    // 3. Observe that no dropdown appears.
    // 4. Switch to Micro mode.
    // 5. Click on the Selection tool icon → dropdown with all selection tools appears.
    // Expected Result:
    // Clicking on the Selection tool icon (both in Macro and Micro modes) should open the dropdown menu with all selection tools, providing a consistent user experience.

    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Ambiguous-monomers-bonds/ketcherPhosphateMixedAndAlternatives.ket',
    );
    await CommonLeftToolbar(page).areaSelectionDropdownButton.click();
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await CommonLeftToolbar(page).areaSelectionDropdownButton.click();
    await takeEditorScreenshot(page);
  });

  test('Case 22 - Context menu remains visible after creating cyclic structure via right-click menu', async ({
    FlexCanvas: _,
  }) => {
    // Test case: https://github.com/epam/ketcher/issues/8974
    // Bug: https://github.com/epam/ketcher/issues/8397
    // Steps:
    // 1. Switch to Macromolecules → Flex mode.
    // 2. Draw a valid polymer chain that meets cyclic structure criteria.
    // 3. Right-click on the selected structure.
    // 4. Select Create cyclic structure from the context menu.
    // Expected result: After clicking Create cyclic structure, the context menu should automatically close.
    // The cyclic structure should be generated, and the canvas should regain focus immediately.

    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/polymer-chain-that-meets-cyclic-structure-criteria.ket',
    );
    await CommonLeftToolbar(page).areaSelectionTool();
    await selectMonomersAndBonds(page, {
      monomerIds: [68, 69, 82, 83, 73, 76, 71, 72, 80, 79, 81, 84],
      bondIds: [97, 112, 115, 101, 102, 113, 114, 100, 111, 108, 104, 109],
    });
    await ContextMenu(page, getMonomerLocator(page, { monomerId: 80 })).open();
    await page.getByText('Arrange as a Ring').click();
    await takeEditorScreenshot(page);
  });

  test('Case 23 - Tooltip is shown in wrong place for ambigous monomers in popup mode', async ({
    FlexCanvas: _,
  }) => {
    // Test case: https://github.com/epam/ketcher/issues/8974
    // Bug: https://github.com/epam/ketcher/issues/7506
    // Steps:
    // 1. Click the five connected dots icon (it is located to the left of the gear icon in the top-right panel)
    // 2. From the dropdown menu, choose the second option "Macromolecules"
    // 3. In the top panel, click the "A" button (it is located between the flask icon and the RNA icon)
    // 4. Select the third option "Switch to flex layout mode"
    // 5. Click on Folder icon "Open..." in the top left corner of the top panel
    // 6. Add HELM from paste from clipboard way
    // 7. Click the "Add to Canvas" button
    // 8. Hover the mouse over the peptide structure on the Canvas
    // Expected Result: Tooltip should appear directly above the peptide structure

    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'PEPTIDE1{(A,C,D,E,F,G,H,I,K,L,M,N,O,P,Q,R,S,T,U,V,W,Y)}$$$$V2.0',
    );
    await page.getByText('X').first().hover({ force: true });
    await page.waitForTimeout(1000);
    await takePageScreenshot(page);
  });

  test('Case 24 - Preview for chain of CHEMs works wrong in sequence mode', async ({
    SequenceCanvas: _,
  }) => {
    // Test case: https://github.com/epam/ketcher/issues/8974
    // Bug: https://github.com/epam/ketcher/issues/5677
    // Steps:
    // 1. Go to Macro - Sequence
    // 2. Load from HELM
    // 3. Hover mouse over @ symbol
    // Expected Result: System should show the list of monomers in the same manner as it is done for ambiguous monomers

    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'CHEM1{[4aPEGMal]}|CHEM2{[4FB]}|CHEM3{[A6OH]}$CHEM2,CHEM1,1:R2-1:R1|CHEM3,CHEM2,1:R2-1:R1$$$V2.0',
    );
    await page.getByText('@').first().hover({ force: true });
    await page.waitForTimeout(1000);
    await takePageScreenshot(page);
  });

  test('Case 25 - 5NitInd unsplit nucleotide should be shown as X symbol instead of @ one', async ({
    SequenceCanvas: _,
  }) => {
    // Test case: https://github.com/epam/ketcher/issues/8974
    // Bug: https://github.com/epam/ketcher/issues/6737
    // Steps:
    // 1. Go to Macro - Sequence mode (clean canvas)
    // 2. Go to RNA tab - Nucleotides section
    // 3. Click on 5NitInd nucleotide
    // Expected Result: X symbol appears on sequence canvas
    await Library(page).openRNASection(RNASection.Nucleotides);
    await Library(page).selectMonomer(Nucleotide._5NitInd);
    await takeEditorScreenshot(page);
  });

  test('Case 26 - In case of multipal R1 or R2 groups second R1/R2 groups should be assigned to the smallest available Rn (n>2) if available', async () => {
    // Test case: https://github.com/epam/ketcher/issues/8974
    // Bug: https://github.com/epam/ketcher/issues/7955
    // Steps:
    // 1. Open Molecules mode (clear canvas)
    // 2. Turn on Show atom Ids option in Settings
    // 3. Load from Extended SMILES using paste from clipboard way
    // 4. Select whole structure
    // 5. Press Create monomer button
    // Expected Result: Second R1 group got converted to R3

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
    // Test case: https://github.com/epam/ketcher/issues/8974
    // Bug: https://github.com/epam/ketcher/issues/8847
    // Steps:
    // 1. Go to Ketcher Molecules mode (clear canvas)
    // 2. Paste following SMILES on the canvas
    // 3. Select part of the structure
    // 4. Click on the canvas to remove selection
    // 5. Press Create a monomer button
    // Expected Result: No attachment point created

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
    // Test case: https://github.com/epam/ketcher/issues/8974
    // Bug: https://github.com/epam/ketcher/issues/8846
    // Steps:
    // 1. Go to Ketcher Molecules mode (clear canvas)
    // 2. Paste following SMILES on the canvas
    // 3. Select whole structure and press Create a monomer button
    // 4. Create Nucleotide (preset) of this molecule using following options
    // Expected Result: All fields are empty
  });

  test('Case 29 - System should be able to load unknown monomer on any position', async ({
    FlexCanvas: _,
  }) => {
    // Test case: https://github.com/epam/ketcher/issues/8974
    // Bug: https://github.com/epam/Indigo/issues/3265
    // Steps:
    // 1. Go to Macro - Flex mode
    // 2. Load from AxoLabs
    // Expected Result: System loads sequence of three unknown monomers

    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.AxoLabs,
      "5'-(Unknown1)(Unknown2)(Unknown3)-3'",
    );
    await takeEditorScreenshot(page);
  });

  test('Case 30 - Export to sugar monomer to AxoLabs error message is wrong', async ({
    FlexCanvas: _,
  }) => {
    // Test case: https://github.com/epam/ketcher/issues/8974
    // Bug: https://github.com/epam/Indigo/issues/3267
    // Steps:
    // 1. Go to Macro - Flex mode
    // 2. Load from HELM
    // 3. Export canvas to AxoLabs file format
    // Expected Result: System throws an error: Convert error! Sequence saver: Sugar monomer '12ddR' has no AxoLabs alias.

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
    // Test case: https://github.com/epam/ketcher/issues/8974
    // Bug: https://github.com/epam/Indigo/issues/3291
    // Steps:
    // 1. Go to Macro - Flex mode
    // 2. Load following mol file as New project
    // 3. Make area selection
    // 4. Press Layout button
    // Expected Result: Layout works correct

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
    await takeEditorScreenshot(page);
  });
});
