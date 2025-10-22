/* eslint-disable camelcase */
/* eslint-disable max-len */
import { test } from '@fixtures';
import { Page } from '@playwright/test';
import { RNASection } from '@tests/pages/constants/library/Constants';
import { Library } from '@tests/pages/macromolecules/Library';
import { takeMonomerLibraryScreenshot, updateMonomersLibrary } from '@utils';
import {
  SDF_Ala88,
  SDF_Bz88,
  SDF_C88,
  SDF_E88,
  SDF_Gua88,
  SDF_P88,
  SDF_rA88,
  SDF_Rib88,
  SDF_UNS88,
  SDF_X88,
  SDF_Xalt88,
} from '@utils/files/testData';

let page: Page;

test.describe('API for update Library', () => {
  test.beforeAll(async ({ initFlexCanvas }) => {
    page = await initFlexCanvas();
  });
  test.afterEach(async ({ initFlexCanvas }) => {
    page = await initFlexCanvas();
  });
  test.afterAll(async ({ closePage }) => {
    await closePage();
  });

  test('Case 1: Verify adding new Natural analog peptide to the Ketcher library with ketcher.updateMonomersLibrary method', async () => {
    /*
     * Version 3.9
     * Test case: https://github.com/epam/ketcher/issues/7674
     * Description: Adding new Natural analog peptide to the Ketcher library with ketcher.updateMonomersLibrary method
     * Scenario:
     * 1. Go to Macromolecules mode - Flex mode
     * 2. Add command by ketcher.updateMonomersLibrary method
     * 3. Check monomer is added to the library
     */
    await updateMonomersLibrary(page, SDF_Ala88, { format: 'sdf' });
    await Library(page).switchToPeptidesTab();
    await Library(page).setSearchValue('Ala88');
    await takeMonomerLibraryScreenshot(page);
  });

  test('Case 2: Verify adding new Natural sugar to the Ketcher library with ketcher.updateMonomersLibrary method', async () => {
    /*
     * Version 3.9
     * Test case: https://github.com/epam/ketcher/issues/7674
     * Description: Adding new Natural sugar to the Ketcher library with ketcher.updateMonomersLibrary method
     * Scenario:
     * 1. Go to Macromolecules mode - Flex mode
     * 2. Add command by ketcher.updateMonomersLibrary method
     * 3. Check monomer is added to the library
     */
    await updateMonomersLibrary(page, SDF_Rib88, { format: 'sdf' });
    await Library(page).switchToRNATab();
    await Library(page).openRNASection(RNASection.Sugars);
    await Library(page).setSearchValue('Rib88');
    await takeMonomerLibraryScreenshot(page);
  });

  test('Case 3: Verify adding new Natural base to the Ketcher library with ketcher.updateMonomersLibrary method', async () => {
    /*
     * Version 3.9
     * Test case: https://github.com/epam/ketcher/issues/7674
     * Description: Adding new Natural base to the Ketcher library with ketcher.updateMonomersLibrary method
     * Scenario:
     * 1. Go to Macromolecules mode - Flex mode
     * 2. Add command by ketcher.updateMonomersLibrary method
     * 3. Check monomer is added to the library
     */
    await updateMonomersLibrary(page, SDF_Gua88, { format: 'sdf' });
    await Library(page).switchToRNATab();
    await Library(page).openRNASection(RNASection.Bases);
    await Library(page).setSearchValue('Gua88');
    await takeMonomerLibraryScreenshot(page);
  });

  test('Case 4: Verify adding new Natural phosphate to the Ketcher library with ketcher.updateMonomersLibrary method', async () => {
    /*
     * Version 3.9
     * Test case: https://github.com/epam/ketcher/issues/7674
     * Description: Adding new Natural phosphate to the Ketcher library with ketcher.updateMonomersLibrary method
     * Scenario:
     * 1. Go to Macromolecules mode - Flex mode
     * 2. Add command by ketcher.updateMonomersLibrary method
     * 3. Check monomer is added to the library
     */
    await updateMonomersLibrary(page, SDF_P88, { format: 'sdf' });
    await Library(page).switchToRNATab();
    await Library(page).openRNASection(RNASection.Phosphates);
    await Library(page).setSearchValue('P88');
    await takeMonomerLibraryScreenshot(page);
  });

  test('Case 5: Verify adding new Nucleotide to the Ketcher library with ketcher.updateMonomersLibrary method', async () => {
    /*
     * Version 3.9
     * Test case: https://github.com/epam/ketcher/issues/7674
     * Description: Adding new Nucleotide to the Ketcher library with ketcher.updateMonomersLibrary method
     * Scenario:
     * 1. Go to Macromolecules mode - Flex mode
     * 2. Add command by ketcher.updateMonomersLibrary method
     * 3. Check monomer is added to the library
     */
    await updateMonomersLibrary(page, SDF_rA88, { format: 'sdf' });
    await Library(page).switchToRNATab();
    await Library(page).openRNASection(RNASection.Nucleotides);
    await Library(page).setSearchValue('rA88');
    await takeMonomerLibraryScreenshot(page);
  });

  test('Case 6: Verify adding new CHEM to the Ketcher library with ketcher.updateMonomersLibrary method', async () => {
    /*
     * Version 3.9
     * Test case: https://github.com/epam/ketcher/issues/7674
     * Description: Adding new CHEM to the Ketcher library with ketcher.updateMonomersLibrary method
     * Scenario:
     * 1. Go to Macromolecules mode - Flex mode
     * 2. Add command by ketcher.updateMonomersLibrary method
     * 3. Check monomer is added to the library
     */
    await updateMonomersLibrary(page, SDF_Bz88, { format: 'sdf' });
    await Library(page).switchToCHEMTab();
    await Library(page).setSearchValue('Bz88');
    await takeMonomerLibraryScreenshot(page);
  });

  test('Case 7: Verify adding new Peptide with natural analog (E) to the Ketcher library with ketcher.updateMonomersLibrary method', async () => {
    /*
     * Version 3.9
     * Test case: https://github.com/epam/ketcher/issues/7674
     * Description: Adding new Peptide with natural analog (E) to the Ketcher library with ketcher.updateMonomersLibrary method
     * Scenario:
     * 1. Go to Macromolecules mode - Flex mode
     * 2. Add command by ketcher.updateMonomersLibrary method
     * 3. Check monomer is added to the library
     */
    await updateMonomersLibrary(page, SDF_E88, { format: 'sdf' });
    await Library(page).switchToPeptidesTab();
    await Library(page).setSearchValue('E88');
    await takeMonomerLibraryScreenshot(page);
  });

  test('Case 8: Verify adding new Peptide without natural analog to the Ketcher library with ketcher.updateMonomersLibrary method', async () => {
    /*
     * Version 3.9
     * Test case: https://github.com/epam/ketcher/issues/7674
     * Description: Adding new Peptide without natural analog to the Ketcher library with ketcher.updateMonomersLibrary method
     * Scenario:
     * 1. Go to Macromolecules mode - Flex mode
     * 2. Add command by ketcher.updateMonomersLibrary method
     * 3. Check monomer is added to the library
     */
    await updateMonomersLibrary(page, SDF_X88, { format: 'sdf' });
    await Library(page).switchToPeptidesTab();
    await Library(page).setSearchValue('X88');
    await takeMonomerLibraryScreenshot(page);
  });

  test('Case 9: Verify adding new Ambiguous alternative peptide to the Ketcher library with ketcher.updateMonomersLibrary method', async () => {
    /*
     * Version 3.9
     * Test case: https://github.com/epam/ketcher/issues/7674
     * Description: Adding new Ambiguous alternative peptide to the Ketcher library with ketcher.updateMonomersLibrary method
     * Scenario:
     * 1. Go to Macromolecules mode - Flex mode
     * 2. Add command by ketcher.updateMonomersLibrary method
     * 3. Check monomer is added to the library
     */
    await updateMonomersLibrary(page, SDF_Xalt88, { format: 'sdf' });
    await Library(page).switchToPeptidesTab();
    await Library(page).setSearchValue('Xalt88');
    await takeMonomerLibraryScreenshot(page);
  });

  test('Case 10: Verify adding new Base with natural analog (C) and 3 connection points to the Ketcher library with ketcher.updateMonomersLibrary method', async () => {
    /*
     * Version 3.9
     * Test case: https://github.com/epam/ketcher/issues/7674
     * Description: Adding new Base with natural analog (C) and 3 connection points to the Ketcher library with ketcher.updateMonomersLibrary method
     * Scenario:
     * 1. Go to Macromolecules mode - Flex mode
     * 2. Add command by ketcher.updateMonomersLibrary method
     * 3. Check monomer is added to the library
     */
    await updateMonomersLibrary(page, SDF_C88, { format: 'sdf' });
    await Library(page).switchToRNATab();
    await Library(page).openRNASection(RNASection.Bases);
    await Library(page).setSearchValue('C88');
    await takeMonomerLibraryScreenshot(page);
  });

  test('Case 11: Verify adding new Unsplit monomer without natural analog to the Ketcher library with ketcher.updateMonomersLibrary method', async () => {
    /*
     * Version 3.9
     * Test case: https://github.com/epam/ketcher/issues/7674
     * Description: Adding new Unsplit monomer without natural analog to the Ketcher library with ketcher.updateMonomersLibrary method
     * Scenario:
     * 1. Go to Macromolecules mode - Flex mode
     * 2. Add command by ketcher.updateMonomersLibrary method
     * 3. Check monomer is added to the library
     */
    await updateMonomersLibrary(page, SDF_UNS88, { format: 'sdf' });
    await Library(page).switchToRNATab();
    await Library(page).openRNASection(RNASection.Nucleotides);
    await Library(page).setSearchValue('UNS88');
    await takeMonomerLibraryScreenshot(page);
  });
});
