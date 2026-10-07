import { expect, test, Page } from '@fixtures';
import {
  MacroFileType,
  pasteFromClipboardAndAddToMacromoleculesCanvas,
  takeEditorScreenshot,
} from '@utils';
import {
  getMonomerLocator,
  getSymbolLocator,
  moveMonomer,
} from '@utils/macromolecules/monomer';
import { MacromoleculesTopToolbar } from '@tests/pages/macromolecules/MacromoleculesTopToolbar';
import { LayoutMode } from '@tests/pages/constants/macromoleculesTopToolbar/Constants';
import { selectAllStructuresOnCanvas } from '@utils/canvas/selectSelection';

let page: Page;

test.beforeAll(async ({ initFlexCanvas }) => {
  page = await initFlexCanvas();
});

test.afterEach(async ({ FlexCanvas: _ }) => {});

test.afterAll(async ({ closePage }) => {
  await closePage();
});

test('Case 1: Sequence appears in viewport and no selection controls remain after switching from Flex to Sequence mode', async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/12120
   *            https://github.com/epam/ketcher/issues/12121
   * Description: After moving a sequence in Flex mode and switching to Sequence mode
   *              the sequence is shown in the viewport and selection controls are removed.
   * Case:
   *       1. Open Macromolecules canvas - Flex mode
   *       2. Load from HELM: RNA1{R(A)P.R(A)P.R(A)P}$$$$V2.0
   *       3. Select the sequence and move it to the center of the canvas
   *       4. Switch to Sequence mode
   */
  await pasteFromClipboardAndAddToMacromoleculesCanvas(
    page,
    MacroFileType.HELM,
    'RNA1{R(A)P.R(A)P.R(A)P}$$$$V2.0',
  );
  await selectAllStructuresOnCanvas(page);
  await moveMonomer(
    page,
    getMonomerLocator(page, { monomerAlias: 'A' }).first(),
    600,
    500,
  );

  await MacromoleculesTopToolbar(page).selectLayoutModeTool(
    LayoutMode.Sequence,
  );

  await expect(
    getSymbolLocator(page, { symbolAlias: 'A' }).first(),
  ).toBeInViewport();
  await takeEditorScreenshot(page);
});
