import { test } from '@playwright/test';
import {
  TopPanelButton,
  openFileAndAddToCanvasMacro,
  selectTopPanelButton,
  takeEditorScreenshot,
  waitForPageInit,
  chooseFileFormat,
  selectRectangleArea,
  selectSnakeLayoutModeTool,
  selectSequenceLayoutModeTool,
  switchSequenceEnteringType,
  SequenceType,
} from '@utils';
import { turnOnMacromoleculesEditor } from '@utils/macromolecules';

test.describe('Saving in .svg files', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
  });

  test('Should convert .ket file to .svg format in save modal', async ({
    page,
  }) => {
    await openFileAndAddToCanvasMacro('KET/rna-and-peptide.ket', page);
    // Coordinates for rectangle selection
    const startX = 100;
    const startY = 100;
    const endX = 600;
    const endY = 450;
    await selectRectangleArea(page, startX, startY, endX, endY);
    await takeEditorScreenshot(page);
    await selectTopPanelButton(TopPanelButton.Save, page);
    await chooseFileFormat(page, 'SVG Document');
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
  ];

  for (const { filename, description } of testData) {
    test(`Export to SVG: Verify it is possible to export Flex mode canvas with ${description} to SVG`, async ({
      page,
    }) => {
      await openFileAndAddToCanvasMacro(filename, page);
      await takeEditorScreenshot(page);
      await selectTopPanelButton(TopPanelButton.Save, page);
      await chooseFileFormat(page, 'SVG Document');
      await takeEditorScreenshot(page);
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
    test(`Export to SVG: Verify it is possible to export Snake mode canvas with ${description} to SVG`, async ({
      page,
    }) => {
      await openFileAndAddToCanvasMacro(filename, page);
      await selectSnakeLayoutModeTool(page);
      await takeEditorScreenshot(page);
      await selectTopPanelButton(TopPanelButton.Save, page);
      await chooseFileFormat(page, 'SVG Document');
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
    test(`Export to SVG: Verify it is possible to export Sequence-RNA mode canvas with ${description} to SVG`, async ({
      page,
    }) => {
      await openFileAndAddToCanvasMacro(filename, page);
      await selectSequenceLayoutModeTool(page);
      await switchSequenceEnteringType(page, SequenceType.RNA);
      await takeEditorScreenshot(page);
      await selectTopPanelButton(TopPanelButton.Save, page);
      await chooseFileFormat(page, 'SVG Document');
      await takeEditorScreenshot(page);
    });
  }

  const testData3 = [
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

  for (const { filename, description } of testData3) {
    test(`Export to SVG: Verify it is possible to export Sequence-DNA mode canvas with ${description} to SVG`, async ({
      page,
    }) => {
      await openFileAndAddToCanvasMacro(filename, page);
      await selectSequenceLayoutModeTool(page);
      await switchSequenceEnteringType(page, SequenceType.DNA);
      await takeEditorScreenshot(page);
      await selectTopPanelButton(TopPanelButton.Save, page);
      await chooseFileFormat(page, 'SVG Document');
      await takeEditorScreenshot(page);
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
    test(`Export to SVG: Verify it is possible to export Sequence-Peptide mode canvas with ${description} to SVG`, async ({
      page,
    }) => {
      await openFileAndAddToCanvasMacro(filename, page);
      await selectSequenceLayoutModeTool(page);
      await switchSequenceEnteringType(page, SequenceType.PEPTIDE);
      await takeEditorScreenshot(page);
      await selectTopPanelButton(TopPanelButton.Save, page);
      await chooseFileFormat(page, 'SVG Document');
      await takeEditorScreenshot(page);
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
    test(`Export to SVG: Verify it is possible to export ${description} to SVG`, async ({
      page,
    }) => {
      await openFileAndAddToCanvasMacro(filename, page);
      await takeEditorScreenshot(page);
      await selectTopPanelButton(TopPanelButton.Save, page);
      await chooseFileFormat(page, 'SVG Document');
      await takeEditorScreenshot(page);
    });
  }
});
