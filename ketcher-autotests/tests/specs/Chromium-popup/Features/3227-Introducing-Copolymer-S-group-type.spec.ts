/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-magic-numbers */
import { Page, test } from '@fixtures';
import {
  openFileAndAddToCanvasAsNewProject,
  takeEditorScreenshot,
} from '@utils';
import {
  FileType,
  verifyFileExport,
} from '@utils/files/receiveFileComparisonData';
import { MolFileFormat } from '@utils/formats';

let page: Page;

test.describe('Copolymer S-Group Type: ', () => {
  test.beforeAll(async ({ initMoleculesCanvas }) => {
    page = await initMoleculesCanvas();
  });

  test.afterEach(async ({ MoleculesCanvas: _ }) => {});

  test.afterAll(async ({ closePage }) => {
    await closePage();
  });

  test('Case 1 - Import MOL file and verify copolymer S-group type identification (COP)', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10004
     * Description: Check that on import from MOL file, Indigo should identify the copolymer s-group type (COP)
     * Scenario:
     * 1. Open MOL file containing copolymer S-group structure with type COP
     * 2. Verify that structure is correctly imported and displayed
     * 3. Check that copolymer S-group type is identified in KET format
     *
     * Version 3.15.0
     */

    // Import MOL file with copolymer S-group COP type
    await openFileAndAddToCanvasAsNewProject(
      page,
      'Molfiles-V2000/Chromium-popup/3227-Introducing-Copolymer-S-group-type/copolymer-random-ht.mol',
    );

    // Take screenshot to verify visual representation
    await takeEditorScreenshot(page);

    // Get KET format and verify copolymer S-group data is preserved
    await verifyFileExport(
      page,
      'KET/Chromium-popup/3227-Introducing-Copolymer-S-group-type/copolymer-random-ht-expected.ket',
      FileType.KET,
    );
  });

  test('Case 2 - Import MOL file and verify copolymer S-group subtype identification (RAN, ALT, BLO)', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10004
     * Description: Check that on import from MOL file, Indigo should identify the copolymer s-group subtype (RAN - random, ALT - alternating or BLO - block)
     * Scenario:
     * 1. Test import of MOL files with different copolymer subtypes (RAN, ALT, BLO)
     * 2. Verify that subtypes are correctly identified in KET format
     * 3. Verify all copolymer properties are preserved in KET format
     *
     * Version 3.15.0
     */

    const subtypes = [
      {
        file: 'copolymer-random-ht.mol',
        subtype: 'RAN',
        description: 'Random copolymer',
        expectedFile: 'copolymer-random-ht-expected.ket',
      },
      {
        file: 'copolymer-alternating-hh.mol',
        subtype: 'ALT',
        description: 'Alternating copolymer',
        expectedFile: 'copolymer-alternating-hh-expected.ket',
      },
      {
        file: 'copolymer-block-eu.mol',
        subtype: 'BLO',
        description: 'Block copolymer',
        expectedFile: 'copolymer-block-eu-expected.ket',
      },
    ];

    for (const { file, expectedFile } of subtypes) {
      // Import MOL file with specific subtype
      await openFileAndAddToCanvasAsNewProject(
        page,
        `Molfiles-V2000/Chromium-popup/3227-Introducing-Copolymer-S-group-type/${file}`,
      );

      // Take screenshot to verify visual representation
      await takeEditorScreenshot(page);

      // Get KET and verify subtype
      await verifyFileExport(
        page,
        `KET/Chromium-popup/3227-Introducing-Copolymer-S-group-type/${expectedFile}`,
        FileType.KET,
      );
    }
  });

  test('Case 3 - Import MOL file and verify copolymer S-group connections (HT, HH, EU)', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10004
     * Description: Check that on import from MOL file, Indigo should identify copolymer s-group connections (HT: Head-to-Tail, HH: Head-to-Head and EU: Either/Unknown)
     * Scenario:
     * 1. Test import of MOL files with different connection types (HT, HH, EU)
     * 2. Verify that connection types are correctly identified
     * 3. Verify all copolymer properties are preserved in KET format
     *
     * Version 3.15.0
     */

    const subtypes = [
      {
        file: 'copolymer-block-ht.mol',
        repeatPattern: 'HT',
        description: 'Block copolymer',
        expectedFile: 'copolymer-block-ht-expected.ket',
      },
      {
        file: 'copolymer-random-hh.mol',
        repeatPattern: 'HH',
        description: 'Random copolymer',
        expectedFile: 'copolymer-random-hh-expected.ket',
      },
      {
        file: 'copolymer-alternating-eu.mol',
        repeatPattern: 'EU',
        description: 'Alternating copolymer',
        expectedFile: 'copolymer-alternating-eu-expected.ket',
      },
    ];

    for (const { file, expectedFile } of subtypes) {
      // Import MOL file with specific subtype
      await openFileAndAddToCanvasAsNewProject(
        page,
        `Molfiles-V2000/Chromium-popup/3227-Introducing-Copolymer-S-group-type/${file}`,
      );

      // Take screenshot to verify visual representation
      await takeEditorScreenshot(page);

      // Get KET and verify subtype
      await verifyFileExport(
        page,
        `KET/Chromium-popup/3227-Introducing-Copolymer-S-group-type/${expectedFile}`,
        FileType.KET,
      );
    }
  });

  test('Case 4 - Import MOL file and verify atoms, bonds and labels for each SRU', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10004
     * Description: Check that on import from MOL file, Indigo should identify atoms, bonds and labels for each structure repeating unit, SRU
     * Scenario:
     * 1. Import MOL file with copolymer containing multiple SRUs
     * 2. Verify that atoms, bonds, and labels are correctly preserved for each SRU
     * 3. Verify all copolymer properties are preserved in KET format
     *
     * Version 3.15.0
     */

    const copolymers = [
      {
        file: 'copolymer-alternating-ht.mol',
        repeatPattern: 'HT',
        description: 'Alternating copolymer',
        expectedFile: 'copolymer-alternating-ht-expected.ket',
      },
      {
        file: 'copolymer-block-hh.mol',
        repeatPattern: 'HH',
        description: 'Block copolymer',
        expectedFile: 'copolymer-block-hh-expected.ket',
      },
      {
        file: 'copolymer-random-eu.mol',
        repeatPattern: 'EU',
        description: 'Random copolymer',
        expectedFile: 'copolymer-random-eu-expected.ket',
      },
    ];

    for (const { file, expectedFile } of copolymers) {
      // Import MOL file with specific subtype
      await openFileAndAddToCanvasAsNewProject(
        page,
        `Molfiles-V2000/Chromium-popup/3227-Introducing-Copolymer-S-group-type/${file}`,
      );

      // Take screenshot to verify visual representation
      await takeEditorScreenshot(page);

      // Get KET and verify atoms, bonds, and labels are correctly preserved for each SRU
      await verifyFileExport(
        page,
        `KET/Chromium-popup/3227-Introducing-Copolymer-S-group-type/${expectedFile}`,
        FileType.KET,
      );
    }
  });

  const copolymers = [
    {
      file: 'copolymer-alternating-ht.mol',
      repeatPattern: 'HT',
      description: 'Alternating copolymer',
      expectedFile: 'copolymer-alternating-ht-expected',
    },
    {
      file: 'copolymer-block-hh.mol',
      repeatPattern: 'HH',
      description: 'Block copolymer',
      expectedFile: 'copolymer-block-hh-expected',
    },
    {
      file: 'copolymer-random-eu.mol',
      repeatPattern: 'EU',
      description: 'Random copolymer',
      expectedFile: 'copolymer-random-eu-expected',
    },
    {
      file: 'copolymer-block-ht.mol',
      repeatPattern: 'HT',
      description: 'Block copolymer',
      expectedFile: 'copolymer-block-ht-expected',
    },
    {
      file: 'copolymer-random-hh.mol',
      repeatPattern: 'HH',
      description: 'Random copolymer',
      expectedFile: 'copolymer-random-hh-expected',
    },
    {
      file: 'copolymer-alternating-eu.mol',
      repeatPattern: 'EU',
      description: 'Alternating copolymer',
      expectedFile: 'copolymer-alternating-eu-expected',
    },
    {
      file: 'copolymer-random-ht.mol',
      repeatPattern: 'HT',
      description: 'Random copolymer',
      expectedFile: 'copolymer-random-ht-expected',
    },
    {
      file: 'copolymer-alternating-hh.mol',
      repeatPattern: 'HH',
      description: 'Alternating copolymer',
      expectedFile: 'copolymer-alternating-hh-expected',
    },
    {
      file: 'copolymer-block-eu.mol',
      repeatPattern: 'EU',
      description: 'Block copolymer',
      expectedFile: 'copolymer-block-eu-expected',
    },
  ];

  test('Case 5 - Export copolymer S-group to MOL V2000 format', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10004
     * Description: Check that on export, Indigo converts copolymer s-group information from KET to MOL format
     * Scenario:
     * 1. Import structure with copolymer S-groups
     * 2. Export to MOL V2000 format
     * 3. Verify copolymer information is preserved in MOL format
     *
     * Version 3.15.0
     */

    for (const { file, expectedFile } of copolymers) {
      // Import MOL file with specific subtype
      await openFileAndAddToCanvasAsNewProject(
        page,
        `Molfiles-V2000/Chromium-popup/3227-Introducing-Copolymer-S-group-type/${file}`,
      );

      // Use verifyFileExport to check round-trip consistency
      await verifyFileExport(
        page,
        `Molfiles-V2000/Chromium-popup/3227-Introducing-Copolymer-S-group-type/${expectedFile}.mol`,
        FileType.MOL,
        MolFileFormat.v2000,
      );
    }
  });

  test('Case 6 - Export copolymer S-group to MOL V3000 format', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10004
     * Description: Check that on export, Indigo converts copolymer s-group information from KET to MOL V3000 format
     * Scenario:
     * 1. Create structure with copolymer S-groups
     * 2. Export to MOL V3000 format
     * 3. Verify copolymer information is preserved in MOL V3000 format
     *
     * Version 3.15.0
     */

    for (const { file, expectedFile } of copolymers) {
      // Import MOL file with specific subtype
      await openFileAndAddToCanvasAsNewProject(
        page,
        `Molfiles-V2000/Chromium-popup/3227-Introducing-Copolymer-S-group-type/${file}`,
      );

      // Use verifyFileExport to check round-trip consistency
      await verifyFileExport(
        page,
        `Molfiles-V3000/Chromium-popup/3227-Introducing-Copolymer-S-group-type/${expectedFile}.mol`,
        FileType.MOL,
        MolFileFormat.v3000,
      );
    }
  });

  test('Case 7 - Export copolymer S-group to CDX format with special handling', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10004
     * Description: Check that CDX format supports copolymer s-groups with special handling
     * Scenario:
     * 1. Create structure with copolymer S-groups
     * 2. Export to CDX format
     * 3. Verify copolymer information is handled appropriately for CDX format
     *
     * Version 3.15.0
     */

    for (const { file, expectedFile } of copolymers) {
      // Import MOL file with specific subtype
      await openFileAndAddToCanvasAsNewProject(
        page,
        `Molfiles-V2000/Chromium-popup/3227-Introducing-Copolymer-S-group-type/${file}`,
      );

      // Use verifyFileExport to check round-trip consistency
      await verifyFileExport(
        page,
        `CDX/Chromium-popup/3227-Introducing-Copolymer-S-group-type/${expectedFile}.cdx`,
        FileType.CDX,
      );
    }
  });

  test('Case 8 - Export copolymer S-group to CDXML format with special handling', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10004
     * Description: Check that CDXML format supports copolymer s-groups with special handling
     * Scenario:
     * 1. Create structure with copolymer S-groups
     * 2. Export to CDXML format
     * 3. Verify copolymer information is handled appropriately for CDXML format
     *
     * Version 3.15.0
     */

    for (const { file, expectedFile } of copolymers) {
      // Import MOL file with specific subtype
      await openFileAndAddToCanvasAsNewProject(
        page,
        `Molfiles-V2000/Chromium-popup/3227-Introducing-Copolymer-S-group-type/${file}`,
      );

      // Use verifyFileExport to check round-trip consistency
      await verifyFileExport(
        page,
        `CDXML/Chromium-popup/3227-Introducing-Copolymer-S-group-type/${expectedFile}.cdxml`,
        FileType.CDXML,
      );
    }
  });

  test('Case 9 - Export copolymer S-group to other formats (current behavior)', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10004
     * Description: Check that when converting to other formats, the copolymer s-group should be treated in the same way as other s-groups on export (current behavior)
     * Scenario:
     * 1. Create structure with copolymer S-groups
     * 2. Export to formats other than CDX/CDXML (e.g., SMILES, InChI)
     * 3. Verify copolymer information is handled according to current S-group behavior
     *
     * Version 3.15.0
     */

    for (const { file, expectedFile } of copolymers) {
      // Import MOL file with specific subtype
      await openFileAndAddToCanvasAsNewProject(
        page,
        `Molfiles-V2000/Chromium-popup/3227-Introducing-Copolymer-S-group-type/${file}`,
      );

      // Use verifyFileExport to check round-trip consistency
      await verifyFileExport(
        page,
        `SMILES/Chromium-popup/3227-Introducing-Copolymer-S-group-type/${expectedFile}.smi`,
        FileType.SMILES,
      );

      await verifyFileExport(
        page,
        `InChI/Chromium-popup/3227-Introducing-Copolymer-S-group-type/${expectedFile}.inchi`,
        FileType.InChI,
      );
    }
  });
});
