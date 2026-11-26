import { Page, test } from '@fixtures';
import {
  takeEditorScreenshot,
  openFileAndAddToCanvasAsNewProject,
} from '@utils';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { LayoutMode } from '@tests/pages/constants/macromoleculesTopToolbar/Constants';

let page: Page;

test.describe(
  'Support for enhanced stereochemistry markings in macromolecules mode',
  () => {
    test.beforeAll(async ({ initMoleculesCanvas }) => {
      page = await initMoleculesCanvas();
    });

    test.afterAll(async ({ closePage }) => {
      await closePage();
    });

    test.beforeEach(async ({ MoleculesCanvas: _ }) => {});

    test(
      'Case 1 - Verify stereo-markings visible on molecules mode stays visible on switching to Macromolecules mode',
      async () => {
        /*
         * Test task: https://github.com/epam/ketcher/issues/12490
         * Description: Verify that enhanced stereo markings (&1 / AND, or1 / OR, abs)
         *              visible in Molecules mode remain visible after switching to
         *              Macromolecules mode.
         * Scenario:
         * 1. Load a KET file with enhanced stereo markings (&1, abs, or1) in
         *    Molecules mode
         * 2. Take a screenshot to verify the stereo markings are visible in
         *    Molecules mode
         * 3. Switch to Macromolecules mode (Flex layout)
         * 4. Take a screenshot to verify the stereo markings are still visible in
         *    Macromolecules mode
         *
         * Version 3.14.0
         */
        await openFileAndAddToCanvasAsNewProject(
          page,
          'KET/Chromium-popup/6917-Support-for-enhanced-stereochemistry-markings-in-macromolecules-mode/different-marks-stereostructure.ket',
        );
        await takeEditorScreenshot(page);

        await CommonTopRightToolbar(page).turnOnMacromoleculesEditor(
          LayoutMode.Flex,
        );
        await takeEditorScreenshot(page, {
          hideMonomerPreview: true,
          hideMacromoleculeEditorScrollBars: true,
        });
      },
    );
  },
);
