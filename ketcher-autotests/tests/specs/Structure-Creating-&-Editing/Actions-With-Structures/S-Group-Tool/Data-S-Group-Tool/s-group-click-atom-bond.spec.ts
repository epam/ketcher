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
  selectFlexLayoutModeTool,
} from '@utils';
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
  });

  test('Checking Sugar, Base and Phosphate type S-Group export to KET', async ({
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
      'KET/S-Groups/LayoutCheck-expacted.ket',
      FileType.KET,
    );
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

    await takeEditorScreenshot(page);
    await SGroupPropertiesDialog(page).apply();
    await takeEditorScreenshot(page);
  });
});
