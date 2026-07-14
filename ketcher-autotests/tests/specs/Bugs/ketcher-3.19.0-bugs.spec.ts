/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable no-magic-numbers */
import { Page, test, expect } from '@fixtures';
import { openFileAndAddToCanvasAsNewProjectMacro } from '@utils';

import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { SaveStructureDialog } from '@tests/pages/common/SaveStructureDialog';
import { MoleculesFileFormatType } from '@tests/pages/constants/fileFormats/microFileFormats';
import { ErrorMessageDialog } from '@tests/pages/common/ErrorMessageDialog';

let page: Page;

test.describe('Ketcher bugs in 3.19.0', () => {
  test.beforeAll(async ({ initMoleculesCanvas }) => {
    page = await initMoleculesCanvas();
  });

  test.beforeEach(async ({ MoleculesCanvas: _ }) => {});

  test.afterAll(async ({ closePage }) => {
    await closePage();
  });

  test('Case 1: Save oversized macromolecule schema as MDL Molfile V2000 upgrades to V3000', async () => {
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
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
      enableFlexMode: true,
      goToPeptides: false,
    });
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
});
