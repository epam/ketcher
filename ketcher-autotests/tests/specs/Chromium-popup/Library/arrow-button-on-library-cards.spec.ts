/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable no-magic-numbers */
import { test } from '@fixtures';
import { Page } from '@playwright/test';
import {
  openFileAndAddToCanvasAsNewProject,
  selectAllStructuresOnCanvas,
  takeEditorScreenshot,
  takeMonomerLibraryScreenshot,
  takePresetsScreenshot,
} from '@utils';
import { Library } from '@tests/pages/macromolecules/Library';
import { RNASection } from '@tests/pages/constants/library/Constants';
import { Chem } from '@tests/pages/constants/monomers/Chem';
import { Nucleotide } from '@tests/pages/constants/monomers/Nucleotides';
import { Base } from '@tests/pages/constants/monomers/Bases';
import { Phosphate } from '@tests/pages/constants/monomers/Phosphates';
import { Sugar } from '@tests/pages/constants/monomers/Sugars';
import { Preset } from '@tests/pages/constants/monomers/Presets';
import { Peptide } from '@tests/pages/constants/monomers/Peptides';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';

let page: Page;

test.describe('Arrow button on Library cards', () => {
  test.beforeAll(async ({ initFlexCanvas }) => {
    page = await initFlexCanvas();
  });
  test.afterEach(async () => {
    await CommonTopLeftToolbar(page).clearCanvas();
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
      await Library(page).hoverMonomer(Preset.A);
      await takePresetsScreenshot(page);
      await Library(page).switchToPeptidesTab();
      await Library(page).hoverMonomer(Peptide.A);
      await takeMonomerLibraryScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
      await Library(page).switchToRNATab();
      const rnaTests = [
        [RNASection.Sugars, Sugar.R],
        [RNASection.Bases, Base.A],
        [RNASection.Phosphates, Phosphate.P],
        [RNASection.Nucleotides, Nucleotide.AmMC6T],
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
      await Library(page).hoverMonomer(Preset.G);
      await takePresetsScreenshot(page);
      await Library(page).switchToPeptidesTab();
      await Library(page).hoverMonomer(Peptide.Ala_al);
      await takeMonomerLibraryScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
      await Library(page).switchToRNATab();
      const rnaTests = [
        [RNASection.Sugars, Sugar._12ddR],
        [RNASection.Bases, Base.DNA_B],
        [RNASection.Phosphates, Phosphate.Test_6_Ph],
        [RNASection.Nucleotides, Nucleotide._2_damdA],
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
      await Library(page).hoverMonomer(Preset.MOE_A_P);
      await takePresetsScreenshot(page);
      await Library(page).switchToPeptidesTab();
      await Library(page).hoverMonomer(Peptide._1Nal);
      await takeMonomerLibraryScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
      await Library(page).switchToRNATab();
      const rnaTests = [
        [RNASection.Sugars, Sugar._25R],
        [RNASection.Bases, Base.baA],
        [RNASection.Phosphates, Phosphate.bP],
        [RNASection.Nucleotides, Nucleotide.Super_G],
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
      await Library(page).hoverMonomerAutochain(Preset.MOE_A_P);
      await takePresetsScreenshot(page);
      await Library(page).switchToPeptidesTab();
      await Library(page).hoverMonomerAutochain(Peptide._1Nal);
      await takeMonomerLibraryScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
      await Library(page).switchToRNATab();
      const rnaTests = [
        [RNASection.Sugars, Sugar._25R],
        [RNASection.Bases, Base.baA],
        [RNASection.Phosphates, Phosphate.bP],
        [RNASection.Nucleotides, Nucleotide.Super_G],
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
      await Library(page).clickMonomerAutochain(Preset.MOE_A_P);
      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
      await Library(page).switchToPeptidesTab();
      await Library(page).clickMonomerAutochain(Peptide._1Nal);
      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
      await Library(page).switchToRNATab();
      const rnaTests = [
        [RNASection.Sugars, Sugar._25R],
        [RNASection.Bases, Base.baA],
        [RNASection.Phosphates, Phosphate.bP],
        [RNASection.Nucleotides, Nucleotide.Super_G],
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
      await Library(page).clickMonomerAutochain(Preset.MOE_A_P);
      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
      await Library(page).switchToPeptidesTab();
      await Library(page).clickMonomerAutochain(Peptide._1Nal);
      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
      await Library(page).switchToRNATab();
      const rnaTests = [
        [RNASection.Sugars, Sugar._25R],
        [RNASection.Bases, Base.baA],
        [RNASection.Phosphates, Phosphate.bP],
        [RNASection.Nucleotides, Nucleotide.Super_G],
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
       * 1. Go to Macro - Flex mode
       * 2. Open Library
       * 3. Check that if within a selection there is one and only one monomer with a free (unoccupied) R2,
       * when hovering over the arrow for a monomer that has R1, a ghost/placeholder appear to the right of the monomer with R2 on canvas (Presets)
       */
      await Library(page).clickMonomerAutochain(Preset.MOE_A_P);
      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
      await Library(page).hoverMonomerAutochain(Preset.MOE_5meC_P);
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
       * 1. Go to Macro - Flex mode
       * 2. Open Library
       * 3. Check that if within a selection there is one and only one monomer with a free (unoccupied) R2,
       * when hovering over the arrow for a monomer that has R1, a ghost/placeholder appear to the right of the monomer with R2 on canvas (Peptides)
       */
      await Library(page).switchToPeptidesTab();
      await Library(page).clickMonomerAutochain(Peptide._2Nal);
      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
      await Library(page).hoverMonomerAutochain(Peptide.Cys_Bn);
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
       * 1. Go to Macro - Flex mode
       * 2. Open Library
       * 3. Check that if within a selection there is one and only one monomer with a free (unoccupied) R2,
       * when hovering over the arrow for a monomer that has R1, a ghost/placeholder appear to the right of the monomer with R2 on canvas (Sugars)
       */
      await Library(page).switchToRNATab();
      await Library(page).clickMonomerAutochain(Sugar.UNA);
      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
      await Library(page).hoverMonomerAutochain(Sugar._25d3r);
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
       * 1. Go to Macro - Flex mode
       * 2. Open Library
       * 3. Check that if within a selection there is one and only one monomer with a free (unoccupied) R2,
       * when hovering over the arrow for a monomer that has R1, a ghost/placeholder appear to the right of the monomer with R2 on canvas (Bases)
       */
      await Library(page).switchToRNATab();
      await Library(page).openRNASection(RNASection.Bases);
      await Library(page).clickMonomerAutochain(Base.nC6n2G);
      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
      await Library(page).hoverMonomerAutochain(Base.nC6n2G);
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
       * 1. Go to Macro - Flex mode
       * 2. Open Library
       * 3. Check that if within a selection there is one and only one monomer with a free (unoccupied) R2,
       * when hovering over the arrow for a monomer that has R1, a ghost/placeholder appear to the right of the monomer with R2 on canvas (Phosphates)
       */
      await Library(page).switchToRNATab();
      await Library(page).openRNASection(RNASection.Phosphates);
      await Library(page).clickMonomerAutochain(Phosphate.bP);
      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
      await Library(page).hoverMonomerAutochain(Phosphate.moen);
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
       * 1. Go to Macro - Flex mode
       * 2. Open Library
       * 3. Check that if within a selection there is one and only one monomer with a free (unoccupied) R2,
       * when hovering over the arrow for a monomer that has R1, a ghost/placeholder appear to the right of the monomer with R2 on canvas (Nucleotides)
       */
      await Library(page).switchToRNATab();
      await Library(page).openRNASection(RNASection.Nucleotides);
      await Library(page).clickMonomerAutochain(Nucleotide.AmMC6T);
      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
      await Library(page).hoverMonomerAutochain(Nucleotide.Super_G);
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
       * 1. Go to Macro - Flex mode
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
      await Library(page).hoverMonomerAutochain(Chem.DOTA);
      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
    },
  );

  test(
    'Case 14: Check that the placeholder have the shape of the monomer/preset that the card being hovered over represents (Presets , Peptides, Sugars, Bases, Phosphates, Nucleotides and CHEMs)',
    { tag: ['@chromium-popup'] },
    async () => {
      /*
       * Version 3.7
       * Test case: https://github.com/epam/ketcher/issues/7631
       * Description: The placeholder have the shape of the monomer/preset that the card being hovered over represents (Presets , Peptides, Sugars, Bases, Phosphates, Nucleotides and CHEMs).
       * Scenario:
       * 1. Go to Macro - Flex mode
       * 2. Open Library
       * 3. Check that the placeholder have the shape of the monomer/preset that the card being hovered over represents
       * (Presets , Peptides, Sugars, Bases, Phosphates, Nucleotides and CHEMs)
       */
      await Library(page).hoverMonomerAutochain(Preset.MOE_A_P);
      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
      await Library(page).switchToPeptidesTab();
      await Library(page).hoverMonomerAutochain(Peptide._1Nal);
      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
      await Library(page).switchToRNATab();
      const rnaTests = [
        [RNASection.Sugars, Sugar._25R],
        [RNASection.Bases, Base.baA],
        [RNASection.Phosphates, Phosphate.bP],
        [RNASection.Nucleotides, Nucleotide.Super_G],
      ] as const;

      for (const [section, monomer] of rnaTests) {
        await Library(page).openRNASection(section);
        await Library(page).hoverMonomerAutochain(monomer);
        await takeEditorScreenshot(page, {
          hideMonomerPreview: true,
          hideMacromoleculeEditorScrollBars: true,
        });
      }
      await Library(page).switchToCHEMTab();
      await Library(page).hoverMonomerAutochain(Chem._4FB);
      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
    },
  );

  test(
    'Case 15: Check that in flex mode, if the canvas is not empty, and no selection is made, hovering over the arrow for any monomer/preset will show a placeholder to the right (requirement 5.1.) or bellow (requirement 5.3.) of the most recently added monomer on canvas (Presets , Peptides, Sugars, Bases, Phosphates, Nucleotides and CHEMs)',
    { tag: ['@chromium-popup'] },
    async () => {
      /*
       * Version 3.7
       * Test case: https://github.com/epam/ketcher/issues/7631
       * Description: In flex mode, if the canvas is not empty, and no selection is made, hovering over the arrow for any monomer/preset
       * will show a placeholder to the right (requirement 5.1.) or bellow (requirement 5.3.) of the most recently added monomer
       * on canvas (Presets , Peptides, Sugars, Bases, Phosphates, Nucleotides and CHEMs).
       * Scenario:
       * 1. Go to Macro - Flex mode
       * 2. Open file with monomer
       * 3. Check that in flex mode, if the canvas is not empty, and no selection is made,
       * hovering over the arrow for any monomer/preset will show a placeholder to the right
       * (requirement 5.1.) or bellow (requirement 5.3.) of the most recently added monomer on canvas
       * (Presets , Peptides, Sugars, Bases, Phosphates, Nucleotides and CHEMs)
       */
      await openFileAndAddToCanvasAsNewProject(page, 'KET/rap.ket');
      await Library(page).hoverMonomerAutochain(Preset.MOE_A_P);
      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
      await Library(page).switchToPeptidesTab();
      await Library(page).hoverMonomerAutochain(Peptide._1Nal);
      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
      await Library(page).switchToRNATab();
      const rnaTests = [
        [RNASection.Sugars, Sugar._25R],
        [RNASection.Bases, Base.baA],
        [RNASection.Phosphates, Phosphate.bP],
        [RNASection.Nucleotides, Nucleotide.Super_G],
      ] as const;

      for (const [section, monomer] of rnaTests) {
        await Library(page).openRNASection(section);
        await Library(page).hoverMonomerAutochain(monomer);
        await takeEditorScreenshot(page, {
          hideMonomerPreview: true,
          hideMacromoleculeEditorScrollBars: true,
        });
      }
      await Library(page).switchToCHEMTab();
      await Library(page).hoverMonomerAutochain(Chem._4FB);
      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
    },
  );

  test(
    'Case 16: Check that in snake mode, if the canvas is not empty, and no selection is made, hovering over the arrow for any monomer/preset will show a placeholder in the beginning of the next free line (Presets , Peptides, Sugars, Bases, Phosphates, Nucleotides and CHEMs)',
    { tag: ['@chromium-popup'] },
    async ({ SnakeCanvas: _ }) => {
      /*
       * Version 3.7
       * Test case: https://github.com/epam/ketcher/issues/7631
       * Description: In snake mode, if the canvas is not empty, and no selection is made, hovering over the arrow for any
       * monomer/preset will show a placeholder in the beginning of the next free line
       * (Presets , Peptides, Sugars, Bases, Phosphates, Nucleotides and CHEMs).
       * Scenario:
       * 1. Go to Macro - Snake mode
       * 2. Open file with monomer
       * 3. Check that in snake mode, if the canvas is not empty, and no selection is made,
       * hovering over the arrow for any monomer/preset will show a placeholder in the beginning  of the next free line
       * (Presets , Peptides, Sugars, Bases, Phosphates, Nucleotides and CHEMs)
       */
      await openFileAndAddToCanvasAsNewProject(page, 'KET/rap.ket');
      await Library(page).hoverMonomerAutochain(Preset.MOE_A_P);
      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
      await Library(page).switchToPeptidesTab();
      await Library(page).hoverMonomerAutochain(Peptide._1Nal);
      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
      await Library(page).switchToRNATab();
      const rnaTests = [
        [RNASection.Sugars, Sugar._25R],
        [RNASection.Bases, Base.baA],
        [RNASection.Phosphates, Phosphate.bP],
        [RNASection.Nucleotides, Nucleotide.Super_G],
      ] as const;

      for (const [section, monomer] of rnaTests) {
        await Library(page).openRNASection(section);
        await Library(page).hoverMonomerAutochain(monomer);
        await takeEditorScreenshot(page, {
          hideMonomerPreview: true,
          hideMacromoleculeEditorScrollBars: true,
        });
      }
      await Library(page).switchToCHEMTab();
      await Library(page).hoverMonomerAutochain(Chem._4FB);
      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
    },
  );

  test(
    'Case 17: Check that if within a selection there is one and only one monomer with a free (unoccupied) R2, when hovering over the arrow for a monomer/preset that does not have R1, a tooltip should appear',
    { tag: ['@chromium-popup'] },
    async () => {
      /*
       * Version 3.7
       * Test case: https://github.com/epam/ketcher/issues/7631
       * Description: If within a selection there is one and only one monomer with a free (unoccupied) R2,
       * when hovering over the arrow for a monomer/preset that does not have R1, a tooltip should appear.
       * Scenario:
       * 1. Go to Macro - Flex mode
       * 2. Add monomer with free R2 to canvas
       * 3. Open Library
       * 4. Check that if within a selection there is one and only one monomer with a free (unoccupied) R2,
       * when hovering over the arrow for a monomer/preset that does not have R1, a tooltip should appear
       */
      await Library(page).switchToPeptidesTab();
      await Library(page).clickMonomerAutochain(Peptide._1Nal);
      await Library(page).hoverMonomerAutochain(Peptide.Ac_);
      await takeMonomerLibraryScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
    },
  );

  test(
    'Case 18: Check that if within a selection there are multiple monomers with a free R2, when hovering over the arrow for a monomer/preset, a tooltip appear',
    { tag: ['@chromium-popup'] },
    async () => {
      /*
       * Version 3.7
       * Test case: https://github.com/epam/ketcher/issues/7631
       * Description: If within a selection there are multiple monomers with a free R2, when hovering over the arrow for a monomer/preset, a tooltip appear.
       * Scenario:
       * 1. Go to Macro - Flex mode
       * 2. Add multiple monomers with free R2 to canvas
       * 3. Select all added monomers
       * 4. Hover monomer in Library
       * 5. Check that if within a selection there are multiple monomers with a free R2,
       * when hovering over the arrow for a monomer/preset, a tooltip appear
       */
      await openFileAndAddToCanvasAsNewProject(page, 'KET/two-peptide-a.ket');
      await selectAllStructuresOnCanvas(page);
      await Library(page).switchToPeptidesTab();
      await Library(page).hoverMonomerAutochain(Peptide._1Nal);
      await takeMonomerLibraryScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
      await Library(page).switchToRNATab();
      const rnaTests = [
        [RNASection.Sugars, Sugar._25R],
        [RNASection.Bases, Base.baA],
        [RNASection.Phosphates, Phosphate.bP],
        [RNASection.Nucleotides, Nucleotide.Super_G],
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
    'Case 19: Check that in flex mode, if a new monomer/preset will be added (fully or partially) horizontally outside of the viewport, the canvas scroll horizontally to the right',
    { tag: ['@chromium-popup'] },
    async () => {
      /*
       * Version 3.7
       * Test case: https://github.com/epam/ketcher/issues/7631
       * Description: In flex mode, if a new monomer/preset will be added (fully or partially) horizontally outside
       * of the viewport,and the left-most point of the chain to whom it will be added is in viewport, but not aligned
       * to the left, after the addition, the canvas scroll horizontally to align the left-most point of the chain
       * the left border of the viewport if the newly added monomer is entirely in the viewport with a buffer of 7,5Å to the right.
       * Scenario:
       * 1. Go to Macro - Flex mode
       * 2. Add monomers to canvas until the right-most point of the last added monomer is outside of the viewport
       * 3. Take a screenshot of the canvas
       */
      await Library(page).switchToPeptidesTab();
      for (let i = 0; i < 10; i++) {
        await Library(page).clickMonomerAutochain(Peptide._1Nal);
      }
      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
    },
  );
});
