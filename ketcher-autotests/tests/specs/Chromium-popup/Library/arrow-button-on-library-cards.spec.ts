/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable no-magic-numbers */
import { Bases } from '@constants/monomers/Bases';
import { Peptides } from '@constants/monomers/Peptides';
import { Sugars } from '@constants/monomers/Sugars';
import { Page, test } from '@playwright/test';
import {
  takeEditorScreenshot,
  pasteFromClipboardAndAddToMacromoleculesCanvas,
  MacroFileType,
  resetZoomLevelToDefault,
  clickInTheMiddleOfTheScreen,
  takeMonomerLibraryScreenshot,
  takePageScreenshot,
  openFileAndAddToCanvasAsNewProjectMacro,
  clickOnCanvas,
  openFileAndAddToCanvasAsNewProject,
  dragMouseTo,
  getCoordinatesOfTheMiddleOfTheCanvas,
  takePresetsScreenshot,
} from '@utils';
import { selectAllStructuresOnCanvas } from '@utils/canvas/selectSelection';
import { waitForMonomerPreview } from '@utils/macromolecules';
import { waitForPageInit } from '@utils/common';
import {
  createRNAAntisenseChain,
  getMonomerLocator,
  getSymbolLocator,
  modifyInRnaBuilder,
} from '@utils/macromolecules/monomer';
import { processResetToDefaultState } from '@utils/testAnnotations/resetToDefaultState';
import { keyboardPressOnCanvas } from '@utils/keyboard/index';
import { Phosphates } from '@constants/monomers/Phosphates';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { verifyHELMExport } from '@utils/files/receiveFileComparisonData';
import { selectRingButton } from '@tests/pages/molecules/BottomToolbar';
import { RingButton } from '@tests/pages/constants/ringButton/Constants';
import { Library } from '@tests/pages/macromolecules/Library';
import { RNASection } from '@tests/pages/constants/library/Constants';
import { ContextMenu } from '@tests/pages/common/ContextMenu';
import { SequenceSymbolOption } from '@tests/pages/constants/contextMenu/Constants';
import { expandMonomer } from '@utils/canvas/monomer/helpers';
import { KETCHER_CANVAS } from '@tests/pages/constants/canvas/Constants';
import { LayoutMode } from '@tests/pages/constants/macromoleculesTopToolbar/Constants';
import { MacromoleculesTopToolbar } from '@tests/pages/macromolecules/MacromoleculesTopToolbar';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { Presets } from '@constants/monomers/Presets';
import { Nucleotides } from '@constants/monomers/Nucleotides';
import { Chem } from '@constants/monomers/Chem';

let page: Page;

test.describe('Arrow button on Library cards', () => {
  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();
    await waitForPageInit(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
      enableFlexMode: true,
      goToPeptides: false,
    });
  });

  test.afterEach(async ({ context: _ }, testInfo) => {
    await CommonTopLeftToolbar(page).clearCanvas();
    await resetZoomLevelToDefault(page);
    await processResetToDefaultState(testInfo, page);
  });

  test.afterAll(async ({ browser }) => {
    await Promise.all(browser.contexts().map((context) => context.close()));
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
    async () => {
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
      await MacromoleculesTopToolbar(page).selectLayoutModeTool(
        LayoutMode.Snake,
      );
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
});
