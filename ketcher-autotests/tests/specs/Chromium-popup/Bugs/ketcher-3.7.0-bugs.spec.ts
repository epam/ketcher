/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable no-magic-numbers */
import { test, expect } from '@fixtures';
import { Page } from '@playwright/test';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { SaveStructureDialog } from '@tests/pages/common/SaveStructureDialog';
import { SelectionToolType } from '@tests/pages/constants/areaSelectionTool/Constants';
import { LayoutMode } from '@tests/pages/constants/macromoleculesTopToolbar/Constants';
import { Base } from '@tests/pages/constants/monomers/Bases';
import { Peptide } from '@tests/pages/constants/monomers/Peptides';
import { Sugar } from '@tests/pages/constants/monomers/Sugars';
import { CalculateVariablesPanel } from '@tests/pages/macromolecules/CalculateVariablesPanel';
import { Library } from '@tests/pages/macromolecules/Library';
import { MacromoleculesTopToolbar } from '@tests/pages/macromolecules/MacromoleculesTopToolbar';
import { drawBenzeneRing } from '@tests/pages/molecules/BottomToolbar';
import {
  clickInTheMiddleOfTheScreen,
  clickOnCanvas,
  dragMouseTo,
  keyboardTypeOnCanvas,
  MacroFileType,
  MolFileFormat,
  moveMouseToTheMiddleOfTheScreen,
  openFileAndAddToCanvasAsNewProject,
  openFileAndAddToCanvasAsNewProjectMacro,
  pasteFromClipboardAndAddToMacromoleculesCanvas,
  resetZoomLevelToDefault,
  RxnFileFormat,
  selectAllStructuresOnCanvas,
  takeEditorScreenshot,
  takeMonomerLibraryScreenshot,
} from '@utils';
import { expandMonomer, expandMonomers } from '@utils/canvas/monomer/helpers';
import { getAbbreviationLocator } from '@utils/canvas/s-group-signes/getAbbreviation';
import {
  FileType,
  verifyFileExport,
  verifySVGExport,
} from '@utils/files/receiveFileComparisonData';

let page: Page;

