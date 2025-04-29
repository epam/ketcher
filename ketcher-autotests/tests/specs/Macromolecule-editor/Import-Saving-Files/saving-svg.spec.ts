import { Page, test } from '@playwright/test';
import {
  openFileAndAddToCanvasMacro,
  takeEditorScreenshot,
  waitForPageInit,
  selectRectangleArea,
  selectSnakeLayoutModeTool,
  selectSequenceLayoutModeTool,
  switchSequenceEnteringButtonType,
  SequenceType,
  pressButton,
} from '@utils';
import {
  selectClearCanvasTool,
  selectSaveTool,
} from '@tests/pages/common/TopLeftToolbar';
import { turnOnMacromoleculesEditor } from '@tests/pages/common/TopRightToolbar';
import {
  markResetToDefaultState,
  processResetToDefaultState,
} from '@utils/testAnnotations/resetToDefaultState';
import { chooseFileFormat } from '@tests/pages/common/SaveStructureDialog';
import { MacromoleculesFileFormatType } from '@tests/pages/constants/fileFormats/macroFileFormats';

let page: Page;

test.beforeAll(async ({ browser }) => {
  const context = await browser.newContext();
  page = await context.newPage();
  await waitForPageInit(page);
  await turnOnMacromoleculesEditor(page);
});

test.afterEach(async ({ context: _ }, testInfo) => {
  await selectClearCanvasTool(page);
  await processResetToDefaultState(testInfo, page);
});

test.afterAll(async ({ browser }) => {
  await Promise.all(browser.contexts().map((context) => context.close()));
});

