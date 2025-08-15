import { test, expect } from '@playwright/test';
import {
  openFileAndAddToCanvas,
  takeEditorScreenshot,
  clickOnCanvas,
  applyAutoMapMode,
  waitForPageInit,
  clickOnAtom,
  waitForSpinnerFinishedWork,
} from '@utils';
import { mapTwoAtoms } from '@utils/canvas/autoMapTools';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { SelectionToolType } from '@tests/pages/constants/areaSelectionTool/Constants';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import { ReactionMappingType } from '@tests/pages/constants/reactionMappingTool/Constants';
import { ArrowType } from '@tests/pages/constants/arrowSelectionTool/Constants';

test.describe('Verifying buttons on reaction am tool dropdown', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('open reaction map dropdown', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-2865
     * Description: Verifying of the button
     */
    const button = page.getByTestId(ReactionMappingType.ReactionMapping);
    await button.click();
    expect(button).toHaveAttribute('title', 'Reaction Mapping Tool');
    await takeEditorScreenshot(page);
  });

  test('Not possible when the reaction is absent on canvas', async ({
    page,
  }) => {
    /**
     * Test case: EPMLSOPKET-1801
     * Description: Not possible when the reaction is absent on canvas
     */
    const point1 = { x: -230, y: 0 };
    const point2 = { x: 200, y: 0 };
    const reactionAutoMappingButton = page.getByTestId(
      ReactionMappingType.ReactionAutoMapping,
    );

    await LeftToolbar(page).expandReactionMappingToolsDropdown();
    await expect(reactionAutoMappingButton).toBeDisabled();

    await openFileAndAddToCanvas(page, 'Molfiles-V2000/four-structures.mol');
    await LeftToolbar(page).expandReactionMappingToolsDropdown();
    await expect(reactionAutoMappingButton).toBeDisabled();
    await LeftToolbar(page).reactionPlusTool();

    await clickOnCanvas(page, point1.x, point1.y, { from: 'pageCenter' });
    await LeftToolbar(page).expandReactionMappingToolsDropdown();
    await expect(reactionAutoMappingButton).toBeDisabled();

    await LeftToolbar(page).selectArrowTool(ArrowType.ArrowOpenAngle);
    await clickOnCanvas(page, point2.x, point2.y, { from: 'pageCenter' });
    await LeftToolbar(page).selectReactionMappingTool(
      ReactionMappingType.ReactionAutoMapping,
    );
    await takeEditorScreenshot(page);
  });

  test('UI dialog', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-1808
     * Description:  UI dialog
     */
    await openFileAndAddToCanvas(page, 'Rxn-V2000/reaction-2.rxn');
    await LeftToolbar(page).selectReactionMappingTool(
      ReactionMappingType.ReactionAutoMapping,
    );
    await takeEditorScreenshot(page);
    await page.getByTestId('automap-mode-input-span').click();
    await takeEditorScreenshot(page);
  });

  test.describe('full reaction on canvas', () => {
    /**
     * Test cases: EPMLSOPKET-1809/EPMLSOPKET-1810/EPMLSOPKET-1811
     * Description:  Different modes - full reaction on canvas
     */
    const modes = ['Discard', 'Keep', 'Alter'];

    for (const mode of modes) {
      test(`${mode} mode`, async ({ page }) => {
        const atomNumber1 = 1;
        const atomNumber2 = 2;
        await openFileAndAddToCanvas(page, 'Rxn-V2000/reaction-3.rxn');
        await applyAutoMapMode(page, mode);
        await CommonTopLeftToolbar(page).undo();
        await takeEditorScreenshot(page);
        await LeftToolbar(page).selectReactionMappingTool(
          ReactionMappingType.ReactionMapping,
        );
        await clickOnAtom(page, 'C', atomNumber1);
        await clickOnAtom(page, 'C', atomNumber2);
        await takeEditorScreenshot(page);
        await CommonLeftToolbar(page).selectAreaSelectionTool(
          SelectionToolType.Rectangle,
        );
        await applyAutoMapMode(page, mode, false);
      });
    }
  });

  test.describe('With autoMapping', () => {
    test.afterEach(async ({ page }) => {
      await CommonLeftToolbar(page).selectAreaSelectionTool(
        SelectionToolType.Rectangle,
      );
      await takeEditorScreenshot(page);
      await applyAutoMapMode(page, 'Discard');
      await CommonTopLeftToolbar(page).undo();
      await applyAutoMapMode(page, 'Keep');
      await CommonTopLeftToolbar(page).undo();
      await applyAutoMapMode(page, 'Alter', false);
    });
    test('After the manual mapping with incorrect ordering', async ({
      page,
    }) => {
      /**
       * Test cases: EPMLSOPKET-1817
       * Description: After the manual mapping with incorrect ordering
       */
      await openFileAndAddToCanvas(page, 'Rxn-V2000/alter-mapping.rxn');
      await mapTwoAtoms(
        page,
        { label: 'S', number: 0 },
        { label: 'S', number: 1 },
      );
      await mapTwoAtoms(
        page,
        { label: 'N', number: 0 },
        { label: 'N', number: 1 },
      );
    });

    test('After the manual mapping with incorrect pairs', async ({ page }) => {
      /**
       * Test cases: EPMLSOPKET-1818
       * Description: After the manual mapping with incorrect pairs
       */
      await openFileAndAddToCanvas(page, 'Rxn-V2000/alter-mapping.rxn');
      await mapTwoAtoms(
        page,
        { label: 'S', number: 0 },
        { label: 'N', number: 1 },
      );
      await mapTwoAtoms(
        page,
        { label: 'N', number: 0 },
        { label: 'S', number: 1 },
      );
    });

    test('Compare the behavior', async ({ page }) => {
      /**
       * Test cases: EPMLSOPKET-1819
       * Description: Compare the behavior
       */
      await openFileAndAddToCanvas(page, 'Rxn-V2000/for-mappingTools-10.rxn');
    });
  });

  test('Clear mode', async ({ page }) => {
    /**
     * Test cases: EPMLSOPKET-1821
     * Description: Clear mode
     */
    await openFileAndAddToCanvas(page, 'Rxn-V2000/reaction-3.rxn');
    await applyAutoMapMode(page, 'Alter');
    await applyAutoMapMode(page, 'Clear');
    await mapTwoAtoms(
      page,
      { label: 'C', number: 0 },
      { label: 'C', number: 2 },
    );

    await takeEditorScreenshot(page);
    await applyAutoMapMode(page, 'Clear');
  });

  test('Half reaction on canvas', async ({ page }) => {
    /**
     * Test cases: EPMLSOPKET-1821
     * Description: Half reaction on canvas
     */
    await openFileAndAddToCanvas(page, 'Rxn-V2000/reaction-half.rxn');
    await applyAutoMapMode(page, 'Discard', false);
  });

  // TODO: This test is currently highly unstable, figure out how to wait for rendering to complete properly
  test.skip('Verifying of the correct automapping', async ({ page }) => {
    /**
     * Test cases: EPMLSOPKET-1832
     * Description:  Verifying of the correct automapping
     */
    const yOffsetFromCenter1 = 100;
    const yOffsetFromCenter2 = 300;
    await openFileAndAddToCanvas(page, 'Rxn-V2000/allenes.rxn');
    await waitForSpinnerFinishedWork(
      page,
      async () => await applyAutoMapMode(page, 'Discard'),
    );
    await openFileAndAddToCanvas(
      page,
      'Rxn-V2000/mapping-4-benzene.rxn',
      0,
      yOffsetFromCenter1,
    );
    await waitForSpinnerFinishedWork(
      page,
      async () => await applyAutoMapMode(page, 'Keep'),
      // eslint-disable-next-line no-magic-numbers
      30000,
    );
    await openFileAndAddToCanvas(
      page,
      'Rxn-V2000/allenes.rxn',
      0,
      yOffsetFromCenter2,
    );
    await waitForSpinnerFinishedWork(
      page,
      async () => await applyAutoMapMode(page, 'Alter', false),
      // eslint-disable-next-line no-magic-numbers
      30000,
    );
  });
});
