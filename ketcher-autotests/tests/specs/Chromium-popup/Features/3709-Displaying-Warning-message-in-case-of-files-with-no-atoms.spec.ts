import { Page, test, expect } from '@fixtures';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { NotificationBannerOnMicro } from '@tests/pages/molecules/canvas/NotificationBannerOnMicro';
import { NotificationBannerOnMacro } from '@tests/pages/macromolecules/canvas/NotificationBannerOnMacro';
import { MacroFileType } from '@utils/canvas/types';
import {
  openFileAndAddToCanvasAsNewProject,
  openFileAndAddToCanvasAsNewProjectMacro,
  takeEditorScreenshot,
} from '@utils';

let page: Page;

const noAtomsV3000 =
  'Molfiles-V3000/Chromium-popup/3709-Displaying-Warning-message-in-case-of-files-with-no-atoms/v3000-complete-ctab-no-atoms.mol';
const v2000EmptyAtoms =
  'Molfiles-V2000/Chromium-popup/3709-Displaying-Warning-message-in-case-of-files-with-no-atoms/v2000-empty-atom-section.mol';
const v2000WithAtoms = 'Molfiles-V2000/V2000-abs.mol';

test.describe('Displaying Warning message in case of files with no atoms', () => {
  test.beforeAll(async ({ initMoleculesCanvas }) => {
    page = await initMoleculesCanvas();
  });

  test.afterAll(async ({ closePage }) => {
    await closePage();
  });

  test.beforeEach(async ({ MoleculesCanvas: _ }) => {});

  test(
    'Case 1 - Verify that opening a V3000 file with a complete CTAB section but no atoms displays the warning message "No structure"',
    async () => {
      /*
       * Test task: https://github.com/epam/ketcher/issues/12768
       * Description: Opening a V3000 MOL file that has BEGIN ATOM/END ATOM and BEGIN BOND/END BOND
       * sections but zero actual atoms should display the "No structure" snackbar warning.
       * Scenario:
       * 1. Open Ketcher in Molecules mode (clean canvas)
       * 2. Open a V3000 MOL file with a complete CTAB section (COUNTS 0, BEGIN ATOM, END ATOM,
       *    BEGIN BOND, END BOND) but no atom entries
       * 3. Verify that the "No structure" warning message appears in the notification banner
       *
       * Version 3.21.0
       */
      await openFileAndAddToCanvasAsNewProject(page, noAtomsV3000);
      await expect(NotificationBannerOnMicro(page).message).toBeVisible();
      await expect(NotificationBannerOnMicro(page).message).toContainText(
        'No structure',
      );
      await NotificationBannerOnMicro(page).close();
      await NotificationBannerOnMicro(page).waitForBecomeHidden();
    },
  );

  test(
    'Case 2 - Verify that the warning message "No structure" is displayed when a file with an empty ATOM section is opened',
    async () => {
      /*
       * Test task: https://github.com/epam/ketcher/issues/12768
       * Description: Opening a V2000 MOL file with a counts line specifying zero atoms (empty
       * ATOM section) should display the "No structure" snackbar warning.
       * Scenario:
       * 1. Open Ketcher in Molecules mode (clean canvas)
       * 2. Open a V2000 MOL file where the counts line specifies 0 atoms and 0 bonds
       * 3. Verify that the "No structure" warning message appears in the notification banner
       *
       * Version 3.21.0
       */
      await openFileAndAddToCanvasAsNewProject(page, v2000EmptyAtoms);
      await expect(NotificationBannerOnMicro(page).message).toBeVisible();
      await expect(NotificationBannerOnMicro(page).message).toContainText(
        'No structure',
      );
      await NotificationBannerOnMicro(page).close();
      await NotificationBannerOnMicro(page).waitForBecomeHidden();
    },
  );

  test(
    'Case 3 - Test that opening a file with only the COUNTS line, having zero atoms specified, triggers the "No structure" warning',
    async () => {
      /*
       * Test task: https://github.com/epam/ketcher/issues/12768
       * Description: Opening a V3000 MOL file with COUNTS 0 0 and an empty ATOM block (no
       * BOND section) should display the "No structure" snackbar warning.
       * Scenario:
       * 1. Open Ketcher in Molecules mode (clean canvas)
       * 2. Open a V3000 MOL file that has COUNTS 0 0 and a BEGIN ATOM/END ATOM block but
       *    no BOND section and no actual atom entries
       * 3. Verify that the "No structure" warning message appears in the notification banner
       *
       * Version 3.21.0
       */
      await openFileAndAddToCanvasAsNewProject(
        page,
        'Molfiles-V3000/Chromium-popup/3709-Displaying-Warning-message-in-case-of-files-with-no-atoms/v3000-counts-zero-atoms.mol',
      );
      await expect(NotificationBannerOnMicro(page).message).toBeVisible();
      await expect(NotificationBannerOnMicro(page).message).toContainText(
        'No structure',
      );
      await NotificationBannerOnMicro(page).close();
      await NotificationBannerOnMicro(page).waitForBecomeHidden();
    },
  );

  test(
    'Case 4 - Confirm that a file with a BEGIN CTAB and END CTAB but no atom information triggers the warning message "No structure"',
    async () => {
      /*
       * Test task: https://github.com/epam/ketcher/issues/12768
       * Description: Opening a V3000 MOL file with only BEGIN CTAB/COUNTS/END CTAB and no
       * ATOM or BOND blocks should display the "No structure" snackbar warning.
       * Scenario:
       * 1. Open Ketcher in Molecules mode (clean canvas)
       * 2. Open a V3000 MOL file containing only BEGIN CTAB, COUNTS 0 0 and END CTAB,
       *    with no ATOM or BOND sections at all
       * 3. Verify that the "No structure" warning message appears in the notification banner
       *
       * Version 3.21.0
       */
      await openFileAndAddToCanvasAsNewProject(
        page,
        'Molfiles-V3000/Chromium-popup/3709-Displaying-Warning-message-in-case-of-files-with-no-atoms/v3000-begin-end-ctab-only.mol',
      );
      await expect(NotificationBannerOnMicro(page).message).toBeVisible();
      await expect(NotificationBannerOnMicro(page).message).toContainText(
        'No structure',
      );
      await NotificationBannerOnMicro(page).close();
      await NotificationBannerOnMicro(page).waitForBecomeHidden();
    },
  );

  test(
    'Case 5 - Validate that opening files with empty BOND sections still displays the warning "No structure" if there are no atoms',
    async () => {
      /*
       * Test task: https://github.com/epam/ketcher/issues/12768
       * Description: A V3000 MOL file that has an empty BOND section but no atoms should
       * still trigger the "No structure" warning because the atom count is what matters.
       * Scenario:
       * 1. Open Ketcher in Molecules mode (clean canvas)
       * 2. Open a V3000 MOL file with a complete CTAB (including an empty BOND section)
       *    but zero atoms
       * 3. Verify that the "No structure" warning message appears even though a BOND section exists
       *
       * Version 3.21.0
       */
      await openFileAndAddToCanvasAsNewProject(page, noAtomsV3000);
      await expect(NotificationBannerOnMicro(page).message).toBeVisible();
      await expect(NotificationBannerOnMicro(page).message).toContainText(
        'No structure',
      );
      await NotificationBannerOnMicro(page).close();
      await NotificationBannerOnMicro(page).waitForBecomeHidden();
    },
  );

  test(
    'Case 6 - Ensure the warning message "No structure" is displayed for both Molecules and Macromolecules canvases when opening a file with no atoms',
    async () => {
      /*
       * Test task: https://github.com/epam/ketcher/issues/12768
       * Description: The "No structure" warning must appear in both Molecules (micro) and
       * Macromolecules (macro) editor modes when opening a file with no atoms.
       * Scenario:
       * 1. Open Ketcher in Molecules mode (clean canvas)
       * 2. Open a V3000 MOL file with no atoms — verify the micro-mode snackbar shows "No structure"
       * 3. Close the notification banner
       * 4. Switch to Macromolecules (Flex) mode
       * 5. Open the same V3000 MOL file — verify the macro-mode error tooltip shows "No structure"
       * 6. Close the notification banner
       *
       * Version 3.21.0
       */
      // Molecules (micro) mode
      await openFileAndAddToCanvasAsNewProject(page, noAtomsV3000);
      await expect(NotificationBannerOnMicro(page).message).toBeVisible();
      await expect(NotificationBannerOnMicro(page).message).toContainText(
        'No structure',
      );
      await NotificationBannerOnMicro(page).close();
      await NotificationBannerOnMicro(page).waitForBecomeHidden();

      // Macromolecules (macro) mode
      await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
      await openFileAndAddToCanvasAsNewProjectMacro(
        page,
        noAtomsV3000,
        MacroFileType.MOLv3000,
      );
      await expect(NotificationBannerOnMacro(page).message).toBeVisible();
      await expect(NotificationBannerOnMacro(page).message).toContainText(
        'No structure',
      );
      await NotificationBannerOnMacro(page).close();
      await NotificationBannerOnMacro(page).waitForBecomeHidden();
    },
  );

  test(
    'Case 7 - Check that the warning message "No structure" doesn\'t appear if the file includes at least one atom in the ATOM section',
    async () => {
      /*
       * Test task: https://github.com/epam/ketcher/issues/12768
       * Description: Opening a valid V2000 MOL file that contains at least one atom should
       * NOT display the "No structure" warning message.
       * Scenario:
       * 1. Open Ketcher in Molecules mode (clean canvas)
       * 2. Open a V2000 MOL file that contains atoms
       * 3. Wait for the file to load completely
       * 4. Verify that the "No structure" warning message does NOT appear
       *
       * Version 3.21.0
       */
      await openFileAndAddToCanvasAsNewProject(page, v2000WithAtoms);
      await expect(NotificationBannerOnMicro(page).message).not.toBeVisible();
    },
  );

  test(
    'Case 8 - Validate the UI displays the warning correctly and it is prominently visible on the screen',
    async () => {
      /*
       * Test task: https://github.com/epam/ketcher/issues/12768
       * Description: The "No structure" warning must be visually prominent and correctly
       * rendered in the UI when a file with no atoms is opened.
       * Scenario:
       * 1. Open Ketcher in Molecules mode (clean canvas)
       * 2. Open a V3000 MOL file with no atoms
       * 3. Verify the notification banner is visible
       * 4. Take a screenshot to validate the warning is prominently displayed
       *
       * Version 3.21.0
       */
      await openFileAndAddToCanvasAsNewProject(page, noAtomsV3000);
      await expect(NotificationBannerOnMicro(page).message).toBeVisible();
      await takeEditorScreenshot(page);
      await NotificationBannerOnMicro(page).close();
      await NotificationBannerOnMicro(page).waitForBecomeHidden();
    },
  );

  test(
    'Case 9 - Verify that the warning message "No structure" disappears when a file with valid atom data is opened afterward',
    async () => {
      /*
       * Test task: https://github.com/epam/ketcher/issues/12768
       * Description: After the "No structure" warning appears for a no-atoms file, opening
       * a valid file with atoms should not trigger a new warning notification.
       * Scenario:
       * 1. Open Ketcher in Molecules mode (clean canvas)
       * 2. Open a V3000 MOL file with no atoms — verify "No structure" warning appears
       * 3. Close the notification banner
       * 4. Open a valid V2000 MOL file that contains atoms
       * 5. Verify that the "No structure" warning does NOT appear
       *
       * Version 3.21.0
       */
      await openFileAndAddToCanvasAsNewProject(page, noAtomsV3000);
      await expect(NotificationBannerOnMicro(page).message).toBeVisible();
      await expect(NotificationBannerOnMicro(page).message).toContainText(
        'No structure',
      );
      await NotificationBannerOnMicro(page).close();
      await NotificationBannerOnMicro(page).waitForBecomeHidden();

      await openFileAndAddToCanvasAsNewProject(page, v2000WithAtoms);
      await expect(NotificationBannerOnMicro(page).message).not.toBeVisible();
    },
  );

  test(
    'Case 10 - Test that opening a file with only comment lines or metadata without atom data triggers the "No structure" warning',
    async () => {
      /*
       * Test task: https://github.com/epam/ketcher/issues/12768
       * Description: Opening a V2000 MOL file that contains a molecule name and comment
       * in the header lines but has no atoms should display the "No structure" warning.
       * Scenario:
       * 1. Open Ketcher in Molecules mode (clean canvas)
       * 2. Open a V2000 MOL file that has metadata (molecule name, comment) in the header
       *    but specifies zero atoms in the counts line
       * 3. Verify that the "No structure" warning message appears in the notification banner
       *
       * Version 3.21.0
       */
      await openFileAndAddToCanvasAsNewProject(
        page,
        'Molfiles-V2000/Chromium-popup/3709-Displaying-Warning-message-in-case-of-files-with-no-atoms/v2000-metadata-only.mol',
      );
      await expect(NotificationBannerOnMicro(page).message).toBeVisible();
      await expect(NotificationBannerOnMicro(page).message).toContainText(
        'No structure',
      );
      await NotificationBannerOnMicro(page).close();
      await NotificationBannerOnMicro(page).waitForBecomeHidden();
    },
  );

  test(
    'Case 11 - Ensure there are no console errors when opening a file that triggers the "No structure" warning message',
    async () => {
      /*
       * Test task: https://github.com/epam/ketcher/issues/12768
       * Description: Opening a file with no atoms should display the "No structure" warning
       * but must not produce any JavaScript console errors.
       * Scenario:
       * 1. Open Ketcher in Molecules mode (clean canvas)
       * 2. Register a console error listener
       * 3. Open a V3000 MOL file with no atoms
       * 4. Verify the "No structure" warning appears
       * 5. Verify no console errors were logged
       *
       * Version 3.21.0
       */
      let hasConsoleError = false;
      let consoleErrorMessage = '';
      const consoleErrorHandler = (msg: { type(): string; text(): string }) => {
        if (msg.type() === 'error') {
          hasConsoleError = true;
          consoleErrorMessage = msg.text();
        }
      };
      page.on('console', consoleErrorHandler);

      try {
        await openFileAndAddToCanvasAsNewProject(page, noAtomsV3000);
        await expect(NotificationBannerOnMicro(page).message).toBeVisible();
        await expect(NotificationBannerOnMicro(page).message).toContainText(
          'No structure',
        );
      } finally {
        page.off('console', consoleErrorHandler);
      }

      expect(
        hasConsoleError,
        `Console error was logged: ${consoleErrorMessage}`,
      ).toBe(false);
      await NotificationBannerOnMicro(page).close();
      await NotificationBannerOnMicro(page).waitForBecomeHidden();
    },
  );

  test.skip(
    'Case 12 - Check if the warning message "No structure" is not displayed for files that include reaction roles even if they have zero atoms',
    () => {
      /*
       * Test task: https://github.com/epam/ketcher/issues/12768
       * Description: Files with reaction role definitions but no atoms may not trigger
       * the "No structure" warning depending on how parsedStruct.isBlank() handles
       * reaction role S-groups. This requires investigation into Ketcher's internal
       * handling of reaction roles and manual verification before automation.
       * Cannot be automated without first verifying the expected behavior.
       * See: https://github.com/epam/ketcher/issues/12768
       */
    },
  );

  test.skip(
    'Case 13 - Verify that no warning message is displayed for files with non-zero COUNTS but zero actual atom or bond data',
    () => {
      /*
       * Test task: https://github.com/epam/ketcher/issues/12768
       * Description: A MOL file where the COUNTS line claims non-zero atoms but provides
       * zero actual atom data entries is malformed. The behavior in this case is
       * implementation-defined — Ketcher/Indigo may throw a parse error rather than
       * the "No structure" warning. The expected outcome (no warning vs parse error)
       * is ambiguous and contradicts other scenarios. Manual verification is required
       * before automation.
       * See: https://github.com/epam/ketcher/issues/12768
       */
    },
  );

  test(
    'Case 14 - Ensure that the system can correctly reopen a valid file without any lingering warning messages after previously displaying "No structure"',
    async () => {
      /*
       * Test task: https://github.com/epam/ketcher/issues/12768
       * Description: After the "No structure" warning is shown for a no-atoms file, the
       * system should allow reopening a valid file without any residual warning state.
       * Scenario:
       * 1. Open Ketcher in Molecules mode (clean canvas)
       * 2. Open a V2000 MOL file with no atoms — verify "No structure" warning appears
       * 3. Close the notification banner
       * 4. Open a valid V2000 MOL file with atoms
       * 5. Verify that no "No structure" warning appears for the valid file
       *
       * Version 3.21.0
       */
      await openFileAndAddToCanvasAsNewProject(page, v2000EmptyAtoms);
      await expect(NotificationBannerOnMicro(page).message).toBeVisible();
      await expect(NotificationBannerOnMicro(page).message).toContainText(
        'No structure',
      );
      await NotificationBannerOnMicro(page).close();
      await NotificationBannerOnMicro(page).waitForBecomeHidden();

      await openFileAndAddToCanvasAsNewProject(page, v2000WithAtoms);
      await expect(NotificationBannerOnMicro(page).message).not.toBeVisible();
    },
  );

  test(
    'Case 15 - Test edge case of file with whitespace or empty lines but follows the V3000 format without atoms, ensuring the warning "No structure" is still shown',
    async () => {
      /*
       * Test task: https://github.com/epam/ketcher/issues/12768
       * Description: A V3000 MOL file that has extra whitespace in the molecule name and
       * comment fields but otherwise follows the V3000 format with zero atoms should
       * still trigger the "No structure" warning.
       * Scenario:
       * 1. Open Ketcher in Molecules mode (clean canvas)
       * 2. Open a V3000 MOL file with trailing/leading whitespace in the name and comment
       *    header fields, but zero atoms in the CTAB
       * 3. Verify that the "No structure" warning message appears in the notification banner
       *
       * Version 3.21.0
       */
      await openFileAndAddToCanvasAsNewProject(
        page,
        'Molfiles-V3000/Chromium-popup/3709-Displaying-Warning-message-in-case-of-files-with-no-atoms/v3000-whitespace-no-atoms.mol',
      );
      await expect(NotificationBannerOnMicro(page).message).toBeVisible();
      await expect(NotificationBannerOnMicro(page).message).toContainText(
        'No structure',
      );
      await NotificationBannerOnMicro(page).close();
      await NotificationBannerOnMicro(page).waitForBecomeHidden();
    },
  );
});
