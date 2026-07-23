/* eslint-disable @typescript-eslint/no-empty-function */
import { Page } from '@playwright/test';
import { test, expect } from '@fixtures';
import { MacromoleculesTopToolbar } from '@tests/pages/macromolecules/MacromoleculesTopToolbar';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import {
  MacroFileType,
  openFileAndAddToCanvasAsNewProject,
  MolFileFormat,
  takeElementScreenshot,
  pasteFromClipboardAndOpenAsNewProjectMacro,
  pasteFromClipboardAndAddToMacromoleculesCanvas,
} from '@utils';
import {
  FileType,
  verifyFileExport,
  verifyHELMExport,
  verifySVGExport,
} from '@utils/files/receiveFileComparisonData';
import {
  getMonomerLocator,
  getSymbolLocator,
} from '@utils/macromolecules/monomer';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { LayoutMode } from '@tests/pages/constants/macromoleculesTopToolbar/Constants';
import {
  ModifyAminoAcidsOption,
  MonomerOption,
} from '@tests/pages/constants/contextMenu/Constants';
import { ContextMenu } from '@tests/pages/common/ContextMenu';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { getAbbreviationLocator } from '@utils/canvas/s-group-signes/getAbbreviationLocator';
import { Peptide } from '@tests/pages/constants/monomers/Peptides';

const applyAminoAcidModifications = async (page: Page) => {
  const monomerA = getMonomerLocator(page, Peptide.A);
  const monomerS = getMonomerLocator(page, Peptide.S);
  const monomerR = getMonomerLocator(page, Peptide.R);
  const monomerC = getMonomerLocator(page, Peptide.C);

  await ContextMenu(page, monomerA).click([
    MonomerOption.ModifyAminoAcids,
    ModifyAminoAcidsOption.Inversion,
  ]);
  await ContextMenu(page, monomerC).click([
    MonomerOption.ModifyAminoAcids,
    ModifyAminoAcidsOption.NMethylation,
  ]);
  await ContextMenu(page, monomerR).click([
    MonomerOption.ModifyAminoAcids,
    ModifyAminoAcidsOption.Citrullination,
  ]);
  await ContextMenu(page, monomerS).click([
    MonomerOption.ModifyAminoAcids,
    ModifyAminoAcidsOption.Phosphorylation,
  ]);

  return { monomerA, monomerC, monomerR, monomerS };
};

let page: Page;

