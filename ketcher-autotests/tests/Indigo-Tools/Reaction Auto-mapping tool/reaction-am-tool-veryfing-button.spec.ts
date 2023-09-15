/* eslint-disable no-magic-numbers */
import { test, expect } from '@playwright/test';
import {
  ReactionMappingTool,
  selectNestedTool,
  openFileAndAddToCanvas,
  takeEditorScreenshot,
  pressButton,
  selectTopPanelButton,
  TopPanelButton,
  clickOnTheCanvas,
  applyAutoMapMode,
  selectLeftPanelButton,
  LeftPanelButton,
  mapTwoAtoms,
  waitForPageInit,
} from '@utils';

test.describe('Verifying buttons on reaction am tool dropdown', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  test('open reaction map dropdown', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-2865
     * Description: Verifying of the button
     */
    const button = page.getByTestId('reaction-map');
    await button.click();
    expect(button).toHaveAttribute('title', 'Reaction Mapping Tool');
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
    await selectNestedTool(page, ReactionMappingTool.AUTOMAP);
    await takeEditorScreenshot(page);
    await openFileAndAddToCanvas('Molfiles-V2000/four-structures.mol', page);
    await selectNestedTool(page, ReactionMappingTool.AUTOMAP);
    await takeEditorScreenshot(page);
    await selectLeftPanelButton(LeftPanelButton.ReactionPlusTool, page);
    await clickOnTheCanvas(page, point1.x, point1.y);
    await selectNestedTool(page, ReactionMappingTool.AUTOMAP);
    await takeEditorScreenshot(page);
    await selectLeftPanelButton(LeftPanelButton.ArrowOpenAngleTool, page);
    await clickOnTheCanvas(page, point2.x, point2.y);
    await selectNestedTool(page, ReactionMappingTool.AUTOMAP);
  });

  test('UI dialog', async ({ page }) => {
    /**
     * Test case: EPMLSOPKET-1808
     * Description:  UI dialog
     */
    await openFileAndAddToCanvas('Rxn-V2000/reaction-2.rxn', page);
    await selectNestedTool(page, ReactionMappingTool.AUTOMAP);
    await takeEditorScreenshot(page);
    await pressButton(page, 'Discard');
  });

  test.describe('full reaction on canvas', () => {
    /**
     * Test cases: EPMLSOPKET-1809/EPMLSOPKET-1810/EPMLSOPKET-1811
     * Description:  Different modes - full reaction on canvas
     */
    const modes = ['Discard', 'Keep', 'Alter'];

    for (const mode of modes) {
      test(`${mode} mode`, async ({ page }) => {
        const point1 = { x: -250, y: 8 };
        const point2 = { x: -250, y: 55 };
        await openFileAndAddToCanvas('Rxn-V2000/reaction-3.rxn', page);
        await applyAutoMapMode(page, mode);
        await selectTopPanelButton(TopPanelButton.Undo, page);
        await takeEditorScreenshot(page);
        await selectLeftPanelButton(LeftPanelButton.ReactionMappingTool, page);
        await clickOnTheCanvas(page, point1.x, point1.y);
        await clickOnTheCanvas(page, point2.x, point2.y);
        await takeEditorScreenshot(page);
        await selectLeftPanelButton(LeftPanelButton.RectangleSelection, page);
        await applyAutoMapMode(page, mode, false);
      });
    }
  });

  test.describe('With autoMapping', () => {
    test.afterEach(async ({ page }) => {
      await selectLeftPanelButton(LeftPanelButton.RectangleSelection, page);
      await takeEditorScreenshot(page);
      await applyAutoMapMode(page, 'Discard');
      await selectTopPanelButton(TopPanelButton.Undo, page);
      await applyAutoMapMode(page, 'Keep');
      await selectTopPanelButton(TopPanelButton.Undo, page);
      await applyAutoMapMode(page, 'Alter', false);
    });
    test('After the manual mapping with incorrect ordering', async ({
      page,
    }) => {
      /**
       * Test cases: EPMLSOPKET-1817
       * Description: After the manual mapping with incorrect ordering
       */
      await openFileAndAddToCanvas('Rxn-V2000/alter-mapping.rxn', page);
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
      await openFileAndAddToCanvas('Rxn-V2000/alter-mapping.rxn', page);
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

    test.fixme('Compare the behavior', async ({ page }) => {
      /**
       * Test cases: EPMLSOPKET-1819
       * Description: Compare the behavior
       */
      await openFileAndAddToCanvas('Rxn-V2000/for-mappingTools-10.rxn', page);
    });
  });

  test('Clear mode', async ({ page }) => {
    /**
     * Test cases: EPMLSOPKET-1821
     * Description: Clear mode
     */
    await openFileAndAddToCanvas('Rxn-V2000/reaction-3.rxn', page);
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
    await openFileAndAddToCanvas('Rxn-V2000/reaction-half.rxn', page);
    await applyAutoMapMode(page, 'Discard', false);
  });

  test('Verifying of the correct automapping', async ({ page }) => {
    /**
     * Test cases: EPMLSOPKET-1832
     * Description:  Verifying of the correct automapping
     */
    await openFileAndAddToCanvas('Rxn-V2000/allenes.rxn', page);
    await applyAutoMapMode(page, 'Discard');
    await openFileAndAddToCanvas('Rxn-V2000/mapping-4-benzene.rxn', page);
    await applyAutoMapMode(page, 'Keep');
    await openFileAndAddToCanvas('Rxn-V2000/allenes.rxn', page);
    await applyAutoMapMode(page, 'Alter', false);
  });
});
