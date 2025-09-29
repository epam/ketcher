/* eslint-disable max-len */
/* eslint-disable no-magic-numbers */
import { test } from '@fixtures';
import { Page } from '@playwright/test';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { RNASection } from '@tests/pages/constants/library/Constants';
import { Base } from '@tests/pages/constants/monomers/Bases';
import { Nucleotide } from '@tests/pages/constants/monomers/Nucleotides';
import { Peptide } from '@tests/pages/constants/monomers/Peptides';
import { Library } from '@tests/pages/macromolecules/Library';
import { MacromoleculesTopToolbar } from '@tests/pages/macromolecules/MacromoleculesTopToolbar';
import {
  clickOnCanvas,
  openFileAndAddToCanvasAsNewProject,
  takeEditorScreenshot,
  takeElementScreenshot,
  takeMonomerLibraryScreenshot,
} from '@utils';

let page: Page;

test.describe('Color of Nucleobases', () => {
  test.beforeAll(async ({ initFlexCanvas }) => {
    page = await initFlexCanvas();
  });
  test.afterEach(async () => {
    await CommonTopLeftToolbar(page).clearCanvas();
  });
  test.afterAll(async ({ closePage }) => {
    await closePage();
  });

  const baseCases = [
    {
      base: Base.A,
      name: 'Adenine and bases with analogue A',
      color: '#5ADC11',
    },
    {
      base: Base.C,
      name: 'Cytosine and bases with analogue C',
      color: '#59D0FF',
    },
    {
      base: Base.G,
      name: 'Guanine and bases with analogue G',
      color: '#FFE97B',
    },
    {
      base: Base.T,
      name: 'Thymine and bases with analogue T',
      color: '#FF8D8D',
    },
    {
      base: Base.U,
      name: 'Uracil and bases with analogue U',
      color: '#FF973C',
    },
    {
      base: Base.cl6pur,
      name: 'cl6pur and bases with analogue X',
      color: '#CAD3DD',
    },
  ];

  for (const { base, name, color } of baseCases) {
    test(`Case 1: Check that ${name} have their colour changed to ${color} (see mockups)`, async () => {
      /*
       * Test case: https://github.com/epam/ketcher/issues/7221
       * Description: Check that colour changed to appropriate (see mockups)
       * Scenario:
       * 1. Go to Macro mode
       * 2. Open RNA->Bases
       * 3. Check color
       */
      await Library(page).openRNASection(RNASection.Bases);
      await Library(page).selectMonomer(base);
      await takeMonomerLibraryScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
    });
  }

  const nucleotideCases = [
    {
      nucleotide: Nucleotide._2_damdA,
      name: 'All nucleotides with the natural analogue A',
      color: '#5ADC11',
    },
    {
      nucleotide: Nucleotide._5hMedC,
      name: 'All nucleotides with the natural analogue C',
      color: '#59D0FF',
    },
    {
      nucleotide: Nucleotide.Super_G,
      name: 'All nucleotides with the natural analogue G',
      color: '#FFE97B',
    },
    {
      nucleotide: Nucleotide.Super_T,
      name: 'All nucleotides with the natural analogue T',
      color: '#FF8D8D',
    },
    {
      nucleotide: Nucleotide._5Br_dU,
      name: 'All nucleotides with the natural analogue U',
      color: '#FF973C',
    },
    {
      nucleotide: Nucleotide._5NitInd,
      name: 'All nucleotides with the natural analogue X',
      color: '#CAD3DD',
    },
  ];

  for (const { nucleotide, name, color } of nucleotideCases) {
    test(`Case 2: Check that ${name} have their colour changed to ${color} (see mockups)`, async () => {
      /*
       * Test case: https://github.com/epam/ketcher/issues/7221
       * Description: Check that colour changed to appropriate (see mockups)
       * Scenario:
       * 1. Go to Macro mode
       * 2. Open RNA->Nucleotides
       * 3. Check color
       */
      await Library(page).openRNASection(RNASection.Nucleotides);
      await Library(page).selectMonomer(nucleotide);
      await takeMonomerLibraryScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
    });
  }

  test('Case 3: Check that all amino acids with the natural analogue X, have their shade of gray changed to #CAD3DD ( Grey 4 ) (see mockups)', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7221
     * Description: Check that colour changed to appropriate (see mockups)
     * Scenario:
     * 1. Go to Macro mode
     * 2. Open RNA->Peptides
     * 3. Check color of section X
     */
    await Library(page).switchToPeptidesTab();
    await Library(page).selectMonomer(Peptide._Am);
    await takeMonomerLibraryScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  const baseCases2 = [
    {
      base: Base.A,
      name: 'Adenine and bases with analogue A',
      color: '#5ADC11',
    },
    {
      base: Base.C,
      name: 'Cytosine and bases with analogue C',
      color: '#59D0FF',
    },
    {
      base: Base.G,
      name: 'Guanine and bases with analogue G',
      color: '#FFE97B',
    },
    {
      base: Base.T,
      name: 'Thymine and bases with analogue T',
      color: '#FF8D8D',
    },
    {
      base: Base.U,
      name: 'Uracil and bases with analogue U',
      color: '#FF973C',
    },
    {
      base: Base.cl6pur,
      name: 'cl6pur and bases with analogue X',
      color: '#CAD3DD',
    },
  ];

  for (const { base, name, color } of baseCases2) {
    test(`Case 4: Verify that ${name} change the shape on canvas and color to ${color} (see mockups)`, async () => {
      /*
       * Test case: https://github.com/epam/ketcher/issues/7221
       * Description: Verify change of the colour and the shape on canvas and all bases with the natural analogue.
       * Scenario:
       * 1. Go to Macro mode
       * 2. Open RNA->Bases
       * 3. Add to canvas any base from section
       * 4. Check color and shape on canvas
       */
      await Library(page).openRNASection(RNASection.Bases);
      await Library(page).clickMonomerAutochain(base);
      await clickOnCanvas(page, 500, 400, { from: 'pageTopLeft' });
      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
    });
  }

  const nucleotideCases2 = [
    {
      nucleotide: Nucleotide._2_damdA,
      name: 'All nucleotides with the natural analogue A',
      color: '#5ADC11',
    },
    {
      nucleotide: Nucleotide._5hMedC,
      name: 'All nucleotides with the natural analogue C',
      color: '#59D0FF',
    },
    {
      nucleotide: Nucleotide.Super_G,
      name: 'All nucleotides with the natural analogue G',
      color: '#FFE97B',
    },
    {
      nucleotide: Nucleotide.Super_T,
      name: 'All nucleotides with the natural analogue T',
      color: '#FF8D8D',
    },
    {
      nucleotide: Nucleotide._5Br_dU,
      name: 'All nucleotides with the natural analogue U',
      color: '#FF973C',
    },
    {
      nucleotide: Nucleotide._5NitInd,
      name: 'All nucleotides with the natural analogue X',
      color: '#CAD3DD',
    },
  ];

  for (const { nucleotide, name, color } of nucleotideCases2) {
    test(`Case 5: Verify that ${name} change the shape on canvas and color to ${color} (see mockups)`, async () => {
      /*
       * Test case: https://github.com/epam/ketcher/issues/7221
       * Description: Check that colour changed to appropriate (see mockups)
       * Scenario:
       * 1. Go to Macro mode
       * 2. Open RNA->Nucleotides
       * 3. Add to canvas any nucleotide from section
       * 4. Check color and shape on canvas
       */
      await Library(page).openRNASection(RNASection.Nucleotides);
      await Library(page).clickMonomerAutochain(nucleotide);
      await clickOnCanvas(page, 500, 400, { from: 'pageTopLeft' });
      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
    });
  }

  test('Case 6: Verify change of the colour and the shape on canvas for all amino acids with the natural analogue X', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/7221
     * Description: Check that colour changed to appropriate (see mockups)
     * Scenario:
     * 1. Go to Macro mode
     * 2. Open RNA->Peptides
     * 3. Add to canvas any amino acid with the natural analogue X
     * 4. Check color and shape on canvas
     */
    await Library(page).switchToPeptidesTab();
    await Library(page).clickMonomerAutochain(Peptide._Am);
    await clickOnCanvas(page, 500, 400, { from: 'pageTopLeft' });
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 7: Check that change of the underline colour for the counter in the Calculate Properties window for bases and nucleotides (A, C, G, T, U, X)', async () => {
    /*
     * Test cases: https://github.com/epam/ketcher/issues/7221
     * Description:
     *  - Case 1: Underline colour changed for the counter in the Calculate Properties window for Adenine, Cytosine, Guanine, Thymine, Uracil, cl6pur and all bases with the natural analogue A, C, G, T, U, X
     *  - Case 2: Underline colour changed for the counter in the Calculate Properties window for all nucleotides with the natural analogue A, C, G, T, U, X
     * Scenario:
     * 1. Go to Macro mode
     * 2. Open file with all bases/nucleotides with the natural analogue A, C, G, T, U, X
     * 3. Open Calculate Properties window
     * 4. Check color of the underline for the counter in the Calculate Properties window
     */

    const suites = [
      {
        file: 'KET/ACGTUX-bases.ket',
        options: [
          'A-option',
          'C-option',
          'G-option',
          'T-option',
          'U-option',
          'Other-option',
        ],
      },
      {
        file: 'KET/ACGTUX-nucleotides.ket',
        options: [
          'A-option',
          'C-option',
          'G-option',
          'T-option',
          'U-option',
          'Other-option',
        ],
      },
    ];
    for (const { file, options } of suites) {
      await openFileAndAddToCanvasAsNewProject(page, file);
      await MacromoleculesTopToolbar(page).calculateProperties();
      for (const option of options) {
        await takeElementScreenshot(page, page.getByTestId(option));
      }
      await MacromoleculesTopToolbar(page).calculateProperties();
    }
  });
});