test.describe('Allow modifying amino acids on canvas', () => {
  test.beforeAll(async ({ initFlexCanvas }) => {
    page = await initFlexCanvas();
  });
  test.afterEach(async ({ FlexCanvas: _ }) => {});
  test.afterAll(async ({ closePage }) => {
    await closePage();
  });

  test('Case 1: Verify that structures with modified amino acids are correctly saved in KET format.', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7103
     * Description: Verify that tructures with modified amino acids are correctly saved in all supported formats.
     * The structure should be correctly displayed after saving and opening the file.
     * Scenario:
     * 1. Go to Macro mode - Flex
     * 2. Paste structure on canvas that contains amino acids and perform modifications.
     * 3. Save element in KET format.
     * 4. Paste saved structure from clipboard and open as new project.
     * 5. Take screenshot of the structure on canvas and compare with expected result.
     *
     * Version 3.15
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'PEPTIDE1{A.S.R.C}$$$$V2.0',
    );
    await applyAminoAcidModifications(page);
    await verifyFileExport(
      page,
      'KET/amino-acids-with-modification-expected.ket',
      FileType.KET,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/amino-acids-with-modification-expected.ket',
    );
    await takeElementScreenshot(
      page,
      getMonomerLocator(page, { monomerAlias: 'Cit' }),
      {
        padding: 150,
      },
    );
  });

  test('Case 2: Verify that structures with modified amino acids are correctly saved in MOL format.', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7103
     * Description: Verify that tructures with modified amino acids are correctly saved in all supported formats.
     * The structure should be correctly displayed after saving and opening the file.
     * Scenario:
     * 1. Go to Macro mode - Flex
     * 2. Paste structure on canvas that contains amino acids with modifications.
     * 3. Save element in MOL format.
     * 4. Paste saved structure from clipboard and open as new project.
     * 5. Take screenshot of the structure on canvas and compare with expected result.
     *
     * Version 3.15
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'PEPTIDE1{A.S.R.C}$$$$V2.0',
    );
    await applyAminoAcidModifications(page);
    await verifyFileExport(
      page,
      'KET/amino-acids-with-modification-expected.mol',
      FileType.MOL,
      MolFileFormat.v3000,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/amino-acids-with-modification-expected.mol',
    );
    await takeElementScreenshot(
      page,
      getMonomerLocator(page, { monomerAlias: 'Cit' }),
      {
        padding: 150,
      },
    );
  });

  test('Case 3: Verify that structures with modified amino acids are correctly saved in HELM format.', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7103
     * Description: Verify that tructures with modified amino acids are correctly saved in all supported formats.
     * The structure should be correctly displayed after saving and opening the file.
     * Scenario:
     * 1. Go to Macro mode - Flex
     * 2. Paste structure on canvas that contains amino acids with modifications.
     * 3. Save element in HELM format.
     * 4. Paste saved structure from clipboard and open as new project.
     * 5. Take screenshot of the structure on canvas and compare with expected result.
     *
     * Version 3.15
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'PEPTIDE1{A.S.R.C}$$$$V2.0',
    );
    await applyAminoAcidModifications(page);
    await verifyHELMExport(
      page,
      `PEPTIDE1{[dA].[Ser_PO3H2].[Cit].[meC]}$$$$V2.0`,
    );
    await pasteFromClipboardAndOpenAsNewProjectMacro(
      page,
      MacroFileType.HELM,
      `PEPTIDE1{[dA].[Ser_PO3H2].[Cit].[meC]}$$$$V2.0`,
    );
    await takeElementScreenshot(
      page,
      getMonomerLocator(page, { monomerAlias: 'Cit' }),
      {
        padding: 150,
      },
    );
  });

  test('Case 4: Verify that structures with modified amino acids are correctly saved in SVG format.', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7103
     * Description: Verify that tructures with modified amino acids are correctly saved in all supported formats.
     * The structure should be correctly displayed after saving and opening the file.
     * Scenario:
     * 1. Go to Macro mode - Flex
     * 2. Paste structure on canvas that contains amino acids with modifications.
     * 3. Save element in SVG format.
     * 4. Paste saved structure from clipboard and open as new project.
     * 5. Take screenshot of the structure on canvas and compare with expected result.
     *
     * Version 3.15
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'PEPTIDE1{A.S.R.C}$$$$V2.0',
    );
    await applyAminoAcidModifications(page);
    await verifySVGExport(page);
  });

  test('Case 5: Verify that the Erase tool properly deletes modified amino acids from the canvas.', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7103
     * Description:Verify that the Erase tool properly deletes modified amino acids from the canvas.
     * The structure should be correctly erased from canvas.
     * Scenario:
     * 1. Go to Macro mode - Flex
     * 2. Paste structure on canvas that contains amino acids.
     * 3. Select modified amino acid.Verify that amino acid not longer visible on canvas.
     * 4. Choose Erase tool and delete the structure from canvas.Repeat steps 3-4 for each modified amino acid.
     *
     * Version 3.15
     */
    const dALocator = getMonomerLocator(page, { monomerAlias: 'dA' });
    const SerPO3Locator = getMonomerLocator(page, { monomerAlias: 'SerPO3' });
    const CitLocator = getMonomerLocator(page, { monomerAlias: 'Cit' });
    const meCLocator = getMonomerLocator(page, { monomerAlias: 'meC' });
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'PEPTIDE1{A.S.R.C}$$$$V2.0',
    );
    await applyAminoAcidModifications(page);
    await expect(dALocator).toBeVisible();
    await expect(SerPO3Locator).toBeVisible();
    await expect(CitLocator).toBeVisible();
    await expect(meCLocator).toBeVisible();
    await CommonLeftToolbar(page).erase();
    await dALocator.click();
    await expect(dALocator).not.toBeVisible();
    await SerPO3Locator.click();
    await expect(SerPO3Locator).not.toBeVisible();
    await CitLocator.click();
    await expect(CitLocator).not.toBeVisible();
    await meCLocator.click();
    await expect(meCLocator).not.toBeVisible();
  });

  test('Case 6: Validate view switching (flex/sequence/snake) after applying modification', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7103
     * Description: Validate view switching (flex/sequence/snake) after applying modification
     * The structure should be correctly displayed after switching mode.
     * Scenario:
     * 1. Go to Macro mode - Flex
     * 2.Paste structure on canvas that contains amino acids with modifications.
     * 3.Take screenshot in Flex view.
     * 4.Switch to Sequence view and take screenshot.
     * 5.Switch to Snake view and take screenshot.
     *
     * Version 3.15
     */
    const sequenceItemLocator = getSymbolLocator(page, {}).first();
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'PEPTIDE1{A.S.R.C}$$$$V2.0',
    );
    await applyAminoAcidModifications(page);
    await takeElementScreenshot(
      page,
      getMonomerLocator(page, { monomerAlias: 'Cit' }),
      {
        padding: 150,
      },
    );
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(
      LayoutMode.Sequence,
    );
    await takeElementScreenshot(page, sequenceItemLocator, {
      padding: 100,
    });
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await takeElementScreenshot(
      page,
      getMonomerLocator(page, { monomerAlias: 'Cit' }),
      {
        padding: 150,
      },
    );
  });

  test('Case 7: Ensure that structures with modified amino acids can be loaded back without corruption or loss of modifications.', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7103
     * Description: Ensure that structures with modified amino acids can be loaded back without corruption or loss of modifications.
     * The structure should be correctly displayed after opening the file.
     * Scenario:
     * 1. Go to Macro mode - Flex
     * 2.Paste structure on canvas that contains amino acids with modifications.
     * 3.Verify modified amino acids are visible on canvas.
     *
     * Version 3.15
     */
    const dALocator = getMonomerLocator(page, { monomerAlias: 'dA' });
    const SerPO3Locator = getMonomerLocator(page, { monomerAlias: 'SerPO3' });
    const CitLocator = getMonomerLocator(page, { monomerAlias: 'Cit' });
    const meCLocator = getMonomerLocator(page, { monomerAlias: 'meC' });
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'PEPTIDE1{A.S.R.C}$$$$V2.0',
    );
    await ContextMenu(page, getMonomerLocator(page, Peptide.A)).click([
      MonomerOption.ModifyAminoAcids,
      ModifyAminoAcidsOption.Inversion,
    ]);
    await expect(dALocator).toBeVisible();
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/amino-acid-citrulination-modification.ket',
    );
    await expect(CitLocator).toBeVisible();
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/amino-acid-phosphorylation-modification.ket',
    );

    await expect(SerPO3Locator).toBeVisible();
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/amino-acid-N-methylation-modification.ket',
    );
    await expect(meCLocator).toBeVisible();
  });

  test('Case 8: Modify an amino acid, then use undo and redo to verify correct behavior.', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7103
     * Description: Modify an amino acid, then use undo and redo to verify correct behavior.
     * The structure should be correctly modified, undone and redone on canvas.
     * Scenario:
     * 1. Go to Macro mode - Flex
     * 2.Paste structure on canvas that contains amino acids.
     * 3. Apply modification to amino acid.
     * 4. Verify modification is visible on canvas.
     * 5. Use undo and verify modification is removed and original amino acid is visible.
     * 6. Use redo and verify modification is restored.
     *
     * Version 3.15
     */
    const monomerA = getMonomerLocator(page, { monomerAlias: 'A' });
    const monomerC = getMonomerLocator(page, { monomerAlias: 'C' });
    const monomerR = getMonomerLocator(page, { monomerAlias: 'R' });
    const monomerS = getMonomerLocator(page, { monomerAlias: 'S' });

    const dALocator = getMonomerLocator(page, { monomerAlias: 'dA' });
    const SerPO3Locator = getMonomerLocator(page, { monomerAlias: 'SerPO3' });
    const CitLocator = getMonomerLocator(page, { monomerAlias: 'Cit' });
    const meCLocator = getMonomerLocator(page, { monomerAlias: 'meC' });
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'PEPTIDE1{A.S.R.C}$$$$V2.0',
    );
    await ContextMenu(page, monomerA).click([
      MonomerOption.ModifyAminoAcids,
      ModifyAminoAcidsOption.Inversion,
    ]);
    await expect(dALocator).toBeVisible();
    await CommonTopLeftToolbar(page).undo();
    await expect(dALocator).not.toBeVisible();
    await expect(monomerA).toBeVisible();
    await CommonTopLeftToolbar(page).redo();
    await expect(dALocator).toBeVisible();
    await ContextMenu(page, monomerC).click([
      MonomerOption.ModifyAminoAcids,
      ModifyAminoAcidsOption.NMethylation,
    ]);
    await expect(meCLocator).toBeVisible();
    await CommonTopLeftToolbar(page).undo();
    await expect(meCLocator).not.toBeVisible();
    await expect(monomerC).toBeVisible();
    await CommonTopLeftToolbar(page).redo();
    await expect(meCLocator).toBeVisible();
    await ContextMenu(page, monomerR).click([
      MonomerOption.ModifyAminoAcids,
      ModifyAminoAcidsOption.Citrullination,
    ]);
    await expect(CitLocator).toBeVisible();
    await CommonTopLeftToolbar(page).undo();
    await expect(CitLocator).not.toBeVisible();
    await expect(monomerR).toBeVisible();
    await CommonTopLeftToolbar(page).redo();
    await expect(CitLocator).toBeVisible();
    await ContextMenu(page, monomerS).click([
      MonomerOption.ModifyAminoAcids,
      ModifyAminoAcidsOption.Phosphorylation,
    ]);
    await expect(SerPO3Locator).toBeVisible();
    await CommonTopLeftToolbar(page).undo();
    await expect(SerPO3Locator).not.toBeVisible();
    await expect(monomerS).toBeVisible();
    await CommonTopLeftToolbar(page).redo();
    await expect(SerPO3Locator).toBeVisible();
  });
  test('Case 9: Zoom in/out and ensure no glitches with modified amino acids on canvas..', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7103
     * Description: Zoom in/out and ensure no glitches with modified amino acids on canvas...
     * The structure should be correctly displayed after zooming in zooming out.
     * Scenario:
     * 1. Go to Macro mode - Flex
     * 2.Paste structure on canvas that contains amino acids.
     * 3.Apply modification to amino acid.
     * 4.Verify modification is visible on canvas.
     * 5.Zoom in/out and ensure no glitches with modified amino acids on canvas.
     *
     * Version 3.15
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'PEPTIDE1{A.S.R.C}$$$$V2.0',
    );
    await applyAminoAcidModifications(page);
    await takeElementScreenshot(
      page,
      getMonomerLocator(page, { monomerAlias: 'Cit' }),
      {
        padding: 150,
      },
    );
    await CommonTopRightToolbar(page).setZoomInputValue('130');
    await takeElementScreenshot(
      page,
      getMonomerLocator(page, { monomerAlias: 'dA' }),
      {
        padding: 250,
      },
    );
    await CommonTopRightToolbar(page).setZoomInputValue('50');
    await takeElementScreenshot(
      page,
      getMonomerLocator(page, { monomerAlias: 'Cit' }),
      {
        padding: 150,
      },
    );
    await CommonTopRightToolbar(page).setZoomInputValue('100');
  });
  test('Case 10: Switch to micromolecules mode and back after applying modifications. Structures should remain unchanged.', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7103
     * Description: Switch to micromolecules mode and back after applying modifications. Structures should remain unchanged.
     * The structure should be correctly displayed after switching modes.
     * Scenario:
     * 1. Go to Macro mode - Flex
     * 2.Paste structure on canvas that contains amino acids.
     * 3.Apply modification to amino acid.
     * 4.Verify modification is visible on canvas.
     * 5.Switch to micromolecules mode and verify structure is correctly displayed.
     * 6.Switch back to macromolecules mode and verify structure is correctly displayed.
     *
     * Version 3.15
     */
    const sequenceItemLocator = getAbbreviationLocator(page, {
      name: 'SerPO3',
    });
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'PEPTIDE1{A.S.R.C}$$$$V2.0',
    );
    await applyAminoAcidModifications(page);
    await takeElementScreenshot(
      page,
      getMonomerLocator(page, { monomerAlias: 'Cit' }),
      {
        padding: 150,
      },
    );
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await takeElementScreenshot(page, sequenceItemLocator, {
      padding: 150,
    });
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await takeElementScreenshot(
      page,
      getMonomerLocator(page, { monomerAlias: 'Cit' }),
      {
        padding: 150,
      },
    );
  });
  test('Case 11: Save/load modified amino acid structures from micromolecules mode KET format.', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7103
     * Description: Save/load modified amino acid structures from micromolecules mode KET format.
     * The structure should be correctly displayed after saving and opening the file in micromolecules mode.
     * Scenario:
     * 1. Go to Macro mode - Flex
     * 2.Paste structure on canvas that contains amino acids.
     * 3.Apply modification to amino acid.
     * 4.Switch to micromolecules mode.
     * 5.Save structure in KET format.
     * 6.Paste saved structure from clipboard and open as new project.
     * 7.Take screenshot of the structure on canvas and compare with expected result.
     *
     * Version 3.15
     */
    const sequenceItemLocator = getAbbreviationLocator(page, {
      name: 'SerPO3',
    });
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'PEPTIDE1{A.S.R.C}$$$$V2.0',
    );
    await applyAminoAcidModifications(page);
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await verifyFileExport(
      page,
      'KET/amino-acids-with-modification-micromolecules-expected.ket',
      FileType.KET,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/amino-acids-with-modification-micromolecules-expected.ket',
    );
    await takeElementScreenshot(page, sequenceItemLocator, {
      padding: 150,
    });
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await takeElementScreenshot(page, getMonomerLocator(page, Peptide.dA), {
      padding: 180,
    });
  });
  test('Case 12: Save/load modified amino acid structures from micromolecules mode MOL format.', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7103
     * Description: Save/load modified amino acid structures from micromolecules mode MOL format.
     * The structure should be correctly displayed after saving and opening the file in micromolecules mode.
     * Scenario:
     * 1. Go to Macro mode - Flex
     * 2.Paste structure on canvas that contains amino acids.
     * 3.Apply modification to amino acid.
     * 4.Switch to micromolecules mode.
     * 5.Save structure in MOL format.
     * 6.Paste saved structure from clipboard and open as new project.
     * 7.Take screenshot of the structure on canvas and compare with expected result.
     *
     * Version 3.15
     */
    const sequenceItemLocator = getAbbreviationLocator(page, {
      name: 'SerPO3',
    });
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'PEPTIDE1{A.S.R.C}$$$$V2.0',
    );
    await applyAminoAcidModifications(page);
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await verifyFileExport(
      page,
      'KET/amino-acids-with-modification-micromolecules-expected.mol',
      FileType.MOL,
      MolFileFormat.v3000,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/amino-acids-with-modification-micromolecules-expected.mol',
    );
    await takeElementScreenshot(page, sequenceItemLocator, {
      padding: 150,
    });
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await takeElementScreenshot(page, getMonomerLocator(page, Peptide.dA), {
      padding: 180,
    });
  });
});
