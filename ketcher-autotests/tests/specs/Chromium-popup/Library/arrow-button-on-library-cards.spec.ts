/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable no-magic-numbers */
import { test } from '@fixtures';
import { Page } from '@playwright/test';
import {
  clickInTheMiddleOfTheScreen,
  MacroFileType,
  MolFileFormat,
  openFileAndAddToCanvasAsNewProject,
  pasteFromClipboardAndAddToMacromoleculesCanvas,
  readFileContent,
  selectAllStructuresOnCanvas,
  SequenceFileFormat,
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
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import {
  FileType,
  verifyFileExport,
  verifyHELMExport,
} from '@utils/files/receiveFileComparisonData';
import {
  PeptideLetterCodeType,
  SequenceMonomerType,
} from '@tests/pages/constants/monomers/Constants';
import { SaveStructureDialog } from '@tests/pages/common/SaveStructureDialog';
import { MoleculesFileFormatType } from '@tests/pages/constants/fileFormats/microFileFormats';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import {
  getMonomerLocator,
  AttachmentPoint,
} from '@utils/macromolecules/monomer';
import { bondTwoMonomersPointToPoint } from '@utils/macromolecules/polymerBond';

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

  test('Case 1: Verify that the star (☆) placed in the middle, and the three dots menu (⋮) stay on the right if it exists for Presets, Peptides, Sugars, Bases, Phosphates, Nucleotides and CHEMs in Library', async () => {
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
  });

  test('Case 2: Verify that a new symbol, an arrow (⇐), added to the left side of the card, and appear only on hover of the card in Flex mode for Presets, Peptides, Sugars, Bases, Phosphates, Nucleotides and CHEMs in Library', async () => {
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
  });

  test('Case 3: Verify that a new symbol, an arrow (⇐), added to the left side of the card, and appear only on hover of the card in Snake mode for Presets, Peptides, Sugars, Bases, Phosphates, Nucleotides and CHEMs in Library', async ({
    SnakeCanvas: _,
  }) => {
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
  });

  test('Case 4: Verify that the arrow symbol change appearance when it is being hovered for Presets, Peptides, Sugars, Bases, Phosphates, Nucleotides and CHEMs in Library', async () => {
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
  });

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
      await clickInTheMiddleOfTheScreen(page);
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
      await clickInTheMiddleOfTheScreen(page);
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

  test('Case 7: Check that if within a selection there is one and only one monomer with a free (unoccupied) R2, when hovering over the arrow for a monomer that has R1, a ghost/placeholder appear to the right of the monomer with R2 on canvas (Presets)', async () => {
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
  });

  test('Case 8: Check that if within a selection there is one and only one monomer with a free (unoccupied) R2, when hovering over the arrow for a monomer that has R1, a ghost/placeholder appear to the right of the monomer with R2 on canvas (Peptides)', async () => {
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
  });

  test('Case 9: Check that if within a selection there is one and only one monomer with a free (unoccupied) R2, when hovering over the arrow for a monomer that has R1, a ghost/placeholder appear to the right of the monomer with R2 on canvas (Sugars)', async () => {
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
  });

  test('Case 10: Check that if within a selection there is one and only one monomer with a free (unoccupied) R2, when hovering over the arrow for a monomer that has R1, a ghost/placeholder appear to the right of the monomer with R2 on canvas (Bases)', async () => {
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
  });

  test('Case 11: Check that if within a selection there is one and only one monomer with a free (unoccupied) R2, when hovering over the arrow for a monomer that has R1, a ghost/placeholder appear to the right of the monomer with R2 on canvas (Phosphates)', async () => {
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
  });

  test('Case 12: Check that if within a selection there is one and only one monomer with a free (unoccupied) R2, when hovering over the arrow for a monomer that has R1, a ghost/placeholder appear to the right of the monomer with R2 on canvas (Nucleotides)', async () => {
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
  });

  test('Case 13: Check that if within a selection there is one and only one monomer with a free (unoccupied) R2, when hovering over the arrow for a monomer that has R1, a ghost/placeholder appear to the right of the monomer with R2 on canvas (Chems)', async () => {
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
  });

  test('Case 14: Check that the placeholder have the shape of the monomer/preset that the card being hovered over represents (Presets , Peptides, Sugars, Bases, Phosphates, Nucleotides and CHEMs)', async () => {
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
  });

  test('Case 15: Check that in flex mode, if the canvas is not empty, and no selection is made, hovering over the arrow for any monomer/preset will show a placeholder to the right (requirement 5.1.) or bellow (requirement 5.3.) of the most recently added monomer on canvas (Presets , Peptides, Sugars, Bases, Phosphates, Nucleotides and CHEMs)', async () => {
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
  });

  test('Case 16: Check that in snake mode, if the canvas is not empty, and no selection is made, hovering over the arrow for any monomer/preset will show a placeholder in the beginning of the next free line (Presets , Peptides, Sugars, Bases, Phosphates, Nucleotides and CHEMs)', async ({
    SnakeCanvas: _,
  }) => {
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
  });

  test('Case 17: Check that if within a selection there is one and only one monomer with a free (unoccupied) R2, when hovering over the arrow for a monomer/preset that does not have R1, a tooltip should appear', async () => {
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
  });

  test('Case 18: Check that if within a selection there are multiple monomers with a free R2, when hovering over the arrow for a monomer/preset, a tooltip appear', async () => {
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
  });

  test('Case 19: Check that in flex mode, if a new monomer/preset will be added (fully or partially) horizontally outside of the viewport, the canvas scroll horizontally to the right', async () => {
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
  });

  test(
    'Case 20: Check addition monomer by arrow button and switch to micro mode and back to macro',
    { tag: ['@chromium-popup'] },
    async () => {
      /*
       * Version 3.7
       * Test case: https://github.com/epam/ketcher/issues/7631
       * Description: When click on arrow symbol monomer appears on canvas for Presets, Peptides, Sugars, Bases, Phosphates, Nucleotides and CHEMs in Library (Flex mode).
       * After switching to Micro mode and back to Macro mode monomer remains on canvas.
       * Scenario:
       * 1. Go to Macro - Flex mode
       * 2. Add monomer by arrow button
       * 3. Switch to Micro mode
       * 4. Switch back to Macro mode
       * 5. Check that monomer is on canvas
       */
      await Library(page).clickMonomerAutochain(Preset.MOE_A_P);
      await clickInTheMiddleOfTheScreen(page);
      await Library(page).switchToPeptidesTab();
      await Library(page).clickMonomerAutochain(Peptide._1Nal);
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
      }
      await Library(page).switchToCHEMTab();
      await Library(page).clickMonomerAutochain(Chem._4FB);
      await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
      await takeEditorScreenshot(page);
      await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
    },
  );

  test(
    'Case 21: Check saving and opening monomers added by arrow button (KET)',
    { tag: ['@chromium-popup'] },
    async () => {
      /*
       * Version 3.7
       * Test case: https://github.com/epam/ketcher/issues/7631
       * Description: When click on arrow symbol monomer appears on canvas for Presets, Peptides, Sugars, Bases, Phosphates, Nucleotides and CHEMs in Library (Flex mode).
       * After saving the structure as KET file and opening it again monomer remains on canvas.
       * Scenario:
       * 1. Go to Macro - Flex mode
       * 2. Add monomer by arrow button
       * 3. Save the structure as KET file
       * 4. Open saved file
       * 5. Check that monomer is on canvas
       */
      await Library(page).clickMonomerAutochain(Preset.MOE_A_P);
      await clickInTheMiddleOfTheScreen(page);
      await Library(page).switchToPeptidesTab();
      await Library(page).clickMonomerAutochain(Peptide._1Nal);
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
      }
      await Library(page).switchToCHEMTab();
      await Library(page).clickMonomerAutochain(Chem._4FB);
      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
      await verifyFileExport(
        page,
        'KET/monomers-added-by-arrow-button-expected.ket',
        FileType.KET,
      );
      await openFileAndAddToCanvasAsNewProject(
        page,
        'KET/monomers-added-by-arrow-button-expected.ket',
      );
      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
    },
  );

  test(
    'Case 22: Check saving and opening monomers added by arrow button (MOL V3000)',
    { tag: ['@chromium-popup'] },
    async () => {
      /*
       * Version 3.7
       * Test case: https://github.com/epam/ketcher/issues/7631
       * Description: When click on arrow symbol monomer appears on canvas for Presets, Peptides, Sugars, Bases, Phosphates, Nucleotides and CHEMs in Library (Flex mode).
       * After saving the structure as MOL V3000 file and opening it again monomer remains on canvas.
       * Scenario:
       * 1. Go to Macro - Flex mode
       * 2. Add monomer by arrow button
       * 3. Save the structure as MOL V3000 file file
       * 4. Open saved file
       * 5. Check that monomer is on canvas
       */
      await Library(page).clickMonomerAutochain(Preset.MOE_A_P);
      await clickInTheMiddleOfTheScreen(page);
      await Library(page).switchToPeptidesTab();
      await Library(page).clickMonomerAutochain(Peptide._1Nal);
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
      }
      await Library(page).switchToCHEMTab();
      await Library(page).clickMonomerAutochain(Chem._4FB);
      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
      await verifyFileExport(
        page,
        'Molfiles-V3000/monomers-added-by-arrow-button-expected.mol',
        FileType.MOL,
        MolFileFormat.v3000,
      );
      await openFileAndAddToCanvasAsNewProject(
        page,
        'Molfiles-V3000/monomers-added-by-arrow-button-expected.mol',
      );
      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
    },
  );

  test('Case 23: Check saving and opening monomers added by arrow button (Sequence 1-letter-code)', async () => {
    /*
     * Version 3.7
     * Test case: https://github.com/epam/ketcher/issues/7631
     * Description: When click on arrow symbol monomer appears on canvas for Presets, Peptides, Sugars, Bases, Phosphates, Nucleotides and CHEMs in Library (Flex mode).
     * After saving the structure as Sequence 1-letter-code file and opening it again monomer remains on canvas.
     * Scenario:
     * 1. Go to Macro - Flex mode
     * 2. Add monomer by arrow button
     * 3. Save the structure as Sequence 1-letter-code file
     * 4. Open saved file
     * 5. Check that monomer is on canvas
     */
    await Library(page).switchToPeptidesTab();
    for (let i = 0; i < 3; i++) {
      await Library(page).clickMonomerAutochain(Peptide._1Nal);
    }
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await verifyFileExport(
      page,
      'Sequence/monomers-added-by-arrow-button-expected.seq',
      FileType.SEQ,
      SequenceFileFormat.oneLetter,
    );
    const fileContent = await readFileContent(
      'Sequence/monomers-added-by-arrow-button-expected.seq',
    );
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      [
        MacroFileType.Sequence,
        [SequenceMonomerType.Peptide, PeptideLetterCodeType.oneLetterCode],
      ],
      fileContent,
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 24: Check saving and opening monomers added by arrow button (Sequence 3-letter-code)', async () => {
    /*
     * Version 3.7
     * Test case: https://github.com/epam/ketcher/issues/7631
     * Description: When click on arrow symbol monomer appears on canvas for Presets, Peptides, Sugars, Bases, Phosphates, Nucleotides and CHEMs in Library (Flex mode).
     * After saving the structure as Sequence 3-letter-code file and opening it again monomer remains on canvas.
     * Scenario:
     * 1. Go to Macro - Flex mode
     * 2. Add monomer by arrow button
     * 3. Save the structure as Sequence 3-letter-code file
     * 4. Open saved file
     * 5. Check that monomer is on canvas
     */
    await Library(page).switchToPeptidesTab();
    for (let i = 0; i < 3; i++) {
      await Library(page).clickMonomerAutochain(Peptide.Cys_Bn);
    }
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await verifyFileExport(
      page,
      'Sequence/peptides-added-by-arrow-button-expected.seq',
      FileType.SEQ,
      SequenceFileFormat.threeLetter,
    );
    const fileContent = await readFileContent(
      'Sequence/peptides-added-by-arrow-button-expected.seq',
    );
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      [
        MacroFileType.Sequence,
        [SequenceMonomerType.Peptide, PeptideLetterCodeType.threeLetterCode],
      ],
      fileContent,
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 25: Check saving and opening monomers added by arrow button (FASTA)', async () => {
    /*
     * Version 3.7
     * Test case: https://github.com/epam/ketcher/issues/7631
     * Description: When click on arrow symbol monomer appears on canvas for Presets, Peptides, Sugars, Bases, Phosphates, Nucleotides and CHEMs in Library (Flex mode).
     * After saving the structure as FASTA file and opening it again monomer remains on canvas.
     * Scenario:
     * 1. Go to Macro - Flex mode
     * 2. Add monomer by arrow button
     * 3. Save the structure as FASTA file
     * 4. Open saved file
     * 5. Check that monomer is on canvas
     */
    for (let i = 0; i < 3; i++) {
      await Library(page).clickMonomerAutochain(Preset.MOE_A_P);
    }
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await verifyFileExport(
      page,
      'FASTA/monomers-added-by-arrow-button-expected.fasta',
      FileType.FASTA,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'FASTA/monomers-added-by-arrow-button-expected.fasta',
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 26: Check saving and opening monomers added by arrow button (IDT)', async () => {
    /*
     * Version 3.7
     * Test case: https://github.com/epam/ketcher/issues/7631
     * Description: When click on arrow symbol monomer appears on canvas for Presets, Peptides, Sugars, Bases, Phosphates, Nucleotides and CHEMs in Library (Flex mode).
     * After saving the structure as IDT file and opening it again monomer remains on canvas.
     * Scenario:
     * 1. Go to Macro - Flex mode
     * 2. Add monomer by arrow button
     * 3. Save the structure as IDT file
     * 4. Open saved file
     * 5. Check that monomer is on canvas
     */
    for (let i = 0; i < 3; i++) {
      await Library(page).clickMonomerAutochain(Preset.MOE_G_P);
    }
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await verifyFileExport(
      page,
      'IDT/monomers-added-by-arrow-button-expected.idt',
      FileType.IDT,
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      'IDT/monomers-added-by-arrow-button-expected.idt',
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 27: Check saving and opening monomers added by arrow button (HELM)', async () => {
    /*
     * Version 3.7
     * Test case: https://github.com/epam/ketcher/issues/7631
     * Description: When click on arrow symbol monomer appears on canvas for Presets, Peptides, Sugars, Bases, Phosphates, Nucleotides and CHEMs in Library (Flex mode).
     * After saving the structure as HELM file and opening it again monomer remains on canvas.
     * Scenario:
     * 1. Go to Macro - Flex mode
     * 2. Add monomer by arrow button
     * 3. Save the structure as HELM file
     * 4. Open saved file
     * 5. Check that monomer is on canvas
     */
    for (let i = 0; i < 3; i++) {
      await Library(page).clickMonomerAutochain(Preset.MOE_T_P);
    }
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await verifyHELMExport(page, `RNA1{[moe](T)p.[moe](T)p.[moe](T)p}$$$$V2.0`);
  });

  test('Case 28: Check saving and opening monomers added by arrow button (SVG Document)', async () => {
    /*
     * Version 3.7
     * Test case: https://github.com/epam/ketcher/issues/7631
     * Description: When click on arrow symbol monomer appears on canvas for Presets, Peptides, Sugars, Bases, Phosphates, Nucleotides and CHEMs in Library (Flex mode).
     * After saving the structure as SVG Document file and opening it again monomer remains on canvas.
     * Scenario:
     * 1. Go to Macro - Flex mode
     * 2. Add monomer by arrow button
     * 3. Save the structure as SVG Document file
     * 4. Open saved file
     * 5. Check that monomer is on canvas
     */
    for (let i = 0; i < 3; i++) {
      await Library(page).clickMonomerAutochain(Preset.MOE_T_P);
    }
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.SVGDocument,
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 29: Check Undo/Redo after addition monomers by arrow button', async () => {
    /*
     * Version 3.7
     * Test case: https://github.com/epam/ketcher/issues/7631
     * Description: Undo/Redo works after addition monomers by arrow button.
     * Scenario:
     * 1. Go to Macro - Flex mode
     * 2. Add monomer by arrow button
     * 3. Click Undo button
     * 4. Click Redo button
     * 5. Check that after clicking Undo button last added monomer is removed from canvas
     * 6. Check that after clicking Redo button last added monomer is added to canvas
     */
    for (let i = 0; i < 3; i++) {
      await Library(page).clickMonomerAutochain(Preset.MOE_T_P);
    }
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    for (let i = 0; i < 2; i++) {
      await CommonTopLeftToolbar(page).undo();
    }
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    for (let i = 0; i < 2; i++) {
      await CommonTopLeftToolbar(page).redo();
    }
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 30: Check zoom in and zoom out for monomers added by arrow button', async () => {
    /*
     * Version 3.7
     * Test case: https://github.com/epam/ketcher/issues/7631
     * Description: Erase works after addition monomers by arrow button.
     * Scenario:
     * 1. Go to Macro - Flex mode
     * 2. Add monomer by arrow button
     * 3. Zoom out
     * 4. Zoom in
     * 5. Check that after zooming out structure becomes smaller
     * 6. Check that after zooming in structure becomes bigger
     */
    const numberOfPressZoomOut = 5;
    const numberOfPressZoomIn = 5;
    for (let i = 0; i < 3; i++) {
      await Library(page).clickMonomerAutochain(Preset.dR_U_P);
    }
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await CommonTopRightToolbar(page).selectZoomOutTool(numberOfPressZoomOut);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await CommonTopRightToolbar(page).selectZoomInTool(numberOfPressZoomIn);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 31: Check that added monomers by arrow button can be connected to monomers by using attachment points (Presets)', async () => {
    /*
     * Version 3.7
     * Test case: https://github.com/epam/ketcher/issues/7631
     * Description: Added monomers by arrow button can be connected to monomers by using attachment points (Presets).
     * Scenario:
     * 1. Go to Macro - Flex mode
     * 2. Add multiple monomers with free R2 to canvas
     * 3. Add Preset to canvas by using arrow button
     * 4. Check that added monomers by arrow button can be connected to monomers by using attachment points (Presets)
     */
    const firstMonomer = getMonomerLocator(page, Phosphate.P);
    const secondMonomer = getMonomerLocator(page, Peptide.A).first();
    await openFileAndAddToCanvasAsNewProject(page, 'KET/two-peptide-a.ket');
    await Library(page).clickMonomerAutochain(Preset.dR_U_P);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await bondTwoMonomersPointToPoint(
      page,
      firstMonomer,
      secondMonomer,
      AttachmentPoint.R2,
      AttachmentPoint.R1,
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 32: Check that added monomers by arrow button can be connected to monomers by using attachment points (Peptides)', async () => {
    /*
     * Version 3.7
     * Test case: https://github.com/epam/ketcher/issues/7631
     * Description: Added monomers by arrow button can be connected to monomers by using attachment points (Peptides).
     * Scenario:
     * 1. Go to Macro - Flex mode
     * 2. Add multiple monomers with free R2 to canvas
     * 3. Add Peptide to canvas by using arrow button
     * 4. Check that added monomers by arrow button can be connected to monomers by using attachment points (Peptides)
     */
    const firstMonomer = getMonomerLocator(page, Peptide._1Nal);
    const secondMonomer = getMonomerLocator(page, Peptide.A).first();
    await openFileAndAddToCanvasAsNewProject(page, 'KET/two-peptide-a.ket');
    await Library(page).clickMonomerAutochain(Peptide._1Nal);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await bondTwoMonomersPointToPoint(
      page,
      firstMonomer,
      secondMonomer,
      AttachmentPoint.R2,
      AttachmentPoint.R1,
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 33: Check that added monomers by arrow button can be connected to monomers by using attachment points (Sugars)', async () => {
    /*
     * Version 3.7
     * Test case: https://github.com/epam/ketcher/issues/7631
     * Description: Added monomers by arrow button can be connected to monomers by using attachment points (Sugars).
     * Scenario:
     * 1. Go to Macro - Flex mode
     * 2. Add multiple monomers with free R2 to canvas
     * 3. Add Sugar to canvas by using arrow button
     * 4. Check that added monomers by arrow button can be connected to monomers by using attachment points (Sugars)
     */
    const firstMonomer = getMonomerLocator(page, Sugar._25R);
    const secondMonomer = getMonomerLocator(page, Peptide.A).first();
    await openFileAndAddToCanvasAsNewProject(page, 'KET/two-peptide-a.ket');
    await Library(page).clickMonomerAutochain(Sugar._25R);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await bondTwoMonomersPointToPoint(
      page,
      firstMonomer,
      secondMonomer,
      AttachmentPoint.R2,
      AttachmentPoint.R1,
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 34: Check that added monomers by arrow button can be connected to monomers by using attachment points (Bases)', async () => {
    /*
     * Version 3.7
     * Test case: https://github.com/epam/ketcher/issues/7631
     * Description: Added monomers by arrow button can be connected to monomers by using attachment points (Bases).
     * Scenario:
     * 1. Go to Macro - Flex mode
     * 2. Add multiple monomers with free R2 to canvas
     * 3. Add Base to canvas by using arrow button
     * 4. Check that added monomers by arrow button can be connected to monomers by using attachment points (Bases)
     */
    const firstMonomer = getMonomerLocator(page, Base.baA);
    const secondMonomer = getMonomerLocator(page, Peptide.A).first();
    await openFileAndAddToCanvasAsNewProject(page, 'KET/two-peptide-a.ket');
    await Library(page).clickMonomerAutochain(Base.baA);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await bondTwoMonomersPointToPoint(
      page,
      firstMonomer,
      secondMonomer,
      AttachmentPoint.R1,
      AttachmentPoint.R2,
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 35: Check that added monomers by arrow button can be connected to monomers by using attachment points (Phosphates)', async () => {
    /*
     * Version 3.7
     * Test case: https://github.com/epam/ketcher/issues/7631
     * Description: Added monomers by arrow button can be connected to monomers by using attachment points (Phosphates).
     * Scenario:
     * 1. Go to Macro - Flex mode
     * 2. Add multiple monomers with free R2 to canvas
     * 3. Add Phosphate to canvas by using arrow button
     * 4. Check that added monomers by arrow button can be connected to monomers by using attachment points (Phosphates)
     */
    const firstMonomer = getMonomerLocator(page, Phosphate.Test_6_Ph);
    const secondMonomer = getMonomerLocator(page, Peptide.A).first();
    await openFileAndAddToCanvasAsNewProject(page, 'KET/two-peptide-a.ket');
    await Library(page).clickMonomerAutochain(Phosphate.Test_6_Ph);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await bondTwoMonomersPointToPoint(
      page,
      firstMonomer,
      secondMonomer,
      AttachmentPoint.R2,
      AttachmentPoint.R1,
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 36: Check that added monomers by arrow button can be connected to monomers by using attachment points (Nucleotides)', async () => {
    /*
     * Version 3.7
     * Test case: https://github.com/epam/ketcher/issues/7631
     * Description: Added monomers by arrow button can be connected to monomers by using attachment points (Nucleotides).
     * Scenario:
     * 1. Go to Macro - Flex mode
     * 2. Add multiple monomers with free R2 to canvas
     * 3. Add Nucleotide to canvas by using arrow button
     * 4. Check that added monomers by arrow button can be connected to monomers by using attachment points (Nucleotides)
     */
    const firstMonomer = getMonomerLocator(page, Nucleotide.Super_G);
    const secondMonomer = getMonomerLocator(page, Peptide.A).first();
    await openFileAndAddToCanvasAsNewProject(page, 'KET/two-peptide-a.ket');
    await Library(page).clickMonomerAutochain(Nucleotide.Super_G);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await bondTwoMonomersPointToPoint(
      page,
      firstMonomer,
      secondMonomer,
      AttachmentPoint.R2,
      AttachmentPoint.R1,
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 37: Check that added monomers by arrow button can be connected to monomers by using attachment points (CHEMs)', async () => {
    /*
     * Version 3.7
     * Test case: https://github.com/epam/ketcher/issues/7631
     * Description: Added monomers by arrow button can be connected to monomers by using attachment points (CHEMs).
     * Scenario:
     * 1. Go to Macro - Flex mode
     * 2. Add multiple monomers with free R2 to canvas
     * 3. Add CHEM to canvas by using arrow button
     * 4. Check that added monomers by arrow button can be connected to monomers by using attachment points (CHEMs)
     */
    const firstMonomer = getMonomerLocator(page, Chem.Test_6_Ch);
    const secondMonomer = getMonomerLocator(page, Peptide.A).first();
    await openFileAndAddToCanvasAsNewProject(page, 'KET/two-peptide-a.ket');
    await Library(page).clickMonomerAutochain(Chem.Test_6_Ch);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await bondTwoMonomersPointToPoint(
      page,
      firstMonomer,
      secondMonomer,
      AttachmentPoint.R2,
      AttachmentPoint.R1,
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 38: Check Erase after addition monomers by arrow button', async () => {
    /*
     * Version 3.7
     * Test case: https://github.com/epam/ketcher/issues/7631
     * Description: Erase works after addition monomers by arrow button.
     * Scenario:
     * 1. Go to Macro - Flex mode
     * 2. Add monomer by arrow button
     * 3. Select Erase tool and delete last added monomer
     * 4. Check that after deleting last added monomer it is removed from canvas
     * 5. Click Undo button
     * 6. Check that after clicking Undo button last deleted monomer is added to canvas
     */
    for (let i = 0; i < 3; i++) {
      await Library(page).clickMonomerAutochain(Peptide._1Nal);
    }
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await CommonLeftToolbar(page).selectEraseTool();
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await CommonTopLeftToolbar(page).undo();
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Case 39: Check Undo/Redo after addition monomers by arrow button in Snake mode', async ({
    SnakeCanvas: _,
  }) => {
    /*
     * Version 3.7
     * Test case: https://github.com/epam/ketcher/issues/7631
     * Description: Undo/Redo works after addition monomers by arrow button.
     * Scenario:
     * 1. Go to Macro - Snake mode
     * 2. Add monomer by arrow button
     * 3. Click Undo button
     * 4. Click Redo button
     * 5. Check that after clicking Undo button last added monomer is removed from canvas
     * 6. Check that after clicking Redo button last added monomer is added to canvas
     */
    for (let i = 0; i < 3; i++) {
      await Library(page).clickMonomerAutochain(Preset.MOE_T_P);
    }
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    for (let i = 0; i < 2; i++) {
      await CommonTopLeftToolbar(page).undo();
    }
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    for (let i = 0; i < 2; i++) {
      await CommonTopLeftToolbar(page).redo();
    }
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });
});
