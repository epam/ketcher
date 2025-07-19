/* eslint-disable no-magic-numbers */
import { test, expect } from '@playwright/test';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import { selectRingButton } from '@tests/pages/molecules/BottomToolbar';
import {
  getCoordinatesTopAtomOfBenzeneRing,
  clickInTheMiddleOfTheScreen,
  takeEditorScreenshot,
  waitForPageInit,
  clickOnCanvas,
  selectAllStructuresOnCanvas,
  openFileAndAddToCanvasAsNewProject,
  ZoomInByKeyboard,
  ZoomOutByKeyboard,
  BondType,
  MolFileFormat,
  takeElementScreenshot,
  moveMouseAway,
} from '@utils';
import {
  selectFlexLayoutModeTool,
  selectSequenceLayoutModeTool,
  selectSnakeLayoutModeTool,
} from '@utils/canvas/tools';
import { getAtomByIndex } from '@utils/canvas/atoms/getAtomByIndex/getAtomByIndex';
import { RingButton } from '@tests/pages/constants/ringButton/Constants';
import { SGroupPropertiesDialog } from '@tests/pages/molecules/canvas/S-GroupPropertiesDialog';
import {
  ComponentOption,
  TypeOption,
} from '@tests/pages/constants/s-GroupPropertiesDialog/Constants';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import {
  FileType,
  verifyFileExport,
} from '@utils/files/receiveFileComparisonData';
import { removeAbbreviation } from '@utils/sgroup/helpers';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { getBondByIndex } from '@utils/canvas/bonds';
import { SaveStructureDialog } from '@tests/pages/common/SaveStructureDialog';
import { MoleculesFileFormatType } from '@tests/pages/constants/fileFormats/microFileFormats';
import { IndigoFunctionsToolbar } from '@tests/pages/molecules/IndigoFunctionsToolbar';
import { CalculatedValuesDialog } from '@tests/pages/molecules/canvas/CalculatedValuesDialog';

