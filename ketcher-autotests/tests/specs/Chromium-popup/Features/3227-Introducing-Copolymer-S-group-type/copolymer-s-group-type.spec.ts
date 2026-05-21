/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-magic-numbers */
import { Page, test, expect } from '@fixtures';
import {
  openFileAndAddToCanvas,
  openFileAndAddToCanvasAsNewProject,
  takeEditorScreenshot,
} from '@utils';
import {
  FileType,
  verifyFileExport,
} from '@utils/files/receiveFileComparisonData';
import { MolFileFormat, getKet, getMolfile } from '@utils/formats';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { SaveStructureDialog } from '@tests/pages/common/SaveStructureDialog';
import { MoleculesFileFormatType } from '@tests/pages/constants/fileFormats/microFileFormats';

let page: Page;

test.describe('Copolymer S-Group Type - Import/Export/Conversion', () => {
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
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/copolymer-random-ht.mol');

    // Take screenshot to verify visual representation
    await takeEditorScreenshot(page);

    // Get KET format and verify copolymer S-group data is preserved
    const ketData = await getKet(page);
    const ketObject = JSON.parse(ketData);
    
    // Verify that copolymer S-group type (COP) is identified
    const sGroups = ketObject.root.sgroups;
    const copolymerSGroup = sGroups?.find((sg: any) => sg.type === 'COP');
    expect(copolymerSGroup).toBeDefined();
    expect(copolymerSGroup.type).toBe('COP');
  });

  test('Case 2 - Import MOL file and verify copolymer S-group subtype identification (RAN, ALT, BLO)', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10004
     * Description: Check that on import from MOL file, Indigo should identify the copolymer s-group subtype (RAN - random, ALT - alternating or BLO - block)
     * Scenario:
     * 1. Test import of MOL files with different copolymer subtypes (RAN, ALT, BLO)
     * 2. Verify that subtypes are correctly identified in KET format
     * 
     * Version 3.15.0
     */

    const subtypes = [
      { file: 'copolymer-random-ht.mol', subtype: 'RAN', description: 'Random copolymer' },
      { file: 'copolymer-alternating-hh.mol', subtype: 'ALT', description: 'Alternating copolymer' },
      { file: 'copolymer-block-eu.mol', subtype: 'BLO', description: 'Block copolymer' }
    ];

    for (const { file, subtype, description } of subtypes) {
      // Import MOL file with specific subtype
      await openFileAndAddToCanvas(page, `Molfiles-V2000/${file}`);

      // Get KET and verify subtype
      const ketData = await getKet(page);
      const ketObject = JSON.parse(ketData);
      const sGroups = ketObject.root.sgroups;
      const copolymerSGroup = sGroups?.find((sg: any) => sg.type === 'COP');
      
      expect(copolymerSGroup).toBeDefined();
      expect(copolymerSGroup.data?.connectivity || copolymerSGroup.connectivity).toBe(subtype);
      
      await CommonTopLeftToolbar(page).clearCanvas();
    }
  });

  test('Case 3 - Import MOL file and verify copolymer S-group connections (HT, HH, EU)', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10004
     * Description: Check that on import from MOL file, Indigo should identify copolymer s-group connections (HT: Head-to-Tail, HH: Head-to-Head and EU: Either/Unknown)
     * Scenario:
     * 1. Test import of MOL files with different connection types (HT, HH, EU)
     * 2. Verify that connection types are correctly identified
     * 
     * Version 3.15.0
     */

    const connections = [
      { connection: 'HT', description: 'Head-to-Tail' },
      { connection: 'HH', description: 'Head-to-Head' },
      { connection: 'EU', description: 'Either/Unknown' }
    ];

    for (const { connection, description } of connections) {
      const molWithConnection = `
  Ketcher  01012500002D 1   1.00000     0.00000     0

 8 7  0     0  0            999 V2000
    6.0000    1.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    7.0000    1.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    8.0000    1.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    9.0000    1.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
   10.0000    1.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
   11.0000    1.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
   12.0000    1.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
   13.0000    1.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
  1  2  1  0     0  0
  2  3  1  0     0  0
  3  4  1  0     0  0
  4  5  1  0     0  0
  5  6  1  0     0  0
  6  7  1  0     0  0
  7  8  1  0     0  0
M  STY  3   1 SRU   2 SRU   3 COP
M  SCN  3   1 ${connection}   2 ${connection}   3 RAN
M  SMT   1 A
M  SMT   2 B
M  SMT   3 n
M  SAL   1  2   1   2
M  SAL   2  2   3   4
M  SAL   3  4   1   2   3   4
M  SBL   1  1   1
M  SBL   2  1   2
M  SBL   3  2   1   2
M  END`;

      await page.evaluate((molData) => {
        window.ketcher.setMolecule(molData);
      }, molWithConnection);

      // Get KET and verify connection type
      const ketData = await getKet(page);
      const ketObject = JSON.parse(ketData);
      const sGroups = ketObject.root.sgroups;
      const sruSGroups = sGroups?.filter((sg: any) => sg.type === 'SRU');
      
      // Verify SRU groups have correct connectivity
      expect(sruSGroups).toBeDefined();
      expect(sruSGroups.length).toBeGreaterThan(0);
      
      for (const sruGroup of sruSGroups) {
        expect(sruGroup.data?.connectivity || sruGroup.connectivity).toBe(connection);
      }
      
      await CommonTopLeftToolbar(page).clearCanvas();
    }
  });

  test('Case 4 - Import MOL file and verify atoms, bonds and labels for each SRU', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10004
     * Description: Check that on import from MOL file, Indigo should identify atoms, bonds and labels for each structure repeating unit, SRU
     * Scenario:
     * 1. Import MOL file with copolymer containing multiple SRUs
     * 2. Verify that atoms, bonds, and labels are correctly preserved for each SRU
     * 
     * Version 3.15.0
     */

    const molWithSRUs = `
  Ketcher  01012500002D 1   1.00000     0.00000     0

 12 11  0     0  0            999 V2000
    6.0000    1.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    7.0000    1.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    8.0000    1.0000    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0
    9.0000    1.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
   10.0000    1.0000    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0
   11.0000    1.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    6.0000    2.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    7.0000    2.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    8.0000    2.0000    0.0000 S   0  0  0  0  0  0  0  0  0  0  0  0
    9.0000    2.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
   10.0000    2.0000    0.0000 P   0  0  0  0  0  0  0  0  0  0  0  0
   11.0000    2.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
  1  2  1  0     0  0
  2  3  2  0     0  0
  3  4  1  0     0  0
  4  5  2  0     0  0
  5  6  1  0     0  0
  7  8  1  0     0  0
  8  9  2  0     0  0
  9 10  1  0     0  0
 10 11  2  0     0  0
 11 12  1  0     0  0
M  STY  3   1 SRU   2 SRU   3 COP
M  SCN  3   1 HT    2 HT    3 ALT
M  SMT   1 Unit_A
M  SMT   2 Unit_B
M  SMT   3 n
M  SAL   1  6   1   2   3   4   5   6
M  SAL   2  6   7   8   9  10  11  12
M  SAL   3 12   1   2   3   4   5   6   7   8   9  10  11  12
M  SBL   1  5   1   2   3   4   5
M  SBL   2  5   6   7   8   9  10
M  SBL   3 10   1   2   3   4   5   6   7   8   9  10
M  END`;

    await page.evaluate((molData) => {
      window.ketcher.setMolecule(molData);
    }, molWithSRUs);

    // Take screenshot to verify structure
    await takeEditorScreenshot(page);

    // Get KET and verify SRU content
    const ketData = await getKet(page);
    const ketObject = JSON.parse(ketData);
    
    // Verify atoms are preserved
    const atoms = ketObject.root.atoms;
    expect(atoms).toBeDefined();
    expect(atoms.length).toBe(12);
    
    // Verify different atom types (C, N, O, S, P)
    const atomTypes = atoms.map((atom: any) => atom.label);
    expect(atomTypes).toContain('C');
    expect(atomTypes).toContain('N');
    expect(atomTypes).toContain('O');
    expect(atomTypes).toContain('S');
    expect(atomTypes).toContain('P');
    
    // Verify bonds are preserved
    const bonds = ketObject.root.bonds;
    expect(bonds).toBeDefined();
    expect(bonds.length).toBe(11);
    
    // Verify SRU groups with labels
    const sGroups = ketObject.root.sgroups;
    const sruGroups = sGroups?.filter((sg: any) => sg.type === 'SRU');
    expect(sruGroups).toBeDefined();
    expect(sruGroups.length).toBe(2);
    
    // Verify SRU labels are preserved
    const sruLabels = sruGroups.map((sg: any) => sg.data?.subscript || sg.subscript);
    expect(sruLabels).toContain('Unit_A');
    expect(sruLabels).toContain('Unit_B');
  });

  test('Case 5 - Verify copolymer information converted to KET format', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10004
     * Description: Verify that copolymer information is correctly converted to KET format with all properties preserved
     * Scenario:
     * 1. Import MOL file with copolymer S-groups
     * 2. Export to KET format
     * 3. Verify all copolymer properties are preserved in KET
     * 
     * Version 3.15.0
     */

    const fullCopolymerMol = `
  Ketcher  01012500002D 1   1.00000     0.00000     0

 16 15  0     0  0            999 V2000
    6.0000    1.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    7.0000    1.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    8.0000    1.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    9.0000    1.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
   10.0000    1.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
   11.0000    1.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
   12.0000    1.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
   13.0000    1.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    6.0000    2.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    7.0000    2.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    8.0000    2.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    9.0000    2.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
   10.0000    2.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
   11.0000    2.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
   12.0000    2.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
   13.0000    2.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
  1  2  1  0     0  0
  2  3  1  0     0  0
  3  4  1  0     0  0
  4  5  1  0     0  0
  5  6  1  0     0  0
  6  7  1  0     0  0
  7  8  1  0     0  0
  9 10  1  0     0  0
 10 11  1  0     0  0
 11 12  1  0     0  0
 12 13  1  0     0  0
 13 14  1  0     0  0
 14 15  1  0     0  0
 15 16  1  0     0  0
M  STY  3   1 SRU   2 SRU   3 COP
M  SCN  3   1 HT    2 HH    3 BLO
M  SMT   1 Poly_A
M  SMT   2 Poly_B
M  SMT   3 copolymer
M  SAL   1  4   1   2   3   4
M  SAL   2  4   9  10  11  12
M  SAL   3  8   1   2   3   4   9  10  11  12
M  SBL   1  3   1   2   3
M  SBL   2  3   8   9  10
M  SBL   3  6   1   2   3   8   9  10
M  END`;

    await page.evaluate((molData) => {
      window.ketcher.setMolecule(molData);
    }, fullCopolymerMol);

    // Get KET format
    const ketData = await getKet(page);
    const ketObject = JSON.parse(ketData);
    
    // Verify complete copolymer information in KET
    const sGroups = ketObject.root.sgroups;
    expect(sGroups).toBeDefined();
    
    // Find copolymer S-group
    const copolymerSGroup = sGroups.find((sg: any) => sg.type === 'COP');
    expect(copolymerSGroup).toBeDefined();
    expect(copolymerSGroup.type).toBe('COP');
    expect(copolymerSGroup.data?.connectivity || copolymerSGroup.connectivity).toBe('BLO');
    expect(copolymerSGroup.data?.subscript || copolymerSGroup.subscript).toBe('copolymer');
    
    // Find SRU S-groups
    const sruGroups = sGroups.filter((sg: any) => sg.type === 'SRU');
    expect(sruGroups).toBeDefined();
    expect(sruGroups.length).toBe(2);
    
    // Verify SRU connectivity is preserved
    const htGroup = sruGroups.find((sg: any) => (sg.data?.connectivity || sg.connectivity) === 'HT');
    const hhGroup = sruGroups.find((sg: any) => (sg.data?.connectivity || sg.connectivity) === 'HH');
    expect(htGroup).toBeDefined();
    expect(hhGroup).toBeDefined();
    
    // Verify atom lists are preserved
    expect(copolymerSGroup.atoms).toBeDefined();
    expect(copolymerSGroup.atoms.length).toBeGreaterThan(0);
  });

  test('Case 6 - Export copolymer S-group to MOL V2000 format', async () => {
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

    // Import test structure
    await openFileAndAddToCanvas(page, 'Molfiles-V2000/copolymer-random-ht.mol');

    // Use verifyFileExport to check round-trip consistency
    await verifyFileExport(
      page,
      'Molfiles-V2000/copolymer-random-ht-expected.mol',
      FileType.MOL,
      MolFileFormat.v2000,
    );
  });

  test('Case 7 - Export copolymer S-group to MOL V3000 format', async () => {
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

    // Import test structure
    const molWithCopolymer = `
  Ketcher  01012500002D 1   1.00000     0.00000     0

 8 7  0     0  0            999 V2000
    6.0000    1.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    7.0000    1.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    8.0000    1.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    9.0000    1.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
   10.0000    1.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
   11.0000    1.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
   12.0000    1.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
   13.0000    1.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
  1  2  1  0     0  0
  2  3  1  0     0  0
  3  4  1  0     0  0
  4  5  1  0     0  0
  5  6  1  0     0  0
  6  7  1  0     0  0
  7  8  1  0     0  0
M  STY  3   1 SRU   2 SRU   3 COP
M  SCN  3   1 HH    2 EU    3 BLO
M  SMT   1 X
M  SMT   2 Y
M  SMT   3 copolymer
M  SAL   1  2   1   2
M  SAL   2  2   3   4
M  SAL   3  4   1   2   3   4
M  SBL   1  1   1
M  SBL   2  1   2
M  SBL   3  2   1   2
M  END`;

    await page.evaluate((molData) => {
      window.ketcher.setMolecule(molData);
    }, molWithCopolymer);

    // Export to MOL V3000
    const molV3000Export = await getMolfile(page, MolFileFormat.v3000);
    
    // Verify copolymer S-group information is in MOL V3000 export
    expect(molV3000Export).toContain('V3000');
    expect(molV3000Export).toContain('SGROUP');
    expect(molV3000Export).toContain('COP'); // Copolymer type
    expect(molV3000Export).toContain('SRU'); // SRU types
    expect(molV3000Export).toContain('BLO'); // Block subtype
    expect(molV3000Export).toContain('HH'); // Head-to-head connectivity
    expect(molV3000Export).toContain('EU'); // Either/Unknown connectivity
  });

  test('Case 8 - Export copolymer S-group to CDX format with special handling', async () => {
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

    const molWithCopolymer = `
  Ketcher  01012500002D 1   1.00000     0.00000     0

 6 5  0     0  0            999 V2000
    6.0000    1.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    7.0000    1.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    8.0000    1.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    9.0000    1.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
   10.0000    1.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
   11.0000    1.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
  1  2  1  0     0  0
  2  3  1  0     0  0
  3  4  1  0     0  0
  4  5  1  0     0  0
  5  6  1  0     0  0
M  STY  3   1 SRU   2 SRU   3 COP
M  SCN  3   1 HT    2 HT    3 RAN
M  SMT   1 A
M  SMT   2 B
M  SMT   3 n
M  SAL   1  2   1   2
M  SAL   2  2   3   4
M  SAL   3  4   1   2   3   4
M  SBL   1  1   1
M  SBL   2  1   2
M  SBL   3  2   1   2
M  END`;

    await page.evaluate((molData) => {
      window.ketcher.setMolecule(molData);
    }, molWithCopolymer);

    // Export to CDX format
    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(MoleculesFileFormatType.CDX);
    const cdxExportResult = await SaveStructureDialog(page).getTextAreaValue();
    
    // CDX format should support copolymer S-groups - verify export succeeds
    expect(cdxExportResult).toBeDefined();
    expect(cdxExportResult.length).toBeGreaterThan(0);
    
    await SaveStructureDialog(page).cancel();
  });

  test('Case 9 - Export copolymer S-group to CDXML format with special handling', async () => {
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

    const molWithCopolymer = `
  Ketcher  01012500002D 1   1.00000     0.00000     0

 6 5  0     0  0            999 V2000
    6.0000    1.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    7.0000    1.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    8.0000    1.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    9.0000    1.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
   10.0000    1.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
   11.0000    1.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
  1  2  1  0     0  0
  2  3  1  0     0  0
  3  4  1  0     0  0
  4  5  1  0     0  0
  5  6  1  0     0  0
M  STY  3   1 SRU   2 SRU   3 COP
M  SCN  3   1 HT    2 HT    3 ALT
M  SMT   1 A
M  SMT   2 B
M  SMT   3 polymer
M  SAL   1  2   1   2
M  SAL   2  2   3   4
M  SAL   3  4   1   2   3   4
M  SBL   1  1   1
M  SBL   2  1   2
M  SBL   3  2   1   2
M  END`;

    await page.evaluate((molData) => {
      window.ketcher.setMolecule(molData);
    }, molWithCopolymer);

    // Export to CDXML format  
    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(MoleculesFileFormatType.CDXML);
    const cdxmlExportResult = await SaveStructureDialog(page).getTextAreaValue();
    
    // CDXML format should support copolymer S-groups - verify export succeeds and contains XML structure
    expect(cdxmlExportResult).toBeDefined();
    expect(cdxmlExportResult.length).toBeGreaterThan(0);
    expect(cdxmlExportResult).toContain('<?xml'); // Verify it's valid XML
    
    await SaveStructureDialog(page).cancel();
  });

  test('Case 10 - Export copolymer S-group to other formats (current behavior)', async () => {
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

    const molWithCopolymer = `
  Ketcher  01012500002D 1   1.00000     0.00000     0

 6 5  0     0  0            999 V2000
    6.0000    1.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    7.0000    1.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    8.0000    1.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    9.0000    1.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
   10.0000    1.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
   11.0000    1.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
  1  2  1  0     0  0
  2  3  1  0     0  0
  3  4  1  0     0  0
  4  5  1  0     0  0
  5  6  1  0     0  0
M  STY  3   1 SRU   2 SRU   3 COP
M  SCN  3   1 HT    2 HT    3 RAN
M  SMT   1 A
M  SMT   2 B
M  SMT   3 n
M  SAL   1  2   1   2
M  SAL   2  2   3   4
M  SAL   3  4   1   2   3   4
M  SBL   1  1   1
M  SBL   2  1   2
M  SBL   3  2   1   2
M  END`;

    await page.evaluate((molData) => {
      window.ketcher.setMolecule(molData);
    }, molWithCopolymer);

    // Test SMILES export (S-groups typically not preserved)
    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(MoleculesFileFormatType.DaylightSMILES);
    const smilesResult = await SaveStructureDialog(page).getTextAreaValue();
    expect(smilesResult).toBeDefined();
    expect(smilesResult.length).toBeGreaterThan(0);
    // SMILES typically just shows the base structure without S-group information
    expect(smilesResult).toMatch(/^[CNOS\d\(\)\[\]=#\-\+\\\/\.]+$/); // Basic SMILES pattern
    await SaveStructureDialog(page).cancel();

    // Test InChI export (S-groups typically not preserved)
    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(MoleculesFileFormatType.InChI);
    const inchiResult = await SaveStructureDialog(page).getTextAreaValue();
    expect(inchiResult).toBeDefined();
    expect(inchiResult.length).toBeGreaterThan(0);
    expect(inchiResult).toContain('InChI='); // Verify InChI format
    await SaveStructureDialog(page).cancel();
  });

  test('Case 11 - Round-trip test: MOL -> KET -> MOL with copolymer preservation', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10004
     * Description: Verify complete round-trip preservation of copolymer S-group information
     * Scenario:
     * 1. Import MOL file with copolymer S-groups
     * 2. Convert to KET format
     * 3. Convert back to MOL format
     * 4. Verify all copolymer information is preserved through the conversion chain
     * 
     * Version 3.15.0
     */

    const originalMol = `
  Ketcher  01012500002D 1   1.00000     0.00000     0

 8 7  0     0  0            999 V2000
    6.0000    1.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    7.0000    1.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    8.0000    1.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    9.0000    1.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
   10.0000    1.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
   11.0000    1.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
   12.0000    1.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
   13.0000    1.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
  1  2  1  0     0  0
  2  3  1  0     0  0
  3  4  1  0     0  0
  4  5  1  0     0  0
  5  6  1  0     0  0
  6  7  1  0     0  0
  7  8  1  0     0  0
M  STY  3   1 SRU   2 SRU   3 COP
M  SCN  3   1 HT    2 EU    3 BLO
M  SMT   1 UnitA
M  SMT   2 UnitB
M  SMT   3 copolymer
M  SAL   1  2   1   2
M  SAL   2  2   3   4
M  SAL   3  4   1   2   3   4
M  SBL   1  1   1
M  SBL   2  1   2
M  SBL   3  2   1   2
M  END`;

    // Import original MOL
    await page.evaluate((molData) => {
      window.ketcher.setMolecule(molData);
    }, originalMol);

    // Convert to KET
    const ketData = await getKet(page);
    
    // Clear canvas and import from KET
    await CommonTopLeftToolbar(page).clearCanvas();
    await page.evaluate((ketData) => {
      window.ketcher.setMolecule(ketData);
    }, ketData);

    // Export back to MOL
    const finalMol = await getMolfile(page, MolFileFormat.v2000);

    // Verify key copolymer information is preserved
    expect(finalMol).toContain('M  STY');
    expect(finalMol).toContain('COP'); // Copolymer type preserved
    expect(finalMol).toContain('SRU'); // SRU types preserved
    expect(finalMol).toContain('M  SCN'); // Connectivity preserved
    expect(finalMol).toContain('BLO'); // Block subtype preserved
    expect(finalMol).toContain('HT'); // Head-to-tail connectivity preserved
    expect(finalMol).toContain('EU'); // Either/Unknown connectivity preserved
    expect(finalMol).toContain('UnitA'); // SRU labels preserved
    expect(finalMol).toContain('UnitB');
    expect(finalMol).toContain('copolymer'); // Copolymer label preserved
    expect(finalMol).toContain('M  SAL'); // Atom lists preserved
    expect(finalMol).toContain('M  SBL'); // Bond lists preserved
  });
});