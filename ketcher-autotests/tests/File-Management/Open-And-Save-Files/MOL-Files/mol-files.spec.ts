/* eslint-disable no-magic-numbers */
import { MolfileFormat } from '@app/../packages/ketcher-core/dist';
import { expect, test } from '@playwright/test';
import {
  takeEditorScreenshot,
  receiveFileComparisonData,
  openFileAndAddToCanvas,
  saveToFile,
  waitForPageInit,
  waitForIndigoToLoad,
} from '@utils';
import { getMolfile } from '@utils/formats';

test('Open and Save files - Open/Save structure with atom properties 1/2 - open', async ({
  page,
}) => {
  /**
   * Test case: EPMLSOPKET-1855(1)
   * Description: Sctucrute with atom properties is opened and saved correctly
   */
  await waitForPageInit(page);

  await openFileAndAddToCanvas('mol_1855_to_open.mol', page);
  // check that structure opened from file is displayed correctly
  await takeEditorScreenshot(page);
});

test('Open and Save files - Open/Save structure with atom properties 2/2 - save', async ({
  page,
}) => {
  /**
   * Test case: EPMLSOPKET-1855(2)
   * Description: Sctucrute with atom properties is opened and saved correctly
   */
  await waitForPageInit(page);

  await openFileAndAddToCanvas('mol_1855_to_open.mol', page);
  const expectedFile = await getMolfile(page, 'v2000');
  await saveToFile('mol_1855_to_open-expected.mol', expectedFile);

  const METADATA_STRING_INDEX = [1];
  const { fileExpected: molFileExpected, file: molFile } =
    await receiveFileComparisonData({
      page,
      expectedFileName: 'tests/test-data/mol_1855_to_open-expected.mol',
      fileFormat: 'v2000',
      metaDataIndexes: METADATA_STRING_INDEX,
    });

  expect(molFile).toEqual(molFileExpected);
});

test('Open and Save file - Open/Save V3000 file with atom and bond properties 1/2 - open', async ({
  page,
}) => {
  /**
   * Test case: EPMLSOPKET-1857(1)
   * Description: Strucrute with atom and bond properties is opened and saved correctly
   */
  await waitForPageInit(page);

  await openFileAndAddToCanvas('Marvin_Atom_properties_V3000.mol', page);
  // check that structure opened from file is displayed correctly
  await takeEditorScreenshot(page);
});

test('Open and Save file - Open/Save V3000 file with atom and bond properties 2/2 - save', async ({
  page,
}) => {
  /**
   * Test case: EPMLSOPKET-1857(2)
   * Description: Strucrute with atom and bond properties is opened and saved correctly
   */
  await waitForPageInit(page);

  await openFileAndAddToCanvas('Marvin_Atom_properties_V3000.mol', page);
  const expectedFile = await getMolfile(page, 'v3000');
  await saveToFile(
    'Molfiles-V3000/atom-properties-V3000-expected.mol',
    expectedFile,
  );

  const METADATA_STRING_INDEX = [1];

  const { fileExpected: molFileExpected, file: molFile } =
    await receiveFileComparisonData({
      page,
      expectedFileName:
        'tests/test-data/Molfiles-V3000/atom-properties-V3000-expected.mol',
      fileFormat: 'v3000',
      metaDataIndexes: METADATA_STRING_INDEX,
    });

  expect(molFile).toEqual(molFileExpected);
});

test('Open and Save file - Open/Save Markush files 1/2 - open', async ({
  page,
}) => {
  /**
   * Test case: EPMLSOPKET-1894(1)
   * Description: Markush structure is displayed as an RGroup structure.
   */
  await waitForPageInit(page);

  await openFileAndAddToCanvas('Markush.mol', page);
  // check that structure opened from file is displayed correctly
  await takeEditorScreenshot(page);
});

