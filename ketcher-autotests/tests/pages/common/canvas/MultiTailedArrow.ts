/* eslint-disable no-magic-numbers */
import { Page, Locator } from '@playwright/test';
import { ContextMenu } from '../ContextMenu';
import { MultiTailedArrowOption } from '@tests/pages/constants/contextMenu/Constants';
import { waitForRender } from '@utils/common/loaders/waitForRender';

type MultiTailedArrowLocators = {
  self: Locator;
  topTailMoveHandler: Locator;
  topTailResizeHandler: Locator;
  bottomTailMoveHandler: Locator;
  bottomTailResizeHandler: Locator;
  headMoveHandler: Locator;
  headResizeHandler: Locator;
};

type MultiTailedArrowHelpers = MultiTailedArrowLocators & {
  getTailsCount(): Promise<number>;
  getTailsMoveHandler(options: { tailIndex: number }): Locator;
  getTailsResizeHandler(options: { tailIndex: number }): Locator;
  addTail(): Promise<void>;
};

export type MultiTailedArrowLocator = Locator & MultiTailedArrowHelpers;

export const MultiTailedArrow = async (
  page: Page,
  arrow: Locator,
): Promise<MultiTailedArrowLocator> => {
  const arrowId = await arrow.getAttribute('data-arrow-id');

  const tailResizeHandlers =
    arrowId === null
      ? page.locator('[data-testid="__missing-multi-tailed-arrow-id__"]')
      : page.locator(
          `[data-testid^="tails-"][data-testid$="-resize"][data-arrow-id="${arrowId}"]`,
        );

  const locators: MultiTailedArrowLocators = {
    self: arrow,
    topTailMoveHandler: page.locator(
      `[data-testid="topTail-move"][data-arrow-id="${arrowId}"]`,
    ),
    topTailResizeHandler: page.locator(
      `[data-testid="topTail-resize"][data-arrow-id="${arrowId}"]`,
    ),
    bottomTailMoveHandler: page.locator(
      `[data-testid="bottomTail-move"][data-arrow-id="${arrowId}"]`,
    ),
    bottomTailResizeHandler: page.locator(
      `[data-testid="bottomTail-resize"][data-arrow-id="${arrowId}"]`,
    ),
    headMoveHandler: page.locator(
      `[data-testid="head-move"][data-arrow-id="${arrowId}"]`,
    ),
    headResizeHandler: page.locator(
      `[data-testid="head-resize"][data-arrow-id="${arrowId}"]`,
    ),
  };

  const multiTailedArrow = arrow as MultiTailedArrowLocator;

  Object.assign(multiTailedArrow, {
    ...locators,

    async getTailsCount() {
      if (arrowId === null) {
        return 0;
      }

      return await tailResizeHandlers.count();
    },

    getTailsMoveHandler(options: { tailIndex: number }) {
      const { tailIndex } = options;
      if (arrowId === null) {
        return page.locator(
          '[data-testid="__missing-multi-tailed-tail-index__"]',
        );
      }

      return page.locator(
        `[data-testid="tails-${tailIndex}-move"][data-arrow-id="${arrowId}"]`,
      );
    },

    getTailsResizeHandler(options: { tailIndex: number }) {
      const { tailIndex } = options;
      if (arrowId === null) {
        return page.locator(
          '[data-testid="__missing-multi-tailed-tail-index__"]',
        );
      }

      return page.locator(
        `[data-testid="tails-${tailIndex}-resize"][data-arrow-id="${arrowId}"]`,
      );
    },

    async addTail() {
      await waitForRender(page, async () => {
        await ContextMenu(page, arrow).click(MultiTailedArrowOption.AddNewTail);
      });
    },
  });

  return multiTailedArrow;
};

export type MultiTailedArrowType = ReturnType<typeof MultiTailedArrow>;
