/* eslint-disable no-inline-comments */
import { test, expect } from '@playwright/test';
import {
  waitForPageInit,
  openFileAndAddToCanvasAsNewProject,
  moveMouseAway,
  takeEditorScreenshot,
  saveToFile,
  selectTopPanelButton,
  TopPanelButton,
  clickOnFileFormatDropdown,
  pressButton,
  receiveFileComparisonData,
} from '@utils';

test.describe('1. User can restore previously saved selection for:', () => {
  /*
    Test case: https://github.com/epam/ketcher/issues/4053 - Case 1
    Description: User can restore previously saved selection for:
    1. Text labels
    2. Simple atoms
    3. Complex molecules
    4. Ellipses
    5. Functional groups
    6. Salts and Solvents
    6. Partial selection of bonds (all types) in molecule
    7. Partial selection of atoms (all types) in molecule

    Test case:
    1. Clear canvas
    2. Open from file using "Open as New Project" way: SelectionTest.ket
    3. Validate canvas
    IMPORTANT: Test results are not correct because of https://github.com/epam/ketcher/issues/4043 issue.
    IMPORTANT: Test results are not correct because of https://github.com/epam/ketcher/issues/4044 issue.
    Screenshots have to be corrected after fix.
    */

  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  const fileNames = ['SelectionTest.ket'];

  for (const fileName of fileNames) {
    test(`${fileName}`, async ({ page }) => {
      await openFileAndAddToCanvasAsNewProject(
        `KET/Entity-Selection-Flag-in-KET-format/${fileName}`,
        page,
      );
      await moveMouseAway(page);
      await takeEditorScreenshot(page);
    });
  }
});

test.describe('2. User can restore previously saved selection for:', () => {
  /*
    Test case: https://github.com/epam/ketcher/issues/4053 - Case 2
    Description: User can restore previously saved selection for:
    1. All types of arrows
    2. Plus symbol

    Test case:
    1. Clear canvas
    2. Open from file using "Open as New Project" way: SelectionTestForArrowsAndPlus.ket
    3. Validate canvas
    IMPORTANT: Test results are not correct because of https://github.com/epam/ketcher/issues/4043 issue.
    IMPORTANT: Test results are not correct because of https://github.com/epam/ketcher/issues/4044 issue.
    Screenshots have to be corrected after fix.
    */

  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  const fileNames = ['SelectionTestForArrowsAndPlus.ket'];

  for (const fileName of fileNames) {
    test(`${fileName}`, async ({ page }) => {
      await openFileAndAddToCanvasAsNewProject(
        `KET/Entity-Selection-Flag-in-KET-format/${fileName}`,
        page,
      );
      await moveMouseAway(page);
      await takeEditorScreenshot(page);
    });
  }
});

test.describe('3. User can restore previously saved selection for:', () => {
  /*
    Test case: https://github.com/epam/ketcher/issues/4053 - Case 3
    Description: User can restore previously saved selection for simple reaction marked by mapping tools

    Test case:
    1. Clear canvas
    2. Open from file using "Open as New Project" way: SelectionTestForMappingTool.ket
    3. Validate canvas
    IMPORTANT: Test results are not correct because of https://github.com/epam/ketcher/issues/4043 issue.
    IMPORTANT: Test results are not correct because of https://github.com/epam/ketcher/issues/4044 issue.
    Screenshots have to be corrected after fix.
    */

  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  const fileNames = ['SelectionTestForMappingTool.ket'];

  for (const fileName of fileNames) {
    test(`${fileName}`, async ({ page }) => {
      await openFileAndAddToCanvasAsNewProject(
        `KET/Entity-Selection-Flag-in-KET-format/${fileName}`,
        page,
      );
      await moveMouseAway(page);
      await takeEditorScreenshot(page);
    });
  }
});

