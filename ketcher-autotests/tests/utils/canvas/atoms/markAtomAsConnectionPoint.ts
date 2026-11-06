import { Locator, Page } from '@playwright/test';
import { ContextMenu } from '@tests/pages/common/ContextMenu';
import { ConnectionPointOption } from '@tests/pages/constants/contextMenu/Constants';
import { getAtomLocator } from './getAtomLocator/getAtomLocator';

/**
 * Marks an atom on the canvas as a connection point via its context menu.
 * Without an explicit locator, marks the first visible carbon atom — in macro
 * mode the macro canvas layer stays in the DOM with zero-size atom elements, so
 * only atoms of the visible (e.g. wizard) canvas are targeted, and hydrogens
 * (which may be rendered explicitly) are never chosen as connection points.
 */
export async function markAtomAsConnectionPoint(
  page: Page,
  atomLocator?: Locator,
): Promise<void> {
  const atom =
    atomLocator ??
    getAtomLocator(page, { atomLabel: 'C' }).filter({ visible: true }).first();
  await ContextMenu(page, atom).click(
    ConnectionPointOption.MarkAsConnectionPoint,
  );
}
