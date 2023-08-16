/* eslint-disable no-magic-numbers */
import { expect, test } from '@playwright/test';
import {
  takeEditorScreenshot,
  clickInTheMiddleOfTheScreen,
  selectTool,
  selectNestedTool,
  SelectTool,
  getTitleByToolType,
  LeftPanelButton,
  getCoordinatesOfTheMiddleOfTheScreen,
  pressButton,
  STRUCTURE_LIBRARY_BUTTON_NAME,
  selectFunctionalGroups,
  FunctionalGroups,
  FunctionalGroupMenu,
} from '@utils';
import { getRightAtomByAttributes } from '@utils/canvas/atoms';
import { waitForCloseDialog } from '@utils/common/waitForLoad/waitForLoad';

test.describe('Selection Tools', () => {
  test.describe('Select Palette', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('');
      // TODO: change to waitforinit....
      await page.waitForFunction(() => window.ketcher);
    });

    /*
    Test case: EPMLSOPKET-1335
    Description: UI verification
    */
    test.describe('UI verification', () => {
      [
        SelectTool.LASSO_SELECTION,
        SelectTool.RECTANGLE_SELECTION,
        SelectTool.FRAGMENT_SELECTION,
      ].forEach((toolField) => {
        test(`${toolField[1]} tool`, async ({ page }) => {
          await selectNestedTool(page, toolField);
          await selectTool(LeftPanelButton.Erase, page);
          const button = page.getByTestId(toolField[1]);

          await expect(button).toHaveAttribute(
            'title',
            getTitleByToolType(toolField),
          );
        });
      });
    });
    /*
    Test case: EPMLSOPKET-1336
    Description: Empty canvas selection
    */
    test.describe('Empty canvas selection', () => {
      [SelectTool.LASSO_SELECTION, SelectTool.RECTANGLE_SELECTION].forEach(
        (toolField) => {
          test(`${toolField[1]} tool`, async ({ page }) => {
            const DELTA = 50;
            await selectNestedTool(page, toolField);
            const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
            await page.mouse.move(x - DELTA, y - DELTA);
            await page.mouse.down();
            await page.mouse.move(x + DELTA, y + DELTA);
            await takeEditorScreenshot(page);
          });
        },
      );
    });
    /*
    Test case: EPMLSOPKET-16941
    Description: Selection and hover mouse
    */
    test('Selection and hover mouse', async ({ page }) => {
      await pressButton(page, STRUCTURE_LIBRARY_BUTTON_NAME);
      await page.getByRole('tab', { name: 'Functional Groups' }).click();

      await waitForCloseDialog(page, () =>
        selectFunctionalGroups(FunctionalGroups.Cbz, page),
      );
      await clickInTheMiddleOfTheScreen(page);
      await selectTool(LeftPanelButton.RectangleSelection, page);
      // TODO: verify wy there are 2 element getting by text and use expandFunctionalGroup function
      await page
        .getByText(FunctionalGroups.Cbz)
        .first()
        .click({ button: 'right' });
      await page.getByText(FunctionalGroupMenu.ExpandAbbreviation).click();
      const centerPoint = await getCoordinatesOfTheMiddleOfTheScreen(page);
      page.mouse.click(centerPoint.x, centerPoint.y);
      const { x, y } = await getRightAtomByAttributes(page, {});
      page.mouse.move(x, y);

      await takeEditorScreenshot(page);
    });
  });
});