test.describe('4. User can save and than restore selection for:', () => {
  /*
    Test case: https://github.com/epam/ketcher/issues/4053 - Case 4
    Description: User can save and than restore selection for:
    1. Simple(ordinary) atoms
    2. Special atoms
    3. Custom query atoms
    4. Simple(ordinary) atoms wrapped into R-Groups and S-Groups
    5. Custom query atoms wrapped into R-Groups and S-Groups
    6. Simple(ordinary) atoms with aromatic atom presented on the canvas
    7. Simple(ordinary) atoms wrapped into R-Groups and S-Groups with aromatic atom presented on the canvas
    8. All types of ordinary bonds
    9. All types of custom bonds
    10. All types of ordinary bonds wrapped into R-Groups and S-Groups
    11. All types of custom bonds wrapped into R-Groups and S-Groups
    12. All types of ordinary bonds with aromatic atom presented on the canvas
    13. All types of ordinary bonds wrapped into R-Groups and S-Groups with aromatic atom presented on the canvas

    Test case:
    For each file from: BondsAndAtoms.zip AS %KetFile%
    DO:
    Open from file %KetFile% using "Open as New Project" way.
    Press Ctrl+A keys
    Save canvas to ket file (name it 'Tmp-file-Remove-Me-After.ket')
    Open from file Tmp-file-Remove-Me-After.ket using "Open as New Project" way
    Validate canvas    
    
    IMPORTANT: Test results are not correct because of https://github.com/epam/ketcher/issues/4043 issue.
    IMPORTANT: Test results are not correct because of https://github.com/epam/ketcher/issues/4044 issue.
    Screenshots have to be corrected after fix.
    */

  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  const fileNames = [
    'All Custom Query Bonds connected with R-group labels.ket',
    /*
        'All Custom Query Bonds in one R-group.ket',
        'All Custom Query Bonds in R-group each.ket',
        'All Custom Query Bonds with Connection points.ket',
        'All Custom Query Bonds with S-Group - Data - Absolute.ket',
        'All Custom Query Bonds with S-Group - Data - Attached.ket',
        'All Custom Query Bonds with S-Group - Data - Relative.ket',
        'All Custom Query Bonds with S-Group - Multiple group.ket',
        'All Custom Query Bonds with S-Group - Query component.ket',
        'All Custom Query Bonds with S-Group - SRU Polymer - Either Unknown.ket',
        'All Custom Query Bonds with S-Group - SRU Polymer - Head-to-head.ket',
        'All Custom Query Bonds with S-Group - SRU Polymer - Head-to-tail.ket',
        'All Custom Query Bonds with S-Group - Superatom.ket',
        'All Custom Query Bonds.ket',
        'All Special Atoms.ket',
        'All types of bond - Chain topology - Center reaction center.ket',
        'All types of bond - Chain topology - Made broken and changes reaction center.ket',
        'All types of bond - Chain topology - Made broken reaction center.ket',
        'All types of bond - Chain topology - No change reaction center.ket',
        'All types of bond - Chain topology - Not center reaction center.ket',
        'All types of bond - Chain topology - Order changes reaction center.ket',
        'All types of bond - Chain topology.ket',
        'All types of bond - Either topology - Center reaction center.ket',
        'All types of bond - Either topology - Mad-broken reaction center.ket',
        'All types of bond - Either topology - Made-Broken and changes reaction center.ket',
        'All types of bond - Either topology - No change reaction center.ket',
        'All types of bond - Either topology - Not center reaction center.ket',
        'All types of bond - Either topology - Order changes reaction center.ket',
        'All types of bond - Either topology - Unmarked - R-Group fragmens - Attachment points.ket',
        'All types of bond - Either topology - Unmarked - R-Group fragmens.ket',
        'All types of bond - Either topology - Unmarked - R-Group labels.ket',
        'All types of bond - Either topology - Unmarked - S-Group - Data - Bond - Absolute.ket',
        'All types of bond - Either topology - Unmarked - S-Group - Data - Bond - Attached.ket',
        'All types of bond - Either topology - Unmarked - S-Group - Data - Bond - Relative.ket',
        'All types of bond - Either topology - Unmarked - S-Group - Multipal group.ket',
        'All types of bond - Either topology - Unmarked - S-Group - Query component.ket',
        'All types of bond - Either topology - Unmarked - S-Group - SRU polymer - Either unknown.ket',
        'All types of bond - Either topology - Unmarked - S-Group - SRU polymer - Head-to-head.ket',
        'All types of bond - Either topology - Unmarked - S-Group - SRU polymer - Head-to-tail.ket',
        'All types of bond - Either topology - Unmarked - S-Group - Superatom.ket',
        'All types of bond - Ring topology - Center reaction center.ket',
        'All types of bond - Ring topology - Made-Broken and changes reaction center.ket',
        'All types of bond - Ring topology - Made-broken reaction center.ket',
        'All types of bond - Ring topology - No change reaction center.ket',
        'All types of bond - Ring topology - Not center reaction center.ket',
        'All types of bond - Ring topology - Order changes reaction center.ket',
        'All types of bond - Ring topology - Unmarked - R-Group fragmens - Attachment points.ket',
        'All types of bond - Ring topology - Unmarked - R-Group fragmens.ket',
        'All types of bond - Ring topology - Unmarked - R-Group labels.ket',
        'All types of bond - Ring topology - Unmarked - S-Group - Data - Bond - Absolute.ket',
        'All types of bond - Ring topology - Unmarked - S-Group - Data - Bond - Attached.ket',
        'All types of bond - Ring topology - Unmarked - S-Group - Data - Bond - Relative.ket',
        'All types of bond - Ring topology - Unmarked - S-Group - Multipal group.ket',
        'All types of bond - Ring topology - Unmarked - S-Group - Query component.ket',
        'All types of bond - Ring topology - Unmarked - S-Group - SRU polymer - Either unknown.ket',
        'All types of bond - Ring topology - Unmarked - S-Group - SRU polymer - Head-to-head.ket',
        'All types of bond - Ring topology - Unmarked - S-Group - SRU polymer - Head-to-tail.ket',
        'All types of bond - Ring topology - Unmarked - S-Group - Superatom.ket',
        'All types of bond - Ring topology.ket',
        'All types of bond with Query feature atom on the canvas - Chain topology - Center reaction center.ket',
        'All types of bond with Query feature atom on the canvas - Chain topology - Made broken and changes reaction center.ket',
        'All types of bond with Query feature atom on the canvas - Chain topology - Made broken reaction center.ket',
        'All types of bond with Query feature atom on the canvas - Chain topology - No change reaction center.ket',
        'All types of bond with Query feature atom on the canvas - Chain topology - Not center reaction center.ket',
        'All types of bond with Query feature atom on the canvas - Chain topology - Order changes reaction center.ket',
        'All types of bond with Query feature atom on the canvas - Chain topology.ket',
        'All types of bond with Query feature atom on the canvas - Either topology - Center reaction center.ket',
        'All types of bond with Query feature atom on the canvas - Either topology - Made-Broken and changes reaction center.ket',
        'All types of bond with Query feature atom on the canvas - Either topology - Made-broken reaction center.ket',
        'All types of bond with Query feature atom on the canvas - Either topology - No change reaction center.ket',
        'All types of bond with Query feature atom on the canvas - Either topology - Not center reaction center.ket',
        'All types of bond with Query feature atom on the canvas - Either topology - Order changes reaction center.ket',
        'All types of bond with Query feature atom on the canvas - Either topology - Unmarked - R-Group fragmens - At.ket',
        'All types of bond with Query feature atom on the canvas - Either topology - Unmarked - R-Group fragmens.ket',
        'All types of bond with Query feature atom on the canvas - Either topology - Unmarked - R-Group labels.ket',
        'All types of bond with Query feature atom on the canvas - Either topology - Unmarked - S-Group - Data - Bond - Absolute.ket',
        'All types of bond with Query feature atom on the canvas - Either topology - Unmarked - S-Group - Data - Bond - Attached.ket',
        'All types of bond with Query feature atom on the canvas - Either topology - Unmarked - S-Group - Data - Bond - Relative.ket',
        'All types of bond with Query feature atom on the canvas - Either topology - Unmarked - S-Group - Multipal group.ket',
        'All types of bond with Query feature atom on the canvas - Either topology - Unmarked - S-Group - Query component.ket',
        'All types of bond with Query feature atom on the canvas - Either topology - Unmarked - S-Group - SRU polymer - Either unknown.ket',
        'All types of bond with Query feature atom on the canvas - Either topology - Unmarked - S-Group - SRU polymer - Head-to-head.ket',
        'All types of bond with Query feature atom on the canvas - Either topology - Unmarked - S-Group - SRU polymer - Head-to-tail.ket',
        'All types of bond with Query feature atom on the canvas - Either topology - Unmarked - S-Group - Superatom.ket',
        'All types of bond with Query feature atom on the canvas - Ring topology - Center reaction center.ket',
        'All types of bond with Query feature atom on the canvas - Ring topology - Made-Broken and changes reaction center.ket',
        'All types of bond with Query feature atom on the canvas - Ring topology - Made-broken reaction center.ket',
        'All types of bond with Query feature atom on the canvas - Ring topology - No change reaction center.ket',
        'All types of bond with Query feature atom on the canvas - Ring topology - Not center reaction center.ket',
        'All types of bond with Query feature atom on the canvas - Ring topology - Order changes reaction center.ket',
        'All types of bond with Query feature atom on the canvas - Ring topology - Unmarked - R-Group fragmens - Attachment points.ket',
        'All types of bond with Query feature atom on the canvas - Ring topology - Unmarked - R-Group fragmens.ket',
        'All types of bond with Query feature atom on the canvas - Ring topology - Unmarked - R-Group labels.ket',
        'All types of bond with Query feature atom on the canvas - Ring topology - Unmarked - S-Group - Data - Bond - Absolute.ket',
        'All types of bond with Query feature atom on the canvas - Ring topology - Unmarked - S-Group - Data - Bond - Attached.ket',
        'All types of bond with Query feature atom on the canvas - Ring topology - Unmarked - S-Group - Data - Bond - Relative.ket',
        'All types of bond with Query feature atom on the canvas - Ring topology - Unmarked - S-Group - Multipal group.ket',
        'All types of bond with Query feature atom on the canvas - Ring topology - Unmarked - S-Group - Query component.ket',
        'All types of bond with Query feature atom on the canvas - Ring topology - Unmarked - S-Group - SRU polymer - Either unknown.ket',
        'All types of bond with Query feature atom on the canvas - Ring topology - Unmarked - S-Group - SRU polymer - Head-to-head.ket',
        'All types of bond with Query feature atom on the canvas - Ring topology - Unmarked - S-Group - SRU polymer - Head-to-tail.ket',
        'All types of bond with Query feature atom on the canvas - Ring topology - Unmarked - S-Group - Superatom.ket',
        'All types of bond with Query feature atom on the canvas - Ring topology.ket',
        'All types of bond with Query feature atom on the canvas.ket',
        'All types of bond.ket',
        'Any Atom + charges + Simple molecules + charges  with Custom query feature atom on the canvas.ket',
        'Any Atom + charges + Simple molecules + charges.ket',
        'Any Atom + Exact change Simple molecules + Exact change  with Custom query feature atom on the canvas.ket',
        'Any Atom + Exact change Simple molecules + Exact change.ket',
        'Any Atom + Inversions Simple molecules + Inversions  with Custom query feature atom on the canvas.ket',
        'Any Atom + Inversions Simple molecules + Inversions.ket',
        'Any Atom + Radical  with Custom query feature atom on the canvas.ket',
        'Any Atom + Radical.ket',
        'Any Atom + Valences  with Custom query feature atom on the canvas.ket',
        'Any Atom + Valences.ket',
        'Aromaticity - aromatic Aromaticity - aliphatic.ket',
        'Chirality - Anticlockwise Chirality - Clockwise.ket',
        'Connectivity.ket',
        'Custom Querie.ket',
        'H count.ket',
        'Implicit H count.ket',
        'Molecules + Alias  with Custom query feature atom on the canvas.ket',
        'Molecules + Alias.ket',
        'Ordinary Atoms - All Groups - with Custom query feature atom on the canvas.ket',
        'Ordinary Atoms - All Groups.ket',
        'Periodic Table  with Custom query feature atom on the canvas.ket',
        'PeriodicTable.ket',
        'Ring bond count.ket',
        'Ring membership.ket',
        'Ring size.ket',
        'Simple Molecules  with Custom query feature atom on the canvas.ket',
        'Simple molecules + Radical  with Custom query feature atom on the canvas.ket',
        'Simple molecules + Radical.ket',
        'Simple molecules + Valences  with Custom query feature atom on the canvas.ket',
        'Simple molecules + Valences.ket',
        'Simple Molecules.ket',
        'Special Atoms  with Custom query feature atom on the canvas.ket',
        'Substitution count.ket',
        'Unsaturated.ket',
        */
  ];

  for (const fileName of fileNames) {
    test(`${fileName}`, async ({ page }) => {
      await openFileAndAddToCanvasAsNewProject(
        `KET/Entity-Selection-Flag-in-KET-format/BondsAndAtoms/${fileName}`,
        page,
      );
      await moveMouseAway(page);
      await page.keyboard.press('Control+a');
      await takeEditorScreenshot(page);
      // replace this block of code with ketFielExpected = await getKet(page);
      // once https://github.com/epam/ketcher/issues/4238 will be fixed
      await selectTopPanelButton(TopPanelButton.Save, page);
      await clickOnFileFormatDropdown(page);
      await page.getByTestId('Ket Format-option').click();
      const ketFileExpected = page
        .getByTestId('ket-preview-area-text')
        .inputValue();
      // End of block

      // Save it to test-data if no file in where
      await saveToFile(
        `KET/Entity-Selection-Flag-in-KET-format/BondsAndAtoms/Results/Selection-Result-${fileName}`,
        await ketFileExpected,
      );
      await pressButton(page, 'Cancel');

      const { fileExpected: fileKetExpected2, file: ketFile } =
        await receiveFileComparisonData({
          page,
          expectedFileName: `tests/test-data/KET/Entity-Selection-Flag-in-KET-format/BondsAndAtoms/Results/Selection-Result-${fileName}`,
        });
      expect(ketFile).toEqual(fileKetExpected2);

      await openFileAndAddToCanvasAsNewProject(
        `KET/Entity-Selection-Flag-in-KET-format/BondsAndAtoms/Results/Selection-Result-${fileName}`,
        page,
      );
      await moveMouseAway(page);
      await takeEditorScreenshot(page);
    });
  }
});
