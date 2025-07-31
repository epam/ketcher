/* eslint-disable no-magic-numbers */
import { test } from '@playwright/test';
import {
  takeEditorScreenshot,
  waitForSpinnerFinishedWork,
  clickInTheMiddleOfTheScreen,
  waitForPageInit,
} from '@utils';
import { enableDearomatizeOnLoad, setMolecule } from '@utils/formats';

test.describe('Tests for API setMolecule/getMolecule', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test(
    'Add molecule through API ketcher.setMolecule',
    { tag: ['@chromium-popup'] },
    async ({ page }) => {
      /*
    Test case: EPMLSOPKET-2957
    Description: Molecule of Benzene is on canvas
    */
      await waitForSpinnerFinishedWork(
        page,
        async () => await setMolecule(page, 'C1C=CC=CC=1'),
      );
      await takeEditorScreenshot(page);
    },
  );

  test(
    'Add SMILES molecule using ketcher.setMolecule() method',
    { tag: ['@chromium-popup'] },
    async ({ page }) => {
      /*
    Test case: EPMLSOPKET-10090
    Description: Molecule of aromatized Benzene is on canvas
    */
      await waitForSpinnerFinishedWork(
        page,
        async () => await setMolecule(page, 'c1ccccc1'),
      );
      await takeEditorScreenshot(page);
    },
  );

  test(
    'Structure import if dearomotize-on-load is true',
    { tag: ['@chromium-popup'] },
    async ({ page }) => {
      /*
    Test case: EPMLSOPKET- 10091
    Description: Aromatic Benzene ring loads as non aromatic Benzene ring
    */
      await clickInTheMiddleOfTheScreen(page);
      await enableDearomatizeOnLoad(page);
      await waitForSpinnerFinishedWork(
        page,
        async () => await setMolecule(page, 'c1ccccc1'),
      );
      await takeEditorScreenshot(page);
    },
  );

  test(
    'Add a molecule with custom atom properties using ketcher.setMolecule() method',
    { tag: ['@chromium-popup'] },
    async ({ page }) => {
      /*
    Test case: EPMLSOPKET- 10092
    Description: Molecule with custom atom properties added to canvas
    */
      await waitForSpinnerFinishedWork(
        page,
        async () => await setMolecule(page, 'CCCC |Sg:gen:0,1,2:|'),
      );
      await takeEditorScreenshot(page);
    },
  );
});