test('Open and Save file - Open/Save Markush files 2/2 - save', async ({
  page,
}) => {
  /**
   * Test case: EPMLSOPKET-1894(2)
   * Description: Markush structure is displayed as an RGroup structure.
   */
  await waitForPageInit(page);

  await openFileAndAddToCanvas('Markush.mol', page);
  const expectedFile = await getMolfile(page, 'v2000');
  await saveToFile('markush-expected.mol', expectedFile);

  const METADATA_STRINGS_INDEXES = [0, 4];

  const { fileExpected: molFileExpected, file: molFile } =
    await receiveFileComparisonData({
      page,
      expectedFileName: 'tests/test-data/markush-expected.mol',
      fileFormat: 'v2000',
      metaDataIndexes: METADATA_STRINGS_INDEXES,
    });

  expect(molFile).toEqual(molFileExpected);
});

test('Open and Save file - Open/Save V2000 *.mol file contains abbreviation 1/2 - open', async ({
  page,
}) => {
  /**
   * Test case: EPMLSOPKET-1858(1)
   * Description: v2000 mol file with abbreviation is opened and saved correctly
   */
  await waitForPageInit(page);

  await openFileAndAddToCanvas('sec_butyl_abr.mol', page);
  // check that structure opened from file is displayed correctly
  await takeEditorScreenshot(page);
});

test('Open and Save file - Open/Save V2000 *.mol file contains abbreviation 2/2 - save', async ({
  page,
}) => {
  /**
   * Test case: EPMLSOPKET-1858(2)
   * Description: v2000 mol file with abbreviation is opened and saved correctly
   */
  await waitForPageInit(page);

  await openFileAndAddToCanvas('sec_butyl_abr.mol', page);
  const expectedFile = await getMolfile(page, 'v2000');
  await saveToFile('sec_butyl_abr-expected.mol', expectedFile);

  const METADATA_STRING_INDEX = [1];

  const { fileExpected: molFileExpected, file: molFile } =
    await receiveFileComparisonData({
      page,
      expectedFileName: 'tests/test-data/sec_butyl_abr-expected.mol',
      fileFormat: 'v2000',
      metaDataIndexes: METADATA_STRING_INDEX,
    });

  expect(molFile).toEqual(molFileExpected);
});

test('Open and Save file - Open/Save V3000 *.mol file contains abbreviation 1/2 - open', async ({
  page,
}) => {
  /**
   * Test case: EPMLSOPKET-1859(1)
   * Description: v3000 mol file with abbreviation is opened and saved correctly
   */
  await waitForPageInit(page);

  await openFileAndAddToCanvas('sec_butyl_abr_V3000.mol', page);
  // check that structure opened from file is displayed correctly
  await takeEditorScreenshot(page);
});

test('Open and Save file - Open/Save V3000 *.mol file contains abbreviation 2/2 - save', async ({
  page,
}) => {
  /**
   * Test case: EPMLSOPKET-1859(2)
   * Description: v3000 mol file with abbreviation is opened and saved correctly
   */
  await waitForPageInit(page);

  await openFileAndAddToCanvas('sec_butyl_abr_V3000.mol', page);
  const expectedFile = await getMolfile(page, 'v3000');
  await saveToFile('sec_butyl_abr_V3000-expected.mol', expectedFile);
  const METADATA_STRING_INDEX = [1];

  const { fileExpected: molFileExpected, file: molFile } =
    await receiveFileComparisonData({
      page,
      expectedFileName: 'tests/test-data/sec_butyl_abr_V3000-expected.mol',
      fileFormat: 'v3000',
      metaDataIndexes: METADATA_STRING_INDEX,
    });

  expect(molFile).toEqual(molFileExpected);
});

test('Open and Save file - Open/Save file with R-Groups 1/2 - open', async ({
  page,
}) => {
  /**
   * Test case: EPMLSOPKET-1873(1)
   * Description: Structure with R-Groups is correctly opened from Mol file
   */
  await waitForPageInit(page);

  await openFileAndAddToCanvas('Rgroup.mol', page);
  // check that structure opened from file is displayed correctly
  await takeEditorScreenshot(page);
});

