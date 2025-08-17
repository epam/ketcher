import { Bases } from '@constants/monomers/Bases';
import { Peptides } from '@constants/monomers/Peptides';
import { Presets } from '@constants/monomers/Presets';
import { Sugars } from '@constants/monomers/Sugars';
import { Page, test, expect } from '@playwright/test';
import {
  addSingleMonomerToCanvas,
  addRnaPresetOnCanvas,
  takeEditorScreenshot,
  addBondedMonomersToCanvas,
  waitForRender,
  dragMouseTo,
  openFileAndAddToCanvasAsNewProject,
  selectPartOfMolecules,
  openFileAndAddToCanvasMacro,
  moveMouseAway,
  scrollDown,
  scrollUp,
  clickOnCanvas,
  resetZoomLevelToDefault,
  waitForPageInit,
  MacroFileType,
} from '@utils';
import { selectAllStructuresOnCanvas } from '@utils/canvas/selectSelection';
import { waitForMonomerPreview } from '@utils/macromolecules';
import {
  getMonomerLocator,
  MonomerAttachmentPoint,
} from '@utils/macromolecules/monomer';
import { bondTwoMonomers } from '@utils/macromolecules/polymerBond';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { MacroBondType } from '@tests/pages/constants/bondSelectionTool/Constants';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { Library } from '@tests/pages/macromolecules/Library';
import { RNASection } from '@tests/pages/constants/library/Constants';
import { MacromoleculesTopToolbar } from '@tests/pages/macromolecules/MacromoleculesTopToolbar';
import { LayoutMode } from '@tests/pages/constants/macromoleculesTopToolbar/Constants';
/* eslint-disable no-magic-numbers */

async function createBondedMonomers(page: Page) {
  await Library(page).switchToPeptidesTab();
  const peptide1 = await addSingleMonomerToCanvas(
    page,
    Peptides.dU,
    200,
    200,
    0,
  );

  const [peptide2, peptide3] = await addBondedMonomersToCanvas(
    page,
    Peptides.Tza,
    100,
    100,
    50,
    50,
    2,
  );

  const peptide4 = await addSingleMonomerToCanvas(
    page,
    Peptides.meC,
    400,
    400,
    0,
  );

  await CommonLeftToolbar(page).selectBondTool(MacroBondType.Single);
  await bondTwoMonomers(page, peptide1, peptide2);
  await bondTwoMonomers(page, peptide3, peptide4);
}

let page: Page;

async function configureInitialState(page: Page) {
  await Library(page).switchToRNATab();
}

test.beforeAll(async ({ browser }) => {
  const context = await browser.newContext();
  page = await context.newPage();

  await waitForPageInit(page);
  await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
  await configureInitialState(page);
});

test.afterEach(async () => {
  await page.keyboard.press('Escape');
  await resetZoomLevelToDefault(page);
  await CommonTopLeftToolbar(page).clearCanvas();
});

test.afterAll(async ({ browser }) => {
  await Promise.all(browser.contexts().map((context) => context.close()));
});

