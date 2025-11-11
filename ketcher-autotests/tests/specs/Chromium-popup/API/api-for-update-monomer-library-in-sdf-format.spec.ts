/* eslint-disable camelcase */
/* eslint-disable max-len */
import { test } from '@fixtures';
import { Page } from '@playwright/test';
import { RNASection } from '@tests/pages/constants/library/Constants';
import { Library } from '@tests/pages/macromolecules/Library';
import {
  readFileContent,
  replaceMonomersLibrary,
  takeMonomerLibraryScreenshot,
  updateMonomersLibrary,
} from '@utils';

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
    const SDF_Ala88 = await readFileContent('SDF/SDF_Ala88.sdf');
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
    const SDF_Rib88 = await readFileContent('SDF/SDF_Rib88.sdf');
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
    const SDF_Gua88 = await readFileContent('SDF/SDF_Gua88.sdf');
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
    const SDF_P88 = await readFileContent('SDF/SDF_P88.sdf');
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
    const SDF_rA88 = await readFileContent('SDF/SDF_rA88.sdf');
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
    const SDF_Bz88 = await readFileContent('SDF/SDF_Bz88.sdf');
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
    const SDF_E88 = await readFileContent('SDF/SDF_E88.sdf');
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
    const SDF_X88 = await readFileContent('SDF/SDF_X88.sdf');
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
    const SDF_Xalt88 = await readFileContent('SDF/SDF_Xalt88.sdf');
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
    const SDF_C88 = await readFileContent('SDF/SDF_C88.sdf');
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
    const SDF_UNS88 = await readFileContent('SDF/SDF_UNS88.sdf');
    await updateMonomersLibrary(page, SDF_UNS88, { format: 'sdf' });
    await Library(page).switchToRNATab();
    await Library(page).openRNASection(RNASection.Nucleotides);
    await Library(page).setSearchValue('UNS88');
    await takeMonomerLibraryScreenshot(page);
  });

  test('Case 12: Verify adding new Sugar with natural analog to the Ketcher library with ketcher.updateMonomersLibrary method', async () => {
    /*
     * Version 3.9
     * Test case: https://github.com/epam/ketcher/issues/7674
     * Description: Adding new Sugar with natural analog to the Ketcher library with ketcher.updateMonomersLibrary method
     * Scenario:
     * 1. Go to Macromolecules mode - Flex mode
     * 2. Add command by ketcher.updateMonomersLibrary method
     * 3. Check monomer is added to the library
     */
    const SDF_S88 = await readFileContent('SDF/SDF_S88.sdf');
    await updateMonomersLibrary(page, SDF_S88, { format: 'sdf' });
    await Library(page).switchToRNATab();
    await Library(page).openRNASection(RNASection.Sugars);
    await Library(page).setSearchValue('S88');
    await takeMonomerLibraryScreenshot(page);
  });

  test('Case 13: Verify adding new Phosphate with natural analog to the Ketcher library with ketcher.updateMonomersLibrary method', async () => {
    /*
     * Version 3.9
     * Test case: https://github.com/epam/ketcher/issues/7674
     * Description: Adding new Phosphate with natural analog to the Ketcher library with ketcher.updateMonomersLibrary method
     * Scenario:
     * 1. Go to Macromolecules mode - Flex mode
     * 2. Add command by ketcher.updateMonomersLibrary method
     * 3. Check monomer is added to the library
     */
    const SDF_P77 = await readFileContent('SDF/SDF_P77.sdf');
    await updateMonomersLibrary(page, SDF_P77, { format: 'sdf' });
    await Library(page).switchToRNATab();
    await Library(page).openRNASection(RNASection.Phosphates);
    await Library(page).setSearchValue('P77');
    await takeMonomerLibraryScreenshot(page);
  });

  test('Case 14: Replace whole library with library of one monomer inside with ketcher.replaceMonomersLibrary method', async () => {
    /*
     * Version 3.9
     * Test case: https://github.com/epam/ketcher/issues/7674
     * Description: Replace whole library with library of one monomer inside with ketcher.replaceMonomersLibrary method
     * Scenario:
     * 1. Go to Macromolecules mode - Flex mode
     * 2. Add command by ketcher.replaceMonomersLibrary method
     * 3. Check monomer is added to the library
     */
    const SDF_P77 = await readFileContent('SDF/SDF_P77.sdf');
    await replaceMonomersLibrary(page, SDF_P77, { format: 'sdf' });
    await Library(page).switchToRNATab();
    await Library(page).openRNASection(RNASection.Phosphates);
    await takeMonomerLibraryScreenshot(page);
  });

  test('Case 15: Replace whole library with library of no monomers inside with ketcher.replaceMonomersLibrary method', async () => {
    /*
     * Version 3.9
     * Test case: https://github.com/epam/ketcher/issues/7674
     * Description: Replace whole library with library of no monomers inside with ketcher.replaceMonomersLibrary method
     * Scenario:
     * 1. Go to Macromolecules mode - Flex mode
     * 2. Add command by ketcher.replaceMonomersLibrary method
     * 3. Check monomer is added to the library
     */
    const SDF_EMPTY = await readFileContent('SDF/SDF_EMPTY.sdf');
    await replaceMonomersLibrary(page, SDF_EMPTY, { format: 'sdf' });
    await takeMonomerLibraryScreenshot(page);
    await Library(page).switchToPeptidesTab();
    await takeMonomerLibraryScreenshot(page);
    await Library(page).switchToRNATab();
    await takeMonomerLibraryScreenshot(page);
    await Library(page).openRNASection(RNASection.Sugars);
    await takeMonomerLibraryScreenshot(page);
    await Library(page).openRNASection(RNASection.Bases);
    await takeMonomerLibraryScreenshot(page);
    await Library(page).openRNASection(RNASection.Phosphates);
    await takeMonomerLibraryScreenshot(page);
    await Library(page).openRNASection(RNASection.Nucleotides);
    await takeMonomerLibraryScreenshot(page);
    await Library(page).switchToCHEMTab();
    await takeMonomerLibraryScreenshot(page);
  });
});