test('Open and Save file - Open/Save file with R-Groups 2/2 - save', async ({
  page,
}) => {
  /**
   * Test case: EPMLSOPKET-1873(2)
   * Description: Structure with R-Groups is correctly saved to Mol file
   */
  await waitForPageInit(page);

  await openFileAndAddToCanvas('Rgroup.mol', page);
  const expectedFile = await getMolfile(page, 'v2000');
  await saveToFile('r-group-expected.mol', expectedFile);

  const METADATA_STRINGS_INDEXES = [0, 4];

  const { fileExpected: molFileExpected, file: molFile } =
    await receiveFileComparisonData({
      page,
      expectedFileName: 'tests/test-data/r-group-expected.mol',
      fileFormat: 'v2000',
      metaDataIndexes: METADATA_STRINGS_INDEXES,
    });

  expect(molFile).toEqual(molFileExpected);
});

test('Open and Save file - Open/Save file contains Heteroatoms 1/2 - open', async ({
  page,
}) => {
  /**
   * Test case: EPMLSOPKET-1878(1)
   * Description: Structure with heteroatoms is opened from mol file correctly
   */
  await waitForPageInit(page);

  await openFileAndAddToCanvas('Heteroatoms.mol', page);
  // check that structure opened from file is displayed correctly
  await takeEditorScreenshot(page);
});

test('Open and Save file - Open/Save file contains Heteroatoms 2/2 - save', async ({
  page,
}) => {
  /**
   * Test case: EPMLSOPKET-1878(2)
   * Description: Structure with heteroatoms is saved to mol file correctly
   */
  await waitForPageInit(page);

  await openFileAndAddToCanvas('Heteroatoms.mol', page);
  const expectedFile = await getMolfile(page, 'v2000');
  await saveToFile('heteroatoms-expected.mol', expectedFile);
  const METADATA_STRING_INDEX = [1];

  const { fileExpected: molFileExpected, file: molFile } =
    await receiveFileComparisonData({
      page,
      expectedFileName: 'tests/test-data/heteroatoms-expected.mol',
      metaDataIndexes: METADATA_STRING_INDEX,
    });

  expect(molFile).toEqual(molFileExpected);
});

test('Open and Save file - Open/Save V3000 mol file contains attached data 1/2 - open', async ({
  page,
}) => {
  /**
   * Test case: EPMLSOPKET-1882(1)
   * Description: Structure with attached data is opened from mol file correctly
   */
  await waitForPageInit(page);

  await openFileAndAddToCanvas('Molfiles-V3000/attached-data-V3000.mol', page);
  // check that structure opened from file is displayed correctly
  await takeEditorScreenshot(page);
});

test('Open and Save file - Open/Save V3000 mol file contains attached data 2/2 - save', async ({
  page,
}) => {
  /**
   * Test case: EPMLSOPKET-1882(2)
   * Description: Structure with attached data is saved to mol file correctly
   */
  await waitForPageInit(page);

  await openFileAndAddToCanvas('Molfiles-V3000/attached-data-V3000.mol', page);
  const expectedFile = await getMolfile(page, 'v3000');
  await saveToFile(
    'Molfiles-V3000/attached-data-V3000-expected.mol',
    expectedFile,
  );
  const METADATA_STRING_INDEX = [1];

  const { fileExpected: molFileExpected, file: molFile } =
    await receiveFileComparisonData({
      page,
      expectedFileName:
        'tests/test-data/Molfiles-V3000/attached-data-V3000-expected.mol',
      fileFormat: 'v3000',
      metaDataIndexes: METADATA_STRING_INDEX,
    });

  expect(molFile).toEqual(molFileExpected);
});

