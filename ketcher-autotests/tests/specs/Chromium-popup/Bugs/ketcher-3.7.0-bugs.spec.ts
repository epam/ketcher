/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable no-magic-numbers */
import { test, expect } from '@fixtures';
import { Page } from '@playwright/test';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { Base } from '@tests/pages/constants/monomers/Bases';
import { Peptide } from '@tests/pages/constants/monomers/Peptides';
import { Sugar } from '@tests/pages/constants/monomers/Sugars';
import { CalculateVariablesPanel } from '@tests/pages/macromolecules/CalculateVariablesPanel';
import { Library } from '@tests/pages/macromolecules/Library';
import { MacromoleculesTopToolbar } from '@tests/pages/macromolecules/MacromoleculesTopToolbar';
import {
  clickInTheMiddleOfTheScreen,
  MacroFileType,
  openFileAndAddToCanvasAsNewProjectMacro,
  pasteFromClipboardAndAddToMacromoleculesCanvas,
  selectAllStructuresOnCanvas,
  takeEditorScreenshot,
  takeMonomerLibraryScreenshot,
} from '@utils';

let page: Page;

test.describe('Ketcher bugs in 3.7.0', () => {
  test.beforeAll(async ({ initFlexCanvas }) => {
    page = await initFlexCanvas();
  });
  test.afterEach(async () => {
    await CommonTopLeftToolbar(page).clearCanvas();
  });
  test.afterAll(async ({ closePage }) => {
    await closePage();
  });

  test('Case 1: Tooltip shown and addition not allowed when multiple monomers with free R2 are selected', async () => {
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

  test('Case 4: "Ghost image" positioned below mouse cursor if dragged from Library to canvas in popup mode', async () => {
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

  test('Case 5: Able to add ambiguous monomers via arrow button', async () => {
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

  test('Case 6: Tooltip shown and invalid attachment not allowed when adding a monomer without R1 to selected monomer with free R2', async () => {
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

  test('Case 7: Isoelectric Point calculation take into account occupied leaving groups (exclude them)', async () => {
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

  test('Case 8: Calculate properties work for "rich" sequences', async () => {
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
});