test.describe('API for replace Library', () => {
  test.beforeAll(async ({ initFlexCanvas }) => {
    page = await initFlexCanvas();
  });
  test.afterEach(async ({ initFlexCanvas }) => {
    page = await initFlexCanvas();
  });
  test.afterAll(async ({ closePage }) => {
    await closePage();
  });

  test('Case 1: Replace whole library with library of 3000 Presets monomers inside', async () => {
    /*
     * Version 3.9
     * Test case: https://github.com/epam/ketcher/issues/7674
     * Description: Replace whole library with library of 3000 Presets monomers inside
     * Scenario:
     * 1. Go to Macromolecules mode - Flex mode
     * 2. Add command by ketcher.replaceMonomersLibrary method
     * 3. Check monomer is added to the library
     * We have a bug https://github.com/epam/Indigo/issues/3277
     * After fixing we need update snapshots if necessary
     */
    test.slow();
    const Presets = await readFileContent('SDF/3000 presets.sdf');
    await replaceMonomersLibrary(page, Presets, { format: 'sdf' });
    await Library(page).switchToRNATab();
    await takeMonomerLibraryScreenshot(page);
  });

  test('Case 2: Replace whole library with library of 3000 Peptides monomers inside', async () => {
    /*
     * Version 3.9
     * Test case: https://github.com/epam/ketcher/issues/7674
     * Description: Replace whole library with library of 3000 Peptides monomers inside
     * Scenario:
     * 1. Go to Macromolecules mode - Flex mode
     * 2. Add command by ketcher.replaceMonomersLibrary method
     * 3. Check monomer is added to the library
     */
    const Peptides = await readFileContent('SDF/3000 Peptides.sdf');
    await replaceMonomersLibrary(page, Peptides, { format: 'sdf' });
    await Library(page).switchToPeptidesTab();
    await takeMonomerLibraryScreenshot(page);
  });

  test('Case 3: Replace whole library with library of 3000 Sugars monomers inside', async () => {
    /*
     * Version 3.9
     * Test case: https://github.com/epam/ketcher/issues/7674
     * Description: Replace whole library with library of 3000 Sugars monomers inside
     * Scenario:
     * 1. Go to Macromolecules mode - Flex mode
     * 2. Add command by ketcher.replaceMonomersLibrary method
     * 3. Check monomer is added to the library
     */
    const Sugars = await readFileContent('SDF/3000 Sugars.sdf');
    await replaceMonomersLibrary(page, Sugars, { format: 'sdf' });
    await Library(page).switchToRNATab();
    await Library(page).openRNASection(RNASection.Sugars);
    await takeMonomerLibraryScreenshot(page);
  });

  test('Case 4: Replace whole library with library of 3000 Bases monomers inside', async () => {
    /*
     * Version 3.9
     * Test case: https://github.com/epam/ketcher/issues/7674
     * Description: Replace whole library with library of 3000 Bases monomers inside
     * Scenario:
     * 1. Go to Macromolecules mode - Flex mode
     * 2. Add command by ketcher.replaceMonomersLibrary method
     * 3. Check monomer is added to the library
     */
    const Bases = await readFileContent('SDF/3000 Bases.sdf');
    await replaceMonomersLibrary(page, Bases, { format: 'sdf' });
    await Library(page).switchToRNATab();
    await Library(page).openRNASection(RNASection.Bases);
    await takeMonomerLibraryScreenshot(page);
  });

  test('Case 5: Replace whole library with library of 3000 Phosphates monomers inside', async () => {
    /*
     * Version 3.9
     * Test case: https://github.com/epam/ketcher/issues/7674
     * Description: Replace whole library with library of 3000 Phosphates monomers inside
     * Scenario:
     * 1. Go to Macromolecules mode - Flex mode
     * 2. Add command by ketcher.replaceMonomersLibrary method
     * 3. Check monomer is added to the library
     */
    const Phosphates = await readFileContent('SDF/3000 Phosphates.sdf');
    await replaceMonomersLibrary(page, Phosphates, { format: 'sdf' });
    await Library(page).switchToRNATab();
    await Library(page).openRNASection(RNASection.Phosphates);
    await takeMonomerLibraryScreenshot(page);
  });

  test('Case 6: Replace whole library with library of 3000 Nucleotides monomers inside', async () => {
    /*
     * Version 3.9
     * Test case: https://github.com/epam/ketcher/issues/7674
     * Description: Replace whole library with library of 3000 Nucleotides monomers inside
     * Scenario:
     * 1. Go to Macromolecules mode - Flex mode
     * 2. Add command by ketcher.replaceMonomersLibrary method
     * 3. Check monomer is added to the library
     */
    const Nucleotides = await readFileContent('SDF/3000 Nucleotides.sdf');
    await replaceMonomersLibrary(page, Nucleotides, { format: 'sdf' });
    await Library(page).switchToRNATab();
    await Library(page).openRNASection(RNASection.Nucleotides);
    await takeMonomerLibraryScreenshot(page);
  });

  test('Case 7: Replace whole library with library of 3000 CHEMs monomers inside', async () => {
    /*
     * Version 3.9
     * Test case: https://github.com/epam/ketcher/issues/7674
     * Description: Replace whole library with library of 3000 CHEMs monomers inside
     * Scenario:
     * 1. Go to Macromolecules mode - Flex mode
     * 2. Add command by ketcher.replaceMonomersLibrary method
     * 3. Check monomer is added to the library
     */
    const CHEMs = await readFileContent('SDF/3000 CHEMs.sdf');
    await replaceMonomersLibrary(page, CHEMs, { format: 'sdf' });
    await Library(page).switchToCHEMTab();
    await takeMonomerLibraryScreenshot(page);
  });
});