test.describe('Saving in .svg files', () => {
  test('Should convert .ket file to .svg format in save modal', async () => {
    await openFileAndAddToCanvasMacro('KET/rna-and-peptide.ket', page);
    // Coordinates for rectangle selection
    const startX = 100;
    const startY = 100;
    const endX = 600;
    const endY = 450;
    await selectRectangleArea(page, startX, startY, endX, endY);
    await takeEditorScreenshot(page);
    await selectSaveTool(page);
    await chooseFileFormat(page, MacromoleculesFileFormatType.SVGDocument);
    // Should clean up dynamic svg elements (selections...) in drawn structure
    await takeEditorScreenshot(page);
  });

  const testData = [
    {
      filename: 'KET/all-kind-of-monomers.ket',
      description: 'all kind of monomers',
    },
    { filename: 'KET/all-chems.ket', description: 'all chems' },
    {
      filename: 'KET/all-types-of-connection-between-Base-and-RNA.ket',
      description: 'all types of connection between Base and RNA',
    },
    {
      filename: 'KET/all-types-of-connection-between-CHEM-and-RNA.ket',
      description: 'all types of connection between CHEM and RNA',
    },
    {
      filename: 'KET/all-types-of-connection-between-Phosphate-and-RNA.ket',
      description: 'all types of connection between Phosphate and RNA',
    },
    {
      filename: 'KET/all-types-of-connection-between-Sugar-and-RNA.ket',
      description: 'all types of connection between Sugar and RNA',
    },
    {
      filename: 'KET/all-types-of-possible-modifications.ket',
      description: 'all types of possible modifications',
    },
    {
      // Test task: https://github.com/epam/ketcher/issues/5558
      filename:
        'KET/Ambiguous-monomers/Ambiguous (common) Bases (alternatives).ket',
      description: '1. Ambiguous (common) Bases (alternatives)',
    },
    {
      // Test task: https://github.com/epam/ketcher/issues/5558
      filename: 'KET/Ambiguous-monomers/Ambiguous (common) Bases (mixed).ket',
      description: '2. Ambiguous (common) Bases (mixed)',
    },
    {
      // Test task: https://github.com/epam/ketcher/issues/5558
      filename: 'KET/Ambiguous-monomers/Ambiguous DNA Bases (alternatives).ket',
      description: '3. Ambiguous DNA Bases (alternatives)',
    },
    {
      // Test task: https://github.com/epam/ketcher/issues/5558
      filename: 'KET/Ambiguous-monomers/Ambiguous DNA Bases (mixed).ket',
      description: '4. Ambiguous DNA Bases (alternatives)',
    },
    {
      // Test task: https://github.com/epam/ketcher/issues/5558
      filename: 'KET/Ambiguous-monomers/Ambiguous RNA Bases (alternatives).ket',
      description: '5. Ambiguous RNA Bases (alternatives)',
    },
    {
      // Test task: https://github.com/epam/ketcher/issues/5558
      filename: 'KET/Ambiguous-monomers/Ambiguous RNA Bases (mixed).ket',
      description: '6. Ambiguous RNA Bases (mixed)',
    },
    {
      // Test task: https://github.com/epam/ketcher/issues/5558
      filename:
        'KET/Ambiguous-monomers/Peptides (that have mapping to library, alternatives).ket',
      description: '7. Peptides (that have mapping to library, alternatives)',
    },
    {
      // Test task: https://github.com/epam/ketcher/issues/5558
      filename:
        'KET/Ambiguous-monomers/Peptides (that have mapping to library, mixed).ket',
      description: '8. Peptides (that have mapping to library, mixed)',
    },
    {
      // Test task: https://github.com/epam/ketcher/issues/5558
      filename:
        'KET/Ambiguous-monomers/Peptides (that have no mapping to library, alternatives).ket',
      description:
        '9. Peptides (that have no mapping to library, alternatives)',
    },
    {
      // Test task: https://github.com/epam/ketcher/issues/5558
      filename:
        'KET/Ambiguous-monomers/Peptides (that have no mapping to library, mixed).ket',
      description: '10. Peptides (that have no mapping to library, mixed)',
    },
    {
      // Test task: https://github.com/epam/ketcher/issues/5558
      filename:
        'KET/Ambiguous-monomers/RNA ambigous bases connected to DNA sugar (mixed).ket',
      description: '11. RNA ambigous bases connected to DNA sugar (mixed)',
    },
    {
      // Test task: https://github.com/epam/ketcher/issues/5558
      filename:
        'KET/Ambiguous-monomers/DNA ambigous bases connected to RNA sugar (mixed).ket',
      description: '12. DNA ambigous bases connected to RNA sugar (mixed)',
    },
  ];

  for (const { filename, description } of testData) {
    test(`Export to SVG: Verify it is possible to export Flex mode canvas with ${description} to SVG`, async () => {
      /*
      Description: Verify import of Sequence files works correct
      Case: 1. Load monomers from KET
            2. Take screenshot to make sure import KET loaded correct
            3. Open Save dialog and choose SVG format
            2. Take screenshot to make sure export works correct
      */

      await openFileAndAddToCanvasMacro(filename, page);

      await takeEditorScreenshot(page);

      await selectSaveTool(page);
      await chooseFileFormat(page, MacromoleculesFileFormatType.SVGDocument);

      await takeEditorScreenshot(page, {
        hideMacromoleculeEditorScrollBars: true,
      });

      await pressButton(page, 'Cancel');
    });
  }

  const testData1 = [
    {
      filename: 'KET/all-kind-of-monomers.ket',
      description: 'all kind of monomers',
    },
    { filename: 'KET/all-chems.ket', description: 'all chems' },
    {
      filename: 'KET/all-types-of-connection-between-Base-and-RNA.ket',
      description: 'all types of connection between Base and RNA',
    },
    {
      filename: 'KET/all-types-of-connection-between-CHEM-and-RNA.ket',
      description: 'all types of connection between CHEM and RNA',
    },
    {
      filename: 'KET/all-types-of-connection-between-Phosphate-and-RNA.ket',
      description: 'all types of connection between Phosphate and RNA',
    },
    {
      filename: 'KET/all-types-of-connection-between-Sugar-and-RNA.ket',
      description: 'all types of connection between Sugar and RNA',
    },
    {
      filename: 'KET/all-types-of-possible-modifications.ket',
      description: 'all types of possible modifications',
    },
  ];

  for (const { filename, description } of testData1) {
    test(`Export to SVG: Verify it is possible to export Snake mode canvas with ${description} to SVG`, async () => {
      await openFileAndAddToCanvasMacro(filename, page);
      await selectSnakeLayoutModeTool(page);
      await takeEditorScreenshot(page);
      await selectSaveTool(page);
      await chooseFileFormat(page, MacromoleculesFileFormatType.SVGDocument);
      await takeEditorScreenshot(page);
    });
  }

  const testData2 = [
    {
      filename: 'KET/all-kind-of-monomers.ket',
      description: 'all kind of monomers',
    },
    { filename: 'KET/all-chems.ket', description: 'all chems' },
    {
      filename: 'KET/all-types-of-connection-between-Base-and-RNA.ket',
      description: 'all types of connection between Base and RNA',
    },
    {
      filename: 'KET/all-types-of-connection-between-CHEM-and-RNA.ket',
      description: 'all types of connection between CHEM and RNA',
    },
    {
      filename: 'KET/all-types-of-connection-between-Phosphate-and-RNA.ket',
      description: 'all types of connection between Phosphate and RNA',
    },
    {
      filename: 'KET/all-types-of-connection-between-Sugar-and-RNA.ket',
      description: 'all types of connection between Sugar and RNA',
    },
    {
      filename: 'KET/all-types-of-possible-modifications.ket',
      description: 'all types of possible modifications',
    },
  ];

  for (const { filename, description } of testData2) {
    test(`Export to SVG: Verify it is possible to export Sequence-RNA mode canvas with ${description} to SVG`, async () => {
      await openFileAndAddToCanvasMacro(filename, page);
      await selectSequenceLayoutModeTool(page);
      await switchSequenceEnteringButtonType(page, SequenceType.RNA);
      await takeEditorScreenshot(page);
      await selectSaveTool(page);
      await chooseFileFormat(page, MacromoleculesFileFormatType.SVGDocument);
      await takeEditorScreenshot(page, {
        hideMacromoleculeEditorScrollBars: true,
      });
    });
  }

  const testData3 = [
    {
      filename: 'KET/all-kind-of-monomers.ket',
      description: 'all kind of monomers',
    },
    {
      filename: 'KET/all-chems.ket',
      description: 'all chems',
    },
    {
      filename: 'KET/all-types-of-connection-between-Base-and-RNA.ket',
      description: 'all types of connection between Base and RNA',
    },
    {
      filename: 'KET/all-types-of-connection-between-CHEM-and-RNA.ket',
      description: 'all types of connection between CHEM and RNA',
    },
    {
      filename: 'KET/all-types-of-connection-between-Phosphate-and-RNA.ket',
      description: 'all types of connection between Phosphate and RNA',
    },
    {
      filename: 'KET/all-types-of-connection-between-Sugar-and-RNA.ket',
      description: 'all types of connection between Sugar and RNA',
    },
    {
      filename: 'KET/all-types-of-possible-modifications.ket',
      description: 'all types of possible modifications',
    },
  ];

  for (const { filename, description } of testData3) {
    test(`Export to SVG: Verify it is possible to export Sequence-DNA mode canvas with ${description} to SVG`, async () => {
      await openFileAndAddToCanvasMacro(filename, page);
      await selectSequenceLayoutModeTool(page);
      await switchSequenceEnteringButtonType(page, SequenceType.DNA);
      await takeEditorScreenshot(page);
      await selectSaveTool(page);
      await chooseFileFormat(page, MacromoleculesFileFormatType.SVGDocument);
      await takeEditorScreenshot(page, {
        hideMacromoleculeEditorScrollBars: true,
      });
    });
  }

  const testData4 = [
    {
      filename: 'KET/all-kind-of-monomers.ket',
      description: 'all kind of monomers',
    },
    { filename: 'KET/all-chems.ket', description: 'all chems' },
    {
      filename: 'KET/all-types-of-connection-between-Base-and-RNA.ket',
      description: 'all types of connection between Base and RNA',
    },
    {
      filename: 'KET/all-types-of-connection-between-CHEM-and-RNA.ket',
      description: 'all types of connection between CHEM and RNA',
    },
    {
      filename: 'KET/all-types-of-connection-between-Phosphate-and-RNA.ket',
      description: 'all types of connection between Phosphate and RNA',
    },
    {
      filename: 'KET/all-types-of-connection-between-Sugar-and-RNA.ket',
      description: 'all types of connection between Sugar and RNA',
    },
    {
      filename: 'KET/all-types-of-possible-modifications.ket',
      description: 'all types of possible modifications',
    },
  ];

  for (const { filename, description } of testData4) {
    test(`Export to SVG: Verify it is possible to export Sequence-Peptide mode canvas with ${description} to SVG`, async () => {
      markResetToDefaultState('defaultLayout');

      await openFileAndAddToCanvasMacro(filename, page);
      await selectSequenceLayoutModeTool(page);
      await switchSequenceEnteringButtonType(page, SequenceType.PEPTIDE);
      await takeEditorScreenshot(page);
      await selectSaveTool(page);
      await chooseFileFormat(page, MacromoleculesFileFormatType.SVGDocument);
      await takeEditorScreenshot(page, {
        hideMacromoleculeEditorScrollBars: true,
      });
    });
  }

  const testData5 = [
    {
      filename: 'KET/unsplit-nucleotides-connected-with-nucleotides.ket',
      description: 'unsplit-nucleotides-connected-with-nucleotides',
    },
    {
      filename: 'KET/unsplit-nucleotides-connected-with-chems.ket',
      description: 'connection nucleotides with chems',
    },
    {
      filename: 'KET/unsplit-nucleotides-connected-with-bases.ket',
      description: 'unsplit-nucleotides-connected-with-bases',
    },
    {
      filename: 'KET/unsplit-nucleotides-connected-with-sugars.ket',
      description: 'unsplit-nucleotides-connected-with-sugars',
    },
    {
      filename: 'KET/unsplit-nucleotides-connected-with-phosphates.ket',
      description: 'unsplit-nucleotides-connected-with-phosphates',
    },
    {
      filename: 'KET/unsplit-nucleotides-connected-with-peptides.ket',
      description: 'unsplit-nucleotides-connected-with-peptides',
    },
  ];

  for (const { filename, description } of testData5) {
    test(`Export to SVG: Verify it is possible to export ${description} to SVG`, async () => {
      await openFileAndAddToCanvasMacro(filename, page);
      await takeEditorScreenshot(page);
      await selectSaveTool(page);
      await chooseFileFormat(page, MacromoleculesFileFormatType.SVGDocument);
      await takeEditorScreenshot(page, {
        hideMacromoleculeEditorScrollBars: true,
      });
    });
  }
});