test('Open and Save file - V3000 *.mol file contains Heteroatoms 1/2 - open', async ({
  page,
}) => {
  /**
   * Test case: EPMLSOPKET-1879(1)
   * Description: Structure with heteroatoms is opened from mol v3000 file correctly
   */
  await waitForPageInit(page);

  await openFileAndAddToCanvas('Heteroatoms_V3000.mol', page);
  // check that structure opened from file is displayed correctly
  await takeEditorScreenshot(page);
});

test('Open and Save file - V3000 *.mol file contains Heteroatoms 2/2 - save', async ({
  page,
}) => {
  /**
   * Test case: EPMLSOPKET-1879(2)
   * Description: Structure with heteroatoms is saved correctly to mol file
   */
  await waitForPageInit(page);

  await openFileAndAddToCanvas('Heteroatoms_V3000.mol', page);
  const expectedFile = await getMolfile(page, 'v3000');
  await saveToFile('heteroatoms-V3000-expected.mol', expectedFile);
  const METADATA_STRING_INDEX = [1];

  const { fileExpected: molFileExpected, file: molFile } =
    await receiveFileComparisonData({
      page,
      expectedFileName: 'tests/test-data/heteroatoms-V3000-expected.mol',
      fileFormat: 'v3000',
      metaDataIndexes: METADATA_STRING_INDEX,
    });

  expect(molFile).toEqual(molFileExpected);
});

test.fixme(
  'Open and Save file - Open/Save file with Attached data 1/2 - open',
  async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-1880(1)
     * Description: Structure with heteroatoms is opened from mol v3000 file correctly
     */
    await waitForPageInit(page);

    await openFileAndAddToCanvas('Molfiles-V2000/attached-data.mol', page);
    // check that structure opened from file is displayed correctly
    await takeEditorScreenshot(page);
  },
);

test('Open and Save file - Open/Save file with Attached data 2/2 - save', async ({
  page,
}) => {
  /**
   * Test case: EPMLSOPKET-1880(2)
   * Description: Structure with heteroatoms is saved correctly to mol file
   */
  await waitForPageInit(page);

  await openFileAndAddToCanvas('Molfiles-V2000/attached-data.mol', page);
  const expectedFile = await getMolfile(page, 'v2000');
  await saveToFile('Molfiles-V2000/attached-data-expected.mol', expectedFile);
  const METADATA_STRING_INDEX = [1];

  const { fileExpected: molFileExpected, file: molFile } =
    await receiveFileComparisonData({
      page,
      expectedFileName:
        'tests/test-data/Molfiles-V2000/attached-data-expected.mol',
      fileFormat: 'v2000',
      metaDataIndexes: METADATA_STRING_INDEX,
    });

  expect(molFile).toEqual(molFileExpected);
});

test('Open and Save file - Open/Save file contains abs stereochemistry 1/2 - open', async ({
  page,
}) => {
  /**
   * Test case: EPMLSOPKET-1883(1)
   * Description: File with abs stereochemistry is opened correctly from mol file
   */
  await waitForPageInit(page);

  await openFileAndAddToCanvas('V2000_abs.mol', page);
  // check that structure opened from file is displayed correctly
  await takeEditorScreenshot(page);
});

test('Open and Save file - Open/Save file contains abs stereochemistry 2/2 - save', async ({
  page,
}) => {
  /**
   * Test case: EPMLSOPKET-1883(2)
   * Description: Structure with abs stereochemistry is saved correctly to mol file
   */
  await waitForPageInit(page);

  await openFileAndAddToCanvas('V2000_abs.mol', page);
  const expectedFile = await getMolfile(page, 'v2000');
  await saveToFile('V2000-abs-expected.mol', expectedFile);
  const METADATA_STRING_INDEX = [1];

  const { fileExpected: molFileExpected, file: molFile } =
    await receiveFileComparisonData({
      page,
      expectedFileName: 'tests/test-data/V2000-abs-expected.mol',
      fileFormat: 'v2000',
      metaDataIndexes: METADATA_STRING_INDEX,
    });

  expect(molFile).toEqual(molFileExpected);
});