test.describe('Ketcher bugs in 3.7.0', () => {
  test.beforeAll(async ({ initMoleculesCanvas }) => {
    page = await initMoleculesCanvas();
  });
  test.afterEach(async () => {
    await CommonTopLeftToolbar(page).clearCanvas();
  });
  test.afterAll(async ({ closePage }) => {
    await closePage();
  });

  test('Case 1: Tooltip shown and addition not allowed when multiple monomers with free R2 are selected', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7811
     * Bug: https://github.com/epam/ketcher/issues/7548
     * Description: Tooltip shown and addition not allowed when multiple monomers with free R2 are selected
     * Scenario:
     * 1. Go to Macro mode
     * 2. Add three sugar monomers to the canvas (each with a free R2)
     * 3. Select all three monomers
     * 4. Hover over the arrow button of any monomer/preset in the right panel
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{[d12r]}|RNA2{[d12r]}|RNA3{[d12r]}$$$$V2.0',
    );
    await selectAllStructuresOnCanvas(page);
    await Library(page).hoverMonomerAutochain(Sugar._25d3r);
    await takeMonomerLibraryScreenshot(page, {
      hideMonomerPreview: false,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 2: Tooltip not overlaps monomers when hovering over arrow button on monomer card', async ({
    SnakeCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7811
     * Bug: https://github.com/epam/ketcher/issues/7562
     * Description: Tooltip not overlaps monomers when hovering over arrow button on monomer card.
     * The tooltip not appear when hovering over the arrow button to prevent interference with canvas elements.
     * Scenario:
     * 1. Go to Macro mode
     * 2. Add monomers to the canvas so that the tooltip would overlap them
     * 3. Hover over the arrow button of any monomer/preset in the right panel
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'PEPTIDE1{A.A.A.A.A.A.A.A.A.A.A.A.A.A.A.A.A.A.A.A.A.A.A.A.A.A.A.A.A.A.A.A.A.A.A.A.A.A.A.A.A.A.A.A.A.A.A.A}$$$$V2.0',
    );
    await Library(page).hoverMonomerAutochain(Peptide.A);
    await takeMonomerLibraryScreenshot(page, {
      hideMonomerPreview: false,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 3: Arrow icon not appears in Sequence mode', async ({
    SequenceCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7811
     * Bug: https://github.com/epam/ketcher/issues/7531
     * Description: Arrow icon not appears in Sequence mode. It's only for Flex and Snake modes.
     * Scenario:
     * 1. Go to Macro mode - Sequence mode
     * 2. Hover over the arrow button of any monomer/preset in the right panel
     */
    await Library(page).hoverMonomer(Peptide.A);
    await takeMonomerLibraryScreenshot(page, {
      hideMonomerPreview: false,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 4: "Ghost image" positioned below mouse cursor if dragged from Library to canvas in popup mode', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7811
     * Bug: https://github.com/epam/ketcher/issues/7513
     * Description: "Ghost image" positioned below mouse cursor if dragged from Library to canvas in popup mode
     * Scenario:
     * 1. Go to Macro mode
     * 2. Drag any monomer from the Library to the canvas
     */
    await Library(page).hoverMonomer(Peptide.A);
    await page.mouse.down();
    await page.mouse.move(500, 300);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 5: Able to add ambiguous monomers via arrow button', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7811
     * Bug: https://github.com/epam/ketcher/issues/7538
     * Description: Able to add ambiguous monomers via arrow button
     * Scenario:
     * 1. Go to Macro mode
     * 2. Locate any ambiguous monomer in Peptides or Bases category
     * 3. Click on the arrow button of the monomer
     */
    await Library(page).clickMonomerAutochain(Peptide.X);
    await Library(page).clickMonomerAutochain(Base.DNA_N);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 6: Tooltip shown and invalid attachment not allowed when adding a monomer without R1 to selected monomer with free R2', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7811
     * Bug: https://github.com/epam/ketcher/issues/7539
     * Description: Tooltip shown and invalid attachment not allowed when adding a monomer without R1 to selected monomer with free R2
     * Scenario:
     * 1. Go to Macro mode
     * 2. Add a monomer with a free R2 to the canvas
     * 3. Select the added monomer
     * 4. Click on the arrow button of any monomer without R1 in the right panel
     */
    await Library(page).clickMonomerAutochain(Peptide.Me_);
    await clickInTheMiddleOfTheScreen(page);
    await selectAllStructuresOnCanvas(page);
    await Library(page).clickMonomerAutochain(Peptide.Me_);
    await takeMonomerLibraryScreenshot(page, {
      hideMonomerPreview: false,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 7: Isoelectric Point calculation take into account occupied leaving groups (exclude them)', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7811
     * Bug: https://github.com/epam/Indigo/issues/2928
     * Description: Isoelectric Point calculation take into account occupied leaving groups (exclude them)
     * Each chain have it's own Isoelectric Point value
     * Scenario:
     * 1. Go to Macro mode
     * 2. Load from HELM
     * 3. Open Calculate properties and check Isoelectric Point value
     */
    const cases = [
      {
        helm: 'PEPTIDE1{C}|PEPTIDE2{C}$PEPTIDE2,PEPTIDE1,1:R3-1:R3$$$V2.0',
        expected: '5.96',
      },
      {
        helm: 'PEPTIDE1{C}|PEPTIDE2{C}$PEPTIDE2,PEPTIDE1,1:R2-1:R2$$$V2.0',
        expected: '9.01',
      },
      {
        helm: 'PEPTIDE1{C.C}$$$$V2.0',
        expected: '8.49',
      },
      {
        helm: 'PEPTIDE1{C}|PEPTIDE2{C}$PEPTIDE1,PEPTIDE2,1:pair-1:pair$$$V2.0',
        expected: '8.49',
      },
    ];
    for (const { helm, expected } of cases) {
      await pasteFromClipboardAndAddToMacromoleculesCanvas(
        page,
        MacroFileType.HELM,
        helm,
      );
      await MacromoleculesTopToolbar(page).calculateProperties();
      expect(
        await CalculateVariablesPanel(page).getIsoelectricPointValue(),
      ).toEqual(expected);
      await CalculateVariablesPanel(page).close();
      await CommonTopLeftToolbar(page).clearCanvas();
    }
  });

  test('Case 8: Calculate properties work for "rich" sequences', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7811
     * Bug: https://github.com/epam/Indigo/issues/3053
     * Description: Calculate properties work for "rich" sequences
     * Scenario:
     * 1. Go to Macro mode
     * 2. Load from Ket
     * 3. Open Calculate properties
     */
    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      'KET/Bugs/Calculated values work for _rich_ monomer chain.ket',
    );
    await MacromoleculesTopToolbar(page).calculateProperties();
    expect(
      await CalculateVariablesPanel(page).getNucleotideNaturalAnalogCountList(),
    ).toEqual(['A6', 'C6', 'G6', 'T6', 'U12', 'Other168']);
    await CalculateVariablesPanel(page).close();
  });

  test('Case 9: HELM load not fails if it contains more than one instance of monomers with aliasHELM property', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7811
     * Bug: https://github.com/epam/Indigo/issues/3056
     * Description: HELM load not fails if it contains more than one instance of monomers with aliasHELM property
     * Scenario:
     * 1. Go to Macro mode
     * 2. Load from HELM
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{R(A)P.R(A)P.R(A)}$$$$V2.0',
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 10: Export RNA monomers from MOLv3000 work for ACCLDraw export', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7811
     * Bug: https://github.com/epam/Indigo/issues/3047
     * Description: Export RNA monomers from MOLv3000 work for ACCLDraw export
     * Scenario:
     * 1. Go to Macro mode
     * 2. Load from MOLv3000
     */
    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      'Molfiles-V3000/Bugs/ACCLDraw-file.mol',
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 11: System not wrongly loads s-group superatom as chem', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7811
     * Bug: https://github.com/epam/Indigo/issues/3052
     * Description: System not wrongly loads s-group superatom as chem
     * Scenario:
     * 1. Go to Macro mode
     * 2. Load from MOLv3000
     */
    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      'Molfiles-V3000/Bugs/s-group.mol',
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 12: Adding substituents to reactants not breaks chemical property calculations', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7811
     * Bug: https://github.com/epam/Indigo/issues/3045
     * Description: Adding substituents to reactants not breaks chemical property calculations
     * Scenario:
     * 1. Go to Macro mode
     * 2. Load from KET
     * 3. Open Calculate properties and check that properties are calculated
     */
    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      'KET/Bugs/reaction-file-with-substituent.ket',
    );
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Fragment,
    );
    await CommonTopRightToolbar(page).setZoomInputValue('80');
    await clickOnCanvas(page, 400, 310, { from: 'pageTopLeft' });
    await MacromoleculesTopToolbar(page).calculateProperties();
    expect(await CalculateVariablesPanel(page).getMolecularFormula()).toEqual(
      'C7H8',
    );
    expect(await CalculateVariablesPanel(page).getMolecularMassValue()).toEqual(
      '92.141',
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await CalculateVariablesPanel(page).close();
    await clickOnCanvas(page, 700, 310, { from: 'pageTopLeft' });
    await MacromoleculesTopToolbar(page).calculateProperties();
    expect(await CalculateVariablesPanel(page).getMolecularFormula()).toEqual(
      'C12H10',
    );
    expect(await CalculateVariablesPanel(page).getMolecularMassValue()).toEqual(
      '154.212',
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await CalculateVariablesPanel(page).close();
    await resetZoomLevelToDefault(page);
  });

  test('Case 13: Mix of ketcher library aliases and HELM aliases inside ambigous monomer not causes it wrong type on the canvas', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7811
     * Bug: https://github.com/epam/Indigo/issues/3062
     * Description: Mix of ketcher library aliases and HELM aliases inside ambigous monomer not causes it wrong type on the canvas
     * Scenario:
     * 1. Go to Macro mode
     * 2. Load from HELM
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{[Sm5moe]([m2nprn2A]+[nobn6pur]+[nC6n2G]+[nC6n8A])[mepo2]}$$$$V2.0',
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 14: System can recognize single ribose or phosphate if loaded from HELM', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7811
     * Bug: https://github.com/epam/Indigo/issues/3061
     * Description: System can recognize single ribose or phosphate if loaded from HELM
     * Scenario:
     * 1. Go to Macro mode
     * 2. Load from HELM
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{r}$$$$V2.0',
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 15: Area selection work for bond/atom reposition', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7811
     * Bug: https://github.com/epam/ketcher/issues/7440
     * Description: Area selection work for bond/atom reposition
     * Scenario:
     * 1. Go to Micro mode
     * 2. Add Benzene to the canvas
     * 3. Select area selection tool
     * 4. Select all the molecule including atom and bond
     */
    await drawBenzeneRing(page);
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await clickOnCanvas(page, 400, 300, { from: 'pageTopLeft' });
    await dragMouseTo(700, 800, page);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 16: Layout not shift when changing mode from sequence to flex and back upon first macromolecules mode initialization', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7811
     * Bug: https://github.com/epam/ketcher/issues/7205
     * Description: Layout not shift when changing mode from sequence to flex and back upon first macromolecules mode initialization
     * Scenario:
     * 1. Open Ketcher and switch to Macromolecules mode
     * 2. Note the initial position of the caret in sequence mode
     * 3. Press any key allowed in the currently selected mode (ACGTU for "RNA" mode selected by default)
     * 4. Switch to Flex mode
     * 5. Switch back to Sequence mode
     */
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(
      LayoutMode.Sequence,
    );
    await keyboardTypeOnCanvas(page, 'ACGTU');
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(
      LayoutMode.Sequence,
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 17: Correct leaving group atoms for expanded monomers', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7811
     * Bug: https://github.com/epam/ketcher/issues/7222
     * Description: Correct leaving group atoms for expanded monomers
     * Scenario:
     * 1. Go to Micro mode
     * 2. Open KET file with expanded monomers
     * 3. Expand all monomers
     * 4. Hover monomers
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Bugs/leaving-group-atoms-for-expanded-monomers.ket',
    );
    await selectAllStructuresOnCanvas(page);
    await expandMonomers(
      page,
      getAbbreviationLocator(page, { name: 'Test-6-Ch' }),
    );
    await clickOnCanvas(page, 800, 100, { from: 'pageTopLeft' });
    await moveMouseToTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });

  test('Case 18: Saving to MOLv3000 work and system not throws exception', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7811
     * Bug: https://github.com/epam/Indigo/issues/3048
     * Description: Saving to MOLv3000 work and system not throws exception
     * Scenario:
     * 1. Go to Micro mode
     * 2. Load from MOLv3000
     * 3. Save as MOLv3000
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'Molfiles-V3000/Bugs/save-to-molv3000.mol',
    );
    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      'Molfiles-V3000/Bugs/save-to-molv3000-expected.mol',
      FileType.MOL,
      MolFileFormat.v3000,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'Molfiles-V3000/Bugs/save-to-molv3000-expected.mol',
    );
    await takeEditorScreenshot(page);
  });

  test('Case 19: Alanine and R2-R1 bonds not lost after loading from MOL if peptide has side connection', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7811
     * Bug: https://github.com/epam/Indigo/issues/3051
     * Description: Alanine and R2-R1 bonds not lost after loading from MOL if peptide has side connection
     * Scenario:
     * 1. Go to Micro mode
     * 2. Load from MOLv3000
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'Molfiles-V3000/Bugs/peptide-has-side-connection.mol',
    );
    await takeEditorScreenshot(page);
  });

  test('Case 20: Stereo labels not missied on export to SVG result', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7811
     * Bug: https://github.com/epam/Indigo/issues/3049
     * Description: Stereo labels not missied on export to SVG result
     * Scenario:
     * 1. Go to Micro mode
     * 2. Load from CDXML
     * 3. Save as SVG
     */

    await openFileAndAddToCanvasAsNewProject(
      page,
      'CDXML/Bugs/structure-with-stereolabels.cdxml',
    );
    await verifySVGExport(page);
  });

  test('Case 21: Loading monomer chain from SDF file works - bonds between monomers not lost ', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7811
     * Bug: https://github.com/epam/Indigo/issues/3050
     * Description: Loading monomer chain from SDF file works - bonds between monomers not lost
     * Scenario:
     * 1. Go to Micro mode
     * 2. Load from SDF
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'SDF/Bugs/monomer-chain.sdf',
    );
    await takeEditorScreenshot(page);
  });

  test('Case 22: Export to RXN work, system not throws exception: Error: memory access out of bounds', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7811
     * Bug: https://github.com/epam/Indigo/issues/3069
     * Description: Export to RXN work, system not throws exception: Error: memory access out of bounds
     * Scenario:
     * 1. Go to Micro mode
     * 2. Load from KET
     * 3. Press Save button
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/Bugs/Memory problem.ket',
    );
    await verifyFileExport(
      page,
      'Rxn-V2000/Bugs/Memory problem-expected.rxn',
      FileType.RXN,
      RxnFileFormat.v2000,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'Rxn-V2000/Bugs/Memory problem-expected.rxn',
    );
    await takeEditorScreenshot(page);
  });

  test('Case 23: Export of expanded CHEMs works (system not losts CHEM type)', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7811
     * Bug: https://github.com/epam/Indigo/issues/3094
     * Description: Export of expanded CHEMs works (system not losts CHEM type)
     * Scenario:
     * 1. Go to Macro mode
     * 2. Load from HELM
     * 3. Go to Molecules mode
     * 4. Expand it
     * 5. Save it to Mol v3000 file
     * 6. Load it back as New Project and switch to Macromolecules mode
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'CHEM1{[4aPEGMal]}$$$$V2.0',
    );
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await selectAllStructuresOnCanvas(page);
    await expandMonomer(
      page,
      getAbbreviationLocator(page, { name: '4aPEGMal' }),
    );
    await verifyFileExport(
      page,
      'Molfiles-V3000/Bugs/4aPEGMal-expected.mol',
      FileType.MOL,
      MolFileFormat.v3000,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'Molfiles-V3000/Bugs/4aPEGMal-expected.mol',
    );
    await takeEditorScreenshot(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });
});
