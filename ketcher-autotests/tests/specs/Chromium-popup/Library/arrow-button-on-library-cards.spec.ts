/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable no-magic-numbers */
import { test } from '@fixtures';
import { Bases } from '@constants/monomers/Bases';
import { Peptides } from '@constants/monomers/Peptides';
import { Sugars } from '@constants/monomers/Sugars';
import { Page } from '@playwright/test';
import {
  selectAllStructuresOnCanvas,
  takeEditorScreenshot,
  takeMonomerLibraryScreenshot,
  takePresetsScreenshot,
} from '@utils';
import { Phosphates } from '@constants/monomers/Phosphates';
import { Library } from '@tests/pages/macromolecules/Library';
import { RNASection } from '@tests/pages/constants/library/Constants';
import { Presets } from '@constants/monomers/Presets';
import { Nucleotides } from '@constants/monomers/Nucleotides';
import { Chem } from '@constants/monomers/Chem';

let page: Page;

test.describe('Arrow button on Library cards', () => {
  test.beforeAll(async ({ initFlexCanvas }) => {
    page = await initFlexCanvas();
  });
  test.afterAll(async ({ closePage }) => {
    await closePage();
  });

  test(
    'Case 1: Verify that the star (☆) placed in the middle, and the three dots menu (⋮) stay on the right if it exists for Presets, Peptides, Sugars, Bases, Phosphates, Nucleotides and CHEMs in Library',
    { tag: ['@chromium-popup'] },
    async () => {
      /*
       * Version 3.7
       * Test case: https://github.com/epam/ketcher/issues/7631
       * Description: The star (☆) placed in the middle, and the three dots menu (⋮) stay on the right if it exists for
       * Presets, Peptides, Sugars, Bases, Phosphates, Nucleotides and CHEMs in Library.
       * Scenario:
       * 1. Go to Macro - Flex mode
       * 2. Open Library
       * 3. Check that the star (☆) placed in the middle, and the three dots menu (⋮) stay on the right if it exists for
       * Presets, Peptides, Sugars, Bases, Phosphates, Nucleotides and CHEMs in Library
       */
      await Library(page).hoverMonomer(Presets.A);
      await takePresetsScreenshot(page);
      await Library(page).switchToPeptidesTab();
      await Library(page).hoverMonomer(Peptides.A);
      await takeMonomerLibraryScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
      await Library(page).switchToRNATab();
      const rnaTests = [
        [RNASection.Sugars, Sugars.R],
        [RNASection.Bases, Bases.A],
        [RNASection.Phosphates, Phosphates.P],
        [RNASection.Nucleotides, Nucleotides.AmMC6T],
      ] as const;

      for (const [section, monomer] of rnaTests) {
        await Library(page).openRNASection(section);
        await Library(page).hoverMonomer(monomer);
        await takeMonomerLibraryScreenshot(page, {
          hideMonomerPreview: true,
          hideMacromoleculeEditorScrollBars: true,
        });
      }
      await Library(page).switchToCHEMTab();
      await Library(page).hoverMonomer(Chem.A6OH);
      await takeMonomerLibraryScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
    },
  );

  test(
    'Case 2: Verify that a new symbol, an arrow (⇐), added to the left side of the card, and appear only on hover of the card in Flex mode for Presets, Peptides, Sugars, Bases, Phosphates, Nucleotides and CHEMs in Library',
    { tag: ['@chromium-popup'] },
    async () => {
      /*
       * Version 3.7
       * Test case: https://github.com/epam/ketcher/issues/7631
       * Description: A new symbol, an arrow (⇐), added to the left side of the card, and appear only on hover of the card in Flex mode for
       * Presets, Peptides, Sugars, Bases, Phosphates, Nucleotides and CHEMs in Library.
       * Scenario:
       * 1. Go to Macro - Flex mode
       * 2. Open Library
       * 3. Check that a new symbol, an arrow (⇐), added to the left side of the card, and appear only on hover of the card in Flex mode for
       * Presets, Peptides, Sugars, Bases, Phosphates, Nucleotides and CHEMs in Library
       */
      await Library(page).hoverMonomer(Presets.G);
      await takePresetsScreenshot(page);
      await Library(page).switchToPeptidesTab();
      await Library(page).hoverMonomer(Peptides.Ala_al);
      await takeMonomerLibraryScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
      await Library(page).switchToRNATab();
      const rnaTests = [
        [RNASection.Sugars, Sugars._12ddR],
        [RNASection.Bases, Bases.DNA_B],
        [RNASection.Phosphates, Phosphates.Test_6_Ph],
        [RNASection.Nucleotides, Nucleotides._2_damdA],
      ] as const;

      for (const [section, monomer] of rnaTests) {
        await Library(page).openRNASection(section);
        await Library(page).hoverMonomer(monomer);
        await takeMonomerLibraryScreenshot(page, {
          hideMonomerPreview: true,
          hideMacromoleculeEditorScrollBars: true,
        });
      }
      await Library(page).switchToCHEMTab();
      await Library(page).hoverMonomer(Chem.DOTA);
      await takeMonomerLibraryScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
    },
  );

  test(
    'Case 3: Verify that a new symbol, an arrow (⇐), added to the left side of the card, and appear only on hover of the card in Snake mode for Presets, Peptides, Sugars, Bases, Phosphates, Nucleotides and CHEMs in Library',
    { tag: ['@chromium-popup'] },
    async ({ SnakeCanvas: _ }) => {
      /*
       * Version 3.7
       * Test case: https://github.com/epam/ketcher/issues/7631
       * Description: A new symbol, an arrow (⇐), added to the left side of the card, and appear only on hover of the card in Snake mode for
       * Presets, Peptides, Sugars, Bases, Phosphates, Nucleotides and CHEMs in Library.
       * Scenario:
       * 1. Go to Macro - Flex mode
       * 2. Open Library
       * 3. Check that a new symbol, an arrow (⇐), added to the left side of the card, and appear only on hover of the card in Snake mode for
       * Presets, Peptides, Sugars, Bases, Phosphates, Nucleotides and CHEMs in Library
       */
      await Library(page).hoverMonomer(Presets.MOE_A_P);
      await takePresetsScreenshot(page);
      await Library(page).switchToPeptidesTab();
      await Library(page).hoverMonomer(Peptides._1Nal);
      await takeMonomerLibraryScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
      await Library(page).switchToRNATab();
      const rnaTests = [
        [RNASection.Sugars, Sugars._25R],
        [RNASection.Bases, Bases.baA],
        [RNASection.Phosphates, Phosphates.bP],
        [RNASection.Nucleotides, Nucleotides.Super_G],
      ] as const;

      for (const [section, monomer] of rnaTests) {
        await Library(page).openRNASection(section);
        await Library(page).hoverMonomer(monomer);
        await takeMonomerLibraryScreenshot(page, {
          hideMonomerPreview: true,
          hideMacromoleculeEditorScrollBars: true,
        });
      }
      await Library(page).switchToCHEMTab();
      await Library(page).hoverMonomer(Chem._4FB);
      await takeMonomerLibraryScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
    },
  );

  test(
    'Case 4: Verify that the arrow symbol change appearance when it is being hovered for Presets, Peptides, Sugars, Bases, Phosphates, Nucleotides and CHEMs in Library',
    { tag: ['@chromium-popup'] },
    async () => {
      /*
       * Version 3.7
       * Test case: https://github.com/epam/ketcher/issues/7631
       * Description: The arrow symbol change appearance when it is being hovered for Presets, Peptides, Sugars, Bases, Phosphates, Nucleotides and CHEMs in Library.
       * Scenario:
       * 1. Go to Macro - Flex mode
       * 2. Open Library
       * 3. Check that the arrow symbol change appearance when it is being hovered for
       * Presets, Peptides, Sugars, Bases, Phosphates, Nucleotides and CHEMs in Library
       */
      await Library(page).hoverMonomerAutochain(Presets.MOE_A_P);
      await takePresetsScreenshot(page);
      await Library(page).switchToPeptidesTab();
      await Library(page).hoverMonomerAutochain(Peptides._1Nal);
      await takeMonomerLibraryScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
      await Library(page).switchToRNATab();
      const rnaTests = [
        [RNASection.Sugars, Sugars._25R],
        [RNASection.Bases, Bases.baA],
        [RNASection.Phosphates, Phosphates.bP],
        [RNASection.Nucleotides, Nucleotides.Super_G],
      ] as const;

      for (const [section, monomer] of rnaTests) {
        await Library(page).openRNASection(section);
        await Library(page).hoverMonomerAutochain(monomer);
        await takeMonomerLibraryScreenshot(page, {
          hideMonomerPreview: true,
          hideMacromoleculeEditorScrollBars: true,
        });
      }
      await Library(page).switchToCHEMTab();
      await Library(page).hoverMonomerAutochain(Chem._4FB);
      await takeMonomerLibraryScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
    },
  );

  test(
    'Case 5: Check that when click on arrow symbol monomer appears on canvas for Presets, Peptides, Sugars, Bases, Phosphates, Nucleotides and CHEMs in Library (Flex mode)',
    { tag: ['@chromium-popup'] },
    async () => {
      /*
       * Version 3.7
       * Test case: https://github.com/epam/ketcher/issues/7631
       * Description: When click on arrow symbol monomer appears on canvas for Presets, Peptides, Sugars, Bases, Phosphates, Nucleotides and CHEMs in Library (Flex mode).
       * Scenario:
       * 1. Go to Macro - Flex mode
       * 2. Open Library
       * 3. Check that when click on arrow symbol monomer appears on canvas for
       * Presets, Peptides, Sugars, Bases, Phosphates, Nucleotides and CHEMs in Library
       */
      await Library(page).clickMonomerAutochain(Presets.MOE_A_P);
      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
      await Library(page).switchToPeptidesTab();
      await Library(page).clickMonomerAutochain(Peptides._1Nal);
      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
      await Library(page).switchToRNATab();
      const rnaTests = [
        [RNASection.Sugars, Sugars._25R],
        [RNASection.Bases, Bases.baA],
        [RNASection.Phosphates, Phosphates.bP],
        [RNASection.Nucleotides, Nucleotides.Super_G],
      ] as const;

      for (const [section, monomer] of rnaTests) {
        await Library(page).openRNASection(section);
        await Library(page).clickMonomerAutochain(monomer);
        await takeEditorScreenshot(page, {
          hideMonomerPreview: true,
          hideMacromoleculeEditorScrollBars: true,
        });
      }
      await Library(page).switchToCHEMTab();
      await Library(page).clickMonomerAutochain(Chem._4FB);
      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
    },
  );

  test(
    'Case 6: Check that when click on arrow symbol monomer appears on canvas for Presets, Peptides, Sugars, Bases, Phosphates, Nucleotides and CHEMs in Library (Snake mode)',
    { tag: ['@chromium-popup'] },
    async ({ SnakeCanvas: _ }) => {
      /*
       * Version 3.7
       * Test case: https://github.com/epam/ketcher/issues/7631
       * Description: When click on arrow symbol monomer appears on canvas for Presets, Peptides, Sugars, Bases, Phosphates, Nucleotides and CHEMs in Library (Snake mode).
       * Scenario:
       * 1. Go to Macro - Snake mode
       * 2. Open Library
       * 3. Check that when click on arrow symbol monomer appears on canvas for
       * Presets, Peptides, Sugars, Bases, Phosphates, Nucleotides and CHEMs in Library
       */
      await Library(page).clickMonomerAutochain(Presets.MOE_A_P);
      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
      await Library(page).switchToPeptidesTab();
      await Library(page).clickMonomerAutochain(Peptides._1Nal);
      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
      await Library(page).switchToRNATab();
      const rnaTests = [
        [RNASection.Sugars, Sugars._25R],
        [RNASection.Bases, Bases.baA],
        [RNASection.Phosphates, Phosphates.bP],
        [RNASection.Nucleotides, Nucleotides.Super_G],
      ] as const;

      for (const [section, monomer] of rnaTests) {
        await Library(page).openRNASection(section);
        await Library(page).clickMonomerAutochain(monomer);
        await takeEditorScreenshot(page, {
          hideMonomerPreview: true,
          hideMacromoleculeEditorScrollBars: true,
        });
      }
      await Library(page).switchToCHEMTab();
      await Library(page).clickMonomerAutochain(Chem._4FB);
      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
    },
  );

  test(
    'Case 7: Check that if within a selection there is one and only one monomer with a free (unoccupied) R2, when hovering over the arrow for a monomer that has R1, a ghost/placeholder appear to the right of the monomer with R2 on canvas (Presets)',
    { tag: ['@chromium-popup'] },
    async () => {
      /*
       * Version 3.7
       * Test case: https://github.com/epam/ketcher/issues/7631
       * Description: If within a selection there is one and only one monomer with a free (unoccupied) R2,
       * when hovering over the arrow for a monomer that has R1, a ghost/placeholder appear to the right of the monomer with R2 on canvas (Presets).
       * Scenario:
       * 1. Go to Macro - Snake mode
       * 2. Open Library
       * 3. Check that if within a selection there is one and only one monomer with a free (unoccupied) R2,
       * when hovering over the arrow for a monomer that has R1, a ghost/placeholder appear to the right of the monomer with R2 on canvas (Presets)
       */
      await Library(page).clickMonomerAutochain(Presets.MOE_A_P);
      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
      await selectAllStructuresOnCanvas(page);
      await Library(page).hoverMonomerAutochain(Presets.MOE_5meC_P);
      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
    },
  );

  test(
    'Case 8: Check that if within a selection there is one and only one monomer with a free (unoccupied) R2, when hovering over the arrow for a monomer that has R1, a ghost/placeholder appear to the right of the monomer with R2 on canvas (Peptides)',
    { tag: ['@chromium-popup'] },
    async () => {
      /*
       * Version 3.7
       * Test case: https://github.com/epam/ketcher/issues/7631
       * Description: If within a selection there is one and only one monomer with a free (unoccupied) R2,
       * when hovering over the arrow for a monomer that has R1, a ghost/placeholder appear to the right of the monomer with R2 on canvas (Peptides).
       * Scenario:
       * 1. Go to Macro - Snake mode
       * 2. Open Library
       * 3. Check that if within a selection there is one and only one monomer with a free (unoccupied) R2,
       * when hovering over the arrow for a monomer that has R1, a ghost/placeholder appear to the right of the monomer with R2 on canvas (Peptides)
       */
      await Library(page).switchToPeptidesTab();
      await Library(page).clickMonomerAutochain(Peptides._2Nal);
      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
      await selectAllStructuresOnCanvas(page);
      await Library(page).hoverMonomerAutochain(Peptides.Cys_Bn);
      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
    },
  );

  test(
    'Case 9: Check that if within a selection there is one and only one monomer with a free (unoccupied) R2, when hovering over the arrow for a monomer that has R1, a ghost/placeholder appear to the right of the monomer with R2 on canvas (Sugars)',
    { tag: ['@chromium-popup'] },
    async () => {
      /*
       * Version 3.7
       * Test case: https://github.com/epam/ketcher/issues/7631
       * Description: If within a selection there is one and only one monomer with a free (unoccupied) R2,
       * when hovering over the arrow for a monomer that has R1, a ghost/placeholder appear to the right of the monomer with R2 on canvas (Sugars).
       * Scenario:
       * 1. Go to Macro - Snake mode
       * 2. Open Library
       * 3. Check that if within a selection there is one and only one monomer with a free (unoccupied) R2,
       * when hovering over the arrow for a monomer that has R1, a ghost/placeholder appear to the right of the monomer with R2 on canvas (Sugars)
       */
      await Library(page).switchToRNATab();
      await Library(page).clickMonomerAutochain(Sugars.UNA);
      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
      await selectAllStructuresOnCanvas(page);
      await Library(page).hoverMonomerAutochain(Sugars._25d3r);
      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
    },
  );

  test(
    'Case 10: Check that if within a selection there is one and only one monomer with a free (unoccupied) R2, when hovering over the arrow for a monomer that has R1, a ghost/placeholder appear to the right of the monomer with R2 on canvas (Bases)',
    { tag: ['@chromium-popup'] },
    async () => {
      /*
       * Version 3.7
       * Test case: https://github.com/epam/ketcher/issues/7631
       * Description: If within a selection there is one and only one monomer with a free (unoccupied) R2,
       * when hovering over the arrow for a monomer that has R1, a ghost/placeholder appear to the right of the monomer with R2 on canvas (Bases).
       * Scenario:
       * 1. Go to Macro - Snake mode
       * 2. Open Library
       * 3. Check that if within a selection there is one and only one monomer with a free (unoccupied) R2,
       * when hovering over the arrow for a monomer that has R1, a ghost/placeholder appear to the right of the monomer with R2 on canvas (Bases)
       */
      await Library(page).switchToRNATab();
      await Library(page).openRNASection(RNASection.Bases);
      await Library(page).clickMonomerAutochain(Bases.nC6n2G);
      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
      await selectAllStructuresOnCanvas(page);
      await Library(page).hoverMonomerAutochain(Bases.nC6n2G);
      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
    },
  );

  test(
    'Case 11: Check that if within a selection there is one and only one monomer with a free (unoccupied) R2, when hovering over the arrow for a monomer that has R1, a ghost/placeholder appear to the right of the monomer with R2 on canvas (Phosphates)',
    { tag: ['@chromium-popup'] },
    async () => {
      /*
       * Version 3.7
       * Test case: https://github.com/epam/ketcher/issues/7631
       * Description: If within a selection there is one and only one monomer with a free (unoccupied) R2,
       * when hovering over the arrow for a monomer that has R1, a ghost/placeholder appear to the right of the monomer with R2 on canvas (Phosphates).
       * Scenario:
       * 1. Go to Macro - Snake mode
       * 2. Open Library
       * 3. Check that if within a selection there is one and only one monomer with a free (unoccupied) R2,
       * when hovering over the arrow for a monomer that has R1, a ghost/placeholder appear to the right of the monomer with R2 on canvas (Phosphates)
       */
      await Library(page).switchToRNATab();
      await Library(page).openRNASection(RNASection.Phosphates);
      await Library(page).clickMonomerAutochain(Phosphates.bP);
      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
      await selectAllStructuresOnCanvas(page);
      await Library(page).hoverMonomerAutochain(Phosphates.moen);
      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
    },
  );

  test(
    'Case 12: Check that if within a selection there is one and only one monomer with a free (unoccupied) R2, when hovering over the arrow for a monomer that has R1, a ghost/placeholder appear to the right of the monomer with R2 on canvas (Nucleotides)',
    { tag: ['@chromium-popup'] },
    async () => {
      /*
       * Version 3.7
       * Test case: https://github.com/epam/ketcher/issues/7631
       * Description: If within a selection there is one and only one monomer with a free (unoccupied) R2,
       * when hovering over the arrow for a monomer that has R1, a ghost/placeholder appear to the right of the monomer with R2 on canvas (Nucleotides).
       * Scenario:
       * 1. Go to Macro - Snake mode
       * 2. Open Library
       * 3. Check that if within a selection there is one and only one monomer with a free (unoccupied) R2,
       * when hovering over the arrow for a monomer that has R1, a ghost/placeholder appear to the right of the monomer with R2 on canvas (Nucleotides)
       */
      await Library(page).switchToRNATab();
      await Library(page).openRNASection(RNASection.Nucleotides);
      await Library(page).clickMonomerAutochain(Nucleotides.AmMC6T);
      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
      await selectAllStructuresOnCanvas(page);
      await Library(page).hoverMonomerAutochain(Nucleotides.Super_G);
      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
    },
  );

  test(
    'Case 13: Check that if within a selection there is one and only one monomer with a free (unoccupied) R2, when hovering over the arrow for a monomer that has R1, a ghost/placeholder appear to the right of the monomer with R2 on canvas (Chems)',
    { tag: ['@chromium-popup'] },
    async () => {
      /*
       * Version 3.7
       * Test case: https://github.com/epam/ketcher/issues/7631
       * Description: If within a selection there is one and only one monomer with a free (unoccupied) R2,
       * when hovering over the arrow for a monomer that has R1, a ghost/placeholder appear to the right of the monomer with R2 on canvas (Chems).
       * Scenario:
       * 1. Go to Macro - Snake mode
       * 2. Open Library
       * 3. Check that if within a selection there is one and only one monomer with a free (unoccupied) R2,
       * when hovering over the arrow for a monomer that has R1, a ghost/placeholder appear to the right of the monomer with R2 on canvas (Chems)
       */
      await Library(page).switchToCHEMTab();
      await Library(page).clickMonomerAutochain(Chem.A6OH);
      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
      await selectAllStructuresOnCanvas(page);
      await Library(page).hoverMonomerAutochain(Chem.DOTA);
      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
    },
  );
});
