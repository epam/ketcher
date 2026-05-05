/* eslint-disable @typescript-eslint/no-empty-function */
import { Page } from '@playwright/test';
import { test, expect } from '@fixtures';
import { MacromoleculesTopToolbar } from '@tests/pages/macromolecules/MacromoleculesTopToolbar';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import {
  takeEditorScreenshot,
  pasteFromClipboardAndAddToMacromoleculesCanvas,
  MacroFileType,
  openFileAndAddToCanvasAsNewProject,
  moveMouseAway,
  openFileAndAddToCanvasAsNewProjectMacro,
  resetZoomLevelToDefault,
  clickOnCanvas,
  setMolecule,
  MolFileFormat,
  readFileContent,
  takeElementScreenshot,
  pasteFromClipboardAndOpenAsNewProjectMacro,
  selectAllStructuresOnCanvas,
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
import { C } from 'react-router/dist/development/index-react-server-client-1TI9M9o1';
import { getAbbreviationLocator } from '@utils/canvas/s-group-signes/getAbbreviation';

const applyAminoAcidModifications = async (page: Page) => {
  const monomerA = getMonomerLocator(page, { monomerAlias: 'A' });
  const monomerC = getMonomerLocator(page, { monomerAlias: 'C' });
  const monomerR = getMonomerLocator(page, { monomerAlias: 'R' });
  const monomerS = getMonomerLocator(page, { monomerAlias: 'S' });

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
     * 2.Paste structure on canvas that contains amino acids.
     * 2. Select structure on canvas.
     * 3. Press "Arrange as a Ring" button on the top toolbar
     *
     * Version 3.15
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/amino-acids-with-modification.ket',
    );
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
     * 2.Paste structure on canvas that contains amino acids.
     * 2. Select structure on canvas.
     * 3. Press "Arrange as a Ring" button on the top toolbar
     *
     * Version 3.15
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/amino-acids-with-modification.ket',
    );
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
     * 2.Paste structure on canvas that contains amino acids.
     *
     * Version 3.15
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/amino-acids-with-modification.ket',
    );
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
     * 2.Paste structure on canvas that contains amino acids.
     *
     * Version 3.15
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/amino-acids-with-modification.ket',
    );
    await verifySVGExport(page);
  });

  test('Case 5: Verify that the Erase tool properly deletes modified amino acids from the canvas.', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7103
     * Description: Verify that tructures with modified amino acids are correctly saved in all supported formats.
     * The structure should be correctly displayed after saving and opening the file.
     * Scenario:
     * 1. Go to Macro mode - Flex
     * 2.Paste structure on canvas that contains amino acids.
     *3.Selectstruction on canvas.
     4.Choose Erase tool and delete the structure from canvas.
     * Version 3.15
     */
    const dALocator = getMonomerLocator(page, { monomerAlias: 'dA' });
    const SerPO3Locator = getMonomerLocator(page, { monomerAlias: 'SerPO3' });
    const CitLocator = getMonomerLocator(page, { monomerAlias: 'Cit' });
    const meCLocator = getMonomerLocator(page, { monomerAlias: 'meC' });
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/amino-acids-with-modification.ket',
    );
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
     * Description: Verify that tructures with modified amino acids are correctly saved in all supported formats.
     * The structure should be correctly displayed after saving and opening the file.
     * Scenario:
     * 1. Go to Macro mode - Flex
     * 2.Paste structure on canvas that contains amino acids.
     * 3.Take screenshot in Flex view.
     * 4.Switch to Sequence view and take screenshot.
     * 5.Switch to Snake view and take screenshot.
     *
     * Version 3.15
     */
    const sequenceItemLocator = getSymbolLocator(page, {}).first();
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/amino-acids-with-modification.ket',
    );
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
     * Description: Verify that tructures with modified amino acids are correctly saved in all supported formats.
     * The structure should be correctly displayed after saving and opening the file.
     * Scenario:
     * 1. Go to Macro mode - Flex
     * 2.Paste structure on canvas that contains amino acids.
     *
     * Version 3.15
     */
    const dALocator = getMonomerLocator(page, { monomerAlias: 'dA' });
    const SerPO3Locator = getMonomerLocator(page, { monomerAlias: 'SerPO3' });
    const CitLocator = getMonomerLocator(page, { monomerAlias: 'Cit' });
    const meCLocator = getMonomerLocator(page, { monomerAlias: 'meC' });
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/amino-acid-invertion-modification.ket',
    );
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
     * Description: Verify that tructures with modified amino acids are correctly saved in all supported formats.
     * The structure should be correctly displayed after saving and opening the file.
     * Scenario:
     * 1. Go to Macro mode - Flex
     * 2.Paste structure on canvas that contains amino acids.
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
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/amino-acids-for-modification.ket',
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
     * Description: Verify that tructures with modified amino acids are correctly saved in all supported formats.
     * The structure should be correctly displayed after saving and opening the file.
     * Scenario:
     * 1. Go to Macro mode - Flex
     * 2.Paste structure on canvas that contains amino acids.
     *
     * Version 3.15
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/amino-acids-for-modification.ket',
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
     * Description: Verify that tructures with modified amino acids are correctly saved in all supported formats.
     * The structure should be correctly displayed after saving and opening the file.
     * Scenario:
     * 1. Go to Macro mode - Flex
     * 2.Paste structure on canvas that contains amino acids.
     *
     * Version 3.15
     */
    const sequenceItemLocator = getAbbreviationLocator(page, {
      name: 'SerPO3',
    });
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/amino-acids-for-modification.ket',
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
     * Description: Verify that tructures with modified amino acids are correctly saved in all supported formats.
     * The structure should be correctly displayed after saving and opening the file.
     * Scenario:
     * 1. Go to Macro mode - Flex
     * 2.Paste structure on canvas that contains amino acids.
     *
     * Version 3.15
     */
    const sequenceItemLocator = getAbbreviationLocator(page, {
      name: 'SerPO3',
    });
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/amino-acids-for-modification.ket',
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
    await takeElementScreenshot(
      page,
      getMonomerLocator(page, { monomerAlias: 'Cit' }),
      {
        padding: 150,
      },
    );
  });
  test('Case 12: Save/load modified amino acid structures from micromolecules mode MOL format.', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7103
     * Description: Verify that tructures with modified amino acids are correctly saved in all supported formats.
     * The structure should be correctly displayed after saving and opening the file.
     * Scenario:
     * 1. Go to Macro mode - Flex
     * 2.Paste structure on canvas that contains amino acids.
     *
     * Version 3.15
     */
    const sequenceItemLocator = page.locator("text[data-sgroup-name='SerPO3']");
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/amino-acids-for-modification.ket',
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
    await takeElementScreenshot(
      page,
      getMonomerLocator(page, { monomerAlias: 'Cit' }),
      {
        padding: 150,
      },
    );
  });
});