test.describe('Snake Bond Tool', () => {
  test('Create snake bond between peptides', async () => {
    /* 
    Test case: #3280 - Create snake bond 
    Description: Snake bond tool
    */

    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await Library(page).switchToPeptidesTab();
    const [, peptide2] = await addBondedMonomersToCanvas(
      page,
      Peptides.Tza,
      300,
      300,
      100,
      100,
      2,
    );
    const peptide3 = await addSingleMonomerToCanvas(
      page,
      Peptides.Tza,
      300,
      500,
      2,
    );
    const peptide4 = await addSingleMonomerToCanvas(
      page,
      Peptides.Tza,
      200,
      200,
      3,
    );

    await CommonLeftToolbar(page).selectBondTool(MacroBondType.Single);

    await bondTwoMonomers(page, peptide2, peptide3);
    await bondTwoMonomers(page, peptide3, peptide4);

    await takeEditorScreenshot(page, { hideMonomerPreview: true });
  });

  test('Check snake mode arrange for peptides chain', async () => {
    /* 
    Test case: #3280 - Check snake mode
    Description: Snake bond tool
    */
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
    await Library(page).switchToPeptidesTab();

    await addBondedMonomersToCanvas(page, Peptides.Tza, 100, 100, 25, 25, 18);

    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await moveMouseAway(page);
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
  });

  test('Check finding right chain sequence using snake mode', async () => {
    /*
    Test case: #3280 - Check finding right chain sequence using snake mode
    Description: Snake bond tool
    */
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
    await createBondedMonomers(page);
    await takeEditorScreenshot(page);
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
  });

  test('Mode returns back/forth after undo/redo', async () => {
    await Library(page).switchToPeptidesTab();
    const flexModeButton = page.getByTestId('flex-layout-mode');
    const snakeModeButton = page.getByTestId('snake-layout-mode');
    await createBondedMonomers(page);
    await expect(flexModeButton).toHaveClass(/active/);

    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await expect(snakeModeButton).toHaveClass(/active/);

    await CommonTopLeftToolbar(page).undo();
    await waitForRender(page);
    await expect(snakeModeButton).not.toBeVisible();
    await expect(flexModeButton).toHaveClass(/active/);

    await CommonTopLeftToolbar(page).redo();
    await waitForRender(page);
    await expect(flexModeButton).not.toBeVisible();
    await expect(snakeModeButton).toHaveClass(/active/);
  });

  test('Create snake bond between RNA nucleotides', async () => {
    await Library(page).switchToRNATab();
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);

    const { phosphate } = await addRnaPresetOnCanvas(
      page,
      Presets.A,
      300,
      300,
      0,
      0,
    );
    const { sugar: sugar1, phosphate: phosphate1 } = await addRnaPresetOnCanvas(
      page,
      Presets.C,
      400,
      600,
      1,
      1,
    );
    const { sugar: sugar2 } = await addRnaPresetOnCanvas(
      page,
      Presets.G,
      600,
      400,
      2,
      2,
    );

    await CommonLeftToolbar(page).selectBondTool(MacroBondType.Single);

    await bondTwoMonomers(page, phosphate, sugar1);
    await bondTwoMonomers(page, phosphate1, sugar2);

    await takeEditorScreenshot(page);
  });

  test('Check snake mode arrange for RNA chain', async () => {
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
    await Library(page).switchToRNATab();

    const { phosphate } = await addRnaPresetOnCanvas(
      page,
      Presets.A,
      300,
      300,
      0,
      0,
    );
    const { sugar: sugar1, phosphate: phosphate1 } = await addRnaPresetOnCanvas(
      page,
      Presets.C,
      400,
      600,
      1,
      1,
    );
    const { sugar: sugar2, phosphate: phosphate2 } = await addRnaPresetOnCanvas(
      page,
      Presets.G,
      600,
      400,
      2,
      2,
    );
    const { sugar: sugar3, phosphate: phosphate3 } = await addRnaPresetOnCanvas(
      page,
      Presets.T,
      800,
      200,
      3,
      3,
    );
    const { sugar: sugar4, phosphate: phosphate4 } = await addRnaPresetOnCanvas(
      page,
      Presets.T,
      100,
      100,
      4,
      4,
    );
    const { sugar: sugar5, phosphate: phosphate5 } = await addRnaPresetOnCanvas(
      page,
      Presets.T,
      200,
      200,
      5,
      5,
    );
    const { sugar: sugar6, phosphate: phosphate6 } = await addRnaPresetOnCanvas(
      page,
      Presets.T,
      300,
      200,
      6,
      6,
    );
    const { sugar: sugar7, phosphate: phosphate7 } = await addRnaPresetOnCanvas(
      page,
      Presets.T,
      400,
      200,
      7,
      7,
    );
    const { sugar: sugar8, phosphate: phosphate8 } = await addRnaPresetOnCanvas(
      page,
      Presets.T,
      500,
      200,
      8,
      8,
    );
    const { sugar: sugar9 } = await addRnaPresetOnCanvas(
      page,
      Presets.T,
      600,
      200,
      9,
      9,
    );

    await CommonLeftToolbar(page).selectBondTool(MacroBondType.Single);

    await bondTwoMonomers(page, phosphate, sugar1);
    await bondTwoMonomers(page, phosphate1, sugar2);
    await bondTwoMonomers(page, phosphate2, sugar3);
    await bondTwoMonomers(page, phosphate3, sugar4);
    await bondTwoMonomers(page, phosphate4, sugar5);
    await bondTwoMonomers(page, phosphate5, sugar6);
    await bondTwoMonomers(page, phosphate6, sugar7);
    await bondTwoMonomers(page, phosphate7, sugar8);
    await bondTwoMonomers(page, phosphate8, sugar9);

    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
  });

  test('Create snake bond for mix chains with nucleotides and peptides', async () => {
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
    const [peptide1] = await addBondedMonomersToCanvas(
      page,
      Peptides.Tza,
      100,
      200,
      100,
      100,
      3,
    );
    await addBondedMonomersToCanvas(page, Peptides.bAla, 400, 200, 50, 50, 4);

    const { phosphate } = await addRnaPresetOnCanvas(
      page,
      Presets.A,
      200,
      200,
      0,
      0,
    );
    const { sugar: sugar1, phosphate: phosphate1 } = await addRnaPresetOnCanvas(
      page,
      Presets.C,
      300,
      500,
      1,
      1,
    );
    const { sugar: sugar2, phosphate: phosphate2 } = await addRnaPresetOnCanvas(
      page,
      Presets.G,
      400,
      300,
      2,
      2,
    );

    await bondTwoMonomers(page, phosphate, sugar1);
    await bondTwoMonomers(page, phosphate1, sugar2);
    await bondTwoMonomers(
      page,
      phosphate2,
      peptide1,
      undefined,
      MonomerAttachmentPoint.R1,
    );

    await takeEditorScreenshot(page);

    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await takeEditorScreenshot(page);

    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
    await takeEditorScreenshot(page);
  });

  test('Create snake bond for chain with nucleoside', async () => {
    await Library(page).switchToRNATab();
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);

    const { phosphate } = await addRnaPresetOnCanvas(
      page,
      Presets.A,
      200,
      200,
      0,
      0,
    );
    const { sugar } = await addRnaPresetOnCanvas(
      page,
      Presets.G,
      700,
      300,
      1,
      1,
    );

    await Library(page).openRNASection(RNASection.Sugars);
    const sugarOfNucleoside = await addSingleMonomerToCanvas(
      page,
      Sugars.R,
      500,
      500,
      2,
    );
    await Library(page).openRNASection(RNASection.Bases);
    const baseOfNucleoside = await addSingleMonomerToCanvas(
      page,
      Bases.A,
      600,
      600,
      1,
    );

    await CommonLeftToolbar(page).selectBondTool(MacroBondType.Single);
    await bondTwoMonomers(page, sugarOfNucleoside, baseOfNucleoside);
    await bondTwoMonomers(page, phosphate, sugarOfNucleoside);
    await bondTwoMonomers(page, sugarOfNucleoside, sugar);

    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });

    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });

    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Create snake bond for chain with side chains', async () => {
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
    const { phosphate } = await addRnaPresetOnCanvas(
      page,
      Presets.C,
      50,
      50,
      0,
      0,
    );
    const { sugar: sugar1, phosphate: phosphate1 } = await addRnaPresetOnCanvas(
      page,
      Presets.G,
      350,
      150,
      1,
      1,
    );
    const { sugar: sugar2, phosphate: phosphate2 } = await addRnaPresetOnCanvas(
      page,
      Presets.T,
      550,
      150,
      2,
      2,
    );
    await addRnaPresetOnCanvas(page, Presets.U, 900, 300, 3, 3);
    const sugarOfNucleoside = await addSingleMonomerToCanvas(
      page,
      Sugars.R,
      200,
      200,
      4,
    );
    const baseOfNucleoside = await addSingleMonomerToCanvas(
      page,
      Bases.nC6n8A,
      200,
      350,
      0,
    );
    const [peptide] = await addBondedMonomersToCanvas(
      page,
      Peptides.A,
      350,
      350,
      50,
      50,
      3,
    );

    const [hcyPeptide, hcyPeptide1] = await addBondedMonomersToCanvas(
      page,
      Peptides.Hcy,
      350,
      250,
      50,
      0,
      2,
    );

    const [balPeptide] = await addBondedMonomersToCanvas(
      page,
      Peptides.bAla,
      500,
      500,
      50,
      0,
      2,
    );
    const balPeptide1 = await addSingleMonomerToCanvas(
      page,
      Peptides.bAla,
      520,
      500,
      2,
    );

    await bondTwoMonomers(page, sugarOfNucleoside, baseOfNucleoside);
    await bondTwoMonomers(
      page,
      baseOfNucleoside,
      peptide,
      MonomerAttachmentPoint.R2,
      MonomerAttachmentPoint.R1,
    );

    await bondTwoMonomers(page, phosphate, sugarOfNucleoside);
    await bondTwoMonomers(page, sugarOfNucleoside, sugar1);
    await bondTwoMonomers(page, phosphate1, sugar2);
    await bondTwoMonomers(
      page,
      phosphate2,
      hcyPeptide,
      undefined,
      MonomerAttachmentPoint.R1,
    );
    await bondTwoMonomers(page, hcyPeptide1, balPeptide);
    await bondTwoMonomers(
      page,
      hcyPeptide1,
      balPeptide1,
      undefined,
      MonomerAttachmentPoint.R1,
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });

    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Create snake mode for single monomer and nucleoside', async () => {
    await Library(page).switchToPeptidesTab();
    await addSingleMonomerToCanvas(page, Peptides.bAla, 300, 300, 0);
    await Library(page).openRNASection(RNASection.Sugars);
    const sugarOfNucleoside = await addSingleMonomerToCanvas(
      page,
      Sugars.R,
      500,
      500,
      0,
    );
    await Library(page).openRNASection(RNASection.Bases);
    const baseOfNucleoside = await addSingleMonomerToCanvas(
      page,
      Bases.A,
      600,
      600,
      0,
    );

    await CommonLeftToolbar(page).selectBondTool(MacroBondType.Single);
    await bondTwoMonomers(page, sugarOfNucleoside, baseOfNucleoside);

    await takeEditorScreenshot(page);

    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await takeEditorScreenshot(page);
  });

  test('Check if monomers are located close to each other Snake bond become a straight line', async () => {
    /* 
    Test case: Snake Mode
    Description: Monomers are located close to each other Snake bond become a straight line.
    */
    const x = 550;
    const y = 350;
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await openFileAndAddToCanvasMacro(page, `KET/two-peptides-connected.ket`);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await getMonomerLocator(page, Peptides.meE).hover();
    await dragMouseTo(x, y, page);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('When monomers are too close under each other snake bond shape has straight connection', async () => {
    /* 
    Test case: Snake Mode
    Description: When monomers are too close under each other snake bond shape has straight 
    connection and they are not supposed to twist.
    We have incorrect behavior because bug https://github.com/epam/ketcher/issues/3607 need to be fixed.
    Then update expected screenshot.
    */
    const x = 500;
    const y = 300;
    const x1 = 300;
    const y1 = 300;
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await openFileAndAddToCanvasMacro(page, `KET/two-peptides-connected.ket`);
    await takeEditorScreenshot(page);
    await getMonomerLocator(page, Peptides.meE).hover();
    await dragMouseTo(x, y, page);
    await clickOnCanvas(page, x1, y1, { from: 'pageTopLeft' });
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
  });

  test('Pressing "snake" layout button arrange nucleotides forming chain on screen in a snake-like pattern', async () => {
    /* 
    Test case: Snake Mode
    Description: Pressing "snake" layout button arrange nucleotides forming chain on screen in a snake-like pattern.
    */
    await openFileAndAddToCanvasAsNewProject(
      page,
      `KET/peptides-flex-chain.ket`,
    );
    await takeEditorScreenshot(page);
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await moveMouseAway(page);
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
  });

  test('Check if even very long chain fit into canvas (algorithm calculate the length of rows)', async () => {
    /* 
    Test case: Snake Mode
    Description: Very long chain fit into canvas (algorithm calculate the length of rows).
    */
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
    await openFileAndAddToCanvasAsNewProject(
      page,
      `KET/long-peptide-chain.ket`,
    );
    await takeEditorScreenshot(page);
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await moveMouseAway(page);
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
  });

  test('Check that switch to Flex mode on a snake chain change it into a chain with straight lines', async () => {
    /* 
    Test case: Snake Mode
    Description: Check that switch to Flex mode on a snake chain change it into a chain with 
    straight lines press it again change it into curved lines.
    */
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
    await openFileAndAddToCanvasAsNewProject(
      page,
      `KET/long-peptide-chain.ket`,
    );
    await resetZoomLevelToDefault(page);
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await moveMouseAway(page);
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
    await moveMouseAway(page);
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await moveMouseAway(page);
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
  });

  test('Check move any peptide from middle of chain above main snake chain', async () => {
    /* 
    Test case: Snake Mode
    Description: Peptide moved from middle of chain above and under main snake chain.
    */
    const x = 450;
    const y = 150;
    const x2 = 100;
    const y2 = 100;
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await openFileAndAddToCanvasAsNewProject(
      page,
      `KET/peptides-flex-chain.ket`,
    );
    await scrollUp(page, 200);
    await moveMouseAway(page);
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
    await getMonomerLocator(page, Peptides.meS).hover();
    await dragMouseTo(x, y, page);
    await clickOnCanvas(page, x2, y2, { from: 'pageTopLeft' });
    await moveMouseAway(page);
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
  });

  test('Check move any peptide from middle of chain above main flex chain', async () => {
    /* 
    Test case: Snake Mode
    Description: Peptide moved from middle of chain above and under main snake chain.
    */
    const x = 450;
    const y = 150;
    const x2 = 100;
    const y2 = 100;
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
    await openFileAndAddToCanvasAsNewProject(
      page,
      `KET/peptides-flex-chain.ket`,
    );

    // Workaround against fake scroll bars that sometimes shown even if they are not intended to
    await page.mouse.wheel(0, 400);
    await page.mouse.wheel(0, -400);

    await takeEditorScreenshot(page);
    await getMonomerLocator(page, Peptides.DHis1B).hover();
    await dragMouseTo(x, y, page);
    await clickOnCanvas(page, x2, y2, { from: 'pageTopLeft' });
    await takeEditorScreenshot(page);
  });

  test('Bonds connecting through R3, R4, ... Rn attachment points remain straight lines', async () => {
    /* 
    Test case: Snake Mode
    Description: Bonds connecting through R3, R4, ... Rn attachment points remain straight lines.
    */
    await openFileAndAddToCanvasAsNewProject(
      page,
      `KET/two-peptides-in-chain-connected-through-r3-r4.ket`,
    );
    await takeEditorScreenshot(page);
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await moveMouseAway(page);
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
  });

  const testCases = [
    {
      filename: 'KET/rna-chain-connected-to-peptide-chain.ket',
      description:
        'Bonds connecting RNA monomers to monomers of different types (peptide monomers) remain straight.',
      waitForMonomerPreview: true,
    },
    {
      filename: 'KET/rna-chain-connected-to-chem.ket',
      description:
        'Bonds connecting RNA monomers to monomers of different types (CHEM monomers) remain straight.',
    },
  ];

  for (const testCase of testCases) {
    test(testCase.description, async () => {
      await MacromoleculesTopToolbar(page).selectLayoutModeTool(
        LayoutMode.Flex,
      );
      await openFileAndAddToCanvasAsNewProject(page, testCase.filename);

      // Workaround against fake scroll bars that sometimes shown even if they are not intended to
      await page.mouse.wheel(400, 0);
      await page.mouse.wheel(-400, 0);

      if (testCase.waitForMonomerPreview) {
        await waitForMonomerPreview(page);
      }
      await takeEditorScreenshot(page);
      await MacromoleculesTopToolbar(page).selectLayoutModeTool(
        LayoutMode.Snake,
      );
      await takeEditorScreenshot(page);
    });
  }

  test('Check deleting any peptide from middle of chain in snake mode', async () => {
    /* 
    Test case: Snake Mode
    Description: Peptide deleted from middle of chain in snake mode.
    */
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await openFileAndAddToCanvasAsNewProject(
      page,
      `KET/peptides-flex-chain.ket`,
    );
    await takeEditorScreenshot(page);
    await CommonLeftToolbar(page).selectEraseTool();
    await getMonomerLocator(page, Peptides.DHis1B).click();
    await takeEditorScreenshot(page);
  });

  test('Check deleting any peptide from corner of chain in snake mode', async () => {
    /* 
    Test case: Snake Mode
    Description: Peptide deleted from corner of chain in snake mode.
    */
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await openFileAndAddToCanvasAsNewProject(
      page,
      `KET/peptides-flex-chain.ket`,
    );
    await takeEditorScreenshot(page);
    await CommonLeftToolbar(page).selectEraseTool();
    await getMonomerLocator(page, Peptides.meR).click();
    await takeEditorScreenshot(page);
  });

  test('Check that you can select sequence in snake mode and move to new position', async () => {
    /* 
    Test case: Snake Mode
    Description: Sequence moved to the new position without any distortion.
    */
    const x = 450;
    const y = 550;
    const x2 = 100;
    const y2 = 100;
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await openFileAndAddToCanvasAsNewProject(
      page,
      `KET/peptides-flex-chain.ket`,
    );
    await takeEditorScreenshot(page);
    await selectAllStructuresOnCanvas(page);
    await getMonomerLocator(page, Peptides.DHis1B).hover();
    await dragMouseTo(x, y, page);
    await clickOnCanvas(page, x2, y2, { from: 'pageTopLeft' });
    await takeEditorScreenshot(page);
  });

  test('Check that you can select part of sequence in flex mode and move to new position', async () => {
    /* 
    Test case: Snake Mode
    Description: Part of sequence moved to the new position without any distortion.
    */
    const x = 450;
    const y = 650;
    const x2 = 100;
    const y2 = 100;
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
    await openFileAndAddToCanvasAsNewProject(
      page,
      `KET/peptides-flex-chain.ket`,
    );

    // Workaround against fake scroll bars that sometimes shown even if they are not intended to
    await page.mouse.wheel(0, 400);
    await page.mouse.wheel(0, -400);

    await takeEditorScreenshot(page);
    await selectPartOfMolecules(page);
    await getMonomerLocator(page, Peptides.DHis1B).hover();
    await dragMouseTo(x, y, page);
    await clickOnCanvas(page, x2, y2, { from: 'pageTopLeft' });
    await takeEditorScreenshot(page);
  });

  test('Check that you can select part of sequence in snake mode and move to new position', async () => {
    /* 
    Test case: Snake Mode
    Description: Part of sequence moved to the new position without any distortion.
    */
    const x = 450;
    const y = 650;
    const x2 = 100;
    const y2 = 100;
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await openFileAndAddToCanvasAsNewProject(
      page,
      `KET/peptides-flex-chain.ket`,
    );
    await takeEditorScreenshot(page);
    await selectPartOfMolecules(page);
    await getMonomerLocator(page, Peptides.DHis1B).hover();
    await dragMouseTo(x, y, page);
    await clickOnCanvas(page, x2, y2, { from: 'pageTopLeft' });
    await takeEditorScreenshot(page);
  });

  test('Check that Snake mode works on the chain of the CHEM connected through R2-R1', async () => {
    /* 
    Test case: Snake Mode
    Description: Snake mode works on the chain of the CHEM connected through R2-R1.
    */
    const x = 450;
    const y = 650;
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
    await openFileAndAddToCanvasAsNewProject(
      page,
      `KET/chems-connected-through-r2-r1.ket`,
    );

    // Workaround against fake scroll bars that sometimes shown even if they are not intended to
    await page.mouse.wheel(400, 400);
    await page.mouse.wheel(-400, -400);

    await takeEditorScreenshot(page);
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await clickOnCanvas(page, x, y, { from: 'pageTopLeft' });
    await takeEditorScreenshot(page);
  });

  test('Check that Snake mode works on the chain of the CHEM connected through R2-R1 and igore others connections', async () => {
    /* 
    Test case: Snake Mode
    Description: Snake mode works on the chain of the CHEM connected through R2-R1 
    and igore others connections.
    */
    const x = 450;
    const y = 650;
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
    await openFileAndAddToCanvasAsNewProject(
      page,
      `KET/chems-connected-through-r2-r1-and-r1-r2.ket`,
    );
    await takeEditorScreenshot(page);
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await clickOnCanvas(page, x, y, { from: 'pageTopLeft' });
    await takeEditorScreenshot(page);
  });

  test('Check Snake mode is working for side connection', async () => {
    /* 
    Test case: Snake Mode
    Description: Snake mode is not applied on structure and it starts from 5FAM monomer because it 
    has no R1 attachment point and there are no similar options for the chain beginning.
    We have incorrect behavior because bug https://github.com/epam/ketcher/issues/4026 need to be fixed.
    Then update expected screenshot.
    */
    await openFileAndAddToCanvasMacro(
      page,
      `KET/sequence-with-side-connection.ket`,
    );
    await takeEditorScreenshot(page);
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await takeEditorScreenshot(page);
  });

  test('Maximum call stack size exceeded error not appears during snake layout for large chains', async () => {
    /* 
    Test case: Snake Mode
    Description: Open chain with 2000 or more rna items. Turn on snake mode. Snake mode is applied on structure 
    and maximum call stack size exceeded error not appears during snake layout.
    */
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        test.fail(
          msg.type() === 'error',
          `There is error in console: ${msg.text}`,
        );
      }
    });
    await openFileAndAddToCanvasMacro(page, `KET/sequence-rna-2000.ket`);
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await moveMouseAway(page);
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
  });

  test('Maximum call stack size exceeded error not appears during snake layout for 4000 RNA', async () => {
    /* 
    Test case: Snake Mode
    Description: Open chain with 4000 rna items. Turn on snake mode. Snake mode is applied on structure 
    and maximum call stack size exceeded error not appears during snake layout.
    */
    test.slow();
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        test.fail(
          msg.type() === 'error',
          `There is error in console: ${msg.text}`,
        );
      }
    });

    // Workaround against fake scroll bars that sometimes shown even if they are not intended to
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    // ---
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
    await openFileAndAddToCanvasMacro(page, `KET/sequence-rna-4000.ket`);
    await moveMouseAway(page);

    // Workaround against fake scroll bars that sometimes shown even if they are not intended to
    await page.mouse.wheel(0, 400);
    await page.mouse.wheel(0, -400);
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
  });

  test('Maximum call stack size exceeded error not appears during snake layout for 4000 Peptides', async () => {
    /* 
    Test case: Snake Mode
    Description: Open chain with 4000 peptides items. Turn on snake mode. Snake mode is applied on structure 
    and maximum call stack size exceeded error not appears during snake layout.
    */
    test.slow();
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        test.fail(
          msg.type() === 'error',
          `There is error in console: ${msg.text}`,
        );
      }
    });
    await openFileAndAddToCanvasMacro(page, `KET/sequence-peptides-4000.ket`);
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
  });

  test('Maximum call stack size exceeded error not appears during snake layout for 8000 Peptides', async () => {
    /* 
    Test case: Snake Mode
    Description: Open chain with 8000 peptides items. Turn on snake mode. Snake mode is applied on structure 
    and maximum call stack size exceeded error not appears during snake layout.
    */

    // Workaround against fake scroll bars that sometimes shown even if they are not intended to
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    // ---
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        test.fail(
          msg.type() === 'error',
          `There is error in console: ${msg.text}`,
        );
      }
    });
    await openFileAndAddToCanvasMacro(page, `KET/sequence-peptides-8000.ket`);
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
  });

  test('Activate Snake mode and open external rna-modified file', async () => {
    /* 
    Test case: Snake Mode
    Description: File opened in snake mode.
    We have incorrect behavior because bug https://github.com/epam/ketcher/issues/4122 need to be fixed.
    Then update expected screenshot.
    */
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await openFileAndAddToCanvasMacro(
      page,
      `Molfiles-V3000/rna-mod-phosphate-example.mol`,
      MacroFileType.MOLv3000,
    );
    await takeEditorScreenshot(page);
  });

  test('Check snake layout to monomers connected through R1 to R2 and R3 to R2', async () => {
    /* 
    Test case: Snake Mode
    Description: Both snake bonds are connected to the default position of attachment point used for this bond
    */
    await openFileAndAddToCanvasMacro(
      page,
      `KET/three-peptides-connected-r1-r2-r3-r2.ket`,
    );
    await takeEditorScreenshot(page);
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await takeEditorScreenshot(page);
  });

  test('Check snake layout to peptides chains connected through R1-R1, R2-R2 and R2 to R1', async () => {
    /* 
    Test case: Snake Mode
    Description: Bonds connected through R1-R1 and R2-R2 connections should remain straight line. Connected through R2-R1 snake layout.
    */
    const SCROLL_DELTA = 700;
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
    await openFileAndAddToCanvasMacro(
      page,
      `KET/two-peptide-chains-one-connected-through-r1-r1-and-r2-r2-another-r2-r1.ket`,
    );
    await takeEditorScreenshot(page);
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await takeEditorScreenshot(page);
    await scrollDown(page, SCROLL_DELTA);
    await takeEditorScreenshot(page);
  });
});
