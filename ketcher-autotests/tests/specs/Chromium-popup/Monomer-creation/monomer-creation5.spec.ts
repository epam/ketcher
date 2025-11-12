/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable max-len */
/* eslint-disable no-magic-numbers */
import { Page, expect } from '@playwright/test';
import { test } from '@fixtures';
import { pasteFromClipboardAndOpenAsNewProject } from '@utils/files/readFile';
import { selectAllStructuresOnCanvas } from '@utils/canvas';
import {
  clickOnCanvas,
  dragMouseTo,
  getCoordinatesOfTheMiddleOfTheScreen,
} from '@utils/index';
import {
  createMonomer,
  ModificationTypeDropdown,
} from '@tests/pages/molecules/canvas/CreateMonomerDialog';
import {
  AminoAcidNaturalAnalogue,
  ModificationType,
  MonomerType,
} from '@tests/pages/constants/createMonomerDialog/Constants';
import { Peptide } from '@tests/pages/constants/monomers/Peptides';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { getMonomerLocator } from '@utils/macromolecules/monomer';
import { MonomerPreviewTooltip } from '@tests/pages/macromolecules/canvas/MonomerPreviewTooltip';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { SelectionToolType } from '@tests/pages/constants/areaSelectionTool/Constants';

let page: Page;
test.beforeAll(async ({ initMoleculesCanvas }) => {
  page = await initMoleculesCanvas();
});
test.afterAll(async ({ closePage }) => {
  await closePage();
});
test.beforeEach(async ({ MoleculesCanvas: _ }) => {});

async function shiftCanvas(page: Page, xShift: number, yShift: number) {
  await CommonLeftToolbar(page).handTool();
  const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
  await page.mouse.move(x, y);
  await dragMouseTo(x + xShift, y + yShift, page);
  await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Rectangle);
}

test(`1. Check that the user can (but doesn't have to) set one or more modification types for amino acids by clicking on + Add modification type in the attributes window`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8436
   * Description: Check that the user can (but doesn't have to) set one or more modification types for amino acids by clicking on + Add modification type in the attributes window
   *
   * Case:
   *      1. Open Molecules canvas
   *      2. Load molecule on canvas
   *      3. Press Create Monomer button
   *      4. Set mandatory fields in Create Monomer dialog for amino acid monomer
   *      5. Set modification type by clicking on + Add modification type and selecting Citrullination type from dropdown
   *      6. Press Submit button
   *      7. Switch to Macromolecules mode
   *      8. Verify that the created monomer is present on the canvas
   *      9. Hover the monomer and open the tooltip
   *     10. Verify that the modification type is displayed in the tooltip
   *
   * Version 3.10
   */
  await pasteFromClipboardAndOpenAsNewProject(
    page,
    'C%91%92%93C.[*:2]%91.[*:1]%92.[*:3]%93 |$;;_R2;_R1;_R3$|',
  );
  await clickOnCanvas(page, 0, 0);
  await selectAllStructuresOnCanvas(page);

  await createMonomer(page, {
    type: MonomerType.AminoAcid,
    symbol: Peptide.Peptide.alias,
    name: 'Peptide Test monomer',
    naturalAnalogue: AminoAcidNaturalAnalogue.A,
    modificationTypes: [
      {
        dropdown: ModificationTypeDropdown.First,
        type: ModificationType.Citrullination,
      },
    ],
  });

  await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
  const monomerOnCanvas = getMonomerLocator(page, Peptide.Peptide);
  expect(await monomerOnCanvas.isVisible()).toBeTruthy();

  // shifting canvas to make tooltip appear fully
  await shiftCanvas(page, -150, 50);

  await monomerOnCanvas.hover();
  await MonomerPreviewTooltip(page).waitForBecomeVisible();
  expect(await MonomerPreviewTooltip(page).getModificationTypes()).toEqual(
    'Citrullination',
  );
});