test('Open and Save file - Open/Save V3000 mol file contains abs stereochemistry 1/2 - open', async ({
  page,
}) => {
  /**
   * Test case: EPMLSOPKET-1884(1)
   * Description: File with abs stereochemistry is opened correctly from mol v3000 file
   */
  await waitForPageInit(page);

  await openFileAndAddToCanvas('V3000_abs.mol', page);
  // check that structure opened from file is displayed correctly
  await takeEditorScreenshot(page);
});

test('Open and Save file - Open/Save V3000 mol file contains abs stereochemistry 2/2 - save', async ({
  page,
}) => {
  /**
   * Test case: EPMLSOPKET-1884(2)
   * Description: Structure with abs stereochemistry is saved correctly to mol file
   */
  await waitForPageInit(page);

  await openFileAndAddToCanvas('V3000_abs.mol', page);
  const expectedFile = await getMolfile(page, 'v3000');
  await saveToFile('V3000-abs-expected.mol', expectedFile);
  const METADATA_STRING_INDEX = [1];

  const { fileExpected: molFileExpected, file: molFile } =
    await receiveFileComparisonData({
      page,
      expectedFileName: 'tests/test-data/V3000-abs-expected.mol',
      fileFormat: 'v3000',
      metaDataIndexes: METADATA_STRING_INDEX,
    });

  expect(molFile).toEqual(molFileExpected);
});

test('Open and Save file - Save V2000 molfile as V3000 molfile', async ({
  page,
}) => {
  /**
   * Test case: EPMLSOPKET-1985
   * Description: Structure opened from V2000 molfile can be saved to V3000 molfile
   */
  await waitForPageInit(page);

  await openFileAndAddToCanvas('spiro.mol', page);
  const expectedFile = await getMolfile(page, 'v3000');
  await saveToFile('spiro-expected.mol', expectedFile);

  const METADATA_STRINGS_INDEXES = [1, 3];

  const { fileExpected: molFileExpected, file: molFile } =
    await receiveFileComparisonData({
      page,
      expectedFileName: 'tests/test-data/spiro-expected.mol',
      metaDataIndexes: METADATA_STRINGS_INDEXES,
      fileFormat: 'v3000',
    });

  expect(molFile).toEqual(molFileExpected);
});

test('Open and Save file - Save V3000 molfile as V2000 molfile', async ({
  page,
}) => {
  /**
   * Test case: EPMLSOPKET-1986
   * Description: Structure opened from V3000 molfile can be saved to V2000 molfile
   */
  await waitForPageInit(page);

  await openFileAndAddToCanvas('ketcher (4).mol', page);
  const expectedFile = await getMolfile(page, 'v2000');
  await saveToFile('ketcher (4)-expected.mol', expectedFile);
  const METADATA_STRINGS_INDEXES = [1];

  const { fileExpected: molFileExpected, file: molFile } =
    await receiveFileComparisonData({
      page,
      expectedFileName: 'tests/test-data/ketcher (4)-expected.mol',
      metaDataIndexes: METADATA_STRINGS_INDEXES,
      fileFormat: 'v2000',
    });

  expect(molFile).toEqual(molFileExpected);
});

test('Open V3000 file with R-Groups with Fragments', async ({ page }) => {
  // Related Github issue https://github.com/epam/ketcher/issues/2774
  await waitForPageInit(page);
  await openFileAndAddToCanvas('RGroup-With-Fragments.mol', page);
  await takeEditorScreenshot(page);
});

