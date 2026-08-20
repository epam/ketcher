/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable no-magic-numbers */
import { Page, test, expect } from '@fixtures';
import {
  clickInTheMiddleOfTheCanvas,
  openFileAndAddToCanvasAsNewProjectMacro,
  pasteFromClipboardAndAddToCanvas,
  pasteFromClipboardAndOpenAsNewProject,
} from '@utils';

import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { SaveStructureDialog } from '@tests/pages/common/SaveStructureDialog';
import { MoleculesFileFormatType } from '@tests/pages/constants/fileFormats/microFileFormats';
import { ErrorMessageDialog } from '@tests/pages/common/ErrorMessageDialog';
import { getAtomLocator } from '@utils/canvas/atoms/getAtomLocator/getAtomLocator';

let page: Page;

test.describe('Ketcher bugs in 3.19.0', () => {
  test.beforeAll(async ({ initMoleculesCanvas }) => {
    page = await initMoleculesCanvas();
  });

  test.beforeEach(async ({ MoleculesCanvas: _ }) => {});

  test.afterAll(async ({ closePage }) => {
    await closePage();
  });

  test('Case 1: Save oversized macromolecule schema as MDL Molfile V2000 upgrades to V3000', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6142
     * Description: Oversized structures saved via the V2000 option are auto-upgraded to V3000
     * instead of failing with a generic error toast.
     * Scenario:
     * 1. Go to Macro - Flex mode
     * 2. Load schema with many monomers and varied connections
     * 3. Switch to Molecules mode
     * 4. Save as MDL Molfile V2000
     * 5. Verify preview contains V3000 markers and Warnings tab shows upgrade notice
     */
    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      'KET/schema-nucleotide-with-different-monomers.ket',
    );
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.MDLMolfileV2000,
    );

    const preview = await SaveStructureDialog(page).getTextAreaValue();
    expect(preview).toMatch(/M\s+V30|V30 COUNTS/);
    expect(await ErrorMessageDialog(page).isVisible()).toBe(false);

    await SaveStructureDialog(page).switchToWarningsTab();
    const warnings = await SaveStructureDialog(page).getWarningTextAreaValue();
    expect(warnings).toContain('V3000');

    await SaveStructureDialog(page).cancel();
  });

  test('Case 2: Molecule pasted from clipboard loads when it ends with carriage returns', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/3884
     * Description: SMILES is a single-line format, but trailing carriage returns left over
     * by a copy-paste made Indigo read the input as a multi-line molfile/rxnfile, so it
     * failed with "Convert error! ... 'RXN loader: bad header P'" instead of loading it.
     * Scenario:
     * 1. Go to Molecules mode (clean canvas)
     * 2. Open... - Paste from clipboard - paste 'P' followed by several carriage returns
     * 3. Press Open as New Project
     * 4. Verify that the phosphorus atom is loaded and no error message is shown
     * 5. Repeat for the Add to Canvas button
     */
    // a textarea normalizes pasted carriage returns to line feeds
    const smilesWithTrailingCarriageReturns = 'P\n\n\n';

    await pasteFromClipboardAndOpenAsNewProject(
      page,
      smilesWithTrailingCarriageReturns,
    );
    expect(await ErrorMessageDialog(page).isVisible()).toBe(false);
    await expect(getAtomLocator(page, { atomLabel: 'P' })).toHaveCount(1);

    await CommonTopLeftToolbar(page).clearCanvas();

    await pasteFromClipboardAndAddToCanvas(
      page,
      smilesWithTrailingCarriageReturns,
    );
    await clickInTheMiddleOfTheCanvas(page);
    expect(await ErrorMessageDialog(page).isVisible()).toBe(false);
    await expect(getAtomLocator(page, { atomLabel: 'P' })).toHaveCount(1);
  });
});