test.describe('S-Group Properties', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Checking S-Group drop-down types', async ({ page }) => {
    /*
     * Test case: EPMLSOPKET-1502
     * Description: Checking S-Group drop-down types 'Type' drop-down list with Data,
     * Multiple group, SRU polymer, Superatom and Query Component items. Data item is selected by default;
     *
     * Test task: https://github.com/epam/ketcher/issues/7401
     * Description: Verify that a new option 'Nucleotide Component' is present in the S-group menu
     * Case: 1. Put Benzene Ring on the canvas
     *       2. Select it
     *       3. Press S-Group button to open S-Group Properties window
     *       4. Click on Type dropdown to expand Type options list
     *       5. Validate presence of Nucleotide Component option
     *
     * Version 3.6
     */
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);

    await LeftToolbar(page).sGroup();
    const { x, y } = await getCoordinatesTopAtomOfBenzeneRing(page);
    await clickOnCanvas(page, x, y);
    await SGroupPropertiesDialog(page).typeDropdown.click();

    await expect(page.getByTestId(TypeOption.Data)).toContainText('Data');
    await expect(page.getByTestId(TypeOption.MultipleGroup)).toContainText(
      'Multiple group',
    );
    await expect(page.getByTestId(TypeOption.SRUPolymer)).toContainText(
      'SRU polymer',
    );
    await expect(page.getByTestId(TypeOption.Superatom)).toContainText(
      'Superatom',
    );
    await expect(page.getByTestId(TypeOption.QueryComponent)).toContainText(
      'Query component',
    );
    await expect(
      page.getByTestId(TypeOption.NucleotideComponent),
    ).toContainText('Nucleotide Component');
  });

  test('Checking Nucleotide Component drop-down options', async ({ page }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/7401
     * Description: Verify that after selecting 'Nucleotide Component', a Component dropdown appears with
     *              options 'Base', 'Sugar', and 'Phosphate'
     * Case: 1. Put Benzene Ring on the canvas
     *       2. Select it
     *       3. Press S-Group button to open S-Group Properties window
     *       4. Select Nucleotide Component option in Type dropdown
     *       4. Click on Component dropdown to expand Component options list
     *       5. Validate presence of 'Base', 'Sugar', and 'Phosphate' options
     *
     *  Version 3.6
     */
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);
    await selectAllStructuresOnCanvas(page);
    await LeftToolbar(page).sGroup();
    await SGroupPropertiesDialog(page).selectType(
      TypeOption.NucleotideComponent,
    );
    await SGroupPropertiesDialog(page).componentDropdown.click();

    await expect(page.getByTestId(ComponentOption.Sugar)).toContainText(
      'Sugar',
    );
    await expect(page.getByTestId(ComponentOption.Base)).toContainText('Base');
    await expect(page.getByTestId(ComponentOption.Phosphate)).toContainText(
      'Phosphate',
    );
  });

  test('Checking Sugar type S-Group creation', async ({ page }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/7401
     * Description: Verify that after selecting Sugar Nucleotide conponent and clicking Save, the S-group is applied to the selected structure
     *
     * Case: 1. Put Benzene Ring on the canvas
     *       2. Select it
     *       3. Press S-Group button to open S-Group Properties window
     *       4. Set Nucleotide conponent --> Sugar options --> press Ok
     *       5. Take screenshot to validate Sugar type S-Group creation
     *
     *  Version 3.6
     */
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);
    await selectAllStructuresOnCanvas(page);
    await LeftToolbar(page).sGroup();
    await SGroupPropertiesDialog(page).setOptions({
      Type: TypeOption.NucleotideComponent,
      Component: ComponentOption.Sugar,
    });
    await takeEditorScreenshot(page);
  });

  test('Checking Base type S-Group creation', async ({ page }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/7401
     * Description: Verify that after selecting Base Nucleotide conponent and clicking Save, the S-group is applied to the selected structure
     *
     * Case: 1. Put Benzene Ring on the canvas
     *       2. Select it
     *       3. Press S-Group button to open S-Group Properties window
     *       4. Set Nucleotide conponent --> Base options --> press Ok
     *       5. Take screenshot to validate Base type S-Group creation
     *
     *  Version 3.6
     */
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);
    await selectAllStructuresOnCanvas(page);
    await LeftToolbar(page).sGroup();
    await SGroupPropertiesDialog(page).setOptions({
      Type: TypeOption.NucleotideComponent,
      Component: ComponentOption.Base,
    });
    await takeEditorScreenshot(page);
  });

  test('Checking Phosphate type S-Group creation', async ({ page }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/7401
     * Description: Verify that after selecting Phosphate Nucleotide conponent and clicking Save, the S-group is applied to the selected structure
     *
     * Case: 1. Put Benzene Ring on the canvas
     *       2. Select it
     *       3. Press S-Group button to open S-Group Properties window
     *       4. Set Nucleotide conponent --> Phosphate options --> press Ok
     *       5. Take screenshot to validate Phosphate type S-Group creation
     *
     *  Version 3.6
     */
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);
    await selectAllStructuresOnCanvas(page);
    await LeftToolbar(page).sGroup();
    await SGroupPropertiesDialog(page).setOptions({
      Type: TypeOption.NucleotideComponent,
      Component: ComponentOption.Phosphate,
    });
    await takeEditorScreenshot(page);
  });

  test('Checking Sugar, Base and Phosphate type S-Group on Macromolecules cavas', async ({
    page,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/7401
     * Description: 1. Check that in macromolecules mode, these structures appear as any other superatom
     *                 S-group (no brackets, no label, just a chemical structure).
     *              2. Check that the labels Phosphate, Sugar, and Base have the first letter capital
     *              3. Check switching to Macro mode, then switch between Sequence, Flex, Snake and back
     *                 to Micro for structure with added Nucleotides components
     *
     * Case: 1. Load from KET three molecules inside Sugar, Base and Phosphate typeed S-Groups
     *       2. Switch to Macromolecules canvas
     *       3. Take screenshot to validate these structures appear as any other superatom
     *          S-group (no brackets, no label, just a chemical structure)
     *
     *  Version 3.6
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/S-Groups/All types of Nucleotide Componets S-Groups.ket',
    );
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await selectFlexLayoutModeTool(page);
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
    });
    await selectSnakeLayoutModeTool(page);
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
    });
    await selectSequenceLayoutModeTool(page);
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Checking export to KET of Sugar, Base and Phosphate type S-Group ', async ({
    page,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/7401
     * Description: Verify that marked structures are saved correctly to KET format (only the structure
     *              (with appropriate APs with H leaving groups) and the class)
     *
     * Case: 1. Load from KET three molecules inside Sugar, Base and Phosphate typeed S-Groups
     *       2. Verify export to KET
     *       3. Load export result
     *       3. Take screenshot to validate export work correct
     *
     *  Version 3.6
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/S-Groups/LayoutCheck.ket',
    );
    await verifyFileExport(
      page,
      'KET/S-Groups/LayoutCheck-expected.ket',
      FileType.KET,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/S-Groups/LayoutCheck-expected.ket',
    );
    await takeEditorScreenshot(page);
  });

  test('Checking export to MOL v2000 of Sugar, Base and Phosphate type S-Group ', async ({
    page,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/7401
     * Description: Verify that marked structures are saved correctly to MOL v2000 format (only the structure
     *              (with appropriate APs with H leaving groups) and the class)
     *
     * Case: 1. Load from KET three molecules inside Sugar, Base and Phosphate typeed S-Groups and superatoms groups for comparison
     *       2. Verify export to MOL v2000
     *       3. Load export result
     *       3. Take screenshot to validate export work correct
     *
     *  Version 3.6
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/S-Groups/Nucleotides and Superatoms.ket',
    );
    await verifyFileExport(
      page,
      'Molfiles-V2000/S-Groups/Nucleotides and Superatoms-expected.mol',
      FileType.MOL,
      MolFileFormat.v2000,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'Molfiles-V2000/S-Groups/Nucleotides and Superatoms-expected.mol',
    );
    await takeEditorScreenshot(page);
  });

  test('Checking export to MOL v3000 of Sugar, Base and Phosphate type S-Group ', async ({
    page,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/7401
     * Description: Verify that marked structures are saved correctly to MOL v3000 format (only the structure
     *              (with appropriate APs with H leaving groups) and the class)
     *
     * Case: 1. Load from KET three molecules inside Sugar, Base and Phosphate typeed S-Groups and superatoms groups for comparison
     *       2. Verify export to MOL v3000
     *       3. Load export result
     *       3. Take screenshot to validate export work correct
     *
     *  Version 3.6
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/S-Groups/Nucleotides and Superatoms.ket',
    );
    await verifyFileExport(
      page,
      'Molfiles-V3000/S-Groups/Nucleotides and Superatoms-expected.mol',
      FileType.MOL,
      MolFileFormat.v3000,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'Molfiles-V3000/S-Groups/Nucleotides and Superatoms-expected.mol',
    );
    await takeEditorScreenshot(page);
  });

  test('Checking export to CML of Sugar, Base and Phosphate type S-Group ', async ({
    page,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/7401
     * Description: Verify that marked structures are saved correctly to CML format (only the structure
     *              (with appropriate APs with H leaving groups) and the class)
     *
     * Case: 1. Load from KET three molecules inside Sugar, Base and Phosphate typeed S-Groups and superatoms groups for comparison
     *       2. Verify export to CML
     *       3. Load export result
     *       3. Take screenshot to validate export work correct
     *
     *  Version 3.6
     * Works wrong becaus if bug: https://github.com/epam/ketcher/issues/7409
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/S-Groups/Nucleotides and Superatoms.ket',
    );
    await verifyFileExport(
      page,
      'CML/S-Groups/Nucleotides and Superatoms-expected.cml',
      FileType.CML,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'CML/S-Groups/Nucleotides and Superatoms-expected.cml',
    );
    await takeEditorScreenshot(page);
  });

  test('Checking export to PNG of Sugar, Base and Phosphate type S-Group ', async ({
    page,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/7401
     * Description: Verify that marked structures are saved correctly to PNG format (only the structure
     *              (with appropriate APs with H leaving groups) and the class)
     *
     * Case: 1. Load from KET three molecules inside Sugar, Base and Phosphate typeed S-Groups and superatoms groups for comparison
     *       2. Verify export to PNG
     *
     *  Version 3.6
     * Works wrong becaus if bug: https://github.com/epam/ketcher/issues/7408
     */
    const saveStructureArea = SaveStructureDialog(page).saveStructureTextarea;

    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/S-Groups/Nucleotides and Superatoms.ket',
    );
    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.PNGImage,
    );
    await takeElementScreenshot(page, saveStructureArea);
    await SaveStructureDialog(page).cancel();
  });

  test('Checking export to SVG of Sugar, Base and Phosphate type S-Group ', async ({
    page,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/7401
     * Description: Verify that marked structures are saved correctly to PNG format (only the structure
     *              (with appropriate APs with H leaving groups) and the class)
     *
     * Case: 1. Load from KET three molecules inside Sugar, Base and Phosphate typeed S-Groups and superatoms groups for comparison
     *       2. Verify export to PNG
     *
     *  Version 3.6
     * Works wrong becaus if bug: https://github.com/epam/ketcher/issues/7408
     */
    const saveStructureArea = SaveStructureDialog(page).saveStructureTextarea;

    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/S-Groups/Nucleotides and Superatoms.ket',
    );
    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.SVGDocument,
    );
    await takeElementScreenshot(page, saveStructureArea);
    await SaveStructureDialog(page).cancel();
  });

  test('Checking export to CDXML of Sugar, Base and Phosphate type S-Group ', async ({
    page,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/7401
     * Description: Verify that marked structures are saved correctly to CDXML format (only the structure
     *              (with appropriate APs with H leaving groups) and the class)
     *
     * Case: 1. Load from KET three molecules inside Sugar, Base and Phosphate typeed S-Groups and superatoms groups for comparison
     *       2. Verify export to CDXML
     *       3. Load export result
     *       3. Take screenshot to validate export work correct
     *
     *  Version 3.6
     * Works wrong becaus if bug: https://github.com/epam/ketcher/issues/7410
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/S-Groups/Nucleotides and Superatoms.ket',
    );
    await verifyFileExport(
      page,
      'CDXML/S-Groups/Nucleotides and Superatoms-expected.cdxml',
      FileType.CDXML,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'CDXML/S-Groups/Nucleotides and Superatoms-expected.cdxml',
    );
    await takeEditorScreenshot(page);
  });

  test('Checking export to CDX of Sugar, Base and Phosphate type S-Group ', async ({
    page,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/7401
     * Description: Verify that marked structures are saved correctly to CDX format (only the structure
     *              (with appropriate APs with H leaving groups) and the class)
     *
     * Case: 1. Load from KET three molecules inside Sugar, Base and Phosphate typeed S-Groups and superatoms groups for comparison
     *       2. Verify export to CDX
     *       3. Load export result
     *       3. Take screenshot to validate export work correct
     *
     *  Version 3.6
     * Works wrong becaus if bug: https://github.com/epam/ketcher/issues/7411
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/S-Groups/Nucleotides and Superatoms.ket',
    );
    await verifyFileExport(
      page,
      'CDX/S-Groups/Nucleotides and Superatoms-expected.cdx',
      FileType.CDX,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'CDX/S-Groups/Nucleotides and Superatoms-expected.cdx',
    );
    await takeEditorScreenshot(page);
  });

  test('Checking Sugar, Base and Phosphate type S-Group Undo/Redo removal', async ({
    page,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/7401
     * Description: Verify that undo and redo work after applying or removing nucleotide component S-group
     *
     * Case: 1. Load from KET three molecules inside Sugar, Base and Phosphate typeed S-Groups
     *       2. Remove all three abbreviation
     *       3. Take screenshot to validate no s-groups on the canvas
     *       4. Press Undo tree times
     *       5. Take screenshot to validate all s-groups returned back
     *       6. Press Redo tree times
     *       7. Take screenshot to validate all s-groups got removed
     *
     *  Version 3.6
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/S-Groups/LayoutCheck.ket',
    );
    let point = await getAtomByIndex(page, { label: 'C' }, 0);
    await removeAbbreviation(page, point);
    point = await getAtomByIndex(page, { label: 'C' }, 7);
    await removeAbbreviation(page, point);
    point = await getAtomByIndex(page, { label: 'C' }, 15);
    await removeAbbreviation(page, point);

    await takeEditorScreenshot(page);

    await CommonTopLeftToolbar(page).undo();
    await CommonTopLeftToolbar(page).undo();
    await CommonTopLeftToolbar(page).undo();

    await takeEditorScreenshot(page);

    await CommonTopLeftToolbar(page).redo();
    await CommonTopLeftToolbar(page).redo();
    await CommonTopLeftToolbar(page).redo();

    await takeEditorScreenshot(page);
  });

  test('Verify that Delete removes the entire S-group and then it can be restored by Undo/Redo', async ({
    page,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/7401
     * Description: Verify that Delete removes the entire S-group and then it can be restored by Undo/Redo
     *
     * Case: 1. Load from KET three molecules inside Sugar, Base and Phosphate typeed S-Groups
     *       2. Select all structures on the canvas
     *       3. Press Erase button to delete
     *       4. Press Undo
     *       5. Take screenshot to validate all structures returned back
     *       6. Press Redo
     *       7. Take screenshot to validate all structures got removed
     *
     *  Version 3.6
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/S-Groups/LayoutCheck.ket',
    );
    await selectAllStructuresOnCanvas(page);
    await CommonLeftToolbar(page).selectEraseTool();
    await takeEditorScreenshot(page);

    await CommonTopLeftToolbar(page).undo();
    await takeEditorScreenshot(page);

    await CommonTopLeftToolbar(page).redo();
    await takeEditorScreenshot(page);
  });

  test('Check switching to Macro mode and back to Micro for structure with added Nucleotides components', async ({
    page,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/7401
     * Description: 1. Check switching to Macro mode and back to Micro for structure with added Nucleotides components
     *
     * Case: 1. Load from KET three molecules inside Sugar, Base and Phosphate typeed S-Groups
     *       2. Switch to Macromolecules canvas
     *       3. Switch back to to Micromolecules canvas
     *       4. Take screenshot to validate looks correct
     *
     *  Version 3.6
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/S-Groups/All types of Nucleotide Componets S-Groups.ket',
    );
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await selectFlexLayoutModeTool(page);
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await takeEditorScreenshot(page);
  });

  test('Verify appearance of Base, Sugar, and Phosphate on canvas in zoomed in mode', async ({
    page,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/7401
     * Description: Verify appearance of Base, Sugar, and Phosphate on canvas in zoomed mode
     *
     * Case: 1. Load three structures on the canvas
     *       2. Zoom In three times
     *       3. Select all structures on the canvas
     *       4. Set Nucleotide conponent --> Sugar options --> press Ok
     *       5. Take screenshot to validate Sugar type S-Group creation
     *
     *  Version 3.6
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/S-Groups/No Nucleotide Componets.ket',
    );
    await ZoomInByKeyboard(page, { repeat: 3 });
    await selectAllStructuresOnCanvas(page);
    await LeftToolbar(page).sGroup();
    await SGroupPropertiesDialog(page).setOptions({
      Type: TypeOption.NucleotideComponent,
      Component: ComponentOption.Sugar,
    });
    await takeEditorScreenshot(page);
  });

  test('Verify appearance of Base, Sugar, and Phosphate on canvas in zoomed out mode', async ({
    page,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/7401
     * Description: Verify appearance of Base, Sugar, and Phosphate on canvas in zoomed mode
     *
     * Case: 1. Load three structures on the canvas
     *       2. Zoom Out three times
     *       3. Select all structures on the canvas
     *       4. Set Nucleotide conponent --> Sugar options --> press Ok
     *       5. Take screenshot to validate Sugar type S-Group creation
     *
     *  Version 3.6
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/S-Groups/No Nucleotide Componets.ket',
    );
    await ZoomOutByKeyboard(page, { repeat: 3 });
    await selectAllStructuresOnCanvas(page);
    await LeftToolbar(page).sGroup();
    await SGroupPropertiesDialog(page).setOptions({
      Type: TypeOption.NucleotideComponent,
      Component: ComponentOption.Sugar,
    });
    await takeEditorScreenshot(page);
  });

  test('Verify that multiple components can be marked in one structure', async ({
    page,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/7401
     * Description: Verify that multiple components can be marked in one structure (e.g. base + sugar + phosphate)
     *              ( all three can coexist; no overwriting or UI collision )
     *
     * Case: 1. Put Benzene ring on the canvas
     *       2. Create Nucleotide conponent of every type for each single bons
     *       3. Take screenshot to validate creations
     *
     *  Version 3.6
     */
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);

    const bond1 = await getBondByIndex(page, { type: BondType.SINGLE }, 0);
    const bond2 = await getBondByIndex(page, { type: BondType.SINGLE }, 1);
    const bond3 = await getBondByIndex(page, { type: BondType.SINGLE }, 2);

    await LeftToolbar(page).sGroup();
    await page.mouse.click(bond1.x, bond1.y);
    await SGroupPropertiesDialog(page).setOptions({
      Type: TypeOption.NucleotideComponent,
      Component: ComponentOption.Sugar,
    });

    await page.mouse.click(bond2.x, bond2.y);
    await SGroupPropertiesDialog(page).setOptions({
      Type: TypeOption.NucleotideComponent,
      Component: ComponentOption.Base,
    });

    await page.mouse.click(bond3.x, bond3.y);
    await SGroupPropertiesDialog(page).setOptions({
      Type: TypeOption.NucleotideComponent,
      Component: ComponentOption.Phosphate,
    });

    await takeEditorScreenshot(page);
  });

  test('Verify aromatize/dearomatize indigo functions for nucleotide components', async ({
    page,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/7401
     * Description: Verify aromatize/dearomatize indigo functions for nucleotide components
     *
     * Case: 1. Load from KET three molecules inside Sugar, Base and Phosphate typed S-Groups (and superatoms for comparison)
     *       2. Press Aromatize button
     *       3. Take screenshot to validate aromatize works correct
     *       4. Press Dearomatize button
     *       5. Take screenshot to validate dearomatize works correct
     *
     *  Version 3.6
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/S-Groups/Nucleotide components and superatoms for Indigo tests.ket',
    );
    await IndigoFunctionsToolbar(page).aromatize();
    await takeEditorScreenshot(page);
    await IndigoFunctionsToolbar(page).dearomatize();
    await takeEditorScreenshot(page);
  });

  test('Verify Layout indigo function for nucleotide components', async ({
    page,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/7401
     * Description: Verify Layout indigo function for nucleotide components
     *
     * Case: 1. Load from KET three molecules inside Sugar, Base and Phosphate typed S-Groups (and superatoms for comparison)
     *       2. Press Layout button
     *       3. Take screenshot to validate Layout works correct
     *
     *  Version 3.6
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/S-Groups/Nucleotide components and superatoms for layout test.ket',
    );
    await IndigoFunctionsToolbar(page).layout();
    await takeEditorScreenshot(page);
  });

  // Commented out since Indigo generates labels in slightly different positions
  // test('Verify Clean Up indigo function for nucleotide components', async ({
  //   page,
  // }) => {
  //   /*
  //    * Test task: https://github.com/epam/ketcher/issues/7401
  //    * Description: Verify Clean Up indigo function for nucleotide components
  //    *
  //    * Case: 1. Load from KET three molecules inside Sugar, Base and Phosphate typed S-Groups (and superatoms for comparison)
  //    *       2. Press Clean Up button
  //    *       3. Take screenshot to validate Clean Up works correct
  //    *
  //    *  Version 3.6
  //    */
  //   await openFileAndAddToCanvasAsNewProject(
  //     page,
  //     'KET/S-Groups/Nucleotide components and superatoms for Clean Up test.ket',
  //   );
  //   await IndigoFunctionsToolbar(page).cleanUp();
  //   await takeEditorScreenshot(page);
  // });

  test('Verify Calculate CIP indigo function for nucleotide components', async ({
    page,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/7401
     * Description: Verify Calculate CIP indigo function for nucleotide components
     *
     * Case: 1. Load from KET three molecules inside Sugar, Base and Phosphate typed S-Groups (and superatoms for comparison)
     *       2. Press Calculate CIP button
     *       3. Take screenshot to validate Calculate CIP works correct
     *
     *  Version 3.6
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/S-Groups/Nucleotide components and superatoms for CIP test.ket',
    );
    await IndigoFunctionsToolbar(page).calculateCIP();
    await takeEditorScreenshot(page);
  });

  test('Verify Calculate Values indigo function for nucleotide components', async ({
    page,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/7401
     * Description: Verify Calculate Values indigo function for nucleotide components
     *
     * Case: 1. Load from KET three molecules inside Sugar, Base and Phosphate typed S-Groups (and superatoms for comparison)
     *       2. Press Calculate Values button to open Calculate Values dialog
     *       3. Validate values of all fields
     *
     *  Version 3.6
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/S-Groups/Nucleotide components and superatoms for Calculate Values.ket',
    );
    await IndigoFunctionsToolbar(page).calculatedValues();
    await expect(
      CalculatedValuesDialog(page).chemicalFormulaInput,
    ).toContainText('[C6H6]+[C18H14] > [C18H14]');
    await expect(CalculatedValuesDialog(page).molecularWeightInput).toHaveValue(
      '[78.112]+[230.304] > [230.304]',
    );
    await expect(CalculatedValuesDialog(page).exactMassInput).toHaveValue(
      '[78.047]+[230.110] > [230.110]',
    );
    await expect(
      CalculatedValuesDialog(page).elementalAnalysisInput,
    ).toHaveValue('[C 92.3 H 7.7]+[C 93.9 H 6.1] > [C 93.9 H 6.1]');

    await CalculatedValuesDialog(page).close();
  });

  test('Verify Add/Remove explicit hydrogens indigo function for nucleotide components', async ({
    page,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/7401
     * Description: Verify Add/Remove explicit hydrogens function for nucleotide components
     *
     * Case: 1. Load from KET three molecules inside Sugar, Base and Phosphate typed S-Groups (and superatoms for comparison)
     *       2. Press Add/Remove explicit hydrogens button to expand hydrogens
     *       3. Take screenshot to validate Add/Remove explicit hydrogens works correct
     *       4. Press Add/Remove explicit hydrogens button to collapse hydrogens
     *       5. Take screenshot to validate Add/Remove explicit hydrogens works correct
     *
     *  Version 3.6
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/S-Groups/Nucleotide components and superatoms for Indigo tests.ket',
    );
    await IndigoFunctionsToolbar(page).addRemoveExplicitHydrogens();
    await takeEditorScreenshot(page);
    await IndigoFunctionsToolbar(page).addRemoveExplicitHydrogens();
    await takeEditorScreenshot(page);
  });

  test('A superatom named `Test` is created', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-1537
      Description: A superatom named `Test` is created. Atom enclosed in brackets.
    */
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);

    await LeftToolbar(page).sGroup();
    const { x, y } = await getCoordinatesTopAtomOfBenzeneRing(page);
    await clickOnCanvas(page, x, y);
    await SGroupPropertiesDialog(page).setOptions({
      Type: TypeOption.Superatom,
      Name: 'Test',
    });
    await takeEditorScreenshot(page);
  });

  test('An atom is created with the name `Test` and the value 8', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-1542
      Description: An atom is created with the name `Test` and the value 8
    */
    const testName = 'Test';
    const testValue = '8';
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);

    await LeftToolbar(page).sGroup();
    const { x, y } = await getCoordinatesTopAtomOfBenzeneRing(page);
    await clickOnCanvas(page, x, y);
    await SGroupPropertiesDialog(page).setFieldNameValue(testName);
    await SGroupPropertiesDialog(page).setFieldValueValue(testValue);
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
    await SGroupPropertiesDialog(page).apply();
    await takeEditorScreenshot(page);
  });

  test('A query component  is created', async ({ page }) => {
    await selectRingButton(page, RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);

    await LeftToolbar(page).sGroup();
    const { x, y } = await getCoordinatesTopAtomOfBenzeneRing(page);
    await clickOnCanvas(page, x, y);
    await SGroupPropertiesDialog(page).selectType(TypeOption.QueryComponent);
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
    await SGroupPropertiesDialog(page).apply();
    await takeEditorScreenshot(page);
  });
});