test.describe('Open and Save file', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
    await waitForIndigoToLoad(page);
  });

  test.describe('Open file', () => {
    /*
     * Test case: EPMLSOPKET-1852, 1856, 1874, 1890, 1895, 1979, 8914, 12966, 4731, 5259, 1875, 1876, 12963
     * Description: The structure is correctly rendered on the canvas
     */
    const files = [
      {
        testName: 'Open/Save structure with bond properties',
        path: 'Molfiles-V2000/all-bond-properties.mol',
      },
      {
        testName: 'Open/Save Alias and Pseudoatoms',
        path: 'Molfiles-V2000/alias-and-pseudoatoms.mol',
      },
      {
        testName: 'Open/Save V3000 mol file contains Rgroup',
        path: 'Molfiles-V3000/rgroup-V3000.mol',
      },
      {
        testName: 'Open/Save V3000 mol file contains more than 900 symbols',
        path: 'Molfiles-V3000/more-900-atoms.mol',
      },
      {
        testName: 'Open/Save V3000 mol file contains Sgroup',
        path: 'Molfiles-V3000/multi-V3000.mol',
      },
      {
        testName: 'Save structure as *.mol V3000',
        path: 'Molfiles-V3000/multi-V3000.mol',
      },
      {
        testName: 'MDL Molfile v2000: Correct padding for M ALS',
        path: 'Molfiles-V2000/molfile-with-als.mol',
      },
      {
        testName: 'Open structure with R-Group from v3000 mol file',
        path: 'Molfiles-V3000/rgroup-V3000.mol',
      },
      {
        testName: 'Don`t creates invalid molfiles with "NaN"',
        path: 'Molfiles-V2000/benzoic-acid-with-na.mol',
      },
      {
        testName: 'Functional group name layout close to attachment point',
        path: 'Molfiles-V2000/display-abbrev-groups-example.mol',
      },
      {
        testName: 'Open/Save file with S-Groups',
        path: 'Molfiles-V2000/sgroup-different.mol',
      },
      {
        testName: 'Open/Save  V3000 mol file contains Sgroup',
        path: 'Molfiles-V3000/sgroup-different-V3000.mol',
      },
      {
        testName: 'Open/Save v3000 mol file with assigned Alias',
        path: 'Molfiles-V3000/chain-with-alias.mol',
      },
    ];

    for (const file of files) {
      test(`${file.testName}`, async ({ page }) => {
        await openFileAndAddToCanvas(file.path, page);
        await takeEditorScreenshot(page);
      });
    }
  });

  test.describe('Save file', () => {
    /*
     * Test case: EPMLSOPKET-1856, 1874, 1890, 1895, 1875, 1876, 12963
     * Description: The saved structure is correctly rendered on the canvas
     */
    const files = [
      {
        testName: 'Open/Save Alias and Pseudoatoms',
        pathToOpen: 'Molfiles-V2000/alias-and-pseudoatoms.mol',
        pathToExpected: 'Molfiles-V2000/alias-and-pseudoatoms-expected.mol',
        format: 'v2000',
      },
      {
        testName: 'Open/Save V3000 mol file contains Rgroup',
        pathToOpen: 'Molfiles-V3000/rgroup-V3000.mol',
        pathToExpected: 'Molfiles-V3000/rgroup-V3000-expected.mol',
        format: 'v3000',
      },
      {
        testName: 'Open/Save V3000 mol file contains more than 900 symbols',
        pathToOpen: 'Molfiles-V3000/more-900-atoms.mol',
        pathToExpected: 'Molfiles-V3000/more-900-atoms-expected.mol',
        format: 'v3000',
      },
      {
        testName: 'Open/Save V3000 mol file contains Sgroup',
        pathToOpen: 'Molfiles-V3000/multi-V3000.mol',
        pathToExpected: 'Molfiles-V3000/multi-V3000-expected.mol',
        format: 'v3000',
      },
      {
        testName: 'Open/Save  V3000 mol file contains Sgroup',
        pathToOpen: 'Molfiles-V3000/sgroup-different-V3000.mol',
        pathToExpected: 'Molfiles-V2000/sgroup-different-V2000-expected.mol',
        format: 'v2000',
      },
      {
        testName: 'Open/Save v3000 mol file with assigned Alias',
        pathToOpen: 'Molfiles-V3000/chain-with-alias.mol',
        pathToExpected: 'Molfiles-V3000/chain-with-alias-expected.mol',
        format: 'v3000',
      },
    ];

    for (const file of files) {
      test(`${file.testName}`, async ({ page }) => {
        await openFileAndAddToCanvas(file.pathToOpen, page);

        const expectedFile = await getMolfile(
          page,
          file.format as MolfileFormat,
        );
        await saveToFile(file.pathToExpected, expectedFile);

        const METADATA_STRING_INDEX = [1];
        const { fileExpected: molFileExpected, file: molFile } =
          await receiveFileComparisonData({
            page,
            expectedFileName: `tests/test-data/${file.pathToExpected}`,
            fileFormat: file.format as MolfileFormat,
            metaDataIndexes: METADATA_STRING_INDEX,
          });

        expect(molFile).toEqual(molFileExpected);
      });
    }
  });

  test.skip('V3000 mol file contains different Bond properties', async ({
    page,
  }) => {
    /**
     * Test case: EPMLSOPKET-1853
     * Description: Structre is correctly generated from Molstring and vise versa molstring is correctly generated from structure.
     * A file with V3000 format is resaved in V2000 format
     *
     * Now we can`t open the file - `Convert error! Cannot deserialize input JSON.`
     * https://github.com/epam/ketcher/issues/2378
     */

    await openFileAndAddToCanvas(
      'Molfiles-V3000/marvin-bond-properties-V3000(1).mol',
      page,
    );

    const expectedFile = await getMolfile(page, 'v2000');
    await saveToFile(
      'Molfiles-V2000/marvin-bond-properties-V3000-expected.mol',
      expectedFile,
    );

    const METADATA_STRING_INDEX = [1];
    const { fileExpected: molFileExpected, file: molFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/Molfiles-V2000/marvin-bond-properties-V3000-expected.mol',
        fileFormat: 'v2000',
        metaDataIndexes: METADATA_STRING_INDEX,
      });

    expect(molFile).toEqual(molFileExpected);
  });

  for (let i = 1; i < 9; i++) {
    test(`Open/Save files for ferrocen-like structures 1/2 - open ferrocene_radical0${i}.mol`, async ({
      page,
    }) => {
      /**
       * Test case: EPMLSOPKET-1893(1)
       * Description: Structures are rendered correctly
       */

      await openFileAndAddToCanvas(
        `Molfiles-V2000/ferrocene-radical0${i}.mol`,
        page,
      );
      await takeEditorScreenshot(page);
      await page.keyboard.press('Control+a');
      await page.keyboard.press('Delete');
    });
  }

  test('Open/Save files for ferrocen-like structures 2/2 - save', async ({
    page,
  }) => {
    /**
     * Test case: EPMLSOPKET-1893(2)
     * Description: Structures are rendered correctly.
     * */

    for (let i = 1; i < 9; i++) {
      await openFileAndAddToCanvas(
        `Molfiles-V2000/ferrocene-radical0${i}.mol`,
        page,
      );
    }

    const expectedFile = await getMolfile(page, 'v2000');
    await saveToFile(
      'Molfiles-V2000/ferrocene-radical-8-expected.mol',
      expectedFile,
    );

    const METADATA_STRING_INDEX = [1];
    const { fileExpected: molFileExpected, file: molFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/Molfiles-V2000/ferrocene-radical-8-expected.mol',
        fileFormat: 'v2000',
        metaDataIndexes: METADATA_STRING_INDEX,
      });

    expect(molFile).toEqual(molFileExpected);
  });

  test('MDL Molfile v2000: Correct padding for M ALS 2/2 - check padding', async ({
    page,
  }) => {
    /**
     * Test case: EPMLSOPKET-8914(2)
     * Description: Files opens.
     * Alias is located on the atom to which we assigned it
     * */

    await openFileAndAddToCanvas('Molfiles-V2000/molfile-with-als.mol', page);
    const expectedFile = await getMolfile(page, 'v2000');
    const isCorrectPadding = expectedFile.includes('N   ');

    expect(isCorrectPadding).toEqual(true);
  });
});
