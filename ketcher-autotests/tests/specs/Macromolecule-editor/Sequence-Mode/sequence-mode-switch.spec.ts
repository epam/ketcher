/* eslint-disable @typescript-eslint/no-empty-function */
import { test, expect, Page } from '@fixtures';
import { MacromoleculesTopToolbar } from '@tests/pages/macromolecules/MacromoleculesTopToolbar';
import {
  keyboardTypeOnCanvas,
  takeEditorScreenshot,
  takeTopToolbarScreenshot,
} from '@utils';

let page: Page;

test.beforeAll(async ({ initSequenceCanvas }) => {
  page = await initSequenceCanvas();
});

test.afterEach(async ({ SequenceCanvas: _ }) => {});

test.afterAll(async ({ closePage }) => {
  await closePage();
});

test.describe('Sequence edit mode', () => {
  test.describe('Check New approach and UI for switching between types in sequence mode', () => {
    test(`should switch to RNA mode and verify UI changes`, async () => {
      /*
       * Test case: Hotkeys https://github.com/epam/ketcher/issues/5554
       * Description: Verify that clicking on RNA button switches to the correct typing mode and displays correct title.
       * NEW REQUIREMENT: https://github.com/epam/ketcher/issues/8723
       */

      await takeTopToolbarScreenshot(page);

      await expect(MacromoleculesTopToolbar(page).rnaButton).toHaveAttribute(
        'title',
        'RNA (Ctrl+Alt+R)',
      );

      await MacromoleculesTopToolbar(page).rna();
      await takeTopToolbarScreenshot(page);

      await keyboardTypeOnCanvas(page, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ');
      await takeEditorScreenshot(page);
    });

    test(`should switch to DNA mode and verify UI changes`, async () => {
      /*
       * Test case: Hotkeys https://github.com/epam/ketcher/issues/5554
       * Description: Verify that clicking on DNA button switches to the correct typing mode and displays correct title.
       * NEW REQUIREMENT: https://github.com/epam/ketcher/issues/8723
       */
      await takeTopToolbarScreenshot(page);

      await expect(MacromoleculesTopToolbar(page).dnaButton).toHaveAttribute(
        'title',
        'DNA (Ctrl+Alt+D)',
      );

      await MacromoleculesTopToolbar(page).dna();
      await takeTopToolbarScreenshot(page);

      await keyboardTypeOnCanvas(page, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ');
      await takeEditorScreenshot(page);
    });

    test(`should switch to Peptides mode and verify UI changes`, async () => {
      /*
       * Test case: Hotkeys https://github.com/epam/ketcher/issues/5554
       * Description: Verify that clicking on Peptides button switches to the correct typing mode and displays correct title.
       * NEW REQUIREMENT: https://github.com/epam/ketcher/issues/8723
       */
      await takeTopToolbarScreenshot(page);

      await expect(
        MacromoleculesTopToolbar(page).peptidesButton,
      ).toHaveAttribute('title', 'Peptides (Ctrl+Alt+P)');

      await MacromoleculesTopToolbar(page).peptides();
      await takeTopToolbarScreenshot(page);

      await keyboardTypeOnCanvas(page, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ');
      await takeEditorScreenshot(page);
    });
  });
});
