import { expect, Page } from '@fixtures';
import { getMonomerLocator } from './monomer';

type MonomerHighlightState = {
  childCount: number;
  style: string;
};

async function captureMonomerStates(
  page: Page,
  monomerAlias: string,
): Promise<MonomerHighlightState[]> {
  const monomers = getMonomerLocator(page, { monomerAlias });
  const count = await monomers.count();
  const states: MonomerHighlightState[] = [];
  for (let i = 0; i < count; i++) {
    states.push(
      await monomers.nth(i).evaluate((element) => ({
        childCount: element.childElementCount,
        style: element.getAttribute('style') ?? '',
      })),
    );
  }
  return states;
}

/**
 * #9370 requirement 2.4 — asserts that the "Edit All" hover highlight is applied to every
 * monomer with `matchingAlias` and to none of the monomers in `nonMatchingAliases`.
 *
 * The DOM signature (verified against the app): hovering the "Edit All <code> (N)" context
 * menu item adds exactly one child node to each matching `g.monomer` element and sets
 * `cursor: move` in its inline style; non-matching monomers are left untouched.
 *
 * @param page - The Playwright page instance.
 * @param hoverAction - Performs the hover (the context menu must already be open), e.g.
 *   `() => contextMenu.hover(MacroMonomerOption.EditAllMonomers)`.
 * @param matchingAlias - Alias of the monomers that should be highlighted.
 * @param nonMatchingAliases - Aliases of monomers that must NOT be highlighted.
 */
export async function assertEditAllHoverHighlight(
  page: Page,
  hoverAction: () => Promise<void>,
  matchingAlias: string,
  nonMatchingAliases: string[] = [],
): Promise<void> {
  const matchingBefore = await captureMonomerStates(page, matchingAlias);
  const othersBefore: MonomerHighlightState[] = [];
  for (const alias of nonMatchingAliases) {
    othersBefore.push(...(await captureMonomerStates(page, alias)));
  }

  expect(matchingBefore.length).toBeGreaterThan(0);

  await hoverAction();

  const matchingAfter = await captureMonomerStates(page, matchingAlias);
  expect(matchingAfter).toHaveLength(matchingBefore.length);
  for (let i = 0; i < matchingAfter.length; i++) {
    expect(matchingAfter[i].childCount).toBe(matchingBefore[i].childCount + 1);
    expect(matchingAfter[i].style).toContain('cursor: move');
  }

  const othersAfter: MonomerHighlightState[] = [];
  for (const alias of nonMatchingAliases) {
    othersAfter.push(...(await captureMonomerStates(page, alias)));
  }
  expect(othersAfter).toEqual(othersBefore);
}
