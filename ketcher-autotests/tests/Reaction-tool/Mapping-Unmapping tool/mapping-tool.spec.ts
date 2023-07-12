import { test } from '@playwright/test';
import {
  delay,
  takeEditorScreenshot,
  LeftPanelButton,
  clickInTheMiddleOfTheScreen,
  selectLeftPanelButton,
  selectNestedTool,
  ReactionMappingTool,
  DELAY_IN_SECONDS,
  openFileAndAddToCanvas,
  selectRingButton,
  RingButton,
  getCoordinatesTopAtomOfBenzeneRing,
  selectTopPanelButton,
  TopPanelButton,
  dragMouseTo,
} from '@utils';
import { getAtomByIndex } from '@utils/canvas/atoms';

test.describe('Open Ketcher', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  test('Click atoms to map atoms in a reaction', async ({ page }) => {
    /* Test case: EPMLSOPKET-1799, EPMLSOPKET-8909
    Description:  Click atoms to map atoms in a reaction
    */
    await openFileAndAddToCanvas('reaction_3.rxn', page);
    await selectNestedTool(page, ReactionMappingTool.MAP);
    await page.getByText('CEL');
    const { x, y } = await getCoordinatesTopAtomOfBenzeneRing(page);
    await dragMouseTo(x, y, page);
  });

  test.describe('mapped_atoms.rxn', () => {
    test.beforeEach(async ({ page }) => {
      await openFileAndAddToCanvas('mapped_atoms.rxn', page);
    });

    test('Click the single mapped atom to delete mapping', async ({ page }) => {
      // EPMLSOPKET-1827
      await selectNestedTool(page, ReactionMappingTool.UNMAP);
      await delay(DELAY_IN_SECONDS.FIVE);
      await page.getByText('CEL');
    });

    test('Map ordering', async ({ page }) => {
      await selectNestedTool(page, ReactionMappingTool.MAP);
      await page.getByText('ALK').click();
      await page.getByText('ABH').click();
      await page.getByText('CHC').click();
      await page.getByText('ARY').click();
    });
  });

  test('No Unmapping after the arrow deleting', async ({ page }) => {
    // EPMLSOPKET-1828
    await openFileAndAddToCanvas('mapped_rection_benz.rxn', page);
    await selectLeftPanelButton(LeftPanelButton.Erase, page);
    await clickInTheMiddleOfTheScreen(page);
  });

  test('Click atoms to map atoms of reactants or products', async ({
    page,
  }) => {
    await openFileAndAddToCanvas('reaction_4.rxn', page);
    await selectNestedTool(page, ReactionMappingTool.MAP);
    const point = await getAtomByIndex(page, { label: 'Br' }, 0);
    await page.mouse.click(point.x, point.y);
    const { x, y } = await getCoordinatesTopAtomOfBenzeneRing(page);
    await dragMouseTo(x, y, page);
  });

  test('Undo working in atom mapping, able to remove mapping', async ({
    page,
  }) => {
    // EPMLSOPKET-12961
    await selectRingButton(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);
    await selectNestedTool(page, ReactionMappingTool.MAP);
    const { x, y } = await getCoordinatesTopAtomOfBenzeneRing(page);
    await page.mouse.click(x, y);
    await takeEditorScreenshot(page);

    await selectTopPanelButton(TopPanelButton.Undo, page);
  });

  test.describe('mapped_reaction.rxn', () => {
    test.beforeEach(async ({ page }) => {
      await openFileAndAddToCanvas('mapped_reaction.rxn', page);
      await clickInTheMiddleOfTheScreen(page);
    });
    test('Remove the reaction components', async ({ page }) => {
      // EPMLSOPKET-1831
      await selectNestedTool(page, ReactionMappingTool.MAP);
      await page.getByText('CEL').click();
      await page.keyboard.press('Delete');
      await takeEditorScreenshot(page);

      await selectTopPanelButton(TopPanelButton.Undo, page);
      await takeEditorScreenshot(page);
    });

    test('Save the mapped reaction', async ({ page }) => {
      // EPMLSOPKET-1830
      await selectNestedTool(page, ReactionMappingTool.UNMAP);
      await page.getByText('CEL').click();
      await takeEditorScreenshot(page);
      await selectNestedTool(page, ReactionMappingTool.MAP);
      await page.getByText('CEL').click();
    });
  });
});
